import { setupAuthUI } from "../ui/auth-ui.js";
setupAuthUI();

import { logout, fmtDate, getStoredProfile } from "../script.js";
import { getListingWithBids, addBid } from "../listings.js";



// ---------- logout ----------
const logoutLinks = document.querySelectorAll("[data-logout]");
logoutLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
});

// ---------- DOM ----------
const feedback = document.querySelector("[data-feedback]");
const titleEl = document.querySelector("[data-title]");
const sellerEl = document.querySelector("[data-seller]");
const endsEl = document.querySelector("[data-ends]");
const descEl = document.querySelector("[data-description]");
const heroImg = document.querySelector("[data-hero-image]");
const bidCountEl = document.querySelector("[data-bid-count]");
const highestBidEl = document.querySelector("[data-highest-bid]");

const gallery = document.querySelector("[data-gallery]");
const bidsBody = document.querySelector("[data-bids]");

const bidForm = document.querySelector("[data-bid-form]");
const bidErr = document.querySelector("[data-bid-error]");
const bidOk = document.querySelector("[data-bid-success]");

// ---------- UI helpers ----------
function setFeedback(msg) {
  if (feedback) feedback.textContent = msg || "";
}

function setBidError(msg) {
  if (bidErr) bidErr.textContent = msg || "";
  if (bidOk) bidOk.textContent = "";
}

function setBidSuccess(msg) {
  if (bidOk) bidOk.textContent = msg || "";
  if (bidErr) bidErr.textContent = "";
}

// ---------- helpers ----------
function getIdFromQuery() {
  const url = new URL(location.href);
  const id = url.searchParams.get("id");
  return id ? id : "";
}

function renderGallery(media) {
  if (!gallery) return;

  gallery.innerHTML = "";

  if (!media || !Array.isArray(media) || media.length === 0) {
    gallery.innerHTML =
      '<div class="col-span-full text-sm text-gray-600">No images added.</div>';
    return;
  }

  const frag = document.createDocumentFragment();

  for (let i = 0; i < media.length; i++) {
    const m = media[i];
    if (!m || !m.url) continue;

    const img = document.createElement("img");
    img.src = m.url;

    if (m.alt) img.alt = m.alt;
    else img.alt = "Listing image";

    img.className = "w-full h-28 object-cover rounded border border-gray-200";
    frag.appendChild(img);
  }

  gallery.appendChild(frag);
}

function renderBids(bids) {
  if (!bidsBody) return;

  bidsBody.innerHTML = "";

  if (!bids || !Array.isArray(bids) || bids.length === 0) {
    // If your HTML now uses cards/grid, replace this with card markup.
    // This matches your current table version.
    bidsBody.innerHTML =
      '<tr><td class="p-3 text-gray-600" colspan="3">No bids yet.</td></tr>';

    if (highestBidEl) highestBidEl.textContent = "—";
    if (bidCountEl) bidCountEl.textContent = "0";
    return;
  }

  // Copy bids into a new array and sort newest first
  const sorted = [];
  for (let i = 0; i < bids.length; i++) sorted.push(bids[i]);

  sorted.sort((a, b) => {
    const aTime = a && a.created ? new Date(a.created).getTime() : 0;
    const bTime = b && b.created ? new Date(b.created).getTime() : 0;
    return bTime - aTime;
  });

  const frag = document.createDocumentFragment();

  // find highest bid while we loop
  let highest = 0;

  for (let i = 0; i < sorted.length; i++) {
    const b = sorted[i];

    let bidderName = "Unknown";
    if (b && b.bidder && b.bidder.name) bidderName = b.bidder.name;

    let amountText = "—";
    let amountNumber = 0;
    if (b && b.amount !== undefined && b.amount !== null) {
      amountNumber = Number(b.amount);
      amountText = String(b.amount);
    }

    let timeText = "—";
    if (b && b.created) timeText = fmtDate(b.created);

    if (amountNumber > highest) highest = amountNumber;

    const tr = document.createElement("tr");
    tr.className = "border-t border-gray-200";
    tr.innerHTML =
      '<td class="p-3 text-navy font-medium">' +
      bidderName +
      '</td>' +
      '<td class="p-3 text-navy font-bold">' +
      amountText +
      "</td>" +
      '<td class="p-3 text-gray-600">' +
      timeText +
      "</td>";

    frag.appendChild(tr);
  }

  bidsBody.appendChild(frag);

  if (highestBidEl) highestBidEl.textContent = highest > 0 ? String(highest) : "—";
  if (bidCountEl) bidCountEl.textContent = String(bids.length);
}

function disableBidFormForGuests() {
  const profile = getStoredProfile();
  const isAuthed = profile && profile.name ? true : false;

  if (!isAuthed && bidForm) {
    const btn = bidForm.querySelector("button");
    if (btn) {
      btn.setAttribute("disabled", "true");
      btn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }
}

// ---------- load listing ----------
async function load() {
  const id = getIdFromQuery();

  if (!id) {
    setFeedback("Missing listing id.");
    return;
  }

  setFeedback("Loading listing…");

  try {
    const result = await getListingWithBids(id);

    // result should be { data }
    const data = result && result.data ? result.data : null;

    // title
    if (titleEl) titleEl.textContent = data && data.title ? data.title : "Untitled";

    // seller
    if (sellerEl) {
      if (data && data.seller && data.seller.name) sellerEl.textContent = data.seller.name;
      else sellerEl.textContent = "—";
    }

    // endsAt
    if (endsEl) {
      if (data && data.endsAt) endsEl.textContent = fmtDate(data.endsAt);
      else endsEl.textContent = "—";
    }

    // description
    if (descEl) descEl.textContent = data && data.description ? data.description : "No description.";

    // hero image
    let img = "https://placehold.co/960x640?text=Biddy";
    let alt = "Listing";

    if (
      data &&
      data.media &&
      Array.isArray(data.media) &&
      data.media.length > 0 &&
      data.media[0] &&
      data.media[0].url
    ) {
      img = data.media[0].url;
    }

    if (
      data &&
      data.media &&
      Array.isArray(data.media) &&
      data.media.length > 0 &&
      data.media[0] &&
      data.media[0].alt
    ) {
      alt = data.media[0].alt;
    } else if (data && data.title) {
      alt = data.title;
    }

    if (heroImg) {
      heroImg.src = img;
      heroImg.alt = alt;
    }

    // gallery + bids
    const media = data && data.media ? data.media : [];
    const bids = data && data.bids ? data.bids : [];

    renderGallery(media);
    renderBids(bids);

    setFeedback("");
  } catch (e) {
    const msg = e && e.message ? e.message : "Failed to load listing";
    setFeedback(msg);
  }

  // guests cannot bid
  disableBidFormForGuests();
}

// ---------- bid submit ----------
if (bidForm) {
  bidForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setBidError("");
    setBidSuccess("");

    const id = getIdFromQuery();
    if (!id) {
      setBidError("Missing listing id.");
      return;
    }

    const fd = new FormData(bidForm);
    const amountRaw = fd.get("amount");
    const amount = Number(amountRaw);

    if (!isFinite(amount) || amount <= 0) {
      setBidError("Please enter a valid bid amount.");
      return;
    }

    try {
      await addBid(id, amount);
      setBidSuccess("Bid placed!");
      bidForm.reset();
      await load(); // reload bids + highest
    } catch (err) {
      const msg = err && err.message ? err.message : "Failed to place bid";
      setBidError(msg);
    }
  });
}

// ---------- init ----------
load();
