import re
from typing import Any

from app.core.config import Settings
from app.schemas.agent import FunctionCallRequest, FunctionCallResponse, ToolCall
from app.services.openai_agents_runtime import run_real_function_agent
from app.tools.function_tools import TOOL_REGISTRY


class FunctionCallingService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings

    async def run(self, request: FunctionCallRequest) -> FunctionCallResponse:
        if request.mode == "openai" and self.settings and self.settings.openai_enabled:
            answer = await run_real_function_agent(request.prompt, self.settings)
            return FunctionCallResponse(
                answer=answer,
                selected_tool="openai_agents_sdk",
                tool_calls=[],
                business_data={"source": "openai_agents_sdk"},
                recommendations=["打开 trace 后可继续观察真实模型选择了哪些工具。"],
            )

        planned_calls = self._plan_tool_calls(request.prompt)
        tool_calls: list[ToolCall] = []
        business_data: dict[str, Any] = {}

        for tool_name, arguments in planned_calls:
            tool = TOOL_REGISTRY[tool_name]
            result = tool["handler"](**arguments)
            tool_calls.append(ToolCall(name=tool_name, arguments=arguments, result=result))
            business_data[tool_name] = result

        return FunctionCallResponse(
            answer=self._format_answer(tool_calls),
            selected_tool=tool_calls[0].name,
            tool_calls=tool_calls,
            business_data=business_data,
            recommendations=self._recommend(tool_calls),
        )

    def _plan_tool_calls(self, prompt: str) -> list[tuple[str, dict[str, Any]]]:
        customer_id = self._find_customer_id(prompt)
        order_id = self._find_order_id(prompt)
        sku = self._find_sku(prompt)
        calls: list[tuple[str, dict[str, Any]]] = []

        if any(keyword in prompt for keyword in ["客户", "画像", "健康分", "付费"]):
            calls.append(("get_customer_profile", {"customer_id": customer_id}))
        if any(keyword in prompt for keyword in ["最近订单", "订单列表", "买过", "消费记录"]):
            calls.append(("list_recent_orders", {"customer_id": customer_id}))
        if order_id or "订单" in prompt:
            calls.append(("get_order_detail", {"order_id": order_id or "ORD-9001"}))
        if any(keyword in prompt for keyword in ["退款", "退费", "返还"]):
            calls.append(("calculate_refund", {"order_id": order_id or "ORD-9001", "refund_rate": self._find_rate(prompt)}))
        if any(keyword in prompt for keyword in ["库存", "可售", "sku", "SKU"]):
            calls.append(("check_inventory", {"sku": sku}))
        if any(keyword in prompt for keyword in ["营收", "收入", "销售额", "流水"]):
            calls.append(("summarize_revenue", {"days": self._find_days(prompt)}))
        if any(keyword in prompt for keyword in ["工单", "投诉", "报错", "客服", "问题"]):
            calls.append(("search_support_tickets", {"customer_id": customer_id}))

        if not calls:
            calls.append(("get_customer_profile", {"customer_id": customer_id}))
            calls.append(("list_recent_orders", {"customer_id": customer_id}))

        return self._dedupe_calls(calls)

    def _format_answer(self, tool_calls: list[ToolCall]) -> str:
        parts: list[str] = []
        for call in tool_calls:
            result = call.result
            if call.name == "get_customer_profile" and result.get("found"):
                parts.append(f"{result['name']} 是 {result['tier']} 客户，健康分 {result['health_score']}，累计付费 {result['paid_total']} 元。")
            elif call.name == "list_recent_orders":
                parts.append(f"查到 {result['count']} 笔相关订单。")
            elif call.name == "get_order_detail" and result.get("found"):
                parts.append(f"订单 {result['order_id']} 当前状态为 {result['status']}，实付 {result['amounts']['total']} 元。")
            elif call.name == "calculate_refund":
                parts.append(f"订单 {result['order_id']} 可按当前比例退款 {result['refund_amount']} 元。")
            elif call.name == "check_inventory" and result.get("found"):
                parts.append(f"{result['name']} 当前可售 {result['available']}，库存状态 {result['status']}。")
            elif call.name == "summarize_revenue":
                parts.append(f"最近 {result['days']} 天已支付订单 {result['paid_orders']} 笔，收入 {result['revenue']} {result['currency']}。")
            elif call.name == "search_support_tickets":
                parts.append(f"查到 {result['count']} 条相关工单。")
        return " ".join(parts) if parts else "已完成业务查询。"

    def _recommend(self, tool_calls: list[ToolCall]) -> list[str]:
        recommendations: list[str] = []
        for call in tool_calls:
            result = call.result
            if call.name == "check_inventory" and result.get("status") == "low":
                recommendations.append("库存偏低，建议先补货或限制营销活动。")
            if call.name == "get_customer_profile" and result.get("health_score", 100) < 70:
                recommendations.append("客户健康分偏低，建议安排一次上手引导。")
            if call.name == "search_support_tickets" and result.get("count", 0) > 1:
                recommendations.append("该客户存在多条工单，建议合并查看上下文后再回复。")
            if call.name == "calculate_refund":
                recommendations.append("退款属于写前决策，正式执行前应进入人工审批。")
        return recommendations or ["当前数据无明显风险，可以继续下一步业务处理。"]

    def _find_customer_id(self, prompt: str) -> str:
        match = re.search(r"C-\d{4}", prompt, re.IGNORECASE)
        return match.group(0).upper() if match else "C-1001"

    def _find_order_id(self, prompt: str) -> str | None:
        match = re.search(r"ORD-\d{4}", prompt, re.IGNORECASE)
        return match.group(0).upper() if match else None

    def _find_sku(self, prompt: str) -> str:
        match = re.search(r"SKU-[A-Z-]+", prompt, re.IGNORECASE)
        return match.group(0).upper() if match else "SKU-VIDEO-CREDIT"

    def _find_rate(self, prompt: str) -> float:
        match = re.search(r"(\d+(?:\.\d+)?)\s*%", prompt)
        if match:
            return float(match.group(1)) / 100
        return 1.0

    def _find_days(self, prompt: str) -> int:
        match = re.search(r"(\d+)\s*天", prompt)
        return int(match.group(1)) if match else 7

    def _dedupe_calls(self, calls: list[tuple[str, dict[str, Any]]]) -> list[tuple[str, dict[str, Any]]]:
        seen: set[str] = set()
        unique: list[tuple[str, dict[str, Any]]] = []
        for name, arguments in calls:
            key = f"{name}:{arguments}"
            if key not in seen:
                unique.append((name, arguments))
                seen.add(key)
        return unique
