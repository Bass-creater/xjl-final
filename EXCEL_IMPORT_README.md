# ระบบ Import ข้อมูลจาก Excel

## ฟีเจอร์ที่เพิ่มเข้ามา

### 1. Import ข้อมูลจากไฟล์ Excel
- อ่านข้อมูลจากคอลัมน์ D ของไฟล์ Excel
- สร้าง UUID เดียวกันสำหรับทุกรายการในไฟล์เดียวกัน (Batch UUID)
- บันทึกข้อมูลลงในตาราง `parcels` และ `uuid`
- สร้างข้อมูลในตาราง `savetime` สำหรับติดตามสถานะ

### 2. ไฟล์ที่เกี่ยวข้อง

#### Backend:
- `server/model/uuid.js` - Model สำหรับตาราง uuid
- `server/controller/authController.js` - เพิ่มฟังก์ชัน `importExcel` และ `uploadExcel`
- `server/routes/authRoutes.js` - เพิ่ม route `/import-excel`

#### Frontend:
- `client/src/pages/distribution.js` - เพิ่มปุ่มและฟังก์ชันสำหรับ import Excel

### 3. Dependencies ที่เพิ่มเข้ามา
- `xlsx` - สำหรับอ่านไฟล์ Excel
- `uuid` - สำหรับสร้าง UUID
- `multer` - สำหรับจัดการการอัปโหลดไฟล์

### 4. วิธีการใช้งาน

1. เข้าไปที่หน้า Distribution Dashboard
2. เลือกไฟล์ Excel (.xlsx, .xls หรือ .xlxs) ที่ต้องการ import
3. คลิกปุ่ม "Import Excel"
4. ระบบจะแสดงผลลัพธ์การ import พร้อม Batch UUID

### 5. โครงสร้างข้อมูลที่บันทึก

#### ตาราง `parcels`:
- `id_parcel` - ข้อมูลจากคอลัมน์ D ของ Excel
- `from` - "Excel Import"
- `to` - "LAO Warehouse"
- `time` - เวลาปัจจุบัน
- `status` - "origin"
- `timeexport` - ว่าง

#### ตาราง `uuid`:
- `batch_uuid` - UUID เดียวกันสำหรับทุกรายการในไฟล์
- `id_parcel` - รหัสพัสดุ
- `created_at` - เวลาที่สร้าง

#### ตาราง `savetime`:
- `id_parcel` - รหัสพัสดุ
- `from` - "Excel Import"
- `origin` - เวลาปัจจุบัน
- `export`, `acceptorigin`, `spread`, `branch`, `success` - ว่าง

### 6. การตรวจสอบข้อมูล
- ระบบจะตรวจสอบว่าพัสดุมีอยู่แล้วหรือไม่ก่อนบันทึก
- แสดงข้อผิดพลาดหากมีข้อมูลซ้ำ
- แสดงจำนวนรายการที่ import สำเร็จและข้อผิดพลาด

### 7. API Endpoint
```
POST /api/import-excel
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: excelFile (ไฟล์ Excel)
```

### 8. Response Format
```json
{
  "message": "Import completed",
  "batch_uuid": "uuid-string",
  "imported_count": 10,
  "imported_parcels": [...],
  "errors": [...]
}
```
