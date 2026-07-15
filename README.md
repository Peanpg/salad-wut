# Smart Hydroponics Tracker

เว็บแอป React + Vite สำหรับบันทึกและติดตามการปลูกผักไฮโดรโปนิกส์

## วิธีเปิดใช้งาน

1. ติดตั้ง Node.js รุ่น LTS
2. เปิด Terminal ในโฟลเดอร์นี้
3. รันคำสั่ง

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง เช่น `http://localhost:3000`

## เชื่อม Google Apps Script

1. เปิด Google Apps Script และสร้างโปรเจกต์ใหม่
2. นำโค้ดใน `apps-script/Code.gs` ไปวาง
3. ตรวจสอบ `SHEET_ID`, `DRIVE_FOLDER_ID` และ `SHEET_NAME`
4. Deploy เป็น Web app และอนุญาตผู้ใช้ตามที่ต้องการ
5. คัดลอก URL ที่ลงท้ายด้วย `/exec`
6. คัดลอก `.env.example` เป็น `.env.local`
7. ใส่ URL ดังนี้

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

จากนั้นหยุดและเปิด `npm run dev` ใหม่

## Build สำหรับ Vercel

```bash
npm run build
```

Vercel ใช้ Build command `npm run build` และ Output directory `dist`

## หมายเหตุ

ไฟล์ `setup-fixed.cjs` ใช้สร้างชุดไฟล์โปรเจกต์ใหม่ได้โดยรัน `node setup-fixed.cjs` ในโฟลเดอร์ว่าง
