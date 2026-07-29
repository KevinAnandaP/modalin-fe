<script setup>
import { ref, computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseAccordion from '@/components/BaseAccordion.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'

import headerImg1 from '@/assets/placeholder-img/header-image1.png'
import headerImg2 from '@/assets/placeholder-img/header-image2.png'
import headerImg3 from '@/assets/placeholder-img/header-image3.png'

import testimoniImg1 from '@/assets/placeholder-img/testimoni-image1.png'
import testimoniImg2 from '@/assets/placeholder-img/testimoni-image2.png'
import testimoniImg3 from '@/assets/placeholder-img/testimoni-image3.png'

import noteSvg from '@/assets/icons/note.svg'

const activeTab = ref('peminjam')

const contactForm = ref({
  nama: '',
  email: '',
  pesan: ''
})

const submitContactForm = () => {
  if (contactForm.value.nama && contactForm.value.email) {
    alert(`Terima kasih ${contactForm.value.nama}, pesan Anda telah terkirim!`)
    contactForm.value = { nama: '', email: '', pesan: '' }
  }
}

const testimonials = [
  {
    id: 0,
    name: 'Anindya Putri Lestari',
    rating: '4.9',
    date: '20 Jan 2026',
    image: testimoniImg3,
    quote: '“Sebagai pemilik kedai kopi lokal, mencari pendanaan tambahan untuk upgrade mesin espresso dan renovasi area outdoor selalu terbentur modal dingin. Dengan Modalin, prosesnya cepat dan tanpa agunan fisik! Komunitas sangat mendukung usaha kami dan sekarang omzet bulanan kami meningkat 45%.”'
  },
  {
    id: 1,
    name: 'Kirana Citra Dewi',
    rating: '4.9',
    date: '20 Jan 2026',
    image: testimoniImg1,
    quote: '“Toko roti saya sudah berjalan hampir 3 tahun, tapi tiap kali mau ekspansi beli mixer industri 30 liter dan oven deck baru selalu tertahan di aliran kas harian. Pinjam ke bank formal pun terbentur persyaratan agunan yang rumit. Beruntung lewat Modalin, karena rekam jejak pembukuan kas toko kami di aplikasi sudah tercatat rapi selama 10 bulan, pengajuan dana Rp12.000.000 bisa langsung disetujui tanpa perlu jaminan aset! Pembelian mesinnya pun langsung diproses transparan via Direct Purchase ke toko mitra. Kapasitas adonan kami sekarang naik 3 kali lipat dan cicilan bulanan terasa ringan karena disesuaikan dengan omzet ril toko.”'
  },
  {
    id: 2,
    name: 'Rian Aditya Nugroho',
    rating: '4.9',
    date: '20 Jan 2026',
    image: testimoniImg2,
    quote: '“Saya sudah mendanai lebih dari 15 UMKM di Modalin. Transparansi laporan bulanan dan sistem mitigasi risiko serta proteksi asuransi memberikan rasa aman bagi saya sebagai pendana. Imbal hasilnya juga sangat kompetitif dibandingkan instrumen investasi lainnya.”'
  }
]

const activeTestimonialIndex = ref(1)
const jumpingAvatarId = ref(null)

const currentTestimonial = computed(() => testimonials[activeTestimonialIndex.value])

const getSlot = (index, activeIdx) => {
  const diff = (index - activeIdx + 3) % 3
  if (diff === 0) return 1 // Middle
  if (diff === 1) return 2 // Bottom
  return 0 // Top
}

const selectTestimonial = (index) => {
  if (activeTestimonialIndex.value === index) return

  const prevSlots = testimonials.map(t => getSlot(t.id, activeTestimonialIndex.value))
  const newSlots = testimonials.map(t => getSlot(t.id, index))

  const jumpingItem = testimonials.find(t => {
    const p = prevSlots[t.id]
    const n = newSlots[t.id]
    return Math.abs(p - n) === 2
  })

  if (jumpingItem) {
    jumpingAvatarId.value = jumpingItem.id
  }

  activeTestimonialIndex.value = index

  setTimeout(() => {
    jumpingAvatarId.value = null
  }, 500)
}

const getSlotStyle = (index) => {
  const diff = (index - activeTestimonialIndex.value + 3) % 3
  if (diff === 0) {
    return { top: '103px', left: '30px', zIndex: 30 }
  }
  if (diff === 1) {
    return { top: '240px', left: '-18px', zIndex: 20 }
  }
  return { top: '-10px', left: '-18px', zIndex: 20 }
}
</script>

<template>
  <DefaultLayout>
    <div class="font-inter text-neutral-primary w-full">
      <section class="pt-6 pb-16 md:pb-24 bg-neutral-tertiary w-full">
        <div class="w-full px-6 sm:px-12 lg:px-20">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-6">
              <h1 class="text-regular-48 text-neutral-primary leading-[1.15] font-sans">
                Modal usaha dari <span class="font-newsreader italic text-neutral-primary font-normal">komunitas</span><br />
                yang percaya <span class="font-newsreader italic text-neutral-primary font-normal">kepadamu</span>
              </h1>
              <p class="text-regular-16 text-neutral-secondary mt-6 max-w-md leading-relaxed">
                Hubungkan bisnismu dengan ribuan pendana yang siap mendukung pertumbuhan UMKM lokal melalui pendanaan transparan dan terpercaya.
              </p>
              <div class="flex flex-wrap gap-4 mt-8">
                <BaseButton variant="primary" size="lg" rounded>
                  Ajukan modal usaha
                </BaseButton>
                <BaseButton
                  variant="outline"
                  size="lg"
                  rounded
                  class="bg-primary-10 border-primary-base text-primary-base hover:bg-primary-20"
                >
                  Danai UMKM
                </BaseButton>
              </div>
            </div>

            <div class="lg:col-span-6">
              <div class="grid grid-cols-2 gap-4 items-stretch">
                <div class="h-107.5 overflow-hidden rounded-sm shadow-xs">
                  <img :src="headerImg1" alt="Meeting UMKM" class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col gap-4">
                  <div class="h-51.75 overflow-hidden rounded-sm shadow-xs">
                    <img :src="headerImg2" alt="Tim Diskusi" class="w-full h-full object-cover" />
                  </div>
                  <div class="h-51.75 overflow-hidden rounded-sm shadow-xs">
                    <img :src="headerImg3" alt="Mitra Bisnis" class="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-primary-10 py-10 w-full">
        <div class="w-full px-6 sm:px-12 lg:px-20">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            <div>
              <div class="font-newsreader text-regular-40 text-primary-base leading-none">Rp 6.7M+</div>
              <div class="text-regular-14 text-neutral-primary mt-2">Total dana tersalurkan</div>
            </div>
            <div>
              <div class="font-newsreader text-regular-40 text-primary-base leading-none">2.150+</div>
              <div class="text-regular-14 text-neutral-primary mt-2">UMKM terbantu</div>
            </div>
            <div>
              <div class="font-newsreader text-regular-40 text-primary-base leading-none">99.8%</div>
              <div class="text-regular-14 text-neutral-primary mt-2">TKB90</div>
            </div>
            <div>
              <div class="font-newsreader text-regular-40 text-primary-base leading-none">100+</div>
              <div class="text-regular-14 text-neutral-primary mt-2">Kota terjangkau</div>
            </div>
          </div>
        </div>
      </section>

      <section id="cara-kerja" class="py-20 bg-neutral-tertiary w-full">
        <div class="w-full px-6 sm:px-12 lg:px-20">
          <div class="text-center max-w-2xl mx-auto">
            <h2 class="font-newsreader text-regular-40 text-neutral-primary font-normal">Cara Kerja Modalin</h2>
            <p class="text-regular-16 text-neutral-secondary mt-2 mb-8">Proses yang sederhana, transparan, dan terukur.</p>
            
            <div class="relative bg-primary-10/60 p-1.5 rounded-lg inline-flex items-center justify-center border border-primary-base/10 min-w-100 sm:min-w-110">
              <div
                class="absolute top-1.5 bottom-1.5 bg-white rounded-md shadow-xs transition-all duration-300 ease-in-out"
                :style="{
                  left: activeTab === 'peminjam' ? '0.375rem' : 'calc(50% + 0.1875rem)',
                  width: 'calc(50% - 0.5625rem)'
                }"
              ></div>

              <button
                type="button"
                @click="activeTab = 'peminjam'"
                :class="[
                  'relative z-10 flex-1 px-6 py-2 text-medium-16 font-semibold transition-colors duration-300 cursor-pointer text-center select-none whitespace-nowrap',
                  activeTab === 'peminjam' ? 'text-primary-base' : 'text-neutral-secondary hover:text-neutral-primary'
                ]"
              >
                Untuk Peminjam
              </button>
              <button
                type="button"
                @click="activeTab = 'pemberi'"
                :class="[
                  'relative z-10 flex-1 px-6 py-2 text-medium-16 font-semibold transition-colors duration-300 cursor-pointer text-center select-none whitespace-nowrap',
                  activeTab === 'pemberi' ? 'text-primary-base' : 'text-neutral-secondary hover:text-neutral-primary'
                ]"
              >
                Untuk Pemberi Modal
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'peminjam'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 text-center">
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-lg bg-primary-10 flex items-center justify-center text-primary-base mb-6">
                <VsxIcon iconName="Shop" color="#0F6E56" size="24" type="linear" />
              </div>
              <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">1. Daftar & lengkapi profil usaha</h3>
              <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xs">
                Buat akun, ajukan sebagai peminjam, lalu isi profil bisnis dan catatan keuangan usahamu.
              </p>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-lg bg-primary-10 flex items-center justify-center text-primary-base mb-6">
                <VsxIcon iconName="ClipboardText" color="#0F6E56" size="24" type="linear" />
              </div>
              <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">2. Ajukan campaign pendanaan</h3>
              <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xs">
                Susun rencana anggaran (RAB) dan tahapan penggunaan dana, lalu ajukan untuk direview.
              </p>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-lg bg-primary-10 flex items-center justify-center text-primary-base mb-6">
                <img :src="noteSvg" alt="Note Icon" class="w-6 h-6" />
              </div>
              <h3 class="text-semibold-18 text-neutral-primary mb-2">3. Dana cair bertahap per tahap</h3>
              <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xs">
                Setelah didanai komunitas, dana dicairkan sesuai milestone lalu unggah bukti penggunaannya di tiap tahap.
              </p>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-lg bg-primary-10 flex items-center justify-center text-primary-base mb-6">
                <VsxIcon iconName="CalendarEdit" color="#0F6E56" size="24" type="linear" />
              </div>
              <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">4. Bayar cicilan sesuai jadwal</h3>
              <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xs">
                Laporkan omzet usahamu dan bayar cicilan sesuai skema yang disepakati, hingga lunas.
              </p>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 text-center">
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-lg bg-primary-10 flex items-center justify-center text-primary-base mb-6">
                <VsxIcon iconName="SearchNormal1" color="#0F6E56" size="24" type="linear" />
              </div>
              <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">1. Daftar & jelajahi katalog usaha</h3>
              <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xs">
                Buat akun sebagai pemberi modal dan lihat daftar usaha UMKM yang sudah melalui proses review.
              </p>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-lg bg-primary-10 flex items-center justify-center text-primary-base mb-6">
                <VsxIcon iconName="ShieldSearch" color="#0F6E56" size="24" type="linear" />
              </div>
              <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">2. Cek transparansi & skor risiko</h3>
              <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xs">
                Lihat status verifikasi, laporan keuangan, dan skor risiko tiap usaha sebelum memutuskan mendanai.
              </p>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-lg bg-primary-10 flex items-center justify-center text-primary-base mb-6">
                <VsxIcon iconName="CardCoin" color="#0F6E56" size="24" type="linear" />
              </div>
              <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">3. Danai usaha pilihanmu</h3>
              <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xs">
                Salurkan modal ke satu atau beberapa usaha sesuai kemampuanmu, sekecil apa pun kontribusinya.
              </p>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-lg bg-primary-10 flex items-center justify-center text-primary-base mb-6">
                <VsxIcon iconName="ChartSquare" color="#0F6E56" size="24" type="linear" />
              </div>
              <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">4. Pantau progres</h3>
              <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xs">
                Ikuti perkembangan usaha lewat laporan berkala, dan terima pengembalian dana sesuai skema yang dipilih.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="terkait" class="py-24 bg-neutral-tertiary w-full">
        <div class="w-full px-6 sm:px-12 lg:px-20">
          <h2 class="font-newsreader text-regular-40 text-neutral-primary font-normal text-center mb-16">Kenapa Memilih Modalin?</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div class="p-8 sm:p-10 space-y-6 flex flex-col justify-between">
              <div>
                <h3 class="font-newsreader text-regular-32 text-primary-base font-normal mb-3">Untuk UMKM</h3>
                <p class="text-regular-16 text-neutral-secondary leading-relaxed max-w-md mb-8">
                  Dapatkan akses permodalan yang fleksibel tanpa agunan fisik yang memberatkan.
                </p>

                <ul class="space-y-6">
                  <li class="flex gap-4 items-start">
                    <VsxIcon iconName="TickCircle" color="#0F6E56" size="22" type="linear" class="shrink-0 mt-0.5" />
                    <div>
                      <h4 class="text-semibold-16 text-neutral-primary font-medium">Tanpa Agunan Aset</h4>
                      <p class="text-regular-14 text-neutral-secondary mt-0.5">Fokus pada performa cashflow bisnis Anda, bukan aset tetap.</p>
                    </div>
                  </li>
                  <li class="flex gap-4 items-start">
                    <VsxIcon iconName="TickCircle" color="#0F6E56" size="22" type="linear" class="shrink-0 mt-0.5" />
                    <div>
                      <h4 class="text-semibold-16 text-neutral-primary font-medium">Bunga Terjangkau</h4>
                      <p class="text-regular-14 text-neutral-secondary mt-0.5">Mulai dari 0.8% per bulan, dihitung secara proporsional sesuai tingkat risiko.</p>
                    </div>
                  </li>
                  <li class="flex gap-4 items-start">
                    <VsxIcon iconName="TickCircle" color="#0F6E56" size="22" type="linear" class="shrink-0 mt-0.5" />
                    <div>
                      <h4 class="text-semibold-16 text-neutral-primary font-medium">Proses 100% Online</h4>
                      <p class="text-regular-14 text-neutral-secondary mt-0.5">Dari pengajuan hingga pencairan, semua dilakukan secara digital tanpa tatap muka.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div class="bg-primary-10 p-8 sm:p-10 rounded-sm space-y-6 flex flex-col justify-between">
              <div>
                <h3 class="font-newsreader text-regular-32 text-primary-base font-normal mb-3">Untuk Pemberi Modal</h3>
                <p class="text-regular-16 text-neutral-secondary leading-relaxed max-w-md mb-8">
                  Kembangkan dana Anda sambil memberikan dampak sosial nyata bagi ekonomi lokal.
                </p>

                <ul class="space-y-6">
                  <li class="flex gap-4 items-start">
                    <VsxIcon iconName="TickCircle" color="#0F6E56" size="22" type="linear" class="shrink-0 mt-0.5" />
                    <div>
                      <h4 class="text-semibold-16 text-neutral-primary font-medium">Imbal Hasil Menarik</h4>
                      <p class="text-regular-14 text-neutral-secondary mt-0.5">Potensi imbal hasil hingga 18% per tahun, lebih tinggi dari deposito rata-rata.</p>
                    </div>
                  </li>
                  <li class="flex gap-4 items-start">
                    <VsxIcon iconName="TickCircle" color="#0F6E56" size="22" type="linear" class="shrink-0 mt-0.5" />
                    <div>
                      <h4 class="text-semibold-16 text-neutral-primary font-medium">Risiko Terukur</h4>
                      <p class="text-regular-14 text-neutral-secondary mt-0.5">Setiap UMKM melewati proses verifikasi ketat dan dibekali asuransi pendanaan.</p>
                    </div>
                  </li>
                  <li class="flex gap-4 items-start">
                    <VsxIcon iconName="TickCircle" color="#0F6E56" size="22" type="linear" class="shrink-0 mt-0.5" />
                    <div>
                      <h4 class="text-semibold-16 text-neutral-primary font-medium">Mulai dari Rp 100rb</h4>
                      <p class="text-regular-14 text-neutral-secondary mt-0.5">Akses inklusif untuk mulai mendanai dan diversifikasi portofolio Anda.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tentang" class="py-24 bg-neutral-tertiary w-full">
        <div class="w-full px-6 sm:px-12 lg:px-20">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div class="lg:col-span-5 space-y-6">
              <h2 class="font-newsreader text-regular-40 text-neutral-primary font-normal leading-[1.15] mb-6">
                Keamanan Anda<br />adalah Prioritas Utama
              </h2>
              <p class="text-regular-16 text-neutral-secondary leading-relaxed max-w-md mb-6">
                Kami mengimplementasikan standar keamanan perbankan dan transparansi penuh untuk melindungi setiap transaksi.
              </p>

              <div>
                <div class="border border-primary-base/80 bg-primary-10/40 text-primary-base px-4 py-2 rounded-md inline-flex items-center gap-2 text-medium-14 font-semibold select-none cursor-default">
                  <VsxIcon iconName="Verify" color="#0F6E56" size="18" type="linear" />
                  <span>Berizin & Diawasi OJK</span>
                </div>
              </div>
            </div>

            <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="p-6 rounded-md transition-all duration-200 cursor-pointer hover:bg-primary-10 hover:shadow-2xs">
                <div class="w-10 h-10 rounded-md bg-primary-10 flex items-center justify-center text-primary-base mb-4">
                  <VsxIcon iconName="SecuritySafe" color="#0F6E56" size="20" type="linear" />
                </div>
                <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">Mitigasi Risiko Ketat</h3>
                <p class="text-regular-14 text-neutral-secondary leading-relaxed">
                  Sistem penilaian kredit menggunakan 50+ variabel data alternatif untuk meminimalisir gagal bayar.
                </p>
              </div>

              <div class="p-6 rounded-md transition-all duration-200 cursor-pointer hover:bg-primary-10 hover:shadow-2xs">
                <div class="w-10 h-10 rounded-md bg-primary-10 flex items-center justify-center text-primary-base mb-4">
                  <VsxIcon iconName="Stickynote" color="#0F6E56" size="20" type="linear" />
                </div>
                <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">Laporan Bulanan Transparan</h3>
                <p class="text-regular-14 text-neutral-secondary leading-relaxed">
                  Dapatkan update berkala mengenai performa bisnis UMKM yang Anda danai langsung di dashboard.
                </p>
              </div>

              <div class="col-span-1 sm:col-span-2 p-6 rounded-md transition-all duration-200 cursor-pointer hover:bg-primary-10 hover:shadow-2xs">
                <div class="w-10 h-10 rounded-md bg-primary-10 flex items-center justify-center text-primary-base mb-4">
                  <VsxIcon iconName="Bank" color="#0F6E56" size="20" type="linear" />
                </div>
                <h3 class="text-semibold-18 text-neutral-primary font-semibold mb-2">Asuransi Pendanaan</h3>
                <p class="text-regular-14 text-neutral-secondary leading-relaxed max-w-xl">
                  Bekerjasama dengan asuransi terkemuka untuk memproteksi hingga 80% dari nilai pokok pendanaan jika terjadi risiko gagal bayar yang tidak terduga.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- APA KATA MEREKA (PERFECTLY CENTERED AVATARS ON ARC LINE) -->
      <section id="testimoni" class="py-24 bg-neutral-tertiary w-full">
        <div class="w-full px-6 sm:px-12 lg:px-20">
          <h2 class="font-newsreader text-regular-40 text-neutral-primary font-normal mb-16">Apa Kata Mereka?</h2>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <!-- Left Side: Avatars centered directly on the arc path -->
            <div class="lg:col-span-5 relative h-67.5 flex items-center pl-8">
              <!-- Green Arc Line SVG -->
              <svg class="absolute -left-2 top-0 h-67.5 w-32 pointer-events-none" fill="none" viewBox="0 0 100 270">
                <path d="M 10 10 C 90 70, 90 200, 10 260" stroke="#0F6E56" stroke-width="1.5" fill="none" />
              </svg>

              <!-- Avatars Container -->
              <div class="relative w-full h-full">
                <div
                  v-for="(t, index) in testimonials"
                  :key="t.id"
                  @click="selectTestimonial(index)"
                  :style="getSlotStyle(index)"
                  :class="[
                    'absolute transition-all duration-500 ease-in-out cursor-pointer flex items-center gap-4 group',
                    jumpingAvatarId === t.id ? 'sink-emerge-anim' : ''
                  ]"
                >
                  <img
                    :src="t.image"
                    :alt="t.name"
                    :class="[
                      'rounded-full object-cover transition-all duration-500',
                      activeTestimonialIndex === index
                        ? 'w-16 h-16 border-2 border-primary-base shadow-md grayscale-0 opacity-100 scale-105'
                        : 'w-10 h-10 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'
                    ]"
                  />
                  <div class="transition-opacity duration-300">
                    <h4 :class="[
                      'font-semibold transition-all duration-300 whitespace-nowrap',
                      activeTestimonialIndex === index ? 'text-semibold-20 text-neutral-primary font-bold' : 'text-semibold-16 text-neutral-secondary group-hover:text-neutral-primary'
                    ]">
                      {{ t.name }}
                    </h4>
                    <p class="text-xs text-neutral-secondary flex items-center gap-1">
                      <span class="text-primary-base font-bold">★ {{ t.rating }}</span> pada {{ t.date }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Active Quote Text with smooth transition -->
            <div class="lg:col-span-7">
              <Transition name="fade" mode="out-in">
                <blockquote :key="currentTestimonial.id" class="text-regular-20 text-neutral-primary italic font-inter leading-[1.65]">
                  {{ currentTestimonial.quote }}
                </blockquote>
              </Transition>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" class="py-24 bg-neutral-tertiary w-full">
        <div class="w-full max-w-4xl mx-auto px-6 sm:px-12">
          <h2 class="font-newsreader text-regular-40 text-neutral-primary font-normal text-center mb-16">Pertanyaan Umum</h2>

          <div class="max-w-3xl mx-auto border-t border-neutral-secondary">
            <BaseAccordion title="Bagaimana Modalin menjamin keamanan dana saya?">
              Sebelum kampanye diterbitkan, tim Admin bersama Verifikator Komunitas lokal melakukan pemeriksaan langsung di lapangan untuk memastikan keberadaan fisik tempat usaha, kelayakan operasional, dan identitas peminjam.
            </BaseAccordion>

            <BaseAccordion title="Apa syarat untuk mengajukan modal bagi UMKM?">
              Usaha telah berjalan minimal 6 bulan, memiliki catatan transaksi/kas yang rapi, dan bersedia diverifikasi oleh tim verifikator Modalin.
            </BaseAccordion>

            <BaseAccordion title="Berapa lama proses verifikasi campaign?">
              Proses verifikasi berkas dan peninjauan lapangan membutuhkan waktu 1-3 hari kerja sebelum kampanye Anda diterbitkan ke katalog.
            </BaseAccordion>

            <BaseAccordion title="Apa saja risiko yang harus saya ketahui?">
              Risiko pendanaan mencakup potensi keterlambatan pembayaran cicilan, yang dimitigasi dengan skor risiko transparan dan proteksi asuransi pendanaan.
            </BaseAccordion>
          </div>
        </div>
      </section>

      <section class="py-20 bg-neutral-tertiary text-center w-full">
        <div class="max-w-3xl mx-auto px-6">
          <h2 class="text-semibold-32 font-newsreader text-neutral-primary">Siap Tumbuh Bersama Modalin?</h2>
          <p class="text-regular-18 text-neutral-secondary mt-2 mb-8">Mulai langkahmu hari ini, baik sebagai peminjam maupun pemberi modal.</p>
          <div class="flex flex-wrap justify-center gap-4">
            <BaseButton variant="primary" size="md" rounded>
              Daftar sebagai UMKM
            </BaseButton>
            <BaseButton variant="outline" size="md" rounded>
              Mulai Mendanai
            </BaseButton>
          </div>
        </div>
      </section>

      <section class="py-24 bg-neutral-tertiary w-full">
        <div class="w-full px-6 sm:px-12 lg:px-20">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div class="lg:col-span-5 space-y-4">
              <h2 class="font-newsreader text-semibold-40 text-neutral-primary leading-[1.15]">
                Ada pertanyaan? kirim saja
              </h2>
              <p class="text-regular-16 text-neutral-secondary leading-relaxed max-w-md">
                Baik Anda pemilik UMKM yang membutuhkan modal usaha, pendana yang ingin memberikan dampak sosial, atau calon mitra komunitas tim Modalin siap mendampingi langkah Anda.
              </p>
            </div>

            <div class="lg:col-span-7">
              <form @submit.prevent="submitContactForm" class="space-y-6">
                <div class="w-full">
                  <div class="grid grid-cols-1 sm:grid-cols-2">
                    <div class="border-l border-b sm:border-r border-neutral-primary p-4">
                      <input
                        v-model="contactForm.nama"
                        type="text"
                        placeholder="Nama"
                        required
                        class="w-full bg-transparent text-neutral-primary placeholder-neutral-secondary/80 focus:outline-none text-regular-16"
                      />
                    </div>
                    <div class="border-b border-neutral-primary p-4">
                      <input
                        v-model="contactForm.email"
                        type="email"
                        placeholder="Email"
                        required
                        class="w-full bg-transparent text-neutral-primary placeholder-neutral-secondary/80 focus:outline-none text-regular-16"
                      />
                    </div>
                  </div>

                  <div class="border-l border-b border-neutral-primary p-4 min-h-35">
                    <textarea
                      v-model="contactForm.pesan"
                      placeholder="Pesan"
                      rows="4"
                      class="w-full bg-transparent text-neutral-primary placeholder-neutral-secondary/80 focus:outline-none text-regular-16 resize-none"
                    ></textarea>
                  </div>
                </div>

                <div class="flex justify-end pt-2">
                  <BaseButton
                    type="submit"
                    variant="primary"
                    size="md"
                    rounded
                  >
                    Kirim
                  </BaseButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  </DefaultLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes sinkEmerge {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}

.sink-emerge-anim {
  animation: sinkEmerge 0.5s ease-in-out forwards !important;
}
</style>
