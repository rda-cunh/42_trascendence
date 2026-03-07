FROM python:3.12-slim

RUN mkdir -p /app && chmod -R 755 /app

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y curl openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt \
	&& mkdir -p crypt && chmod -R 755 crypt \
	&& openssl req -x509 -newkey rsa:4096 -keyout crypt/backend.key -out backend.cert -days 365 -nodes \
	&& chmod 777 crypt/backend.key

# may be changed for other default port for communication
EXPOSE 8000

CMD python3 manage.py makemigrations && \
	python3 manage.py migrate && \
	python3 ./manage.py runserver 0.0.0.0:8000
