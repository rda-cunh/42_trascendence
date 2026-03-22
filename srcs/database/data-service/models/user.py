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

class UserBase(BaseModel):
	name: str
	email:		str
	phone:		Optional[str] = None
	avatar_url:	Optional[str] = None

class UserCreate(UserBase):
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
	created_at:	datetime
	updated_at:	datetime

	model_config = {'from_attributes': True}

class UserAddressCreate(BaseModel):
	label:		str
	street:		str
	number:		str
	complement:	str
	city:		str
	state:		str
	postal_code:	str
	country:	str

class UserAddressUpdate(BaseModel):
	label:		Optional[str] = None
	street:		Optional[str] = None
	number:		Optional[str] = None
	complement:	Optional[str] = None
	city:		Optional[str] = None
	state:		Optional[str] = None
	postal_code:	Optional[str] = None
	country:	Optional[str] = None

class UserAddressResponse(BaseModel):
	id:			int
	label:		str
	street:		str
	number:		str
	complement:	str
	city:		str
	state:		str
	postal_code:	str
	country:	str
	created_at:	datetime
	updated_at: datetime

	model_config = {'from_attributes': True}
