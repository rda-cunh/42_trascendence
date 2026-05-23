from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db_dep
from models.product import *
from models.notification import FanoutRequest
from routes.notifications import fanout_new_listing, _fanout_listing_event
import re
import unicodedata

router = APIRouter(prefix='/api/listings', tags=['Products'])

def generate_slug(name: str) -> str:
	name = name.lower().strip()

	name = unicodedata.normalize('NFKD', name)
	name = name.encode('ascii', 'ignore').decode('ascii')

	name = re.sub(r'[^a-z0-9\s-]', '', name)

	name = re.sub(r'[\s_-]+', '-', name)

	name = name.strip('-')

	return name

def unique_slug(cursor, base_slug):
	slug = base_slug
	counter = 1

	while True:
		cursor.execute(
			'SELECT id FROM products WHERE slug = %s',
			(slug,)
		)

		if not cursor.fetchone():
			return slug

		slug = f'{base_slug}-{counter}'
		counter += 1

# TO DO IMPROVE
# Retornar aqui uma flag bool, se é owner ou não
# Se for owner pode editar, se não, pode comprar
def GetProductInfo(db, product_id:	int):
	conn, cursor = db
	cursor.execute(
		'SELECT id, seller_id, name, slug, description, price, status, avg_rating, review_count, created_at FROM products WHERE id = %s',
		(product_id,)
	)
	product = cursor.fetchone()
	if not product or product['status'] == 'Deleted':
		raise HTTPException(status_code=404, detail='Product not found')
	
	cursor.execute(
		'''SELECT image_hash FROM product_images WHERE product_id = %s ORDER BY display_order''',
		(product['id'],)
	)
	image_rows = cursor.fetchall()
	product['images'] = [img['image_hash'] for img in image_rows]

	cursor.execute(
		'''SELECT name, email, avatar_url FROM users WHERE id = %s''',
		(product['seller_id'],)
	)
	user = cursor.fetchone()

	# TO DO
	# if product['seller_id'] == current_user['id'] || current_user['role'] == 'Admin':
	# 	user['is_owner'] = True
	# Can edit or can buy

	product['seller'] = user
	return product

def _recalc_listing_rating(cursor, product_id: int) -> None:
	cursor.execute(
		'''UPDATE products
		   SET avg_rating   = (
				 SELECT ROUND(AVG(rating), 2)
				 FROM   product_reviews
				 WHERE  product_id = %s AND status = 'approved'
				),
				review_count = (
				 SELECT COUNT(*)
				 FROM   product_reviews
				 WHERE  product_id = %s AND status = 'approved'
			   )
		   WHERE id = %s''',
		(product_id, product_id, product_id)
	)

# POST /listings
@router.post('/', response_model=ProductResponse, status_code=201)
def	create_product(product_in: ProductCreate, db=Depends(get_db_dep)):
	conn, cursor = db

	slug = unique_slug(cursor, generate_slug(product_in.name))
	
	cursor.execute(
		'''
		INSERT INTO products (seller_id, name, slug, description, price)
		VALUES (%s, %s, %s, %s, %s)
		''',
		(product_in.user_id, product_in.name, slug, product_in.description, product_in.price)
	)
	new_id = conn.insert_id()

	if product_in.images:/
		values = [(new_id, img, idx) for idx, img in enumerate(product_in.images)]
		cursor.executemany('''INSERT INTO product_images (product_id, image_hash, display_order) VALUES (%s, %s, %s)''', values)
	conn.commit()

	# Fan out 'new_listing' notifications to the seller's followers.
	# Wrapped so a notifications failure never rolls back the product creation.
	try:
		fanout_new_listing(FanoutRequest(seller_id=product_in.user_id, product_id=new_id), db)
	except Exception as e:
		print(f'fanout_new_listing failed for product {new_id}: {e}')

	product = GetProductInfo(db, new_id)
	return ProductResponse(**product)

# Missing improve to show num of pages 
# GET /listings (with filter ?search=Test or ?page=1 or ?status=Active or ?seler_id=1)
@router.get('/', response_model=list[ProductResponse])
def	list_products(
	page:		int = 1,
	search:		str | None = Query(None, description='Name or description'),
	status:		str | None = None,
	seller_id:	int | None = None,
	db=Depends(get_db_dep)
):
	conn, cursor = db
	limit = 10
	skip = (page - 1) * limit
	if page < 1:
		raise HTTPException(status_code=400, detail="Invalid page")
	sql = '''SELECT id, seller_id, name, slug, description, price, status,
					avg_rating, review_count, created_at FROM products WHERE 1=1'''
	params = []
	
	if search:
		sql += ' AND (name LIKE %s OR description LIKE %s)'
		params.extend([f'%{search}%', f'%{search}%'])
	if status:
		sql += ' AND status = %s'
		params.append(status)

	if seller_id is not None:
		sql += ' AND seller_id = %s'
		params.append(seller_id)

	sql += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'
	params.extend([limit, skip])

	cursor.execute(sql, params)
	products = cursor.fetchall()
	if not products:
		return []
	product_ids = [p['id'] for p in products]
	placeholders = ','.join(['%s'] * len(product_ids))

	cursor.execute(
		f'''SELECT product_id, image_hash AS images FROM product_images WHERE product_id IN ({placeholders}) ORDER BY display_order''', 
		tuple(product_ids)
	)
	image_rows = cursor.fetchall()
	images_map = {}
	for img in image_rows:
		pid = img['product_id']
		images_map.setdefault(pid, []).append(img['images'])
	for p in products:
		p['images'] = images_map.get(p['id'], [])
	return [ProductResponse(**p) for p in products]

# GET /listings/{product_id}
@router.get('/{product_id}/', response_model=ProductResponse)
def get_id_products(product_id: int, db=Depends(get_db_dep)):
	product = GetProductInfo(db, product_id)
	return ProductResponse(**product)

# PATCH /listings/{id}
@router.patch('/{product_id}/', response_model=ProductResponse)
def update_products(product_id: int, product_in: ProductUpdate, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM products WHERE id = %s', (product_id,))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Product not found')
	update_data = {
		k: v for k, v in product_in.model_dump(exclude_none=True).items()
		if v != ""
		}
	if not update_data:
		raise HTTPException(status_code=400, detail='No fields to update')
	set_clause = ', '.join(f'{k} = %s' for k in update_data.keys())
	values = list(update_data.values()) + [product_id]

	cursor.execute(
		f'UPDATE products SET {set_clause} WHERE id = %s',
		values
	)
	conn.commit()

	# Fan out 'listing_updated' notifications to the seller's followers.
	# Added to satisfy the subject requirement of notifications for "all creation,
	# update, and deletion actions".
	try:
		product_row = GetProductInfo(db, product_id)
		_fanout_listing_event(db, product_row['seller_id'], product_id, 'listing_updated')
	except Exception as e:/
		print(f'_fanout_listing_event (updated) failed for product {product_id}: {e}')

	product = GetProductInfo(db, product_id)
	return ProductResponse(**product)

# TO DO
# Dont delete, just set as disable
# Also "delete" images
# DELETE /listings/{id}
@router.delete('/{product_id}/', status_code=204)
def delete_product(product_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	# Capture the seller_id BEFORE the soft-delete so we know who to fan out from
	cursor.execute('SELECT seller_id FROM products WHERE id = %s', (product_id,))
	row = cursor.fetchone()
	seller_id = row['seller_id'] if row else None

	cursor.execute(
		"UPDATE products SET status = 'Deleted' WHERE id = %s AND status != 'Deleted'",
		(product_id,)
	)
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Product not found')
	conn.commit()

	# Fan out 'listing_deleted' notifications to the seller's followers.
	# Added to satisfy the subject requirement of notifications for "all creation,
	# update, and deletion actions". 
	if seller_id is not None:
		try:
			_fanout_listing_event(db, seller_id, product_id, 'listing_deleted')
		except Exception as e:
			print(f'_fanout_listing_event (deleted) failed for product {product_id}: {e}')


# PRODUCT IMAGES

@router.post('/{product_id}/images/', response_model=ProductImagesResponse, status_code=201)
def	create_product_image(product_id: int, image_in: ProductImages, db=Depends(get_db_dep)):
	conn, cursor = db
 
	cursor.execute('SELECT id FROM products WHERE id = %s', (product_id,))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Product not found')
 
	cursor.execute(
		'INSERT INTO product_images (product_id, image_hash, display_order) VALUES (%s, %s, %s)',
		(product_id, image_in.image_hash, image_in.display_order)
	)
	new_id = conn.insert_id()
	conn.commit()
 
	cursor.execute('SELECT * FROM product_images WHERE id = %s', (new_id,))
	return ProductImagesResponse(**cursor.fetchone())

@router.get('/{product_id}/images/', response_model=list[ProductImagesResponse])
def	list_product_images(product_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT id, product_id, image_hash, display_order, created_at FROM product_images WHERE product_id = %s', (product_id,))
	rows = cursor.fetchall()
	return [ProductImagesResponse(**row) for row in rows]

@router.get('/{product_id}/images/{image_id}', response_model=ProductImagesResponse)
def	get_product_image(product_id: int, image_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT id, product_id, image_hash, display_order, created_at FROM product_images WHERE product_id = %s AND id = %s', (product_id, image_id,))
	image = cursor.fetchone()
	if not image:
		raise HTTPException(status_code=404, detail='Image not found')
	return ProductImagesResponse(**image)

@router.delete('/{product_id}/images/{image_id}', status_code=204)
def delete_product_image(product_id: int, image_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute(
		'DELETE FROM product_images WHERE id = %s AND product_id = %s',
		(image_id, product_id)
	)
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Image not found')
	conn.commit()



@router.post('/{product_id}/reviews/', status_code=201)
def post_review(product_id: int, review_in: ReviewCreate, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute(
		"SELECT id, seller_id FROM products WHERE id = %s AND status != 'Deleted'",
		(product_id,)
	)
	listing = cursor.fetchone()
	if not listing:
		raise HTTPException(status_code=404, detail='Listing not found')

	if listing['seller_id'] == review_in.reviewer_id:
		raise HTTPException(status_code=400, detail='Cannot review your own listing')

	cursor.execute(
		'''SELECT oi.id AS order_items_id
		   FROM   orders o
		   JOIN   order_items oi ON oi.order_id = o.id
		   WHERE  o.buyer_id    = %s
			 AND  oi.product_id = %s
			 AND  o.status      = 'Done'
		   LIMIT 1''',
		(review_in.reviewer_id, product_id)
	)
	order_row = cursor.fetchone()
	if not order_row: 
		raise HTTPException(status_code=403, detail='Purchase not verified')

	cursor.execute(
		'SELECT id FROM product_reviews WHERE reviewer_id = %s AND product_id = %s',
		(review_in.reviewer_id, product_id)
	)
	if cursor.fetchone():
		raise HTTPException(status_code=409, detail='Already reviewed this listing')

	cursor.execute(
		'''INSERT INTO product_reviews (product_id, reviewer_id, order_items_id, rating, title, body)
		   VALUES (%s, %s, %s, %s, %s, %s)''',
		(product_id, review_in.reviewer_id, order_row['order_items_id'],
		 review_in.rating, review_in.title, review_in.body)
	)
	new_id = conn.insert_id()
	_recalc_listing_rating(cursor, product_id)
	conn.commit()
 
	cursor.execute(
		'''SELECT r.id, r.product_id, r.reviewer_id, r.rating, r.title, r.body,
				  r.status, r.created_at, r.updated_at,
				  u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
		   FROM product_reviews r
		   JOIN users u ON u.id = r.reviewer_id
		   WHERE r.id = %s''',
		(new_id,)
	)
	return ReviewResponse(**cursor.fetchone())

@router.get('/{product_id}/reviews/', response_model=list[ReviewResponse])
def list_reviews(
	product_id: int,
	page:       int = 1,
	db=Depends(get_db_dep)
):
	conn, cursor = db
 
	if page < 1:
		raise HTTPException(status_code=400, detail='Invalid page')

	limit = 10
	skip  = (page - 1) * limit

	cursor.execute(
		'''SELECT r.id, r.product_id, r.reviewer_id, r.rating, r.title, r.body,
				  r.status, r.created_at, r.updated_at,
				  u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
		   FROM product_reviews r
		   JOIN users u ON u.id = r.reviewer_id
		   WHERE r.product_id = %s AND r.status = 'Approved'
		   ORDER BY r.created_at DESC
		   LIMIT %s OFFSET %s''',
		(product_id, limit, skip)
	)
	return [ReviewResponse(**row) for row in cursor.fetchall()]
 
 
@router.get('/{product_id}/reviews/{review_id}/', response_model=ReviewResponse)
def get_review(product_id: int, review_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
 
	cursor.execute(
		'''SELECT r.id, r.product_id, r.reviewer_id, r.rating, r.title, r.body,
				  r.status, r.created_at, r.updated_at,
				  u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
		   FROM product_reviews r
		   JOIN users u ON u.id = r.reviewer_id
		   WHERE r.id = %s AND r.product_id = %s AND r.status = 'Approved' ''',
		(review_id, product_id)
	)
	review = cursor.fetchone()
	if not review:
		raise HTTPException(status_code=404, detail='Review not found')
	return ReviewResponse(**review)
 
 
@router.patch('/{product_id}/reviews/{review_id}/', response_model=ReviewResponse)
def update_review(product_id: int, review_id: int, review_in: ReviewUpdate, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute(
		'SELECT id, reviewer_id, created_at FROM product_reviews WHERE id = %s AND product_id = %s',
		(review_id, product_id)
	)
	review = cursor.fetchone()
	if not review:
		raise HTTPException(status_code=404, detail='Review not found')

	# TO DO: verificar se caller é o reviewer ou admin
	cursor.execute(
		'SELECT id FROM product_reviews WHERE id = %s AND created_at >= NOW() - INTERVAL 30 DAY',
		(review_id,)
	)
	if not cursor.fetchone():
		raise HTTPException(status_code=403, detail='Edit window expired (30 days)')

	update_data = {
		k: v for k, v in review_in.model_dump(exclude_none=True).items()
		if v != ''
	}
	if not update_data:
		raise HTTPException(status_code=400, detail='No fields to update')

	#TO DO
	# update_data['status'] = 'Pending'
	set_clause = ', '.join(f'{k} = %s' for k in update_data)
	values     = list(update_data.values()) + [review_id, product_id]
 
	cursor.execute(
		f'UPDATE product_reviews SET {set_clause} WHERE id = %s AND product_id = %s',
		values
	)
	_recalc_listing_rating(cursor, product_id)
	conn.commit()

	cursor.execute(
		'''SELECT r.id, r.product_id, r.reviewer_id, r.rating, r.title, r.body,
				  r.status, r.created_at, r.updated_at,
				  u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
		   FROM product_reviews r
		   JOIN users u ON u.id = r.reviewer_id
		   WHERE r.id = %s''',
		(review_id,)
	)
	return ReviewResponse(**cursor.fetchone())
 
 
@router.delete('/{product_id}/reviews/{review_id}/', status_code=204)
def delete_review(product_id: int, review_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	# TO DO: verificar se caller é o reviewer ou admin
	cursor.execute(
		"UPDATE product_reviews SET status = 'Deleted' WHERE id = %s AND product_id = %s",
		(review_id, product_id)
	)
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Review not found')

	_recalc_listing_rating(cursor, product_id)
	conn.commit()
 