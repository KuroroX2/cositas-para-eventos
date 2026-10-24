/**
 * organizador.js - Panel de control y administración del Cumpleaños
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModals();
  initInviteGenerator();
  initSettingsForm();
  initBackupsAndPrint();

  // Escuchar actualizaciones del almacén
  window.addEventListener('cumple_store_updated', () => {
    renderAll();
  });

  // Render inicial
  renderAll();
});

/**
 * Renderiza todas las vistas y métricas
 */
function renderAll() {
  renderMetrics();
  renderInvitados();
  updateGeneratorMesas();
  renderMesas();
  renderComida();
  renderCotillon();
  renderCronograma();
  loadSettingsFormData();
}

/**
 * Navegación por pestañas
 */
function initTabs() {
  const tabs = document.querySelectorAll('.org-tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.org-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/**
 * Cálculo y renderizado de métricas superiores
 */
function renderMetrics() {
  if (!window.cumpleStore) return;
  const data = window.cumpleStore.getData();

  const invitados = data.invitados || [];
  const confirmados = invitados.filter(i => i.asistira === true);
  const totalAsistentes = confirmados.reduce((sum, i) => sum + (Number(i.adultos) || 0) + (Number(i.ninos) || 0), 0);

  // Mesas y capacidad
  const mesas = data.mesas || [];
  const capacidadTotal = mesas.reduce((sum, m) => sum + (Number(m.capacidad) || 0), 0);
  const sentados = confirmados.filter(i => i.mesaId);
  const totalSentados = sentados.reduce((sum, i) => sum + (Number(i.adultos) || 0) + (Number(i.ninos) || 0), 0);

  // Comida
  const comida = data.comida || [];
  const comidaLista = comida.filter(c => c.estado === 'comprado' || c.estado === 'encargado').length;
  const costoComida = comida.reduce((sum, c) => sum + (Number(c.costo) || 0), 0);

  // Cotillón
  const cotillon = data.cotillon || [];
  const cotillonListo = cotillon.filter(c => c.estado === 'comprado' || c.estado === 'encargado').length;
  const costoCotillon = cotillon.reduce((sum, c) => sum + (Number(c.costo) || 0), 0);

  // Actualizar métricas visuales
  const elGuests = document.getElementById('metricGuests');
  const elSeats = document.getElementById('metricSeats');
  const elFood = document.getElementById('metricFood');
  const elParty = document.getElementById('metricParty');
  const elBudget = document.getElementById('metricBudget');

  if (elGuests) elGuests.innerText = `${totalAsistentes} personas`;
  if (elSeats) elSeats.innerText = `${totalSentados} / ${capacidadTotal}`;
  if (elFood) elFood.innerText = `${comidaLista} / ${comida.length}`;
  if (elParty) elParty.innerText = `${cotillonListo} / ${cotillon.length}`;
  if (elBudget) elBudget.innerText = `$${(costoComida + costoCotillon).toLocaleString('es-CL')}`;

  // Actualizar badges en pestañas
  const bInv = document.getElementById('badgeCountInvitados');
  const bMes = document.getElementById('badgeCountMesas');
  const bCom = document.getElementById('badgeCountComida');
  const bCot = document.getElementById('badgeCountCotillon');
  const bCro = document.getElementById('badgeCountCronograma');

  if (bInv) bInv.innerText = invitados.length;
  if (bMes) bMes.innerText = mesas.length;
  if (bCom) bCom.innerText = comida.length;
  if (bCot) bCot.innerText = cotillon.length;
  if (bCro) bCro.innerText = (data.cronograma || []).length;
}

/**
 * ==========================================================================
 * GESTIÓN DE INVITADOS
 * ==========================================================================
 */
/**
 * ==========================================================================
 * GESTIÓN Y CREACIÓN DE INVITACIONES PERSONALIZADAS
 * ==========================================================================
 */
function initInviteGenerator() {
  const form = document.getElementById('formCreatePersonalizedInvite');
  const typeRadios = document.querySelectorAll('input[name="inviteType"]');
  const grpIndiv = document.getElementById('grpIndividualName');
  const grpPar1 = document.getElementById('grpParejaName1');
  const grpPar2 = document.getElementById('grpParejaName2');
  const grpFam = document.getElementById('grpFamiliaName');
  const grpMembers = document.getElementById('grpFamiliaMembers');
  const inputAdultos = document.getElementById('genAdultos');
  const inputNinos = document.getElementById('genNinos');
  const selectMesa = document.getElementById('genMesa');
  const btnToggle = document.getElementById('btnToggleGenForm');
  const btnToggleTop = document.getElementById('btnToggleGenFormTop');
  const cardGen = document.getElementById('inviteGeneratorCard');

  // Alternar vista del creador
  function toggleGenerator() {
    if (!cardGen) return;
    const isHidden = cardGen.style.display === 'none';
    cardGen.style.display = isHidden ? 'block' : 'none';
    const textToggle = document.getElementById('textToggleGen');
    const iconToggle = document.getElementById('iconToggleGen');
    if (textToggle) textToggle.textContent = isHidden ? 'Ocultar Creador' : 'Mostrar Creador';
    if (iconToggle) iconToggle.className = isHidden ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line';
  }

  btnToggle?.addEventListener('click', toggleGenerator);
  btnToggleTop?.addEventListener('click', () => {
    if (cardGen && cardGen.style.display === 'none') {
      toggleGenerator();
    }
    cardGen?.scrollIntoView({ behavior: 'smooth' });
    const firstInput = document.getElementById('genIndivName') || document.getElementById('genFamName');
    firstInput?.focus();
  });

  // Cambio de tipo de invitación (Individual / Pareja / Familia)
  typeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const val = radio.value;
      if (grpIndiv) grpIndiv.style.display = val === 'individual' ? 'block' : 'none';
      if (grpPar1) grpPar1.style.display = val === 'pareja' ? 'block' : 'none';
      if (grpPar2) grpPar2.style.display = val === 'pareja' ? 'block' : 'none';
      if (grpFam) grpFam.style.display = val === 'familia' ? 'block' : 'none';
      if (grpMembers) grpMembers.style.display = val === 'familia' ? 'block' : 'none';

      if (val === 'individual') {
        if (inputAdultos) inputAdultos.value = 1;
        if (inputNinos) inputNinos.value = 0;
      } else if (val === 'pareja') {
        if (inputAdultos) inputAdultos.value = 2;
        if (inputNinos) inputNinos.value = 0;
      } else if (val === 'familia') {
        if (inputAdultos) inputAdultos.value = 2;
        if (inputNinos) inputNinos.value = 1;
      }
    });
  });

  // Guardar y generar invitación
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="inviteType"]:checked')?.value || 'individual';
    let nombreFinal = '';
    let familia = '';
    let integrantes = '';
    let name1 = '';
    let name2 = '';

    if (type === 'individual') {
      const n = document.getElementById('genIndivName')?.value.trim();
      if (!n) {
        alert('Por favor ingresa el nombre del invitado.');
        return;
      }
      nombreFinal = n;
    } else if (type === 'pareja') {
      name1 = document.getElementById('genParejaName1')?.value.trim();
      name2 = document.getElementById('genParejaName2')?.value.trim();
      if (!name1 || !name2) {
        alert('Por favor ingresa los nombres de ambos integrantes de la pareja.');
        return;
      }
      nombreFinal = `${name1} & ${name2}`;
    } else if (type === 'familia') {
      familia = document.getElementById('genFamName')?.value.trim();
      integrantes = document.getElementById('genFamMembers')?.value.trim();
      if (!familia) {
        alert('Por favor ingresa el nombre de la familia.');
        return;
      }
      nombreFinal = familia;
    }

    const phone = document.getElementById('genPhone')?.value.trim() || '';
    const adultos = parseInt(inputAdultos?.value, 10) || 1;
    const ninos = parseInt(inputNinos?.value, 10) || 0;
    const mesaId = selectMesa?.value || null;

    const newInv = window.cumpleStore.addInvitado({
      tipo: type,
      nombre: nombreFinal,
      familia: familia,
      nombresIntegrantes: integrantes,
      name1: name1,
      name2: name2,
      telefono: phone,
      asistira: null, // Pendiente de confirmación
      adultos: adultos,
      ninos: ninos,
      mesaId: mesaId
    });

    const url = generatePersonalizedUrl(newInv);

    // Mostrar modal con los enlaces y opciones
    showShareModal(newInv, url);

    form.reset();
    document.querySelector('input[name="inviteType"][value="individual"]').click();
  });
}

function updateGeneratorMesas() {
  const selectMesa = document.getElementById('genMesa');
  if (!selectMesa || !window.cumpleStore) return;
  const currentVal = selectMesa.value;
  const mesas = window.cumpleStore.getMesas();
  let html = '<option value="">-- Sin mesa asignada --</option>';
  mesas.forEach(m => {
    html += `<option value="${m.id}" ${m.id === currentVal ? 'selected' : ''}>Mesa ${m.numero}: ${escapeHtml(m.nombre)}</option>`;
  });
  selectMesa.innerHTML = html;
}

/**
 * Genera la URL personalizada para el invitado o familia
 */
function generatePersonalizedUrl(inv) {
  const loc = window.location;
  let basePath = loc.pathname;

  if (basePath.includes('/organizador/')) {
    basePath = basePath.replace('/organizador/', '/');
  } else if (basePath.includes('/organizador.html')) {
    basePath = basePath.replace('/organizador.html', '/index.html');
  } else {
    basePath = basePath.replace(/organizador.*$/, 'index.html');
  }
  if (!basePath.endsWith('index.html') && !basePath.endsWith('/')) {
    basePath += '/index.html';
  } else if (basePath.endsWith('/')) {
    basePath += 'index.html';
  }

  const origin = loc.origin;
  const params = new URLSearchParams();

  if (inv.tipo) params.set('tipo', inv.tipo);
  if (inv.familia) params.set('fam', inv.familia);
  if (inv.nombre) params.set('n', inv.nombre);
  if (inv.nombresIntegrantes) params.set('nombres', inv.nombresIntegrantes);
  if (inv.name1) params.set('n1', inv.name1);
  if (inv.name2) params.set('n2', inv.name2);
  params.set('a', inv.adultos || 1);
  params.set('ni', inv.ninos || 0);
  const total = (Number(inv.adultos) || 0) + (Number(inv.ninos) || 0);
  params.set('p', total || 1);
  if (inv.id) params.set('code', inv.id);

  return `${origin}${basePath}?${params.toString()}`;
}

/**
 * Redacta el mensaje cariñoso de WhatsApp con link
 */
function buildWhatsAppMessage(inv, url) {
  const isFamily = inv.tipo === 'familia' || !!inv.familia;
  const isCouple = inv.tipo === 'pareja' || (inv.name1 && inv.name2);

  let greeting = '';
  let pluralWait = '¡Te espero con tu mejor disfraz!';
  if (isFamily) {
    greeting = `¡Hola ${inv.familia || inv.nombre}! 🧜‍♀️🎃`;
    pluralWait = '¡Los esperamos con sus mejores disfraces para compartir este día mágico!';
  } else if (isCouple) {
    greeting = `¡Hola ${inv.name1} y ${inv.name2}! 🧜‍♀️🎃`;
    pluralWait = '¡Los esperamos con sus mejores disfraces!';
  } else {
    greeting = `¡Hola ${inv.nombre}! 🧜‍♀️🎃`;
    pluralWait = '¡Te espero con tu mejor disfraz!';
  }

  let pasesText = '';
  const ads = Number(inv.adultos) || 0;
  const chs = Number(inv.ninos) || 0;
  if (ads > 0 && chs > 0) {
    pasesText = `Pase reservado para: ${ads} Adulto(s) y ${chs} Niño(s)`;
  } else if (ads > 1) {
    pasesText = `Pase reservado para: ${ads} Personas`;
  } else {
    pasesText = `Pase individual reservado`;
  }

  return `${greeting}
Con muchísima emoción queremos invitarlos a celebrar el Primer Cumpleaños de Dominique ("Bajo el Mar & Halloween").

📅 Sábado 31 de Octubre, 15:00 hrs
📍 Club Valle del Sol (Senecio 4593, Puente Alto)
🎟️ ${pasesText}

Aquí tienen su invitación personalizada lista con sus pases reservados:
👉 ${url}

Por favor confírmennos su asistencia a través del link. ${pluralWait} 💖✨
— Dominique & sus Papás`;
}

/**
 * Modal para compartir invitación
 */
function showShareModal(inv, url) {
  const modal = document.getElementById('modalShareInvite');
  if (!modal) return;

  const displayName = inv.nombre || inv.familia || 'Invitado';
  const nameEl = document.getElementById('shareGuestName');
  if (nameEl) nameEl.textContent = displayName;

  const membersEl = document.getElementById('shareGuestMembers');
  if (membersEl) {
    if (inv.nombresIntegrantes) {
      membersEl.textContent = `Integrantes: ${inv.nombresIntegrantes} (${inv.adultos || 0} adultos, ${inv.ninos || 0} niños)`;
      membersEl.style.display = 'block';
    } else {
      membersEl.textContent = `Pases: ${inv.adultos || 1} adulto(s)${inv.ninos ? `, ${inv.ninos} niño(s)` : ''}`;
      membersEl.style.display = 'block';
    }
  }

  const urlDisplay = document.getElementById('shareUrlDisplay');
  if (urlDisplay) urlDisplay.textContent = url;

  // WhatsApp
  const phoneDigits = (inv.telefono || '').replace(/\D/g, '');
  const cleanPhone = phoneDigits.startsWith('9') && phoneDigits.length === 9 ? '56' + phoneDigits : phoneDigits;
  const waMsg = buildWhatsAppMessage(inv, url);
  const waBtn = document.getElementById('btnOpenShareWhatsApp');
  if (waBtn) {
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;
    waBtn.href = waUrl;
  }

  // Previsualizar
  const prevBtn = document.getElementById('btnPreviewShareUrl');
  if (prevBtn) prevBtn.href = url;

  // Copiar
  const copyBtn = document.getElementById('btnCopyShareUrl');
  if (copyBtn) {
    copyBtn.onclick = () => {
      copyToClipboard(url);
    };
  }

  modal.style.display = 'flex';
}

function showToast(msg) {
  const toast = document.getElementById('orgToast');
  const toastMsg = document.getElementById('orgToastMsg');
  if (!toast) {
    alert(msg);
    return;
  }
  if (toastMsg) toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('¡Enlace personalizado copiado al portapapeles!');
    }).catch(() => {
      prompt('Copia el enlace manualmente:', text);
    });
  } else {
    prompt('Copia el enlace manualmente:', text);
  }
}

/**
 * ==========================================================================
 * GESTIÓN DE INVITADOS (TABLA & LISTADO)
 * ==========================================================================
 */
function renderInvitados() {
  const tbody = document.getElementById('tbodyInvitados');
  if (!tbody || !window.cumpleStore) return;

  const data = window.cumpleStore.getData();
  const mesas = data.mesas || [];
  let invitados = data.invitados || [];

  const searchVal = document.getElementById('searchInvitados')?.value.toLowerCase().trim() || '';
  const filterVal = document.getElementById('filterAsistencia')?.value || 'all';

  // Filtrado
  if (searchVal) {
    invitados = invitados.filter(i =>
      (i.nombre || '').toLowerCase().includes(searchVal) ||
      (i.familia || '').toLowerCase().includes(searchVal) ||
      (i.nombresIntegrantes || '').toLowerCase().includes(searchVal) ||
      (i.disfraz || '').toLowerCase().includes(searchVal) ||
      (i.telefono || '').toLowerCase().includes(searchVal)
    );
  }

  if (filterVal === 'si') {
    invitados = invitados.filter(i => i.asistira === true);
  } else if (filterVal === 'pendiente') {
    invitados = invitados.filter(i => i.asistira === null || i.asistira === undefined || i.asistira === 'pendiente');
  } else if (filterVal === 'no') {
    invitados = invitados.filter(i => i.asistira === false);
  } else if (filterVal === 'sin-mesa') {
    invitados = invitados.filter(i => !i.mesaId);
  }

  tbody.innerHTML = '';

  if (invitados.length === 0) {
    if ((data.invitados || []).length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--org-text-muted); padding: 3rem 1rem;"><div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💌</div><strong style="color: var(--org-text-main); font-size: 1.05rem;">No hay invitados registrados todavía</strong><br><span style="font-size: 0.88rem;">Usa el creador de arriba para generar la primera invitación personalizada para una persona, pareja o familia.</span></td></tr>`;
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--org-text-muted); padding: 2rem;">No se encontraron invitados con estos criterios de búsqueda.</td></tr>`;
    }
    return;
  }

  invitados.forEach(inv => {
    const tr = document.createElement('tr');

    let statusBadge = '';
    if (inv.asistira === true) {
      statusBadge = `<span class="badge-status badge-yes"><i class="ri-check-line"></i> Asiste</span>`;
    } else if (inv.asistira === false) {
      statusBadge = `<span class="badge-status badge-no"><i class="ri-close-line"></i> No asiste</span>`;
    } else {
      statusBadge = `<span class="badge-status badge-pending"><i class="ri-time-line"></i> Pendiente</span>`;
    }

    const typeLabel = inv.tipo === 'familia' ? '👨‍👩‍👧 Familia' : inv.tipo === 'pareja' ? '👥 Pareja' : '👤 Individual';
    const typeClass = inv.tipo === 'familia' ? 'type-familia' : inv.tipo === 'pareja' ? 'type-pareja' : 'type-individual';

    // Dropdown inline de mesas
    let mesaOptions = `<option value="">-- Sin mesa --</option>`;
    mesas.forEach(m => {
      const selected = (inv.mesaId === m.id) ? 'selected' : '';
      mesaOptions += `<option value="${m.id}" ${selected}>Mesa ${m.numero}: ${escapeHtml(m.nombre)}</option>`;
    });

    const phoneDigits = (inv.telefono || '').replace(/\D/g, '');
    const cleanPhone = phoneDigits.startsWith('9') && phoneDigits.length === 9 ? '56' + phoneDigits : phoneDigits;
    const invUrl = generatePersonalizedUrl(inv);
    const waMsg = buildWhatsAppMessage(inv, invUrl);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;

    const totalPases = (Number(inv.adultos) || 0) + (Number(inv.ninos) || 0);

    tr.innerHTML = `
      <td>
        <strong>${escapeHtml(inv.nombre || inv.familia || 'Invitado')}</strong>
        ${inv.nombresIntegrantes ? `<div style="font-size: 0.78rem; color: #495057; margin-top: 0.2rem;"><i class="ri-group-line" style="color: var(--org-teal);"></i> ${escapeHtml(inv.nombresIntegrantes)}</div>` : ''}
        <div><span class="badge-type ${typeClass}">${typeLabel}</span></div>
        ${inv.dedicatoria ? `<div style="font-size: 0.76rem; color: #7048e8; font-style: italic; margin-top: 0.25rem;">💌 "${escapeHtml(inv.dedicatoria)}"</div>` : ''}
      </td>
      <td>
        <strong style="color: var(--org-primary); font-size: 0.95rem;">${totalPases} pases</strong>
        <div style="font-size: 0.78rem; color: var(--org-text-muted);">${inv.adultos || 0} ad. &bull; ${inv.ninos || 0} niñ.</div>
      </td>
      <td>
        <span>${escapeHtml(inv.telefono || '—')}</span>
      </td>
      <td>${statusBadge}</td>
      <td>
        <select class="filter-select select-inline-mesa" data-invid="${inv.id}" style="font-size: 0.8rem; padding: 0.3rem 0.5rem; max-width: 155px;">
          ${mesaOptions}
        </select>
      </td>
      <td>
        <div style="font-size: 0.82rem;"><strong>🎭</strong> ${escapeHtml(inv.disfraz || 'Por definir')}</div>
        ${inv.alergias ? `<div style="font-size: 0.76rem; color: #d6336c;">⚠️ ${escapeHtml(inv.alergias)}</div>` : ''}
      </td>
      <td style="text-align: right;">
        <div class="row-actions" style="justify-content: flex-end; gap: 0.35rem; flex-wrap: wrap;">
          <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener" class="btn-row-whatsapp" title="Enviar invitación personalizada por WhatsApp">
            <i class="ri-whatsapp-line"></i> <span>WhatsApp</span>
          </a>
          <button type="button" class="btn-row-link btn-copy-row-link" data-url="${escapeHtml(invUrl)}" title="Copiar enlace personalizado">
            <i class="ri-file-copy-line"></i> <span>Copiar</span>
          </button>
          <a href="${escapeHtml(invUrl)}" target="_blank" rel="noopener" class="btn-row-view" title="Previsualizar invitación personalizada">
            <i class="ri-external-link-line"></i>
          </a>
          <button type="button" class="btn-icon-action btn-edit-inv" data-id="${inv.id}" title="Editar invitado">
            <i class="ri-pencil-line"></i>
          </button>
          <button type="button" class="btn-icon-action btn-del btn-del-inv" data-id="${inv.id}" title="Eliminar invitado">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Listener para cambio directo de mesa
  tbody.querySelectorAll('.select-inline-mesa').forEach(select => {
    select.addEventListener('change', (e) => {
      const invId = e.target.getAttribute('data-invid');
      const newMesaId = e.target.value;
      window.cumpleStore.asignarInvitadoAMesa(invId, newMesaId);
    });
  });

  // Listener copiar enlace en fila
  tbody.querySelectorAll('.btn-copy-row-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      copyToClipboard(url);
    });
  });

  // Listeners para editar y eliminar
  tbody.querySelectorAll('.btn-edit-inv').forEach(btn => {
    btn.addEventListener('click', () => openModalInvitado(btn.getAttribute('data-id')));
  });

  tbody.querySelectorAll('.btn-del-inv').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Seguro que deseas eliminar este invitado?')) {
        window.cumpleStore.deleteInvitado(id);
      }
    });
  });
}

// Filtros de búsqueda en tiempo real
document.getElementById('searchInvitados')?.addEventListener('input', renderInvitados);
document.getElementById('filterAsistencia')?.addEventListener('change', renderInvitados);

/**
 * ==========================================================================
 * GESTIÓN DE MESAS
 * ==========================================================================
 */
function renderMesas() {
  const container = document.getElementById('tablesGrid');
  if (!container || !window.cumpleStore) return;

  const data = window.cumpleStore.getData();
  const mesas = data.mesas || [];
  const invitados = data.invitados || [];

  container.innerHTML = '';

  if (mesas.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem 1.5rem; background: var(--org-surface); border-radius: var(--org-radius); border: 1px dashed var(--org-border); color: var(--org-text-muted);"><div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🍽️</div><strong style="color: var(--org-text-main); font-size: 1.05rem;">No hay mesas creadas todavía</strong><br><span style="font-size: 0.88rem;">Presiona "+ Nueva Mesa" para organizar los asientos y la distribución del salón.</span></div>`;
    return;
  }

  // Invitados confirmados que no tienen mesa
  const unseatedGuests = invitados.filter(i => i.asistira === true && !i.mesaId);

  mesas.forEach(mesa => {
    const card = document.createElement('div');
    card.className = 'table-card';

    // Invitados asignados a esta mesa
    const seated = invitados.filter(i => i.mesaId === mesa.id);
    const totalPersonsSeated = seated.reduce((sum, i) => sum + (Number(i.adultos) || 0) + (Number(i.ninos) || 0), 0);
    const cap = Number(mesa.capacidad) || 8;
    const pct = Math.min(100, Math.round((totalPersonsSeated / cap) * 100));
    const isOver = totalPersonsSeated > cap;

    let guestsListHtml = '';
    if (seated.length === 0) {
      guestsListHtml = `<li style="color: #adb5bd; font-size: 0.85rem; padding: 0.5rem 0;">Mesa vacía. Asigna invitados abajo.</li>`;
    } else {
      seated.forEach(g => {
        const total = (Number(g.adultos) || 0) + (Number(g.ninos) || 0);
        guestsListHtml += `
          <li class="table-card-guest-item">
            <span><strong>${escapeHtml(g.nombre)}</strong> <small style="color: var(--org-text-muted);">(${total} pers.)</small></span>
            <button type="button" class="btn-remove-seated" data-invid="${g.id}" title="Quitar de esta mesa">&times;</button>
          </li>
        `;
      });
    }

    // Selector para sentar un invitado
    let unseatedOptions = `<option value="">+ Sentar invitado aquí...</option>`;
    unseatedGuests.forEach(u => {
      const tot = (Number(u.adultos) || 0) + (Number(u.ninos) || 0);
      unseatedOptions += `<option value="${u.id}">${escapeHtml(u.nombre)} (${tot} pers.)</option>`;
    });

    card.innerHTML = `
      <div class="table-card-top">
        <span class="table-badge-num">Mesa #${mesa.numero}</span>
        <div class="row-actions">
          <button type="button" class="btn-icon-action btn-edit-mesa" data-id="${mesa.id}" title="Editar mesa">
            <i class="ri-pencil-line"></i>
          </button>
          <button type="button" class="btn-icon-action btn-del btn-del-mesa" data-id="${mesa.id}" title="Eliminar mesa">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>

      <div class="table-name">${escapeHtml(mesa.nombre)}</div>
      <div style="font-size: 0.82rem; color: ${isOver ? '#fa5252' : 'var(--org-text-muted)'}; margin-bottom: 0.35rem;">
        <strong>${totalPersonsSeated}</strong> de <strong>${cap}</strong> asientos ${isOver ? '⚠️ (Sobrecupo)' : ''}
      </div>

      <div class="table-occupancy-bar">
        <div class="table-occupancy-fill" style="width: ${pct}%; background: ${isOver ? '#fa5252' : 'var(--org-primary)'};"></div>
      </div>

      <ul class="table-card-guests-list">
        ${guestsListHtml}
      </ul>

      <div class="table-add-guest-box">
        <select class="filter-select select-add-to-table" data-mesaid="${mesa.id}" style="width: 100%; font-size: 0.82rem;">
          ${unseatedOptions}
        </select>
      </div>
    `;

    container.appendChild(card);
  });

  // Listeners para quitar invitado de mesa
  container.querySelectorAll('.btn-remove-seated').forEach(btn => {
    btn.addEventListener('click', () => {
      const invId = btn.getAttribute('data-invid');
      window.cumpleStore.asignarInvitadoAMesa(invId, null);
    });
  });

  // Listeners para asignar invitado a mesa
  container.querySelectorAll('.select-add-to-table').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const mesaId = sel.getAttribute('data-mesaid');
      const invId = e.target.value;
      if (invId) {
        window.cumpleStore.asignarInvitadoAMesa(invId, mesaId);
      }
    });
  });

  // Listeners editar y eliminar mesa
  container.querySelectorAll('.btn-edit-mesa').forEach(btn => {
    btn.addEventListener('click', () => openModalMesa(btn.getAttribute('data-id')));
  });

  container.querySelectorAll('.btn-del-mesa').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Seguro que deseas eliminar esta mesa? Los invitados quedarán sin asignar.')) {
        window.cumpleStore.deleteMesa(id);
      }
    });
  });
}

/**
 * ==========================================================================
 * GESTIÓN DE COMIDA & TORTA
 * ==========================================================================
 */
function renderComida() {
  const tbody = document.getElementById('tbodyComida');
  if (!tbody || !window.cumpleStore) return;

  const comida = window.cumpleStore.getComida();
  tbody.innerHTML = '';

  if (comida.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--org-text-muted); padding: 2.5rem 1rem;"><div style="font-size: 2rem; margin-bottom: 0.5rem;">🎂</div><strong style="color: var(--org-text-main); font-size: 1rem;">No hay ítems de comida registrados aún</strong><br><span style="font-size: 0.85rem;">Presiona "+ Agregar Ítem" para registrar la torta, cóctel o bebidas.</span></td></tr>`;
    return;
  }

  comida.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td><span class="badge-table-tag">${escapeHtml(item.categoria)}</span></td>
      <td><strong>${escapeHtml(item.item)}</strong></td>
      <td>${escapeHtml(item.cantidad || '—')}</td>
      <td>
        <select class="filter-select select-status-comida" data-id="${item.id}" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">
          <option value="pendiente" ${item.estado === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
          <option value="encargado" ${item.estado === 'encargado' ? 'selected' : ''}>📋 Encargado</option>
          <option value="comprado" ${item.estado === 'comprado' ? 'selected' : ''}>✅ Comprado</option>
        </select>
      </td>
      <td>$${Number(item.costo || 0).toLocaleString('es-CL')}</td>
      <td style="color: var(--org-text-muted); font-size: 0.85rem;">${escapeHtml(item.notes || item.notas || '—')}</td>
      <td style="text-align: right;">
        <div class="row-actions" style="justify-content: flex-end;">
          <button type="button" class="btn-icon-action btn-edit-comida" data-id="${item.id}" title="Editar">
            <i class="ri-pencil-line"></i>
          </button>
          <button type="button" class="btn-icon-action btn-del btn-del-comida" data-id="${item.id}" title="Eliminar">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.select-status-comida').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.getAttribute('data-id');
      window.cumpleStore.updateItemComida(id, { estado: e.target.value });
    });
  });

  tbody.querySelectorAll('.btn-edit-comida').forEach(btn => {
    btn.addEventListener('click', () => openModalComida(btn.getAttribute('data-id')));
  });

  tbody.querySelectorAll('.btn-del-comida').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Eliminar este ítem de comida?')) {
        window.cumpleStore.deleteItemComida(id);
      }
    });
  });
}

/**
 * ==========================================================================
 * GESTIÓN DE COTILLÓN & DECORACIÓN
 * ==========================================================================
 */
function renderCotillon() {
  const tbody = document.getElementById('tbodyCotillon');
  if (!tbody || !window.cumpleStore) return;

  const cotillon = window.cumpleStore.getCotillon();
  tbody.innerHTML = '';

  if (cotillon.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--org-text-muted); padding: 2.5rem 1rem;"><div style="font-size: 2rem; margin-bottom: 0.5rem;">🎈</div><strong style="color: var(--org-text-main); font-size: 1rem;">No hay ítems de cotillón registrados aún</strong><br><span style="font-size: 0.85rem;">Presiona "+ Agregar Ítem" para registrar decoración, recuerdos o sorpresas.</span></td></tr>`;
    return;
  }

  cotillon.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td><span class="badge-table-tag">${escapeHtml(item.categoria)}</span></td>
      <td><strong>${escapeHtml(item.item)}</strong></td>
      <td>${escapeHtml(item.cantidad || '—')}</td>
      <td>
        <select class="filter-select select-status-cotillon" data-id="${item.id}" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">
          <option value="pendiente" ${item.estado === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
          <option value="encargado" ${item.estado === 'encargado' ? 'selected' : ''}>📋 Encargado</option>
          <option value="comprado" ${item.estado === 'comprado' ? 'selected' : ''}>✅ Comprado</option>
        </select>
      </td>
      <td>$${Number(item.costo || 0).toLocaleString('es-CL')}</td>
      <td style="color: var(--org-text-muted); font-size: 0.85rem;">${escapeHtml(item.notes || item.notas || '—')}</td>
      <td style="text-align: right;">
        <div class="row-actions" style="justify-content: flex-end;">
          <button type="button" class="btn-icon-action btn-edit-cotillon" data-id="${item.id}" title="Editar">
            <i class="ri-pencil-line"></i>
          </button>
          <button type="button" class="btn-icon-action btn-del btn-del-cotillon" data-id="${item.id}" title="Eliminar">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.select-status-cotillon').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.getAttribute('data-id');
      window.cumpleStore.updateItemCotillon(id, { estado: e.target.value });
    });
  });

  tbody.querySelectorAll('.btn-edit-cotillon').forEach(btn => {
    btn.addEventListener('click', () => openModalCotillon(btn.getAttribute('data-id')));
  });

  tbody.querySelectorAll('.btn-del-cotillon').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Eliminar este ítem de cotillón?')) {
        window.cumpleStore.deleteItemCotillon(id);
      }
    });
  });
}

/**
 * ==========================================================================
 * GESTIÓN DE CRONOGRAMA
 * ==========================================================================
 */
function renderCronograma() {
  const container = document.getElementById('timelineContainer');
  if (!container || !window.cumpleStore) return;

  const cronograma = window.cumpleStore.getCronograma();
  container.innerHTML = '';

  if (cronograma.length === 0) {
    container.innerHTML = `<p style="color: var(--org-text-muted); padding: 1.5rem 0;">No has agregado actividades al cronograma.</p>`;
    return;
  }

  cronograma.forEach(c => {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
          <span class="timeline-time-badge"><i class="ri-time-line"></i> ${escapeHtml(c.hora)}</span>
          <div class="row-actions">
            <button type="button" class="btn-icon-action btn-edit-crono" data-id="${c.id}" title="Editar">
              <i class="ri-pencil-line"></i>
            </button>
            <button type="button" class="btn-icon-action btn-del btn-del-crono" data-id="${c.id}" title="Eliminar">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
        <h4>${escapeHtml(c.titulo)}</h4>
        <p>${escapeHtml(c.descripcion || '')}</p>
      </div>
    `;

    container.appendChild(item);
  });

  container.querySelectorAll('.btn-edit-crono').forEach(btn => {
    btn.addEventListener('click', () => openModalCronograma(btn.getAttribute('data-id')));
  });

  container.querySelectorAll('.btn-del-crono').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Eliminar esta actividad del cronograma?')) {
        window.cumpleStore.deleteItemCronograma(id);
      }
    });
  });
}

/**
 * ==========================================================================
 * MODALES Y FORMULARIOS
 * ==========================================================================
 */
function initModals() {
  // Cerrar modales al hacer clic en close o overlay
  document.querySelectorAll('.org-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('close-modal')) {
        modal.style.display = 'none';
      }
    });
  });

  // Modal Invitado
  document.getElementById('btnOpenModalAddInvitado')?.addEventListener('click', () => openModalInvitado());
  document.getElementById('formModalInvitado')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('invitadoEditId').value;
    const data = {
      nombre: document.getElementById('mInvNombre').value.trim(),
      telefono: document.getElementById('mInvTelefono').value.trim(),
      asistira: document.getElementById('mInvAsistencia').value === 'true',
      adultos: parseInt(document.getElementById('mInvAdultos').value, 10) || 0,
      ninos: parseInt(document.getElementById('mInvNinos').value, 10) || 0,
      disfraz: document.getElementById('mInvDisfraz').value.trim(),
      alergias: document.getElementById('mInvAlergias').value.trim(),
      dedicatoria: document.getElementById('mInvDedicatoria').value.trim(),
      mesaId: document.getElementById('mInvMesa').value || null
    };

    if (editId) {
      window.cumpleStore.updateInvitado(editId, data);
    } else {
      window.cumpleStore.addInvitado(data);
    }
    document.getElementById('modalInvitado').style.display = 'none';
  });

  // Modal Mesa
  document.getElementById('btnOpenModalAddMesa')?.addEventListener('click', () => openModalMesa());
  document.getElementById('formModalMesa')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('mesaEditId').value;
    const data = {
      nombre: document.getElementById('mMesaNombre').value.trim(),
      numero: parseInt(document.getElementById('mMesaNumero').value, 10),
      capacidad: parseInt(document.getElementById('mMesaCapacidad').value, 10)
    };

    if (editId) {
      window.cumpleStore.updateMesa(editId, data);
    } else {
      window.cumpleStore.addMesa(data);
    }
    document.getElementById('modalMesa').style.display = 'none';
  });

  // Modal Comida
  document.getElementById('btnOpenModalAddComida')?.addEventListener('click', () => openModalComida());
  document.getElementById('formModalComida')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('comidaEditId').value;
    const data = {
      categoria: document.getElementById('mComCategoria').value,
      item: document.getElementById('mComItem').value.trim(),
      cantidad: document.getElementById('mComCantidad').value.trim(),
      costo: parseInt(document.getElementById('mComCosto').value, 10) || 0,
      estado: document.getElementById('mComEstado').value,
      notas: document.getElementById('mComNotas').value.trim()
    };

    if (editId) {
      window.cumpleStore.updateItemComida(editId, data);
    } else {
      window.cumpleStore.addItemComida(data);
    }
    document.getElementById('modalComida').style.display = 'none';
  });

  // Modal Cotillón
  document.getElementById('btnOpenModalAddCotillon')?.addEventListener('click', () => openModalCotillon());
  document.getElementById('formModalCotillon')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('cotillonEditId').value;
    const data = {
      categoria: document.getElementById('mCotCategoria').value,
      item: document.getElementById('mCotItem').value.trim(),
      cantidad: document.getElementById('mCotCantidad').value.trim(),
      costo: parseInt(document.getElementById('mCotCosto').value, 10) || 0,
      estado: document.getElementById('mCotEstado').value,
      notas: document.getElementById('mCotNotas').value.trim()
    };

    if (editId) {
      window.cumpleStore.updateItemCotillon(editId, data);
    } else {
      window.cumpleStore.addItemCotillon(data);
    }
    document.getElementById('modalCotillon').style.display = 'none';
  });

  // Modal Cronograma
  document.getElementById('btnOpenModalAddCronograma')?.addEventListener('click', () => openModalCronograma());
  document.getElementById('formModalCronograma')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('cronogramaEditId').value;
    const data = {
      hora: document.getElementById('mCronHora').value,
      titulo: document.getElementById('mCronTitulo').value.trim(),
      descripcion: document.getElementById('mCronDesc').value.trim()
    };

    if (editId) {
      window.cumpleStore.updateItemCronograma(editId, data);
    } else {
      window.cumpleStore.addItemCronograma(data);
    }
    document.getElementById('modalCronograma').style.display = 'none';
  });
}

function openModalInvitado(id = null) {
  const modal = document.getElementById('modalInvitado');
  const form = document.getElementById('formModalInvitado');
  form.reset();
  document.getElementById('invitadoEditId').value = id || '';

  // Rellenar mesas en select
  const selectMesa = document.getElementById('mInvMesa');
  selectMesa.innerHTML = `<option value="">-- Sin mesa asignada --</option>`;
  const mesas = window.cumpleStore.getMesas();
  mesas.forEach(m => {
    selectMesa.innerHTML += `<option value="${m.id}">Mesa ${m.numero}: ${escapeHtml(m.nombre)}</option>`;
  });

  if (id) {
    document.getElementById('modalInvitadoTitle').innerText = 'Editar Invitado';
    const inv = window.cumpleStore.getInvitados().find(i => i.id === id);
    if (inv) {
      document.getElementById('mInvNombre').value = inv.nombre || '';
      document.getElementById('mInvTelefono').value = inv.telefono || '';
      document.getElementById('mInvAsistencia').value = inv.asistira ? 'true' : 'false';
      document.getElementById('mInvAdultos').value = inv.adultos || 1;
      document.getElementById('mInvNinos').value = inv.ninos || 0;
      document.getElementById('mInvDisfraz').value = inv.disfraz || '';
      document.getElementById('mInvAlergias').value = inv.alergias || '';
      document.getElementById('mInvDedicatoria').value = inv.dedicatoria || '';
      selectMesa.value = inv.mesaId || '';
    }
  } else {
    document.getElementById('modalInvitadoTitle').innerText = 'Agregar Nuevo Invitado';
    document.getElementById('mInvAdultos').value = 1;
    document.getElementById('mInvNinos').value = 0;
  }

  modal.style.display = 'flex';
}

function openModalMesa(id = null) {
  const modal = document.getElementById('modalMesa');
  const form = document.getElementById('formModalMesa');
  form.reset();
  document.getElementById('mesaEditId').value = id || '';

  const mesas = window.cumpleStore.getMesas();
  if (id) {
    document.getElementById('modalMesaTitle').innerText = 'Editar Mesa';
    const m = mesas.find(x => x.id === id);
    if (m) {
      document.getElementById('mMesaNombre').value = m.nombre;
      document.getElementById('mMesaNumero').value = m.numero;
      document.getElementById('mMesaCapacidad').value = m.capacidad;
    }
  } else {
    document.getElementById('modalMesaTitle').innerText = 'Crear Nueva Mesa';
    document.getElementById('mMesaNumero').value = (mesas.length || 0) + 1;
    document.getElementById('mMesaCapacidad').value = 8;
  }

  modal.style.display = 'flex';
}

function openModalComida(id = null) {
  const modal = document.getElementById('modalComida');
  const form = document.getElementById('formModalComida');
  form.reset();
  document.getElementById('comidaEditId').value = id || '';

  if (id) {
    document.getElementById('modalComidaTitle').innerText = 'Editar Ítem de Comida';
    const c = window.cumpleStore.getComida().find(x => x.id === id);
    if (c) {
      document.getElementById('mComCategoria').value = c.categoria;
      document.getElementById('mComItem').value = c.item;
      document.getElementById('mComCantidad').value = c.cantidad;
      document.getElementById('mComCosto').value = c.costo || 0;
      document.getElementById('mComEstado').value = c.estado;
      document.getElementById('mComNotas').value = c.notes || c.notas || '';
    }
  } else {
    document.getElementById('modalComidaTitle').innerText = 'Agregar Ítem de Comida';
  }

  modal.style.display = 'flex';
}

function openModalCotillon(id = null) {
  const modal = document.getElementById('modalCotillon');
  const form = document.getElementById('formModalCotillon');
  form.reset();
  document.getElementById('cotillonEditId').value = id || '';

  if (id) {
    document.getElementById('modalCotillonTitle').innerText = 'Editar Ítem de Cotillón';
    const c = window.cumpleStore.getCotillon().find(x => x.id === id);
    if (c) {
      document.getElementById('mCotCategoria').value = c.categoria;
      document.getElementById('mCotItem').value = c.item;
      document.getElementById('mCotCantidad').value = c.cantidad;
      document.getElementById('mCotCosto').value = c.costo || 0;
      document.getElementById('mCotEstado').value = c.estado;
      document.getElementById('mCotNotas').value = c.notes || c.notas || '';
    }
  } else {
    document.getElementById('modalCotillonTitle').innerText = 'Agregar Ítem de Cotillón';
  }

  modal.style.display = 'flex';
}

function openModalCronograma(id = null) {
  const modal = document.getElementById('modalCronograma');
  const form = document.getElementById('formModalCronograma');
  form.reset();
  document.getElementById('cronogramaEditId').value = id || '';

  if (id) {
    document.getElementById('modalCronogramaTitle').innerText = 'Editar Momento';
    const cr = window.cumpleStore.getCronograma().find(x => x.id === id);
    if (cr) {
      document.getElementById('mCronHora').value = cr.hora;
      document.getElementById('mCronTitulo').value = cr.titulo;
      document.getElementById('mCronDesc').value = cr.descripcion || '';
    }
  } else {
    document.getElementById('modalCronogramaTitle').innerText = 'Agregar Momento al Cronograma';
  }

  modal.style.display = 'flex';
}

/**
 * ==========================================================================
 * CONFIGURACIÓN DEL EVENTO
 * ==========================================================================
 */
function loadSettingsFormData() {
  if (!window.cumpleStore) return;
  const ev = window.cumpleStore.getData().evento || {};

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('setNombreCumpleanera', ev.nombreCumpleanera);
  setVal('setTitulo', ev.titulo);
  setVal('setFecha', ev.fecha);
  setVal('setHora', ev.hora);
  setVal('setLugar', ev.lugar);
  setVal('setDireccion', ev.direccion);
  setVal('setDressCode', ev.dressCode);
  setVal('setWhatsappOrganizador', ev.whatsappOrganizador);
}

function initSettingsForm() {
  document.getElementById('formEventSettings')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = window.cumpleStore.getData();
    data.evento = {
      ...data.evento,
      nombreCumpleanera: document.getElementById('setNombreCumpleanera').value.trim(),
      titulo: document.getElementById('setTitulo').value.trim(),
      fecha: document.getElementById('setFecha').value,
      hora: document.getElementById('setHora').value,
      lugar: document.getElementById('setLugar').value.trim(),
      direccion: document.getElementById('setDireccion').value.trim(),
      dressCode: document.getElementById('setDressCode').value.trim(),
      whatsappOrganizador: document.getElementById('setWhatsappOrganizador').value.trim()
    };
    window.cumpleStore.save(data);
    alert('¡Datos del evento guardados correctamente!');
  });
}

/**
 * ==========================================================================
 * EXPORTAR, IMPORTAR Y RESTAURAR
 * ==========================================================================
 */
function initBackupsAndPrint() {
  // Imprimir
  document.getElementById('btnPrintOrg')?.addEventListener('click', () => {
    window.print();
  });

  // Exportar JSON
  const handleExport = () => {
    const jsonStr = window.cumpleStore.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cumple-dominga-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  document.getElementById('btnExportJsonTop')?.addEventListener('click', handleExport);
  document.getElementById('btnExportJson')?.addEventListener('click', handleExport);

  // Importar JSON
  document.getElementById('inputImportJson')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const ok = window.cumpleStore.importJSON(event.target.result);
      if (ok) {
        alert('¡Respaldo cargado con éxito!');
      } else {
        alert('Error: El archivo no contiene un formato de respaldo válido.');
      }
    };
    reader.readAsText(file);
  });

  // Restablecer listas e itinerario oficial
  document.getElementById('btnResetDefaults')?.addEventListener('click', () => {
    if (confirm('¿Deseas restablecer el organizador? Esto dejará las listas limpias (sin invitados, mesas, comida ni cotillón de prueba) y cargará el itinerario oficial del día.')) {
      window.cumpleStore.resetToDefaults();
    }
  });
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
