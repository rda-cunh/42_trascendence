from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class UserStatus(str, Enum):
	active		= 'Active'
	suspended	= 'Suspended'
	banned		= 'Banned'
	deactivated	= 'Deactivated'

class UserRole(str, Enum):
	user		= 'User'
	admin		= 'Admin'

class UserBase(BaseModel):
	name: str
	email:		str
	phone:		Optional[str] = None
	avatar_url:	Optional[str] = None

class UserCreate(UserBase):
	password: str

class UserLogin(BaseModel):
	email: str
	password: str

class UserUpdate(BaseModel):
	name:		Optional[str] = None
	email:		Optional[str] = None
	phone:		Optional[str] = None
	avatar_url:	Optional[str] = None
	status:		Optional[UserStatus] = None

class UserPasswordUpdate(BaseModel):
	oldPass:	str
	newPass:	str

class UserResponse(UserBase):
	id:			int
	status:		UserStatus
	role:		Optional[str] = None
	created_at:	datetime
	updated_at:	datetime

	model_config = {'from_attributes': True}

class ProductStatus(str, Enum):
	draft	= 'Draft'
	active	= 'Active'
	paused	= 'Paused'
	deleted	= 'Deleted'

class ProductImages(BaseModel):
	image_hash:		str
	display_order:	int

class ProductResponse(BaseModel):
	id:				int
	name:			str
	slug:			str
	description:	str
	price:			Decimal
	status:			ProductStatus
	avg_rating:		Optional[Decimal]
	review_count:	Optional[int]
	images:			list[str] = []

class ProfileResponse(UserBase):
	name:			str
	email:			str
	listings:		list[ProductResponse] = []
