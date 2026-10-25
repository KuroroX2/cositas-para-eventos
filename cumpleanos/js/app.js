/**
 * app.js - Lógica interactiva para la Invitación de Cumpleaños
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initCountdown();
  initCalendar();
  initPersonalizedInvitation();
  initAdminAuthModal();
  initRsvpForm();
  initPosterModal();
  initSmoothScroll();
  initOrganizadorNavLinks();
  initDynamicItinerario();
});

/**
 * Detección y despliegue de Invitación Personalizada desde la URL
 * Soporta parámetros:
 * - fam: Nombre de la familia (ej: "Familia Gomez Perez")
 * - nombres: Lista de integrantes (ej: "Carlos, Marcela y Lucas")
 * - n o nombre o n1: Nombre de invitado principal
 * - n2: Pareja / Acompañante
 * - a o adultos: Cantidad de adultos
 * - ni o ninos: Cantidad de niños
 * - p o pases: Total de pases reservados
 * - code: Código único de invitación del organizador
 * - tipo: 'individual' | 'pareja' | 'familia'
 */
function initPersonalizedInvitation() {
  const params = new URLSearchParams(window.location.search);
  const fam = params.get('fam')?.trim() || '';
  const n = params.get('n')?.trim() || params.get('nombre')?.trim() || '';
  const n1 = params.get('n1')?.trim() || '';
  const n2 = params.get('n2')?.trim() || '';
  const nombres = params.get('nombres')?.trim() || '';
  const code = params.get('code')?.trim() || '';
  const tipo = params.get('tipo')?.trim() || (fam ? 'familia' : (n2 ? 'pareja' : 'individual'));

  // Si no hay ningún parámetro de personalización:
  if (!fam && !n && !n1 && !code && !nombres) {
    // Mostrar la tarjeta VIP con datos de invitado de ejemplo para que la invitación se vea completa
    const vipCard = document.getElementById('vipPersonalizedCard');
    if (vipCard) {
      vipCard.style.display = 'block';
    }
    return;
  }

  // Si ES una invitación personalizada para un invitado real: OCULTAR botones de administración
  document.querySelectorAll('.btn-admin-auth').forEach(btn => {
    btn.style.setProperty('display', 'none', 'important');
  });

  // Determinar título principal a mostrar
  let displayTitle = '';
  let subnamesText = '';

  if (fam) {
    displayTitle = fam;
    if (nombres) {
      subnamesText = `Integrantes: ${nombres}`;
    }
  } else if (n1 && n2) {
    displayTitle = `${n1} & ${n2}`;
    subnamesText = 'Esperamos contar con ustedes dos';
  } else {
    displayTitle = n || n1 || 'Invitado de Honor';
  }

  // Parsear pases
  const adultosParam = parseInt(params.get('a') || params.get('adultos') || (fam ? '2' : '1'), 10);
  const ninosParam = parseInt(params.get('ni') || params.get('ninos') || '0', 10);
  let totalPases = parseInt(params.get('p') || params.get('pases') || '0', 10);
  if (!totalPases || isNaN(totalPases)) {
    totalPases = (isNaN(adultosParam) ? 1 : adultosParam) + (isNaN(ninosParam) ? 0 : ninosParam);
  }

  const pasesText = totalPases === 1 
    ? 'Invitación para 1 Persona' 
    : `Invitación para ${totalPases} Personas (${adultosParam} Adulto${adultosParam > 1 ? 's' : ''}${ninosParam > 0 ? ` + ${ninosParam} Niño${ninosParam > 1 ? 's' : ''}` : ''})`;

  // Mensaje personalizado
  let personalMsg = '¡Tu presencia hará este día aún más mágico e inolvidable para mí!';
  if (tipo === 'familia' || fam) {
    personalMsg = '¡Familia, su presencia y cariño harán que esta primera vuelta al sol sea mágica e inolvidable!';
  } else if (tipo === 'pareja' || (n1 && n2)) {
    personalMsg = '¡Chicos, su compañía en esta fecha tan especial nos llenará de alegría!';
  }

  // 1. Mostrar y configurar la tarjeta VIP en el Hero
  const vipCard = document.getElementById('vipPersonalizedCard');
  const vipTitleEl = document.getElementById('vipGuestTitle');
  const vipSubnamesEl = document.getElementById('vipGuestSubnames');
  const vipPassesTextEl = document.getElementById('vipPassesText');
  const vipMsgEl = document.getElementById('vipPersonalMsg');

  if (vipCard) {
    if (vipTitleEl) vipTitleEl.textContent = displayTitle;
    if (vipSubnamesEl) {
      if (subnamesText) {
        vipSubnamesEl.textContent = subnamesText;
        vipSubnamesEl.style.display = 'block';
      } else {
        vipSubnamesEl.style.display = 'none';
      }
    }
    if (vipPassesTextEl) vipPassesTextEl.textContent = pasesText;
    if (vipMsgEl) vipMsgEl.textContent = personalMsg;
    vipCard.style.display = 'block';
  }

  // 2. Personalizar el subtítulo de la sección de confirmación (RSVP)
  const rsvpVipBanner = document.getElementById('rsvpVipBanner');
  const rsvpSubtitleModern = document.getElementById('rsvpSubtitleModern');
  const rsvpCodeInput = document.getElementById('rsvpInviteCode');

  const isPersonalized = Boolean(code || fam || n || n1 || params.get('inv') || params.get('p') || params.get('a') || params.get('adultos'));

  // Ocultar banner redundante de invitación reservada para no repetir textos
  if (rsvpVipBanner) {
    rsvpVipBanner.style.display = 'none';
  }
  if (rsvpSubtitleModern && isPersonalized) {
    rsvpSubtitleModern.textContent = `¡Hola, ${displayTitle}! Por favor indícanos si podrás asistir lo antes posible 💖`;
  }

  // Pre-llenar campos del formulario
  const rsvpNombreInput = document.getElementById('rsvpNombre');
  const rsvpAdultosSelect = document.getElementById('rsvpAdultos');
  const rsvpNinosSelect = document.getElementById('rsvpNinos');

  if (rsvpNombreInput && !rsvpNombreInput.value) {
    rsvpNombreInput.value = displayTitle;
  }
  if (rsvpCodeInput) {
    rsvpCodeInput.value = code;
  }

  // En la invitación personalizada los combo box son modificables a la baja
  if (isPersonalized) {
    if (rsvpAdultosSelect) {
      rsvpAdultosSelect.disabled = false;
      rsvpAdultosSelect.style.cursor = 'pointer';
      rsvpAdultosSelect.style.opacity = '1';
      rsvpAdultosSelect.style.backgroundColor = '';

      const maxA = (!isNaN(adultosParam) && adultosParam > 0) ? Math.min(adultosParam, 12) : 1;
      rsvpAdultosSelect.innerHTML = '';
      for (let i = 1; i <= maxA; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = i === 1 ? '1 Adulto' : `${i} Adultos`;
        if (i === maxA) opt.selected = true;
        rsvpAdultosSelect.appendChild(opt);
      }
    }

    if (rsvpNinosSelect) {
      rsvpNinosSelect.disabled = false;
      rsvpNinosSelect.style.cursor = 'pointer';
      rsvpNinosSelect.style.opacity = '1';
      rsvpNinosSelect.style.backgroundColor = '';

      const maxN = (!isNaN(ninosParam) && ninosParam >= 0) ? Math.min(ninosParam, 12) : 0;
      rsvpNinosSelect.innerHTML = '';
      for (let i = 0; i <= maxN; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = i === 0 ? '0 Niños' : (i === 1 ? '1 Niño' : `${i} Niños`);
        if (i === maxN) opt.selected = true;
        rsvpNinosSelect.appendChild(opt);
      }
    }

    const attendeesSection = document.getElementById('attendeesSection');
    let limitNote = document.getElementById('rsvpGuestsLimitNote');
    if (!limitNote && attendeesSection) {
      limitNote = document.createElement('div');
      limitNote.id = 'rsvpGuestsLimitNote';
      limitNote.style.cssText = 'font-size: 0.82rem; color: var(--color-teal); margin-top: -0.3rem; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.4rem;';
      limitNote.innerHTML = '<i class="ri-information-line"></i> <span>Puedes confirmar hasta el número máximo asignado a tu invitación.</span>';
      attendeesSection.appendChild(limitNote);
    }
  }

  // Si existe en el store local, intentar rellenar teléfono si ya lo teníamos
  if (window.cumpleStore && (code || displayTitle)) {
    const existing = window.cumpleStore.findInvitado(code, displayTitle);
    if (existing && existing.telefono) {
      const telInput = document.getElementById('rsvpTelefono');
      if (telInput && !telInput.value) telInput.value = existing.telefono;
    }
  }
}

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
    description: "¡Celebramos la primera vuelta al sol de Dominique! Temática: Bajo el mar con toque de Halloween. ¡Te esperamos con tu mejor disfraz!",
    location: "Club Valle del Sol, Senecio 4593, Puente Alto, Chile",
    // 31 de Octubre 2026, 15:00 a 21:00 hora de Chile (UTC-3 -> 18:00Z a 00:00Z)
    startDate: "20261031T180000Z",
    endDate: "20261101T000000Z"
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

  const btnSubmitRsvp = document.getElementById('btnSubmitRsvp');

  // Alternar visualización y texto de botón si dice que no podrá asistir
  function updateAttendanceState() {
    const isNo = document.querySelector('input[name="asistencia"]:checked')?.value === 'no';
    if (attendeesSection) attendeesSection.style.display = isNo ? 'none' : 'block';
    if (btnSubmitRsvp) {
      if (isNo) {
        btnSubmitRsvp.innerHTML = '<i class="ri-close-circle-line"></i> Enviar que no podré asistir';
        btnSubmitRsvp.classList.add('btn-submit-declined');
      } else {
        btnSubmitRsvp.innerHTML = '<i class="ri-send-plane-fill"></i> Confirmar mi Asistencia';
        btnSubmitRsvp.classList.remove('btn-submit-declined');
      }
    }
  }

  radioButtons.forEach(radio => {
    radio.addEventListener('change', updateAttendanceState);
  });
  updateAttendanceState();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('rsvpNombre').value.trim();
    const telefono = document.getElementById('rsvpTelefono').value.trim();
    const code = document.getElementById('rsvpInviteCode')?.value.trim() || '';
    const asistiraVal = document.querySelector('input[name="asistencia"]:checked')?.value;
    const asistira = (asistiraVal === 'si');
    const adultos = asistira ? parseInt(document.getElementById('rsvpAdultos').value, 10) : 0;
    const ninos = asistira ? parseInt(document.getElementById('rsvpNinos').value, 10) : 0;
    const dedicatoria = document.getElementById('rsvpDedicatoria')?.value.trim() || '';

    if (!nombre) {
      alert('Por favor ingresa tu nombre o el de tu familia');
      return;
    }

    // Guardar o actualizar en store
    let existingGuest = null;
    if (window.cumpleStore) {
      existingGuest = window.cumpleStore.findInvitado(code, nombre);
      if (existingGuest) {
        window.cumpleStore.updateInvitado(existingGuest.id, {
          nombre: nombre,
          telefono: telefono || existingGuest.telefono,
          asistira: asistira,
          adultos: adultos,
          ninos: ninos,
          dedicatoria: dedicatoria || existingGuest.dedicatoria,
          fechaConfirmacion: new Date().toISOString()
        });
      } else {
        window.cumpleStore.addInvitado({
          nombre,
          telefono,
          asistira,
          adultos,
          ninos,
          dedicatoria,
          codigo: code
        });
      }
    }

    // Efecto de Confeti
    if (typeof confetti === 'function' && asistira) {
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
    waMsg += `👤 *Invitado / Familia:* ${nombre}\n`;
    if (existingGuest && existingGuest.nombresIntegrantes) {
      waMsg += `👨‍👩‍👧‍👦 *Integrantes:* ${existingGuest.nombresIntegrantes}\n`;
    }
    waMsg += `✨ *¿Asistirá?:* ${asistira ? '¡Sí, con mucho gusto! 🎉' : 'No podremos asistir 😢'}\n`;
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
      if (msgEl) msgEl.innerText = `Lamentamos que no puedan venir, ¡pero los tendremos en nuestros corazones!`;
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
      parsePersonalizedInvite();
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

/**
 * Menú de Navegación Móvil (Botón Hamburguesa / Sándwich)
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('btnMobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  if (!toggleBtn || !drawer) return;

  function toggleMenu(open) {
    const shouldOpen = (open !== undefined) ? open : !drawer.classList.contains('open');
    if (shouldOpen) {
      drawer.classList.add('open');
      toggleBtn.innerHTML = '<i class="ri-close-line"></i>';
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      drawer.classList.remove('open');
      toggleBtn.innerHTML = '<i class="ri-menu-line"></i>';
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar al pulsar un link dentro del drawer
  const drawerLinks = drawer.querySelectorAll('.mobile-nav-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Cerrar al pulsar fuera del menú
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleMenu(false);
    }
  });
}

/**
 * Autenticación y Acceso al Organizador (Clave de los Papás: Domi.2026)
 */
function initAdminAuthModal() {
  const ADMIN_PASS = 'Domi.2026';
  const authBtns = document.querySelectorAll('.btn-admin-auth');
  const modal = document.getElementById('adminAuthModal');
  const closeBtn = document.getElementById('btnCloseAuthModal');
  const form = document.getElementById('adminAuthForm');
  const pinInput = document.getElementById('adminAuthPin');
  const errorMsg = document.getElementById('adminAuthError');
  const toggleEye = document.getElementById('btnToggleAuthPin');

  function getOrganizadorUrl() {
    const loc = window.location;
    if (loc.protocol === 'file:') {
      const cleanPath = loc.pathname;
      if (cleanPath.includes('/DominiqueHormazabal/')) {
        return cleanPath.replace('/DominiqueHormazabal/index.html', '/DominiqueHormazabal/organizador/index.html').replace('/DominiqueHormazabal/', '/DominiqueHormazabal/organizador/index.html');
      } else if (cleanPath.includes('/demo/')) {
        return cleanPath.replace('/demo/index.html', '/demo/organizador/index.html').replace('/demo/', '/demo/organizador/index.html');
      } else {
        return 'organizador/index.html';
      }
    } else {
      const origin = (loc.origin && loc.origin !== 'null') ? loc.origin : '';
      if (loc.pathname.includes('/demo')) {
        return `${origin}/cumpleanos/demo/organizador/`;
      } else {
        return `${origin}/cumpleanos/DominiqueHormazabal/organizador/`;
      }
    }
  }

  function openOrgOrModal(e) {
    if (e) e.preventDefault();
    const drawer = document.getElementById('mobileNavDrawer');
    if (drawer && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      const toggleBtn = document.getElementById('btnMobileNavToggle');
      if (toggleBtn) toggleBtn.innerHTML = '<i class="ri-menu-line"></i>';
    }

    // Si estamos en la DEMO: abrir directamente su propio organizador demo sin pedir clave
    if (window.location.pathname.includes('/demo')) {
      window.location.href = getOrganizadorUrl();
      return;
    }

    // Si ya está autenticado en la sesión, ingresar directamente al organizador de Dominique
    if (sessionStorage.getItem('cumple_admin_auth') === 'true') {
      window.location.href = getOrganizadorUrl();
      return;
    }

    if (modal) {
      modal.style.display = 'flex';
      if (pinInput) {
        pinInput.value = '';
        setTimeout(() => pinInput.focus(), 100);
      }
      if (errorMsg) errorMsg.style.display = 'none';
      document.body.style.overflow = 'hidden';
    }
  }

  authBtns.forEach(btn => {
    btn.addEventListener('click', openOrgOrModal);
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  if (toggleEye && pinInput) {
    toggleEye.addEventListener('click', () => {
      const isPass = pinInput.getAttribute('type') === 'password';
      pinInput.setAttribute('type', isPass ? 'text' : 'password');
      toggleEye.innerHTML = isPass ? '<i class="ri-eye-off-line"></i>' : '<i class="ri-eye-line"></i>';
    });
  }

  if (form && pinInput) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = pinInput.value.trim();
      if (entered === ADMIN_PASS) {
        sessionStorage.setItem('cumple_admin_auth', 'true');
        if (errorMsg) errorMsg.style.display = 'none';
        window.location.href = getOrganizadorUrl();
      } else {
        if (errorMsg) errorMsg.style.display = 'flex';
        const wrapper = pinInput.closest('.auth-input-wrapper');
        if (wrapper) {
          wrapper.classList.remove('auth-shake');
          void wrapper.offsetWidth;
          wrapper.classList.add('auth-shake');
        }
        pinInput.select();
      }
    });
  }
}

/**
 * Renderizado dinámico del Itinerario del Evento desde CumpleStore
 * Conecta en tiempo real los cambios del panel organizador con la invitación
 */
function initDynamicItinerario() {
  const container = document.querySelector('.itinerario-container');
  if (!container || !window.cumpleStore) return;

  function renderItinerario() {
    const cronograma = window.cumpleStore.getCronograma();
    if (!cronograma || cronograma.length === 0) return;

    const stepStyles = ['step-teal', 'step-pink', 'step-amber', 'step-purple'];
    const getStepIcon = (titulo = '') => {
      const t = titulo.toLowerCase();
      if (t.includes('torta') || t.includes('feliz') || t.includes('vela')) return 'ri-cake-3-line';
      if (t.includes('completo') || t.includes('banquete') || t.includes('comida') || t.includes('comer') || t.includes('cenar')) return 'ri-restaurant-2-line';
      if (t.includes('dulce') || t.includes('disfraz') || t.includes('halloween')) return 'ri-ghost-line';
      if (t.includes('despedida') || t.includes('regreso') || t.includes('cierre') || t.includes('final') || t.includes('adios')) return 'ri-home-heart-line';
      if (t.includes('bienvenida') || t.includes('llegada') || t.includes('inicio') || t.includes('picar') || t.includes('conversar')) return 'ri-cup-line';
      if (t.includes('juego') || t.includes('show') || t.includes('magia') || t.includes('animac') || t.includes('piñata')) return 'ri-magic-line';
      if (t.includes('foto') || t.includes('sesion') || t.includes('recuerdo')) return 'ri-camera-lens-line';
      if (t.includes('baile') || t.includes('musica') || t.includes('cancion')) return 'ri-music-2-line';
      return 'ri-time-line';
    };

    let stepsHtml = `<div class="itinerario-timeline-rail" aria-hidden="true"></div>`;

    cronograma.forEach((item, index) => {
      const styleClass = stepStyles[index % stepStyles.length];
      const iconClass = getStepIcon(item.titulo || '');
      const horaText = item.hora ? `${escapeAppHtml(item.hora)} hrs` : '';
      const titulo = escapeAppHtml(item.titulo || 'Momento Especial');
      const desc = escapeAppHtml(item.descripcion || '');

      stepsHtml += `
        <div class="itinerario-step ${styleClass}">
          <div class="itinerario-node">
            <i class="${iconClass}"></i>
          </div>
          <div class="itinerario-card">
            <div class="itinerario-card-header">
              <span class="itinerario-time-badge"><i class="ri-time-line"></i> ${horaText}</span>
            </div>
            <h3 class="itinerario-card-title">${titulo}</h3>
            ${desc ? `<p class="itinerario-card-desc">${desc}</p>` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = stepsHtml;
  }

  // Render inicial al cargar
  renderItinerario();

  // Escuchar evento personalizado dentro de la misma pestaña
  window.addEventListener('cumple_store_updated', renderItinerario);

  // Escuchar cambios de localStorage entre diferentes pestañas o ventanas
  window.addEventListener('storage', (e) => {
    if (e.key === window.cumpleStore.storageKey) {
      window.cumpleStore.data = window.cumpleStore.load();
      renderItinerario();
    }
  });
}

function escapeAppHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


