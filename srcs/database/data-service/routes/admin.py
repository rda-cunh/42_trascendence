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

@router.post('/bans/{user_id}/', response_model=UserInfo, status_code=201)
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

@router.post('/manage/{user_id}/', response_model=UserInfo, status_code=201)
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

@router.get('/dashboard/', response_model=DashboardInfo)
def get_dashboard(db=Depends(get_db_dep)):
	conn, cursor = db

	result = {}

	# Total revenue
	cursor.execute("""SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE status = 'Done'""")
	result['total_revenue'] = int(cursor.fetchone()['total_revenue'])

	# Total users
	cursor.execute("""SELECT COUNT(*) AS total_users FROM users WHERE status = 'Active'""")
	result['total_users'] = cursor.fetchone()['total_users']

	# Total orders
	cursor.execute("""SELECT COUNT(*) AS total_orders FROM orders WHERE status = 'Done'""")
	result['total_orders'] = cursor.fetchone()['total_orders']

	# Active listings
	cursor.execute("""SELECT COUNT(*) AS active_listings FROM products WHERE status = 'Active'""")
	result['active_listings'] = cursor.fetchone()['active_listings']

	cursor.execute("""
		SELECT
			DATE_FORMAT(created_at, '%Y-%m') AS month,
			COALESCE(SUM(total), 0) AS revenue,
			COUNT(*) AS orders_count
		FROM orders
		WHERE status = 'Done'
		  AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 5 MONTH), '%Y-%m-01')
		GROUP BY month
		ORDER BY month
	""")

	rows = cursor.fetchall()

	revenue_map = {}
	orders_map = {}

	for row in rows:
		revenue_map[row['month']] = int(row['revenue'])
		orders_map[row['month']] = row['orders_count']

	revenue_overview = []
	orders_trend = []
	months = []

	now = datetime.now()

	for i in range(5, -1, -1):
		month_date = now - relativedelta(months=i)

		month_key = month_date.strftime('%Y-%m')
		month_label = month_date.strftime('%b')

		months.append(month_label)

		revenue_overview.append(
			revenue_map.get(month_key, 0)
		)

		orders_trend.append(
			orders_map.get(month_key, 0)
		)

	result['months'] = months
	result['revenue_overview'] = revenue_overview
	result['orders_trend'] = orders_trend

	return DashboardInfo(**result)
