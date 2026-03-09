#!/bin/bash
# Webprofits Paid Search Dashboard — Daily Data Refresh
# Runs via launchd at 6am every day, or manually when needed

set -e

LOG_DIR="$HOME/claude/wp-paid-dashboard/logs"
LOG_FILE="$LOG_DIR/refresh-$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR"

echo "[$(date)] Starting dashboard data refresh..." | tee -a "$LOG_FILE"

cd "$HOME/claude/wp-paid-dashboard"

claude -p "Refresh the Webprofits paid search dashboard data. Read the CLAUDE.md file in this directory for exact instructions. Fetch Google Ads data for all clients listed in data/clients.json and update their data files." \
  2>&1 | tee -a "$LOG_FILE"

echo "[$(date)] Refresh complete." | tee -a "$LOG_FILE"
