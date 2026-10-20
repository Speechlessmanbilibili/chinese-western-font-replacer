# 更新日志

根据 Git 提交、版本标签及 GitHub Release 记录整理。版本标题链接到对应 Release，日期采用首次发布时的北京时间；同版本安装包的后续更新另行标注日期。

## [v1.4.2](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.4.2)（2026-10-20）

- 设置页与弹窗共用写入锁，交错保存时保留独立字段和站点规则。
- 完整保存站点规则与目标名单，移除数量截断。
- 复用已校验配置、字体范围和名称集合，去除生成字体链的重复项。
- 跨域样式副本使用原生解析，避免辅助字体变量被重复改写。
- 统一设置页详情动画，移除未使用的界面工具。

## [v1.4.1](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.4.1)（2026-10-19）

- 保存设置时按字段合并最新配置，保留其他窗口的开关、站点规则与保存期间的新草稿。
- 工具栏弹窗直接编辑已命中的默认端口规则。
- 同名字体变量的后备判断跟随各自作用域、继承和交互状态。
- 保留 `@property` 与 `CSS.registerProperty()` 的默认值、继承方式和类型校验，停用后清理辅助注册。
- 动态改写及跨域样式表中的注册属性同步更新，冻结的注册参数保留原生字符串转换行为。
- 支持未加引号的字体名称中的 CSS 转义。

## [v1.4.0](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.4.0)（2026-10-18）

- 将设置页重构为三栏工作台：固定应用栏、章节目录、常驻试样与分区设置，统一控件与站点规则。
- 试样常驻显示真实标点字形，并保留原字形对比、字符与 Unicode 范围。
- 添加工具栏弹窗，可切换当前站点的替换行为与中文正文模式，并打开完整设置。
- 使用 `unicode-range` 分离中西文字体，中文引号、破折号与省略号由中文字体排，西文与数字仍用西文字体。
- 界面文案改用 `text-autospace`，移除中西文之间的手动空格。
- 适配明暗主题、窄屏、强制色彩与减少动效偏好。

## [v1.3.0](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.3.0)（2026-10-15）

- 按标点与字符、中文字体、衬线组合、试排和站点设置重新编排界面，加入章节目录。
- 使用纸色、衬线标题、朱砂控件与分行标注的字样预览，适配明暗主题和窄屏。
- 将代码预览字体改为 `Consolas`。
- 将本机字体名称识别移至设置页底部，默认折叠，并提供展开与收起动画。
- 添加同系列扩展图标，同步工具栏、扩展管理页、设置页与标签页标识。

## [v1.2.2](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.2.2)（2026-10-13）

- 按原 `font-family` 的首项判断标点注入，修复后备位置的无衬线字体触发替换的问题。
- 添加可编辑的常见无衬线字体名单，覆盖 `Arial`、`Helvetica`、`Verdana`、`Tahoma`、`Segoe UI` 等名称。
- 为首项 `var()` 建立专用引用，保留普通后备引用、CSS 级联、继承、状态与循环回退，关闭后清理专用变量。
- 添加“识别本机字体”，读取字体内部的多语言名称，支持中文字体名，缓存名称索引并保留输入及保存内容。
- 支持 TTC 字体集合和可变字重范围，同步设置页预览及网页组合字体加载。

## [v1.2.1](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.2.1)（2026-10-11）

- 将 `Times New Roman` 纳入衬线体中西文字体组合，原位应用中文、西文及共用字符设置，保留原字体后备和优先级。
- 将独立标点注入限定到原字体名称含 `sans`、`Hei`/`Heiti` 或“黑体”/“黑體”等标签的列表，忽略英文大小写；按原名称判断，保留其他字体列表的标点字形。
- 按字体变量的实际声明和嵌套回退处理标点，支持多层引用、纯 CSS 状态切换及动态更新，关闭后恢复网站最新声明。
- 更新设置页的标点适用范围和衬线组合说明。

## [v1.2.0](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.2.0)（2026-10-10）

- 将扩展改名为“中西文字体替换”，仓库改名为 `chinese-western-font-replacer`，同步设置页、工具栏及安装包名称，更新相关链接，沿用原扩展身份和配置。
- 添加默认关闭的中西文字体组合功能，原位替换通用 `serif` 及 `宋体`/`SimSun`，分别设置中文与西文字体列表。
- 通过 `unicode-range` 分配中西文字符，各字体列表按填写顺序回退；保留前置字体及原字体后备。
- 为共用标点提供中文/西文字体选项，默认使用中文字体，设置页加入独立混排预览与本机字体检测。
- 将中西文组合与宋体替换设为互斥，切换时同步开关和预览；站点关闭中文替换时同时停用组合。
- 处理字体变量、多层引用、嵌套回退及动态声明，切换或关闭后恢复网站最新字体与 `!important` 优先级。
- 按 CSSOM 实际序列化结果保存替换快照，修复逗号间距及引号规范化后关闭扩展残留组合字体的问题。

## [v1.1.0](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.1.0)（2026-10-08）

- 添加独立的宋体与楷体替换开关，分别设置目标字体列表，默认关闭，按填写顺序原位替换。
- 支持在标点、中文正文及本站标点字体输入框中填写多个字体，按填写顺序回退，识别英文和中文逗号以及带引号的字体名。
- 原位替换 `宋体`/`SimSun` 与常见简中楷体名称，处理 CSS 变量、嵌套 `var()` 回退及动态声明，关闭后恢复网站最终字体与 `!important` 优先级。
- 分别注册多个标点字体，保留缺字回退、静态字体合成粗体与苹方 UI 变量字重。
- 补充本机字体的 `Regular` 名称回退，支持通过 `SF Pro Text` 家族名加载标点字形。
- 添加宋体、楷体预览与字体列表检测，站点关闭中文替换时同时停用三类中文字体替换。
- 结合浏览器字体目录检测正文家族名称，名称未命中时提示相近的已安装完整名称，分别显示标点字形加载结果。

## [v1.0.3](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.0.3)（2026-10-07）

- 在正文替换字体链的 `PingFang UI SC` 后补充 `PingFang SC`，同步更新设置页预览和本机字体检测。

## [v1.0.2](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.0.2)（2026-10-06）

- 在样式资源移除后还原字体声明和变量，重新挂入时恢复替换；同步清理导入样式表的依赖。
- 在开放及闭合 Shadow DOM 宿主重新挂入后恢复观察，保留共享样式表。
- 保存网站后来改变的字体声明优先级，关闭后恢复最终的 `!important` 状态。
- 替换嵌套 `var()` 回退中的正文黑体，保留明确宋体、楷体等字体的回退判断。
- 处理空配置及大写 HTTP/HTTPS 地址，保留站点域名和显式端口。
- 同步跨域样式副本的 `disabled`、媒体条件及读取期间写入，保留网站最终状态。
- 处理分组、关键帧规则增删及 `replaceSync/replace` 重写后的字体声明和变量依赖，释放旧规则。
- 识别 CSS 转义的导入、URL、样式层及支持条件；带命名空间的样式表保留原样。
- 保留 CSSOM 原生参数转换、异常及索引行为，兼容对象、Symbol 和小数索引。
- 在无 referrer 的 `data/blob/srcdoc/about:blank` 框架中按创建来源匹配站点规则和端口。
- 在 `document.open/write` 重建页面后恢复字体注册、配置通信及动态样式处理。
- 等待 `@import` 子表加载完成后处理声明，覆盖内联 `style` 的加载时机。
- 按 BOM、HTTP charset、`@charset` 和引用环境解码跨域 CSS，保留 GBK 等编码中的中文字体与变量名；子导入继承父表编码。
- 在设置加载期间锁定表单，合并重复保存，保留保存期间的新草稿及失败后的重试。
- 未选择任何标点字符时，同步清除旧字体提示与预览字体。
- 拒绝无效通配符站点规则，修复带冒号或星号的 URL 路径解析。

## [v1.0.1](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.0.1)（2026-10-06）

- 提前向字体处理入口传递站点配置，在后台默认字体查询完成前处理网站字体声明。
- 注册标点专用字体后立即预加载，缩短首次绘制标点的等待。
- 在页面解析期间通过微任务处理新增字体声明，提前应用首屏字体替换。
- 缓存启动配置与浏览器默认字体查询，减少重复读取和样式注入。
- 根元素补充样式独立更新，快速切换设置后保持最终字体状态。

## [v1.0.0](https://github.com/Speechlessmanbilibili/chinese-western-font-replacer/releases/tag/v1.0.0)（2026-10-06）

- 为中西文共用标点指定本机字体，保留网站正文的原字体列表。
- 提供字符组选择、额外字符输入和原字形对照预览。
- 支持按站点开启、关闭及指定标点字体。
- 将常见 CSS 字体栈中的简体中文正文黑体原位替换为 SF Pro Text 与苹方 UI SC，包含鸿蒙 SC、苹方 SC、微软雅黑等；未命中时在字体列表末尾补充这一组合。
- 更新保存过的旧默认字体名单，保留用户编辑过的名单。
- 字体栈明确包含宋体、楷体、仿宋等字体时跳过末尾追加，支持字体变量与动态取值。
- 在目标中文字体前补充 SF Pro Text，保留字体栈前面已有的西文字体。
- 将系统无衬线字体及 -apple-system-body 等 Apple 文本样式原位替换为 SF Pro Text 与苹方 UI SC，保留中文宋体、楷体字体栈的系统后备项。
- 使用“共用标点字体替换”名称，保留固定扩展身份与已有设置。
- 处理动态字体声明、CSSOM 更新、样式表导入及脚本创建的 Shadow DOM。
