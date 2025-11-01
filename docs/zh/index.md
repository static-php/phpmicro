# micro SAPI for PHP

欢迎来到 static-php 的 micro SAPI 文档！

此文档由原 [easysoft/phpmicro](https://github.com/easysoft/phpmicro) 项目的 [文档](https://docs.toast.run/micro/en/) 改编而来，
进行了部分改进，部分文档内容参考自原项目文档。

本文档以原文档相同的协议 CC BY-SA 4.0 进行发布，详情请参见 [许可证](../LICENSE-CC)。

## 概述

本 phpmicro 文档适用于 static-php/phpmicro 项目，该项目 fork 自 [easysoft/phpmicro](https://github.com/easysoft/phpmicro)，并进行了部分改进，
部分文档内容参考自原项目文档。

micro SAPI 是 PHP 的一个 SAPI 模块，允许你创建自执行的 PHP 二进制文件。
通过将 micro SAPI 二进制文件与你的 PHP 源代码或 PHAR 文件连接，
你可以在不需要单独安装 PHP 的情况下运行 PHP 应用程序。

不需要重量级的 Docker 镜像，不需要预先安装 PHP 环境，只需一个小巧的二进制文件即可运行你的 PHP 应用程序。

## 它是怎么工作的

PHP 有多种不同的 SAPI（Server API）接口，允许 PHP 以不同的方式运行。最常见的 SAPI 是 fpm（FastCGI 进程管理器）和 cli（命令行接口）。

以 cli 举例，cli SAPI 允许我们从命令行运行 PHP 脚本。我们可以直接在终端中执行 PHP 代码，适用于编写命令行工具和脚本。而执行方式也是最简单的。

![](../public/images/cli.png)

对于 micro SAPI，它和 cli SAPI 类似，但它允许我们将 PHP 代码拼接到一个自执行的二进制文件中。这个二进制文件包含了 PHP 解释器和你的应用代码。

![](../public/images/micro.png)

你可能认为它和 WinRAR 等压缩软件提供的自解压文件类似，但实际上它们的实现方式不同。
WinRAR 的自解压文件是一个压缩包，运行时会解压缩内容到临时目录再执行，而 micro SAPI 是将 PHP 解释器和代码直接拼接在一起，
运行时不需要解压缩，直接执行即可。

## 使用场景

首先，相较于传统的 PHP 运行方式（cli、fpm、apache-mod-php 等），micro SAPI 解决了一个重要问题：**不需要预先安装 PHP 环境**。
它可以极大地方便 PHP 开发者编写通用的终端命令行工具，用户只需下载一个二进制文件即可运行，无需担心 PHP 版本和扩展依赖。

如果我们和其他语言的构建便携工具的特点相比较，你会发现 micro SAPI 解决了很多其他语言构建便携工具时遇到的问题。

- **Go**：Go 语言可以编译为静态链接的二进制文件，但每次修改代码都需要重新编译。
- **Python**：Python 需要预先安装 Python 解释器。即使使用了 PyInstaller 等工具打包，它也会在执行时解压缩到临时目录，增加了读写开销。
- **Bash 脚本**：对于 Windows 用户来说需要预先安装 Bash 解释器，且语法不够灵活。
- **Java**：Java 打包成 jar 需要预先安装 Java 运行时环境（JRE），且启动时需要加载大量类库，启动速度较慢。

而 micro SAPI 结合了静态编译和解释执行的优点，既不需要预先安装 PHP 环境，也不需要每次修改代码都重新编译，同时启动速度也很快，非常适合构建便携的命令行工具。

- **PHP 语法灵活**：PHP 语法简单易学，适合快速编写脚本和工具。
- **丰富的扩展支持**：PHP 的扩展大多由 C 语言开发，可以方便地嵌入式构建到 PHP 二进制文件中。
- **跨平台友好**：相比 Bash 脚本，使用 micro SAPI 编写脚本可以更好地支持 Windows 平台。
- **快速启动**：PHP 解释器启动速度快，不涉及 PHP 代码的提取到临时目录的步骤。
- **依赖管理简单**：PHP 的主流 C 扩展都可以静态编译，Composer 依赖可以打包到 PHAR 文件中，极大简化了依赖管理。

当然，micro SAPI 也有一些局限性：

- **不适合 Web 应用**：micro SAPI 主要面向命令行工具和脚本，不适合构建传统的 fpm 应用。当然，你可以配合 swoole 等 cli 兼容的扩展来实现 Web 服务。
- **不提供源码保护**：micro 不提供源码加密或混淆功能，PHP 代码仍然是明文的。
- **更换扩展需要重新构建**：如果需要添加或移除 PHP 扩展，需要重新构建 micro SAPI 二进制文件。

由于它本质上不属于传统的 SAPI，因此在某些特殊场景下可能会遇到兼容性问题，具体请参考下面的兼容性章节。

## 兼容性

对于 PHP 自身的兼容性，micro SAPI 支持从 PHP 8.0 到最新的 PHP 8.5 版本。

对于 PHP 代码的兼容性，micro SAPI 支持绝大多数基于 CLI 的 PHP 应用程序和脚本。
只要你的代码不依赖于特定的 SAPI 功能，通常都可以正常运行。

对于 PHP 扩展的兼容性，micro SAPI 支持大部分常用的 PHP 扩展，如 pdo、openssl、mbstring 等。
但是，一些存在 SAPI 类型判断的扩展可能无法正常工作，在某些情况下会检查 SAPI 类型，如果检测到不是 cli 可能会无法使用。
