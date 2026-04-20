FROM python:3.12-slim

RUN mkdir -p /app && chmod -R 755 /app

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y curl openssl \
	&& rm -rf /var/lib/apt/lists/*

#COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
#	&& mkdir -p crypt && chmod -R 755 crypt \
#	&& openssl req -x509 -newkey rsa:4096 -keyout crypt/backend.key -out backend.cert -days 365 -nodes \
#	-subj "/C=PT/ST=Porto/L=Porto/O=42Transcendence/OU=Dev/CN=rapcampo.42.fr" \
#	&& chmod 777 crypt/backend.key

# want to implement random key on setup
#RUN python3 secret.py > 

# may be changed for other default port for communication
EXPOSE 8000

# Moved to docker-compose.yml
#CMD python3 manage.py makemigrations && \
#	python3 manage.py migrate && \
#	python3 ./manage.py runserver 0.0.0.0:8000
