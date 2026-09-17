# 你真正追求的是什么？ V4

移动优先的20题人生驱动力探索测试。

V4的核心升级：
- 8个底层驱动力：探索 E / 自由 F / 成就 A / 精进 M / 体验 S / 连接 C / 安全 R / 意义 P
- 每个人取Top 3，因此共有 56 种三维组合结果
- 免费结果：人格化身份 + 一句话洞察 + 三大驱动力 + 一个核心矛盾
- 完整结果：三维组合关系、三大驱动力深挖、容易牺牲什么、别人容易误解什么、容易被什么人吸引、潜在盲区、最终一句话
- 邀请朋友完成测试后，邀请者页面每3秒自动检查解锁状态并自动切换为完整报告
- 使用匿名 visitor_id + session_id 区分用户与单次测试，并阻止最简单的自邀请刷解锁
- Web Share API可用时直接调用系统分享，否则复制邀请链接
- 继续记录 page_view / test_start / test_complete / share_click / referral_visit / full_view

## 部署
1. 将本项目推送到GitHub并连接Cloudflare Pages。
2. Pages Functions位于根目录 `functions/`，静态目录为 `public/`。
3. D1绑定变量名必须为 `DB`。
4. 现有生产数据库升级：执行 `migrations/0002_referral_hardening.sql`，给events增加visitor_id。
5. 不要重新执行0001覆盖已有数据。
6. 本地：`npx wrangler pages dev public`
7. Cloudflare Pages绑定D1后重新部署，使绑定生效。

## 生产验证
A完成测试 → 复制/分享邀请链接 → B打开链接并完成20题 → A原页面等待约3秒 → 自动出现“完整结果已解锁”。

如果A没有自动解锁：先在Cloudflare Pages Functions日志查看B提交 `/api/event` 是否返回500，再检查D1的events是否出现B的 `test_complete`，以及unlocks是否写入。

## 注意
这是探索性自测，不是经过临床或心理测量学信效度验证的人格诊断工具。题目权重和56种结果文案属于产品模型，应通过真实用户数据继续迭代。


## V4.1 local D1 testing

Production D1 is configured in `wrangler.toml` with the real database UUID. For local Pages development, Wrangler will use its local D1 state.

```powershell
npx wrangler d1 migrations apply life-drive-test --local
npx wrangler pages dev public
```

Cloudflare Pages local development uses a local D1 database, not the production database.
