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
	description:	Optional[str] = None
	price:			Decimal
	images:			list[str] = []

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
	images:			Optional[list[str]] = None

class ProductImages(BaseModel):
	image_hash:		str
	display_order:	int

# TO DO
class SellerModel(BaseModel):
	# is_owner:			bool
	name:			str
	email:			str
	avatar_url:		Optional[str] = None

class ProductResponse(BaseModel):
	id:				int
	seller_id:		int
	name:			str
	slug:			str
	description:	Optional[str]
	price:			Decimal
	status:			ProductStatus
	avg_rating:		Optional[Decimal]
	review_count:	Optional[int]
	images:			list[str] = []
	created_at:		datetime
	seller:			SellerModel = []

class ProductImagesResponse(BaseModel):
	id:				int
	product_id:		int
	image_hash:		str
	display_order:	int
	created_at:		datetime

class ReviewCreate(BaseModel):
	reviewer_id:	int
	rating:			int
	title:			Optional[str] = []
	body:			Optional[str] = []

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    title: Optional[str] = None
    body: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if v is not None and not 1 <= v <= 5:
            raise ValueError("rating must be between 1 and 5")
        return v


class ReviewResponse(BaseModel):
    id:               int
    product_id:       int
    reviewer_id:      int
    rating:           int
    title:            Optional[str]
    body:             Optional[str]
    status:           str
    created_at:       datetime
    updated_at:       datetime
    reviewer_name:    str
    reviewer_avatar:  Optional[str]