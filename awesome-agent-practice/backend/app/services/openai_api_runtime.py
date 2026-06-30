import json
from typing import Any

from openai import AsyncOpenAI

from app.core.config import Settings
from app.schemas.agent import FunctionCallResponse
from app.tools.function_tools import (
    calculate_refund,
    check_inventory,
    get_customer_profile,
    get_order_detail,
    list_recent_orders,
    search_support_tickets,
    summarize_revenue,
)


TOOL_HANDLERS = {
    "get_customer_profile": get_customer_profile,
    "get_order_detail": get_order_detail,
    "list_recent_orders": list_recent_orders,
    "check_inventory": check_inventory,
    "calculate_refund": calculate_refund,
    "summarize_revenue": summarize_revenue,
    "search_support_tickets": search_support_tickets,
}

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": properties,
                "additionalProperties": False,
            },
        },
    }
    for name, description, properties in [
        ("get_customer_profile", "查询客户画像、健康分和累计付费。", {"customer_id": {"type": "string"}}),
        ("get_order_detail", "查询订单明细、商品行和金额。", {"order_id": {"type": "string"}}),
        ("list_recent_orders", "查询客户最近订单列表。", {"customer_id": {"type": "string"}}),
        ("check_inventory", "查询 SKU 库存和可售状态。", {"sku": {"type": "string"}}),
        ("calculate_refund", "根据订单计算可退款金额。", {"order_id": {"type": "string"}, "refund_rate": {"type": "number"}}),
        ("summarize_revenue", "汇总最近收入数据。", {"days": {"type": "integer"}}),
        ("search_support_tickets", "查询客户工单。", {"customer_id": {"type": "string"}, "category": {"type": "string"}}),
    ]
]


async def run_real_function_agent(prompt: str, settings: Settings) -> FunctionCallResponse:
    client = AsyncOpenAI(api_key=settings.provider_api_key, base_url=settings.openai_base_url)
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": "你是业务运营 Agent。只输出业务结论，不讲工具调用或 Function Calling 理论。"},
        {"role": "user", "content": prompt},
    ]
    first_response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        tools=TOOL_SCHEMAS,
    )
    assistant_message = first_response.choices[0].message
    business_data = _run_tool_calls(assistant_message.tool_calls or [])
    business_data["source"] = settings.openai_model
    answer = await _finalize_answer(client, settings, messages, assistant_message, business_data)
    return FunctionCallResponse(answer=answer, business_data=business_data, recommendations=_recommend(business_data))


def _run_tool_calls(tool_calls: list[Any]) -> dict[str, Any]:
    business_data: dict[str, Any] = {}
    for call in tool_calls:
        name = call.function.name
        arguments = json.loads(call.function.arguments or "{}")
        if name in TOOL_HANDLERS:
            business_data[name] = TOOL_HANDLERS[name](**arguments)
    return business_data


async def _finalize_answer(
    client: AsyncOpenAI,
    settings: Settings,
    messages: list[dict[str, Any]],
    assistant_message: Any,
    business_data: dict[str, Any],
) -> str:
    if not business_data:
        return assistant_message.content or "未查询到可用业务数据。"
    messages.append(assistant_message.model_dump(exclude_none=True))
    messages.extend(_tool_messages(assistant_message.tool_calls or [], business_data))
    response = await client.chat.completions.create(model=settings.openai_model, messages=messages)
    return response.choices[0].message.content or "已完成业务查询。"


def _tool_messages(tool_calls: list[Any], business_data: dict[str, Any]) -> list[dict[str, str]]:
    return [
        {
            "role": "tool",
            "tool_call_id": call.id,
            "content": json.dumps(business_data.get(call.function.name, {}), ensure_ascii=False),
        }
        for call in tool_calls
    ]


def _recommend(business_data: dict[str, Any]) -> list[str]:
    if not business_data:
        return ["当前没有查询到明确业务数据，建议补充客户、订单或 SKU 信息。"]
    return ["已根据当前业务数据生成回答，正式执行写操作前仍需人工确认。"]
