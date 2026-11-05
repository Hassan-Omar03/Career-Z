// The language for a first-time visitor, from the region of their device (its time zone), then
// from the browser's language. No outside service is called. A VPN or a device set to another
// time zone gives another language, so the visitor can always change it.
const BY_ZONE = {
  ur: ['Asia/Karachi'],
  ar: ['Asia/Riyadh', 'Asia/Dubai', 'Asia/Qatar', 'Asia/Kuwait', 'Asia/Bahrain', 'Asia/Muscat', 'Asia/Baghdad', 'Asia/Amman', 'Asia/Beirut', 'Asia/Damascus', 'Asia/Aden', 'Asia/Gaza', 'Asia/Hebron', 'Africa/Cairo', 'Africa/Tripoli', 'Africa/Algiers', 'Africa/Casablanca', 'Africa/Tunis', 'Africa/Khartoum'],
  fa: ['Asia/Tehran', 'Asia/Kabul'],
  hi: ['Asia/Kolkata', 'Asia/Calcutta'],
  bn: ['Asia/Dhaka'],
  zh: ['Asia/Shanghai', 'Asia/Urumqi', 'Asia/Taipei', 'Asia/Hong_Kong', 'Asia/Macau'],
  tr: ['Europe/Istanbul', 'Asia/Istanbul'],
  ru: ['Europe/Moscow', 'Asia/Yekaterinburg', 'Asia/Novosibirsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Vladivostok', 'Europe/Minsk'],
  fr: ['Europe/Paris', 'Europe/Monaco', 'Africa/Dakar', 'Africa/Abidjan'],
  de: ['Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich'],
  es: ['Europe/Madrid', 'America/Mexico_City', 'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Caracas', 'America/Argentina/Buenos_Aires', 'America/Buenos_Aires'],
  pt: ['Europe/Lisbon', 'America/Sao_Paulo', 'Africa/Luanda', 'Africa/Maputo'],
  ms: ['Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Brunei'],
  id: ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura']
};
const ZONE_LANGUAGE = Object.fromEntries(Object.entries(BY_ZONE).flatMap(([code, zones]) => zones.map((z) => [z, code])));

export function detectLanguage(zone, browserLanguages) {
  let timeZone = zone;
  if (timeZone === undefined) { try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { timeZone = ''; } }
  if (ZONE_LANGUAGE[timeZone]) return ZONE_LANGUAGE[timeZone];
  const known = new Set([...Object.keys(BY_ZONE), 'en']);
  const list = browserLanguages || (typeof navigator !== 'undefined' ? navigator.languages : []) || [];
  for (const item of list) {
    const base = String(item).toLowerCase().split('-')[0];
    if (known.has(base)) return base;
  }
  return 'en';
}
