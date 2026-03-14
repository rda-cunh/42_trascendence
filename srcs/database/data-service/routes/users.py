from fastapi import APIRouter, Depends, HTTPException, status
import pymysql
import hashlib
from database import get_db_dep
from models.user import UserCreate, UserAddressCreate, UserUpdate,UserAddressUpdate, UserResponse, UserAddressResponse

router = APIRouter(prefix='/users', tags=['Users'])

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
# TO DO


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
# TO DO

# DELETE /users/{id}/address
@router.delete('/{user_id}/address', status_code=204)
def delete_address(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('DELETE FROM users_address WHERE users_id = %s', (user_id,))
	if cursor.rowcount == 0:
		raise HTTPException(status_code=404, detail='Address not found')
