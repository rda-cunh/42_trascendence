from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class UserStatus(str, Enum):
	active		= 'Active'
	suspended	= 'Suspended'
	baned		= 'Baned'
	deactivated	= 'Deactivated'

class ProductStatus(str, Enum):
	draft	= 'Draft'
	active	= 'Active'
	paused	= 'Paused'
	deleted	= 'Deleted'

class ProductImages(BaseModel):
	image_hash:		str
	display_order:	int

class ProductResponse(BaseModel):
	name:			str
	slug:			str
	description:	str
	price:			Decimal
	status:			ProductStatus
	images:			list[ProductImages] = []

# GET /users/
class UserProductsResponse(BaseModel):
	name:	str
	email:	str
	phone:	str
	avatar_url:	str
	listings:	list[ProductResponse] = []

class ListingResponse(BaseModel):
	seller:			str
	email:			str
	phone:			str
	avatar_url:		str
	name:			str
	slug:			str
	description:	str
	price:		Decimal
	status:		ProductStatus

class UserResponse(BaseModel):
	name:		str
	email:		str
	phone:		str
	avatar_url:	str
