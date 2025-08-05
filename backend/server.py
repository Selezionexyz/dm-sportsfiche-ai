from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime
import json
import requests
import openai

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API Keys (to be added)
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', 'your_openai_key_here')
GOOGLE_SEARCH_API_KEY = os.environ.get('GOOGLE_SEARCH_API_KEY', 'your_google_search_key_here')
GOOGLE_SEARCH_CX = os.environ.get('GOOGLE_SEARCH_CX', 'your_google_cx_here')

# Configure OpenAI
if OPENAI_API_KEY != 'your_openai_key_here':
    openai.api_key = OPENAI_API_KEY

# Create the main app without a prefix
app = FastAPI(title="Générateur de Fiches Produits", description="Outil de création automatique de fiches produits avec IA")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class ProductSearch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ean_code: str
    search_query: str
    google_results: Optional[List[Dict]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductSearchCreate(BaseModel):
    ean_code: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ean_code: str
    title: str
    brand: str
    model: str
    color: str
    category: str
    price: Optional[float] = None
    description: str
    characteristics: Dict[str, str] = {}
    sizes: List[str] = []
    weight_by_type: Dict[str, float] = {}
    images: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    ean_code: str
    title: str
    brand: str
    model: str
    color: str
    category: str
    price: Optional[float] = None
    description: str
    characteristics: Dict[str, str] = {}
    sizes: List[str] = []
    weight_by_type: Dict[str, float] = {}
    images: List[str] = []

class ProductSheet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    title: str
    reference: str
    color_code: str
    price_ttc: float
    description: str
    characteristics: Dict[str, str]
    variants: List[Dict] = []  # Pour les tailles et couleurs
    weight_info: Dict[str, float]
    seo_title: str
    seo_description: str
    associated_products: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "draft"

class ProductSheetCreate(BaseModel):
    product_id: str
    generate_with_ai: bool = True

class EANGenerateRequest(BaseModel):
    ean_code: str
    generate_sheet: bool = True

# Services
class GoogleSearchService:
    @staticmethod
    async def search_by_ean(ean_code: str) -> Dict:
        """Recherche Google par code EAN"""
        if GOOGLE_SEARCH_API_KEY == 'your_google_search_key_here':
            # Simulation pour les tests
            return {
                "items": [
                    {
                        "title": f"Produit avec EAN {ean_code}",
                        "snippet": f"Description du produit avec code EAN {ean_code}",
                        "link": f"https://example.com/product/{ean_code}",
                        "pagemap": {}
                    }
                ]
            }
        
        try:
            query = f"{ean_code} produit caractéristiques prix"
            url = f"https://www.googleapis.com/customsearch/v1"
            params = {
                'key': GOOGLE_SEARCH_API_KEY,
                'cx': GOOGLE_SEARCH_CX,
                'q': query,
                'num': 10
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur recherche Google: {str(e)}")

class AIService:
    @staticmethod
    async def generate_product_info(ean_code: str, search_results: Dict) -> Dict:
        """Génère les informations produit via OpenAI"""
        if OPENAI_API_KEY == 'your_openai_key_here':
            # Simulation pour les tests
            return {
                "title": f"Produit Premium EAN {ean_code}",
                "brand": "Marque Exemple",
                "model": "Modèle Test",
                "color": "Noir",
                "category": "Chaussures",
                "description": f"Description générée automatiquement pour le produit avec EAN {ean_code}. Produit de qualité premium avec caractéristiques exceptionnelles.",
                "characteristics": {
                    "marque": "Marque Exemple",
                    "couleur": "Noir",
                    "matière": "Synthétique",
                    "saison": "Toute saison"
                },
                "sizes": ["39", "40", "41", "42", "43", "44"],
                "weight_by_type": {
                    "baskets": 1.0,
                    "ensemble": 0.75,
                    "sweat": 0.5,
                    "t-shirt": 0.25
                }
            }
        
        try:
            # Préparer le contexte des résultats Google
            context = ""
            if 'items' in search_results:
                for item in search_results['items'][:5]:
                    context += f"Titre: {item.get('title', '')}\n"
                    context += f"Description: {item.get('snippet', '')}\n\n"
            
            prompt = f"""
            Tu es un expert en création de fiches produits pour une boutique de sport (style DM'Sports).
            
            Code EAN: {ean_code}
            
            Informations trouvées sur Google:
            {context}
            
            Génère un produit complet au format JSON avec ces champs:
            - title: Titre structuré (Produit + Marque + nom + couleur)
            - brand: Marque du produit  
            - model: Nom/modèle du produit
            - color: Couleur principale
            - category: Catégorie (Chaussures, Vêtements, etc.)
            - description: Description détaillée et vendeuse (200-300 mots)
            - characteristics: {{marque, couleur, matière, saison}}
            - sizes: Liste des tailles disponibles
            - weight_by_type: {{baskets: 1.0, ensemble: 0.75, sweat: 0.5, t-shirt: 0.25}}
            
            Réponds uniquement en JSON valide, sans autre texte.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur génération IA: {str(e)}")
    
    @staticmethod
    async def generate_product_sheet(product: Product) -> Dict:
        """Génère une fiche produit complète"""
        if OPENAI_API_KEY == 'your_openai_key_here':
            return {
                "title": product.title,
                "reference": f"REF-{product.ean_code}",
                "color_code": product.color.upper(),
                "price_ttc": product.price or 99.99,
                "description": product.description,
                "characteristics": product.characteristics,
                "seo_title": f"{product.title} - {product.brand} | DM'Sports",
                "seo_description": f"Découvrez {product.title} de {product.brand}. {product.description[:150]}..."
            }
        
        try:
            prompt = f"""
            Créé une fiche produit optimisée pour PrestaShop à partir de ces informations:
            
            Produit: {product.title}
            Marque: {product.brand}
            Modèle: {product.model}  
            Couleur: {product.color}
            Catégorie: {product.category}
            Description: {product.description}
            Caractéristiques: {product.characteristics}
            
            Génère au format JSON:
            - reference: Code référence produit
            - color_code: Code couleur court
            - price_ttc: Prix TTC suggéré
            - description: Description optimisée PrestaShop (HTML acceptable)
            - seo_title: Titre SEO optimisé
            - seo_description: Meta description SEO
            
            Style DM'Sports: moderne, professionnel, orienté sport/streetwear.
            Réponds uniquement en JSON valide.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur génération fiche: {str(e)}")

# API Endpoints

@api_router.get("/")
async def root():
    return {"message": "API Générateur de Fiches Produits", "version": "1.0"}

@api_router.post("/search/ean", response_model=ProductSearch)
async def search_by_ean(search_request: ProductSearchCreate):
    """Recherche un produit par code EAN sur Google"""
    try:
        # Recherche Google
        search_results = await GoogleSearchService.search_by_ean(search_request.ean_code)
        
        # Sauvegarder la recherche
        search_obj = ProductSearch(
            ean_code=search_request.ean_code,
            search_query=f"{search_request.ean_code} produit caractéristiques",
            google_results=search_results.get('items', [])
        )
        
        await db.product_searches.insert_one(search_obj.dict())
        return search_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate/product")
async def generate_product_from_ean(request: EANGenerateRequest):
    """Génère un produit complet à partir d'un code EAN"""
    try:
        # Recherche Google
        search_results = await GoogleSearchService.search_by_ean(request.ean_code)
        
        # Génération IA du produit
        product_info = await AIService.generate_product_info(request.ean_code, search_results)
        
        # Créer le produit
        product = Product(
            ean_code=request.ean_code,
            **product_info
        )
        
        await db.products.insert_one(product.dict())
        
        # Optionnel: générer la fiche produit
        product_sheet = None
        if request.generate_sheet:
            sheet_info = await AIService.generate_product_sheet(product)
            product_sheet = ProductSheet(
                product_id=product.id,
                **sheet_info
            )
            await db.product_sheets.insert_one(product_sheet.dict())
        
        return {
            "product": product,
            "product_sheet": product_sheet,
            "search_results": search_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/products", response_model=List[Product])
async def get_products(limit: int = 20, offset: int = 0):
    """Récupère la liste des produits"""
    try:
        cursor = db.products.find().skip(offset).limit(limit)
        products = await cursor.to_list(length=limit)
        return [Product(**product) for product in products]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Récupère un produit spécifique"""
    try:
        product = await db.products.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        return Product(**product)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    """Crée un nouveau produit"""
    try:
        product = Product(**product_data.dict())
        await db.products.insert_one(product.dict())
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sheets", response_model=List[ProductSheet])
async def get_product_sheets(limit: int = 20, offset: int = 0):
    """Récupère la liste des fiches produits"""
    try:
        cursor = db.product_sheets.find().skip(offset).limit(limit)
        sheets = await cursor.to_list(length=limit)
        return [ProductSheet(**sheet) for sheet in sheets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/sheets", response_model=ProductSheet)
async def create_product_sheet(sheet_request: ProductSheetCreate):
    """Génère une fiche produit pour un produit existant"""
    try:
        # Récupérer le produit
        product_data = await db.products.find_one({"id": sheet_request.product_id})
        if not product_data:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        product = Product(**product_data)
        
        if sheet_request.generate_with_ai:
            sheet_info = await AIService.generate_product_sheet(product)
        else:
            sheet_info = {
                "title": product.title,
                "reference": f"REF-{product.ean_code}",
                "color_code": product.color.upper(),
                "price_ttc": product.price or 99.99,
                "description": product.description,
                "characteristics": product.characteristics,
                "seo_title": f"{product.title} - {product.brand}",
                "seo_description": product.description[:150] + "..."
            }
        
        product_sheet = ProductSheet(
            product_id=sheet_request.product_id,
            weight_info=product.weight_by_type,
            **sheet_info
        )
        
        await db.product_sheets.insert_one(product_sheet.dict())
        return product_sheet
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Supprime un produit"""
    try:
        result = await db.products.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        # Supprimer aussi les fiches associées
        await db.product_sheets.delete_many({"product_id": product_id})
        
        return {"message": "Produit supprimé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()