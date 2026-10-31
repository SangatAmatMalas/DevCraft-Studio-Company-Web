# DevCraft Studio — Company Profile & Portfolio

Situs profil perusahaan + portfolio + katalog layanan + CMS admin untuk DevCraft Studio.
Dibangun mengikuti `PRD_DevCraft_Studio_Company_Profile.md` v1.0.

- **Stack:** Laravel 12, Inertia.js 2, React 19, TypeScript, Tailwind CSS 4, Vite 6, SSR (Inertia).
- **Bahasa default:** Indonesia (`APP_LOCALE=id`), zona waktu `Asia/Jakarta`.
- **Database pengembangan:** SQLite. Skema dibuat kompatibel dengan MySQL/MariaDB untuk produksi.
- **Admin UI:** pola visual TailAdmin di atas komponen Radix/shadcn milik starter kit (tanpa dependensi router TailAdmin).
- **Tema:** light-only. Preferensi gelap dari sistem operasi tidak lagi mengubah warna form/filter, sehingga kontras input, select, dan teks tetap terbaca.

---

## 1. Prasyarat

| Kebutuhan | Versi minimum |
| --- | --- |
| PHP | 8.2 (diuji pada 8.5) |
| Composer | 2.x |
| Node.js | 20 (diuji pada 22) |
| Database | SQLite (dev) / MySQL 8+ atau MariaDB 10.6+ (produksi) |

Ekstensi PHP yang umum dibutuhkan Laravel: `pdo`, `mbstring`, `openssl`, `fileinfo`, `gd` atau `imagick` (untuk konversi WebP), `curl`.

---

## 2. Setup lokal

```bash
# 1. Dependensi
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Database (SQLite untuk pengembangan)
touch database/database.sqlite
# Sesuaikan .env bila memakai MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=devcraft
# DB_USERNAME=...
# DB_PASSWORD=...

# 4. Migrasi + data awal
php artisan migrate:fresh --seed
php artisan storage:link

# 5. Jalankan
npm run dev            # terminal 1 — Vite
php artisan serve      # terminal 2 — aplikasi
```

Untuk menguji SSR secara lokal:

```bash
npm run build:ssr
php artisan inertia:start-ssr
```

Buka `http://localhost:8000`.

### Akun admin hasil seeder

| Field | Nilai default |
| --- | --- |
| URL | `/login` |
| Email | `admin@devcraft.test` |
| Password | `DevCraft#2026` |
| Peran | Super Admin |

Nilai dapat dioverride saat seeding:

```bash
ADMIN_EMAIL=owner@domain.com ADMIN_PASSWORD='kata-sandi-kuat' php artisan db:seed --class=UserSeeder
```

> Ganti kata sandi default sebelum deploy. Tidak ada pendaftaran mandiri; akun dibuat dari menu **Pengguna** (khusus Super Admin).

---

## 3. Perintah penting

```bash
npm run dev            # Vite dev server (HMR)
npm run build          # build aset klien
npm run build:ssr      # build aset klien + bundle SSR (bootstrap/ssr/ssr.js)
npm run lint           # ESLint (auto-fix)
npx tsc --noEmit       # type-check TypeScript
php artisan test       # Pest/PHPUnit
php artisan app:verify-placeholders   # cek placeholder "Rp X", TODO, lorem ipsum
php artisan inertia:start-ssr         # jalankan server SSR (port 13714)
```

`app:verify-placeholders` keluar dengan kode `1` bila menemukan placeholder pada konten yang **sudah dipublikasikan**. Jadikan langkah wajib sebelum deploy.

---

## 4. Aturan konten (penting)

PRD melarang konten fiktif. Implementasi yang menegakkan aturan ini:

- **Harga:** paket tidak bisa dipublikasikan tanpa `price_amount > 0`, `price_label` yang valid, atau `billing_type = custom`. Placeholder seperti `Rp X` ditolak validator (`App\Rules\NoPlaceholder`).
- **Portfolio:** seeder menyimpan proyek sebagai `draft`. Publikasikan hanya setelah detail proyek terverifikasi.
- **Testimoni:** hanya tampil jika `is_active` **dan** `permission_confirmed_at` terisi.
- **Tim:** hanya tampil jika `is_active` **dan** `approved_at` (persetujuan anggota) terisi.
- **Kontak:** email/WhatsApp/alamat kosong akan disembunyikan atau memakai fallback aman; tidak ada nomor karangan.
- **Analytics:** event yang dikirim ke `/analytics/event` dibatasi whitelist 11 event dan tidak boleh memuat PII.
- **SEO:** halaman draft tidak masuk sitemap dan tidak dapat diakses publik. Halaman error memakai `noindex`.

---

## 5. Peran & hak akses

| Peran | Konten | Leads | Pengaturan | Pengguna |
| --- | --- | --- | --- | --- |
| `super_admin` | ✅ | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | — |
| `content_manager` | ✅ | — | — | — |
| `sales` | — | ✅ | — | — |

Gate didefinisikan di `App\Providers\AppServiceProvider` dan dicerminkan di `resources/js/lib/permissions.ts` untuk menu admin.

---

## 6. Struktur singkat

```
app/
  Console/Commands/VerifyPlaceholders.php
  Enums/                     # status & peran
  Http/Controllers/Admin/    # CRUD CMS
  Http/Controllers/Site/     # halaman publik
  Http/Requests/             # validasi
  Models/                    # 20 model Eloquent
  Services/                  # Seo, ImageUploader, LeadNotifier, dll.
  Support/                   # Settings, PlaceholderGuard, WhatsAppLink
resources/js/
  pages/site/                # halaman publik
  pages/admin/               # halaman CMS
  components/site/           # header, footer, kartu, dsb.
  components/admin/          # layout, form, tabel
  pages/auth/                # login, lupa/reset kata sandi
routes/
  web.php                    # publik
  admin.php                  # CMS (auth + active + gate)
  auth.php                   # login/logout/reset
```

---

## 7. Deployment produksi

### 7.1 Build

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build:ssr          # menghasilkan public/build + bootstrap/ssr/ssr.js

php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan app:verify-placeholders
```

Alternatif container (dipakai Railway): `docker build -t devcraft .` lalu jalankan dengan env produksi. Detailnya di §7.5.

### 7.2 Environment produksi (contoh)

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://devcraft.studio
APP_LOCALE=id
APP_TIMEZONE=Asia/Jakarta

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=devcraft
DB_USERNAME=devcraft
DB_PASSWORD=...

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.provider.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@devcraft.studio
MAIL_FROM_NAME="DevCraft Studio"

INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://127.0.0.1:13714
```

SMTP juga dapat diatur dari **Admin → Pengaturan** (tersimpan terenkripsi di tabel `settings`).

### 7.3 Nginx + PHP-FPM

```nginx
server {
    listen 80;
    server_name devcraft.studio;
    root /var/www/devcraft/public;

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* { deny all; }
}
```

### 7.4 Proses yang harus berjalan

Gunakan Supervisor (atau systemd) untuk SSR:

```ini
[program:devcraft-ssr]
command=php /var/www/devcraft/artisan inertia:start-ssr
directory=/var/www/devcraft
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/log/devcraft-ssr.log
stderr_logfile=/var/log/devcraft-ssr.err.log
```

Bila email lead dialihkan ke queue di masa depan, tambahkan `php artisan queue:work --tries=3`. Saat ini notifikasi dikirim sinkron dengan fallback log bila SMTP gagal.

Scheduler (opsional, untuk pembersihan/backup terjadwal):

```
* * * * * cd /var/www/devcraft && php artisan schedule:run >> /dev/null 2>&1
```

### 7.5 Deploy ke Railway (Docker)

Repo ini sudah dilengkapi `Dockerfile` (Nginx + PHP-FPM + Node SSR dalam satu container), `docker/entrypoint.sh`, dan `railway.json`. Entrypoint otomatis: menunggu MySQL siap, menjalankan migrasi, membuat super admin pertama, lalu meng-cache config/route/view.

**Prasyarat:** repo sudah di-push ke GitHub (folder ini belum berupa repo git — jalankan `git init`, commit, lalu push).

**Langkah:**

1. Di Railway: **New Project → Deploy from GitHub repo**, pilih repo ini. Railway memakai `railway.json` + `Dockerfile`.
2. Tambah service **MySQL** (New → Database → MySQL). Catat nama service-nya, misal `MySQL`.
3. Buka service aplikasi → **Variables**, isi:

```dotenv
APP_NAME="DevCraft Studio"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...                # php artisan key:generate --show
APP_URL=https://nama-app.up.railway.app
APP_LOCALE=id
APP_TIMEZONE=Asia/Jakarta

DB_CONNECTION=mysql
DB_URL=${{MySQL.MYSQL_URL}}       # sesuaikan nama service MySQL

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
CACHE_STORE=database
QUEUE_CONNECTION=sync
FILESYSTEM_DISK=public
LOG_CHANNEL=stderr

INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://127.0.0.1:13714

ADMIN_NAME="DevCraft Admin"
ADMIN_EMAIL=owner@domain-anda.com
ADMIN_PASSWORD='kata-sandi-kuat-12+'
```

`MYSQL_URL` juga bisa dipakai langsung: entrypoint memetakannya ke `DB_URL` bila `DB_URL` kosong.

4. **Volume** (wajib, agar upload media tidak hilang saat redeploy): service aplikasi → **Volumes → Add Volume**, mount path `/var/www/storage/app/public`.
5. Deploy. Pantau log sampai muncul `Super admin ... created`, lalu cek `https://domain-anda/up`, `/`, dan `/login`.
6. Masuk ke admin → **Pengaturan**: isi kontak, WhatsApp, email notifikasi lead, dan SMTP. Ganti `ADMIN_PASSWORD` di Railway setelah login pertama bila perlu.

**Catatan Railway:**

- Satu container menjalankan Nginx, PHP-FPM, dan SSR. `PORT` dari Railway dipakai otomatis oleh Nginx.
- `QUEUE_CONNECTION=sync` karena Railway tidak menyediakan worker permanen; email lead dikirim sinkron dengan fallback log.
- Scheduler tidak berjalan. Bila nanti butuh tugas terjadwal, tambahkan service cron terpisah.
- Perintah satu-off: `railway run php artisan app:verify-placeholders` atau `railway run php artisan migrate --force`.
- Free tier Railway: trial 30 hari dengan kredit $5, lalu paket Free berisi kredit $1/bulan (0,5 GB RAM per service, 0,5 GB volume). Cukup untuk demo/uji coba, tetapi tidak cukup untuk situs produksi yang selalu hidup — untuk itu pakai Hobby ($5/bulan) atau VPS.
- Jangan mengandalkan filesystem container untuk data selain `storage/app/public` (sudah di-volume). Database ada di service MySQL.

### 7.6 Setelah deploy

1. Buka `/login`, masuk, lalu **Pengaturan**: isi brand, kontak, WhatsApp, email notifikasi lead, dan SMTP.
2. Uji formulir kontak end-to-end (brief masuk + email notifikasi).
3. Pastikan `https://domain/sitemap.xml` dan `robots.txt` benar.
4. Jalankan `php artisan app:verify-placeholders` sekali lagi.
5. Cek `/up` (health check Laravel) mengembalikan 200.

---

## 8. Backup & restore

**Database (MySQL):**

```bash
mysqldump --single-transaction --routines --triggers \
  -u devcraft -p devcraft | gzip > /backup/devcraft-$(date +%F-%H%M).sql.gz
```

**Upload media:**

```bash
tar -czf /backup/devcraft-storage-$(date +%F).tar.gz storage/app/public
```

**Restore:**

```bash
gunzip -c /backup/devcraft-2026-10-30-1200.sql.gz | mysql -u devcraft -p devcraft
tar -xzf /backup/devcraft-storage-2026-10-30.tar.gz -C /var/www/devcraft
php artisan storage:link
php artisan optimize:clear
```

Simpan backup di lokasi terpisah dari server, enkripsi bila memuat data lead, dan tetapkan masa retensi sesuai kebijakan privasi.

**SQLite (dev):** cukup salin `database/database.sqlite` saat aplikasi berhenti.

---

## 9. Keamanan & privasi

- Semua route admin memakai `auth` + middleware `active`; otorisasi per-fitur memakai Gate.
- Form publik memakai CSRF, honeypot (`website`), validasi ketat, dan rate limit `lead-submissions` (5/10 menit, 30/hari per IP).
- Data lead menyimpan `ip_hash`, bukan IP mentah, dan tidak boleh diekspor ke pihak ketiga.
- Header keamanan dasar dipasang `SecurityHeaders` (nosniff, SAMEORIGIN, referrer policy, permissions policy).
- Preview desain memakai token UUID yang tidak mudah ditebak, berlaku 30 hari, dikirim dengan `noindex,nofollow` dan `Cache-Control: no-store`; preview yang sudah menjadi lead tetap disimpan untuk konteks sales.
- Kata sandi SMTP dienkripsi (`Crypt`) di tabel `settings`.
- Aktivitas penting dicatat di `activity_logs` (tanpa isi brief lengkap).

---

## 10. Generator preview desain

Halaman publik **`/desain`** memungkinkan calon klien mengisi brief singkat dan langsung membandingkan tiga layout deterministik: **Bold Hero**, **Editorial Split**, dan **Grid Catalog**. Kategori awal yang tersedia adalah company profile, katalog produk, portfolio, landing page, dan klinik.

- Tidak memakai AI, unggahan file, atau screenshot generation; preview dirender dari komponen template React.
- Pengunjung dapat memilih satu desain, lalu memilih secara setara antara **konsultasi** (`/kontak?desain=...`) atau **melihat paket** (`/paket?desain=...`). Email hanya diminta pada jalur konsultasi.
- Admin dengan izin leads dapat melihat brief di **Admin → Preview desain** dan melihat konteks pilihan desain pada detail lead.
- Brief anonim yang sudah kedaluwarsa dapat dibersihkan dengan:

```bash
php artisan app:prune-design-briefs
```

Jalankan perintah tersebut dari scheduler harian di production. Gunakan `--days=30` untuk mengganti masa retensi ketika diperlukan.

## 11. Pengujian

```bash
php artisan test
npx tsc --noEmit
npm run build:ssr
npm run test:e2e     # Playwright: build + disposable SQLite + server
```

Cakupan tes saat ini: autentikasi & akun nonaktif, matriks peran/Gate, CRUD layanan/portfolio (termasuk baris repeater kosong), aturan harga paket + placeholder, visibilitas draft/testimoni/tim, formulir lead (validasi, honeypot, rate limit, catatan, ekspor CSV), generator preview desain (tiga varian, noindex, pemilihan, dan atribusi lead), halaman publik, sitemap, halaman error, dan perintah `app:verify-placeholders`. E2E Playwright mencakup perbandingan paket, admin membuat & memublikasikan proyek, serta visitor mengirim brief lalu admin menindaklanjutinya.

Checklist manual sebelum go-live:

- [ ] Login/logout, reset kata sandi.
- [ ] Buat & publikasikan layanan, paket, proyek portfolio, FAQ, halaman.
- [ ] Unggah cover/gallery/foto, isi alt text.
- [ ] Kirim brief dari halaman kontak; pastikan muncul di **Leads** dan email terkirim.
- [ ] Ubah status lead + tambah catatan; ekspor CSV.
- [ ] Cek tampilan mobile, fokus keyboard, dan kontras.
- [ ] Cek `sitemap.xml`, `robots.txt`, meta tag, dan 404.
- [ ] Jalankan `php artisan app:verify-placeholders`.

---

## 12. Lisensi & atribusi

Kode aplikasi ini menggunakan lisensi MIT.

Pola antarmuka admin terinspirasi dari **TailAdmin** (https://tailadmin.com), lisensi MIT — © TailAdmin. Implementasinya ditulis ulang memakai komponen Radix/shadcn dari Laravel React Starter Kit; tidak ada aset TailAdmin pihak ketiga yang didistribusikan ulang.

Laravel, Inertia.js, React, dan Tailwind CSS mengikuti lisensi masing-masing.
