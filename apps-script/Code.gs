/**
 * =========================================================================
 * 🌿ระบบบันทึกข้อมูลและอัปโหลดรูปภาพอัตโนมัติ (Smart Hydroponics Tracker Backend)
 * =========================================================================
 */
const SHEET_ID = "1PLn_mokbdzBa7zN91im94LZlzUTqAr7SEiBtNOlQM9g";
const DRIVE_FOLDER_ID = "1Gen2eZE9R7wYvHlhmb6k_ikYm5NyYAow";
const SHEET_NAME = "Logs";

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "วันเวลาบันทึก (Timestamp)", 
        "รหัสรางปลูก (Rail ID)", 
        "ค่า pH", 
        "ค่า EC (mS/cm)", 
        "อุณหภูมิน้ำ (°C)", 
        "ระดับน้ำ (%)", 
        "สภาพอากาศ", 
        "รายละเอียดบันทึกเพิ่มเติม", 
        "พิกัด GPS",
        "เติมปุ๋ย AB (มล.)",
        "เติม pH DOWN (มล.)",
        "เติม pH UP (มล.)",
        "เติมน้ำสะอาดเพิ่ม (ลิตร)",
        "ค่า pH หลังปรับ",
        "ค่า EC หลังปรับ (mS/cm)",
        "ลิงก์รูปถ่ายประเมินโรคพืช"
      ]);
    }

    if (payload.action === "saveLog" || !payload.action) {
      let uploadedImageUrls = [];
      if (payload.dailyPhotos && Array.isArray(payload.dailyPhotos)) {
        payload.dailyPhotos.forEach((base64Str, index) => {
          if (base64Str && base64Str.startsWith("data:image")) {
            const fileName = `img_${payload.railId}_${Date.now()}_${index + 1}`;
            const fileUrl = uploadBase64ToDrive(base64Str, DRIVE_FOLDER_ID, fileName);
            if (fileUrl) {
              uploadedImageUrls.push(fileUrl);
            }
          }
        });
      }

      const imageUrlsString = uploadedImageUrls.join(", ");

      sheet.appendRow([
        new Date(),
        payload.railId || "ไม่ระบุราง",
        payload.pH !== undefined ? payload.pH : "",
        payload.ec !== undefined ? payload.ec : "",
        payload.waterTemp !== undefined ? payload.waterTemp : "",
        payload.waterLevel !== undefined ? payload.waterLevel : "",
        payload.weather || "",
        payload.notes || "",
        payload.gps || "",
        payload.addedAB || 0,
        payload.addedPhDown || 0,
        payload.addedPhUp || 0,
        payload.addedWaterVolume || 0,
        payload.afterPh !== undefined ? payload.afterPh : "",
        payload.afterEc !== undefined ? payload.afterEc : "",
        imageUrlsString
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "บันทึกข้อมูลพารามิเตอร์น้ำสำเร็จเรียบร้อยแล้ว",
        uploadedImagesCount: uploadedImageUrls.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "ไม่พบคำสั่ง action ที่ระบบรองรับ"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function uploadBase64ToDrive(base64Data, folderId, fileName) {
  try {
    const splitData = base64Data.split(',');
    if (splitData.length < 2) return null;
    
    const metaHeader = splitData[0];
    const rawBase64 = splitData[1];
    
    const mimeType = metaHeader.match(/:(.*?);/)[1];
    let fileExtension = "jpg";
    if (mimeType.includes("png")) fileExtension = "png";
    if (mimeType.includes("gif")) fileExtension = "gif";
    
    const decodedBytes = Utilities.base64Decode(rawBase64);
    const blob = Utilities.newBlob(decodedBytes, mimeType, `${fileName}.${fileExtension}`);
    
    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (err) {
    Logger.log("เกิดข้อผิดพลาดในการบันทึกรูป: " + err.toString());
    return null;
  }
}