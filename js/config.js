// Leest de centrale configuratie die de bouwstap als JSON in elke pagina zet
// (bron: data/integraties.json en data/openingstijden.json). Geen geheimen.
let cache;
export function leesConfig() {
  if (cache) return cache;
  try {
    cache = JSON.parse(document.getElementById('site-config')?.textContent || '{}');
  } catch {
    cache = {};
  }
  return cache;
}
