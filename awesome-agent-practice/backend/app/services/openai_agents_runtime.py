from app.core.config import Settings
from app.tools.function_tools import (
    calculate_refund,
    check_inventory,
    get_customer_profile,
    get_order_detail,
    list_recent_orders,
    search_support_tickets,
    summarize_revenue,
)


async def run_real_function_agent(prompt: str, settings: Settings) -> str:
    from agents import Agent, Runner, function_tool

    @function_tool
    def get_customer_profile_tool(customer_id: str = "C-1001"):
        return get_customer_profile(customer_id)

    @function_tool
    def get_order_detail_tool(order_id: str = "ORD-9001"):
        return get_order_detail(order_id)

    @function_tool
    def list_recent_orders_tool(customer_id: str = "C-1001"):
        return list_recent_orders(customer_id)

    @function_tool
    def check_inventory_tool(sku: str = "SKU-VIDEO-CREDIT"):
        return check_inventory(sku)

    @function_tool
    def calculate_refund_tool(order_id: str = "ORD-9001", refund_rate: float = 1.0):
        return calculate_refund(order_id, refund_rate)

    @function_tool
    def summarize_revenue_tool(days: int = 7):
        return summarize_revenue(days)

    @function_tool
    def search_support_tickets_tool(customer_id: str | None = None, category: str | None = None):
        return search_support_tickets(customer_id, category)

    agent = Agent(
        name="Business Function Calling Agent",
        model=settings.openai_model,
        instructions="你是业务运营 Agent。必须基于工具返回的客户、订单、库存、退款、营收和工单数据回答，不要讲 Function Calling 理论。",
        tools=[
            get_customer_profile_tool,
            get_order_detail_tool,
            list_recent_orders_tool,
            check_inventory_tool,
            calculate_refund_tool,
            summarize_revenue_tool,
            search_support_tickets_tool,
        ],
    )
    result = await Runner.run(agent, prompt)
    return result.final_output


async def run_real_github_mcp_agent(prompt: str, settings: Settings) -> str:
    from agents import Agent, Runner
    from agents.mcp import MCPServerStreamableHttp

    headers = {
        "Authorization": f"Bearer {settings.github_token}",
        "X-MCP-Toolsets": settings.github_mcp_toolsets,
        "X-MCP-Readonly": str(settings.github_mcp_readonly).lower(),
    }
    async with MCPServerStreamableHttp(
        name="github",
        params={"url": settings.github_mcp_url, "headers": headers},
    ) as github_server:
        agent = Agent(
            name="GitHub MCP Plan Agent",
            model=settings.openai_model,
            instructions=(
                "你是 GitHub 开发任务计划代理。先读取证据，再输出计划。"
                "默认只读，不要创建或修改 GitHub 资源；任何写操作必须等待人工确认。"
            ),
            mcp_servers=[github_server],
        )
        result = await Runner.run(agent, prompt)
        return result.final_output
