from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db_dep
from models.follow import *

router = APIRouter(prefix='/api/follow', tags=['Follows'])

@router.post('/add/', status_code=201)
def AddFollow(follow_in: FollowRequest, db=Depends(get_db_dep)):
	_, cursor = db
	if follow_in.user_id == follow_in.following_id:
			raise HTTPException(status_code=400, detail="Can't follow yourself")
	cursor.execute(
		"SELECT id FROM users WHERE id IN (%s, %s) AND status = 'Active'",
		(follow_in.user_id, follow_in.following_id),
	)
	if len(cursor.fetchall()) != 2:
		raise HTTPException(status_code=404, detail='User not found')
	cursor.execute('SELECT 1 FROM follows WHERE user_id = %s AND following_id = %s',
				(follow_in.user_id, follow_in.following_id))
	if cursor.fetchone():
		raise HTTPException(status_code=409, detail='Already following')
	cursor.execute('''
				INSERT INTO follows (user_id, following_id)
				VALUES (%s, %s)''',
				(follow_in.user_id, follow_in.following_id))

@router.delete('/remove/', status_code=204)
def RemoveFollow(follow_in: FollowRequest, db=Depends(get_db_dep)):
	_, cursor = db
	cursor.execute('SELECT 1 FROM follows WHERE user_id = %s AND following_id = %s', (follow_in.user_id, follow_in.following_id))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail='Follow does not exist')
	cursor.execute('''
				DELETE FROM follows
				WHERE user_id = %s AND following_id = %s''', (follow_in.user_id, follow_in.following_id))

def ApplyLimitOffset(sql, params, limit, offset):
	if offset is not None and limit is None:
		raise HTTPException(status_code=400, detail='offset requires limit')
	if limit is not None:
		sql += ' LIMIT %s'
		params.append(limit)
	if offset is not None:
		sql += ' OFFSET %s'
		params.append(offset)
	return sql

# Optional: ?limit or ?limit=5&offset=10
@router.get('/following/{user_id}/', response_model=list[FollowUserInfo], status_code=200)
def FollowingList(
	user_id: int,
	limit: int | None = Query(None, ge=1),
	offset: int | None = Query(None, ge=0),
	db=Depends(get_db_dep)
):
	_, cursor = db
	sql = '''SELECT u.id, u.name, u.avatar_url, f.created_at AS following_since
			FROM follows f
			JOIN users u ON u.id = f.following_id
			WHERE f.user_id = %s AND u.status = 'Active'
			ORDER BY u.name ASC'''
	params = [user_id]
	sql = ApplyLimitOffset(sql, params, limit, offset)
	cursor.execute(sql, params)
	rows = cursor.fetchall()
	following_list = []

	for row in rows:
		followed_user = FollowUserInfo(
			user_id=row['id'],
			name=row['name'],
			avatar_url=row['avatar_url'],
			following_since=row['following_since']
		)
		following_list.append(followed_user)
	return following_list
	
# Optional: ?limit or ?limit=5&offset=10
@router.get('/followers/{user_id}/', response_model=list[FollowUserInfo], status_code=200)
def FollowersList(
	user_id: int,
	limit: int | None = Query(None, ge=1),
	offset: int | None = Query(None, ge=0),
	db=Depends(get_db_dep)
):
	_, cursor = db
	sql = '''SELECT u.id, u.name, u.avatar_url, f.created_at AS following_since
			FROM follows f
			JOIN users u ON u.id = f.user_id
			WHERE f.following_id = %s AND u.status = 'Active'
			ORDER BY u.name ASC'''
	params = [user_id]
	sql = ApplyLimitOffset(sql, params, limit, offset)
	cursor.execute(sql, params)
	rows = cursor.fetchall()
	followers_list = []

	for row in rows:
		follower_user = FollowUserInfo(
			user_id=row['id'],
			name=row['name'],
			avatar_url=row['avatar_url'],
			following_since=row['following_since']
		)
		followers_list.append(follower_user)
	return followers_list

@router.get('/followers-count/{user_id}/', response_model=FollowCount, status_code=200)
def FollowersCount(user_id: int, db=Depends(get_db_dep)):
	_, cursor = db
	cursor.execute('''
		SELECT COUNT(*) AS num
		FROM follows f
		JOIN users u ON u.id = f.user_id
		WHERE f.following_id = %s AND u.status = 'Active' ''', (user_id,))
	result = cursor.fetchone()
	return (FollowCount(**result))

@router.get('/following-count/{user_id}/', response_model=FollowCount, status_code=200)
def FollowingCount(user_id: int, db=Depends(get_db_dep)):
	_, cursor = db
	cursor.execute('''
		SELECT COUNT(*) AS num
		FROM follows f
		JOIN users u ON u.id = f.following_id
		WHERE f.user_id = %s AND u.status = 'Active' ''', (user_id,))
	result = cursor.fetchone()
	return (FollowCount(**result))

@router.get('/feed/{user_id}/', response_model=list[FollowFeedItem], status_code=200)
def FollowFeed(
    user_id: int,
    limit: int | None = Query(None, ge=1, le=100),
    offset: int | None = Query(None, ge=0),
    db=Depends(get_db_dep),
):
    _, cursor = db
    sql = '''
        SELECT
            p.id, p.name, p.slug, p.price, p.created_at,
            (SELECT image_hash FROM product_images
             WHERE product_id = p.id
             ORDER BY display_order ASC LIMIT 1) AS image_hash,
            u.id AS u_id, u.name AS u_name, u.avatar_url AS u_avatar
        FROM follows f
        JOIN products p ON p.seller_id = f.following_id
        JOIN users    u ON u.id = f.following_id
        WHERE f.user_id = %s
          AND p.status = 'Active'
          AND u.status = 'Active'
        ORDER BY p.created_at DESC
    '''
    params = [user_id]
    sql = ApplyLimitOffset(sql, params, limit, offset)
    cursor.execute(sql, params)

    feed = []
    for r in cursor.fetchall():
        feed.append(FollowFeedItem(
            listing=FollowListingInfo(
                id=r['id'], name=r['name'], slug=r['slug'],
                price=r['price'], created_at=r['created_at'],
                image_hash=r['image_hash'],
            ),
            user=FollowUserInfo(
                user_id=r['u_id'], name=r['u_name'],
                avatar_url=r['u_avatar'], following_since=None,
            ),
        ))
    return feed
