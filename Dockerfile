# Multi-stage build: first stage builds the React frontend
FROM node:22-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ .

# Build the React application
RUN npm run build

# Production stage
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000 

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy built frontend files from the frontend-builder stage
COPY --from=frontend-builder /app/dist ./frontend/dist

# Copy application code
COPY . .

# Create storage directory
RUN mkdir -p storage

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
