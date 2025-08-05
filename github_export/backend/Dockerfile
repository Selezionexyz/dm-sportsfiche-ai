# Dockerfile Backend - Générateur de Fiches Produits DM'Sports
FROM python:3.9-slim

# Métadonnées
LABEL maintainer="DM'Sports Team"
LABEL version="2.0.0"
LABEL description="Backend FastAPI pour générateur de fiches produits"

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Répertoire de travail
WORKDIR /app

# Installation des dépendances système
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        gcc \
        g++ \
        git \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip cache purge

# Copier le code source
COPY . .

# Créer un utilisateur non-root
RUN adduser --disabled-password --gecos '' --uid 1000 appuser \
    && chown -R appuser:appuser /app
USER appuser

# Créer les dossiers de logs
RUN mkdir -p logs

# Port exposé
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=5 \
    CMD curl -f http://localhost:8001/api/ || exit 1

# Commande par défaut
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]