# Smarphin Knowledge Admin Web

在 `awesome-ai/` 目录一键启动前后端：

```bash
./start-knowledge-admin.sh
```

脚本会自动执行数据库迁移，并启动 Admin API `19090` 和 Admin Web `19091`。按 `Ctrl+C` 可一起停止。

```bash
npm install
npm run dev
```

管理端始终连接 `.env` 中 `VITE_ADMIN_API_URL` 指向的真实后端，不使用 Mock 数据。
