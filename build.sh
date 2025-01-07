#!/bin/bash

RED = '\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

LOG_FILE="/var/log/codediff-build.log"

log() {
    echo -e "${2:-$NC}$(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Error handler
handle_error() {
    log "Error occurred in build process. Check $LOG_FILE for details" "$RED"
    # Restore backup if exists
    if [ -d "/var/www/codediff.backup" ]; then
        log "Restoring from backup..." "$YELLOW"
        rm -rf /var/www/codediff
        mv /var/www/codediff.backup /var/www/codediff
        nginx -t && systemctl reload nginx
    fi
    exit 1
}

trap 'handle_error' ERR

log "Starting build process..." "$GREEN"

if ! command -v npm &> /dev/null; then
    log "npm is not installed. Please install npm before running this script." "$RED"
    exit 1
fi

if [-d "/var/www/codediff"]; then
    log "Creating backup of existing directory..." "$YELLOW"
    rm -rf /var/www/codediff.backup
    cp -r /var/www/codediff /var/www/codediff.backup
fi

log "Installing dependencies..."
npm ci --omit=dev || {
    log "Failed to install dependencies. Check $LOG_FILE for details" "$RED"
    exit 1
}

log "Building application..."
npm run build --omit-dev=true || {
    log "Failed to build application. Check $LOG_FILE for details" "$RED"
    exit 1
}

if [! -d "build"]; then
    log "Build directory not found"
    exit 1
fi

log "Deploying to /var/www/codediff/..."
rm -rf /var/www/codediff
mkdir -p /var/www/codediff
cp -r build/* /var/www/codediff || {
    log "Failed to copy build files to /var/www/codediff.
    exit 1
}

log "Setting Permissions..."
chown -R www-data:www-data /var/www/codediff
chmod -R 755 /var/www/codediff

log "Testing nginx configuration..."
nginx -t || {
    log "Nginx configuration test failed" "$RED"
    exit 1
}

log "Reloading nginx..."
systemctl reload nginx || {
    log "Failed to reload nginx.
    exit 1
}

log "Cleaning up..."
rm -rf build

log "Build process completed successfully" "$GREEN"