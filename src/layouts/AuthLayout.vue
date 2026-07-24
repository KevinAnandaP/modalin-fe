<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="auth-layout">
    <!-- Header -->
    <header class="auth-header">
      <div class="auth-container header-content">
        <RouterLink to="/" class="brand-logo">
          <span class="logo-text">Modalin</span>
        </RouterLink>
        <RouterLink to="/" class="back-link">
          &larr; Kembali ke Beranda
        </RouterLink>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="auth-main">
      <div class="auth-container">
        <slot />
      </div>
    </main>

    <!-- Footer Footer Minimalist -->
    <footer class="auth-footer">
      <p>&copy; 2026 Modalin. Seluruh Hak Cipta Dilindungi.</p>
    </footer>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-neutral-tertiary, #EDF6F4);
}

.auth-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.auth-header {
  padding: 1.5rem 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo {
  text-decoration: none;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary-base, #0F6E56);
  letter-spacing: -0.02em;
}

.back-link {
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-primary-base, #0F6E56);
  transition: opacity 0.2s ease;
}

.back-link:hover {
  opacity: 0.8;
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.auth-footer {
  text-align: center;
  padding: 1.5rem 0;
  font-size: 0.85rem;
  color: var(--color-neutral-secondary, #6B7280);
}
</style>
