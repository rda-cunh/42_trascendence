FROM python:3.12-slim

RUN apt-get update && apt-get install -y curl wget \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# may be changed for other default port for communication
EXPOSE 8000

CMD python3 manage.py makemigrations && \
	python3 manage.py migrate && \
	DJANGO_SETTINGS_MODULE=backend.settings daphne -b 0.0.0.0 -p 8000 backend.asgi:application
