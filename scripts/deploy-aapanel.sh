#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

REMOTE="${DEPLOY_REMOTE:-origin}"
BRANCH="${DEPLOY_BRANCH:-main}"
PHP_BIN="${PHP_BIN:-php}"
COMPOSER_BIN="${COMPOSER_BIN:-composer}"
NPM_BIN="${NPM_BIN:-npm}"
LOG_PATH="${DEPLOY_LOG_PATH:-$PROJECT_ROOT/storage/logs/deploy.log}"
RUN_NPM_BUILD="${RUN_NPM_BUILD:-true}"
RUN_SEEDER="${RUN_SEEDER:-false}"
RUN_STORAGE_LINK="${RUN_STORAGE_LINK:-true}"
APP_DOWN=0

log() {
    printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Command not found: $1" >&2
        exit 1
    fi
}

cleanup() {
    if [[ "$APP_DOWN" == "1" ]]; then
        log "Bringing application back up"
        "$PHP_BIN" artisan up || true
    fi
}

trap cleanup EXIT

cd "$PROJECT_ROOT"

mkdir -p "$(dirname "$LOG_PATH")"
touch "$LOG_PATH"
exec > >(tee -a "$LOG_PATH") 2>&1

require_command git
require_command "$PHP_BIN"
require_command "$COMPOSER_BIN"

if [[ "$RUN_NPM_BUILD" == "true" ]]; then
    require_command "$NPM_BIN"
fi

if [[ ! -f artisan ]]; then
    echo "File artisan tidak ditemukan. Jalankan script ini dari repository Laravel yang benar." >&2
    exit 1
fi

if [[ ! -f .env ]]; then
    echo "File .env belum ada. Lengkapi setup production terlebih dahulu." >&2
    exit 1
fi

log "Deployment log: $LOG_PATH"

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Working tree tidak bersih. Commit atau stash perubahan sebelum deploy." >&2
    exit 1
fi

log "Putting application into maintenance mode"
"$PHP_BIN" artisan down --refresh=15 --retry=60 || true
APP_DOWN=1

log "Pulling latest code from ${REMOTE}/${BRANCH}"
git pull --ff-only "$REMOTE" "$BRANCH"

log "Installing PHP dependencies"
"$COMPOSER_BIN" install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

if [[ "$RUN_NPM_BUILD" == "true" && -f package.json ]]; then
    log "Installing JavaScript dependencies"
    "$NPM_BIN" ci

    log "Building frontend assets"
    "$NPM_BIN" run build
fi

log "Running database migrations"
"$PHP_BIN" artisan migrate --force

if [[ "$RUN_SEEDER" == "true" ]]; then
    log "Running database seeder"
    "$PHP_BIN" artisan db:seed --force
fi

if [[ "$RUN_STORAGE_LINK" == "true" ]]; then
    log "Ensuring storage symlink exists"
    "$PHP_BIN" artisan storage:link || true
fi

log "Refreshing Laravel caches"
"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan optimize
"$PHP_BIN" artisan queue:restart || true

log "Bringing application back online"
"$PHP_BIN" artisan up
APP_DOWN=0

log "Deployment finished successfully"
