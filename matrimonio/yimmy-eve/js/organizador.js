/**
 * ORGANIZADOR NUPCIAL — LÓGICA & PERSISTENCIA (LOCALSTORAGE)
 * Cositas Para Eventos
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadData();
  renderAll();
  setupEventListeners();
});

/* ==========================================================================
   1. Datos Iniciales & Persistencia
   ========================================================================== */
const STORAGE_KEY_TABLES = 'boda_org_tables_v2';
const STORAGE_KEY_TIMELINE = 'boda_org_timeline_v2';
const STORAGE_KEY_SHOPPING = 'boda_org_shopping_v2';
const STORAGE_KEY_UNASSIGNED = 'boda_org_unassigned_v2';

let tables = [];
let timeline = [];
let shopping = [];
let unassignedGuests = [];

function loadData() {
  const savedTables = localStorage.getItem(STORAGE_KEY_TABLES);
  if (savedTables) {
    tables = JSON.parse(savedTables);
  } else {
    tables = [
      {
        id: 't_1',
        name: 'Mesa 1: Mesa de los Novios',
        capacity: 2,
        guests: ['Cristopher', 'Reny']
      },
      {
        id: 't_2',
        name: 'Mesa 2: Familia de la Novia',
        capacity: 8,
        guests: ['Pamela', 'Marcial', 'Constanza', 'Cecilia', 'Barbara']
      },
      {
        id: 't_3',
        name: 'Mesa 3: Familia del Novio',
        capacity: 8,
        guests: ['Carlos', 'Carola', 'Felipe', 'Camila']
      },
      {
        id: 't_4',
        name: 'Mesa 4: Amigos del Colegio',
        capacity: 8,
        guests: ['Jessica', 'Eduardo', 'Guisselle', 'Nicolas']
      },
      {
        id: 't_5',
        name: 'Mesa 5: Amigos de la Universidad',
        capacity: 8,
        guests: ['Jaqueline', 'Luis', 'Isaac', 'Denisse']
      },
      {
        id: 't_6',
        name: 'Mesa 6: Mesa Infantil / Niños',
        capacity: 6,
        guests: ['Jhankhel', 'Daniela', 'Hugo']
      }
    ];
  }

  const savedUnassigned = localStorage.getItem(STORAGE_KEY_UNASSIGNED);
  if (savedUnassigned) {
    unassignedGuests = JSON.parse(savedUnassigned);
  } else {
    unassignedGuests = ['Roberto', 'Karen', 'Sandra', 'Yorka', 'Claudia'];
  }

  const savedTimeline = localStorage.getItem(STORAGE_KEY_TIMELINE);
  if (savedTimeline) {
    timeline = JSON.parse(savedTimeline);
  } else {
    timeline = [
      {
        id: 'act_1',
        time: '09:00',
        title: 'Maquillaje y Peinado de la Novia',
        responsible: 'Estilista & Novia',
        detail: 'Preparación en la suite de Casona Los Olivos',
        status: 'ok'
      },
      {
        id: 'act_2',
        time: '11:30',
        title: 'Llegada del Fotógrafo (Sesión previa)',
        responsible: 'Equipo Fotográfico',
        detail: 'Fotos de detalles: vestido, anillos, zapatos y traje del novio',
        status: 'ok'
      },
      {
        id: 'act_3',
        time: '14:00',
        title: 'Montaje floral y mesas',
        responsible: 'Decoradora Floral',
        detail: 'Revisión de mantelería, flores y centros de mesa',
        status: 'ok'
      },
      {
        id: 'act_4',
        time: '15:30',
        title: 'Prueba de Sonido & Micrófonos con DJ',
        responsible: 'DJ & Sonidista',
        detail: 'Confirmar lista de canciones y micrófono inalámbrico para votos',
        status: 'pending'
      },
      {
        id: 'act_5',
        time: '16:30',
        title: 'Llegada y Bienvenida de los Invitados',
        responsible: 'Equipo Recepción',
        detail: 'Entrega de aguas aromáticas frescas y música acústica',
        status: 'pending'
      },
      {
        id: 'act_6',
        time: '17:00',
        title: 'Ceremonia Civil & Votos Simbólicos',
        responsible: 'Oficial Civil & Padrinos',
        detail: 'Entrada de los novios, lectura de votos y firma',
        status: 'pending'
      },
      {
        id: 'act_7',
        time: '18:00',
        title: 'Cóctel Campestre & Momento Pasto 🧺',
        responsible: 'Banquetera',
        detail: 'Aperitivos fríos y calientes, fotos de grupos en jardines',
        status: 'pending'
      },
      {
        id: 'act_8',
        time: '19:30',
        title: 'Entrada Triunfal al Salón & Banquete',
        responsible: 'Maestro de Ceremonia & Banquetera',
        detail: 'Cena principal de 3 tiempos para los invitados',
        status: 'pending'
      },
      {
        id: 'act_9',
        time: '20:30',
        title: 'Brindis de Honor & Palabras',
        responsible: 'Padres y Testigos',
        detail: 'Champaña servida en todas las mesas',
        status: 'pending'
      },
      {
        id: 'act_10',
        time: '21:00',
        title: 'Primer Baile de Novios (Vals)',
        responsible: 'DJ & Novios',
        detail: 'Encendido de luces tenues y humo bajo',
        status: 'pending'
      },
      {
        id: 'act_11',
        time: '21:15',
        title: 'Apertura de Fiesta & Barra Abierta',
        responsible: 'Bartenders & DJ',
        detail: 'Inicio de la fiesta bailable con música variada',
        status: 'pending'
      },
      {
        id: 'act_12',
        time: '23:30',
        title: 'Lanzamiento del Ramo & Liga',
        responsible: 'Animador / Novios',
        detail: 'Llamar a todos los solteros y solteras al centro',
        status: 'pending'
      },
      {
        id: 'act_13',
        time: '00:30',
        title: 'Bajón de Medianoche (Snacks calientes)',
        responsible: 'Banquetera',
        detail: 'Empanaditas, tapaditos y mini churros',
        status: 'pending'
      },
      {
        id: 'act_14',
        time: '02:00',
        title: 'Despedida con Chispitas & Cierre',
        responsible: 'Todos los Invitados',
        detail: 'Túnel de luces de bengala para despedir a los recién casados',
        status: 'pending'
      }
    ];
  }

  const savedShopping = localStorage.getItem(STORAGE_KEY_SHOPPING);
  if (savedShopping) {
    shopping = JSON.parse(savedShopping);
  } else {
    shopping = [
      {
        id: 'shop_1',
        item: 'Copas de cristal grabadas para el brindis',
        category: 'Ceremonia',
        detail: 'Grabadas con C & R y fecha 14.11.2026',
        cost: '$18.000',
        status: 'ok'
      },
      {
        id: 'shop_2',
        item: 'Cesta de mimbre para pétalos de flores',
        category: 'Ceremonia',
        detail: 'Comprar 2 cestitas rústicas en Meiggs o feria artesanal',
        cost: '$9.000',
        status: 'ok'
      },
      {
        id: 'shop_3',
        item: 'Marcadores de números para las mesas',
        category: 'Decoración',
        detail: 'Números en madera dorada del 1 al 10',
        cost: '$15.000',
        status: 'ok'
      },
      {
        id: 'shop_4',
        item: 'Pizarra rústica de bienvenida "Bienvenidos a nuestra boda"',
        category: 'Decoración',
        detail: 'Caballete de madera y tiza líquida blanca',
        cost: '$22.000',
        status: 'pending'
      },
      {
        id: 'shop_5',
        item: 'Kit de luces de bengala largas (100 unidades)',
        category: 'Fiesta',
        detail: 'Para la despedida nocturna en el jardín',
        cost: '$16.000',
        status: 'pending'
      },
      {
        id: 'shop_6',
        item: 'Cotillón luminoso LED (varitas, lentes, pulseras)',
        category: 'Fiesta',
        detail: 'Pack fiesta flúor para 80 personas',
        cost: '$45.000',
        status: 'pending'
      },
      {
        id: 'shop_7',
        item: 'Pantuflas / sandalias cómodas para invitadas',
        category: 'Detalles',
        detail: '30 pares tallas variadas para descansar los tacones en el pasto',
        cost: '$35.000',
        status: 'pending'
      },
      {
        id: 'shop_8',
        item: 'Canasto de emergencia para baños de damas y varones',
        category: 'Detalles',
        detail: 'Desodorante, costurero, chicles, toallitas, horquillas, curitas',
        cost: '$14.000',
        status: 'pending'
      },
      {
        id: 'shop_9',
        item: 'Lazos y cintas de tela para el auto de los novios',
        category: 'Ceremonia',
        detail: 'Cinta de gasa marfil y tul',
        cost: '$8.500',
        status: 'pending'
      },
      {
        id: 'shop_10',
        item: 'Recuerdos especiales para padrinos y testigos',
        category: 'Regalos',
        detail: 'Vinos reserva con etiqueta personalizada de Cositas Para Eventos',
        cost: '$32.000',
        status: 'pending'
      }
    ];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(tables));
  localStorage.setItem(STORAGE_KEY_UNASSIGNED, JSON.stringify(unassignedGuests));
  localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(timeline));
  localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(shopping));
}

/* ==========================================================================
   2. Pestañas de Navegación
   ========================================================================== */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.org-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.target);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/* ==========================================================================
   3. Renderizador General
   ========================================================================== */
function renderAll() {
  renderMetrics();
  renderTables();
  renderUnassignedList();
  renderTimeline();
  renderShopping();
}

function renderMetrics() {
  // Mesas
  let totalCapacity = 0;
  let totalSeated = 0;
  tables.forEach(t => {
    totalCapacity += t.capacity;
    totalSeated += t.guests.length;
  });

  const totalTablesEl = document.getElementById('metricTotalTables');
  const totalSeatedEl = document.getElementById('metricTotalSeated');
  const availableSeatsEl = document.getElementById('metricAvailableSeats');

  if (totalTablesEl) totalTablesEl.textContent = tables.length;
  if (totalSeatedEl) totalSeatedEl.textContent = `${totalSeated} / ${totalCapacity}`;
  if (availableSeatsEl) availableSeatsEl.textContent = Math.max(0, totalCapacity - totalSeated);

  // Timeline
  const okTimeline = timeline.filter(t => t.status === 'ok').length;
  const metricTimelineEl = document.getElementById('metricTimelineProgress');
  if (metricTimelineEl) metricTimelineEl.textContent = `${okTimeline} / ${timeline.length}`;

  // Shopping
  const okShopping = shopping.filter(s => s.status === 'ok').length;
  const metricShoppingEl = document.getElementById('metricShoppingProgress');
  if (metricShoppingEl) metricShoppingEl.textContent = `${okShopping} / ${shopping.length}`;
}

/* ==========================================================================
   4. MÓDULO 1: ORGANIZADOR DE MESAS
   ========================================================================== */
function renderTables() {
  const container = document.getElementById('tablesGrid');
  if (!container) return;

  container.innerHTML = '';

  tables.forEach(table => {
    const isFull = table.guests.length >= table.capacity;
    const card = document.createElement('div');
    card.className = 'table-card';

    let guestsHtml = '';
    if (table.guests.length === 0) {
      guestsHtml = '<li style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Sin invitados asignados aún</li>';
    } else {
      table.guests.forEach((guest, idx) => {
        guestsHtml += `
          <li class="guest-seat-item">
            <span>🪑 ${guest}</span>
            <button class="btn-remove-seat" onclick="removeGuestFromTable('${table.id}', ${idx})" title="Desasignar invitado">
              <i class="ri-close-line"></i>
            </button>
          </li>
        `;
      });
    }

    card.innerHTML = `
      <div class="table-card-header">
        <div>
          <h3 class="table-card-title">${table.name}</h3>
          <span style="font-size: 0.78rem; color: var(--gold-dark); font-weight: 600;">Mesa Nupcial</span>
        </div>
        <span class="table-badge-capacity ${isFull ? 'full' : ''}">
          ${table.guests.length} / ${table.capacity} ${isFull ? '• Completa' : 'Asientos'}
        </span>
      </div>
      <ul class="table-guests-list">
        ${guestsHtml}
      </ul>
      <div class="table-card-footer">
        <button class="btn-add-to-table" ${isFull ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} onclick="openAssignModal('${table.id}')">
          <i class="ri-user-add-line"></i> Asignar Invitado
        </button>
        <button class="btn-delete-table" onclick="deleteTable('${table.id}')" title="Eliminar mesa">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderUnassignedList() {
  const listEl = document.getElementById('unassignedList');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (unassignedGuests.length === 0) {
    listEl.innerHTML = '<li style="font-size: 0.85rem; color: var(--text-muted); padding: 8px 0; text-align: center;">¡Todos los invitados están asignados! 🎉</li>';
    return;
  }

  unassignedGuests.forEach((guest, idx) => {
    const item = document.createElement('li');
    item.className = 'unassigned-item';
    item.innerHTML = `
      <span>👤 ${guest}</span>
      <button class="btn-header" style="padding: 3px 8px; font-size: 0.75rem;" onclick="quickAssignGuest(${idx})">
        Ubicar ↗
      </button>
    `;
    listEl.appendChild(item);
  });
}

window.deleteTable = function(tableId) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  if (confirm(`¿Estás seguro de eliminar la "${table.name}"? Los invitados sentados volverán a la lista de pendientes.`)) {
    // Return guests to unassigned list
    table.guests.forEach(g => unassignedGuests.push(g));
    tables = tables.filter(t => t.id !== tableId);
    saveData();
    renderAll();
  }
};

window.removeGuestFromTable = function(tableId, guestIndex) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  const removedGuest = table.guests.splice(guestIndex, 1)[0];
  unassignedGuests.push(removedGuest);
  saveData();
  renderAll();
};

window.openAssignModal = function(tableId) {
  const targetTable = tables.find(t => t.id === tableId);
  if (!targetTable) return;

  if (unassignedGuests.length === 0) {
    const customName = prompt(`No hay invitados pendientes en lista. Escribe el nombre del invitado para agregar a "${targetTable.name}":`);
    if (customName && customName.trim()) {
      targetTable.guests.push(customName.trim());
      saveData();
      renderAll();
    }
    return;
  }

  // Populate assign modal select
  const modal = document.getElementById('assignModal');
  const select = document.getElementById('selectAssignGuest');
  const tableTitle = document.getElementById('assignModalTableTitle');

  if (!modal || !select) return;

  tableTitle.textContent = targetTable.name;
  select.innerHTML = '<option value="">-- Selecciona un invitado --</option>';

  unassignedGuests.forEach((g, idx) => {
    select.innerHTML += `<option value="${idx}">${g}</option>`;
  });

  modal.dataset.targetTableId = tableId;
  modal.classList.add('active');
};

window.quickAssignGuest = function(unassignedIdx) {
  const guest = unassignedGuests[unassignedIdx];
  // Find first table with available seat
  const availableTable = tables.find(t => t.guests.length < t.capacity);
  if (!availableTable) {
    alert('No hay mesas con asientos libres. Por favor crea una nueva mesa primero.');
    return;
  }

  availableTable.guests.push(guest);
  unassignedGuests.splice(unassignedIdx, 1);
  saveData();
  renderAll();
};

/* ==========================================================================
   5. MÓDULO 2: CRONOGRAMA & ACTIVIDADES
   ========================================================================== */
function renderTimeline() {
  const tbody = document.getElementById('timelineTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  timeline.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const isOk = item.status === 'ok';

    tr.innerHTML = `
      <td><span class="time-badge"><i class="ri-time-line"></i> ${item.time}</span></td>
      <td>
        <strong style="color: var(--primary-forest); font-size: 0.95rem;">${item.title}</strong>
      </td>
      <td><span style="color: var(--gold-dark); font-weight: 600;"><i class="ri-user-star-line"></i> ${item.responsible}</span></td>
      <td style="color: var(--text-muted); font-size: 0.88rem;">${item.detail}</td>
      <td>
        <button class="badge-status ${isOk ? 'ok' : 'pending'}" onclick="toggleTimelineStatus(${idx})" title="Clic para cambiar estado">
          ${isOk ? '<i class="ri-checkbox-circle-fill"></i> Listo / OK' : '<i class="ri-hourglass-2-line"></i> Pendiente'}
        </button>
      </td>
      <td>
        <button class="btn-table-del" onclick="deleteTimelineActivity(${idx})" title="Eliminar actividad">
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

window.toggleTimelineStatus = function(idx) {
  timeline[idx].status = timeline[idx].status === 'ok' ? 'pending' : 'ok';
  saveData();
  renderAll();
};

window.deleteTimelineActivity = function(idx) {
  if (confirm(`¿Eliminar la actividad "${timeline[idx].title}"?`)) {
    timeline.splice(idx, 1);
    saveData();
    renderAll();
  }
};

/* ==========================================================================
   6. MÓDULO 3: LISTA DE COMPRAS & NECESIDADES
   ========================================================================== */
function renderShopping() {
  const tbody = document.getElementById('shoppingTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  shopping.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const isOk = item.status === 'ok';

    tr.innerHTML = `
      <td>
        <strong style="color: var(--primary-forest); font-size: 0.95rem;">${item.item}</strong>
      </td>
      <td><span class="time-badge" style="background: var(--bg-main); font-size: 0.78rem;">${item.category}</span></td>
      <td style="color: var(--text-muted); font-size: 0.88rem;">${item.detail}</td>
      <td><strong style="color: var(--gold-dark);">${item.cost || '—'}</strong></td>
      <td>
        <button class="badge-status ${isOk ? 'ok' : 'pending'}" onclick="toggleShoppingStatus(${idx})" title="Clic para cambiar estado">
          ${isOk ? '<i class="ri-check-double-line"></i> Comprado / OK' : '<i class="ri-time-line"></i> Pendiente'}
        </button>
      </td>
      <td>
        <button class="btn-table-del" onclick="deleteShoppingItem(${idx})" title="Eliminar ítem">
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

window.toggleShoppingStatus = function(idx) {
  shopping[idx].status = shopping[idx].status === 'ok' ? 'pending' : 'ok';
  saveData();
  renderAll();
};

window.deleteShoppingItem = function(idx) {
  if (confirm(`¿Eliminar "${shopping[idx].item}" de la lista de compras?`)) {
    shopping.splice(idx, 1);
    saveData();
    renderAll();
  }
};

/* ==========================================================================
   7. Formularios y Event Listeners
   ========================================================================== */
function setupEventListeners() {
  // 1. Form Crear Mesa
  const formAddTable = document.getElementById('formAddTable');
  if (formAddTable) {
    formAddTable.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('newTableName');
      const capInput = document.getElementById('newTableCapacity');

      const name = nameInput.value.trim();
      const capacity = parseInt(capInput.value, 10) || 8;

      if (!name) return;

      tables.push({
        id: 't_' + Date.now(),
        name: name,
        capacity: capacity,
        guests: []
      });

      nameInput.value = '';
      saveData();
      renderAll();
    });
  }

  // 2. Form Agregar Invitado a la lista general
  const formAddUnassigned = document.getElementById('formAddUnassigned');
  if (formAddUnassigned) {
    formAddUnassigned.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestInput = document.getElementById('newGuestName');
      const name = guestInput.value.trim();
      if (!name) return;

      unassignedGuests.push(name);
      guestInput.value = '';
      saveData();
      renderAll();
    });
  }

  // 3. Confirmar Asignación Modal
  const btnConfirmAssign = document.getElementById('btnConfirmAssign');
  const assignModal = document.getElementById('assignModal');
  if (btnConfirmAssign && assignModal) {
    btnConfirmAssign.addEventListener('click', () => {
      const select = document.getElementById('selectAssignGuest');
      const unassignedIdx = select.value;
      const targetTableId = assignModal.dataset.targetTableId;

      if (unassignedIdx === '') {
        alert('Por favor selecciona un invitado.');
        return;
      }

      const targetTable = tables.find(t => t.id === targetTableId);
      if (targetTable) {
        const guestName = unassignedGuests.splice(parseInt(unassignedIdx, 10), 1)[0];
        targetTable.guests.push(guestName);
        saveData();
        renderAll();
      }

      assignModal.classList.remove('active');
    });
  }

  // 4. Modal Nueva Actividad
  const btnOpenActivityModal = document.getElementById('btnOpenActivityModal');
  const activityModal = document.getElementById('activityModal');
  const formAddActivity = document.getElementById('formAddActivity');

  if (btnOpenActivityModal && activityModal) {
    btnOpenActivityModal.addEventListener('click', () => {
      activityModal.classList.add('active');
    });
  }

  if (formAddActivity && activityModal) {
    formAddActivity.addEventListener('submit', (e) => {
      e.preventDefault();
      const time = document.getElementById('actTime').value.trim();
      const title = document.getElementById('actTitle').value.trim();
      const responsible = document.getElementById('actResponsible').value.trim() || 'Novios / Coordinador';
      const detail = document.getElementById('actDetail').value.trim();
      const status = document.getElementById('actStatus').value;

      timeline.push({
        id: 'act_' + Date.now(),
        time: time,
        title: title,
        responsible: responsible,
        detail: detail,
        status: status
      });

      // Sort timeline by time
      timeline.sort((a, b) => a.time.localeCompare(b.time));

      formAddActivity.reset();
      activityModal.classList.remove('active');
      saveData();
      renderAll();
    });
  }

  // 5. Modal Nuevo Ítem de Compra
  const btnOpenShoppingModal = document.getElementById('btnOpenShoppingModal');
  const shoppingModal = document.getElementById('shoppingModal');
  const formAddShopping = document.getElementById('formAddShopping');

  if (btnOpenShoppingModal && shoppingModal) {
    btnOpenShoppingModal.addEventListener('click', () => {
      shoppingModal.classList.add('active');
    });
  }

  if (formAddShopping && shoppingModal) {
    formAddShopping.addEventListener('submit', (e) => {
      e.preventDefault();
      const item = document.getElementById('shopItem').value.trim();
      const category = document.getElementById('shopCategory').value;
      const detail = document.getElementById('shopDetail').value.trim();
      const cost = document.getElementById('shopCost').value.trim();
      const status = document.getElementById('shopStatus').value;

      shopping.push({
        id: 'shop_' + Date.now(),
        item: item,
        category: category,
        detail: detail,
        cost: cost,
        status: status
      });

      formAddShopping.reset();
      shoppingModal.classList.remove('active');
      saveData();
      renderAll();
    });
  }

  // Close modals
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.org-modal').forEach(m => m.classList.remove('active'));
    });
  });

  document.querySelectorAll('.org-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });

  // Print button
  const btnPrint = document.getElementById('btnPrintSummary');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}
