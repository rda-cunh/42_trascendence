from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db_dep
from models.product import ProductCreate, ProductImagesCreate, ProductUpdate, ProductResponse, ProductImagesResponse

router = APIRouter(prefix='/products', tags=['Products'])

# POST /products
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

# GET /products (with filter ?search or ?limit or ?skip)
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

	sql += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'
	params.extend([limit, skip])

	cursor.execute(sql, params)
	return [ProductResponse(**row) for row in cursor.fetchall()]

# GET /products/seller/{seller_id}
@router.get('/seller/{seller_id}', response_model=list[ProductResponse])
def get_seller_products(seller_id: int, db=Depends(get_db_dep)):
	print("Test")
	conn, cursor = db
	cursor.execute(
		'SELECT * FROM products WHERE seller_id = %s',
		(seller_id,)
	)
	rows = cursor.fetchall()
	return [ProductResponse(**row) for row in rows]

# PATCH /products/{id}
# TO DO


# DELETE /products/{id}
@router.delete('/{product_id}', status_code=204)
def delete_product(product_id: int, db=Depends(get_db_dep)):
	con, cursor = db
	cursor.execute('DELETE FROM products WHERE id = %s', (product_id))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Product not found')


# PRODUCT IMAGES

@router.post('/{product_id}/images', response_model=ProductImagesResponse, status_code=201)
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

@router.get('/{product_id}/images', response_model=ProductImagesResponse)
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
