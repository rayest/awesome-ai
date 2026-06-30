import asyncio
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.core.config import get_settings  # noqa: E402
from app.schemas.agent import FunctionCallRequest, GithubPlanRequest  # noqa: E402
from app.services.function_calling import FunctionCallingService  # noqa: E402
from app.services.github_mcp import GithubMcpService  # noqa: E402


async def main() -> int:
    cases = [
        json.loads(line)
        for line in (ROOT / "evals" / "cases.jsonl").read_text().splitlines()
        if line.strip()
    ]
    settings = get_settings()
    function_service = FunctionCallingService()
    github_service = GithubMcpService(settings)
    failures: list[str] = []

    for case in cases:
        if case["kind"] == "function_calling":
            result = await function_service.run(FunctionCallRequest(prompt=case["prompt"]))
            tools = [call.name for call in result.tool_calls]
            missing = [tool for tool in case["expect_tools"] if tool not in tools]
            if missing:
                failures.append(f"{case['name']}: missing tools {missing}, got {tools}")
        if case["kind"] == "github_mcp":
            result = await github_service.build_plan(
                GithubPlanRequest(repo=case["repo"], task=case["task"], mode=case["mode"])
            )
            if len(result.write_actions) != case["expect_write_actions"]:
                failures.append(f"{case['name']}: unexpected write actions {result.write_actions}")

    if failures:
        print("\n".join(failures))
        return 1
    print(f"passed {len(cases)} cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
