// Einbettung + Edit‑Link
export function initTableEmbed({ EDIT_URL, EMBED_URL }){
    const sheetEmbed = document.getElementById('sheetEmbed');
    const editLink = document.getElementById('editLink');
    const refresh = document.getElementById('refreshEmbed');


    editLink.href = EDIT_URL;
    if (!sheetEmbed.src) sheetEmbed.src = EMBED_URL;
    refresh.addEventListener('click', () => {
        sheetEmbed.src = EMBED_URL + `&t=${Date.now()}`; // Cache‑Buster
    }, { once: true });
}