from typing import Any


def success(data: Any = None) -> dict[str, Any]:
    return {"code": 0, "message": "success", "response": data}


def page(items: list[Any], total: int, page_number: int, page_size: int) -> dict[str, Any]:
    return success({"items": items, "total": total, "page": page_number, "page_size": page_size})
