# Implementation Plan Phase 2: Smart Recommendation dan Personal Pet Advisor

## Status Implementasi

Tahap 2.1, Tahap 2.2, Tahap 2.3, Tahap 2.4, dan Tahap 2.5 diimplementasikan pada 26 Juli 2026.

- Selesai: derived cat profile yang selalu memakai kucing aktif milik user.
- Selesai: rule engine produk berbasis usia, ras/bulu, status steril, lifestyle, dan tag produk.
- Selesai: label kecocokan tanpa persentase dan alasan yang transparan.
- Selesai: guardrail produk medis dan veterinary.
- Selesai: API rekomendasi produk dan dashboard dengan verifikasi kepemilikan profil.
- Selesai: section "Rekomendasi untuk [nama kucing]" dan produk personal di dashboard.
- Selesai: analyzer kondisi dari Timeline untuk grooming, berat, hairball, riwayat sakit, makanan, hidrasi, urinary caution, dan vaksin.
- Selesai: care action dan reminder kondisi masuk ke dashboard kucing aktif.
- Selesai: panel "Ketty AI memperhatikan sesuatu" di halaman Timeline.
- Selesai: perubahan Timeline langsung memuat ulang insight tanpa refresh halaman.
- Selesai: sinyal hairball, hidrasi, berat, makanan, dan riwayat sakit memengaruhi alasan/urutan rekomendasi produk.
- Selesai: unit test rule Timeline dan klasifikasi produk non-makanan.
- Selesai: setiap rekomendasi personal memiliki minimal dua alasan berbasis profil dan data produk.
- Selesai: manfaat utama, caution, dan tipe kucing yang sesuai dihitung oleh rule engine yang sama.
- Selesai: catatan alergi/sensitivitas sederhana dari profil menjadi caution dan dapat memblokir produk.
- Selesai: safety warning hanya muncul untuk obat, suplemen, prescription/veterinary diet, dan produk medis.
- Selesai: endpoint penjelasan satu produk dan panel detail untuk kucing aktif.
- Selesai: kartu rekomendasi dashboard menampilkan dua alasan dan bagian perhatian.
- Selesai: feedback rekomendasi produk tersimpan per user, kucing aktif, dan produk.
- Selesai: pilihan suka, tidak suka, belum dicoba, menimbulkan masalah, dan simpan favorit tersedia pada panel detail.
- Selesai: feedback negatif menurunkan prioritas; produk yang menimbulkan masalah tidak masuk rekomendasi utama.
- Selesai: pola rasa dari feedback produk makanan memengaruhi urutan rekomendasi berikutnya.
- Selesai: preferensi rasa tidak dipelajari dari produk non-makanan seperti mainan atau aksesori.
- Selesai: Ketty AI memakai kucing aktif dan derived profile saat menjawab pertanyaan rekomendasi produk.
- Selesai: Ketty AI meminta rekomendasi dari rule engine produk, termasuk alasan, manfaat, caution, safety warning, sinyal timeline, feedback rasa, dan riwayat pesanan.
- Selesai: pertanyaan produk medis seperti obat, suplemen, veterinary/prescription diet, urinary/renal diet, dan vitamin diarahkan ke guardrail dokter hewan.
- Selesai: jawaban Ketty untuk rekomendasi produk tidak menampilkan compatibility percentage dan tidak hanya mengulang deskripsi katalog.
- Berikutnya: Phase 2 selesai; lanjut Phase 3 atau hardening/QA jika dibutuhkan.

Catatan implementasi Tahap 2.2:

- Belum membutuhkan migration baru; rule membaca kategori, tanggal, judul, dan deskripsi `TimelineEvent`.
- Event berstatus `Mendatang` tidak dianggap sebagai perawatan yang sudah dilakukan.
- Insight bersifat edukasi dan pemantauan, bukan diagnosis.
- Sinyal urinary selalu menghasilkan caution dokter hewan dan tidak membuka rekomendasi produk medis otomatis.

## 1. Tujuan Phase 2

Phase 2 bertujuan mengubah Rumah Kucing dari aplikasi pencatatan dan katalog produk menjadi pet advisor pribadi yang memahami konteks setiap kucing.

Target pengalaman pengguna:

> "Karena Snowy adalah kucing Persia dewasa, sudah steril, dan hidup indoor, berikut pilihan yang lebih sesuai untuk kebutuhan bulu, berat badan, dan aktivitasnya."

Fokus utama bukan sekadar menampilkan produk, tetapi memberikan rekomendasi yang:

- Personal berdasarkan profil kucing.
- Bisa dijelaskan dengan alasan yang transparan.
- Aman untuk konteks kesehatan.
- Tetap memberi kontrol kepada pengguna.
- Dapat berkembang dari rule-based sederhana menuju Ketty AI yang lebih personal.

## 2. Prinsip Produk

### 2.1 Advisor, bukan hard selling

Produk muncul sebagai jawaban atas kebutuhan kucing, bukan katalog acak. Rekomendasi harus terasa membantu, bukan memaksa membeli.

### 2.2 Explainable recommendation

Setiap rekomendasi harus menjawab:

- Mengapa ini cocok?
- Apa yang perlu diperhatikan?
- Kapan perlu konsultasi dokter hewan?

### 2.3 Rule-based dulu, AI kemudian

Tahap awal memakai aturan sederhana dan transparan. Ketty AI bertugas menyampaikan hasil dengan bahasa natural, bukan menjadi satu-satunya sumber keputusan.

### 2.4 Safety first

Produk veterinary diet, renal, urinary prescription, obat, vitamin dosis tertentu, suplemen medis, dan produk pemulihan operasi tidak boleh direkomendasikan seperti produk biasa.

Untuk produk atau kondisi semacam itu, aplikasi harus menampilkan pesan:

> Perlu rekomendasi dokter hewan. Produk ini ditujukan untuk kondisi kesehatan tertentu. Jangan menggunakannya sebagai pengobatan mandiri tanpa pemeriksaan dokter hewan.

## 3. Scope Phase 2

### In scope

- Rekomendasi produk berdasarkan profil kucing aktif.
- Rekomendasi care action mingguan dari timeline.
- Rekomendasi artikel berdasarkan profil dan timeline.
- Penjelasan alasan kecocokan produk.
- Label kecocokan non-persentase.
- Preferensi pengguna sederhana.
- Feedback rekomendasi sederhana.
- Integrasi Ketty AI dengan konteks rekomendasi.

### Out of scope untuk awal Phase 2

- Diagnosis medis otomatis.
- Dosis obat, vitamin, atau suplemen.
- Persentase kecocokan seperti 98 persen.
- Machine learning kompleks.
- Push notification real-time.
- Integrasi dokter hewan live.

## 4. Data Yang Dibutuhkan

### 4.1 Data kucing yang sudah ada

Saat ini schema sudah memiliki:

- `Cat.name`
- `Cat.breed`
- `Cat.estimatedDateOfBirth`
- `Cat.ageLabel`
- `Cat.weightKg`
- `Cat.gender`
- `Cat.sterilized`
- `Cat.lifestyle`
- `Cat.notes`
- `TimelineEvent`
- `Achievement`

Data ini cukup untuk tahap 2.1.

### 4.2 Data produk yang sudah ada

Saat ini schema sudah memiliki:

- `Product.name`
- `Product.category`
- `Product.reason`
- `Product.description`
- `Product.badge`
- `Product.tags`
- `Product.priceIdr`
- `Product.isActive`

Data ini cukup untuk rekomendasi awal jika tagging produk diperbaiki.

### 4.3 Data tambahan yang disarankan

#### CatPreference

Untuk menyimpan preferensi pemilik dan respons kucing.

Field awal:

- `id`
- `catId`
- `priority`: weight, coat, digestion, budget, protein, availability, hydration
- `avoidIngredients`: text atau JSON
- `preferredFlavors`: text atau JSON
- `budgetMaxIdr`
- `createdAt`
- `updatedAt`

#### ProductRecommendationMeta

Untuk memperkaya produk agar bisa dinilai oleh rule engine.

Field awal:

- `productId`
- `lifeStage`: kitten, adult, senior, all
- `sterilizedSupport`: boolean
- `indoorSupport`: boolean
- `weightControl`: boolean
- `hairballSupport`: boolean
- `skinCoatSupport`: boolean
- `hydrationSupport`: boolean
- `sensitiveDigestion`: boolean
- `mainProtein`: chicken, fish, beef, mixed, unknown
- `medicalFlag`: none, urinary, renal, recovery, supplement, prescription
- `requiresVetRecommendation`: boolean

Alternatif awal yang lebih cepat: gunakan `ProductTag` dulu dengan tag standar, lalu pindah ke table meta setelah logic stabil.

#### RecommendationFeedback

Untuk belajar dari respons pengguna.

Field awal:

- `id`
- `userId`
- `catId`
- `productId`
- `recommendationType`: product, article, care_action
- `response`: liked, disliked, not_tried, caused_issue, saved
- `note`
- `createdAt`

## 5. Recommendation Engine

### 5.1 Lokasi logic

Buat service terpusat:

- `lib/recommendations/profile.ts`
- `lib/recommendations/product-rules.ts`
- `lib/recommendations/care-rules.ts`
- `lib/recommendations/article-rules.ts`
- `lib/recommendations/types.ts`

Tujuannya agar dashboard, product page, Explore, dan Ketty AI memakai logic yang sama.

### 5.2 Derived cat profile

Service harus mengubah data mentah kucing menjadi profil turunan:

```ts
type DerivedCatProfile = {
  lifeStage: "kitten" | "adult" | "senior";
  breedName: string | null;
  coatLength: "short" | "medium" | "long" | "unknown";
  isSterilized: boolean;
  lifestyle: "indoor" | "outdoor" | "mixed" | "unknown";
  weightKg: number | null;
  healthSignals: string[];
  careSignals: string[];
};
```

Contoh:

- Persia -> `coatLength: long`
- umur 3,5 tahun -> `lifeStage: adult`
- steril + indoor -> perlu perhatian berat dan aktivitas
- timeline hairball -> signal hairball
- timeline berat naik -> signal weight monitoring

### 5.3 Product match result

Gunakan label berikut:

- `Sangat cocok`
- `Cocok`
- `Cukup cocok`
- `Kurang sesuai`
- `Tidak direkomendasikan`

Jangan gunakan persentase pada versi awal.

```ts
type ProductMatch = {
  productId: string;
  label:
    | "Sangat cocok"
    | "Cocok"
    | "Cukup cocok"
    | "Kurang sesuai"
    | "Tidak direkomendasikan";
  reasons: string[];
  cautions: string[];
  safetyWarning?: string;
  sortScore: number;
};
```

`sortScore` boleh dipakai internal, tetapi jangan ditampilkan sebagai angka ke pengguna.

### 5.4 Rule awal untuk Phase 2.1

#### Usia

- Jika umur < 12 bulan -> prioritaskan kitten.
- Jika umur 1 sampai 7 tahun -> prioritaskan adult.
- Jika umur > 7 tahun -> prioritaskan senior.
- Jika produk kitten untuk adult -> label `Kurang sesuai`.

#### Steril

- Jika steril -> prioritaskan sterilized, weight control, indoor support.
- Jika produk high calorie tanpa konteks -> tambahkan caution.

#### Lifestyle

- Indoor -> prioritaskan weight control, indoor formula, activity enrichment.
- Outdoor -> prioritaskan energi dan daya tahan umum.

#### Ras dan bulu

- Persia, Maine Coon, Ragdoll, longhair -> prioritaskan hairball, skin and coat, grooming tools.
- Bulu panjang -> rekomendasikan sisir dan rutinitas grooming.

#### Hidrasi

- Jika catatan menunjukkan kurang minum, urinary, atau dry-food-heavy -> sarankan wet food, water fountain, atau cek air minum.
- Untuk urinary medical product -> wajib safety warning.

#### Timeline

- Grooming terakhir > 10 hari untuk longhair -> reminder grooming.
- Berat badan belum dicatat > 30 hari -> reminder timbang.
- Hairball >= 2 kali dalam 30 hari -> insight hairball.
- Vaksin belum ada -> ajak tambah riwayat vaksin.
- Riwayat sakit baru -> rekomendasi artikel pemulihan dan caution.

## 6. API dan Server Actions

### 6.1 API rekomendasi dashboard

Endpoint:

- `GET /api/recommendations/dashboard?catId=...`

Response:

```ts
{
  cat: {
    id: string;
    name: string;
  };
  summary: string;
  cards: Array<{
    type: "nutrition" | "care" | "activity" | "hydration" | "article";
    title: string;
    description: string;
    actionLabel?: string;
    href?: string;
  }>;
}
```

Contoh kartu:

- Nutrisi: Makanan adult sterilized
- Perawatan: Sisir bulu 3-4 kali seminggu
- Aktivitas: Bermain 15 menit hari ini

### 6.2 API rekomendasi produk

Endpoint:

- `GET /api/recommendations/products?catId=...`
- `GET /api/recommendations/products/[productId]?catId=...`

Digunakan oleh:

- Dashboard.
- Product listing.
- Product detail.
- Ketty AI.

### 6.3 API rekomendasi artikel

Endpoint:

- `GET /api/recommendations/articles?catId=...`

Digunakan oleh Explore untuk menampilkan "Artikel untuk Snowy".

### 6.4 Feedback endpoint

Endpoint:

- `POST /api/recommendations/feedback`

Payload:

```ts
{
  catId: string;
  productId?: string;
  recommendationType: "product" | "article" | "care_action";
  response: "liked" | "disliked" | "not_tried" | "caused_issue" | "saved";
  note?: string;
}
```

## 7. UI Yang Perlu Dibangun

### 7.1 Dashboard: Rekomendasi untuk Snowy

Lokasi: di bawah hero/dashboard utama, sebelum produk random.

Konten:

```text
Rekomendasi untuk Snowy
Dipilih berdasarkan usia, ras, status steril, dan gaya hidup Snowy.
```

Card:

1. Nutrisi
   - Makanan adult sterilized
   - Membantu menjaga berat badan Snowy tetap stabil.

2. Perawatan
   - Sisir bulu 3-4 kali seminggu
   - Cocok untuk bulu panjang kucing Persia.

3. Aktivitas
   - Bermain 15 menit hari ini
   - Membantu Snowy tetap aktif sebagai kucing indoor.

CTA:

- Lihat Semua Rekomendasi

### 7.2 ProductCard: match label

Tambahkan badge:

- Sangat cocok untuk Snowy
- Cocok untuk Snowy
- Kurang sesuai untuk Snowy

Jangan tampilkan badge jika user belum login atau belum punya profil kucing.

### 7.3 Product detail: explanation panel

Section:

```text
Mengapa cocok untuk Snowy?

✓ Sesuai untuk kucing dewasa
✓ Mendukung kesehatan kulit dan bulu
✓ Cocok untuk kucing indoor
✓ Dapat diberikan setelah steril

Perlu diperhatikan:
Produk ini bukan formula khusus weight control.
```

Jika produk medical:

```text
Perlu rekomendasi dokter hewan
Produk ini ditujukan untuk kondisi kesehatan tertentu. Jangan menggunakannya sebagai pengobatan mandiri tanpa pemeriksaan dokter hewan.
```

### 7.4 Explore: artikel personal

Tambahkan section:

- Artikel untuk Snowy
- Artikel untuk masa pemulihan
- Panduan untuk pemilik kitten

Section dipilih berdasarkan active cat profile dan timeline.

### 7.5 Timeline: insight ringan

Tambahkan panel:

- Ketty AI memperhatikan sesuatu
- Sudah dua kali hairball dalam 30 hari terakhir.
- Berat naik 400 gram dalam dua bulan.
- Belum ada catatan berat baru dalam 30 hari.

Tetap hindari diagnosis.

### 7.6 Preference UI

Awal cukup satu modal atau section:

```text
Apa yang paling penting untukmu?

[ ] Menjaga berat badan
[ ] Bulu lebih sehat
[ ] Pencernaan sensitif
[ ] Harga lebih terjangkau
[ ] Tidak mengandung bahan tertentu
```

Tambahkan budget:

- Maksimal harga produk.

Tambahkan preferensi rasa:

- Ayam.
- Ikan.
- Campuran.

## 8. Ketty AI Integration

### 8.1 Context injection

Ketty AI harus menerima ringkasan profil:

```text
Snowy adalah kucing Persia dewasa, 3,5 tahun, betina, steril, indoor, berat 3,5 kg.
Prioritas care: skin and coat, hairball, weight monitoring, hydration.
```

### 8.2 Response style

Ketty tidak langsung memberi daftar panjang. Pola jawaban:

1. Ringkas profil dan prioritas.
2. Jelaskan kriteria rekomendasi.
3. Berikan 3 opsi:
   - Pilihan utama.
   - Pilihan untuk kebutuhan khusus.
   - Pilihan hemat.
4. Tambahkan caution jika perlu.

Contoh:

```text
Snowy adalah kucing Persia dewasa, sudah steril, dan hidup indoor. Jadi aku akan memprioritaskan makanan adult yang membantu menjaga berat badan, kesehatan bulu, serta pencernaan.
```

### 8.3 Safety prompt

Ketty harus selalu diberi instruksi:

- Jangan mendiagnosis.
- Jangan memberi dosis obat.
- Jangan menyarankan veterinary diet tanpa anjuran dokter.
- Jika ada red flag, sarankan dokter hewan.

## 9. Urutan Pengerjaan

### Tahap 2.1 - Rekomendasi dasar

Gunakan:

- Usia.
- Ras.
- Status steril.
- Indoor atau outdoor.
- Kategori dan tag produk.

Deliverables:

- `DerivedCatProfile`.
- Rule engine produk sederhana.
- API product recommendation.
- Dashboard section "Rekomendasi untuk Snowy".
- Product card match label.

Acceptance criteria:

- Adult cat tidak mendapat produk kitten sebagai rekomendasi utama.
- Persia longhair mendapat grooming atau hairball-related suggestion.
- Steril indoor cat mendapat alasan terkait berat badan dan aktivitas.
- Guest user tetap melihat produk normal tanpa personal label.

### Tahap 2.2 - Rekomendasi berdasarkan kondisi

Status: selesai pada 26 Juli 2026.

Tambahkan:

- Timeline hairball.
- Timeline grooming.
- Timeline berat badan.
- Riwayat sakit.
- Catatan makanan.

Deliverables:

- Selesai: care action recommendation.
- Selesai: Timeline insight.
- Selesai: dashboard reminders.
- Selesai: condition-aware product ranking.
- Selesai: focused rule tests.

Acceptance criteria:

- Terpenuhi: grooming lama memunculkan reminder grooming.
- Terpenuhi: berat lama tidak dicatat memunculkan reminder timbang.
- Terpenuhi: hairball berulang memunculkan insight tanpa diagnosis.

### Tahap 2.3 - Explainable recommendation

Status: selesai pada 26 Juli 2026.

Tambahkan:

- Selesai: reasons minimal dua poin.
- Selesai: cautions, termasuk konflik usia dan sensitivitas bahan dari catatan profil.
- Selesai: medical-only safety warning.
- Selesai: product detail explanation panel.
- Selesai: key benefits dan suitable cat type.
- Selesai: endpoint `GET /api/recommendations/products/[productId]?catId=...`.

Acceptance criteria:

- Terpenuhi: setiap produk personal memiliki alasan minimal 2 poin.
- Terpenuhi: produk medical menampilkan warning dokter hewan.
- Terpenuhi: produk non-medical tidak menerima safety warning.
- Terpenuhi: tidak ada persentase kecocokan yang ditampilkan.
- Terpenuhi: penjelasan memakai profil kucing aktif, Timeline, serta data produk dari database.

### Tahap 2.4 - Feedback pengguna

Status: selesai pada 26 Juli 2026.

Tambahkan:

- Selesai: Like.
- Selesai: Dislike.
- Selesai: Belum dicoba.
- Selesai: Menimbulkan masalah.
- Selesai: Simpan favorit.

Deliverables:

- Selesai: model dan migration `RecommendationFeedback`.
- Selesai: `GET`, `POST`, dan `DELETE /api/recommendations/feedback`.
- Selesai: UI feedback ringan pada panel penjelasan produk.
- Selesai: integrasi direct feedback dan preferensi rasa ke rule engine terpusat.
- Selesai: focused unit test untuk pembelajaran rasa dan negative feedback.

Acceptance criteria:

- Terpenuhi: feedback tersimpan unik per user, cat, produk, dan tipe rekomendasi.
- Terpenuhi: endpoint memverifikasi sesi, kepemilikan profil kucing, dan keberadaan produk.
- Terpenuhi: produk dengan feedback `disliked` diturunkan, sedangkan `caused_issue` tidak masuk rekomendasi utama.
- Terpenuhi: rasa produk makanan yang disukai atau dihindari memengaruhi urutan rekomendasi.
- Terpenuhi: feedback dapat diperbarui atau dihapus dan langsung dimuat ulang tanpa hard refresh.

### Tahap 2.5 - Ketty AI personalized

Tambahkan:

- Ketty memakai derived profile.
- Ketty bisa meminta rekomendasi produk dari rule engine.
- Ketty menjelaskan pilihan secara natural.

Status 26 Juli 2026: selesai.

Implementasi:

- `POST /api/chat` mendeteksi pertanyaan rekomendasi produk personal sebelum memanggil model eksternal.
- Backend mengambil active cat milik user, menurunkan profile dengan `deriveCatProfile`, membaca timeline, feedback rekomendasi, riwayat pesanan, dan katalog aktif.
- Ketty memakai `rankProductsForCat` sebagai source of truth rekomendasi produk.
- Jawaban Ketty menyebut nama kucing aktif, faktor profil yang dipakai, minimal dua alasan dari rule engine, manfaat, caution, dan catatan keamanan.
- Untuk produk medis/suplemen/prescription atau veterinary diet, Ketty tidak memberi rekomendasi pemakaian langsung dan menyarankan konsultasi dokter hewan.
- Jika data profil belum lengkap, Ketty menampilkan data yang perlu dilengkapi seperti usia, ras, berat, lifestyle, atau catatan alergi/sensitivitas.

Acceptance criteria:

- Pertanyaan "Makanan apa yang cocok untuk Snowy?" menghasilkan jawaban personal.
- Ketty tidak memberi rekomendasi medis berisiko.
- Ketty tidak hanya mengulang katalog produk.

## 10. Testing Plan

### Unit test

- Life stage calculation.
- Breed coat mapping.
- Product scoring.
- Medical product guardrail.
- Timeline signal extraction.

### Integration test

- `/api/recommendations/products`
- `/api/recommendations/dashboard`
- `/api/recommendations/articles`
- Feedback endpoint.

### UI verification

- Dashboard logged-in dengan active cat.
- Dashboard logged-out.
- Product listing dengan active cat.
- Product detail dengan explanation.
- Explore personalized articles.
- Timeline insight.

### Scenario test

#### Snowy

Profile:

- Persia
- 3,5 tahun
- Betina
- Steril
- Indoor
- Berat 3,5 kg

Expected:

- Adult food recommended.
- Kitten food marked kurang sesuai.
- Skin and coat/hairball reason appears.
- Grooming reminder can appear if timeline supports it.
- Hydration tip can appear.

#### Kitten

Expected:

- Kitten food recommended.
- Adult sterilized food not primary.
- Article about kitten care appears.

#### Medical signal

Timeline contains urinary or renal keywords.

Expected:

- No prescription product hard recommendation.
- Vet consultation warning appears.

## 11. Risiko dan Mitigasi

### Risiko: rekomendasi terlihat asal

Mitigasi:

- Jangan tampilkan persentase.
- Selalu tampilkan alasan.
- Gunakan label sederhana.

### Risiko: klaim medis berlebihan

Mitigasi:

- Medical flag.
- Safety warning.
- Vet consultation copy.

### Risiko: data produk belum rapi

Mitigasi:

- Mulai dari ProductTag standar.
- Buat admin tagging guideline.
- Tambahkan migration meta setelah tagging pattern stabil.

### Risiko: dashboard terlalu ramai

Mitigasi:

- Tampilkan maksimal 3 rekomendasi utama.
- Detail masuk ke halaman "Lihat Semua Rekomendasi".

## 12. Rekomendasi Teknis Awal

Untuk eksekusi pertama, mulai dengan 2.1 tanpa migration besar:

1. Standarkan tag produk di seed/admin:
   - kitten
   - adult
   - senior
   - sterilized
   - indoor
   - weight-control
   - hairball
   - skin-coat
   - hydration
   - grooming
   - toy
   - medical
   - vet-required

2. Buat rule engine yang membaca:
   - active cat profile.
   - product category.
   - product tags.

3. Buat API rekomendasi.

4. Ganti produk acak di dashboard menjadi rekomendasi personal jika user login dan punya active cat.

5. Tambahkan explanation sederhana di ProductCard atau Product detail.

Pendekatan ini cepat, aman, dan bisa menghasilkan efek "naik level" tanpa menunggu AI kompleks atau schema besar.
