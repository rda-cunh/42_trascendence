from fastapi import APIRouter, Depends, HTTPException, status, Query
import pymysql
import hashlib
from database import get_db_dep
from models.public import ProductResponse, UserProductsResponse, ListingResponse, UserResponse

router = APIRouter(prefix='/api/public', tags=['Users'])

def hash_pw(pw: str) -> str:
	return hashlib.sha256(pw.encode()).hexdigest()

# Filters
# GET /users (?search=test ?limit=5 ?skip=10)
@router.get('/users/', response_model=list[UserResponse])
def	list_users(
	skip:	int = 0,
	limit:	int = 20,
	search:	str | None = Query(None, description='Name or email'),
	db=Depends(get_db_dep)
):
	conn, cursor = db

	sql = 'SELECT name, email, phone, avatar_url FROM users WHERE 1=1'
	params = []

	if search:
		sql += ' AND (name LIKE %s OR email LIKE %s)'
		params.extend([f'%{search}%', f'%{search}%'])

	sql += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'
	params.extend([limit, skip])

	cursor.execute(sql, params)
	return [UserResponse(**row) for row in cursor.fetchall()]



# Visão pública
# GET /users/{id}
@router.get('/users/{user_id}/', response_model=UserProductsResponse)
def	get_user_products(user_id: int, limit: int = 20, db=Depends(get_db_dep)):
	conn, cursor = db

	# Q1 - User
	cursor.execute('SELECT name, email, phone, avatar_url FROM users WHERE id = %s', (user_id,))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	cursor.execute('SELECT id, name, slug, description, price, status FROM products WHERE seller_id = %s ORDER BY id ASC', (user_id,))
	products = cursor.fetchall()
	if not products:
		user['listings'] = []
		return UserProductsResponse(**user)
	product_ids = [p['id'] for p in products]
	placeholders = ','.join(['%s'] * len(product_ids))

	cursor.execute(f'''SELECT product_id, image_hash, display_order FROM product_images WHERE product_id IN ({placeholders}) ORDER BY display_order''',
				tuple(product_ids))
	
	image_rows = cursor.fetchall()
	images_map = {}
	for img in image_rows:
		pid = img['product_id']
		images_map.setdefault(pid, []).append({
			'image_hash': img['image_hash'],
			'display_order': img['display_order']
		})

	for p in products:
		p['images'] = images_map.get(p['id'], [])
		del p['id']
	user['listings'] = products
	return UserProductsResponse(**user)


# View user's products
# GET /users/{user_id}/listings

# Filters
# TO DO 
# Change to pagination
# GET /listings (?search=test ?limit=5 ?skip=10)
@router.get('/listings/', response_model=list[ProductResponse])
def	list_products(
	skip:	int = 0,
	limit:	int = 20,
	search:	str | None = Query(None, description='Product or description'),
	db=Depends(get_db_dep)
):
	conn, cursor = db

	sql = 'SELECT id, name, slug, description, price, status FROM products WHERE 1=1'
	params = []

	if search:
		sql += ' AND (name LIKE %s OR description LIKE %s)'
		params.extend([f'%{search}%', f'%{search}%'])

	sql += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'
	params.extend([limit, skip])

	cursor.execute(sql, params)
	products = cursor.fetchall()
	
	if not products:
		return []
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
		images_map.setdefault(pid, []).append({
			'image_hash': img['image_hash'],
			'display_order': img['display_order']
		})


	for p in products:
		p['images'] = images_map.get(p['id'], [])
		del p['id']
	return [ProductResponse(**p) for p in products]


# View specific products
# GET /listings/{product_id}
@router.get('/listings/{product_id}/', response_model=ListingResponse)
def	get_listing(product_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute("""
				SELECT u.name AS seller, u.email, u.phone, u.avatar_url,
				p.name, p.slug, p.description, p.price, p.status
				FROM products p
				INNER JOIN users u ON u.id = p.seller_id
				WHERE p.status = 'Active' AND p.id = %s
				""", (product_id,))
	row = cursor.fetchone()
	if not row:
		raise HTTPException(status_code=404, detail='Product not found')
	return ListingResponse(**row)

# @router.get('/listings/{product_id}/', response_model=ListingResponse)
# def	get_listing(product_id: int, db=Depends(get_db_dep)):
# 	conn, cursor = db
# 	cursor.execute("""
# 				SELECT u.name AS u_name, u.email AS u_email, u.phone AS u_phone, u.avatar_url AS u_avatar_url,
# 				p.name AS p_name, p.slug AS p_slug, p.description AS p_description, p.price AS p_price, p.status AS p_status
# 				FROM products p
# 				INNER JOIN users u ON u.id = p.seller_id
# 				WHERE p.status = 'Active' AND p.id = %s
# 				""", (product_id,))
# 	row = cursor.fetchone()
# 	if not row:
# 		raise HTTPException(status_code=404, detail='Product not found')
# 	return ListingResponse(**row)
