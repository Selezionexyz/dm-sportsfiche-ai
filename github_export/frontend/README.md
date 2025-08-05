# Frontend - Générateur de Fiches Produits DM'Sports

Interface React moderne et responsive pour le générateur de fiches produits.

## 🎨 Stack Technique

- **React 19** - Framework UI moderne
- **Tailwind CSS** - Styles utilitaires et design system
- **Axios** - Client HTTP pour les appels API
- **Craco** - Configuration webpack personnalisée
- **PostCSS & Autoprefixer** - Traitement CSS

## 📦 Installation

```bash
# Installation des dépendances
yarn install
# ou npm install

# Configuration
cp .env.example .env
# Éditer .env avec l'URL du backend
```

## ⚙️ Configuration

Éditez le fichier `.env` :

```env
# URL du backend API
REACT_APP_BACKEND_URL=http://localhost:8001

# Configuration WebSocket pour développement  
WDS_SOCKET_PORT=443
```

## 🚀 Scripts Disponibles

### Développement
```bash
# Démarrage en mode développement
yarn start
# ou npm start

# L'application s'ouvre sur http://localhost:3000
```

### Production
```bash
# Build de production
yarn build
# ou npm run build

# Prévisualisation du build
yarn preview
# ou npm run preview
```

### Tests
```bash
# Lancement des tests
yarn test
# ou npm test
```

## 🏗️ Structure du Projet

```
frontend/
├── public/
│   ├── index.html          # Template HTML principal
│   └── manifest.json       # Manifest PWA
├── src/
│   ├── App.js              # Composant principal de l'application
│   ├── App.css             # Styles Tailwind personnalisés
│   ├── index.js            # Point d'entrée React
│   └── index.css           # Styles globaux
├── package.json            # Dépendances et scripts
├── tailwind.config.js      # Configuration Tailwind
├── postcss.config.js       # Configuration PostCSS
├── craco.config.js         # Configuration Craco/Webpack
└── .env.example           # Template variables d'environnement
```

## 🎨 Design System (Style DM'Sports)

### Couleurs Principales
- **Primaire**: Bleu (#3b82f6)
- **Succès**: Vert (#10b981)
- **Erreur**: Rouge (#ef4444)
- **Avertissement**: Jaune (#f59e0b)
- **Neutre**: Gris (#6b7280)

### Typographie
- **Font**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Tailles**: text-sm, text-base, text-lg, text-xl, text-2xl

### Composants Stylisés
- **Cartes produits**: Ombres, bordures arrondies, transitions
- **Boutons**: Gradients, états hover/disabled
- **Badges**: Couleurs contextuelles, coins arrondis
- **Modales**: Overlay, animation fadeIn

## 🧩 Composants Principaux

### `<Header />`
- Titre de l'application avec badges
- Statistiques en temps réel
- Indicateurs de statut API

### `<EANSearchForm />`
- Formulaire de recherche EAN
- Exemples de codes cliquables
- Option génération automatique de fiche

### `<ProductCard />`
- Affichage compact d'un produit
- Actions (générer fiche, détails, supprimer)
- Badges pour caractéristiques

### `<ProductSheetCard />`
- Affichage d'une fiche produit
- Statut (brouillon/publié/exporté)
- Actions d'export et détails

### `<ProductModal />`
- Modal détaillée d'un produit
- Affichage complet des caractéristiques
- Interface responsive

## 📱 Responsive Design

### Breakpoints Tailwind
- **sm**: 640px+ (tablets)
- **md**: 768px+ (small laptops)
- **lg**: 1024px+ (laptops)
- **xl**: 1280px+ (desktops)

### Adaptations Mobile
- Navigation simplifiée
- Cartes en colonne unique
- Espacements réduits
- Boutons plus grands

## 🔌 Communication API

### Configuration Axios
```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
```

### Endpoints Utilisés
- `GET /api/products` - Liste des produits
- `POST /api/generate/product` - Génération complète
- `GET /api/sheets` - Liste des fiches
- `GET /api/stats` - Statistiques
- `GET /api/sheets/{id}/export` - Export PrestaShop

### Gestion d'État
- **useState** pour état local des composants
- **useEffect** pour chargement données
- **Alerts système** pour notifications utilisateur

## 🎯 Fonctionnalités Clés

### Recherche EAN
1. Saisie code EAN (13 chiffres)
2. Validation côté client
3. Appel API asynchrone
4. Affichage résultats avec feedback

### Gestion Produits
1. Liste paginée avec filtres
2. Modal détails avec toutes infos
3. Génération fiches à la demande
4. Suppression avec confirmation

### Export Fiches
1. Format PrestaShop JSON
2. Téléchargement automatique
3. Données optimisées SEO
4. Structure compatible import

## 🐛 Débogage

### Erreurs Communes

**❌ Backend inaccessible**
```bash
# Vérifier l'URL dans .env
echo $REACT_APP_BACKEND_URL

# Tester la connectivité
curl http://localhost:8001/api/
```

**❌ Styles Tailwind non appliqués**
```bash
# Reconstruire les styles
yarn build
```

**❌ Hot reload non fonctionnel**
```bash
# Redémarrer le serveur de dev
yarn start
```

### Outils de Développement

**Chrome DevTools**
- Network tab pour appels API
- Console pour logs JavaScript
- Elements pour inspection CSS

**React DevTools**
- Inspection composants React
- État des props/state
- Profiling performance

## 🚀 Optimisations

### Performance
- **Lazy loading** pour composants lourds
- **Pagination** pour grandes listes
- **Debouncing** pour recherches
- **Mise en cache** réponses API

### SEO
- **Meta tags** optimisés
- **Structured data** pour produits
- **URLs** SEO-friendly
- **Sitemap** automatique

### Accessibilité
- **ARIA labels** sur éléments interactifs
- **Focus management** pour navigation clavier
- **Contraste** couleurs respecté
- **Screen readers** compatibles

## 📈 Métriques

### Bundle Size
- **Analyseur** : `yarn build --analyze`
- **Objectif** : < 500KB gzipped
- **Optimisations** : Tree shaking, code splitting

### Performance Web
- **Lighthouse** score > 90
- **First Paint** < 1.5s
- **Time to Interactive** < 3s
- **Cumulative Layout Shift** < 0.1