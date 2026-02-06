import { setupAuthUI } from "../ui/auth-ui.js";
setupAuthUI();

import { logout } from "../script.js";
import { listListings, searchListings } from "../listings.js";


// ---------- DOM ----------
const listingsGrid = document.querySelector("[data-listings]");
const feedback = document.querySelector("[data-feedback]");
const pagination = document.querySelector("[data-pagination]");
const searchForms = Array.from(document.querySelectorAll("form[data-search-form]"));
const logoutLinks = document.querySelectorAll("[data-logout]");

// ---------- logout ----------
logoutLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
});

// ---------- state ----------
const state = {
  page: 1,
  limit: 24,
  q: "",
  meta: null,
  loading: false,
};

// ---------- UI helpers ----------
function setFeedback(text = "") {
  if (feedback) feedback.textContent = text;
}

function emptyMessage(msg = "No listings found.") {
  const box = document.createElement("div");
  box.className =
    "col-span-full text-center text-navy bg-white border border-gray-200 p-6 rounded";
  box.textContent = msg;
  return box;
}

// ---------- bids helper ----------
function getHighestBid(listing) {
  // Default if no bids
  let highest = 0;

  if (!listing) return highest;
  if (!listing.bids) return highest;
  if (!Array.isArray(listing.bids)) return highest;

  for (let i = 0; i < listing.bids.length; i++) {
    const bid = listing.bids[i];
    const amount = bid && bid.amount ? Number(bid.amount) : 0;
    if (amount > highest) highest = amount;
  }

  return highest;
}

// ---------- render ----------
function renderListings(listings) {
  if (!listingsGrid) return;

  listingsGrid.innerHTML = "";

  if (!listings || !Array.isArray(listings) || listings.length === 0) {
    listingsGrid.appendChild(emptyMessage());
    return;
  }

  const frag = document.createDocumentFragment();
  for (let i = 0; i < listings.length; i++) {
    frag.appendChild(renderCard(listings[i]));
  }
  listingsGrid.appendChild(frag);
}

function renderCard(listing) {
  // title
  let title = "Untitled";
  if (listing && listing.title) title = listing.title;

  // description
  let description = "No description.";
  if (listing && listing.description) description = listing.description;

  // endsAt
  let endsText = "—";
  if (listing && listing.endsAt) {
    const d = new Date(listing.endsAt);
    if (!Number.isNaN(d.getTime())) endsText = d.toLocaleString();
  }

  // image
  let img = "https://placehold.co/640x420?text=Biddy";
  let alt = title;

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
  }

  // id for link
  let id = "";
  if (listing && listing.id) id = listing.id;

  // highest bid amount
  const highestBid = getHighestBid(listing);

  const card = document.createElement("article");
  card.className =
    "bg-white rounded-2xl border border-4 border-yellow overflow-hidden shadow-sm hover:shadow transition";

  card.innerHTML = `
    <img src="${img}" alt="${alt}" class="h-44 w-full max-w-44 mx-auto object-cover mt-4 rounded-lg">
    <div class="p-4 space-y-2">
      <h3 class="font-bold text-navy line-clamp-1">${title}</h3>
      <p class="text-sm text-gray-600 line-clamp-2">${description}</p>

      <div class="flex items-center justify-between  pt-2">
        <span class="text-navy text-xl font-semibold">
         <i class="fa-solid fa-dollar-sign text-yellow"></i>
          ${highestBid > 0 ? highestBid : "No bids"}
        </span>

        <span class="text-navy text-xs font-semibold">
          <i class="fa-regular fa-clock text-yellow"></i>
          ${endsText}
        </span>
      </div>

      
    </div>
    
      <a class="inline-block font-semibold text-yellow hover:underline bg-navy border border-4 border-yellow rounded-2xl p-4 text-center text-xl w-full"
         href="./listings/details.html?id=${encodeURIComponent(id)}">
        View bid
      </a>
      
  `;

  return card;
}

// ---------- pagination ----------
function renderPagination(meta) {
  if (!pagination) return;
  pagination.innerHTML = "";
  if (!meta) return;

  const isFirst = meta.page <= 1;
  const isLast = meta.page >= meta.pageCount;

  const prev = document.createElement("button");
  prev.textContent = "Prev";
  prev.disabled = isFirst;
  prev.className =
    "px-3 py-2 rounded border border-gray-300 bg-white disabled:opacity-50";
  prev.addEventListener("click", () => {
    if (!isFirst) load(meta.page - 1);
  });

  const next = document.createElement("button");
  next.textContent = "Next";
  next.disabled = isLast;
  next.className =
    "px-3 py-2 rounded border border-gray-300 bg-white disabled:opacity-50";
  next.addEventListener("click", () => {
    if (!isLast) load(meta.page + 1);
  });

  const label = document.createElement("span");
  label.className = "text-sm text-gray-700 px-2";
  label.textContent = "Page " + meta.page + " of " + meta.pageCount;

  pagination.appendChild(prev);
  pagination.appendChild(label);
  pagination.appendChild(next);
}

// ---------- data fetch ----------
async function load(page = 1) {
  if (!listingsGrid) return;
  if (state.loading) return;

  state.loading = true;
  state.page = page;

  setFeedback("Loading listings…");
  listingsGrid.innerHTML = "";
  listingsGrid.appendChild(emptyMessage("Loading…"));
  if (pagination) pagination.innerHTML = "";

  try {
    let result;

    // IMPORTANT: include bids so we can calculate the highest bid
    if (state.q && state.q.length > 0) {
      result = await searchListings(state.q, {
        page: state.page,
        limit: state.limit,
        _active: true,
        _bids: true,
      });
    } else {
      result = await listListings({
        page: state.page,
        limit: state.limit,
        _active: true,
        _bids: true,
      });
    }

    state.meta = result.meta || null;

    const listings = Array.isArray(result.data) ? result.data : [];
    renderListings(listings);
    renderPagination(result.meta);

    if (state.q && state.q.length > 0) {
      setFeedback('Showing results for "' + state.q + '"');
    } else {
      setFeedback("");
    }
  } catch (err) {
    const msg = err && err.message ? err.message : "Failed to load listings";
    setFeedback(msg);

    listingsGrid.innerHTML = "";
    listingsGrid.appendChild(emptyMessage("Could not load listings."));
  } finally {
    state.loading = false;
  }
}

// ---------- search ----------
searchForms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    state.q = String(fd.get("search") || "").trim();
    state.page = 1;
    load(1);
  });
});

// ---------- init ----------
load(1);
