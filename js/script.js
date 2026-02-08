const API_ROOT = "https://v2.api.noroff.dev";
const API_KEY = "f46433fb-6c5d-42f9-aa02-0751b52aa6fb";

// Storage keys for THIS app
const TOKEN_KEY = "biddy_token";
const PROFILE_KEY = "biddy_profile";

export const TOKEN = localStorage.getItem(TOKEN_KEY) || "";

// ---------- date/time ----------
export function fmtDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------- auth helpers ----------
/**
 * Reads and decodes the JWT payload stored in localStorage.
 * If something fails, returns an empty object.
 */
export function readJWT() {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const parts = token.split(".");
    // JWT usually has 3 parts: header.payload.signature
    if (parts.length < 2) return {};

    const payloadBase64 = parts[1];
    if (!payloadBase64) return {};

    return JSON.parse(atob(payloadBase64));
  } catch {
    return {};
  }
}

export function requireAuth(redirectTo) {
  // If no token, redirect to main page since not everything is protected and we don't want to break the UX by forcing login for everyone
  if (!redirectTo) redirectTo = "../index.html";

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = redirectTo;
    return false;
  }

  return true;
}

export function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ---------- request helper ----------
/**
 * Core request helper returning {data, meta}.
 * Adds JWT + API key automatically.
 *
 * @param {string} pathOrUrl
 * @param {RequestInit & { query?: any, signal?: AbortSignal }} [init]
 * @returns {Promise<{data:any, meta:any}>}
 */
export async function apiRequest(pathOrUrl, init) {
  if (!init) init = {};

  // build url
  let full = pathOrUrl;
  if (pathOrUrl.indexOf("http") !== 0) {
    full = API_ROOT + pathOrUrl;
  }

  const url = new URL(full);

  // add query params
  if (init.query) {
    const keys = Object.keys(init.query);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const v = init.query[k];

      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  // headers
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("X-Noroff-API-Key", API_KEY);

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  // fetch
  const res = await fetch(url, {
    method: init.method,
    body: init.body,
    headers: headers,
    signal: init.signal,
  });

  // parse json safely
  let json = null;

  try {
    json = await res.json();
  } catch {
    // keep json as null if response isn't JSON
  }

  // handle errors
  if (!res.ok) {
    let msg = res.statusText || "Request failed";

    if (
      json &&
      json.errors &&
      json.errors.length > 0 &&
      json.errors[0].message
    ) {
      msg = json.errors[0].message;
    }

    const err = new Error(msg);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  // return data
  if (json) return json;
  return { data: null, meta: null };
}

// ---------- wrappers ----------
export function apiAuth(p, init) {
  return apiRequest("/auth" + p, init);
}

export function apiAuction(p, init) {
  return apiRequest("/auction" + p, init);
}

// ---------- Requirement: stud.noroff.no only ----------
function assertStudEmail(email) {
  const ok = /@stud\.noroff\.no$/i.test(email);
  if (!ok) {
    throw new Error("Email must be @stud.noroff.no");
  }
}

// ---------- AUTH: register / login / logout ----------
export async function register(input) {
  const name = input.name;
  const email = input.email;
  const password = input.password;
  const avatar = input.avatar;

  assertStudEmail(email);

  const payload = {
    name: name,
    email: email,
    password: password,
  };

  if (avatar && avatar.url) {
    payload.avatar = avatar;
  }

  const result = await apiAuth("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function login(input) {
  const email = input.email;
  const password = input.password;

  const result = await apiAuth("/login", {
    method: "POST",
    body: JSON.stringify({ email: email, password: password }),
  });

  const data = result.data;

  // store token
  const accessToken = data && data.accessToken ? data.accessToken : "";
  localStorage.setItem(TOKEN_KEY, accessToken);

  // store profile snapshot (for UI)
  setStoredProfile({
    name: data && data.name ? data.name : "",
    email: data && data.email ? data.email : "",
    avatar: data && data.avatar ? data.avatar : null,
    credits: data && typeof data.credits === "number" ? data.credits : 0,
  });

  return data;
}

export function logout(redirectTo) {
  if (!redirectTo) redirectTo = "../index.html";

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  window.location.href = redirectTo;
}
