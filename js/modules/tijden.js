// Gedeelde logica voor openingstijden. Werkt in de browser én in Node (bouwstap).
// Geen afhankelijkheden. Alle tijden in lokale tijd Europe/Amsterdam.

export const DAGEN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
export const DAGNAMEN = { ma: 'Maandag', di: 'Dinsdag', wo: 'Woensdag', do: 'Donderdag', vr: 'Vrijdag', za: 'Zaterdag', zo: 'Zondag' };
export const WEEKVOLGORDE = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

/** Huidige datum/tijd in Kerkrade, los van de tijdzone van de bezoeker. */
export function nuInKerkrade(datum = new Date()) {
  const delen = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
  }).formatToParts(datum).reduce((a, p) => ((a[p.type] = p.value), a), {});
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[delen.weekday];
  return {
    iso: `${delen.year}-${delen.month}-${delen.day}`,
    dag: DAGEN[wd],
    minuten: Number(delen.hour) * 60 + Number(delen.minute),
  };
}

export const fmtTijd = (t) => (t === '00:00' ? '00.00' : t.replace(':', '.'));

export const naarMinuten = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Tijden voor een bepaalde dag, rekening houdend met afwijkende dagen. */
export function tijdenVoor(data, soort, iso, dag) {
  const afw = (data.afwijkend || []).find((a) => a.actief !== false && a.datum === iso);
  if (afw) return { tijden: afw[soort] ?? null, label: afw.label || null };
  return { tijden: data[soort]?.[dag] ?? null, label: null };
}

/** Geeft status: { open, tekst } voor 'zaak' of 'keuken'. */
export function status(data, soort = 'zaak', datum = new Date()) {
  const nu = nuInKerkrade(datum);
  const { tijden, label } = tijdenVoor(data, soort, nu.iso, nu.dag);
  if (!tijden) return { open: false, vandaag: null, label, tekst: soort === 'zaak' ? 'Vandaag gesloten' : 'Keuken vandaag gesloten' };
  const open = naarMinuten(tijden[0]);
  let dicht = naarMinuten(tijden[1]);
  if (dicht <= open) dicht += 24 * 60; // over middernacht
  const isOpen = nu.minuten >= open && nu.minuten < dicht;
  const sluit = tijden[1] === '00:00' ? 'middernacht' : `${fmtTijd(tijden[1])} uur`;
  let tekst;
  if (isOpen) tekst = soort === 'zaak' ? `Nu open tot ${sluit}` : `Keuken open tot ${fmtTijd(tijden[1])} uur`;
  else if (nu.minuten < open) tekst = soort === 'zaak' ? `Vandaag open vanaf ${fmtTijd(tijden[0])} uur` : `Keuken vandaag vanaf ${fmtTijd(tijden[0])} uur`;
  else tekst = soort === 'zaak' ? 'Nu gesloten' : 'Keuken is gesloten';
  return { open: isOpen, vandaag: tijden, label, tekst };
}

export const fmtBereik = (t) => (t ? `${fmtTijd(t[0])} – ${fmtTijd(t[1])} uur` : 'Gesloten');

/** schema.org OpeningHoursSpecification */
export function schemaOpeningHours(data) {
  const map = { ma: 'Monday', di: 'Tuesday', wo: 'Wednesday', do: 'Thursday', vr: 'Friday', za: 'Saturday', zo: 'Sunday' };
  return WEEKVOLGORDE.filter((d) => data.zaak[d]).map((d) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${map[d]}`,
    opens: data.zaak[d][0],
    closes: data.zaak[d][1] === '00:00' ? '23:59' : data.zaak[d][1],
  }));
}

/** Eerste maandag van een maand, als ISO-datum. */
export function eersteMaandag(jaar, maand /* 1-12 */) {
  const d = new Date(Date.UTC(jaar, maand - 1, 1));
  const offset = (8 - d.getUTCDay()) % 7; // 1 = maandag
  d.setUTCDate(1 + offset);
  return d.toISOString().slice(0, 10);
}

/** Volgende n eerste maandagen vanaf vandaag (inclusief vandaag). */
export function volgendeEersteMaandagen(vandaagIso, n = 3, uitzonderingen = []) {
  let [j, m] = vandaagIso.split('-').map(Number);
  const uit = [];
  for (let i = 0; uit.length < n && i < 24; i++) {
    const iso = eersteMaandag(j, m);
    if (iso >= vandaagIso && !uitzonderingen.includes(iso)) uit.push(iso);
    m += 1; if (m > 12) { m = 1; j += 1; }
  }
  return uit;
}
