#!/bin/bash

# =============================================================================
# 🚀 Script de Déploiement - Générateur de Fiches Produits DM'Sports
# =============================================================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="dmsports-product-generator"
BACKEND_PORT=${BACKEND_PORT:-8001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
ENVIRONMENT=${ENVIRONMENT:-production}

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

log_deploy() {
    echo -e "${CYAN}[DEPLOY]${NC} $1"
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --env ENVIRONMENT    Environnement de déploiement (dev|staging|production) [défaut: production]"
    echo "  --backend-port PORT  Port du backend [défaut: 8001]"
    echo "  --frontend-port PORT Port du frontend [défaut: 3000]"
    echo "  --skip-tests        Ignorer les tests avant déploiement"
    echo "  --no-build          Ne pas rebuilder les applications"
    echo "  --help              Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                           # Déploiement production standard"
    echo "  $0 --env staging             # Déploiement en staging"
    echo "  $0 --skip-tests --no-build   # Déploiement rapide sans tests ni build"
}

# Parsing des arguments
SKIP_TESTS=false
NO_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --backend-port)
            BACKEND_PORT="$2"
            shift 2
            ;;
        --frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validation de l'environnement
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    log_error "Environnement invalide: $ENVIRONMENT (doit être dev, staging ou production)"
    exit 1
fi

# Vérifier les prérequis de déploiement
check_deploy_prerequisites() {
    log_step "Vérification des prérequis de déploiement..."
    
    # Vérifier Git
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Des changements non committes détectés"
        if [[ "$ENVIRONMENT" == "production" ]]; then
            log_error "Déploiement production impossible avec des changements non committes"
            exit 1
        fi
    fi
    
    # Vérifier la branche pour production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        current_branch=$(git branch --show-current)
        if [[ "$current_branch" != "main" ]] && [[ "$current_branch" != "master" ]]; then
            log_error "Déploiement production doit être fait depuis main/master (branche actuelle: $current_branch)"
            exit 1
        fi
    fi
    
    # Vérifier les fichiers de configuration
    if [[ ! -f "backend/.env" ]] && [[ "$ENVIRONMENT" != "dev" ]]; then
        log_error "Fichier backend/.env manquant pour environnement $ENVIRONMENT"
        exit 1
    fi
    
    if [[ ! -f "frontend/.env" ]] && [[ "$ENVIRONMENT" != "dev" ]]; then
        log_error "Fichier frontend/.env manquant pour environnement $ENVIRONMENT"
        exit 1
    fi
    
    log_success "Prérequis de déploiement OK"
}

# Arrêter les services existants
stop_existing_services() {
    log_step "Arrêt des services existants..."
    
    # Arrêter via script si disponible
    if [ -f "stop.sh" ]; then
        ./stop.sh 2>/dev/null || true
    fi
    
    # Arrêter les processus par nom
    pkill -f "uvicorn server:app" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    pkill -f "serve -s build" 2>/dev/null || true
    
    # Attendre que les processus se terminent
    sleep 2
    
    log_success "Services existants arrêtés"
}

# Sauvegarder la configuration actuelle
backup_config() {
    log_step "Sauvegarde de la configuration actuelle..."
    
    BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Sauvegarder les fichiers .env
    [ -f "backend/.env" ] && cp "backend/.env" "$BACKUP_DIR/backend.env"
    [ -f "frontend/.env" ] && cp "frontend/.env" "$BACKUP_DIR/frontend.env"
    
    # Sauvegarder les logs
    [ -d "logs" ] && cp -r "logs" "$BACKUP_DIR/"
    
    # Sauvegarder la base de données MongoDB si locale
    if pgrep mongod > /dev/null; then
        log_info "Sauvegarde de la base de données MongoDB..."
        mongodump --db dmsports_products --out "$BACKUP_DIR/mongodb/" 2>/dev/null || log_warning "Sauvegarde MongoDB échouée"
    fi
    
    log_success "Configuration sauvegardée dans $BACKUP_DIR"
}

# Tests avant déploiement
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_info "Tests ignorés (--skip-tests)"
        return
    fi
    
    log_step "Exécution des tests..."
    
    # Tests Backend
    log_info "Tests backend..."
    cd backend
    source venv/bin/activate
    
    # Test d'import des modules principaux
    python -c "
import fastapi, uvicorn, motor, openai, requests, pydantic
print('✓ Modules backend OK')
" || {
        log_error "Tests backend échoués"
        exit 1
    }
    
    # Test de syntaxe
    python -m py_compile server.py || {
        log_error "Erreur de syntaxe dans server.py"
        exit 1
    }
    
    cd ..
    
    # Tests Frontend
    log_info "Tests frontend..."
    cd frontend
    
    # Vérifier les dépendances
    if command -v yarn &> /dev/null; then
        yarn check --silent || {
            log_warning "Vérification des dépendances yarn échouée"
        }
    fi
    
    cd ..
    
    log_success "Tests réussis"
}

# Build des applications
build_applications() {
    if [[ "$NO_BUILD" == "true" ]]; then
        log_info "Build ignoré (--no-build)"
        return
    fi
    
    log_step "Build des applications..."
    
    # Build Frontend
    log_info "Build du frontend..."
    cd frontend
    
    # Définir les variables d'environnement pour le build
    export REACT_APP_BACKEND_URL="http://localhost:$BACKEND_PORT"
    export GENERATE_SOURCEMAP=false
    
    if command -v yarn &> /dev/null; then
        yarn build
    else
        npm run build
    fi
    
    # Vérifier que le build existe
    if [[ ! -d "build" ]] || [[ ! -f "build/index.html" ]]; then
        log_error "Build frontend échoué"
        exit 1
    fi
    
    log_success "Frontend buildé avec succès"
    cd ..
    
    # Préparation Backend (pas de build nécessaire, juste vérification)
    log_info "Préparation du backend..."
    cd backend
    source venv/bin/activate
    
    # Vérifier que toutes les dépendances sont installées
    pip check || {
        log_warning "Dépendances backend incohérentes, réinstallation..."
        pip install -r requirements.txt
    }
    
    cd ..
    
    log_success "Applications buildées avec succès"
}

# Déploiement selon l'environnement
deploy_environment() {
    log_step "Déploiement en environnement: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        dev)
            deploy_development
            ;;
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
    esac
}

# Déploiement développement
deploy_development() {
    log_deploy "Déploiement développement..."
    
    # Utiliser les fichiers .env.example si .env n'existe pas
    [ ! -f "backend/.env" ] && cp "backend/.env.example" "backend/.env"
    [ ! -f "frontend/.env" ] && cp "frontend/.env.example" "frontend/.env"
    
    # Démarrer en mode développement
    start_development_services
}

# Déploiement staging
deploy_staging() {
    log_deploy "Déploiement staging..."
    
    # Configuration spécifique staging
    export NODE_ENV=staging
    export DEBUG=false
    
    # Démarrer les services
    start_production_services
}

# Déploiement production
deploy_production() {
    log_deploy "Déploiement production..."
    
    # Configuration production
    export NODE_ENV=production
    export DEBUG=false
    
    # Vérifier la configuration production
    validate_production_config
    
    # Démarrer les services de production
    start_production_services
}

# Validation configuration production
validate_production_config() {
    log_info "Validation de la configuration production..."
    
    # Vérifier les clés API dans backend/.env
    source backend/.env
    
    if [[ "$OPENAI_API_KEY" == "your_openai_key_here" ]]; then
        log_error "Clé OpenAI non configurée en production"
        exit 1
    fi
    
    if [[ "$GOOGLE_SEARCH_API_KEY" == "your_google_search_key_here" ]]; then
        log_error "Clé Google Search non configurée en production"
        exit 1
    fi
    
    log_success "Configuration production validée"
}

# Démarrer services développement
start_development_services() {
    log_info "Démarrage des services de développement..."
    
    # Créer les dossiers de logs
    mkdir -p logs
    
    # Backend en mode développement
    cd backend
    source venv/bin/activate
    nohup python -m uvicorn server:app --reload --host 0.0.0.0 --port "$BACKEND_PORT" > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Frontend en mode développement
    cd frontend
    if command -v yarn &> /dev/null; then
        nohup yarn start > ../logs/frontend.log 2>&1 &
    else
        nohup npm start > ../logs/frontend.log 2>&1 &
    fi
    FRONTEND_PID=$!
    cd ..
    
    # Sauvegarder les PIDs
    echo "$BACKEND_PID" > .backend.pid
    echo "$FRONTEND_PID" > .frontend.pid
    
    log_success "Services de développement démarrés"
}

# Démarrer services production
start_production_services() {
    log_info "Démarrage des services de production..."
    
    # Créer les dossiers de logs
    mkdir -p logs
    
    # Backend en mode production
    cd backend
    source venv/bin/activate
    nohup python -m uvicorn server:app --host 0.0.0.0 --port "$BACKEND_PORT" --workers 4 > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Frontend avec serveur statique
    cd frontend
    if [[ -d "build" ]]; then
        # Utiliser serve pour servir les fichiers statiques
        if ! command -v serve &> /dev/null; then
            npm install -g serve
        fi
        nohup serve -s build -l "$FRONTEND_PORT" > ../logs/frontend.log 2>&1 &
        FRONTEND_PID=$!
    else
        log_error "Build frontend introuvable pour production"
        exit 1
    fi
    cd ..
    
    # Sauvegarder les PIDs
    echo "$BACKEND_PID" > .backend.pid
    echo "$FRONTEND_PID" > .frontend.pid
    
    log_success "Services de production démarrés"
}

# Configuration des services système (optionnel)
setup_system_services() {
    if [[ "$ENVIRONMENT" != "production" ]]; then
        return
    fi
    
    log_step "Configuration des services système (optionnel)..."
    
    read -p "Souhaitez-vous configurer les services systemd ? (y/N): " setup_systemd
    
    if [[ $setup_systemd =~ ^[Yy]$ ]]; then
        create_systemd_services
    fi
}

# Créer services systemd
create_systemd_services() {
    log_info "Création des services systemd..."
    
    PROJECT_PATH=$(pwd)
    
    # Service Backend
    sudo tee /etc/systemd/system/dmsports-backend.service > /dev/null << EOF
[Unit]
Description=DM'Sports Product Generator Backend
After=network.target mongod.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_PATH/backend
Environment=PATH=$PROJECT_PATH/backend/venv/bin
ExecStart=$PROJECT_PATH/backend/venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port $BACKEND_PORT --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Service Frontend
    sudo tee /etc/systemd/system/dmsports-frontend.service > /dev/null << EOF
[Unit]
Description=DM'Sports Product Generator Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_PATH/frontend
ExecStart=/usr/local/bin/serve -s build -l $FRONTEND_PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Recharger systemd et activer les services
    sudo systemctl daemon-reload
    sudo systemctl enable dmsports-backend.service
    sudo systemctl enable dmsports-frontend.service
    
    log_success "Services systemd configurés"
}

# Vérifications post-déploiement
post_deploy_checks() {
    log_step "Vérifications post-déploiement..."
    
    # Attendre que les services démarrent
    sleep 5
    
    # Vérifier Backend
    log_info "Test du backend..."
    if curl -f "http://localhost:$BACKEND_PORT/api/" > /dev/null 2>&1; then
        log_success "Backend accessible"
    else
        log_error "Backend inaccessible"
        return 1
    fi
    
    # Vérifier Frontend
    log_info "Test du frontend..."
    if curl -f "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
        log_success "Frontend accessible"
    else
        log_error "Frontend inaccessible"
        return 1
    fi
    
    # Test API complet
    log_info "Test API complet..."
    api_response=$(curl -s "http://localhost:$BACKEND_PORT/api/" | grep -o '"message"' | head -1)
    if [[ -n "$api_response" ]]; then
        log_success "API répond correctement"
    else
        log_error "API ne répond pas correctement"
        return 1
    fi
    
    log_success "Toutes les vérifications post-déploiement réussies"
}

# Affichage du résumé de déploiement
show_deploy_summary() {
    log_step "Résumé du déploiement"
    
    echo ""
    echo "🎉 Déploiement terminé avec succès !"
    echo ""
    echo "📊 Informations du déploiement:"
    echo "   - Environnement: $ENVIRONMENT"
    echo "   - Backend Port: $BACKEND_PORT"
    echo "   - Frontend Port: $FRONTEND_PORT"
    echo "   - Timestamp: $(date)"
    echo "   - Git Commit: $(git rev-parse --short HEAD)"
    echo "   - Git Branch: $(git branch --show-current)"
    echo ""
    echo "🌐 URLs d'accès:"
    echo "   - Frontend: http://localhost:$FRONTEND_PORT"
    echo "   - Backend API: http://localhost:$BACKEND_PORT"
    echo "   - Documentation API: http://localhost:$BACKEND_PORT/docs"
    echo ""
    echo "📊 Monitoring:"
    echo "   - Logs backend: tail -f logs/backend.log"
    echo "   - Logs frontend: tail -f logs/frontend.log"
    echo "   - Statut services: ps aux | grep -E '(uvicorn|serve|react-scripts)'"
    echo ""
    echo "🛑 Commandes utiles:"
    echo "   - Arrêter: ./stop.sh"
    echo "   - Redémarrer: ./deploy.sh --env $ENVIRONMENT"
    echo "   - Logs en temps réel: tail -f logs/*.log"
    echo ""
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        echo "⚠️  Notes de production:"
        echo "   - Surveillez les logs pour les erreurs"
        echo "   - Configurez un reverse proxy (nginx) pour la production"
        echo "   - Mettez en place la surveillance système"
        echo "   - Planifiez les sauvegardes régulières"
        echo ""
    fi
}

# Fonction principale
main() {
    clear
    echo "============================================================================="
    echo "🚀 Déploiement Générateur de Fiches Produits DM'Sports v2.0.0"
    echo "============================================================================="
    echo ""
    echo "🎯 Environnement: $ENVIRONMENT"
    echo "⚡ Backend Port: $BACKEND_PORT"
    echo "🎨 Frontend Port: $FRONTEND_PORT"
    echo ""
    
    # Vérifier que le script est lancé depuis la racine du projet
    if [[ ! -f "backend/requirements.txt" ]] || [[ ! -f "frontend/package.json" ]]; then
        log_error "Ce script doit être exécuté depuis la racine du projet"
        exit 1
    fi
    
    check_deploy_prerequisites
    echo ""
    
    backup_config
    echo ""
    
    stop_existing_services
    echo ""
    
    run_tests
    echo ""
    
    build_applications
    echo ""
    
    deploy_environment
    echo ""
    
    setup_system_services
    echo ""
    
    post_deploy_checks
    echo ""
    
    show_deploy_summary
}

# Gestion des interruptions
trap 'log_error "Déploiement interrompu"; exit 1' INT

# Lancement du script principal
main "$@"