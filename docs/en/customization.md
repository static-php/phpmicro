# Configuring micro SAPI

micro SAPI may require custom configuration in certain scenarios to meet specific needs.

Current micro SAPI configuration mainly includes the following types:

- **SAPI Name Masquerading**: Some extensions or libraries may behave differently based on the SAPI name. By configuring SAPI name masquerading, you can make these extensions or libraries believe the current runtime environment is CLI, avoiding compatibility issues.
- **INI Injection**: Custom INI configuration can be injected into the micro.sfx binary to override default PHP configuration. This is very useful for applications requiring specific configuration.
- **Custom Win32 Metadata**: On Windows platforms, you can customize micro.sfx metadata, such as file description, exe icon, etc.

This section explains how to use them. For more technical details about these configurations and micro SAPI, see the [Digging Deeper](digging-deeper.md) section.

## SAPI Name Masquerading

This configuration is primarily used for compatibility with certain extensions or libraries that strictly check the SAPI type. By masquerading the SAPI name as CLI, you can avoid issues where these extensions or libraries fail to work properly due to detecting a non-CLI SAPI.

To enable SAPI name masquerading, when building micro SAPI with static-php-cli, add the following configuration to your `craft.yml` file:

```yml
build-options:
  with-micro-fake-cli: true
```

If using SPC's `build` command to build, use the command-line parameter `--with-micro-fake-cli`:

```bash
./spc build bcmath,phar,openssl,mbstring --build-micro --with-micro-fake-cli
```

After masquerading, PHP code executed in micro.sfx calling `php_sapi_name()` will return `cli` instead of `micro`.

## INI Injection

Unlike CLI SAPI, micro SAPI doesn't read any php.ini configuration files by default. Therefore, if your application depends on specific PHP configuration options, you may need to implement this through INI injection.

To inject custom INI configuration, after building micro SAPI with static-php-cli and before packaging your PHP code, use the `-I` option of the `micro:combine` command to automatically inject INI settings:

```bash
# here to build micro.sfx first
# ./spc craft

echo '<?php echo ini_get("memory_limit") . PHP_EOL;' > test.php
./spc micro:combine test.php -I "memory_limit=512M" -O myapp
./myapp
# output: 512M
```

If you have multiple INI configuration items to inject, you can use multiple `-I` options, or use `-N` to specify a file containing multiple lines of INI configuration:

```bash
# Using multiple -I options
./spc micro:combine test.php -I "memory_limit=512M" -I "display_errors=1" -O myapp

# Using -N with a file
echo "memory_limit=512M" > ini.txt
echo "display_errors=1" >> ini.txt
./spc micro:combine test.php -N ini.txt -O myapp
```
