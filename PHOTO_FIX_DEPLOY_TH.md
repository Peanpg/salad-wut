# ขั้นตอนอัปเดตระบบรูปภาพและสิทธิ์ Google Drive

1. เปิด Apps Script ที่เชื่อมกับ Google Sheet ของระบบ
2. แทนที่ไฟล์ `Code.gs` ด้วยไฟล์ `apps-script/Code.gs` ในโปรเจกต์นี้
3. เปิด Project Settings และเปิด `Show "appsscript.json" manifest file in editor`
4. แทนที่ `appsscript.json` ด้วยไฟล์ในโฟลเดอร์ `apps-script`
5. เลือกฟังก์ชัน `authorizeSetup` แล้วกด Run
6. ยอมรับสิทธิ์ Google Sheets และ Google Drive ให้ครบ
7. ไปที่ Deploy > Manage deployments > Edit
8. เลือก New version แล้วกด Deploy โดยใช้ Execute as: Me และ Who has access: Anyone
9. ไม่ต้องเปลี่ยน URL `/exec` เดิม หากอัปเดต Deployment เดิม
10. Push โปรเจกต์ขึ้น GitHub แล้วรอ Vercel Deploy ใหม่

โครงสร้างรูป:
- รูปล็อต: โฟลเดอร์หลัก Lot > lot1, lot2, lot3...
- รูปรายวัน: โฟลเดอร์หลัก Daily > 16-7-69, 17-7-69...

หมายเหตุ: หากไม่รัน `authorizeSetup()` อย่างน้อยหนึ่งครั้ง การอัปโหลดจะขึ้นข้อผิดพลาด DriveApp authorization
