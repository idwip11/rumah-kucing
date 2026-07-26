# Implementation Plan Phase 4: Community & Ecosystem

## Status Implementasi

Phase 4 sedang dalam tahap perencanaan. Belum ada eksekusi development yang dimulai.

Roadmap terbagi menjadi 3 sub-phase (Pet Passport di-delay):

- Phase 4.1 — Event Hub (Registrasi event, detail event, filter, favorit, kalender)
- Phase 4.2 — Pet Services (Direktori klinik, grooming, petshop, shelter, peta)
- Phase 4.3 — Community (Komunitas, lost & found, donasi)

**Dihapus/di-delay:** Pet Passport (Phase 4.4) — akan dikerjakan di phase berikutnya.

## 1. Tujuan Phase 4

Visi sederhana:

> Rumah Kucing bukan hanya tempat merawat kucing, tetapi tempat hidup bersama komunitas pecinta kucing.

Ketika user membuka aplikasi, alasannya bukan hanya:

> "Snowy lagi sakit."

Tetapi juga:

> "Ada event minggu depan."
> "Ada artikel baru."
> "Ada bazaar pet."
> "Ada kompetisi."
> "Ada shelter baru."
> "Ada gathering komunitas."

### 1.1 Nilai Utama Phase 4

1. **Event-driven engagement** — User kembali karena ada hal yang terjadi, bukan hanya karena masalah.
2. **Community belonging** — User merasa bagian dari komunitas pecinta kucing.
3. **Ecosystem utility** — Satu aplikasi untuk semua kebutuhan kucing: event, layanan, komunitas, dan dokumentasi.

### 1.2 Prinsip Desain

- **Nama kucing dinamis** — "Snowy" hanyalah contoh. Aplikasi selalu menggunakan nama aktual kucing yang dipilih user.
- **Enhance, bukan bangun dari nol** — Event info sudah ada di Explore (hanya info statis). Task utama adalah menambahkan interaktivitas (registrasi, favorit, detail page, kalender).
- **Sederhana dulu** — Tidak membuat social media. Mulai dengan direktori dan kalender.
- **Lokasi-aware** — Semua konten layanan diurutkan berdasarkan kedekatan dengan user.
- **Verified only** — Breeder dan organisasi diverifikasi sebelum muncul di direktori publik.
- **Privacy-first** — Lost & Found dan donasi melindungi data pribadi pengguna.

## 2. Scope Phase 4

### Existing features yang sudah ada (perlu di-enhance)

#### Event info di Explore (`/explore`)

- Sudah ada `UpcomingEventsCarousel` yang menampilkan event mendatang
- Saat ini hanya **info statis** — tidak ada registrasi, favorit, atau detail page
- **Yang perlu ditambahkan:** detail page per event, registrasi event, simpan favorit, filter & kalender

#### Galeri ras di `/breeds`

- Sudah ada halaman galeri ras kucing dengan quiz kecocokan
- Bisa digunakan sebagai referensi untuk section adopsi/shelter

### In scope

#### Phase 4.1 — Event Hub (Prioritas Tertinggi)

- **Detail page per event** (`/community/events/[id]`) — informasi lengkap event
- **Registrasi event** — user bisa mendaftarkan kucing untuk event
- **Simpan event favorit** — bookmark event yang menarik
- **Filter & pencarian event** — berdasarkan kota, kategori, tanggal
- **Calendar view** — tampilan kalender bulanan untuk event
- **AI Recommendation untuk event** — saran event sesuai profil kucing
- **Add to personal calendar** — download .ics file
- **Enhance existing carousel** di Explore page (tetap ada, tapi link ke detail page)

#### Phase 4.2 — Pet Services

- Direktori klinik hewan
- Direktori grooming
- Direktori petshop
- Direktori shelter
- Peta lokasi terintegrasi (semua layanan dalam satu map)
- Informasi kontak, jam buka, layanan, review

#### Phase 4.3 — Community

- Direktori komunitas pecinta kucing
- Lost & Found kucing hilang
- Sistem donasi untuk shelter
- Kalender nasional event kucing (di homepage)

### Out of scope untuk awal

- **Chat antar pengguna** (social feature kompleks) — skip
- **Booking dan pembayaran online** (manual via WhatsApp dulu)
- **Pet Passport / QR Code** — di-delay ke phase berikutnya
- **Halaman adopsi dari nol** — sudah ada referensi di `/breeds`
- **Marketplace produk** (sudah ada di fitur store terpisah)
- **Push notification** (web-based reminder saja)
- **Integrasi GPS real-time** untuk lost & found
- **Video streaming atau UGC platform** — skip
- **Verified breeder directory** — di-delay ke phase berikutnya

## 3. Database Schema Design

### 3.1 Tabel yang diperlukan

```prisma
// ─────────────────────────────────────────────
// COMMUNITY & ECOSYSTEM (Phase 4)
// ─────────────────────────────────────────────

enum EventCategory {
    competition       // Pameran & Kompetisi
    education         // Edukasi & Kesehatan
    adoption          // Adopsi
    exhibition        // Pameran/Pet Expo
    community         // Gathering/Komunitas
    festival          // Festival
    seminar           // Seminar/Workshop
    charity           // Charity/Donasi
}

enum EventCategoryType {
    kitten
    adult
    long_hair
    short_hair
    mixed
    all_categories
}

model EventRegistration {
    id          String   @id @default(uuid())
    eventId     String   @map("event_id")
    userId      String   @map("user_id")
    catId       String   @map("cat_id")
    category    EventCategoryType @default(all_categories)
    status      EventRegistrationStatus @default(pending)
    notes       String?  @db.Text
    registeredAt DateTime @map("registered_at") @default(now())
    qrCode      String?  @map("qr_code") @db.VarChar(60) // unique token for scan

    event Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
    user  User         @relation(fields: [userId], references: [id], onDelete: Cascade)
    cat   Cat          @relation(fields: [catId], references: [id], onDelete: Cascade)

    @@unique([eventId, userId, catId])
    @@index([eventId])
    @@index([userId])
    @@map("event_registrations")
}

enum EventRegistrationStatus {
    pending
    confirmed
    cancelled
    checked_in
}

// --- SHELTER ---

model Shelter {
    id            String   @id @default(uuid())
    name          String   @db.VarChar(160)
    description   String?  @db.Text
    address       String?  @db.Text
    city          String?  @db.VarChar(80)
    province      String?  @db.VarChar(80)
    latitude      Decimal? @db.Decimal(10, 8)
    longitude     Decimal? @db.Decimal(11, 8)
    phone         String?  @db.VarChar(30)
    whatsapp      String?  @db.VarChar(30)
    email         String?  @db.VarChar(255)
    websiteUrl    String?  @map("website_url") @db.VarChar(500)
    imageUrl      String?  @map("image_url")
    availableCats Int      @default(0) @map("available_cats")
    isVerified    Boolean  @default(false) @map("is_verified")
    isActive      Boolean  @default(true) @map("is_active")
    createdAt     DateTime @default(now()) @map("created_at")
    updatedAt     DateTime @updatedAt @map("updated_at")

    cats Cat[] // reference only; actual cats still in Cat model

    @@index([city])
    @@index([isActive])
    @@index([isVerified])
    @@map("shelters")
}

model ShelterCat {
    id          String   @id @default(uuid())
    shelterId   String   @map("shelter_id")
    name        String   @db.VarChar(80)
    ageLabel    String?  @map("age_label") @db.VarChar(40)
    gender      String?  @db.VarChar(10)
    breed       String?  @db.VarChar(80)
    color       String?  @db.VarChar(60)
    healthStatus String? @map("health_status") @db.VarChar(120)
    photoUrl    String?  @map("photo_url") @db.Text
    notes       String?  @db.Text
    postedAt    DateTime @map("posted_at") @default(now())
    adopted     Boolean  @default(false)

    shelter Shelter @relation(fields: [shelterId], references: [id], onDelete: Cascade)

    @@index([shelterId])
    @@index([adopted])
    @@map("shelter_cats")
}

// --- VETERINARY CLINIC ---

model VetClinic {
    id            String   @id @default(uuid())
    name          String   @db.VarChar(160)
    description   String?  @db.Text
    address       String?  @db.Text
    city          String?  @db.VarChar(80)
    province      String?  @db.VarChar(80)
    latitude      Decimal? @db.Decimal(10, 8)
    longitude     Decimal? @db.Decimal(11, 8)
    phone         String?  @db.VarChar(30)
    whatsapp      String?  @db.VarChar(30)
    operatingHours String? @map("operating_hours") @db.Text // JSON or text
    services      Json?    @db.JsonB // list of services
    rating        Decimal? @default(0) @db.Decimal(2, 1)
    reviewCount   Int      @default(0) @map("review_count") @map("review_count")
    imageUrl      String?  @map("image_url")
    isVerified    Boolean  @default(false) @map("is_verified")
    isActive      Boolean  @default(true) @map("is_active")
    createdAt     DateTime @default(now()) @map("created_at")
    updatedAt     DateTime @updatedAt @map("updated_at")

    @@index([city])
    @@index([isActive])
    @@index([isVerified])
    @@map("vet_clinics")
}

// --- GROOMING ---

model GroomingService {
    id            String   @id @default(uuid())
    name          String   @db.VarChar(160)
    providerName  String?  @map("provider_name") @db.VarChar(120) // nama pemilik/penyedia
    description   String?  @db.Text
    address       String?  @db.Text
    city          String?  @db.VarChar(80)
    province      String?  @db.VarChar(80)
    latitude      Decimal? @db.Decimal(10, 8)
    longitude     Decimal? @db.Decimal(11, 8)
    phone         String?  @db.VarChar(30)
    whatsapp      String?  @db.VarChar(30)
    homeService   Boolean  @default(false) @map("home_service")
    priceRange    String?  @map("price_range") @db.VarChar(60)
    services      Json?    @db.JsonB // list of services
    rating        Decimal? @default(0) @db.Decimal(2, 1)
    reviewCount   Int      @default(0) @map("review_count")
    imageUrl      String?  @map("image_url")
    isVerified    Boolean  @default(false) @map("is_verified")
    isActive      Boolean  @default(true) @map("is_active")
    createdAt     DateTime @default(now()) @map("created_at")
    updatedAt     DateTime @updatedAt @map("updated_at")

    @@index([city])
    @@index([isActive])
    @@index([homeService])
    @@map("grooming_services")
}

// --- PETSHOP ---

model Petshop {
    id            String   @id @default(uuid())
    name          String   @db.VarChar(160)
    description   String?  @db.Text
    address       String?  @db.Text
    city          String?  @db.VarChar(80)
    province      String?  @db.VarChar(80)
    latitude      Decimal? @db.Decimal(10, 8)
    longitude     Decimal? @db.Decimal(11, 8)
    phone         String?  @db.VarChar(30)
    whatsapp      String?  @db.VarChar(30)
    websiteUrl    String?  @map("website_url") @db.VarChar(500)
    operatingHours String? @map("operating_hours") @db.Text
    imageUrl      String?  @map("image_url")
    isOfficial    Boolean  @default(false) @map("is_official") // true = Rumah Kucing Store
    isVerified    Boolean  @default(false) @map("is_verified")
    isActive      Boolean  @default(true) @map("is_active")
    createdAt     DateTime @default(now()) @map("created_at")
    updatedAt     DateTime @updatedAt @map("updated_at")

    @@index([city])
    @@index([isActive])
    @@index([isOfficial])
    @@map("petshops")
}

// --- COMMUNITY ---

enum CommunityPlatform {
    whatsapp
    telegram
    facebook
    discord
    discord
    instagram
}

model Community {
    id            String               @id @default(uuid())
    name          String               @db.VarChar(160)
    description   String?              @db.Text
    city          String?              @db.VarChar(80)
    province      String?              @db.VarChar(80)
    platform      CommunityPlatform
    groupLink     String?              @map("group_link") @db.VarChar(500)
    memberCount   Int?                 @map("member_count")
    imageUrl      String?              @map("image_url")
    isAdminApproved Boolean            @default(false) @map("is_admin_approved")
    isActive      Boolean              @default(true) @map("is_active")
    createdAt     DateTime             @default(now()) @map("created_at")
    updatedAt     DateTime             @updatedAt @map("updated_at")

    @@index([city])
    @@index([isActive])
    @@index([isAdminApproved])
    @@map("communities")
}

// --- BREEDER (VERIFIED ONLY) ---

model VerifiedBreeder {
    id            String   @id @default(uuid())
    name          String   @db.VarChar(160) // nama breeder/kennel
    ownerName     String?  @map("owner_name") @db.VarChar(120)
    description   String?  @db.Text
    address       String?  @db.Text
    city          String?  @db.VarChar(80)
    province      String?  @db.VarChar(80)
    latitude      Decimal? @db.Decimal(10, 8)
    longitude     Decimal? @db.Decimal(11, 8)
    phone         String?  @db.VarChar(30)
    whatsapp      String?  @db.VarChar(30)
    instagram     String?  @db.VarChar(120)
    availableBreeds Json?  @map("available_breeds") @db.JsonB // list of breeds
    certifications Json?   @db.JsonB // licenses, certificates
    rating        Decimal? @default(0) @db.Decimal(2, 1)
    reviewCount   Int      @default(0) @map("review_count")
    imageUrl      String?  @map("image_url")
    isVerified    Boolean  @default(false) @map("is_verified") // MUST be verified
    isActive      Boolean  @default(true) @map("is_active")
    createdAt     DateTime @default(now()) @map("created_at")
    updatedAt     DateTime @updatedAt @map("updated_at")

    @@index([city])
    @@index([isVerified])
    @@index([isActive])
    @@map("verified_breeders")
}

// --- LOST & FOUND ---

enum LostFoundType {
    lost    // Kucing hilang
    found   // Kucing ditemukan
}

model LostFound {
    id            String       @id @default(uuid())
    type          LostFoundType
    title         String       @db.VarChar(160) // e.g., "Milo"
    description   String?      @db.Text
    location      String?      @db.Text // lokasi terakhir dilihat/ditemukan
    city          String?      @db.VarChar(80)
    province      String?      @db.VarChar(80)
    latitude      Decimal?     @db.Decimal(10, 8)
    longitude     Decimal?     @db.Decimal(11, 8)
    catBreed      String?      @map("cat_breed") @db.VarChar(80)
    catColor      String?      @map("cat_color") @db.VarChar(60)
    catFeatures   String?      @map("cat_features") @db.Text // distinctive features
    photoUrl      String?      @map("photo_url") @db.Text
    contactPhone  String?      @map("contact_phone") @db.VarChar(30)
    contactWhatsapp String?    @map("contact_whatsapp") @db.VarChar(30)
    reportedAt    DateTime     @map("reported_at") @default(now())
    resolved      Boolean      @default(false)

    @@index([type])
    @@index([city])
    @@index([resolved])
    @@index([reportedAt(sort: Desc)])
    @@map("lost_found")
}

// --- DONASI / DONATION ---

enum DonationItemType {
    cat_food      // Makanan kering
    wet_food      // Makanan basah
    litter        // Pasir kucing
    medicine      // Obat-obatan
    supplement    // Suplemen
    other         // Lainnya
}

model DonationCampaign {
    id                String              @id @default(uuid())
    shelterId         String?             @map("shelter_id")
    title             String              @db.VarChar(200)
    description       String?             @db.Text
    itemType          DonationItemType
    targetQuantity    Int                 @map("target_quantity") @db.Integer
    receivedQuantity  Int                 @default(0) @map("received_quantity")
    unit              String              @db.VarChar(20) // kg, pcs, box, dll
    deadline          DateTime?           @map("deadline") @db.Date
    contactPerson     String?             @map("contact_person") @db.VarChar(120)
    contactPhone      String?             @map("contact_phone") @db.VarChar(30)
    bankAccount       String?             @map("bank_account") @db.VarChar(60) // jika donasi uang
    bankName          String?             @map("bank_name") @db.VarChar(80)
    accountHolder     String?             @map("account_holder") @db.VarChar(120)
    imageUrl          String?             @map("image_url")
    isActive          Boolean             @default(true) @map("is_active")
    isResolved        Boolean             @default(false) @map("is_resolved")
    createdAt         DateTime            @default(now()) @map("created_at")
    updatedAt         DateTime            @updatedAt @map("updated_at")

    shelter Shelter? @relation(fields: [shelterId], references: [id], onDelete: SetNull)

    @@index([isActive])
    @@index([isResolved])
    @@index([itemType])
    @@map("donation_campaigns")
}

model DonationTransaction {
    id            String   @id @default(uuid())
    campaignId    String   @map("campaign_id")
    donorName     String   @db.VarChar(120)
    donorPhone    String?  @map("donor_phone") @db.VarChar(30)
    amountIdr     Decimal? @map("amount_idr") @db.Decimal(12, 2) // jika donasi uang
    quantity      Int?     @default(0) // jika donasi barang
    itemType      DonationItemType?
    note          String?  @db.Text
    transactionAt DateTime @map("transaction_at") @default(now())

    campaign DonationCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

    @@index([campaignId])
    @@index([transactionAt(sort: Desc)])
    @@map("donation_transactions")
}

// --- EVENT FAVORITES ---

model EventFavorite {
    id        String   @id @default(uuid())
    eventId   String   @map("event_id")
    userId    String   @map("user_id")
    createdAt DateTime @default(now()) @map("created_at")

    event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
    user  User    @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([eventId, userId])
    @@index([userId])
    @@map("event_favorites")
}
```

### 3.2 Existing models yang perlu diperluas

```prisma
// Event model (existing) — tambahkan field:
model Event {
    // ... existing fields ...
    category       EventCategory      @default(competition)
    categories     Json?              @db.JsonB // multiple categories e.g. ["kitten", "adult", "long_hair"]
    entryFee       Decimal?           @map("entry_fee") @db.Decimal(6, 2) // biaya pendaftaran
    maxParticipants Int?               @map("max_participants") // kapasitas maksimal
    registrationOpen Boolean          @default(false) @map("registration_open")
    organizerName   String?            @map("organizer_name")
    organizerContact String?           @map("organizer_contact")
    requirements    String?            @db.Text // syarat dan ketentuan
    imageUrls       Json?              @map("image_urls") @db.JsonB // gallery images
}

// Cat model (existing) — tambah relation:
model Cat {
    // ... existing fields ...
    eventRegistrations EventRegistration[]
    eventFavorites     EventFavorite[]  // via many-to-many through registrations
}
```

## 4. API Endpoints Design

### 4.1 Event Hub APIs

#### Kalender & List Event

```
GET  /api/events                    # List semua event aktif
GET  /api/events/[id]               # Detail event
POST /api/events/[id]/favorite      # Toggle favorit
DELETE /api/events/[id]/favorite    # Hapus favorit
GET  /api/events/user/favorites     # Event favorit user
GET  /api/events/upcoming?city=...&category=...  # Filter event
GET  /api/events/calendar?month=2026-08  # Event per bulan (kalender)
```

#### Registrasi Event

```
POST /api/events/[id]/register      # Daftar event (+ buat Pet Passport jika belum ada)
GET  /api/events/[id]/registrations # List peserta (admin only)
POST /api/events/[id]/check-in      # Check-in di lokasi event (admin/organizer)
GET  /api/events/user/my-events     # Event yang user daftarkan
```

#### AI Event Recommendation

```
GET /api/events/recommend?catId=...  # Event yang cocok berdasarkan profil kucing
```

### 4.2 Pet Services APIs

#### Klinik Hewan

```
GET  /api/services/vets             # List klinik
GET  /api/services/vets/[id]        # Detail klinik
GET  /api/services/vets/nearby?lat=...&lng=...&radius=...  # Klinik terdekat
```

#### Grooming

```
GET  /api/services/grooming         # List grooming
GET  /api/services/grooming/[id]    # Detail grooming
GET  /api/services/grooming/nearby?lat=...&lng=...&radius=...
GET  /api/services/grooming?homeService=true  # Filter home service
```

#### Petshop

```
GET  /api/services/petshops         # List petshop
GET  /api/services/petshops/[id]    # Detail petshop
GET  /api/services/petshops/nearby?lat=...&lng=...&radius=...
GET  /api/services/petshops?official=true  # Filter official store
```

#### Shelter

```
GET  /api/services/shelters         # List shelter
GET  /api/services/shelters/[id]    # Detail shelter + cats
GET  /api/services/shelters/nearby?lat=...&lng=...&radius=...
GET  /api/services/shelters/[id]/cats  # Kucing yang butuh adopter
```

### 4.3 Community APIs

#### Komunitas

```
GET  /api/community                 # List komunitas
GET  /api/community/[id]            # Detail komunitas
```

#### Lost & Found

```
GET  /api/lost-found                # List laporan
GET  /api/lost-found/[id]           # Detail laporan
POST /api/lost-found                # Buat laporan baru
PATCH /api/lost-found/[id]          # Update/resolve laporan
GET  /api/lost-found/nearby?lat=...&lng=...&radius=...
```

#### Donasi

```
GET  /api/donations                 # List kampanye aktif
GET  /api/donations/[id]            # Detail kampanye
POST /api/donations/[id]/contribute # Kontribusi donasi
GET  /api/donations/shelter/[id]    # Kampanye per shelter
```

### 4.4 Admin APIs

```
POST /api/admin/shelters            # Create/update shelter
POST /api/admin/vets                # Manage vet clinics
POST /api/admin/grooming            # Manage grooming services
POST /api/admin/petshops            # Manage petshops
POST /api/admin/communities         # Approve communities
POST /api/admin/lost-found          # Manage lost & found
POST /api/admin/donations           # Manage donation campaigns
```

## 5. UI Components & Pages

### 5.1 Navigation Changes

#### App Shell Navigation (app-shell.tsx)

Tambahkan item navigasi baru:

```ts
const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/chat", label: "Ketty AI", icon: Bot },
  { href: "/timeline", label: "Timeline", icon: NotebookTabs },
  { href: "/breeds", label: "Ras Kucing", icon: PawPrint },
  { href: "/community", label: "Komunitas", icon: Users }, // NEW
  { href: "/explore", label: "Explore", icon: Library },
];
```

#### Bottom Navigation (Mobile)

Pertimbangkan menambahkan tab "Komunitas" atau menggabungkan dengan "Explore".

### 5.2 Halaman Baru

#### `/community/page.tsx` — Community Hub

Halaman utama komunitas yang berisi:

- Event upcoming carousel (dari `components/upcoming-events-carousel.tsx`)
- Quick links: Event, Shelter, Klinik, Grooming, Komunitas, Donasi
- Kalender nasional mini
- Lost & Found terbaru
- Donasi aktif

#### `/community/events/page.tsx` — Event Hub

Kalender event interaktif dengan:

- View: Month calendar, List view, Map view
- Filter: Kota, Kategori, Tanggal
- Search: Nama event
- CTA: Register, Add to favorites
- Event cards dengan info singkat

#### `/community/events/[id]/page.tsx` — Event Detail

Detail lengkap event:

- Header dengan gambar
- Info dasar: nama, tanggal, lokasi, biaya
- Kategori kucing yang relevan
- Syarat & ketentuan
- Tombol: Register, Contact Organizer, View on Maps
- Related events
- Peserta (opsional, setelah register dibuka)

#### `/community/services/page.tsx` — Services Hub

Halaman utama layanan dengan:

- Tab: Klinik, Grooming, Petshop, Shelter
- Filter: Kota, Rating, Terbuka sekarang
- Lokasi user saat ini
- Quick map view

#### `/community/services/[type]/[id]/page.tsx` — Service Detail

Detail layanan:

- Nama, alamat, foto
- Jam buka
- Layanan yang ditawarkan
- Review/rating
- Kontak: WA, Phone, Maps
- Directions link

#### `/community/services/map/page.tsx` — Services Map

Peta interaktif dengan marker:

- 📍 Event
- 📍 Klinik Hewan
- 📍 Grooming
- 📍 Shelter
- 📍 Petshop
- Filter per kategori marker

#### `/community/shelter/page.tsx` — Shelter & Adopsi

Daftar shelter dengan:

- Kartu shelter: nama, lokasi, jumlah kucing tersedia
- Klik: lihat kucing yang butuh adopter
- Form: laporkan kucing liar/terlantara

#### `/community/shelter/[id]/page.tsx` — Shelter Detail

Detail shelter + daftar kucing:

- Info shelter
- Gallery kucing
- Setiap kucing: nama, usia, ras, gender, kesehatan
- Tombol: "Ingin Adopt" → redirect ke WhatsApp shelter

#### `/community/lost-found/page.tsx` — Lost & Found

Daftar laporan dengan:

- Filter: Hilang / Ditemukan
- Filter: Kota
- Kartu: nama kucing, lokasi, tanggal, foto
- CTA: "Laporkan Kucing Hilang" / "Saya Menemukan Kucing"

#### `/community/donate/page.tsx` — Donasi

Daftar kampanye donasi:

- Kartu: judul, progress bar, target, deadline
- Detail: deskripsi, cara donate, kontak
- Kontribusi langsung via form

#### `/community/communities/page.tsx` — Komunitas Directory

Direktori komunitas:

- Kartu: nama, kota, platform, jumlah member
- Klik: join link (WA/Telegram/Facebook)
- Form: ajukan komunitas baru

### 5.3 Komponen Baru

#### `components/event-calendar.tsx`

Kalender interaktif untuk menampilkan event bulanan.
Props: `events: Event[]`, `selectedMonth: Date`, `onDateClick: (date) => void`

#### `components/event-card.tsx`

Kartu event untuk list/view.
Props: `event: Event`, `isFavorite: boolean`, `onToggleFavorite: () => void`

#### `components/service-card.tsx`

Kartu untuk klinik/grooming/petshop/shelter.
Props: `service: Service`, `type: 'vet' | 'grooming' | 'petshop' | 'shelter'`, `showDistance: boolean`

#### `components/services-map.tsx`

Peta interaktif dengan marker berbagai jenis layanan.
Props: `services: Service[]`, `userLocation: {lat, lng} | null`

#### `components/lost-found-card.tsx`

Kartu untuk lost & found.
Props: `item: LostFound`, `type: 'lost' | 'found'`

#### `components/donation-progress.tsx`

Progress bar untuk kampanye donasi.
Props: `campaign: DonationCampaign`

#### `components/community-card.tsx`

Kartu untuk direktori komunitas.
Props: `community: Community`

#### `components/national-calendar.tsx`

Kalender nasional event kucing di homepage.
Props: `events: Event[]`, `month: Date`

#### `components/location-event-banner.tsx`

Banner "Event dekatmu" di homepage.
Props: `nearbyEvents: Event[]`, `userCity: string`

### 5.4 Perubahan pada Komponen Existing

#### `components/upcoming-events-carousel.tsx`

Sudah ada. Perlu dipastikan:

- Menggunakan data dari API (`/api/events`)
- Menampilkan nama kucing aktif secara dinamis
- Link ke `/community/events/[id]`

#### `app/explore/page.tsx`

Perlu memperluas "Explore" untuk mencakup:

- Artikel (existing)
- Event (existing)
- Shelter (new)
- Klinik (new)
- Komunitas (new)
- Produk (existing di `/explore/products`)

#### `app/page.tsx` (Homepage)

Tambahkan section:

- "Event dekatmu" (jika user login + punya active cat)
- "Kalender Nasional" mini
- "Butuh adopter?" link ke shelter
- "Lost & Found terbaru"

## 6. AI Recommendation untuk Event

### 6.1 Logic Event Matching

Ketika user melihat halaman event atau homepage, aplikasi akan merekomendasikan event yang sesuai dengan kucing aktif:

```ts
type EventRecommendationResult = {
  matches: Event[];
  reasons: Array<{
    eventId: string;
    reason: string; // e.g., "Kategori Adult cocok untuk usia [nama kucing]"
  }>;
};
```

### 6.2 Matching Rules

1. **Usia kucing vs Kategori event**
   - Kitten (< 1 tahun) → Kitten category
   - Adult (1-7 tahun) → Adult category
   - Senior (> 7 tahun) → Adult/Seminar/Workshop

2. **Ras vs Kategori event**
   - Long hair (Persia, Maine Coon, Ragdoll) → Long Hair category
   - Short hair → Short Hair category
   - Unknown → All Categories

3. **Status steril**
   - Sudah steril → Semua kompetisi terbuka
   - Belum steril → Hanya seminar/workshop/adopsi

4. **Lokasi**
   - Prioritaskan event di kota yang sama
   - Tampilkan event di kota tetangga dengan label "Dekat Anda"

5. **Tanggal**
   - Event dalam 30 hari ke depan → "Segera"
   - Event > 30 hari → "Masih ada waktu"

### 6.3 Contoh Output AI

> "[Nama Kucing] memenuhi syarat untuk mengikuti **Healthy Cat Contest** di kategori Adult Long Hair. Event ini diadakan di Surabaya pada 12 Agustus. Apakah ingin mendaftar?"

## 7. Pet Passport Deep Dive

### 7.1 Struktur Data

```ts
type PetPassportData = {
  cat: {
    id: string;
    name: string;
    breed: string | null;
    estimatedDateOfBirth: Date | null;
    weightKg: number | null;
    gender: string | null;
    sterilized: boolean;
    photoUrl: string | null;
  };
  passportToken: string;
  vaccines: Array<{
    date: Date;
    type: string; // Trivalent, Tetavalent, Rabies, dll
    provider: string | null; // nama dokter/klinik
    nextDueDate: Date | null;
  }>;
  sterilization: {
    date: Date | null;
    provider: string | null;
    notes: string | null;
  } | null;
  achievements: Array<{
    title: string;
    description: string | null;
    achievedAt: Date;
    icon: string;
    rank?: number;
  }>;
  eventsAttended: Array<{
    eventName: string;
    eventDate: Date;
    category: string;
    result?: string; // Juara 1, 2, 3, Peserta
    certificateUrl?: string;
  }>;
  groomingHistory: Array<{
    date: Date;
    service: string; // Bath, Cut Nail, Brush, Full Groom
    provider: string | null;
    notes: string | null;
  }>;
  healthSummary: string | null;
};
```

### 7.2 QR Code Content

```
https://rumahkucing.id/api/passport/scan?token={passportToken}
```

Response public scan:

```json
{
  "cat": {
    "name": "Milo",
    "breed": "Persian",
    "age": "3.5 tahun",
    "gender": "Jantan",
    "sterilized": true,
    "vaccinated": true,
    "owner": "Imam"
  },
  "verified": true
}
```

### 7.3 Auto-generation

Pet Passport otomatis dibuat ketika:

1. User mendaftarkan kucing untuk event pertama kali
2. User mengaktifkan fitur Passport dari dashboard
3. User menambah catatan vaksin pertama

### 7.4 Auto-update

Passport otomatis update ketika:

1. Timeline event baru ditambahkan (vaksin, grooming)
2. Achievement baru diperoleh
3. User mengikuti event baru

## 8. Admin Panel Extensions

### 8.1 Sidebar Menu additions

```
Admin Panel
├── Dashboard
├── Articles
├── Events          ← existing
├── Products
├── Orders
├── Users
├── Analytics
├── ───────────────
├── Shelters        ← new
├── Vet Clinics     ← new
├── Grooming        ← new
├── Petshops        ← new
├── Communities     ← new
├── Breeders        ← new
├── Lost & Found    ← new
└── Donations       ← new
```

### 8.2 Admin Features

- CRUD untuk semua entity layanan
- Approve/reject komunitas baru
- Approve/reject breeder baru
- Mark shelter/petshop sebagai "Official"
- Manage donation campaigns
- Scan QR check-in untuk event
- Moderate lost & found reports

## 9. Urutan Pengerjaan (Roadmap)

### Phase 4.1 — Event Hub (Prioritas Tertinggi)

**Estimasi: 5-7 hari kerja**

Deliverables:

1. Migration: Event extensions (category, entryFee, categories, registrationOpen, requirements)
2. Migration: EventRegistration, EventFavorite tables
3. API: GET/POST /api/events, GET /api/events/[id]
4. API: POST /api/events/[id]/register, GET /api/events/user/favorites
5. API: AI Event Recommendation `/api/events/recommend`
6. Page: `/community/events` — Event Hub dengan kalender
7. Page: `/community/events/[id]` — Event Detail
8. Component: EventCalendar, EventCard
9. Component: LocationEventBanner (homepage)
10. Component: NationalCalendar
11. Admin: Event management enhancements

Acceptance criteria:

- User bisa melihat semua event aktif
- User bisa filter event berdasarkan kota dan kategori
- User bisa register event untuk kucing mereka
- User bisa simpan event favorit
- AI merekomendasikan event yang sesuai dengan profil kucing
- Homepage menampilkan "Event dekatmu" jika user memberikan lokasi
- Admin bisa manage event dari admin panel

### Phase 4.2 — Pet Services

**Estimasi: 5-7 hari kerja**

Deliverables:

1. Migration: VetClinic, GroomingService, Petshop, Shelter, ShelterCat tables
2. API: CRUD untuk semua layanan
3. API: Nearby search dengan lat/lng
4. Page: `/community/services` — Services Hub
5. Page: `/community/services/[type]/[id]` — Service Detail
6. Page: `/community/services/map` — Services Map
7. Component: ServiceCard, ServicesMap
8. Admin: CRUD untuk semua layanan

Acceptance criteria:

- User bisa melihat semua klinik, grooming, petshop, shelter
- User bisa filter berdasarkan kota dan rating
- User bisa lihat detail layanan dengan kontak dan review
- Peta menampilkan semua marker layanan
- Admin bisa manage semua layanan

### Phase 4.3 — Community

**Estimasi: 4-5 hari kerja**

Deliverables:

1. Migration: Community, VerifiedBreeder, LostFound, DonationCampaign, DonationTransaction tables
2. API: CRUD untuk semua entity
3. Page: `/community/communities` — Komunitas Directory
4. Page: `/community/shelter` — Shelter & Adopsi
5. Page: `/community/lost-found` — Lost & Found
6. Page: `/community/donate` — Donasi
7. Page: `/community/breeders` — Verified Breeder
8. Component: CommunityCard, LostFoundCard, DonationProgress
9. Admin: Approve/reject entities

Acceptance criteria:

- User bisa browse komunitas dan join via link eksternal
- User bisa lihat shelter dan kucing yang butuh adopter
- User bisa laporkan kucing hilang/ditemukan
- User bisa berkontribusi ke kampanye donasi
- Admin bisa approve entity baru

### Phase 4.4 — Pet Passport

**Estimasi: 4-5 hari kerja**

Deliverables:

1. Migration: PetPassport table
2. API: CRUD passport, QR generation, public scan endpoint
3. Page: `/passport/[catId]` — Pet Passport full page
4. Component: PetPassportQR, PetPassportSection
5. Integration: Auto-generate on first event registration
6. Integration: Auto-update from Timeline events
7. Admin: QR scan check-in untuk event

Acceptance criteria:

- Passport otomatis dibuat saat registrasi event pertama
- QR code menampilkan informasi dasar kucing
- Admin bisa scan QR untuk check-in event
- Passport menampilkan semua riwayat vaksin, prestasi, event
- Passport auto-update dari Timeline

### Phase 4.0 — Foundation & Integration

**Estimasi: 2-3 hari kerja**

Deliverables:

1. Semua migration digabung dan dijalankan
2. App shell navigation updated
3. Community Hub page (`/community`)
4. Explore page extended
5. Homepage sections added
6. Global search extended
7. Responsive testing (mobile + desktop)
8. Documentation updates

## 10. Testing Plan

### Unit Test

- Event matching rules (usia, ras, steril, lokasi)
- Pet passport data aggregation
- QR code token generation/validation
- Donation progress calculation
- Lost & found proximity matching

### API Test

- `GET /api/events` — list, filter, pagination
- `POST /api/events/[id]/register` — validation, passport creation
- `GET /api/events/recommend?catId=...` — AI recommendation
- `GET /api/services/vets/nearby` — proximity search
- `POST /api/donations/[id]/contribute` — validation, progress update
- `GET /api/passport/scan?token=...` — public scan

### UI Test

- Event Hub: calendar view, list view, filter
- Event Detail: register button, related events
- Services Hub: tabs, map view, detail
- Shelter: cat listing, adopt CTA
- Lost & Found: report form, filter
- Donate: progress bar, contribute form
- Pet Passport: all tabs, QR display
- Mobile responsive: all pages

### Scenario Test

#### Event Registration Flow

1. User login dengan active cat "Milo"
2. User buka `/community/events`
3. User klik event "Healthy Cat Contest"
4. Aplikasi rekomendasikan: "Milo cocok untuk kategori Adult Long Hair"
5. User klik "Daftar Sekarang"
6. Pet Passport Milo otomatis dibuat
7. User dapat konfirmasi + QR code

#### Pet Passport Flow

1. User buka `/passport/[catId]`
2. Tampil: foto, nama, QR code besar
3. Tab Vaksin: riwayat lengkap dari timeline
4. Tab Prestasi: achievement dari database
5. Tab Event: riwayat partisipasi
6. User bisa share screenshot passport

#### Lost & Found Flow

1. User klik "Laporkan Kucing Hilang"
2. Isi form: nama, foto, lokasi terakhir, kontak
3. Laporan muncul di list dengan badge "HILANG"
4. Someone menemukan kucing → lapor "Ditemukan"
5. System match berdasarkan lokasi/kota
6. Kedua pihak terhubung via WhatsApp

## 11. Risiko dan Mitigasi

### Risiko: Privacy data lokasi pengguna

Mitigasi:

- Jangan simpan lat/lng exact di public page
- Gunakan kota/province untuk filtering
- Lost & Found kontak hanya terlihat oleh reporter

### Risiko: Spam laporan lost & found

Mitigasi:

- Hanya user login yang bisa buat laporan
- Admin bisa moderate/hapus laporan palsu
- Rate limit: max 3 laporan aktif per user

### Risiko: Data layanan tidak akurat

Mitigasi:

- Admin yang validate semua entry
- Badge "Verified" untuk yang sudah dicek
- User bisa report data salah
- Disclaimer: "Data mungkin berubah, konfirmasi terlebih dahulu"

### Risiko: Breeder tidak terpercaya

Mitigasi:

- Verified breeder hanya oleh admin
- Butuh dokumen verifikasi (license, KTP)
- Badge "Verified" hanya untuk yang approved
- Form pelaporan untuk breeder nakal

### Risiko: Donasi disalahgunakan

Mitigasi:

- Transparansi: setiap kontribusi tercatat
- Admin monitor kampanye
- Contact person harus verifiable
- Disclaimer: "Rumah Kucing tidak menjamin penggunaan dana"

### Risiko: Event registration overload

Mitigasi:

- `maxParticipants` di event
- First come first served
- Cancelation handling
- Check-in via QR scan

## 12. Teknologi yang Dibutuhkan

### QR Code

- Library: `qrcode` (npm) untuk generate QR di server
- Atau: inline SVG QR generation di client

### Peta/Maps

- Opsi 1: Google Maps JavaScript API (berbayar)
- Opsi 2: Leaflet + OpenStreetMap (gratis) ✅ RECOMMENDED
- Opsi 3: Mapbox (freemium)

Untuk MVP, gunakan **Leaflet + OpenStreetMap** (gratis, no API key needed).

### Kalender

- Library: `react-day-picker` atau custom calendar
- Untuk MVP, custom calendar cukup (simple month view)

### Format .ics (Add to Calendar)

- Generate `.ics` file content di server
- User download dan import ke Google Calendar/app calendar

## 13. Environment Variables Baru

```env
# Phase 4
NEXT_PUBLIC_APP_URL=https://rumahkucing.id
NEXT_PUBLIC_MAP_PROVIDER=openstreetmap  # atau google
```

## 14. Package Dependencies Baru

```json
{
  "dependencies": {
    "qrcode": "^1.5.4",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  }
}
```

## 15. Design Guidelines

### Event Card

```
┌─────────────────────────────────┐
│ [Hero Image]                    │
│                                 │
│ 🏆 Healthy Cat Contest          │
│ 📍 Surabaya  ·  🗓 15 Agu       │
│ 💰 Rp50.000                     │
│                                 │
│ [Register]  [♡ Favorit]         │
└─────────────────────────────────┘
```

### Service Card

```
┌─────────────────────────────────┐
│ Happy Vet                       │
│ ⭐ 4.8  (120 reviews)          │
│ 📍 Jl. Mawar No. 12             │
│ 📍 1.2 km dari Anda             │
│ 🕐 Buka · Tutup 21:00           │
│                                 │
│ [Kontak]  [Maps]  [Layanan]     │
└─────────────────────────────────┘
```

### Pet Passport

```
┌─────────────────────────────────┐
│  [Photo]  Milo 🐱               │
│  Persian · 3.5 tahun            │
│  ♂ Jantan  · ✓ Steril           │
│                                 │
│  [QR CODE LARGE]                │
│  Scan untuk verifikasi           │
│                                 │
│  [Vaksin] [Prestasi] [Event]    │
└─────────────────────────────────┘
```

## 16. Catatan Penting

### Dynamic Cat Name

Semua tampilan yang menyebut nama kucing HARUS menggunakan nama aktual dari `activeCat.name`, BUKAN hardcoded "Snowy". "Snowy" hanya contoh dalam dokumentasi ini.

### Localization

Semua UI text dalam Bahasa Indonesia. Technical terms dalam English boleh dipakai di kode.

### Backward Compatibility

Semua migration harus backward compatible. Field baru boleh nullable. Existing data tidak boleh terpengaruh.

### Admin-First Data Entry

Untuk MVP, semua data layanan (klinik, grooming, shelter, dll) diinput oleh admin melalui admin panel. User biasa tidak bisa create/edit data layanan.

### External Links Only

Untuk fitur yang memerlukan platform eksternal (WhatsApp, Telegram, Facebook, Google Maps), gunakan link eksternal. Jangan bangun fitur chat/internal messaging.

---

## Summary Roadmap

| Phase | Focus                    | Est. Days | Priority | Status      |
| ----- | ------------------------ | --------- | -------- | ----------- |
| 4.0   | Foundation & Integration | 2-3       | P0       | Belum mulai |
| 4.1   | Event Hub                | 5-7       | P0       | Belum mulai |
| 4.2   | Pet Services             | 5-7       | P1       | Belum mulai |
| 4.3   | Community                | 4-5       | P1       | Belum mulai |
| 4.4   | Pet Passport             | 4-5       | P2       | **DELAYED** |

**Total Estimated (excluding Pet Passport): 15-22 hari kerja**
**Total Estimated (with Pet Passport): 20-27 hari kerja**

Bisa dikerjakan paralel untuk tim > 1 orang:

- Backend developer: APIs + migrations
- Frontend developer: Pages + components
- Fullstack: Event Hub (paling kompleks)

---

## 17. Approval Checklist

Sebelum memulai eksekusi Phase 4, pastikan hal-hal berikut telah disetujui:

- [ ] Scope Phase 4.1 — Event Hub sudah jelas dan realistis
- [ ] Scope Phase 4.2 — Pet Services sudah sesuai kebutuhan
- [ ] Scope Phase 4.3 — Community sudah sesuai prioritas
- [ ] Database schema additions direview dan tidak konflik dengan schema existing
- [ ] API endpoints design tidak melanggar konvensi yang ada
- [ ] UI components & pages yang direncanakan compatible dengan design system existing
- [ ] Out of scope items benar-benar tidak perlu di-phase pertama
- [ ] Timeline estimasi sesuai resource yang tersedia
- [ ] Pet Passport memang sengaja di-delay ke phase berikutnya
- [ ] Dynamic cat name principle dipahami dan akan diterapkan

---

_Dokumen ini dibuat sebagai rencana implementasi Phase 4. Tidak ada kode yang diubah hingga plan ini disetujui._
