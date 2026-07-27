<template>
  <div class="landing-page">
    <!-- Archery Background Game -->
    <ArcheryBackground class="archery-bg" />

    <!-- Hero Section with Parallax -->
    <section class="hero">
      <div class="hero-content">
        <div class="logo-container">
          <img 
            src="/src/assets/49d05386-b8dc-43c2-a3e3-3a6dc3e3e54b.png" 
            alt="Archery Mastery Logo" 
            class="logo-img"
            @error="handleLogoError"
          />
          <!-- Fallback text if logo doesn't load -->
          <span v-if="logoError" class="logo-fallback">🏹 Archery Mastery</span>
        </div>
        <h1 class="hero-title">Master the Art of Archery</h1>
        <p class="hero-subtitle">
          Professional instruction for beginners and experienced archers alike.
          Discover the precision, focus, and discipline of traditional archery.
        </p>
        <div class="hero-buttons">
          <router-link to="/classes" class="btn btn-primary">View Classes</router-link>
          <a 
            :href="whatsappLink" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn btn-secondary"
          >
            Contact Us
          </a>
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-image-placeholder">
          <img 
            src="/src/assets/images(2).jpg" 
            alt="Archery Mastery Logo" 
            class="hero-logo"
            @error="handleHeroLogoError"
          />
          <span v-if="heroLogoError" class="hero-logo-fallback">🎯</span>
        </div>
      </div>
    </section>

    <!-- Parallax Section -->
    <ParallaxBackground 
      :image="parallaxImage"
      :speed="0.4"
      height="500px"
      :overlay-opacity="0.4"
    >
      <div class="parallax-content-custom">
        <h2>Precision Meets Passion</h2>
        <p>Every arrow tells a story of discipline and dedication</p>
        <router-link to="/about" class="btn btn-primary parallax-btn">
          Discover Our Story
        </router-link>
      </div>
    </ParallaxBackground>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Why Train With Us</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🏹</div>
            <h3>Expert Instruction</h3>
            <p>Learn from certified archery coaches with years of competitive and teaching experience.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>State-of-the-Art Facility</h3>
            <p>Train in our modern indoor range with professional equipment and safety standards.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>All Skill Levels</h3>
            <p>Whether you're a beginner or looking to refine your technique, we have a program for you.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Location & Contact Section -->
    <section class="location-contact">
      <div class="container">
        <div class="info-grid">
          <div class="info-card">
            <h3>📍 Our Location</h3>
            <p>Kalemegdan fortress</p>
        
            <a 
              href="https://www.google.com/maps/place/44%C2%B049'27.5%22N+20%C2%B027'02.5%22E/@44.8243049,20.4500543,19z/data=!3m1!4b1!4m4!3m3!8m2!3d44.824304!4d20.450698?entry=ttu&g_ep=EgoyMDI2MDcyMi4wIKXMDSoASAFQAw%3D%3D" 
              target="_blank" 
              rel="noopener noreferrer"
              class="info-link"
            >
              Get Directions →
            </a>
          </div>
          <div class="info-card">
            <h3>📞 Contact Us</h3>
            <p><strong>Phone:</strong> +381 60 6554130</p>
            <p><strong>Email:</strong> akatsuki@gmail.com</p>
            <p><strong>Hours:</strong> Mon–Sat, 12:00 AM – 8:00 PM</p>
            <a 
              :href="whatsappLink" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="info-link"
            >
              Chat on WhatsApp →
            </a>
          </div>
          <div class="info-card">
            <h3>🕐 Quick Links</h3>
            <ul class="quick-links">
              <li><router-link to="/about">About Us</router-link></li>
              <li><router-link to="/classes">Class Schedule</router-link></li>
              <li><router-link to="/faq">FAQ</router-link></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2>Ready to Begin Your Journey?</h2>
        <p>Join our community and discover the art of archery today.</p>
        <a 
          :href="whatsappLink" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn btn-primary btn-large"
        >
          Contact Us Now
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 Archery Mastery. All rights reserved.</p>
        <div class="footer-links">
          <router-link to="/privacy-policy">Privacy Policy</router-link>
          <router-link to="/terms-and-conditions">Terms of Service</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import ParallaxBackground from '@/components/ParallaxBackground.vue'
import ArcheryBackground from '@/components/ArcheryBackground.vue'

export default {
  name: 'HomePage',
  components: {
    ParallaxBackground,
    ArcheryBackground
  },
  data() {
    return {
      logoError: false,
      heroLogoError: false,
      // For Vite:
      parallaxImage: new URL('@/assets/49d05386-b8dc-43c2-a3e3-3a6dc3e3e54b.png', import.meta.url).href,
      // WhatsApp configuration - replace with your actual phone number
      whatsappNumber: '381606565130', // Replace with your WhatsApp number (country code + number, no + sign)
      whatsappMessage: 'Hello! I\'m interested in your archery classes.'
    }
  },
  computed: {
    whatsappLink() {
      const encodedMessage = encodeURIComponent(this.whatsappMessage)
      return `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`
    }
  },
  methods: {
    handleLogoError() {
      this.logoError = true
    },
    handleHeroLogoError() {
      this.heroLogoError = true
    }
  }
}
</script>

<style scoped>
/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1a1a1a;
  background-color: #ffffff;
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Archery Background */
.archery-bg {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999 !important; /* Change this from 0 to 9999 */
  pointer-events: auto;
}

/* Make sections click-through except for interactive elements */
.hero,
.features,
.location-contact,
.cta,
.footer {
  position: relative;
  z-index: 1;
}

/* Allow clicks to pass through to the game background */
.hero-content,
.hero-image,
.container,
.feature-card,
.info-card,
.quick-links {
  pointer-events: none;
}

/* But make interactive elements clickable */
.btn,
a,
.router-link,
.info-link,
.quick-links a,
button {
  pointer-events: auto;
  position: relative;
  z-index: 2;
}

/* Buttons should be clickable */
.hero-buttons .btn,
.cta .btn,
.parallax-btn {
  pointer-events: auto !important;
  position: relative;
  z-index: 2;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Logo Styles */
.logo-container {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  pointer-events: auto;
  position: relative;
  z-index: 2;
}

.logo-img {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.logo-fallback {
  font-size: 2rem;
  font-weight: 700;
  color: #cc0000;
}

/* Hero */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80vh;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(248, 248, 248, 0.85) 0%, rgba(255, 255, 255, 0.9) 100%);
  gap: 3rem;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  pointer-events: none;
}

.hero-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: #cc0000;
  margin-top: 0.75rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #4a4a4a;
  margin-bottom: 2rem;
  max-width: 500px;
  pointer-events: none;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.hero-image-placeholder {
  width: 100%;
  max-width: 450px;
  aspect-ratio: 1 / 1;
  background: rgba(240, 240, 240, 0.7);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
  overflow: hidden;
  backdrop-filter: blur(5px);
}

.hero-logo {
  width: 80%;
  height: 80%;
  object-fit: contain;
}

.hero-logo-fallback {
  font-size: 8rem;
  color: #cc0000;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s ease, transform 0.1s ease;
  border: 2px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background-color: #cc0000;
  color: #ffffff;
  border-color: #cc0000;
}

.btn-primary:hover {
  background-color: #a30000;
  border-color: #a30000;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: #1a1a1a;
  border-color: #1a1a1a;
}

.btn-secondary:hover {
  background-color: #1a1a1a;
  color: #ffffff;
  transform: translateY(-2px);
}

.btn-large {
  padding: 1rem 3rem;
  font-size: 1.125rem;
}

/* Parallax Custom Content */
.parallax-content-custom {
  color: #ffffff;
  text-align: center;
  pointer-events: none;
}

.parallax-content-custom h2 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.parallax-content-custom p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.parallax-btn {
  background-color: #cc0000;
  border-color: #cc0000;
  pointer-events: auto !important;
}

.parallax-btn:hover {
  background-color: #a30000;
  border-color: #a30000;
}

/* Features */
.features {
  padding: 5rem 0;
  background: rgba(250, 250, 250, 0.85);
  backdrop-filter: blur(5px);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #1a1a1a;
  pointer-events: none;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: #cc0000;
  margin: 0.5rem auto 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-top: 4px solid #cc0000;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(5px);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #1a1a1a;
}

.feature-card p {
  color: #4a4a4a;
  font-size: 0.95rem;
}

/* Location & Contact */
.location-contact {
  padding: 5rem 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(5px);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.info-card {
  background: rgba(248, 248, 248, 0.9);
  padding: 2rem 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #cc0000;
  backdrop-filter: blur(5px);
}

.info-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.info-card p {
  color: #4a4a4a;
  margin-bottom: 0.25rem;
}

.info-card strong {
  color: #1a1a1a;
}

.info-link {
  display: inline-block;
  margin-top: 1rem;
  color: #cc0000;
  font-weight: 600;
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.quick-links {
  list-style: none;
  padding: 0;
}

.quick-links li {
  margin-bottom: 0.5rem;
}

.quick-links a {
  color: #1a1a1a;
  text-decoration: none;
  transition: color 0.2s ease;
}

.quick-links a:hover {
  color: #cc0000;
  text-decoration: underline;
}

/* CTA */
.cta {
  padding: 5rem 2rem;
  background: rgba(26, 26, 26, 0.9);
  color: #ffffff;
  text-align: center;
  backdrop-filter: blur(5px);
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.cta p {
  font-size: 1.125rem;
  color: #cccccc;
  margin-bottom: 2rem;
}

.cta .btn-primary {
  background-color: #cc0000;
  border-color: #cc0000;
}

.cta .btn-primary:hover {
  background-color: #a30000;
  border-color: #a30000;
}

/* Footer */
.footer {
  padding: 2rem 0;
  background: rgba(17, 17, 17, 0.95);
  color: #aaaaaa;
  border-top: 2px solid #cc0000;
  backdrop-filter: blur(5px);
}

.footer .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: #aaaaaa;
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: #ffffff;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
    min-height: auto;
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-title::after {
    margin: 0.75rem auto 0;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-image-placeholder {
    max-width: 280px;
  }

  .hero-logo-fallback {
    font-size: 5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .footer .container {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }

  .cta h2 {
    font-size: 2rem;
  }

  .parallax-content-custom h2 {
    font-size: 2.5rem;
  }
  
  .parallax-content-custom p {
    font-size: 1rem;
  }

  .archery-bg {
    position: fixed !important;
  }
}

/* Global styles */
html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

body {
  -webkit-overflow-scrolling: touch;
  overflow-y: scroll;
  overscroll-behavior: smooth;
}

/* Smooth transitions for all elements */
* {
  transition: all 0.2s ease;
}

/* Better scrollbar for smoother feel */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #cc0000;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a30000;
}
</style>