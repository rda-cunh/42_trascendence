from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
	pending			= 'Pending'
	paid			= 'Paid'
	shipped			= 'Shipped'
	delivered		= 'Delivered'
	cancelled		= 'Cancelled'
	refunded		= 'Refunded'

class OrderItemCreate(BaseModel):
	product_id:	int
	qty:		int

class OrderCreate(BaseModel):
	buyer_id:			int
	buyer_address_id:	int
	notes:				Optional[str] = None
	items:				list[OrderItemCreate]

class OrderItemResponse(BaseModel):
	id:					int
	product_id:			Optional[int]
	product_name:		str
	price:				Decimal
	qty:				int
	subtotal:			Optional[Decimal]
	seller_id:			int

	model_config = {'from_attributes': True}

class OrderResponse(BaseModel):
	id:			int
	code:		str
	buyer_id:	int
	buyer_address_id:	int
	status:		OrderStatus
	subtotal:	Decimal
	total:		Decimal
	notes:		Optional[str]
	created_at:	datetime
	items:		list[OrderItemResponse] = []

	model_config = {'from_attributes': True}