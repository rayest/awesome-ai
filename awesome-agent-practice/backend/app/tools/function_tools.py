from decimal import Decimal, ROUND_HALF_UP
from typing import Any


CUSTOMERS = {
    "C-1001": {
        "customer_id": "C-1001",
        "name": "李雷",
        "tier": "Pro",
        "health_score": 86,
        "owner": "Ada",
        "tags": ["高活跃", "内容电商"],
    },
    "C-1002": {
        "customer_id": "C-1002",
        "name": "韩梅梅",
        "tier": "Starter",
        "health_score": 63,
        "owner": "Ben",
        "tags": ["新客户", "需要引导"],
    },
}

ORDERS = {
    "ORD-9001": {
        "order_id": "ORD-9001",
        "customer_id": "C-1001",
        "items": [
            {"sku": "SKU-CAPTION-PLUS", "name": "Caption Plus 月包", "quantity": 1, "unit_price": 399.0},
            {"sku": "SKU-IMAGE-CREDIT", "name": "图片生成积分包", "quantity": 2, "unit_price": 128.0},
        ],
        "discount_rate": 0.9,
        "tax_rate": 0.06,
        "status": "paid",
    },
    "ORD-9002": {
        "order_id": "ORD-9002",
        "customer_id": "C-1001",
        "items": [{"sku": "SKU-VIDEO-CREDIT", "name": "视频生成积分包", "quantity": 1, "unit_price": 699.0}],
        "discount_rate": 1.0,
        "tax_rate": 0.06,
        "status": "paid",
    },
    "ORD-9003": {
        "order_id": "ORD-9003",
        "customer_id": "C-1002",
        "items": [{"sku": "SKU-CAPTION-PLUS", "name": "Caption Plus 月包", "quantity": 1, "unit_price": 399.0}],
        "discount_rate": 0.95,
        "tax_rate": 0.06,
        "status": "pending",
    },
}

INVENTORY = {
    "SKU-CAPTION-PLUS": {"sku": "SKU-CAPTION-PLUS", "name": "Caption Plus 月包", "stock": 128, "reserved": 18},
    "SKU-IMAGE-CREDIT": {"sku": "SKU-IMAGE-CREDIT", "name": "图片生成积分包", "stock": 42, "reserved": 9},
    "SKU-VIDEO-CREDIT": {"sku": "SKU-VIDEO-CREDIT", "name": "视频生成积分包", "stock": 12, "reserved": 7},
}

SUPPORT_TICKETS = [
    {"ticket_id": "T-501", "customer_id": "C-1001", "category": "billing", "priority": "high", "title": "订单 ORD-9001 发票抬头需要修改"},
    {"ticket_id": "T-502", "customer_id": "C-1001", "category": "bug", "priority": "medium", "title": "视频生成任务偶发失败"},
    {"ticket_id": "T-503", "customer_id": "C-1002", "category": "how_to", "priority": "low", "title": "如何批量生成商品文案"},
]


def _order_total(order: dict[str, Any]) -> dict[str, float]:
    subtotal = sum(Decimal(str(item["unit_price"])) * item["quantity"] for item in order["items"])
    discounted = subtotal * Decimal(str(order["discount_rate"]))
    tax = discounted * Decimal(str(order["tax_rate"]))
    total = (discounted + tax).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return {"subtotal": float(subtotal), "tax": float(tax), "total": float(total)}


def get_customer_profile(customer_id: str = "C-1001") -> dict[str, Any]:
    customer = CUSTOMERS.get(customer_id)
    if not customer:
        return {"found": False, "customer_id": customer_id}
    orders = [order for order in ORDERS.values() if order["customer_id"] == customer_id]
    paid_total = sum(_order_total(order)["total"] for order in orders if order["status"] == "paid")
    return {**customer, "found": True, "paid_order_count": len(orders), "paid_total": round(paid_total, 2)}


def get_order_detail(order_id: str = "ORD-9001") -> dict[str, Any]:
    order = ORDERS.get(order_id)
    if not order:
        return {"found": False, "order_id": order_id}
    customer = CUSTOMERS.get(order["customer_id"], {})
    return {**order, "found": True, "customer_name": customer.get("name", "未知客户"), "amounts": _order_total(order)}


def list_recent_orders(customer_id: str = "C-1001") -> dict[str, Any]:
    orders = [get_order_detail(order_id) for order_id, order in ORDERS.items() if order["customer_id"] == customer_id]
    return {"customer_id": customer_id, "orders": orders, "count": len(orders)}


def check_inventory(sku: str = "SKU-VIDEO-CREDIT") -> dict[str, Any]:
    item = INVENTORY.get(sku)
    if not item:
        return {"found": False, "sku": sku}
    available = item["stock"] - item["reserved"]
    status = "low" if available < 10 else "healthy"
    return {**item, "found": True, "available": available, "status": status}


def calculate_refund(order_id: str = "ORD-9001", refund_rate: float = 1.0) -> dict[str, Any]:
    order = get_order_detail(order_id)
    if not order.get("found"):
        return order
    refund_amount = Decimal(str(order["amounts"]["total"])) * Decimal(str(refund_rate))
    return {
        "order_id": order_id,
        "customer_name": order["customer_name"],
        "refund_rate": refund_rate,
        "refund_amount": float(refund_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
        "policy": "paid orders can be refunded by approved rate",
    }


def summarize_revenue(days: int = 7) -> dict[str, Any]:
    paid_orders = [get_order_detail(order_id) for order_id, order in ORDERS.items() if order["status"] == "paid"]
    revenue = sum(order["amounts"]["total"] for order in paid_orders)
    return {"days": days, "paid_orders": len(paid_orders), "revenue": round(revenue, 2), "currency": "CNY"}


def search_support_tickets(customer_id: str | None = None, category: str | None = None) -> dict[str, Any]:
    tickets = SUPPORT_TICKETS
    if customer_id:
        tickets = [ticket for ticket in tickets if ticket["customer_id"] == customer_id]
    if category:
        tickets = [ticket for ticket in tickets if ticket["category"] == category]
    return {"tickets": tickets, "count": len(tickets)}


TOOL_REGISTRY = {
    "get_customer_profile": {"description": "查询客户画像、健康分和累计付费。", "handler": get_customer_profile},
    "get_order_detail": {"description": "查询订单明细、商品行和金额。", "handler": get_order_detail},
    "list_recent_orders": {"description": "查询客户最近订单列表。", "handler": list_recent_orders},
    "check_inventory": {"description": "查询 SKU 库存和可售状态。", "handler": check_inventory},
    "calculate_refund": {"description": "根据订单计算可退款金额。", "handler": calculate_refund},
    "summarize_revenue": {"description": "汇总最近收入数据。", "handler": summarize_revenue},
    "search_support_tickets": {"description": "查询客户工单或按类别筛选工单。", "handler": search_support_tickets},
}
