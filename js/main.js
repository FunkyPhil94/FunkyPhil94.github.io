import { CSV_URL, REFRESH_MINUTES } from './config.js';
import { loadSheetData, applyFilters, setPageSize } from './data.js';
import { renderTable, renderStats, bindTableEvents } from './table.js';
import { renderCharts } from './charts.js';

const els = {
  viewTable: document.getElementById('view-table'),
  viewCharts: document.getElementById('view-charts'),
  tabTable: document.getElementById('tabTable'),
  tabCharts: document.getElementById('tabCharts'),
    themeToggle: document.getElementById('themeToggle'),
    q: document.getElementById('q'),
  team: document.getElementById('team'),
  pos: document.getElementById('pos'),
  subset: document.getElementById('subset'),
  reload: document.getElementById('reload'),
  pageSize: document.getElementById('pageSize'),
};

const THEME_KEY = 'cards-theme';

function getStoredTheme(){
    try{
        return localStorage.getItem(THEME_KEY);
    }catch(_err){
        return null;
    }
}

function setStoredTheme(value){
    try{
        if (value){
            localStorage.setItem(THEME_KEY, value);
        }else{
            localStorage.removeItem(THEME_KEY);
        }
    }catch(_err){
        /* ignore storage errors */
    }
}

function applyTheme(theme){
    const mode = theme === 'dark' ? 'dark' : 'light';
    document.body.dataset.theme = mode;
    if (els.themeToggle){
        const isDark = mode === 'dark';
        els.themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        els.themeToggle.textContent = isDark ? 'Heller Modus' : 'Dunkler Modus';
    }
}

function initTheme(){
    const stored = getStoredTheme();
    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const preferred = media && media.matches ? 'dark' : 'light';
    applyTheme(stored || preferred);
    if (media){
        const handleChange = (evt) => {
            const saved = getStoredTheme();
            if (!saved){
                applyTheme(evt.matches ? 'dark' : 'light');
            }
        };
        if (media.addEventListener){
            media.addEventListener('change', handleChange);
        } else if (media.addListener){
            media.addListener(handleChange);
        }
    }
    if (els.themeToggle){
        els.themeToggle.addEventListener('click', () => {
            const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            setStoredTheme(next);
            applyTheme(next);
        });
        els.themeToggle.addEventListener('contextmenu', (evt) => {
            evt.preventDefault();
            setStoredTheme(null);
            applyTheme(media && media.matches ? 'dark' : 'light');
        });
    }
}

function syncView(){
  const hash = location.hash || '#table';
  const isTable = hash === '#table';
  els.viewTable.hidden = !isTable;
  els.viewCharts.hidden = isTable;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  (isTable ? els.tabTable : els.tabCharts).classList.add('active');
  if (!isTable) renderCharts();
}

async function loadAndRender(){
  await loadSheetData();
  applyFilters({
    q: els.q.value,
    team: els.team.value,
    pos: els.pos.value,
    subset: els.subset.value
  });
  const { rebuildFilters } = bindTableEvents(()=>{
    applyFilters({ q: els.q.value, team: els.team.value, pos: els.pos.value, subset: els.subset.value });
    setPageSize((els.pageSize.value === 'Alle') ? 0 : parseInt(els.pageSize.value || '50',10));
    renderTable();
    rebuildFilters();
    renderStats();
    if (location.hash === '#charts') renderCharts();
  });
  setPageSize((els.pageSize.value === 'Alle') ? 0 : parseInt(els.pageSize.value || '50',10));
  renderTable();
  rebuildFilters();
  renderStats();
}

// Init
initTheme();
window.addEventListener('hashchange', syncView);
syncView();
if (els.reload) {
    els.reload.addEventListener('click', () => { void loadAndRender(); });
}
loadAndRender();
if (REFRESH_MINUTES > 0) setInterval(loadAndRender, REFRESH_MINUTES*60*1000);
