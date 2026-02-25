#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# VendMieux — Live progress dashboard for bulk scenario generation
# Usage: ./dashboard.sh
# ─────────────────────────────────────────────────────────────

TOTAL=240
CHECKPOINT="/root/vendmieux/bulk_checkpoint.json"
LOGFILE="/root/vendmieux/bulk_generate.log"
REFRESH=10

# ANSI colors
RST='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
MAGENTA='\033[1;35m'
CYAN='\033[1;36m'
WHITE='\033[1;37m'
BG_BLUE='\033[44m'
BG_GREEN='\033[42m'
BG_RED='\033[41m'

BAR_WIDTH=50

draw_bar() {
    local done=$1
    local total=$2
    local filled=$(( done * BAR_WIDTH / total ))
    local empty=$(( BAR_WIDTH - filled ))
    local pct=$(( done * 100 / total ))

    # Choose color based on progress
    local color="$GREEN"
    if [ "$pct" -lt 25 ]; then
        color="$RED"
    elif [ "$pct" -lt 50 ]; then
        color="$YELLOW"
    elif [ "$pct" -lt 75 ]; then
        color="$CYAN"
    fi

    printf "  ${color}"
    printf '█%.0s' $(seq 1 $filled 2>/dev/null)
    printf "${DIM}"
    printf '░%.0s' $(seq 1 $empty 2>/dev/null)
    printf "${RST}"
    printf "  ${BOLD}%d${RST}/${BOLD}%d${RST}  ${color}%d%%${RST}\n" "$done" "$total" "$pct"
}

while true; do
    clear

    # ── Title ──
    printf "\n"
    printf "  ${BG_BLUE}${WHITE}${BOLD}  VendMieux — Génération scénarios  ${RST}\n"
    printf "  ${DIM}%s${RST}\n" "$(date '+%Y-%m-%d %H:%M:%S')"
    printf "\n"

    # ── Checkpoint count ──
    DONE=0
    if [ -f "$CHECKPOINT" ]; then
        DONE=$(python3 -c "
import json, sys
try:
    data = json.load(open('$CHECKPOINT'))
    print(len(data) if isinstance(data, list) else 0)
except:
    print(0)
" 2>/dev/null)
        DONE=${DONE:-0}
    fi

    # ── Progress bar ──
    printf "  ${BOLD}Progression :${RST}\n"
    draw_bar "$DONE" "$TOTAL"
    printf "\n"

    # ── Stats from log ──
    SUCCESS=0
    ERRORS=0
    RATE="—"
    ETA="—"

    if [ -f "$LOGFILE" ]; then
        # Count successes and errors
        SUCCESS=$(grep -c '✅' "$LOGFILE" 2>/dev/null || echo 0)
        ERRORS=$(grep -c '❌' "$LOGFILE" 2>/dev/null || echo 0)

        # Get latest rate and ETA from summary lines
        # Format: --- 45/240 (19%) — ✅ 44 / ❌ 1 — 1.9/min — ETA: 100h16 ---
        LAST_SUMMARY=$(grep -E '^\s+---.*---\s*$' "$LOGFILE" 2>/dev/null | tail -1)
        if [ -n "$LAST_SUMMARY" ]; then
            RATE=$(echo "$LAST_SUMMARY" | grep -oP '[\d.]+/min' || echo "—")
            ETA=$(echo "$LAST_SUMMARY" | grep -oP 'ETA:\s*\K[^\s-]+' || echo "—")
        fi
    fi

    # ── Numbers display ──
    printf "  ${GREEN}${BOLD}✅ Succès  :${RST}  ${GREEN}%s${RST}\n" "$SUCCESS"
    printf "  ${RED}${BOLD}❌ Erreurs :${RST}  ${RED}%s${RST}\n" "$ERRORS"
    printf "  ${CYAN}${BOLD}⚡ Débit   :${RST}  ${CYAN}%s${RST}\n" "$RATE"
    printf "  ${YELLOW}${BOLD}⏱  ETA     :${RST}  ${YELLOW}%s${RST}\n" "$ETA"
    printf "\n"

    # ── Process status ──
    if pgrep -f bulk_generate.py > /dev/null 2>&1; then
        PID=$(pgrep -f bulk_generate.py | head -1)
        printf "  ${BG_GREEN}${WHITE}${BOLD}  ● EN COURS  ${RST}  ${DIM}PID %s${RST}\n" "$PID"
    else
        printf "  ${BG_RED}${WHITE}${BOLD}  ■ TERMINÉ / ARRÊTÉ  ${RST}\n"
    fi
    printf "\n"

    # ── Last 5 log lines ──
    printf "  ${MAGENTA}${BOLD}─── Dernière activité ───${RST}\n"
    if [ -f "$LOGFILE" ]; then
        tail -5 "$LOGFILE" | while IFS= read -r line; do
            # Colorize success/error lines
            if echo "$line" | grep -q '✅'; then
                printf "  ${GREEN}%s${RST}\n" "$line"
            elif echo "$line" | grep -q '❌'; then
                printf "  ${RED}%s${RST}\n" "$line"
            elif echo "$line" | grep -q '^\s*---'; then
                printf "  ${CYAN}%s${RST}\n" "$line"
            else
                printf "  ${DIM}%s${RST}\n" "$line"
            fi
        done
    else
        printf "  ${DIM}(aucun log trouvé)${RST}\n"
    fi
    printf "\n"

    # ── Footer ──
    printf "  ${DIM}Rafraîchissement toutes les %ds — Ctrl+C pour quitter${RST}\n\n" "$REFRESH"

    sleep "$REFRESH"
done
