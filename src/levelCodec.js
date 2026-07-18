// Encode/decode painter levels for shareable URLs. A level travels as
// base64url JSON in the location hash: index.html#level=<encoded>

export function encodeLevel(level) {
  const json = JSON.stringify(level);
  // btoa handles ASCII only; escape multi-byte chars first
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeLevel(encoded) {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    const level = JSON.parse(json);
    // Minimal sanity check: a 12x16 grid of numbers
    if (!Array.isArray(level.grid) || level.grid.length !== 12) return null;
    if (!level.grid.every(row => Array.isArray(row) && row.length === 16)) return null;
    return level;
  } catch (e) {
    return null;
  }
}

// Reads a shared level out of the current URL, if any
export function levelFromUrl() {
  const match = window.location.hash.match(/^#level=(.+)$/);
  if (!match) return null;
  return decodeLevel(match[1]);
}
