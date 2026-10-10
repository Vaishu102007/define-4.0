FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install Python dependencies
COPY pr007-conversation-copilot/backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and frontend code
COPY pr007-conversation-copilot/backend/ ./backend/
COPY pr007-conversation-copilot/frontend/ ./frontend/

WORKDIR /app/backend

ENV PYTHONPATH=/app/backend
ENV APP_ENV=production

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
