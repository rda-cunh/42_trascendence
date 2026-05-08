from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class FriendStatus(str, Enum):
	pending			= 'Pending'
	accepted		= 'Accepted'
	rejected		= 'Rejected'

class AddFriend(BaseModel):
	user_id:		int
	friend_id:		int

class UserInfo(BaseModel):
	user_id:		int
	name:			str
	avatar_url:		str

class UserFriend(BaseModel):
	id:				int
	requester_id:	int
	requested_at:	datetime
	user:			UserInfo

class ProductStatus(str, Enum):
	Draft			= 'Draft'
	Active			= 'Active'
	Paused			= 'Paused'
	Deleted			= 'Deleted'

class ListingInfo(BaseModel):
	id:			int
	name:		str
	slug:		str
	price:		Decimal
	status:		ProductStatus
	created_at:	datetime
	image_hash:	str | None = None

class FriendsFeed(BaseModel):
	listing:	ListingInfo
	user:		UserInfo