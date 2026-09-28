# Deploying with the WordPress CMS

```
website.taufikandrian.my.id/arya-samodra/            → the React site (static files, built by GitHub Actions)
website.taufikandrian.my.id/arya-samodra/wp-admin    → WordPress, where the client edits content and photos
```

WordPress is only the back office. The public site is a static build: GitHub
Actions pulls the published content from `/wp-json/arya/v1/content`, encodes
new photos (AVIF/WebP), builds and uploads. Saving anything in WordPress asks
GitHub to do this; the change is live in about 3 minutes. If WordPress is
down, the public site keeps working.

## One-time setup (≈15 minutes)

### 1. A deploy key for GitHub Actions (on your laptop)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/arya-deploy -N "" -C github-actions-arya
cat ~/.ssh/arya-deploy.pub      # public half: goes to the VPS in step 2
```

### 2. Install WordPress on the VPS (as root)

Until the CMS work is merged, clone the feature branch (`main` doesn't have these scripts yet); after the merge, drop `-b …`.

```bash
git clone -b claude/clever-wright-njcwv9 https://github.com/taufikandrian18/arya-samodra.git /opt/arya-samodra-src
cd /opt/arya-samodra-src
sudo DEPLOY_PUBKEY="ssh-ed25519 AAAA…paste…" bash deploy/server/bootstrap.sh
```

It installs PHP-FPM, MariaDB and WP-CLI; creates the database (random password,
kept only in `wp-config.php`); installs WordPress at `/arya-samodra`; installs
and activates the **Arya headless** plugin; imports all current projects,
photos, team, services, workflow and client logos; sets up WordPress cron; and
creates the `deploy` user for GitHub. **It asks for the admin username,
password and email; nothing is written to the repository.**

Choose a username other than `admin` (bots try it first) and a long password.

Then add one line inside your existing site block in `/etc/caddy/Caddyfile`:

```caddy
website.taufikandrian.my.id {
    import /etc/caddy/arya-samodra.caddy
    # … your other routes …
}
```

```bash
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
```

#### Caddy in Docker

If Caddy runs in a container (for example the n8n compose stack), it can't see
the host's files or PHP until they are mounted. Add to the Caddy service in
the compose file:

```yaml
    volumes:
      - ./arya-samodra.caddy:/etc/caddy/arya-samodra.caddy:ro
      - /var/www/arya-samodra:/var/www/arya-samodra:ro
      - /run/php:/run/php
```

Point `php_fastcgi` at the versioned socket (`/run/php/php8.x-fpm.sock`), not
`/run/php/php-fpm.sock`: on Ubuntu that one links through `/etc/alternatives`,
which doesn't exist inside the container (Caddy answers 502).

Put the rendered snippet next to the compose file, import it with the
**container** path (`import /etc/caddy/arya-samodra.caddy`), check with
`docker run --rm … caddy adapt` before recreating, then
`docker compose up -d caddy`.

#### Real 404 status for unknown pages

The site is one page, so any other path under `/arya-samodra/` shows the
app's 404 page. The snippet above answers those paths with `index.html` and
status **404** (not 200), so search engines drop dead links. A snippet made
before this change used `try_files {path} /index.html`; to update it in
place (same file, so the container sees it without a recreate):

```bash
cd /home/ubuntu/n8n
cp arya-samodra.caddy arya-samodra.caddy.bak
python3 - <<'PY'
p = 'arya-samodra.caddy'
s = open(p).read()
old = '\ttry_files {path} /index.html\n\tfile_server\n}'
new = '\t@arya_missing not file {path} {path}index.html\n\thandle @arya_missing {\n\t\trewrite * /index.html\n\t\tfile_server {\n\t\t\tstatus 404\n\t\t}\n\t}\n\thandle {\n\t\tfile_server\n\t}\n}'
assert old in s, 'old block not found: compare with deploy/server/arya-samodra.caddy.tpl'
open(p, 'w').write(s.replace(old, new))
print('updated')
PY
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
curl -s -o /dev/null -w "%{http_code}\n" https://website.taufikandrian.my.id/arya-samodra/
curl -s -o /dev/null -w "%{http_code}\n" https://website.taufikandrian.my.id/arya-samodra/nope
```

Expect `200` then `404`. To undo: `cp arya-samodra.caddy.bak arya-samodra.caddy`
and reload again.

### 3. Let WordPress trigger rebuilds

Create a fine-grained token at GitHub → Settings → Developer settings →
Personal access tokens → Fine-grained: repository **arya-samodra only**,
permission **Contents: Read and write**. Put it in
`/var/www/arya-samodra/wp/arya-samodra/wp-config.php`:

```php
define('ARYA_GITHUB_TOKEN', 'github_pat_…');
```

### 4. GitHub repository settings → Secrets and variables → Actions

| Kind | Name | Value |
|---|---|---|
| Secret | `VPS_SSH_KEY` | contents of `~/.ssh/arya-deploy` (the private key) |
| Secret | `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519 43.133.130.148` |
| Variable | `VPS_HOST` | `43.133.130.148` |
| Variable | `VPS_USER` | `deploy` |
| Variable | `CMS_URL` | `https://website.taufikandrian.my.id/arya-samodra` |
| Variable | `SITE_BASE` | `/arya-samodra/` |
| Variable | `SITE_ROOT` | `/var/www/arya-samodra` |

### 5. First deploy

Merge to `main` (or Actions → Deploy → Run workflow). The first run encodes
every photo (~20 min); later runs reuse the cache and take 2–4 minutes.
`repository_dispatch` only runs workflows on the default branch, so
publishing from WordPress starts working once `deploy.yml` is on `main`.

## Day to day

- **Client:** wp-admin → *Arya site* → Projects / Team / Services / Workflow /
  Client logos / Site content. Save → the site updates in ~3 minutes. *Publish
  site now* forces a rebuild.
- **You:** push to a branch → CI checks it; merge to `main` → deployed.
- **Check a rebuild:** GitHub → Actions → Deploy.

## What the pipeline refuses

If WordPress can't be reached, or published content is incomplete (a project
without photos, a bad slug, …), the deploy **fails and the live site stays as
it was**; the job log names the problem.
