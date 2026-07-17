import logging
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.articles import router as articles_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.leads import router as leads_router
from app.api.resources import router as resources_router
from app.api.uploads import router as uploads_router
from app.core.config import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(articles_router)
app.include_router(leads_router)
app.include_router(resources_router)
app.include_router(uploads_router)
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.upload_dir), name="media")


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception):
    logging.getLogger(__name__).exception("管理接口发生未处理异常，path=%s", request.url.path)
    return JSONResponse(status_code=500, content={"code": 50000, "message": "服务暂时不可用", "response": None})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"code": exc.status_code * 100, "message": str(exc.detail), "response": None})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"code": 42200, "message": "请求参数不合法", "response": None})


@app.get("/health")
def health():
    return {"code": 0, "message": "success", "response": {"status": "healthy"}}
