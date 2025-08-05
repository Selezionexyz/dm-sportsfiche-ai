# Backend - Générateur de Fiches Produits

API FastAPI pour la génération automatique de fiches produits avec IA.

## 🛠️ Stack Technique

- **FastAPI** - Framework web moderne et performant
- **OpenAI GPT-3.5/4** - Génération de contenu IA
- **Google Custom Search API** - Recherche d'informations produit
- **MongoDB + Motor** - Base de données NoSQL asynchrone
- **Pydantic** - Validation et sérialisation des données

## 📦 Installation

```bash
# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Éditer .env avec vos clés API
```

## 🔑 Configuration

Éditez le fichier `.env` avec vos clés API :

```env
OPENAI_API_KEY=sk-votre_clé_openai
GOOGLE_SEARCH_API_KEY=AIza_votre_clé_google
GOOGLE_SEARCH_CX=votre_id_moteur_google
```

## 🚀 Lancement

```bash
# Développement
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Production
python -m uvicorn server:app --host 0.0.0.0 --port 8001
```

## 📊 API Endpoints

### Status
- `GET /api/` - Status de l'API et configuration

### Recherche & Génération
- `POST /api/search/ean` - Recherche par code EAN
- `POST /api/generate/product` - Pipeline complet EAN→Produit→Fiche

### Gestion Produits
- `GET /api/products` - Liste des produits (avec pagination)
- `GET /api/products/{id}` - Détail d'un produit
- `DELETE /api/products/{id}` - Supprimer un produit

### Fiches Produits  
- `GET /api/sheets` - Liste des fiches (avec filtres)
- `POST /api/sheets` - Générer une fiche pour un produit
- `GET /api/sheets/{id}/export` - Export PrestaShop/JSON

### Statistiques
- `GET /api/stats` - Statistiques globales de l'application

## 🧪 Tests

```bash
# Test de base
curl http://localhost:8001/api/

# Test génération produit
curl -X POST "http://localhost:8001/api/generate/product" \
  -H "Content-Type: application/json" \
  -d '{"ean_code": "3614270357637", "generate_sheet": true}'

# Test statistiques
curl http://localhost:8001/api/stats
```

## 📚 Documentation Interactive

Une fois lancé, accédez à :
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🔧 Architecture

```
backend/
├── server.py              # Application principale FastAPI
├── requirements.txt       # Dépendances Python
├── .env.example          # Template de configuration
└── README.md             # Cette documentation
```

### Services Principaux

- **GoogleSearchService**: Recherche et extraction d'informations via Google
- **AIService**: Génération de contenu avec OpenAI
- **Database**: Gestion MongoDB avec Motor (async)

### Modèles Pydantic

- **Product**: Modèle produit complet
- **ProductSheet**: Fiche produit PrestaShop
- **ProductSearch**: Historique des recherches EAN

## ⚠️ Limitations

- **Google Search API**: 100 requêtes gratuites/jour
- **OpenAI API**: Selon votre plan tarifaire
- **Rate Limiting**: 100 requêtes/minute par IP

## 🐛 Résolution de Problèmes

### Erreur "Module not found"
```bash
pip install -r requirements.txt
```

### Erreur MongoDB
```bash
# Vérifier que MongoDB est démarré
sudo systemctl status mongodb
sudo systemctl start mongodb
```

### Erreur OpenAI/Google API
- Vérifier les clés dans `.env`
- Contrôler les quotas sur les plateformes respectives