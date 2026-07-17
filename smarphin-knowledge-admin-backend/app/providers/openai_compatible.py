import httpx

from app.core.config import get_settings


class OpenAICompatibleProvider:
    def __init__(self):
        self.settings = get_settings()

    def generate_article(self, source_text: str) -> str:
        if not self.settings.openai_api_key:
            raise RuntimeError("尚未配置 OPENAI_API_KEY")
        prompt = "请将以下来源整理为中文知识文章草稿。保留事实和来源边界，输出 Markdown，不要虚构。\n\n" + source_text
        response = httpx.post(
            f"{self.settings.openai_base_url.rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {self.settings.openai_api_key}"},
            json={"model": self.settings.openai_model, "messages": [{"role": "user", "content": prompt}]},
            timeout=90,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
