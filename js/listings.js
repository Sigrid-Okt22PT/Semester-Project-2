import { apiAuction, requireAuth } from "./script.js";

/**
 * List all listings
 * GET /auction/listings
 * Supports: page, limit, sort, sortOrder, _seller, _bids, _tag, _active
 *
 * @param {Object} [opts]
 * @returns {Promise<{data:Array<any>, meta:any}>}
 * @example
 * const { data, meta } = await listListings({ page: 1, limit: 24, _active: true });
 */
export async function listListings(opts = {}) {
  return apiAuction("/listings", { query: opts });
}

/**
 * Search listings
 * GET /auction/listings/search?q=<query>
 *
 * @param {string} q
 * @param {Object} [opts]
 * @returns {Promise<{data:Array<any>, meta:any}>}
 * @example
 * const { data } = await searchListings("watch", { page: 1, limit: 12, _active: true });
 */
export async function searchListings(q, opts = {}) {
  return apiAuction("/listings/search", { query: { q: q, ...opts } });
}

/**
 * Get a single listing
 * GET /auction/listings/<id>
 *
 * @param {string} id
 * @param {Object} [opts]
 * @returns {Promise<{data:any, meta:any}>}
 * @example
 * const { data } = await getListing("abc123", { _seller: true, _bids: true });
 */
export async function getListing(id, opts = {}) {
  return apiAuction("/listings/" + encodeURIComponent(id), { query: opts });
}

/**
 * Get listing including bids + seller.
 * In v2, bids are included via _bids=true.
 *
 * @param {string} id
 * @returns {Promise<{data:any, meta:any}>}
 * @example
 * const { data } = await getListingWithBids("abc123");
 */
export async function getListingWithBids(id) {
  return getListing(id, { _bids: true, _seller: true });
}

/**
 * Create listing (auth).
 * POST /auction/listings
 * Required: title, endsAt
 *
 * @param {{title:string, endsAt:string, description?:string, media?:Array<{url:string,alt?:string}>, tags?:string[]}} payload
 * @returns {Promise<{data:any, meta:any}>}
 * @example
 * await createListing({ title:"Vintage watch", endsAt: new Date(Date.now()+86400000).toISOString() });
 */
export async function createListing(payload) {
  requireAuth();

  // validation
  if (!payload) throw new Error("Payload is required");
  if (!payload.title) throw new Error("Title is required");
  if (!payload.endsAt) throw new Error("Deadline (endsAt) is required");

  return apiAuction("/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a listing (auth)
 * PUT /auction/listings/<id>
 *
 * @param {string} id
 * @param {{ title?: string, description?: string, endsAt?: string, media?: Array<{url:string, alt?:string}>, tags?: string[] }} payload
 * @returns {Promise<{data:any, meta:any}>}
 */
export async function updateListing(id, payload) {
  requireAuth();

  if (!id) throw new Error("Listing id is required");

  // Simple frontend validation (optional)
  if (payload && payload.endsAt) {
    const d = new Date(payload.endsAt);
    if (Number.isNaN(d.getTime())) {
      throw new Error("endsAt must be a valid date");
    }
  }

  return apiAuction("/listings/" + encodeURIComponent(id), {
    method: "PUT",
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Delete a listing (auth)
 * DELETE /auction/listings/<id>
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteListing(id) {
  requireAuth();

  if (!id) throw new Error("Listing id is required");

  await apiAuction("/listings/" + encodeURIComponent(id), {
    method: "DELETE",
  });
}

/**
 * Add a bid (auth).
 * POST /auction/listings/<id>/bids
 *
 * @param {string} id
 * @param {number} amount
 * @returns {Promise<{data:any, meta:any}>}
 * @example
 * await addBid("abc123", 1200);
 */
export async function addBid(id, amount) {
  requireAuth();

  const num = Number(amount);
  if (!isFinite(num) || num <= 0) {
    throw new Error("Bid amount must be a positive number");
  }

  return apiAuction("/listings/" + encodeURIComponent(id) + "/bids", {
    method: "POST",
    body: JSON.stringify({ amount: num }),
  });
}
