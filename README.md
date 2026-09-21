# 你真正追求的是什么？ V12

20题人生驱动力探索测试，移动优先。

## 已验证的核心流程
当前 Cloudflare D1 的真实表结构是：

- `events(id TEXT PRIMARY KEY, type TEXT NOT NULL, payload TEXT, created_at INTEGER NOT NULL)`
- `unlocks(id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, friend_id TEXT NOT NULL, created_at INTEGER NOT NULL)`

程序直接按这套真实结构读写。

A 完成 → 分享邀请 → B 完成 → 写入 `unlocks` → A 页面轮询自动解锁完整报告。

朋友可以在同一设备上测试；只要 B 是新的测试 session 就可以解锁。

## Character assets
56 个最终人格角色图片都在 `public/assets/characters/`，使用结果 key 命名（例如 `EFA.webp`、`FAM.webp`、`CRP.webp`）。

## V12 UI / sharing changes
- 删除结果页“复制邀请链接”独立按钮。
- 邀请区域明确提示：朋友完成 20 题后，当前页面会自动解锁；不要刷新，也不用重新测试。
- “分享我的结果”不再分享测试邀请链接。
- “分享我的结果”现在生成 1080×1350 的结果图片，包含角色名、三字母人格代码、人物图片、前三驱动力、核心分析、代表性一句话以及生产测试地址 `https://life-drive-test.pages.dev/`。
- 移动端支持将 PNG 直接交给系统分享；不支持文件分享的设备会自动下载结果图片。
- 完整报告页面同样提供结果图片分享按钮。
- 结果图片使用当前 56 个角色原图，不修改角色设计。


V13 share behavior: on iOS, invitation sharing uses a deterministic clipboard flow instead of the native share sheet; result sharing generates an in-page image preview so the user can long-press/save and then share manually.

## V14 微信内邀请分享
在微信内置浏览器中，邀请朋友按钮不再调用 iOS/微信系统分享扩展，而是把当前页面 URL 原地切换为本次邀请链接，然后引导用户使用微信右上角“⋯ → 转发/发送给朋友”。这样分享的是包含 invite 参数的当前页面，用户发送后可以回到原页面继续等待自动解锁。普通 Safari/Chrome 等环境仍使用原来的原生分享或复制回退。


V15 微信邀请分享修复：在微信内点击邀请后，将邀请 URL 通过 location.replace 真实导航加载，使 iOS 微信把带 invite 参数的地址作为初始页面 URL；使用 sessionStorage 保存原测试结果并在导航后恢复，回到页面继续轮询解锁。
