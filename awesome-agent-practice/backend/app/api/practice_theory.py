from fastapi import APIRouter

from app.core.responses import success_response
from app.schemas.agent import PracticeTheoryResponse, TheoryLab
from app.schemas.common import ApiResponse
from app.services.practice_theory import PracticeTheoryService


router = APIRouter(prefix="/practice-theory", tags=["practice-theory"])
service = PracticeTheoryService()


@router.get("/{lab}", response_model=ApiResponse[PracticeTheoryResponse])
async def get_practice_theory(lab: TheoryLab) -> ApiResponse[PracticeTheoryResponse]:
    return success_response(service.get_theory(lab))
