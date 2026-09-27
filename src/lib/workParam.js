// ?work=<id> deep link for the Project Viewer. The hash is always preserved.
export function readWorkParam(search) {
  return new URLSearchParams(search).get('work') || null;
}

export function writeWorkParam(id) {
  const { pathname, hash } = window.location;
  window.history.replaceState(window.history.state, '', pathname + (id ? `?work=${encodeURIComponent(id)}` : '') + hash);
}
