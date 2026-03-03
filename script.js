// ============================================================
//  AUTH (simple password gate for GitHub Pages / static sites)
//  NOTE: Not secure against someone who inspects your source.
// ============================================================
const AUTH = {
  // IMPORTANT:
  // Put the SHA-256 HEX of your password here (NOT the plain password).
  // Generate it in the browser console with:
  // (async()=>{const pw=prompt("PW"); const b=await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  // console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""));})()
  PASSWORD_HASH_HEX: "9bba5c53a0545e0c80184b946153c9f58387e3bd1d4ee35740f29ac2e718b019",

  // How long login stays valid (ms). Default: 12 hours.
  TTL_MS: 12 * 60 * 60 * 1000,

  // Storage key
  KEY: "nato_auth",
};

function nowMs() { return Date.now(); }

function isAuthed() {
  try {
    const raw = localStorage.getItem(AUTH.KEY);
    if (!raw) return false;
    const obj = JSON.parse(raw);
    return !!obj && obj.ok === true && typeof obj.until === "number" && obj.until > nowMs();
  } catch {
    return false;
  }
}

function setAuthed() {
  localStorage.setItem(
    AUTH.KEY,
    JSON.stringify({ ok: true, until: nowMs() + AUTH.TTL_MS })
  );
}

function logout() {
  localStorage.removeItem(AUTH.KEY);
  location.reload();
}

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function loginWithPassword(pw) {
  const hash = await sha256Hex(pw);
  if (hash === AUTH.PASSWORD_HASH_HEX) {
    setAuthed();
    return true;
  }
  return false;
}

// Disable/hide UI elements that require auth
function applyAuthUI() {
  const authed = isAuthed();

  // Hide-only elements
  document.querySelectorAll("[data-requires-auth='true']").forEach(el => {
    el.style.display = authed ? "" : "none";
  });

  // Disable-only elements
  document.querySelectorAll("[data-disable-without-auth='true']").forEach(el => {
    el.disabled = !authed;
    el.style.opacity = authed ? "" : "0.45";
    el.style.pointerEvents = authed ? "" : "none";
    if (!authed) el.setAttribute("title", "Locked – login required");
  });
}

// Optional helper: block actions in JS
function requireAuthOrAlert() {
  if (isAuthed()) return true;
  alert("Locked. Please login on the Dashboard (index.html) to unlock this feature.");
  return false;
}

// ============================================================
//  CONFIG  –  Change guild name and pages here
// ============================================================
const CONFIG = {
  guildName: localStorage.getItem("nato_guildName") || "NATO [GBR]",
  pages: [
    { label: "Dashboard",         href: "index.html"     },
    { label: "Pinboard",          href: "pinboard.html"  },
    { label: "Guides",            href: "guides.html"    },
    { label: "Influence Tracker", href: "influence.html" },
    { label: "Member Roster",     href: "roster.html"    },
  ]
};

// ============================================================
//  NAV  –  call buildNav("pagefile.html") on each page
// ============================================================
function buildNav(currentPage) {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  const logoEl = nav.querySelector(".nav-logo");
  if (logoEl) logoEl.textContent = CONFIG.guildName;

  const authed = isAuthed();

  const ul = nav.querySelector("ul");
  if (ul) {
    ul.innerHTML = CONFIG.pages
      .filter(p => {
        // Hide these pages if not logged in
        if (!authed && (
          p.href === "influence.html" ||
          p.href === "roster.html"
        )) return false;

        return true;
      })
      .map(p => {
        const active = currentPage === p.href ? ' class="active"' : '';
        return `<li><a href="${p.href}"${active}>${p.label}</a></li>`;
      })
      .join("");
  }

  // Logout button
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
//  DATA STORE  –  persists in localStorage
// ============================================================
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem("nato_" + key)) || []; }
    catch { return []; }
  },
  set(key, value) {
    localStorage.setItem("nato_" + key, JSON.stringify(value));
  },
};

// ── Seed default data if empty ────────────────────────────
if (!localStorage.getItem("nato_members")) {
  DB.set("members", [
    { id: 1, name: "CommanderX",   rank: "officer", class: "Paladin",   power: "4,800,000", joined: "2024-01-10", warnings: { mythic: 0, castle: 0 }, notes: "" },
    { id: 2, name: "SilverArrow",  rank: "officer", class: "Archer",    power: "3,200,000", joined: "2024-02-14", warnings: { mythic: 1, castle: 0 }, notes: "1st warning issued 2024-06" },
    { id: 3, name: "IronFrost",    rank: "officer", class: "Mage",      power: "2,900,000", joined: "2024-03-05", warnings: { mythic: 0, castle: 0 }, notes: "" },
    { id: 4, name: "DarkBlade",    rank: "member",  class: "Assassin",  power: "2,100,000", joined: "2024-04-20", warnings: { mythic: 0, castle: 1 }, notes: "" },
    { id: 5, name: "StormBreaker", rank: "member",  class: "Warrior",   power: "1,850,000", joined: "2024-05-11", warnings: { mythic: 2, castle: 0 }, notes: "On probation" },
    { id: 6, name: "LunaWitch",    rank: "member",  class: "Shaman",    power: "1,600,000", joined: "2024-06-03", warnings: { mythic: 0, castle: 0 }, notes: "" },
  ]);
}

if (!localStorage.getItem("nato_influence")) {
  DB.set("influence", [
    { id: 1, name: "CommanderX",   week: "2025-W01", influence: 420000, dungeons: 12, events: 5 },
    { id: 2, name: "SilverArrow",  week: "2025-W01", influence: 310000, dungeons: 9,  events: 4 },
    { id: 3, name: "IronFrost",    week: "2025-W01", influence: 290000, dungeons: 11, events: 3 },
    { id: 4, name: "DarkBlade",    week: "2025-W01", influence: 210000, dungeons: 7,  events: 2 },
    { id: 5, name: "StormBreaker", week: "2025-W01", influence: 180000, dungeons: 6,  events: 4 },
    { id: 6, name: "LunaWitch",    week: "2025-W01", influence: 160000, dungeons: 8,  events: 3 },
  ]);
}

if (!localStorage.getItem("nato_pins")) {
  DB.set("pins", [
    { id: 1, title: "Welcome to the NATO [GBR] Officer Portal", body: "This pinboard is for internal announcements only. Keep it professional.", author: "CommanderX", date: "2025-03-01", priority: "high" },
    { id: 2, title: "Weekly Raid Schedule – March 2025", body: "Raids are scheduled every Wednesday and Saturday at 20:00 UTC. Please confirm attendance in advance.", author: "CommanderX", date: "2025-03-02", priority: "normal" },
  ]);
}

if (!localStorage.getItem("nato_guides")) {
  DB.set("guides", [
    { id: 1, title: "Mythic Plunder – Boss Strategy Guide",   category: "Mythic Plunder",     body: "Focus DPS on the left flank first. Tank holds the boss at the south wall. Healers rotate every 30s. Phase 2 starts at 50% HP – everyone stack centre.", author: "CommanderX", date: "2025-02-15" },
    { id: 2, title: "Castle Crashers GE – Quick Clear",       category: "Castle Crashers GE", body: "Split into two groups of 3. Group A takes the east wing, Group B west. Rendezvous at the throne room after both wings are cleared. Use speed buffs in the final corridor.", author: "SilverArrow", date: "2025-02-20" },
    { id: 3, title: "General Influence Farming Tips",         category: "General",            body: "Complete daily dungeons first as they give the highest base influence. Prioritise event participation over free-roam grinding. Always use double-influence boosts during guild events.", author: "IronFrost", date: "2025-03-01" },
  ]);
}

// ============================================================
//  HELPERS
// ============================================================
function fmt(n)      { return Number(n).toLocaleString(); }
function today()     { return new Date().toISOString().split("T")[0]; }
function nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

// ============================================================
//  GLOBAL TOAST – Aufruf: showToast("Text", "success"|"error"|"info")
// ============================================================
(function initToast() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  document.body.appendChild(container);
})();

function showToast(message, type = "info", durationMs = 3500) {
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const container = document.getElementById("toastContainer");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || "ℹ"}</span>
    <span class="toast-msg">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);

  // Animation starten (kleines Timeout damit der Browser den initialen Zustand rendert)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  // Automatisch ausblenden
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, durationMs);
}

function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function openModal(id)  { document.getElementById(id).classList.add("open"); }

(function protectRestrictedPages() {
  const restricted = ["influence.html", "roster.html"];
  const current = location.pathname.split("/").pop();

  if (restricted.includes(current) && !isAuthed()) {
    location.href = "index.html";
  }
})();
