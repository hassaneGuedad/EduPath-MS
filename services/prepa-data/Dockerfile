FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir pytest

COPY . .

EXPOSE 3002

CMD ["python", "src/app.py"]

