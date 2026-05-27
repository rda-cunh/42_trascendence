import pymysql
import pymysql.cursors
from contextlib import contextmanager
from datetime import datetime, timezone
import os


class UTCDictCursor(pymysql.cursors.DictCursor):
	"""DictCursor that attaches tzinfo=UTC to every naive datetime in fetched rows.

	MySQL TIMESTAMP columns are UTC moments (the session time_zone is pinned to
	'+00:00' by get_connection), but PyMySQL returns them as naive datetimes.
	Pydantic then serializes those as ISO strings without an offset, which
	JavaScript's `new Date(...)` parses as local time — producing a one-hour
	(or whatever local offset) drift in the UI. Marking them aware here makes
	Pydantic emit `...+00:00`, so the browser parses them as UTC and converts
	correctly.
	"""

	@staticmethod
	def _coerce(value):
		if isinstance(value, datetime) and value.tzinfo is None:
			return value.replace(tzinfo=timezone.utc)
		return value

	def _row_utc(self, row):
		if row is None:
			return None
		return {k: self._coerce(v) for k, v in row.items()}

	def fetchone(self):
		return self._row_utc(super().fetchone())

	def fetchmany(self, size=None):
		return [self._row_utc(r) for r in super().fetchmany(size)]

	def fetchall(self):
		return [self._row_utc(r) for r in super().fetchall()]


def get_connection():
	conn = pymysql.connect(
		host=os.getenv("DB_HOST"),
		user=os.getenv("DB_USER"),
		password=os.getenv("DB_PASSWORD"),
		database=os.getenv("DB_NAME"),
		charset='utf8mb4',
		cursorclass=UTCDictCursor,
		autocommit=False,
		init_command="SET time_zone = '+00:00'",
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
