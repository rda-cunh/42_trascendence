from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserInfo(BaseModel):
	id:			int
	name:		str
	avatar_url:	Optional[str] = None
	email:		str
	phone:		Optional[str] = None
	created_at:	datetime
	updated_at:	datetime

class AdminUserInfo(UserInfo):
	role:		str
	status:		str

class DashboardInfo(BaseModel):
	total_revenue:		int
	total_users:		int
	total_orders:		int
	active_listings:	int
	orders_trend:		list[int]
	revenue_overview:	list[int]
	months:				list[str]
