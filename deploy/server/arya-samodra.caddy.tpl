# Arya Samodra: static React site + headless WordPress under __BASE__
# Import this INSIDE your existing site block, e.g.
#
#   __DOMAIN__ {
#       import /etc/caddy/arya-samodra.caddy
#       … your other routes …
#   }

redir __BASE__ __BASE__/ 308

# WordPress: admin, login, REST API, its assets and cron.
@arya_wp path __BASE__/wp-admin __BASE__/wp-admin/* __BASE__/wp-login.php __BASE__/wp-json __BASE__/wp-json/* __BASE__/wp-content/* __BASE__/wp-includes/* __BASE__/wp-cron.php __BASE__/index.php
handle @arya_wp {
	root * __ROOT__/wp
	# route keeps the order as written: refuse, then PHP, then static files.
	route {
		# Never execute PHP that someone managed to upload.
		@arya_upload_php path_regexp ^__BASE__/wp-content/uploads/.*\.php$
		respond @arya_upload_php 403
		php_fastcgi unix/__PHP_SOCKET__ {
			try_files {path} {path}/index.php __BASE__/index.php
		}
		file_server
	}
}

# Everything else under __BASE__ is the React build.
handle_path __BASE__/* {
	root * __ROOT__/site
	@arya_immutable path /assets/* /media/img/*
	header @arya_immutable Cache-Control "public, max-age=31536000, immutable"
	header /index.html Cache-Control "no-cache"
	# The site is one page, so a path that isn't a file is a 404. It still
	# gets index.html (the app shows its 404 page) but with a 404 status, so
	# search engines drop dead links.
	@arya_missing not file {path} {path}index.html
	handle @arya_missing {
		rewrite * /index.html
		file_server {
			status 404
		}
	}
	handle {
		file_server
	}
}
