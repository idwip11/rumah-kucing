# Implementation Plan Phase 3: Catpedia by Rumah Kucing

## Status Implementasi

Phase 3.1 diimplementasikan pada 26 Juli 2026.

- Selesai: schema Catpedia difinalisasi secara additive.
- Selesai: `CatBreed` diperluas dengan metadata detail, skor 1-10, status publish/featured, view count, dan tanggal update konten/komersial.
- Selesai: child tables dibuat untuk care guide, nutrition guide, health notes, cost estimates, gallery, color patterns, similar breeds, suitability, favorites, dan views.
- Selesai: enum dibuat untuk tipe galeri, tipe suitability, dan tipe list favorite.
- Selesai: migration `20260726152000_add_catpedia_schema` diterapkan ke database lokal.
- Selesai: field `shortDescription`, `contentUpdatedAt`, dan `commercialUpdatedAt` dibackfill dari data ras lama.
- Selesai: Prisma Client regenerated dan schema tervalidasi.

Phase 3.2 diimplementasikan pada 26 Juli 2026.

- Selesai: `/breeds` diubah menjadi homepage Catpedia yang edukatif.
- Selesai: hero, metadata halaman, search, dan quick filter diperbarui.
- Selesai: discovery shelf dibuat untuk populer, pemula, rumah kecil, aktif dan cerdas, perawatan ringan, serta domestic/campuran.
- Selesai: card ras diringankan menjadi foto, asal, ringkasan, tiga karakteristik, tingkat aktivitas, dan tingkat perawatan.
- Selesai: harga dan estimasi biaya dihapus dari card daftar.
- Selesai: ketersediaan komersial dipisahkan ke section `Tersedia di Sumber Jaya`.
- Selesai: `Lihat Profil Ras` membuka ringkasan yang tetap berfungsi sebelum detail route Phase 3.3 tersedia.
- Selesai: data schema baru dibaca dengan fallback ke metadata lama yang sudah tersedia.

Phase 3.3 diimplementasikan pada 26 Juli 2026.

- Selesai: route detail permanen `/breeds/[slug]` dibuat untuk setiap ras published.
- Selesai: metadata SEO detail ras dibuat dinamis berdasarkan nama dan ringkasan ras.
- Selesai: halaman detail menampilkan hero, skor panduan, tentang ras, fakta singkat, temperamen, perawatan, nutrisi, kesehatan, kecocokan, estimasi biaya, galeri, warna/pola, ras serupa, artikel terkait, dan produk terkait.
- Selesai: detail page membaca child tables Catpedia dengan fallback ke field lama agar halaman tetap berguna meski data admin belum lengkap.
- Selesai: data kesehatan memakai guardrail edukatif dan tidak menyatakan diagnosis.
- Selesai: view tracking `BreedView` dan `viewCount` dipasang pada detail page.
- Selesai: card, discovery shelf, dan section ketersediaan di `/breeds` mengarah ke halaman detail.
- Selesai: global search ras mengarah ke `/breeds/[slug]` dan mencari metadata Catpedia baru.

Phase 3.5 diimplementasikan pada 26 Juli 2026.

- Selesai: compare tray maksimal 3 ras ditambahkan di homepage Catpedia.
- Selesai: card ras memiliki aksi `Bandingkan` dengan state selected dan disabled saat sudah mencapai 3 ras.
- Selesai: route `/breeds/compare?ids=...` dibuat dan menerima ID atau slug ras.
- Selesai: halaman compare menampilkan tabel aktivitas, perawatan bulu, cocok pemula, vokal, indoor fit, estimasi biaya, risiko obesitas, dan waktu bermain.
- Selesai: ringkasan rekomendasi memakai bahasa panduan umum dan tidak menyatakan hasil sebagai kebenaran mutlak.
- Selesai: tombol `Bandingkan` dari halaman detail ras mengarah ke halaman compare dengan ras tersebut sebagai pilihan awal.

Phase 3.6 diimplementasikan pada 26 Juli 2026.

- Selesai: route `/breeds/quiz` dibuat sebagai wizard kecocokan ras.
- Selesai: quiz menanyakan rumah/apartemen, lama rumah kosong, preferensi energi, kesiapan grooming, anak kecil, hewan lain, budget bulanan, dan apakah ini kucing pertama.
- Selesai: hasil menampilkan tiga ras yang paling cocok berdasarkan data Catpedia published.
- Selesai: Domestic/domestik/lokal/campuran diberi pertimbangan positif agar tidak kalah dari ras pedigree ketika sesuai preferensi.
- Selesai: setiap hasil berisi skor preferensi, alasan, dan catatan yang perlu dipertimbangkan.
- Selesai: copy menjelaskan bahwa skor adalah kecocokan preferensi, bukan kepastian sifat setiap individu kucing.
- Selesai: hasil quiz dapat langsung dibuka ke detail ras atau dibandingkan lewat `/breeds/compare`.

Phase 3.7 diimplementasikan pada 26 Juli 2026.

- Selesai: API authenticated `/api/breeds/favorites` dibuat sebagai sumber tunggal untuk membaca, menyimpan, dan menghapus ras dari daftar pengguna.
- Selesai: empat jenis daftar didukung sesuai schema: Favorit, Ingin dipelajari, Pertimbangan adopsi, dan Pernah dipelihara.
- Selesai: tombol `Simpan` pada setiap card utama Catpedia membuka pemilih daftar dan menyimpan perubahan ke PostgreSQL.
- Selesai: tombol `Simpan` pada hero detail ras memakai kontrol dan data backend yang sama.
- Selesai: guest diarahkan ke login dan dikembalikan ke halaman Catpedia asal setelah login berhasil.
- Selesai: section `Ras Pilihanku` ditambahkan ke halaman akun dengan tab per jenis daftar, detail ras, dan aksi hapus.
- Selesai: data daftar hanya dibaca dari sesi pengguna aktif dan endpoint selalu memakai `Cache-Control: no-store`.
- Selesai: tombol card `Bandingkan` dan `Lihat Profil Ras` tetap terhubung ke compare tray dan permanent detail route.
- Selesai: tombol detail `Tanyakan ke Ketty` dan `Tanyakan Ketersediaan` sekarang mengisi pertanyaan ras yang relevan di halaman chat.

Berikutnya: Phase 3.8, integrasi Ketty AI Catpedia.

## 1. Tujuan Phase 3

Phase 3 mengubah menu **Ras Kucing** dari katalog ras sederhana menjadi **Catpedia by Rumah Kucing**: database pengetahuan ras kucing yang kaya, searchable, filterable, bisa dibandingkan, disimpan, dan dapat terus diperbarui melalui admin panel.

Prinsip yang diambil dari inspirasi seperti TMDB bukan bentuk visual mentahnya, melainkan pola produk:

- Satu entitas punya halaman detail permanen yang kaya.
- Metadata tersusun dan saling terhubung.
- Pengguna bisa mencari, memfilter, membandingkan, menyimpan, dan mengeksplorasi entitas terkait.
- Data dapat diperbarui dari admin panel tanpa perlu edit kode.

Untuk Rumah Kucing, entitas utamanya adalah **ras kucing**, bukan film. Fokusnya tetap edukasi, perawatan, kecocokan pemilik, dan adopsi yang bertanggung jawab.

## 2. Prinsip Produk

### 2.1 Pengetahuan dulu, komersial kedua

Halaman Ras Kucing tidak boleh terasa seperti katalog jual-beli.

Lapisan utama:

- Informasi ras.
- Karakter dan temperamen.
- Ukuran dan berat.
- Harapan hidup.
- Grooming dan perawatan.
- Nutrisi.
- Risiko kesehatan yang perlu dipantau.
- Estimasi biaya.
- Kecocokan pemilik.
- Galeri, variasi warna, ras serupa, artikel terkait.

Lapisan layanan Sumber Jaya:

- Ketersediaan adopsi atau konsultasi.
- Starter pack.
- Produk yang relevan.
- Grooming atau pet hotel terkait.

CTA komersial hanya muncul kontekstual, bukan menjadi aksi utama semua kartu.

### 2.2 Ras tidak tersedia tetap bernilai

Ras yang `Not Available` tetap harus punya halaman detail edukatif. Ketersediaan adalah metadata layanan, bukan penentu apakah ras layak tampil.

### 2.3 Pedigree dan non-pedigree sama-sama penting

Database wajib memasukkan:

- Domestic Shorthair.
- Domestic Longhair.
- Kucing domestik/campuran lokal.

Catpedia tidak boleh memberi kesan bahwa hanya ras murni yang bernilai.

### 2.4 Aman secara medis

Bagian kesehatan harus memakai bahasa edukatif:

> Konten ini bersifat edukasi dan bukan diagnosis dokter hewan.

Tidak boleh menyatakan semua individu ras tertentu pasti mengalami penyakit tertentu.

### 2.5 Data yang berubah harus punya tanggal pembaruan

Harga, biaya bulanan, ketersediaan, dan informasi layanan harus memiliki `updatedAt` atau label "Diperbarui ...".

## 3. Current State

Saat ini:

- Customer page: `app/breeds/page.tsx`.
- Explorer client: `components/breeds-explorer.tsx`.
- Card: `components/breed-card.tsx`.
- Admin page: `admin-panel/app/breeds/page.tsx`.
- Admin API: `app/api/admin/breeds/*`.
- Schema utama: `CatBreed` dan `BreedCharacteristic`.

Field saat ini:

- `slug`, `name`, `origin`, `imageSrc`.
- `profileSummary`, `foodType`.
- `kittenPriceLabel`, `monthlyCareLabel`.
- `careLevel`, `availability`, `matchLabel`.
- `characteristics`.

Keterbatasan:

- Belum ada route detail `/breeds/[slug]`.
- Belum ada skor temperamen terstruktur.
- Belum ada section grooming, nutrisi, kesehatan, biaya, galeri, warna, similar breeds.
- Belum ada favorite/watchlist.
- Belum ada compare.
- Belum ada quiz kecocokan ras.
- Search global masih mengarah ke `/breeds`, bukan detail ras.
- Admin form belum cukup untuk mengelola Catpedia lengkap.

## 4. Target UX

### 4.1 Homepage Catpedia

Route: `/breeds`

Headline:

> Temukan ras kucing yang paling cocok untukmu

Subcopy:

> Jelajahi karakter, kebutuhan perawatan, kesehatan, dan gaya hidup berbagai ras kucing sebelum memutuskan untuk merawatnya.

Search placeholder:

> Cari ras, sifat, ukuran, atau kebutuhan perawatan...

Section utama:

- Populer Minggu Ini.
- Cocok untuk Pemula.
- Cocok untuk Rumah Kecil.
- Ras Aktif dan Cerdas.
- Perawatan Bulu Rendah.
- Domestic dan Campuran yang Layak Dipertimbangkan.
- Tersedia di Sumber Jaya.

### 4.2 Card Ras Versi Ringan

Card list cukup menampilkan:

- Foto.
- Nama ras.
- Negara asal.
- Ringkasan satu kalimat.
- Tiga tag utama.
- Tingkat aktivitas.
- Tingkat perawatan.
- Tombol `Lihat Profil Ras`.
- Icon simpan.
- Control compare.

Harga dan biaya bulanan dipindahkan ke halaman detail.

CTA utama:

- `Lihat Profil Ras`

CTA tambahan jika relevan:

- `Bandingkan`
- `Simpan`
- `Tanyakan Ketersediaan`

### 4.3 Detail Page Ras

Route permanen:

- `/breeds/british-shorthair`
- `/breeds/persian`
- `/breeds/domestic-shorthair`

SEO title:

> British Shorthair: Karakter, Perawatan, Kesehatan, dan Biaya

SEO description:

> Panduan lengkap British Shorthair, mulai dari sifat, kebutuhan makanan, grooming, kesehatan, hingga kecocokan untuk pemilik pemula.

Hero detail:

- Backdrop/foto besar.
- Nama ras.
- Nama alternatif.
- Negara asal.
- Ringkasan karakter.
- Tombol simpan.
- Tombol bandingkan.
- Tombol bagikan.
- CTA ketersediaan hanya jika tersedia.

Skor ringkas:

- Cocok untuk pemula.
- Aktivitas.
- Keramahan.
- Perawatan bulu.
- Vokal.
- Adaptasi.

Catatan:

> Skor ini adalah panduan umum. Kepribadian setiap kucing tetap dipengaruhi lingkungan, sosialisasi, dan pengalaman hidupnya.

## 5. Struktur Detail Page

### A. Tentang Ras Ini

Konten naratif 2-4 paragraf:

- Sejarah singkat.
- Karakter umum.
- Kebiasaan.
- Keunikan ras.

### B. Fakta Singkat

Field:

- Asal.
- Ukuran.
- Berat dewasa jantan.
- Berat dewasa betina.
- Harapan hidup.
- Panjang bulu.
- Pola bulu.
- Aktivitas.
- Vokal.
- Cocok indoor/outdoor.

### C. Karakter dan Temperamen

Tampilkan progress bar/radar:

- Ramah.
- Mandiri.
- Aktif.
- Cerdas.
- Vokal.
- Mudah beradaptasi.
- Cocok dengan anak-anak.
- Cocok dengan hewan lain.

### D. Kebutuhan Perawatan

Field:

- Frekuensi menyisir.
- Mandi.
- Perawatan mata.
- Perawatan telinga.
- Kuku.
- Dental care.
- Tingkat kerontokan.
- Risiko hairball.
- Catatan grooming khusus.

### E. Nutrisi

Utamakan kebutuhan, bukan merek:

- Life stage.
- Kecenderungan obesitas.
- Protein.
- Hidrasi.
- Kontrol porsi.
- Kebutuhan khusus.

Baru setelah itu:

- Produk terkait di Sumber Jaya.
- Penjelasan mengapa produk relevan.
- Guardrail untuk veterinary diet.

### F. Kesehatan yang Perlu Diperhatikan

Konten:

- Kondisi yang lebih sering dikaitkan dengan ras.
- Tanda yang perlu dipantau.
- Pemeriksaan rutin.
- Disclaimer edukasi.

Bahasa wajib:

- "Dapat memiliki kecenderungan..."
- "Perlu dipantau..."
- "Tidak semua individu..."

Hindari:

- "Pasti terkena..."
- "Produk ini mengobati..."
- Diagnosis.

### G. Cocok untuk Siapa?

Format:

`Cocok untuk:`

- Pemilik pertama.
- Apartemen/rumah kecil.
- Keluarga dengan rutinitas tenang.
- Pemilik yang bekerja di luar rumah.

`Perlu dipertimbangkan jika:`

- Ingin kucing sangat aktif.
- Ingin kucing yang selalu suka digendong.
- Tidak siap grooming intensif.
- Tidak siap kontrol berat badan.

### H. Estimasi Biaya

Pisahkan:

- Biaya awal.
- Kebutuhan bulanan.
- Grooming.
- Vaksin dan pemeriksaan.
- Perlengkapan awal.

Tampilkan:

- Rentang.
- Kota/area jika tersedia.
- Tanggal pembaruan.
- Catatan bahwa harga dapat berubah.

Harga beli kitten tidak menjadi fokus utama. Jika tetap ada, tempatkan sebagai data referensi, bukan CTA utama.

### I. Galeri

Tipe gambar:

- Foto utama.
- Backdrop.
- Wajah.
- Full body.
- Kitten.
- Dewasa.
- Variasi warna.
- Mata/bulu/detail.

### J. Variasi Warna dan Pola

Contoh:

- Blue.
- Lilac.
- Cream.
- Golden.
- Silver.
- Bicolor.
- Colorpoint.

Setiap variasi dapat memiliki foto dan deskripsi pendek.

### K. Ras Serupa

Contoh:

- Scottish Straight.
- Chartreux.
- Russian Blue.
- Exotic Shorthair.

Setiap similar breed harus punya alasan:

> Sama-sama tenang dan cocok untuk indoor, tetapi kebutuhan perawatannya berbeda.

### L. Artikel Terkait

Gunakan relasi `Article.breedId` yang sudah ada.

Contoh:

- Cara merawat British Shorthair.
- Menjaga berat badan kucing indoor.
- Cara mengenali BCS.

### M. Produk dan Layanan Terkait

Tetap di bagian bawah:

- Dry food.
- Wet food.
- Mainan.
- Grooming.
- Pet hotel.

Rekomendasi produk sebaiknya memakai rule engine rekomendasi yang sudah ada bila user login dan punya kucing aktif.

## 6. Data Model

### 6.1 Prinsip schema

Jangan memasukkan semua konten Catpedia ke satu kolom teks panjang. Gunakan field terstruktur untuk data yang akan difilter, dibandingkan, atau dicari.

Gunakan tiga jenis penyimpanan:

- Scalar fields untuk data inti.
- Child tables untuk list/galeri/relasi.
- JSON hanya untuk konten fleksibel yang belum stabil.

### 6.2 Perluasan `CatBreed`

Status Phase 3.1: field inti berikut sudah ditambahkan ke `CatBreed`:

- `alternativeNames String[] atau Json`
- `shortDescription Text`
- `backdropImageSrc String`
- `history Text`
- `personalityDescription Text`
- `sizeLabel String`
- `maleWeightRange String`
- `femaleWeightRange String`
- `lifeExpectancy String`
- `coatLength String`
- `coatPatterns String`
- `activityLevel String`
- `vocalLevel String`
- `indoorFit String`
- `beginnerFitScore Int`
- `activityScore Int`
- `friendlinessScore Int`
- `groomingScore Int`
- `vocalScore Int`
- `adaptabilityScore Int`
- `childFriendlyScore Int`
- `petFriendlyScore Int`
- `sourceNotes Text`
- `contentUpdatedAt DateTime`
- `commercialUpdatedAt DateTime`
- `viewCount Int`
- `isPublished Boolean`
- `isFeatured Boolean`
- `createdAt DateTime`
- `updatedAt DateTime`

Catatan: skor 1-10 disimpan numeric untuk compare dan filter.

### 6.3 Child tables yang disarankan

Status Phase 3.1: child tables berikut sudah dibuat.

`BreedCareGuide`

- `breedId`
- `brushingFrequency`
- `bathing`
- `eyeCare`
- `earCare`
- `nailCare`
- `dentalCare`
- `sheddingLevel`
- `hairballRisk`
- `notes`

`BreedNutritionGuide`

- `breedId`
- `lifeStageNotes`
- `proteinNotes`
- `hydrationNotes`
- `portionNotes`
- `obesityRisk`
- `specialNeeds`

`BreedHealthNote`

- `breedId`
- `title`
- `description`
- `severityLabel`
- `monitoringTips`
- `sortOrder`

`BreedCostEstimate`

- `breedId`
- `initialCostLabel`
- `monthlyCostLabel`
- `groomingCostLabel`
- `vaccineCheckupLabel`
- `starterKitLabel`
- `cityLabel`
- `updatedAt`
- `notes`

`BreedGalleryImage`

- `breedId`
- `url`
- `alt`
- `type`: main, backdrop, face, full_body, kitten, adult, color_variant.
- `colorPatternId`
- `credit`
- `sourceUrl`
- `sortOrder`

`BreedColorPattern`

- `breedId`
- `name`
- `description`
- `imageUrl`
- `sortOrder`

`BreedSimilar`

- `breedId`
- `similarBreedId`
- `reason`
- `sortOrder`

`BreedSuitability`

- `breedId`
- `type`: good_for, consider_if.
- `label`
- `description`
- `sortOrder`

`BreedFavorite`

- `userId`
- `breedId`
- `listType`: favorite, learn_later, adoption_consideration, had_before.
- `createdAt`

`BreedView`

- `breedId`
- `userId nullable`
- `sessionId nullable`
- `createdAt`

Untuk MVP, `BreedView` boleh ditunda dan `viewCount` bisa manual/seeded.

Catatan implementasi: `BreedView` tetap dibuat pada Phase 3.1 agar tracking page detail bisa dipasang nanti tanpa migration tambahan.

## 7. Admin Panel

### 7.1 Target

Admin harus bisa mengelola Catpedia tanpa edit seed atau kode.

### 7.2 Struktur admin breed editor

Ganti modal panjang menjadi halaman/detail editor dengan tab:

- Basic Info.
- Knowledge.
- Scores.
- Care.
- Nutrition.
- Health.
- Costs.
- Gallery.
- Colors.
- Similar Breeds.
- Commercial.
- SEO & Sources.

### 7.3 Basic Info

Field:

- Name.
- Slug.
- Alternative names.
- Origin.
- Main image.
- Backdrop image.
- Short description.
- Profile summary.
- Published status.
- Featured status.

### 7.4 Scores

Gunakan slider 1-10:

- Beginner fit.
- Activity.
- Friendliness.
- Grooming.
- Vocal.
- Adaptability.
- Child-friendly.
- Pet-friendly.

### 7.5 Commercial

Field:

- Availability.
- Availability label.
- Partner/source.
- Adoption note.
- Consultation CTA enabled.
- Starter pack notes.
- Commercial updated at.

Commercial tab dipisah agar admin tidak mencampur data edukasi dan jual-beli.

## 8. Customer Features

### 8.1 Phase 3.1 - Catpedia Homepage

Scope:

- Rename mental model dari Galeri Ras Kucing ke Catpedia.
- Hero + search baru.
- Discovery sections.
- Card ringan.
- CTA `Lihat Profil Ras`.
- Search/filter berbasis metadata yang ada.
- Pisahkan section `Tersedia di Sumber Jaya`.

Acceptance:

- List lebih mudah dipindai.
- Harga dan biaya tidak lagi dominan di card.
- Ras tidak tersedia tetap tampil sebagai konten edukatif.

### 8.2 Phase 3.3 - Breed Detail Page

Scope:

- Route `/breeds/[slug]`.
- Hero detail.
- Fakta singkat.
- Scores.
- Tentang ras.
- Care, nutrition, health, suitability, costs.
- Gallery sederhana.
- Artikel terkait.
- Similar breeds.
- SEO metadata.

Acceptance:

- Setiap ras punya URL permanen.
- Global search mengarah ke detail breed.
- Detail page tetap berguna walau breed tidak tersedia.

### 8.3 Phase 3.4 - Admin Catpedia Editor

Scope:

- Migration data model.
- Admin API create/update untuk field baru.
- Editor tabbed.
- CRUD gallery/color/similar/health/cost.
- Publish/unpublish.

Acceptance:

- Admin dapat menambah/edit ras baru lengkap tanpa seed.
- Admin dapat memperbarui harga/ketersediaan dengan tanggal update.
- Admin dapat menambah Domestic Shorthair/Longhair.

### 8.4 Phase 3.5 - Compare Breeds

Scope:

- Compare tray maksimal 3 ras.
- Route `/breeds/compare?ids=...` atau client state.
- Tabel perbandingan.
- Ringkasan rekomendasi berdasarkan preferensi sederhana.

Compare dimensions:

- Aktivitas.
- Perawatan bulu.
- Cocok pemula.
- Vokal.
- Indoor fit.
- Estimasi biaya.
- Risiko obesitas.
- Waktu bermain.

Acceptance:

- User dapat memilih 2-3 ras dari list/detail.
- Hasil tidak menyatakan kebenaran mutlak.

### 8.5 Phase 3.6 - Breed Match Quiz

Scope:

- Wizard singkat:
  - Rumah/apartemen.
  - Lama rumah kosong.
  - Aktif vs tenang.
  - Frekuensi grooming.
  - Anak kecil.
  - Hewan lain.
  - Budget bulanan.
  - Kucing pertama.
- Hasil 3 ras cocok.
- Include Domestic Shorthair/Longhair.

Acceptance:

- Hasil berisi alasan, bukan hanya skor.
- Skor boleh berupa persentase untuk quiz preference, tetapi perlu dijelaskan sebagai kecocokan preferensi, bukan fakta mutlak.

### 8.6 Phase 3.7 - Ras Pilihanku

Scope:

- Favorite/save breed.
- List type:
  - Favorit.
  - Ingin dipelajari.
  - Pertimbangan adopsi.
  - Pernah dipelihara.
- Account page section.

Acceptance:

- Guest diminta login untuk menyimpan.
- User dapat menyimpan dan menghapus breed dari list.

## 9. Search dan Navigation

### 9.1 Customer search

Update `/api/search`:

- Breed result href menjadi `/breeds/[slug]`.
- Search by:
  - name.
  - origin.
  - profileSummary.
  - characteristics.
  - coatLength.
  - temperament.
  - suitability.

### 9.2 Breeds page filter

Filter awal:

- Cocok pemula.
- Indoor.
- Bulu pendek.
- Bulu panjang.
- Perawatan rendah.
- Aktif.
- Tenang.
- Cocok anak.
- Budget ramah.
- Tersedia di Sumber Jaya.

### 9.3 SEO

Add:

- `generateMetadata` di `/breeds/[slug]`.
- Canonical slug.
- Open Graph image dari main/backdrop image.
- Structured content headings.

## 10. Ketty AI Integration

Ketty AI sudah memakai database breeds untuk pertanyaan ras. Setelah Catpedia kaya:

- Ketty harus membaca detail breed lebih lengkap.
- Ketty dapat menjawab pertanyaan umum:
  - "British Shorthair cocok untuk apartemen?"
  - "Ras apa yang grooming-nya rendah?"
  - "Bandingkan Persia dan Bengal."
  - "Saya pemula, ras apa yang cocok?"
- Ketty tetap tidak boleh menyatakan diagnosis medis.
- Ketty dapat mereferensikan sumber/tanggal update bila bicara biaya atau ketersediaan.

## 11. Data Seed dan Content

### 11.1 Seed wajib

Tambahkan atau lengkapi:

- Domestic Shorthair.
- Domestic Longhair.
- British Shorthair.
- Persian.
- Maine Coon.
- Bengal.
- Ragdoll.
- American Shorthair.
- Exotic Shorthair.
- Scottish Fold/Straight.
- Russian Blue.
- Siamese.
- Burmese.
- Abyssinian.

### 11.2 Content standard

Setiap breed minimal punya:

- Name.
- Slug.
- Origin.
- Short description.
- Profile summary.
- 3 tags.
- Activity score.
- Grooming score.
- Beginner fit score.
- Care notes.
- Nutrition notes.
- Health disclaimer.
- Suitability good_for.
- Suitability consider_if.
- At least one image or placeholder.

### 11.3 Source hygiene

Setiap konten edukasi yang sensitif harus punya:

- `sourceNotes`.
- `contentUpdatedAt`.

Untuk MVP, source dapat berupa catatan admin internal. Nanti bisa ditingkatkan menjadi table sumber terpisah.

## 12. Testing Plan

### Unit test

- Slug resolver.
- Search/filter classification.
- Compare scoring.
- Quiz scoring.
- Admin payload validation.
- Safety copy for health notes.

### Integration test

- `GET /api/breeds`.
- `GET /api/breeds/[slug]` jika dibuat.
- Admin CRUD breed field baru.
- Admin CRUD gallery/health/cost.
- Favorite breed API.
- Global search breed href.

### UI verification

- `/breeds` desktop/mobile.
- `/breeds/[slug]` desktop/mobile.
- Compare tray mobile tidak overlap.
- Quiz wizard mobile.
- Admin editor tabbed.
- Empty states.
- Not available breed detail.
- Domestic Shorthair/Longhair tampil.

### Content QA

- Tidak ada klaim medis absolut.
- Harga punya tanggal update.
- CTA komersial tidak dominan di section edukasi.
- Tidak ada compatibility percentage di detail breed edukatif.

## 13. Migration Strategy

### Step 1: Additive migration

Tambah field/table baru tanpa menghapus field lama.

Field lama tetap dipakai sementara:

- `foodType`.
- `kittenPriceLabel`.
- `monthlyCareLabel`.
- `careLevel`.
- `availability`.
- `matchLabel`.

### Step 2: Backfill

Isi field baru dari seed lama:

- `profileSummary` -> `shortDescription` jika kosong.
- `careLevel` -> `groomingScore` kasar.
- `matchLabel` -> suitability.
- `monthlyCareLabel` -> `BreedCostEstimate.monthlyCostLabel`.

### Step 3: UI read from new fields with fallback

Customer UI membaca schema baru, fallback ke field lama bila kosong.

### Step 4: Admin writes new fields

Admin mulai mengelola data baru.

### Step 5: Deprecate old display usage

Setelah data baru lengkap, field lama tetap ada sebagai compatibility sampai phase berikutnya.

## 14. Out of Scope Phase 3 Awal

- Community editing/public contribution.
- User uploaded breed images.
- Moderation workflow.
- Multi-language content.
- Public API Catpedia.
- Advanced analytics dashboard.
- Real Google indexing setup beyond metadata and routes.

## 15. Recommended Execution Order

1. **Phase 3.1: Planning + schema design finalization**
   - Review data model.
   - Decide fields vs child tables.
   - Confirm admin scope.

2. **Phase 3.2: Customer Catpedia homepage**
   - Light card.
   - Discovery sections.
   - Improved search/filter.

3. **Phase 3.3: Breed detail route**
   - Rich detail page with fallback data.
   - SEO metadata.

4. **Phase 3.4: Admin editor upgrade**
   - Tabbed editor.
   - New fields and child records.

5. **Phase 3.5: Compare**
   - Compare tray.
   - Compare page/table.

6. **Phase 3.6: Quiz**
   - Preference wizard.
   - Rule-based scoring.

7. **Phase 3.7: Ras Pilihanku**
   - Favorite/list API.
   - Account integration.

8. **Phase 3.8: Ketty AI Catpedia integration**
   - Use enriched breed data for natural answers.
   - Compare/quiz-aware responses.

## 16. Definition of Done Phase 3

Phase 3 dianggap berhasil ketika pengguna tidak lagi merasa menu Ras Kucing hanya katalog jual-beli, tetapi database keputusan perawatan:

> "Saya bisa memahami karakter, kebutuhan, risiko, biaya, dan kecocokan sebuah ras sebelum memilih, membandingkan dengan ras lain, menyimpannya, dan bertanya ke Ketty AI dengan konteks yang sama."

Checklist final:

- `/breeds` menjadi Catpedia homepage.
- `/breeds/[slug]` tersedia untuk setiap ras published.
- Card lebih ringan dan edukatif.
- Detail page kaya dan SEO-ready.
- Compare maksimal 3 ras.
- Quiz pencocokan ras.
- Ras Pilihanku.
- Admin bisa mengelola data lengkap.
- Domestic Shorthair/Longhair masuk database.
- Data kesehatan aman dan edukatif.
- Data harga/ketersediaan punya tanggal update.
