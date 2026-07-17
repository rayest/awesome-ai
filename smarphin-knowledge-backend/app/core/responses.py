from typing import Any

from pydantic import BaseModel


class ApiEnvelope(BaseModel):
    code: int = 0
    message: str = "success"
    response: Any = None


def success(data: Any = None) -> dict[str, Any]:
    return {"code": 0, "message": "success", "response": data}


def page(items: list[Any], total: int, page_number: int, page_size: int) -> dict[str, Any]:
    return success({"items": items, "total": total, "page": page_number, "page_size": page_size})
