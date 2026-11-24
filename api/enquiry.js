const {validate} = require('../lib/enquiry.cjs');
module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ok:false});
  }
  const host = request.headers.host;
  const local = process.env.PODS_LOCAL_PREVIEW === '1' && /^(127\.0\.0\.1|localhost):\d+$/.test(host || '');
  if (!request.headers['content-type']?.startsWith('application/json') ||
      (request.headers.origin && request.headers.origin !== `${local ? 'http' : 'https'}://${host}`))
    return response.status(400).json({ok:false,code:'invalid'});
  let data;
  try {
    const raw = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    if (!raw || Buffer.byteLength(raw) > 32000) throw new Error();
    data = validate(JSON.parse(raw));
  } catch { /* Same public response for malformed JSON and invalid fields. */ }
  if (!data) return response.status(400).json({ok:false,code:'invalid'});
  // Preview never inherits the production destination. No live fallback.
  const production = process.env.VERCEL_ENV === 'production';
  const endpoint = production ? process.env.PODS_ENQUIRY_ENDPOINT : process.env.PODS_TEST_ENQUIRY_ENDPOINT;
  const secret = production ? process.env.PODS_ENQUIRY_SECRET : process.env.PODS_TEST_ENQUIRY_SECRET;
  const loopback = local && /^http:\/\/127\.0\.0\.1:\d+\/sheet$/.test(endpoint || '');
  if (!secret || (!loopback && !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint || '')))
    return response.status(503).json({ok:false});
  try {
    const upstream = await fetch(endpoint, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...data,shared_secret:secret}), signal:AbortSignal.timeout(15000)
    });
    const result = await upstream.json();
    if (upstream.ok && result.ok === true && result.submission_id === data.submission_id)
      return response.status(200).json({ok:true,submission_id:data.submission_id});
    if (result.code === 'invalid') return response.status(400).json({ok:false,code:'invalid'});
  } catch { /* Never log enquiry data or expose provider errors. */ }
  return response.status(503).json({ok:false});
};
