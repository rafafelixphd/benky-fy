# Multi-stage build for optimized Benky-Fy Flask API
# Stage 1: Build dependencies
FROM python:3.11-slim AS builder

# Install build dependencies (including Rust for sudachipy)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && rm -rf /var/lib/apt/lists/*

# Add Rust to PATH for this stage only
ENV PATH="/root/.cargo/bin:${PATH}"

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install production requirements only
COPY backend/requirements.prod.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.prod.txt

# Download spacy model (will be in /opt/venv/lib/python3.11/site-packages/)
RUN python -m spacy download ja_core_news_sm

# Clean up unnecessary files from venv to reduce size
RUN find /opt/venv -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true && \
    find /opt/venv -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true && \
    find /opt/venv -name "*.pyc" -delete && \
    find /opt/venv -name "*.pyo" -delete && \
    find /opt/venv -name "*.c" -delete && \
    find /opt/venv -name "*.pxd" -delete

# Stage 2: Production image
FROM python:3.11-slim AS production

# Install only runtime dependencies (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy virtual environment from builder (includes spacy model)
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy application files
COPY backend/ ./backend/
RUN pip install -e ./backend/
# Set PYTHONPATH so backend package is importable
ENV PYTHONPATH=/app

# Create non-root user
RUN useradd -m -s /bin/bash app && \
    chown -R app:app /app
USER app

# Expose port
EXPOSE 8080

# Set environment variables
ENV FLASK_ENV=production \
    PORT=8080 \
    PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1

# Run the application with gunicorn (production-ready)
# CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "--timeout", "120", "backend.app:create_app()"]
CMD ["flask", "run", "--host=0.0.0.0", "--port=8080"]
