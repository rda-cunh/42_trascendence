from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class NotificationListResponse(BaseModel):
    id:            int
    type:          str
    read_at:       Optional[datetime]
    created_at:    datetime
    payload:       Optional[Any]       = None

    # actor (nullable — system events have no actor)
    actor_id:      Optional[int]       = None
    actor_name:    Optional[str]       = None
    actor_avatar:  Optional[str]       = None

    # product preview (nullable — non-product notification types)
    product_id:    Optional[int]       = None
    product_name:  Optional[str]       = None
    product_slug:  Optional[str]       = None
    product_price: Optional[Any]       = None
    product_cover: Optional[str]       = None

    class Config:
        from_attributes = True


class MarkReadRequest(BaseModel):
    ids: list[int]


class FanoutRequest(BaseModel):
    seller_id:  int
    product_id: int


class FanoutResponse(BaseModel):
    recipient_ids: list[int]
    inserted:      int