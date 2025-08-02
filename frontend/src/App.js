import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div className={`toast ${type}`} onClick={onClose}>
    {message}
  </div>
);

// Authentication component
const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin 
        ? { username: formData.username, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      
      onLogin(response.data.user);
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur de connexion');
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          DM'S SPORTS
          <span className="logo-badge">AI PRO</span>
        </div>
        
        <h2 className="auth-title">
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? '...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Generator Component
const ProductGenerator = ({ user, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    gender: '',
    price: '',
    old_price: '',
    sku: '',
    description: '',
    short_description: '',
    material: '',
    season: '',
    features: [],
    sizes: [],
    colors: [],
    images: []
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Brands from backend
  const brands = [
    "Nike", "Adidas", "Puma", "Lacoste", "Hugo Boss", "Calvin Klein",
    "Emporio Armani EA7", "Ralph Lauren", "Tommy Hilfiger", "The North Face",
    "Champion", "Fila", "New Balance", "Under Armour", "Asics", "Reebok",
    "Vans", "Converse", "Timberland", "Columbia", "Ellesse", "Kappa",
    "Sergio Tacchini", "Fred Perry", "Gant", "Mizuno", "Saucony", "Le Coq Sportif"
  ];

  const categories = {
    "Chaussures": ["chaussures-running", "chaussures-lifestyle", "chaussures-basketball", "chaussures-football", "chaussures-tennis", "chaussures-training"],
    "Vêtements": ["survetements", "sweats", "tshirts", "polos", "pantalons", "shorts", "vestes", "doudounes", "chemises", "robes", "jupes", "leggings"],
    "Accessoires": ["sacs", "casquettes", "bonnets", "echarpes", "gants", "chaussettes", "ceintures"]
  };

  const colors = [
    { name: "Noir", value: "#000000" },
    { name: "Blanc", value: "#FFFFFF" },
    { name: "Gris", value: "#808080" },
    { name: "Argent", value: "#C0C0C0" },
    { name: "Or", value: "#FFD700" },
    { name: "Marine", value: "#000080" },
    { name: "Bleu", value: "#0000FF" },
    { name: "Bleu Ciel", value: "#87CEEB" },
    { name: "Rouge", value: "#FF0000" },
    { name: "Bordeaux", value: "#8B0000" },
    { name: "Orange", value: "#FFA500" },
    { name: "Jaune", value: "#FFFF00" },
    { name: "Vert", value: "#008000" },
    { name: "Vert Clair", value: "#90EE90" },
    { name: "Kaki", value: "#556B2F" },
    { name: "Rose", value: "#FFC0CB" },
    { name: "Fuchsia", value: "#FF1493" },
    { name: "Violet", value: "#800080" },
    { name: "Marron", value: "#8B4513" },
    { name: "Beige", value: "#F5DEB3" }
  ];

  const getSizesForCategory = (category, gender) => {
    if (category.includes('chaussures')) {
      if (gender === 'homme') {
        return ['39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
      } else if (gender === 'femme') {
        return ['35', '36', '37', '38', '39', '40', '41', '42'];
      } else if (gender === 'enfant') {
        return ['28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38'];
      } else if (gender === 'bebe') {
        return ['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27'];
      }
      return ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
    } else {
      if (gender === 'enfant') {
        return ['4A', '6A', '8A', '10A', '12A', '14A', '16A'];
      } else if (gender === 'bebe') {
        return ['3M', '6M', '9M', '12M', '18M', '24M', '36M'];
      }
      return ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeaturesChange = (e) => {
    const features = e.target.value.split('\n').filter(f => f.trim());
    setFormData(prev => ({ ...prev, features }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const response = await axios.post('/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadedImage(response.data.image_url);
      setFormData(prev => ({ ...prev, images: [response.data.image_url] }));
    } catch (error) {
      alert('Erreur lors du téléchargement de l\'image');
    }
  };

  const toggleSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color) 
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const generateProduct = async () => {
    if (!formData.name || !formData.brand || !formData.category || !formData.gender || !formData.price) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/products', formData);
      setGeneratedContent(response.data.generated_content);
      onProductCreated && onProductCreated(response.data);
      
      // Show success message
      setTimeout(() => {
        document.querySelector('.preview-panel').scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
    } catch (error) {
      alert('Erreur lors de la génération du produit');
    }

    setLoading(false);
  };

  const availableSizes = getSizesForCategory(formData.category, formData.gender);

  return (
    <div className="main-grid">
      {/* Form Panel */}
      <div className="form-panel">
        {/* Section 1: Image Upload */}
        <div className="section">
          <h3 className="section-title">
            <span className="section-number">1</span>
            Image du produit
          </h3>
          
          <div className={`upload-area ${uploadedImage ? 'has-image' : ''}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload" style={{ cursor: 'pointer', width: '100%' }}>
              {uploadedImage ? (
                <img src={uploadedImage} alt="Preview" className="upload-preview" />
              ) : (
                <div>
                  <div className="upload-icon">📸</div>
                  <div className="upload-text">
                    <strong>Cliquez pour ajouter une image</strong><br />
                    <span style={{ fontSize: '12px', opacity: '0.7' }}>JPG, PNG, WebP - Max 5MB</span>
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Section 2: Basic Info */}
        <div className="section">
          <h3 className="section-title">
            <span className="section-number">2</span>
            Informations produit
          </h3>
          
          <div className="form-group">
            <label>Nom du produit <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Survêtement nid d'abeilles"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Marque <span className="required">*</span></label>
              <select name="brand" value={formData.brand} onChange={handleInputChange}>
                <option value="">Sélectionner</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Catégorie <span className="required">*</span></label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="">Sélectionner</option>
                {Object.entries(categories).map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map(item => (
                      <option key={item} value={item}>{item.replace('-', ' ').replace('_', ' ')}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Genre <span className="required">*</span></label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="">Sélectionner</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="enfant">Enfant</option>
                <option value="bebe">Bébé</option>
                <option value="unisexe">Unisexe</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Référence <span className="required">*</span></label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="REF-001"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Prix (€) <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="89.99"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label>Prix barré (€)</label>
              <input
                type="number"
                name="old_price"
                value={formData.old_price}
                onChange={handleInputChange}
                placeholder="119.99"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description courte</label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              placeholder="Description courte du produit..."
            />
          </div>
        </div>

        {/* Section 3: Sizes and Colors */}
        <div className="section">
          <h3 className="section-title">
            <span className="section-number">3</span>
            Tailles et couleurs
          </h3>
          
          <div className="form-group">
            <label>Tailles disponibles</label>
            <div className="sizes-container">
              {availableSizes.map(size => (
                <div
                  key={size}
                  className={`size-item ${formData.sizes.includes(size) ? 'selected' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Couleurs disponibles</label>
            <div className="colors-container">
              {colors.map(color => (
                <div
                  key={color.name}
                  className={`color-item ${formData.colors.includes(color.name) ? 'selected' : ''}`}
                  style={{ 
                    background: color.value,
                    borderColor: color.value === '#FFFFFF' || color.value === '#FFFF00' ? '#ccc' : color.value
                  }}
                  onClick={() => toggleColor(color.name)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Details */}
        <div className="section">
          <h3 className="section-title">
            <span className="section-number">4</span>
            Détails et caractéristiques
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Matière principale</label>
              <select name="material" value={formData.material} onChange={handleInputChange}>
                <option value="">Sélectionner</option>
                <option value="100% Coton">100% Coton</option>
                <option value="Polyester">Polyester</option>
                <option value="Coton/Polyester">Coton/Polyester</option>
                <option value="Mesh respirant">Mesh respirant</option>
                <option value="Cuir">Cuir</option>
                <option value="Synthétique">Synthétique</option>
                <option value="Nylon">Nylon</option>
                <option value="Laine">Laine</option>
                <option value="Élasthanne">Élasthanne</option>
                <option value="Gore-Tex">Gore-Tex</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Saison</label>
              <select name="season" value={formData.season} onChange={handleInputChange}>
                <option value="">Sélectionner</option>
                <option value="Printemps/Été">Printemps/Été</option>
                <option value="Automne/Hiver">Automne/Hiver</option>
                <option value="Toutes saisons">Toutes saisons</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Points forts (un par ligne)</label>
            <textarea
              value={formData.features.join('\n')}
              onChange={handleFeaturesChange}
              placeholder="Logo brodé&#10;Poches zippées&#10;Coupe ajustée&#10;Technologie Dri-FIT"
            />
          </div>
        </div>

        <button className="generate-btn" onClick={generateProduct} disabled={loading}>
          {loading ? <span className="loading"></span> : <span>⚡</span>}
          {loading ? 'GÉNÉRATION EN COURS...' : 'GÉNÉRER LA FICHE PRODUIT'}
        </button>
      </div>

      {/* Preview Panel */}
      <div className="preview-panel">
        <div className="preview-header">
          <h3 className="preview-title">📄 Aperçu de la fiche produit</h3>
        </div>
        
        {!generatedContent ? (
          <div className="preview-empty">
            <div className="preview-empty-icon">📝</div>
            <p>Remplissez le formulaire et cliquez sur<br />"Générer" pour voir l'aperçu</p>
          </div>
        ) : (
          <div className="preview-content show">
            <div className="product-preview">
              <h2 className="product-title">{generatedContent.title}</h2>
              <div className="product-price">
                {formData.old_price && parseFloat(formData.old_price) > parseFloat(formData.price) ? (
                  <>
                    <span className="old-price">{formData.old_price}€</span>
                    <span className="current-price">{formData.price}€</span>
                    <span className="discount-badge">
                      -{Math.round((1 - formData.price / formData.old_price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="current-price">{formData.price}€</span>
                )}
              </div>
              <div dangerouslySetInnerHTML={{ __html: generatedContent.description }} />
            </div>
            
            <div className="export-options">
              <button className="export-btn" onClick={() => {
                const content = generatedContent.description;
                const title = generatedContent.title;
                const price = formData.price;
                const fullContent = `${title}\n${price}€\n\n${content.replace(/<[^>]*>/g, '')}`;
                navigator.clipboard.writeText(fullContent);
                alert('📋 Contenu copié dans le presse-papier');
              }}>
                <span>📋</span> Copier
              </button>
              <button className="export-btn" onClick={() => {
                const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${generatedContent.title} - DM Sports</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .price { font-size: 24px; margin: 20px 0; }
    .current-price { font-weight: bold; color: #e60012; }
    .old-price { text-decoration: line-through; color: #999; }
    h4 { color: #666; margin-top: 25px; }
    table { width: 100%; border-collapse: collapse; }
    table td { padding: 8px; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <h1>${generatedContent.title}</h1>
  <div class="price">
    ${formData.old_price && parseFloat(formData.old_price) > parseFloat(formData.price) ? 
      `<span class="old-price">${formData.old_price}€</span> ` : ''}
    <span class="current-price">${formData.price}€</span>
  </div>
  ${generatedContent.description}
  <hr style="margin-top: 40px;">
  <p style="text-align: center; color: #666;">
    Généré par DM Sports AI Pro - ${new Date().toLocaleDateString('fr-FR')}
  </p>
</body>
</html>`;
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fiche-produit-${Date.now()}.html`;
                a.click();
                URL.revokeObjectURL(url);
                alert('📄 Fichier HTML téléchargé');
              }}>
                <span>🌐</span> HTML
              </button>
              <button className="export-btn" onClick={() => {
                const data = {
                  title: generatedContent.title,
                  ...formData,
                  generatedAt: new Date().toISOString()
                };
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fiche-produit-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                alert('📋 Fichier JSON téléchargé');
              }}>
                <span>📄</span> JSON
              </button>
              <button className="export-btn" onClick={() => window.print()}>
                <span>🖨️</span> Imprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Products Library Component
const ProductsLibrary = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      await axios.delete(`/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      alert('✅ Produit supprimé avec succès');
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="products-library">
        <div className="library-header">
          <h2>📚 Bibliothèque des produits</h2>
        </div>
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div className="loading" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '20px' }}>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-library">
      <div className="library-header">
        <h2>📚 Bibliothèque des produits ({filteredProducts.length})</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="🔍 Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredProducts.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', opacity: '0.3' }}>📦</div>
          <p>{searchTerm ? 'Aucun produit trouvé pour cette recherche.' : 'Aucun produit créé. Commencez par générer votre première fiche !'}</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-card-header">
                <div className="product-card-title">{product.name}</div>
                <div className="product-card-brand">{product.brand}</div>
              </div>
              <div className="product-card-body">
                <div className="product-card-price">{product.price}€</div>
                <div className="product-card-meta">
                  {product.category} • {product.gender} • Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div className="product-card-actions">
                  <button 
                    className="card-btn primary"
                    onClick={() => {
                      const content = product.generated_content.description;
                      const title = product.generated_content.title;
                      const fullContent = `${title}\n${product.price}€\n\n${content.replace(/<[^>]*>/g, '')}`;
                      navigator.clipboard.writeText(fullContent);
                      alert('📋 Contenu copié !');
                    }}
                  >
                    Copier
                  </button>
                  <button 
                    className="card-btn"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('generator');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(userData));
    }
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    showToast(`Bienvenue ${userData.username} !`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    showToast('Déconnexion réussie', 'success');
  };

  const handleProductCreated = (product) => {
    showToast('Fiche produit générée avec succès !', 'success');
  };

  if (!user) {
    return (
      <div className="app">
        <Auth onLogin={handleLogin} />
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <div className="logo">
            DM'S SPORTS
            <span className="logo-badge">AI PRO</span>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <span>👤</span>
              {user.username}
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${currentTab === 'generator' ? 'active' : ''}`}
            onClick={() => setCurrentTab('generator')}
          >
            ⚡ Générateur
          </button>
          <button 
            className={`nav-tab ${currentTab === 'library' ? 'active' : ''}`}
            onClick={() => setCurrentTab('library')}
          >
            📚 Bibliothèque
          </button>
        </div>

        {currentTab === 'generator' ? (
          <ProductGenerator user={user} onProductCreated={handleProductCreated} />
        ) : (
          <ProductsLibrary user={user} />
        )}
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;