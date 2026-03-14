from pydantic import BaseModel, field_validator
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class ProductStatus(str, Enum):
	draft	= 'Draft'
	active	= 'Active'
	paused	= 'Paused'
	deleted	= 'Deleted'

class ProductCreate(BaseModel):
	name:			str
	slug:			str
	description:	Optional[str] = None
	price:			Decimal
	#stock:			int = 0

	@field_validator('price')
	@classmethod
	def price_positive(cls, v):
		if v <= 0: raise ValueError('Price must be higher than zero')
		return v

class ProductUpdate(BaseModel):
	name:			Optional[str] = None
	description:	Optional[str] = None
	price:			Optional[Decimal] = None
	#stock:			Optional[int] = None
	status:			Optional[ProductStatus] = None

class ProductResponse(BaseModel):
	id:				int
	seller_id:		int
	name:			str
	slug:			str
	description:	Optional[str]
	price:			Decimal
	#stock:			int
	status:			ProductStatus
	created_at:		datetime

	model_config = {'from_attributes': True}

class ProductImagesCreate(BaseModel):
	image_hash:		str
	display_order:	int

class ProductImagesResponse(BaseModel):
	id:				int
	product_id:		int
	image_hash:		str
	display_order:	int
	created_at:		datetime