<?php
if (!defined('ABSPATH')) {
	exit;
}

add_action('init', function () {
	foreach (arya_post_types() as $type => $def) {
		register_post_type($type, [
			'labels' => [
				'name' => $def['plural'],
				'singular_name' => $def['singular'],
				'add_new_item' => 'Add ' . strtolower($def['singular']),
				'edit_item' => 'Edit ' . strtolower($def['singular']),
				'all_items' => 'All ' . strtolower($def['plural']),
			],
			'public' => false,
			'show_ui' => true,
			'show_in_menu' => 'arya-site',
			'show_in_rest' => false, // classic edit screen with plain fields
			'menu_icon' => $def['icon'],
			'supports' => ['title', 'page-attributes'],
			'hierarchical' => false,
			'capability_type' => 'post',
		]);
		foreach ($def['fields'] as $key => $field) {
			register_post_meta($type, $key, ['type' => 'string', 'single' => true, 'show_in_rest' => false]);
		}
	}
});

// Title placeholder per type, and order lists by the "Order" attribute.
add_filter('enter_title_here', function ($text, $post) {
	$types = arya_post_types();
	return isset($types[$post->post_type]) ? $types[$post->post_type]['title'] : $text;
}, 10, 2);

add_action('pre_get_posts', function ($q) {
	if (is_admin() && $q->is_main_query() && isset(arya_post_types()[$q->get('post_type')]) && !$q->get('orderby')) {
		$q->set('orderby', ['menu_order' => 'ASC', 'date' => 'ASC']);
	}
});
