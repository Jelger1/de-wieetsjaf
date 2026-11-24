// Minimale, veilige markdown-weergave voor juridische teksten (koppen, alinea's, opsommingen, vet, links).
import { esc } from './html.mjs';

const inline = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, '<a href="$2">$1</a>');

export function md(tekst, { kopNiveauStart = 2 } = {}) {
  const uit = [];
  let lijst = null;
  const sluitLijst = () => { if (lijst) { uit.push(`<ul>${lijst.join('')}</ul>`); lijst = null; } };
  for (const ruw of tekst.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    const r = ruw.trim();
    if (!r) { sluitLijst(); continue; }
    const kop = r.match(/^(#{1,4})\s+(.*)$/);
    if (kop) { sluitLijst(); const n = Math.min(6, kop[1].length - 1 + kopNiveauStart); uit.push(`<h${n}>${inline(kop[2])}</h${n}>`); continue; }
    if (r.startsWith('- ')) { lijst ??= []; lijst.push(`<li>${inline(r.slice(2))}</li>`); continue; }
    sluitLijst();
    uit.push(`<p>${inline(r)}</p>`);
  }
  sluitLijst();
  return uit.join('\n');
}
