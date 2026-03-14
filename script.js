// ============================================================
// AUTH - via Cloudflare cookie
// ============================================================
const AUTH = {
  COOKIE_NAME: "nato_auth",
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function isAuthed() {
  return getCookie(AUTH.COOKIE_NAME) === "1";
}

function logout() {
  fetch("/cf-logout", { credentials: "include" })
    .finally(() => {
      location.reload();
    });
}

function loginWithPassword() {
  // Nicht mehr benötigt, da Auth jetzt über Cloudflare läuft
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
    else el.removeAttribute("title");
  });
}

function requireAuthOrAlert() {
  if (isAuthed()) return true;
  showToast("Bitte zuerst einloggen.", "error");
  return false;
}

// ============================================================
// CONSTANTS
// ============================================================
const AUTHORS = ["Pengwing", "Finnegan", "MonkeyGod", "GettoBird", "Kait_See", "Squirtle"];

// Attachments bucket (Supabase Storage)
const STORAGE_BUCKET = "attachments";

// Max attachments per item
const MAX_ATTACHMENTS = 3;

// ============================================================
// TOAST  -  showToast("Text", "success"|"error"|"info", ms)
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
// SUPABASE (Scoped Init)
// WICHTIG: CDN Script muss VOR script.js geladen werden:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ============================================================
(function initSupabaseScoped() {
  const SUPABASE_URL = "https://ztvimtaecxxtltpnxxrg.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0dmltdGFlY3h4dGx0cG54eHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjE4MzEsImV4cCI6MjA4ODEzNzgzMX0.W9c_Sy6dcNHwjr3hYSjBmh5vDyY1KBQbeYsw4wG5gGw";

  try {
    if (typeof supabase !== "undefined" && supabase?.createClient) {
      window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.warn("[script.js] Supabase library not loaded. Add CDN script tag before script.js.");
      window.sb = null;
    }
  } catch (e) {
    console.warn("[script.js] Supabase init failed:", e);
    window.sb = null;
  }
})();

function requireSupabase() {
  if (window.sb) return true;
  showToast("Supabase nicht geladen (CDN Script fehlt / Reihenfolge falsch).", "error", 6000);
  return false;
}

// ============================================================
// CONFIG + NAV
// ============================================================
const CONFIG = {
  guildName: "NATO [GBR]",
  pages: [
    { label: "Pinboard", href: "pinboard" },
    { label: "Guides", href: "guides" },
    { label: "Rules", href: "rules" },
    { label: "Power", href: "power" },
    { label: "Guild Events", href: "guild_events" },

    // only for logged-in users
    { label: "Member Roster", href: "roster", requiresAuth: true },
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
// DB HELPERS
// ============================================================
async function dbList(table, options = {}) {
  if (!requireSupabase()) return [];

  const sb = window.sb;
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

async function dbGet(table, id) {
  if (!requireSupabase()) return null;
  const sb = window.sb;

  const { data, error } = await sb.from(table).select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[dbGet]", table, error);
    showToast("DB Fehler beim Laden.", "error");
    return null;
  }
  return data || null;
}

async function dbUpsert(table, row) {
  if (!requireSupabase()) return { ok: false, data: null };
  const sb = window.sb;

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
  const sb = window.sb;

  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) {
    console.error("[dbDelete]", table, error);
    showToast("DB Fehler beim Löschen.", "error");
    return false;
  }
  return true;
}

// ============================================================
// STORAGE HELPERS (single upload) + MULTI (max 3)
// ============================================================
function safeFileExt(name = "") {
  const i = name.lastIndexOf(".");
  if (i === -1) return "";
  return name.slice(i + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Upload ONE file, returns meta
 * { attachment_path, attachment_type, attachment_name }
 */
async function uploadAttachment(table, file) {
  if (!requireSupabase()) return null;
  const sb = window.sb;
  if (!file) return null;

  const ts = Date.now();
  const cleanName = (file.name || "file").replace(/[^\w.\-]+/g, "_");
  const path = `${table}/${ts}-${cleanName}`;

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
    attachment_type: file.type || "",
    attachment_name: file.name || "",
  };
}

/**
 * Upload MULTIPLE files, up to MAX_ATTACHMENTS
 * returns [{attachment_path, attachment_type, attachment_name}, ...]
 */
async function uploadAttachments(table, files, max = MAX_ATTACHMENTS) {
  if (!requireSupabase()) return [];
  const list = Array.from(files || []).slice(0, max);
  const out = [];

  for (const f of list) {
    const meta = await uploadAttachment(table, f);
    if (!meta) return [];
    out.push(meta);
  }
  return out;
}

/** Returns a public URL (bucket must be public) */
function publicUrlForPath(path) {
  if (!window.sb || !path) return null;
  const { data } = window.sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

async function deleteAttachmentByPath(path) {
  if (!requireSupabase()) return false;
  const sb = window.sb;
  if (!path) return true;

  const { error } = await sb.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    console.warn("[deleteAttachmentByPath]", error);
    return false;
  }
  return true;
}

// ============================================================
// ATTACHMENT ARRAY HELPERS
// DB columns:
//  attachment_paths text[]
//  attachment_types text[]
//  attachment_names text[]
// ============================================================
function attachmentsFromRow(row) {
  const paths = Array.isArray(row?.attachment_paths) ? row.attachment_paths : [];
  const types = Array.isArray(row?.attachment_types) ? row.attachment_types : [];
  const names = Array.isArray(row?.attachment_names) ? row.attachment_names : [];

  return paths.slice(0, MAX_ATTACHMENTS).map((p, i) => ({
    attachment_path: p,
    attachment_type: types[i] || "",
    attachment_name: names[i] || "",
  }));
}

function attachmentsToRow(metas) {
  const m = Array.isArray(metas) ? metas.slice(0, MAX_ATTACHMENTS) : [];
  return {
    attachment_paths: m.map(x => x.attachment_path),
    attachment_types: m.map(x => x.attachment_type || ""),
    attachment_names: m.map(x => x.attachment_name || ""),
  };
}

function attachmentsHtml(row) {
  const metas = attachmentsFromRow(row);
  if (!metas.length) return "";

  const imgMeta = metas.find(x => (x.attachment_type || "").startsWith("image/"));
  let thumb = "";
  if (imgMeta) {
    const url = publicUrlForPath(imgMeta.attachment_path);
    if (url) thumb = `<img src="${url}" class="guide-thumb" alt="attachment"/>`;
  }

  const links = metas.map(m => {
    const url = publicUrlForPath(m.attachment_path);
    if (!url) return "";
    const name = m.attachment_name || "Attachment";
    const isImg = (m.attachment_type || "").startsWith("image/");
    return `<a href="${url}" target="_blank" class="guide-pdf-link">${isImg ? "🖼️" : "📄"} ${name}</a>`;
  }).filter(Boolean).join(" ");

  return `${thumb}${links ? `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin:.2rem 0 .1rem">${links}</div>` : ""}`;
}

function attachmentsViewHtml(row) {
  const metas = attachmentsFromRow(row);
  if (!metas.length) return "";

  return metas.map(m => {
    const url = publicUrlForPath(m.attachment_path);
    if (!url) return "";
    const name = m.attachment_name || "Attachment";
    const isImg = (m.attachment_type || "").startsWith("image/");
    return isImg
      ? `<img src="${url}" style="max-width:100%;border-radius:4px;border:1px solid var(--border);margin-top:.6rem" alt="${name}"/>`
      : `<div style="margin-top:.6rem"><a href="${url}" target="_blank" class="guide-pdf-link">📄 ${name}</a></div>`;
  }).join("");
}

// ============================================================
// GENERIC HELPERS
// ============================================================
function fmt(n) { return Number(n).toLocaleString(); }
function today() { return new Date().toISOString().split("T")[0]; }

function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }
function openModal(id) { document.getElementById(id)?.classList.add("open"); }

// ============================================================
// PROTECT RESTRICTED PAGES (Influence/Roster only for authed)
// ============================================================
(function protectRestrictedPages() {
  const restricted = ["roster", "roster.html"];
  const current = location.pathname.split("/").pop();
  if (restricted.includes(current) && !isAuthed()) {
    location.href = "index";
  }
})();
