from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class FollowFriend(BaseModel):
	user_id:		int
	following_id:		int

class ProductStatus(str, Enum):
	Draft			= 'Draft'
	Active			= 'Active'
	Paused			= 'Paused'
	Deleted			= 'Deleted'

class UserInfo(BaseModel):
	user_id:			int
	name:				str
	avatar_url:			str
	following_since:	datetime | None = None

class ListingInfo(BaseModel):
	id:			int
	name:		str
	slug:		str
	price:		Decimal
	# status:		ProductStatus
	created_at:	datetime
	image_hash:	str | None = None

class FriendsFeed(BaseModel):
	listing:	ListingInfo
	user:		UserInfo

class FollowCount(BaseModel):
	num:		int