from typing import TypeVar

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from app.schemas.common import ApiResponse


T = TypeVar("T")

SUCCESS_CODE = 0


def success_response(response: T, message: str = "success") -> ApiResponse[T]:
    return ApiResponse(code=SUCCESS_CODE, message=message, response=response)


def error_response(code: int, message: str, status_code: int, response: object = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder({"code": code, "message": message, "response": response}),
    )
