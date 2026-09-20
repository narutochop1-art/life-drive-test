# 你真正追求的是什么？ V8

20题人生驱动力探索测试，移动优先。

## 这版解决的线上问题
当前 Cloudflare D1 的真实表结构是：

- `events(id TEXT PRIMARY KEY, type TEXT NOT NULL, payload TEXT, created_at INTEGER NOT NULL)`
- `unlocks(id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, friend_id TEXT NOT NULL, created_at INTEGER NOT NULL)`

程序现在直接按这个真实结构读写，不再假定 `events.event_type/session_id` 这些并不存在的字段。

A 完成 → 分享 `invite=A的session_id` → B 完成 → 写入 `unlocks(owner_id=A, friend_id=B)` → A `/api/unlock` 自动返回 `unlocked:true`。

朋友可以在同一设备上测试；只要 B 是新的测试 session 就可以解锁。

`/api/health` 现在会检查字段结构，而不只是检查表存在。
`/api/event` 失败时会把 D1 具体错误带到 Console，最后一题不会在写入失败时假装成功。


## Character assets
The 56 final character illustrations are included in `public/assets/characters/` as WEBP files named by result key (for example `EFA.webp`, `CRP.webp`).


## V11 UI change
- Removed the top result icon and top English label from both the partial result and full report views.
- Kept the 56 character images unchanged.
- Reduced result hero top padding to keep the result page visually compact after removing the top elements.
