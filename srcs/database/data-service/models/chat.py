from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime

class PostConversation(BaseModel):
	listing_id:			int
	user_id:			int
	seller_id:			int

class ConversationMessages(BaseModel):
	id:			int
	sender_id:	int
	content:	str
	read_at:	Optional[datetime]

class UserInfo(BaseModel):
	name:		str
	avatar_url:	Optional[str]	# changed from str to Optional[str] to allow for null values (if user has no avatar). This will help in tests.

class ListingInfo(BaseModel):
	name:		str
	price:		Decimal
	image_hash:	Optional[str]	# changed from str to Optional[str] to allow for null values (if listing has no image).This will help in tests.

class UserConversation(BaseModel):
	id:					int

	listing_id:			Optional[int]
	listing:			ListingInfo

	seller_id:			Optional[int]
	seller:				UserInfo

	buyer_id:			Optional[int]
	buyer:				UserInfo

	other_id:			Optional[int]

	last_message:		Optional[str]
	last_message_at:	Optional[datetime]

	history:			Optional[list[ConversationMessages]]


class SendMessage(BaseModel):
	sender_id:			int
	content:			str
