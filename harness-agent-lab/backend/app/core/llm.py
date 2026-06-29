from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import get_settings


class LLMClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._chat = None

    def available(self) -> bool:
        return self.settings.llm_enabled

    def chat(self):
        if self._chat is None:
            from langchain_openai import ChatOpenAI

            self._chat = ChatOpenAI(
                api_key=self.settings.deepseek_api_key,
                base_url=self.settings.deepseek_base_url,
                model=self.settings.deepseek_model,
                temperature=0.2,
            )
        return self._chat

    async def complete(self, system: str, user: str) -> str:
        if not self.available():
            return ""

        response = await self.chat().ainvoke(
            [
                SystemMessage(content=system),
                HumanMessage(content=user),
            ]
        )
        return str(response.content)

