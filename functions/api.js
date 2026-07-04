const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJW46i_k24_DZ0G7mjrUVYXzuh7UHl5faRMN_0X5UHof_dwQn4r1hO-fjUZa40NCLUXQ/exec';

export async function onRequestGet(context) {
  try {
    const incoming = new URL(context.request.url);
    const target = new URL(APPS_SCRIPT_URL);

    for (const [key, value] of incoming.searchParams.entries()) {
      target.searchParams.set(key, value);
    }

    const response = await fetch(target.toString(), {
      redirect: 'follow',
      headers: { 'Accept': 'application/json,text/plain,*/*' }
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*'
      }
    });
  } catch (err) {
    return Response.json({ ok: false, error: String(err && err.message ? err.message : err) }, {
      status: 500,
      headers: { 'cache-control': 'no-store' }
    });
  }
}
