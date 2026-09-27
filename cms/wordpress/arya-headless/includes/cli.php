<?php
/**
 * wp arya seed — one-time import of the site's current content, so the
 * client starts with everything already in WordPress.
 *
 *   wp arya seed --from=src/content/site.json --media=assets-src/images [--force]
 *
 * Images are referenced in site.json by key (e.g. works/araya-resto-kostel/01);
 * the file is looked up as <media>/<key>.{jpg,jpeg,png,webp}. Each file is
 * imported once (remembered by key), so re-running is safe.
 */
if (!defined('ABSPATH')) {
	exit;
}

class Arya_CLI {
	private string $media = '';
	private array $keyToId = [];

	/**
	 * Import site.json and its images.
	 *
	 * ## OPTIONS
	 * --from=<file>
	 * : Path to src/content/site.json
	 * --media=<dir>
	 * : Path to assets-src/images
	 * [--force]
	 * : Import even if projects already exist.
	 */
	public function seed($args, $assoc) {
		$json = json_decode((string) file_get_contents($assoc['from']), true);
		if (!is_array($json)) {
			WP_CLI::error('Could not read ' . $assoc['from']);
		}
		$this->media = rtrim($assoc['media'], '/');
		if (!isset($assoc['force']) && wp_count_posts('arya_project')->publish > 0) {
			WP_CLI::error('Projects already exist. Use --force to import anyway.');
		}
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		foreach (get_posts(['post_type' => 'attachment', 'numberposts' => -1, 'meta_key' => '_arya_source_key', 'fields' => 'ids']) as $aid) {
			$this->keyToId[get_post_meta($aid, '_arya_source_key', true)] = $aid;
		}

		$focusOrder = array_flip($json['focus']['ids'] ?? []);
		foreach ($json['works'] as $i => $w) {
			$ids = array_filter(array_map([$this, 'image'], $w['images']));
			$this->post('arya_project', $w['id'], $w['name'], $i, [
				'place' => $w['place'], 'type' => $w['type'], 'status' => $w['status'], 'year' => $w['year'],
				'client' => $w['client'], 'scope' => $w['scope'], 'heading' => $w['heading'] ?? '',
				'description' => $w['description'], 'gallery' => implode(',', $ids),
				'in_focus' => isset($focusOrder[$w['id']]) ? '1' : '',
				'focus_order' => isset($focusOrder[$w['id']]) ? (string) ($focusOrder[$w['id']] + 1) : '',
			]);
			WP_CLI::log(sprintf('Project %s (%d photos)', $w['name'], count($ids)));
		}
		foreach ($json['team'] as $i => $m) {
			$this->post('arya_member', sanitize_title($m['name']), $m['name'], $i, ['no' => $m['no'], 'role' => $m['role'], 'line' => $m['line'], 'photo' => (string) $this->image($m['photo'])]);
		}
		foreach ($json['services'] as $i => $s) {
			$this->post('arya_service', sanitize_title($s['name']), $s['name'], $i, ['no' => $s['no'], 'scope' => $s['scope']]);
		}
		foreach ($json['workflow'] as $i => $s) {
			$this->post('arya_step', sanitize_title($s['title']), $s['title'], $i, ['step' => (string) $s['step'], 'detail' => $s['detail']]);
		}
		foreach ($json['clients'] as $i => $c) {
			$name = $c['name'] !== '' ? $c['name'] : sprintf('Client %02d', $i + 1);
			$this->post('arya_client', sanitize_title($name), $name, $i, ['logo' => (string) $this->image($c['image'])]);
		}

		$h = $json['hero'];
		$st = $json['studio'];
		$p = $st['principal'];
		$rows = fn ($list) => implode("\n", array_map(fn ($r) => implode(' | ', $r), $list));
		update_option(ARYA_OPTION, [
			'hero_eyebrow' => $h['eyebrow'], 'hero_lines' => implode("\n", $h['lines']), 'hero_lead' => $h['lead'],
			'hero_cta' => $h['cta'], 'hero_bar' => implode("\n", $h['bar']), 'hero_caption' => (string) ($h['caption'] ?? ''),
			'studio_heading' => $st['heading'], 'studio_lead' => $st['lead'], 'studio_story' => $st['story'], 'studio_note' => $st['note'],
			'studio_facts' => $rows($st['facts']),
			'studio_figure' => (string) $this->image($st['figure']['image']), 'studio_figure_alt' => $st['figure']['alt'], 'studio_figure_caption' => $st['figure']['caption'],
			'principal_no' => $p['no'], 'principal_name' => $p['name'], 'principal_full_name' => $p['fullName'], 'principal_role' => $p['role'],
			'principal_registration' => $p['registration'], 'principal_bio' => $p['bio'],
			'principal_record' => $rows(array_map(fn ($r) => [$r['title'], $r['detail'], $r['year']], $p['record'])),
			'principal_quote' => $p['quote'], 'principal_photo' => (string) $this->image($p['photo']), 'principal_photo_alt' => $p['photoAlt'],
			'services_intro' => $json['servicesIntro'], 'team_heading' => $json['teamHeading'], 'focus_label' => $json['focus']['label'],
			'contact_heading' => $json['contact']['heading'], 'contact_sub' => $json['contact']['sub'],
			'contact_channels' => $rows(array_map(fn ($c) => [$c['label'], $c['value'], $c['href'], $c['note']], $json['contact']['channels'])),
		], false);
		WP_CLI::success('Imported. Open wp-admin → Arya site.');
	}

	/** Trigger a site rebuild now (same as the "Publish site now" button). */
	public function publish() {
		$s = arya_publish_now();
		$s['ok'] ? WP_CLI::success($s['message']) : WP_CLI::warning($s['message']);
	}

	private function post(string $type, string $slug, string $title, int $order, array $meta): int {
		$existing = get_posts(['post_type' => $type, 'name' => $slug, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids']);
		$data = ['post_type' => $type, 'post_title' => $title, 'post_name' => $slug, 'post_status' => 'publish', 'menu_order' => $order];
		$id = $existing ? wp_update_post(['ID' => $existing[0]] + $data) : wp_insert_post($data);
		foreach ($meta as $k => $val) {
			update_post_meta($id, $k, $val);
		}
		return (int) $id;
	}

	private function image(?string $key): int {
		if (!$key) {
			return 0;
		}
		if (isset($this->keyToId[$key])) {
			return $this->keyToId[$key];
		}
		foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
			$file = "{$this->media}/{$key}.{$ext}";
			if (is_file($file)) {
				$tmp = wp_tempnam($file);
				copy($file, $tmp);
				$name = str_replace('/', '-', $key) . '.' . $ext;
				$aid = media_handle_sideload(['name' => $name, 'tmp_name' => $tmp], 0);
				if (is_wp_error($aid)) {
					WP_CLI::warning("{$key}: " . $aid->get_error_message());
					return 0;
				}
				update_post_meta($aid, '_arya_source_key', $key);
				return $this->keyToId[$key] = (int) $aid;
			}
		}
		WP_CLI::warning("No file for {$key}");
		return 0;
	}
}

WP_CLI::add_command('arya', 'Arya_CLI');
