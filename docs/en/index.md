# micro SAPI for PHP

Welcome to the static-php micro SAPI documentation!

This documentation is adapted from the original [easysoft/phpmicro](https://github.com/easysoft/phpmicro) project's [documentation](https://docs.toast.run/micro/en/),
with partial improvements. Some documentation content is referenced from the original project documentation.

This documentation is published under the same license as the original documentation, CC BY-SA 4.0. For details, please refer to the [License](../LICENSE-CC.md).

## Overview

This phpmicro documentation is suitable for the [static-php/phpmicro](https://github.com/static-php/phpmicro) project, which is forked from [easysoft/phpmicro](https://github.com/easysoft/phpmicro) with partial improvements.
Some documentation content is referenced from the original project documentation.

micro SAPI is a SAPI module for PHP that allows you to create self-executable PHP binaries.
By concatenating the micro SAPI binary with your PHP source code or PHAR files,
you can run PHP applications without requiring a separate PHP installation.

No heavyweight Docker images, no pre-installed PHP environment required—just a single compact binary to run your PHP applications.

## How It Works

PHP has multiple SAPI (Server API) interfaces that allow PHP to run in different ways. The most common SAPIs are fpm (FastCGI Process Manager) and cli (Command Line Interface).

Taking CLI as an example, the CLI SAPI allows us to run PHP scripts from the command line. We can execute PHP code directly in the terminal, which is suitable for writing command-line tools and scripts. The execution method is also the simplest.

![](../public/images/cli.png)

For micro SAPI, it works similarly to CLI SAPI, but it allows us to concatenate PHP code into a self-executable binary file. This binary file contains both the PHP interpreter and your application code.

![](../public/images/micro.png)

You might think it's similar to self-extracting archives provided by compression software like WinRAR, but they actually work differently.
WinRAR's self-extracting archives are compressed packages that extract contents to a temporary directory before execution, while micro SAPI directly concatenates the PHP interpreter and code together,
requiring no extraction at runtime—it executes directly.

## Use Cases

First, compared to traditional PHP execution methods (cli, fpm, apache-mod-php, etc.), micro SAPI solves an important problem: **no pre-installed PHP environment required**.
This greatly facilitates PHP developers in writing general-purpose command-line tools. Users only need to download a single binary file to run it, without worrying about PHP versions and extension dependencies.

If we compare it with other languages' capabilities for building portable tools, you'll find that micro SAPI addresses many issues encountered when building portable tools in other languages.

- **Go**: Go can compile into statically linked binaries, but requires recompilation every time the code is modified.
- **Python**: Python requires a pre-installed Python interpreter. Even with tools like PyInstaller for packaging, it still extracts to a temporary directory at execution time, adding I/O overhead.
- **Bash scripts**: Windows users need to pre-install a Bash interpreter, and the syntax is not flexible enough.
- **Java**: Packaging Java as a JAR requires a pre-installed Java Runtime Environment (JRE), and loading numerous class libraries at startup makes it relatively slow to start.

Micro SAPI combines the advantages of static compilation and interpreted execution—no pre-installed PHP environment needed, no recompilation required for every code change, and fast startup times, making it ideal for building portable command-line tools.

- **Flexible PHP syntax**: PHP syntax is simple and easy to learn, suitable for quickly writing scripts and tools.
- **Rich extension support**: Most PHP extensions are developed in C and can be easily embedded and built into PHP binaries.
- **Cross-platform friendly**: Compared to Bash scripts, writing scripts with micro SAPI provides better Windows platform support.
- **Fast startup**: The PHP interpreter starts quickly, with no step involved in extracting PHP code to a temporary directory.
- **Simple dependency management**: Mainstream PHP C extensions can all be statically compiled, and Composer dependencies can be packaged into PHAR files, greatly simplifying dependency management.

Of course, micro SAPI also has some limitations:

- **Not suitable for web applications**: micro SAPI is primarily aimed at command-line tools and scripts, not suitable for building traditional fpm applications. Of course, you can use CLI-compatible extensions like Swoole to implement web services.
- **No source code protection**: micro does not provide source code encryption or obfuscation—PHP code remains in plaintext.
- **Changing extensions requires rebuilding**: If you need to add or remove PHP extensions, you must rebuild the micro SAPI binary.

Since it's essentially not a traditional SAPI, you may encounter compatibility issues in some special scenarios. Please refer to the Compatibility section below for details.

## Compatibility

For PHP itself, micro SAPI supports PHP versions from 8.0 to the latest 8.5.

For PHP code compatibility, micro SAPI supports most CLI-based PHP applications and scripts.
As long as your code doesn't depend on specific SAPI features, it will usually run normally.

For PHP extension compatibility, micro SAPI supports most commonly used PHP extensions, such as pdo, openssl, mbstring, etc.
However, some extensions that perform SAPI type checks may not work properly, as they may check the SAPI type and fail to work if it's not detected as CLI.
