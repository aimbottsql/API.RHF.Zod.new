# Product Explorer — เข้าสู่ระบบด้วย Google (Auth.js)

ใบงานนี้ต่อยอดจากโปรเจกต์ product-explorer โดยเพิ่มการเข้าสู่ระบบด้วย Google OAuth ผ่าน Auth.js

- ผู้ใช้ทั่วไปดูและค้นหารายการสินค้าได้ที่หน้าแรก `/`
- เฉพาะผู้ที่เข้าสู่ระบบแล้วจึงเห็นปุ่มเพิ่ม ลิงก์แก้ไข และปุ่มลบ
- หน้า `/manage/new` และ `/manage/[id]/edit` ถูกป้องกันด้วย proxy
- Server Action ตรวจ session ซ้ำทุกครั้ง เพื่อป้องกันการเรียกตรง

- ข้อมูลสินค้าเก็บใน **PostgreSQL** แก้ไขแล้วไม่หายเมื่อรีสตาร์ต server

## เริ่มใช้งานเร็ว (สำหรับคนที่ clone โปรเจกต์ไป)

1. Clone และติดตั้ง
   ```bash
   git clone https://github.com/aimbottsql/API.RHF.Zod.new.git
   cd API.RHF.Zod.new
   npm install
   ```
2. คัดลอก `.env.example` เป็น `.env.local`
   ```bash
   cp .env.example .env.local
   ```
3. ใส่ค่าใน `.env.local` ให้ครบ
   - `AUTH_SECRET` → สร้างด้วยคำสั่ง `npx auth secret` (คำสั่งนี้เขียนค่าลง `.env.local` ให้เอง)
   - `AUTH_GOOGLE_SECRET` → ขอจากเจ้าของโปรเจกต์ทางแชทส่วนตัว
4. ให้เจ้าของโปรเจกต์เพิ่มอีเมล Google ของคุณใน Google Cloud → **Google Auth Platform → Audience → Test users** (ถ้าไม่เพิ่ม จะล็อกอินไม่ได้และขึ้น `access_denied`)
5. รัน 2 terminal
   ```bash
   # terminal 1 — ฐานข้อมูล (ครั้งแรกจะนำเข้าสินค้าจาก db/seed.sql ให้อัตโนมัติ)
   npm run db:start

   # terminal 2 — เว็บ
   npm run dev
   ```
6. เปิด http://localhost:3000

> **อัปเดตข้อมูลให้คนอื่น:** รัน `npm run db:export` (ต้องเปิด `db:start` ค้างไว้) แล้ว commit ไฟล์ `db/seed.sql`
> ข้อมูลจาก seed.sql จะถูกนำเข้าเฉพาะตอนที่ตารางยังว่าง ถ้าเครื่องปลายทางมีข้อมูลอยู่แล้ว ให้ปิด `db:start` ลบโฟลเดอร์ `.postgres-data` แล้วรัน `npm run db:start` ใหม่

## วิธีติดตั้งและรัน (ละเอียด)

### 1. สร้าง OAuth credential ใน Google Cloud Console

1. เปิด https://console.cloud.google.com/ แล้วสร้างโปรเจกต์ใหม่ (หรือเลือกโปรเจกต์เดิม)
2. ไปที่ **APIs & Services → OAuth consent screen** ตั้งค่าดังนี้
   - User Type: **External**
   - กรอกชื่อแอปและอีเมล แล้วกดบันทึก
   - ถ้าแอปอยู่ในโหมด Testing ให้เพิ่มอีเมลของตัวเองในส่วน **Test users**
3. ไปที่ **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
4. กด Create แล้วคัดลอก **Client ID** และ **Client secret**

> ถ้า redirect URI ไม่ตรงทุกตัวอักษร Google จะแสดง `redirect_uri_mismatch`

### 2. เตรียมฐานข้อมูล PostgreSQL (เลือกวิธีใดวิธีหนึ่ง)

**วิธีหลัก — รันในโปรเจกต์ (แนะนำ ไม่ต้องสมัครเว็บหรือติดตั้งเอง)**

โปรเจกต์มี `embedded-postgres` ซึ่งเป็น PostgreSQL ตัวจริงที่ติดตั้งมากับ `npm install`
1. เปิด terminal แรก แล้วรันค้างไว้
   ```bash
   npm run db:start
   ```
   ครั้งแรกจะสร้างโฟลเดอร์ `.postgres-data` สร้างตาราง และใส่สินค้าเริ่มต้นให้อัตโนมัติ
2. ใช้ connection string นี้
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/product_explorer"
   ```
3. ปิดฐานข้อมูลด้วย `Ctrl + C` ข้อมูลยังอยู่ในโฟลเดอร์ `.postgres-data` (ถ้าอยากล้างข้อมูลทั้งหมด ให้ลบโฟลเดอร์นี้)

**วิธี ก — Neon (ฐานข้อมูลบน cloud ใช้ฟรี)**
1. สมัครที่ https://neon.tech แล้วกด **Create project**
2. ที่หน้า Dashboard กด **Connect** แล้วคัดลอก connection string
   หน้าตาจะเป็น `postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require`

**วิธี ข — ติดตั้ง PostgreSQL ในเครื่อง (Windows)**
1. ดาวน์โหลดตัวติดตั้งจาก https://www.postgresql.org/download/windows/ แล้วติดตั้ง จดรหัสผ่านของ user `postgres` ไว้ (port เริ่มต้นคือ 5432)
2. เปิด **SQL Shell (psql)** แล้วสร้างฐานข้อมูล
   ```sql
   CREATE DATABASE product_explorer;
   ```
3. connection string คือ `postgresql://postgres:รหัสผ่าน@localhost:5432/product_explorer`

### 3. ตั้งค่าไฟล์ `.env.local`

```env
AUTH_SECRET="..."            # สร้างใหม่ได้ด้วย npx auth secret
AUTH_GOOGLE_ID="Client ID จากข้อ 1"
AUTH_GOOGLE_SECRET="Client secret จากข้อ 1"
AUTH_TRUST_HOST=true         # จำเป็นเมื่อรัน npm run start บนเครื่องตัวเอง
DATABASE_URL="connection string จากข้อ 2"
```

ไฟล์นี้อยู่ใน `.gitignore` แล้ว ห้าม commit ขึ้น Git

### 4. สร้างตารางและรันโปรเจกต์

ถ้าใช้ `npm run db:start` (วิธีหลัก) ข้ามขั้น `db:setup` ได้เลย เปิด terminal ที่สองแล้วรัน

```bash
npm install
npm run db:setup   # เฉพาะวิธี ก/ข: สร้างตารางและใส่สินค้าเริ่มต้น 30 รายการ (รันซ้ำได้)
npm run dev
```

เปิด http://localhost:3000 แล้วกด **เข้าสู่ระบบด้วย Google**

> ทุกครั้งที่แก้ `.env.local` หรือ `next.config.ts` ต้องหยุด `npm run dev` แล้วรันใหม่

## โครงสร้างไฟล์

| ไฟล์ | รันที่ | หน้าที่ |
|---|---|---|
| `src/auth.ts` | server | ตั้งค่า Auth.js + Google provider ส่งออก `auth`, `signIn`, `signOut` |
| `src/app/api/auth/[...nextauth]/route.ts` | server | รับ callback จาก Google |
| `src/proxy.ts` | server | ตรวจ session ก่อนเข้า `/manage/*` (หน้าเพิ่ม/แก้ไข) ถ้าไม่มีส่งไป `/login` |
| `src/actions/auth.ts` | server | Server Action เข้า/ออกจากระบบ |
| `src/actions/products.ts` | server | Server Action เพิ่ม/แก้ไข/ลบสินค้า (ตรวจ session ซ้ำทุกครั้ง) |
| `src/lib/db.ts` | server | connection pool ของ PostgreSQL (`pg`) |
| `src/lib/product-store.ts` | server | คำสั่ง SQL อ่าน/เพิ่ม/แก้/ลบสินค้า (ใช้ `$1, $2` ป้องกัน SQL injection) |
| `db/schema.sql` | — | โครงสร้างตาราง `products` |
| `scripts/db-start.mjs` | — | เปิด PostgreSQL ในเครื่อง (`npm run db:start`) |
| `scripts/db-export.mjs` | — | ส่งออกข้อมูลปัจจุบันเป็น `db/seed.sql` (`npm run db:export`) |
| `db/seed.sql` | — | ข้อมูลสินค้าที่ส่งออกไว้ นำเข้าอัตโนมัติเมื่อฐานข้อมูลว่าง |
| `scripts/db-setup.mjs` | — | สคริปต์สร้างตารางและใส่ข้อมูลเริ่มต้น (`npm run db:setup`) |
| `src/components/AuthStatus.tsx` | server | อ่าน session ด้วย `auth()` แล้วแสดงปุ่มตามสถานะ |
| `src/app/page.tsx` | server | หน้าแรก ทุกคนดูได้ แสดงปุ่มแก้ไข/ลบเฉพาะเมื่อมี session |
| `src/app/manage/**` | server | หน้าเพิ่มและแก้ไขสินค้า |
| `src/app/error.tsx` | client | แสดงเมื่อ Server Action ปฏิเสธ (เช่น session หมดอายุ) |
| `src/components/ProductEditor.tsx` | client | ฟอร์มเพิ่ม/แก้ไข ส่ง POST ไปยัง Server Action |
| `src/components/DeleteProductButton.tsx` | client | ปุ่มลบพร้อมกล่องยืนยัน |
| `src/components/ProductSearchForm.tsx` | client | ฟอร์มค้นหา ตรวจด้วย Zod แล้วเปลี่ยน URL ให้ server ค้นหา |

ไฟล์ที่ขึ้นต้นด้วย `"use client"` เท่านั้นที่ถูกส่งไปรันในเบราว์เซอร์ ไฟล์อื่นใน `app/` เป็น Server Component

## หลักความปลอดภัย

1. **Authentication เป็นหน้าที่ของ server** โค้ดฝั่ง client ผู้ใช้แก้ไขได้ทั้งหมด จึงเชื่อถือเพื่อความปลอดภัยไม่ได้
2. **ป้องกัน 3 ชั้น**
   - `proxy.ts` กันการเข้าหน้า `/manage/*`
   - หน้าใน `/manage` เรียก `auth()` ซ้ำก่อนแสดงฟอร์ม
   - Server Action เรียก `auth()` ซ้ำก่อนแก้ข้อมูลทุกครั้ง
3. **Server Action คือ endpoint แบบ POST** ใครก็ส่ง request มาตรง ๆ ได้โดยไม่ผ่านหน้าเว็บ จึงต้องตรวจสิทธิ์ภายใน action เสมอ
4. **ป้องกัน SQL injection** ค่าจากผู้ใช้ส่งผ่าน `$1, $2, ...` เสมอ ห้ามต่อ string เข้า SQL ตรง ๆ
5. **การซ่อนปุ่มไม่ใช่การป้องกัน** ปุ่มลบอยู่ที่หน้าแรกซึ่ง proxy ไม่ได้ป้องกัน ถ้าไม่มีการตรวจใน `deleteProduct` ใครก็ส่ง POST มาลบสินค้าได้ แม้ปุ่มจะถูกซ่อนไว้

## ทดสอบ

- ยังไม่เข้าสู่ระบบ → หน้าแรกเห็นรายการสินค้าและค้นหาได้ แต่ไม่มีปุ่มเพิ่ม แก้ไข หรือลบ
- เปิด `/manage/new` หรือ `/manage/1/edit` ตรง ๆ → ต้องถูกส่งไป `/login`
- เข้าสู่ระบบ → เห็นปุ่มทั้งหมด และเพิ่ม แก้ไข ลบได้
- กรอกฟอร์มผิด (ชื่อว่าง ราคาติดลบ) → แสดงข้อความ error ที่ตรวจจาก server
- ออกจากระบบ → ปุ่มหายไป
- รีสตาร์ต `npm run dev` → ข้อมูลที่แก้ไขยังอยู่

## แก้ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| `ยังไม่ได้ตั้งค่า DATABASE_URL` | ใส่ `DATABASE_URL` ใน `.env.local` แล้วรีสตาร์ต dev server |
| `relation "products" does not exist` | ยังไม่ได้รัน `npm run db:setup` |
| `password authentication failed` | รหัสผ่านใน `DATABASE_URL` ผิด |
| `ECONNREFUSED ...:5433` | ยังไม่ได้รัน `npm run db:start` หรือปิด terminal นั้นไปแล้ว |
| `ECONNREFUSED ...:5432` | PostgreSQL ที่ติดตั้งเอง (วิธี ข) ยังไม่ได้เปิด (ดูใน Services ของ Windows) |
| รูปสินค้าบางชิ้นขึ้น "ไม่มีรูปภาพ" | ปกติ: สินค้านั้นไม่มีรูปบน dummyjson หรือ URL รูปเสีย |
| หน้าเว็บโหลดนาน/ค้าง เมื่อเปิดผ่าน IP เช่น `http://172.18.224.1:3000` | ให้เปิด **http://localhost:3000** แทน (ลิงก์ "Local" ไม่ใช่ "Network") — Google login ใช้ได้เฉพาะ localhost |
| `Missing required parameter: client_id` | ยังไม่ได้ใส่ `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` |
