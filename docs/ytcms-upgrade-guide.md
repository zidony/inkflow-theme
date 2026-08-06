# YTCMS standard 主题升级适配说明（inkflow-theme v3.3.2 架构升级）

> 适用范围：YTCMS themes/standard（不含待淘汰的 themes/default）。
> 关联仓库：inkflow-theme（v3.3.2，未升版本号）、YTCMS（v1.2.0，未升版本号）。
> 提交记录见 YTCMS 仓库 G7a–G7e 五组提交，可逐组回滚。

## 1. 升级动机

inkflow-theme 完成 JS 架构重构（core/components/pages 分层 + 按页拆包 + Inkflow API +
data-* 自动初始化 + CustomEvent 接管机制 + CSP 兼容）。YTCMS 同步升级以获得：

- **P0-1 修复**：点赞静默失效（主题 demo 先切换 → 适配器早退 → 接口永不调用）
- **P0-2 修复**：相册灯箱不可见（`show` 类 vs `.active` 类契约不一致）
- **性能**：主包 62KB → 23KB，页面 chunk 按需加载
- **CSP 就绪**：页面零内联可执行脚本（`inkflow-theme-check.js` 外置）

## 2. 文件变更清单

### 新增（public/assets/themes/standard/js/）
| 文件 | 说明 |
|---|---|
| `inkflow-theme-check.js` | head 外部经典脚本，防 FOUC（CSP 安全） |
| `inkflow-vendor.js` `events.js` `utils.js` | 共享 chunk，模块图自动加载 |
| `album.js` `archive.js` `links.js` `login.js` `parallax.js` `post.js` `profile.js` | 按页 chunk，动态加载 |

### 更新
| 文件 | 变化 |
|---|---|
| `js/inkflow.js` | 新入口（23KB，原 62KB 单包） |
| `js/rolldown-runtime.js` | 新运行时 |
| `css/inkflow.css` | 灯箱图片约束、新组件样式 |
| `layout/main.php` | theme-check 外置；资源引用加 `?v=3.3.2`；移除 `#liveToast` DOM |
| `account_login.php` | 同上（theme-check + 版本串） |
| `post_show.php` `post_channel.php` `account_profile.php` | 脚本引用加 `?v=3.3.2` |
| `file_list.php` | 照片卡改 `<a data-lightbox-url>`（去 d-none）；灯箱 DOM 对齐 |
| `file_channel.php` | 新增主题 `#lightbox` DOM；脚本引用移除 |
| `tag_list.php` | `#tagCloudInner` 加 `data-tag-cloud-source="yt-tagcloud-data"` |
| `js/post-show.js` | 点赞改为监听 `inkflow:like-toggle` + preventDefault 接管 |
| `js/account_profile.js` | 头像改为监听 `inkflow:avatar-change` + preventDefault 接管 |
| `js/inkflow-layout.js` | 删除 `window.ink_toast` 重定义（统一主题 toast） |

### 删除
| 文件 | 原因 |
|---|---|
| `js/file_list.js` | 灯箱由主题组件接管 |
| `js/file_channel.js` | 同上 |
| `js/tag_list.js` | 标签云由主题组件接管 |

### 核心修复（超出 themes/standard 范围，见 G7e）
`app/Libraries/Template/Parsers/DirectiveParser.php`：`{yt:flashdata}` 编译产物含字面
`\"` 导致所有含该标签的页面 ParseError 500。此为 v1.2.0 既有 bug（原版模板可复现）。

## 3. 关键集成契约

1. **唯一入口**：页面只引用 `js/inkflow.js`（`<script type="module">`），按页 chunk 由
   模块图自动加载，无需逐页 script 标签。
2. **head 外部脚本**：`inkflow-theme-check.js` 必须置于 `<head>`（同步执行防 FOUC）。
3. **事件接管**（适配器写法）：

```js
window.Inkflow.events.on('inkflow:like-toggle', function (e) {
  e.preventDefault();                 // 接管，阻止主题 demo 切换
  var button = e.detail.button;       // { button, countEl, liked }
  // …调用真实接口，成功后自行更新 UI
});
```

| 事件 | detail | 用途 |
|---|---|---|
| `inkflow:like-toggle` | `{ button, countEl, liked }` | 点赞（post-show.js 已接管） |
| `inkflow:avatar-change` | `{ file, input, preview }` | 头像上传（account_profile.js 已接管） |
| `inkflow:auth-change` | `{ user }` | 登录态变化（信息性） |
| `inkflow:toast` | `{ message, type }` | toast（信息性） |

4. **JSON 数据注入**：标签云数据经 `application/json` script 传递（`yt-tagcloud-data`），
   主题组件经 `data-tag-cloud-source` 读取。
5. **缓存失效**：资源引用统一带 `?v=3.3.2` 查询串（`yt:asset_theme` 本身不带版本）。
   下次发版时同步更新该串。

## 4. 回滚方案

各组独立提交，`git revert <commit>` 即可回滚：

| 组 | 提交 | 内容 |
|---|---|---|
| G7a | `3db7447` | 产物替换 + 引用/版本串 |
| G7b | `971dae1` | 点赞接管 |
| G7c | `f11c8e4` | 灯箱统一 |
| G7d | `acbd7af` | 标签云/头像/toast 对齐 |
| G7e | `04af12b` | 核心 flashdata 编译修复 |

回滚 G7a 时需一并恢复旧 `inkflow.js`/`rolldown-runtime.js`（releases/
inkflow-theme-v3.3.2.zip 为回滚锚点）。

## 5. 验证清单（本地 ytcms.test）

- 首页 / 各频道页无 console error（生产环境需确认 DebugBar 关闭）
- 标签页：`.tag-cloud-item` 渲染 ≥1，搜索过滤生效
- 相册页：照片可见（无 d-none），点击开灯箱（真实图 + caption），`.lb-close`/背景/Esc 关闭
- 文章页：点赞点击后主题侧无 `.active` 翻转（接口接管生效；未登录时返回提示 toast）
- 登录/注册页：theme-check 外置脚本生效，无 FOUC
- 头像上传（需登录）：成功后头像即时更新 + 主题 toast
- 生产环境：`CI_ENVIRONMENT=production` 下页面零内联脚本（DebugBar 不加载）
