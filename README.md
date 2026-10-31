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

Alternatif container (Railway / Cloud Run): `docker build -t devcraft .` lalu jalankan dengan env produksi. Detailnya di §7.5 dan §7.6.

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

**Prasyarat:** repo sudah di-push ke GitHub dan Railway punya akses ke repo tersebut.

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

### 7.6 Deploy ke Google Cloud Run (Docker + Cloud SQL)

Cloud Run cocok untuk aplikasi ini karena image sudah menjalankan **Nginx + PHP-FPM + Inertia SSR** dalam satu container dan mendengarkan `$PORT`. Yang berubah dibanding Railway: container bersifat *stateless* dan bisa dimatikan kapan saja, sehingga database, session, cache, dan file upload harus berada di luar container.

```text
Internet → Cloud Run (Nginx + PHP-FPM + SSR)
                ├── Cloud SQL for MySQL   (database, session, cache)
                ├── Cloud Storage         (media upload, mount di storage/app/public)
                └── Secret Manager        (APP_KEY, password DB, password admin)
```

**Prasyarat**

```bash
gcloud auth login
gcloud config set project PROJECT_ID
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

Akun yang menjalankan skrip sebaiknya punya `roles/run.admin`, `roles/iam.serviceAccountUser`, `roles/cloudbuild.builds.editor`, dan `roles/artifactregistry.admin` (atau gunakan Owner/Editor untuk uji coba). Cloud Build juga harus bisa menulis image ke Artifact Registry.

**1. Buat Cloud SQL MySQL**

```bash
export PROJECT_ID=project-anda
export REGION=asia-southeast2

gcloud sql instances create devcraft-mysql \
  --database-version=MYSQL_8_4 \
  --tier=db-f1-micro \
  --region="$REGION" \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=18:00

gcloud sql databases create devcraft --instance=devcraft-mysql
gcloud sql users create devcraft --instance=devcraft-mysql --password='GANTI-PASSWORD-KUAT'
```

Bila tier `db-f1-micro` tidak tersedia untuk MySQL 8.4 di region Anda, pakai `--tier=db-custom-1-3840` atau `--database-version=MYSQL_8_0`. Jangan memakai SQLite di Cloud Run: filesystem container tidak persisten.

**2. Buat bucket media dan service account**

```bash
gcloud storage buckets create "gs://${PROJECT_ID}-devcraft-media" \
  --location="$REGION" \
  --uniform-bucket-level-access

gcloud iam service-accounts create devcraft-run \
  --display-name="DevCraft Cloud Run"

export SA="devcraft-run@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA}" --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA}" --role="roles/secretmanager.secretAccessor"
gcloud storage buckets add-iam-policy-binding "gs://${PROJECT_ID}-devcraft-media" \
  --member="serviceAccount:${SA}" --role="roles/storage.objectAdmin"
```

**3. Simpan rahasia di Secret Manager**

```bash
# Output `key:generate --show` sudah termasuk prefix "base64:".
APP_KEY_VALUE="$(php artisan key:generate --show)"
printf '%s' "$APP_KEY_VALUE" | gcloud secrets create devcraft-app-key --data-file=-

printf '%s' 'GANTI-PASSWORD-DB'    | gcloud secrets create devcraft-db-password --data-file=-
printf '%s' 'GANTI-PASSWORD-ADMIN' | gcloud secrets create devcraft-admin-password --data-file=-
```

`ADMIN_PASSWORD` minimal 12 karakter dan tidak boleh sama dengan password demo `DevCraft#2026`.

**4. Deploy**

Pakai skrip yang sudah disiapkan:

```bash
export PROJECT_ID=project-anda
export REGION=asia-southeast2
export APP_URL=https://devcraft-studio-xxxxx-as.a.run.app
export CLOUD_SQL_INSTANCE="${PROJECT_ID}:${REGION}:devcraft-mysql"
export MEDIA_BUCKET="${PROJECT_ID}-devcraft-media"
export SERVICE_ACCOUNT="devcraft-run@${PROJECT_ID}.iam.gserviceaccount.com"
export ADMIN_EMAIL="owner@domain-anda.com"
export DB_DATABASE=devcraft
export DB_USERNAME=devcraft

./scripts/deploy-cloudrun.sh
```

Skrip akan membuat repository Artifact Registry bila belum ada, membangun image lewat Cloud Build, lalu men-deploy ke Cloud Run dengan:

- `--add-cloudsql-instances` → koneksi ke Cloud SQL lewat Unix socket `/cloudsql/...`.
- Cloud Storage mount di `/var/www/storage/app/public` dengan `uid=33;gid=33` agar PHP-FPM (`www-data`) bisa menulis.
- `SESSION_DRIVER=database`, `CACHE_STORE=database`, `QUEUE_CONNECTION=sync`.
- `APP_KEY`, `DB_PASSWORD`, dan `ADMIN_PASSWORD` dari Secret Manager.

Bila `APP_URL` belum diketahui, deploy sekali dengan URL sementara, salin URL dari output, lalu jalankan ulang skrip dengan `APP_URL` yang benar.

**5. Verifikasi**

```bash
gcloud run services describe devcraft-studio --region "$REGION" --format='value(status.url)'
gcloud run services logs read devcraft-studio --region "$REGION" --limit 100
```

Buka `/up`, `/`, `/login`, dan `/desain`. Setelah login pertama, isi **Pengaturan** (kontak, WhatsApp, SMTP) seperti pada deploy Railway.

**6. Domain kustom**

`gcloud run domain-mappings` hanya tersedia di region tertentu (`asia-east1`, `asia-northeast1`, `asia-southeast1`, `europe-north1`, `europe-west1`, `europe-west4`, `us-central1`, `us-east1`, `us-east4`, `us-west1`) dan statusnya masih *preview*. Jadi bila memakai `REGION=asia-southeast2` (Jakarta), perintah domain mapping akan gagal.

Pilihan yang aman:

- **Paling sederhana:** pakai URL `https://...run.app` dari Cloud Run. HTTPS sudah otomatis, tidak perlu DNS.
- **Domain kustom di region yang didukung:** deploy Cloud Run + Cloud SQL di `asia-southeast1` (Singapore), lalu:
  ```bash
  gcloud run domain-mappings create \
    --service devcraft-studio \
    --domain devcraft.studio \
    --region asia-southeast1
  ```
  Ikuti instruksi DNS yang muncul, lalu ubah `APP_URL` menjadi `https://devcraft.studio` dan jalankan ulang deploy.
- **Produksi di Jakarta:** gunakan Global External Application Load Balancer + serverless NEG + Google-managed certificate, lalu arahkan DNS ke IP load balancer. Ini opsi yang direkomendasikan Google untuk domain kustom produksi.

**Catatan Cloud Run:**

- **Cold start** bisa 20–60 detik karena container menjalankan migrasi, cache, dan SSR. Untuk situs produksi yang selalu responsif, set `MIN_INSTANCES=1` (ada biaya tambahan). Untuk demo, `MIN_INSTANCES=0` sudah cukup.
- **Migrasi saat boot**: skrip memakai `MAX_INSTANCES=1` agar tidak ada dua instance menjalankan migrasi bersamaan. Bila ingin scale-out, set `RUN_MIGRATIONS=false` pada service, lalu jalankan migrasi sebagai Cloud Run Job:
  ```bash
  export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/devcraft/devcraft-studio:latest"

  gcloud run jobs create devcraft-migrate \
    --image "$IMAGE" --region "$REGION" \
    --service-account "$SA" \
    --command php --args artisan,migrate,--force \
    --add-cloudsql-instances "$CLOUD_SQL_INSTANCE" \
    --set-env-vars "APP_ENV=production,DB_CONNECTION=mysql,DB_DATABASE=devcraft,DB_USERNAME=devcraft,DB_SOCKET=/cloudsql/$CLOUD_SQL_INSTANCE" \
    --set-secrets "APP_KEY=devcraft-app-key:latest,DB_PASSWORD=devcraft-db-password:latest"

  gcloud run jobs execute devcraft-migrate --region "$REGION" --wait
  ```
- **Media upload** memakai Cloud Storage FUSE, bukan filesystem POSIX penuh. Cocok untuk foto/cover MVP, tetapi tidak untuk file locking atau ribuan file kecil yang ditulis bersamaan. Untuk kebutuhan lebih berat, ganti ke adapter GCS/S3 di Laravel.
- **Scheduler tidak berjalan otomatis.** Untuk `app:prune-design-briefs`, buat Cloud Run Job + Cloud Scheduler (mis. harian 03:00 WIB).
- **Jangan menyimpan `.env` di image.** Semua konfigurasi masuk lewat env/Secret Manager.
- **Perkiraan biaya**: Cloud Run sendiri punya free tier besar dan bisa turun ke nol saat idle. Biaya utama biasanya Cloud SQL (`db-f1-micro` sekitar $8–10/bulan) ditambah storage dan Artifact Registry. Dengan `MIN_INSTANCES=1`, tambahkan sekitar $5–10/bulan. Cek pricing resmi sebelum produksi.

### 7.7 Setelah deploy

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
