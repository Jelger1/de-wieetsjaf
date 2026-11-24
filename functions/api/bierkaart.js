// Cloudflare Pages Function: GET /api/bierkaart
// Instellen in Cloudflare (Pages > Settings > Variables and Secrets):
//   UNTAPPD_API_EMAIL, UNTAPPD_API_TOKEN (secret, read-only token), UNTAPPD_MENU_ID
//   optioneel: UNTAPPD_CACHE_SECONDEN (standaard 900), UNTAPPD_TIMEOUT_MS (8000)
// Optioneel KV-namespace koppelen als binding 'BIERKAART_KV' voor de 'laatst goed'-terugval over deploys heen.
import { bierkaart, geheugenCache } from '../../api/lib/untappd.mjs';

const geheugen = geheugenCache();

function kvCache(kv) {
  return {
    async get(k) { return kv.get(k, 'json'); },
    async put(k, v, ttl) { await kv.put(k, JSON.stringify(v), { expirationTtl: Math.max(60, ttl) }); },
  };
}

export async function onRequestGet({ env }) {
  const cache = env.BIERKAART_KV ? kvCache(env.BIERKAART_KV) : geheugen;
  const data = await bierkaart({ env, cache });
  const ok = data.status === 'ok' || data.status === 'verouderd';
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': ok ? 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export function onRequest() {
  return new Response('Methode niet toegestaan', { status: 405, headers: { Allow: 'GET' } });
}
