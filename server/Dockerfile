FROM python:3.11-slim

WORKDIR /

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY / ./

EXPOSE 8000 9000
# 8000 = API
# 9000 = TCP server

CMD ["python", "/main.py"]