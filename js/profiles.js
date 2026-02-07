import {
  apiAuction,
  requireAuth,
  setStoredProfile,
  getStoredProfile,
} from "./script.js";

/**
 * Get a single profile (includes credits).
 * GET /auction/profiles/<name>
 *
 * @param {string} name
 * @param {Object} [opts]
 * @returns {Promise<{data:any, meta:any}>}
 */
export async function getProfile(name, opts) {
  if (!opts) opts = {};
  return apiAuction("/profiles/" + encodeURIComponent(name), { query: opts });
}

/**
 * Update a profile (avatar / banner / bio).
 * PUT /auction/profiles/<name>
 *
 * @param {string} name
 * @param {Object} payload
 * @returns {Promise<any>} updated profile data
 */
export async function updateProfile(name, payload) {
  requireAuth();

  const result = await apiAuction("/profiles/" + encodeURIComponent(name), {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const data = result && result.data ? result.data : null;

  // keep local cache in sync (no spread operator)
  const existing = getStoredProfile();
  const merged = {};

  if (existing) {
    const keys = Object.keys(existing);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      merged[k] = existing[k];
    }
  }

  if (data) {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      merged[k] = data[k];
    }
  }

  setStoredProfile(merged);

  return data;
}

/**
 * Update ONLY avatar (requirement).
 *
 * @param {string} name
 * @param {{url:string, alt?:string}} avatar
 * @returns {Promise<any>}
 */
export async function updateAvatar(name, avatar) {
  if (!avatar) throw new Error("Avatar is required");
  if (!avatar.url) throw new Error("Avatar url is required");

  return updateProfile(name, { avatar: avatar });
}

/**
 * Get total credits (requirement).
 *
 * @param {string} name
 * @returns {Promise<number>}
 */
export async function getCredits(name) {
  const result = await getProfile(name);
  const data = result && result.data ? result.data : null;

  if (data && typeof data.credits === "number") return data.credits;
  return 0;
}

/**
 * Get all listings by profile.
 * GET /auction/profiles/<name>/listings
 *
 * @param {string} name
 * @param {Object} [opts]
 * @returns {Promise<{data:Array<any>, meta:any}>}
 */
export async function listListingsByProfile(name, opts) {
  if (!opts) opts = {};
  return apiAuction("/profiles/" + encodeURIComponent(name) + "/listings", {
    query: opts,
  });
}

/**
 * Get all bids by profile (optional).
 * GET /auction/profiles/<name>/bids
 *
 * @param {string} name
 * @param {Object} [opts]
 * @returns {Promise<{data:Array<any>, meta:any}>}
 */
export async function listBidsByProfile(name, opts) {
  if (!opts) opts = {};
  return apiAuction("/profiles/" + encodeURIComponent(name) + "/bids", {
    query: opts,
  });
}
