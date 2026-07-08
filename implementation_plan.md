# Implementation Plan: Ekosistem Web App Perawatan Kucing (Fokus Frontend)

Rencana implementasi ini berfokus pada pembangunan struktur Frontend untuk aplikasi perawatan kucing menggunakan teknologi modern, dengan penekanan pada arsitektur, SEO, performa, dan estetika visual yang premium.

## Tech Stack Terpilih
- **Framework**: Next.js 14+ (App Router) menggunakan TypeScript. (Dipilih karena kapabilitas SEO yang sangat baik untuk konten edukasi/artikel).
- **Styling**: Tailwind CSS.
- **UI Component**: Shadcn/ui (berbasis Radix UI, estetis, modern, dan sangat mudah disesuaikan).
- **Icons**: Lucide React.
- **State Management**: Zustand (untuk menyimpan profil kucing aktif dan sesi di client-side).

## Proposed Changes / Tahapan Implementasi

Fase awal eksekusi akan difokuskan pada perancangan kerangka *Frontend*, komponen UI (Design System), dan simulasi *flow* aplikasi.

### 1. Inisialisasi & Setup Proyek
- Melakukan instalasi Next.js dengan App Router.
- Mengonfigurasi Tailwind CSS dan inisialisasi Shadcn/ui.
- Mengatur struktur folder dan *routing*.

### 2. Struktur Routing Utama (Next.js App Router)
- **`app/page.tsx`**: Halaman *Landing Page* / *Dashboard* pengguna ("Apa yang ingin Anda lakukan hari ini?").
- **`app/onboarding/page.tsx`**: *Flow* interaktif pembuatan profil kucing baru.
- **`app/chat/page.tsx`**: Antarmuka *Smart Assistant AI* dengan riwayat *chat* dan komponen kartu rekomendasi kontekstual.
- **`app/timeline/page.tsx`**: Halaman rekam jejak digital kucing (*Digital Home/Timeline*).
- **`app/explore/page.tsx`**: Halaman pusat edukasi (ras, penyakit, artikel) yang teroptimasi SEO.

### 3. Pembuatan Reusable UI Components
- **`CatProfileCard`**: Komponen ringkas yang mengingatkan pengguna bahwa aplikasi sedang melayani kucing spesifik (mis. "Mochi (8 Bulan)").
- **`SolutionCard` / `ProductCard`**: Komponen rekomendasi elegan yang disisipkan setelah pengguna mendapat *insight* AI atau membaca artikel.
- **`TimelineEvent`**: Titik kejadian di halaman timeline (dengan ikon spesifik seperti vaksin, ulang tahun, pergantian makanan).

### 4. Tahap Mock Data & Interaksi
- Pembuatan interaksi UI dengan transisi dan *mock data* untuk memvalidasi *User Experience* (UX) sebelum integrasi Backend/API.

## Catatan Tambahan
- Pendekatan layout (*Mobile-first* vs *Desktop responsive*) dan tema warna akan disesuaikan berdasarkan preferensi lebih lanjut sebelum *slicing* UI dimulai.
