#!/bin/bash
# VendMieux - Script de déploiement VPS
# Usage: bash deploy.sh

set -e

echo "🚀 Déploiement VendMieux..."

# 1. Créer le répertoire web
echo "📁 Création du répertoire..."
sudo mkdir -p /var/www/vendmieux

# 2. Copier les fichiers buildés
echo "📦 Copie des fichiers..."
sudo cp -r dist/* /var/www/vendmieux/

# 3. Permissions
echo "🔒 Permissions..."
sudo chown -R caddy:caddy /var/www/vendmieux

# 4. Copier le Caddyfile (backup l'existant)
echo "⚙️  Configuration Caddy..."
if [ -f /etc/caddy/Caddyfile ]; then
    sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%s)
fi

# Ajouter la config vendmieux au Caddyfile existant
# Si le Caddyfile contient déjà vendmieux.fr, on le remplace
if grep -q "vendmieux.fr" /etc/caddy/Caddyfile 2>/dev/null; then
    echo "   Config vendmieux.fr déjà présente, mise à jour manuelle recommandée"
    echo "   Copiez le contenu de Caddyfile dans /etc/caddy/Caddyfile"
else
    echo "" | sudo tee -a /etc/caddy/Caddyfile > /dev/null
    cat Caddyfile | sudo tee -a /etc/caddy/Caddyfile > /dev/null
    echo "   Config ajoutée à /etc/caddy/Caddyfile"
fi

# 5. Recharger Caddy
echo "🔄 Rechargement de Caddy..."
sudo systemctl reload caddy

echo ""
echo "✅ Déploiement terminé !"
echo "🌍 https://vendmieux.fr"
echo ""
echo "Vérifiez avec: curl -I https://vendmieux.fr"
