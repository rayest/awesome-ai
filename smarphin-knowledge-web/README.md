# Smarphin Knowledge Web（知序）

编辑驱动的 AI 知识门户，基于 Next.js 16、React 19 和 App Router。

## 功能

- 文章列表、分类筛选、详情与相关阅读
- 专题目录和编号阅读路径
- 全文搜索
- 播客、播放器、文章 RSS 与 Podcast RSS
- 匿名投稿、社群入口、Sitemap 和基础站点页面
- 统一 MySQL 数据源，通过公共 API 实时读取已发布内容

## 本地启动

```bash
npm install
cp .env.example .env.local
npm run dev
```

默认访问 `http://localhost:19092`。端口通过 `.env` 的 `PORT=19092` 固定配置。生产构建使用：

```bash
npm run build
npm start
```

也可以在 `awesome-ai` 目录执行 `./start-knowledge-client.sh`，一键启动公共 API `19093` 和客户端 Web `19092`。

## 数据源

客户端只读取 `KNOWLEDGE_API_URL` 指向的公共后端。公共后端与管理后端必须连接同一个 MySQL 数据库；API 不可用时显示错误状态，不回退本地 Markdown。

投稿由浏览器请求 `NEXT_PUBLIC_KNOWLEDGE_API_URL`。生产环境需要同步配置公共后端 CORS。

## 内容和运营配置

- 本地文章：`docs/<category>/*.md`
- 本地图片：`public/content/<category>/`
- 微信、飞书和 Telegram 社群入口通过 `.env.example` 中对应变量配置。
- 播客需要在管理端发布真实 `audio_url`，发布后播放器与 Podcast RSS 自动生效。

## 验证

```bash
npm run lint
npm run build
```
