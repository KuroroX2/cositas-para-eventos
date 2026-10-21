/**
 * organizador.js - Panel de control y administración del Cumpleaños
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModals();
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
      (i.disfraz || '').toLowerCase().includes(searchVal) ||
      (i.telefono || '').toLowerCase().includes(searchVal)
    );
  }

  if (filterVal === 'si') {
    invitados = invitados.filter(i => i.asistira === true);
  } else if (filterVal === 'no') {
    invitados = invitados.filter(i => i.asistira === false);
  } else if (filterVal === 'sin-mesa') {
    invitados = invitados.filter(i => i.asistira === true && !i.mesaId);
  }

  tbody.innerHTML = '';

  if (invitados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--org-text-muted); padding: 2rem;">No se encontraron invitados con estos criterios.</td></tr>`;
    return;
  }

  invitados.forEach(inv => {
    const tr = document.createElement('tr');

    const statusBadge = inv.asistira
      ? `<span class="badge-status badge-yes"><i class="ri-check-line"></i> Asiste</span>`
      : `<span class="badge-status badge-no"><i class="ri-close-line"></i> No asiste</span>`;

    // Dropdown inline de mesas
    let mesaOptions = `<option value="">-- Sin mesa --</option>`;
    mesas.forEach(m => {
      const selected = (inv.mesaId === m.id) ? 'selected' : '';
      mesaOptions += `<option value="${m.id}" ${selected}>Mesa ${m.numero}: ${escapeHtml(m.nombre)}</option>`;
    });

    const phoneDigits = (inv.telefono || '').replace(/[^0-9]/g, '');
    const phoneLink = phoneDigits
      ? `<a href="https://wa.me/${phoneDigits}" target="_blank" class="btn-icon-action" title="Escribir por WhatsApp"><i class="ri-whatsapp-line" style="color: #25d366;"></i></a>`
      : '';

    tr.innerHTML = `
      <td>
        <strong>${escapeHtml(inv.nombre || '')}</strong>
        ${inv.dedicatoria ? `<div style="font-size: 0.78rem; color: #8b5cf6; font-style: italic;">💌 "${escapeHtml(inv.dedicatoria)}"</div>` : ''}
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <span>${escapeHtml(inv.telefono || '—')}</span>
          ${phoneLink}
        </div>
      </td>
      <td>${statusBadge}</td>
      <td style="text-align: center;">${inv.asistira ? (inv.adultos || 0) : '0'}</td>
      <td style="text-align: center;">${inv.asistira ? (inv.ninos || 0) : '0'}</td>
      <td>${escapeHtml(inv.disfraz || '—')}</td>
      <td>${escapeHtml(inv.alergias || '—')}</td>
      <td>
        ${inv.asistira ? `
          <select class="filter-select select-inline-mesa" data-invid="${inv.id}" style="font-size: 0.8rem; padding: 0.3rem 0.5rem;">
            ${mesaOptions}
          </select>
        ` : '<span style="color: #adb5bd;">—</span>'}
      </td>
      <td style="text-align: right;">
        <div class="row-actions" style="justify-content: flex-end;">
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
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--org-text-muted);">No has creado mesas aún. ¡Crea la primera para organizar a los invitados!</div>`;
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
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--org-text-muted); padding: 2rem;">No hay ítems de comida registrados.</td></tr>`;
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
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--org-text-muted); padding: 2rem;">No hay ítems de cotillón registrados.</td></tr>`;
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

  // Restaurar datos de ejemplo
  document.getElementById('btnResetDefaults')?.addEventListener('click', () => {
    if (confirm('¿Deseas restaurar los datos iniciales de ejemplo? Esto reemplazará las listas actuales.')) {
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
