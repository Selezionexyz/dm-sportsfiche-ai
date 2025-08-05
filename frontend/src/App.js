import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Composants
const Header = () => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Générateur de Fiches Produits</h1>
          <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            IA + EAN
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Style DM'Sports
        </div>
      </div>
    </div>
  </header>
);

const EANSearchForm = ({ onSearch, loading }) => {
  const [eanCode, setEanCode] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (eanCode.trim()) {
      onSearch(eanCode.trim());
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recherche par Code EAN</h2>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={eanCode}
            onChange={(e) => setEanCode(e.target.value)}
            placeholder="Entrez le code EAN du produit..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !eanCode.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Recherche...' : 'Rechercher & Générer'}
        </button>
      </form>
    </div>
  );
};

const ProductCard = ({ product, onGenerateSheet, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.title}</h3>
          <p className="text-sm text-gray-600">EAN: {product.ean_code}</p>
          <p className="text-sm text-blue-600 font-medium">{product.brand} • {product.category}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onGenerateSheet(product.id)}
            className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full hover:bg-green-200 transition-colors"
          >
            Fiche
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full hover:bg-red-200 transition-colors"
          >
            Suppr
          </button>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{product.color}</span>
          {product.price && (
            <span className="text-sm font-bold text-green-600">{product.price}€</span>
          )}
        </div>
        
        {product.sizes?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {product.sizes.slice(0, 6).map((size, idx) => (
              <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {size}
              </span>
            ))}
            {product.sizes.length > 6 && (
              <span className="text-xs text-gray-500">+{product.sizes.length - 6}</span>
            )}
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-3">
        {product.description}
      </p>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Créé: {new Date(product.created_at).toLocaleDateString('fr-FR')}</span>
          <div className="flex gap-2">
            {Object.entries(product.characteristics || {}).slice(0, 2).map(([key, value]) => (
              <span key={key} className="bg-gray-50 px-2 py-1 rounded">{key}: {value}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductSheetCard = ({ sheet }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{sheet.title}</h3>
          <p className="text-sm text-gray-600">Ref: {sheet.reference}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            sheet.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {sheet.status}
          </span>
          <span className="text-sm font-bold text-green-600">{sheet.price_ttc}€ TTC</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{sheet.description}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Caractéristiques</h4>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(sheet.characteristics || {}).map(([key, value]) => (
              <span key={key} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">SEO</h4>
          <p className="text-xs text-gray-500 line-clamp-1">{sheet.seo_title}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Créé: {new Date(sheet.created_at).toLocaleDateString('fr-FR')}</span>
          <div className="flex gap-2">
            <button className="text-blue-600 hover:text-blue-700 font-medium">Éditer</button>
            <button className="text-green-600 hover:text-green-700 font-medium">Export</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const AlertMessage = ({ type, message, onClose }) => (
  <div className={`p-4 rounded-md mb-4 ${
    type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
    type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
    'bg-blue-50 text-blue-700 border border-blue-200'
  }`}>
    <div className="flex justify-between items-center">
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [products, setProducts] = useState([]);
  const [productSheets, setProductSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Charger les données au démarrage
  useEffect(() => {
    loadProducts();
    loadProductSheets();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const loadProductSheets = async () => {
    try {
      const response = await axios.get(`${API}/sheets`);
      setProductSheets(response.data);
    } catch (error) {
      console.error('Erreur chargement fiches:', error);
    }
  };

  const handleEANSearch = async (eanCode) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/generate/product`, {
        ean_code: eanCode,
        generate_sheet: true
      });
      
      setAlert({
        type: 'success',
        message: `Produit généré avec succès pour l'EAN ${eanCode}!`
      });
      
      // Recharger les données
      await loadProducts();
      await loadProductSheets();
      
      // Basculer vers l'onglet produits
      setActiveTab('products');
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Erreur: ${error.response?.data?.detail || error.message}`
      });
    }
    setLoading(false);
  };

  const handleGenerateSheet = async (productId) => {
    try {
      await axios.post(`${API}/sheets`, {
        product_id: productId,
        generate_with_ai: true
      });
      
      setAlert({
        type: 'success',
        message: 'Fiche produit générée avec succès!'
      });
      
      await loadProductSheets();
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Erreur génération fiche: ${error.response?.data?.detail || error.message}`
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`);
      setAlert({
        type: 'success',
        message: 'Produit supprimé avec succès!'
      });
      
      await loadProducts();
      await loadProductSheets();
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Erreur suppression: ${error.response?.data?.detail || error.message}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <AlertMessage 
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex space-x-8 px-6 py-4" aria-label="Tabs">
            {[
              { key: 'search', label: 'Recherche EAN', count: null },
              { key: 'products', label: 'Produits', count: products.length },
              { key: 'sheets', label: 'Fiches Créées', count: productSheets.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des Tabs */}
        {activeTab === 'search' && (
          <div>
            <EANSearchForm onSearch={handleEANSearch} loading={loading} />
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Comment ça marche ?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-medium mb-2">Entrez le code EAN</h4>
                  <p className="text-sm text-gray-600">Saisissez le code-barres du produit</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h4 className="font-medium mb-2">Recherche automatique</h4>
                  <p className="text-sm text-gray-600">L'IA trouve les infos sur Google</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h4 className="font-medium mb-2">Fiche générée</h4>
                  <p className="text-sm text-gray-600">Fiche complète prête pour PrestaShop</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Produits Générés ({products.length})</h2>
              <button 
                onClick={loadProducts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualiser
              </button>
            </div>
            
            {loading ? (
              <LoadingSpinner />
            ) : products.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onGenerateSheet={handleGenerateSheet}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-gray-600 mb-4">Commencez par rechercher un produit avec son code EAN</p>
                <button 
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Rechercher un produit
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sheets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Fiches Produits ({productSheets.length})</h2>
              <button 
                onClick={loadProductSheets}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualiser
              </button>
            </div>
            
            {productSheets.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {productSheets.map((sheet) => (
                  <ProductSheetCard key={sheet.id} sheet={sheet} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune fiche créée</h3>
                <p className="text-gray-600 mb-4">Générez des fiches à partir de vos produits</p>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir les produits
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;