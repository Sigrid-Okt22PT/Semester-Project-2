import { setupAuthUI } from "../ui/auth-ui.js";
setupAuthUI();

import { logout, fmtDate, getStoredProfile } from "../script.js";
import {
  getListingWithBids,
  addBid,
  updateListing,
  deleteListing,
} from "../listings.js";

// Logout links (works on every page that has data-logout)
const logoutLinks = document.querySelectorAll("[data-logout]");
for (let i = 0; i < logoutLinks.length; i++) {
  logoutLinks[i].addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

// DOM elements
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

// Owner actions (edit/delete)
const ownerActions = document.querySelector("[data-owner-actions]");
const editToggleBtn = document.querySelector("[data-edit-toggle]");
const deleteBtn = document.querySelector("[data-delete]");

const editForm = document.querySelector("[data-edit-form]");
const editErr = document.querySelector("[data-edit-error]");
const editOk = document.querySelector("[data-edit-success]");

// Image modal
const imageModal = document.querySelector("#imageModal");
const modalImage = document.querySelector("#modalImage");
const closeModal = document.querySelector("#closeModal");

// Simple UI helpers
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

function setEditError(msg) {
  if (editErr) editErr.textContent = msg || "";
  if (editOk) editOk.textContent = "";
}

function setEditSuccess(msg) {
  if (editOk) editOk.textContent = msg || "";
  if (editErr) editErr.textContent = "";
}

// Helper functions

function getIdFromQuery() {
  const url = new URL(location.href);
  const id = url.searchParams.get("id");
  return id ? id : "";
}

function showOwnerUI(show) {
  if (!ownerActions) return;

  if (show) ownerActions.classList.remove("hidden");
  else ownerActions.classList.add("hidden");
}

function toggleEditForm() {
  if (!editForm) return;
  editForm.classList.toggle("hidden");
}

function disableBidFormForGuests() {
  const profile = getStoredProfile();
  const isLoggedIn = profile && profile.name ? true : false;

  if (!isLoggedIn && bidForm) {
    const btn = bidForm.querySelector("button");
    if (btn) {
      btn.setAttribute("disabled", "true");
      btn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }
}

// Render gallery images
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

    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className =
      "block rounded-xl overflow-hidden border border-gray-200 hover:border-yellow transition";

    // make it accessible (keyboard + screen readers)
    const alt = m.alt ? m.alt : "Listing image";

    thumb.innerHTML =
      '<img src="' +
      m.url +
      '" alt="' +
      alt +
      '" class="w-full h-24 object-cover">';

    // click -> open modal
    thumb.addEventListener("click", () => {
      openImageModal(m.url, alt);
    });

    frag.appendChild(thumb);
  }

  gallery.appendChild(frag);
}

function openImageModal(url, alt) {
  if (!imageModal || !modalImage) return;

  modalImage.src = url;
  modalImage.alt = alt || "Large image";

  imageModal.classList.remove("hidden");
  imageModal.classList.add("flex");
}

function closeImageModal() {
  if (!imageModal) return;

  imageModal.classList.add("hidden");
  imageModal.classList.remove("flex");
}

// Render bids (table)
function renderBids(bids) {
  if (!bidsBody) return;

  bidsBody.innerHTML = "";

  if (!bids || !Array.isArray(bids) || bids.length === 0) {
    bidsBody.innerHTML =
      '<tr><td class="p-3 text-gray-600" colspan="3">No bids yet.</td></tr>';

    if (highestBidEl) highestBidEl.textContent = "—";
    if (bidCountEl) bidCountEl.textContent = "0";
    return;
  }

  // Copy bids and sort newest first
  const sorted = [];
  for (let i = 0; i < bids.length; i++) sorted.push(bids[i]);

  sorted.sort((a, b) => {
    const aTime = a && a.created ? new Date(a.created).getTime() : 0;
    const bTime = b && b.created ? new Date(b.created).getTime() : 0;
    return bTime - aTime;
  });

  const frag = document.createDocumentFragment();
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
      '<td class="p-3 text-navy">' +
      bidderName +
      "</td>" +
      '<td class="p-3 text-navy ">' +
      amountText +
      "</td>" +
      '<td class="p-3 text-gray-600">' +
      timeText +
      "</td>";

    frag.appendChild(tr);
  }

  bidsBody.appendChild(frag);

  if (highestBidEl)
    highestBidEl.textContent = highest > 0 ? String(highest) : "—";
  if (bidCountEl) bidCountEl.textContent = String(bids.length);
}

// Load listing + show owner actions
async function load() {
  const id = getIdFromQuery();
  if (!id) {
    setFeedback("Missing listing id.");
    return;
  }

  setFeedback("Loading listing…");

  try {
    const result = await getListingWithBids(id);
    const data = result && result.data ? result.data : null;

    // Title
    if (titleEl) {
      titleEl.textContent = data && data.title ? data.title : "Untitled";
    }

    // Seller
    let sellerName = "";
    if (data && data.seller && data.seller.name) sellerName = data.seller.name;

    if (sellerEl) sellerEl.textContent = sellerName ? sellerName : "—";

    // EndsAt
    if (endsEl) {
      if (data && data.endsAt) endsEl.textContent = fmtDate(data.endsAt);
      else endsEl.textContent = "—";
    }

    // Description
    if (descEl) {
      descEl.textContent =
        data && data.description ? data.description : "No description.";
    }

    // Hero image
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

    // Owner check
    const me = getStoredProfile();
    const myName = me && me.name ? me.name : "";
    const isOwner = myName && sellerName && myName === sellerName;

    showOwnerUI(isOwner);

    // Prefill edit form if owner
    if (isOwner && editForm) {
      const titleInput = editForm.querySelector('input[name="title"]');
      const descInput = editForm.querySelector('textarea[name="description"]');

      if (titleInput) titleInput.value = data && data.title ? data.title : "";
      if (descInput)
        descInput.value = data && data.description ? data.description : "";
    }

    // Gallery + bids
    const media = data && data.media ? data.media : [];
    const bids = data && data.bids ? data.bids : [];

    renderGallery(media);
    renderBids(bids);

    setFeedback("");
  } catch (err) {
    const msg = err && err.message ? err.message : "Failed to load listing";
    setFeedback(msg);
  }

  disableBidFormForGuests();
}

// Bid submit
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
    const amount = Number(fd.get("amount"));

    if (!isFinite(amount) || amount <= 0) {
      setBidError("Please enter a valid bid amount.");
      return;
    }

    try {
      await addBid(id, amount);
      setBidSuccess("Bid placed!");
      bidForm.reset();
      await load();
    } catch (err) {
      const msg = err && err.message ? err.message : "Failed to place bid";
      setBidError(msg);
    }
  });
}

// Edit toggle button
if (editToggleBtn) {
  editToggleBtn.addEventListener("click", () => {
    toggleEditForm();
  });
}

// Edit form submit (UPDATE listing)
if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    const id = getIdFromQuery();
    if (!id) {
      setEditError("Missing listing id.");
      return;
    }

    const fd = new FormData(editForm);
    const newTitle = String(fd.get("title") || "").trim();
    const newDesc = String(fd.get("description") || "").trim();

    if (!newTitle) {
      setEditError("Title is required.");
      return;
    }

    try {
      await updateListing(id, {
        title: newTitle,
        description: newDesc ? newDesc : undefined,
      });

      setEditSuccess("Listing updated!");
      await load(); // reload page with new data
    } catch (err) {
      const msg = err && err.message ? err.message : "Failed to update listing";
      setEditError(msg);
    }
  });
}

// Delete button (DELETE listing)
if (deleteBtn) {
  deleteBtn.addEventListener("click", async () => {
    const id = getIdFromQuery();
    if (!id) return;

    const ok = confirm("Are you sure you want to delete this listing?");
    if (!ok) return;

    try {
      await deleteListing(id);
      alert("Listing deleted.");
      window.location.href = "../index.html";
    } catch (err) {
      const msg = err && err.message ? err.message : "Failed to delete listing";
      alert(msg);
    }
  });
}

// Close modal button
if (closeModal) {
  closeModal.addEventListener("click", () => {
    closeImageModal();
  });
}

// Close modal when clicking the background
if (imageModal) {
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) closeImageModal();
  });
}

// Close modal with Esc key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeImageModal();
});

// Initial load
load();
