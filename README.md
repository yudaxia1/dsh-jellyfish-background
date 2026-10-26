# DSH Deep-Sea ASCII Jellyfish Background / 深海字符水母背景

[中文说明](README.zh-CN.md) · [Visual brief](docs/visual-brief.md)

![Animated demo in DeepSeek Harness](assets/demo.gif)

Actual DSH Web capture: [full-window screenshot](assets/screenshot.png) · [settings controls](assets/settings.png)

An animated full-window theme plugin for DSH `0.2.1-rc.3`. It draws character-cell jellyfish, a faint grid, and drifting stars behind the Web interface while applying a dark translucent palette. Native DSH controls and interactions remain in place.

The Canvas layer is procedural and ships without remote image or video assets. It ignores pointer events, pauses in hidden tabs, honors reduced-motion settings, and adjusts for viewport size and pixel density.

The background starts enabled on first install. Open **Settings → General → Deep-sea ASCII jellyfish** to disable it or adjust motion intensity. Disabling restores the last selected DSH appearance. Appearance changes made while the plugin is enabled take effect after disabling it.

The animation pauses when the page is hidden. Reduced-motion mode and intensity 0 render a static scene. Preferences use browser `localStorage` and synchronize across tabs on the same origin.

## Install

Use DSH `0.2.1-rc.3`. Install the included package into the Web profile and restart DSH:

```sh
dsh plugin --profile web add ./dist/dsh-background-style-plugin-0.1.4.tgz
dsh web
```

For installed Desktop, launch it once, quit fully, then use its bundled `dsh` command with `--profile desktop` and reopen the app. The plugin enables itself on first install; find its toggle and strength slider under **Settings → General**.

## Build from source

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

## Visual reference

Inspired by a [Xiaohongshu ASCII jellyfish animation post](https://www.xiaohongshu.com/discovery/item/6ad97ec4000000002c0263ef). This plugin draws its own animation and keeps DSH's native interface.
