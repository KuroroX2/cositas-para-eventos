/**
 * EVELYN & YIMMY — NUESTRO MATRIMONIO
 * Módulo de Confirmación de Asistencia (RSVP) con SUPABASE CLOUD
 * - Flujos diferenciados y amigables para "Asiste" y "No Asiste"
 * - Soporte para Invitaciones Personalizadas con bloques individuales por invitado
 * - Pase de Entrada Digital Oficial
 * - Soporte completo para Modificar Respuesta en cualquier momento
 */

(function() {
  let invitationData = null;
  let existingConfirmation = null;
  let cachedFormHTML = '';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRsvpModule);
  } else {
    initRsvpModule();
  }

  async function initRsvpModule() {
    const form = document.getElementById('rsvp-form');
    const passModal = document.getElementById('guest-pass-modal');
    const closePassBtn = document.getElementById('btn-close-pass-modal');
    const printPassBtn = document.getElementById('btn-print-pass');
    const copyCodeBtn = document.getElementById('btn-copy-pass-code');

    if (form) {
      cachedFormHTML = form.innerHTML;
    }

    // 1. Check for URL parameters (?p=2&n1=...&n2=...&code=...)
    checkUrlInvitationParams();

    // 2. Check if already confirmed in cloud or local storage
    await checkAlreadyConfirmedStatus();

    if (!form) return;

    setupFormInteractions();

    // Close pass modal
    if (closePassBtn && passModal) {
      closePassBtn.addEventListener('click', () => {
        passModal.classList.remove('active');
        passModal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }

    if (passModal) {
      passModal.addEventListener('click', (e) => {
        if (e.target === passModal) {
          passModal.classList.remove('active');
          passModal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // Print Pass (Exactamente 1 sola página)
    if (printPassBtn) {
      printPassBtn.addEventListener('click', printGuestPass);
    }

    // Copy Code
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('click', () => {
        const codeEl = document.getElementById('pass-code');
        const code = codeEl ? codeEl.textContent.trim() : '';
        if (code) {
          navigator.clipboard.writeText(code).then(() => {
            copyCodeBtn.innerHTML = '<i class="ri-check-line"></i> <span>¡Código Copiado!</span>';
            setTimeout(() => {
              copyCodeBtn.innerHTML = '<i class="ri-file-copy-line"></i> <span>Copiar Mi Código</span>';
            }, 3000);
          });
        }
      });
    }
  }

  function setupFormInteractions() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    const attendanceDetails1 = document.getElementById('attendance-details-group');
    const attendanceDetails2 = document.getElementById('attendance-details-group-2');

    function updateAttendanceUI() {
      const attRadio1 = form.querySelector('input[name="attendance"]:checked');
      const att1 = attRadio1 ? attRadio1.value : 'si';

      const isTwoPasses = invitationData && invitationData.pases === 2;
      const attRadio2 = form.querySelector('input[name="attendance_2"]:checked');
      const att2 = isTwoPasses && attRadio2 ? attRadio2.value : 'no';

      if (attendanceDetails1) {
        attendanceDetails1.style.display = att1 === 'no' ? 'none' : 'grid';
      }
      if (attendanceDetails2) {
        attendanceDetails2.style.display = att2 === 'no' ? 'none' : 'grid';
      }

      const submitBtnText = document.getElementById('btn-rsvp-submit-text');
      const submitBtnIcon = document.getElementById('btn-rsvp-icon');

      const isAnyAttending = (att1 === 'si') || (isTwoPasses && att2 === 'si');

      if (submitBtnText && submitBtnIcon) {
        if (existingConfirmation) {
          submitBtnText.textContent = isAnyAttending ? 'Guardar Cambios & Ver Pase Actualizado' : 'Guardar y Enviar Mi Respuesta 💌';
          submitBtnIcon.className = 'ri-check-double-line';
        } else if (isAnyAttending) {
          submitBtnText.textContent = 'Confirmar Asistencia & Ver Mi Pase';
          submitBtnIcon.className = 'ri-check-double-line';
        } else {
          submitBtnText.textContent = 'Enviar Mi Respuesta 💌';
          submitBtnIcon.className = 'ri-mail-send-line';
        }
      }
    }

    const radios1 = form.querySelectorAll('input[name="attendance"]');
    radios1.forEach(radio => radio.addEventListener('change', updateAttendanceUI));

    const radios2 = form.querySelectorAll('input[name="attendance_2"]');
    radios2.forEach(radio => radio.addEventListener('change', updateAttendanceUI));

    updateAttendanceUI();

    form.onsubmit = handleRsvpSubmit;
  }

  function checkUrlInvitationParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const pases = parseInt(urlParams.get('p') || '1', 10);
    const name1 = urlParams.get('n1');
    const name2 = urlParams.get('n2');
    const code = urlParams.get('code');

    const rsvpSection = document.getElementById('rsvp');
    const navLink = document.getElementById('nav-link-rsvp');
    const drawerItem = document.getElementById('drawer-item-rsvp');

    if (!name1) {
      // Visita genérica / pública: Ocultar completamente la sección y enlaces de confirmación
      if (rsvpSection) rsvpSection.style.display = 'none';
      if (navLink) navLink.style.display = 'none';
      if (drawerItem) drawerItem.style.display = 'none';
      return;
    }

    // Invitación personalizada con pases: Mostrar la sección y enlaces
    if (rsvpSection) rsvpSection.style.display = 'block';
    if (navLink) navLink.style.display = 'inline-flex';
    if (drawerItem) drawerItem.style.display = 'block';

    invitationData = {
      pases: pases,
      name1: name1,
      name2: name2 || '',
      code: code || ''
    };

    // Show Personalized Badge
    const badge = document.getElementById('personalized-invitation-badge');
    const badgeNames = document.getElementById('badge-guest-names');
    const badgeInfo = document.getElementById('badge-passes-info');

    if (badge && badgeNames) {
      badgeNames.textContent = name2 ? `${name1} & ${name2}` : name1;
      if (badgeInfo) {
        badgeInfo.textContent = pases === 2 ? '✨ Pase especial reservado para 2 Personas' : '✨ Pase individual reservado para 1 Persona';
      }
      badge.style.display = 'flex';
    }

    applyInvitationFields(name1, name2, pases);
  }

  function applyInvitationFields(name1, name2, pases) {
    const nameInput1 = document.getElementById('rsvp-name');
    const heading1 = document.getElementById('heading-guest-1');
    const lblName1 = document.getElementById('lbl-rsvp-name');
    const lblAtt1 = document.getElementById('lbl-attendance-1');
    const lblSong1 = document.getElementById('lbl-rsvp-song');

    if (nameInput1 && name1) nameInput1.value = name1;
    if (heading1 && name1) heading1.textContent = `Primer Invitado: ${name1}`;
    if (lblName1 && name1) lblName1.textContent = `Nombre y Apellido (Invitado 1: ${name1}) *`;
    if (lblAtt1 && name1) lblAtt1.textContent = `¿Tú (${name1}) nos acompañarás? *`;
    if (lblSong1 && name1) lblSong1.textContent = `Canción que sugiere ${name1}`;

    if (pases === 2) {
      const g2Container = document.getElementById('guest-2-container');
      const nameInput2 = document.getElementById('rsvp-name-2');
      const heading2 = document.getElementById('heading-guest-2');
      const lblName2 = document.getElementById('lbl-rsvp-name-2');
      const lblAtt2 = document.getElementById('lbl-attendance-2');
      const lblSong2 = document.querySelector('label[for="rsvp-song-2"]');
      const lblMessage = document.getElementById('lbl-rsvp-message');

      if (g2Container) g2Container.style.display = 'block';
      if (nameInput2 && name2) nameInput2.value = name2;
      if (heading2) heading2.textContent = name2 ? `Segundo Invitado: ${name2}` : 'Segundo Invitado (Acompañante)';
      if (lblName2) lblName2.textContent = name2 ? `Nombre y Apellido (Invitado 2: ${name2}) *` : 'Nombre y Apellido del Acompañante *';
      if (lblAtt2) lblAtt2.textContent = name2 ? `¿Tú (${name2}) nos acompañarás?` : '¿Tu acompañante asistirá?';
      if (lblSong2) lblSong2.textContent = name2 ? `Canción que sugiere ${name2}` : 'Canción que sugiere tu acompañante';
      if (lblMessage) lblMessage.textContent = name2 ? `Un mensaje o dedicatoria para nosotros (de parte de ${name1} y ${name2})` : 'Un mensaje o dedicatoria para nosotros (de parte de ustedes)';
    }
  }

  async function checkAlreadyConfirmedStatus() {
    let rsvps = [];
    try {
      const stored = localStorage.getItem('wedding_rsvps_cloud_v1');
      if (stored) rsvps = JSON.parse(stored);
    } catch (e) {}

    // Fetch cloud rsvps from Supabase
    if (window.dbSupabase) {
      try {
        const cloudRsvps = await window.dbSupabase.getRsvps();
        if (cloudRsvps && cloudRsvps.length > 0) {
          rsvps = cloudRsvps.map(r => ({
            name: r.name1,
            name2: r.name2,
            attendance: (r.attendance1 || r.attendance2) ? 'si' : 'no',
            attendance1: r.attendance1 ? 'si' : 'no',
            attendance2: r.attendance2 ? 'si' : 'no',
            dietary: r.dietary1,
            dietary2: r.dietary2,
            song: r.song_request,
            song2: '',
            message: r.message,
            code: r.pass_code,
            invCode: r.invitation_id
          }));
          localStorage.setItem('wedding_rsvps_cloud_v1', JSON.stringify(rsvps));
        }
      } catch (e) {
        console.warn('Supabase fetch notice:', e);
      }
    }

    if (rsvps.length === 0) return;

    // Search for match
    let match = null;

    if (invitationData) {
      match = rsvps.find(r => {
        if (invitationData.code && r.invCode === invitationData.code) return true;
        if (invitationData.name1 && r.name && r.name.toLowerCase().trim() === invitationData.name1.toLowerCase().trim()) return true;
        return false;
      });
    } else {
      const localCode = localStorage.getItem('wedding_confirmed_generic_code');
      if (localCode) {
        match = rsvps.find(r => r.code === localCode);
      }
    }

    if (match) {
      existingConfirmation = match;
      renderAlreadyConfirmedUI(match);
    }
  }

  function renderAlreadyConfirmedUI(conf) {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    const displayName = conf.name2 ? `${conf.name} & ${conf.name2}` : conf.name;
    const isYes = conf.attendance === 'si' || conf.attendance1 === 'si' || conf.attendance2 === 'si';
    const pasesCount = conf.pasesCount || (conf.name2 ? (isYes ? 2 : 0) : (isYes ? 1 : 0));

    if (isYes) {
      // Caso 1: Asistencia Confirmada
      form.innerHTML = `
        <div class="rsvp-already-confirmed-box" style="text-align: center; padding: 2.2rem 1.6rem; background: rgba(82, 122, 80, 0.08); border: 2px solid #527A50; border-radius: 20px;">
          <div style="font-size: 3.2rem; color: #527A50; line-height: 1; margin-bottom: 0.8rem;">
            <i class="ri-checkbox-circle-fill"></i>
          </div>
          <h3 style="font-family: var(--font-serif); font-size: 1.55rem; color: #243525; margin-bottom: 0.4rem;">
            ¡Asistencia Confirmada con Éxito! 🎉
          </h3>
          <p style="font-size: 0.88rem; color: #4B634C; margin-bottom: 1.4rem; line-height: 1.5;">
            ¡Qué alegría contar contigo! Ya tenemos tu lugar reservado para celebrar juntos en Casa Pirque.
          </p>

          <div style="background: #FFFFFF; border: 1px dashed rgba(82, 122, 80, 0.35); padding: 1.1rem 1.2rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: left; font-size: 0.84rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between;"><strong style="color: #4B634C;">Invitado(s):</strong> <span style="font-weight: 700; color: #243525;">${escapeHtml(displayName)}</span></div>
            <div style="display: flex; justify-content: space-between;"><strong style="color: #4B634C;">Estado:</strong> <span style="color: #27ae60; font-weight: 700;">✓ Asistencia Confirmada</span></div>
            <div style="display: flex; justify-content: space-between;"><strong style="color: #4B634C;">Pase(s) Asignado(s):</strong> <span style="font-weight: 700;">${pasesCount > 0 ? pasesCount : (conf.name2 ? 2 : 1)} Persona${(pasesCount > 1 || conf.name2) ? 's' : ''}</span></div>
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed rgba(82, 122, 80, 0.2); padding-top: 0.4rem;"><strong style="color: #527A50;">Código de Sorteo:</strong> <span class="code-mono" style="font-weight: 800; font-size: 1.05rem; color: #527A50;">${escapeHtml(conf.code || 'EY-2026')}</span></div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button type="button" class="btn-vogue-gold" id="btn-reopen-confirmed-pass" style="width: 100%;">
              <i class="ri-ticket-2-line"></i>
              <span>Ver / Guardar Mi Pase Digital</span>
            </button>
            <button type="button" class="btn-vogue-outline" id="btn-edit-rsvp" style="width: 100%;">
              <i class="ri-edit-line"></i>
              <span>Modificar mi respuesta</span>
            </button>
          </div>
        </div>
      `;
    } else {
      // Caso 2: No Asiste
      form.innerHTML = `
        <div class="rsvp-already-confirmed-box" style="text-align: center; padding: 2.2rem 1.6rem; background: rgba(230, 126, 34, 0.06); border: 1.5px solid rgba(230, 126, 34, 0.4); border-radius: 20px;">
          <div style="font-size: 3.2rem; color: #e67e22; line-height: 1; margin-bottom: 0.8rem;">
            <i class="ri-mail-check-line"></i>
          </div>
          <h3 style="font-family: var(--font-serif); font-size: 1.55rem; color: #243525; margin-bottom: 0.4rem;">
            ¡Respuesta Registrada con Éxito! 💌
          </h3>
          <p style="font-size: 0.88rem; color: #4B634C; margin-bottom: 1.4rem; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
            Agradecemos mucho que nos hayas informado. Aunque no puedas acompañarnos físicamente, sabemos que estarás con nosotros en corazón y cariño. ¡Te mandamos un abrazo gigante!
          </p>

          <div style="background: #FFFFFF; border: 1px dashed rgba(230, 126, 34, 0.35); padding: 1.1rem 1.2rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: left; font-size: 0.84rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between;"><strong style="color: #4B634C;">Invitado(s):</strong> <span style="font-weight: 700; color: #243525;">${escapeHtml(displayName)}</span></div>
            <div style="display: flex; justify-content: space-between;"><strong style="color: #4B634C;">Respuesta:</strong> <span style="color: #c0392b; font-weight: 700;">No podré asistir</span></div>
          </div>

          <button type="button" class="btn-vogue-outline" id="btn-edit-rsvp" style="width: 100%;">
            <i class="ri-edit-line"></i>
            <span>Modificar mi respuesta (Cambiar a Asistiré)</span>
          </button>
        </div>
      `;
    }

    const reopenBtn = document.getElementById('btn-reopen-confirmed-pass');
    if (reopenBtn) {
      reopenBtn.addEventListener('click', () => {
        openDigitalPass(conf);
      });
    }

    const editBtn = document.getElementById('btn-edit-rsvp');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        enableEditMode(conf);
      });
    }
  }

  function enableEditMode(conf) {
    const form = document.getElementById('rsvp-form');
    if (!form || !cachedFormHTML) return;

    form.innerHTML = cachedFormHTML;

    // Apply URL params and names
    if (invitationData) {
      applyInvitationFields(invitationData.name1, invitationData.name2, invitationData.pases);
    } else {
      applyInvitationFields(conf.name, conf.name2, conf.name2 ? 2 : 1);
    }

    // Pre-fill fields with conf data
    const nameInput1 = document.getElementById('rsvp-name');
    if (nameInput1 && conf.name) nameInput1.value = conf.name;

    const att1 = conf.attendance1 || conf.attendance || 'si';
    const radioAtt1 = form.querySelector(`input[name="attendance"][value="${att1}"]`);
    if (radioAtt1) radioAtt1.checked = true;

    const dietary1 = document.getElementById('rsvp-dietary');
    if (dietary1 && conf.dietary) dietary1.value = conf.dietary;

    const song1 = document.getElementById('rsvp-song');
    if (song1 && conf.song) song1.value = conf.song;

    // Guest 2
    if ((invitationData && invitationData.pases === 2) || conf.name2) {
      const g2Container = document.getElementById('guest-2-container');
      if (g2Container) g2Container.style.display = 'block';

      const nameInput2 = document.getElementById('rsvp-name-2');
      if (nameInput2 && conf.name2) nameInput2.value = conf.name2;

      const att2 = conf.attendance2 || (conf.attendance === 'si' ? 'si' : 'no');
      const radioAtt2 = form.querySelector(`input[name="attendance_2"][value="${att2}"]`);
      if (radioAtt2) radioAtt2.checked = true;

      const dietary2 = document.getElementById('rsvp-dietary-2');
      if (dietary2 && conf.dietary2) dietary2.value = conf.dietary2;

      const song2 = document.getElementById('rsvp-song-2');
      if (song2 && conf.song2) song2.value = conf.song2;
    }

    const messageInput = document.getElementById('rsvp-message');
    if (messageInput && conf.message) messageInput.value = conf.message;

    setupFormInteractions();

    // Scroll smoothly to form
    const rsvpSection = document.getElementById('rsvp');
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function openDigitalPass(conf) {
    const passModal = document.getElementById('guest-pass-modal');
    const guestNameEl = document.getElementById('pass-guest-name');
    const passCountEl = document.getElementById('pass-pases-count');
    const passCodeEl = document.getElementById('pass-code');
    const passDietaryRow = document.getElementById('pass-dietary-row');
    const passDietaryVal = document.getElementById('pass-dietary-val');
    const passSongRow = document.getElementById('pass-song-row');
    const passSongVal = document.getElementById('pass-song-val');

    const displayName = conf.name2 ? `${conf.name} & ${conf.name2}` : conf.name;
    const pasesCount = conf.pasesCount || (conf.name2 ? 2 : 1);

    if (guestNameEl) guestNameEl.textContent = displayName;
    if (passCountEl) passCountEl.textContent = `${pasesCount} Persona${pasesCount > 1 ? 's' : ''}`;
    if (passCodeEl) passCodeEl.textContent = conf.code || 'EY-2026';

    // Dieta display
    let dietarySummary = [];
    if (conf.dietary && conf.dietary !== 'ninguna') {
      dietarySummary.push(conf.name2 ? `${conf.name}: ${conf.dietary}` : conf.dietary);
    }
    if (conf.name2 && conf.dietary2 && conf.dietary2 !== 'ninguna') {
      dietarySummary.push(`${conf.name2}: ${conf.dietary2}`);
    }

    if (dietarySummary.length > 0 && passDietaryRow && passDietaryVal) {
      passDietaryRow.style.display = 'flex';
      passDietaryVal.textContent = dietarySummary.join(' • ');
    } else if (passDietaryRow) {
      passDietaryRow.style.display = 'none';
    }

    // Songs display
    let songsSummary = [];
    if (conf.song) songsSummary.push(conf.name2 && conf.song2 ? `${conf.name}: "${conf.song}"` : `"${conf.song}"`);
    if (conf.name2 && conf.song2) songsSummary.push(`${conf.name2}: "${conf.song2}"`);

    if (songsSummary.length > 0 && passSongRow && passSongVal) {
      passSongRow.style.display = 'flex';
      passSongVal.textContent = songsSummary.join(' • ');
    } else if (passSongRow) {
      passSongRow.style.display = 'none';
    }

    if (passModal) {
      passModal.classList.add('active');
      passModal.style.display = 'flex';
      passModal.style.opacity = '1';
      passModal.style.pointerEvents = 'auto';
      document.body.style.overflow = 'hidden';
    }
  }

  // Global submit handler
  window.handleRsvpSubmit = async function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const form = document.getElementById('rsvp-form');
    if (!form) return false;

    // Guest 1 data
    const nameInput = document.getElementById('rsvp-name');
    const name1 = (nameInput ? nameInput.value : '').trim();
    const attendanceRadio1 = form.querySelector('input[name="attendance"]:checked');
    const attendance1 = attendanceRadio1 ? attendanceRadio1.value : 'si';
    const dietarySelect1 = document.getElementById('rsvp-dietary');
    const dietary1 = dietarySelect1 ? dietarySelect1.value : 'ninguna';
    const songInput1 = document.getElementById('rsvp-song');
    const song1 = (songInput1 ? songInput1.value : '').trim();

    // Guest 2 data (if 2 passes)
    const isTwoPasses = (invitationData && invitationData.pases === 2) || (existingConfirmation && existingConfirmation.name2);
    const nameInput2 = document.getElementById('rsvp-name-2');
    const name2 = isTwoPasses && nameInput2 ? (nameInput2.value || '').trim() : '';
    const attendanceRadio2 = form.querySelector('input[name="attendance_2"]:checked');
    const attendance2 = isTwoPasses && attendanceRadio2 ? attendanceRadio2.value : 'no';
    const dietarySelect2 = document.getElementById('rsvp-dietary-2');
    const dietary2 = isTwoPasses && dietarySelect2 ? dietarySelect2.value : 'ninguna';
    const songInput2 = document.getElementById('rsvp-song-2');
    const song2 = isTwoPasses && songInput2 ? (songInput2.value || '').trim() : '';

    // Shared message
    const messageInput = document.getElementById('rsvp-message');
    const message = (messageInput ? messageInput.value : '').trim();

    if (!name1) {
      alert('Por favor ingresa tu nombre y apellido.');
      if (nameInput) nameInput.focus();
      return false;
    }

    if (isTwoPasses && !name2 && attendance2 === 'si') {
      alert('Por favor ingresa el nombre de tu acompañante.');
      if (nameInput2) nameInput2.focus();
      return false;
    }

    // Determine total confirmed attendees
    let confirmedCount = 0;
    if (attendance1 === 'si') confirmedCount++;
    if (isTwoPasses && attendance2 === 'si') confirmedCount++;

    const isAnyAttending = (attendance1 === 'si') || (isTwoPasses && attendance2 === 'si');

    // Preserve or generate unique lucky raffle code
    const reservationCode = (existingConfirmation && existingConfirmation.code) 
      ? existingConfirmation.code 
      : ('EY-' + Math.floor(1000 + Math.random() * 9000));
      
    const displayName = (isTwoPasses && name2) ? `${name1} & ${name2}` : name1;

    const newRsvp = {
      name: name1,
      name2: isTwoPasses ? name2 : '',
      pasesCount: confirmedCount,
      attendance: isAnyAttending ? 'si' : 'no',
      attendance1: attendance1,
      attendance2: attendance2,
      dietary: dietary1,
      dietary2: isTwoPasses ? dietary2 : '',
      song: song1,
      song2: isTwoPasses ? song2 : '',
      message: message,
      code: reservationCode,
      invCode: invitationData ? invitationData.code : (existingConfirmation ? existingConfirmation.invCode : '')
    };

    existingConfirmation = newRsvp;

    // 1. Save locally
    try {
      let stored = JSON.parse(localStorage.getItem('wedding_rsvps_cloud_v1') || '[]');
      // Filter out any previous match
      stored = stored.filter(r => r.code !== reservationCode && r.name !== name1);
      stored.unshift(newRsvp);
      localStorage.setItem('wedding_rsvps_cloud_v1', JSON.stringify(stored));
      localStorage.setItem('wedding_guest_name', displayName);
      localStorage.setItem('wedding_confirmed_generic_code', reservationCode);
    } catch (err) {}

    // 2. Display appropriate response UI
    if (isAnyAttending) {
      openDigitalPass(newRsvp);
      renderAlreadyConfirmedUI(newRsvp);
    } else {
      alert(`¡Muchas gracias, ${displayName}! Hemos registrado tu respuesta. Te mandamos un abrazo gigante.`);
      renderAlreadyConfirmedUI(newRsvp);
    }

    // 3. Save to Supabase Cloud DB
    if (window.dbSupabase) {
      window.dbSupabase.saveRsvp(newRsvp).then(ok => {
        if (ok) console.log('RSVP actualizado exitosamente en Supabase');
      });
    }

    return false;
  };

  function printGuestPass() {
    const passCard = document.getElementById('pass-ticket-render');
    if (!passCard) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=520,height=750');
    if (!printWindow) {
      window.print();
      return;
    }

    const passHtml = passCard.outerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Pase de Entrada — Evelyn & Yimmy</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
        <style>
          @page {
            size: portrait;
            margin: 0;
          }
          *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #FFFFFF;
          }
          body {
            font-family: 'Montserrat', sans-serif;
            color: #243525;
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-after: avoid;
            break-after: avoid;
          }
          .pass-ticket-render {
            width: 90%;
            max-width: 420px;
            background: #FAF7F0;
            border: 2px solid #527A50;
            border-radius: 18px;
            padding: 1.4rem 1.2rem;
            text-align: center;
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-after: avoid;
            break-after: avoid;
            margin: auto;
          }
          .ticket-top { margin-bottom: 0.6rem; }
          .ticket-sub {
            font-size: 0.7rem;
            letter-spacing: 0.16em;
            color: #527A50;
            font-weight: 700;
            text-transform: uppercase;
            display: block;
          }
          .ticket-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            color: #243525;
            margin: 0.2rem 0;
          }
          .ticket-date {
            font-size: 0.72rem;
            color: #6C826D;
            font-weight: 600;
          }
          .ticket-divider-line {
            height: 1.5px;
            background: #527A50;
            opacity: 0.3;
            margin: 0.8rem 0;
          }
          .ticket-body {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            text-align: left;
            font-size: 0.82rem;
          }
          .ticket-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.15rem 0;
          }
          .t-k { font-size: 0.72rem; font-weight: 700; color: #527A50; }
          .t-v { font-weight: 600; color: #243525; font-size: 0.82rem; }
          .code-mono {
            font-family: monospace;
            background: rgba(82,122,80,0.15);
            padding: 2px 7px;
            border-radius: 5px;
            color: #243525;
          }
          .ticket-special-notice {
            margin-top: 0.9rem;
            background: rgba(82, 122, 80, 0.1);
            border: 1px dashed #527A50;
            border-radius: 10px;
            padding: 0.5rem;
            font-size: 0.78rem;
            color: #243525;
            text-align: center;
          }
          .ticket-footer-seal {
            margin-top: 0.9rem;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            color: #527A50;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${passHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
