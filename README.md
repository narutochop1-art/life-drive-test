# 你真正追求的是什么？ MVP

移动优先20题自我探索测试。前端原生HTML/CSS/JS；后端Cloudflare Pages Functions；数据库D1。

## 部署
1. `npx wrangler login`
2. 项目已绑定现有 D1 数据库 `life-drive-db`，数据库 ID 已写入 `wrangler.toml`，不要重新创建数据库。
3. 首次部署前，在 Cloudflare D1 的 `life-drive-db` 上执行 `migrations/0001_init.sql`，创建 `events` 和 `unlocks` 表。
5. `npx wrangler pages secret put ADMIN_TOKEN`
6. 将仓库连接Cloudflare Pages；Functions必须位于项目根目录functions/
7. Pages项目 Metrics 中启用Web Analytics。

## 本地
`npx wrangler pages dev public`

## 数据
记录page_view、test_start、test_complete、share_click、referral_visit、unlock；以及来源渠道。后台：/admin.html。

## 边界
当前权重是产品MVP探索模型，不是临床或经过信效度验证的心理量表。正式上线前应做小样本预试。
