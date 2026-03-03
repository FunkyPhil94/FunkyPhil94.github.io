// ============================================================
//  GUILD DATA  –  Edit this section to update your website
// ============================================================

const MEMBERS = [
  { name: "GuildMaster",  cls: "Paladin",    power: "4,800,000", rank: "leader"  },
  { name: "SilverArrow",  cls: "Archer",     power: "3,200,000", rank: "officer" },
  { name: "IronFrost",    cls: "Mage",       power: "2,900,000", rank: "officer" },
  { name: "DarkBlade",    cls: "Assassin",   power: "2,100,000", rank: "member"  },
  { name: "StormBreaker", cls: "Warrior",    power: "1,850,000", rank: "member"  },
  { name: "LunaWitch",    cls: "Shaman",     power: "1,600,000", rank: "member"  },
];

const RULES = [
  {
    title: "Respectful Conduct",
    text:  "All members treat each other with respect. Insults, discrimination or toxic behaviour will not be tolerated."
  },
  {
    title: "Active Participation",
    text:  "Members are expected to participate regularly in guild activities. Anyone inactive for more than 14 days without notice may be removed."
  },
  {
    title: "Communication",
    text:  "Important announcements are shared in the guild chat. All members are encouraged to check the chat on a regular basis."
  },
  {
    title: "Raids & Events",
    text:  "Members signed up for raids must show up on time. Last-minute cancellations should be communicated at least 30 minutes in advance."
  },
  {
    title: "Guild Bank & Resources",
    text:  "Resources withdrawn from the guild bank should be used fairly and returned or replaced whenever possible."
  },
];

const CONTACTS = [
  {
    label:   "Guild Leadership",
    name:    "GuildMaster",
    role:    "⚔ Leader",
    ingame:  "GuildMaster",
    discord: "GuildMaster#0001",
    link:    "#"
  },
  {
    label:   "Officer",
    name:    "SilverArrow",
    role:    "🛡 Officer",
    ingame:  "SilverArrow",
    discord: "SilverArrow#0042",
    link:    "#"
  },
  {
    label:   "Officer",
    name:    "IronFrost",
    role:    "🛡 Officer",
    ingame:  "IronFrost",
    discord: "IronFrost#0077",
    link:    "#"
  },
  {
    label:   "Recruitment",
    name:    "Apply to Join",
    role:    "📩 Recruitment",
    ingame:  null,
    discord: null,
    extra:   'Message an officer in-game or join our <a href="#">Discord server</a>.'
  },
];

// ============================================================
//  RENDERING  –  No need to edit below this line
// ============================================================

const RANK_LABEL = { leader: "Leader", officer: "Officer", member: "Member" };
const RANK_CLASS = { leader: "rank-leader", officer: "rank-officer", member: "rank-member" };

let members = [...MEMBERS];

// ── Members ──────────────────────────────────────────────────
function renderMembers() {
  document.getElementById("membersGrid").innerHTML = members
    .map(m => `
      <div class="member-card">
        <div class="member-rank ${RANK_CLASS[m.rank]}">${RANK_LABEL[m.rank]}</div>
        <div class="member-name">${m.name}</div>
        <div class="member-class">${m.cls}</div>
        <div class="member-power">Combat Power: <span>${m.power}</span></div>
      </div>`)
    .join("");

  document.getElementById("memberCount").textContent = members.length;
}

// ── Rules ────────────────────────────────────────────────────
function renderRules() {
  document.getElementById("rulesList").innerHTML = RULES
    .map((r, i) => `
      <div class="rule-item">
        <div class="rule-num">${String(i + 1).padStart(2, "0")}</div>
        <div class="rule-content">
          <h4>${r.title}</h4>
          <p>${r.text}</p>
        </div>
      </div>`)
    .join("");

  document.getElementById("ruleCount").textContent = RULES.length;
}

// ── Contacts ─────────────────────────────────────────────────
function renderContacts() {
  document.getElementById("contactGrid").innerHTML = CONTACTS
    .map(c => {
      const infoLines = [];
      if (c.ingame)  infoLines.push(`In-game: <strong>/whisper ${c.ingame}</strong>`);
      if (c.discord) infoLines.push(`Discord: <a href="${c.link}">${c.discord}</a>`);
      if (c.extra)   infoLines.push(c.extra);
      return `
        <div class="contact-card">
          <div class="c-label">${c.label}</div>
          <div class="c-name">${c.name}</div>
          <div class="c-role">${c.role}</div>
          ${infoLines.map(l => `<div class="c-info">${l}</div>`).join("")}
        </div>`;
    })
    .join("");
}

// ── Modal ────────────────────────────────────────────────────
function openModal()  { document.getElementById("modalOverlay").classList.add("open"); }
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  ["inputName", "inputClass", "inputPower"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("inputRank").value = "member";
}

function addMember() {
  const name  = document.getElementById("inputName").value.trim();
  const cls   = document.getElementById("inputClass").value.trim();
  const power = document.getElementById("inputPower").value.trim();
  const rank  = document.getElementById("inputRank").value;
  if (!name) { document.getElementById("inputName").focus(); return; }
  members.push({ name, cls: cls || "Unknown", power: power || "–", rank });
  renderMembers();
  closeModal();
}

// Close modal when clicking outside
document.getElementById("modalOverlay").addEventListener("click", function (e) {
  if (e.target === this) closeModal();
});

// ── Init ─────────────────────────────────────────────────────
renderMembers();
renderRules();
renderContacts();
