# Catatan Teknis & Ringkasan Perubahan: Project Lapangin (Branch `develop-1`)

Dokumen ini merangkum seluruh perubahan yang telah dilakukan pada repositori **Lapangin** di lingkungan WSL (Ubuntu), status branch terkini, rincian file yang diubah/ditambahkan, arsitektur cara kerjanya, serta panduan operasionalnya.

---

## 1. Status Branch & Komit Git

Cabang `develop-1` saat ini berada dalam kondisi **clean** dan sudah di-push ke remote **GitLab** (`gitlab/develop-1`), siap untuk dibuatkan Merge Request (MR) ke branch `main`.

Terdapat **2 komit utama** di branch `develop-1` yang mendahului `main`:

| Commit Hash | Author | Pesan Komit | Keterangan Singkat |
|---|---|---|---|
| `bf2967c` | `marveldw` | `feat: implement activity logging with spatie activitylog and filament resources` | Implementasi fitur audit trail / activity log di backend & panel Filament (Superadmin & Owner) |
| `1360a77` | `tarishanaila` | `feat(owner): finalize court management, schedule sync, pricing tiers, and public navbar` | Finalisasi UI/UX manajemen lapangan, sinkronisasi jadwal, pricing tiers, dan halaman publik |

> **Tautan GitLab Merge Request:**  
> [Buat Merge Request di GitLab (develop-1 &rarr; main)](https://gitlab.com/marvelliad/lapangin/-/merge_requests/new?merge_request%5Bsource_branch%5D=develop-1)

---

## 2. Fitur Baru: Activity Logging & Audit Trail (`bf2967c`)

Fitur ini menyediakan pencatatan riwayat aktivitas pengguna dan perubahan data sistem (*audit trail*) secara otomatis serta antarmuka visual untuk meninjau log tersebut di panel Filament (Superadmin dan Owner).

### A. File yang Ditambahkan (New Files)

1. **Konfigurasi & Migrasi Database**:
   - `backend/config/activitylog.php`: Berkas konfigurasi utama untuk paket `spatie/laravel-activitylog` (pengaturan nama tabel, database connection, format properties, dan retention period).
   - `backend/database/migrations/2026_09_08_151359_create_activity_log_table.php`: Migrasi untuk membuat tabel `activity_log` yang menyimpan riwayat aksi (`log_name`, `description`, `subject_type`, `subject_id`, `event`, `causer_type`, `causer_id`, `properties` JSON, dan `batch_uuid`).

2. **Panel Filament Superadmin (`app/Filament/Resources/ActivityLogs/`)**:
   - `ActivityLogResource.php`: Registrasi resource Filament ke menu grup **"Sistem & Audit"** dengan icon clipboard list. Mengatur hak akses menjadi *read-only* (`canCreate = false`, `canEdit = false`, `canDelete = false`).
   - `Schemas/ActivityLogForm.php`: Tampilan form detail riwayat (waktu, jenis aksi, subjek entitas, pelaku/causer, deskripsi, dan rincian payload data JSON).
   - `Tables/ActivityLogsTable.php`: Tabel daftar log global dengan sorting waktu menurun (*descending*), badge warna berdasarkan event (`created` = hijau, `updated` = biru, `deleted` = merah, `login` = kuning), serta filter event.
   - `Pages/ListActivityLogs.php` & `Pages/ViewActivityLog.php`: Handler halaman index daftar log dan modal/halaman view detail.

3. **Panel Filament Owner (`app/Filament/Owner/Resources/ActivityLogs/`)**:
   - `ActivityLogResource.php`: Resource khusus owner dengan label **"Riwayat Aktivitas"**. Dilengkapi dengan pemfilteran otomatis (*scoped query*):
     - Hanya memuat aktivitas di mana pelaku adalah Owner tersebut (`causer_id = auth()->user()->user_id`).
     - Atau aktivitas yang terjadi pada lapangan milik venue Owner (`Court` dengan `owner_id = user_id`).
     - Atau aktivitas booking yang berkaitan dengan lapangan milik Owner tersebut.
     - Bersifat mutlak *read-only* agar integritas data log tidak dapat dimanipulasi oleh siapapun.
   - `Schemas/ActivityLogForm.php`: Skema form detail disesuaikan dengan bahasa Indonesia dan menyajikan data JSON yang rapi (*pretty-printed*).
   - `Tables/ActivityLogsTable.php`: Tabel aktivitas khusus Owner dengan filter aksi dan format nama entitas ramah pengguna (*Lapangan, Booking, Akun Anda*).
   - `Pages/ListActivityLogs.php` & `Pages/ViewActivityLog.php`: Halaman daftar dan detail khusus panel Owner.

---

### B. File yang Diubah (Modified Files)

1. **Dependensi (`backend/composer.json` & `composer.lock`)**:
   - Menambahkan package `"spatie/laravel-activitylog": "^4.10"`.

2. **Autentikasi (`backend/app/Http/Controllers/Api/AuthController.php`)**:
   - **Method `login()`**: Menambahkan pencatatan event login pengguna:
     ```php
     activity()
         ->causedBy($user)
         ->performedOn($user)
         ->event('login')
         ->log("Pengguna '{$user->name}' berhasil login ke sistem");
     ```
   - **Method `logout()`**: Menambahkan pencatatan event logout sebelum token access dihapus:
     ```php
     activity()
         ->causedBy($user)
         ->performedOn($user)
         ->event('logout')
         ->log("Pengguna '{$user->name}' melakukan logout");
     ```

3. **Model Eloquent (Audit Trail Terpasang Otomatis)**:
   Setiap model berikut diinjeksikan trait `Spatie\Activitylog\Models\Concerns\LogsActivity` dan konfigurasi `getActivitylogOptions()`:
   - `backend/app/Models/Booking.php`: Mencatat pembuatan, perubahan status, atau pembatalan booking.
   - `backend/app/Models/Court.php`: Mencatat pembuatan, perubahan tarif/fasilitas, atau penghapusan lapangan.
   - `backend/app/Models/Customer.php`: Mencatat pembuatan atau perubahan data profil pelanggan.
   - `backend/app/Models/Plan.php`: Mencatat penambahan atau update paket langganan (tier plan).
   - `backend/app/Models/Subscription.php`: Mencatat status transaksi langganan venue owner.
   - `backend/app/Models/User.php`: Mencatat perubahan akun user (menggunakan `logFillable()` agar password hash tidak terekspos sembarangan).

---

### C. Cara Kerja Teknis (Arsitektur & Alur Eksekusi)

```mermaid
flowchart TD
    A[Aksi User: Login / Ubah Data Booking / Update Lapangan] --> B{Pemicu Activity}
    B -->|API Controller| C[activity()->causedBy()->performedOn()->log()]
    B -->|Eloquent Event| D[Trait LogsActivity pada Model]
    
    C --> E[(Tabel activity_log di Database)]
    D -->|logOnlyDirty & dontLogEmptyChanges| E
    
    E --> F[Filament Admin Panel]
    E --> G[Filament Owner Panel]
    
    F -->|Global Query| H[Superadmin: Melihat Semua Audit Log Sistem]
    G -->|Scoped Query by Court & Owner ID| I[Owner: Hanya Melihat Log Lapangan & Booking Miliknya]
```

1. **Otomatisasi via Eloquent Lifecycle Events**:
   Saat model (misalnya `Booking` atau `Court`) dipanggil `->save()`, `->update()`, atau `->delete()`, trait `LogsActivity` secara otomatis mendeteksi field mana yang berubah menggunakan method bawaan `logOnlyDirty()`. Perubahan sebelum (*old*) dan sesudah (*attributes*) disimpan dalam format JSON pada kolom `properties`.
2. **Deskripsi Kustom**:
   Menggunakan method `setDescriptionForEvent(...)`, deskripsi setiap log otomatis menggunakan bahasa Indonesia yang jelas (contoh: *"Lapangan 'Futsal A' telah di-updated"*).
3. **Proteksi Integritas Data (Immutability)**:
   Di Filament Resources, method `canCreate()`, `canEdit()`, dan `canDelete()` di-*override* mengembalikan nilai `false`. Log audit hanya dapat dibaca (*read-only*) dan tidak dapat dimodifikasi/dihapus dari dashboard admin.
4. **Isolasi Tenant / Multi-Tenancy Scoping**:
   Pada portal Owner, query dibatasi secara ketat melalui `getEloquentQuery()` sehingga seorang pemilik venue tidak akan bisa mengintip log riwayat venue lain.

---

## 3. Ringkasan Perubahan Frontend Owner Portal (`1360a77`)

Sebelum commit activity log, terdapat rangkaian peningkatan fitur pada portal frontend owner:
- `frontend/app/owner/lapangan/page.tsx` & `tambah/page.tsx`: Pembaruan formulir input hierarki lapangan, pemilihan tipe olahraga, serta integrasi slot jam & pricing tier.
- `frontend/app/owner/jadwal/page.tsx`: Peningkatan sinkronisasi jadwal booking real-time ke grid kalender.
- `frontend/app/owner/pendapatan/page.tsx`: Penyesuaian kalkulasi metrik pendapatan dan visualisasi chart.
- `frontend/app/owner/pengaturan/page.tsx`: Penambahan opsi pengaturan venue dan profile owner.
- `frontend/app/lapangan/detail/page.tsx` & `register/page.tsx`: Sinkronisasi navigasi publik dan alur pendaftaran.

---

## 4. Panduan Operasional & Pengujian di WSL

Jika Anda ingin menjalankan migrasi atau menguji langsung di terminal WSL:

### 1. Jalankan Migrasi Database
Pastikan tabel `activity_log` sudah terbuat di database:
```bash
cd /home/marvel/lapangin/backend
php artisan migrate
```

### 2. Bersihkan Cache Aplikasi
Jika ada perubahan resource Filament yang belum terbaca:
```bash
php artisan optimize:clear
```

### 3. Cara Menguji Fitur
1. **Uji Login/Logout API**:
   - Lakukan login melalui API atau Frontend (`/api/login`).
   - Periksa tabel `activity_log`, akan tercatat event `login` dengan keterangan: *"Pengguna '{nama}' berhasil login ke sistem"*.
2. **Uji Perubahan Data Lapangan / Booking**:
   - Masuk ke Filament Owner Portal atau ubah data lapangan melalui UI/API.
   - Buka menu **"Riwayat Aktivitas"** di sidebar Owner.
   - Klik aksi **View** pada salah satu baris log untuk memeriksa payload JSON perubahan data (*old* vs *attributes*).
3. **Uji Superadmin Panel**:
   - Masuk ke Filament Superadmin (`/admin`).
   - Buka grup **"Sistem & Audit"** &rarr; **"Activity Log"** untuk melihat seluruh riwayat aktivitas dari semua user dan venue secara global.
