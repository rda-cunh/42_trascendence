from fastapi import APIRouter, Depends, HTTPException, status, Query
import pymysql
from database import get_db_dep
from models.friend import *

router = APIRouter(prefix='/api/friends', tags=['Friend'])


# Adicionar
# Aceitar
# Remover
# Enviar chat
# Ver Feed
# Ver lista de amigos

@router.post('/add/', status_code=200)
def AddFriend(friend_in: AddFriend, db=Depends(get_db_dep)):
	conn, cursor = db
	if friend_in.user_id == friend_in.friend_id:
		raise HTTPException(status_code=400, detail="Can't add yourself as friend")
	cursor.execute('''
				INSERT INTO friendship (user_id, friend_id, status)
				VALUES (%s, %s, %s)''',
				(friend_in.user_id, friend_in.friend_id, 'Pending'))
	conn.insert_id()

@router.patch('/accept/{invite_id}/', status_code=200)
def AcceptFriend(invite_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM friendship WHERE id = %s', (invite_id, ))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Invite not found')
	cursor.execute('''
				UPDATE friendship 
				SET status = 'Accepted' 
				WHERE id = %s''', (invite_id,))

@router.patch('/reject/{invite_id}/', status_code=204)
def RejectFriend(invite_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM friendship WHERE id = %s', (invite_id, ))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Invite not found')
	cursor.execute('''
				UPDATE friendship 
				SET status = 'Rejected' 
				WHERE id = %s''', (invite_id,))

@router.delete('/{invite_id}/', status_code=204)
def RemoveFriend(invite_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM friendship WHERE id = %s', (invite_id, ))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Invite not found')
	cursor.execute('''
				DELETE FROM friendship 
				WHERE id = %s''', (invite_id,))

@router.get('/pending/{user_id}/', response_model=list[UserFriend])
def ListRequestFriends(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('''
				SELECT 
				f.id, f.user_id AS requester_id, f.created_at AS requested_at, u.id AS user_id, u.name, u.avatar_url
				FROM friendship f JOIN users u ON u.id = f.friend_id
				WHERE f.status = 'Pending' AND f.friend_id = %s
				ORDER BY f.created_at DESC
				''', (user_id,))
	rows = cursor.fetchall()
	if not rows:
		return []
	
	FriendList = []
	for row in rows:
		friend = UserFriend(
			id=row['id'],
			requester_id=row['requester_id'],
			requested_at=row['requested_at'],
			user=UserInfo(
				user_id=row['user_id'],
				name=row['name'],
				avatar_url=row['avatar_url']
			)
		)
		FriendList.append(friend)
	
	return FriendList

# Optional: ?limit or ?offset
@router.get('/{user_id}/', response_model=list[UserInfo])
def ListFriends(user_id: int, limit: int | None = None, offset: int | None = None, db=Depends(get_db_dep)):
	conn, cursor = db
	sql = '''SELECT u.id, u.name, u.avatar_url 
			FROM friendship f 
			JOIN users u ON u.id = CASE WHEN f.user_id = %s THEN f.friend_id ELSE f.user_id END
			WHERE f.status = 'Accepted' AND u.status = 'Active' AND (f.user_id = %s OR f.friend_id = %s)
			ORDER BY u.name ASC'''
	params = [user_id, user_id, user_id]
	if limit is not None:
		sql += ' LIMIT %s'
		params.append(limit)
	if offset is not None:
		sql += ' OFFSET %s'
		params.append(offset)
	cursor.execute(sql, params)
	rows = cursor.fetchall()
	if not rows:
		return []
	FriendList = []

	for row in rows:
		friend = UserInfo(
			user_id=row['id'],
			name=row['name'],
			avatar_url=row['avatar_url']
		)
		FriendList.append(friend)
	return FriendList

@router.get('/feed/{user_id}/', response_model=list[FriendsFeed])
def FriendsFeed(user_id: int, page: int = 1, search: str | None = Query(None, description='Name or description'), db=Depends(get_db_dep)):
	conn, cursor = db
	limit = 10
	skip = (page - 1) * limit
	if page < 1:
		raise HTTPException(status_code=400, detail="Invalid page")
	sql = '''SELECT l.id, l.name, l.slug, l.price, l.status, l.created_at, 
			u.id AS seller_id, u.name AS seller_name, u.avatar_url AS seller_avatar,
			(SELECT pi.image_hash AS image_hash FROM product_images pi WHERE pi.product_id = l.id ORDER BY display_order ASC LIMIT 1)
			FROM products l
			JOIN users u ON u.id = l.user_id
			JOIN friendship f ON (f.user_id = l.user_id OR f.friend_id = l.user_id)
			WHERE f.status = 'Accepted'
			AND (f.user_id = %s OR f.friend_id = %s) AND l.user_id != %s AND l.status = 'Active' AND u.status = 'Active'
			ORDER BY l.created_at DESC
			LIMIT %s OFFSET %s
		'''
	params = [user_id, user_id, user_id, limit, skip]
	cursor.execute(sql, params)
	rows = cursor.fetchall()
	if not rows:
		return []
	Feed = []
	for row in rows:
		listing = FriendsFeed(
			listing=ListingInfo(
				id=row['id'],
				name=row['name'],
				slug=row['slug'],
				price=row['price'],
				status=row['status'],
				created_at=row['created_at'],
				image_hash=row['image_hash']
			),
			user=UserInfo(
				user_id=row['seller_id'],
				name=row['seller_name'],
				avatar_url=row['seller_avatar']
			)
		)
		Feed.append(listing)
	return (Feed)
