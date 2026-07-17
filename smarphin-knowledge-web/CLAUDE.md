# CLAUDE.md

AI 知识社区用户端。先读取 `AGENTS.md` 与其中指向的共享规范。

## 项目差异

- 技术栈：Next.js 16、React 19、TypeScript、App Router。
- 这是编辑型知识门户，不是营销页、论坛或管理后台。
- 正式数据只能通过公共后端读取；迁移期允许 `filesystem` 数据源。
- 页面与布局默认使用 Server Components，仅将筛选、投稿和播放器下沉为 Client Components。
- 视觉统一使用暖白、灰棕与陶土橙 `#b85c38`，不得恢复 Smarphin 玫红色。
- 常规改动运行 `npm run build`；播放器、响应式和 Markdown 页面还需浏览器检查。
