from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import uuid
import json
import base64
from io import BytesIO
from PIL import Image

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")
SECRET_KEY = os.getenv("SECRET_KEY", "dm-sports-ai-generator-secret-key-2025")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Initialize FastAPI
app = FastAPI(title="DM Sports AI Generator API", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(MONGO_URL)
db = client.dm_sports_generator

# Collections
users_collection = db.users
products_collection = db.products

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Pydantic models
class User(BaseModel):
    username: str
    email: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class ProductBase(BaseModel):
    name: str
    brand: str
    category: str
    gender: str
    price: float
    old_price: Optional[float] = None
    sku: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    material: Optional[str] = None
    season: Optional[str] = None
    features: List[str] = []
    sizes: List[str] = []
    colors: List[str] = []
    images: List[str] = []

class Product(ProductBase):
    id: str
    user_id: str
    generated_content: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    gender: Optional[str] = None
    price: Optional[float] = None
    old_price: Optional[float] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    material: Optional[str] = None
    season: Optional[str] = None
    features: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    images: Optional[List[str]] = None

# Brands list (DM Sports compatible)
BRANDS = [
    "Nike", "Adidas", "Puma", "Lacoste", "Hugo Boss", "Calvin Klein",
    "Emporio Armani EA7", "Ralph Lauren", "Tommy Hilfiger", "The North Face",
    "Champion", "Fila", "New Balance", "Under Armour", "Asics", "Reebok",
    "Vans", "Converse", "Timberland", "Columbia", "Ellesse", "Kappa",
    "Sergio Tacchini", "Fred Perry", "Gant", "Mizuno", "Saucony", "Le Coq Sportif"
]

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
    
    return User(**user)

def generate_product_content(product_data: dict) -> dict:
    """Generate AI-powered product content like the original generator"""
    name = product_data.get("name", "")
    brand = product_data.get("brand", "")
    category = product_data.get("category", "")
    gender = product_data.get("gender", "")
    material = product_data.get("material", "")
    short_desc = product_data.get("short_description", "")
    features = product_data.get("features", [])
    
    # Generate title
    title = f"{name} - {brand}" if name and brand else "Produit DM Sports"
    
    # Generate description based on DM Sports style
    description_parts = []
    
    # Introduction inspired by DM Sports
    intros = {
        'Nike': 'Performance et innovation au service du sport',
        'Adidas': 'L\'excellence sportive depuis 1949',
        'Lacoste': 'L\'élégance sportive à la française',
        'Hugo Boss': 'Le luxe et la sophistication',
        'The North Face': 'L\'aventure sans limites',
        'Puma': 'Forever Faster - La vitesse au service du style'
    }
    
    intro = intros.get(brand, 'Qualité et style garantis')
    description_parts.append(f"<p><strong>{intro}</strong></p>")
    
    # Main description
    if short_desc:
        description_parts.append(f"<p>{short_desc}</p>")
    else:
        # Handle apostrophe in f-string properly
        gender_text = "l'homme moderne" if gender == 'homme' else 'la femme active' if gender == 'femme' else 'tous'
        templates = [
            f"Ce {category} {brand} incarne le parfait équilibre entre style et performance. Conçu pour {gender_text}, il offre un confort optimal au quotidien.",
            f"Découvrez l'excellence avec ce {category} {brand}. Sa conception soignée et ses finitions de qualité en font un choix idéal pour toutes vos activités.",
            f"{brand} présente {name}, un {category} qui allie technicité et esthétisme. Un must-have pour votre garde-robe."
        ]
        description_parts.append(f"<p>{templates[0]}</p>")
    
    # Features
    if features:
        description_parts.append('<h4>✨ Points forts du produit</h4>')
        description_parts.append('<ul>')
        for feature in features:
            description_parts.append(f'<li>• {feature}</li>')
        description_parts.append('</ul>')
    
    # Technical info
    description_parts.append('<h4>📋 Informations techniques</h4>')
    description_parts.append('<table style="width: 100%; margin: 15px 0;">')
    description_parts.append(f'<tr><td><strong>Marque :</strong></td><td>{brand}</td></tr>')
    description_parts.append(f'<tr><td><strong>Genre :</strong></td><td>{gender.capitalize()}</td></tr>')
    
    if material:
        description_parts.append(f'<tr><td><strong>Composition :</strong></td><td>{material}</td></tr>')
    
    # Sizes and colors
    sizes = product_data.get("sizes", [])
    colors = product_data.get("colors", [])
    
    if sizes:
        description_parts.append(f'<tr><td><strong>Tailles disponibles :</strong></td><td>{", ".join(sizes)}</td></tr>')
    
    if colors:
        description_parts.append(f'<tr><td><strong>Coloris disponibles :</strong></td><td>{", ".join(colors)}</td></tr>')
    
    description_parts.append('</table>')
    
    # Care guide
    description_parts.append('<h4>🧺 Conseils d\'entretien</h4>')
    description_parts.append('<ul>')
    
    if 'chaussures' in category.lower():
        description_parts.extend([
            '<li>🧽 Nettoyer avec un chiffon humide</li>',
            '<li>💧 Imperméabiliser régulièrement</li>',
            '<li>☀️ Éviter l\'exposition prolongée au soleil</li>',
            '<li>👟 Utiliser des embauchoirs pour maintenir la forme</li>'
        ])
    else:
        description_parts.extend([
            '<li>🌡️ Lavage en machine à 30°C</li>',
            '<li>🚫 Ne pas utiliser de javel</li>',
            '<li>♨️ Repassage à température moyenne</li>',
            '<li>🌀 Séchage en tambour autorisé à basse température</li>'
        ])
    
    description_parts.append('</ul>')
    
    # Services DM Sports
    description_parts.append('<h4>🚚 Livraison & Services DM Sports</h4>')
    description_parts.append('<ul>')
    description_parts.extend([
        '<li>✅ Livraison gratuite dès 80€ d\'achat</li>',
        '<li>📦 Expédition sous 24h (jours ouvrés)</li>',
        '<li>🔄 Retours sous 14 jours</li>',
        '<li>💯 Garantie authenticité 100%</li>',
        '<li>💳 Paiement sécurisé (CB, PayPal, Apple Pay)</li>',
        '<li>🏪 Retrait gratuit en boutique Lyon - 11 rue de la République</li>'
    ])
    description_parts.append('</ul>')
    
    description = ''.join(description_parts)
    
    return {
        "title": title,
        "description": description,
        "generated_at": datetime.utcnow().isoformat()
    }

# Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "DM Sports AI Generator API"}

# Authentication routes
@app.post("/api/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user exists
    if users_collection.find_one({"$or": [{"username": user.username}, {"email": user.email}]}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
    
    # Create user
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_data)
    
    # Create token
    access_token = create_access_token(data={"sub": user.username})
    
    user_response = User(
        username=user.username,
        email=user.email,
        is_active=True,
        created_at=user_data["created_at"]
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    db_user = users_collection.find_one({"username": user.username})
    
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    
    user_response = User(**{k: v for k, v in db_user.items() if k != "password"})
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

# Product routes
@app.get("/api/products", response_model=List[Product])
async def get_products(current_user: User = Depends(get_current_user)):
    products = list(products_collection.find({"user_id": current_user.username}))
    result = []
    for p in products:
        product_data = {k: v for k, v in p.items() if k != "_id"}
        product_data["id"] = str(p["_id"])
        result.append(Product(**product_data))
    return result

@app.post("/api/products", response_model=Product)
async def create_product(product: ProductCreate, current_user: User = Depends(get_current_user)):
    product_id = str(uuid.uuid4())
    
    # Generate AI content
    generated_content = generate_product_content(product.model_dump())
    
    product_data = {
        **product.model_dump(),
        "id": product_id,
        "user_id": current_user.username,
        "generated_content": generated_content,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    products_collection.insert_one({**product_data, "_id": product_id})
    
    return Product(**product_data)

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str, current_user: User = Depends(get_current_user)):
    product = products_collection.find_one({"_id": product_id, "user_id": current_user.username})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_data = {k: v for k, v in product.items() if k != "_id"}
    product_data["id"] = product_id
    return Product(**product_data)

@app.put("/api/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_user)
):
    # Check if product exists and belongs to user
    existing_product = products_collection.find_one({"_id": product_id, "user_id": current_user.username})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Regenerate content if key fields changed
    if any(field in update_data for field in ["name", "brand", "category", "features", "short_description"]):
        merged_data = {**existing_product, **update_data}
        update_data["generated_content"] = generate_product_content(merged_data)
    
    products_collection.update_one(
        {"_id": product_id},
        {"$set": update_data}
    )
    
    # Get updated product
    updated_product = products_collection.find_one({"_id": product_id})
    return Product(id=product_id, **{k: v for k, v in updated_product.items() if k != "_id"})

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    result = products_collection.delete_one({"_id": product_id, "user_id": current_user.username})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# Generate product content
@app.post("/api/generate-content")
async def generate_content(product_data: dict, current_user: User = Depends(get_current_user)):
    generated_content = generate_product_content(product_data)
    return generated_content

# Get brands
@app.get("/api/brands")
async def get_brands():
    return BRANDS

# Image upload
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        # Validate image
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        
        # Convert to base64
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {"image_url": f"data:image/png;base64,{image_base64}"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)