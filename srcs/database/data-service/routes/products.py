from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db_dep
from models.product import ProductCreate, ProductImages, ProductUpdate, ProductResponse, ProductImagesResponse

router = APIRouter(prefix='/api/listings', tags=['Products'])

# POST /listings
@router.post('/', response_model=ProductResponse, status_code=201)
def	create_product(product_in: ProductCreate, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT id FROM products WHERE slug = %s', (product_in.slug,))
	if cursor.fetchone():
		raise HTTPException(status_code=409, detail='Slug already in use')
	
	cursor.execute(
		'''
		INSERT INTO products (seller_id, name, slug, description, price)
		VALUES (%s, %s, %s, %s, %s)
		''',
		(product_in.user_id, product_in.name, product_in.slug, product_in.description, product_in.price)
	)
	new_id = conn.insert_id()
	cursor.execute('SELECT * FROM products WHERE id = %s', (new_id,))
	return ProductResponse(**cursor.fetchone())

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
		raise HTTPException(400, "Invalid page")
	sql = 'SELECT * FROM products WHERE 1=1'
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

	sql += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'	# Pagination
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


# TO DO IMPROVE
# Return some user infos
# GET /listings/{product_id}
@router.get('/{product_id}/', response_model=ProductResponse)
def get_id_products(product_id: int, db=Depends(get_db_dep)):
	print("Test")
	conn, cursor = db
	cursor.execute(
		'SELECT id, seller_id, name, slug, description, price, status, created_at FROM products WHERE id = %s',
		(product_id,)
	)
	product = cursor.fetchone()
	if not product:
		raise HTTPException(status_code=404, detail='Product not found')

	cursor.execute(
		f'''
		SELECT product_id, image_hash, display_order FROM product_images WHERE product_id = %s ORDER BY display_order''', 
		(product['id'],)
	)
	image_rows = cursor.fetchall()
	product['images'] = image_rows

	return [ProductResponse(**product)]

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
	cursor.execute('SELECT * FROM products WHERE id = %s', (product_id,))
	return ProductResponse(**cursor.fetchone())

# TO DO
# Dont delete, just set as disable
# Also "delete" images
# DELETE /listings/{id}
@router.delete('/{product_id}/', status_code=204)
def delete_product(product_id: int, db=Depends(get_db_dep)):
	con, cursor = db
	cursor.execute('DELETE FROM products WHERE id = %s', (product_id))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Product not found')


# PRODUCT IMAGES

@router.post('/{product_id}/images/', response_model=ProductImagesResponse, status_code=201)
def	create_product_image(product_id: int, image_in: ProductImages, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT * FROM products WHERE id = %s', (product_id,))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Product not found')

	cursor.execute(
		'''
		INSERT INTO product_images (product_id, image_hash, display_order)
		VALUES (%s, %s, %s)
		''',
		(product_id, image_in.image_hash, image_in.display_order,)
	)
	new_id = conn.insert_id()
	cursor.execute('SELECT * FROM product_images WHERE id = %s', (new_id))
	new_image = cursor.fetchone()

	return (ProductImagesResponse(**new_image))

@router.get('/{product_id}/images/', response_model=ProductImagesResponse)
def	list_product_images(product_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM product_images WHERE product_id = %s', (product_id,))
	rows = cursor.fetchall()
	return [ProductImagesResponse(**row) for row in rows]

@router.get('/{product_id}/images/{image_id}', response_model=ProductImagesResponse)
def	get_product_image(product_id: int, image_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM product_images WHERE product_id = %s AND id = %s', (product_id, image_id,))
	image = cursor.fetchone()
	if not image:
		raise HTTPException(status_code=404, detail='Image not found')
	return ProductImagesResponse(**image)

@router.delete('/{product_id}/images/{image_id}', status_code=204)
def delete_user(product_id: int, image_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('DELETE FROM product_images WHERE id = %s', (image_id,))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Image not found')


# POST /product_review




# GET /product_review




# PATCH /product_review



# DELETE /product_review



