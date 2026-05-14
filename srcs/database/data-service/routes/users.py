from fastapi import APIRouter, Depends, HTTPException, status, Query
import pymysql, json
from database import get_db_dep
from models.user import UserResponse

router = APIRouter(prefix='/api/users', tags=['Users'])


@router.get('/{user_id}/', response_model=UserResponse)
def	get_profile(user_id: int, page: int = 1, db=Depends(get_db_dep)):
	conn, cursor = db
	limit = 10
	skip = (page - 1) * limit

	cursor.execute('SELECT name, email, avatar_url, created_at FROM users WHERE id = %s', (user_id,))
	user = cursor.fetchone()
	if not user:
		raise HTTPException(status_code=404, detail='User not found')
	
	cursor.execute('SELECT COUNT(*) FROM products WHERE seller_id = %s AND status = %s', (user_id, 'Active'))
	n_prod = cursor.fetchone()['COUNT(*)']
	user['pages'] = (n_prod // 10) if (n_prod % 10) == 0 else (n_prod // 10 + 1)

	cursor.execute('SELECT id, name, description, price, images FROM products WHERE seller_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s', (user_id, limit, skip))
	products = cursor.fetchall()
	user['owner'] = False		## Check user_id == current_user['id'] || current_user['role'] == 'Admin'
	if not products:
		user['listings'] = []
		return UserResponse(**user)

	def normalize_images(value):
		if value is None:
			return []
		if isinstance(value, list):
			return [str(item) for item in value]
		if isinstance(value, str):
			value = value.strip()
			if not value:
				return []
			try:
				parsed = json.loads(value)
				if isinstance(parsed, list):
					return [str(item) for item in parsed]
			except json.JSONDecodeError:
				pass
		return []

	for p in products:
		p['images'] = normalize_images(p.get('images'))
		del p['id']
	user['listings'] = products
	return (UserResponse(**user))


# Admin view
# TO DO

