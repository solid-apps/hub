/**
 * auth.js — xlogin wrapper
 *
 * Listens for xlogin/xlogout events, exposes a small reactive auth object,
 * and provides an authFetch that falls back to anonymous fetch when not
 * signed in.
 */

const listeners = new Set();
const auth = {
  type: null,        // "solid" | "nostr" | null
  id: null,          // webId (solid) or pubkey (nostr)
  loggedIn: false,
};

function fire() {
  listeners.forEach(fn => { try { fn(auth); } catch (e) { console.error(e); } });
}

function update(detail) {
  auth.type = detail?.type || null;
  auth.id = detail?.id || null;
  auth.loggedIn = !!auth.id;
  fire();
}

document.addEventListener("xlogin", (e) => update(e.detail));
document.addEventListener("xlogout", () => update(null));

// xlogin may auto-restore a session asynchronously; poll briefly until ready.
let polls = 0;
const poll = setInterval(() => {
  polls++;
  if (window.xlogin && window.xlogin.id && !auth.loggedIn) {
    update({ type: window.xlogin.type, id: window.xlogin.id });
  }
  if (polls > 20) clearInterval(poll); // 10s
}, 500);

export function onAuth(fn) {
  listeners.add(fn);
  fn(auth); // fire immediately with current state
  return () => listeners.delete(fn);
}

export function getAuth() { return auth; }

/**
 * authFetch: uses xlogin's authenticated fetch when available (DPoP for Solid,
 * NIP-98 for Nostr), otherwise falls back to plain fetch (anonymous read).
 */
export function authFetch(url, init) {
  const f = (window.xlogin && window.xlogin.authFetch) || fetch;
  return f(url, init);
}

/** Trigger xlogin's login modal. */
export function login() { window.xlogin?.login?.(); }

/** Log out of xlogin. */
export function logout() { window.xlogin?.logout?.(); }
