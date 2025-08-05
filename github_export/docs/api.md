# 📚 Documentation API - Générateur de Fiches Produits

Documentation complète de l'API REST pour le générateur de fiches produits DM'Sports.

## 🌐 Informations Générales

- **Base URL** : `http://localhost:8001/api`
- **Format** : JSON
- **Authentification** : Aucune (version actuelle)
- **CORS** : Activé pour tous les domaines
- **Rate Limiting** : 100 requêtes/minute par IP

## 📊 Endpoints Disponibles

### Status & Configuration

#### `GET /`
Retourne le statut de l'API et la configuration des services.

**Réponse :**
```json
{
  "message": "🏷️ API Générateur de Fiches Produits DM'Sports",
  "version": "2.0.0",
  "features": ["EAN Search", "AI Generation", "PrestaShop Export"],
  "openai_configured": true,
  "google_configured": true
}
```

---

## 🔍 Recherche & Génération

### `POST /search/ean`
Recherche un produit par code EAN via Google Search.

**Paramètres :**
```json
{
  "ean_code": "3614270357637"
}
```

**Réponse :**
```json
{
  "id": "uuid-string",
  "ean_code": "3614270357637",
  "search_query": "3614270357637 produit caractéristiques",
  "google_results": [
    {
      "title": "Nike Air Max 97 - EAN 3614270357637",
      "snippet": "Découvrez les Nike Air Max 97...",
      "link": "https://www.nike.com/fr/product/3614270357637",
      "pagemap": {
        "product": [{
          "name": "Nike Air Max 97",
          "brand": "Nike",
          "price": "179.99"
        }]
      }
    }
  ],
  "extracted_info": {
    "titles": ["Nike Air Max 97..."],
    "brands": ["Nike"],
    "prices": ["179.99"],
    "descriptions": ["Chaussures de sport premium..."],
    "potential_category": "Chaussures",
    "urls": ["https://www.nike.com/fr/product/3614270357637"]
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

### `POST /generate/product`
Pipeline complet : recherche EAN → génération IA → création fiche.

**Paramètres :**
```json
{
  "ean_code": "3614270357637",
  "generate_sheet": true
}
```

**Réponse :**
```json
{
  "success": true,
  "product": {
    "id": "uuid-product",
    "ean_code": "3614270357637",
    "title": "Chaussures Nike Air Max 97 - Noir",
    "brand": "Nike",
    "model": "Air Max 97",
    "color": "Noir",
    "category": "Chaussures",
    "price": 179.99,
    "description": "Découvrez les Nike Air Max 97, des chaussures de sport iconiques alliant style rétro et technologie moderne. Dotées de la technologie Air Max visible, elles offrent un amorti exceptionnel et un confort optimal pour vos activités quotidiennes et sportives.",
    "characteristics": {
      "marque": "Nike",
      "couleur": "Noir",
      "matière": "Synthétique et textile",
      "saison": "Toute saison",
      "style": "Sport/Streetwear",
      "origine": "Import"
    },
    "sizes": ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    "weight_by_type": {
      "baskets": 1.0,
      "ensemble": 0.75,
      "sweat": 0.5,
      "t-shirt": 0.25,
      "maroquinerie": 0.3
    },
    "images": [],
    "google_source": "Google Search - 8 résultats",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "product_sheet": {
    "id": "uuid-sheet",
    "product_id": "uuid-product",
    "title": "Chaussures Nike Air Max 97 - Noir",
    "reference": "REF-57637",
    "color_code": "NOI",
    "price_ttc": 179.99,
    "description": "<div class=\"product-description\">...</div>",
    "characteristics": {
      "marque": "Nike",
      "couleur": "Noir",
      "matière": "Synthétique et textile"
    },
    "variants": [],
    "weight_info": {
      "baskets": 1.0
    },
    "seo_title": "Chaussures Nike Air Max 97 Noir | DM'Sports - Livraison Gratuite",
    "seo_description": "Achetez Chaussures Nike Air Max 97 de Nike sur DM'Sports. Découvrez les Nike Air Max 97, des chaussures de sport iconiques...",
    "associated_products": [],
    "prestashop_ready": true,
    "export_data": {
      "prestashop_format": {
        "name": "Chaussures Nike Air Max 97 - Noir",
        "reference": "REF-57637",
        "price": 179.99,
        "description": "Découvrez les Nike Air Max 97...",
        "meta_title": "Chaussures Nike Air Max 97 - Nike | DM'Sports",
        "meta_description": "Découvrez les Nike Air Max 97, des chaussures de sport iconiques alliant style rétro et technologie moderne...",
        "categories": ["Chaussures"],
        "brand": "Nike",
        "ean13": "3614270357637"
      }
    },
    "created_at": "2024-01-15T10:30:00Z",
    "status": "draft"
  },
  "search_summary": {
    "results_count": 8,
    "brands_found": ["Nike"],
    "category_detected": "Chaussures"
  }
}
```

---

## 📦 Gestion des Produits

### `GET /products`
Récupère la liste des produits avec pagination et filtres.

**Paramètres de requête :**
- `limit` (int, optionnel) : Nombre max de résultats (défaut: 50)
- `offset` (int, optionnel) : Décalage pour pagination (défaut: 0)
- `category` (string, optionnel) : Filtrer par catégorie

**Exemple :**
```
GET /api/products?limit=20&offset=0&category=Chaussures
```

**Réponse :**
```json
[
  {
    "id": "uuid-product-1",
    "ean_code": "3614270357637",
    "title": "Chaussures Nike Air Max 97 - Noir",
    "brand": "Nike",
    "model": "Air Max 97",
    "color": "Noir",
    "category": "Chaussures",
    "price": 179.99,
    "description": "Description du produit...",
    "characteristics": {...},
    "sizes": ["39", "40", "41", "42", "43"],
    "weight_by_type": {...},
    "images": [],
    "google_source": "Google Search - 8 résultats",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### `GET /products/{product_id}`
Récupère les détails d'un produit spécifique.

**Paramètres :**
- `product_id` (string) : Identifiant unique du produit

**Réponse :**
```json
{
  "id": "uuid-product",
  "ean_code": "3614270357637",
  "title": "Chaussures Nike Air Max 97 - Noir",
  // ... autres champs produit
}
```

**Erreurs :**
- `404` : Produit non trouvé

### `POST /products`
Crée un nouveau produit manuellement.

**Paramètres :**
```json
{
  "ean_code": "1234567890123",
  "title": "Nouveau Produit",
  "brand": "Marque",
  "model": "Modèle Test",
  "color": "Rouge",
  "category": "Vêtements",
  "price": 49.99,
  "description": "Description du produit...",
  "characteristics": {
    "marque": "Marque",
    "couleur": "Rouge",
    "matière": "Coton"
  },
  "sizes": ["S", "M", "L", "XL"],
  "weight_by_type": {
    "t-shirt": 0.25
  },
  "images": []
}
```

### `DELETE /products/{product_id}`
Supprime un produit et ses fiches associées.

**Réponse :**
```json
{
  "message": "Produit supprimé avec succès"
}
```

---

## 📋 Gestion des Fiches Produits

### `GET /sheets`
Récupère la liste des fiches produits.

**Paramètres de requête :**
- `limit` (int, optionnel) : Nombre max de résultats (défaut: 50)
- `offset` (int, optionnel) : Décalage pour pagination (défaut: 0)
- `status` (string, optionnel) : Filtrer par statut (`draft`, `published`, `exported`)

**Exemple :**
```
GET /api/sheets?limit=10&status=published
```

**Réponse :**
```json
[
  {
    "id": "uuid-sheet",
    "product_id": "uuid-product",
    "title": "Chaussures Nike Air Max 97 - Noir",
    "reference": "REF-57637",
    "color_code": "NOI",
    "price_ttc": 179.99,
    "description": "<div class=\"product-description\">...</div>",
    "characteristics": {...},
    "variants": [],
    "weight_info": {...},
    "seo_title": "Titre SEO optimisé...",
    "seo_description": "Description SEO...",
    "associated_products": [],
    "prestashop_ready": true,
    "export_data": {...},
    "created_at": "2024-01-15T10:30:00Z",
    "status": "published"
  }
]
```

### `POST /sheets`
Génère une nouvelle fiche produit pour un produit existant.

**Paramètres :**
```json
{
  "product_id": "uuid-product",
  "generate_with_ai": true
}
```

**Réponse :**
```json
{
  "id": "uuid-sheet",
  "product_id": "uuid-product",
  "title": "Titre de la fiche...",
  // ... autres champs fiche
}
```

### `GET /sheets/{sheet_id}/export`
Exporte une fiche produit au format spécifié.

**Paramètres de requête :**
- `format` (string, optionnel) : Format d'export (`prestashop`, `json`) (défaut: prestashop)

**Exemple :**
```
GET /api/sheets/uuid-sheet/export?format=prestashop
```

**Réponse :**
```json
{
  "format": "prestashop",
  "data": {
    "name": "Chaussures Nike Air Max 97 - Noir",
    "reference": "REF-57637",
    "price": 179.99,
    "description": "Description du produit...",
    "meta_title": "Titre SEO...",
    "meta_description": "Description SEO...",
    "categories": ["Chaussures"],
    "brand": "Nike",
    "ean13": "3614270357637"
  },
  "instructions": "Importez ces données dans PrestaShop via CSV ou API"
}
```

---

## 📊 Statistiques

### `GET /stats`
Récupère les statistiques globales de l'application.

**Réponse :**
```json
{
  "total_products": 156,
  "total_sheets": 134,
  "total_searches": 203,
  "categories": {
    "Chaussures": 89,
    "Vêtements": 52,
    "Accessoires": 15
  },
  "api_status": {
    "openai_configured": true,
    "google_configured": true
  }
}
```

---

## ⚠️ Codes d'Erreur

### Codes HTTP Standard

| Code | Signification | Description |
|------|---------------|-------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée avec succès |
| `400` | Bad Request | Paramètres invalides |
| `404` | Not Found | Ressource non trouvée |
| `500` | Internal Server Error | Erreur serveur interne |

### Erreurs Spécifiques

#### 400 - Bad Request
```json
{
  "detail": "Code EAN invalide. Doit contenir 13 chiffres."
}
```

#### 404 - Not Found
```json
{
  "detail": "Produit non trouvé"
}
```

#### 500 - Erreurs API Externes
```json
{
  "detail": "Erreur OpenAI API: Rate limit exceeded"
}
```

```json
{
  "detail": "Erreur recherche Google: Invalid API key"
}
```

---

## 🔒 Limitations & Quotas

### Google Search API
- **Gratuit** : 100 requêtes/jour
- **Payant** : À partir de $5 pour 1000 requêtes
- **Rate limit** : 10 requêtes/seconde

### OpenAI API
- **Dépend** du plan tarifaire choisi
- **GPT-3.5-turbo** : ~$0.002 pour 1000 tokens
- **Rate limit** : Variable selon le plan

### Application
- **Rate limiting** : 100 requêtes/minute par IP
- **Taille max payload** : 10MB
- **Timeout requêtes** : 30 secondes

---

## 🧪 Exemples de Tests

### Test avec cURL

#### Status API
```bash
curl -X GET http://localhost:8001/api/
```

#### Recherche EAN
```bash
curl -X POST "http://localhost:8001/api/search/ean" \
  -H "Content-Type: application/json" \
  -d '{"ean_code": "3614270357637"}'
```

#### Génération complète
```bash
curl -X POST "http://localhost:8001/api/generate/product" \
  -H "Content-Type: application/json" \
  -d '{"ean_code": "3614270357637", "generate_sheet": true}'
```

#### Statistiques
```bash
curl -X GET http://localhost:8001/api/stats
```

### Test avec JavaScript (Frontend)

```javascript
// Configuration Axios
const API = 'http://localhost:8001/api';

// Génération produit
const generateProduct = async (eanCode) => {
  try {
    const response = await axios.post(`${API}/generate/product`, {
      ean_code: eanCode,
      generate_sheet: true
    });
    console.log('Produit généré:', response.data);
  } catch (error) {
    console.error('Erreur:', error.response?.data?.detail || error.message);
  }
};

// Récupération produits
const getProducts = async () => {
  try {
    const response = await axios.get(`${API}/products?limit=20`);
    console.log('Produits:', response.data);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};
```

### Test avec Python

```python
import requests

API_BASE = "http://localhost:8001/api"

# Test génération produit
def test_generate_product():
    response = requests.post(f"{API_BASE}/generate/product", json={
        "ean_code": "3614270357637",
        "generate_sheet": True
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"Produit généré: {data['product']['title']}")
    else:
        print(f"Erreur: {response.status_code} - {response.text}")

# Test récupération stats
def test_stats():
    response = requests.get(f"{API_BASE}/stats")
    if response.status_code == 200:
        stats = response.json()
        print(f"Stats: {stats['total_products']} produits, {stats['total_sheets']} fiches")
```

---

## 🔧 Configuration Avancée

### Variables d'Environnement API

```env
# Rate Limiting
API_RATE_LIMIT=100  # requêtes/minute
API_TIMEOUT=30      # secondes

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600      # secondes

# Monitoring
ENABLE_METRICS=true
PROMETHEUS_PORT=9090
```

### Headers Recommandés

```bash
# Pour toutes les requêtes
Content-Type: application/json
Accept: application/json

# Pour le monitoring
X-Request-ID: uuid-unique
User-Agent: DM-Sports-Client/1.0
```

Cette documentation vous permet d'intégrer et d'utiliser efficacement l'API du générateur de fiches produits DM'Sports ! 🚀