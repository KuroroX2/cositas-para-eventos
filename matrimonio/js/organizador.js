/**
 * ORGANIZADOR NUPCIAL — LÓGICA & PERSISTENCIA (LOCALSTORAGE)
 * Incluye: Drag & Drop, Asignación de Parejas en la misma mesa,
 * Edición de Nombre y Capacidad de Mesas, y Modal de Ubicación.
 * Cositas Para Eventos
 */

// 19 Parejas oficiales iniciales migradas desde la demo
const DEFAULT_SEED_INVITATIONS = [
  { id: "inv_mt8t3dh4_mdcy", pases: 2, name1: "Roberto", name2: "Acompañante" },
  { id: "inv_mt7agi0j_r812", pases: 1, name1: "Karen", name2: "" },
  { id: "inv_mt7agb8r_yhi2", pases: 1, name1: "Sandra", name2: "" },
  { id: "inv_mt7ag1bu_s3mf", pases: 1, name1: "Jhankhel", name2: "" },
  { id: "inv_mt7afpe6_kfg4", pases: 1, name1: "Yorka", name2: "" },
  { id: "inv_mt7afe11_3wr0", pases: 2, name1: "Pamela", name2: "Marcial" },
  { id: "inv_mt7af2wd_bc93", pases: 1, name1: "Constanza", name2: "" },
  { id: "inv_mt7aerri_0o4h", pases: 1, name1: "Cecilia", name2: "" },
  { id: "inv_mt7aefqb_ewjp", pases: 1, name1: "Barbara", name2: "" },
  { id: "inv_mt7ae4tr_3c2o", pases: 1, name1: "Claudia", name2: "" },
  { id: "inv_mt7ado96_pjjz", pases: 2, name1: "Camila", name2: "Tah" },
  { id: "inv_mt7ad2wi_m84w", pases: 2, name1: "Daniela", name2: "Hugo" },
  { id: "inv_mt7acqee_bjth", pases: 2, name1: "Jessica", name2: "Eduardo" },
  { id: "inv_mt7ac5s2_2ko9", pases: 2, name1: "Cristopher", name2: "Reny" },
  { id: "inv_mt7abo4o_ixxm", pases: 2, name1: "Carlos", name2: "Carola" },
  { id: "inv_mt79v1i5_fj7j", pases: 2, name1: "Felipe", name2: "Camila" },
  { id: "inv_mt79ukht_iqcm", pases: 2, name1: "Guisselle", name2: "Nicolas" },
  { id: "inv_mt79u2qe_of3f", pases: 2, name1: "Jaqueline", name2: "Luis" },
  { id: "inv_mt797yfq_46ak", pases: 2, name1: "Isaac", name2: "Denisse" }
];

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadData();
  renderAll();
  setupEventListeners();
  initDragAndDrop();
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
    unassignedGuests = ['Roberto', 'Acompañante', 'Karen', 'Sandra', 'Yorka', 'Claudia', 'Tah'];
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
        time: '21:30',
        title: 'Apertura de Barra Libre & Fiesta',
        responsible: 'Barman & DJ',
        detail: 'Tragos preparados, cotillón y pista de baile habilitada',
        status: 'pending'
      },
      {
        id: 'act_12',
        time: '01:00',
        title: 'Bajón de Medianoche & Pizza / Tapaditos',
        responsible: 'Banquetera',
        detail: 'Comida reconfortante caliente para la fiesta',
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
        item: 'Kit de Luces de Bengala para Salida de Ceremonia',
        category: 'Ceremonia',
        detail: '100 unidades de chispas largas (45 cm) para el atardecer',
        cost: '$25.000',
        status: 'ok'
      },
      {
        id: 'shop_2',
        item: 'Cámaras Desechables Vintage para cada mesa',
        category: 'Detalles',
        detail: '8 cámaras instantáneas desechables para las mesas',
        cost: '$60.000',
        status: 'ok'
      },
      {
        id: 'shop_3',
        item: 'Pantuflas y Chalas Cómodas para la Fiesta',
        category: 'Fiesta',
        detail: '40 pares surtidos de tallas M y L para bailarines',
        cost: '$45.000',
        status: 'ok'
      },
      {
        id: 'shop_4',
        item: 'Kit de Baño / Emergencia (Hombres y Mujeres)',
        category: 'Varios',
        detail: 'Costurero, desodorantes, paracetamol, pañuelitos y mentas',
        cost: '$18.000',
        status: 'pending'
      },
      {
        id: 'shop_5',
        item: 'Carteles y Marcos para Códigos QR de Fotos',
        category: 'Decoración',
        detail: '6 marcos dorados de sobremesa con el link del álbum',
        cost: '$15.000',
        status: 'pending'
      },
      {
        id: 'shop_6',
        item: 'Bolsitas de Arroz y Pétalos de Olivo',
        category: 'Ceremonia',
        detail: '70 conos de papel kraft biodegradables',
        cost: '$12.000',
        status: 'pending'
      },
      {
        id: 'shop_7',
        item: 'Cotillón Neón y Pulseras Luminosas LED',
        category: 'Fiesta',
        detail: 'Pack fiesta flúor con lentes LED y barras de luz',
        cost: '$35.000',
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

function renderAll() {
  renderMetrics();
  renderTables();
  renderUnassignedList();
  renderTimeline();
  renderShopping();
}

/* ==========================================================================
   2. DETECCIÓN DE PAREJAS / MISMA INVITACIÓN (Acompañantes Vinculados)
   ========================================================================== */
function getCompanion(guestName) {
  if (!guestName) return null;
  const clean = guestName.trim().toLowerCase();

  // 1. Obtener invitaciones guardadas en localStorage
  let invs = [];
  try {
    const raw = localStorage.getItem('wedding_invitations_cloud_v1');
    if (raw) invs = JSON.parse(raw);
  } catch (e) {}

  const allInvs = [...invs, ...DEFAULT_SEED_INVITATIONS];

  for (const inv of allInvs) {
    if (inv.name1 && inv.name2) {
      const n1 = inv.name1.trim().toLowerCase();
      const n2 = inv.name2.trim().toLowerCase();
      if (clean === n1) return inv.name2.trim();
      if (clean === n2) return inv.name1.trim();
    }
  }
  return null;
}

function removeGuestFromEverywhere(guestName) {
  const clean = guestName.trim().toLowerCase();
  unassignedGuests = unassignedGuests.filter(g => g.trim().toLowerCase() !== clean);
  tables.forEach(t => {
    t.guests = t.guests.filter(g => g.trim().toLowerCase() !== clean);
  });
}

/**
 * Asigna un invitado a una mesa, y si tiene acompañante en la misma invitación,
 * también asigna automáticamente a su acompañante a la misma mesa.
 */
function assignGuestToTable(guestName, tableId) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return false;

  const companion = getCompanion(guestName);
  const companionAlreadyThere = companion && table.guests.some(g => g.trim().toLowerCase() === companion.trim().toLowerCase());

  let companionToMove = null;
  let neededSeats = 1;

  if (companion && !companionAlreadyThere) {
    companionToMove = companion;
    neededSeats = 2;
  }

  const availableSeats = table.capacity - table.guests.length;
  if (availableSeats < 1) {
    alert(`La "${table.name}" está completa. No tiene asientos disponibles.`);
    return false;
  }

  // Asignar al invitado principal
  removeGuestFromEverywhere(guestName);
  table.guests.push(guestName);

  let toastMessage = `¡Se asignó a ${guestName} a "${table.name}"!`;

  // Asignar automáticamente a la pareja si tienen la misma invitación
  if (companionToMove) {
    if (availableSeats >= 2) {
      removeGuestFromEverywhere(companionToMove);
      table.guests.push(companionToMove);
      toastMessage = `¡Se asignó a ${guestName} y a su acompañante (${companionToMove}) juntos a "${table.name}"!`;
    } else {
      alert(`Se asignó a ${guestName} a la "${table.name}", pero la mesa no tiene suficiente espacio libre para su acompañante (${companionToMove}). Aumenta la capacidad de la mesa para incluirlo.`);
    }
  }

  saveData();
  renderAll();
  showToast(toastMessage);
  return true;
}

function unassignGuest(guestName) {
  removeGuestFromEverywhere(guestName);
  unassignedGuests.push(guestName);
  saveData();
  renderAll();
  showToast(`Se movió a ${guestName} a la lista de invitados por ubicar.`);
}

/* ==========================================================================
   3. Renderizado de Métricas
   ========================================================================== */
function renderMetrics() {
  let totalCapacity = 0;
  let totalSeated = 0;

  tables.forEach(t => {
    totalCapacity += parseInt(t.capacity, 10) || 0;
    totalSeated += t.guests.length;
  });

  const totalTablesEl = document.getElementById('metricTotalTables');
  const totalSeatedEl = document.getElementById('metricTotalSeated');
  const availableSeatsEl = document.getElementById('metricAvailableSeats');

  if (totalTablesEl) totalTablesEl.textContent = tables.length;
  if (totalSeatedEl) totalSeatedEl.textContent = `${totalSeated} / ${totalCapacity}`;
  if (availableSeatsEl) availableSeatsEl.textContent = Math.max(0, totalCapacity - totalSeated);

  const okTimeline = timeline.filter(t => t.status === 'ok').length;
  const metricTimelineEl = document.getElementById('metricTimelineProgress');
  if (metricTimelineEl) metricTimelineEl.textContent = `${okTimeline} / ${timeline.length}`;

  const okShopping = shopping.filter(s => s.status === 'ok').length;
  const metricShoppingEl = document.getElementById('metricShoppingProgress');
  if (metricShoppingEl) metricShoppingEl.textContent = `${okShopping} / ${shopping.length}`;
}

/* ==========================================================================
   4. MÓDULO 1: ORGANIZADOR DE MESAS (CON DRAG & DROP Y BOTÓN EDITAR)
   ========================================================================== */
function renderTables() {
  const container = document.getElementById('tablesGrid');
  if (!container) return;

  container.innerHTML = '';

  tables.forEach(table => {
    const isFull = table.guests.length >= table.capacity;
    const card = document.createElement('div');
    card.className = 'table-card';
    card.dataset.tableId = table.id;

    // Dropzone attributes
    card.addEventListener('dragover', (e) => handleTableDragOver(e, table.id));
    card.addEventListener('dragleave', (e) => handleTableDragLeave(e, table.id));
    card.addEventListener('drop', (e) => handleTableDrop(e, table.id));

    let guestsHtml = '';
    if (table.guests.length === 0) {
      guestsHtml = '<li style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 8px 0;">Sin invitados asignados aún (arrastra aquí)</li>';
    } else {
      table.guests.forEach((guest, idx) => {
        const companion = getCompanion(guest);
        const companionBadge = companion ? `<small style="font-size: 0.72rem; color: #99742a; font-weight: 700;" title="Acompañante de invitación: ${escapeHtml(companion)}">👥 Pareja: ${escapeHtml(companion)}</small>` : '';

        guestsHtml += `
          <li class="guest-seat-item" draggable="true" data-guest="${escapeHtml(guest)}" data-table-id="${table.id}" title="Arrastra a otra mesa o a la lista de pendientes">
            <div class="guest-name-pill">
              <i class="ri-user-line"></i>
              <span>${escapeHtml(guest)}</span>
              ${companionBadge}
            </div>
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
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
            <h3 class="table-card-title">${escapeHtml(table.name)}</h3>
            <button class="btn-table-edit" onclick="openEditTableModal('${table.id}')" title="Editar nombre y capacidad de asientos">
              <i class="ri-edit-line"></i> <span>Editar</span>
            </button>
          </div>
          <span style="font-size: 0.76rem; color: var(--gold-dark); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Mesa de Banquete</span>
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

  initItemDragListeners();
}

function renderUnassignedList() {
  const listEl = document.getElementById('unassignedList');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (unassignedGuests.length === 0) {
    listEl.innerHTML = '<li style="font-size: 0.85rem; color: var(--text-muted); padding: 12px 0; text-align: center;">¡Todos los invitados están asignados! 🎉</li>';
    return;
  }

  unassignedGuests.forEach((guest, idx) => {
    const companion = getCompanion(guest);
    const companionBadge = companion ? `<small style="font-size: 0.7rem; color: #99742a; font-weight: 700; display: block;">👥 Pareja: ${escapeHtml(companion)}</small>` : '';

    const item = document.createElement('li');
    item.className = 'unassigned-item';
    item.draggable = true;
    item.dataset.guest = guest;
    item.dataset.source = 'unassigned';
    item.title = "Arrastra hacia cualquier mesa o pulsa 'Ubicar'";

    item.innerHTML = `
      <div class="guest-name-pill" style="flex-direction: column; align-items: flex-start; gap: 2px;">
        <span style="display: flex; align-items: center; gap: 5px;">
          <i class="ri-user-line" style="color: #99742a;"></i>
          <strong>${escapeHtml(guest)}</strong>
        </span>
        ${companionBadge}
      </div>
      <button class="btn-assign-quick" onclick="openPickTableModal('${escapeHtml(guest)}')">
        Ubicar ↗
      </button>
    `;
    listEl.appendChild(item);
  });

  initItemDragListeners();
}

/* ==========================================================================
   5. DRAG & DROP API (Arrastrar Invitados a Mesas)
   ========================================================================== */
let draggedGuestName = null;
let draggedSourceTableId = null;

function initDragAndDrop() {
  const unassignedListEl = document.getElementById('unassignedList');
  if (unassignedListEl) {
    unassignedListEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      unassignedListEl.classList.add('drag-over');
    });
    unassignedListEl.addEventListener('dragleave', () => {
      unassignedListEl.classList.remove('drag-over');
    });
    unassignedListEl.addEventListener('drop', (e) => {
      e.preventDefault();
      unassignedListEl.classList.remove('drag-over');
      if (draggedGuestName) {
        unassignGuest(draggedGuestName);
        draggedGuestName = null;
        draggedSourceTableId = null;
      }
    });
  }
}

function initItemDragListeners() {
  document.querySelectorAll('[draggable="true"]').forEach(el => {
    el.addEventListener('dragstart', (e) => {
      draggedGuestName = el.dataset.guest;
      draggedSourceTableId = el.dataset.tableId || 'unassigned';
      el.classList.add('dragging');
      e.dataTransfer.setData('text/plain', draggedGuestName);
      e.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      document.querySelectorAll('.table-card').forEach(c => c.classList.remove('drag-over'));
      const u = document.getElementById('unassignedList');
      if (u) u.classList.remove('drag-over');
    });
  });
}

function handleTableDragOver(e, tableId) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const card = document.querySelector(`.table-card[data-table-id="${tableId}"]`);
  if (card) card.classList.add('drag-over');
}

function handleTableDragLeave(e, tableId) {
  const card = document.querySelector(`.table-card[data-table-id="${tableId}"]`);
  if (card) card.classList.remove('drag-over');
}

function handleTableDrop(e, tableId) {
  e.preventDefault();
  const card = document.querySelector(`.table-card[data-table-id="${tableId}"]`);
  if (card) card.classList.remove('drag-over');

  const guestName = draggedGuestName || e.dataTransfer.getData('text/plain');
  if (!guestName) return;

  assignGuestToTable(guestName, tableId);
  draggedGuestName = null;
  draggedSourceTableId = null;
}

/* ==========================================================================
   6. MODAL UBICAR: MOSTRAR LISTA DE MESAS DISPONIBLES AL PULSAR "UBICAR"
   ========================================================================== */
window.openPickTableModal = function(guestName) {
  const modal = document.getElementById('pickTableModal');
  const nameEl = document.getElementById('pickGuestName');
  const companionAlert = document.getElementById('pickCompanionAlert');
  const companionNameEl = document.getElementById('pickCompanionName');
  const listEl = document.getElementById('pickTablesList');

  if (!modal || !nameEl || !listEl) return;

  nameEl.textContent = guestName;

  const companion = getCompanion(guestName);
  if (companion) {
    companionAlert.style.display = 'block';
    companionNameEl.textContent = companion;
  } else {
    companionAlert.style.display = 'none';
  }

  listEl.innerHTML = '';

  tables.forEach(table => {
    const freeSeats = table.capacity - table.guests.length;
    const needed = companion ? 2 : 1;
    const hasSpace = freeSeats >= needed;

    const row = document.createElement('div');
    row.className = `pick-table-row ${hasSpace ? '' : 'disabled'}`;

    row.innerHTML = `
      <div class="pick-table-info">
        <span class="pick-table-name">${escapeHtml(table.name)}</span>
        <span class="pick-table-seats">
          ${freeSeats} asiento(s) libre(s) • ${table.guests.length} de ${table.capacity} ocupados
        </span>
      </div>
      <button class="btn-select-table" ${hasSpace ? '' : 'disabled'} onclick="handlePickTableSelect('${escapeHtml(guestName)}', '${table.id}')">
        ${hasSpace ? 'Asignar a esta Mesa ↗' : 'Mesa Llena'}
      </button>
    `;
    listEl.appendChild(row);
  });

  modal.classList.add('active');
};

window.handlePickTableSelect = function(guestName, tableId) {
  const success = assignGuestToTable(guestName, tableId);
  if (success) {
    const modal = document.getElementById('pickTableModal');
    if (modal) modal.classList.remove('active');
  }
};

/* ==========================================================================
   7. MODAL EDITAR MESA (Nombre y Capacidad de Asientos)
   ========================================================================== */
window.openEditTableModal = function(tableId) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  const modal = document.getElementById('editTableModal');
  const idInput = document.getElementById('editTableId');
  const nameInput = document.getElementById('editTableName');
  const capInput = document.getElementById('editTableCapacity');
  const seatsHint = document.getElementById('editTableCurrentSeats');

  if (!modal || !idInput || !nameInput || !capInput) return;

  idInput.value = table.id;
  nameInput.value = table.name;
  capInput.value = table.capacity;
  capInput.min = Math.max(1, table.guests.length);

  if (seatsHint) {
    seatsHint.textContent = `Actualmente hay ${table.guests.length} personas sentadas. La capacidad mínima permitida es ${table.guests.length}.`;
  }

  modal.classList.add('active');
};

/* ==========================================================================
   8. Acciones de Mesa (Eliminar, Desasignar, Asignar)
   ========================================================================== */
window.deleteTable = function(tableId) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  if (confirm(`¿Estás seguro de eliminar la "${table.name}"? Los invitados sentados volverán a la lista de pendientes.`)) {
    table.guests.forEach(g => {
      if (!unassignedGuests.includes(g)) unassignedGuests.push(g);
    });
    tables = tables.filter(t => t.id !== tableId);
    saveData();
    renderAll();
    showToast(`Se eliminó la "${table.name}".`);
  }
};

window.removeGuestFromTable = function(tableId, guestIndex) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  const removedGuest = table.guests.splice(guestIndex, 1)[0];
  if (!unassignedGuests.includes(removedGuest)) {
    unassignedGuests.push(removedGuest);
  }
  saveData();
  renderAll();
  showToast(`Se desasignó a ${removedGuest} de "${table.name}".`);
};

window.openAssignModal = function(tableId) {
  const targetTable = tables.find(t => t.id === tableId);
  if (!targetTable) return;

  if (unassignedGuests.length === 0) {
    const customName = prompt(`No hay invitados pendientes en lista. Escribe el nombre del invitado para agregar a "${targetTable.name}":`);
    if (customName && customName.trim()) {
      assignGuestToTable(customName.trim(), tableId);
    }
    return;
  }

  const modal = document.getElementById('assignModal');
  const select = document.getElementById('selectAssignGuest');
  const title = document.getElementById('assignModalTableTitle');

  if (modal && select && title) {
    title.textContent = targetTable.name;
    modal.dataset.targetTableId = tableId;

    select.innerHTML = '<option value="">-- Elige un invitado pendiente --</option>';
    unassignedGuests.forEach((g, idx) => {
      const comp = getCompanion(g);
      const label = comp ? `${g} (Pareja: ${comp})` : g;
      select.innerHTML += `<option value="${idx}">${label}</option>`;
    });

    modal.classList.add('active');
  }
};

/* ==========================================================================
   9. Cronograma & Compras
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
        <strong style="color: var(--navy-royal); font-size: 0.95rem;">${escapeHtml(item.title)}</strong>
      </td>
      <td><span style="color: var(--gold-dark); font-weight: 700;"><i class="ri-user-star-line"></i> ${escapeHtml(item.responsible)}</span></td>
      <td style="color: var(--text-muted); font-size: 0.88rem;">${escapeHtml(item.detail)}</td>
      <td>
        <button class="badge-status ${isOk ? 'ok' : 'pending'}" onclick="toggleTimelineStatus(${idx})" title="Clic para cambiar estado">
          ${isOk ? '<i class="ri-check-line"></i> Listo / OK' : '<i class="ri-time-line"></i> Pendiente'}
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

function renderShopping() {
  const tbody = document.getElementById('shoppingTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  shopping.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const isOk = item.status === 'ok';

    tr.innerHTML = `
      <td>
        <strong style="color: var(--navy-royal); font-size: 0.95rem;">${escapeHtml(item.item)}</strong>
      </td>
      <td><span class="time-badge" style="background: #F4EFEA; font-size: 0.78rem;">${escapeHtml(item.category)}</span></td>
      <td style="color: var(--text-muted); font-size: 0.88rem;">${escapeHtml(item.detail)}</td>
      <td><strong style="color: var(--gold-dark);">${escapeHtml(item.cost || '—')}</strong></td>
      <td>
        <button class="badge-status ${isOk ? 'ok' : 'pending'}" onclick="toggleShoppingStatus(${idx})" title="Clic para cambiar estado">
          ${isOk ? '<i class="ri-check-line"></i> Comprado / OK' : '<i class="ri-time-line"></i> Pendiente'}
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
  if (confirm(`¿Eliminar el ítem "${shopping[idx].item}"?`)) {
    shopping.splice(idx, 1);
    saveData();
    renderAll();
  }
};

/* ==========================================================================
   10. Listeners de Formularios y Modales
   ========================================================================== */
function setupEventListeners() {
  // Formulario Crear Mesa
  const formAddTable = document.getElementById('formAddTable');
  if (formAddTable) {
    formAddTable.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('newTableName');
      const capSelect = document.getElementById('newTableCapacity');

      const name = nameInput.value.trim();
      const capacity = parseInt(capSelect.value, 10);

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
      showToast(`¡Mesa "${name}" agregada con éxito!`);
    });
  }

  // Formulario Editar Mesa
  const formEditTable = document.getElementById('formEditTable');
  if (formEditTable) {
    formEditTable.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editTableId').value;
      const newName = document.getElementById('editTableName').value.trim();
      const newCap = parseInt(document.getElementById('editTableCapacity').value, 10);

      const table = tables.find(t => t.id === id);
      if (!table) return;

      if (newCap < table.guests.length) {
        alert(`La capacidad no puede ser menor a la cantidad de personas ya sentadas (${table.guests.length}).`);
        return;
      }

      table.name = newName;
      table.capacity = newCap;

      saveData();
      renderAll();

      const modal = document.getElementById('editTableModal');
      if (modal) modal.classList.remove('active');

      showToast(`¡Mesa actualizada: "${newName}" (${newCap} asientos)!`);
    });
  }

  // Formulario Agregar Invitado Rápido a Pendientes
  const formAddUnassigned = document.getElementById('formAddUnassigned');
  if (formAddUnassigned) {
    formAddUnassigned.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newGuestName');
      const name = input.value.trim();
      if (!name) return;

      unassignedGuests.push(name);
      input.value = '';
      saveData();
      renderAll();
      showToast(`¡"${name}" agregado a invitados por ubicar!`);
    });
  }

  // Modal Asignar Invitado a Mesa específica
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

      const guestName = unassignedGuests[parseInt(unassignedIdx, 10)];
      if (guestName) {
        assignGuestToTable(guestName, targetTableId);
      }
      assignModal.classList.remove('active');
    });
  }

  // Modal Nueva Actividad Cronograma
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

      timeline.sort((a, b) => a.time.localeCompare(b.time));

      formAddActivity.reset();
      activityModal.classList.remove('active');
      saveData();
      renderAll();
      showToast(`¡Actividad "${title}" agregada al cronograma!`);
    });
  }

  // Modal Nuevo Ítem de Compra
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
      showToast(`¡Ítem "${item}" agregado a compras!`);
    });
  }

  // Botones de cierre para todos los modales
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

  // Imprimir Plan
  const btnPrint = document.getElementById('btnPrintSummary');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   11. Pestañas y Helpers
   ========================================================================== */
function initTabs() {
  const tabs = document.querySelectorAll('.org-nav-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.org-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

function showToast(msg) {
  const toast = document.getElementById('orgToast');
  if (!toast) return;
  toast.innerHTML = `<i class="ri-checkbox-circle-line" style="color: #D4AF37; margin-right: 6px;"></i> ${msg}`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
