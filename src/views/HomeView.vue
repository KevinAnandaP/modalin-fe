<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
</script>

<template>
  <DefaultLayout>
    <div class="home-hero">
      <div class="container hero-content">
        <h1 class="text-semibold-48 text-primary-base">Solusi Pendanaan UMKM Indonesia</h1>
        <p class="text-regular-18 text-neutral-secondary hero-sub">
          Modalin menghubungkan pemilik usaha potensial dengan pendana untuk pertumbuhan ekonomi yang inklusif.
        </p>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.home-hero {
  padding: 5rem 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-sub {
  margin-top: 1rem;
}
</style>
