# Dockerfile Frontend - Générateur de Fiches Produits DM'Sports

# Étape 1: Build de l'application React
FROM node:18-alpine AS build

# Métadonnées
LABEL maintainer="DM'Sports Team"
LABEL version="2.0.0"
LABEL description="Frontend React pour générateur de fiches produits"

# Répertoire de travail
WORKDIR /app

# Variables d'environnement pour le build
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV GENERATE_SOURCEMAP=false
ENV CI=true

# Copier les fichiers de dépendances
COPY package.json yarn.lock* package-lock.json* ./

# Installer les dépendances
RUN if [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile --production=false; \
    elif [ -f package-lock.json ]; then \
        npm ci; \
    else \
        npm install; \
    fi

# Copier le code source
COPY . .

# Build de l'application
RUN if [ -f yarn.lock ]; then \
        yarn build; \
    else \
        npm run build; \
    fi

# Vérifier que le build s'est bien passé
RUN test -f build/index.html || (echo "Build failed: index.html not found" && exit 1)

# Étape 2: Serveur de production
FROM nginx:alpine AS production

# Variables d'environnement
ENV NODE_ENV=production

# Copier les fichiers buildés
COPY --from=build /app/build /usr/share/nginx/html

# Configuration Nginx personnalisée
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Créer un utilisateur non-root
RUN addgroup -g 1000 -S appuser \
    && adduser -u 1000 -S appuser -G appuser

# Ajuster les permissions
RUN chown -R appuser:appuser /usr/share/nginx/html \
    && chown -R appuser:appuser /var/cache/nginx \
    && chown -R appuser:appuser /var/log/nginx \
    && chown -R appuser:appuser /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R appuser:appuser /var/run/nginx.pid

# Utiliser l'utilisateur non-root
USER appuser

# Port exposé
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=5 \
    CMD curl -f http://localhost:3000 || exit 1

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]

# Étape alternative: Serveur de développement
FROM node:18-alpine AS development

WORKDIR /app

# Installer les dépendances globales
RUN npm install -g serve

# Variables d'environnement
ENV NODE_ENV=development
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Copier les fichiers de dépendances
COPY package.json yarn.lock* package-lock.json* ./

# Installer les dépendances
RUN if [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
        npm ci; \
    else \
        npm install; \
    fi

# Copier le code source
COPY . .

# Créer un utilisateur non-root
RUN addgroup -g 1000 -S appuser \
    && adduser -u 1000 -S appuser -G appuser \
    && chown -R appuser:appuser /app

USER appuser

# Port exposé
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=5 \
    CMD curl -f http://localhost:3000 || exit 1

# Commande par défaut
CMD if [ -f yarn.lock ]; then \
        yarn start; \
    else \
        npm start; \
    fi