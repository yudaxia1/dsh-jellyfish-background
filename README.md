# DSH 深海字符水母背景 / Deep-Sea ASCII Jellyfish Background

[中文](#中文) · [English](#english) · [视觉需求说明 / Visual brief](docs/visual-brief.md)

![DSH 实际运行中的水母背景动图 / Animated demo in DSH](assets/demo.gif)

[全窗口截图 / Full-window screenshot](assets/screenshot.png) · [设置界面 / Settings](assets/settings.png)

动图和截图均来自 DSH `0.2.1-rc.3` 的实际运行页面。 / The GIF and screenshots were captured from a running DSH `0.2.1-rc.3` instance.

## 中文

适用于 DSH `0.2.1-rc.3` Web 界面的动态主题插件。它在整个应用窗口后方绘制字符方格水母、暗蓝网格和漂浮星点，并把面板切换为深色半透明外观。DSH 原有的侧边栏、聊天、设置和输入功能继续使用。

动画由 Canvas 实时绘制，不依赖远程图片或视频；背景不拦截鼠标与键盘，页面隐藏时暂停，并响应系统“减少动态效果”设置。

### 使用

首次安装后背景默认开启。打开 **设置 → 通用设置 → 深海字符水母**，可以关闭背景或调整动效强度。关闭时恢复此前选择的主题。启用期间若选择 DSH 的其他外观，该选择会在关闭本插件后生效。

页面隐藏时停止绘制；系统开启“减少动态效果”或动效强度设为 0 时显示静态画面。设置保存在当前浏览器的 `localStorage`，同一来源的多个标签页会同步。

### 安装

需要 DSH `0.2.1-rc.3`。使用仓库中的安装包，安装到 Web profile 后重启 DSH：

```powershell
dsh plugin --profile web add '.\dist\dsh-background-style-plugin-0.1.4.tgz'
dsh web
```

安装版 Desktop 首次启动并初始化 profile 后，完全退出应用，再使用该安装版附带的 `dsh` 命令：

```powershell
dsh plugin --profile desktop add 'D:\path\to\dsh-background-style-plugin-0.1.4.tgz'
```

重新打开 DSH 后首次默认开启。卸载时使用 `dsh plugin --profile web remove dsh-background-style-plugin`，Desktop 则把 `web` 换成 `desktop`。

### 从源码构建

此源码使用 DSH `0.2.1-rc.3` 的 Client 打包工具。将本仓库的插件源码和配置文件复制到该版本源码的 `packages/client/dsh-background-style-plugin`，在 DSH 仓库根目录安装依赖并依次执行：

```powershell
node --max-old-space-size=4096 .\node_modules\typescript\bin\tsc -b tsconfig.host.json
pnpm exec tsdown --config-loader native --env.DSH_BUILD_FACE host
pnpm exec tsc -b packages/client/dsh-background-style-plugin/tsconfig.json
pnpm exec tsdown --config-loader native --config packages/client/dsh-background-style-plugin/tsdown.config.ts --env.DSH_BUILD_FACE client
cd packages/client/dsh-background-style-plugin
pnpm pack
```

构建产物是 Host 入口 `lib/index.js` 和浏览器入口 `lib/client.js`。插件通过 `dsh.bundle` 把自己加入 profile，通过 `dsh.client` 加入浏览器插件表；主题使用 `ctx.theme.register`，设置项使用 `settings.general.item` 插槽。不修改 DSH 源码。

### 限制

此包的 `engines.dsh` 固定为 `0.2.1-rc.3`。其他 DSH 版本需要重新核对插件 API、主题 token 和全窗口背景层级，再调整兼容范围。

视觉参考：[小红书「ASCII 风格的水母动效制作」](https://www.xiaohongshu.com/discovery/item/6ad97ec4000000002c0263ef)。插件中的动画为独立绘制。

## English

An animated full-window theme plugin for DSH `0.2.1-rc.3`. It draws character-cell jellyfish, a faint grid, and drifting stars behind the Web interface while applying a dark translucent palette. Native DSH controls and interactions remain in place.

The Canvas layer is procedural and ships without remote image or video assets. It ignores pointer events, pauses in hidden tabs, honors reduced-motion settings, and adjusts for viewport size and pixel density.

The background starts enabled on first install. Open **Settings → General → Deep-sea ASCII jellyfish** to disable it or adjust motion intensity. Disabling restores the last selected DSH appearance. Appearance changes made while the plugin is enabled take effect after disabling it.

The animation pauses when the page is hidden. Reduced-motion mode and intensity 0 render a static scene. Preferences use browser `localStorage` and synchronize across tabs on the same origin.

### Install

Use DSH `0.2.1-rc.3`. Install the included package into the Web profile and restart DSH:

```sh
dsh plugin --profile web add ./dist/dsh-background-style-plugin-0.1.4.tgz
dsh web
```

For installed Desktop, launch it once, quit fully, then use its bundled `dsh` command with `--profile desktop` and reopen the app. The plugin enables itself on first install; find its toggle and strength slider under **Settings → General**.

### Build from source

Copy the plugin sources and configuration files to `packages/client/dsh-background-style-plugin` inside the DSH `0.2.1-rc.3` source tree. From the DSH root, install dependencies and run in order:

```sh
node --max-old-space-size=4096 ./node_modules/typescript/bin/tsc -b tsconfig.host.json
pnpm exec tsdown --config-loader native --env.DSH_BUILD_FACE host
pnpm exec tsc -b packages/client/dsh-background-style-plugin/tsconfig.json
pnpm exec tsdown --config-loader native --config packages/client/dsh-background-style-plugin/tsdown.config.ts --env.DSH_BUILD_FACE client
cd packages/client/dsh-background-style-plugin
pnpm pack
```

The Host entry and browser bundle are declared in `package.json`; the bundle patch installs the plugin into a profile. The browser half uses the official theme and Settings slot services, and does not patch DSH source files.

Compatibility is limited to the exact tested DSH release in `engines.dsh`. Recheck the client APIs, CSS tokens, and window layers before expanding the supported version range.

### Visual reference

Inspired by a [Xiaohongshu ASCII jellyfish animation post](https://www.xiaohongshu.com/discovery/item/6ad97ec4000000002c0263ef). This plugin draws its own animation and keeps DSH's native interface.
