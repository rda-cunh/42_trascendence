from fastapi import APIRouter, Depends, HTTPException, status
import pymysql
import hashlib
from database import get_db_dep
from models.user import UserCreate, UserAddressCreate, UserUpdate, UserPasswordUpdate,UserAddressUpdate, UserResponse, UserAddressResponse

router = APIRouter(prefix='/api/users', tags=['Users'])


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







# Visão pública
# GET /users/{id}
@router.get('/{user_id}', response_model=UserResponse)
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



