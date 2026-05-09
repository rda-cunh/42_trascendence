from fastapi import APIRouter, Depends, HTTPException, status, Query
import pymysql
from database import get_db_dep
from models.friend import *

router = APIRouter(prefix='/api/follow', tags=['Friend'])

@router.post('/add/', status_code=200)
def AddFriend(friend_in: FollowFriend, db=Depends(get_db_dep)):
	conn, cursor = db
	if friend_in.user_id == friend_in.following_id:
		raise HTTPException(status_code=400, detail="Can't follow yourself")
	cursor.execute('''
				INSERT INTO follows (user_id, following_id)
				VALUES (%s, %s)''',
				(friend_in.user_id, friend_in.following_id))

@router.delete('/remove/', status_code=204)
def RemoveFriend(friend_in: FollowFriend, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT * FROM follows WHERE user_id = %s AND following_id = %s', (friend_in.user_id, friend_in.following_id))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Follow does\'n exist')
	cursor.execute('''
				DELETE FROM follows 
				WHERE user_id = %s AND following_id = %s''', (friend_in.user_id, friend_in.following_id))

# Optional: ?limit or ?offset
@router.get('/following/{user_id}/', response_model=list[UserInfo])
def FollowingList(user_id: int, limit: int | None = None, offset: int | None = None, db=Depends(get_db_dep)):
	conn, cursor = db
	sql = '''SELECT u.id, u.name, u.avatar_url, f.created_at AS following_since
			FROM follows f 
			JOIN users u ON u.id = f.following_id
			WHERE f.user_id = %s AND u.status = 'Active'
			ORDER BY u.name ASC'''
	params = [user_id]
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
	FollowingList = []

	for row in rows:
		friend = UserInfo(
			user_id=row['id'],
			name=row['name'],
			avatar_url=row['avatar_url'],
			following_since=row['following_since']
		)
		FollowingList.append(friend)
	return FollowingList

# Optional: ?limit or ?offset
@router.get('/followers/{user_id}/', response_model=list[UserInfo])
def FollowersList(user_id: int, limit: int | None = None, offset: int | None = None, db=Depends(get_db_dep)):
	conn, cursor = db
	sql = '''SELECT u.id, u.name, u.avatar_url, f.created_at AS following_since
			FROM follows f 
			JOIN users u ON u.id = f.user_id
			WHERE f.following_id = %s AND u.status = 'Active'
			ORDER BY u.name ASC'''
	params = [user_id]
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
	FollowingList = []

	for row in rows:
		friend = UserInfo(
			user_id=row['id'],
			name=row['name'],
			avatar_url=row['avatar_url'],
			following_since=row['following_since']
		)
		FollowingList.append(friend)
	return FollowingList

@router.get("/feed/{user_id}/", response_model=list[FriendsFeed])
def get_friends_feed(
    user_id: int,
    page: int = Query(1, ge=1),
    search: str | None = Query(None, description="Name or description"),
    db=Depends(get_db_dep),
):
    conn, cursor = db
    limit = 10
    offset = (page - 1) * limit
    sql = """
        SELECT
            p.id,
            p.name,
            p.slug,
            p.price,
            p.created_at,
            u.id AS seller_id,
            u.name AS seller_name,
            u.avatar_url AS seller_avatar,
            f.created_at AS following_since,
            (
                SELECT pi.image_hash
                FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY pi.display_order ASC, pi.id ASC
                LIMIT 1
            ) AS image_hash
        FROM follows f
        INNER JOIN users u
            ON u.id = f.following_id
        INNER JOIN products p
            ON p.seller_id = f.following_id
        WHERE
            f.user_id = %s
            AND u.status = 'Active'
            AND p.status = 'Active'
    """
    params = [user_id]

    if search:
        sql += """AND (p.name LIKE %s OR p.description LIKE %s)"""
        search_term = f"%{search}%"
        params.extend([search_term, search_term])

    sql += """ORDER BY p.created_at DESC LIMIT %s OFFSET %s"""
    params.extend([limit, offset])

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    feed = []
    for row in rows:
        feed.append(
            FriendsFeed(
                listing=ListingInfo(
                    id=row["id"],
                    name=row["name"],
                    slug=row["slug"],
                    price=row["price"],
                    created_at=row["created_at"],
                    image_hash=row["image_hash"],
                ),
                user=UserInfo(
                    user_id=row["seller_id"],
                    name=row["seller_name"],
                    avatar_url=row["seller_avatar"],
                    following_since=row["following_since"],
                ),
            )
        )

    return feed

@router.get('/followers-count/{user_id}/', response_model=FollowCount)
def FollowersCount(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT COUNT(*) AS num FROM follows WHERE following_id = %s', (user_id,))
	result = cursor.fetchone()
	return (FollowCount(**result))

@router.get('/following-count/{user_id}/', response_model=FollowCount)
def FollowingCount(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db
	cursor.execute('SELECT COUNT(*) AS num FROM follows WHERE user_id = %s', (user_id,))
	result = cursor.fetchone()
	return (FollowCount(**result))
