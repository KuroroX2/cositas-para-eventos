/**
 * app.js - Lógica interactiva para la Invitación de Cumpleaños
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCalendar();
  initRsvpForm();
  initPosterModal();
  initSmoothScroll();
  initOrganizadorNavLinks();
});

/**
 * Cuenta regresiva dinámica hasta el evento (31 de Octubre)
 */
function initCountdown() {
  const data = window.cumpleStore ? window.cumpleStore.getData() : null;
  const eventDateStr = data?.evento?.fecha ? `${data.evento.fecha}T${data.evento.hora || '15:00'}:00` : '2026-10-31T15:00:00';
  const targetDate = new Date(eventDateStr).getTime();

  const elDays = document.getElementById('timerDays');
  const elHours = document.getElementById('timerHours');
  const elMinutes = document.getElementById('timerMinutes');
  const elSeconds = document.getElementById('timerSeconds');

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      if (elDays) elDays.innerText = '00';
      if (elHours) elHours.innerText = '00';
      if (elMinutes) elMinutes.innerText = '00';
      if (elSeconds) elSeconds.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (elDays) elDays.innerText = String(days).padStart(2, '0');
    if (elHours) elHours.innerText = String(hours).padStart(2, '0');
    if (elMinutes) elMinutes.innerText = String(minutes).padStart(2, '0');
    if (elSeconds) elSeconds.innerText = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/**
 * Integración con Calendarios (Google Calendar y iPhone / Apple .ics)
 */
function initCalendar() {
  const eventDetails = {
    title: "Primer Cumpleaños de Dominique 🧜‍♀️🎃",
    description: "¡Celebramos la primera vuelta al sol de Dominique! Temática: Bajo el mar con toque de Halloween. ¡Te espero con tu mejor disfraz!",
    location: "Club Valle del Sol, Senecio 4593, Puente Alto, Chile",
    // 31 de Octubre 2026, 15:00 a 20:00 hora de Chile (UTC-3 -> 18:00Z a 23:00Z)
    startDate: "20261031T180000Z",
    endDate: "20261031T230000Z"
  };

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.startDate}/${eventDetails.endDate}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`;

  const googleBtns = [
    document.getElementById('btnGoogleCal'),
    document.getElementById('btnGoogleCalHero')
  ];
  googleBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(googleUrl, '_blank');
      });
    }
  });

  const appleBtns = [
    document.getElementById('btnAppleCal'),
    document.getElementById('btnAppleCalHero')
  ];
  appleBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        downloadAppleIcs(eventDetails);
      });
    }
  });
}

function downloadAppleIcs(ev) {
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cositas Para Eventos//Cumpleanos Dominique//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${ev.title}`,
    `DESCRIPTION:${ev.description}`,
    `LOCATION:${ev.location}`,
    `DTSTART:${ev.startDate}`,
    `DTEND:${ev.endDate}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', 'Cumpleanos_Dominique.ics');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Manejo del formulario de confirmación (RSVP)
 */
function initRsvpForm() {
  const form = document.getElementById('rsvpForm');
  const successCard = document.getElementById('rsvpSuccess');
  const attendeesSection = document.getElementById('attendeesSection');
  const radioButtons = document.querySelectorAll('input[name="asistencia"]');
  const btnShareWhatsApp = document.getElementById('btnShareWhatsApp');
  const btnResetForm = document.getElementById('btnResetRsvpForm');

  if (!form) return;

  // Alternar visualización si dice que no podrá asistir
  radioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'no' && radio.checked) {
        if (attendeesSection) attendeesSection.style.display = 'none';
      } else {
        if (attendeesSection) attendeesSection.style.display = 'block';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('rsvpNombre').value.trim();
    const telefono = document.getElementById('rsvpTelefono').value.trim();
    const asistiraVal = document.querySelector('input[name="asistencia"]:checked')?.value;
    const asistira = (asistiraVal === 'si');
    const adultos = asistira ? parseInt(document.getElementById('rsvpAdultos').value, 10) : 0;
    const ninos = asistira ? parseInt(document.getElementById('rsvpNinos').value, 10) : 0;
    const dedicatoria = document.getElementById('rsvpDedicatoria')?.value.trim() || '';

    if (!nombre) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    // Guardar en store
    if (window.cumpleStore) {
      window.cumpleStore.addInvitado({
        nombre,
        telefono,
        asistira,
        adultos,
        ninos,
        disfraz: '',
        alergias: '',
        dedicatoria
      });
    }

    // Efecto de Confeti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#2dd4bf', '#a855f7', '#f59e0b', '#ffffff']
      });
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#2dd4bf', '#a855f7'] });
        confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#2dd4bf', '#a855f7'] });
      }, 250);
    }

    // Armar enlace de WhatsApp para los papás
    const eventData = window.cumpleStore ? window.cumpleStore.getData().evento : {};
    let waMsg = `¡Hola! Vengo a confirmar asistencia para el cumpleaños de ${eventData.nombreCumpleanera || 'Dominique'} (31 de Octubre, 15:00 hrs).\n\n`;
    waMsg += `👤 *Nombre:* ${nombre}\n`;
    waMsg += `✨ *¿Asistirá?:* ${asistira ? '¡Sí, con mucho gusto! 🎉' : 'No podré asistir 😢'}\n`;
    if (asistira) {
      waMsg += `👥 *Adultos:* ${adultos}\n`;
      waMsg += `👶 *Niños:* ${ninos}\n`;
    }
    if (dedicatoria) {
      waMsg += `💌 *Mensaje para Domi:* "${dedicatoria}"\n`;
    }

    const encodedWa = encodeURI(waMsg);
    const waPhone = (eventData.whatsappOrganizador || '').replace(/[^0-9]/g, '');
    const waUrl = waPhone ? `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodedWa}` : `https://api.whatsapp.com/send?text=${encodedWa}`;

    if (btnShareWhatsApp) {
      btnShareWhatsApp.href = waUrl;
    }

    const titleEl = document.getElementById('rsvpSuccessTitle');
    const msgEl = document.getElementById('rsvpSuccessMsg');
    if (asistira) {
      if (titleEl) titleEl.innerText = `¡Te esperamos con muchas ganas, ${nombre}! 🎉`;
      if (msgEl) msgEl.innerText = `Tu confirmación para ${adultos} adulto(s) y ${ninos} niño(s) quedó guardada con éxito. ¡Dominique estará feliz de verte!`;
    } else {
      if (titleEl) titleEl.innerText = `¡Gracias por avisarnos, ${nombre}! 💌`;
      if (msgEl) msgEl.innerText = `Lamentamos que no puedas venir, ¡pero te tendremos en nuestros corazones!`;
    }

    // Mostrar confirmación
    form.style.display = 'none';
    if (successCard) successCard.style.display = 'block';
  });

  // Botón para enviar otra respuesta
  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      form.reset();
      if (attendeesSection) attendeesSection.style.display = 'block';
      form.style.display = 'flex';
      if (successCard) successCard.style.display = 'none';
    });
  }
}

/**
 * Modal para ver el afiche de invitación completo
 */
function initPosterModal() {
  const modal = document.getElementById('posterModal');
  const btnOpen1 = document.getElementById('btnOpenPosterModal');
  const btnOpen2 = document.getElementById('btnZoomPoster');
  const btnClose = document.getElementById('btnClosePosterModal');

  function openModal() {
    if (modal) modal.style.display = 'flex';
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }

  if (btnOpen1) btnOpen1.addEventListener('click', openModal);
  if (btnOpen2) btnOpen2.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/**
 * Scroll suave para los enlaces del menú
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Enlace inteligente al Organizador para evitar rutas rotas en Vercel
 */
function initOrganizadorNavLinks() {
  document.querySelectorAll('.btn-to-organizador').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const path = window.location.pathname;
      if (path.endsWith('.html')) {
        const lastSlash = path.lastIndexOf('/');
        const base = path.substring(0, lastSlash + 1);
        window.location.href = (base || './') + 'organizador/';
      } else if (path.endsWith('/')) {
        window.location.href = path + 'organizador/';
      } else {
        window.location.href = path + '/organizador/';
      }
    });
  });
}
