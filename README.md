```markdown
# Lapangin — Sports Court Booking SaaS

Sistem manajemen lapangan olahraga berbasis SaaS untuk pemilik lapangan.

---

## 👥 Tim

| Nama | Role | Teknologi |
|------|------|-----------|
| Marvel | Backend | Laravel 12 |
| [Nama Fullstack] | Fullstack / Landing Page | 
| [Nama Frontend] | Frontend / Dashboard | 

---

## 🏗️ Struktur Repo

lapangin/
├── backend/ ← Laravel 12 API (Marvel)
└── frontend/ ← Next.js (Fullstack + Frontend)

---

## 🚀 Status Backend (per 23 Agustus 2026)

### ✅ Sudah Selesai
- Setup Laravel 12 + PostgreSQL + Docker/Sail
- 7 database migrations (plans, users, subscriptions, courts, court_operating_hours, customers, bookings)
- Auth API (register, login, logout, me) dengan Sanctum
- Courts API dengan plan limit enforcement
- Bookings API dengan conflict detection dan validasi jam operasional
- Dashboard endpoint
- Plans endpoint (public)
- API Documentation via Scramble

### 🔄 Belum Selesai (Next Sprint)
- Seeder untuk data plans (FREE, BASIC, PRO)
- Customer API endpoints
- Court Operating Hours API endpoints
- Superadmin endpoints (manage plans, users, subscriptions)
- CORS configuration untuk Next.js
- Deploy ke Railway/Render

---

## 📡 Akses API (Development)

> ⚠️ URL ngrok berubah setiap kali backend direstart.
> **Tanya Marvel di grup chat untuk URL terbaru setiap mulai kerja.**

**API Documentation:** Minta URL ke Marvel → tambahkan `/docs/api` di belakangnya.

---

## 📋 API Endpoints

### Public (Tidak perlu token)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | /api/register | Daftar akun owner |
| POST | /api/login | Login |
| GET | /api/plans | Daftar paket SaaS |

### Protected (Butuh Bearer Token)
Tambahkan header: `Authorization: Bearer {token}`

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | /api/me | Data user aktif |
| POST | /api/logout | Logout |
| GET | /api/dashboard | Statistik dashboard owner |
| GET | /api/courts | Daftar lapangan milik owner |
| POST | /api/courts | Tambah lapangan |
| GET | /api/courts/{id} | Detail lapangan |
| PUT | /api/courts/{id} | Edit lapangan |
| DELETE | /api/courts/{id} | Nonaktifkan lapangan |
| GET | /api/bookings | Daftar booking |
| POST | /api/bookings | Buat booking baru |
| GET | /api/bookings/{id} | Detail booking |
| PUT | /api/bookings/{id} | Update status booking |

---

## 🔐 Cara Pakai API (untuk Fullstack & Frontend)

### 1. Register
```json
POST /api/register
{
  "name": "Budi",
  "email": "budi@gmail.com",
  "password": "password123",
  "phone": "08123456789"
}

```

Response:

```json
{
  "success": true,
  "token": "1|xxxxx",
  "user": {
    "user_id": 1,
    "name": "Budi",
    "email": "budi@gmail.com",
    "role": "OWNER"
  }
}

```

### 2. Login

```json
POST /api/login
{
  "email": "budi@gmail.com",
  "password": "password123"
}

```

### 3. Gunakan Token

Simpan token dari response register/login, lalu kirim di setiap request protected:

```http
Authorization: Bearer 1|xxxxx

```

### 4. Dashboard

```http
GET /api/dashboard
Authorization: Bearer {token}

```

Response:

```json
{
  "success": true,
  "data": {
    "total_courts": 3,
    "total_bookings": 124,
    "today_bookings": 12,
    "today_revenue": 1200000,
    "monthly_revenue": 12500000
  }
}

```

---

## 🗄️ Database Schema

7 tabel utama:

| Tabel | Fungsi |
| --- | --- |
| plans | Paket SaaS (FREE, BASIC, PRO) |
| users | Akun owner dan superadmin |
| subscriptions | Langganan owner ke paket |
| courts | Data lapangan milik owner |
| court_operating_hours | Jam operasional per hari |
| customers | Pelanggan dari owner lapangan |
| bookings | Transaksi booking |

---

## ⚙️ Untuk Frontend & Fullstack — Setup Next.js

Buat file `.env.local` di folder `frontend/`:

```env
# Minta URL ngrok terbaru dari Marvel, lalu isi di sini
NEXT_PUBLIC_API_URL=http://url-dari-marvel/api

```

Contoh fetch API di Next.js:

```javascript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courts`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})
const data = await res.json()

```

---

## 🐳 Untuk Marvel — Cara Jalankan Backend

```bash
# Masuk ke WSL2
cd ~/lapangin/backend

# Jalankan Docker containers
./vendor/bin/sail up -d

# Jalankan ngrok (terminal terpisah)
cd ~/lapangin
ngrok http 8080

```

---

## 📌 Catatan Penting untuk Semua Tim

1. **Jangan push langsung ke `main**` — selalu lewat `develop`
2. **Branch naming:** `feature/nama-fitur`
3. **Commit message format:** `feat: deskripsi` / `fix: deskripsi` / `docs: deskripsi`
4. **API docs selalu up to date** di `/docs/api` — tidak perlu tanya Marvel untuk endpoint
5. **Token expired?** Tinggal login ulang, backend akan kasih token baru

```

```
