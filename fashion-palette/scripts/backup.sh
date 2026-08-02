#!/usr/bin/env bash
# Fashion Palette backup — MySQL dump + uploaded media (Feedback 39).
# Schedule daily on the VPS:  crontab -e
#   15 2 * * *  /bin/bash ~/htdocs/srv1815484.hstgr.cloud/Fashion-Palette/fashion-palette/scripts/backup.sh >> ~/fp-backups/backup.log 2>&1
# Restore DB:  gunzip < db-YYYYMMDD-HHMMSS.sql.gz | mysql -u USER -p DBNAME
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

# Load DB credentials from the app .env (DATABASE_* keys).
set -a
[ -f .env ] && . ./.env
set +a

STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="${BACKUP_DIR:-$HOME/fp-backups}"
RETAIN_DAYS="${BACKUP_RETAIN_DAYS:-14}"
mkdir -p "$DEST"

echo "[$(date)] Backing up to $DEST"

# 1) Database (gzipped SQL dump)
mysqldump --single-transaction --quick \
  -h "${DATABASE_HOST:-127.0.0.1}" -P "${DATABASE_PORT:-3306}" \
  -u "${DATABASE_USER}" -p"${DATABASE_PASSWORD}" "${DATABASE_NAME}" \
  | gzip > "$DEST/db-$STAMP.sql.gz"
echo "  ✓ db-$STAMP.sql.gz"

# 2) Uploaded media (product images)
if [ -d public/images/products ]; then
  tar -czf "$DEST/media-$STAMP.tar.gz" -C public images/products
  echo "  ✓ media-$STAMP.tar.gz"
fi

# 3) Retention — delete backups older than N days
find "$DEST" -name 'db-*.sql.gz' -mtime +"$RETAIN_DAYS" -delete
find "$DEST" -name 'media-*.tar.gz' -mtime +"$RETAIN_DAYS" -delete

echo "[$(date)] Backup complete."
