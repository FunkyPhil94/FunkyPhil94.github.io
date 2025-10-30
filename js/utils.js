export function parseCSV(url){
  return new Promise((resolve, reject) => {
    const sep = url.includes('?') ? '&' : '?';
    Papa.parse(url + sep + 'v=' + Date.now(), {
      download: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data),
      error: (err) => reject(err)
    });
  });
}

// Amount immer auf Ganzzahl bringen
export function toIntMaybe(v){
  if (v == null) return NaN;
  const s = String(v).replace(/\./g,'').replace(',', '.'); // 1.234,5 -> 1234.5
  const n = parseFloat(s);
  return isNaN(n) ? NaN : Math.round(n);
}

// Suche robust: case/diacritics-insensitive
export function norm(val){
  return (val ?? '').toString().toLowerCase().trim()
    .normalize('NFD').replace(/\p{Diacritic}/gu,'');
}

export function groupCount(arr, key){
  const m = new Map();
  arr.forEach(o => {
    const k = (o[key] || '').trim() || '(leer)';
    m.set(k, (m.get(k)||0)+1);
  });
  return [...m.entries()].sort((a,b)=> b[1]-a[1]);
}

export function groupSum(arr, key){
  const m = new Map();
  arr.forEach(o => {
    const k = (o[key] || '').trim() || '(leer)';
    const v = isNaN(o._amount) ? 0 : o._amount; // Integer
    m.set(k, (m.get(k)||0)+v);
  });
  return [...m.entries()].sort((a,b)=> b[1]-a[1]);
}
