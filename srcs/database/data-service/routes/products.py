from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db_dep
from models.product import ProductCreate, ProductImagesCreate, ProductUpdate, ProductResponse, ProductImagesResponse

router = APIRouter(prefix='/api/listings', tags=['Products'])

# POST /listings
@router.post('/', response_model=ProductResponse, status_code=201)
def	create_product(product_in: ProductCreate, seller_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT id FROM products WHERE slug = %s', (product_in.slug,))
	if cursor.fetchone():
		raise HTTPException(status_code=409, detail='Slug already in use')
	
	cursor.execute(
		'''
		INSERT INTO products (seller_id, name, slug, description, price)
		VALUES (%s, %s, %s, %s, %s)
		''',
		(seller_id, product_in.name, product_in.slug, product_in.description, product_in.price)
	)
	new_id = conn.insert_id()
	cursor.execute('SELECT * FROM products WHERE id = %s', (new_id,))
	return ProductResponse(**cursor.fetchone())

# GET /listings (with filter ?search or ?limit or ?skip)
@router.get('/', response_model=list[ProductResponse])
def	list_products(
	skip:		int = 0,
	limit:		int = 20,
	search:		str | None = Query(None, description='Name or description'),
	status:		str | None = None,
	seller_id:	int | None = None,
	db=Depends(get_db_dep)
):
	conn, cursor = db

	sql = 'SELECT * FROM products WHERE 1=1'
	params = []
	
	if search:
		sql += ' AND (name LIKE %s OR description LIKE %s)'
		params.extend([f'%{search}%', f'%{search}%'])
	if status:
		sql += ' AND status = %s'
		params.append(status)

	if seller_id:
		sql += ' AND seller_id = %s'
		params.append(seller_id)

	sql += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'	# Pagination
	params.extend([limit, skip])

	cursor.execute(sql, params)
	return [ProductResponse(**row) for row in cursor.fetchall()]

# GET /listings/seller/{seller_id}
@router.get('/seller/{seller_id}/', response_model=list[ProductResponse])
def get_seller_products(seller_id: int, db=Depends(get_db_dep)):
	print("Test")
	conn, cursor = db
	cursor.execute(
		'SELECT * FROM products WHERE seller_id = %s',
		(seller_id,)
	)
	rows = cursor.fetchall()
	return [ProductResponse(**row) for row in rows]

# GET /listings/seller/{product_id}
@router.get('/seller/{product_id}/', response_model=list[ProductResponse])
def get_id_products(product_id: int, db=Depends(get_db_dep)):
	print("Test")
	conn, cursor = db
	cursor.execute(
		'SELECT * FROM products WHERE id = %s',
		(product_id,)
	)
	rows = cursor.fetchall()
	return [ProductResponse(**row) for row in rows]

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


# DELETE /listings/{id}
@router.delete('/{product_id}/', status_code=204)
def delete_product(product_id: int, db=Depends(get_db_dep)):
	con, cursor = db
	cursor.execute('DELETE FROM products WHERE id = %s', (product_id))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Product not found')


# PRODUCT IMAGES

@router.post('/{product_id}/images/', response_model=ProductImagesResponse, status_code=201)
def	create_product_image(product_id: int, image_in: ProductImagesCreate, db=Depends(get_db_dep)):
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





# POST /product_review




# GET /product_review




# PATCH /product_review



# DELETE /product_review



