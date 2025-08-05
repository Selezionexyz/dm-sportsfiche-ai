# 🚀 EXPORT GITHUB COMPLET - Générateur de Fiches Produits DM'Sports

## 📂 STRUCTURE COMPLÈTE DU PROJET

### 1. Fichier racine: README.md
```markdown
# 🏷️ Générateur de Fiches Produits DM'Sports

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green.svg)
![React](https://img.shields.io/badge/React-19.0.0-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-4.5.0-green.svg)

Outil intelligent de création automatique de fiches produits avec IA + recherche EAN pour e-commerce.

## ✨ Fonctionnalités

- 🔍 **Recherche automatique par code EAN** via Google Search API
- 🤖 **Génération IA** de fiches produits complètes avec OpenAI
- 📋 **Export PrestaShop** au format JSON/CSV compatible
- 🎨 **Interface moderne** style DM'Sports responsive
- 📊 **Statistiques en temps réel** et suivi des performances
- ⚖️ **Gestion automatique des poids** par type de produit

## 🛠️ Stack Technique

### Backend
- **FastAPI** - API REST moderne et performante
- **OpenAI GPT-3.5/4** - Génération de contenu IA
- **Google Custom Search API** - Recherche d'informations produit
- **MongoDB + Motor** - Base de données NoSQL asynchrone
- **Pydantic** - Validation et sérialisation des données

### Frontend  
- **React 19** - Interface utilisateur moderne
- **Tailwind CSS** - Design system et styles
- **Axios** - Client HTTP pour API calls
- **Responsive Design** - Compatible mobile/tablette/desktop

## 🚀 Installation Rapide

### 1. Prérequis
- Python 3.9+
- Node.js 18+
- MongoDB 4.4+

### 2. Clonage
```bash
git clone https://github.com/votre-username/dmsports-product-generator.git
cd dmsports-product-generator
```

### 3. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Éditer .env avec vos clés API
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 4. Frontend
```bash
cd frontend
npm install
# ou yarn install
cp .env.example .env
# Éditer .env avec l'URL backend
npm start
```

## 🔑 Configuration API

### OpenAI API
1. Aller sur https://platform.openai.com
2. Créer une clé API
3. Ajouter à .env: `OPENAI_API_KEY=sk-...`

### Google Search API
1. Google Cloud Console: https://console.cloud.google.com
2. Activer "Custom Search JSON API"
3. Créer une clé API
4. Créer un moteur de recherche: https://cse.google.com
5. Ajouter à .env: `GOOGLE_SEARCH_API_KEY=...` et `GOOGLE_SEARCH_CX=...`

## 📱 Usage

1. **Recherche EAN**: Saisir un code EAN 13 chiffres
2. **Génération automatique**: L'IA trouve les infos et génère le produit
3. **Validation**: Vérifier et modifier si nécessaire
4. **Export**: Télécharger au format PrestaShop

## 📸 Screenshots

![Interface principale](docs/screenshots/main-interface.png)
![Recherche EAN](docs/screenshots/ean-search.png)
![Produits générés](docs/screenshots/products-grid.png)
![Fiches créées](docs/screenshots/product-sheets.png)

## 🧪 Tests

### Codes EAN d'exemple
- `3614270357637` - Nike Air Max
- `4064037884942` - Adidas Originals
- `1234567890123` - Code test simulation

## 📚 Documentation

- [Installation détaillée](docs/installation.md)
- [API Reference](docs/api.md)
- [Guide utilisateur](docs/user-guide.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- Votre nom - [@votre-github](https://github.com/votre-username)

## 🙏 Remerciements

- OpenAI pour l'API GPT
- Google pour l'API Search
- Communauté React et FastAPI
```

### 2. Fichier: .gitignore
```
# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.so
.venv/
venv/
env/
ENV/

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn-integrity

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Build outputs
dist/
build/
*.tgz

# Database
*.db
*.sqlite
*.sqlite3

# Temporary files
*.tmp
*.temp
.cache/
```

### 3. Backend/server.py
COPIEZ LE CONTENU COMPLET DU FICHIER /app/backend/server.py

### 4. Backend/requirements.txt
COPIEZ LE CONTENU COMPLET DU FICHIER /app/backend/requirements.txt

### 5. Backend/.env.example
```
# MongoDB Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="dmsports_products"

# OpenAI API Configuration
# Obtention: https://platform.openai.com → API Keys → Create new secret key
OPENAI_API_KEY=your_openai_key_here

# Google Search API Configuration  
# Obtention: https://console.cloud.google.com → APIs & Services → Credentials
GOOGLE_SEARCH_API_KEY=your_google_search_key_here

# Google Custom Search Engine ID
# Obtention: https://cse.google.com → Create → Copy Search Engine ID
GOOGLE_SEARCH_CX=your_google_cx_here

# Application Configuration
DEBUG=True
LOG_LEVEL=INFO
```

### 6. Backend/README.md
```markdown
# Backend - Générateur de Fiches Produits

API FastAPI pour la génération automatique de fiches produits.

## Installation

```bash
pip install -r requirements.txt
cp .env.example .env
# Éditer .env avec vos clés API
```

## Lancement

```bash
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

## API Endpoints

- `GET /api/` - Status de l'API
- `POST /api/search/ean` - Recherche par EAN
- `POST /api/generate/product` - Génération complète
- `GET /api/products` - Liste des produits
- `GET /api/sheets` - Liste des fiches
- `GET /api/stats` - Statistiques

## Tests

```bash
# Test avec curl
curl -X POST "http://localhost:8001/api/generate/product" \
  -H "Content-Type: application/json" \
  -d '{"ean_code": "3614270357637", "generate_sheet": true}'
```
```

### 7. Frontend/src/App.js
COPIEZ LE CONTENU COMPLET DU FICHIER /app/frontend/src/App.js

### 8. Frontend/src/App.css
COPIEZ LE CONTENU COMPLET DU FICHIER /app/frontend/src/App.css

### 9. Frontend/src/index.js
COPIEZ LE CONTENU COMPLET DU FICHIER /app/frontend/src/index.js

### 10. Frontend/src/index.css
COPIEZ LE CONTENU COMPLET DU FICHIER /app/frontend/src/index.css

### 11. Frontend/package.json
COPIEZ LE CONTENU COMPLET DU FICHIER /app/frontend/package.json

### 12. Frontend/tailwind.config.js
COPIEZ LE CONTENU COMPLET DU FICHIER /app/frontend/tailwind.config.js

### 13. Frontend/postcss.config.js
COPIEZ LE CONTENU COMPLET DU FICHIER /app/frontend/postcss.config.js

### 14. Frontend/craco.config.js
COPIEZ LE CONTENU COMPLET DU FICHIER /app/frontend/craco.config.js

### 15. Frontend/.env.example
```
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# WebSocket configuration (development)
WDS_SOCKET_PORT=443
```

### 16. Frontend/public/index.html
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Générateur intelligent de fiches produits avec IA + recherche EAN - Style DM'Sports" />
    <title>🏷️ Générateur de Fiches Produits DM'Sports</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 17. Frontend/README.md
```markdown
# Frontend - Générateur de Fiches Produits

Interface React moderne pour la génération de fiches produits.

## Installation

```bash
npm install
# ou yarn install
```

## Configuration

```bash
cp .env.example .env
# Éditer REACT_APP_BACKEND_URL si nécessaire
```

## Lancement

```bash
npm start
# ou yarn start
```

## Build Production

```bash
npm run build
# ou yarn build
```

## Structure

- `src/App.js` - Composant principal
- `src/App.css` - Styles Tailwind personnalisés
- `src/index.js` - Point d'entrée React
- `src/index.css` - Styles globaux
```

### 18. docs/installation.md
```markdown
# Guide d'Installation Détaillé

## Prérequis Système

- Python 3.9+
- Node.js 18+  
- MongoDB 4.4+
- Git

## Installation Complète

### 1. Cloner le Repository
```bash
git clone https://github.com/votre-username/dmsports-product-generator.git
cd dmsports-product-generator
```

### 2. Configuration Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Configuration Base de Données
```bash
# Installer MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS avec Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Démarrer MongoDB
sudo systemctl start mongodb
```

### 4. Variables d'Environnement Backend
```bash
cd backend
cp .env.example .env
nano .env  # ou votre éditeur préféré
```

Remplir avec vos clés API:
```
OPENAI_API_KEY=sk-votre_clé_openai
GOOGLE_SEARCH_API_KEY=AIza_votre_clé_google
GOOGLE_SEARCH_CX=votre_cx_google
```

### 5. Configuration Frontend
```bash
cd ../frontend
npm install  # ou yarn install
cp .env.example .env
```

### 6. Lancement Services

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### 7. Vérification
- Backend: http://localhost:8001
- Frontend: http://localhost:3000
- API Docs: http://localhost:8001/docs

## Résolution de Problèmes

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :8001
# Tuer le processus
kill -9 PID
```

### Erreur MongoDB
```bash
# Vérifier le statut
sudo systemctl status mongodb
# Redémarrer si nécessaire
sudo systemctl restart mongodb
```
```

### 19. docs/api.md
```markdown
# Documentation API

## Base URL
```
http://localhost:8001/api
```

## Authentification
Aucune authentification requise pour cette version.

## Endpoints

### GET /
**Description**: Status de l'API

**Réponse**:
```json
{
  "message": "🏷️ API Générateur de Fiches Produits DM'Sports",
  "version": "2.0.0",
  "features": ["EAN Search", "AI Generation", "PrestaShop Export"],
  "openai_configured": true,
  "google_configured": true
}
```

### POST /search/ean
**Description**: Recherche par code EAN

**Body**:
```json
{
  "ean_code": "3614270357637"
}
```

**Réponse**:
```json
{
  "id": "uuid",
  "ean_code": "3614270357637",
  "search_query": "3614270357637 produit caractéristiques",
  "google_results": [...],
  "extracted_info": {...},
  "created_at": "2024-01-01T12:00:00Z"
}
```

### POST /generate/product
**Description**: Pipeline complet EAN → Produit → Fiche

**Body**:
```json
{
  "ean_code": "3614270357637",
  "generate_sheet": true
}
```

**Réponse**:
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "ean_code": "3614270357637",
    "title": "Nike Air Max 97 - Noir",
    "brand": "Nike",
    "model": "Air Max 97",
    "color": "Noir",
    "category": "Chaussures",
    "price": 179.99,
    "description": "Description générée...",
    "characteristics": {...},
    "sizes": ["39", "40", "41", "42", "43"],
    "created_at": "2024-01-01T12:00:00Z"
  },
  "product_sheet": {
    "id": "uuid",
    "product_id": "uuid",
    "title": "Nike Air Max 97 - Noir",
    "reference": "REF-57637",
    "price_ttc": 179.99,
    "description": "HTML formaté...",
    "seo_title": "Nike Air Max 97 Noir | DM'Sports",
    "seo_description": "Meta description...",
    "created_at": "2024-01-01T12:00:00Z"
  },
  "search_summary": {
    "results_count": 8,
    "brands_found": ["Nike"],
    "category_detected": "Chaussures"
  }
}
```

### GET /products
**Description**: Liste des produits

**Paramètres**:
- `limit` (int): Nombre max de résultats (défaut: 50)
- `offset` (int): Décalage pour pagination (défaut: 0)
- `category` (string): Filtrer par catégorie (optionnel)

### GET /sheets
**Description**: Liste des fiches produits

**Paramètres**:
- `limit` (int): Nombre max de résultats (défaut: 50)
- `offset` (int): Décalage pour pagination (défaut: 0)
- `status` (string): Filtrer par statut (draft/published/exported)

### GET /sheets/{sheet_id}/export
**Description**: Export fiche produit

**Paramètres**:
- `format` (string): Format d'export (prestashop/json)

**Réponse**:
```json
{
  "format": "prestashop",
  "data": {
    "name": "Nike Air Max 97 - Noir",
    "reference": "REF-57637",
    "price": 179.99,
    "description": "Description produit...",
    "meta_title": "Nike Air Max 97 Noir | DM'Sports",
    "meta_description": "Meta description...",
    "categories": ["Chaussures"],
    "brand": "Nike",
    "ean13": "3614270357637"
  },
  "instructions": "Importez ces données dans PrestaShop via CSV ou API"
}
```

### DELETE /products/{product_id}
**Description**: Supprime un produit et ses fiches associées

### GET /stats
**Description**: Statistiques de l'application

**Réponse**:
```json
{
  "total_products": 150,
  "total_sheets": 120,
  "total_searches": 200,
  "categories": {
    "Chaussures": 80,
    "Vêtements": 60,
    "Accessoires": 10
  },
  "api_status": {
    "openai_configured": true,
    "google_configured": true
  }
}
```

## Codes d'Erreur

- `400` - Requête invalide
- `404` - Ressource non trouvée  
- `500` - Erreur serveur interne

## Limites

- **Google Search API**: 100 requêtes gratuites/jour
- **OpenAI API**: Selon votre plan tarifaire
- **Rate Limiting**: 100 requêtes/minute par IP
```

### 20. scripts/setup.sh
```bash
#!/bin/bash
# Script d'installation automatique

echo "🚀 Installation Générateur de Fiches Produits DM'Sports"

# Vérifier les prérequis
command -v python3 >/dev/null 2>&1 || { echo "Python 3 requis" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js requis" >&2; exit 1; }

echo "✅ Prérequis vérifiés"

# Installation Backend
echo "📦 Installation Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
echo "✅ Backend installé"

# Installation Frontend  
echo "🎨 Installation Frontend..."
cd ../frontend
npm install
cp .env.example .env
echo "✅ Frontend installé"

echo "🎉 Installation terminée !"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Éditer backend/.env avec vos clés API"
echo "2. Éditer frontend/.env avec l'URL backend"
echo "3. Lancer: ./scripts/deploy.sh"
```

### 21. scripts/deploy.sh
```bash
#!/bin/bash
# Script de déploiement

echo "🚀 Déploiement Générateur de Fiches Produits"

# Démarrer MongoDB si nécessaire
if ! pgrep -x "mongod" > /dev/null; then
    echo "📄 Démarrage MongoDB..."
    sudo systemctl start mongodb
fi

# Terminal Backend
echo "⚡ Démarrage Backend..."
cd backend
source venv/bin/activate
nohup python -m uvicorn server:app --host 0.0.0.0 --port 8001 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Terminal Frontend
echo "🎨 Démarrage Frontend..."
cd ../frontend
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo "✅ Services démarrés"
echo "🌐 Backend: http://localhost:8001"
echo "🌐 Frontend: http://localhost:3000"
echo "📊 API Docs: http://localhost:8001/docs"

# Créer script d'arrêt
cat > ../scripts/stop.sh << EOF
#!/bin/bash
kill $BACKEND_PID $FRONTEND_PID
echo "🛑 Services arrêtés"
EOF
chmod +x ../scripts/stop.sh

echo "🛑 Pour arrêter: ./scripts/stop.sh"
```