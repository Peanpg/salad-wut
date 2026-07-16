/**
 * Smart Hydroponics Tracker Backend
 * Deploy as Web app: Execute as Me, Who has access: Anyone
 */
const SPREADSHEET_ID = '1PLn_mokbdzBa7zN91im94LZlzUTqAr7SEiBtNOlQM9g';
const LOT_ROOT_FOLDER_ID = '1SG36rSPctUX_kSJ2QARSD-Gha7gcbI6d';
const DAILY_ROOT_FOLDER_ID = '10x7hq8tR9k6YpAnm26xViERK32XYXBNZ';
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
    return json_({ status: 'error', message: errorMessage_(error) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(body);

    if (payload.action === 'uploadPhoto') {
      return json_(uploadPhoto_(payload));
    }

    if (payload.action !== 'syncAll') {
      throw new Error('Unsupported action: ' + (payload.action || 'missing'));
    }

    ensureStructure_();
    const lots = normalizeLotPhotos_(Array.isArray(payload.lots) ? payload.lots : []);
    const logs = normalizeDailyPhotos_(Array.isArray(payload.logs) ? payload.logs : []);

    writeCollection_(LOTS_SHEET, lots);
    writeCollection_(LOGS_SHEET, logs);

    return json_({ status: 'success', lots: lots, logs: logs, savedAt: new Date().toISOString() });
  } catch (error) {
    return json_({ status: 'error', message: errorMessage_(error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/** Run this once in Apps Script editor, approve permissions, then deploy a new version. */
function authorizeSetup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const lotRoot = DriveApp.getFolderById(LOT_ROOT_FOLDER_ID);
  const dailyRoot = DriveApp.getFolderById(DAILY_ROOT_FOLDER_ID);
  ensureStructure_();
  console.log('Authorized: ' + ss.getName() + ' / ' + lotRoot.getName() + ' / ' + dailyRoot.getName());
  return 'Authorization completed';
}

function uploadPhoto_(payload) {
  const photoType = String(payload.photoType || '');
  const dataUrl = String(payload.dataUrl || '');
  if (dataUrl.indexOf('data:image/') !== 0) throw new Error('ไม่พบข้อมูลรูปภาพที่ถูกต้อง');

  let rootFolder;
  let subFolderName;
  if (photoType === 'lot') {
    rootFolder = DriveApp.getFolderById(LOT_ROOT_FOLDER_ID);
    subFolderName = sanitizeName_(payload.lotFolderName || 'lot-unknown');
  } else if (photoType === 'daily') {
    rootFolder = DriveApp.getFolderById(DAILY_ROOT_FOLDER_ID);
    subFolderName = sanitizeName_(payload.dateFolderName || formatThaiDateFolder_(new Date()));
  } else {
    throw new Error('photoType ต้องเป็น lot หรือ daily');
  }

  const targetFolder = getOrCreateChildFolder_(rootFolder, subFolderName);
  const result = saveDataUrlToFolder_(dataUrl, targetFolder, payload.originalName || 'photo.jpg');
  return {
    status: 'success',
    url: result.url,
    fileId: result.fileId,
    folderId: targetFolder.getId(),
    folderName: subFolderName
  };
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

function normalizeLotPhotos_(items) {
  return items.map(function(item) {
    const cloned = JSON.parse(JSON.stringify(item));
    if (!Array.isArray(cloned.locationPhotos)) return cloned;
    const root = DriveApp.getFolderById(LOT_ROOT_FOLDER_ID);
    const folder = getOrCreateChildFolder_(root, sanitizeName_('lot' + (cloned.sequence || cloned.id || 'unknown')));
    cloned.locationPhotos = cloned.locationPhotos.map(function(value, i) {
      if (typeof value !== 'string' || value.indexOf('data:image/') !== 0) return value;
      return saveDataUrlToFolder_(value, folder, 'location-' + (i + 1) + '.jpg').url;
    });
    return cloned;
  });
}

function normalizeDailyPhotos_(items) {
  return items.map(function(item) {
    const cloned = JSON.parse(JSON.stringify(item));
    if (!Array.isArray(cloned.dailyPhotos)) return cloned;
    const root = DriveApp.getFolderById(DAILY_ROOT_FOLDER_ID);
    const date = cloned.date ? new Date(cloned.date + 'T00:00:00') : new Date();
    const folder = getOrCreateChildFolder_(root, formatThaiDateFolder_(date));
    cloned.dailyPhotos = cloned.dailyPhotos.map(function(value, i) {
      if (typeof value !== 'string' || value.indexOf('data:image/') !== 0) return value;
      return saveDataUrlToFolder_(value, folder, 'daily-' + (i + 1) + '.jpg').url;
    });
    return cloned;
  });
}

function saveDataUrlToFolder_(dataUrl, folder, originalName) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error('รูปภาพ Base64 ไม่ถูกต้อง');
  const mimeType = match[1];
  const extension = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const safeBase = sanitizeName_(String(originalName || 'photo').replace(/\.[^.]+$/, '')) || 'photo';
  const filename = safeBase + '-' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss-SSS') + '.' + extension;
  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes, mimeType, filename);
  const file = folder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (_) {
    // If public sharing is disabled by an organization, the file is still saved.
  }

  return {
    fileId: file.getId(),
    url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600'
  };
}

function getOrCreateChildFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function sanitizeName_(value) {
  return String(value || '')
    .trim()
    .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80) || 'untitled';
}

function formatThaiDateFolder_(date) {
  const year = (date.getFullYear() + 543) % 100;
  return date.getDate() + '-' + (date.getMonth() + 1) + '-' + ('0' + year).slice(-2);
}

function errorMessage_(error) {
  const message = String(error && error.message || error);
  if (/DriveApp|getFolderById|authorization|permission/i.test(message)) {
    return 'Google Apps Script ยังไม่ได้รับสิทธิ์เข้าถึง Drive หรือไม่มีสิทธิ์ในโฟลเดอร์ กรุณารัน authorizeSetup() แล้ว Deploy เวอร์ชันใหม่: ' + message;
  }
  return message;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
