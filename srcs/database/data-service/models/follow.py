from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class FollowRequest(BaseModel):
	user_id: 			int
	following_id:		int

class FollowUserInfo(BaseModel):
	user_id:			int
	name:				str
	avatar_url:			str		 | None = None
	following_since:	datetime | None = None

class FollowListingInfo(BaseModel):
	id: 				int
	name: 				str
	slug: 				str
	price: 				Decimal
	created_at: 		datetime
	image_hash: 		str 	 | None = None

class FollowFeedItem(BaseModel):
	listing: 			FollowListingInfo
	user: 				FollowUserInfo

class FollowCount(BaseModel):
	num:				int