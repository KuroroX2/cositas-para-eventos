/**
 * LAURA & NICO — NUESTRO MATRIMONIO
 * Temática: Elegancia Japonesa, Sakura & Kintsugi (結び)
 * Core Application Logic (Countdown, Cherry Blossom Sakura Canvas, Calendar, Navigation, Bank Modal)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initAtmosphereParticles();
  initCountdown();
  initCalendarActions();
  initNavigation();
  initBankModal();
  initScrollReveals();
  initChallengeUpload();
});

/* ==========================================================================
   0. ESTILO VISUAL: JAPÓN SAKURA & KINTSUGI (Estilo Oficial Elegido)
   ========================================================================== */
let activeAtmosphereTheme = 'theme-japon';

function initThemeSwitcher() {
  document.body.classList.remove('theme-vogue', 'theme-campestre', 'theme-tradicional', 'theme-florido');
  document.body.classList.add('theme-japon');
  activeAtmosphereTheme = 'theme-japon';
  if (window.resetAtmosphereParticles) {
    window.resetAtmosphereParticles('theme-japon');
  }
}

/* ==========================================================================
   0.1 SAKURA BLOSSOMS PARTICLE ENGINE (Caída de Pétalos de Cerezo 🌸)
   ========================================================================== */
function initAtmosphereParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = window.innerWidth < 600 ? 22 : 40;
  let particles = [];

  class SakuraPetalParticle {
    constructor(theme) {
      this.reset(theme, true);
    }

    reset(theme, initial = false) {
      this.theme = theme;
      this.x = Math.random() * (width + 100) - 50;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 8 + 7; // 7px - 15px
      this.speedY = Math.random() * 0.9 + 0.6; // Gentle fall
      this.speedX = Math.random() * 0.6 + 0.3; // Gentle wind towards right
      this.swingAmp = Math.random() * 1.5 + 0.5;
      this.swingSpeed = Math.random() * 0.02 + 0.01;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.025;
      this.opacity = Math.random() * 0.4 + 0.45; // 0.45 - 0.85
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = Math.random() * 0.03 + 0.015;
      
      // Color variations: soft blush, cherry blossom pink, pale rose
      const colorPalettes = [
        { top: '#FFF5F8', mid: '#F8BBD0', base: '#E91E63' },
        { top: '#FFFFFF', mid: '#FCE4EC', base: '#EC407A' },
        { top: '#FFF0F5', mid: '#F48FB1', base: '#D81B60' }
      ];
      this.palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * this.swingSpeed) * this.swingAmp;
      this.rotation += this.rotSpeed;
      this.flip += this.flipSpeed;

      if (this.y > height + 35) this.reset(this.theme, false);
      if (this.x > width + 50) this.x = -30;
      if (this.x < -50) this.x = width + 30;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(Math.cos(this.flip), 1);
      ctx.globalAlpha = this.opacity;

      // Realistic Sakura Petal Path (Heart-shaped top cleft and delicate teardrop body)
      const s = this.size;
      const grad = ctx.createLinearGradient(0, -s, 0, s);
      grad.addColorStop(0, this.palette.top);
      grad.addColorStop(0.5, this.palette.mid);
      grad.addColorStop(1, this.palette.base);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, s); // Base of petal
      // Right curve up to top right lobe
      ctx.bezierCurveTo(s * 0.75, s * 0.3, s * 0.85, -s * 0.5, s * 0.35, -s);
      // Sakura cleft at top center
      ctx.quadraticCurveTo(0, -s * 0.7, -s * 0.35, -s);
      // Left curve back to base
      ctx.bezierCurveTo(-s * 0.85, -s * 0.5, -s * 0.75, s * 0.3, 0, s);
      ctx.closePath();
      ctx.fill();

      // Subtle translucent vein highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.8);
      ctx.lineTo(0, -s * 0.4);
      ctx.stroke();

      ctx.restore();
    }
  }

  function setupParticles(theme) {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new SakuraPetalParticle(theme));
    }
  }

  window.resetAtmosphereParticles = function (theme) {
    setupParticles(theme);
  };

  setupParticles('theme-japon');

  function loop() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }

  loop();
}

/* ==========================================================================
   1. COUNTDOWN TIMER (17 de Octubre de 2026 a las 16:30 hrs)
   ========================================================================== */
function initCountdown() {
  const weddingDate = new Date('2026-10-17T16:30:00-03:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl) return;

  function update() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. CALENDAR INTEGRATIONS (Google Calendar & iPhone / Apple Calendar .ics)
   ========================================================================== */
function initCalendarActions() {
  const googleBtns = [
    document.getElementById('btn-google-cal'),
    document.getElementById('btn-google-cal-hero')
  ];

  const appleBtns = [
    document.getElementById('btn-apple-cal'),
    document.getElementById('btn-apple-cal-hero')
  ];

  const title = encodeURIComponent("Matrimonio Laura & Nico 🌸 (結び)");
  const details = encodeURIComponent("¡Celebración del Matrimonio de Laura & Nico en Jardín Botánico & Casona Sakura! Ceremonia de Unión (Musubi), Brindis Sake & Fiesta de las Linternas.");
  const location = encodeURIComponent("Jardín Botánico & Casona Sakura, Camino El Olivar 4500, Santiago / Pirque, Chile");
  const startIso = "20261017T193000Z";
  const endIso = "20261018T063000Z";

  // Google Calendar
  googleBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
        window.open(url, '_blank');
      });
    }
  });

  // Apple Calendar (.ics) for iPhone, iPad, Mac
  appleBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        downloadAppleIcsCalendar();
      });
    }
  });
}

function downloadAppleIcsCalendar() {
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Laura & Nico//Matrimonio 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:boda-laura-nico-20261017@casonasakura',
    'SUMMARY:🌸 Matrimonio Laura & Nico (結び)',
    'DESCRIPTION:¡Celebración de nuestro matrimonio en Jardín Botánico & Casona Sakura! Ceremonia Musubi, Brindis Sake y Fiesta de las Linternas.',
    'LOCATION:Jardín Botánico & Casona Sakura, Camino El Olivar 4500, Santiago / Pirque, Chile',
    'DTSTART:20261017T193000Z',
    'DTEND:20261018T063000Z',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Matrimonio_Laura_y_Nico.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   3. NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const toggleBtn = document.getElementById('btn-mobile-toggle');
  const closeBtn = document.getElementById('btn-mobile-close');
  const drawer = document.getElementById('mobile-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-link, .drawer-cta');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => drawer.classList.add('active'));
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => drawer.classList.remove('active'));
  }
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => drawer && drawer.classList.remove('active'));
  });
}

/* ==========================================================================
   5. BANK MODAL & COPY DATA (Shugi-Bukuro / Datos Bancarios)
   ========================================================================== */
function initBankModal() {
  const showBtn = document.getElementById('btn-show-bank');
  const modal = document.getElementById('bank-modal');
  const closeBtn = document.getElementById('btn-close-bank');
  const copyBtn = document.getElementById('btn-copy-bank-data');

  if (showBtn && modal) {
    showBtn.addEventListener('click', () => modal.classList.add('active'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = `DATOS DE TRANSFERENCIA DIRECTA — MATRIMONIO LAURA & NICO 🌸\nBanco: Banco Santander\nTipo de Cuenta: Cuenta Corriente\nN° de Cuenta: 0-000-8472910-4\nRUT: 18.452.930-K\nTitulares: Laura Soto & Nicolás Arancibia\nEmail: matrimonio.laura.nico@gmail.com`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.innerHTML = '<i class="ri-check-line"></i> ¡Datos Copiados!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="ri-file-copy-line"></i> Copiar Datos';
        }, 3000);
      });
    });
  }
}

function initChallengeUpload() {
  // Manejado directamente por gallery.js con modal interactivo y compresión
}

/* ==========================================================================
   7. SCROLL REVEAL (IntersectionObserver)
   ========================================================================== */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}
