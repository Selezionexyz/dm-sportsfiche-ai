# 🏷️ Générateur de Fiches Produits DM'Sports

Outil intelligent de création automatique de fiches produits avec IA + recherche EAN.

## 🚀 Fonctionnalités

### ✨ Recherche par EAN
- Saisissez un code EAN (13 chiffres)  
- Recherche automatique sur Google
- Extraction intelligente des informations produit

### 🤖 Génération IA
- Création automatique des fiches produits
- Description optimisée pour la vente
- Caractéristiques détaillées
- Prix et informations techniques

### 📋 Export PrestaShop
- Fiches optimisées pour PrestaShop
- Format JSON/CSV compatible
- SEO automatique (meta title, description)
- Gestion des déclinaisons (tailles, couleurs)

### 🎨 Interface DM'Sports
- Design moderne et épuré
- Responsive (mobile, tablette, desktop)
- Navigation intuitive par onglets
- Alerts et feedbacks utilisateur

## 🔧 Configuration

### 1. Clés API requises

#### OpenAI API Key
```
1. Aller sur: https://platform.openai.com
2. Créer compte/se connecter
3. API Keys → Create new secret key
4. Copier la clé (sk-...)
```

#### Google Search API
```
1. Aller sur: https://console.cloud.google.com
2. Créer projet → Activer "Custom Search JSON API"
3. Credentials → Create API key
4. Aller sur: https://cse.google.com
5. Créer moteur de recherche → Copier l'ID (CX)
```

### 2. Configuration environnement

Éditez `/app/backend/.env`:
```bash
OPENAI_API_KEY=sk-votre_vraie_clé_openai
GOOGLE_SEARCH_API_KEY=AIza_votre_vraie_clé_google  
GOOGLE_SEARCH_CX=votre_vrai_id_moteur
```

### 3. Redémarrage

```bash
sudo supervisorctl restart backend
```

## 📖 Guide d'utilisation

### Étape 1: Recherche EAN
- Onglet "🔍 Recherche EAN"
- Saisir le code EAN du produit
- Option: générer la fiche automatiquement
- Cliquer "🚀 Rechercher & Générer"

### Étape 2: Validation produit  
- Onglet "📦 Produits" 
- Vérifier les informations générées
- Modifier si nécessaire
- Générer la fiche si pas fait automatiquement

### Étape 3: Export fiche
- Onglet "📋 Fiches Créées"
- Cliquer "📤 Export" sur la fiche désirée
- Téléchargement automatique du JSON PrestaShop

## 🏗️ Architecture Technique

### Backend (FastAPI)
- API REST complète
- Intégration OpenAI GPT-3.5/4
- Recherche Google Search JSON API
- Base de données MongoDB
- Modèles Pydantic pour validation

### Frontend (React)
- Interface moderne avec Tailwind CSS
- État global avec hooks React
- Calls API avec Axios
- Design responsive
- Modales et composants réutilisables

### Base de données
- MongoDB avec Motor (async)
- Collections: products, product_sheets, product_searches
- Index sur EAN codes pour performances

## 📊 Structure des données

### Produit
```json
{
  "id": "uuid",
  "ean_code": "1234567890123",
  "title": "Nike Air Max 97 - Noir",
  "brand": "Nike", 
  "model": "Air Max 97",
  "color": "Noir",
  "category": "Chaussures",
  "price": 179.99,
  "description": "Description vendeuse...",
  "characteristics": {
    "marque": "Nike",
    "couleur": "Noir", 
    "matière": "Synthétique",
    "saison": "Toute saison"
  },
  "sizes": ["39", "40", "41", "42", "43"],
  "weight_by_type": {
    "baskets": 1.0,
    "ensemble": 0.75
  }
}
```

### Fiche produit
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "title": "Nike Air Max 97 - Noir",
  "reference": "REF-90123",
  "price_ttc": 179.99,
  "description": "HTML formaté pour PrestaShop",
  "seo_title": "Nike Air Max 97 Noir | DM'Sports",
  "seo_description": "Meta description SEO...",
  "export_data": {
    "prestashop_format": { /* Format PrestaShop */ }
  }
}
```

## 🔄 API Endpoints

### Recherche & Génération
- `POST /api/search/ean` - Recherche par EAN
- `POST /api/generate/product` - Pipeline complet EAN→Produit→Fiche

### Gestion produits
- `GET /api/products` - Liste produits
- `GET /api/products/{id}` - Détail produit
- `DELETE /api/products/{id}` - Supprimer produit

### Fiches produits  
- `GET /api/sheets` - Liste fiches
- `POST /api/sheets` - Générer fiche
- `GET /api/sheets/{id}/export` - Export PrestaShop

### Statistiques
- `GET /api/stats` - Statistiques globales
- `GET /api/` - Status API

## 🧪 Tests

### Codes EAN d'exemple
- `3614270357637` - Nike Air Max
- `4064037884942` - Adidas Originals  
- `1234567890123` - Code test simulation

### Mode simulation
Si les clés API ne sont pas configurées, l'outil fonctionne en mode simulation avec des données réalistes.

## 🚨 Résolution de problèmes

### Backend ne démarre pas
```bash
# Vérifier les logs
tail -n 100 /var/log/supervisor/backend.*.log

# Redémarrer
sudo supervisorctl restart backend
```

### Erreurs OpenAI
- Vérifier la clé API dans .env
- Vérifier le quota OpenAI
- Contrôler les logs backend

### Erreurs Google Search
- Vérifier clé API ET ID moteur (CX)
- Contrôler quotas Google Cloud
- Activer Custom Search JSON API

### Interface ne se charge pas
```bash
# Redémarrer frontend
sudo supervisorctl restart frontend

# Vérifier les services
sudo supervisorctl status
```

## 📝 Changelog

### v2.0.0 (Actuelle)
- ✅ Interface complètement refaite style DM'Sports
- ✅ Backend optimisé avec OpenAI v1.0+
- ✅ Recherche Google multi-requêtes  
- ✅ Export PrestaShop amélioré
- ✅ Modal détails produits
- ✅ Statistiques en temps réel
- ✅ Gestion d'erreurs robuste

## 💡 Bonnes pratiques

### Codes EAN
- Utilisez des codes EAN valides (13 chiffres)
- Vérifiez sur des sites e-commerce avant test
- Les codes génériques peuvent donner des résultats limités

### Génération IA  
- Plus l'EAN est connu, meilleure sera la génération
- Vérifiez toujours le contenu avant export
- Adaptez les descriptions à votre cible

### Performance
- L'outil met 3-10s par produit (recherche + IA)
- Les requêtes Google sont limitées (100/jour gratuit)
- Optimisez vos requêtes pour éviter les quotas

## 📞 Support

Pour toute question ou problème:
1. Vérifiez cette documentation
2. Contrôlez les logs (backend/frontend)  
3. Testez avec codes EAN d'exemple
4. Vérifiez configuration clés API

---

🏷️ **Générateur de Fiches Produits DM'Sports v2.0.0**  
*Outil professionnel pour e-commerce moderne*