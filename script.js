// ============================================================
//  AUTH  -  Passwort aendern: AUTH.PASSWORD
// ============================================================
const AUTH = {
  PASSWORD: "tester",
  TTL_MS:   43200000,
  KEY:      "nato_auth",
};
function nowMs(){ return Date.now(); }
function isAuthed(){
  try{
    const r=localStorage.getItem(AUTH.KEY); if(!r)return false;
    const o=JSON.parse(r);
    return!!o&&o.ok===true&&typeof o.until==="number"&&o.until>nowMs();
  }catch{return false;}
}
function setAuthed(){
  localStorage.setItem(AUTH.KEY,JSON.stringify({ok:true,until:nowMs()+AUTH.TTL_MS}));
}
function logout(){ localStorage.removeItem(AUTH.KEY); location.reload(); }
function loginWithPassword(pw){
  if(pw===AUTH.PASSWORD){ setAuthed(); return true; }
  return false;
}
function applyAuthUI(){
  const a=isAuthed();
  document.querySelectorAll("[data-requires-auth='true']").forEach(el=>{
    el.style.display=a?"":"none";
  });
  document.querySelectorAll("[data-disable-without-auth='true']").forEach(el=>{
    el.disabled=!a; el.style.opacity=a?"":"0.45";
    el.style.pointerEvents=a?"":"none";
    if(!a)el.setAttribute("title","Locked - login required");
  });
}
function requireAuthOrAlert(){
  if(isAuthed())return true;
  showToast("Bitte zuerst einloggen.","error");
  return false;
}

// ============================================================
//  TOAST  -  showToast("Text", "success"|"error"|"info", ms)
// ============================================================
function showToast(message,type,durationMs){
  type=type||"info";
  durationMs=(durationMs!==undefined)?durationMs:3500;
  let box=document.getElementById("_toastBox");
  if(!box){
    box=document.createElement("div");
    box.id="_toastBox";
    box.style.cssText="position:fixed;top:76px;right:1.4rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;pointer-events:none;";
    document.body.appendChild(box);
  }
  const S={
    success:"background:rgba(18,38,28,.97);border-color:rgba(76,175,125,.55);color:#6ee7b7",
    error:  "background:rgba(38,14,14,.97);border-color:rgba(224,82,82,.55);color:#fca5a5",
    info:   "background:rgba(28,26,12,.97);border-color:rgba(201,168,76,.55);color:#f0cc72",
  };
  const I={success:"\u2713",error:"\u2715",info:"\u2139"};
  const t=document.createElement("div");
  t.style.cssText="display:flex;align-items:center;gap:.75rem;padding:.85rem 1.1rem;border-radius:5px;"
    +"font-family:'Inter',sans-serif;font-size:.85rem;font-weight:500;"
    +"min-width:250px;max-width:360px;line-height:1.4;"
    +"box-shadow:0 6px 28px rgba(0,0,0,.55);border:1px solid transparent;"
    +(S[type]||S.info)+";pointer-events:auto;"
    +"opacity:0;transform:translateX(20px);transition:opacity .25s ease,transform .25s ease;";
  t.innerHTML='<span style="font-size:1rem;flex-shrink:0">'+(I[type]||I.info)+'</span>'
    +'<span style="flex:1">'+message+'</span>'
    +'<span style="margin-left:.5rem;cursor:pointer;opacity:.5;flex-shrink:0" onclick="this.parentElement.remove()">'+I.error+'</span>';
  box.appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    t.style.opacity="1"; t.style.transform="translateX(0)";
  }));
  if(durationMs>0){
    setTimeout(()=>{
      t.style.opacity="0"; t.style.transform="translateX(20px)";
      setTimeout(()=>{ if(t.parentElement)t.remove(); },280);
    },durationMs);
  }
}

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

function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function openModal(id)  { document.getElementById(id).classList.add("open"); }

(function protectRestrictedPages() {
  const restricted = ["influence.html", "roster.html"];
  const current = location.pathname.split("/").pop();

  if (restricted.includes(current) && !isAuthed()) {
    location.href = "index.html";
  }
})();
