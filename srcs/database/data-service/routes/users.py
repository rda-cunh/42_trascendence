from fastapi import APIRouter, Depends, HTTPException, status
import pymysql
import hashlib
from database import get_db_dep
from models.user import UserCreate, UserAddressCreate, UserUpdate, UserPasswordUpdate,UserAddressUpdate, UserResponse, UserAddressResponse

router = APIRouter(prefix='/api/users', tags=['Users'])

def hash_pw(pw: str) -> str:
	return hashlib.sha256(pw.encode()).hexdigest()

# POST /users
@router.post('/', response_model=UserResponse, status_code=201)
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

# GET /users
@router.get('/', response_model=list[UserResponse])
def	list_users(skip: int = 0, limit: int = 20, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute(
		'SELECT * FROM users ORDER BY created_at DESC LIMIT %s OFFSET %s',
		(limit, skip)
	)
	rows = cursor.fetchall()
	return [UserResponse(**row) for row in rows]

# GET /users/{id}
@router.get('/{user_id}', response_model=UserResponse)
def	get_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	return UserResponse(**user)

# PATCH /users/{id}
@router.patch('/{user_id}', response_model=UserResponse)
def update_user(user_id: int, user_in: UserUpdate, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id, ))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='User not found')
	update_data = user_in.model_dump(exclude_unset=True)
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

# PATCH /users/{id}/password
@router.patch('/{user_id}/password', response_model=UserResponse)
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

# DELETE /users/{id}
@router.delete('/{user_id}', status_code=204)
def delete_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='User not found')

# USER ADDRESS

#POST /user/{id}/address
@router.post('/{user_id}/address', response_model=UserAddressResponse, status_code=201)
def create_user_address(user_id: int, address_in: UserAddressCreate, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='User doesn\'t exist')
	cursor.execute('SELECT * FROM users_address WHERE users_id = %s', (user_id,))
	if cursor.rowcount == 1:
		raise HTTPException(status_code=409, detail='User already have a address')

	cursor.execute(
		'''
		INSERT INTO users_address (users_id, label, street, number, complement, city, state, postal_code, country)
		VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
		''',
		(user_id, address_in.label, address_in.street, address_in.number, address_in.complement,
		address_in.city, address_in.state, address_in.postal_code, address_in.country,)
	)
	new_id = conn.insert_id()
	cursor.execute('SELECT * FROM users_address WHERE id = %s', (new_id))
	new_address = cursor.fetchone()

	return UserAddressResponse(**new_address)

# GET /user/{id}/address
@router.get('/{user_id}/address', response_model=UserAddressResponse)
def get_user_address(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM users_address WHERE users_id = %s', (user_id,))
	address = cursor.fetchone()
	if not address:
		raise HTTPException(status_code=404, detail='Address not found')
	return UserAddressResponse(**address)

# PATCH /users/{id}/address
@router.patch('/{user_id}/address', response_model=UserAddressResponse)
def update_user_address(user_id: int, user_in: UserAddressUpdate, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM users_address WHERE users_id = %s', (user_id, ))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Address not found')
	update_data = user_in.model_dump(exclude_unset=True)
	if not update_data:
		raise HTTPException(status_code=400, detail='No fields to update')
	set_clause = ', '.join(f'{k} = %s' for k in update_data.keys())
	values = list(update_data.values()) + [user_id]
	cursor.execute(
		f'UPDATE users_address SET {set_clause} WHERE users_id = %s',
		values
	)

	cursor.execute('SELECT * FROM users_address WHERE users_id = %s', (user_id,))
	return UserAddressResponse(**cursor.fetchone())

# DELETE /users/{id}/address
@router.delete('/{user_id}/address', status_code=204)
def delete_address(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('DELETE FROM users_address WHERE users_id = %s', (user_id,))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Address not found')
