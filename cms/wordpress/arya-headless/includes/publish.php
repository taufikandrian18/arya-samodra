<?php
/**
 * Publishing: any content change schedules one "rebuild the site" request to
 * GitHub (repository_dispatch), 30 s later so a burst of saves is one build.
 *
 * Configure in wp-config.php (never in the database):
 *   define('ARYA_GITHUB_REPO', 'taufikandrian18/arya-samodra');
 *   define('ARYA_GITHUB_TOKEN', 'github_pat_…'); // fine-grained, this repo only, "Contents: read & write"
 */
if (!defined('ABSPATH')) {
	exit;
}

const ARYA_PUBLISH_HOOK = 'arya_publish_site';

function arya_schedule_publish(): void {
	if (!wp_next_scheduled(ARYA_PUBLISH_HOOK)) {
		wp_schedule_single_event(time() + 30, ARYA_PUBLISH_HOOK);
	}
}

add_action('save_post', function ($id, $post) {
	if (isset(arya_post_types()[$post->post_type]) && !wp_is_post_revision($id) && !(defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) && $post->post_status !== 'auto-draft') {
		arya_schedule_publish();
	}
}, 20, 2);
add_action('before_delete_post', function ($id) {
	if (isset(arya_post_types()[get_post_type($id)])) {
		arya_schedule_publish();
	}
});
add_action('update_option_' . ARYA_OPTION, 'arya_schedule_publish');
add_action('edit_attachment', 'arya_schedule_publish'); // alt text changes

add_action(ARYA_PUBLISH_HOOK, 'arya_publish_now');

function arya_publish_now(): array {
	if (!defined('ARYA_GITHUB_REPO') || !defined('ARYA_GITHUB_TOKEN') || !ARYA_GITHUB_TOKEN) {
		$status = ['time' => time(), 'ok' => false, 'message' => 'Not configured: define ARYA_GITHUB_REPO and ARYA_GITHUB_TOKEN in wp-config.php.'];
	} else {
		$res = wp_remote_post('https://api.github.com/repos/' . ARYA_GITHUB_REPO . '/dispatches', [
			'timeout' => 15,
			'headers' => [
				'Authorization' => 'Bearer ' . ARYA_GITHUB_TOKEN,
				'Accept' => 'application/vnd.github+json',
				'X-GitHub-Api-Version' => '2022-11-28',
				'User-Agent' => 'arya-headless',
			],
			'body' => wp_json_encode(['event_type' => 'cms-publish', 'client_payload' => ['site' => home_url('/')]]),
		]);
		$code = is_wp_error($res) ? 0 : wp_remote_retrieve_response_code($res);
		$status = [
			'time' => time(),
			'ok' => $code === 204,
			'message' => $code === 204 ? 'Rebuild requested. The site updates in about 3 minutes.' : 'GitHub refused the request (' . ($code ?: $res->get_error_message()) . ').',
		];
	}
	update_option('arya_publish_status', $status, false);
	return $status;
}

function arya_render_publish_box(): void {
	$s = get_option('arya_publish_status');
	echo '<div class="arya-publish"><strong>Publishing.</strong> Saving any content rebuilds the site automatically (about 3 minutes). ';
	if ($s) {
		printf('Last request: %s — %s ', esc_html(wp_date('j M Y, H:i', $s['time'])), esc_html($s['message']));
	}
	if (wp_next_scheduled(ARYA_PUBLISH_HOOK)) {
		echo '<em>A rebuild is queued.</em> ';
	}
	echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:inline">';
	echo '<input type="hidden" name="action" value="arya_publish_now">';
	wp_nonce_field('arya_publish_now', 'arya_publish_nonce');
	echo '<button class="button">Publish site now</button></form></div>';
}

add_action('admin_post_arya_publish_now', function () {
	if (!current_user_can('edit_posts') || !isset($_POST['arya_publish_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['arya_publish_nonce'])), 'arya_publish_now')) {
		wp_die('Not allowed.');
	}
	arya_publish_now();
	wp_safe_redirect(admin_url('admin.php?page=arya-site'));
	exit;
});

// Show the publishing box on the content lists too.
add_action('admin_notices', function () {
	$screen = get_current_screen();
	if ($screen && isset(arya_post_types()[$screen->post_type]) && $screen->base === 'edit') {
		arya_render_publish_box();
	}
});
