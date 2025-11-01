# Building micro SAPI

## Using static-php-cli (Recommended)

Due to the nature of micro SAPI, it's best to use static compilation to build the PHP runtime and related extensions.
We recommend using [static-php-cli](https://static-php.dev) to build a static PHP binary with micro SAPI included.

You can follow the steps in the static-php.dev documentation to build your own static PHP binary with micro SAPI. The general steps are as follows:

### Install SPC Tool

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

# Add execute permission
chmod +x ./spc
```

**Windows:**

```powershell
curl.exe -fsSL -o spc.exe https://dl.static-php.dev/static-php-cli/spc-bin/nightly/spc-windows-x64.exe
```

### Create Craft Configuration File

Create a `craft.yml` file specifying the list of extensions you want to include. For supported extensions, see the [Extension List](https://static-php.dev/en/guide/extensions.html) or [Command Generator](https://static-php.dev/en/guide/cli-generator.html).

```yml
# PHP version support: 8.1, 8.2, 8.3, 8.4, 8.5
php-version: 8.4
# Put your extension list here
extensions: "bcmath,phar,openssl,mbstring"
sapi: 
  - cli
  - micro
download-options:
  prefer-pre-built: true
```

### Build Static PHP Binary

Run the following command to build a static PHP binary with micro SAPI:

```bash
./spc craft
```

After the build is complete, you can find the generated `micro.sfx` file in the `buildroot/bin/` directory. Copy it to wherever you want to use it, and you can start using micro SAPI to run your PHP applications.

Finally, you can use spc's `micro:combine` command to concatenate `micro.sfx` with your PHP code or PHAR file to create a self-executable binary:

```bash
echo '<?php echo "Hello, Micro SAPI!\n";' > app.php
./spc micro:combine app.php -O myapp
./myapp
```

Of course, without any other configuration, you can also manually complete this process using bash and powershell:

```bash
# Linux/macOS
cat buildroot/bin/micro.sfx app.php > myapp
chmod +x ./myapp
./myapp

# Windows
COPY /b buildroot\bin\micro.sfx + app.php myapp.exe
.\myapp.exe
```

For more build options and details, please refer to the [static-php.dev documentation](https://static-php.dev/en/guide/manual-build).

## Other Build Methods

Besides using static-php-cli, you can also choose to manually compile micro SAPI from PHP source code. Please refer to PHP's official [compilation guide](https://www.php.net/manual/en/install.unix.source.php) for more details.

Manually compiling micro SAPI is generally only recommended when debugging micro SAPI itself. In most cases, it's recommended to use static-php-cli to build statically linked micro SAPI binaries.

Below are the general steps for manually compiling a micro.sfx with a minimal extension set. Specific details may vary depending on your system environment.

### Prepare PHP Source Code

```bash
git clone https://github.com/php/php-src.git
cd php-src
git clone https://github.com/static-php/phpmicro.git sapi/micro
```

### Configure and Compile

```bash
./buildconf --force
./configure --enable-micro --disable-all --enable-cli --with-openssl --with-zlib --enable-phar --enable-mbstring --enable-bcmath
make -j$(nproc)
# The generated micro.sfx is located at sapi/micro/micro.sfx
```
