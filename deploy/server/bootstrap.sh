#!/usr/bin/env bash
# One-time setup of the headless WordPress + static site on the VPS.
# Run as root from a checkout of this repository:
#
#   git clone https://github.com/taufikandrian18/arya-samodra.git /opt/arya-samodra-src
#   cd /opt/arya-samodra-src && sudo bash deploy/server/bootstrap.sh
#
# It asks for the WordPress admin user and password (never stored in the repo
# or on disk in plain text). Optional environment overrides:
#   DOMAIN=website.taufikandrian.my.id  BASE=/arya-samodra  ROOT=/var/www/arya-samodra
#   SCHEME=https  WP_ADMIN_EMAIL=you@example.com
#   DEPLOY_PUBKEY="ssh-ed25519 AAAA… github-actions"   (lets the pipeline deploy)
#   GITHUB_DISPATCH_TOKEN=github_pat_…                   (lets WordPress trigger rebuilds)
#   SKIP_PACKAGES=1  SKIP_SERVICES=1                     (for testing)
set -euo pipefail

DOMAIN=${DOMAIN:-website.taufikandrian.my.id}
BASE=${BASE:-/arya-samodra}
ROOT=${ROOT:-/var/www/arya-samodra}
SCHEME=${SCHEME:-https}
REPO_DIR=$(cd "$(dirname "$0")/../.." && pwd)
WP_DIR="$ROOT/wp${BASE}"
URL="${SCHEME}://${DOMAIN}${BASE}"
WEB_USER=${WEB_USER:-www-data}

say() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Run as root (sudo)."; exit 1; }

if [ -z "${WP_ADMIN_USER:-}" ]; then read -rp "WordPress admin username: " WP_ADMIN_USER; fi
if [ -z "${WP_ADMIN_PASSWORD:-}" ]; then read -rsp "WordPress admin password: " WP_ADMIN_PASSWORD; echo; fi
if [ -z "${WP_ADMIN_EMAIL:-}" ]; then read -rp "WordPress admin email: " WP_ADMIN_EMAIL; fi
[ ${#WP_ADMIN_PASSWORD} -ge 12 ] || { echo "Use a password of at least 12 characters."; exit 1; }

if [ -z "${SKIP_PACKAGES:-}" ]; then
	say "Installing PHP-FPM, MariaDB, rsync"
	apt-get update -q
	DEBIAN_FRONTEND=noninteractive apt-get install -y -q php-fpm php-mysql php-xml php-gd php-curl php-mbstring php-zip php-intl mariadb-server rsync unzip curl
fi
if ! command -v wp >/dev/null; then
	say "Installing WP-CLI"
	curl -sSL -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
	chmod +x /usr/local/bin/wp
fi
# Use the PHP-FPM that is actually installed (the php CLI can be a different version).
FPM=$(ls /usr/sbin/php-fpm* 2>/dev/null | sort -V | tail -1)
PHP_V=${FPM#/usr/sbin/php-fpm}
[ -n "$PHP_V" ] || { echo "No PHP-FPM found."; exit 1; }
if [ -z "${SKIP_SERVICES:-}" ]; then
	systemctl enable --now mariadb "php${PHP_V}-fpm"
fi
PHP_SOCKET=${PHP_SOCKET:-/run/php/php${PHP_V}-fpm.sock}
[ -S "$PHP_SOCKET" ] || echo "Warning: $PHP_SOCKET does not exist yet; check that php${PHP_V}-fpm is running."

say "Creating the database"
DB_NAME=arya_wp
DB_USER=arya_wp
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

say "Installing WordPress at ${URL}"
mkdir -p "$WP_DIR" "$ROOT/site"
chown -R "$WEB_USER:$WEB_USER" "$ROOT"
WP() { sudo -u "$WEB_USER" -- env HOME=/tmp wp --path="$WP_DIR" "$@"; }
if [ ! -f "$WP_DIR/wp-load.php" ]; then
	if [ -n "${WP_SRC:-}" ]; then # a local WordPress copy (testing / offline)
		rsync -a --exclude .git "$WP_SRC/" "$WP_DIR/"
	else
		WP core download --quiet
	fi
fi
mkdir -p "$WP_DIR/wp-content/plugins" "$WP_DIR/wp-content/uploads"
chown -R "$WEB_USER:$WEB_USER" "$WP_DIR"
rm -f "$WP_DIR/wp-config.php"
WP config create --dbname="$DB_NAME" --dbuser="$DB_USER" --dbpass="$DB_PASS" --dbhost=localhost --skip-check --quiet --extra-php <<PHP
define('WP_HOME', '${URL}');
define('WP_SITEURL', '${URL}');
define('FS_METHOD', 'direct');
define('DISALLOW_FILE_EDIT', true);
define('DISABLE_WP_CRON', true);
define('WP_POST_REVISIONS', 10);
if (isset(\$_SERVER['HTTP_X_FORWARDED_PROTO']) && \$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') { \$_SERVER['HTTPS'] = 'on'; }
define('ARYA_GITHUB_REPO', 'taufikandrian18/arya-samodra');
define('ARYA_GITHUB_TOKEN', getenv('ARYA_GITHUB_TOKEN') ?: '${GITHUB_DISPATCH_TOKEN:-}');
PHP
chmod 640 "$WP_DIR/wp-config.php"
if ! WP core is-installed 2>/dev/null; then
	WP core install --url="$URL" --title="Arya Samodra Architects" --admin_user="$WP_ADMIN_USER" --admin_password="$WP_ADMIN_PASSWORD" --admin_email="$WP_ADMIN_EMAIL" --skip-email --quiet
fi
if WP theme is-installed twentytwentyfive; then WP theme activate twentytwentyfive --quiet; else WP theme install twentytwentyfive --activate --quiet || true; fi
WP rewrite structure '/%postname%/' --quiet
WP option update blog_public 0 --quiet   # the CMS itself should not be indexed

say "Installing the Arya headless plugin"
rsync -a --delete "$REPO_DIR/cms/wordpress/arya-headless/" "$WP_DIR/wp-content/plugins/arya-headless/"
chown -R "$WEB_USER:$WEB_USER" "$WP_DIR/wp-content"
WP plugin activate arya-headless --quiet

if [ "$(WP post list --post_type=arya_project --format=count)" = 0 ]; then
	say "Importing the current site content and photos (one time)"
	cp "$REPO_DIR/src/content/site.json" /tmp/arya-site.json
	cp -r "$REPO_DIR/assets-src/images" /tmp/arya-images
	chmod -R a+rX /tmp/arya-site.json /tmp/arya-images
	WP arya seed --from=/tmp/arya-site.json --media=/tmp/arya-images
	rm -rf /tmp/arya-site.json /tmp/arya-images
fi

say "WordPress cron (every minute, via the system)"
echo "* * * * * ${WEB_USER} /usr/local/bin/wp --path=${WP_DIR} cron event run --due-now --quiet >/dev/null 2>&1" > /etc/cron.d/arya-samodra-wp

if [ -n "${DEPLOY_PUBKEY:-}" ]; then
	say "Deploy user for GitHub Actions"
	id deploy >/dev/null 2>&1 || useradd -m -s /bin/bash -G "$WEB_USER" deploy
	install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
	grep -qxF "$DEPLOY_PUBKEY" /home/deploy/.ssh/authorized_keys 2>/dev/null || echo "$DEPLOY_PUBKEY" >> /home/deploy/.ssh/authorized_keys
	chown deploy:deploy /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys
	chown -R deploy:"$WEB_USER" "$ROOT/site" "$WP_DIR/wp-content/plugins/arya-headless"
	chmod -R g+rX "$ROOT/site" "$WP_DIR/wp-content/plugins/arya-headless"
fi

say "Caddy"
sed -e "s#__BASE__#${BASE}#g" -e "s#__ROOT__#${ROOT}#g" -e "s#__DOMAIN__#${DOMAIN}#g" -e "s#__PHP_SOCKET__#${PHP_SOCKET}#g" \
	"$REPO_DIR/deploy/server/arya-samodra.caddy.tpl" > /etc/caddy/arya-samodra.caddy
cat <<MSG

Done. Two things left for you:

1. Add this line inside your "${DOMAIN} { … }" block in /etc/caddy/Caddyfile:
       import /etc/caddy/arya-samodra.caddy
   then:  caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy

2. Push to main (or run the "Deploy" workflow) so GitHub builds and uploads the site.

WordPress admin: ${URL}/wp-admin   (user: ${WP_ADMIN_USER})
MSG
