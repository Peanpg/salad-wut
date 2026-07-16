/**
 * Smart Hydroponics Tracker Backend
 * Deploy as Web app: Execute as Me, Who has access: Anyone
 */
const SPREADSHEET_ID = '1PLn_mokbdzBa7zN91im94LZlzUTqAr7SEiBtNOlQM9g';
const DRIVE_FOLDER_ID = '1Gen2eZE9R7wYvHlhmb6k_ikYm5NyYAow';
const LOTS_SHEET = 'Lots';
const LOGS_SHEET = 'DailyLogs';

function doGet() {
  try {
    ensureStructure_();
    return json_({
      status: 'success',
      lots: readCollection_(LOTS_SHEET),
      logs: readCollection_(LOGS_SHEET),
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    return json_({ status: 'error', message: String(error && error.message || error) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    ensureStructure_();
    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(body);

    if (payload.action !== 'syncAll') {
      throw new Error('Unsupported action: ' + (payload.action || 'missing'));
    }

    const lots = normalizeAndUploadPhotos_(Array.isArray(payload.lots) ? payload.lots : [], 'lot');
    const logs = normalizeAndUploadPhotos_(Array.isArray(payload.logs) ? payload.logs : [], 'log');

    writeCollection_(LOTS_SHEET, lots);
    writeCollection_(LOGS_SHEET, logs);

    return json_({ status: 'success', lots: lots, logs: logs, savedAt: new Date().toISOString() });
  } catch (error) {
    return json_({ status: 'error', message: String(error && error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function ensureStructure_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  [LOTS_SHEET, LOGS_SHEET].forEach(function(name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 3).setValues([['id', 'updated_at', 'data_json']]);
      sheet.setFrozenRows(1);
    }
  });
}

function readCollection_(sheetName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 3).getValues().map(function(row) {
    try { return JSON.parse(row[2]); } catch (_) { return null; }
  }).filter(Boolean);
}

function writeCollection_(sheetName, items) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }
  if (!items.length) return;
  const now = new Date();
  const rows = items.map(function(item, index) {
    return [String(item.id || (sheetName + '-' + (index + 1))), now, JSON.stringify(item)];
  });
  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
}

function normalizeAndUploadPhotos_(items, prefix) {
  return items.map(function(item) {
    const cloned = JSON.parse(JSON.stringify(item));
    if (Array.isArray(cloned.locationPhotos)) {
      cloned.locationPhotos = cloned.locationPhotos.map(function(value, i) {
        return saveDataUrlIfNeeded_(value, prefix + '-location-' + i);
      });
    }
    if (Array.isArray(cloned.dailyPhotos)) {
      cloned.dailyPhotos = cloned.dailyPhotos.map(function(value, i) {
        return saveDataUrlIfNeeded_(value, prefix + '-daily-' + i);
      });
    }
    return cloned;
  });
}

function saveDataUrlIfNeeded_(value, namePrefix) {
  if (typeof value !== 'string' || value.indexOf('data:image/') !== 0) return value;
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return value;

  const mimeType = match[1];
  const extension = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes, mimeType, namePrefix + '-' + Date.now() + '.' + extension);
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const file = folder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (_) {
    // Workspace บางองค์กรปิดการแชร์สาธารณะไว้ ไฟล์ยังคงถูกบันทึกในโฟลเดอร์ที่กำหนด
  }

  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200';
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
