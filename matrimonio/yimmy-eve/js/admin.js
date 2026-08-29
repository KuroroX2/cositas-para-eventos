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
      if (localInv) {
        adminInvitations = JSON.parse(localInv);
      } else {
        adminInvitations = [...DEFAULT_SEED_INVITATIONS];
        localStorage.setItem('wedding_invitations_cloud_v1', JSON.stringify(adminInvitations));
      }
      const localRsvp = localStorage.getItem('wedding_rsvps_cloud_v1');
      if (localRsvp) adminRsvps = JSON.parse(localRsvp);
    } catch (e) {
      adminInvitations = [...DEFAULT_SEED_INVITATIONS];
    }

    renderAdminInvitations();
    renderAdminRsvps();

    // 2. Sincronizar con Supabase Cloud si está disponible
    if (window.dbSupabase) {
      try {
        const [cloudInvs, cloudRsvps] = await Promise.all([
          window.dbSupabase.getInvitations(),
          window.dbSupabase.getRsvps()
        ]);

        if (cloudInvs && cloudInvs.length > 0) {
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

        if (cloudRsvps && cloudRsvps.length > 0) {
          adminRsvps = cloudRsvps.map(r => ({
            id: r.id,
            name: r.name1,
            name2: r.name2,
            attendance: r.attendance1 ? 'si' : 'no',
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
      const isConfirmed = isInvitationConfirmed(inv);
      const link = generatePersonalizedUrl(inv);
      const namesDisplay = inv.name2 ? `${escapeHtml(inv.name1)} &amp; ${escapeHtml(inv.name2)}` : escapeHtml(inv.name1);

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

      return `
        <tr>
          <td style="font-weight: 700;">
            ${idx + 1}. ${namesDisplay}
            ${inv.phone ? `<br><small style="color: #666; font-weight: normal;"><i class="ri-whatsapp-line"></i> ${escapeHtml(inv.phone)}</small>` : ''}
          </td>
          <td>
            <span class="badge-status ${inv.pases === 2 ? 'status-yes' : 'status-pending'}">
              ${inv.pases} Persona${inv.pases === 2 ? 's (Con Acompañante)' : ' (Individual)'}
            </span>
          </td>
          <td>
            <span class="badge-status ${isConfirmed ? 'status-yes' : 'status-pending'}">
              ${isConfirmed ? '✅ Confirmado' : '⏳ Pendiente'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="btn-dl-single" style="background: #25D366; color: #fff; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 0.8rem; border-radius: var(--border-radius-card); font-size: 0.75rem; font-weight: 700;">
                <i class="ri-whatsapp-line"></i> <span>Enviar WhatsApp</span>
              </a>
              <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="btn-dl-single btn-view-invitation" data-url="${escapeHtml(link)}" style="background: var(--bg-dark); color: #fff; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 0.8rem; border-radius: var(--border-radius-card); font-size: 0.75rem; font-weight: 700;">
                <i class="ri-external-link-line"></i> <span>Ver (OK)</span>
              </a>
            </div>
          </td>
          <td>
            <button class="btn-del-inv" data-id="${inv.id}" title="Eliminar invitación" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.1rem; padding: 0.3rem;">
              <i class="ri-delete-bin-line"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-view-invitation').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const url = btn.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank');
        }
      });
    });

    tbody.querySelectorAll('.btn-del-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar esta invitación?')) {
          adminInvitations = adminInvitations.filter(i => i.id !== id);
          try {
            localStorage.setItem('wedding_invitations_cloud_v1', JSON.stringify(adminInvitations));
          } catch (e) {}
          renderAdminInvitations();
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

    const confirmedYes = adminRsvps.filter(r => r.attendance === 'si');
    const confirmedNo = adminRsvps.filter(r => r.attendance === 'no');

    let totalPeopleYes = 0;
    confirmedYes.forEach(r => {
      totalPeopleYes += (r.pasesCount || (r.name2 ? 2 : 1));
    });

    if (countYesEl) countYesEl.textContent = `${confirmedYes.length} reg. (${totalPeopleYes} pers.)`;
    if (countNoEl) countNoEl.textContent = confirmedNo.length;

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
      const isYes = r.attendance === 'si';
      const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('es-CL', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      }) : '—';

      const namesShow = r.name2 ? `${escapeHtml(r.name)} &amp; ${escapeHtml(r.name2)}` : escapeHtml(r.name);
      const pasesCount = r.pasesCount || (r.name2 ? 2 : 1);

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
            <span class="badge-status ${isYes ? 'status-yes' : 'status-no'}">
              ${isYes ? '✓ Sí Asiste' : '✗ No Asiste'}
            </span>
          </td>
          <td><small>${pasesCount} Persona${pasesCount > 1 ? 's' : ''}</small></td>
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
            <button class="btn-del-rsvp" data-id="${r.id}" title="Eliminar confirmación" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.1rem; padding: 0.3rem;">
              <i class="ri-delete-bin-line"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('.btn-del-rsvp').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar esta confirmación?')) {
          adminRsvps = adminRsvps.filter(r => r.id !== id);
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

    const headers = ['Nombre_1', 'Nombre_2', 'Asistencia', 'Pases', 'Codigo_Pase', 'Menu_1', 'Menu_2', 'Cancion_1', 'Cancion_2', 'Mensaje_Dedicatoria', 'Fecha_Registro'];
    const rows = adminRsvps.map(r => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.name2 || '').replace(/"/g, '""')}"`,
      r.attendance === 'si' ? 'SI ASISTE' : 'NO ASISTE',
      r.pasesCount || (r.name2 ? 2 : 1),
      `"${r.code || ''}"`,
      `"${(r.dietary || '').replace(/"/g, '""')}"`,
      `"${(r.dietary2 || '').replace(/"/g, '""')}"`,
      `"${(r.song || '').replace(/"/g, '""')}"`,
      `"${(r.song2 || '').replace(/"/g, '""')}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      r.timestamp ? new Date(r.timestamp).toLocaleString('es-CL') : ''
    ]);

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
    const confirmedYes = adminRsvps.filter(r => r.attendance === 'si');
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
      const namesText = r.name2 ? `${escapeHtml(r.name)} & ${escapeHtml(r.name2)}` : escapeHtml(r.name);
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
        <p class="sub">Total de registros confirmados: ${confirmedYes.length} • Corta por la línea punteada para la tómbola del sorteo.</p>
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

  function renderAdminPhotos() {
    const grid = document.getElementById('admin-photos-grid');
    if (!grid) return;

    const photos = window.weddingPhotos || [];
    if (photos.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 2rem;">Aún no se han subido fotos al álbum.</p>`;
      return;
    }

    grid.innerHTML = photos.map((p, idx) => `
      <div class="admin-photo-card">
        <img src="${escapeHtml(p.url || p.photo_url || '')}" alt="Foto">
        <div class="admin-photo-info">
          <span class="admin-photo-author">#${idx + 1} • ${escapeHtml(p.author || p.author_name || 'Invitado')}</span>
          <span class="admin-photo-likes">❤️ ${p.likes || 0} | 💬 ${(p.comments || []).length}</span>
          <a href="${escapeHtml(p.url || p.photo_url || '')}" download="Boda_Eve_Yimmy_Foto_${idx + 1}.jpg" target="_blank" class="btn-dl-single">
            <i class="ri-download-2-line"></i> Descargar
          </a>
        </div>
      </div>
    `).join('');
  }

  async function downloadAllPhotosBulk() {
    const photos = window.weddingPhotos || [];
    if (photos.length === 0) {
      alert('No hay fotos para descargar aún.');
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
          const author = (p.author || p.author_name || 'Invitado').replace(/[^a-zA-Z0-9_-]/g, '_');
          const fileName = `${String(i + 1).padStart(2, '0')}_${author}_${p.category || 'album'}.jpg`;

          if (btn) {
            const percent = Math.round(((i + 1) / photos.length) * 80);
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
              console.warn('Direct fetch failed, skipping or fallback:', fetchErr);
            }
          }
        }

        if (btn) {
          btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> <span>Generando archivo ZIP...</span>`;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `Fotos_Matrimonio_Evelyn_Yimmy_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(`¡Descarga lista! Se ha descargado el archivo ZIP con todas las ${photos.length} fotos juntas.`);
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
