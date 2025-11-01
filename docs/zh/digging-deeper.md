# 深入 micro SAPI

## micro SAPI 加载方式

简单来讲，micro.sfx 本身包含了完整的 PHP 解释器。在不包含任何 INI 注入、粘连的 PHP 代码的情况下，它与系统中其他的 ELF、PE、Mach-O 可执行文件没有区别。

当我们将 PHP 代码或 Phar 文件结合到 micro.sfx 结尾后，文件结构是这样的：

```
<-- File head for myapp
|--------------------------------|--------------------------------------|
| micro.sfx (ELF/PE/Mach-O part) |             PHP/Phar part            |
|            Binary              |             plaintext/phar           |
| 010101010101010101010101010101 | <?php code(); .......                |
|--------------------------------|--------------------------------------|
```

当我们执行 `./myapp` 时，操作系统会将整个文件加载到内存中，然后开始执行 micro.sfx 部分的代码。
micro SAPI 会检测到文件尾部存在 PHP 代码或 Phar 文件，并将其作为输入传递给内置的 PHP 解释器进行执行。

![](../public/images/sapi-procedure.png)

这种设计使得 micro SAPI 能够非常高效地运行 PHP 代码，因为它避免了传统的文件解压缩和临时存储步骤，直接在内存中执行代码。

## INI 注入原理

micro SAPI 支持通过 INI 注入功能，在运行时动态修改 PHP 配置选项。其原理是在 micro.sfx 启动时，读取嵌入在二进制文件中的 INI 配置，并将其应用到 PHP 解释器的配置环境中。

INI 注入块的结构如下：

```c
struct MICRO_INI_HEADER{
    uint32_t magic; // "\xfd\xf6\x69\xe6"
    uint32_t size; // in big-endian
} __attribute__((packed));
```

将 INI 注入块附加到 micro.sfx 文件的末尾，然后再附加 PHP 代码或 Phar 文件，最终文件结构如下：

```
<-- File head for myapp
|--------------------------------|---------------------------------------------------|-------------------------|
| micro.sfx (ELF/PE/Mach-O part) |              INI Injection Block                  |     PHP/Phar part       |
|            Binary              | 4 byte magic | INI data size |     INI data       |     plaintext/phar      |
| 010101010101010101010101010101 | 0xfdf669e6   | 0x0000002A    | "memory_limit=..." | "<?php code(); ......." |
|--------------------------------|---------------------------------------------------|-------------------------|
```

当 micro.sfx 启动时，它会检查文件末尾是否存在有效的 INI 注入块（通过检查 magic 字段）。
如果存在，micro SAPI 会读取 INI 数据，并将其解析为 PHP 配置选项，然后应用到当前的 PHP 运行环境中。

你可以使用 static-php-cli 提供的 `micro:combine` 命令来自动完成这一过程，也可以使用下方的脚本手动构建一个 INI 注入块并附加到 micro.sfx：

```bash
./spc micro:combine app.php -I "memory_limit=512M" -I "display_errors=1" -O myapp
```

```php
// Prepare INI block
$ini_data = "memory_limit=512M\ndisplay_errors=1";
$ini_block = fopen("ini_block.bin", "wb");
fwrite($ini_block, pack("N", 0xfdf669e6)); // magic
fwrite($ini_block, pack("N", strlen($ini_data))); // size
fwrite($ini_block, $ini_data);
fclose($ini_block);

// Append INI block and PHP code to micro.sfx
$micro = fopen("micro.sfx", "ab");
$ini_block = fopen("ini_block.bin", "rb");
while (!feof($ini_block)) {
    fwrite($micro, fread($ini_block, 8192));
}
fclose($ini_block);
$php_code = fopen("app.php", "rb");
while (!feof($php_code)) {
    fwrite($micro, fread($php_code, 8192));
}
fclose($php_code);
fclose($micro);
```

## micro 定义的方法

micro SAPI 定义了一些 PHP 函数和常量，以便与 PHP 代码进行交互。

### SAPI 函数

- `php_sapi_name()`: 返回当前 SAPI 的名称，对于 micro SAPI，默认返回 "micro"。如果启用了伪装 SAPI 名称功能，则返回 "cli"。
- `micro_version()`: 返回 micro SAPI 的版本信息。
- `micro_get_self_filename()`: 返回当前自执行的文件的绝对路径，它与 `__FILE__` 常量类似，但适用于 micro SAPI。
- `micro_get_sfxsize()`: 返回 micro.sfx 可执行文件部分的大小（以字节为单位），不包括附加的 PHP 代码和 INI 注入块。

## Phar 文件读取

PHP 的 Phar 归档类似于 zip、rar 等压缩文件格式，但它是专门为 PHP 应用程序设计的。Phar 文件可以包含多个 PHP 脚本、资源文件和元数据，使得分发和部署 PHP 应用程序变得更加方便。

在正常的 PHP 环境中，Phar 内的文件可以通过 `require` 来加载和执行，如 `require 'phar://path/to/archive.phar/file.php';`。

但对于 micro.sfx，就要稍微复杂一些。因为对于 micro 应用来说，phar 文件本身是附加在 micro.sfx 可执行文件的末尾的，而不是一个独立的文件。
一般情况下，将 micro.sfx 和 phar 文件连接后，使用其他 SAPI 来读取这个 phar 文件是不可行的，因为其他 SAPI 无法识别 micro.sfx 的文件结构。

为了能让 micro 正确读取自身的 phar 文件，我们必须修改 phar 扩展的源码，使其能够识别 micro.sfx 的文件结构，让 phar 归档从 micro.sfx 的末尾开始读取。

在 static-php-cli 中，我们已经对 phar 扩展进行了相应的修改，使其能够与 micro SAPI 兼容。因此，当你在 micro 中使用 phar 内的文件时，请将 phar 归档指向 micro.sfx 文件本身，例如：

```php
$file_content = file_get_contents('phar://' . micro_get_self_filename() . '/path/inside/phar.php');
```

## 加载动态扩展

对于 Linux 系统，micro SAPI 仅在使用动态链接 glibc 的静态二进制时，才支持加载外部共享库和外部 PHP 扩展（.so 文件）。
static-php-cli 在默认配置下构建是基于静态链接 musl-libc 的纯静态二进制，这种情况下不支持加载外部扩展。你需要根据文档构建 glibc 兼容二进制以实现这一特性。

有关更多 Linux 下 glibc 构建的信息，请参考 static-php-cli 文档中的 [glibc 兼容 Linux 二进制构建](https://static-php.dev/en/guide/build-with-glibc) 章节。

对于 macOS 系统，micro SAPI 默认支持加载外部动态库和 PHP 扩展。你需要通过 INI 注入或其他方式，指定 `extension` 选项来加载外部扩展。

对于 Windows 系统，由于 Windows 平台的链接机制不同，目前不支持通过 micro SAPI 加载动态扩展，但你可以静态编译 FFI 扩展后，使用 FFI 功能来调用非扩展的其他 DLL。
