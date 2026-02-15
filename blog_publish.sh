#!/bin/bash
# VendMieux Blog Auto-Publisher
# Génère 1 article depuis la file d'attente des topics
# Cron: lundi, mercredi, vendredi à 6h

LOG="/var/log/vendmieux-blog.log"
API="http://127.0.0.1:8000/api/blog/generate"

echo "$(date '+%Y-%m-%d %H:%M:%S') — Lancement publication blog" >> "$LOG"

RESULT=$(curl -s -X POST "$API" -H "Content-Type: application/json" -d '{"count": 1}' 2>&1)
echo "$(date '+%Y-%m-%d %H:%M:%S') — Résultat: $RESULT" >> "$LOG"
