# ===== Frontend build stage =====
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy only package files first (cache-friendly)
COPY frontend/package*.json ./

# Deterministic install, faster and cleaner than npm install
RUN npm ci

# Copy the rest of the frontend source
COPY frontend/ .

# Build the React app
RUN npm run build


# ===== Backend stage =====
FROM python:3.13-slim AS backend

WORKDIR /app

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000

# Copy requirements and install BEFORE code (cache-friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Copy built frontend into backend image
COPY --from=frontend-builder /app/dist ./frontend/dist

# Storage directory
RUN mkdir -p storage

EXPOSE 8000

# Run app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

