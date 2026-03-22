from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db_dep
from models.order import OrderCreate, OrderItemCreate, OrderResponse, OrderItemResponse, OrderUpdate
import uuid
from decimal import Decimal

router = APIRouter(prefix='/api/orders', tags=['Orders'])

# Generate uniq code for orders
def generate_order_code() -> str:
	return f'ORD-{uuid.uuid4().hex[:8].upper()}'

# POST /orders
@router.post('/', response_model=OrderResponse, status_code=201)
def create_order(order_in: OrderCreate, db=Depends(get_db_dep)):
	conn, cursor = db

	items_data = []
	total = 0

	for item in order_in.items:
		cursor.execute(
			'SELECT id, name, price, seller_id FROM products WHERE id = %s AND status = %s',
			(item.product_id, 'active')
		)
		product = cursor.fetchone()
		if not product:
			raise HTTPException(status_code=404, detail=f'Product [item.product_id] not found or inactive')
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
		INSERT INTO orders (code, buyer_id, buyer_address_id, subtotal, total, notes)
		VALUES (%s, %s, %s, %s, %s, %s)
		''',
		(generate_order_code(), order_in.buyer_id, order_in.buyer_address_id, total, total, order_in.notes)
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
	cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
	order = cursor.fetchone()
	cursor.execute('SELECT * FROM order_items WHERE order_id = %s', (order_id,))
	order['items'] = cursor.fetchall()

	return OrderResponse(**order)

# GET /orders/{order_id}
@router.get('/{order_id}', response_model=OrderResponse)
def get_order(order_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	# Q1 - order data
	cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
	order = cursor.fetchone()
	if not order:
		raise HTTPException(status_code=404, detail='Order not found')

	# Q2 - Order items
	cursor.execute('SELECT * FROM order_items WHERE order_id = %s ORDER BY id', (order_id,))
	order['items'] = cursor.fetchall()

	return OrderResponse(**order)

# GET /orders/buyer/{id}
@router.get('/buyer/{buyer_id}', response_model=list[OrderResponse])
def get_buyer_orders(buyer_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT * FROM orders WHERE buyer_id = %s ORDER BY created_at DESC', (buyer_id,))
	orders = cursor.fetchall()

	for order in orders:
		cursor.execute('SELECT * FROM order_items WHERE order_id = %s', (order['id'],))
		order['items'] = cursor.fetchall()
	
	return [OrderResponse(**o) for o in orders]

# PATCH /orders{order_id}
@router.patch('/{order_id}', response_model=OrderResponse)
def update_orders(order_id: int, order_in: OrderUpdate, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Order not found')
	update_data = order_in.model_dump(exclude_unset=True)
	if not update_data:
		raise HTTPException(status_code=400, detail='No fields to update')
	set_clause = ', '.join(f'{k} = %s' for k in update_data.keys())
	values = list(update_data.values()) + [order_id]

	cursor.execute(
		f'UPDATE orders SET {set_clause} WHERE id = %s',
		values
	)
	cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
	return OrderResponse(**cursor.fetchone())

