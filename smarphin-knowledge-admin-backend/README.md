# Smarphin Knowledge Admin API

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python scripts_create_admin.py
python scripts_migrate_markdown.py
uvicorn app.main:app --reload --port 8102
```

生产环境必须设置强随机 `JWT_SECRET`、MySQL 管理账号以及需要使用的 AI/OSS 凭据。当前上传 Provider 在本地写入 `UPLOAD_DIR`，部署时可替换为 OSS Provider，API 契约不变。

外部定时任务：

```bash
# 每 5 分钟
python scripts_publish_scheduled.py

# 每小时
python scripts_sync_rss.py
```
