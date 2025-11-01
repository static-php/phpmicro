# micro 自执行 SAPI

[![英文文档](https://img.shields.io/badge/README-English%20%F0%9F%87%AC%F0%9F%87%A7-moccasin?style=flat-square)](README.md)
[![中文文档](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87%20%F0%9F%87%A8%F0%9F%87%B3-moccasin?style=flat-square)](README-zh.md)
[![许可证](https://img.shields.io/badge/License-Apache--2.0-cyan.svg?style=flat-square)](https://github.com/crazywhalecc/static-php-cli/blob/main/LICENSE)

**micro** SAPI 让 PHP 可以自执行，允许你在没有安装 PHP 的情况下运行 php-cli 应用。

![](docs/public/images/micro.png)

-----------

micro 是 PHP 的一个 SAPI 模块，允许你创建自执行的 PHP 二进制文件。
通过将 micro SAPI 二进制文件与你的 PHP 源代码或 PHAR 文件连接，
你可以在不需要单独安装 PHP 的情况下运行 PHP 应用程序。

micro SAPI 的工作方式类似于内置的 CLI SAPI，你可以使用它运行几乎所有基于 CLI 的 PHP 应用程序。

## 快速开始

我们推荐使用 [static-php-cli](https://static-php.dev) 构建 micro SAPI，以便包含像 `pdo`、`openssl`、`mbstring` 等流行的扩展。

你可以先尝试由 static-php.dev 服务器托管的[预构建 micro SAPI 二进制文件](https://dl.static-php.dev/static-php-cli/common/)：

| 平台             | 下载链接                                                                                               |
|----------------|----------------------------------------------------------------------------------------------------|
| Linux x86_64   | [micro.sfx](https://dl.static-php.dev/static-php-cli/common/php-8.4.14-micro-linux-x86_64.tar.gz)  |
| Linux aarch64  | [micro.sfx](https://dl.static-php.dev/static-php-cli/common/php-8.4.14-micro-linux-aarch64.tar.gz) |
| Windows x86_64 | [micro.sfx](https://dl.static-php.dev/static-php-cli/windows/spc-max/php-8.4.14-micro-win.zip)     |
| macOS x86_64   | [micro.sfx](https://dl.static-php.dev/static-php-cli/common/php-8.4.14-micro-macos-x86_64.tar.gz)  |
| macOS arm64    | [micro.sfx](https://dl.static-php.dev/static-php-cli/common/php-8.4.14-micro-macos-aarch64.tar.gz) |

然后准备你的 PHP 代码或 PHAR cli 应用归档文件，并将它们连接起来：

```php
<?php // myapp.php
echo "Hello, this is my awesome app." . PHP_EOL;
```

```shell
# 在 Linux/macOS 上：
cat /path/to/micro.sfx myapp.php > myapp
chmod +x ./myapp
./myapp
# 显示 "hello, this is my awesome app."

# 或在 Windows 上：
COPY /b \path\to\micro.sfx + myapp.php myapp.exe
.\myapp.exe
# 显示 "hello, this is my awesome app."
```

## 构建静态链接的 micro.sfx

由于我们需要将 micro.sfx 构建为独立且可移植的二进制文件，最好的方法是静态构建。
这将确保它可以在大多数系统上运行，而不必担心缺少共享库。

你可以按照 static-php.dev 文档中的步骤构建自己的包含 micro SAPI 的静态 PHP 二进制文件：

1. 首先，按照[安装指南](https://static-php.dev/zh/guide/manual-build)下载并安装 static-php-cli。
2. 接下来，使用 `spc` 命令构建包含 micro SAPI 的静态 PHP 二进制文件：

```bash
# linux/macOS
EXTENSIONS="bcmath,phar,openssl,mbstring"
./spc doctor --auto-fix
./spc download --for-extensions=$EXTENSIONS --with-php=8.4
./spc build $EXTENSIONS --build-micro
cp buildroot/bin/micro.sfx /path/to/your/micro.sfx

# windows (PowerShell)
.\spc.exe doctor --auto-fix
.\spc.exe download --for-extensions="bcmath,phar,openssl,mbstring" --with-php=8.4
.\spc.exe build "bcmath,phar,openssl,mbstring" --build-micro
copy .\buildroot\bin\micro.sfx \path\to\your\micro.sfx
```

## 文档（WIP）

有关 micro SAPI 的更多详细信息，如动态构建 micro、构建多文件应用、更多配置方式等，请参阅 <https://micro.static-php.dev> 文档。

## 开源许可证

本项目采用 Apache-2.0 许可证。详情请参见 [LICENSE](LICENSE) 文件。

使用 static-php-cli 构建静态 PHP 时，生成的二进制文件可能包含其他开源组件。
请参考 [static-php-cli LICENSE](https://github.com/crazywhalecc/static-php-cli#open-source-license) 说明。
