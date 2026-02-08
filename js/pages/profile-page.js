import { setupAuthUI } from "../ui/auth-ui.js";
setupAuthUI();

import { logout, requireAuth, getStoredProfile } from "../script.js";
import { getHighestBid } from "../utils/bids.js";
import {
  getProfile,
  getCredits,
  updateAvatar,
  listListingsByProfile,
} from "../profiles.js";

// must be logged in to view profile
if (!requireAuth()) {
  throw new Error("Not authenticated");
}


// ---------- logout ----------
const logoutLinks = document.querySelectorAll("[data-logout]");
logoutLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
});

// ---------- DOM ----------
const elName = document.querySelector("[data-name]");
const elEmail = document.querySelector("[data-email]");
const elAvatar = document.querySelector("[data-avatar]");
const elCredits = document.querySelector("[data-credits]");

const form = document.querySelector("[data-avatar-form]");
const errEl = document.querySelector("[data-error]");
const okEl = document.querySelector("[data-success]");

const listingsGrid = document.querySelector("[data-my-listings]");
const listingsFeedback = document.querySelector("[data-my-listings-feedback]");

// ---------- UI helpers ----------
function setError(msg) {
  if (errEl) errEl.textContent = msg || "";
  if (okEl) okEl.textContent = "";
}

function setSuccess(msg) {
  if (okEl) okEl.textContent = msg || "";
  if (errEl) errEl.textContent = "";
}

// ---------- render card ----------
function renderMyListingCard(listing) {
  // image (expanded checks)
  let img = "https://placehold.co/640x420?text=Biddy";
  let alt = "Listing";

  if (
    listing &&
    listing.media &&
    Array.isArray(listing.media) &&
    listing.media.length > 0 &&
    listing.media[0] &&
    listing.media[0].url
  ) {
    img = listing.media[0].url;
  }

  if (
    listing &&
    listing.media &&
    Array.isArray(listing.media) &&
    listing.media.length > 0 &&
    listing.media[0] &&
    listing.media[0].alt
  ) {
    alt = listing.media[0].alt;
  } else if (listing && listing.title) {
    alt = listing.title;
  }

  // endsAt
  let endsText = "—";
  if (listing && listing.endsAt) {
    const d = new Date(listing.endsAt);
    if (!Number.isNaN(d.getTime())) endsText = d.toLocaleString();
  }

  // title
  let title = "Untitled";
  if (listing && listing.title) title = listing.title;
  // title
  let details = "Untitled";
  if (listing && listing.description) details = listing.description;

  // id
  let id = "";
  if (listing && listing.id) id = listing.id;

  // highest bid
  const highestBid = getHighestBid(listing);

  const article = document.createElement("article");
article.className =
  "bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow transition flex flex-col h-full";

article.innerHTML = `
  <img
    src="${img}"
    alt="${alt}"
    class="w-full h-44 object-cover"
    loading="lazy"
  />

  <div class="p-4 flex flex-col flex-grow">
    <h3 class="text-lg font-semibold text-navy line-clamp-1">${title}</h3>

    <p class="text-sm text-gray-600 mt-1 line-clamp-2">${details || ""}</p>

    <div class="mt-auto flex items-center justify-between">
      <span class="text-navy text-lg font-semibold flex items-center gap-2">
        <i class="fa-solid fa-dollar-sign text-yellow"></i>
        ${highestBid > 0 ? highestBid : "No bids"}
      </span>

      <span class="text-xs text-gray-600 flex items-center gap-2">
        <i class="fa-regular fa-clock text-yellow"></i>
        ${endsText}
      </span>
    </div>
  </div>

  <a
    class="mt-auto block w-full bg-navy text-yellow
       rounded-b-2xl px-4 py-4 text-center font-semibold
       hover:bg-yellow hover:text-navy transition"

    href="../listings/details.html?id=${encodeURIComponent(id)}"
  >
    View details
  </a>
`;
return article;

}

// ---------- init ----------
async function init() {
  const stored = getStoredProfile();

  let name = "";
  if (stored && stored.name) name = stored.name;

  if (!name) {
    setError("Missing profile name. Please login again.");
    return;
  }

  // Fetch live profile (credits/avatar)
  try {
    const result = await getProfile(name);
    const profile = result && result.data ? result.data : null;

    if (elName)
      elName.textContent = profile && profile.name ? profile.name : name;

    if (elEmail) {
      if (profile && profile.email) elEmail.textContent = profile.email;
      else if (stored && stored.email) elEmail.textContent = stored.email;
      else elEmail.textContent = "";
    }

    // avatar
    let avatarUrl = "https://placehold.co/96x96";
    let avatarAlt = "Avatar";

    if (profile && profile.avatar && profile.avatar.url)
      avatarUrl = profile.avatar.url;
    else if (stored && stored.avatar && stored.avatar.url)
      avatarUrl = stored.avatar.url;

    if (profile && profile.avatar && profile.avatar.alt)
      avatarAlt = profile.avatar.alt;

    if (elAvatar) {
      elAvatar.src = avatarUrl;
      elAvatar.alt = avatarAlt;
    }
  } catch (e) {
    const msg = e && e.message ? e.message : "Failed to load profile";
    setError(msg);
    return;
  }

  // Credits
  try {
    const credits = await getCredits(name);
    if (elCredits) elCredits.textContent = String(credits);
  } catch {
    // not fatal, just show 0 if it fails
    if (elCredits) elCredits.textContent = "0";
  }

  // Load your listings
  if (listingsFeedback) listingsFeedback.textContent = "Loading your listings…";

  try {
    const result = await listListingsByProfile(name, { limit: 12, page: 1 });
    const data = result && result.data ? result.data : [];

    if (listingsGrid) listingsGrid.innerHTML = "";

    if (!data || !Array.isArray(data) || data.length === 0) {
      if (listingsGrid) {
        listingsGrid.innerHTML =
          '<div class="col-span-full text-sm text-gray-600">You have no listings yet.</div>';
      }
    } else {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < data.length; i++) {
        frag.appendChild(renderMyListingCard(data[i]));
      }
      if (listingsGrid) listingsGrid.appendChild(frag);
    }

    if (listingsFeedback) listingsFeedback.textContent = "";
  } catch (e) {
    const msg = e && e.message ? e.message : "Could not load listings";
    if (listingsFeedback) listingsFeedback.textContent = msg;
  }
}

// ---------- avatar submit ----------
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const stored = getStoredProfile();
    let name = "";
    if (stored && stored.name) name = stored.name;

    if (!name) {
      setError("Missing profile name. Please login again.");
      return;
    }

    const fd = new FormData(form);

    const url = String(fd.get("url") || "").trim();
    const alt = String(fd.get("alt") || "").trim();

    if (!url) {
      setError("Avatar URL is required.");
      return;
    }

    try {
      const updated = await updateAvatar(name, { url: url, alt: alt });

      // update image immediately in UI
      if (elAvatar) {
        if (updated && updated.avatar && updated.avatar.url)
          elAvatar.src = updated.avatar.url;
        else elAvatar.src = url;
      }

      setSuccess("Avatar updated!");
      form.reset();
    } catch (err) {
      const msg = err && err.message ? err.message : "Failed to update avatar";
      setError(msg);
    }
  });
}

// ---------- run ----------
init();
