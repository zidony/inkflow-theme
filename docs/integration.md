# 生产集成说明

InkFlow Theme 是一款静态前端主题模板。`dist/` 产物可以直接部署到静态托管平台，但模板中的登录、评论、订阅、点赞、收藏、资料设置等交互默认用于展示页面结构和前端体验，不等同于完整后端业务系统。

## 可直接静态部署的部分

- 首页、文章页、归档页、分类页、标签页、相册页、友链页、登录页、个人中心页等页面结构与响应式样式。
- 基于 Bootstrap 5.3.8 的布局、组件样式、暗色模式、导航、搜索弹层、相册灯箱、代码复制、文章目录等前端交互。
- Vite 构建后的相对路径产物，适合 GitHub Pages、Vercel、Netlify、OSS/CDN 等静态环境。

## 资源交付模式（自托管 / CDN）

主题默认**自托管** Bootstrap、Bootstrap Icons 与三款 Web 字体（DM Sans / Playfair Display / JetBrains Mono），构建时由 Vite 从 `node_modules` 打包进本地产物，**不向 jsDelivr 或 Google Fonts 发起任何外部请求**。这对中国大陆访客（Google Fonts 常不可达）和 GDPR 合规（无第三方字体调用）尤为重要。

- 默认自托管构建：`npm run build`
- 改用 CDN 交付：`INKFLOW_CDN=1 npm run build`（Windows PowerShell：`$env:INKFLOW_CDN=1; npm run build`）

两种模式产物等价可用，仅资源来源不同。CDN 模式下 CSS 体积更小，但首屏依赖外部网络；自托管模式无外部依赖、首屏更稳定。字体仅打包实际使用的字重与 latin / latin-ext 子集，CJK 字形回退到系统字体（PingFang SC / 微软雅黑）。

## 站点 SEO 配置

`vite.config.mjs` 顶部的 `site` 对象是 canonical、`og:url`、`og:image`、JSON-LD 结构化数据与 `sitemap.xml` / `robots.txt` 的**唯一来源**：

```js
const site = {
  url: 'https://inkflow.example.com/', // ← 上线前必须改为真实生产域名（结尾带 /）
  name: 'INKFLOW',
  locale: 'zh_CN',
  twitter: '@inkflow',
  ogImage: 'og-cover.png',
};
```

品牌图标（`favicon.svg` / `favicon.ico` / `apple-touch-icon.png` / `og-cover.png`）由 `npm run icons` 从品牌色生成，位于 `src/public/`；可直接替换为自有品牌素材。

## 需要生产接入的部分

正式商用时，请将以下演示逻辑替换为真实业务能力：

- 登录、注册、找回密码、第三方登录：接入服务端认证、会话、JWT/OAuth、权限校验和退出流程。
- 评论、回复、点赞、收藏、文章互动：接入后端 API，并加入鉴权、审核、反垃圾、限流和异常处理。
- 订阅、联系、友链申请等表单：接入邮件服务或业务 API，并加入 CSRF 防护、验证码或频率限制。
- 搜索：若站点内容由 CMS 或静态生成器维护，应生成真实搜索索引，或接入服务端/第三方搜索服务。
- 用户资料、安全设置、通知设置：接入账户系统、敏感操作二次验证和服务端持久化。
- 文章、分类、标签、归档、相册数据：接入 CMS、静态站点生成器或后端数据源，避免长期手动维护重复 HTML。

## 认证演示边界

当前前端认证状态使用 `localStorage` 保存 `inkflow-user`，仅用于模板演示导航栏登录态和个人中心入口。它不能提供真实安全性，也不能替代服务端认证。生产环境中请移除或改造该逻辑，让登录态由后端会话、HTTP-only Cookie、JWT 或 OAuth 流程驱动。

## 推荐集成方式

1. 使用 CMS 或静态站点生成器输出文章、分类、标签、归档和相册页面。
2. 为评论、订阅、友链申请、用户资料等动作提供稳定 API，并约定统一的错误响应格式。
3. 将表单提交封装为可复用 API adapter，保持 UI 组件与具体后端实现解耦。
4. 在后端处理鉴权、权限、CSRF、限流、日志、审计和敏感数据校验。
5. 保留 `npm run check`、`npm run smoke`、`npm audit --audit-level=moderate` 作为上线前质量门禁。

## 上线前检查

```bash
npm run check
npm run smoke
npm audit --audit-level=moderate
npm run release
```

