from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pymysql
from routes import users, products, orders

app = FastAPI(title='Marketplace DB Gateway',
			)

app.add_middleware(
	CORSMiddleware,
	allow_origins=['*'],
	allow_methods=['*'],
	allow_headers=['*'],
)

@app.exception_handler(pymysql.IntegrityError)
async def integrity_error(request: Request, exc: pymysql.IntegrityError):
	msg = str(exc)
	if 'Duplicate entry' in msg:
		return JSONResponse(status_code=409, content={'detail': 'Duplicate value'})
	if 'foreign key constraint' in msg.lower():
		return JSONResponse(status_code=400, content={'detail': 'Invalid Reference (FK)'})
	return JSONResponse(status_code=500, content={'detail': 'File integrity error'})

@app.exception_handler(pymysql.OperationalError)
async def db_error(request: Request, exc: pymysql.OperationalError):
	return JSONResponse(status_code=503, content={'detail': 'Unavailable database'})



app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)

@app.get('/health', tags=['System'])
def health():
	from database import get_connection
	try:
		conn = get_connection()
		conn.ping(reconnect=False)
		conn.close()
		return {'status': 'ok', 'database': 'connected'}
	except Exception as e:
		return {'status': 'error', 'database': str(e)}


