import ast
import json
import math
import statistics
from pathlib import Path
from typing import Any


APP_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = APP_ROOT / "data"


def search_local_web(query: str) -> list[dict[str, str]]:
    corpus = [
        {
            "title": "Context Engineering",
            "snippet": "上下文工程强调将业务意图、工具回调、历史记忆和当前状态组合进 Agent 输入。",
        },
        {
            "title": "ReAct Loop",
            "snippet": "ReAct 通过 Thought, Action, Observation 的循环把 LLM 推理和工具调用连接起来。",
        },
        {
            "title": "Skills Progressive Loading",
            "snippet": "Skills 使用 L1 标签、L2 文档和 L3 资源按需加载，降低上下文开销。",
        },
        {
            "title": "HITL",
            "snippet": "高风险操作或缺失关键信息时，Agent 应中断并请求人类确认。",
        },
    ]
    terms = set(query.lower().split())
    ranked = []
    for item in corpus:
        text = f"{item['title']} {item['snippet']}".lower()
        score = sum(1 for term in terms if term in text)
        ranked.append((score, item))
    return [item for _, item in sorted(ranked, reverse=True)[:3]]


def get_price(item: str, quantity: int) -> dict[str, Any]:
    prices = {"苹果": 2, "咖啡": 18, "服务器": 399, "API": 0.02}
    unit_price = prices.get(item, 10)
    return {"item": item, "quantity": quantity, "unit_price": unit_price, "total": unit_price * quantity}


def load_skill_tags() -> list[dict[str, str]]:
    skills_dir = DATA_DIR / "skills"
    tags = []
    for skill in skills_dir.iterdir():
        skill_md = skill / "SKILL.md"
        if not skill_md.exists():
            continue
        first_lines = skill_md.read_text(encoding="utf-8").splitlines()[:8]
        tags.append({"name": skill.name, "tag": "\n".join(first_lines)})
    return tags


def load_skill(name: str) -> str:
    skill_md = DATA_DIR / "skills" / name / "SKILL.md"
    if not skill_md.exists():
        raise FileNotFoundError(f"Skill not found: {name}")
    return skill_md.read_text(encoding="utf-8")


def read_memories(session_id: str) -> list[str]:
    path = DATA_DIR / "memory" / f"{session_id}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def write_memory(session_id: str, fact: str) -> list[str]:
    path = DATA_DIR / "memory" / f"{session_id}.json"
    memories = read_memories(session_id)
    memories.append(fact)
    path.write_text(json.dumps(memories[-20:], ensure_ascii=False, indent=2), encoding="utf-8")
    return memories[-20:]


def compact_trace(trace: list[dict[str, Any]]) -> dict[str, Any]:
    completed = [step["title"] for step in trace if step.get("phase") in {"observe", "reflect", "final"}]
    decisions = [step["detail"] for step in trace if "决定" in step.get("detail", "") or "route" in step.get("phase", "")]
    return {
        "completed": completed[-5:],
        "decisions": decisions[-5:],
        "summary": f"压缩 {len(trace)} 条 trace 为 {min(len(completed), 5)} 个完成项和 {min(len(decisions), 5)} 个决策。",
    }


class SafeCodeRunner(ast.NodeVisitor):
    allowed_nodes = {
        ast.Module,
        ast.Expr,
        ast.Assign,
        ast.BinOp,
        ast.UnaryOp,
        ast.Call,
        ast.Name,
        ast.Load,
        ast.Store,
        ast.Constant,
        ast.List,
        ast.Tuple,
        ast.Dict,
        ast.For,
        ast.If,
        ast.Compare,
        ast.Return,
        ast.FunctionDef,
        ast.arguments,
        ast.arg,
        ast.Add,
        ast.Sub,
        ast.Mult,
        ast.Div,
        ast.Pow,
        ast.Mod,
        ast.USub,
        ast.Eq,
        ast.NotEq,
        ast.Lt,
        ast.LtE,
        ast.Gt,
        ast.GtE,
        ast.Attribute,
    }

    def generic_visit(self, node):
        if type(node) not in self.allowed_nodes:
            raise ValueError(f"不允许的代码节点: {type(node).__name__}")
        super().generic_visit(node)


def run_safe_python(code: str) -> dict[str, Any]:
    tree = ast.parse(code)
    SafeCodeRunner().visit(tree)
    scope: dict[str, Any] = {
        "__builtins__": {"range": range, "len": len, "sum": sum, "min": min, "max": max, "round": round},
        "math": math,
        "statistics": statistics,
    }
    exec(compile(tree, "<codeact>", "exec"), scope)
    public_scope = {key: value for key, value in scope.items() if not key.startswith("__")}
    return {"variables": public_scope}
