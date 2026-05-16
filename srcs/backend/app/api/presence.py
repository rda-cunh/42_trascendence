"""
Online Status/presence is backed only by Redis TTL (Time to Live) withoud websockets yet.

The frontend will ping POST /api/presence/ping/ every 30s while a tab is open.
Each ping refreshes a short-lived key in Redis (TTL = 60s). If the key exists,
the user is "online"; if it expired (no ping in 60s), the user is "offline".
Redis will manage and delete the keys on its own.
"""

import os
import redis

_redis_client = None
PRESENCE_TTL_SECONDS = 60          # it allows one missed 30s ping to avoid wrong offline status caused by setwork problems
PRESENCE_KEY_PREFIX = "presence:"

def _client():
    """ create the Redis connection on first use """
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(
            host=os.environ.get("REDIS_HOST", "redis"),
            port=int(os.environ.get("REDIS_PORT", 6379)),
            decode_responses=True,
        )
    return _redis_client

def _key(user_id):
    return f"{PRESENCE_KEY_PREFIX}{int(user_id)}"

def mark_online(user_id):
    """ refresh the user presence key with a fresh TTL """
    _client().set(_key(user_id), "1", ex=PRESENCE_TTL_SECONDS)

def mark_offline(user_id):
    """ explicit offline (on logout) or otherwise the key just expires """
    _client().delete(_key(user_id))

def are_online(user_ids):
    """ batch check: returns for every id given (one round-trip) """
    if not user_ids:
        return {}
    keys = [_key(uid) for uid in user_ids]
    values = _client().mget(keys)
    return {uid: (val is not None) for uid, val in zip(user_ids, values)}
