from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class ProductImages(BaseModel):
	image_hash:		str
	display_order:	int

class UserProducts(BaseModel):
	name:			str
	description:	str
	price:			Decimal
	images:			list[ProductImages] = []

class UserResponse(BaseModel):
	name:		str
	email:		str
	avatar_url:	Optional[str] = None
	created_at:	datetime
	pages:		int
	listings:	list[UserProducts] = []


