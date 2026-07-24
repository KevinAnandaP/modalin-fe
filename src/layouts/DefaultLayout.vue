<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="default-layout">
    <!-- Header / Navbar -->
    <header class="navbar">
      <div class="container navbar-content">
        <RouterLink to="/" class="brand-logo">
          <span class="logo-text">Modalin</span>
        </RouterLink>

        <nav class="nav-links">
          <RouterLink to="/" class="nav-item">Beranda</RouterLink>
          <a href="#tentang" class="nav-item">Tentang</a>
          <a href="#fitur" class="nav-item">Fitur Utama</a>
          <a href="#faq" class="nav-item">FAQ</a>
        </nav>

        <div class="auth-buttons">
          <RouterLink to="/login" class="btn-secondary">Masuk</RouterLink>
          <RouterLink to="/register" class="btn-primary">Daftar</RouterLink>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-brand">
          <h3 class="footer-logo">Modalin</h3>
          <p class="footer-tagline">Platform pendanaan UMKM terpercaya untuk pertumbuhan bisnis Anda.</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">Navigasi</h4>
            <RouterLink to="/">Beranda</RouterLink>
            <RouterLink to="/login">Masuk</RouterLink>
            <RouterLink to="/register">Daftar</RouterLink>
          </div>
          <div class="link-group">
            <h4 class="link-title">Legal & Privasi</h4>
            <a href="#">Syarat & Ketentuan</a>
            <a href="#">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>&copy; 2026 Modalin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-neutral-tertiary, #EDF6F4);
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(15, 110, 86, 0.1);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.brand-logo {
  text-decoration: none;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary-base, #0F6E56);
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-item {
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-neutral-primary, #1F2937);
  transition: color 0.2s ease;
}

.nav-item:hover {
  color: var(--color-primary-base, #0F6E56);
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-secondary {
  text-decoration: none;
  padding: 0.5rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-primary-base, #0F6E56);
  background-color: transparent;
  border: 1px solid var(--color-primary-base, #0F6E56);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--color-primary-10, #CFE2DD);
}

.btn-primary {
  text-decoration: none;
  padding: 0.55rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  background-color: var(--color-primary-base, #0F6E56);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-60, #0D5C48);
}

/* Main Content */
.main-content {
  flex: 1;
}

/* Footer */
.footer {
  background-color: var(--color-primary-90, #05251D);
  color: #ffffff;
  padding-top: 3rem;
  margin-top: auto;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  padding-bottom: 3rem;
}

.footer-brand {
  max-width: 360px;
}

.footer-logo {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary-10, #CFE2DD);
  margin-bottom: 0.75rem;
}

.footer-tagline {
  font-size: 0.95rem;
  color: var(--color-primary-20, #AFCFC7);
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 4rem;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary-10, #CFE2DD);
  margin-bottom: 0.5rem;
}

.link-group a {
  text-decoration: none;
  color: var(--color-primary-20, #AFCFC7);
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.link-group a:hover {
  color: #ffffff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.25rem 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-primary-30, #87B6AA);
}
</style>
