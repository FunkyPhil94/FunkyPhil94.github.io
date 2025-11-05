// Minimaler Hash‑Router
export function initRouter({ views, onShow }){
    window.addEventListener('hashchange', () => show(location.hash, views, onShow));
}


export function show(hash, views, onShow){
    if (!views[hash]) hash = '#/tabelle';
    for (const [h, el] of Object.entries(views)){
        el.classList.toggle('hidden', h !== hash);
    }
    onShow && onShow(hash);
}