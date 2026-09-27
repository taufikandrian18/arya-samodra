<?php
/** Edit screens: one meta box per content type, and the "Site content" page. */
if (!defined('ABSPATH')) {
	exit;
}

add_action('admin_menu', function () {
	add_menu_page('Arya site', 'Arya site', 'edit_posts', 'arya-site', 'arya_render_site_page', 'dashicons-admin-site-alt3', 3);
	add_submenu_page('arya-site', 'Site content', 'Site content', 'edit_posts', 'arya-site', 'arya_render_site_page');
});

add_action('admin_enqueue_scripts', function ($hook) {
	$screen = get_current_screen();
	$ours = $screen && (isset(arya_post_types()[$screen->post_type]) || $hook === 'toplevel_page_arya-site');
	if (!$ours) {
		return;
	}
	wp_enqueue_media();
	wp_enqueue_script('arya-admin', ARYA_HEADLESS_URL . 'assets/admin.js', ['jquery', 'jquery-ui-sortable'], '1.0.0', true);
	wp_enqueue_style('arya-admin', ARYA_HEADLESS_URL . 'assets/admin.css', [], '1.0.0');
});

/** Render one field. $name is the form name, $value the stored string. */
function arya_render_field(string $name, array $field, $value): void {
	$id = esc_attr(str_replace(['[', ']'], ['_', ''], $name));
	echo '<div class="arya-field arya-field--' . esc_attr($field['type']) . '">';
	if ($field['type'] !== 'checkbox') {
		echo '<label class="arya-label" for="' . $id . '">' . esc_html($field['label']) . '</label>';
	}
	switch ($field['type']) {
		case 'textarea':
		case 'lines':
		case 'rows':
			printf('<textarea id="%s" name="%s" rows="%d" class="large-text">%s</textarea>', $id, esc_attr($name), (int) ($field['rows'] ?? 4), esc_textarea((string) $value));
			break;
		case 'select':
			printf('<select id="%s" name="%s">', $id, esc_attr($name));
			foreach ($field['options'] as $opt) {
				printf('<option value="%1$s"%2$s>%1$s</option>', esc_attr($opt), selected($value, $opt, false));
			}
			echo '</select>';
			break;
		case 'checkbox':
			printf('<label><input type="checkbox" id="%s" name="%s" value="1"%s> %s</label>', $id, esc_attr($name), checked($value, '1', false), esc_html($field['label']));
			break;
		case 'number':
			printf('<input type="number" id="%s" name="%s" value="%s" class="small-text">', $id, esc_attr($name), esc_attr((string) $value));
			break;
		case 'image':
		case 'gallery':
			$multiple = $field['type'] === 'gallery';
			$ids = arya_parse_ids($value);
			printf('<div class="arya-media" data-multiple="%s"><input type="hidden" id="%s" name="%s" value="%s">', $multiple ? '1' : '0', $id, esc_attr($name), esc_attr(implode(',', $ids)));
			echo '<ul class="arya-media__list">';
			foreach ($ids as $aid) {
				$thumb = wp_get_attachment_image_url($aid, 'thumbnail');
				if ($thumb) {
					printf('<li data-id="%d"><img src="%s" alt=""><button type="button" class="arya-media__remove" aria-label="Remove">×</button></li>', $aid, esc_url($thumb));
				}
			}
			echo '</ul>';
			printf('<button type="button" class="button arya-media__add">%s</button></div>', $multiple ? 'Add photos' : 'Choose image');
			break;
		default:
			printf('<input type="text" id="%s" name="%s" value="%s" class="regular-text">', $id, esc_attr($name), esc_attr((string) $value));
	}
	if (!empty($field['help'])) {
		echo '<p class="description">' . esc_html($field['help']) . '</p>';
	}
	echo '</div>';
}

// ---- Content types: meta box + save ---------------------------------------

add_action('add_meta_boxes', function () {
	foreach (arya_post_types() as $type => $def) {
		add_meta_box('arya-fields', $def['singular'] . ' details', function ($post) use ($def) {
			wp_nonce_field('arya_save_' . $post->ID, 'arya_nonce');
			foreach ($def['fields'] as $key => $field) {
				arya_render_field('arya[' . $key . ']', $field, get_post_meta($post->ID, $key, true));
			}
		}, $type, 'normal', 'high');
	}
});

add_action('save_post', function ($post_id, $post) {
	$types = arya_post_types();
	if (!isset($types[$post->post_type]) || wp_is_post_revision($post_id) || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)) {
		return;
	}
	if (!isset($_POST['arya_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['arya_nonce'])), 'arya_save_' . $post_id)) {
		return;
	}
	if (!current_user_can('edit_post', $post_id)) {
		return;
	}
	$in = isset($_POST['arya']) && is_array($_POST['arya']) ? $_POST['arya'] : []; // sanitized per field below
	foreach ($types[$post->post_type]['fields'] as $key => $field) {
		update_post_meta($post_id, $key, arya_sanitize_field($field, $in[$key] ?? ''));
	}
}, 10, 2);

// ---- Site content page -------------------------------------------------------

function arya_render_site_page(): void {
	if (!current_user_can('edit_posts')) {
		return;
	}
	$values = get_option(ARYA_OPTION, []);
	echo '<div class="wrap arya-site"><h1>Site content</h1>';
	if (isset($_GET['updated'])) {
		echo '<div class="notice notice-success is-dismissible"><p>Saved. The site will rebuild and go live in a few minutes.</p></div>';
	}
	arya_render_publish_box();
	echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
	echo '<input type="hidden" name="action" value="arya_save_site">';
	wp_nonce_field('arya_save_site', 'arya_site_nonce');
	foreach (arya_site_fields() as $section => $fields) {
		echo '<div class="postbox arya-box"><h2 class="hndle">' . esc_html($section) . '</h2><div class="inside">';
		foreach ($fields as $key => $field) {
			arya_render_field('arya_site[' . $key . ']', $field, $values[$key] ?? '');
		}
		echo '</div></div>';
	}
	submit_button('Save site content');
	echo '</form></div>';
}

add_action('admin_post_arya_save_site', function () {
	if (!current_user_can('edit_posts') || !isset($_POST['arya_site_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['arya_site_nonce'])), 'arya_save_site')) {
		wp_die('Not allowed.');
	}
	$in = isset($_POST['arya_site']) && is_array($_POST['arya_site']) ? $_POST['arya_site'] : []; // sanitized per field below
	$out = [];
	foreach (arya_site_fields() as $fields) {
		foreach ($fields as $key => $field) {
			$out[$key] = arya_sanitize_field($field, $in[$key] ?? '');
		}
	}
	update_option(ARYA_OPTION, $out, false);
	wp_safe_redirect(admin_url('admin.php?page=arya-site&updated=1'));
	exit;
});
