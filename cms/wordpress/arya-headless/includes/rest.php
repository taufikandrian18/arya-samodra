<?php
/**
 * GET /wp-json/arya/v1/content — everything the site needs, in the shape of
 * src/content/site.json, except that images are objects the build downloads:
 * { "id": 12, "url": "https://…/original.jpg", "alt": "…", "width": 3840, "height": 2160 }.
 * Public by design: it is exactly what the public site shows.
 */
if (!defined('ABSPATH')) {
	exit;
}

add_action('rest_api_init', function () {
	register_rest_route('arya/v1', '/content', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => fn () => rest_ensure_response(arya_build_content()),
	]);
});

function arya_image($id): ?array {
	$id = absint($id);
	if (!$id || !($url = wp_get_attachment_url($id))) {
		return null;
	}
	$meta = wp_get_attachment_metadata($id) ?: [];
	// Originals, not WordPress's scaled copies: the site makes its own sizes.
	$original = function_exists('wp_get_original_image_url') ? (wp_get_original_image_url($id) ?: $url) : $url;
	return [
		'id' => $id,
		'url' => $original,
		'alt' => (string) get_post_meta($id, '_wp_attachment_image_alt', true),
		'width' => (int) ($meta['width'] ?? 0),
		'height' => (int) ($meta['height'] ?? 0),
		'modified' => get_post_modified_time('U', true, $id),
		// Set on photos imported from the repo: the build reuses the encoded files.
		'key' => (string) get_post_meta($id, '_arya_source_key', true),
	];
}

function arya_posts(string $type): array {
	return get_posts([
		'post_type' => $type,
		'post_status' => 'publish',
		'numberposts' => -1,
		'orderby' => ['menu_order' => 'ASC', 'date' => 'ASC'],
		'suppress_filters' => false,
	]);
}

function arya_meta(WP_Post $p, string $key): string {
	return (string) get_post_meta($p->ID, $key, true);
}

function arya_build_content(): array {
	$o = get_option(ARYA_OPTION, []);
	$v = fn ($k) => (string) ($o[$k] ?? '');

	$works = [];
	$focus = [];
	foreach (arya_posts('arya_project') as $p) {
		$images = array_values(array_filter(array_map('arya_image', arya_parse_ids(arya_meta($p, 'gallery')))));
		$work = [
			'id' => $p->post_name,
			'name' => html_entity_decode(get_the_title($p), ENT_QUOTES),
			'place' => arya_meta($p, 'place'),
			'type' => arya_meta($p, 'type'),
			'status' => arya_meta($p, 'status') ?: 'Built',
			'year' => arya_meta($p, 'year'),
			'client' => arya_meta($p, 'client'),
			'scope' => arya_meta($p, 'scope'),
			'description' => arya_meta($p, 'description'),
			'images' => $images,
		];
		if (($h = arya_meta($p, 'heading')) !== '') {
			$work['heading'] = $h;
		}
		$works[] = $work;
		if (arya_meta($p, 'in_focus') === '1') {
			$focus[] = [(int) arya_meta($p, 'focus_order'), $p->post_name];
		}
	}
	usort($focus, fn ($a, $b) => $a[0] <=> $b[0]);

	return [
		'version' => 1,
		'hero' => [
			'eyebrow' => $v('hero_eyebrow'),
			'lines' => arya_parse_lines($v('hero_lines')),
			'lead' => $v('hero_lead'),
			'cta' => $v('hero_cta'),
			'bar' => arya_parse_lines($v('hero_bar')),
			'caption' => $v('hero_caption') !== '' ? $v('hero_caption') : null,
		],
		'studio' => [
			'heading' => $v('studio_heading'),
			'lead' => $v('studio_lead'),
			'story' => $v('studio_story'),
			'note' => $v('studio_note'),
			'facts' => arya_parse_rows($v('studio_facts'), 2),
			'figure' => ['image' => arya_image($o['studio_figure'] ?? 0), 'alt' => $v('studio_figure_alt'), 'caption' => $v('studio_figure_caption')],
			'principal' => [
				'no' => $v('principal_no'),
				'name' => $v('principal_name'),
				'fullName' => $v('principal_full_name'),
				'role' => $v('principal_role'),
				'bio' => $v('principal_bio'),
				'registration' => $v('principal_registration'),
				'record' => array_map(fn ($r) => ['title' => $r[0], 'detail' => $r[1], 'year' => $r[2]], arya_parse_rows($v('principal_record'), 3)),
				'quote' => $v('principal_quote'),
				'photo' => arya_image($o['principal_photo'] ?? 0),
				'photoAlt' => $v('principal_photo_alt'),
			],
		],
		'works' => $works,
		'focus' => ['label' => $v('focus_label'), 'ids' => array_column($focus, 1)],
		'servicesIntro' => $v('services_intro'),
		'services' => array_map(fn ($p) => ['no' => arya_meta($p, 'no'), 'name' => html_entity_decode(get_the_title($p), ENT_QUOTES), 'scope' => arya_meta($p, 'scope')], arya_posts('arya_service')),
		'workflow' => array_map(fn ($p) => ['step' => (int) arya_meta($p, 'step'), 'title' => html_entity_decode(get_the_title($p), ENT_QUOTES), 'detail' => arya_meta($p, 'detail')], arya_posts('arya_step')),
		'teamHeading' => $v('team_heading'),
		'team' => array_map(fn ($p) => ['no' => arya_meta($p, 'no'), 'name' => html_entity_decode(get_the_title($p), ENT_QUOTES), 'role' => arya_meta($p, 'role'), 'line' => arya_meta($p, 'line'), 'photo' => arya_image(arya_meta($p, 'photo'))], arya_posts('arya_member')),
		'contact' => [
			'heading' => $v('contact_heading'),
			'sub' => $v('contact_sub'),
			'channels' => array_map(fn ($r) => ['label' => $r[0], 'value' => $r[1], 'href' => $r[2], 'note' => $r[3]], arya_parse_rows($v('contact_channels'), 4)),
		],
		// "Client 07" is the import's placeholder title: publish it as no name.
		'clients' => array_values(array_filter(array_map(function ($p) {
			$img = arya_image(arya_meta($p, 'logo'));
			$name = html_entity_decode(get_the_title($p), ENT_QUOTES);
			return $img ? ['image' => $img, 'name' => preg_match('/^Client \d+$/', $name) ? '' : $name] : null;
		}, arya_posts('arya_client')))),
	];
}
