<img src="icons/source.svg" width="64" height="64" alt="中西文字体替换图标">

# 中西文字体替换

**让中文、西文与标点，各有合宜的字形。**

为网页搭配喜欢的中文字体，保留前面的西文选择；让引号、省略号与破折号采用同一组字形；或将衬线正文组合成中文与西文各自合适的字体。中西文字体替换把这些设置集中在一页，边试排，边调整。

[下载安装](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/latest) · [开始使用](#安装与开始使用) · [字体怎么填](#字体名称与多个后备项怎么填) · [更新日志](CHANGELOG.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/ui/options-dark.png">
  <img src="docs/ui/options-light.png" alt="中西文字体替换的工作台式设置页，按标点、中文正文、衬线组合与站点分区">
</picture>

[完整设置页](docs/ui/options-full.png) · [暗色主题](docs/ui/options-dark.png) · [工具栏弹窗](docs/ui/popup-light.png) · [本机字体识别](docs/ui/options-tools.png)

## 从一个标点，到一整段文字

| 功能 | 可以怎样调整 | 初始状态 |
|---|---|---|
| 共用标点 | 为引号、省略号、破折号等字符选择本机字体 | 开启，使用 `PingFang UI SC` |
| 中文正文黑体 | 按名单替换常见简中黑体与系统无衬线字体，补充中文后备 | 开启，使用 `PingFang UI SC` |
| 宋体替换 | 为 `宋体`/`SimSun` 指定字体列表 | 关闭 |
| 楷体替换 | 为常见简中楷体名称指定字体列表 | 关闭 |
| 衬线中西文组合 | 分别指定中文、西文字体，并选择共用字符来源 | 关闭 |

设置页提供无衬线正文、宋体、楷体与衬线混排四组试样，右侧常驻并按草稿注册真实字形，可切换原字形对照。页面支持明暗主题与窄屏。

## 安装与开始使用

1. 在系统中安装准备使用的字体。
2. 从 [最新 Release](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/latest) 下载 `chinese-western-font-replacer-v<VERSION>.zip`。
3. 打开 `edge://extensions/` 或 `chrome://extensions/`，开启开发者模式，将 ZIP 拖入扩展管理页。
4. 点击扩展图标进入设置，填写本机字体名称，按需要启用各项功能，查看试样后保存。

扩展适用于 Chrome、Edge 等 Chromium 浏览器，通过本机字体绘制。更新时拖入新版 ZIP，覆盖原扩展并沿用设置。固定扩展 ID：`leodnciablfoggcacioldiippnfdonmg`。

## 标点的字形，也值得单独选择

同一个 Unicode 字符在不同字体中可能有不同的位置、宽度与形状。可以将一组共用字符交给指定字体，使引号、省略号、破折号和参考符号采用一致的字形。

默认字符组包括弯引号、省略号、破折号与连接号、间隔号与项目符号、参考与章节符号。角形引号、英文标点及常用符号可另行勾选，也可以直接输入额外字符。

标点注入依据**原字体列表的首项**：命中可编辑的常见无衬线名单，或名称带有 `sans`、`Hei`/`Heiti`、“黑体”/“黑體”等标签时生效，忽略英文大小写。

| 网站原字体列表 | 独立标点设置 |
|---|---|
| `Arial, sans-serif` | 生效 |
| `Noto Sans SC, serif` | 生效 |
| `Times New Roman, sans-serif` | 沿用原标点 |
| `Space Grotesk, Arial, sans-serif` | 沿用原标点 |

后备位置的无衬线字体不参与首项判断。字符按码位统一处理，因此中文与西文中的同一个字符会使用相同字形。

## 给中文正文安排合适的字体

常见简中正文黑体与系统无衬线名称会在原位置替换。默认组合为：

```css
"SF Pro Text", "PingFang UI SC", "PingFang SC"
```

前面的西文字体继续优先。例如，以下正文列表：

```css
Arial, "Microsoft YaHei", sans-serif
```

会使用 `Arial` 优先绘制可用字符，并在中文字体位置使用所选组合。没有命中目标名称时，在列表末尾补充该组合；原列表明确包含宋体、楷体、仿宋等中文字体时，保留相应系统后备并跳过末尾追加。

目标中文字体前会补充 `SF Pro Text`。只填写 `PingFang UI SC` 时，其后自动补充 `PingFang SC`；填写多个字体时，保留自选顺序。

<details>
<summary>默认覆盖哪些正文与系统字体？</summary>

正文名单包含 CSS 模板中常见的简中黑体名称：

- 微软雅黑：`Microsoft YaHei`、`Microsoft YaHei UI`、`微软雅黑`。
- 苹方：`PingFang SC`、`PingFang UI SC`、`苹方-简`。
- 冬青：`Hiragino Sans GB`。
- Noto/思源：`Noto Sans SC`、`Noto Sans CJK SC`、`Source Han Sans SC`、`思源黑体`。
- 文泉驿：`WenQuanYi Micro Hei`。
- 鸿蒙：`HarmonyOS Sans SC`、`HarmonyOS_Sans_SC`。

系统名称包括 `system-ui`、`sans-serif`、`ui-sans-serif`、`-apple-system`、`BlinkMacSystemFont`，以及 `-apple-system-body` 等 Apple 文本样式名称。完整名单见设置页或 [shared.js](shared.js)，可自行增删。

</details>

### 宋体与楷体，分别设置

宋体替换只匹配 `宋体` 与 `SimSun`，其他宋体名称沿用网站声明。楷体替换覆盖楷体、楷体 GB2312、华文楷体等常见简中名称。

两项分别开关、分别填写字体列表，也独立于正文黑体开关。默认目标分别是 `Songti SC` 和 `Kaiti SC`，开启后使用填写的字体列表原位替换。

## 为衬线正文组合中文与西文

希望中文采用宋体字形，西文采用另一套衬线字体时，可以开启“衬线体中西文字体组合”：

| 板块 | 配置示例 |
|---|---|
| 中文字体 | `Songti SC, SimSun` |
| 西文字体 | `Times New Roman, Georgia` |
| 中西文共用字符 | 默认使用中文字体，可切换为西文字体 |

组合在 `serif`、`宋体`/`SimSun`、`Times New Roman` 的原位置生效，保留前置字体的优先级和原字体后备。中文与西文通过 `unicode-range` 分配字符；共用标点按本功能的选项选择字形。

“衬线体组合”与“宋体替换”互斥，开启一项会关闭另一项。`ui-serif`、带引号的 `"serif"` 字体家族及其他宋体名称保持原义。

## 字体名称与多个后备项怎么填

所有字体输入框都支持多个本机字体。用英文或中文逗号分隔，浏览器按顺序选择字体与缺字后备：

```css
PingFang UI SC, PingFang SC
```

单个名称可加 CSS 引号，也可省略：

```css
"思源宋体 VF", "宋体"
```

**每个名称分别加引号**。将整个列表放进一对引号，会被识别为一个带逗号的字体名称。字体名称本身含逗号时，可写成 `"A,B", Arial`。

填写完整名称，包括字体自身的后缀，例如 `方正新书宋_GBK`。页面会显示加载结果，并在匹配到相近名称时给出提示。

<details>
<summary>可选：识别字体内部名称</summary>

设置页底部的“本机字体名称”默认折叠。需要使用字体内部的中文或其他语言名称时，展开并点击“识别本机字体”。

授权后，扩展读取字体内部的多语言名称，关联同一字体的可用加载名称，并在本机缓存结果。输入和保存内容保留原名称。支持 TTF、OTF、TTC 字体集合及可变字体；安装或更新字体后可重新识别。

</details>

## 给不同网站保留不同选择

站点支持“跟随全局/开启/关闭”，以及独立的标点字体列表和中文字体模式。

`example.com` 同时匹配主域名与子域名；`docs.example.com` 更具体，优先匹配；`example.com:443` 仅匹配对应端口。相同优先级按规则顺序处理。

选择“网站中文字体”时，本站的黑体、宋体、楷体与衬线组合一同停用。独立标点设置仍按本站开关执行。

<details>
<summary>样式处理、适用范围与隐私</summary>

扩展读取和处理网站字体样式声明，通过 `FontFace`、`local()` 与 `unicode-range` 引用本机字体，由浏览器完成字符选择和绘制。页面文字、输入内容与选区由网站和浏览器管理。

处理范围包括普通样式表、行内字体、CSS 变量、媒体条件、状态选择器、动态 CSSOM、脚本创建的 Shadow DOM 与 adopted stylesheets。跨域 CSS 无法直接读取时，由后台向原地址请求，按原位置建立样式副本；请求不附带站点凭据。

停用后恢复网站字体声明。完全由变量组成且未提供独立 `font-family` 的 `font` 简写保留原值；浏览器内部页和扩展商店等页面受注入限制。本地文件访问需在扩展管理页允许。

配置及可选的字体名称索引保存在当前浏览器本地。完整说明见 [PRIVACY.md](PRIVACY.md)。

</details>

## 同系列：按需要搭配

- [字体替换器](https://github.com/Speechlessmanbilibili/system-font-substituter)：按目标名单替换网页字体，支持站点强制规则、连字和自定义 CSS。
- [中西文自动间距](https://github.com/Speechlessmanbilibili/native-auto-space)：全局启用浏览器原生自动间距，并为网站单独设置开关。

三个扩展分别安装、独立配置。与字体替换器搭配时，使用 v2.1.9 或更新版本，可识别多个前置标点范围字体。

## 开发与构建

```powershell
npm ci
npx playwright install chromium
npm test
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./build-release.ps1
```

构建脚本生成主世界入口 `main-runtime.js`，并打包为 `dist/chinese-western-font-replacer-v<VERSION>.zip`，同步复制到系统下载目录。真实字体绘制测试使用本机字体环境。

共有配置位于 [shared.js](shared.js)，字体声明处理位于 [engine.js](engine.js)，开发与发布约定见 [AGENTS.md](AGENTS.md)。

## 开源与反馈

采用 [GNU GPL v3.0 或更新版本](LICENSE)（GPL-3.0-or-later）。

[查看更新日志](CHANGELOG.md) · [报告问题或提出建议](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/issues) · [隐私说明](PRIVACY.md)