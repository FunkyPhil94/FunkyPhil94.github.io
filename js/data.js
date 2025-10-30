import { CSV_URL } from './config.js';
import { parseCSV, toIntMaybe, norm } from './utils.js';

export let headers = [];
export let rows = [];      // Originaldaten (Objekte)
export let filtered = [];  // Gefilterte Ansicht

export let sortKey = null, sortDir = 1; // 1=asc, -1=desc
export let page = 1, pageSize = 50;

export function setPageSize(size){
    pageSize = size;
}

export function setPage(newPage){
    page = newPage;
}

export function toggleSort(key){
    if (sortKey === key){
        sortDir *= -1;
    } else {
        sortKey = key;
        sortDir = 1;
    }
}

export function getSort(){
    return { sortKey, sortDir };
}

export function getPage(){
    return page;
}

export async function loadSheetData(){
  const arr = await parseCSV(CSV_URL);
  headers = arr[0];
  const idxAmount = headers.indexOf('Amount');
    const searchFields = ['Card Number','Last Name','Team','Position','Subset'];
    rows = arr.slice(1).map(r => {
    const o = {};
    headers.forEach((h,i)=> o[h] = (r[i] ?? '').toString());
    o._amount = idxAmount >= 0 ? toIntMaybe(r[idxAmount]) : NaN; // interne Ganzzahl
        o._search = searchFields
            .map(field => norm(o[field] ?? ''))
            .filter(Boolean)
            .join(' ');
        return o;
  });
  filtered = [...rows];
}

export function applyFilters({q, team, pos, subset}){
  const qTerms = norm(q).split(/\s+/).filter(Boolean);
  filtered = rows.filter(r => {
      const qhit = !qTerms.length || qTerms.every(t => r._search.includes(t));
      const thit = !team || r['Team'] === team;
    const phit = !pos || r['Position'] === pos;
    const shit = !subset || r['Subset'] === subset;
    return qhit && thit && phit && shit;
  });
  page = 1;
}

export function currentPageSlice(){
  let data = [...filtered];
  if (sortKey){
    data.sort((a,b)=>{
      const av = a[sortKey] || '';
      const bv = b[sortKey] || '';
      if (sortKey === 'Amount'){
        const an = isNaN(a._amount) ? -Infinity : a._amount;
        const bn = isNaN(b._amount) ? -Infinity : b._amount;
        return (an - bn) * sortDir;
      }
      return av.localeCompare(bv, 'de', {numeric:true, sensitivity:'base'}) * sortDir;
    });
  }
  const size = pageSize || data.length;
  const pages = Math.max(1, Math.ceil(data.length / size));
  page = Math.min(Math.max(1, page), pages);
  const start = (page-1) * size;
  return { pages, slice: data.slice(start, size ? start + size : undefined), total: data.length };
}
