<?php
/**
 * Field definitions: one place that drives the edit screens, saving, the
 * JSON endpoint and the seed command.
 *
 * Field types:
 *   text, textarea, select (options), checkbox, number,
 *   image (one attachment id), gallery (ordered attachment ids),
 *   lines (one item per line), rows (one item per line, columns split by " | ").
 */

if (!defined('ABSPATH')) {
	exit;
}

function arya_post_types(): array {
	return [
		'arya_project' => [
			'singular' => 'Project',
			'plural' => 'Projects',
			'icon' => 'dashicons-building',
			'title' => 'Project name',
			'fields' => [
				'place' => ['type' => 'text', 'label' => 'Place', 'help' => 'City, e.g. Surabaya.'],
				'type' => ['type' => 'text', 'label' => 'Type', 'help' => 'Filter group, in capitals: OFFICE, PUBLIC, RETAIL, MIXED USE, RESORT, F&B, MASTERPLAN.'],
				'status' => ['type' => 'select', 'label' => 'Status', 'options' => ['Built', 'Work in progress', 'Design proposal']],
				'year' => ['type' => 'text', 'label' => 'Year'],
				'client' => ['type' => 'text', 'label' => 'Client', 'help' => 'Write "Private client" for private individuals until they approve being named.'],
				'scope' => ['type' => 'textarea', 'label' => 'Scope (one sentence)', 'rows' => 2],
				'heading' => ['type' => 'text', 'label' => 'Statement heading (optional)'],
				'description' => ['type' => 'textarea', 'label' => 'Description', 'rows' => 7],
				'gallery' => ['type' => 'gallery', 'label' => 'Photos', 'help' => 'Drag to reorder. The first photo is the cover. Upload the largest originals you have (the site makes the small versions).'],
				'in_focus' => ['type' => 'checkbox', 'label' => 'Show in "In Focus"'],
				'focus_order' => ['type' => 'number', 'label' => 'In Focus order', 'help' => 'Lower numbers come first.'],
			],
		],
		'arya_member' => [
			'singular' => 'Team member',
			'plural' => 'Team',
			'icon' => 'dashicons-groups',
			'title' => 'Name',
			'fields' => [
				'no' => ['type' => 'text', 'label' => 'Number', 'help' => 'e.g. 02'],
				'role' => ['type' => 'text', 'label' => 'Role'],
				'line' => ['type' => 'textarea', 'label' => 'One-line description', 'rows' => 3],
				'photo' => ['type' => 'image', 'label' => 'Portrait', 'help' => 'A transparent PNG cut-out, 4:5, head and shoulders, like the others.'],
			],
		],
		'arya_service' => [
			'singular' => 'Service',
			'plural' => 'Services',
			'icon' => 'dashicons-hammer',
			'title' => 'Service name',
			'fields' => [
				'no' => ['type' => 'text', 'label' => 'Number', 'help' => 'e.g. 01'],
				'scope' => ['type' => 'textarea', 'label' => 'Scope line', 'rows' => 3],
			],
		],
		'arya_step' => [
			'singular' => 'Workflow step',
			'plural' => 'Workflow',
			'icon' => 'dashicons-randomize',
			'title' => 'Step title',
			'fields' => [
				'step' => ['type' => 'number', 'label' => 'Step number'],
				'detail' => ['type' => 'textarea', 'label' => 'Detail', 'rows' => 2],
			],
		],
		'arya_client' => [
			'singular' => 'Client logo',
			'plural' => 'Client logos',
			'icon' => 'dashicons-awards',
			'title' => 'Client name (used as the logo\'s description)',
			'fields' => [
				'logo' => ['type' => 'image', 'label' => 'Logo', 'help' => 'Dark logo on a transparent or white background; the site turns it white.'],
			],
		],
	];
}

/** The "Site content" settings page, grouped into sections. */
function arya_site_fields(): array {
	return [
		'Hero' => [
			'hero_eyebrow' => ['type' => 'text', 'label' => 'Eyebrow'],
			'hero_lines' => ['type' => 'lines', 'label' => 'Headline lines', 'rows' => 3, 'help' => 'One line per row.'],
			'hero_lead' => ['type' => 'textarea', 'label' => 'Lead', 'rows' => 2],
			'hero_cta' => ['type' => 'text', 'label' => 'Button label'],
			'hero_bar' => ['type' => 'lines', 'label' => 'Bottom bar items', 'rows' => 3, 'help' => 'One item per row.'],
			'hero_caption' => ['type' => 'text', 'label' => 'Video caption (optional)'],
		],
		'Studio' => [
			'studio_heading' => ['type' => 'textarea', 'label' => 'Heading', 'rows' => 2],
			'studio_lead' => ['type' => 'textarea', 'label' => 'Lead', 'rows' => 3],
			'studio_story' => ['type' => 'textarea', 'label' => 'Story', 'rows' => 5],
			'studio_note' => ['type' => 'textarea', 'label' => 'Note', 'rows' => 4],
			'studio_facts' => ['type' => 'rows', 'label' => 'Facts', 'rows' => 4, 'columns' => ['Label', 'Value'], 'help' => 'One per row: Label | Value'],
			'studio_figure' => ['type' => 'image', 'label' => 'Studio photo'],
			'studio_figure_alt' => ['type' => 'text', 'label' => 'Studio photo description'],
			'studio_figure_caption' => ['type' => 'text', 'label' => 'Studio photo caption'],
		],
		'Principal' => [
			'principal_no' => ['type' => 'text', 'label' => 'Number'],
			'principal_name' => ['type' => 'text', 'label' => 'Name'],
			'principal_full_name' => ['type' => 'text', 'label' => 'Full name'],
			'principal_role' => ['type' => 'text', 'label' => 'Role'],
			'principal_registration' => ['type' => 'text', 'label' => 'Registration'],
			'principal_bio' => ['type' => 'textarea', 'label' => 'Bio', 'rows' => 4],
			'principal_record' => ['type' => 'rows', 'label' => 'Record', 'rows' => 4, 'columns' => ['Title', 'Detail', 'Year'], 'help' => 'One per row: Title | Detail | Year'],
			'principal_quote' => ['type' => 'textarea', 'label' => 'Quote', 'rows' => 3],
			'principal_photo' => ['type' => 'image', 'label' => 'Portrait'],
			'principal_photo_alt' => ['type' => 'text', 'label' => 'Portrait description'],
		],
		'Sections' => [
			'services_intro' => ['type' => 'textarea', 'label' => 'Services intro', 'rows' => 2],
			'team_heading' => ['type' => 'text', 'label' => 'Team heading'],
			'focus_label' => ['type' => 'text', 'label' => 'In Focus label'],
		],
		'Contact' => [
			'contact_heading' => ['type' => 'text', 'label' => 'Heading'],
			'contact_sub' => ['type' => 'text', 'label' => 'Sub-heading'],
			'contact_channels' => ['type' => 'rows', 'label' => 'Channels', 'rows' => 6, 'columns' => ['Label', 'Value', 'Link', 'Note'], 'help' => 'One per row: Label | Value | Link | Note. Links: mailto:…, tel:+62…, https://…'],
		],
	];
}

/** Split a "rows" field value into arrays of columns. */
function arya_parse_rows(string $value, int $columns): array {
	$out = [];
	foreach (preg_split('/\r\n|\r|\n/', $value) as $line) {
		if (trim($line) === '') {
			continue;
		}
		$cells = array_map('trim', explode('|', $line, $columns));
		$out[] = array_pad($cells, $columns, '');
	}
	return $out;
}

function arya_parse_lines(string $value): array {
	return array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $value)), 'strlen'));
}

function arya_parse_ids($value): array {
	return array_values(array_filter(array_map('absint', explode(',', (string) $value))));
}

/** Sanitize one submitted value according to its field type. */
function arya_sanitize_field(array $field, $raw) {
	switch ($field['type']) {
		case 'textarea':
		case 'lines':
		case 'rows':
			return sanitize_textarea_field(wp_unslash((string) $raw));
		case 'checkbox':
			return $raw ? '1' : '';
		case 'number':
			return $raw === '' ? '' : (string) intval($raw);
		case 'image':
			return (string) absint($raw);
		case 'gallery':
			return implode(',', arya_parse_ids(wp_unslash((string) $raw)));
		case 'select':
			$raw = sanitize_text_field(wp_unslash((string) $raw));
			return in_array($raw, $field['options'], true) ? $raw : $field['options'][0];
		default:
			return sanitize_text_field(wp_unslash((string) $raw));
	}
}
