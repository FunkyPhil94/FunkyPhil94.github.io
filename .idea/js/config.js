// Konfiguration deiner Tabelle (aus deinem Link)
export const SHEET_KEY = '1Gyb7-BRvcBCYwcs_VKWZSmtsL6zCshiwcTZYSr973eg';
export const GID = '522258962';


// Direkter Bearbeitungs‑Link (neuer Tab)
export const EDIT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_KEY}/edit?gid=${GID}#gid=${GID}`;


// Read‑only Einbettung (erfordert oft: Datei → Im Web veröffentlichen…)
export const EMBED_URL = `https://docs.google.com/spreadsheets/d/${SHEET_KEY}/pubhtml?gid=${GID}&single=true&widget=true&headers=false`;