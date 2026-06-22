# InkFlow Theme

> 一套面向独立博客的现代化前端主题模板，全面拥抱 Vite 工程化，开箱即用。

![Version](https://img.shields.io/badge/version-3.3.1-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-7952b3)
![Bootstrap Icons](https://img.shields.io/badge/Bootstrap%20Icons-1.13.1-7952b3)
![License](https://img.shields.io/badge/license-CC%20BY%204.0-blue)

**中文说明书** | [English README](README.en.md)

---

## 🌟 在线预览 (Live Demo)

* 🌐 **InkFlow 博客主题演示:** [https://zidony.github.io/inkflow-theme](https://zidony.github.io/inkflow-theme)
* ⚙️ **InkFlow 管理后台演示:** [https://zidony.github.io/inkflow-admin](https://zidony.github.io/inkflow-admin)

---

## ✨ 核心理念 (v3.2 生产工程化架构)

INKFLOW 以「墨水流动」为意象，追求**内容优先、克制而精致**的视觉语言。主色调采用深林绿（`#0a6640`），搭配 Playfair Display 衬线标题字体与 DM Sans 无衬线正文字体，在技术感与人文气质之间取得平衡。

从 v3.0 开始，Inkflow 全面升级为基于 Vite 的现代前端工程：
- **生产级工程化**：由 Vite 驱动，提供瞬间热更新 (HMR) 和极致优化的生产构建。
- **现代化架构**：深度拆分的组件化源码，采用 BEM 命名法结合 CSS 变量。
- **自动化交付**：一键执行 `npm run release`，自动提取出纯净的商业发布包。
- **云端部署**：内置 GitHub Actions，向 GitHub Pages 零配置一键发版。

---

## 📁 目录结构

```
inkflow-theme/
├── index.html             # 博客首页
├── post-list.html         # 文章列表页
├── post-show.html         # 文章详情页
├── category-list.html     # 分类页
├── tag-list.html          # 标签页
├── archive-list.html      # 归档页
├── album-list.html        # 相册页
├── link-list.html         # 友情链接页
├── profile.html           # 个人资料页
├── login.html             # 登录/注册页
├── src/                   # v3.0 新增：现代模块化源码目录
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css   # 样式主入口
│   │   │   ├── base/      # 设计变量、Bootstrap 覆盖与基础排版
│   │   │   ├── components/# BEM 组件化样式
│   │   │   └── pages/     # 页面级样式
│   │   └── js/
│   │       ├── inkflow.js # 现代 ES Module 脚本入口
│   │       ├── core/      # 全局基础能力
│   │       ├── components/# 可复用组件行为
│   │       └── pages/     # 页面级行为
│   └── partials/          # head/navbar/footer/search/scripts 等公共片段
├── dist/                  # v3.0 新增：生产构建输出目录 (部署用)
└── vite.config.mjs        # Vite 工程化配置
```

---

## 🛠 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| [Vite](https://vitejs.dev/) | 8.0.x | 底层构建基座 |
| [Bootstrap](https://getbootstrap.com/) | 5.3.8 | 响应式栅格、组件基础 |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | 1.13.1 | 全站图标 |
| [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | Google Fonts | 标题字体 |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | Google Fonts | 正文字体 |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Google Fonts | 代码字体 |

---

## 🎨 设计系统

### CSS 变量（Design Tokens）

从 v3.0 起，所有主题配置集中于 `src/assets/css/base/variables.css`，大幅简化了维护成本：

```css
/* 主色 */
--ink-primary:     #0a6640   /* 深林绿（亮色模式）*/
--ink-accent:      #00c98d   /* 荧光绿（高亮/按钮）*/

/* 排版 */
--font-display:    'Playfair Display', serif
--font-body:       'DM Sans', sans-serif
--font-mono:       'JetBrains Mono', monospace

/* 圆角 */
--radius-sm:  6px
--radius-md:  12px
--radius-lg:  20px
--radius-xl:  32px
```

### 明暗双主题

通过 `<html data-bs-theme="light|dark">` 一键切换，所有颜色变量自动适配。导航栏右侧的月亮图标按钮由 `initTheme()` 驱动，主题偏好持久化存储于 `localStorage`。

---

## 📄 页面清单与核心亮点

### index.html — 博客首页

全站门面页，完整展示博客的内容矩阵与品牌形象：
- **全屏 Hero 区** — 渐变背景 + 打字机效果标语 + 文章数量/阅读量统计徽章，下方滚动指示器引导用户深入
- **分类卡片区** — 6 张大图渐变分类卡，悬停时浮起并展示文章数，点击跳转对应分类
- **最新文章** — 卡片 + 列表双视图可切换，每张卡片含封面占位色块、分类标签、阅读时长、作者头像
- **精选引言区** — 全宽深色卡片，展示博主座右铭或精选文字
- **深度阅读侧边栏** — 热门文章排行榜（带序号）+ 订阅周刊 Newsletter 表单 + 热门标签云
- **阅读进度条** — 滚动时顶部细线实时显示页面阅读进度
- **全站搜索浮层** — 键盘快捷键或点击搜索按钮触发，支持热门搜索词快速填充

### post-list.html — 文章列表页

内容发现与浏览的核心页面，交互功能最丰富：
- **筛选工具栏** — 实时关键词搜索输入框 + 分类 Tab 快速过滤 + 排序下拉（最新/最热/最长）
- **卡片/列表视图切换** — 图标按钮一键在网格卡片与紧凑列表间切换，状态实时保存
- **文章卡片** — 封面色块 + 分类角标 + 标题 + 两行摘要 + 元信息（作者头像/日期/阅读时长/阅读量）
- **右侧粘性侧边栏** — 热门文章列表（带阅读量）+ 热门标签 + 归档速览年份跳转
- **分页导航** — 带页码 + 上下翻页的标准分页组件

### post-show.html — 文章详情页

整套主题功能最完整的页面：
- **文章 Hero 封面区** — 全宽渐变背景 + 面包屑导航 + 分类标签 + 标题 + 元信息（作者/日期/阅读时长/阅读量）+ 标签列表
- **左侧浮动操作栏** — 点赞（带计数）/ 书签 / 评论锚点 / 搜索，随页面滚动吸附侧边
- **右侧粘性目录（TOC）** — 自动高亮当前阅读章节，点击平滑滚动定位
- **正文防溢出保护** — 超长 URL 自动换行、图片/视频/iframe 宽度限制、宽表格横向滚动、代码块横向滚动
- **代码块** — 深色主题 + 语言标签 + 一键复制按钮
- **Callout 提示框** — 信息（蓝）/ 警告（黄）/ 技巧（绿）三种样式
- **Reaction Bar** — 文章末尾点赞/收藏互动区 + 社交分享按钮行
- **作者卡片** — 头像 + 简介 + 社交按钮
- **上下篇导航** — 两列布局展示前后文章标题与封面色
- **相关文章** — 三列关联文章推荐卡片
- **评论区** — 发表评论表单 + 评论列表（含作者回复特殊标记徽章）

### category-list.html — 分类页

- **分类 Hero 卡** — 每个分类一张大图渐变卡，展示名称、描述、文章数，悬停高亮
- **实时搜索** — 输入框即时过滤分类卡片
- **标准分类条目** — 图标 + 名称 + 文章数 + 最新文章标题的紧凑列表布局

### tag-list.html — 标签页

- **统计横幅** — 标签总数、文章总数、本月新增的三项数字统计
- **彩色词云** — 24 个标签以不同颜色与字号动态渲染，字号与热度正相关
- **三种排序** — 按热度（文章数）/ 按字母 / 按最近使用切换，动画过渡
- **实时搜索过滤** — 输入即时筛选词云中的标签
- **标签分组列表** — 按技术方向分组，每组展示标签与文章数

### archive-list.html — 归档页

- **活跃度热力图** — 类 GitHub Contributions 风格，按周/天展示发文频率，鼠标悬停显示具体日期与文章数
- **年份切换** — 顶部 Tab 按钮切换不同年份的热力图数据
- **时间线** — 按月份分组的文章时间线，每条目含日期、分类标签、阅读时长

### album-list.html — 相册页

- **大图 Hero 相册卡** — 首屏展示精选相册封面，渐变遮罩 + 标题 + 照片数量
- **分类筛选** — Tab 按钮按主题（旅行/技术/生活/城市）过滤相册
- **照片瀑布流** — 不等高 Masonry 布局展示照片缩略图
- **Lightbox 全屏预览** — 点击任意照片进入全屏灯箱，支持左右键导航、下载、分享，ESC 关闭

### link-list.html — 友情链接页

- **精选推荐卡** — 顶部展示 3 张精选友链大卡，底部含彩色进度条动画（影响力/活跃度指标）
- **分类分组展示** — 链接按「技术博客」「设计灵感」「实用工具」等分组，每组网格布局
- **申请友链表单** — 可展开/收起的申请卡，含站名、URL、介绍、Logo 输入项
- **本站信息一键复制** — 展示本站信息卡片，含一键复制所有字段的便捷按钮
- **侧边栏统计** — 友链总数、今日新增、待审核的数字看板

### profile.html — 个人资料页

- **Hero 个人卡** — 渐变背景 + 可更换头像（点击 + 编辑图标）+ 姓名/简介/社交链接/发布/阅读/点赞数据概览
- **连续写作条纹** — 小卡片展示连续写作天数与最近 21 天活跃条形图
- **左侧锚点导航** — 粘性侧边栏，点击跳转基本信息/账号安全/通知偏好/危险操作各区块
- **基本信息编辑** — 显示/编辑双态切换，含头像、昵称、邮箱（已验证标识）、简介、个人网站
- **账号安全** — 密码修改 + 两步验证开关（含状态标签同步切换）
- **通知偏好** — 新文章发布 / 评论回复 / 周刊推送三项开关，复选框驱动颜色变化
- **危险操作区** — 红色警示区域，注销账号按钮需二次确认

### login.html — 登录/注册页

- **左右分栏布局** — 左侧品牌宣传面板（标语 + 功能清单）+ 右侧表单区，移动端自动退化为单列
- **登录 / 注册 Tab** — 自定义 Tab 切换，动画流畅；「立即注册」/「立即登录」交叉链接同步切换
- **第三方登录** — Google OAuth + GitHub OAuth 社交登录按钮
- **密码显示切换** — 输入框右侧眼睛图标切换明文/密文
- **记住我 & 忘记密码** — 常规登录辅助选项
- **主题切换** — 右上角独立的明暗切换按钮，不依赖主导航

---

## 🚀 快速开始 (Vite 工程化)

从 v3.0 起全面拥抱现代工程化。请使用 Vite 启动开发服务器：

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务器 (支持热更新)
npm run dev
```

### 生产构建与全自动发版

```bash
# 构建优化过的生产级代码 (极致压缩的 CSS/JS 输出到 dist/)
npm run build

# 静态质量扫描：阻断 inline style/event、重复 class、乱码、自定义 window 全局等回归
npm run quality

# 发版前完整检查：ESLint + 静态质量扫描 + 生产构建
npm run check

# 一键自动化发版 (提取 dist 生成无源码污染的 zip 压缩包)
npm run release
```

### 部署到静态平台

因为项目中配置了 `vite.config.mjs` 的 `base: './'`，您可以直接将生成的 `dist/` 目录上传至任意静态平台（GitHub Pages / Vercel / Netlify）。
**强烈建议：** 我们已配置好 `.github/workflows/ci.yml`、`.github/workflows/deploy.yml` 与 `.github/workflows/release.yml`。PR / push 会自动运行 `npm run check` 与 `npm audit`，部署和发版流程也会先通过同一套质量门禁。

### 生产集成说明

InkFlow Theme 是静态前端主题模板，登录、评论、订阅、点赞、收藏、个人资料等交互默认为演示逻辑。正式商用前请阅读 [生产集成说明](docs/integration.md)，并接入真实 CMS、认证系统、后端 API 与安全防护。

---

## 🔧 JS 模块说明

前端脚本入口为 `src/assets/js/inkflow.js`，并按职责拆分为 `core`、`components`、`pages` 三层：

| 目录 | 说明 |
|------|------|
| `core/` | 主题切换、滚动动画、通用工具、键盘快捷键、质量更高的复制兜底等基础能力 |
| `components/` | 导航栏、搜索弹层、登录状态等跨页面组件 |
| `pages/` | 归档、相册、文章详情、个人资料、登录、标签云、友链等页面级交互 |

---

## 📋 版本历史

| 版本 | 主要内容 |
|------|---------|
| **v3.2.10** | **动态结果播报可访问性补丁版**：为标签搜索增加 `role="status"` / `aria-live="polite"` 结果播报和无结果可见提示；为相册筛选与友链筛选补充结果数量播报；新增对应质量门禁，确保标签搜索、相册筛选、友链筛选都必须提供 polite 状态反馈；扩展 Playwright smoke 覆盖动态结果变化。 |
| **v3.2.9** | **复制反馈、弹窗焦点与授权交付补丁版**：为友链页“复制本站信息”按钮增加 `aria-busy`、禁用态、成功/失败按钮反馈与恢复逻辑，并新增质量门禁和 smoke 覆盖；将账号注销确认弹窗的焦点陷阱绑定到 modal 捕获阶段，稳定与 Bootstrap focus trap 的协作；补充 `package.json` / lockfile 的 CC BY 4.0 license 元数据；新增独立 `LICENSE` 文件，并确保 release zip 自动包含授权文件。 |
| **v3.2.8** | **交互反馈与语义硬化补丁版**：校验并清理无效的本地演示登录状态；为登录提交按钮暴露 `aria-busy` 忙碌状态；为文章目录当前项同步 `aria-current="location"`；修复文章页顶部浮动复制按钮与正文分享复制按钮反馈串台问题，并稳定连续点击后的恢复状态；将通知偏好保存、找回密码、注册等演示占位入口统一到共享 `data-demo-action` 反馈机制；扩展质量门禁与 Playwright smoke 覆盖。 |
| **v3.2.7** | **交互状态、动态偏好与弹窗稳定性补丁版**：隐藏归档热力图与图例装饰单元；为文章视图切换、相册、友链、标签、归档年份等分段控件同步 `aria-pressed` 状态并增加质量门禁；为登录/注册 Tab 增加 roving `tabindex`；强化账号注销 modal 的关闭路径与 fallback 兜底；尊重 `prefers-reduced-motion`，为全局 CSS 动效、滚动 reveal、计数动画与首页视差提供减少动态效果降级；登录页改为复用共享 scripts partial；扩展 Playwright smoke 覆盖。 |
| **v3.2.6** | **布局与细粒度可访问性补丁版**：移除模板 BOM 与首页多余搜索片段，修复页面顶部白边和首页页脚后空白；将作者社交图标改为可访问链接；为相册、标签云与个人资料动态装饰元素补齐隐藏语义；为搜索、邮箱、URL、电话等表单字段补充更准确的输入类型和 autocomplete 提示；扩展对应质量门禁与 smoke 覆盖。 |
| **v3.2.5** | **表单、导航与页面控件可访问性补丁版**：为分页、友链申请表单、移动端导航、登录表单与个人资料编辑补齐状态反馈、标签关联和 ARIA 同步；修复个人资料编辑字段不可编辑问题；为标签页新增最近排序逻辑；扩展质量门禁与 Playwright smoke 覆盖，确保这些交互持续可验证。 |
| **v3.2.4** | **Overlay 与演示交互可访问性补丁版**：为隐藏态搜索层与相册 lightbox 增加 `inert`，防止键盘误入不可见内容；为搜索层、lightbox 与账号注销 modal 补齐焦点循环和关闭后的焦点恢复；为相册 lightbox、评论操作等演示按钮补充统一反馈；完善文章书签按钮的 `aria-pressed` 状态、图标和标签同步；扩展相关质量门禁与 smoke 覆盖。 |
| **v3.2.3** | **可访问性交互补丁版**：完善用户菜单按钮标签与 Escape 关闭；为 toast 增加 live region 语义；用主题化确认弹窗替换原生 `confirm()` 并提供无 Bootstrap JS 降级；将搜索建议与交互型标签胶囊改为原生 button 控件；新增阻塞弹窗、非语义搜索提示与标签胶囊质量门禁；扩展 Playwright smoke 覆盖。 |
| **v3.2.2** | **可访问性与生产边界增强版**：补齐交互控件 ARIA 状态同步；将筛选、相册、头像等自定义交互改为原生按钮语义；强化头像上传校验；为演示按钮提供统一集成反馈；新增本地锚点、动态 selector、HTML 注入、随机性等质量门禁；稳定 Playwright smoke 测试。 |
| **v3.2.1** | **生产质量补丁版**：修复登录、搜索快捷键等模块作用域运行时错误；统一公共 partial 复用；迁移页面级内联事件到模块化 JS；修复友链页中文乱码；升级 Vite 至 8.0.16 并清零 npm audit；开启生产压缩并新增 `npm run check` 发版前质量检查。 |
| **v3.2.0** | **零依赖架构升级与组件化大满贯**：彻底拔除 Python 打包依赖，自研 Node.js 原生底层 ZIP 构建脚本；完成全站 `ink-input` 与 `ink-btn` 表单体系的终极组件化与样式大一统；优化自动化发布流水线。 |
| **v3.1.0** | **深度分层与单文件构建策略**：采用标准 ITCSS 架构深度重组所有 CSS 文件与目录；模块化拆分 JS 职责（`core`, `components`, `pages`）；改写 Vite 配置与内部动态导入，实现全量前端资产打包为唯一的 `inkflow.js` 与 `inkflow.css`（零配置插件式集成）；关闭生产环境构建压缩并引入 Prettier 自动格式化机制。 |
| **v3.0.0** | **跨越式前端工程化重构**：引入 Vite 基座与开发 HMR 热更新；将 120KB 单体 CSS 深度模块化拆分为 `src/css` 多个组件；重写入口与构建流；新增基于 Python 的自动发版脚本与 GitHub Actions 全自动部署流水线。全面走向国际标准化商用主题架构。 |
| **v2.5** | 极致性能与架构优化：全面消除 FOIT（全站 HTML 注入 `preconnect`），建立全局 Z-Index 变量体系消灭 Magic Number，为动画组件配置 GPU 硬件加速 (`translateZ(0)`)，并统一 `profile-card` HTML 树结构实现组件归一化。 |
| **v2.4** | 深度 CSS 架构重构：引入 Logical Grouping 规范对全站 2400 行 CSS 进行格式化压缩，完全清理死代码 (Dead Code)，中文化注释全部重构为符合国际前端标准的专业英文注释，重构动态标签云融合 CSS 变量。 |
| **v2.3** | 重构全局 `.u-tint-*` 通用双轨色彩组件系统，彻底去除全站所有 HTML 中硬编码的内联背景渐变色与样式，实现 100% 动态色彩上下文解耦 |
| **v2.2** | 设计系统 WCAG 2.1 AA 对齐，重构 TOC 滚动高亮为 IntersectionObserver 观察者模式，优化主页 Parallax GPU 硬件加速，100% 收归 HTML 页内脚本，去除 document.write() 并完善全站 A11y 与 JSON-LD SEO 语义数据 |
| **v2.1** | 统一头像组件系统（.ink-avatar），11 个旧类合并为基础类 + 16 个修饰符，删除全部头像内联渐变色，友链头像统一截取首字符 |
| **v2.0** | 全局内联样式组件化提取（13 个新 CSS 组件类）、FOIT 闪烁修复、index.html 长文精选结构修复、7 个页面 HTML 清理 |
| **v1.9** | 静态文件重命名（blog-theme→index、post-detail→post-show）、assets 目录结构、Bootstrap 升级至 5.3.8、article-body 防溢出保护 |
| **v1.8** | 修复登录 Tab 切换、social-btn 居中问题（错误合并回滚）、文章正文防溢出 CSS |
| **v1.7** | 修复 navbar-collapse PC 宽度背景残留 Bug、mobile 头像下拉可点击、合并5组重复 CSS 类 |
| **v1.6** | 恢复搜索按钮、TFA toggle 改为 checkbox 实现、消除双 class 属性 |
| **v1.5** | 导航栏/页脚全站标准化、profile 页 inline style 大规模替换为 CSS class |
| **v1.4** | CSS 去重（11处重复选择器）、JS viewToggle/toggleApplyForm bug 修复、彩色标签云恢复 |
| **v1.3** | page-specific JS/CSS 抽离、profile 个人资料页新增、CSS Design Token 规范化 |
| **v1.2** | 全套 10 页面重构、外部 inkflow.css/js、Bootstrap 变量覆盖、class 驱动 Toast |
| **v1.1** | 功能补完与小修 |
| **v1.0** | 初始版本，单文件原型实现 |

---

## 📄 许可证

本主题基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh) 协议发布，允许自由使用、修改与分发，需保留署名。

---

*INKFLOW Theme · 基于 Vite & Bootstrap 5.3.8 构建*
