<?php
/**
 * Plugin Name: Arya Samodra — Headless content
 * Description: Content types, fields and a JSON endpoint for the Arya Samodra site. WordPress is the editing back office only; the public site is a static React build that reads /wp-json/arya/v1/content at build time. Saving content asks GitHub to rebuild and redeploy the site.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * Author: Arya Samodra Architects
 */

if (!defined('ABSPATH')) {
	exit;
}

define('ARYA_HEADLESS_DIR', __DIR__);
define('ARYA_HEADLESS_URL', plugin_dir_url(__FILE__));
define('ARYA_OPTION', 'arya_site');

require_once __DIR__ . '/includes/fields.php';
require_once __DIR__ . '/includes/types.php';
require_once __DIR__ . '/includes/admin.php';
require_once __DIR__ . '/includes/rest.php';
require_once __DIR__ . '/includes/publish.php';
require_once __DIR__ . '/includes/headless.php';
if (defined('WP_CLI') && WP_CLI) {
	require_once __DIR__ . '/includes/cli.php';
}
