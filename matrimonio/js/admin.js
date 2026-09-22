/**
 * EVELYN & YIMMY — NUESTRO MATRIMONIO
 * Panel de Administración para los Novios con SUPABASE CLOUD + Datos Semilla
 * (Clave: "pastox" • Registro de Invitados • Generador de Links • Sorteo & Fotos)
 */

(function() {
  const ADMIN_PIN = 'pastox'; // Clave de acceso

  // 19 Invitaciones oficiales iniciales migradas desde el proyecto original
  const DEFAULT_SEED_INVITATIONS = [
    { id: "inv_mt8t3dh4_mdcy", pases: 2, name1: "Roberto", name2: "Acompañante", phone: "+56 9 9411 6173", createdAt: 1787670893560 },
    { id: "inv_mt7agi0j_r812", pases: 1, name1: "Karen", name2: "", phone: "+56 9 6483 3883", createdAt: 1787579127091 },
    { id: "inv_mt7agb8r_yhi2", pases: 1, name1: "Sandra", name2: "", phone: "+56 9 9057 6025", createdAt: 1787579118315 },
    { id: "inv_mt7ag1bu_s3mf", pases: 1, name1: "Jhankhel", name2: "", phone: "+56 9 8142 5746", createdAt: 1787579105466 },
    { id: "inv_mt7afpe6_kfg4", pases: 1, name1: "Yorka", name2: "", phone: "+1 (514) 570-0368", createdAt: 1787579089998 },
    { id: "inv_mt7afe11_3wr0", pases: 2, name1: "Pamela", name2: "Marcial", phone: "+56 9 9352 5595", createdAt: 1787579075269 },
    { id: "inv_mt7af2wd_bc93", pases: 1, name1: "Constanza", name2: "", phone: "+56 9 5003 1547", createdAt: 1787579060845 },
    { id: "inv_mt7aerri_0o4h", pases: 1, name1: "Cecilia", name2: "", phone: "+56 9 5778 7316", createdAt: 1787579046414 },
    { id: "inv_mt7aefqb_ewjp", pases: 1, name1: "Barbara", name2: "", phone: "+56 9 8982 8672", createdAt: 1787579030819 },
    { id: "inv_mt7ae4tr_3c2o", pases: 1, name1: "Claudia", name2: "", phone: "+56 9 7850 6319", createdAt: 1787579016687 },
    { id: "inv_mt7ado96_pjjz", pases: 2, name1: "Camila", name2: "Tah", phone: "+61 451 471 901", createdAt: 1787578995210 },
    { id: "inv_mt7ad2wi_m84w", pases: 2, name1: "Daniela", name2: "Hugo", phone: "+56 9 6210 8586", createdAt: 1787578967538 },
    { id: "inv_mt7acqee_bjth", pases: 2, name1: "Jessica", name2: "Eduardo", phone: "+56 9 5524 3357", createdAt: 1787578951334 },
    { id: "inv_mt7ac5s2_2ko9", pases: 2, name1: "Cristopher", name2: "Reny", phone: "+56 9 9138 1368", createdAt: 1787578924610 },
    { id: "inv_mt7abo4o_ixxm", pases: 2, name1: "Carlos", name2: "Carola", phone: "+56 9 2197 6137", createdAt: 1787578901736 },
    { id: "inv_mt79v1i5_fj7j", pases: 2, name1: "Felipe", name2: "Camila", phone: "+56 9 9588 8834", createdAt: 1787578125917 },
    { id: "inv_mt79ukht_iqcm", pases: 2, name1: "Guisselle", name2: "Nicolas", phone: "+56 9 3269 8863", createdAt: 1787578103873 },
    { id: "inv_mt79u2qe_of3f", pases: 2, name1: "Jaqueline", name2: "Luis", phone: "+56 9 8612 9593", createdAt: 1787578080854 },
    { id: "inv_mt797yfq_46ak", pases: 2, name1: "Isaac", name2: "Denisse", phone: "+56 9 6169 7185", createdAt: 1787577048854 }
  ];

  let adminRsvps = [];
  let adminInvitations = [];
  let adminPhotos = [];

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminModal);
  } else {
    initAdminModal();
  }

  function initAdminModal() {
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

    // Login Form: Check PIN "pastox"
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pinInput = document.getElementById('admin-pin-input');
        const pin = (pinInput ? pinInput.value : '').trim().toLowerCase();
        const errEl = document.getElementById('admin-login-error');

        if (pin === ADMIN_PIN || pin === '21112026' || pin === '2026' || pin === 'eveyimmy') {
          sessionStorage.setItem('novios_logged_in', 'true');
          if (errEl) errEl.style.display = 'none';
          showDashboard();
        } else {
          if (errEl) {
            errEl.textContent = 'Clave incorrecta. Recuerda que la clave de los novios es "pastox".';
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

  async function loadAdminCloudData() {
    // 1. Cargar caché local primero para respuesta instantánea (0ms)
    try {
      const localInv = localStorage.getItem('wedding_invitations_cloud_v1');
      if (localInv !== null) {
        adminInvitations = JSON.parse(localInv);
      } else {
        adminInvitations = [...DEFAULT_SEED_INVITATIONS];
        localStorage.setItem('wedding_invitations_cloud_v1', JSON.stringify(adminInvitations));
      }
      const localRsvp = localStorage.getItem('wedding_rsvps_cloud_v1');
      if (localRsvp !== null) adminRsvps = JSON.parse(localRsvp);

      const localPhotos = localStorage.getItem('eve_yimmy_wedding_album_cache_v9') || localStorage.getItem('wedding_photos_cloud_v1');
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
          localStorage.setItem('wedding_invitations_cloud_v1', JSON.stringify(adminInvitations));
          renderAdminInvitations();
        }

        if (Array.isArray(cloudRsvps)) {
          adminRsvps = cloudRsvps.map(r => ({
            id: r.id,
            name: r.name1,
            name2: r.name2,
            attendance: (r.attendance1 || r.attendance2) ? 'si' : 'no',
            attendance1: r.attendance1 ? 'si' : 'no',
            attendance2: r.attendance2 ? 'si' : 'no',
            pasesCount: (r.attendance1 ? 1 : 0) + (r.attendance2 ? 1 : 0),
            dietary: r.dietary1,
            dietary2: r.dietary2,
            song: r.song_request,
            message: r.message,
            code: r.pass_code,
            invCode: r.invitation_id,
            timestamp: new Date(r.created_at).getTime()
          }));
          localStorage.setItem('wedding_rsvps_cloud_v1', JSON.stringify(adminRsvps));
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
          localStorage.setItem('eve_yimmy_wedding_album_cache_v9', JSON.stringify(adminPhotos));
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
      localStorage.setItem('wedding_invitations_cloud_v1', JSON.stringify(adminInvitations));
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
    const basePath = '/matrimonio/yimmy-eve/';
    const params = new URLSearchParams();
    params.set('p', inv.pases);
    params.set('n1', inv.name1);
    if (inv.name2) params.set('n2', inv.name2);
    params.set('code', inv.id);
    return `${baseOrigin}${basePath}?${params.toString()}`;
  }

  function getAttendanceMode(r) {
    if (!r) return 'pending';
    const att1 = (r.attendance1 === true || r.attendance1 === 'si' || r.attendance === 'si');
    const att2 = (r.attendance2 === true || r.attendance2 === 'si');
    if (att1 && att2) return 'both';
    if (att1 && !att2) {
      if (r.name2 || r.pasesCount === 2 || r.pases === 2) return 'single';
      return 'both';
    }
    return 'none';
  }

  function renderAdminInvitations() {
    const tbody = document.getElementById('admin-invitations-tbody');
    const countInvEl = document.getElementById('admin-count-invitations');

    if (countInvEl) countInvEl.textContent = adminInvitations.length;
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
          <option value="both" ${currentMode === 'both' ? 'selected' : ''}>✅ Asisten Ambos (2 Pases)</option>
          <option value="single" ${currentMode === 'single' ? 'selected' : ''}>👤 Asiste Solo 1 (Sin Acompañante)</option>
          <option value="none" ${currentMode === 'none' ? 'selected' : ''}>❌ No Asiste (0 Pases)</option>
        `;
        if (currentMode === 'both') {
          statusBadge = '<span class="badge-status status-yes" style="border-radius: 50px; font-weight: 700;">🟢 2 Pases (Ambos)</span>';
        } else if (currentMode === 'single') {
          statusBadge = '<span class="badge-status" style="background: #fff3cd; color: #856404; border-radius: 50px; font-weight: 700;">🟡 1 Pase (Solo)</span>';
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
      const waitVerb = isPlural ? '¡Los esperamos con todo nuestro cariño!' : '¡Te esperamos con todo nuestro cariño!';

      const waMsg = `${greeting}\nCon muchísima alegría queremos ${verb} a nuestro matrimonio en Casa Pirque el sábado 21 de noviembre de 2026.\n\nAquí tienes tu invitación oficial con tus pases reservados:\n${link}\n\n${waitVerb}\n— Evelyn & Yimmy`;

      let cleanPhone = (inv.phone || '').replace(/\D/g, '');
      if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
        cleanPhone = '56' + cleanPhone;
      } else if (cleanPhone.length === 8 && cleanPhone.startsWith('9')) {
        cleanPhone = '56' + cleanPhone;
      }

      const waUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}` 
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;

      const borderColor = currentMode === 'both' ? '#27ae60' : currentMode === 'single' ? '#f39c12' : currentMode === 'none' ? '#e74c3c' : '#bdc3c7';
      const textColor = currentMode === 'both' ? '#27ae60' : currentMode === 'single' ? '#d35400' : currentMode === 'none' ? '#c0392b' : '#666';

      return `
        <tr>
          <td style="font-weight: 700;">
            ${idx + 1}. ${namesDisplay}
            ${inv.phone ? `<br><small style="color: #666; font-weight: normal;"><i class="ri-whatsapp-line"></i> ${escapeHtml(inv.phone)}</small>` : ''}
          </td>
          <td>${statusBadge}</td>
          <td>
            <select class="admin-inv-status-select" data-id="${inv.id}" data-name1="${escapeHtml(inv.name1)}" data-name2="${escapeHtml(inv.name2 || '')}" data-pases="${inv.pases}" style="padding: 0.35rem 0.65rem; border-radius: 50px; font-size: 0.76rem; font-weight: 700; border: 1.5px solid ${borderColor}; color: ${textColor}; background: #FFFFFF; cursor: pointer;">
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
          <td>
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
          adminRsvps = adminRsvps.filter(r => r.invCode !== invId && r.name !== name1);
          if (window.dbSupabase) await window.dbSupabase.deleteRsvpFromCloud(invId, invId, null, name1);
        } else {
          const isBoth = (newMode === 'both');
          const isSingle = (newMode === 'single');
          const isNone = (newMode === 'none');

          const existingR = adminRsvps.find(r => r.invCode === invId || r.name === name1);
          const code = existingR ? existingR.code : ('EY-' + Math.floor(1000 + Math.random() * 9000));
          
          const updatedR = {
            id: existingR ? existingR.id : ('manual_' + Date.now()),
            name: name1,
            name2: name2 || '',
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
            timestamp: Date.now()
          };

          adminRsvps = adminRsvps.filter(r => r.invCode !== invId && r.name !== name1);
          adminRsvps.unshift(updatedR);

          if (window.dbSupabase) {
            await window.dbSupabase.updateRsvpAttendanceManual(invId, newMode, name1, name2, pases);
          }
        }

        try {
          localStorage.setItem('wedding_rsvps_cloud_v1', JSON.stringify(adminRsvps));
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
            localStorage.setItem('wedding_invitations_cloud_v1', JSON.stringify(adminInvitations));
            localStorage.setItem('wedding_rsvps_cloud_v1', JSON.stringify(adminRsvps));
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

    if (countYesEl) countYesEl.innerHTML = `<strong>${totalConfirmations}</strong> reg. (<strong>${totalPeopleYes}</strong> pers.)`;
    if (countNoEl) countNoEl.textContent = notAttending.length;

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
      const isTwoPasses = !!(r.name2);
      const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('es-CL', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      }) : '—';

      let namesShow = escapeHtml(r.name);
      if (r.name2) {
        if (mode === 'single') {
          namesShow = `${escapeHtml(r.name)} <span class="badge-status" style="background: #fff3cd; color: #856404; font-size: 0.68rem; margin-left: 4px; border-radius: 50px; font-weight: 700;">(Solo)</span>`;
        } else {
          namesShow = `${escapeHtml(r.name)} &amp; ${escapeHtml(r.name2)}`;
        }
      }

      let pasesBadge = '';
      if (mode === 'both') {
        pasesBadge = `<span class="badge-status status-yes" style="font-weight: 700; border-radius: 50px;">🟢 ${isTwoPasses ? '2 Personas (Ambos)' : '1 Persona'}</span>`;
      } else if (mode === 'single') {
        pasesBadge = `<span class="badge-status" style="background: #fff3cd; color: #856404; font-weight: 700; border-radius: 50px;">🟡 1 Persona (Sin Acomp.)</span>`;
      } else {
        pasesBadge = `<span class="badge-status status-no" style="font-weight: 700; border-radius: 50px;">🔴 0 Personas (No Asiste)</span>`;
      }

      let selectOptions = '';
      if (isTwoPasses) {
        selectOptions = `
          <option value="both" ${mode === 'both' ? 'selected' : ''}>✅ Asisten Ambos (2 Pases)</option>
          <option value="single" ${mode === 'single' ? 'selected' : ''}>👤 Asiste Solo 1 (Sin Acompañante)</option>
          <option value="none" ${mode === 'none' ? 'selected' : ''}>❌ No Asiste (0 Pases)</option>
        `;
      } else {
        selectOptions = `
          <option value="both" ${mode === 'both' ? 'selected' : ''}>✅ Sí Asiste (1 Pase)</option>
          <option value="none" ${mode === 'none' ? 'selected' : ''}>❌ No Asiste (0 Pases)</option>
        `;
      }

      const borderColor = mode === 'both' ? '#27ae60' : mode === 'single' ? '#f39c12' : '#e74c3c';
      const textColor = mode === 'both' ? '#27ae60' : mode === 'single' ? '#d35400' : '#c0392b';

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
          <td>
            <select class="admin-rsvp-status-select" data-id="${r.id || r.code}" data-name1="${escapeHtml(r.name)}" data-name2="${escapeHtml(r.name2 || '')}" data-inv="${r.invCode || ''}" style="padding: 0.35rem 0.65rem; border-radius: 50px; font-size: 0.76rem; font-weight: 700; border: 1.5px solid ${borderColor}; color: ${textColor}; background: #FFFFFF; cursor: pointer;">
              ${selectOptions}
            </select>
          </td>
          <td>${pasesBadge}</td>
          <td><strong class="code-tag">${escapeHtml(r.code || 'EY-0000')}</strong></td>
          <td>
            <small>${escapeHtml(r.dietary && r.dietary !== 'ninguna' ? r.dietary : 'Tradicional')}${r.dietary2 && r.dietary2 !== 'ninguna' ? ' / ' + escapeHtml(r.dietary2) : ''}</small>
          </td>
          <td><small>${songsDisplay}</small></td>
          <td class="cell-message" title="${escapeHtml(r.message || '')}">
            <small>${escapeHtml(r.message || '—')}</small>
          </td>
          <td><small style="color: #777;">${dateStr}</small></td>
          <td>
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
          r.pasesCount = isBoth ? (r.name2 ? 2 : 1) : (isSingle ? 1 : 0);
          
          if (window.dbSupabase) {
            await window.dbSupabase.updateRsvpAttendanceManual(r.invCode || r.code || invId, newMode, r.name, r.name2, r.name2 ? 2 : 1);
          }
          try {
            localStorage.setItem('wedding_rsvps_cloud_v1', JSON.stringify(adminRsvps));
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
            if (name1 && r.name === name1) return false;
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
            localStorage.setItem('wedding_rsvps_cloud_v1', JSON.stringify(adminRsvps));
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
      if (mode === 'both') estadoTxt = r.name2 ? 'ASISTEN AMBOS' : 'ASISTE (1 PASE)';
      if (mode === 'single') estadoTxt = 'ASISTE SOLO 1 (SIN ACOMPAÑANTE)';

      const pases = mode === 'both' ? (r.name2 ? 2 : 1) : (mode === 'single' ? 1 : 0);

      return [
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.name2 || '').replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `Confirmados_Matrimonio_Evelyn_Yimmy_${new Date().toISOString().slice(0, 10)}.csv`);
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
        <div class="raffle-ticket">
          <div class="ticket-brand">MATRIMONIO EVELYN & YIMMY • SORTEO</div>
          <div class="ticket-guest-name">${namesText}</div>
          <div class="ticket-code-box">CÓDIGO DE PASE: <strong>${escapeHtml(r.code || 'EY-0000')}</strong></div>
          <div class="ticket-foot">21 de Noviembre de 2026 • Casa Pirque 🎁</div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Cupones de Sorteo - Evelyn & Yimmy</title>
        <style>
          @page { size: letter portrait; margin: 10mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; margin: 0; padding: 10px; color: #111; }
          h2 { text-align: center; margin-bottom: 5px; }
          p.sub { text-align: center; font-size: 13px; color: #666; margin-bottom: 20px; }
          .raffle-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .raffle-ticket {
            border: 2px dashed #444;
            border-radius: 8px;
            padding: 14px;
            text-align: center;
            page-break-inside: avoid;
            background: #faf8f5;
          }
          .ticket-brand { font-size: 10px; letter-spacing: 0.1em; color: #527A50; font-weight: bold; text-transform: uppercase; }
          .ticket-guest-name { font-size: 18px; font-weight: bold; margin: 8px 0; color: #222; }
          .ticket-code-box { font-family: monospace; font-size: 14px; background: #e8e2d5; padding: 4px 8px; border-radius: 4px; display: inline-block; }
          .ticket-foot { font-size: 10px; color: #777; margin-top: 8px; }
        </style>
      </head>
      <body>
        <h2>🎟️ Cupones de Sorteo de Premios — Evelyn & Yimmy</h2>
        <p class="sub">Total de pases confirmados: ${confirmedYes.length} • Corta por la línea punteada para la tómbola del sorteo.</p>
        <div class="raffle-grid">
          ${ticketsHtml}
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
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
        link.download = filename || 'Foto_Boda_Eve_Yimmy.jpg';
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
      link.download = filename || 'Foto_Boda_Eve_Yimmy.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename || 'Foto_Boda_Eve_Yimmy.jpg';
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
        const folder = zip.folder('Fotos_Matrimonio_Evelyn_Yimmy_2026');

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
        link.download = `Fotos_Matrimonio_Evelyn_Yimmy_${new Date().toISOString().slice(0, 10)}.zip`;
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
            link.download = `Boda_Eve_Yimmy_${idx + 1}.jpg`;
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
