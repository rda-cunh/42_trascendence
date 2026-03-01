FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl wget \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# may be changed for other default port for communication
EXPOSE 8000

CMD ["python", "main.py"]
