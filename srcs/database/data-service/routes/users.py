from fastapi import APIRouter, Depends, HTTPException, status, Query
import pymysql
import hashlib
from database import get_db_dep
from models.user import UserResponse

router = APIRouter(prefix='/api/users', tags=['Users'])


@router.get('/{user_id}/', response_model=UserResponse)
def	get_profile(user_id: int, page: int = 1, db=Depends(get_db_dep)):
	conn, cursor = db
	limit = 10
	skip = (page - 1) * limit

	cursor.execute('SELECT name, email, avatar_url, created_at FROM users WHERE id = %s', (user_id,))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	
	cursor.execute('SELECT COUNT(*) FROM products WHERE seller_id = %s AND status = %s', (user_id, 'Active'))
	n_prod = cursor.fetchone()['COUNT(*)']
	user['pages'] = (n_prod // 10) if (n_prod % 10) == 0 else (n_prod // 10 + 1)

	cursor.execute('SELECT id, name, description, price FROM products WHERE seller_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s', (user_id, limit, skip))
	products = cursor.fetchall()
	if not products:
		user['listings'] = []
		return UserResponse(**user)

	product_ids = [p['id'] for p in products]
	placeholders = ','.join(['%s'] * len(product_ids))

	cursor.execute(
		f'''
		SELECT product_id, image_hash, display_order FROM product_images WHERE product_id IN ({placeholders}) ORDER BY display_order''',
		tuple(product_ids)
	)
	image_rows = cursor.fetchall()
	images_map = {}

	for img in image_rows:
		pid = img['product_id']
		images_map.setdefault(pid, []).append({'image_hash': img['image_hash'], 'display_order': img['display_order']})
	
	for p in products:
		p['images'] = images_map.get(p['id'], [])
		del p['id']
	user['listings'] = products
	return (UserResponse(**user))


