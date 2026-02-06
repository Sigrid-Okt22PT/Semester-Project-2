import { setupAuthUI } from "../ui/auth-ui.js";
setupAuthUI();

import { logout } from "../script.js";
import { listListings, searchListings } from "../listings.js";

// ---------- DOM ----------
const listingsGrid = document.querySelector("[data-listings]");
const feedback = document.querySelector("[data-feedback]");
const pagination = document.querySelector("[data-pagination]");
const searchForms = Array.from(
  document.querySelectorAll("form[data-search-form]"),
);
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
  limit: 15,
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

  // image (default if no media or invalid media)
  let img = "https://placehold.co/400?text=Img";
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
    "bg-white rounded-2xl border  overflow-hidden shadow-sm hover:shadow transition flex flex-col";

  card.innerHTML = `
    <img src="${img}" alt="${alt}" class="h-44 w-full max-w-44 mx-auto object-cover mt-4 rounded-lg">
    <div class="p-4 space-y-2 flex-grow">
      <h3 class="text-xl text-navy line-clamp-1">${title}</h3>

      <div class="flex items-center justify-between  pt-2">
        <span class="text-navy text-2xl">
        <i class="fa-solid fa-dollar-sign text-yellow"></i>
          ${highestBid > 0 ? highestBid : "No bids"}
        </span>

        <span class="text-navy text-xs">
          ${endsText}
        </span>
      </div>

      
    </div>
    
     <a
       class="mt-auto block w-full text-yellow bg-navy
         rounded-b-2xl p-4 text-center text-xl
         hover:bg-yellow hover:text-navy transition"
        href="./listings/details.html?id=${encodeURIComponent(id)}"
    >
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

  // Noroff v2 uses currentPage / nextPage / previousPage
  const page = Number(meta.currentPage) || 1;
  const pageCount = Number(meta.pageCount) || 1;

  const prevPage = meta.previousPage; // can be null
  const nextPage = meta.nextPage; // can be null

  const prev = document.createElement("button");
  prev.textContent = "Prev";
  prev.disabled = prevPage === null || prevPage === undefined;
  prev.className =
    "px-3 py-2 rounded rounded-2xl border bg-yellow text-white disabled:opacity-50 hover:bg-navy";
  prev.addEventListener("click", () => {
    if (prevPage !== null && prevPage !== undefined) load(Number(prevPage));
  });

  const next = document.createElement("button");
  next.textContent = "Next";
  next.disabled = nextPage === null || nextPage === undefined;
  next.className =
    "px-3 py-2 rounded rounded-2xl border bg-yellow text-white disabled:opacity-50 hover:bg-navy";
  next.addEventListener("click", () => {
    if (nextPage !== null && nextPage !== undefined) load(Number(nextPage));
  });

  const label = document.createElement("span");
  label.className = "text-sm text-gray-700 px-2";
  label.textContent = "Page " + page + " of " + pageCount;

  pagination.appendChild(prev);
  pagination.appendChild(label);
  pagination.appendChild(next);
}

// ---------- data fetch ----------
async function load(page = 1) {
  page = Number(page) || 1;
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

    if (state.meta && state.meta.currentPage) {
      state.page = Number(state.meta.currentPage) || state.page;
    }

    const listings = Array.isArray(result.data) ? result.data : [];
    renderListings(listings);
    renderPagination(result.meta);

    if (state.q && state.q.length > 0) {
      setFeedback('Search result for "' + state.q + '"');
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
