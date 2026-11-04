const SHEETS_ENDPOINT = process.env.PODS_ENQUIRY_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycby_ISValPfxCv4wr6un20aAxVZTVZWZ9eF5dDCmkRuW5CO5feZTQFcl8OVoWwBnvSFSZw/exec';

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ok: false});
  }
  if (!request.headers['content-type']?.startsWith('application/json')
      || (request.headers.origin && request.headers.origin !== `https://${request.headers.host}`)) {
    return response.status(400).json({ok: false, code: 'invalid'});
  }
  const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
  if (!body || Buffer.byteLength(body) > 32000) {
    return response.status(400).json({ok: false, code: 'invalid'});
  }
  try {
    const upstream = await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body,
      signal: AbortSignal.timeout(15000)
    });
    const result = await upstream.json();
    if (upstream.ok && result.ok === true) return response.status(200).json({ok: true});
    if (result.code === 'invalid') return response.status(400).json({ok: false, code: 'invalid'});
  } catch {
    // Do not log enquiry details or expose Google errors to visitors.
  }
  return response.status(503).json({ok: false});
};
