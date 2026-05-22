# GET /api/notifications/{user_id}/ — list, with ?limit&offset&unread_only=true. Join users (actor) and products/product_images for previews — same pattern as FollowFeed.
# GET /api/notifications/{user_id}/unread-count/ → {num}.
# POST /api/notifications/{user_id}/read/ body {ids: [..]} — mark a set as read.
# POST /api/notifications/{user_id}/read-all/ — mark all as read.
# POST /api/notifications/fanout/new-listing/ body {seller_id, product_id} — does the fan-out and returns {receiver_ids, inserted} so the Django side can push live updates.

from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db_dep
from models.notification import NotificationListResponse, MarkReadRequest, FanoutRequest, FanoutResponse
import json

router = APIRouter(prefix='/api/notifications', tags=['Notifications'])


# ── GET /api/notifications/{user_id}/ ────────────────────────────────────────
# Query params: ?limit=20&offset=0&unread_only=true
# Joins actor (users) and product + cover image for previews

@router.get('/{user_id}/', response_model=list[NotificationListResponse])
def list_notifications(
	user_id:     int,
	limit:       int  = Query(20, ge=1, le=100),
	offset:      int  = Query(0,  ge=0),
	unread_only: bool = Query(False),
	db=Depends(get_db_dep)
):
	conn, cursor = db

	sql = '''
		SELECT
			n.id,
			n.type,
			n.read_at,
			n.created_at,
			n.payload,

			-- actor
			a.id         AS actor_id,
			a.name       AS actor_name,
			a.avatar_url AS actor_avatar,

			-- product preview
			p.id         AS product_id,
			p.name       AS product_name,
			p.slug       AS product_slug,
			p.price      AS product_price,

			-- cover image (first by display_order)
			(
				SELECT pi.image_hash
				FROM   product_images pi
				WHERE  pi.product_id = n.product_id
				ORDER  BY pi.display_order
				LIMIT  1
			) AS product_cover

		FROM  notifications n
		LEFT  JOIN users    a ON a.id = n.actor_id
		LEFT  JOIN products p ON p.id = n.product_id
		WHERE n.receiver_id = %s
	'''
	params = [user_id]

	if unread_only:
		sql += ' AND n.read_at IS NULL'

	sql += ' ORDER BY n.created_at DESC LIMIT %s OFFSET %s'
	params.extend([limit, offset])

	cursor.execute(sql, params)
	rows = cursor.fetchall()

	# Deserialize payload JSON string → dict (driver may return string)
	for row in rows:
		if row.get('payload') and isinstance(row['payload'], str):
			row['payload'] = json.loads(row['payload'])

	return [NotificationListResponse(**row) for row in rows]


# ── GET /api/notifications/{user_id}/unread-count/ ───────────────────────────

@router.get('/{user_id}/unread-count/')
def unread_count(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute(
		'SELECT COUNT(*) AS num FROM notifications WHERE receiver_id = %s AND read_at IS NULL',
		(user_id,)
	)
	row = cursor.fetchone()
	return {'num': row['num']}


# ── POST /api/notifications/{user_id}/read/ ───────────────────────────────────
# body: { "ids": [1, 2, 3] }
# Marks the given notification IDs as read — only if they belong to user_id

@router.post('/{user_id}/read/', status_code=200)
def mark_read(user_id: int, payload: MarkReadRequest, db=Depends(get_db_dep)):
	conn, cursor = db

	if not payload.ids:
		raise HTTPException(status_code=400, detail='ids list cannot be empty')

	placeholders = ','.join(['%s'] * len(payload.ids))

	cursor.execute(
		f'''UPDATE notifications
			SET    read_at = NOW()
			WHERE  receiver_id = %s
			  AND  id IN ({placeholders})
			  AND  read_at IS NULL''',
		(user_id, *payload.ids)
	)
	conn.commit()
	return {'marked': cursor.rowcount}


# ── POST /api/notifications/{user_id}/read-all/ ───────────────────────────────
# Marks every unread notification of user_id as read

@router.post('/{user_id}/read-all/', status_code=200)
def mark_all_read(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute(
		'''UPDATE notifications
		   SET    read_at = NOW()
		   WHERE  receiver_id = %s
			 AND  read_at IS NULL''',
		(user_id,)
	)
	conn.commit()
	return {'marked': cursor.rowcount}


# ── POST /api/notifications/fanout/new-listing/ ───────────────────────────────
# body: { "seller_id": 1, "product_id": 42 }
# 1. Fetches all followers of seller_id
# 2. Bulk-inserts one notification per follower
# 3. Returns { receiver_ids, inserted } so Django can push live updates

@router.post('/fanout/new-listing/', response_model=FanoutResponse, status_code=201)
def fanout_new_listing(payload: FanoutRequest, db=Depends(get_db_dep)):
	conn, cursor = db

	# Verify product exists and is Active
	cursor.execute(
		"SELECT id, name, slug, price FROM products WHERE id = %s AND status = 'Active'",
		(payload.product_id,)
	)
	product = cursor.fetchone()
	if not product:
		raise HTTPException(status_code=404, detail='Product not found or not active')

	# Fetch all followers of the seller
	cursor.execute(
		'SELECT follower_id FROM follows WHERE following_id = %s',
		(payload.seller_id,)
	)
	followers = cursor.fetchall()

	if not followers:
		return FanoutResponse(receiver_ids=[], inserted=0)

	receiver_ids = [row['follower_id'] for row in followers]

	# Build payload snapshot stored in JSON column
	notif_payload = json.dumps({
		'product_name':  product['name'],
		'product_slug':  product['slug'],
		'product_price': str(product['price']),
	})

	# Bulk insert — one row per follower
	values = [
		(follower_id, payload.seller_id, 'new_listing', payload.product_id, notif_payload)
		for follower_id in receiver_ids
	]
	cursor.executemany(
		'''INSERT INTO notifications (receiver_id, actor_id, type, product_id, payload)
		   VALUES (%s, %s, %s, %s, %s)''',
		values
	)
	conn.commit()

	return FanoutResponse(receiver_ids=receiver_ids, inserted=cursor.rowcount)