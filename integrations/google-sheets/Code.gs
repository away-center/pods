// Install only in a NEW test Apps Script project first. See docs/ENHANCEMENTS.md.
// Script properties: SHEET_ID, SHEET_NAME, SHARED_SECRET. Never publish secrets in Git.
function doPost(event) {
  var reply = function(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); };
  var lock;
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = event && event.postData && event.postData.contents;
    if (!raw || raw.length > 40000) return reply({ok:false,code:'invalid'});
    var data = JSON.parse(raw);
    if (!props.getProperty('SHARED_SECRET') || data.shared_secret !== props.getProperty('SHARED_SECRET')) return reply({ok:false});
    if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 120 ||
        typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
        typeof data.brief !== 'string' || !data.brief.trim() || data.brief.length > 5000 || data.contact_url ||
        !/^\+[1-9]\d{0,3}$/.test(data.phone_country_code || '') ||
        !/^[0-9() .-]{6,25}$/.test(data.phone || '') ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submission_id || '')) return reply({ok:false,code:'invalid'});
    delete data.shared_secret;
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return reply({ok:false});
    var sheet = SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName(props.getProperty('SHEET_NAME'));
    if (!sheet) return reply({ok:false});
    var columns = ['submission_id','received_at','name','email','company','brief','landing_page','submission_page','cta_source','utm_source','utm_medium','utm_campaign','utm_term','utm_content','calendar_status','lead_status','details_json','phone_country_code','phone'];
    if (sheet.getLastRow() === 0) sheet.appendRow(columns);
    // Refuse a mismatched/old schema; never shift columns in an existing production sheet.
    var headers = sheet.getRange(1,1,1,columns.length).getValues()[0];
    if (JSON.stringify(headers) !== JSON.stringify(columns)) return reply({ok:false});
    var count = sheet.getLastRow();
    if (count > 1) {
      var ids = sheet.getRange(2,1,count-1,1).getValues();
      if (ids.some(function(row) { return row[0] === data.submission_id; }))
        return reply({ok:true,submission_id:data.submission_id});
    }
    data.received_at = new Date().toISOString();
    data.calendar_status = 'not_booked'; // No booking webhook is configured.
    data.lead_status = 'new';
    data.details_json = JSON.stringify(data);
    function cell(value) {
      var str = value == null ? '' : String(value);
      // Keep user input as text, never as a spreadsheet formula.
      return /^[\s]*[=+@-]/.test(str) ? "'" + str : str;
    }
    sheet.appendRow(columns.map(function(key) { return cell(data[key]); }));
    SpreadsheetApp.flush();
    return reply({ok:true,submission_id:data.submission_id});
  } catch (_) { return reply({ok:false}); }
  finally { if (lock && lock.hasLock()) lock.releaseLock(); }
}
