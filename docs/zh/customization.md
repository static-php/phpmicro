# 配置 micro SAPI

micro SAPI 在某些场景下可能需要进行自定义配置，以满足特定的需求。

当前 micro SAPI 的配置主要分为以下几种：

- **伪装 SAPI 名称**：某些扩展或库可能会根据 SAPI 名称进行不同的行为判断。通过配置伪装 SAPI 名称，可以让这些扩展或库认为当前运行环境是 cli，从而避免兼容性问题。
- **INI 注入**：可以将自定义的 ini 配置注入到 micro.sfx 二进制中，以覆盖默认的 PHP 配置。这对于需要特定配置的应用程序非常有用。
- **自定义 Win32 元信息**：在 Windows 平台上，可以自定义 micro.sfx 的元信息，如文件描述、exe 图标等。

本章节用于介绍如何使用它们。有关这些配置以及 micro SAPI 的更多技术细节，请见章节 [深入 micro 内部](digging-deeper.md)。

## 伪装 SAPI 名称

该配置项主要适用于兼容某些对 SAPI 类型有严格检查的扩展或库。通过将 SAPI 名称伪装为 cli，可以避免这些扩展或库因检测到非 cli SAPI 而无法正常工作的问题。

要启用伪装 SAPI 名称功能，可以在使用 static-php-cli 构建 micro SAPI 时，在 `craft.yml` 文件中添加以下配置：

```yml
build-options:
  with-micro-fake-cli: true
```

如果使用 SPC 的 `build` 命令构建，使用命令行参数 `--with-micro-fake-cli`：

```bash
./spc build bcmath,phar,openssl,mbstring --build-micro --with-micro-fake-cli
```

伪装后，在 micro.sfx 中执行的 PHP 代码 `php_sapi_name()` 将返回 `cli`，而不是 `micro`。

## INI 注入

micro SAPI 与 cli SAPI 不同，它默认不会读取任何 php.ini 配置文件。因此，如果你的应用程序依赖于特定的 PHP 配置选项，可能需要通过 INI 注入来实现。

要注入自定义的 INI 配置，可以在使用 static-php-cli 构建 micro SAPI 后准备打包 PHP 代码前，使用 `micro:combine` 的 `-I` 配置自动注入 ini 项：

```bash
# here to build micro.sfx first
# ./spc craft

echo '<?php echo ini_get("memory_limit") . PHP_EOL;' > test.php
./spc micro:combine test.php -I "memory_limit=512M" -O myapp
./myapp
# output: 512M
```

如果有多个 INI 配置项需要注入，可以使用多个 `-I` 来指定，或使用 `-N` 指定一个包含多行 ini 配置的文件：

```bash
# Using multiple -I options
./spc micro:combine test.php -I "memory_limit=512M" -I "display_errors=1" -O myapp

# Using -N with a file
echo "memory_limit=512M" > ini.txt
echo "display_errors=1" >> ini.txt
./spc micro:combine test.php -N ini.txt -O myapp
```


