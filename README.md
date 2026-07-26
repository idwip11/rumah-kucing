# Rumah Kucing

Rumah Kucing adalah aplikasi pet care untuk pemilik kucing yang menggabungkan profil kucing, timeline perawatan, katalog produk, rekomendasi personal, edukasi, Catpedia, dan admin panel dalam satu ekosistem. Aplikasi ini dirancang agar pengalaman pengguna tidak berhenti pada daftar produk, tetapi terasa seperti advisor pribadi yang memahami konteks kucing yang sedang dipilih.

Project ini terdiri dari dua aplikasi Next.js:

- **Customer App**: aplikasi utama untuk pengguna di `http://localhost:3000`.
- **Admin Panel**: aplikasi admin di `http://localhost:3001` yang memakai API Customer App sebagai sumber data utama.

## Gambaran Aplikasi

Rumah Kucing membantu pengguna menyimpan profil kucing, mencatat aktivitas dan riwayat perawatan, mencari produk yang sesuai, membaca artikel edukasi, bertanya ke Ketty AI, dan menjelajahi database ras kucing melalui Catpedia.

Contoh pengalaman yang dituju:

> Karena kucing aktif adalah Persia dewasa, sudah steril, dan hidup indoor, aplikasi dapat memprioritaskan makanan adult sterilized, dukungan skin & coat, reminder grooming, hidrasi, serta artikel perawatan bulu panjang.

Rekomendasi dibuat transparan: setiap produk punya alasan, caution, dan warning dokter hewan jika terkait produk medis atau veterinary.

## Struktur Project

```text
pet care/
├── app/                         # Route Customer App dan API utama
│   ├── api/                     # API customer, rekomendasi, auth, admin, Catpedia
│   ├── breeds/                  # Catpedia, detail ras, compare, quiz
│   ├── chat/                    # Ketty AI
│   ├── explore/                 # Artikel, edukasi, produk, event
│   ├── cart/                    # Keranjang belanja
│   ├── timeline/                # Timeline perawatan
│   └── ...
├── components/                  # Komponen Customer App
├── lib/                         # Prisma, session, rule engine, helper Catpedia
├── store/                       # Client state dengan Zustand
├── prisma/                      # Prisma schema, migration, seed
├── public/                      # Asset publik
├── scripts/                     # Script utilitas, termasuk admin user
├── admin-panel/                 # Aplikasi Admin Panel terpisah
│   ├── app/                     # Route Admin Panel
│   ├── components/              # Komponen admin
│   └── lib/                     # Client API admin
└── implementation_plan_phase_*.md
```

## Fitur Customer App

### 1. Autentikasi Pengguna

- Signup, login, logout.
- Session pengguna memakai cookie HTTP-only `rumah_kucing_session`.
- Password disimpan sebagai hash menggunakan `bcryptjs`.
- Data personal hanya dimuat saat user sudah terautentikasi.
- Cart, profil kucing, timeline, pesanan, achievement, dan rekomendasi disinkronkan berdasarkan user aktif.
- Guest tidak boleh melihat cart atau data user sebelumnya.

### 2. Dashboard Personal

- Menampilkan profil kucing yang sedang aktif.
- Menampilkan artikel dan rekomendasi yang relevan.
- Menampilkan section **Rekomendasi untuk [nama kucing]**.
- Memakai derived cat profile dari data kucing pengguna.
- Memuat ulang data user setelah login tanpa membutuhkan hard refresh.

### 3. Profil Kucing

Data profil kucing mencakup:

- Nama.
- Ras, terhubung ke `cat_breeds` jika tersedia.
- Perkiraan tanggal lahir.
- Berat badan.
- Gender.
- Status steril.
- Lifestyle, seperti indoor, outdoor, atau campuran.
- Catatan kondisi atau preferensi.
- Foto profil.

Profil ini menjadi dasar rekomendasi produk, care insight, dan jawaban Ketty AI.

### 4. Timeline Perawatan

Timeline digunakan untuk mencatat aktivitas dan kejadian penting, seperti:

- Vaksin.
- Berat badan.
- Riwayat sakit.
- Makanan.
- Grooming.
- Momen foto.
- Catatan lain.

Timeline juga menjadi sumber sinyal untuk smart recommendation. Contohnya, catatan hairball, berat badan naik, grooming terakhir, riwayat sakit, atau perubahan makanan dapat memengaruhi insight dan rekomendasi.

### 5. Smart Recommendation Phase 2

Sistem rekomendasi produk memakai rule engine terpusat, bukan daftar produk acak.

Faktor yang dipertimbangkan:

- Life stage: kitten, adult, senior.
- Ras dan panjang bulu.
- Status steril.
- Lifestyle indoor/outdoor.
- Berat badan.
- Sinyal kesehatan dan perawatan dari timeline.
- Alergi atau bahan yang perlu dihindari dari catatan profil.
- Riwayat feedback pengguna.
- Riwayat order atau produk yang pernah dicoba.
- Kategori dan tag produk dari database.

Setiap rekomendasi produk mencakup:

- Label kecocokan seperti `Sangat cocok`, `Cocok`, `Cukup cocok`, `Kurang sesuai`, atau `Tidak direkomendasikan`.
- Minimal dua alasan rekomendasi.
- Key benefits.
- Cautions.
- Suitable cat type.
- Safety warning untuk produk medis, suplemen, prescription diet, veterinary diet, obat, vitamin, urinary/renal product, atau produk pemulihan.

Aplikasi tidak menampilkan persentase kecocokan seperti `85%` atau `92%`, agar rekomendasi tetap transparan dan tidak terlihat lebih pasti daripada data yang tersedia.

### 6. Feedback Rekomendasi

Pengguna dapat memberi respons terhadap rekomendasi produk:

- Suka.
- Tidak suka.
- Belum dicoba.
- Menimbulkan masalah.
- Simpan sebagai favorit.

Feedback ini memengaruhi rekomendasi berikutnya. Produk yang menimbulkan masalah tidak diprioritaskan, sementara preferensi rasa dari produk makanan dapat dipelajari secara ringan.

### 7. Keranjang dan Pesanan

- Cart hanya dimuat untuk user yang sudah login.
- Saat tidak ada user, cart selalu kosong dan badge count `0`.
- Produk dapat ditambahkan ke cart dari halaman produk/rekomendasi.
- Checkout disimpan sebagai order.
- Order memiliki status seperti `Menunggu`, `Dikonfirmasi`, `Selesai`, atau `Batal`.
- Channel default pesanan adalah WhatsApp.

### 8. Ketty AI

Ketty AI adalah asisten edukasi dan advisor ringan untuk pengguna Rumah Kucing.

Kemampuan Ketty:

- Menjawab pertanyaan umum tentang profil user dan kucingnya.
- Menggunakan kucing aktif sebagai konteks.
- Menggunakan derived cat profile untuk pertanyaan produk.
- Mengambil rekomendasi produk dari rule engine sebagai sumber kebenaran.
- Menjelaskan rekomendasi secara natural, bukan hanya mengulang katalog.
- Menjawab topik database seperti ras kucing, artikel, produk, order, jadwal, dan profil kucing.
- Memberi guardrail saat topik menyentuh kondisi medis.

Batasan Ketty:

- Tidak mendiagnosis penyakit.
- Tidak menjamin produk menyembuhkan kondisi tertentu.
- Tidak memberi dosis obat, vitamin, atau suplemen.
- Untuk kondisi medis dan veterinary product, Ketty harus menyarankan konsultasi dokter hewan.

### 9. Explore

Halaman Explore berisi konten edukasi dan discovery:

- Artikel perawatan.
- Tips kesehatan.
- Event dan acara.
- Produk terkait.
- Search yang memakai logic global search agar hasil konsisten dengan search utama.

### 10. Global Search

Search digunakan untuk mencari konten lintas domain:

- Artikel.
- Produk.
- Event.
- Penyakit atau topik edukasi.
- Ras kucing.
- Data user yang relevan saat login.

Hasil search mengarah ke route yang sesuai, misalnya detail artikel, produk, Catpedia, atau halaman terkait.

### 11. Catpedia by Rumah Kucing

Catpedia adalah pengembangan menu **Ras Kucing** menjadi database pengetahuan ras kucing.

Fitur utama Catpedia:

- Homepage `/breeds` dengan search dan discovery shelf.
- Detail permanen `/breeds/[slug]`.
- Metadata SEO per ras.
- View tracking dan popularity.
- Compare maksimal tiga ras.
- Quiz pencocokan ras.
- Ras favorit pengguna.
- Daftar personal: Favorit, Ingin dipelajari, Pertimbangan adopsi, dan Pernah dipelihara.
- Domestic/non-pedigree tetap diperlakukan penting, bukan hanya ras murni.

Data detail ras mencakup:

- Nama dan slug permanen.
- Nama alternatif.
- Asal.
- Ringkasan dan deskripsi panjang.
- Foto utama dan backdrop.
- Ukuran.
- Berat jantan/betina.
- Harapan hidup.
- Panjang dan pola bulu.
- Tingkat aktivitas.
- Tingkat vokal.
- Kecocokan indoor.
- Skor panduan seperti beginner fit, aktivitas, keramahan, grooming, vokal, adaptasi, anak, dan hewan lain.
- Guide perawatan.
- Guide nutrisi.
- Catatan kesehatan.
- Estimasi biaya.
- Galeri.
- Variasi warna/pola.
- Ras serupa.
- Artikel terkait.
- Produk dan layanan terkait.

Catatan kesehatan di Catpedia bersifat edukatif dan bukan diagnosis dokter hewan.

### 12. Compare Ras

Route `/breeds/compare?ids=...` membandingkan hingga tiga ras.

Aspek yang dibandingkan:

- Aktivitas.
- Perawatan bulu.
- Cocok pemula.
- Vokal.
- Cocok indoor.
- Estimasi biaya.
- Risiko obesitas.
- Waktu bermain.

Hasil compare memakai bahasa panduan umum, bukan klaim mutlak.

### 13. Quiz Ras

Route `/breeds/quiz` membantu pengguna menemukan ras yang mungkin cocok berdasarkan:

- Rumah atau apartemen.
- Lama rumah kosong.
- Preferensi kucing aktif atau tenang.
- Kesiapan grooming.
- Anak kecil.
- Hewan lain.
- Budget bulanan.
- Apakah ini kucing pertama.

Hasil menampilkan tiga ras yang paling sesuai beserta alasan dan catatan pertimbangan.

### 14. Akun Pengguna

Halaman akun menampilkan data pengguna dan section **Ras Pilihanku**.

Pengguna dapat melihat dan menghapus ras yang disimpan dalam list:

- Favorit.
- Ingin dipelajari.
- Pertimbangan adopsi.
- Pernah dipelihara.

## Fitur Admin Panel

Admin Panel berjalan sebagai aplikasi Next.js terpisah di folder `admin-panel`, tetapi semua data tetap disimpan melalui API Customer App.

Modul admin:

- **Dashboard**: ringkasan statistik aplikasi.
- **Users**: melihat data user dan detail pengguna.
- **Cats**: melihat profil kucing pengguna.
- **Orders**: melihat pesanan dan mengubah status order.
- **Products**: create, edit, update, delete produk dan upload gambar produk.
- **Breeds**: create, edit, update, delete data Catpedia.
- **Articles**: create, edit, update, delete artikel edukasi.
- **Events**: create, edit, update, delete event.
- **Analytics**: ringkasan metrik aplikasi.
- **Settings**: informasi konfigurasi admin dan session.

Admin Panel memakai cookie HTTP-only `admin_session` yang ditandatangani server. Admin user disimpan di tabel `admin_users`.

## Teknologi Yang Dipakai

### Frontend

- **Next.js 14** dengan App Router.
- **React 18**.
- **TypeScript**.
- **Tailwind CSS** untuk styling.
- **Lucide React** untuk ikon.
- **Zustand** untuk sebagian client-side state.
- **React Markdown** dan **remark-gfm** untuk render jawaban/chat berbasis markdown.

### Backend dan API

- **Next.js Route Handlers** di `app/api`.
- API customer untuk auth, cats, timeline, products, recommendations, chat, search, articles, breeds, cart/order.
- API admin di `app/api/admin`.
- Session customer memakai custom signed cookie.
- Session admin memakai custom signed cookie.
- Password hashing memakai `bcryptjs`.
- Validasi input memakai `zod` pada beberapa modul.

### Database

- **PostgreSQL**.
- **Prisma ORM 7**.
- Prisma schema berada di `prisma/schema.prisma`.
- Seed database berada di `prisma/seed.ts`.

### Integrasi AI

- Ketty AI memakai API chat internal di `app/api/chat/route.ts`.
- Jika model eksternal tidak tersedia, sistem tetap mencoba menjawab dari database Rumah Kucing.
- Variabel `GROQ_API_KEY` dapat dipakai untuk layanan model eksternal jika dikonfigurasi.

### Development Tooling

- **npm**.
- **concurrently** untuk menjalankan Customer App dan Admin Panel bersamaan.
- **ESLint**.
- **TypeScript typecheck**.
- **tsx** untuk test dan script TypeScript.
- **node-cron** tersedia untuk kebutuhan scheduled task.

## Model Data Utama

Database utama berisi model berikut:

- `User`: akun customer.
- `AdminUser`: akun admin panel.
- `Cat`: profil kucing milik user.
- `CatBreed`: master data ras dan Catpedia.
- `BreedCareGuide`: guide perawatan ras.
- `BreedNutritionGuide`: guide nutrisi ras.
- `BreedHealthNote`: catatan kesehatan edukatif ras.
- `BreedCostEstimate`: estimasi biaya ras.
- `BreedGalleryImage`: galeri gambar ras.
- `BreedColorPattern`: variasi warna dan pola.
- `BreedSimilar`: relasi ras serupa.
- `BreedSuitability`: cocok untuk/perlu dipertimbangkan.
- `BreedFavorite`: daftar ras pilihan pengguna.
- `BreedView`: tracking view Catpedia.
- `TimelineEvent`: catatan timeline perawatan.
- `Achievement`: prestasi kucing.
- `Product`: katalog produk.
- `ProductTag`: tag produk untuk search dan rekomendasi.
- `RecommendationFeedback`: feedback pengguna terhadap rekomendasi.
- `Order` dan `OrderItem`: data pesanan.
- `Article`, `ArticleSection`, `ArticleTakeaway`: artikel edukasi.
- `Event`: event kucing.
- `ChatMessage`: riwayat chat Ketty AI.

## Prasyarat

- Node.js 18 atau lebih baru.
- npm.
- PostgreSQL lokal atau remote.

## Environment Variables

Buat file `.env.local` di root project.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rumah_kucing"
NEXTAUTH_SECRET="change-this-to-a-random-secret-string"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_SESSION_SECRET="change-this-to-another-random-secret-string"
ADMIN_PANEL_ORIGIN="http://localhost:3001"
GROQ_API_KEY="optional-groq-api-key"
```

Catatan:

- `NEXTAUTH_SECRET` saat ini dipakai sebagai secret session customer walaupun implementasinya custom, bukan NextAuth package.
- `ADMIN_SESSION_SECRET` dipakai untuk menandatangani cookie admin. Jika kosong, sistem fallback ke `NEXTAUTH_SECRET`.
- `GROQ_API_KEY` opsional. Ketty tetap memiliki fallback berbasis database saat model eksternal tidak tersedia.

Buat file `admin-panel/.env.local` untuk Admin Panel.

```env
NEXT_PUBLIC_CUSTOMER_API_URL="http://localhost:3000"
```

Admin Panel tidak menyimpan database sendiri. Ia memanggil API root melalui `NEXT_PUBLIC_CUSTOMER_API_URL`.

## Instalasi

Install dependency root:

```bash
npm install
```

Install dependency Admin Panel:

```bash
cd admin-panel
npm install
cd ..
```

Generate Prisma Client:

```bash
npm run db:generate
```

Jalankan migration:

```bash
npm run db:migrate
```

Seed database:

```bash
npm run db:seed
```

Buat admin user:

```bash
npm run admin:create
```

Reset password admin jika diperlukan:

```bash
npm run admin:reset-password
```

## Menjalankan Aplikasi

Jalankan Customer App saja:

```bash
npm run dev
```

Customer App akan tersedia di:

```text
http://localhost:3000
```

Jalankan Admin Panel dari root:

```bash
npm run dev:admin
```

Admin Panel akan tersedia di:

```text
http://localhost:3001
```

Jalankan keduanya sekaligus:

```bash
npm run dev:all
```

## Script Root

```bash
npm run dev                  # Menjalankan Customer App di port 3000
npm run dev:admin            # Menjalankan Admin Panel di port 3001
npm run dev:all              # Menjalankan Customer App dan Admin Panel bersamaan
npm run build                # Build Customer App
npm run start                # Start Customer App production
npm run lint                 # Lint Customer App
npm run typecheck            # TypeScript typecheck
npm run test:recommendations # Test rule engine rekomendasi
npm run db:generate          # Generate Prisma Client
npm run db:migrate           # Jalankan Prisma migration
npm run db:seed              # Seed database
npm run db:studio            # Buka Prisma Studio
npm run admin:create         # Buat admin user
npm run admin:reset-password # Reset password admin
```

## Script Admin Panel

Jalankan dari folder `admin-panel`.

```bash
npm run dev     # Menjalankan Admin Panel di port 3001
npm run build   # Build Admin Panel
npm run start   # Start Admin Panel production di port 3001
npm run lint    # Lint Admin Panel
```

## Endpoint Penting

Customer API:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST/PATCH/DELETE /api/cats`
- `GET/POST/PATCH/DELETE /api/timeline`
- `GET /api/products`
- `GET /api/articles`
- `GET /api/breeds`
- `GET/POST/DELETE /api/breeds/favorites`
- `GET /api/search`
- `POST /api/chat`
- `GET /api/recommendations/dashboard`
- `GET /api/recommendations/products`
- `GET /api/recommendations/products/[productId]`
- `GET/POST/PATCH/DELETE /api/recommendations/feedback`

Admin API:

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`
- `GET /api/admin/dashboard`
- `GET /api/admin/analytics`
- `GET /api/admin/users`
- `GET /api/admin/cats`
- `GET/PATCH /api/admin/orders`
- `GET/POST/PATCH/DELETE /api/admin/products`
- `POST /api/admin/products/upload`
- `GET/POST/PATCH/DELETE /api/admin/breeds`
- `GET/POST/PATCH/DELETE /api/admin/articles`
- `GET/POST/PATCH/DELETE /api/admin/events`

## Halaman Penting

Customer App:

- `/` atau `/dashboard`
- `/login`
- `/signup`
- `/account`
- `/chat`
- `/timeline`
- `/cart`
- `/explore`
- `/explore/products`
- `/breeds`
- `/breeds/[slug]`
- `/breeds/compare`
- `/breeds/quiz`

Admin Panel:

- `/login`
- `/dashboard`
- `/users`
- `/cats`
- `/orders`
- `/products`
- `/breeds`
- `/articles`
- `/events`
- `/analytics`
- `/settings`

## Alur Data Rekomendasi

```text
Cat + Timeline + Product + Feedback + Order History
        ↓
Derived Cat Profile
        ↓
Recommendation Rule Engine
        ↓
Product Match Result
        ↓
Dashboard, Product Detail, Ketty AI
```

Rule engine berada di `lib/recommendations`. Tujuannya agar dashboard, product page, dan Ketty AI memakai logic yang sama.

## Alur Data Catpedia

```text
Admin Panel
   ↓
/api/admin/breeds
   ↓
PostgreSQL / Prisma Catpedia Tables
   ↓
Customer App: /breeds, /breeds/[slug], compare, quiz, Ketty AI
```

Admin Panel menjadi tempat pengelolaan data, tetapi Customer App API dan database tetap menjadi single source of truth.

## Prinsip Keamanan dan Guardrail

- Data user hanya boleh diakses oleh session user tersebut.
- Cart guest harus selalu kosong.
- Admin route wajib melewati `requireAdmin`.
- Password tidak disimpan dalam bentuk plain text.
- Produk medis tidak boleh direkomendasikan tanpa warning dokter hewan.
- Ketty AI tidak boleh mendiagnosis atau memberi dosis obat/suplemen.
- Konten kesehatan Catpedia bersifat edukasi, bukan diagnosis.

## Troubleshooting

### Customer App menampilkan 404 di `localhost:3000`

Pastikan dev server Customer App berjalan dari root project:

```bash
npm run dev
```

### Admin Panel tampil tanpa styling

Pastikan dependency Admin Panel sudah diinstall dan dev server dijalankan dari folder/paket admin:

```bash
cd admin-panel
npm install
npm run dev
```

Jika masih bermasalah, hentikan server lama lalu jalankan ulang.

### Admin Panel tidak bisa mengambil data

Pastikan:

- Customer App aktif di `http://localhost:3000`.
- `admin-panel/.env.local` berisi `NEXT_PUBLIC_CUSTOMER_API_URL="http://localhost:3000"`.
- Admin sudah login melalui `/login`.
- `ADMIN_SESSION_SECRET` tersedia di root `.env.local`.

### Prisma gagal connect ke database

Pastikan:

- PostgreSQL berjalan.
- `DATABASE_URL` benar.
- Database sudah dibuat.
- Migration sudah dijalankan dengan `npm run db:migrate`.

### Ketty AI mengatakan model tidak tersedia

Pastikan `GROQ_API_KEY` tersedia jika ingin memakai model eksternal. Jika tidak, Ketty tetap akan mencoba menjawab dari database Rumah Kucing, tetapi jawaban bisa lebih terbatas.

## Status Pengembangan

Ringkasan phase yang sudah masuk ke aplikasi:

- **Phase 2**: Smart Recommendation dan Personalized Ketty AI.
- **Phase 3.1**: Schema Catpedia.
- **Phase 3.2**: Homepage Catpedia.
- **Phase 3.3**: Detail page ras permanen.
- **Phase 3.4**: Sinkronisasi Admin Panel untuk Catpedia.
- **Phase 3.5**: Compare ras.
- **Phase 3.6**: Quiz pencocokan ras.
- **Phase 3.7**: Ras favorit dan daftar personal pengguna.

Detail perencanaan dan riwayat implementasi tersedia di:

- `implementation_plan_phase_2.md`
- `implementation_plan_phase_3.md`
- `implementation_plan_phase_4.md`

## Lisensi

Project ini bersifat private dan digunakan untuk pengembangan aplikasi Rumah Kucing.
