from fastapi import APIRouter, Depends, HTTPException, status
import pymysql
import hashlib
from database import get_db_dep
from models.user import UserCreate, UserAddressCreate, UserUpdate, UserPasswordUpdate,UserAddressUpdate, UserResponse, UserAddressResponse

router = APIRouter(prefix='/api/users', tags=['Users'])

def hash_pw(pw: str) -> str:
	return hashlib.sha256(pw.encode()).hexdigest()

# Admin
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


# Create new user
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





# Visão pública
# GET /users/{id}
@router.get('/{user_id}/', response_model=UserResponse)
def	get_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM users WHERE id = %s', (user_id))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	return UserResponse(**user)


# View user's products
# GET /users/{user_id}/listings



# View specific products from user
# GET /users/{user_id}/listings/{product_id}



