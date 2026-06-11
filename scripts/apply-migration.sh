#!/bin/bash
# Script d'application de la migration Supabase
# Usage: SUPABASE_SERVICE_ROLE_KEY=xxx ./scripts/apply-migration.sh

PROJECT_URL="https://zxmaduuhsqanpwcsxbgr.supabase.co"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SERVICE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY non définie"
  echo "Usage: SUPABASE_SERVICE_ROLE_KEY=your_key ./scripts/apply-migration.sh"
  exit 1
fi

SQL=$(cat "$(dirname "$0")/../supabase/migrations/001_initial_schema.sql")

echo "⏳ Application de la migration..."

RESPONSE=$(curl -s -X POST "$PROJECT_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}")

echo "Réponse: $RESPONSE"
echo "✅ Migration terminée"
