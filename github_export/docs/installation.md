# 🛠️ Guide d'Installation Détaillé

Guide complet pour installer et configurer le Générateur de Fiches Produits DM'Sports.

## 🔧 Prérequis Système

### Obligatoires
- **Python 3.9+** - Pour le backend FastAPI
- **Node.js 18+** - Pour le frontend React  
- **MongoDB 4.4+** - Base de données principale
- **Git** - Pour le versioning

### Optionnels
- **Docker & Docker Compose** - Pour déploiement conteneurisé
- **Yarn** - Gestionnaire de paquets Node.js (recommandé)

### Vérification des Prérequis
```bash
# Vérifier les versions
python --version  # Doit être 3.9+
node --version    # Doit être 18+
mongo --version   # Doit être 4.4+
git --version
```

## 📥 Installation Complète

### 1. Clonage du Repository
```bash
# Cloner le projet
git clone https://github.com/votre-username/dmsports-product-generator.git
cd dmsports-product-generator

# Vérifier la structure
tree -L 2
```

### 2. Configuration Backend

#### Installation Environnement Python
```bash
cd backend

# Créer environnement virtuel
python -m venv venv

# Activer l'environnement
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Mettre à jour pip
pip install --upgrade pip

# Installer les dépendances
pip install -r requirements.txt
```

#### Configuration Base de Données

**Option A: Installation MongoDB Locale**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mongodb

# macOS avec Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Windows
# Télécharger depuis https://www.mongodb.com/download-center/community
```

**Option B: MongoDB avec Docker**
```bash
# Démarrer MongoDB en conteneur
docker run -d --name mongodb -p 27017:27017 mongo:4.4
```

**Démarrage MongoDB**
```bash
# Linux
sudo systemctl start mongodb
sudo systemctl enable mongodb

# macOS
brew services start mongodb-community

# Vérifier le statut
sudo systemctl status mongodb
```

#### Variables d'Environnement Backend
```bash
cd backend
cp .env.example .env
nano .env  # ou votre éditeur préféré
```

**Exemple de configuration `.env` :**
```env
# MongoDB
MONGO_URL="mongodb://localhost:27017"
DB_NAME="dmsports_products"

# APIs (à configurer avec vos clés)
OPENAI_API_KEY=sk-votre_clé_openai
GOOGLE_SEARCH_API_KEY=AIza_votre_clé_google
GOOGLE_SEARCH_CX=votre_cx_google

# Application
DEBUG=True
LOG_LEVEL=INFO
```

### 3. Configuration Frontend

#### Installation Dépendances Node.js
```bash
cd ../frontend

# Option 1: Yarn (recommandé)
yarn install

# Option 2: NPM
npm install
```

#### Variables d'Environnement Frontend
```bash
cp .env.example .env
nano .env
```

**Exemple de configuration `.env` :**
```env
# URL Backend
REACT_APP_BACKEND_URL=http://localhost:8001

# Configuration développement
WDS_SOCKET_PORT=443
GENERATE_SOURCEMAP=false
```

## 🔑 Configuration des Clés API

### OpenAI API Key

1. **Créer un compte** sur [platform.openai.com](https://platform.openai.com)
2. **Naviguer vers** "API Keys" dans le menu
3. **Cliquer** "Create new secret key"
4. **Nommer** la clé (ex: "DM-Sports-Generator")
5. **Copier** la clé `sk-...` et l'ajouter à `.env`

**Vérification :**
```bash
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### Google Search API

#### 1. Projet Google Cloud
1. **Aller sur** [console.cloud.google.com](https://console.cloud.google.com)
2. **Créer** nouveau projet ou sélectionner existant
3. **Nom du projet** : "DM-Sports-Search"

#### 2. Activer l'API
1. **Menu** "APIs & Services" → "Library"
2. **Rechercher** "Custom Search JSON API"
3. **Cliquer** "Enable"

#### 3. Créer Clé API
1. **Menu** "APIs & Services" → "Credentials"
2. **Cliquer** "Create Credentials" → "API key"
3. **Copier** la clé générée

#### 4. Moteur de Recherche Custom
1. **Aller sur** [cse.google.com](https://cse.google.com)
2. **Cliquer** "Add" pour créer nouveau moteur
3. **Sites to search** : `*` (tout internet)
4. **Nom** : "DM-Sports-EAN-Search"
5. **Cliquer** "Create"
6. **Copier** l'ID du moteur (Search engine ID)

**Vérification :**
```bash
curl "https://www.googleapis.com/customsearch/v1?key=$GOOGLE_SEARCH_API_KEY&cx=$GOOGLE_SEARCH_CX&q=test"
```

## 🚀 Lancement Services

### Méthode 1: Lancement Manuel

**Terminal 1 - Backend :**
```bash
cd backend
source venv/bin/activate  # Linux/macOS
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend :**
```bash
cd frontend
yarn start  # ou npm start
```

### Méthode 2: Script Automatique

**Créer script de lancement :**
```bash
#!/bin/bash
# scripts/start.sh

echo "🚀 Démarrage DM'Sports Product Generator"

# Vérifier MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo "📄 Démarrage MongoDB..."
    sudo systemctl start mongodb
fi

# Backend en arrière-plan
echo "⚡ Démarrage Backend..."
cd backend
source venv/bin/activate
nohup python -m uvicorn server:app --host 0.0.0.0 --port 8001 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Frontend en arrière-plan
echo "🎨 Démarrage Frontend..."
cd ../frontend
nohup yarn start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✅ Services démarrés"
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Backend: http://localhost:8001"
echo "📊 API Docs: http://localhost:8001/docs"

# Créer script d'arrêt
cat > stop.sh << EOF
#!/bin/bash
kill $BACKEND_PID $FRONTEND_PID
echo "🛑 Services arrêtés"
EOF
chmod +x stop.sh

echo "🛑 Pour arrêter: ./stop.sh"
```

**Exécuter :**
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

## ✅ Vérification Installation

### 1. Test Backend
```bash
# Status API
curl http://localhost:8001/api/

# Test génération (mode simulation)
curl -X POST "http://localhost:8001/api/generate/product" \
  -H "Content-Type: application/json" \
  -d '{"ean_code": "1234567890123", "generate_sheet": true}'
```

### 2. Test Frontend
- **Ouvrir** http://localhost:3000
- **Vérifier** interface charge correctement
- **Tester** recherche EAN avec code test

### 3. Test Intégration
1. **Saisir** code EAN dans interface
2. **Cliquer** "Rechercher & Générer"
3. **Vérifier** création produit et fiche
4. **Tester** export PrestaShop

## 🔧 Configuration Avancée

### Proxy Nginx (Production)
```nginx
# /etc/nginx/sites-available/dmsports-generator
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Variables d'Environnement Système
```bash
# ~/.bashrc ou ~/.zshrc
export DMSPORTS_ENV="development"
export DMSPORTS_BACKEND_URL="http://localhost:8001"
export DMSPORTS_FRONTEND_URL="http://localhost:3000"
```

### SSL/TLS avec Let's Encrypt
```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir certificat
sudo certbot --nginx -d your-domain.com

# Renouvellement automatique
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐛 Résolution de Problèmes

### Erreur "Port déjà utilisé"
```bash
# Identifier processus sur port
sudo lsof -i :8001
sudo lsof -i :3000

# Tuer processus
sudo kill -9 PID
```

### Erreur MongoDB Connection
```bash
# Vérifier statut MongoDB
sudo systemctl status mongodb

# Redémarrer si nécessaire
sudo systemctl restart mongodb

# Vérifier connexion
mongo --eval "db.adminCommand('ismaster')"
```

### Erreur Dépendances Python
```bash
# Recréer environnement
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Erreur Dépendances Node.js
```bash
# Nettoyer cache
rm -rf node_modules yarn.lock
yarn cache clean

# Réinstaller
yarn install
```

### Erreur Clés API
```bash
# Vérifier variables d'environnement
echo $OPENAI_API_KEY
echo $GOOGLE_SEARCH_API_KEY

# Tester connectivité APIs
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

## 🔄 Mise à Jour

### Code Source
```bash
# Récupérer dernières modifications
git pull origin main

# Backend: réinstaller dépendances si requirements.txt modifié
cd backend
pip install -r requirements.txt

# Frontend: réinstaller si package.json modifié
cd ../frontend
yarn install
```

### Base de Données
```bash
# Sauvegarde avant mise à jour
mongodump --db dmsports_products --out backup/

# Restauration si nécessaire
mongorestore --db dmsports_products backup/dmsports_products/
```

## 📞 Support

### Logs à Vérifier
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs  
tail -f logs/frontend.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Nginx logs (si applicable)
sudo tail -f /var/log/nginx/error.log
```

### Tests de Diagnostic
```bash
# Test connectivité backend
curl -f http://localhost:8001/api/ || echo "Backend inaccessible"

# Test frontend
curl -f http://localhost:3000 || echo "Frontend inaccessible"

# Test MongoDB
mongo --eval "db.runCommand({connectionStatus : 1})" || echo "MongoDB inaccessible"
```

Cette installation vous permettra d'avoir un environnement complet et fonctionnel pour le générateur de fiches produits DM'Sports ! 🚀