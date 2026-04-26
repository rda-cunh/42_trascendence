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
	user_id:		int
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
	status:			Optional[ProductStatus] = None

class ProductImages(BaseModel):
	image_hash:		str
	display_order:	int

# TO DO
class SellerModel(BaseModel):
	# is_owner:			bool
	name:			str
	email:			str
	avatar_url:		str

class ProductResponse(BaseModel):
	id:				int
	seller_id:		int
	name:			str
	slug:			str
	description:	Optional[str]
	price:			Decimal
	status:			ProductStatus
	images:			list[ProductImages] = []
	created_at:		datetime
	seller:			SellerModel = []

class ProductImagesResponse(BaseModel):
	# id:				int
	product_id:		int
	image_hash:		str
	display_order:	int
	created_at:		datetime