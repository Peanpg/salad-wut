# คู่มือติดตั้ง Smart Hydroponics Tracker

## 1) ทดสอบเว็บ
```bash
npm install
npm run build
npm run dev
```

## 2) อัป GitHub
สร้าง repository ใหม่ แล้วอัปไฟล์ทั้งหมดในโฟลเดอร์นี้ โดยไม่อัป `node_modules` และ `dist`.

## 3) Deploy Vercel
- Import Git Repository
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## 4) ติดตั้ง Google Apps Script
1. เปิดชีต ID `1PLn_mokbdzBa7zN91im94LZlzUTqAr7SEiBtNOlQM9g`
2. ส่วนขยาย → Apps Script
3. วาง `apps-script/Code.gs` ในไฟล์ Code.gs
4. เปิด Project Settings และเปิดให้แสดง manifest จากนั้นใช้เนื้อหา `apps-script/appsscript.json`
5. Deploy → New deployment → Web app
6. Execute as: Me
7. Who has access: Anyone
8. คัดลอก URL ที่ลงท้าย `/exec`

## 5) เชื่อมเว็บ
เปิดเว็บ Vercel → ตั้งค่าเชื่อมต่อ → วาง URL `/exec` → บันทึกใช้งาน

ระบบจะเก็บ URL, lots และ logs ใน LocalStorage ของเบราว์เซอร์ และซิงค์กับ Google Sheets เมื่อเชื่อมต่อสำเร็จ รูปภาพแบบ Data URL จะถูกย้ายไปยังโฟลเดอร์ Drive ID `1Gen2eZE9R7wYvHlhmb6k_ikYm5NyYAow` โดย Apps Script.
