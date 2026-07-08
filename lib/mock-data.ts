import {
  BookOpen,
  Bot,
  Cake,
  CalendarCheck,
  Cat,
  HeartPulse,
  PawPrint,
  NotebookPen,
  Pill,
  ShoppingBag,
  Sparkles,
  Syringe,
  Utensils
} from "lucide-react";

export const cats = [
  {
    id: "mochi",
    name: "Mochi",
    breed: "British Shorthair",
    age: "8 bulan",
    weight: "3.4 kg",
    gender: "Betina",
    sterilized: false,
    lifestyle: "Indoor",
    note: "Sensitif pada makanan tinggi gandum"
  },
  {
    id: "nori",
    name: "Nori",
    breed: "Domestic Shorthair",
    age: "2 tahun",
    weight: "4.8 kg",
    gender: "Jantan",
    sterilized: true,
    lifestyle: "Indoor + balkon",
    note: "Riwayat hairball ringan"
  }
];

export const solutionActions = [
  {
    title: "Cek kesehatan",
    description: "Triage gejala awal dan kapan perlu dokter hewan.",
    href: "/chat",
    icon: HeartPulse,
    tone: "bg-rose-50 text-rose-700 ring-rose-100"
  },
  {
    title: "Tanya Ketty AI",
    description: "Diskusi personal berbasis profil dan riwayat kucing.",
    href: "/chat",
    icon: Bot,
    tone: "bg-teal-50 text-teal-700 ring-teal-100"
  },
  {
    title: "Catat perkembangan",
    description: "Berat badan, vaksin, perubahan makanan, dan momen penting.",
    href: "/timeline",
    icon: NotebookPen,
    tone: "bg-amber-50 text-amber-700 ring-amber-100"
  },
  {
    title: "Belajar ras & care",
    description: "Artikel ringkas untuk kebutuhan perawatan sehari-hari.",
    href: "/explore",
    icon: BookOpen,
    tone: "bg-indigo-50 text-indigo-700 ring-indigo-100"
  },
  {
    title: "Cari ras ideal",
    description: "Bandingkan karakter, biaya, makanan, dan opsi adopt.",
    href: "/breeds",
    icon: PawPrint,
    tone: "bg-cyan-50 text-cyan-700 ring-cyan-100"
  },
  {
    title: "Beli kebutuhan",
    description: "Produk muncul berdasarkan masalah, bukan dorongan belanja.",
    href: "/explore",
    icon: ShoppingBag,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100"
  }
];

export const recommendedProducts = [
  {
    name: "Hairball Control Meal",
    category: "Dry food",
    reason: "Cocok setelah riwayat hairball ringan dan kucing indoor.",
    price: "Rp128.000",
    badge: "Solusi hairball"
  },
  {
    name: "Water Fountain 2L",
    category: "Hydration",
    reason: "Mendorong minum lebih sering untuk kucing yang aktif di dalam rumah.",
    price: "Rp219.000",
    badge: "Kebiasaan sehat"
  },
  {
    name: "Dental Treat Salmon",
    category: "Snack",
    reason: "Pilihan snack ringan untuk rutinitas gigi mingguan.",
    price: "Rp42.000",
    badge: "Perawatan harian"
  }
];

export const timelineEvents = [
  {
    title: "Jadwal vaksin F3",
    date: "12 Juli 2026",
    description: "Pengingat vaksin lanjutan. Siapkan catatan berat badan terbaru.",
    icon: Syringe,
    status: "Mendatang"
  },
  {
    title: "Berat badan stabil",
    date: "28 Juni 2026",
    description: "Mochi naik dari 3.2 kg ke 3.4 kg dalam empat minggu.",
    icon: CalendarCheck,
    status: "Tercatat"
  },
  {
    title: "Ganti makanan bertahap",
    date: "14 Juni 2026",
    description: "Transisi 7 hari ke formula kitten sensitive digestion.",
    icon: Utensils,
    status: "Perawatan"
  },
  {
    title: "Ulang bulan ke-8",
    date: "2 Juni 2026",
    description: "Foto favorit dan milestone perilaku baru: lebih nyaman disisir.",
    icon: Cake,
    status: "Memori"
  }
];

export const articles = [
  {
    slug: "british-shorthair-pola-makan-bulu-berat-ideal",
    title: "British Shorthair: pola makan, bulu, dan berat ideal",
    category: "Ras",
    readTime: "6 menit",
    summary: "Panduan singkat untuk menjaga badan tetap padat tanpa obesitas.",
    icon: Cat,
    heroImage: "/images/breeds/british-shorthair.png",
    heroAlt: "British Shorthair abu-abu di ruangan rumah yang hangat",
    updatedAt: "7 Juli 2026",
    quickTakeaways: [
      "British Shorthair mudah terlihat gemuk karena badan alaminya padat.",
      "Porsi makan lebih penting daripada sekadar memilih merek premium.",
      "Sisir mingguan membantu mengurangi bulu rontok dan hairball."
    ],
    sections: [
      {
        heading: "Profil singkat ras",
        body: "British Shorthair dikenal tenang, mandiri, dan cocok untuk rumah indoor. Bentuk tubuhnya memang cenderung bulat, jadi pemilik perlu membedakan badan padat yang sehat dengan kenaikan lemak berlebih."
      },
      {
        heading: "Pola makan yang disarankan",
        body: "Gunakan makanan tinggi protein dengan kalori terukur. Untuk kucing indoor seperti Mochi, pilih formula indoor atau hairball control jika ada riwayat muntah bulu. Hindari memberi snack tanpa menghitung total kalori harian."
      },
      {
        heading: "Perawatan bulu",
        body: "Walau bulunya pendek, British Shorthair punya lapisan bulu yang tebal. Sisir 2-3 kali seminggu saat masa rontok dan pantau kulit jika muncul ketombe, gatal, atau area botak."
      },
      {
        heading: "Berat ideal",
        body: "Berat ideal tergantung umur, jenis kelamin, dan rangka tubuh. Gunakan body condition score: tulang rusuk masih bisa diraba tipis, pinggang terlihat dari atas, dan perut tidak menggantung berlebihan."
      }
    ],
    vetWarning:
      "Hubungi dokter hewan jika berat naik cepat, kucing tiba-tiba tidak mau makan, muntah berulang, atau terlihat sulit bernapas."
  },
  {
    slug: "hairball-kucing-indoor-kapan-waspada",
    title: "Hairball pada kucing indoor: kapan normal, kapan waspada",
    category: "Kesehatan",
    readTime: "5 menit",
    summary: "Gejala yang bisa dipantau di rumah dan sinyal untuk menghubungi dokter.",
    icon: HeartPulse,
    heroImage: "/images/cat-care-dashboard.png",
    heroAlt: "Kucing indoor di dekat jurnal perawatan dan mangkuk makanan",
    updatedAt: "7 Juli 2026",
    quickTakeaways: [
      "Hairball sesekali bisa normal, terutama saat bulu sedang rontok.",
      "Muntah berulang, lesu, atau tidak mau makan bukan kondisi normal.",
      "Sisir rutin, hidrasi, dan makanan berserat bisa membantu mengurangi hairball."
    ],
    sections: [
      {
        heading: "Apa itu hairball?",
        body: "Hairball terjadi ketika bulu yang tertelan saat grooming menumpuk dan keluar melalui muntah. Pada kucing indoor, hairball sering dipicu oleh grooming intensif, bulu rontok, kurang minum, atau kurang serat."
      },
      {
        heading: "Kapan masih bisa dipantau?",
        body: "Jika hanya terjadi sekali, kucing tetap aktif, tetap makan, minum, dan litter box normal, pemilik bisa memantau 24 jam sambil mencatat frekuensi dan bentuk muntahnya."
      },
      {
        heading: "Langkah di rumah",
        body: "Sisir bulu lebih sering, tambah akses air minum, pertimbangkan wet food, dan gunakan makanan hairball control bila sesuai profil. Catat apakah ada makanan baru yang memicu muntah."
      },
      {
        heading: "Kapan harus ke dokter?",
        body: "Segera hubungi dokter jika muntah berulang, perut terlihat nyeri, kucing tidak buang air, tidak mau makan, lemas, atau ada darah. Hairball tidak boleh dianggap sepele jika disertai tanda sistemik."
      }
    ],
    vetWarning:
      "Darurat jika kucing muntah berkali-kali, tidak bisa makan/minum, tampak nyeri, atau tidak buang air."
  },
  {
    slug: "membaca-label-makanan-kucing",
    title: "Cara membaca label makanan kucing tanpa tersesat jargon",
    category: "Nutrisi",
    readTime: "7 menit",
    summary: "Protein, serat, kelembapan, dan bahan yang perlu diperhatikan.",
    icon: Sparkles,
    heroImage: "/images/breeds/domestic-shorthair.png",
    heroAlt: "Kucing domestic shorthair di ruangan rumah",
    updatedAt: "7 Juli 2026",
    quickTakeaways: [
      "Baca komposisi utama, bukan hanya klaim di bagian depan kemasan.",
      "Protein hewani, kelembapan, dan kalori perlu dilihat bersama.",
      "Pilih makanan sesuai umur, kondisi tubuh, dan riwayat kesehatan."
    ],
    sections: [
      {
        heading: "Mulai dari tahap hidup",
        body: "Kitten, adult, senior, steril, dan indoor punya kebutuhan energi berbeda. Label yang tepat untuk tahap hidup membantu mengurangi risiko kekurangan atau kelebihan nutrisi."
      },
      {
        heading: "Protein dan bahan utama",
        body: "Cari sumber protein hewani yang jelas seperti ayam, ikan, atau turkey. Hindari menilai hanya dari angka protein karena kualitas sumber bahan dan kebutuhan kucing tetap penting."
      },
      {
        heading: "Serat, kelembapan, dan kalori",
        body: "Serat bisa membantu hairball dan pencernaan, sedangkan kelembapan penting untuk hidrasi. Untuk kucing indoor, perhatikan kalori agar berat badan tidak naik diam-diam."
      },
      {
        heading: "Cara transisi makanan",
        body: "Ganti makanan bertahap selama 7-10 hari. Campur porsi lama dan baru secara perlahan untuk mengurangi risiko muntah atau diare."
      }
    ],
    vetWarning:
      "Konsultasikan ke dokter jika kucing punya penyakit ginjal, diabetes, alergi berat, atau gangguan pencernaan berulang."
  },
  {
    slug: "checklist-obat-cacing-vaksin-antiparasit",
    title: "Checklist obat cacing, vaksin, dan antiparasit",
    category: "Preventif",
    readTime: "4 menit",
    summary: "Rutinitas dasar yang membantu catatan kesehatan tetap rapi.",
    icon: Pill,
    heroImage: "/images/cat-care-dashboard.png",
    heroAlt: "Jurnal perawatan kucing dengan suasana rumah yang rapi",
    updatedAt: "7 Juli 2026",
    quickTakeaways: [
      "Perawatan preventif lebih mudah jika masuk timeline.",
      "Jadwal vaksin, obat cacing, dan antiparasit tergantung umur serta risiko lingkungan.",
      "Catatan produk dan tanggal pemberian membantu dokter saat konsultasi."
    ],
    sections: [
      {
        heading: "Vaksin dasar",
        body: "Vaksin membantu melindungi kucing dari penyakit menular. Jadwal awal biasanya dimulai saat kitten, lalu booster mengikuti rekomendasi dokter hewan."
      },
      {
        heading: "Obat cacing",
        body: "Frekuensi obat cacing berbeda antara kitten, kucing dewasa indoor, dan kucing yang sering keluar. Catat tanggal dan produk agar tidak dobel atau terlambat."
      },
      {
        heading: "Antiparasit",
        body: "Kutu dan tungau bisa tetap muncul pada kucing indoor melalui lingkungan, manusia, atau hewan lain. Pantau garukan berlebih, kerak telinga, dan bintik hitam di bulu."
      },
      {
        heading: "Masukkan ke timeline",
        body: "Setiap pemberian obat, vaksin, dan keluhan setelahnya sebaiknya dicatat. Ini membuat riwayat kucing lebih siap saat dibawa ke klinik."
      }
    ],
    vetWarning:
      "Jangan memberi obat manusia atau antiparasit anjing untuk kucing. Dosis dan bahan aktif harus sesuai arahan dokter."
  }
];

export const chatSeeds = [
  {
    role: "assistant",
    content:
      "Halo, Ketty AI membaca profil Mochi: 8 bulan, British Shorthair, indoor, dan sensitif pada makanan tinggi gandum. Apa yang ingin kamu cek hari ini?"
  },
  {
    role: "user",
    content: "Mochi muntah hairball sekali pagi ini. Masih aktif dan mau makan."
  },
  {
    role: "assistant",
    content:
      "Kalau hanya sekali, masih aktif, dan nafsu makan normal, pantau 24 jam dulu. Ketty AI merekomendasikan cek 3 hal: ada muntah berulang, lesu, atau sulit buang air? Jika ada salah satunya, sebaiknya hubungi dokter hewan."
  }
];

export const catBreedGuides = [
  {
    name: "British Shorthair",
    origin: "Inggris",
    imageSrc: "/images/breeds/british-shorthair.png",
    imageAlt: "Foto mock kucing British Shorthair berbulu abu-abu di ruangan hangat",
    profile:
      "Badan padat, wajah bulat, dan temperamen tenang. Cocok untuk pemilik yang ingin kucing indoor yang kalem.",
    characteristics: ["Tenang", "Mandiri", "Ramah keluarga", "Risiko obesitas"],
    foodType: "High-protein indoor formula, hairball control, porsi terukur",
    kittenPrice: "Rp8-25 juta",
    monthlyCare: "Rp650 ribu-1,4 juta",
    careLevel: "Sedang",
    availability: "Ready list",
    match: "Apartemen dan rumah tenang"
  },
  {
    name: "Maine Coon",
    origin: "Amerika Serikat",
    imageSrc: "/images/breeds/maine-coon.png",
    imageAlt: "Foto mock kucing Maine Coon berbulu panjang dengan telinga berjumbai",
    profile:
      "Ras besar, sosial, dan ekspresif. Butuh ruang, grooming rutin, dan budget makanan lebih tinggi.",
    characteristics: ["Sosial", "Ukuran besar", "Bulu panjang", "Aktif"],
    foodType: "Large breed kitten/adult, joint support, wet food tinggi protein",
    kittenPrice: "Rp12-35 juta",
    monthlyCare: "Rp1-2,6 juta",
    careLevel: "Tinggi",
    availability: "Pre-order",
    match: "Keluarga aktif dengan ruang cukup"
  },
  {
    name: "Persian",
    origin: "Iran",
    imageSrc: "/images/breeds/persian.png",
    imageAlt: "Foto mock kucing Persian berbulu panjang dalam setting grooming rumah",
    profile:
      "Bulu panjang dan wajah lembut. Sangat populer, tetapi perlu komitmen grooming dan perawatan mata.",
    characteristics: ["Manja", "Tenang", "Grooming intensif", "Indoor"],
    foodType: "Persian formula, skin & coat support, wet food mudah dikunyah",
    kittenPrice: "Rp4-18 juta",
    monthlyCare: "Rp800 ribu-2 juta",
    careLevel: "Tinggi",
    availability: "Adopt & buy",
    match: "Pemilik yang rajin grooming"
  },
  {
    name: "Bengal",
    origin: "Amerika Serikat",
    imageSrc: "/images/breeds/bengal.png",
    imageAlt: "Foto mock kucing Bengal bermotif rosette di ruangan modern",
    profile:
      "Enerjik, atletis, dan sangat penasaran. Cocok untuk pemilik yang siap memberi enrichment harian.",
    characteristics: ["Aktif", "Cerdas", "Butuh stimulasi", "Pola bulu kontras"],
    foodType: "High-protein active cat, wet food, snack training",
    kittenPrice: "Rp10-30 juta",
    monthlyCare: "Rp900 ribu-2,2 juta",
    careLevel: "Sedang tinggi",
    availability: "Konsultasi stok",
    match: "Pemilik berpengalaman"
  },
  {
    name: "Ragdoll",
    origin: "Amerika Serikat",
    imageSrc: "/images/breeds/ragdoll.png",
    imageAlt: "Foto mock kucing Ragdoll bermata biru di ruangan hangat",
    profile:
      "Lembut, santai, dan dekat dengan manusia. Biasanya cocok untuk keluarga yang ingin kucing affectionate.",
    characteristics: ["Affectionate", "Tenang", "Bulu semi panjang", "Ramah anak"],
    foodType: "Skin & coat formula, indoor adult, wet food rendah kalori",
    kittenPrice: "Rp10-28 juta",
    monthlyCare: "Rp850 ribu-2 juta",
    careLevel: "Sedang",
    availability: "Pre-order",
    match: "Keluarga dan first-time owner"
  },
  {
    name: "Domestic Shorthair",
    origin: "Campuran lokal",
    imageSrc: "/images/breeds/domestic-shorthair.png",
    imageAlt: "Foto mock kucing Domestic Shorthair tabby putih di ruangan rumah",
    profile:
      "Adaptif, tangguh, dan punya variasi karakter luas. Opsi adopsi yang sangat baik untuk banyak keluarga.",
    characteristics: ["Adaptif", "Perawatan mudah", "Variatif", "Budget ramah"],
    foodType: "Balanced adult/kitten food, wet food mingguan, dental snack",
    kittenPrice: "Adopsi Rp0-750 ribu",
    monthlyCare: "Rp350 ribu-950 ribu",
    careLevel: "Rendah sedang",
    availability: "Adopsi tersedia",
    match: "Hampir semua rumah"
  }
];
