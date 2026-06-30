import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.agents.runner import AgentPatternRunner, pattern_catalog
from app.agents.schemas import AgentPattern, AgentRunRequest, AgentRunResponse
from app.agents.tools import DATA_DIR, load_skill_tags, read_memories
from app.core.config import settings


app = FastAPI(title="Harness Agent Lab API", version="0.1.0")
runner = AgentPatternRunner()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "llm_enabled": settings.llm_enabled,
        "model": settings.deepseek_model,
    }


@app.get("/api/patterns")
async def patterns():
    return pattern_catalog()


@app.post("/api/runs", response_model=AgentRunResponse)
async def run_agent(request: AgentRunRequest) -> AgentRunResponse:
    return await runner.run(request)


@app.post("/api/agents/{pattern}/chat", response_model=AgentRunResponse)
async def chat_with_agent(pattern: AgentPattern, request: AgentRunRequest) -> AgentRunResponse:
    request.pattern = pattern
    return await runner.run(request)


@app.get("/api/skills")
async def skills():
    return load_skill_tags()


@app.get("/api/memory/{session_id}")
async def memory(session_id: str) -> dict[str, list[str]]:
    return {"memories": read_memories(session_id)}


@app.get("/api/tasks/{session_id}")
async def task_state(session_id: str):
    task_path = DATA_DIR / "tasks" / f"{session_id}.json"
    if not task_path.exists():
        raise HTTPException(status_code=404, detail="Task state not found")
    return json.loads(task_path.read_text(encoding="utf-8"))


for directory in ["memory", "tasks"]:
    Path(DATA_DIR / directory).mkdir(parents=True, exist_ok=True)
