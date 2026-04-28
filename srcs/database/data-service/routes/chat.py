from fastapi import APIRouter, Depends, HTTPException, status
import pymysql
from database import get_db_dep
from models.chat import *

router = APIRouter(prefix='/api/chat', tags=['Chat'])

def GetConversationInfo(cursor, new_id):

	cursor.execute('SELECT * FROM conversations WHERE id = %s', (new_id,))
	chat = cursor.fetchone()
	if not chat:
		return None

	if chat['seller_id'] == chat['buyer_id']:
		raise HTTPException(400, "Buyer and Seller must be different")
	cursor.execute('''
				SELECT p.name, p.price, i.image_hash
				FROM products p 
				LEFT JOIN product_images i ON i.product_id = p.id
				WHERE p.id = %s 
				LIMIT 1''',
				(chat['listing_id'],))
	chat['listing'] = cursor.fetchone()
	
	cursor.execute('SELECT name, avatar_url FROM users WHERE id = %s', (chat['seller_id'],))
	chat['seller'] = cursor.fetchone()

	cursor.execute('SELECT name, avatar_url FROM users WHERE id = %s', (chat['buyer_id'],))
	chat['buyer'] = cursor.fetchone()
	chat['history'] = []
	return chat


def GetExistingChat(cursor, id):
	chat = GetConversationInfo(cursor, id)
	if chat is None:
		return None
	cursor.execute('SELECT id, sender_id, content, read_at FROM messages WHERE conversation_id = %s ORDER BY created_at ASC', (id,))
	chat['history'] = cursor.fetchall()

	return chat

@router.get('/conversations/by-id/{conv_id}', response_model=UserConversation)
def GetConversationById(conv_id: int, db=Depends(get_db_dep)):
	_, cursor = db
	chat = GetExistingChat(cursor, conv_id)
	if chat is None:
		raise HTTPException(status_code=404, detail="Conversation not found")

	chat['other_id'] = chat['seller_id']
	return UserConversation(**chat)

@router.post('/conversations/', response_model=UserConversation, status_code=200)
def PostConversation(conv_in: PostConversation, db=Depends(get_db_dep)):
	conn, cursor = db
	# If exists, then pass to load history
	cursor.execute(
		'SELECT id FROM conversations WHERE listing_id = %s AND buyer_id = %s AND seller_id = %s',
		(conv_in.listing_id, conv_in.user_id, conv_in.seller_id)
	)
	result = cursor.fetchone()
	if result is not None:
		chat = GetExistingChat(cursor, result['id'])
		if chat is None:
			raise HTTPException(status_code=404, detail="Conversation not found")
		chat['other_id'] = conv_in.seller_id
		return UserConversation(**chat)
	if conv_in.user_id == conv_in.seller_id:
		raise HTTPException(status_code=400, detail="Buyer and Seller must be different")
	cursor.execute(
		'''
		INSERT INTO conversations (listing_id, buyer_id, seller_id)
		VALUES (%s, %s, %s)
		''',
		(
			conv_in.listing_id,
			conv_in.user_id,
			conv_in.seller_id
		)
	)
	new_id = conn.insert_id()
	chat = GetConversationInfo(cursor, new_id)
	if chat is None:
		raise HTTPException(status_code=500, detail="Failed to retrieve created conversation")
	chat['other_id'] = conv_in.seller_id
	return UserConversation(**chat)


@router.get('/conversations/{user_id}/', response_model=list[UserConversation])
def GetConversations(user_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('''
		SELECT c.id AS id,
			c.listing_id,
			c.seller_id,
			c.buyer_id,
			c.last_message,
			c.last_message_at,
			s.name          AS seller_name,
			s.avatar_url    AS seller_avatar,
			b.name          AS buyer_name,
			b.avatar_url    AS buyer_avatar,
			p.name          AS product_name,
			p.price,
			pi.image_hash
		FROM conversations c
		JOIN users s ON s.id = c.seller_id
		JOIN users b ON b.id = c.buyer_id
		JOIN products p ON p.id = c.listing_id
		LEFT JOIN product_images pi ON pi.id = (
			SELECT id FROM product_images
			WHERE product_id = p.id
			ORDER BY display_order ASC
			LIMIT 1
		)
		WHERE c.buyer_id = %s OR c.seller_id = %s
		ORDER BY c.last_message_at DESC''',
		(user_id, user_id))

	rows = cursor.fetchall()
	if not rows:
		return []

	chats = []
	for row in rows:
		c_other_id = row['seller_id'] if user_id == row['buyer_id'] else row['buyer_id']

		conversation = UserConversation(
			id=row['id'],
			listing_id=row['listing_id'],
			seller_id=row['seller_id'],
			buyer_id=row['buyer_id'],
			seller=UserInfo(
				name=row['seller_name'],
				avatar_url=row['seller_avatar']
			),
			buyer=UserInfo(
				name=row['buyer_name'],
				avatar_url=row['buyer_avatar']
			),
			listing=ListingInfo(
				name=row['product_name'],
				price=row['price'],
				image_hash=row['image_hash']
			),
			other_id=c_other_id,
			last_message=row['last_message'],
			last_message_at=row['last_message_at'],
			history=None
		)
		chats.append(conversation)

	return chats

@router.get('/conversations/{conv_id}/messages/', response_model=list[ConversationMessages])
def GetMessages(conv_id: int, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT id FROM conversations WHERE id = %s', (conv_id,))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail="Conversation not found")

	cursor.execute(
		'''
		SELECT id, sender_id, content, read_at
		FROM messages
		WHERE conversation_id = %s
		ORDER BY created_at ASC
		''',
		(conv_id,)
	)
	messages = cursor.fetchall()

	return [ConversationMessages(**msg) for msg in messages]

@router.post('/conversations/{conv_id}/messages/', response_model=ConversationMessages, status_code=201)
def SendMessage(conv_id: int, conv_in: SendMessage, db=Depends(get_db_dep)):
	conn, cursor = db

	cursor.execute('SELECT id FROM conversations WHERE id = %s', (conv_id,))
	if not cursor.fetchone():
		raise HTTPException(status_code=404, detail="Conversation not found")

	cursor.execute(
		'''
		INSERT INTO messages (conversation_id, sender_id, content)
		VALUES (%s, %s, %s)
		''',
		(
			conv_id,
			conv_in.sender_id,
			conv_in.content
		)
	)
	new_id = conn.insert_id()
	cursor.execute('UPDATE conversations SET last_message = %s, last_message_at = CURRENT_TIMESTAMP WHERE id = %s', 
				(conv_in.content, conv_id))
	cursor.execute(
		'SELECT id, sender_id, content, read_at FROM messages WHERE id = %s',
		(new_id,)
	)
	message = cursor.fetchone()
	if not message:
		raise HTTPException(status_code=500, detail="Failed to retrieve created message")

	return ConversationMessages(**message)
