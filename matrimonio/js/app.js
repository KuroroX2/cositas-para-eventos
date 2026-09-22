/**
 * MATRIMONIO CRISTOPHER & RENY — LOGIC & INTERACTIVITY
 * Cositas Para Eventos
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCountdown();
  initCalendarButtons();
  initGalleryLightbox();
  initPhotoQuest();
  initBankCopy();
  initRsvpAndPass();
  initMobileDrawer();
  initAudioToggle();
});

/* --------------------------------------------------------------------------
   1. Dynamic Atmosphere Canvas (Drifting Eucalyptus Leaves & Gold Sparkles)
   -------------------------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = window.innerWidth < 768 ? 20 : 35;

  class LeafParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 0.7 + 0.4;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.02;
      this.isGold = Math.random() > 0.75;
      this.opacity = Math.random() * 0.4 + 0.2;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.angle) * 0.5 + this.speedX;
      this.angle += this.spin;

      if (this.y > height + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.beginPath();

      if (this.isGold) {
        // Gold ambient sparkle
        ctx.fillStyle = `rgba(197, 160, 89, ${this.opacity})`;
        ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sage / Eucalyptus Leaf shape
        ctx.fillStyle = `rgba(124, 157, 139, ${this.opacity})`;
        ctx.ellipse(0, 0, this.size, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new LeafParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   2. Live Countdown Timer (14 Nov 2026, 16:30 CLT)
   -------------------------------------------------------------------------- */
function initCountdown() {
  const weddingDate = new Date('2026-11-14T16:30:00-03:00').getTime();

  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minsEl = document.getElementById('countMins');
  const secsEl = document.getElementById('countSecs');

  function update() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   3. Calendar Integration (Google Calendar & Apple / Outlook .ics)
   -------------------------------------------------------------------------- */
function initCalendarButtons() {
  const btnGoogle = document.getElementById('btnGoogleCal');
  const btnIcs = document.getElementById('btnIcsCal');

  const title = encodeURIComponent('💍 Matrimonio Cristopher & Reny');
  const location = encodeURIComponent('Casona Los Olivos, Pirque, Región Metropolitana, Chile');
  const details = encodeURIComponent('¡Nos casamos! Acompáñanos a celebrar nuestro gran día en Casona Los Olivos. Recuerda confirmar tu asistencia.');
  // UTC: 2026-11-14 16:30 Chile (-3) => 19:30 UTC. Ends 2026-11-15 05:00 UTC
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261114T193000Z/20261115T050000Z&details=${details}&location=${location}`;

  if (btnGoogle) {
    btnGoogle.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(gcalUrl, '_blank');
    });
  }

  if (btnIcs) {
    btnIcs.addEventListener('click', (e) => {
      e.preventDefault();
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CositasParaEventos//Matrimonio Cristopher y Reny//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:boda-cristopher-reny-20261114@casonalosolivos',
        'DTSTAMP:20260920T000000Z',
        'DTSTART:20261114T193000Z',
        'DTEND:20261115T050000Z',
        'SUMMARY:💍 Matrimonio Cristopher & Reny',
        'DESCRIPTION:¡Nos casamos! Acompáñanos a celebrar nuestro gran día en Casona Los Olivos, Pirque.',
        'LOCATION:Casona Los Olivos, Pirque, Chile',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Matrimonio_Cristopher_y_Reny.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

/* --------------------------------------------------------------------------
   4. Gallery Lightbox Modal
   -------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const cards = document.querySelectorAll('.gallery-card');
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');

  if (!modal || !modalImg) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || 'Foto de los novios';
        modal.classList.add('active');
      }
    });
  });

  function closeModal() {
    modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* --------------------------------------------------------------------------
   5. Photo Quest / Juego Caza de Fotos (Misiones)
   -------------------------------------------------------------------------- */
function initPhotoQuest() {
  const cards = document.querySelectorAll('.quest-card');
  cards.forEach(card => {
    const btn = card.querySelector('.quest-status-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('completed');
        if (card.classList.contains('completed')) {
          btn.innerHTML = '<span>✓ ¡Completada!</span>';
        } else {
          btn.innerHTML = '<span>Completar Misión</span>';
        }
      });
    }
  });
}

/* --------------------------------------------------------------------------
   6. Copy Bank Information in 1-Click
   -------------------------------------------------------------------------- */
function initBankCopy() {
  const btn = document.getElementById('btnCopyBank');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const bankText = `DATOS DE TRANSFERENCIA - BODA CRISTOPHER & RENY
Banco: Banco Estado / Banco Santander
Tipo: Cuenta Corriente
Número: 00-12345678-9
Nombre: Reny Rebolledo & Cristopher
RUT: 18.765.432-1
Email: novios@cositasparaeventos.cl
Asunto: Regalo Boda Cristopher y Reny`;

    navigator.clipboard.writeText(bankText).then(() => {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>✓ ¡Datos copiados al portapapeles!</span>';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 3000);
    });
  });
}

/* --------------------------------------------------------------------------
   7. RSVP Submission & VIP Digital Pass Ticket Generation
   -------------------------------------------------------------------------- */
function initRsvpAndPass() {
  const form = document.getElementById('rsvpForm');
  const passModal = document.getElementById('passModal');
  const closePassBtn = document.getElementById('closePassModal');
  const btnPrintPass = document.getElementById('btnPrintPass');

  // Radio button active styling
  const radioCards = document.querySelectorAll('.radio-card');
  radioCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
      radio.addEventListener('change', () => {
        radioCards.forEach(c => c.classList.remove('active'));
        if (radio.checked) card.classList.add('active');
      });
    }
  });

  if (!form || !passModal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('guestName')?.value || 'Invitado Especial';
    const companions = document.getElementById('guestCompanions')?.value || '1 persona';
    const statusRadio = document.querySelector('input[name="attendance"]:checked');
    const willAttend = statusRadio ? statusRadio.value === 'yes' : true;

    if (!willAttend) {
      alert(`Muchas gracias, ${name}. Lamentamos que no puedas acompañarnos, ¡recibiremos tus buenos deseos con mucho cariño!`);
      form.reset();
      return;
    }

    // Generate unique Pass Code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const passId = `VIP-CR-${randomCode}`;

    // Fill pass details
    const passNameEl = document.getElementById('ticketGuestName');
    const passIdEl = document.getElementById('ticketPassId');
    const passQrEl = document.getElementById('ticketQr');
    const passSeatsEl = document.getElementById('ticketSeats');

    if (passNameEl) passNameEl.textContent = name;
    if (passIdEl) passIdEl.textContent = passId;
    if (passSeatsEl) passSeatsEl.textContent = companions === '1' ? '1 Asiento' : `${companions} Asientos`;

    // Render deterministic SVG QR Code
    if (passQrEl) {
      passQrEl.innerHTML = generateSvgQr(passId);
    }

    passModal.classList.add('active');
  });

  if (closePassBtn) {
    closePassBtn.addEventListener('click', () => {
      passModal.classList.remove('active');
    });
  }

  passModal.addEventListener('click', (e) => {
    if (e.target === passModal) {
      passModal.classList.remove('active');
    }
  });

  if (btnPrintPass) {
    btnPrintPass.addEventListener('click', () => {
      window.print();
    });
  }
}

// Generate simple geometric QR-like SVG pattern for ticket
function generateSvgQr(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const size = 136;
  const cells = 9;
  const cellSize = size / cells;

  let rects = '';
  // Corner position detection patterns (like real QR)
  rects += `<rect x="0" y="0" width="${cellSize*3}" height="${cellSize*3}" fill="#1b3d2f" rx="3"/>`;
  rects += `<rect x="${cellSize}" y="${cellSize}" width="${cellSize}" height="${cellSize}" fill="#fff"/>`;

  rects += `<rect x="${cellSize*6}" y="0" width="${cellSize*3}" height="${cellSize*3}" fill="#1b3d2f" rx="3"/>`;
  rects += `<rect x="${cellSize*7}" y="${cellSize}" width="${cellSize}" height="${cellSize}" fill="#fff"/>`;

  rects += `<rect x="0" y="${cellSize*6}" width="${cellSize*3}" height="${cellSize*3}" fill="#1b3d2f" rx="3"/>`;
  rects += `<rect x="${cellSize}" y="${cellSize*7}" width="${cellSize}" height="${cellSize}" fill="#fff"/>`;

  // Internal hash pattern
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if ((r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3)) continue;
      const isFilled = ((hash >> ((r * cells + c) % 31)) & 1) === 1 || (r + c) % 3 === 0;
      if (isFilled) {
        rects += `<rect x="${c * cellSize + 1}" y="${r * cellSize + 1}" width="${cellSize - 2}" height="${cellSize - 2}" fill="#c5a059" rx="1"/>`;
      }
    }
  }

  return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

/* --------------------------------------------------------------------------
   8. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('drawerClose');
  const overlay = document.getElementById('drawerOverlay');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  const links = drawer.querySelectorAll('a');
  links.forEach(l => l.addEventListener('click', closeDrawer));
}

/* --------------------------------------------------------------------------
   9. Web Audio Ambient Chime Sound Toggle
   -------------------------------------------------------------------------- */
function initAudioToggle() {
  const btn = document.getElementById('btnMusicToggle');
  if (!btn) return;

  let isPlaying = false;
  let audioCtx = null;
  let intervalId = null;

  function playAmbientChime() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C major / romantic chime
      [220.00, 261.63, 329.63, 440.00], // A minor
      [174.61, 220.00, 261.63, 349.23], // F major
      [196.00, 246.94, 293.66, 392.00]  // G major
    ];

    let chordIdx = 0;

    function playChord() {
      if (!isPlaying) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(0, audioCtx.currentTime + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + idx * 0.15 + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.15 + 3.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + idx * 0.15);
        osc.stop(audioCtx.currentTime + idx * 0.15 + 3.3);
      });
    }

    playChord();
    intervalId = setInterval(playChord, 3800);
  }

  btn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      btn.classList.add('playing');
      btn.innerHTML = '<i class="ri-volume-up-line"></i>';
      btn.title = 'Pausar melodía ambiental';
      playAmbientChime();
    } else {
      btn.classList.remove('playing');
      btn.innerHTML = '<i class="ri-music-2-line"></i>';
      btn.title = 'Reproducir melodía ambiental';
      if (intervalId) clearInterval(intervalId);
    }
  });
}
