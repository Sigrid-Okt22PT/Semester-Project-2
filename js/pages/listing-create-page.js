import { logout, requireAuth } from "../script.js";
import { createListing } from "../listings.js";

// must be logged in to create a listing
requireAuth("../index.html");

// ---------- logout ----------
const logoutLinks = document.querySelectorAll("[data-logout]");
logoutLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
});

// ---------- DOM ----------
const form = document.querySelector("[data-create-form]");
const errEl = document.querySelector("[data-error]");
const okEl = document.querySelector("[data-success]");

// ---------- UI helpers ----------
function setError(msg) {
  if (errEl) errEl.textContent = msg || "";
  if (okEl) okEl.textContent = "";
}

function setSuccess(msg) {
  if (okEl) okEl.textContent = msg || "";
  if (errEl) errEl.textContent = "";
}

// ---------- date helper ----------
function toISOFromDatetimeLocal(value) {
  // datetime-local has no timezone, so we treat it as local time
  // and convert it into an ISO string
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

// ---------- submit ----------
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fd = new FormData(form);

    // read values safely
    const title = String(fd.get("title") || "").trim();
    const endsAtLocal = String(fd.get("endsAt") || "").trim();
    const description = String(fd.get("description") || "").trim();

    if (!title) {
      setError("Title is required.");
      return;
    }

    // convert endsAt to ISO
    const endsAt = toISOFromDatetimeLocal(endsAtLocal);
    if (!endsAt) {
      setError("Please choose a valid deadline date/time.");
      return;
    }

    // deadline must be in the future
    if (new Date(endsAt).getTime() <= Date.now()) {
      setError("Deadline must be in the future.");
      return;
    }

    // build media array (optional)
    const media = [];
    const mediaKeys = ["media1", "media2", "media3", "media4"];

    for (let i = 0; i < mediaKeys.length; i++) {
      const key = mediaKeys[i];
      const url = String(fd.get(key) || "").trim();

      if (url) {
        media.push({
          url: url,
          alt: title ? title : "Listing image",
        });
      }
    }

    // build payload
    const payload = {
      title: title,
      endsAt: endsAt,
    };

    if (description) payload.description = description;
    if (media.length > 0) payload.media = media;

    try {
      const result = await createListing(payload);

      // result should contain { data }
      if (!result || !result.data || !result.data.id) {
        setError("Listing created, but could not find listing id.");
        return;
      }

      setSuccess("Listing created! Redirecting…");

      setTimeout(() => {
        window.location.href =
          "./details.html?id=" + encodeURIComponent(result.data.id);
      }, 700);
    } catch (err) {
      const msg = err && err.message ? err.message : "Failed to create listing";
      setError(msg);
    }
  });
}
