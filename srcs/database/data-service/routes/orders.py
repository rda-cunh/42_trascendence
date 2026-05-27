from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db_dep
from models.order import OrderCreate, OrderItemCreate, OrderResponse, OrderItemResponse, OrderUpdate
import uuid
from decimal import Decimal

router = APIRouter(prefix='/api/orders', tags=['Orders'])

_ORDER_UPDATABLE_FIELDS = {'status', 'notes'}

# Generate uniq code for orders
def generate_order_code() -> str:
	return f'ORD-{uuid.uuid4().hex[:8].upper()}'

# Verificar se seller_id != user_id
# POST /orders
@router.post('/', response_model=OrderResponse, status_code=201)
def create_order(order_in: OrderCreate, db=Depends(get_db_dep)):
	conn, cursor = db

	items_data = []
	total = 0

	for item in order_in.items:
		cursor.execute(
			'SELECT id, name, price, seller_id FROM products WHERE id = %s AND status = %s',
			(item.product_id, 'Active')
		)
		product = cursor.fetchone()
		if not product:
			raise HTTPException(status_code=404, detail=f'Product not found or inactive')
		if product['seller_id'] == order_in.user_id:
			raise HTTPException(status_code=400, detail=f'Product belongs to the buyer')
		subtotal = Decimal(product['price']) * item.qty
		total += subtotal
		items_data.append({
			'product_id':	product['id'],
			'seller_id':	product['seller_id'],
			'product_name':	product['name'],
			'price':		product['price'],
			'qty':			item.qty,
			'subtotal':		subtotal
		})
	cursor.execute(
		'''
		INSERT INTO orders (code, buyer_id, subtotal, total, notes)
		VALUES (%s, %s, %s, %s, %s)
		''',
		(generate_order_code(), order_in.user_id, total, total, order_in.notes)
	)
	order_id = conn.insert_id()

	for item_data in items_data:
		cursor.execute(
			'''
			INSERT INTO order_items (order_id, product_id, seller_id, product_name, price, qty, subtotal)
			VALUES (%s, %s, %s, %s, %s, %s, %s)
			''',
			(order_id, item_data['product_id'], item_data['seller_id'], item_data['product_name'],
			item_data['price'], item_data['qty'], item_data['subtotal'])
		)
	conn.commit()
	cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
	order = cursor.fetchone()
	cursor.execute('SELECT * FROM order_items WHERE order_id = %s', (order_id,))
	order['items'] = cursor.fetchall()

	return OrderResponse(**order)

# GET /orders/{order_id}
@router.get('/{order_id}/', response_model=OrderResponse, status_code=200)
def get_order(order_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
	order = cursor.fetchone()
	if not order:
		raise HTTPException(status_code=404, detail='Order not found')
	cursor.execute('SELECT * FROM order_items WHERE order_id = %s ORDER BY id', (order_id,))
	order['items'] = cursor.fetchall()

	return OrderResponse(**order)

# GET /orders/buyer/{id}
@router.get('/buyer/{buyer_id}/', response_model=list[OrderResponse], status_code=200)
def get_buyer_orders(buyer_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT * FROM orders WHERE buyer_id = %s ORDER BY created_at DESC', (buyer_id,))
	orders = cursor.fetchall()

	# TO DO
	# N + 1
	for order in orders:
		cursor.execute('SELECT * FROM order_items WHERE order_id = %s', (order['id'],))
		order['items'] = cursor.fetchall()
	
	return [OrderResponse(**o) for o in orders]

# GET /orders/seller/{id}
@router.get('/seller/{seller_id}/', response_model=list[OrderResponse], status_code=200)
def get_seller_orders(seller_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute(
		'''
		SELECT DISTINCT o.*
		FROM orders o
		INNER JOIN order_items oi ON oi.order_id = o.id
		WHERE oi.seller_id = %s
		ORDER BY o.created_at DESC
		''',
		(seller_id,)
	)
	orders = cursor.fetchall()

	for order in orders:
		cursor.execute(
			'SELECT * FROM order_items WHERE order_id = %s AND seller_id = %s',
			(order['id'], seller_id)
		)
		order['items'] = cursor.fetchall()

	return [OrderResponse(**o) for o in orders]

# PATCH /orders{order_id}
@router.patch('/{order_id}/', response_model=OrderResponse, status_code=200)
def update_orders(order_id: int, order_in: OrderUpdate, db=Depends(get_db_dep)):
	conn, cursor = db
 
	cursor.execute(
		"SELECT * FROM orders WHERE id = %s AND status NOT IN ('Cancelled', 'Done')",
		(order_id,)
	)
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Order not found or cannot be edited')
 
	update_data = {
		k: v for k, v in order_in.model_dump(exclude_none=True).items()
		if v != "" and k in _ORDER_UPDATABLE_FIELDS
	}
	if not update_data:
		raise HTTPException(status_code=400, detail='No fields to update')
 
	cursor.execute(
		'''UPDATE orders
		   SET
		       status = COALESCE(%s, status),
		       notes  = COALESCE(%s, notes)
		   WHERE id = %s''',
		(
			update_data.get('status'),
			update_data.get('notes'),
			order_id,
		)
	)
	conn.commit()
 
	cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
	order = cursor.fetchone()
	cursor.execute('SELECT * FROM order_items WHERE order_id = %s ORDER BY id', (order_id,))
	order['items'] = cursor.fetchall()
	return OrderResponse(**order)