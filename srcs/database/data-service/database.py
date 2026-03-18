import pymysql
import pymysql.cursors
from contextlib import contextmanager
import os

def get_connection():
	conn = pymysql.connect(
		host=os.getenv("DB_HOST"),
		user=os.getenv("DB_USER"),
		password=os.getenv("DB_PASSWORD"),
		database=os.getenv("DB_NAME"),
		charset='utf8mb4',
		cursorclass=pymysql.cursors.DictCursor,
		autocommit=False,
	)
	return conn

@contextmanager
def get_db():
	conn = get_connection()
	cursor = conn.cursor()
	try:
		yield conn, cursor
		conn.commit()
	except Exception:
		conn.rollback()
		raise

def get_db_dep():
	conn = get_connection()
	cursor = conn.cursor()
	try:
		yield conn, cursor
		conn.commit()
	except Exception:
		conn.rollback()
		raise
	finally:
		cursor.close()
		conn.close()