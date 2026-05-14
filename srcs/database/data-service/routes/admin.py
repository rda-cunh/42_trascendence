from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db_dep
from models.admin import *

router = APIRouter(prefix='/api/admin', tags=['Users'])

@router.get('/bans/', response_model=list[UserInfo], status_code=200)
def get_bans(page: int = 1, db = Depends(get_db_dep)):
	conn, cursor = db
	limit = 10
	skip = (page - 1) * limit

	cursor.execute("""
			SELECT
				id, name, avatar_url, email, phone, created_at, updated_at
			FROM users
			WHERE status = 'Banned'
			ORDER BY name ASC LIMIT %s OFFSET %s""", (limit, skip))
	users = cursor.fetchall()
	return [UserInfo(**row) for row in users]

@router.post('/bans/{user_id}/', response_model=UserInfo, status_code=200)
def ban_user(user_id: int, db = Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute("""SELECT id FROM users WHERE id = %s AND status != %s""", (user_id, 'Banned'))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=400, detail='User does\'t exist or is already banned')
	cursor.execute("""UPDATE users SET status = %s WHERE id = %s""", ('Banned', user_id))
	cursor.execute(""" SELECT * FROM users WHERE id = %s""", (user_id,))
	updated_user = cursor.fetchone()

	return updated_user

@router.delete('/bans/{user_id}/', response_model=UserInfo, status_code=200)
def unban_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute("""SELECT id FROM users WHERE id = %s AND status = %s""", (user_id, 'Banned'))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=400, detail="User doesn't exist or is not banned")
	cursor.execute("""UPDATE users SET status = %s WHERE id = %s""", ('Active', user_id))

	cursor.execute("""SELECT * FROM users WHERE id = %s""", (user_id,))
	updated_user = cursor.fetchone()

	return updated_user

@router.get('/manage/', response_model=list[UserInfo], status_code=200)
def get_admins(page: int = 1, db = Depends(get_db_dep)):
	conn, cursor = db
	limit = 10
	skip = (page - 1) * limit

	cursor.execute("""
			SELECT
				id, name, avatar_url, email, phone, created_at, updated_at
			FROM users
			WHERE role = 'Admin'
			ORDER BY name ASC LIMIT %s OFFSET %s""", (limit, skip))
	users = cursor.fetchall()
	return [UserInfo(**row) for row in users]

@router.post('/manage/{user_id}/', response_model=UserInfo, status_code=200)
def admin_user(user_id: int, db = Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute("""SELECT id FROM users WHERE id = %s AND role != %s""", (user_id, 'Admin'))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=400, detail='User does\'t exist or is already admin')
	cursor.execute("""UPDATE users SET role = %s WHERE id = %s""", ('Admin', user_id))
	cursor.execute(""" SELECT * FROM users WHERE id = %s""", (user_id,))
	updated_user = cursor.fetchone()

	return updated_user

@router.delete('/manage/{user_id}/', response_model=UserInfo, status_code=200)
def unadmin_user(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute("""SELECT COUNT(*) AS total FROM users WHERE role = 'Admin'""")
	result = cursor.fetchone()
	total_admins = result["total"]
	if total_admins == 1:
		raise HTTPException(status_code=409, detail="Cannot remove the last admin")

	cursor.execute("""SELECT id FROM users WHERE id = %s AND role = %s""", (user_id, 'Admin'))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=400, detail="User doesn't exist or is not admin")
	cursor.execute("""UPDATE users SET role = %s WHERE id = %s""", ('User', user_id))

	cursor.execute("""SELECT * FROM users WHERE id = %s""", (user_id,))
	updated_user = cursor.fetchone()

	return updated_user
