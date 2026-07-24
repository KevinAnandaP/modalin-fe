<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue'
</script>

<template>
  <AuthLayout>
    <div class="auth-card-placeholder">
      <h2 class="text-semibold-32 text-primary-base">Buat Akun Modalin</h2>
      <p class="text-regular-16 text-neutral-secondary mt-2">Daftar sekarang untuk memulai pendanaan atau mengajukan modal.</p>
    </div>
  </AuthLayout>
</template>

<style scoped>
.auth-card-placeholder {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 440px;
  width: 100%;
  text-align: center;
}
</style>
