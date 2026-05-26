from fastapi import APIRouter, Depends, HTTPException, status
import pymysql
import bcrypt
from database import get_db_dep
from models.auth import *

router = APIRouter(prefix='/api/auth', tags=['Users'])

_USER_UPDATABLE_FIELDS = {'name', 'phone', 'avatar_url'}

# AUTH
def hash_pw(pw: str) -> bytes:
	return bcrypt.hashpw(pw.encode(), bcrypt.gensalt())

def verify_pw(pw: str, hashed: bytes) -> bool:
	return bcrypt.checkpw(pw.encode(), hashed)

# Create new user
@router.post('/register/', response_model=UserResponse, status_code=201)
def create_user(user_in: UserCreate, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute(
		'SELECT id FROM users WHERE email = %s',
		(user_in.email,)
	)
	if cursor.fetchone():
		raise HTTPException(status_code=409, detail='Email already registered')
	
	cursor.execute(
		'''
		INSERT INTO users (name, email, password_hash, phone, avatar_url)
		VALUES (%s, %s, %s, %s, %s)
		''',
		(
			user_in.name,
			user_in.email,
			hash_pw(user_in.password),
			user_in.phone,
			user_in.avatar_url
		)
	)
	new_id = conn.insert_id()
	conn.commit()
	cursor.execute('SELECT * FROM users WHERE id = %s', (new_id,))
	new_user = cursor.fetchone()

	return UserResponse(**new_user)

# Soft-delete user (preserve order/review history)
@router.delete('/register/{user_id}/', status_code=204)
def delete_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute(
		"UPDATE users SET status = 'Deactivated' WHERE id = %s AND status != 'Deactivated'",
		(user_id,)
	)
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='User not found')
	conn.commit()

@router.get('/by-email/', response_model=UserResponse, status_code=200)
def get_user_by_email(email: str, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	return UserResponse(**user)


@router.post('/login/', response_model=UserResponse, status_code=200)
def login_user(user_in: UserLogin, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute(
		'SELECT * FROM users WHERE email = %s',
		(user_in.email,)
	)
	user = cursor.fetchone()
	if not user or not verify_pw(user_in.password, user['password_hash']):
		raise HTTPException(status_code=401, detail='Invalid credentials')
	if user['status'] != 'Active':
		raise HTTPException(status_code=403, detail='User is not active')
	return UserResponse(**user)


@router.get('/profile/{user_id}/', response_model=ProfileResponse, status_code=200)
def get_user(user_id: int, page: int = 1, db=Depends(get_db_dep)):
	conn, cursor = db
	limit = 10
	if page < 1:
		raise HTTPException(status_code=400, detail='Invalid page')
	skip = (page - 1) * limit

	cursor.execute('SELECT name, email, phone, avatar_url FROM users WHERE id = %s', (user_id,))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	user['owner'] = True
	
	cursor.execute('SELECT COUNT(*) AS total FROM products WHERE seller_id = %s AND status = %s', (user_id, 'Active'))
	n_prod = cursor.fetchone()['total']
	user['pages'] = (n_prod // 10) if (n_prod % 10) == 0 else (n_prod // 10 + 1)

	cursor.execute(
		'SELECT id, name, slug, description, price, status, avg_rating, review_count FROM products WHERE seller_id = %s AND status = %s ORDER BY created_at DESC LIMIT %s OFFSET %s',
		(user_id, 'Active', limit, skip)
	)
	products = cursor.fetchall()
	if not products:
		user['listings'] = []
		return ProfileResponse(**user)

	product_ids = [p['id'] for p in products]
	placeholders = ','.join(['%s'] * len(product_ids))

	cursor.execute(
		f'SELECT product_id, image_hash AS images FROM product_images WHERE product_id IN ({placeholders}) ORDER BY display_order',
		tuple(product_ids)
	)
	
	image_rows = cursor.fetchall()
	images_map = {}

	for img in image_rows:
		pid = img['product_id']
		images_map.setdefault(pid, []).append(img['images'])

	for p in products:
		p['images'] = images_map.get(p['id'], [])
	user['listings'] = products
	return ProfileResponse(**user)

# Update user infos
@router.patch('/profile/{user_id}/', response_model=UserResponse, status_code=200)
def update_user(user_id: int, user_in: UserUpdate, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='User not found')

	update_data = {
		k: v for k, v in user_in.model_dump(exclude_none=True).items()
		if v != "" and k in _USER_UPDATABLE_FIELDS
	}
	if not update_data:
		raise HTTPException(status_code=400, detail='No fields to update')

	cursor.execute(
		'''UPDATE users
		   SET
		       name       = COALESCE(%s, name),
		       phone      = COALESCE(%s, phone),
		       avatar_url = COALESCE(%s, avatar_url)
		   WHERE id = %s''',
		(
			update_data.get('name'),
			update_data.get('phone'),
			update_data.get('avatar_url'),
			user_id,
		)
	)
	conn.commit()

	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
	return UserResponse(**cursor.fetchone())

# Update password
@router.patch('/profile/password/{user_id}/', response_model=UserResponse, status_code=200)
def update_user_password(user_id: int, user_in: UserPasswordUpdate, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT password_hash FROM users WHERE id = %s', (user_id,))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	if not verify_pw(user_in.oldPass, user['password_hash']):
		raise HTTPException(status_code=400, detail="Password doesn't match")
	
	cursor.execute('UPDATE users SET password_hash = %s WHERE id = %s', (hash_pw(user_in.newPass), user_id))
	conn.commit()

	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
	return UserResponse(**cursor.fetchone())


# Set user as deactivated
@router.delete('/profile/{user_id}/', status_code=204)
def deactivate_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute(
		"UPDATE users SET status = 'Deactivated' WHERE id = %s AND status != 'Deactivated'",
		(user_id,)
	)
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='User not found')
	conn.commit()