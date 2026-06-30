import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError

from app.core.responses import error_response


logger = logging.getLogger(__name__)

HTTP_ERROR_CODE = 40000
VALIDATION_ERROR_CODE = 40001
INTERNAL_ERROR_CODE = 50000


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def handle_http_exception(request: Request, exc: HTTPException):
        message = exc.detail if isinstance(exc.detail, str) else "请求处理失败"
        return error_response(HTTP_ERROR_CODE, message, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_exception(request: Request, exc: RequestValidationError):
        return error_response(
            VALIDATION_ERROR_CODE,
            "参数不合法",
            422,
            response={"errors": exc.errors(), "path": request.url.path},
        )

    @app.exception_handler(Exception)
    async def handle_unknown_exception(request: Request, exc: Exception):
        logger.exception("Unhandled request error: path=%s", request.url.path)
        return error_response(INTERNAL_ERROR_CODE, "服务暂时不可用", 500)
