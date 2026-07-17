from pathlib import Path

from app.core.config import get_settings


class StorageProvider:
    def __init__(self):
        self.settings = get_settings()

    def put(self, filename: str, content: bytes, content_type: str) -> str:
        if self.settings.oss_endpoint and self.settings.oss_bucket:
            return self._put_oss(filename, content, content_type)
        upload_dir = Path(self.settings.upload_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)
        (upload_dir / filename).write_bytes(content)
        return f"{self.settings.public_media_base_url.rstrip('/')}/{filename}"

    def _put_oss(self, filename: str, content: bytes, content_type: str) -> str:
        import oss2

        auth = oss2.Auth(self.settings.oss_access_key_id, self.settings.oss_access_key_secret)
        bucket = oss2.Bucket(auth, self.settings.oss_endpoint, self.settings.oss_bucket)
        bucket.put_object(filename, content, headers={"Content-Type": content_type})
        base_url = self.settings.oss_public_base_url or f"https://{self.settings.oss_bucket}.{self.settings.oss_endpoint.replace('https://', '').replace('http://', '')}"
        return f"{base_url.rstrip('/')}/{filename}"
