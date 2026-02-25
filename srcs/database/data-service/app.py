import time
import psycopg2
from flask import Flask, jsonify
import os

app = Flask(__name__)

def get_db_connection():
    # Simple "Wait-for-it" logic
    while True:
        try:
            conn = psycopg2.connect(
                host=os.getenv('DB_HOST'),
                database=os.getenv('DB_NAME'),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASS')
            )
            return conn
        except psycopg2.OperationalError:
            print("Database not ready, retrying in 2 seconds...")
            time.sleep(2)

# Initial Setup: Seed the data
conn = get_db_connection()
cur = conn.cursor()
# Insert a test line if table is empty
cur.execute("SELECT COUNT(*) FROM test_table;")
if cur.fetchone()[0] == 0:
    cur.execute("INSERT INTO test_table (content) VALUES ('Hello from the Database!');")
    conn.commit()
cur.close()
conn.close()

@app.route('/data')
def get_data():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT content FROM test_table LIMIT 1;')
    row = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify({"database_content": row[0] if row else "No data found"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)