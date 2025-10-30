//import { headers, filtered, currentPageSlice } from './data.js';
//import * as data from './data.js';
import {
  headers,
  filtered,
  currentPageSlice,
  toggleSort,
  getSort,
  getPage,
  setPage,
} from './data.js';

const els = {
  q: document.getElementById('q'),
  team: document.getElementById('team'),
  pos: document.getElementById('pos'),
  subset: document.getElementById('subset'),
  reset: document.getElementById('reset'),
  reload: document.getElementById('reload'),
  thead: document.getElementById('thead'),
  tbody: document.getElementById('tbody'),
  count: document.getElementById('count'),
  statTotal: document.getElementById('stat-total'),
  statAmount: document.getElementById('stat-amount'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  pageInfo: document.getElementById('pageInfo'),
  pageSize: document.getElementById('pageSize'),
};

function setOptions(id, values){
  const sel = els[id];
  const cur = sel.value;
  sel.innerHTML = '<option value=\"\">Alle</option>' +
    Array.from(values).sort((a,b)=>a.localeCompare(b)).map(v => `<option>${v}</option>`).join('');
  if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
}

function rebuildFilters(){
  setOptions('team', new Set(filtered.map(x => x['Team']).filter(Boolean)));
  setOptions('pos', new Set(filtered.map(x => x['Position']).filter(Boolean)));
  setOptions('subset', new Set(filtered.map(x => x['Subset']).filter(Boolean)));
}

export function renderStats(){
  const total = filtered.length;
  const sumAmount = filtered.reduce((acc, r) => acc + (isNaN(r._amount) ? 0 : r._amount), 0);
  els.statTotal.textContent = `Gesamt: ${total.toLocaleString('de-DE')} Karten`;
  els.statAmount.textContent = `Summe Amount: ${sumAmount.toLocaleString('de-DE')}`;
}

export function renderTable(){
  const { pages, slice, total } = currentPageSlice();

  // Header mit Sort-Clicks
  els.thead.innerHTML = '';
  const { sortKey, sortDir } = getSort();
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.title = 'Klicken zum Sortieren';
    th.addEventListener('click', () => {
      //if (data.sortKey === h) data.sortDir *= -1; else { data.sortKey = h; data.sortDir = 1; }
      toggleSort(h);
      renderTable();
    });
    //if (data.sortKey === h){ th.textContent += data.sortDir === 1 ? ' ▲' : ' ▼'; }
    if (sortKey === h){ th.textContent += sortDir === 1 ? ' ▲' : ' ▼'; }
    els.thead.appendChild(th);
  });

  // Body
  els.tbody.innerHTML = '';
  const frag = document.createDocumentFragment();
  slice.forEach(r => {
    const tr = document.createElement('tr');
    headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = (h === 'Amount' && !isNaN(r._amount))
        ? r._amount.toLocaleString('de-DE')
        : (r[h] ?? '');
      tr.appendChild(td);
    });
    frag.appendChild(tr);
  });
  els.tbody.appendChild(frag);

  // Footer/Info
  const currentPage = getPage();
  els.count.textContent = `${slice.length} angezeigt · ${filtered.length} gefiltert · ${total} gesamt`;
  //els.pageInfo.textContent = `Seite ${data.page}/${pages}`;
  //els.prev.disabled = data.page <= 1;
  //els.next.disabled = data.page >= pages;
  els.pageInfo.textContent = `Seite ${currentPage}/${pages}`;
  els.prev.disabled = currentPage <= 1;
  els.next.disabled = currentPage >= pages;
}

export function bindTableEvents(onReload){
  els.q.addEventListener('input', () => onReload());
  ['team','pos','subset','pageSize'].forEach(id => els[id].addEventListener('change', () => onReload()));
  els.reset.addEventListener('click', () => {
    els.q.value = ''; els.team.value=''; els.pos.value=''; els.subset.value='';
    onReload();
  });
  //els.prev.addEventListener('click', () => { data.page = Math.max(1, data.page-1); renderTable(); });
  //els.next.addEventListener('click', () => { data.page = data.page+1; renderTable(); });
  els.prev.addEventListener('click', () => { setPage(Math.max(1, getPage()-1)); renderTable(); });
  els.next.addEventListener('click', () => { setPage(getPage()+1); renderTable(); });
  return { els, rebuildFilters };
}
