#!/bin/bash

# =============================================================================
# 🚀 Script d'Installation Automatique - Générateur de Fiches Produits DM'Sports
# =============================================================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_step "Vérification des prérequis système..."
    
    # Vérifier Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    required_python="3.9"
    
    if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 9) else 1)"; then
        log_error "Python 3.9+ requis. Version actuelle: $python_version"
        exit 1
    fi
    
    log_success "Python $python_version ✓"
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js 18+ requis. Version actuelle: v$node_version"
        exit 1
    fi
    
    log_success "Node.js $(node --version) ✓"
    
    # Vérifier MongoDB
    if ! command -v mongod &> /dev/null && ! docker ps &> /dev/null; then
        log_warning "MongoDB non détecté. Installation recommandée."
        read -p "Souhaitez-vous continuer sans MongoDB ? (y/N): " continue_without_mongo
        if [[ ! $continue_without_mongo =~ ^[Yy]$ ]]; then
            log_info "Installez MongoDB ou Docker puis relancez ce script."
            exit 1
        fi
    else
        log_success "MongoDB ou Docker disponible ✓"
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé."
        exit 1
    fi
    
    log_success "Git $(git --version | cut -d' ' -f3) ✓"
    
    log_success "Tous les prérequis sont satisfaits !"
}

# Installation Backend
install_backend() {
    log_step "Installation du Backend..."
    
    cd backend
    
    # Créer environnement virtuel Python
    if [ ! -d "venv" ]; then
        log_info "Création de l'environnement virtuel Python..."
        python3 -m venv venv
    fi
    
    # Activer environnement virtuel
    source venv/bin/activate
    
    # Mettre à jour pip
    log_info "Mise à jour de pip..."
    python -m pip install --upgrade pip
    
    # Installer dépendances
    log_info "Installation des dépendances Python..."
    pip install -r requirements.txt
    
    # Configuration environnement
    if [ ! -f ".env" ]; then
        log_info "Création du fichier de configuration backend (.env)..."
        cp .env.example .env
        log_warning "Pensez à configurer vos clés API dans backend/.env"
    else
        log_info "Fichier backend/.env déjà existant"
    fi
    
    cd ..
    log_success "Backend installé avec succès !"
}

# Installation Frontend
install_frontend() {
    log_step "Installation du Frontend..."
    
    cd frontend
    
    # Détection du gestionnaire de paquets
    if command -v yarn &> /dev/null; then
        log_info "Installation des dépendances avec Yarn..."
        yarn install
    else
        log_info "Installation des dépendances avec NPM..."
        npm install
    fi
    
    # Configuration environnement
    if [ ! -f ".env" ]; then
        log_info "Création du fichier de configuration frontend (.env)..."
        cp .env.example .env
        log_info "Configuration par défaut appliquée"
    else
        log_info "Fichier frontend/.env déjà existant"
    fi
    
    cd ..
    log_success "Frontend installé avec succès !"
}

# Configuration MongoDB
setup_mongodb() {
    log_step "Configuration MongoDB..."
    
    # Vérifier si MongoDB est déjà en cours d'exécution
    if pgrep mongod > /dev/null; then
        log_success "MongoDB déjà en cours d'exécution"
        return
    fi
    
    # Tentative de démarrage MongoDB système
    if command -v systemctl &> /dev/null; then
        log_info "Tentative de démarrage MongoDB avec systemctl..."
        if sudo systemctl start mongod 2>/dev/null; then
            sudo systemctl enable mongod
            log_success "MongoDB démarré via systemctl"
            return
        fi
    fi
    
    # Tentative avec service (Ubuntu/Debian plus anciens)
    if command -v service &> /dev/null; then
        log_info "Tentative de démarrage MongoDB avec service..."
        if sudo service mongodb start 2>/dev/null; then
            log_success "MongoDB démarré via service"
            return
        fi
    fi
    
    # Proposition Docker comme alternative
    if command -v docker &> /dev/null; then
        log_warning "Impossible de démarrer MongoDB système"
        read -p "Souhaitez-vous démarrer MongoDB avec Docker ? (y/N): " start_docker_mongo
        if [[ $start_docker_mongo =~ ^[Yy]$ ]]; then
            log_info "Démarrage de MongoDB avec Docker..."
            docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:4.4
            log_success "MongoDB démarré avec Docker"
            return
        fi
    fi
    
    log_warning "MongoDB non configuré. Démarrez-le manuellement avant d'utiliser l'application."
}

# Création des dossiers de logs
create_logs_directory() {
    log_step "Création des dossiers de logs..."
    
    mkdir -p logs
    touch logs/backend.log
    touch logs/frontend.log
    chmod 755 logs/
    chmod 644 logs/*.log
    
    log_success "Dossiers de logs créés"
}

# Test de l'installation
test_installation() {
    log_step "Test de l'installation..."
    
    # Test Backend
    log_info "Test du backend..."
    cd backend
    source venv/bin/activate
    
    if python -c "import fastapi, uvicorn, motor, openai; print('✓ Modules Python OK')" 2>/dev/null; then
        log_success "Dépendances backend OK"
    else
        log_error "Problème avec les dépendances backend"
        return 1
    fi
    
    cd ..
    
    # Test Frontend
    log_info "Test du frontend..."
    cd frontend
    
    if [ -d "node_modules" ] && [ -f "node_modules/.yarn-integrity" -o -f "package-lock.json" ]; then
        log_success "Dépendances frontend OK"
    else
        log_error "Problème avec les dépendances frontend"
        return 1
    fi
    
    cd ..
    
    log_success "Installation testée avec succès !"
}

# Génération des scripts de démarrage
create_start_scripts() {
    log_step "Création des scripts de démarrage..."
    
    # Script de démarrage principal
    cat > start.sh << 'EOF'
#!/bin/bash

# Script de démarrage - Générateur de Fiches Produits DM'Sports

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Démarrage Générateur de Fiches Produits DM'Sports${NC}"

# Vérifier MongoDB
if ! pgrep mongod > /dev/null; then
    echo "📄 Démarrage MongoDB..."
    if command -v systemctl > /dev/null; then
        sudo systemctl start mongod
    elif command -v service > /dev/null; then
        sudo service mongodb start
    elif command -v docker > /dev/null; then
        docker start mongodb 2>/dev/null || docker run -d --name mongodb -p 27017:27017 mongo:4.4
    fi
fi

# Créer les logs s'ils n'existent pas
mkdir -p logs
touch logs/backend.log logs/frontend.log

# Démarrer le backend en arrière-plan
echo "⚡ Démarrage Backend..."
cd backend
source venv/bin/activate
nohup python -m uvicorn server:app --host 0.0.0.0 --port 8001 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Démarrer le frontend en arrière-plan  
echo "🎨 Démarrage Frontend..."
cd frontend
if command -v yarn > /dev/null; then
    nohup yarn start > ../logs/frontend.log 2>&1 &
else
    nohup npm start > ../logs/frontend.log 2>&1 &
fi
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

# Sauvegarder les PIDs pour l'arrêt
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo -e "${GREEN}✅ Services démarrés${NC}"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Backend: http://localhost:8001" 
echo "📊 API Docs: http://localhost:8001/docs"
echo ""
echo "🛑 Pour arrêter: ./stop.sh"
echo "📊 Logs backend: tail -f logs/backend.log"
echo "📊 Logs frontend: tail -f logs/frontend.log"
EOF

    # Script d'arrêt
    cat > stop.sh << 'EOF'
#!/bin/bash

# Script d'arrêt - Générateur de Fiches Produits DM'Sports

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}🛑 Arrêt des services...${NC}"

# Arrêter le backend
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill $BACKEND_PID 2>/dev/null; then
        echo "⚡ Backend arrêté (PID: $BACKEND_PID)"
    fi
    rm -f .backend.pid
fi

# Arrêter le frontend
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill $FRONTEND_PID 2>/dev/null; then
        echo "🎨 Frontend arrêté (PID: $FRONTEND_PID)"
    fi
    rm -f .frontend.pid
fi

# Nettoyer les processus restants
pkill -f "uvicorn server:app" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

echo -e "${GREEN}✅ Tous les services ont été arrêtés${NC}"
EOF

    # Rendre les scripts exécutables
    chmod +x start.sh stop.sh
    
    log_success "Scripts de démarrage créés (start.sh, stop.sh)"
}

# Affichage des instructions finales
show_final_instructions() {
    log_step "Instructions finales"
    
    echo ""
    echo "🎉 Installation terminée avec succès !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. 🔑 Configurez vos clés API dans backend/.env :"
    echo "   - OPENAI_API_KEY (https://platform.openai.com)"
    echo "   - GOOGLE_SEARCH_API_KEY (https://console.cloud.google.com)"
    echo "   - GOOGLE_SEARCH_CX (https://cse.google.com)"
    echo ""
    echo "2. 🚀 Démarrez l'application :"
    echo "   ./start.sh"
    echo ""
    echo "3. 🌐 Accédez aux interfaces :"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:8001"
    echo "   - Documentation API: http://localhost:8001/docs"
    echo ""
    echo "4. 🛑 Pour arrêter :"
    echo "   ./stop.sh"
    echo ""
    echo "📚 Documentation complète : docs/installation.md"
    echo "🐛 En cas de problème : docs/troubleshooting.md"
    echo ""
    echo "✨ Bonne utilisation du Générateur de Fiches Produits DM'Sports !"
}

# Fonction principale
main() {
    clear
    echo "============================================================================="
    echo "🏷️  Installation Générateur de Fiches Produits DM'Sports v2.0.0"
    echo "============================================================================="
    echo ""
    
    # Vérification que le script est lancé depuis la racine du projet
    if [ ! -f "backend/requirements.txt" ] || [ ! -f "frontend/package.json" ]; then
        log_error "Ce script doit être exécuté depuis la racine du projet"
        log_info "Assurez-vous d'être dans le dossier contenant les dossiers 'backend' et 'frontend'"
        exit 1
    fi
    
    check_prerequisites
    echo ""
    
    install_backend
    echo ""
    
    install_frontend
    echo ""
    
    setup_mongodb
    echo ""
    
    create_logs_directory
    echo ""
    
    test_installation
    echo ""
    
    create_start_scripts
    echo ""
    
    show_final_instructions
}

# Gestion des interruptions
trap 'log_error "Installation interrompue par l'\''utilisateur"; exit 1' INT

# Lancement du script principal
main "$@"