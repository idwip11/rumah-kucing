/**
 * prisma/seed.ts
 *
 * Seeds the database with:
 * - All 18 cat breeds (with characteristics)
 * - 12 sample products with tags
 * - 4 articles with sections & takeaways
 * - 1 demo user + 2 cats + 4 timeline events
 *
 * Run with: npx prisma db seed
 */

import { PrismaClient, TimelineStatus, TimelineCategory, ChatRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// BREEDS SEED DATA
// ─────────────────────────────────────────────
const breeds = [
  {
    slug: "persian",
    name: "Persian",
    origin: "Iran",
    imageSrc: "/images/breeds/persian.png",
    profileSummary: "Bulu panjang dan wajah lembut. Sangat populer, tetapi perlu komitmen grooming dan perawatan mata.",
    foodType: "Persian formula, skin & coat support, wet food mudah dikunyah",
    kittenPriceLabel: "Rp4-18 juta",
    monthlyCareLabel: "Rp800rb-2 juta",
    careLevel: "Tinggi",
    availability: "Adopt & buy",
    matchLabel: "Pemilik yang rajin grooming",
    characteristics: ["Manja", "Tenang", "Grooming intensif", "Indoor"],
  },
  {
    slug: "maine-coon",
    name: "Maine Coon",
    origin: "Amerika Serikat",
    imageSrc: "/images/breeds/maine-coon.png",
    profileSummary: "Ras besar, sosial, dan ekspresif. Butuh ruang, grooming rutin, dan budget makanan lebih tinggi.",
    foodType: "Large breed kitten/adult, joint support, wet food tinggi protein",
    kittenPriceLabel: "Rp12-35 juta",
    monthlyCareLabel: "Rp1-2,6 juta",
    careLevel: "Tinggi",
    availability: "Pre-order",
    matchLabel: "Keluarga aktif dengan ruang cukup",
    characteristics: ["Sosial", "Ukuran besar", "Bulu panjang", "Aktif"],
  },
  {
    slug: "ragdoll",
    name: "Ragdoll",
    origin: "Amerika Serikat",
    imageSrc: "/images/breeds/ragdoll.png",
    profileSummary: "Lembut, santai, dan dekat dengan manusia. Biasanya cocok untuk keluarga yang ingin kucing affectionate.",
    foodType: "Skin & coat formula, indoor adult, wet food rendah kalori",
    kittenPriceLabel: "Rp10-28 juta",
    monthlyCareLabel: "Rp850rb-2 juta",
    careLevel: "Sedang",
    availability: "Pre-order",
    matchLabel: "Keluarga dan first-time owner",
    characteristics: ["Affectionate", "Tenang", "Bulu semi panjang", "Ramah anak"],
  },
  {
    slug: "norwegian-forest-cat-siberian",
    name: "Norwegian Forest Cat & Siberian",
    origin: "Norwegia / Rusia",
    imageSrc: null,
    profileSummary: "Kucing berbulu tebal, kuat, dan aktif. Suka bermain dan butuh stimulasi fisik.",
    foodType: "High-protein formula, wet food, hairball control",
    kittenPriceLabel: "Rp10-30 juta",
    monthlyCareLabel: "Rp900rb-2,2 juta",
    careLevel: "Sedang tinggi",
    availability: "Konsultasi stok",
    matchLabel: "Pemilik aktif yang punya ruang",
    characteristics: ["Kuat", "Aktif", "Bulu tebal", "Mandiri"],
  },
  {
    slug: "birman-sacred-birman",
    name: "Birman (Sacred Birman)",
    origin: "Myanmar",
    imageSrc: null,
    profileSummary: "Lembut, tenang, dan dikenal sebagai kucing yang sangat dekat dengan pemiliknya.",
    foodType: "Balanced adult indoor, wet food, dental snack",
    kittenPriceLabel: "Rp8-20 juta",
    monthlyCareLabel: "Rp700rb-1,8 juta",
    careLevel: "Sedang",
    availability: "Ready list",
    matchLabel: "Keluarga dan pasangan",
    characteristics: ["Lembut", "Tenang", "Bulu semi panjang", "Sosial"],
  },
  {
    slug: "british-shorthair",
    name: "British Shorthair",
    origin: "Inggris",
    imageSrc: "/images/breeds/british-shorthair.png",
    profileSummary: "Badan padat, wajah bulat, dan temperamen tenang. Cocok untuk pemilik yang ingin kucing indoor yang kalem.",
    foodType: "High-protein indoor formula, hairball control, porsi terukur",
    kittenPriceLabel: "Rp8-25 juta",
    monthlyCareLabel: "Rp650rb-1,4 juta",
    careLevel: "Sedang",
    availability: "Ready list",
    matchLabel: "Apartemen dan rumah tenang",
    characteristics: ["Tenang", "Mandiri", "Ramah keluarga", "Risiko obesitas"],
  },
  {
    slug: "american-shorthair",
    name: "American Shorthair",
    origin: "Amerika Serikat",
    imageSrc: null,
    profileSummary: "Adaptif, sehat, dan ramah. Salah satu ras paling populer karena mudah dirawat.",
    foodType: "Balanced adult formula, wet food, dental treat",
    kittenPriceLabel: "Rp5-15 juta",
    monthlyCareLabel: "Rp500rb-1,2 juta",
    careLevel: "Rendah sedang",
    availability: "Ready list",
    matchLabel: "First-time owner dan keluarga",
    characteristics: ["Adaptif", "Sehat", "Ramah", "Perawatan mudah"],
  },
  {
    slug: "siamese",
    name: "Siamese",
    origin: "Thailand",
    imageSrc: null,
    profileSummary: "Vokal, sosial, dan sangat berorientasi pada manusia. Perlu perhatian dan interaksi rutin.",
    foodType: "High-protein adult, wet food, snack training",
    kittenPriceLabel: "Rp3-10 juta",
    monthlyCareLabel: "Rp450rb-1,1 juta",
    careLevel: "Sedang",
    availability: "Adopt & buy",
    matchLabel: "Pemilik yang banyak di rumah",
    characteristics: ["Vokal", "Sosial", "Butuh perhatian", "Aktif"],
  },
  {
    slug: "abyssinian",
    name: "Abyssinian",
    origin: "Ethiopia",
    imageSrc: null,
    profileSummary: "Sangat aktif, penasaran, dan atletis. Memerlukan enrichment dan stimulasi mental harian.",
    foodType: "Active cat formula, high-protein wet food",
    kittenPriceLabel: "Rp8-20 juta",
    monthlyCareLabel: "Rp700rb-1,6 juta",
    careLevel: "Tinggi",
    availability: "Konsultasi stok",
    matchLabel: "Pemilik berpengalaman",
    characteristics: ["Sangat aktif", "Cerdas", "Atletis", "Penasaran"],
  },
  {
    slug: "russian-blue",
    name: "Russian Blue",
    origin: "Rusia",
    imageSrc: null,
    profileSummary: "Pemalu dengan orang asing tetapi sangat setia pada pemiliknya. Kucing apartemen yang ideal.",
    foodType: "Balanced indoor, wet food, hairball control",
    kittenPriceLabel: "Rp8-22 juta",
    monthlyCareLabel: "Rp600rb-1,4 juta",
    careLevel: "Rendah sedang",
    availability: "Pre-order",
    matchLabel: "Pemilik tenang di apartemen",
    characteristics: ["Pemalu", "Setia", "Tenang", "Indoor"],
  },
  {
    slug: "sphynx",
    name: "Sphynx",
    origin: "Kanada",
    imageSrc: null,
    profileSummary: "Tidak berbulu, sangat sosial, dan butuh kehangatan. Perlu mandi rutin karena kulit berminyak.",
    foodType: "High-calorie formula, wet food, snack energi",
    kittenPriceLabel: "Rp15-40 juta",
    monthlyCareLabel: "Rp1-2,5 juta",
    careLevel: "Tinggi",
    availability: "Konsultasi stok",
    matchLabel: "Pemilik berpengalaman & rumah hangat",
    characteristics: ["Tidak berbulu", "Sosial", "Hangat tubuh", "Butuh perawatan kulit"],
  },
  {
    slug: "exotic-shorthair",
    name: "Exotic Shorthair",
    origin: "Amerika Serikat",
    imageSrc: null,
    profileSummary: "Versi berbulu pendek dari Persian. Lebih mudah dirawat tetapi tetap punya karakter manja.",
    foodType: "Persian formula, skin & coat support, porsi terukur",
    kittenPriceLabel: "Rp6-20 juta",
    monthlyCareLabel: "Rp700rb-1,7 juta",
    careLevel: "Sedang",
    availability: "Ready list",
    matchLabel: "Pecinta Persian yang tidak mau grooming panjang",
    characteristics: ["Manja", "Tenang", "Bulu pendek", "Indoor"],
  },
  {
    slug: "scottish-fold-straight",
    name: "Scottish Fold / Straight",
    origin: "Skotlandia",
    imageSrc: null,
    profileSummary: "Telinga terlipat yang ikonik. Perlu perhatian ekstra pada sendi karena risiko osteochondrodysplasia.",
    foodType: "Joint support formula, wet food, porsi terukur",
    kittenPriceLabel: "Rp10-30 juta",
    monthlyCareLabel: "Rp800rb-1,9 juta",
    careLevel: "Sedang tinggi",
    availability: "Ready list",
    matchLabel: "Pemilik yang siap pantau kesehatan sendi",
    characteristics: ["Ikonik", "Tenang", "Butuh pemantauan sendi", "Sosial"],
  },
  {
    slug: "munchkin",
    name: "Munchkin",
    origin: "Amerika Serikat",
    imageSrc: null,
    profileSummary: "Kaki pendek dan postur unik. Aktif dan playful meski berbadan kecil.",
    foodType: "Small breed formula, wet food, snack training",
    kittenPriceLabel: "Rp8-18 juta",
    monthlyCareLabel: "Rp600rb-1,4 juta",
    careLevel: "Sedang",
    availability: "Ready list",
    matchLabel: "Pecinta kucing berpenampilan unik",
    characteristics: ["Kaki pendek", "Playful", "Aktif", "Sosial"],
  },
  {
    slug: "devon-rex-cornish-rex",
    name: "Devon Rex & Cornish Rex",
    origin: "Inggris",
    imageSrc: null,
    profileSummary: "Bulu keriting dan wajah elf. Sangat aktif, playful, dan butuh stimulasi.",
    foodType: "High-calorie active formula, wet food",
    kittenPriceLabel: "Rp10-25 juta",
    monthlyCareLabel: "Rp800rb-1,8 juta",
    careLevel: "Sedang tinggi",
    availability: "Konsultasi stok",
    matchLabel: "Pemilik aktif dan berpengalaman",
    characteristics: ["Bulu keriting", "Aktif", "Cerdas", "Playful"],
  },
  {
    slug: "bengal",
    name: "Bengal",
    origin: "Amerika Serikat",
    imageSrc: "/images/breeds/bengal.png",
    profileSummary: "Enerjik, atletis, dan sangat penasaran. Cocok untuk pemilik yang siap memberi enrichment harian.",
    foodType: "High-protein active cat, wet food, snack training",
    kittenPriceLabel: "Rp10-30 juta",
    monthlyCareLabel: "Rp900rb-2,2 juta",
    careLevel: "Sedang tinggi",
    availability: "Konsultasi stok",
    matchLabel: "Pemilik berpengalaman",
    characteristics: ["Aktif", "Cerdas", "Butuh stimulasi", "Pola bulu kontras"],
  },
  {
    slug: "savannah",
    name: "Savannah",
    origin: "Amerika Serikat",
    imageSrc: null,
    profileSummary: "Kucing hibrida dengan penampilan liar. Sangat aktif, besar, dan memerlukan ruang ekstra.",
    foodType: "High-protein raw-friendly, wet food, snack daging",
    kittenPriceLabel: "Rp30-80 juta",
    monthlyCareLabel: "Rp2-5 juta",
    careLevel: "Tinggi",
    availability: "Sangat terbatas",
    matchLabel: "Pemilik sangat berpengalaman dengan ruang besar",
    characteristics: ["Hibrida", "Sangat aktif", "Besar", "Butuh enrichment tinggi"],
  },
  {
    slug: "domestis-lokal",
    name: "Domestis / Lokal",
    origin: "Campuran lokal",
    imageSrc: "/images/breeds/domestic-shorthair.png",
    profileSummary: "Adaptif, tangguh, dan punya variasi karakter luas. Opsi adopsi yang sangat baik untuk banyak keluarga.",
    foodType: "Balanced adult/kitten food, wet food mingguan, dental snack",
    kittenPriceLabel: "Adopsi Rp0-750 ribu",
    monthlyCareLabel: "Rp350rb-950 ribu",
    careLevel: "Rendah sedang",
    availability: "Adopsi tersedia",
    matchLabel: "Hampir semua rumah",
    characteristics: ["Adaptif", "Perawatan mudah", "Variatif", "Budget ramah"],
  },
];

// ─────────────────────────────────────────────
// PRODUCTS SEED DATA
// ─────────────────────────────────────────────
const products = [
  { name: "Hairball Control Meal 1.5kg", category: "Dry food", priceIdr: 128000, reason: "Cocok setelah riwayat hairball ringan dan kucing indoor.", badge: "Solusi hairball", tags: ["Dry Food", "Makanan Kucing", "Hairball"] },
  { name: "Water Fountain 2L", category: "Hydration", priceIdr: 219000, reason: "Mendorong minum lebih sering untuk kucing yang aktif di dalam rumah.", badge: "Kebiasaan sehat", tags: ["perawatan hewan", "Hydration"] },
  { name: "Dental Treat Salmon 60gr", category: "Snack", priceIdr: 42000, reason: "Pilihan snack ringan untuk rutinitas gigi mingguan.", badge: "Perawatan harian", tags: ["Snack", "perawatan hewan"] },
  { name: "Feeding Kit - Set Botol Dot Susu Kucing", category: "Aksesori", priceIdr: 43000, reason: "Untuk kitten yang masih membutuhkan susu botol.", badge: null, tags: ["Aksesori"] },
  { name: "Captain Cat Dry Food Chicken Tuna 800gr", category: "Dry food", priceIdr: 23000, reason: "Pilihan dry food ekonomis dengan rasa yang disukai kucing.", badge: null, tags: ["Dry Food", "Makanan Kucing"] },
  { name: "Top Growth Milk - Susu Pertumbuhan Anak Kucing", category: "Susu", priceIdr: 52000, reason: "Nutrisi lengkap untuk kitten yang baru disapih.", badge: null, tags: ["Makanan Kucing", "Kitten"] },
  { name: "Remov Mother & Baby Vitamin 30 Kapsul", category: "Suplemen", priceIdr: 17000, reason: "Vitamin pendukung untuk induk kucing dan anak kucing.", badge: null, tags: ["Medicines/Obat", "Suplemen"] },
  { name: "Catto Plus Jelly 70gr", category: "Wet food", priceIdr: 10500, reason: "Makanan basah dengan tekstur jelly yang disukai kitten.", badge: null, tags: ["Wet Food", "Makanan Kucing", "Kitten"] },
  { name: "Whiskas Junior Ocean Fish 1.1kg", category: "Dry food", priceIdr: 65000, reason: "Formula lengkap untuk kitten yang sedang tumbuh.", badge: null, tags: ["Dry Food", "Makanan Kucing", "Kitten"] },
  { name: "Royal Canin Hair & Skin 2kg", category: "Dry food", priceIdr: 250000, reason: "Formula premium untuk kesehatan bulu dan kulit.", badge: "Premium", tags: ["Dry Food", "Makanan Kucing", "Dry Food Premium"] },
  { name: "Me-O Creamy Treats Salmon & Tuna 15gr", category: "Snack", priceIdr: 20000, reason: "Camilan krim lezat untuk hadiah saat pelatihan.", badge: null, tags: ["Snack", "Makanan Kucing"] },
  { name: "Catnip Toy Fish 20cm", category: "Mainan", priceIdr: 15000, reason: "Mainan interaktif untuk stimulasi mental dan fisik kucing indoor.", badge: null, tags: ["perawatan kandang", "Aksesori"] },
];

// ─────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting seed...");

  // 1. Seed breeds
  console.log("  → Seeding cat breeds...");
  for (const breed of breeds) {
    const { characteristics, ...breedData } = breed;
    await prisma.catBreed.upsert({
      where: { slug: breedData.slug },
      update: {},
      create: {
        ...breedData,
        characteristics: {
          create: characteristics.map((label) => ({ label })),
        },
      },
    });
  }
  console.log(`  ✅ ${breeds.length} breeds seeded.`);

  // 2. Seed products
  console.log("  → Seeding products...");
  for (const product of products) {
    const { tags, ...productData } = product;
    await prisma.product.create({
      data: {
        ...productData,
        tags: { create: tags.map((tag) => ({ tag })) },
      },
    });
  }
  console.log(`  ✅ ${products.length} products seeded.`);

  // 3. Seed demo user
  console.log("  → Seeding demo user...");
  const passwordHash = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "imam@example.com" },
    update: {},
    create: {
      name: "Imam Dwi",
      email: "imam@example.com",
      phone: "+62 812-3456-7890",
      passwordHash,
    },
  });
  console.log(`  ✅ Demo user: ${demoUser.email}`);

  // 4. Seed cats
  console.log("  → Seeding cats...");
  const bsh = await prisma.catBreed.findUnique({ where: { slug: "british-shorthair" } });
  const dom = await prisma.catBreed.findUnique({ where: { slug: "domestis-lokal" } });

  const mochi = await prisma.cat.create({
    data: {
      userId: demoUser.id,
      breedId: bsh?.id ?? null,
      name: "Mochi",
      ageLabel: "8 bulan",
      weightKg: 3.4,
      gender: "Betina",
      sterilized: false,
      lifestyle: "Indoor",
      notes: "Sensitif pada makanan tinggi gandum",
    },
  });

  const nori = await prisma.cat.create({
    data: {
      userId: demoUser.id,
      breedId: dom?.id ?? null,
      name: "Nori",
      ageLabel: "2 tahun",
      weightKg: 4.8,
      gender: "Jantan",
      sterilized: true,
      lifestyle: "Indoor + balkon",
      notes: "Riwayat hairball ringan",
    },
  });
  console.log(`  ✅ Cats: ${mochi.name}, ${nori.name}`);

  // 5. Seed timeline events
  console.log("  → Seeding timeline events...");
  await prisma.timelineEvent.createMany({
    data: [
      {
        catId: mochi.id,
        title: "Jadwal vaksin F3",
        eventDate: new Date("2026-07-12"),
        description: "Pengingat vaksin lanjutan. Siapkan catatan berat badan terbaru.",
        category: TimelineCategory.Vaksin,
        status: TimelineStatus.Mendatang,
      },
      {
        catId: mochi.id,
        title: "Vaksinasi Tahunan & Cek Gigi",
        eventDate: new Date("2026-07-08"),
        description: "Vaksinasi tahunan sekaligus pemeriksaan gigi rutin.",
        category: TimelineCategory.Vaksin,
        status: TimelineStatus.Mendatang,
      },
      {
        catId: mochi.id,
        title: "Berat badan stabil",
        eventDate: new Date("2026-06-28"),
        description: "Mochi naik dari 3.2 kg ke 3.4 kg dalam empat minggu.",
        category: TimelineCategory.Berat_badan,
        status: TimelineStatus.Tercatat,
      },
      {
        catId: mochi.id,
        title: "Ganti makanan bertahap",
        eventDate: new Date("2026-06-14"),
        description: "Transisi 7 hari ke formula kitten sensitive digestion.",
        category: TimelineCategory.Makanan,
        status: TimelineStatus.Perawatan,
      },
      {
        catId: mochi.id,
        title: "Ulang bulan ke-8",
        eventDate: new Date("2026-06-02"),
        description: "Foto favorit dan milestone perilaku baru: lebih nyaman disisir.",
        category: TimelineCategory.Momen_foto,
        status: TimelineStatus.Memori,
      },
    ],
  });
  console.log("  ✅ Timeline events seeded.");

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
