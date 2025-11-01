# Digging Deeper into micro SAPI

## How micro SAPI Loads

Simply put, micro.sfx itself contains a complete PHP interpreter. Without any INI injection or concatenated PHP code, it's no different from other ELF, PE, or Mach-O executable files on the system.

When we concatenate PHP code or a Phar file to the end of micro.sfx, the file structure looks like this:

```
<-- File head for myapp
|--------------------------------|--------------------------------------|
| micro.sfx (ELF/PE/Mach-O part) |             PHP/Phar part            |
|            Binary              |             plaintext/phar           |
| 010101010101010101010101010101 | <?php code(); .......                |
|--------------------------------|--------------------------------------|
```

When we execute `./myapp`, the operating system loads the entire file into memory and begins executing the micro.sfx portion of the code.
micro SAPI detects that there's PHP code or a Phar file at the end of the file and passes it as input to the built-in PHP interpreter for execution.

![](../public/images/sapi-procedure.png)

This design allows micro SAPI to run PHP code very efficiently because it avoids the traditional file extraction and temporary storage steps, executing code directly in memory.

## INI Injection Principles

micro SAPI supports dynamically modifying PHP configuration options at runtime through INI injection. The principle is that when micro.sfx starts, it reads INI configuration embedded in the binary file and applies it to the PHP interpreter's configuration environment.

The INI injection block structure is as follows:

```c
struct MICRO_INI_HEADER{
    uint32_t magic; // "\xfd\xf6\x69\xe6"
    uint32_t size; // in big-endian
} __attribute__((packed));
```

Append the INI injection block to the end of the micro.sfx file, then append PHP code or Phar file. The final file structure is as follows:

```
<-- File head for myapp
|--------------------------------|---------------------------------------------------|-------------------------|
| micro.sfx (ELF/PE/Mach-O part) |              INI Injection Block                  |     PHP/Phar part       |
|            Binary              | 4 byte magic | INI data size |     INI data       |     plaintext/phar      |
| 010101010101010101010101010101 | 0xfdf669e6   | 0x0000002A    | "memory_limit=..." | "<?php code(); ......." |
|--------------------------------|---------------------------------------------------|-------------------------|
```

When micro.sfx starts, it checks whether a valid INI injection block exists at the end of the file (by checking the magic field).
If it exists, micro SAPI reads the INI data, parses it into PHP configuration options, and applies them to the current PHP runtime environment.

You can use the `micro:combine` command provided by static-php-cli to automatically complete this process, or use the script below to manually build an INI injection block and append it to micro.sfx:

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

## micro-defined Methods

micro SAPI defines some PHP functions and constants for interacting with PHP code.

### SAPI Functions

- `php_sapi_name()`: Returns the current SAPI name. For micro SAPI, it returns "micro" by default. If SAPI name masquerading is enabled, it returns "cli".
- `micro_version()`: Returns micro SAPI version information.
- `micro_get_self_filename()`: Returns the absolute path of the current self-executing file. It's similar to the `__FILE__` constant but applicable to micro SAPI.
- `micro_get_sfxsize()`: Returns the size (in bytes) of the micro.sfx executable portion, excluding the appended PHP code and INI injection block.

## Reading Phar Files

PHP's Phar archives are similar to compression formats like zip and rar, but they're specifically designed for PHP applications. Phar files can contain multiple PHP scripts, resource files, and metadata, making PHP application distribution and deployment much more convenient.

In a normal PHP environment, files within a Phar can be loaded and executed via `require`, such as `require 'phar://path/to/archive.phar/file.php';`.

However, for micro.sfx, it's slightly more complex. For micro applications, the phar file itself is appended to the end of the micro.sfx executable, not a separate file.
Generally, after concatenating micro.sfx and a phar file, using other SAPIs to read this phar file is not feasible because other SAPIs cannot recognize the micro.sfx file structure.

To allow micro to correctly read its own phar file, we must modify the phar extension source code to enable it to recognize the micro.sfx file structure, allowing the phar archive to be read starting from the end of micro.sfx.

In static-php-cli, we have already made corresponding modifications to the phar extension to make it compatible with micro SAPI. Therefore, when using files within a phar in micro, point the phar archive to the micro.sfx file itself, for example:

```php
$file_content = file_get_contents('phar://' . micro_get_self_filename() . '/path/inside/phar.php');
```

## Loading Dynamic Extensions

For Linux systems, micro SAPI only supports loading external shared libraries and external PHP extensions (.so files) when using dynamically linked glibc static binaries.
static-php-cli builds pure static binaries based on statically linked musl-libc by default, which don't support loading external extensions. You need to build a glibc-compatible binary according to the documentation to achieve this feature.

For more information about building with glibc on Linux, please refer to the [Building glibc-compatible Linux Binaries](https://static-php.dev/en/guide/build-with-glibc) section in the static-php-cli documentation.

For macOS systems, micro SAPI supports loading external dynamic libraries and PHP extensions by default. You need to specify the `extension` option through INI injection or other means to load external extensions.

For Windows systems, due to the different linking mechanisms on the Windows platform, loading dynamic extensions through micro SAPI is currently not supported, but you can statically compile the FFI extension and use FFI functionality to call other DLLs that are not extensions.
