# 你真正追求的是什么？ V5

移动优先的20题人生驱动力探索测试。

## 本版核心
- 20道题、每题4个选项，共80个选择。
- 8个底层驱动力：E探索 / F自由 / A成就 / M精进 / S体验 / C连接 / R安全 / P意义。
- Top 3组合理论上有56种，项目内置56种独立结果。
- 结果分为免费层与完整层：免费层负责身份认同和核心洞察，完整层提供组合关系、代价、误解、吸引、盲区等。
- 每个56种结果都有独立的角色形象配置、图片路径和生图提示词。后期把同名 `.webp` 放进 `public/assets/characters/` 即可显示。
- 免费结果会展示角色占位卡；没有图片也不影响功能。
- 分享邀请链路：A完成测试→分享→B完成→A页面自动解锁。
- V5不依赖 `visitor_id` 数据库字段：匿名 visitor_id 放在 events.payload，避免生产D1因未执行额外ALTER迁移而导致500。
- 最后一题提交会等待 `test_complete` 写入成功后再展示结果，减少“用户立刻分享、邀请者完成记录尚未写入”的竞态。
- 所有API错误会在浏览器控制台留下日志，不再静默吞掉。

## Cloudflare生产部署
1. GitHub连接Cloudflare Pages。静态目录：`public/`；Pages Functions目录：`functions/`。
2. D1绑定变量名必须是 `DB`。
3. V5的邀请解锁不要求执行 `0002_referral_hardening.sql`；现有D1表结构即可工作。不要重新执行 `0001_init.sql`。
4. 如果Cloudflare项目本身已经绑定D1，修改Git代码后正常重新部署即可。Cloudflare官方说明Pages Functions可通过D1 binding访问D1，绑定修改后需要重新部署。

## 本地
```powershell
npx wrangler pages dev public
```
默认地址：`http://localhost:8788`。如果项目的Wrangler配置已正确绑定D1，Wrangler会在本地模拟D1；也可以用Cloudflare官方推荐的 `npx wrangler pages download config` 获取当前项目配置。

## 生产解锁验证
A完成测试 → 分享邀请链接 → B打开链接并完成20题 → A原页面等待约3秒 → 自动出现“完整结果已解锁”。

如果生产仍未解锁：Cloudflare Pages项目的部署日志/Functions日志查看 `/api/event` 是否500；Cloudflare官方支持通过Dashboard或 `npx wrangler pages deployment tail` 实时查看Functions请求、异常和console.log。

## 角色图片
组合key示例：`EFS.webp`、`AMP.webp`、`CRP.webp`。详细配置在 `public/characters.js`。

## 产品说明
这是探索性自测，不是经过临床验证的心理诊断或人格测量工具。题目权重和56种结果属于产品模型，应通过真实用户数据继续迭代。


## V6 debugging endpoint

After deployment, open `/api/health`.

Expected result:
`{"ok":true,"db":true,"tables":["events","unlocks"],"events":true,"unlocks":true}`

If `db_unavailable` appears, the Pages production D1 binding named `DB` is missing.
If `events` or `unlocks` is false, apply the base migration `migrations/0001_init.sql` to the production D1 database.
