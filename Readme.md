# micro SAPI for PHP

[![English readme](https://img.shields.io/badge/README-English%20%F0%9F%87%AC%F0%9F%87%A7-moccasin?style=flat-square)](README.md)
[![Chinese readme](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87%20%F0%9F%87%A8%F0%9F%87%B3-moccasin?style=flat-square)](README-zh.md)
[![License](https://img.shields.io/badge/License-Apache--2.0-cyan.svg?style=flat-square)](https://github.com/crazywhalecc/static-php-cli/blob/main/LICENSE)

**micro** SAPI makes PHP self-executable, allowing you to run php-cli apps without any PHP installation.

![](docs/public/images/micro.png)

-----------

micro is a SAPI module for PHP that allows you to create self-executable PHP binaries. 
By concatenating the micro SAPI binary with your PHP source code or PHAR files, 
you can run PHP applications without requiring a separate PHP installation.

micro SAPI works similarly to the built-in CLI SAPI, you can run almost all CLI-based PHP applications with it.

## Quick Start

We recommend building micro SAPI using [static-php-cli](https://static-php.dev) to include popular extensions like `pdo`, `openssl`, `mbstring`, and more.

You can first try [pre-built micro SAPI binaries](https://dl.static-php.dev/static-php-cli/common/) from hosted by static-php.dev server:

| Platform       | Download Link                                                                                      |
|----------------|----------------------------------------------------------------------------------------------------|
| Linux x86_64   | [micro.sfx](https://dl.static-php.dev/static-php-cli/common/php-8.4.14-micro-linux-x86_64.tar.gz)  |
| Linux aarch64  | [micro.sfx](https://dl.static-php.dev/static-php-cli/common/php-8.4.14-micro-linux-aarch64.tar.gz) |
| Windows x86_64 | [micro.sfx](https://dl.static-php.dev/static-php-cli/windows/spc-max/php-8.4.14-micro-win.zip)     |
| macOS x86_64   | [micro.sfx](https://dl.static-php.dev/static-php-cli/common/php-8.4.14-micro-macos-x86_64.tar.gz)  |
| macOS arm64    | [micro.sfx](https://dl.static-php.dev/static-php-cli/common/php-8.4.14-micro-macos-aarch64.tar.gz) |

Then prepare your PHP code or PHAR cli app archive, and concatenate them:

```php
<?php // myapp.php
echo "Hello, this is my awesome app." . PHP_EOL;
```

```shell
# On Linux/macOS:
cat /path/to/micro.sfx myapp.php > myapp
chmod +x ./myapp
./myapp
# shows "Hello, this is my awesome app."

# or on Windows:
COPY /b \path\to\micro.sfx + myapp.php myapp.exe
.\myapp.exe
# shows "Hello, this is my awesome app."
```

## Build statically linked micro.sfx

Since we need to build micro.sfx as a standalone and portable binary, the best way is to build it statically.
That will make sure it can run on most systems without worrying about missing shared libraries.

You can follow the steps in static-php.dev docs to build your own static PHP binary with micro SAPI included:

1. First, download and install static-php-cli by following the [installation guide](https://static-php.dev/en/guide/manual-build).
2. Next, use the `spc` command to build a static PHP binary with micro SAPI:

```bash
# linux/macOS
EXTENSIONS="bcmath,phar,openssl,mbstring"
./spc doctor --auto-fix
./spc download --for-extensions=$EXTENSIONS --with-php=8.4
./spc build $EXTENSIONS --build-micro

# windows (PowerShell)
.\spc.exe doctor --auto-fix
.\spc.exe download --for-extensions="bcmath,phar,openssl,mbstring" --with-php=8.4
.\spc.exe build "bcmath,phar,openssl,mbstring" --build-micro
```

## Documentation

For more details about micro SAPI, please refer to the <https://micro.static-php.dev> docs.

## Credit

This project originally forked from [easysoft/phpmicro](https://github.com/easysoft/phpmicro) and adapted to work with static-php-cli.

Thanks to all the contributors of phpmicro and static-php-cli projects.

## Open-Source License

This project is licensed under Apache-2.0 License. See the [LICENSE](LICENSE) file for details.

When building static PHP with static-php-cli, the resulting binary may include other open-source components.
Please refer to the [static-php-cli LICENSE](https://github.com/crazywhalecc/static-php-cli#open-source-license) description.
