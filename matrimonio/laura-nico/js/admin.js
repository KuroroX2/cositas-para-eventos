/**
 * LAURA & NICO — NUESTRO MATRIMONIO
 * Panel de Administración para los Novios con SUPABASE CLOUD + Datos Semilla
 * (Clave: "sakura" o "pastox" • Registro de Invitados • Generador de Links • Sorteo & Fotos)
 */

(function() {
  const ADMIN_PIN = 'sakura'; // Clave de acceso principal

  // 19 Invitaciones oficiales iniciales preparadas para el evento
  const DEFAULT_SEED_INVITATIONS = [];

  let adminRsvps = [];
  let adminInvitations = [];
  let adminPhotos = [];

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminModal);
  } else {
    initAdminModal();
  }

  
  // Función global para abrir el panel desde cualquier botón o enlace
  window.openAdminModal = function() {
    const modal = document.getElementById('admin-modal');
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.remove('active');

    if (sessionStorage.getItem('novios_logged_in') === 'true') {
      showDashboard();
    } else {
      showLoginForm();
    }
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
    }
    document.body.style.overflow = 'hidden';
  };

  window.closeAdminModal = function() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    document.body.style.overflow = '';
  };

  function initAdminModal() {
    // Delegated click listener para cualquier botón de administración
    document.addEventListener('click', function(e) {
      const target = e.target.closest('#btn-open-admin, #btn-navbar-admin, #btn-drawer-admin, .nav-btn-admin, .drawer-admin-btn, .btn-admin-access');
      if (target) {
        e.preventDefault();
        window.openAdminModal();
      }
    });

    const openBtns = [
      document.getElementById('btn-open-admin'),
      document.getElementById('btn-navbar-admin'),
      document.getElementById('btn-drawer-admin')
    ];
    const modal = document.getElementById('admin-modal');
    const closeBtn = document.getElementById('btn-close-admin');
    const loginForm = document.getElementById('admin-login-form');
    const logoutBtn = document.getElementById('btn-admin-logout');

    openBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const drawer = document.getElementById('mobile-drawer');
          if (drawer) drawer.classList.remove('active');

          if (sessionStorage.getItem('novios_logged_in') === 'true') {
            showDashboard();
          } else {
            showLoginForm();
          }
          if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
          }
          document.body.style.overflow = 'hidden';
        });
      }
    });

    const closeBtnsList = [
      document.getElementById('btn-close-admin'),
      document.getElementById('btn-close-admin-view'),
      document.getElementById('btn-close-admin-login')
    ];

    closeBtnsList.forEach(btn => {
      if (btn && modal) {
        btn.addEventListener('click', () => {
          modal.classList.remove('active');
          modal.style.display = 'none';
          document.body.style.overflow = '';
        });
      }
    });

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // Login Form: Check PIN ("sakura" o "pastox")
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pinInput = document.getElementById('admin-pin-input');
        const pin = (pinInput ? pinInput.value : '').trim().toLowerCase();
        const errEl = document.getElementById('admin-login-error');

        if (pin === ADMIN_PIN || pin === 'pastox' || pin === 'lauranico' || pin === '17102026' || pin === '2026' || pin === 'laura' || pin === 'nico') {
          sessionStorage.setItem('novios_logged_in', 'true');
          if (errEl) errEl.style.display = 'none';
          showDashboard();
        } else {
          if (errEl) {
            errEl.textContent = 'Clave incorrecta. Recuerda que la clave de los novios es "sakura" (o "pastox").';
            errEl.style.display = 'block';
          }
        }
      });
    }

    // Toggle Password Visibility
    const togglePinBtn = document.getElementById('btn-toggle-pin-visibility');
    const pinInputEl = document.getElementById('admin-pin-input');
    const iconToggle = document.getElementById('icon-toggle-pin');
    if (togglePinBtn && pinInputEl && iconToggle) {
      togglePinBtn.addEventListener('click', () => {
        const isPassword = pinInputEl.type === 'password';
        pinInputEl.type = isPassword ? 'text' : 'password';
        iconToggle.className = isPassword ? 'ri-eye-off-line' : 'ri-eye-line';
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('novios_logged_in');
        showLoginForm();
      });
    }

    // Admin Tab Navigation
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');

        if (targetId === 'admin-tab-photos') {
          renderAdminPhotos();
        }
      });
    });

    // Stat cards click shortcuts
    const statCards = [
      { sel: '.stat-card.stat-total', tab: 'admin-tab-invitations' },
      { sel: '.stat-card.stat-yes', tab: 'admin-tab-rsvps' },
      { sel: '.stat-card.stat-no', tab: 'admin-tab-rsvps' }
    ];
    statCards.forEach(({ sel, tab }) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          const btn = document.querySelector(`.admin-tab-btn[data-tab="${tab}"]`);
          if (btn) btn.click();
        });
      }
    });

    // Invitation Type toggle (1 or 2 persons)
    const invTypeSelect = document.getElementById('inv-type');
    const invName2Group = document.getElementById('inv-name-2-group');
    if (invTypeSelect && invName2Group) {
      invTypeSelect.addEventListener('change', () => {
        invName2Group.style.display = invTypeSelect.value === '2' ? 'block' : 'none';
      });
    }

    // Create invitation form submit
    const createInvForm = document.getElementById('form-create-invitation');
    if (createInvForm) {
      createInvForm.addEventListener('submit', handleCreateInvitation);
    }

    // Action buttons
    const exportBtn = document.getElementById('btn-export-rsvps-csv') || document.getElementById('btn-export-csv');
    if (exportBtn) exportBtn.addEventListener('click', exportRsvpsToCSV);

    const raffleBtn = document.getElementById('btn-print-raffle-tickets') || document.getElementById('btn-print-raffle');
    if (raffleBtn) raffleBtn.addEventListener('click', printRaffleTickets);

    const dlAllPhotosBtn = document.getElementById('btn-download-all-photos');
    if (dlAllPhotosBtn) dlAllPhotosBtn.addEventListener('click', downloadAllPhotosBulk);

    // Toggle Formulario Crear Invitación
    const toggleCreateBtn = document.getElementById('btn-toggle-create-form');
    const closeCreateBtn = document.getElementById('btn-close-create-form');
    const createBox = document.getElementById('create-invitation-box');
    const toggleCreateText = document.getElementById('btn-toggle-create-text');

    if (toggleCreateBtn && createBox) {
      toggleCreateBtn.addEventListener('click', () => {
        const isHidden = createBox.style.display === 'none' || !createBox.style.display;
        createBox.style.display = isHidden ? 'block' : 'none';
        if (toggleCreateText) {
          toggleCreateText.textContent = isHidden ? '▲ Ocultar Formulario' : '+ Registrar Nuevo Invitado';
        }
        if (isHidden) {
          const n1 = document.getElementById('inv-name-1');
          if (n1) n1.focus();
        }
      });
    }

    if (closeCreateBtn && createBox) {
      closeCreateBtn.addEventListener('click', () => {
        createBox.style.display = 'none';
        if (toggleCreateText) toggleCreateText.textContent = '+ Registrar Nuevo Invitado';
      });
    }

    // Real-time Search Filter for Invitations
    const searchInput = document.getElementById('admin-search-invitations');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterAdminInvitations(query);
      });
    }
  }

  function showLoginForm() {
    const loginView = document.getElementById('admin-login-box') || document.getElementById('admin-login-view');
    const dashView = document.getElementById('admin-dashboard') || document.getElementById('admin-dashboard-view');
    if (loginView) loginView.style.display = 'block';
    if (dashView) dashView.style.display = 'none';

    const pinInput = document.getElementById('admin-pin-input');
    if (pinInput) {
      pinInput.value = '';
      setTimeout(() => pinInput.focus(), 200);
    }
  }

  function showDashboard() {
    const loginView = document.getElementById('admin-login-box') || document.getElementById('admin-login-view');
    const dashView = document.getElementById('admin-dashboard') || document.getElementById('admin-dashboard-view');
    if (loginView) loginView.style.display = 'none';
    if (dashView) dashView.style.display = 'block';

    loadAdminCloudData();
  }

  function normalizeAdminRsvps(rawList, invs = []) {
    if (!Array.isArray(rawList)) return [];
    
    const companionsExisting = new Set();
    rawList.forEach(r => {
      if (r && r.isCompanionDeclined && r.name) {
        companionsExisting.add(r.name.trim().toLowerCase());
      }
    });

    const result = [];
    const companionsAdded = new Set(companionsExisting);

    rawList.forEach(r => {
      if (!r) return;
      if (r.name === '__DELETED__' || r.name === '__RESET_PENDING__' || r.name1 === '__DELETED__') return;

      if (r.isCompanionDeclined) {
        result.push(r);
        return;
      }

      const pGuestName = (r.name || r.name1 || '').trim();
      let compName = (r.name2 || r.originalCompanion || '').trim();

      if (!compName && (r.invCode || r.id)) {
        const inv = (invs || adminInvitations || []).find(i => i.id === (r.invCode || r.id));
        if (inv && inv.name2) compName = inv.name2.trim();
      }

      const att1 = (r.attendance1 === true || r.attendance1 === 'si' || (r.attendance === 'si' && !r.isCompanionDeclined));
      const att2 = (r.attendance2 === true || r.attendance2 === 'si');

      const isSingleAttendance = (
        r.isSingleAttendee === true ||
        (compName && (
          (att1 && !att2) ||
          r.pasesCount === 1 ||
          r.attendance2 === 'no' ||
          r.attendance2 === false
        ))
      );

      if (compName && isSingleAttendance) {
        result.push({
          ...r,
          name: pGuestName,
          name2: compName,
          originalCompanion: compName,
          attendance: 'si',
          attendance1: 'si',
          attendance2: 'no',
          pasesCount: 1,
          isSingleAttendee: true
        });

        const compKey = compName.toLowerCase();
        if (!companionsAdded.has(compKey)) {
          companionsAdded.add(compKey);
          result.push({
            id: (r.id ? r.id + '_comp' : 'manual_comp_' + Date.now()),
            name: compName,
            name2: '',
            primaryGuest: pGuestName,
            attendance: 'no',
            attendance1: 'no',
            attendance2: 'no',
            pasesCount: 0,
            dietary: 'ninguna',
            dietary2: '',
            song: '',
            song2: '',
            message: `Acompañante de ${pGuestName} (No asiste)`,
            code: r.code || r.pass_code || '—',
            invCode: r.invCode || r.invitation_id || '',
            timestamp: r.timestamp || (r.created_at ? new Date(r.created_at).getTime() : Date.now()),
            isCompanionDeclined: true
          });
        }
      } else {
        result.push(r);
      }
    });

    return result;
  }

  async function loadAdminCloudData() {
    // 1. Cargar caché local primero para respuesta instantánea (0ms)
    try {
      const localInv = localStorage.getItem('wedding_invitations_laura_nico_v1');
      if (localInv !== null) {
        adminInvitations = JSON.parse(localInv);
      } else {
        adminInvitations = [...DEFAULT_SEED_INVITATIONS];
        localStorage.setItem('wedding_invitations_laura_nico_v1', JSON.stringify(adminInvitations));
      }
      const localRsvp = localStorage.getItem('wedding_rsvps_laura_nico_v1');
      if (localRsvp !== null) {
        adminRsvps = normalizeAdminRsvps(JSON.parse(localRsvp), adminInvitations);
      }

      const localPhotos = localStorage.getItem('laura_nico_wedding_album_cache_v1') || localStorage.getItem('wedding_photos_laura_nico_v1');
      if (localPhotos !== null) adminPhotos = JSON.parse(localPhotos);
    } catch (e) {
      adminInvitations = [...DEFAULT_SEED_INVITATIONS];
    }

    renderAdminInvitations();
    renderAdminRsvps();
    renderAdminPhotos();

    // 2. Sincronizar con Supabase Cloud si está disponible
    if (window.dbSupabase) {
      try {
        const [cloudInvs, cloudRsvps, cloudPhotos] = await Promise.all([
          window.dbSupabase.getInvitations(),
          window.dbSupabase.getRsvps(),
          window.dbSupabase.getPhotos()
        ]);

        if (Array.isArray(cloudInvs)) {
          adminInvitations = cloudInvs.map(i => ({
            id: i.id,
            pases: i.pases,
            name1: i.name1,
            name2: i.name2,
            phone: i.phone,
            createdAt: new Date(i.created_at).getTime()
          }));
          localStorage.setItem('wedding_invitations_laura_nico_v1', JSON.stringify(adminInvitations));
          renderAdminInvitations();
        }

        if (Array.isArray(cloudRsvps)) {
          const rawMapped = cloudRsvps.map(r => {
            const att1 = (r.attendance1 === true || r.attendance1 === 'si');
            const att2 = (r.attendance2 === true || r.attendance2 === 'si');
            return {
              id: r.id,
              name: r.name1,
              name2: r.name2,
              attendance: (att1 || att2) ? 'si' : 'no',
              attendance1: att1 ? 'si' : 'no',
              attendance2: att2 ? 'si' : 'no',
              pasesCount: (att1 ? 1 : 0) + (att2 ? 1 : 0),
              dietary: r.dietary1,
              dietary2: r.dietary2,
              song: r.song_request,
              message: r.message,
              code: r.pass_code,
              invCode: r.invitation_id,
              timestamp: new Date(r.created_at).getTime(),
              isSingleAttendee: (att1 && !att2 && !!r.name2)
            };
          });

          adminRsvps = normalizeAdminRsvps(rawMapped, adminInvitations);
          localStorage.setItem('wedding_rsvps_laura_nico_v1', JSON.stringify(adminRsvps));
          renderAdminRsvps();
          renderAdminInvitations();
        }

        if (cloudPhotos && cloudPhotos.length > 0) {
          adminPhotos = cloudPhotos.map(p => ({
            id: p.id,
            url: p.photo_url || p.url,
            photo_url: p.photo_url || p.url,
            author: p.guest_name || p.author || 'Invitado',
            category: p.category || 'album',
            caption: p.caption || '',
            likes: p.likes_count || p.likes || 0,
            comments: p.comments || [],
            timestamp: p.created_at ? new Date(p.created_at).getTime() : Date.now()
          }));
          localStorage.setItem('laura_nico_wedding_album_cache_v1', JSON.stringify(adminPhotos));
          renderAdminPhotos();
        }
      } catch (e) {
        console.warn('Notice sync admin Supabase:', e);
      }
    }
  }

  async function handleCreateInvitation(e) {
    e.preventDefault();

    const invType = document.getElementById('inv-type').value;
    const name1 = (document.getElementById('inv-name-1').value || '').trim();
    const name2 = invType === '2' ? (document.getElementById('inv-name-2').value || '').trim() : '';
    const phone = (document.getElementById('inv-phone').value || '').trim();

    if (!name1) {
      alert('Por favor ingresa el nombre del primer invitado.');
      return;
    }

    if (invType === '2' && !name2) {
      alert('Por favor ingresa el nombre del segundo invitado (acompañante).');
      return;
    }

    const uniqueId = 'inv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);

    const newInvitation = {
      id: uniqueId,
      pases: parseInt(invType, 10),
      name1: name1,
      name2: name2,
      phone: phone,
      createdAt: Date.now()
    };

    adminInvitations.unshift(newInvitation);

    try {
      localStorage.setItem('wedding_invitations_laura_nico_v1', JSON.stringify(adminInvitations));
    } catch (err) {}

    // Save to Supabase Cloud in background
    if (window.dbSupabase) {
      window.dbSupabase.createInvitation(newInvitation).catch(() => {});
    }

    // Reset form
    document.getElementById('form-create-invitation').reset();
    const invName2Group = document.getElementById('inv-name-2-group');
    if (invName2Group) invName2Group.style.display = 'none';

    renderAdminInvitations();
    alert(`¡Invitación creada con éxito para ${name1}${name2 ? ' y ' + name2 : ''}! Ya puedes copiar el link personalizado para enviárselo por WhatsApp.`);
  }

  function generatePersonalizedUrl(inv) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseOrigin = isLocal ? window.location.origin : 'https://cositasparaeventos.cl';
    const basePath = '/matrimonio/laura-nico/';
    const params = new URLSearchParams();
    params.set('p', inv.pases);
    params.set('n1', inv.name1);
    if (inv.name2) params.set('n2', inv.name2);
    params.set('code', inv.id);
    return `${baseOrigin}${basePath}?${params.toString()}`;
  }

  function getAttendanceMode(r) {
    if (!r) return 'pending';
    if (r.isCompanionDeclined) return 'none';
    const att1 = (r.attendance1 === true || r.attendance1 === 'si' || r.attendance === 'si');
    const att2 = (r.attendance2 === true || r.attendance2 === 'si');
    if (att1 && att2) return 'both';
    if (att1 && !att2) {
      if (r.originalCompanion || r.isSingleAttendee || r.name2 || r.pasesCount === 2 || r.pases === 2) return 'single';
      return 'both';
    }
    return 'none';
  }

  function filterAdminInvitations(query) {
    const tbody = document.getElementById('admin-invitations-tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (!query || text.includes(query)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  function renderAdminInvitations() {
    const tbody = document.getElementById('admin-invitations-tbody');
    const countInvEl = document.getElementById('admin-count-invitations');

    let totalPeopleInv = 0;
    adminInvitations.forEach(inv => {
      const p = parseInt(inv.pases, 10) || (inv.name2 ? 2 : 1);
      totalPeopleInv += p;
    });

    if (countInvEl) {
      countInvEl.innerHTML = `<strong>${adminInvitations.length}</strong> inv. (<strong>${totalPeopleInv}</strong> pers.)`;
    }
    if (!tbody) return;

    if (adminInvitations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #888;">
            Aún no has registrado invitados. Completa el formulario de arriba para generar sus links personalizados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = adminInvitations.map((inv, idx) => {
      const existingRsvp = adminRsvps.find(r => (r.invCode && r.invCode === inv.id) || (r.name && r.name.toLowerCase().trim() === inv.name1.toLowerCase().trim()));
      const isTwoPasses = (inv.pases === 2 || !!inv.name2);
      const currentMode = existingRsvp ? getAttendanceMode(existingRsvp) : 'pending';

      const link = generatePersonalizedUrl(inv);
      const namesDisplay = inv.name2 ? `${escapeHtml(inv.name1)} &amp; ${escapeHtml(inv.name2)}` : escapeHtml(inv.name1);

      let selectOptions = '';
      let statusBadge = '';

      if (isTwoPasses) {
        selectOptions = `
          <option value="pending" ${currentMode === 'pending' ? 'selected' : ''}>⏳ Pendiente</option>
          <option value="both" ${currentMode === 'both' ? 'selected' : ''}>✅ Asisten (2 Pases)</option>
          <option value="single" ${currentMode === 'single' ? 'selected' : ''}>👤 Asiste Solo 1 (Acomp. No Asiste)</option>
          <option value="none" ${currentMode === 'none' ? 'selected' : ''}>❌ No Asiste (0 Pases)</option>
        `;
        if (currentMode === 'both') {
          statusBadge = '<span class="badge-status status-yes" style="border-radius: 50px; font-weight: 700;">🟢 2 Pases</span>';
        } else if (currentMode === 'single') {
          statusBadge = '<span class="badge-status" style="background: #e8f5e9; color: #2e7d32; border-radius: 50px; font-weight: 700; border: 1.5px solid #27ae60;">🟢 1 Asiste • 🔴 1 No Asiste</span>';
        } else if (currentMode === 'none') {
          statusBadge = '<span class="badge-status status-no" style="border-radius: 50px; font-weight: 700;">🔴 0 Pases (No Asiste)</span>';
        } else {
          statusBadge = '<span class="badge-status status-pending" style="border-radius: 50px;">⏳ 2 Pases Reservados</span>';
        }
      } else {
        selectOptions = `
          <option value="pending" ${currentMode === 'pending' ? 'selected' : ''}>⏳ Pendiente</option>
          <option value="both" ${currentMode === 'both' ? 'selected' : ''}>✅ Sí Asiste (1 Pase)</option>
          <option value="none" ${currentMode === 'none' ? 'selected' : ''}>❌ No Asiste (0 Pases)</option>
        `;
        if (currentMode === 'both') {
          statusBadge = '<span class="badge-status status-yes" style="border-radius: 50px; font-weight: 700;">🟢 1 Pase (Asiste)</span>';
        } else if (currentMode === 'none') {
          statusBadge = '<span class="badge-status status-no" style="border-radius: 50px; font-weight: 700;">🔴 0 Pases (No Asiste)</span>';
        } else {
          statusBadge = '<span class="badge-status status-pending" style="border-radius: 50px;">⏳ 1 Pase Reservado</span>';
        }
      }

      const isPlural = !!inv.name2;
      const greeting = isPlural ? `¡Hola ${inv.name1} y ${inv.name2}!` : `¡Hola ${inv.name1}!`;
      const verb = isPlural ? 'invitarlos' : 'invitarte';
      const waitVerb = isPlural ? '¡Los esperamos con todo nuestro cariño y honor!' : '¡Te esperamos con todo nuestro cariño y honor!';

      const waMsg = `${greeting} 🌸\nCon muchísima alegría queremos ${verb} a nuestro matrimonio en el Jardín Botánico & Casona Sakura el sábado 17 de octubre de 2026.\n\nAquí tienes tu invitación oficial con tus pases reservados:\n${link}\n\n${waitVerb}\n— Laura & Nico (結び)`;

      let cleanPhone = (inv.phone || '').replace(/\D/g, '');
      if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
        cleanPhone = '56' + cleanPhone;
      } else if (cleanPhone.length === 8 && cleanPhone.startsWith('9')) {
        cleanPhone = '56' + cleanPhone;
      }

      const waUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}` 
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;

      const borderColor = (currentMode === 'both' || currentMode === 'single') ? '#27ae60' : currentMode === 'none' ? '#e74c3c' : '#bdc3c7';
      const textColor = (currentMode === 'both' || currentMode === 'single') ? '#27ae60' : currentMode === 'none' ? '#c0392b' : '#666';

      return `
        <tr>
          <td style="font-weight: 700;">
            ${idx + 1}. ${namesDisplay}
            ${inv.phone ? `<br><small style="color: #666; font-weight: normal;"><i class="ri-whatsapp-line"></i> ${escapeHtml(inv.phone)}</small>` : ''}
          </td>
          <td class="col-pases">${statusBadge}</td>
          <td class="col-status">
            <select class="admin-inv-status-select" data-id="${inv.id}" data-name1="${escapeHtml(inv.name1)}" data-name2="${escapeHtml(inv.name2 || '')}" data-pases="${inv.pases}" style="padding: 0.2rem 0.65rem; border-radius: 50px; font-size: 0.78rem; font-weight: 700; border: 1.5px solid ${borderColor}; color: ${textColor}; background: #FFFFFF; cursor: pointer; height: 34px; line-height: 1.4; vertical-align: middle;">
              ${selectOptions}
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="btn-dl-single" style="background: #25D366; color: #fff; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700;">
                <i class="ri-whatsapp-line"></i> <span>WhatsApp</span>
              </a>
              <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="btn-dl-single btn-view-invitation" data-url="${escapeHtml(link)}" style="background: #527A50; color: #fff; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700;">
                <i class="ri-external-link-line"></i> <span>Ver Invitación</span>
              </a>
            </div>
          </td>
          <td style="text-align: center;">
            <button class="btn-del-inv" data-id="${inv.id}" title="Eliminar invitación" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.15rem; padding: 0.35rem; transition: transform 0.2s ease;">
              <i class="ri-delete-bin-line"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.admin-inv-status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const invId = sel.getAttribute('data-id');
        const newMode = sel.value;
        const name1 = sel.getAttribute('data-name1');
        const name2 = sel.getAttribute('data-name2');
        const pases = parseInt(sel.getAttribute('data-pases') || '1', 10);

        if (newMode === 'pending') {
          adminRsvps = adminRsvps.filter(r => r.invCode !== invId && r.name !== name1 && r.name !== name2);
          if (window.dbSupabase) await window.dbSupabase.deleteRsvpFromCloud(invId, invId, null, name1);
        } else {
          const isBoth = (newMode === 'both');
          const isSingle = (newMode === 'single');
          const isNone = (newMode === 'none');

          const existingR = adminRsvps.find(r => r.invCode === invId || r.name === name1);
          const code = existingR ? existingR.code : ('LN-' + Math.floor(1000 + Math.random() * 9000));
          
          const updatedR = {
            id: existingR ? existingR.id : ('manual_' + Date.now()),
            name: name1,
            name2: name2 || '',
            originalCompanion: name2 || '',
            pasesCount: isBoth ? pases : (isSingle ? 1 : 0),
            attendance: isNone ? 'no' : 'si',
            attendance1: (isBoth || isSingle) ? 'si' : 'no',
            attendance2: isBoth && (pases === 2 || !!name2) ? 'si' : 'no',
            dietary: existingR ? existingR.dietary : 'ninguna',
            dietary2: existingR ? existingR.dietary2 : 'ninguna',
            song: existingR ? existingR.song : '',
            song2: existingR ? existingR.song2 : '',
            message: existingR ? existingR.message : '',
            code: code,
            invCode: invId,
            timestamp: Date.now(),
            isSingleAttendee: isSingle
          };

          adminRsvps = adminRsvps.filter(r => r.invCode !== invId && r.name !== name1 && r.name !== name2);
          adminRsvps.unshift(updatedR);

          // Si asiste solo 1 pero la invitación tenía acompañante, registrar al acompañante como NO ASISTE
          if (isSingle && name2) {
            const compR = {
              id: (existingR ? existingR.id : ('manual_' + Date.now())) + '_comp',
              name: name2,
              name2: '',
              primaryGuest: name1,
              pasesCount: 0,
              attendance: 'no',
              attendance1: 'no',
              attendance2: 'no',
              dietary: 'ninguna',
              dietary2: '',
              song: '',
              song2: '',
              message: `Acompañante de ${name1} (No asiste)`,
              code: code || '—',
              invCode: invId,
              timestamp: Date.now(),
              isCompanionDeclined: true
            };
            adminRsvps.push(compR);
          }

          if (window.dbSupabase) {
            await window.dbSupabase.updateRsvpAttendanceManual(invId, newMode, name1, name2, pases);
          }
        }

        try {
          localStorage.setItem('wedding_rsvps_laura_nico_v1', JSON.stringify(adminRsvps));
        } catch (e) {}

        renderAdminInvitations();
        renderAdminRsvps();
      });
    });

    tbody.querySelectorAll('.btn-view-invitation').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const url = btn.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank');
        }
      });
    });

    tbody.querySelectorAll('.btn-del-inv').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar esta invitación?')) {
          adminInvitations = adminInvitations.filter(i => i.id !== id);
          adminRsvps = adminRsvps.filter(r => r.invCode !== id);

          if (window.dbSupabase) {
            try {
              await Promise.all([
                window.dbSupabase.deleteInvitationFromCloud(id),
                window.dbSupabase.deleteRsvpFromCloud(null, id)
              ]);
            } catch (e) {
              console.warn('Error borrando en Supabase:', e);
            }
          }

          try {
            localStorage.setItem('wedding_invitations_laura_nico_v1', JSON.stringify(adminInvitations));
            localStorage.setItem('wedding_rsvps_laura_nico_v1', JSON.stringify(adminRsvps));
          } catch (e) {}
          renderAdminInvitations();
          renderAdminRsvps();
        }
      });
    });
  }

  function isInvitationConfirmed(inv) {
    if (!inv || !inv.id) return false;
    return adminRsvps.some(r => r.invCode === inv.id);
  }

  function renderAdminRsvps() {
    adminRsvps = normalizeAdminRsvps(adminRsvps, adminInvitations);
    const countYesEl = document.getElementById('admin-count-yes');
    const countNoEl = document.getElementById('admin-count-no');
    const tableBody = document.getElementById('admin-rsvps-tbody');

    const confirmedBoth = adminRsvps.filter(r => getAttendanceMode(r) === 'both');
    const confirmedSingle = adminRsvps.filter(r => getAttendanceMode(r) === 'single');
    const notAttending = adminRsvps.filter(r => getAttendanceMode(r) === 'none');

    let totalPeopleYes = 0;
    confirmedBoth.forEach(r => {
      totalPeopleYes += (r.name2 ? 2 : 1);
    });
    confirmedSingle.forEach(r => {
      totalPeopleYes += 1;
    });

    const totalConfirmations = confirmedBoth.length + confirmedSingle.length;

    let totalPeopleNo = 0;
    notAttending.forEach(r => {
      totalPeopleNo += (r.name2 && !r.isCompanionDeclined ? 2 : 1);
    });

    if (countYesEl) countYesEl.innerHTML = `<strong>${totalConfirmations}</strong> reg. (<strong>${totalPeopleYes}</strong> pers.)`;
    if (countNoEl) {
      if (notAttending.length === 0) {
        countNoEl.innerHTML = `<strong>0</strong>`;
      } else {
        countNoEl.innerHTML = `<strong>${notAttending.length}</strong> reg. (<strong>${totalPeopleNo}</strong> pers.)`;
      }
    }

    if (!tableBody) return;

    if (adminRsvps.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2rem; color: #888;">
            Aún no hay confirmaciones registradas.
          </td>
        </tr>
      `;
      return;
    }

    const sorted = [...adminRsvps].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    tableBody.innerHTML = sorted.map((r, index) => {
      const mode = getAttendanceMode(r);
      const isTwoPasses = !!(r.name2 && !r.isCompanionDeclined);
      const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('es-CL', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      }) : '—';

      let namesShow = escapeHtml(r.name);
      if (r.isCompanionDeclined) {
        namesShow = `${escapeHtml(r.name)} <span class="badge-status status-no" style="font-size: 0.68rem; margin-left: 4px; border-radius: 50px; font-weight: 700;">(No Asiste)</span><br><small style="color: #777;">Acompañante de ${escapeHtml(r.primaryGuest || '')}</small>`;
      } else if (r.isSingleAttendee || mode === 'single') {
        namesShow = `${escapeHtml(r.name)} <span class="badge-status status-yes" style="font-size: 0.68rem; margin-left: 4px; border-radius: 50px; font-weight: 700;">(Asiste Solo)</span>${(r.originalCompanion || r.name2) ? `<br><small style="color: #c0392b; font-weight: 600;">👥 Acomp.: ${escapeHtml(r.originalCompanion || r.name2)} (No asiste)</small>` : ''}`;
      } else if (r.name2) {
        namesShow = `${escapeHtml(r.name)} &amp; ${escapeHtml(r.name2)}`;
      }

      let pasesBadge = '';
      if (r.isCompanionDeclined || mode === 'none') {
        pasesBadge = `<span class="badge-status status-no" style="font-weight: 700; border-radius: 50px;">🔴 0 Personas (No Asiste)</span>`;
      } else if (mode === 'single') {
        pasesBadge = `<span class="badge-status" style="background: #e8f5e9; color: #2e7d32; font-weight: 700; border-radius: 50px; border: 1px solid #27ae60;">🟢 1 Persona (Asiste)</span>`;
      } else if (mode === 'both') {
        pasesBadge = `<span class="badge-status status-yes" style="font-weight: 700; border-radius: 50px;">🟢 ${isTwoPasses ? '2 Personas' : '1 Persona'}</span>`;
      }

      let selectOptions = '';
      if (r.isCompanionDeclined) {
        selectOptions = `
          <option value="none" selected>❌ No Asiste (0 Pases)</option>
          <option value="both">✅ Cambiar: Asisten Ambos</option>
        `;
      } else if (isTwoPasses || r.isSingleAttendee || r.originalCompanion) {
        selectOptions = `
          <option value="both" ${mode === 'both' ? 'selected' : ''}>✅ Asisten (2 Pases)</option>
          <option value="single" ${mode === 'single' ? 'selected' : ''}>👤 Asiste Solo 1 (Acomp. No Asiste)</option>
          <option value="none" ${mode === 'none' ? 'selected' : ''}>❌ No Asiste (0 Pases)</option>
        `;
      } else {
        selectOptions = `
          <option value="both" ${mode === 'both' ? 'selected' : ''}>✅ Sí Asiste (1 Pase)</option>
          <option value="none" ${mode === 'none' ? 'selected' : ''}>❌ No Asiste (0 Pases)</option>
        `;
      }

      const borderColor = (mode === 'both' || mode === 'single') ? '#27ae60' : '#e74c3c';
      const textColor = (mode === 'both' || mode === 'single') ? '#27ae60' : '#c0392b';

      let songsDisplay = '—';
      if (r.song && r.song2) {
        songsDisplay = `<span style="display:block;"><strong>1:</strong> ${escapeHtml(r.song)}</span><span style="display:block; margin-top: 2px;"><strong>2:</strong> ${escapeHtml(r.song2)}</span>`;
      } else if (r.song) {
        songsDisplay = escapeHtml(r.song);
      } else if (r.song2) {
        songsDisplay = escapeHtml(r.song2);
      }

      return `
        <tr>
          <td style="font-weight: 700;">${index + 1}. ${namesShow}</td>
          <td class="col-status">
            <select class="admin-rsvp-status-select" data-id="${r.id || r.code}" data-name1="${escapeHtml(r.name)}" data-name2="${escapeHtml(r.name2 || r.originalCompanion || '')}" data-inv="${r.invCode || ''}" style="padding: 0.2rem 0.65rem; border-radius: 50px; font-size: 0.78rem; font-weight: 700; border: 1.5px solid ${borderColor}; color: ${textColor}; background: #FFFFFF; cursor: pointer; height: 34px; line-height: 1.4; vertical-align: middle;">
              ${selectOptions}
            </select>
          </td>
          <td class="col-pases">${pasesBadge}</td>
          <td style="text-align: center;"><strong class="code-tag">${escapeHtml(r.code || 'LN-0000')}</strong></td>
          <td>
            <small>${escapeHtml(r.dietary && r.dietary !== 'ninguna' ? r.dietary : 'Tradicional')}${r.dietary2 && r.dietary2 !== 'ninguna' ? ' / ' + escapeHtml(r.dietary2) : ''}</small>
          </td>
          <td><small>${songsDisplay}</small></td>
          <td class="cell-message" title="${escapeHtml(r.message || '')}">
            <small>${escapeHtml(r.message || '—')}</small>
          </td>
          <td style="text-align: center;"><small style="color: #777;">${dateStr}</small></td>
          <td style="text-align: center;">
            <button class="btn-del-rsvp" data-id="${r.id || ''}" data-inv="${r.invCode || ''}" data-code="${r.code || ''}" data-name1="${escapeHtml(r.name)}" title="Eliminar confirmación" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.15rem; padding: 0.35rem; transition: transform 0.2s ease;">
              <i class="ri-delete-bin-line"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('.admin-rsvp-status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const idOrCode = sel.getAttribute('data-id');
        const newMode = sel.value;
        const invId = sel.getAttribute('data-inv');
        const name1 = sel.getAttribute('data-name1');
        const name2 = sel.getAttribute('data-name2');

        const r = adminRsvps.find(x => (x.id && x.id === idOrCode) || (x.code && x.code === idOrCode) || (x.name && x.name === name1));
        if (r) {
          const isBoth = (newMode === 'both');
          const isSingle = (newMode === 'single');
          const isNone = (newMode === 'none');

          r.attendance = isNone ? 'no' : 'si';
          r.attendance1 = (isBoth || isSingle) ? 'si' : 'no';
          r.attendance2 = (isBoth && (r.name2 || name2)) ? 'si' : 'no';
          r.pasesCount = isBoth ? (r.name2 || name2 ? 2 : 1) : (isSingle ? 1 : 0);
          r.isSingleAttendee = isSingle;

          // Si cambió a single y tiene acompañante, registrar al acompañante como no asistente
          if (isSingle && (name2 || r.name2 || r.originalCompanion)) {
            const compName = name2 || r.name2 || r.originalCompanion;
            r.originalCompanion = compName;
            const existingComp = adminRsvps.find(x => x.name === compName && x.isCompanionDeclined);
            if (!existingComp) {
              adminRsvps.push({
                id: (r.id || 'manual_' + Date.now()) + '_comp',
                name: compName,
                name2: '',
                primaryGuest: r.name,
                pasesCount: 0,
                attendance: 'no',
                attendance1: 'no',
                attendance2: 'no',
                dietary: 'ninguna',
                dietary2: '',
                song: '',
                song2: '',
                message: `Acompañante de ${r.name} (No asiste)`,
                code: r.code || '—',
                invCode: r.invCode || invId,
                timestamp: Date.now(),
                isCompanionDeclined: true
              });
            }
          } else if (isBoth || isNone) {
            const compName = name2 || r.name2 || r.originalCompanion;
            if (compName) {
              adminRsvps = adminRsvps.filter(x => !(x.name === compName && x.isCompanionDeclined));
            }
          }
          
          if (window.dbSupabase) {
            await window.dbSupabase.updateRsvpAttendanceManual(r.invCode || r.code || invId, newMode, r.name, r.name2, r.name2 ? 2 : 1);
          }
          try {
            localStorage.setItem('wedding_rsvps_laura_nico_v1', JSON.stringify(adminRsvps));
          } catch (e) {}
          renderAdminRsvps();
          renderAdminInvitations();
        }
      });
    });

    tableBody.querySelectorAll('.btn-del-rsvp').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const invId = btn.getAttribute('data-inv');
        const code = btn.getAttribute('data-code');
        const name1 = btn.getAttribute('data-name1');

        if (confirm('¿Seguro que deseas eliminar esta confirmación?')) {
          adminRsvps = adminRsvps.filter(r => {
            if (id && r.id === id) return false;
            if (code && r.code === code) return false;
            if (invId && r.invCode === invId) return false;
            if (name1 && (r.name === name1 || r.primaryGuest === name1)) return false;
            return true;
          });

          if (window.dbSupabase) {
            try {
              await window.dbSupabase.deleteRsvpFromCloud(id, invId, code, name1);
            } catch (e) {
              console.warn('Error eliminando RSVP de Supabase:', e);
            }
          }

          try {
            localStorage.setItem('wedding_rsvps_laura_nico_v1', JSON.stringify(adminRsvps));
          } catch (e) {}

          renderAdminRsvps();
          renderAdminInvitations();
        }
      });
    });
  }

  function exportRsvpsToCSV() {
    if (adminRsvps.length === 0) {
      alert('No hay confirmaciones para exportar.');
      return;
    }

    const headers = ['Nombre_1', 'Nombre_2', 'Estado_Asistencia', 'Pases_Confirmados', 'Codigo_Pase', 'Menu_1', 'Menu_2', 'Cancion_1', 'Cancion_2', 'Mensaje_Dedicatoria', 'Fecha_Registro'];
    const rows = adminRsvps.map(r => {
      const mode = getAttendanceMode(r);
      let estadoTxt = 'NO ASISTE';
      if (r.isCompanionDeclined) estadoTxt = 'NO ASISTE (ACOMPAÑANTE)';
      else if (mode === 'both') estadoTxt = r.name2 ? 'ASISTEN (2 PASES)' : 'ASISTE (1 PASE)';
      else if (mode === 'single') estadoTxt = 'ASISTE SOLO 1 (ACOMPAÑANTE NO ASISTE)';

      const pases = (mode === 'both') ? (r.name2 ? 2 : 1) : (mode === 'single' ? 1 : 0);

      return [
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.name2 || (r.primaryGuest ? 'Acomp. de ' + r.primaryGuest : '')).replace(/"/g, '""')}"`,
        `"${estadoTxt}"`,
        pases,
        `"${r.code || ''}"`,
        `"${(r.dietary || '').replace(/"/g, '""')}"`,
        `"${(r.dietary2 || '').replace(/"/g, '""')}"`,
        `"${(r.song || '').replace(/"/g, '""')}"`,
        `"${(r.song2 || '').replace(/"/g, '""')}"`,
        `"${(r.message || '').replace(/"/g, '""')}"`,
        r.timestamp ? new Date(r.timestamp).toLocaleString('es-CL') : ''
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Confirmados_Matrimonio_Laura_y_Nico_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printRaffleTickets() {
    const confirmedYes = adminRsvps.filter(r => getAttendanceMode(r) === 'both' || getAttendanceMode(r) === 'single');
    if (confirmedYes.length === 0) {
      alert('No hay invitados confirmados para generar cupones de sorteo.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes para imprimir los cupones.');
      return;
    }

    const ticketsHtml = confirmedYes.map(r => {
      const mode = getAttendanceMode(r);
      let namesText = escapeHtml(r.name);
      if (r.name2) {
        if (mode === 'both') {
          namesText = `${escapeHtml(r.name)} & ${escapeHtml(r.name2)}`;
        } else {
          namesText = `${escapeHtml(r.name)} (Pase Individual)`;
        }
      }

      return `
        <div class="raffle-ticket" style="border: 2px solid #D4AF37; border-radius: 14px; padding: 1.2rem; text-align: center; page-break-inside: avoid; background: #FAF7F2; position: relative;">
          <div class="ticket-brand" style="color: #D81B60; font-weight: 700; letter-spacing: 0.12em; font-size: 0.78rem;">🌸 MATRIMONIO LAURA & NICO • SORTEO 結び</div>
          <div class="ticket-guest-name" style="font-family: 'Playfair Display', serif; font-size: 1.45rem; color: #1A233A; margin: 0.4rem 0; font-weight: 700;">${namesText}</div>
          <div class="ticket-code-box" style="margin: 0.5rem 0; font-size: 0.88rem; color: #5A6578;">CÓDIGO DE PASE: <strong style="color: #D81B60; font-family: monospace; font-size: 1.15rem; background: rgba(216, 27, 96, 0.1); padding: 3px 9px; border-radius: 5px;">${escapeHtml(r.code || 'LN-0000')}</strong></div>
          <div class="ticket-foot" style="font-size: 0.74rem; color: #5A6578; margin-top: 0.4rem;">17 de Octubre de 2026 • Jardín Botánico & Casona Sakura 🎁</div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Cupones de Sorteo — Laura & Nico 🌸</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: letter portrait; margin: 10mm; }
          body { font-family: 'Montserrat', Arial, sans-serif; background: #fff; margin: 0; padding: 10px; color: #1A233A; }
          h2 { text-align: center; margin-bottom: 5px; color: #1A233A; }
          p.sub { text-align: center; font-size: 13px; color: #5A6578; margin-bottom: 20px; }
          .raffle-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;" class="no-print">
          <h2>Cupones para Sorteo — Laura & Nico 🌸</h2>
          <p class="sub">Total cupones generados: <strong>${confirmedYes.length}</strong></p>
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 15px; background: #D81B60; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">🖨️ Imprimir Cupones</button>
        </div>
        <div class="raffle-grid">
          ${ticketsHtml}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  window.downloadAdminPhoto = async function(url, filename) {
    if (!url) return;
    try {
      if (url.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'Foto_Boda_Laura_Nico.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'Foto_Boda_Laura_Nico.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename || 'Foto_Boda_Laura_Nico.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  function renderAdminPhotos() {
    const grid = document.getElementById('admin-photos-grid');
    if (!grid) return;

    const photos = (adminPhotos && adminPhotos.length > 0) ? adminPhotos : (window.weddingPhotos || []);
    if (photos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: #6C826D; padding: 3rem 1.5rem; background: rgba(82,122,80,0.05); border: 1.5px dashed rgba(82,122,80,0.25); border-radius: 16px;">
          <i class="ri-image-2-line" style="font-size: 2.5rem; color: #527A50; display: block; margin-bottom: 0.5rem;"></i>
          <h4 style="font-family: var(--font-serif); font-size: 1.2rem; color: #243525; margin-bottom: 0.3rem;">Aún no se han subido fotos al álbum</h4>
          <p style="font-size: 0.85rem; margin: 0;">Las fotos que suban los invitados aparecerán aquí y podrán ser descargadas individualmente o todas juntas en ZIP.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = photos.map((p, idx) => {
      const photoUrl = p.url || p.photo_url || '';
      const author = p.author || p.guest_name || 'Invitado';
      const category = p.category || 'Álbum';
      const fileName = `Foto_${String(idx + 1).padStart(2, '0')}_${author.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;

      return `
        <div class="admin-photo-card">
          <img src="${escapeHtml(photoUrl)}" alt="Foto por ${escapeHtml(author)}" loading="lazy">
          <div class="admin-photo-info">
            <span class="admin-photo-author">#${idx + 1} • ${escapeHtml(author)}</span>
            <span class="admin-photo-cat">${escapeHtml(category)}</span>
            <span class="admin-photo-likes">❤️ ${p.likes || 0} Me Gusta | 💬 ${(p.comments || []).length} comentarios</span>
            <button type="button" class="btn-dl-single" onclick="downloadAdminPhoto('${escapeHtml(photoUrl)}', '${escapeHtml(fileName)}')">
              <i class="ri-download-2-line"></i> Descargar Foto
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function downloadAllPhotosBulk() {
    const photos = (adminPhotos && adminPhotos.length > 0) ? adminPhotos : (window.weddingPhotos || []);
    if (photos.length === 0) {
      alert('Aún no hay fotos subidas para descargar.');
      return;
    }

    const btn = document.getElementById('btn-download-all-photos');
    const originalText = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> <span>Empaquetando ${photos.length} fotos en ZIP (0%)...</span>`;
    }

    try {
      if (typeof window.JSZip === 'function') {
        const zip = new window.JSZip();
        const folder = zip.folder('Fotos_Matrimonio_Laura_Nico_2026');

        for (let i = 0; i < photos.length; i++) {
          const p = photos[i];
          const url = p.url || p.photo_url || '';
          const author = (p.author || p.guest_name || 'Invitado').replace(/[^a-zA-Z0-9_-]/g, '_');
          const fileName = `${String(i + 1).padStart(2, '0')}_${author}_${p.category || 'album'}.jpg`;

          if (btn) {
            const percent = Math.round(((i + 1) / photos.length) * 85);
            btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> <span>Procesando foto ${i + 1} de ${photos.length} (${percent}%)...</span>`;
          }

          if (url.startsWith('data:image')) {
            const base64Data = url.split(',')[1];
            if (base64Data) folder.file(fileName, base64Data, { base64: true });
          } else if (url.startsWith('http')) {
            try {
              const resp = await fetch(url);
              const blob = await resp.blob();
              folder.file(fileName, blob);
            } catch (fetchErr) {
              console.warn('Fetch photo notice:', fetchErr);
            }
          }
        }

        if (btn) {
          btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> <span>Comprimiendo archivo ZIP final...</span>`;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `Fotos_Matrimonio_Laura_Nico_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(zipUrl), 3000);

        alert(`¡Descarga lista! Se ha descargado el archivo ZIP con todas las ${photos.length} fotos del matrimonio.`);
      } else {
        // Fallback secuencial
        photos.forEach((p, idx) => {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = p.url || p.photo_url || '';
            link.download = `Boda_Laura_Nico_${idx + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, idx * 300);
        });
      }
    } catch (err) {
      console.error('Error generando ZIP:', err);
      alert('Ocurrió un detalle al generar el ZIP. Por favor intenta nuevamente.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
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
