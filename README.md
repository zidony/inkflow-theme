# INKFLOW Theme

> 一套面向独立博客的现代化前端主题模板，基于 Bootstrap 5.3.8 构建，无需构建工具，开箱即用。

![Version](https://img.shields.io/badge/version-1.9-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-7952b3)
![Bootstrap Icons](https://img.shields.io/badge/Bootstrap%20Icons-1.13.1-7952b3)
![License](https://img.shields.io/badge/license-CC%20BY%204.0-blue)

---

## 🚀 在线预览 (Live Demo)

* 🌐 **InkFlow 博客主题演示:** [https://zidony.github.io/inkflow-theme](https://zidony.github.io/inkflow-theme)

* ⚙️ **InkFlow 管理后台演示:** [https://zidony.github.io/inkflow-admin](https://zidony.github.io/inkflow-admin) 

---

## ✨ 设计理念

INKFLOW 以「墨水流动」为意象，追求**内容优先、克制而精致**的视觉语言。主色调采用深林绿（`#0a6640`），搭配 Playfair Display 衬线标题字体与 DM Sans 无衬线正文字体，在技术感与人文气质之间取得平衡。

全套主题采用**单一 CSS + 单一 JS** 的架构，所有页面共享 `assets/css/inkflow.css` 与 `assets/js/inkflow.js`，维护成本极低，适合直接托管于 GitHub Pages / Vercel / Netlify 等静态平台。

---

## 📁 目录结构

```
inkflow-theme/
├── index.html            # 博客首页
├── post-list.html         # 文章列表页
├── post-show.html         # 文章详情页
├── category-list.html     # 分类页
├── tag-list.html          # 标签页
├── archive-list.html      # 归档页
├── album-list.html        # 相册页
├── link-list.html         # 友情链接页
├── profile.html           # 个人资料页
├── login.html             # 登录/注册页
├── assets/
│   ├── css/
│   │   └── inkflow.css    # 主题全局样式（~3100 行）
│   └── js/
│       └── inkflow.js     # 主题全局脚本（~800 行）
└── README.md
```

---

## 🛠 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| [Bootstrap](https://getbootstrap.com/) | 5.3.8 | 响应式栅格、组件基础 |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | 1.13.1 | 全站图标 |
| [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | Google Fonts | 标题字体 |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | Google Fonts | 正文字体 |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Google Fonts | 代码字体 |

所有资源均通过 CDN 引入，无需本地安装。

---

## 🎨 设计系统

### CSS 变量（Design Tokens）

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

---

### post-list.html — 文章列表页

内容发现与浏览的核心页面，交互功能最丰富：

- **筛选工具栏** — 实时关键词搜索输入框 + 分类 Tab 快速过滤 + 排序下拉（最新/最热/最长）
- **卡片/列表视图切换** — 图标按钮一键在网格卡片与紧凑列表间切换，状态实时保存
- **文章卡片** — 封面色块 + 分类角标 + 标题 + 两行摘要 + 元信息（作者头像/日期/阅读时长/阅读量）
- **右侧粘性侧边栏** — 热门文章列表（带阅读量）+ 热门标签 + 归档速览年份跳转
- **分页导航** — 带页码 + 上下翻页的标准分页组件

---

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

---

### category-list.html — 分类页

- **分类 Hero 卡** — 每个分类一张大图渐变卡，展示名称、描述、文章数，悬停高亮
- **实时搜索** — 输入框即时过滤分类卡片
- **标准分类条目** — 图标 + 名称 + 文章数 + 最新文章标题的紧凑列表布局

---

### tag-list.html — 标签页

- **统计横幅** — 标签总数、文章总数、本月新增的三项数字统计
- **彩色词云** — 24 个标签以不同颜色与字号动态渲染，字号与热度正相关
- **三种排序** — 按热度（文章数）/ 按字母 / 按最近使用切换，动画过渡
- **实时搜索过滤** — 输入即时筛选词云中的标签
- **标签分组列表** — 按技术方向分组，每组展示标签与文章数

---

### archive-list.html — 归档页

- **活跃度热力图** — 类 GitHub Contributions 风格，按周/天展示发文频率，鼠标悬停显示具体日期与文章数
- **年份切换** — 顶部 Tab 按钮切换不同年份的热力图数据
- **时间线** — 按月份分组的文章时间线，每条目含日期、分类标签、阅读时长

---

### album-list.html — 相册页

- **大图 Hero 相册卡** — 首屏展示精选相册封面，渐变遮罩 + 标题 + 照片数量
- **分类筛选** — Tab 按钮按主题（旅行/技术/生活/城市）过滤相册
- **照片瀑布流** — 不等高 Masonry 布局展示照片缩略图
- **Lightbox 全屏预览** — 点击任意照片进入全屏灯箱，支持左右键导航、下载、分享，ESC 关闭

---

### link-list.html — 友情链接页

- **精选推荐卡** — 顶部展示 3 张精选友链大卡，底部含彩色进度条动画（影响力/活跃度指标）
- **分类分组展示** — 链接按「技术博客」「设计灵感」「实用工具」等分组，每组网格布局
- **申请友链表单** — 可展开/收起的申请卡，含站名、URL、介绍、Logo 输入项
- **本站信息一键复制** — 展示本站信息卡片，含一键复制所有字段的便捷按钮
- **侧边栏统计** — 友链总数、今日新增、待审核的数字看板

---

### profile.html — 个人资料页

- **Hero 个人卡** — 渐变背景 + 可更换头像（点击 + 编辑图标）+ 姓名/简介/社交链接/发布/阅读/点赞数据概览
- **连续写作条纹** — 小卡片展示连续写作天数与最近 21 天活跃条形图
- **左侧锚点导航** — 粘性侧边栏，点击跳转基本信息/账号安全/通知偏好/危险操作各区块
- **基本信息编辑** — 显示/编辑双态切换，含头像、昵称、邮箱（已验证标识）、简介、个人网站
- **账号安全** — 密码修改 + 两步验证开关（含状态标签同步切换）
- **通知偏好** — 新文章发布 / 评论回复 / 周刊推送三项开关，复选框驱动颜色变化
- **危险操作区** — 红色警示区域，注销账号按钮需二次确认

---

### login.html — 登录/注册页

- **左右分栏布局** — 左侧品牌宣传面板（标语 + 功能清单）+ 右侧表单区，移动端自动退化为单列
- **登录 / 注册 Tab** — 自定义 Tab 切换，动画流畅；「立即注册」/「立即登录」交叉链接同步切换
- **第三方登录** — Google OAuth + GitHub OAuth 社交登录按钮
- **密码显示切换** — 输入框右侧眼睛图标切换明文/密文
- **记住我 & 忘记密码** — 常规登录辅助选项
- **主题切换** — 右上角独立的明暗切换按钮，不依赖主导航

---

## 🚀 快速开始

### 直接使用

1. 下载或克隆本仓库
2. 用任意 HTTP 服务器（如 VS Code Live Server）打开 `index.html`
3. 本地开发无需构建，浏览器直接渲染

```bash
# 使用 Python 内置服务器
python3 -m http.server 8080

# 使用 Node.js http-server
npx http-server . -p 8080
```

### 部署到静态平台

将整个目录上传至 GitHub Pages / Vercel / Netlify 即可，无额外配置。

---

## 🔧 JS 模块说明

`inkflow.js` 按模块编号组织，主要功能如下：

| 模块 | 函数 | 说明 |
|------|------|------|
| 01 | `initNavbar()` | 滚动监听，添加 `.scrolled` 背景 |
| 02 | `initReadingProgress()` | 顶部阅读进度条 |
| 03 | `initBackToTop()` | 回到顶部按钮 |
| 04 | `inkflowAuth` | 用户登录状态管理（localStorage）|
| 05 | `initUserAuth()` | 头像下拉菜单 toggle |
| 06 | `openSearch() / closeSearch()` | 全站搜索浮层 |
| 07 | `initScrollReveal()` | IntersectionObserver 滚动入场动画 |
| 08 | `initTheme()` | 明暗主题切换 + 持久化 |
| 09 | `initViewToggle()` | 文章列表视图（卡片/列表）切换 |
| 10 | `initTOC()` | 文章目录滚动高亮 |
| 11 | `initCodeCopy()` | 代码块一键复制 |
| 12 | `initHeatmap() / setYear()` | 活跃度热力图渲染 |
| 13 | `initAuthTabs()` | 登录/注册 Tab 切换 |
| 14 | `initLoginForm()` | 登录表单提交逻辑 |
| 15 | `showToast()` | Toast 提示通知 |

---

## 📝 自定义指南

### 修改品牌色

编辑 `assets/css/inkflow.css` 顶部的 CSS 变量：

```css
:root {
  --ink-primary-rgb: 10, 102, 64;   /* 调整主色 RGB 值 */
  --ink-accent:      #00c98d;        /* 调整强调色 */
}
```

### 替换字体

修改 HTML 文件 `<head>` 中的 Google Fonts 链接，并更新 CSS 变量：

```css
--font-display: 'Your Heading Font', serif;
--font-body:    'Your Body Font', sans-serif;
```

### 添加新页面

1. 复制任意 HTML 文件作为模板
2. 更新 `<title>` 和 `<nav>` 中的 `active` 类
3. 替换页面主体内容区域

---

## 📋 版本历史

| 版本 | 主要内容 |
|------|---------|
| **v1.9** |增加 assets 目录结构、Bootstrap 升级至 5.3.8、article-body 防溢出保护 |
| v1.8 | 修复登录 Tab 切换、social-btn 居中问题（错误合并回滚）、文章正文防溢出 CSS |
| v1.7 | 修复 navbar-collapse PC 宽度背景残留 Bug、mobile 头像下拉可点击、合并5组重复 CSS 类 |
| v1.6 | 恢复搜索按钮、TFA toggle 改为 checkbox 实现、消除双 class 属性 |
| v1.5 | 导航栏/页脚全站标准化、profile 页 inline style 大规模替换为 CSS class |
| v1.4 | CSS 去重（11处重复选择器）、JS viewToggle/toggleApplyForm bug 修复、彩色标签云恢复 |
| v1.3 | page-specific JS/CSS 抽离、profile 个人资料页新增、CSS Design Token 规范化 |
| v1.2 | 全套 10 页面重构、外部 inkflow.css/js、Bootstrap 变量覆盖、class 驱动 Toast |
| v1.1 | 功能补完与小修 |
| v1.0 | 初始版本，单文件原型实现 |

---

## 📄 许可证

本主题基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh) 协议发布，允许自由使用、修改与分发，需保留署名。

---

*INKFLOW Theme v1.9 · 基于 Bootstrap 5.3.8 构建*

---

## 附言
这是 Claude.ai 的 Sonnet 4.6 免费版在2026年2至3月的生成作品，秒杀一切同期其他模型的生成能力。
