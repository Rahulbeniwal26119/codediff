#!/usr/bin/env bash

set -Eeuo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

APP_NAME="${APP_NAME:-codediff}"
APP_DIR="${APP_DIR:-/var/www/codediff}"
BACKUP_DIR="${BACKUP_DIR:-/var/www/codediff.backup}"
PM2_NAME="${PM2_NAME:-$APP_NAME}"
PM2_USER="${PM2_USER:-${SUDO_USER:-}}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3001}"
BACKEND_API_URL="${BACKEND_API_URL:-https://backend.takovibe.com}"
LOG_FILE="${LOG_FILE:-/var/log/codediff-build.log}"

log() {
    local message="$1"
    local color="${2:-$NC}"
    echo -e "${color}$(date '+%Y-%m-%d %H:%M:%S') - ${message}${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ${message}" >> "$LOG_FILE"
}

handle_error() {
    local line_number="$1"
    log "Build failed near line ${line_number}. Check ${LOG_FILE} for details." "$RED"

    if [ -d "$BACKUP_DIR" ]; then
        log "Restoring previous deployment from ${BACKUP_DIR}..." "$YELLOW"
        rm -rf "$APP_DIR"
        mv "$BACKUP_DIR" "$APP_DIR"
        restart_pm2 || true
    fi

    exit 1
}

trap 'handle_error $LINENO' ERR

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        log "$1 is required but is not installed." "$RED"
        exit 1
    fi
}

pm2_cmd() {
    if [ -n "$PM2_USER" ] && [ "$(id -u)" -eq 0 ] && [ "$PM2_USER" != "root" ]; then
        sudo -H -u "$PM2_USER" env \
            NODE_ENV="${NODE_ENV:-production}" \
            HOST="$HOST" \
            PORT="$PORT" \
            BACKEND_API_URL="$BACKEND_API_URL" \
            BUILD_DIR="${BUILD_DIR:-${APP_DIR}/build}" \
            pm2 "$@"
    else
        pm2 "$@"
    fi
}

restart_pm2() {
    log "Managing PM2 process ${PM2_NAME}..."

    if pm2_cmd describe "$PM2_NAME" >/dev/null 2>&1; then
        log "Reloading existing PM2 process..."
        pm2_cmd reload "$PM2_NAME" --update-env
    else
        log "Starting new PM2 process..."
        pm2_cmd start "$APP_DIR/server.js" \
            --name "$PM2_NAME" \
            --cwd "$APP_DIR" \
            --time \
            --update-env
    fi

    pm2_cmd save
    pm2_cmd status "$PM2_NAME"
}

mkdir -p "$(dirname "$LOG_FILE")"

log "Starting ${APP_NAME} production build..." "$GREEN"

require_command bun
require_command node
require_command pm2

if [ -d "$APP_DIR" ]; then
    log "Creating backup of existing deployment..." "$YELLOW"
    rm -rf "$BACKUP_DIR"
    cp -a "$APP_DIR" "$BACKUP_DIR"
fi

log "Installing dependencies..."
bun install --frozen-lockfile

log "Building React application..."
bun run build

if [ ! -d "build" ]; then
    log "Build directory not found." "$RED"
    exit 1
fi

log "Deploying build and production server to ${APP_DIR}..."
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
cp -a build "$APP_DIR/build"
cp server.js "$APP_DIR/server.js"
cp package.json "$APP_DIR/package.json"

log "Setting permissions..."
if [ -n "$PM2_USER" ] && id "$PM2_USER" >/dev/null 2>&1; then
    chown -R "${PM2_USER}:${PM2_USER}" "$APP_DIR"
fi
chmod -R 755 "$APP_DIR"

export NODE_ENV=production
export HOST
export PORT
export BACKEND_API_URL
export BUILD_DIR="${APP_DIR}/build"

restart_pm2

if [ -d "$BACKUP_DIR" ]; then
    log "Removing backup after successful restart..."
    rm -rf "$BACKUP_DIR"
fi

log "Cleaning local build directory..."
rm -rf build

log "${APP_NAME} is serving production build through PM2 at http://${HOST}:${PORT}" "$GREEN"
