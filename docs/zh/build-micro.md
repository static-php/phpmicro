# 构建 micro SAPI

## 使用 static-php-cli（推荐）

因为 micro SAPI 的特性，最好使用静态编译的方式来构建 PHP 运行时和相关扩展。
我们推荐使用 [static-php-cli](https://static-php.dev) 来构建包含 micro SAPI 的静态 PHP 二进制文件。

你可以按照 static-php.dev 文档中的步骤构建自己的包含 micro SAPI 的静态 PHP 二进制文件。大致步骤如下：

### 安装 SPC 工具

**Linux/macOS:**

```bash
# For Linux x86_64
curl -fsSL -o spc https://dl.static-php.dev/static-php-cli/spc-bin/nightly/spc-linux-x86_64
# For Linux aarch64
curl -fsSL -o spc https://dl.static-php.dev/static-php-cli/spc-bin/nightly/spc-linux-aarch64
# macOS x86_64 (Intel)
curl -fsSL -o spc https://dl.static-php.dev/static-php-cli/spc-bin/nightly/spc-macos-x86_64
# macOS aarch64 (Apple)
curl -fsSL -o spc https://dl.static-php.dev/static-php-cli/spc-bin/nightly/spc-macos-aarch64

# 添加执行权限
chmod +x ./spc
```

**Windows:**

```powershell
curl.exe -fsSL -o spc.exe https://dl.static-php.dev/static-php-cli/spc-bin/nightly/spc-windows-x64.exe
```

### 创建 Craft 配置文件

创建一个 `craft.yml` 文件，指定你想要包含的扩展列表。支持的扩展参见 [扩展列表](https://static-php.dev/en/guide/extensions.html) 或 [命令生成器](https://static-php.dev/en/guide/cli-generator.html)。

```yml
# PHP 版本支持: 8.1, 8.2, 8.3, 8.4, 8.5
php-version: 8.4
# 在这里放入你的扩展列表
extensions: "bcmath,phar,openssl,mbstring"
sapi: 
  - cli
  - micro
download-options:
  prefer-pre-built: true
```

### 构建静态 PHP 二进制文件

运行以下命令来构建包含 micro SAPI 的静态 PHP 二进制文件：

```bash
./spc craft
```

构建完成后，你可以在 `buildroot/bin/` 目录下找到生成的 `micro.sfx` 文件。将其复制到你想要使用的地方，即可开始使用 micro SAPI 运行你的 PHP 应用程序。

最后，你可以使用 spc 的 `micro:combine` 命令将 `micro.sfx` 与你的 PHP 代码或 PHAR 文件连接起来，形成一个自执行的二进制文件：

```bash
echo '<?php echo "Hello, Micro SAPI!\n";' > app.php
./spc micro:combine app.php -O myapp
./myapp
```

当然，在不包含任何其他配置的情况下，你也可以用 bash 和 powershell 手动完成这一过程：

```bash
# Linux/macOS
cat buildroot/bin/micro.sfx app.php > myapp
chmod +x ./myapp
./myapp

# Windows
COPY /b buildroot\bin\micro.sfx + app.php myapp.exe
.\myapp.exe
```

更多构建选项和细节，请参考 [static-php.dev 文档](https://static-php.dev/en/guide/manual-build)。

## 其他构建方法

除了使用 static-php-cli，你也可以选择从 PHP 源代码手动编译 micro SAPI。请参考 PHP 官方文档中的[编译指南](https://www.php.net/manual/en/install.unix.source.php)了解更多细节。

手动编译 micro SAPI 一般只建议在调试 micro SAPI 本身时使用。通常情况下，推荐使用 static-php-cli 来构建静态链接的 micro SAPI 二进制文件。

下面为大致的手动编译一个包含最小扩展组合的 micro.sfx 步骤，具体细节可能会根据你的系统环境有所不同。

### 准备 PHP 源码

```bash
git clone https://github.com/php/php-src.git
cd php-src
git clone https://github.com/static-php/phpmicro.git sapi/micro
```

### 配置和编译

```bash
./buildconf --force
./configure --enable-micro --disable-all --enable-cli --with-openssl --with-zlib --enable-phar --enable-mbstring --enable-bcmath
make -j$(nproc)
# 生成的 micro.sfx 位于 sapi/micro/micro.sfx
```

