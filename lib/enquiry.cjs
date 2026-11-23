const limits = {
  name:120, first_name:120, last_name:120, email:254, company:160, brief:5000,
  hq_country:100, phone:50, company_website:254, additional_information:5000,
  initial_team_size:100, target_timing:100, operating_model:100, pod_config:8000,
  requested_samples:500, founder_call_requested:20, landing_page:2000,
  submission_page:2000, lead_source:200, cta_source:200, page:100,
  submitted_at:40, submission_id:80, contact_url:500
};
function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const data = {};
  for (const [key,value] of Object.entries(input)) {
    const max = (Object.hasOwn(limits,key) ? limits[key] : 0) || (/^utm_[a-z0-9_]{1,50}$/.test(key) ? 500 : 0);
    if (!max) continue;
    if (typeof value !== 'string' || value.length > max) return null;
    data[key] = value.trim();
  }
  data.name = data.name || [data.first_name,data.last_name].filter(Boolean).join(' ');
  if (!data.name || data.name.length > 120 || !data.brief || data.contact_url ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '') ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submission_id || '')) return null;
  data.received_at = new Date().toISOString();
  return data;
}
module.exports = {validate};
