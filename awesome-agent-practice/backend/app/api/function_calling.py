from fastapi import APIRouter, Depends

from app.api.dependencies import get_function_calling_service
from app.core.responses import success_response
from app.schemas.agent import FunctionCallRequest, FunctionCallResponse
from app.schemas.common import ApiResponse
from app.services.function_calling import FunctionCallingService


router = APIRouter(prefix="/function-calling", tags=["function-calling"])


@router.post("/run", response_model=ApiResponse[FunctionCallResponse])
async def run_function_calling(
    request: FunctionCallRequest,
    service: FunctionCallingService = Depends(get_function_calling_service),
) -> ApiResponse[FunctionCallResponse]:
    result = await service.run(request)
    return success_response(result)
