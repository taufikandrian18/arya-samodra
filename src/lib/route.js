// The site is one page: it lives at BASE (e.g. /arya-samodra/) and state is
// kept in the query (?work=) and hash. Any other path under BASE is a 404.
// The server answers unknown paths with index.html, so the app decides.
export function isKnownPath(pathname, base = '/') {
  const b = base.endsWith('/') ? base : `${base}/`;
  const p = decodeURI(pathname || '/');
  return p === b || p === b.slice(0, -1) || p === `${b}index.html`;
}
