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
yarn install
cp .env.example .env
# Éditer .env avec l'URL backend
yarn start
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

- Développé avec ❤️ pour DM'Sports

## 🙏 Remerciements

- OpenAI pour l'API GPT
- Google pour l'API Search
- Communauté React et FastAPI