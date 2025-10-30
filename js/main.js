import { CSV_URL, REFRESH_MINUTES } from './config.js';
//import { loadSheetData, applyFilters } from './data.js';
//import * as data from './data.js';
import { loadSheetData, applyFilters, setPageSize } from './data.js';
import { renderTable, renderStats, bindTableEvents } from './table.js';
import { renderCharts } from './charts.js';

const els = {
  viewTable: document.getElementById('view-table'),
  viewCharts: document.getElementById('view-charts'),
  tabTable: document.getElementById('tabTable'),
  tabCharts: document.getElementById('tabCharts'),
  q: document.getElementById('q'),
  team: document.getElementById('team'),
  pos: document.getElementById('pos'),
  subset: document.getElementById('subset'),
  reload: document.getElementById('reload'),
  pageSize: document.getElementById('pageSize'),
};

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
    //data.pageSize = (els.pageSize.value === 'Alle') ? 0 : parseInt(els.pageSize.value || '50',10);
    setPageSize((els.pageSize.value === 'Alle') ? 0 : parseInt(els.pageSize.value || '50',10));
    renderTable();
    rebuildFilters();
    renderStats();
    if (location.hash === '#charts') renderCharts();
  });
  //data.pageSize = (els.pageSize.value === 'Alle') ? 0 : parseInt(els.pageSize.value || '50',10);
  setPageSize((els.pageSize.value === 'Alle') ? 0 : parseInt(els.pageSize.value || '50',10));
  renderTable();
  rebuildFilters();
  renderStats();
}

// Init
window.addEventListener('hashchange', syncView);
syncView();
loadAndRender();
if (REFRESH_MINUTES > 0) setInterval(loadAndRender, REFRESH_MINUTES*60*1000);
