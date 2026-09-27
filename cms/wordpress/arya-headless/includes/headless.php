<?php
/** Headless hardening: no public theme, no user enumeration, no XML-RPC. */
if (!defined('ABSPATH')) {
	exit;
}

// Any themed front-end request goes to the React site at the same address.
add_action('template_redirect', function () {
	if (!is_admin() && !wp_doing_ajax() && !wp_doing_cron()) {
		wp_safe_redirect(home_url('/'), 302);
		exit;
	}
});

add_filter('xmlrpc_enabled', '__return_false');

// Hide the users endpoints from anonymous visitors (stops username discovery).
add_filter('rest_endpoints', function ($endpoints) {
	if (!is_user_logged_in()) {
		unset($endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)']);
	}
	return $endpoints;
});

// Keep the dashboard to what the client uses.
add_action('admin_menu', function () {
	remove_menu_page('edit.php');          // Posts
	remove_menu_page('edit-comments.php'); // Comments
}, 99);
