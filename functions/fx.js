export async function onRequestGet(context) {
  const fallback = { ok: true, rate: 145, source: 'fallback estimate', updatedAt: new Date().toISOString() };

  try {
    const url = 'https://open.er-api.com/v6/latest/USD';
    const response = await fetch(url, { headers: { 'accept': 'application/json' } });
    if (!response.ok) {
      return Response.json(fallback, { headers: { 'cache-control': 'no-store' } });
    }

    const data = await response.json();
    const rate = data && data.rates && data.rates.JPY;
    if (!rate) {
      return Response.json(fallback, { headers: { 'cache-control': 'no-store' } });
    }

    return Response.json({
      ok: true,
      base: 'USD',
      quote: 'JPY',
      rate,
      source: 'open.er-api.com',
      updatedAt: data.time_last_update_utc || new Date().toISOString()
    }, {
      headers: {
        'cache-control': 'public, max-age=1800',
        'access-control-allow-origin': '*'
      }
    });
  } catch (err) {
    return Response.json(fallback, { headers: { 'cache-control': 'no-store' } });
  }
}
