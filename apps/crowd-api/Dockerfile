FROM python:3.13-slim

WORKDIR /app
COPY apps/crowd-api/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
COPY apps/crowd-api /app
ENV PYTHONPATH=/app
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
