#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
#  nginx-setup.sh
#
#  Automates:
#   1. Creating an nginx server block in /etc/nginx/conf.d/
#   2. Adding a corresponding entry to /etc/hosts
#
#  Usage:
#   sudo ./nginx-setup.sh [OPTIONS]
#
#  Examples:
#   # Reverse proxy: myapp.local:80 → localhost:3000
#   sudo ./nginx-setup.sh -d myapp.local -p 80 -u 127.0.0.1:3000
#
#   # Static site: mysite.local:80 serving /var/www/mysite
#   sudo ./nginx-setup.sh -d mysite.local -p 80 -r /var/www/mysite
#
#   # Custom /etc/hosts IP mapping
#   sudo ./nginx-setup.sh -d myapp.local -p 80 -u 127.0.0.1:3000 --host-ip 192.168.1.100
#
#   # Dry-run to preview without applying changes
#   sudo ./nginx-setup.sh -d myapp.local -p 80 -u 127.0.0.1:3000 --dry-run
# ─────────────────────────────────────────────────────────────

# ── Colors ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Defaults ────────────────────────────────────────────────
DOMAIN=""
LISTEN_PORT="80"
UPSTREAM=""          # address:port for reverse proxy (e.g. 127.0.0.1:3000)
ROOT_DIR=""          # document root for static serving
HOST_IP="127.0.0.1" # IP to map in /etc/hosts
CONF_DIR="/etc/nginx/conf.d"
HOSTS_FILE="/etc/hosts"
DRY_RUN=false
FORCE=false
ENABLE_SSL=false
SSL_CERT=""
SSL_KEY=""

# ── Functions ───────────────────────────────────────────────
usage() {
    cat <<EOF
${BOLD}Usage:${NC} sudo $0 [OPTIONS]

${BOLD}Required:${NC}
  -d, --domain DOMAIN       Server name / domain (e.g. myapp.local)

${BOLD}Mode (pick one):${NC}
  -u, --upstream ADDR:PORT  Reverse proxy upstream (e.g. 127.0.0.1:3000)
  -r, --root DIR            Document root for static file serving

${BOLD}Optional:${NC}
  -p, --port PORT           Listen port (default: 80)
  --host-ip IP              IP for /etc/hosts entry (default: 127.0.0.1)
  --ssl-cert PATH           Path to SSL certificate (enables HTTPS)
  --ssl-key PATH            Path to SSL private key (enables HTTPS)
  --conf-dir DIR            nginx conf directory (default: /etc/nginx/conf.d)
  --dry-run                 Preview changes without writing anything
  -f, --force               Overwrite existing config without prompting
  -h, --help                Show this help message

${BOLD}Examples:${NC}
  # Reverse proxy
  sudo $0 -d myapp.local -p 80 -u 127.0.0.1:3000

  # Static site
  sudo $0 -d mysite.local -r /var/www/mysite

  # With SSL
  sudo $0 -d myapp.local -u 127.0.0.1:3000 --ssl-cert /etc/ssl/cert.pem --ssl-key /etc/ssl/key.pem
EOF
    exit 0
}

log_info()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

die() { log_error "$1"; exit 1; }

# ── Parse Arguments ─────────────────────────────────────────
[[ $# -eq 0 ]] && usage

while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--domain)    DOMAIN="$2";    shift 2 ;;
        -p|--port)      LISTEN_PORT="$2"; shift 2 ;;
        -u|--upstream)  UPSTREAM="$2";  shift 2 ;;
        -r|--root)      ROOT_DIR="$2";  shift 2 ;;
        --host-ip)      HOST_IP="$2";   shift 2 ;;
        --ssl-cert)     SSL_CERT="$2"; ENABLE_SSL=true; shift 2 ;;
        --ssl-key)      SSL_KEY="$2";  ENABLE_SSL=true; shift 2 ;;
        --conf-dir)     CONF_DIR="$2";  shift 2 ;;
        --dry-run)      DRY_RUN=true;   shift   ;;
        -f|--force)     FORCE=true;     shift   ;;
        -h|--help)      usage ;;
        *) die "Unknown option: $1. Use --help for usage." ;;
    esac
done

# ── Validate ────────────────────────────────────────────────
[[ -z "$DOMAIN" ]]                          && die "Domain is required (-d/--domain)"
[[ -z "$UPSTREAM" && -z "$ROOT_DIR" ]]      && die "Specify either --upstream or --root"
[[ -n "$UPSTREAM" && -n "$ROOT_DIR" ]]      && die "Cannot use both --upstream and --root — pick one"
[[ "$ENABLE_SSL" == true && ( -z "$SSL_CERT" || -z "$SSL_KEY" ) ]] && die "Both --ssl-cert and --ssl-key are required for SSL"

if [[ -n "$UPSTREAM" ]]; then
    # Validate upstream format (addr:port)
    if ! echo "$UPSTREAM" | grep -qE '^[a-zA-Z0-9._-]+:[0-9]+$'; then
        die "Upstream must be in ADDRESS:PORT format (e.g. 127.0.0.1:3000)"
    fi
fi

if [[ -n "$ROOT_DIR" && ! -d "$ROOT_DIR" && "$DRY_RUN" == false ]]; then
    log_warn "Root directory '$ROOT_DIR' does not exist — it will be created"
fi

# ── Check privileges ────────────────────────────────────────
if [[ "$DRY_RUN" == false && $EUID -ne 0 ]]; then
    die "This script must be run as root (use sudo)"
fi

# ── Build nginx config ──────────────────────────────────────
CONF_FILE="${CONF_DIR}/${DOMAIN}.conf"

generate_config() {
    local config=""

    # Upstream block (only for reverse proxy)
    if [[ -n "$UPSTREAM" ]]; then
        local upstream_name
        upstream_name=$(echo "$DOMAIN" | tr '.' '_')
        config+="upstream ${upstream_name}_backend {\n"
        config+="    server ${UPSTREAM};\n"
        config+="}\n\n"
    fi

    # HTTP → HTTPS redirect if SSL
    if [[ "$ENABLE_SSL" == true ]]; then
        config+="server {\n"
        config+="    listen 80;\n"
        config+="    listen [::]:80;\n"
        config+="    server_name ${DOMAIN};\n"
        config+="\n"
        config+="    return 301 https://\$host\$request_uri;\n"
        config+="}\n\n"
    fi

    # Main server block
    config+="server {\n"

    if [[ "$ENABLE_SSL" == true ]]; then
        config+="    listen 443 ssl;\n"
        config+="    listen [::]:443 ssl;\n"
        config+="\n"
        config+="    ssl_certificate     ${SSL_CERT};\n"
        config+="    ssl_certificate_key ${SSL_KEY};\n"
        config+="    ssl_protocols       TLSv1.2 TLSv1.3;\n"
        config+="    ssl_ciphers         HIGH:!aNULL:!MD5;\n"
    else
        config+="    listen ${LISTEN_PORT};\n"
        config+="    listen [::]:${LISTEN_PORT};\n"
    fi

    config+="\n"
    config+="    server_name ${DOMAIN};\n"
    config+="\n"

    # Access & error logs
    config+="    access_log /var/log/nginx/${DOMAIN}_access.log;\n"
    config+="    error_log  /var/log/nginx/${DOMAIN}_error.log;\n"
    config+="\n"

    if [[ -n "$UPSTREAM" ]]; then
        # ── Reverse proxy mode ──
        local upstream_name
        upstream_name=$(echo "$DOMAIN" | tr '.' '_')
        config+="    location / {\n"
        config+="        proxy_pass http://${upstream_name}_backend;\n"
        config+="\n"
        config+="        proxy_http_version 1.1;\n"
        config+="        proxy_set_header Upgrade           \$http_upgrade;\n"
        config+="        proxy_set_header Connection        \"upgrade\";\n"
        config+="        proxy_set_header Host              \$host;\n"
        config+="        proxy_set_header X-Real-IP         \$remote_addr;\n"
        config+="        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;\n"
        config+="        proxy_set_header X-Forwarded-Proto \$scheme;\n"
        config+="\n"
        config+="        proxy_connect_timeout 60s;\n"
        config+="        proxy_send_timeout    60s;\n"
        config+="        proxy_read_timeout    60s;\n"
        config+="    }\n"
    else
        # ── Static file mode ──
        config+="    root ${ROOT_DIR};\n"
        config+="    index index.html index.htm;\n"
        config+="\n"
        config+="    location / {\n"
        config+="        try_files \$uri \$uri/ /index.html;\n"
        config+="    }\n"
        config+="\n"
        config+="    # PWA: Serve manifest with correct MIME type\n"
        config+="    location ~* \\.webmanifest$ {\n"
        config+="        default_type application/manifest+json;\n"
        config+="        add_header Cache-Control \"no-cache\";\n"
        config+="    }\n"
        config+="\n"
        config+="    # PWA: Service worker must never be cached\n"
        config+="    location = /sw.js {\n"
        config+="        add_header Cache-Control \"no-cache\";\n"
        config+="        add_header Service-Worker-Allowed \"/\";\n"
        config+="    }\n"
        config+="\n"
        config+="    # PWA: SW registration script must not be cached aggressively\n"
        config+="    location = /registerSW.js {\n"
        config+="        add_header Cache-Control \"no-cache\";\n"
        config+="    }\n"
        config+="\n"
        config+="    # Cache static assets (hashed filenames, safe to cache aggressively)\n"
        config+="    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {\n"
        config+="        expires 30d;\n"
        config+="        add_header Cache-Control \"public, immutable\";\n"
        config+="    }\n"
    fi

    config+="}\n"

    echo -e "$config"
}

NGINX_CONFIG=$(generate_config)

# ── Build /etc/hosts entry ──────────────────────────────────
HOSTS_ENTRY="${HOST_IP}    ${DOMAIN}"

# ── Preview ─────────────────────────────────────────────────
echo ""
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  nginx-setup.sh — Configuration Preview${NC}"
echo -e "${BOLD}══════════════════════════════════════════════${NC}"
echo ""

echo -e "${BOLD}Domain:${NC}       ${DOMAIN}"
echo -e "${BOLD}Listen Port:${NC}  ${LISTEN_PORT}"
if [[ -n "$UPSTREAM" ]]; then
    echo -e "${BOLD}Mode:${NC}         Reverse Proxy → ${UPSTREAM}"
else
    echo -e "${BOLD}Mode:${NC}         Static Files ← ${ROOT_DIR}"
fi
echo -e "${BOLD}Host Entry:${NC}   ${HOSTS_ENTRY}"
echo -e "${BOLD}Config File:${NC}  ${CONF_FILE}"
[[ "$ENABLE_SSL" == true ]] && echo -e "${BOLD}SSL:${NC}          Enabled"
echo ""

echo -e "${CYAN}── nginx config ──────────────────────────────${NC}"
echo "$NGINX_CONFIG"
echo -e "${CYAN}──────────────────────────────────────────────${NC}"
echo ""

echo -e "${CYAN}── /etc/hosts entry ──────────────────────────${NC}"
echo "$HOSTS_ENTRY"
echo -e "${CYAN}──────────────────────────────────────────────${NC}"
echo ""

# ── Dry run exits here ──────────────────────────────────────
if [[ "$DRY_RUN" == true ]]; then
    log_warn "Dry-run mode — no changes were made"
    exit 0
fi

# ── Confirm ─────────────────────────────────────────────────
if [[ "$FORCE" == false ]]; then
    if [[ -f "$CONF_FILE" ]]; then
        log_warn "Config file already exists: ${CONF_FILE}"
        read -rp "Overwrite? [y/N] " confirm
        [[ "$confirm" =~ ^[Yy]$ ]] || { log_info "Aborted."; exit 0; }
    fi
fi

# ── Write nginx config ─────────────────────────────────────
log_info "Writing nginx config → ${CONF_FILE}"
echo "$NGINX_CONFIG" > "$CONF_FILE"
log_success "nginx config created: ${CONF_FILE}"

# ── Create root directory if static mode ────────────────────
if [[ -n "$ROOT_DIR" && ! -d "$ROOT_DIR" ]]; then
    log_info "Creating document root: ${ROOT_DIR}"
    mkdir -p "$ROOT_DIR"
    log_success "Document root created"
fi

# ── Update /etc/hosts ──────────────────────────────────────
if grep -qE "^[0-9.:]+[[:space:]]+${DOMAIN}$" "$HOSTS_FILE" 2>/dev/null; then
    # Entry exists — update it
    log_info "Updating existing /etc/hosts entry for ${DOMAIN}"
    sed -i "s|^[0-9.:]*[[:space:]]*${DOMAIN}$|${HOSTS_ENTRY}|" "$HOSTS_FILE"
    log_success "/etc/hosts entry updated"
else
    # Append new entry
    log_info "Adding /etc/hosts entry: ${HOSTS_ENTRY}"
    echo "$HOSTS_ENTRY" >> "$HOSTS_FILE"
    log_success "/etc/hosts entry added"
fi

# ── Test & reload nginx ────────────────────────────────────
log_info "Testing nginx configuration..."
if nginx -t 2>&1; then
    log_success "nginx config test passed"
    log_info "Reloading nginx..."
    if systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null; then
        log_success "nginx reloaded successfully"
    else
        log_warn "Could not reload nginx — you may need to restart it manually"
    fi
else
    log_error "nginx config test FAILED — check the config file: ${CONF_FILE}"
    exit 1
fi

# ── Done ────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}✓ Setup complete!${NC}"
echo -e "  Your site is now accessible at: ${BOLD}http://${DOMAIN}${NC}"
[[ "$ENABLE_SSL" == true ]] && echo -e "  HTTPS: ${BOLD}https://${DOMAIN}${NC}"
echo ""
