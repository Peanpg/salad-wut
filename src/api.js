const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

const verifyConfiguration = () => {
  if (!APPS_SCRIPT_URL) {
    throw new Error(
      "ไม่พบคอนฟิก VITE_APPS_SCRIPT_URL กรุณาตรวจสอบว่าได้ตั้งค่าตัวแปรในระบบหรือไฟล์ .env แล้ว"
    );
  }
};

export async function getData() {
  try {
    verifyConfiguration();
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์หลัก (รหัสสถานะ: ${response.status})`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API GET Error:", error);
    throw new Error(`ไม่สามารถดึงข้อมูลจาก Google Sheets ได้: ${error.message}`);
  }
}

export async function postData(payload) {
  try {
    verifyConfiguration();
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`ส่งข้อมูลไม่สำเร็จ (รหัสสถานะ: ${response.status})`);
    }

    const result = await response.json();
    if (result.status === "error") {
      throw new Error(result.message || "เซิร์ฟเวอร์ปฏิเสธการบันทึกข้อมูล");
    }

    return result;
  } catch (error) {
    console.error("API POST Error:", error);
    throw new Error(`ไม่สามารถส่งบันทึกข้อมูลไปยังคลาวด์ได้: ${error.message}`);
  }
}
