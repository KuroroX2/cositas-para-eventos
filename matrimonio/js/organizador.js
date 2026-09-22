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
  handleTabFromUrl();
  setupEventListeners();
  initDragAndDrop();
  initViewSwitch();
  initFloorplanDragging();
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


function getCleanTableName(rawName) {
  if (!rawName) return '';
  return rawName.replace(/^Mesa\s*\d+\s*[:\-–]?\s*/i, '').trim();
}

function getFormattedTableName(number, name) {
  const clean = getCleanTableName(name);
  return `Mesa ${number}: ${clean || name}`;
}

function extractTableNumber(table, idx) {
  if (table.number !== undefined && !isNaN(parseInt(table.number, 10)) && parseInt(table.number, 10) > 0) {
    return parseInt(table.number, 10);
  }
  const match = (table.name || '').match(/Mesa\s*(\d+)/i);
  if (match) return parseInt(match[1], 10);
  return idx + 1;
}

function getAvailableTableNumbers(excludeTableId = null) {
  const usedNumbers = new Set();
  tables.forEach((t, idx) => {
    if (excludeTableId && t.id === excludeTableId) return;
    const num = extractTableNumber(t, idx);
    usedNumbers.add(num);
  });

  const available = [];
  const maxUsed = usedNumbers.size > 0 ? Math.max(...Array.from(usedNumbers)) : 0;
  const limit = Math.max(30, maxUsed + 10);

  for (let i = 1; i <= limit; i++) {
    if (!usedNumbers.has(i)) {
      available.push(i);
    }
  }
  return available;
}

function getNextTableNumber() {
  const available = getAvailableTableNumbers();
  return available.length > 0 ? available[0] : 1;
}

function sortTablesAscending() {
  // Ensure every table has a valid .number property
  tables.forEach((t, idx) => {
    t.number = extractTableNumber(t, idx);
  });
  tables.sort((a, b) => {
    const numA = parseInt(a.number, 10) || 0;
    const numB = parseInt(b.number, 10) || 0;
    if (numA !== numB) return numA - numB;
    return (a.name || '').localeCompare(b.name || '');
  });
}

function updateNextTableNumberInput() {
  const numSelect = document.getElementById('newTableNumber');
  if (!numSelect) return;

  const available = getAvailableTableNumbers();
  const currentVal = parseInt(numSelect.value, 10);

  numSelect.innerHTML = '';
  available.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = `Mesa ${n}`;
    numSelect.appendChild(opt);
  });

  if (available.includes(currentVal)) {
    numSelect.value = currentVal;
  } else if (available.length > 0) {
    numSelect.value = available[0];
  }
}

function getDefaultTableCoords(idx, total) {
  // Coordenadas calculadas en un lienzo de 1050 x 680 px
  if (idx === 0) return { x: 440, y: 35 }; // Novios al centro frente al escenario
  const i = idx - 1;
  const col = i % 3;
  const row = Math.floor(i / 3);
  let x = 110;
  if (col === 1) x = 445;
  if (col === 2) x = 780;
  const y = 210 + row * 220;
  return { x, y };
}

function ensureCouplesAdjacent(table) {
  if (!table || !table.guests || table.guests.length <= 2) return;
  const processed = new Set();
  const ordered = [];

  for (let i = 0; i < table.guests.length; i++) {
    const g = table.guests[i];
    const key = g.trim().toLowerCase();
    if (processed.has(key)) continue;

    ordered.push(g);
    processed.add(key);

    const companion = getCompanion(g);
    if (companion) {
      const compKey = companion.trim().toLowerCase();
      const inTable = table.guests.some(x => x.trim().toLowerCase() === compKey);
      if (inTable && !processed.has(compKey)) {
        ordered.push(companion);
        processed.add(compKey);
      }
    }
  }
  table.guests = ordered;
}

function loadData() {
  const savedTables = localStorage.getItem(STORAGE_KEY_TABLES);
  if (savedTables) {
    try {
      tables = JSON.parse(savedTables);
      // Auto-corregir y normalizar: asegurar número, tipo, coordenadas y contigüidad de parejas
      tables.forEach((t, idx) => {
        t.number = extractTableNumber(t, idx);
        t.name = getFormattedTableName(t.number, t.name);
        if (!t.type) {
          if (t.id === 't_1' || (t.name && t.name.toLowerCase().includes('novio'))) {
            t.type = 'novios';
          } else if (t.capacity <= 4) {
            t.type = 'square';
          } else {
            t.type = 'round';
          }
        }
        if (t.posX === undefined || t.posY === undefined) {
          const coords = getDefaultTableCoords(idx, tables.length);
          t.posX = coords.x;
          t.posY = coords.y;
        }
        ensureCouplesAdjacent(t);
      });
      sortTablesAscending();
      saveData();
    } catch (e) {
      console.error('Error cargando mesas:', e);
    }
  } else {
    tables = [
      {
        id: 't_1',
        number: 1,
        name: 'Mesa 1: Mesa de los Novios',
        capacity: 2,
        guests: ['Cristopher', 'Reny']
      },
      {
        id: 't_2',
        number: 2,
        name: 'Mesa 2: Familia de la Novia',
        capacity: 8,
        guests: ['Pamela', 'Marcial', 'Constanza', 'Cecilia', 'Barbara']
      },
      {
        id: 't_3',
        number: 3,
        name: 'Mesa 3: Familia del Novio',
        capacity: 8,
        guests: ['Carlos', 'Carola', 'Felipe', 'Camila']
      },
      {
        id: 't_4',
        number: 4,
        name: 'Mesa 4: Amigos del Colegio',
        capacity: 8,
        guests: ['Jessica', 'Eduardo', 'Guisselle', 'Nicolas']
      },
      {
        id: 't_5',
        number: 5,
        name: 'Mesa 5: Amigos de la Universidad',
        capacity: 8,
        guests: ['Jaqueline', 'Luis', 'Isaac', 'Denisse']
      },
      {
        id: 't_6',
        number: 6,
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
  sortTablesAscending();
  updateNextTableNumberInput();
  renderMetrics();
  renderTables();
  renderFloorplan();
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

    const type = table.type || 'round';
    const typeLabel = type === 'novios' ? '👑 Mesa Novios' : (type === 'square' ? '⬜ Rectangular' : '🟡 Redonda');

    card.innerHTML = `
      <div class="table-card-header">
        <div class="table-card-info">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span class="table-badge-shape" style="font-size: 0.7rem; font-weight: 700; color: #4A5568; background: #F1F5F9; padding: 2px 8px; border-radius: 50px;">
              ${typeLabel}
            </span>
            <span class="table-badge-capacity ${isFull ? 'full' : ''}" title="Asientos asignados / Capacidad total">
              ${table.guests.length} / ${table.capacity}
            </span>
          </div>
          <h3 class="table-card-title">${escapeHtml(table.name)}</h3>
        </div>
        <div class="table-card-header-actions">
          <button class="btn-table-edit" onclick="openEditTableModal('${table.id}')" title="Editar nombre, tipo y capacidad de asientos">
            <i class="ri-edit-line"></i> <span>Editar</span>
          </button>
        </div>
      </div>
      <ul class="table-guests-list">
        ${guestsHtml}
      </ul>
      <div class="table-card-footer">
        <button type="button" class="btn-manage-seats-card" onclick="openSeatsModal('${table.id}')" title="Acomodar puestos de invitados y parejas" style="background: #F1F5F9; color: var(--navy-royal); border: 1px solid #CBD5E1; padding: 6px 12px; border-radius: 50px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s ease;">
          <i class="ri-user-shared-line"></i> Puestos
        </button>
        <button class="btn-add-to-table" ${isFull ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} onclick="openAssignModal('${table.id}')">
          <i class="ri-user-add-line"></i> Asignar
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

/* ==========================================================================
   4.1 PLANO DEL SALÓN 2D (MESAS POSICIONABLES Y SILLAS PERIMETRALES)
   ========================================================================== */
function renderFloorplan() {
  const canvas = document.getElementById('floorplanCanvas');
  if (!canvas) return;

  canvas.innerHTML = '';

  tables.forEach((table, tableIdx) => {
    const isFull = table.guests.length >= table.capacity;
    const type = table.type || 'round';

    const node = document.createElement('div');
    node.className = `fp-table-node fp-shape-${type}`;
    node.id = `fp_node_${table.id}`;
    node.dataset.tableId = table.id;
    node.style.left = `${table.posX !== undefined ? table.posX : 100}px`;
    node.style.top = `${table.posY !== undefined ? table.posY : 100}px`;

    // Corona exclusiva para la mesa de los novios
    let noviosCrown = '';
    if (type === 'novios') {
      noviosCrown = '<div class="fp-novios-crown"><i class="ri-vip-crown-2-fill"></i> Mesa Novios</div>';
    }

    // Superficie central de la mesa
    node.innerHTML = `
      ${noviosCrown}
      <div class="fp-table-surface" title="Arrastra para mover por el salón">
        <span class="fp-table-number">Mesa ${table.number || (tableIdx + 1)}</span>
        <span class="fp-table-name">${escapeHtml(getCleanTableName(table.name))}</span>
        <span class="fp-table-capacity ${isFull ? 'full' : ''}">${table.guests.length} / ${table.capacity}</span>
        <button type="button" class="fp-btn-manage-seats" onclick="openSeatsModal('${table.id}')" title="Acomodar puestos de invitados y parejas">
          <i class="ri-user-shared-line"></i> Puestos
        </button>
      </div>
    `;

    // Renderizar sillas alrededor del perímetro
    const chairs = generateChairsForTable(table);
    chairs.forEach(chair => {
      node.appendChild(chair);
    });

    canvas.appendChild(node);
  });
}

function generateChairsForTable(table) {
  const chairs = [];
  const capacity = table.capacity || 8;
  const type = table.type || 'round';

  if (type === 'round') {
    // Radio desde el centro (130px -> centro 65, 65)
    const R = 84;
    const centerX = 65;
    const centerY = 65;

    for (let i = 0; i < capacity; i++) {
      const angle = (2 * Math.PI * i / capacity) - (Math.PI / 2);
      const x = Math.round(centerX + R * Math.cos(angle));
      const y = Math.round(centerY + R * Math.sin(angle));

      chairs.push(createChairElement(table, i, x, y));
    }
  } else if (type === 'novios') {
    // Mesa presidencial: 170x115. Centro (85, 57)
    if (capacity === 2) {
      chairs.push(createChairElement(table, 0, 50, 130));
      chairs.push(createChairElement(table, 1, 120, 130));
    } else {
      for (let i = 0; i < capacity; i++) {
        const step = 150 / (capacity + 1);
        const x = Math.round(10 + step * (i + 1));
        const y = 132;
        chairs.push(createChairElement(table, i, x, y));
      }
    }
  } else {
    // Mesa Cuadrada / Rectangular (160x110)
    const topCount = Math.ceil(capacity / 2);
    const bottomCount = capacity - topCount;

    for (let i = 0; i < topCount; i++) {
      const step = 140 / (topCount + 1);
      const x = Math.round(10 + step * (i + 1));
      const y = -14;
      chairs.push(createChairElement(table, i, x, y));
    }

    for (let j = 0; j < bottomCount; j++) {
      const step = 140 / (bottomCount + 1);
      const x = Math.round(10 + step * (j + 1));
      const y = 124;
      chairs.push(createChairElement(table, topCount + j, x, y));
    }
  }

  return chairs;
}

function createChairElement(table, seatIndex, x, y) {
  const chair = document.createElement('div');
  const isOccupied = seatIndex < table.guests.length;
  const guest = isOccupied ? table.guests[seatIndex] : null;

  chair.style.left = `${x}px`;
  chair.style.top = `${y}px`;

  if (isOccupied && guest) {
    const companion = getCompanion(guest);
    const hasCompanionInTable = companion && table.guests.some(g => g.trim().toLowerCase() === companion.trim().toLowerCase());

    chair.className = `fp-chair seated ${hasCompanionInTable ? 'couple' : ''}`;
    chair.textContent = guest.charAt(0).toUpperCase();

    const tooltipText = `Puesto ${seatIndex + 1}: ${guest}` + (hasCompanionInTable ? ` (👥 Pareja con: ${companion})` : '');
    chair.dataset.tooltip = tooltipText;

    chair.addEventListener('click', (e) => {
      e.stopPropagation();
      openSeatsModal(table.id);
    });
  } else {
    chair.className = 'fp-chair empty';
    chair.innerHTML = '<i class="ri-add-line" style="font-size: 0.65rem;"></i>';
    chair.dataset.tooltip = `Puesto ${seatIndex + 1}: Asiento Libre (Clic para asignar)`;

    chair.addEventListener('click', (e) => {
      e.stopPropagation();
      openAssignModal(table.id);
    });
  }

  return chair;
}

/* ==========================================================================
   4.2 ARRASTRE DE MESAS EN EL PLANO 2D
   ========================================================================== */
function initFloorplanDragging() {
  const canvas = document.getElementById('floorplanCanvas');
  if (!canvas) return;

  let activeNode = null;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  function onPointerDown(e) {
    if (e.target.closest('button, a, .fp-chair')) return;

    const node = e.target.closest('.fp-table-node');
    if (!node) return;

    activeNode = node;
    node.classList.add('dragging');

    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;
    initialLeft = parseInt(node.style.left, 10) || 0;
    initialTop = parseInt(node.style.top, 10) || 0;

    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!activeNode) return;

    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    const canvasW = canvas.clientWidth || 1050;
    const canvasH = canvas.clientHeight || 680;
    const nodeW = activeNode.offsetWidth || 160;
    const nodeH = activeNode.offsetHeight || 130;

    const maxLeft = Math.max(0, canvasW - nodeW - 10);
    const maxTop = Math.max(0, canvasH - nodeH - 10);

    const newLeft = Math.max(10, Math.min(maxLeft, initialLeft + dx));
    const newTop = Math.max(10, Math.min(maxTop, initialTop + dy));

    activeNode.style.left = `${newLeft}px`;
    activeNode.style.top = `${newTop}px`;

    e.preventDefault();
  }

  function onPointerUp() {
    if (!activeNode) return;

    const tableId = activeNode.dataset.tableId;
    const table = tables.find(t => t.id === tableId);
    if (table) {
      table.posX = parseInt(activeNode.style.left, 10);
      table.posY = parseInt(activeNode.style.top, 10);
      saveData();
    }

    activeNode.classList.remove('dragging');
    activeNode = null;

    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    window.removeEventListener('touchend', onPointerUp);
  }

  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
}

window.autoLayoutTables = function() {
  if (tables.length === 0) return;

  const noviosTable = tables.find(t => t.type === 'novios') || tables[0];
  noviosTable.posX = 440;
  noviosTable.posY = 35;

  const others = tables.filter(t => t !== noviosTable);
  others.forEach((t, i) => {
    const coords = getDefaultTableCoords(i + 1, tables.length);
    t.posX = coords.x;
    t.posY = coords.y;
  });

  saveData();
  renderFloorplan();
  showToast('¡Mesas auto-alineadas armoniosamente en el salón!');
};

/* ==========================================================================
   4.3 ORGANIZADOR DE PUESTOS CON REGLA DE PAREJAS CONTIGUAS
   ========================================================================== */
let currentSeatsModalTableId = null;

window.openSeatsModal = function(tableId) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  currentSeatsModalTableId = tableId;
  const modal = document.getElementById('seatsModal');
  const nameEl = document.getElementById('seatsModalTableName');
  if (nameEl) nameEl.textContent = table.name;

  ensureCouplesAdjacent(table);
  saveData();
  renderSeatsModalContent(table);

  if (modal) modal.classList.add('active');
};

function renderSeatsModalContent(table) {
  const container = document.getElementById('seatsArrangementContainer');
  if (!container) return;

  container.innerHTML = '';

  if (table.guests.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px 15px; color: var(--text-muted); background: #F8FAFC; border-radius: 12px; border: 1.5px dashed #CBD5E1;">
        <i class="ri-user-unfollow-line" style="font-size: 2rem; color: #94A3B8; display: block; margin-bottom: 8px;"></i>
        Esta mesa aún no tiene comensales sentados.<br>
        Usa <strong>"Asignar Invitado"</strong> para ubicar a las personas aquí.
      </div>
    `;
    return;
  }

  table.guests.forEach((guest, idx) => {
    const companion = getCompanion(guest);
    const hasCompanionInTable = companion && table.guests.some(g => g.trim().toLowerCase() === companion.trim().toLowerCase());

    const item = document.createElement('div');
    item.className = `seat-arr-item ${hasCompanionInTable ? 'is-couple' : ''}`;

    let coupleBadge = '';
    let swapBtn = '';

    if (hasCompanionInTable) {
      coupleBadge = `<span class="seat-arr-couple-badge"><i class="ri-heart-fill"></i> Pareja con: ${escapeHtml(companion)}</span>`;
      swapBtn = `
        <button type="button" class="btn-seat-swap-couple" onclick="swapCoupleSides('${table.id}', '${escapeHtml(guest)}')" title="Intercambiar lado con ${escapeHtml(companion)} (quién va a la izquierda o derecha)">
          <i class="ri-swap-line"></i> <span>⇄ Cambiar Lado</span>
        </button>
      `;
    }

    item.innerHTML = `
      <div class="seat-arr-left">
        <span class="seat-arr-number" title="Número de puesto">${idx + 1}</span>
        <div class="seat-arr-info">
          <span class="seat-arr-name">${escapeHtml(guest)}</span>
          ${coupleBadge}
        </div>
      </div>
      <div class="seat-arr-actions">
        ${swapBtn}
        <button type="button" class="btn-seat-move" onclick="moveSeatItem('${table.id}', ${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Mover puesto hacia adelante">
          <i class="ri-arrow-up-line"></i>
        </button>
        <button type="button" class="btn-seat-move" onclick="moveSeatItem('${table.id}', ${idx}, 1)" ${idx === table.guests.length - 1 ? 'disabled' : ''} title="Mover puesto hacia atrás">
          <i class="ri-arrow-down-line"></i>
        </button>
        <button type="button" class="btn-seat-remove" onclick="removeGuestFromSeatsModal('${table.id}', ${idx})" title="Quitar de esta mesa">
          <i class="ri-close-circle-line"></i>
        </button>
      </div>
    `;

    container.appendChild(item);
  });
}

window.swapCoupleSides = function(tableId, guestName) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;

  const companion = getCompanion(guestName);
  if (!companion) return;

  const idx1 = table.guests.findIndex(g => g.trim().toLowerCase() === guestName.trim().toLowerCase());
  const idx2 = table.guests.findIndex(g => g.trim().toLowerCase() === companion.trim().toLowerCase());

  if (idx1 !== -1 && idx2 !== -1) {
    const temp = table.guests[idx1];
    table.guests[idx1] = table.guests[idx2];
    table.guests[idx2] = temp;

    saveData();
    renderAll();
    if (currentSeatsModalTableId === tableId) {
      renderSeatsModalContent(table);
    }
    showToast(`¡Se intercambió la posición de ${guestName} y ${companion}!`);
  }
};

window.moveSeatItem = function(tableId, guestIndex, direction) {
  const table = tables.find(t => t.id === tableId);
  if (!table || !table.guests) return;

  const guest = table.guests[guestIndex];
  const companion = getCompanion(guest);
  const companionIdx = companion ? table.guests.findIndex(g => g.trim().toLowerCase() === companion.trim().toLowerCase()) : -1;

  if (companionIdx !== -1 && Math.abs(guestIndex - companionIdx) === 1) {
    // Es un bloque de pareja
    const minIdx = Math.min(guestIndex, companionIdx);
    const maxIdx = Math.max(guestIndex, companionIdx);

    if (direction === -1 && minIdx > 0) {
      const itemBefore = table.guests.splice(minIdx - 1, 1)[0];
      table.guests.splice(maxIdx, 0, itemBefore);
    } else if (direction === 1 && maxIdx < table.guests.length - 1) {
      const itemAfter = table.guests.splice(maxIdx + 1, 1)[0];
      table.guests.splice(minIdx, 0, itemAfter);
    }
  } else {
    // Comensal individual
    const targetIdx = guestIndex + direction;
    if (targetIdx >= 0 && targetIdx < table.guests.length) {
      const temp = table.guests[guestIndex];
      table.guests[guestIndex] = table.guests[targetIdx];
      table.guests[targetIdx] = temp;
    }
  }

  saveData();
  renderAll();
  if (currentSeatsModalTableId === tableId) {
    renderSeatsModalContent(table);
  }
};

window.removeGuestFromSeatsModal = function(tableId, guestIndex) {
  removeGuestFromTable(tableId, guestIndex);
  const table = tables.find(t => t.id === tableId);
  if (table && currentSeatsModalTableId === tableId) {
    renderSeatsModalContent(table);
  }
};

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
          ${table.guests.length} / ${table.capacity} (${freeSeats} disponibles)
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
  const numSelect = document.getElementById('editTableNumber');
  const nameInput = document.getElementById('editTableName');
  const capInput = document.getElementById('editTableCapacity');
  const seatsHint = document.getElementById('editTableCurrentSeats');

  if (!modal || !idInput || !nameInput || !capInput) return;

  idInput.value = table.id;
  const currentNum = table.number || extractTableNumber(table, 0);

  if (numSelect) {
    const available = getAvailableTableNumbers(table.id);
    const allOptions = [];

    // Números disponibles (no usados)
    available.forEach(n => {
      allOptions.push({ number: n, label: `Mesa ${n}` + (n === currentNum ? ' (Actual)' : '') });
    });
    if (!allOptions.some(o => o.number === currentNum)) {
      allOptions.push({ number: currentNum, label: `Mesa ${currentNum} (Actual)` });
    }

    // Permitir elegir un número de otra mesa e intercambiarlo
    tables.forEach(t => {
      if (t.id !== table.id) {
        const otherNum = t.number || extractTableNumber(t, 0);
        if (!allOptions.some(o => o.number === otherNum)) {
          const otherClean = getCleanTableName(t.name);
          allOptions.push({ number: otherNum, label: `Mesa ${otherNum} (Intercambiar con: ${otherClean || 'otra mesa'})` });
        }
      }
    });

    allOptions.sort((a, b) => a.number - b.number);

    numSelect.innerHTML = '';
    allOptions.forEach(optData => {
      const opt = document.createElement('option');
      opt.value = optData.number;
      opt.textContent = optData.label;
      numSelect.appendChild(opt);
    });
    numSelect.value = currentNum;
  }

  // Mostrar nombre limpio sin el prefijo "Mesa X: "
  nameInput.value = getCleanTableName(table.name);

  const typeSelect = document.getElementById('editTableType');
  if (typeSelect) {
    typeSelect.value = table.type || 'round';
  }

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
      const numInput = document.getElementById('newTableNumber');
      const nameInput = document.getElementById('newTableName');
      const capSelect = document.getElementById('newTableCapacity');

      const num = parseInt(numInput.value, 10) || getNextTableNumber();
      let rawName = nameInput.value.trim();
      const capacity = parseInt(capSelect.value, 10);
      const typeSelect = document.getElementById('newTableType');
      const type = typeSelect ? typeSelect.value : 'round';

      if (!rawName) return;

      const cleanName = getCleanTableName(rawName);
      const fullName = getFormattedTableName(num, cleanName || rawName);
      const coords = getDefaultTableCoords(tables.length, tables.length + 1);

      tables.push({
        id: 't_' + Date.now(),
        number: num,
        name: fullName,
        type: type,
        posX: coords.x,
        posY: coords.y,
        capacity: capacity,
        guests: []
      });

      nameInput.value = '';
      sortTablesAscending();
      saveData();
      renderAll();
      showToast(`¡"${fullName}" agregada con éxito!`);
    });
  }

  // Formulario Editar Mesa
  const formEditTable = document.getElementById('formEditTable');
  if (formEditTable) {
    formEditTable.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editTableId').value;
      const numInput = document.getElementById('editTableNumber');
      const newNum = numInput ? parseInt(numInput.value, 10) : 1;
      const rawName = document.getElementById('editTableName').value.trim();
      const newCap = parseInt(document.getElementById('editTableCapacity').value, 10);

      const table = tables.find(t => t.id === id);
      if (!table) return;

      if (newCap < table.guests.length) {
        alert(`La capacidad no puede ser menor a la cantidad de personas ya sentadas (${table.guests.length}).`);
        return;
      }

      // Si el número elegido ya pertenece a otra mesa, intercambiamos los números
      const conflictingTable = tables.find(t => t.id !== id && (t.number === newNum || extractTableNumber(t, 0) === newNum));
      if (conflictingTable) {
        conflictingTable.number = table.number || extractTableNumber(table, 0);
        conflictingTable.name = getFormattedTableName(conflictingTable.number, conflictingTable.name);
      }

      const cleanName = getCleanTableName(rawName);
      const fullName = getFormattedTableName(newNum, cleanName || rawName);
      const typeSelect = document.getElementById('editTableType');
      const newType = typeSelect ? typeSelect.value : (table.type || 'round');

      table.number = newNum;
      table.name = fullName;
      table.capacity = newCap;
      table.type = newType;

      sortTablesAscending();
      saveData();
      renderAll();

      const modal = document.getElementById('editTableModal');
      if (modal) modal.classList.remove('active');

      showToast(`¡Mesa actualizada: "${fullName}" (${newCap} asientos)!`);
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

  initViewSwitch();
}

function initViewSwitch() {
  const btnCards = document.getElementById('btnViewCards');
  const btnFp = document.getElementById('btnViewFloorplan');
  const containerCards = document.getElementById('viewModeCardsContainer');
  const containerFp = document.getElementById('viewModeFloorplanContainer');

  if (btnCards && btnFp && containerCards && containerFp) {
    btnCards.addEventListener('click', () => {
      btnCards.classList.add('active');
      btnFp.classList.remove('active');
      containerCards.style.display = 'block';
      containerFp.style.display = 'none';
      renderTables();
    });

    btnFp.addEventListener('click', () => {
      btnFp.classList.add('active');
      btnCards.classList.remove('active');
      containerCards.style.display = 'none';
      containerFp.style.display = 'block';
      renderFloorplan();
    });
  }

  const btnAuto = document.getElementById('btnAutoLayout');
  if (btnAuto) {
    btnAuto.addEventListener('click', autoLayoutTables);
  }

  const btnReset = document.getElementById('btnResetFloorplanZoom');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      const wrapper = document.getElementById('floorplanWrapper');
      if (wrapper) {
        wrapper.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
      }
    });
  }

  const btnCloseSeats = document.getElementById('btnCloseSeatsModal');
  if (btnCloseSeats) {
    btnCloseSeats.addEventListener('click', () => {
      const modal = document.getElementById('seatsModal');
      if (modal) modal.classList.remove('active');
    });
  }
}

/* ==========================================================================
   11. Pestañas y Helpers
   ========================================================================== */
function switchTab(targetId) {
  const tabs = document.querySelectorAll('.org-nav-tabs .tab-btn');
  const targetPane = document.getElementById(targetId);
  const targetTabBtn = document.querySelector(`.org-nav-tabs .tab-btn[data-target="${targetId}"]`);

  if (targetPane && targetTabBtn) {
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.org-pane').forEach(p => p.classList.remove('active'));

    targetTabBtn.classList.add('active');
    targetPane.classList.add('active');
  }
}

function handleTabFromUrl() {
  const hash = (window.location.hash || '').toLowerCase().replace('#', '').trim();
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = (urlParams.get('tab') || '').toLowerCase().trim();
  const key = tabParam || hash;

  if (key === 'cronograma' || key === 'timeline' || key === 'pane-timeline') {
    switchTab('pane-timeline');
  } else if (key === 'compras' || key === 'shopping' || key === 'pane-shopping') {
    switchTab('pane-shopping');
  } else if (key === 'mesas' || key === 'tables' || key === 'pane-tables') {
    switchTab('pane-tables');
  }
}

function initTabs() {
  const tabs = document.querySelectorAll('.org-nav-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      switchTab(targetId);
      if (targetId === 'pane-timeline') window.location.hash = 'cronograma';
      else if (targetId === 'pane-shopping') window.location.hash = 'compras';
      else if (targetId === 'pane-tables') window.location.hash = 'mesas';
    });
  });

  handleTabFromUrl();
  window.addEventListener('hashchange', handleTabFromUrl);
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
