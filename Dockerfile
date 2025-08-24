# ---------- Frontend build ----------
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# Εγκατάσταση deps
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps


COPY frontend/ .
RUN npm run build



# ---------- Backend runtime ----------
FROM python:3.11-slim AS backend
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Python deps
COPY backend/requirements.txt /app/backend/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel --disable-pip-version-check && \
    pip install --no-cache-dir --prefer-binary --no-compile -r /app/backend/requirements.txt

# Κώδικας backend
COPY backend/ /app/backend/


RUN mkdir -p /app/backend/static /app/backend/templates


COPY --from=frontend-build /app/frontend/dist /app/backend/static/

RUN cp /app/backend/static/index.html /app/backend/templates/index.html

WORKDIR /app/backend
RUN python manage.py collectstatic --noinput


CMD /bin/sh -c "python manage.py migrate --noinput && \
                gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8080} --workers 3 --timeout 60"
