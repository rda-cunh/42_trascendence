from fastapi import APIRouter, Depends, HTTPException, status
import pymysql
import hashlib
from database import get_db_dep
from models.auth import *

router = APIRouter(prefix='/api/auth', tags=['Users'])

# AUTH
def hash_pw(pw: str) -> str:
	return hashlib.sha256(pw.encode()).hexdigest()

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
	
	cursor.execute('SELECT * FROM users WHERE id = %s', (new_id))
	new_user = cursor.fetchone()

	return UserResponse(**new_user)

# delete user from table
@router.delete('/register/{user_id}/', status_code=204)
def delete_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='User not found')


# internal lookup by email (used by backend OAuth flow on duplicate-email)
@router.get('/by-email/', response_model=UserResponse, status_code=200)
def get_user_by_email(email: str, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	return UserResponse(**user)


# @router.post('/login', response_model=200)
# email and password
@router.post('/login/', response_model=UserResponse, status_code=200)
def login_user(user_in: UserLogin, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute(
		'SELECT * FROM users WHERE email = %s',
		(user_in.email,)
	)
	user = cursor.fetchone()
	if not user or user['password_hash'] != hash_pw(user_in.password):
		raise HTTPException(status_code=401, detail='Invalid credentials')
	if user['status'] != 'Active':
		raise HTTPException(status_code=403, detail='User is not active')
	return UserResponse(**user)


# @router.delete('/login', response_model=200)
# Delete access



# TO DO
# Check token to see self profile
@router.get('/profile/{user_id}/', response_model=ProfileResponse)
def	get_user(user_id: int, page: int = 1, db=Depends(get_db_dep)):
	conn, cursor = db
	limit = 10
	skip = (page - 1) * limit

	cursor.execute('SELECT name, email, phone, avatar_url FROM users WHERE id = %s', (user_id,))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	user['owner'] = True
	
	cursor.execute('SELECT COUNT(*) FROM products WHERE seller_id = %s AND status = %s', (user_id, 'Active'))
	n_prod = cursor.fetchone()['COUNT(*)']
	user['pages'] = (n_prod // 10) if (n_prod % 10) == 0 else (n_prod // 10 + 1)

	cursor.execute('SELECT id, name, slug, description, price, status FROM products WHERE seller_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s', (user_id, limit, skip))
	products = cursor.fetchall()
	if not products:
		user['listings'] = []
		return ProfileResponse(**user)

	product_ids = [p['id'] for p in products]
	placeholders = ','.join(['%s'] * len(product_ids))

	cursor.execute(f'''SELECT product_id, image_hash AS images FROM product_images WHERE product_id IN ({placeholders}) ORDER BY display_order''',
				tuple(product_ids))
	
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
	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id, ))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='User not found')
	update_data = { k: v for k, v in user_in.model_dump(exclude_none=True).items()
    	if v != ""}
	if not update_data:
		raise HTTPException(status_code=400, detail='No fields to update')
	set_clause = ', '.join(f'{k} = %s' for k in update_data.keys())
	values = list(update_data.values()) + [user_id]
	cursor.execute(
		f'UPDATE users SET {set_clause} WHERE id = %s',
		values
	)

	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
	return UserResponse(**cursor.fetchone())

# Update password
@router.patch('/profile/password/{user_id}/', response_model=UserResponse, status_code=200)
def update_user_password(user_id: int, user_in: UserPasswordUpdate, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT password_hash FROM users WHERE id = %s', (user_id, ))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	if user['password_hash'] != hash_pw(user_in.oldPass):
		raise HTTPException(status_code=400, detail="Password doesn't match")
	
	cursor.execute('UPDATE users SET password_hash = %s WHERE id = %s', (hash_pw(user_in.newPass), user_id))
	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
	return UserResponse(**cursor.fetchone())


# Set user as deactivated
@router.delete('/profile/{user_id}/', status_code=204)
def deactivate_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id, ))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='User not found')

	cursor.execute('UPDATE users SET status = "Deactivated" WHERE id = %s', (user_id,))
