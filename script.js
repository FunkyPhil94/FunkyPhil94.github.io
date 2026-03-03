// ============================================================
//  AUTH  -  Passwort aendern: AUTH.PASSWORD
// ============================================================
const AUTH = {
  PASSWORD: "tester",
  TTL_MS: 12 * 60 * 60 * 1000, // 12h
  KEY: "nato_auth",
};

function nowMs() { return Date.now(); }

function isAuthed() {
  try {
    const r = localStorage.getItem(AUTH.KEY);
    if (!r) return false;
    const o = JSON.parse(r);
    return !!o && o.ok === true && typeof o.until === "number" && o.until > nowMs();
  } catch {
    return false;
  }
}

function setAuthed() {
  localStorage.setItem(AUTH.KEY, JSON.stringify({ ok: true, until: nowMs() + AUTH.TTL_MS }));
}

function logout() {
  localStorage.removeItem(AUTH.KEY);
  location.reload();
}

function loginWithPassword(pw) {
  if ((pw || "") === AUTH.PASSWORD) {
    setAuthed();
    return true;
  }
  return false;
}

function applyAuthUI() {
  const a = isAuthed();

  // hide completely if not authed
  document.querySelectorAll("[data-requires-auth='true']").forEach(el => {
    el.style.display = a ? "" : "none";
  });

  // disable if not authed
  document.querySelectorAll("[data-disable-without-auth='true']").forEach(el => {
    el.disabled = !a;
    el.style.opacity = a ? "" : "0.45";
    el.style.pointerEvents = a ? "" : "none";
    if (!a) el.setAttribute("title", "Locked - login required");
  });
}

function requireAuthOrAlert() {
  if (isAuthed()) return true;
  showToast("Bitte zuerst einloggen.", "error");
  return false;
}

// ============================================================
//  CONSTANTS
// ============================================================
const AUTHORS = ["Pingwing", "Finnegan", "MonkeyGod", "GettoBird", "Kait_See", "Squirtle"];

// Attachments bucket (Supabase Storage)
const STORAGE_BUCKET = "attachments";

// ============================================================
//  TOAST  -  showToast("Text", "success"|"error"|"info", ms)
// ============================================================
function showToast(message, type, durationMs) {
  type = type || "info";
  durationMs = (durationMs !== undefined) ? durationMs : 3500;

  let box = document.getElementById("_toastBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "_toastBox";
    box.style.cssText =
      "position:fixed;top:76px;right:1.4rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;pointer-events:none;";
    document.body.appendChild(box);
  }

  const S = {
    success: "background:rgba(18,38,28,.97);border-color:rgba(76,175,125,.55);color:#6ee7b7",
    error: "background:rgba(38,14,14,.97);border-color:rgba(224,82,82,.55);color:#fca5a5",
    info: "background:rgba(28,26,12,.97);border-color:rgba(201,168,76,.55);color:#f0cc72",
  };
  const I = { success: "✓", error: "✕", info: "ℹ" };

  const t = document.createElement("div");
  t.style.cssText =
    "display:flex;align-items:center;gap:.75rem;padding:.85rem 1.1rem;border-radius:5px;" +
    "font-family:'Inter',sans-serif;font-size:.85rem;font-weight:500;" +
    "min-width:250px;max-width:360px;line-height:1.4;" +
    "box-shadow:0 6px 28px rgba(0,0,0,.55);border:1px solid transparent;" +
    (S[type] || S.info) + ";pointer-events:auto;" +
    "opacity:0;transform:translateX(20px);transition:opacity .25s ease,transform .25s ease;";

  t.innerHTML =
    '<span style="font-size:1rem;flex-shrink:0">' + (I[type] || I.info) + "</span>" +
    '<span style="flex:1">' + message + "</span>" +
    '<span style="margin-left:.5rem;cursor:pointer;opacity:.5;flex-shrink:0" onclick="this.parentElement.remove()">✕</span>';

  box.appendChild(t);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateX(0)";
  }));

  if (durationMs > 0) {
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(20px)";
      setTimeout(() => { if (t.parentElement) t.remove(); }, 280);
    }, durationMs);
  }
}

// ============================================================
//  SUPABASE
//  WICHTIG: Der Supabase CDN Script muss VOR script.js geladen werden:
//  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ============================================================
const SUPABASE_URL = "https://ztvimtaecxxtltpnxxrg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0dmltdGFlY3h4dGx0cG54eHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjE4MzEsImV4cCI6MjA4ODEzNzgzMX0.W9c_Sy6dcNHwjr3hYSjBmh5vDyY1KBQbeYsw4wG5gGw";

let sb = null;
try {
  if (typeof supabase !== "undefined" && supabase?.createClient) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn("[script.js] Supabase library not loaded. Add CDN script tag before script.js.");
  }
} catch (e) {
  console.warn("[script.js] Supabase init failed:", e);
  sb = null;
}

function requireSupabase() {
  if (sb) return true;
  showToast("Supabase nicht geladen (CDN Script fehlt).", "error", 5000);
  return false;
}

// ============================================================
//  CONFIG + NAV
// ============================================================
const CONFIG = {
  guildName: "NATO [GBR]",
  pages: [
    { label: "Pinboard", href: "pinboard.html" },
    { label: "Guides", href: "guides.html" },
    { label: "Events", href: "events.html" },
    { label: "Relic", href: "relic.html" },
    { label: "Heroes", href: "heroes.html" },
    { label: "Rules", href: "rules.html" },

    // only for logged-in users
    { label: "Influence Tracker", href: "influence.html", requiresAuth: true },
    { label: "Member Roster", href: "roster.html", requiresAuth: true },
  ],
};

function buildNav(currentPage) {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  const logoEl = nav.querySelector(".nav-logo");
  if (logoEl) logoEl.textContent = CONFIG.guildName;

  const authed = isAuthed();

  const ul = nav.querySelector("ul");
  if (!ul) return;

  const visiblePages = CONFIG.pages.filter(p => !p.requiresAuth || authed);

  ul.innerHTML = visiblePages.map(p => {
    const active = currentPage === p.href ? ' class="active"' : "";
    return `<li><a href="${p.href}"${active}>${p.label}</a></li>`;
  }).join("");

  // Optional Logout button
  let btn = nav.querySelector(".nav-logout");
  if (!btn) {
    btn = document.createElement("button");
    btn.className = "nav-logout";
    btn.type = "button";
    btn.textContent = "Logout";
    btn.onclick = logout;
    nav.appendChild(btn);
  }
  btn.style.display = authed ? "" : "none";
}

// ============================================================
//  DB HELPERS (Punkt 4)
//  Pages only define: const TABLE = "events" (etc.)
// ============================================================

/**
 * List rows from a table.
 * @param {string} table
 * @param {object} options
 * @param {string} options.orderBy - column name
 * @param {boolean} options.ascending
 * @param {number|null} options.limit
 * @param {object|null} options.filters - {col: value}
 */
async function dbList(table, options = {}) {
  if (!requireSupabase()) return [];

  const orderBy = options.orderBy || "date";
  const ascending = options.ascending ?? false;
  const limit = options.limit ?? null;
  const filters = options.filters || null;

  let q = sb.from(table).select("*").order(orderBy, { ascending });

  if (filters) {
    for (const [col, val] of Object.entries(filters)) {
      if (val === undefined || val === null) continue;
      q = q.eq(col, val);
    }
  }
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) {
    console.error("[dbList]", table, error);
    showToast("DB Fehler beim Laden.", "error");
    return [];
  }
  return data || [];
}

/** Get one row by id */
async function dbGet(table, id) {
  if (!requireSupabase()) return null;
  const { data, error } = await sb.from(table).select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[dbGet]", table, error);
    showToast("DB Fehler beim Laden.", "error");
    return null;
  }
  return data || null;
}

/**
 * Upsert row (insert if no id, update if id).
 * Expects your table has "id" as PK.
 */
async function dbUpsert(table, row) {
  if (!requireSupabase()) return { ok: false, data: null };

  const { data, error } = await sb.from(table).upsert(row).select().maybeSingle();
  if (error) {
    console.error("[dbUpsert]", table, error);
    showToast("DB Fehler beim Speichern.", "error");
    return { ok: false, data: null };
  }
  return { ok: true, data };
}

async function dbDelete(table, id) {
  if (!requireSupabase()) return false;
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) {
    console.error("[dbDelete]", table, error);
    showToast("DB Fehler beim Löschen.", "error");
    return false;
  }
  return true;
}

// ============================================================
//  STORAGE HELPERS (Attachments)
//  Best practice: store file in Storage, save only path/meta in DB.
// ============================================================

function safeFileExt(name = "") {
  const i = name.lastIndexOf(".");
  if (i === -1) return "";
  return name.slice(i + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Uploads a File to Storage bucket, under a folder per table.
 * @param {string} table - e.g. "guides" | "events" | ...
 * @param {File} file
 * @returns {object|null} { attachment_path, attachment_type, attachment_name }
 */
async function uploadAttachment(table, file) {
  if (!requireSupabase()) return null;
  if (!file) return null;

  const ext = safeFileExt(file.name);
  const ts = Date.now();
  const cleanName = (file.name || "file").replace(/[^\w.\-]+/g, "_");
  const path = `${table}/${ts}-${cleanName}${ext && !cleanName.endsWith("." + ext) ? "" : ""}`;

  // upload
  const { error } = await sb.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error("[uploadAttachment]", error);
    showToast("Upload fehlgeschlagen.", "error");
    return null;
  }

  return {
    attachment_path: path,
    attachment_type: file.type || null,
    attachment_name: file.name || null,
  };
}

/** Returns a public URL (bucket must be public) */
function publicUrlForPath(path) {
  if (!sb || !path) return null;
  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

async function deleteAttachmentByPath(path) {
  if (!requireSupabase()) return false;
  if (!path) return true;

  const { error } = await sb.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    console.warn("[deleteAttachmentByPath]", error);
    // not fatal
    return false;
  }
  return true;
}

// ============================================================
//  HELPERS
// ============================================================
function fmt(n) { return Number(n).toLocaleString(); }
function today() { return new Date().toISOString().split("T")[0]; }
function nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }
function openModal(id) { document.getElementById(id)?.classList.add("open"); }

// ============================================================
//  PROTECT RESTRICTED PAGES (Influence/Roster only for authed)
// ============================================================
(function protectRestrictedPages() {
  const restricted = ["influence.html", "roster.html"];
  const current = location.pathname.split("/").pop();

  if (restricted.includes(current) && !isAuthed()) {
    location.href = "index.html";
  }
})();
