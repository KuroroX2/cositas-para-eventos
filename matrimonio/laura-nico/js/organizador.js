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

function cleanGuestName(g) {
  if (!g || typeof g !== 'string') return '';
  return g.trim();
}

function isGuestNameMatch(a, b) {
  if (!a || !b || typeof a !== 'string' || typeof b !== 'string') return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function isNovioGuest(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.trim().toLowerCase();
  return n === 'laura' || n === 'nico' || n === 'nicolás' || n.startsWith('laura ') || n.startsWith('nico ') || n.startsWith('nicolás ');
}

document.addEventListener('DOMContentLoaded', () => {
  try { initTabs(); } catch (e) { console.error('initTabs error:', e); }
  try { loadData(); } catch (e) { console.error('loadData error:', e); }
  try { renderAll(); } catch (e) { console.error('renderAll error:', e); }
  try { handleTabFromUrl(); } catch (e) { console.error('handleTabFromUrl error:', e); }
  try { setupEventListeners(); } catch (e) { console.error('setupEventListeners error:', e); }
  try { initDragAndDrop(); } catch (e) { console.error('initDragAndDrop error:', e); }
  try { initViewSwitch(); } catch (e) { console.error('initViewSwitch error:', e); }
  try { initFloorplanDragging(); } catch (e) { console.error('initFloorplanDragging error:', e); }
});

/* ==========================================================================
   1. Datos Iniciales & Persistencia
   ========================================================================== */
const STORAGE_KEY_TABLES = 'boda_org_tables_laura_nico_v1';
const STORAGE_KEY_TIMELINE = 'boda_org_timeline_laura_nico_v1';
const STORAGE_KEY_SHOPPING = 'boda_org_shopping_laura_nico_v1';
const STORAGE_KEY_UNASSIGNED = 'boda_org_unassigned_laura_nico_v1';

let tables = [];
let timeline = [];
let shopping = [];
const STORAGE_KEY_RESPONSIBLES = 'boda_org_responsibles_laura_nico_v1';
const STORAGE_KEY_DELETED_RESP = 'boda_org_deleted_responsibles_laura_nico_v1';
let responsibles = [];
let deletedResponsibles = [];

function loadDeletedResponsibles() {
  try {
    deletedResponsibles = JSON.parse(localStorage.getItem(STORAGE_KEY_DELETED_RESP) || '[]');
    if (!Array.isArray(deletedResponsibles)) deletedResponsibles = [];
  } catch(e) {
    deletedResponsibles = [];
  }
}

function saveDeletedResponsibles() {
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_RESP, JSON.stringify(deletedResponsibles));
  } catch(e) {}
}

function isResponsibleDeleted(name) {
  if (!name || typeof name !== 'string') return false;
  const lower = name.trim().toLowerCase();
  if (lower === '— sin asignar —' || lower === 'sin asignar' || lower === 'ninguno') return false;
  if (!Array.isArray(deletedResponsibles)) loadDeletedResponsibles();
  return (deletedResponsibles || []).some(d => typeof d === 'string' && d.trim().toLowerCase() === lower);
}

function markResponsibleDeleted(name) {
  if (!name || typeof name !== 'string') return;
  const clean = name.trim();
  const lower = clean.toLowerCase();
  loadDeletedResponsibles();
  if (!isResponsibleDeleted(clean)) {
    deletedResponsibles.push(clean);
    saveDeletedResponsibles();
  }
}

function unmarkResponsibleDeleted(name) {
  if (!name || typeof name !== 'string') return;
  const lower = name.trim().toLowerCase();
  loadDeletedResponsibles();
  deletedResponsibles = (deletedResponsibles || []).filter(d => typeof d === 'string' && d.trim().toLowerCase() !== lower);
  saveDeletedResponsibles();
}

const DEFAULT_RESPONSIBLES = [
  { id: 'resp_1', name: 'Novios (Laura & Nico)', category: 'Novios', phone: '' },
  { id: 'resp_2', name: 'Hermano del Novio', category: 'Familia', phone: '' },
  { id: 'resp_3', name: 'Banquetera', category: 'Proveedor', phone: '' },
  { id: 'resp_4', name: 'Equipo Fotográfico', category: 'Proveedor', phone: '' },
  { id: 'resp_5', name: 'DJ & Sonidista', category: 'Proveedor', phone: '' },
  { id: 'resp_6', name: 'Decoradora Floral', category: 'Proveedor', phone: '' },
  { id: 'resp_7', name: 'Estilista & Novia', category: 'Proveedor', phone: '' },
  { id: 'resp_8', name: 'Oficial Civil & Párroco', category: 'Proveedor', phone: '' },
  { id: 'resp_9', name: 'Padres & Padrinos', category: 'Familia', phone: '' },
  { id: 'resp_10', name: 'Damas de Honor', category: 'Amigos / Cortejo', phone: '' },
  { id: 'resp_11', name: 'Equipo Recepción', category: 'Logística', phone: '' },
  { id: 'resp_12', name: 'Barman', category: 'Proveedor', phone: '' }
];

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

function getCoordsForTableNumber(tableNumber) {
  if (tableNumber === 1) {
    const canvas = document.getElementById('floorplanCanvas');
    const canvasWidth = canvas ? (canvas.clientWidth || 1050) : 1050;
    const novios = (tables && tables.length > 0) ? (tables.find(isNoviosTable) || tables.find(t => t.number === 1) || tables[0]) : null;
    const shape = novios ? getTableShape(novios) : 'rectangular';
    const w = (shape === 'rectangular')
      ? Math.max(200, ((novios ? novios.capacity : 2) || 2) * 75 + 40)
      : (shape === 'square' ? 130 : 136);
    return { x: Math.round((canvasWidth - w) / 2), y: 50 };
  }
  const slot = Math.max(0, tableNumber - 2);
  const col = slot % 3;
  const row = Math.floor(slot / 3);
  const xs = [120, 460, 800];
  return { x: xs[col], y: 230 + row * 250 };
}

function getDefaultTableCoords(idx, total) {
  if (idx === 0) return getCoordsForTableNumber(1);
  return getCoordsForTableNumber(idx + 1);
}

function getNonCollidingCoords(preferredNum) {
  let target = getCoordsForTableNumber(preferredNum);
  const isOccupied = (pt) => tables.some(t => {
    if (t.posX === undefined || t.posY === undefined) return false;
    const dx = Math.abs(t.posX - pt.x);
    const dy = Math.abs(t.posY - pt.y);
    return dx < 180 && dy < 180;
  });

  if (!isOccupied(target)) {
    return target;
  }

  // Si esa posición ya está ocupada por otra mesa, buscar el siguiente espacio libre en la cuadrícula
  for (let s = 0; s < 30; s++) {
    const candidate = getCoordsForTableNumber(s + 2);
    if (!isOccupied(candidate)) {
      return candidate;
    }
  }
  return { x: target.x + 30, y: target.y + 30 };
}

function ensureCouplesAdjacent(table) {
  if (!table || !table.guests) return;
  const seated = getSeatedGuests(table);
  if (seated.length <= 2) return;

  const processed = new Set();
  const ordered = [];

  for (let i = 0; i < seated.length; i++) {
    const g = seated[i];
    const key = g.trim().toLowerCase();
    if (processed.has(key)) continue;

    ordered.push(g);
    processed.add(key);

    const companion = getCompanion(g);
    if (companion) {
      const compKey = companion.trim().toLowerCase();
      const inTable = seated.some(x => isGuestNameMatch(x, companion));
      if (inTable && !processed.has(compKey)) {
        ordered.push(companion);
        processed.add(compKey);
      }
    }
  }
  const cap = table.capacity || 8;
  table.guests = ordered;
  while (table.guests.length < cap) {
    table.guests.push(null);
  }
}

function getSeatedGuests(table) {
  if (!table || !table.guests) return [];
  return table.guests.filter(g => g && typeof g === 'string' && g.trim());
}

function getSeatedCount(table) {
  return getSeatedGuests(table).length;
}

function ensureTableSeatsArray(table) {
  if (!table) return;
  if (!Array.isArray(table.guests)) table.guests = [];
  const cap = table.capacity || 8;
  while (table.guests.length < cap) {
    table.guests.push(null);
  }
}

function safeLower(val) {
  if (val === undefined || val === null) return '';
  if (typeof val === 'boolean') return val ? 'si' : 'no';
  return String(val).trim().toLowerCase();
}

// Lista oficial completa de invitados confirmados de la boda
const ALL_CONFIRMED_SEEDS = [
  // Novios y Mesa 1
  'Laura', 'Nico',
  // Familia Novia
  'Pamela', 'Marcial',
  'Constanza',
  'Cecilia',
  'Barbara',
  // Familia Novio
  'Carlos', 'Carola',
  'Felipe', 'Camila',
  // Amigos
  'Jessica', 'Eduardo',
  'Guisselle', 'Nicolas',
  'Jaqueline', 'Luis',
  'Isaac', 'Denisse',
  'Jhankhel',
  'Daniela', 'Hugo',
  // Invitados confirmados adicionales por ubicar
  'Roberto', 'Acompañante',
  'Karen',
  'Sandra',
  'Yorka',
  'Claudia',
  'Camila', 'Tah',
  'Paz', 'Mateo',
  'Michel', 'Paulina',
  'llergers', 'Priscila',
  'Pastor Jonathan', 'Pastora Gladys',
  'Jenn', 'Bruno',
  'Maximo',
  'Natalia',
  'Sebastián',
  'Valesca Zamorano', 'Roberto Sánchez',
  'Oscar', 'Barbara',
  'Bárbara', 'Bastian',
  'Cristobal Roca', 'Katherine Segovia',
  'Francisco Fernandez', 'Daniela Vildósola',
  'Bianca', 'Cristobal'
];

function syncConfirmedGuestsWithUnassigned() {
  const seatedSet = new Set();
  tables.forEach(t => {
    (t.guests || []).forEach(g => {
      if (g && typeof g === 'string' && g.trim()) {
        seatedSet.add(g.trim().toLowerCase());
      }
    });
  });

  const confirmedList = [];
  const addedSet = new Set();
  const declinedSet = new Set();

  function addConfirmed(name) {
    if (!name || typeof name !== 'string' || !name.trim()) return;
    const clean = name.trim();
    const key = clean.toLowerCase();
    if (declinedSet.has(key)) return;
    if (!addedSet.has(key)) {
      addedSet.add(key);
      confirmedList.push(clean);
    }
  }

  // 1. Leer de wedding_rsvps_laura_nico_v1 (identificar confirmados y rechazados de forma segura)
  try {
    const rawRsvps = localStorage.getItem('wedding_rsvps_laura_nico_v1');
    if (rawRsvps) {
      const rsvps = JSON.parse(rawRsvps);
      // Primero recolectar todos los que explícitamente NO asisten (incluyendo acompañantes que no asistirán)
      rsvps.forEach(r => {
        const att = safeLower(r.attendance);
        const att1 = safeLower(r.attendance1);
        const att2 = safeLower(r.attendance2);

        // Si la persona principal rechaza explícitamente
        if (att === 'no' || att1 === 'no') {
          if (r.name) declinedSet.add(r.name.trim().toLowerCase());
        }
        // Si el acompañante rechaza explícitamente o el flag isCompanionDeclined está activo
        if (att === 'no' || att2 === 'no' || r.isCompanionDeclined) {
          if (r.name2 && r.name2.trim()) declinedSet.add(r.name2.trim().toLowerCase());
          if (r.originalCompanion && r.originalCompanion.trim()) declinedSet.add(r.originalCompanion.trim().toLowerCase());
        }
      });

      // Luego registrar a los que SÍ confirmaron asistencia
      rsvps.forEach(r => {
        const att = safeLower(r.attendance);
        const att1 = safeLower(r.attendance1);
        const att2 = safeLower(r.attendance2);

        // Invitado principal asiste si att1 == 'si' o att == 'si' (y no está en declinedSet)
        if (att1 === 'si' || (!r.attendance1 && att === 'si')) {
          if (r.name && !declinedSet.has(r.name.trim().toLowerCase())) {
            addConfirmed(r.name);
          }
        }
        // Acompañante asiste si att2 == 'si' (y no está en declinedSet)
        if (att2 === 'si' && r.name2 && r.name2.trim()) {
          if (!declinedSet.has(r.name2.trim().toLowerCase())) {
            addConfirmed(r.name2);
          }
        }
      });
    }
  } catch (e) {
    console.warn('Error leyendo RSVPs en organizador:', e);
  }

  // 1.b Leer de wedding_invitations_laura_nico_v1 para asegurar todos los invitados
  try {
    const rawInvs = localStorage.getItem('wedding_invitations_laura_nico_v1');
    if (rawInvs) {
      const invs = JSON.parse(rawInvs);
      invs.forEach(inv => {
        if (inv.name1 && !declinedSet.has(inv.name1.trim().toLowerCase())) {
          addConfirmed(inv.name1);
        }
        if (inv.name2 && !declinedSet.has(inv.name2.trim().toLowerCase())) {
          addConfirmed(inv.name2);
        }
      });
    }
  } catch (e) {}

  // 2. Incluir los confirmados de semillas oficiales del matrimonio (siempre que no hayan declinado)
  ALL_CONFIRMED_SEEDS.forEach(name => {
    if (name && typeof name === 'string' && !declinedSet.has(name.trim().toLowerCase())) {
      addConfirmed(name);
    }
  });

  // 3. Agregar cualquier invitado que ya estuviera en unassignedGuests (siempre que no haya declinado)
  unassignedGuests.forEach(name => {
    if (name && typeof name === 'string' && !declinedSet.has(name.trim().toLowerCase())) {
      addConfirmed(name);
    }
  });

  // 4. Limpiar de las mesas a cualquier persona que no asiste
  tables.forEach(t => {
    if (Array.isArray(t.guests)) {
      t.guests = t.guests.map(g => {
        if (g && typeof g === 'string' && declinedSet.has(g.trim().toLowerCase())) {
          return null;
        }
        return g;
      });
      ensureTableSeatsArray(t);
    }
  });

  // 5. Los pendientes por ubicar son todos los confirmados que no están sentados en las mesas y que no han declinado
  unassignedGuests = confirmedList.filter(name => !seatedSet.has(name.toLowerCase()) && !declinedSet.has(name.toLowerCase()));
  localStorage.setItem(STORAGE_KEY_UNASSIGNED, JSON.stringify(unassignedGuests));
}

function loadData() {
  loadResponsibles();
  const savedTables = localStorage.getItem(STORAGE_KEY_TABLES);
  if (savedTables) {
    try {
      tables = JSON.parse(savedTables);
      tables.forEach((t, idx) => {
        t.number = extractTableNumber(t, idx);
        t.name = getFormattedTableName(t.number, t.name);

        // Mesa de los Novios es EXCLUSIVAMENTE la Mesa 1
        if (t.id === 't_1' || t.number === 1) {
          t.type = 'novios';
          if (!t.shape) t.shape = getNoviosTableShape();
        } else {
          // Si por error previo se guardó otra mesa (ej: 'Familia del Novio') como novios o rectangular, restaurar
          if (t.type === 'novios') {
            t.type = (t.capacity <= 4) ? 'square' : 'round';
          }
          if (t.shape === 'rectangular' && (!t.type || t.type === 'novios')) {
            t.shape = getGuestTablesShape();
            t.type = getGuestTablesShape();
          } else if (!t.type) {
            t.type = (t.capacity <= 4) ? 'square' : 'round';
          }
        }

        if (t.posX === undefined || t.posY === undefined) {
          const coords = getCoordsForTableNumber(t.number);
          t.posX = coords.x;
          t.posY = coords.y;
        }
        ensureTableSeatsArray(t);
      });
      sortTablesAscending();
      localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(tables));
    } catch (e) {
      console.error('Error cargando mesas:', e);
    }
  } else {
    tables = [
      {
        id: 't_1',
        number: 1,
        name: 'Mesa 1: Mesa de Honor (Laura & Nico)',
        capacity: 2,
        guests: ['Laura', 'Nico']
      },
      {
        id: 't_2',
        number: 2,
        name: 'Mesa 2: Familia de la Novia (Sakura)',
        capacity: 8,
        guests: ['Pamela', 'Marcial', 'Constanza', 'Cecilia', 'Barbara', null, null, null]
      },
      {
        id: 't_3',
        number: 3,
        name: 'Mesa 3: Familia del Novio (Bonsái)',
        capacity: 8,
        guests: ['Carlos', 'Carola', 'Felipe', 'Camila', null, null, null, null]
      },
      {
        id: 't_4',
        number: 4,
        name: 'Mesa 4: Amigos Universidad (Kyoto)',
        capacity: 8,
        guests: ['Jessica', 'Eduardo', 'Guisselle', 'Nicolas', null, null, null, null]
      },
      {
        id: 't_5',
        number: 5,
        name: 'Mesa 5: Amigos del Novio (Tokyo)',
        capacity: 8,
        guests: ['Jaqueline', 'Luis', 'Isaac', 'Denisse', null, null, null, null]
      },
      {
        id: 't_6',
        number: 6,
        name: 'Mesa 6: Amigos de la Novia (Osaka)',
        capacity: 6,
        guests: ['Jhankhel', 'Daniela', 'Hugo', null, null, null]
      }
    ];
    tables.forEach(t => ensureTableSeatsArray(t));
  }

  const savedUnassigned = localStorage.getItem(STORAGE_KEY_UNASSIGNED);
  if (savedUnassigned) {
    try {
      unassignedGuests = JSON.parse(savedUnassigned);
    } catch (e) {
      unassignedGuests = [];
    }
  }

  // Sincronizar automáticamente todos los confirmados con la lista de pendientes
  syncConfirmedGuestsWithUnassigned();

  // Sincronización en segundo plano con Supabase Cloud si está disponible
  if (window.dbSupabase) {
    Promise.all([
      window.dbSupabase.getInvitations(),
      window.dbSupabase.getRsvps()
    ]).then(([cloudInvs, cloudRsvps]) => {
      let changed = false;
      if (Array.isArray(cloudInvs) && cloudInvs.length > 0) {
        localStorage.setItem('wedding_invitations_cloud_v1', JSON.stringify(cloudInvs.map(i => ({
          id: i.id, pases: i.pases, name1: i.name1, name2: i.name2, phone: i.phone
        }))));
        changed = true;
      }
      if (Array.isArray(cloudRsvps) && cloudRsvps.length > 0) {
        localStorage.setItem('wedding_rsvps_cloud_v1', JSON.stringify(cloudRsvps.map(r => ({
          id: r.id, name: r.name1, name2: r.name2,
          attendance: (r.attendance1 === true || r.attendance2 === true) ? 'si' : 'no',
          attendance1: r.attendance1 === true ? 'si' : 'no',
          attendance2: r.attendance2 === true ? 'si' : 'no',
          pasesCount: (r.attendance1 === true ? 1 : 0) + (r.attendance2 === true ? 1 : 0),
          isCompanionDeclined: (r.name2 && r.attendance1 === true && r.attendance2 === false)
        }))));
        changed = true;
      }
      if (changed) {
        syncConfirmedGuestsWithUnassigned();
        renderAll();
      }
    }).catch(e => console.warn('Supabase sync notice in organizador:', e));
  }

  // ==========================================
  // CRONOGRAMA DE EJEMPLO ALINEADO A LA INVITACIÓN
  // Horarios de la invitación:
  // - 11:30 AM: Llegada & Momento Manta
  // - 01:00 PM: Ceremonia Civil & Religiosa
  // - 03:00 PM: El Almuerzo
  // - Tarde (16:30): Sobremesa & Fotos Instagrameables 📸✨
  // - 04:00 PM (18:00 - 21:00): ¡Música & Fiesta!
  // + Todas las actividades previas y logísticas mantenidas
  // ==========================================
  const DEFAULT_EXAMPLE_TIMELINE = [
    {
      id: 'act_todo_el_evento',
      time: 'Todo el Evento',
      timeStart: 'Todo el Evento',
      timeEnd: '',
      title: 'Todo el Evento',
      responsible: 'Coordinador General & Novios',
      responsibleStatus: 'ok',
      detail: 'Servicios continuos, ambientación musical, comodidades para los invitados y coordinación general durante toda la jornada.',
      activities: [
        { id: 'sub_ev_1', name: 'Coordinación y supervisión general de tiempos', responsible: 'Coordinador General', responsibleStatus: 'ok' },
        { id: 'sub_ev_2', name: 'Estación de hidratación, café y comodidades', responsible: 'Banquetera', responsibleStatus: 'ok' },
        { id: 'sub_ev_3', name: 'Kits de emergencia y baño (damas y varones)', responsible: 'Damas de Honor', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Kit de Baño / Emergencia (Hombres y Mujeres)', shopCategory: 'Varios', shopCost: '$18.000', shopStatus: 'pending' },
        { id: 'sub_ev_4', name: 'Marcos de fotos con Códigos QR y libro de firmas', responsible: 'Hermano del Novio', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Carteles y Marcos para Códigos QR de Fotos', shopCategory: 'Decoración', shopCost: '$15.000', shopStatus: 'pending' }
      ]
    },
    {
      id: 'act_previa_maquillaje',
      time: '08:30',
      timeStart: '08:30',
      timeEnd: '10:30',
      title: 'Maquillaje y Peinado de la Novia',
      responsible: 'Estilista & Novia',
      responsibleStatus: 'ok',
      detail: 'Preparación y sesión de peinado en la suite de Casona Los Olivos',
      activities: [
        { id: 'sub_maq_1', name: 'Peinado y colocación del velo', responsible: 'Estilista', responsibleStatus: 'ok' },
        { id: 'sub_maq_2', name: 'Maquillaje de novia y retoques madrina', responsible: 'Maquilladora', responsibleStatus: 'ok' }
      ]
    },
    {
      id: 'act_previa_decoracion',
      time: '09:30',
      timeStart: '09:30',
      timeEnd: '11:00',
      title: 'Montaje floral, mesas y mantelería',
      responsible: 'Decoradora Floral',
      responsibleStatus: 'ok',
      detail: 'Revisión de mantelería, centros de mesa campestres y flores en el jardín',
      activities: [
        { id: 'sub_dec_1', name: 'Distribución de centros de mesa y cubertería', responsible: 'Decoradora', responsibleStatus: 'ok' },
        { id: 'sub_dec_2', name: 'Montaje del arco nupcial campestre', responsible: 'Equipo Montaje', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Arco y Flores Campestres', shopCategory: 'Decoración', shopCost: '$45.000', shopStatus: 'ok' }
      ]
    },
    {
      id: 'act_previa_foto',
      time: '10:00',
      timeStart: '10:00',
      timeEnd: '11:30',
      title: 'Llegada del Fotógrafo (Sesión previa)',
      responsible: 'Equipo Fotográfico',
      responsibleStatus: 'ok',
      detail: 'Fotos de detalles: vestido, anillos, zapatos, traje del novio y primeros retratos',
      activities: [
        { id: 'sub_fot_1', name: 'Fotos de detalles (anillos, zapatos, ramo)', responsible: 'Fotógrafo', responsibleStatus: 'ok' },
        { id: 'sub_fot_2', name: 'First look íntimo de los novios', responsible: 'Fotógrafo', responsibleStatus: 'ok' }
      ]
    },
    {
      id: 'act_previa_sonido',
      time: '10:30',
      timeStart: '10:30',
      timeEnd: '11:30',
      title: 'Prueba de Sonido & Micrófonos con DJ',
      responsible: 'DJ & Sonidista',
      responsibleStatus: 'ok',
      detail: 'Confirmar lista de canciones, audio campestre y micrófonos inalámbricos para votos',
      activities: [
        { id: 'sub_son_1', name: 'Prueba de audio y micrófono inalámbrico de ceremonia', responsible: 'DJ', responsibleStatus: 'ok' },
        { id: 'sub_son_2', name: 'Audio ambiental acústico en zona de pasto', responsible: 'DJ', responsibleStatus: 'ok' }
      ]
    },
    {
      id: 'act_inv_llegada',
      time: '11:30',
      timeStart: '11:30',
      timeEnd: '13:00',
      title: 'Llegada & Momento Manta',
      responsible: 'Hermano del Novio & Equipo Recepción',
      responsibleStatus: 'ok',
      detail: 'Instalación de mantas en el césped, aguas frescas, música acústica y cóctel previo',
      activities: [
        { id: 'sub_rec_cartel', name: 'Instalación de Cartel de Bienvenida', responsible: 'Hermano del Novio', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Cartel de Bienvenidos (Madera / Acrílico)', shopCategory: 'Decoración', shopCost: '$25.000', shopStatus: 'in_progress' },
        { id: 'sub_rec_mantas', name: 'Distribución de mantas y canastas en el pasto', responsible: 'Equipo Recepción', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Mantas campestres para picnic', shopCategory: 'Mobiliario', shopCost: '$30.000', shopStatus: 'ok' },
        { id: 'sub_rec_aguas', name: 'Dispensadores de aguas saborizadas y limonadas', responsible: 'Banquetera', responsibleStatus: 'ok' }
      ]
    },
    {
      id: 'act_inv_ceremonia',
      time: '13:00',
      timeStart: '13:00',
      timeEnd: '14:15',
      title: 'Ceremonia Civil & Religiosa',
      responsible: 'Oficial Civil & Párroco',
      responsibleStatus: 'ok',
      detail: 'Matrimonio Civil y posterior bendición religiosa para sellar nuestra unión',
      activities: [
        { id: 'sub_cer_1', name: 'Lectura de votos y entrega de argollas', responsible: 'Novios & Padrinos', responsibleStatus: 'ok' },
        { id: 'sub_cer_2', name: 'Firma de actas de matrimonio civil', responsible: 'Testigos', responsibleStatus: 'ok' },
        { id: 'sub_cer_3', name: 'Lluvia de pétalos naturales a la salida', responsible: 'Damas de Honor', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Conos con pétalos naturales', shopCategory: 'Ceremonia', shopCost: '$15.000', shopStatus: 'ok' }
      ]
    },
    {
      id: 'act_coctel_fotos',
      time: '14:15',
      timeStart: '14:15',
      timeEnd: '15:00',
      title: 'Cóctel Campestre & Fotos Post-Ceremonia',
      responsible: 'Banquetera & Fotógrafo',
      responsibleStatus: 'ok',
      detail: 'Aperitivos campestres y fotos grupales con novios y familias en los jardines',
      activities: [
        { id: 'sub_coc_1', name: 'Servicio de aperitivos campestres y cóctel de autor', responsible: 'Banquetera', responsibleStatus: 'ok' },
        { id: 'sub_coc_2', name: 'Fotos con familiares y amigos en spots de jardines', responsible: 'Fotógrafo', responsibleStatus: 'ok' }
      ]
    },
    {
      id: 'act_inv_almuerzo',
      time: '15:00',
      timeStart: '15:00',
      timeEnd: '16:30',
      title: 'El Almuerzo',
      responsible: 'Banquetera & Maestro de Ceremonia',
      responsibleStatus: 'ok',
      detail: 'Almuerzo campestre, mesa de novios, brindis de honor y compartir juntos',
      activities: [
        { id: 'sub_alm_1', name: 'Servicio del banquete campestre en mesas', responsible: 'Garzones & Banquetera', responsibleStatus: 'ok' },
        { id: 'sub_alm_2', name: 'Brindis de honor con champaña y discursos', responsible: 'Padres & Padrinos', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Copas grabadas para brindis de novios', shopCategory: 'Banquete', shopCost: '$18.000', shopStatus: 'ok' }
      ]
    },
    {
      id: 'act_inv_sobremesa',
      time: '16:30',
      timeStart: '16:30',
      timeEnd: '17:30',
      title: 'Sobremesa & Fotos Instagrameables 📸✨',
      responsible: 'Novios & Encargado de Spots',
      responsibleStatus: 'ok',
      detail: 'Spots decorados para Instagram, descanso en el césped, café, torta y postres',
      activities: [
        { id: 'sub_sob_1', name: 'Activación de photo spots y cámaras vintage en mesas', responsible: 'Encargado de Spots', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Cámaras Desechables Vintage para cada mesa', shopCategory: 'Detalles', shopCost: '$60.000', shopStatus: 'ok' },
        { id: 'sub_sob_2', name: 'Corte de torta de novios y estación de café', responsible: 'Banquetera', responsibleStatus: 'ok' }
      ]
    },
    {
      id: 'act_vals_novios',
      time: '17:30',
      timeStart: '17:30',
      timeEnd: '18:00',
      title: 'Primer Baile de Novios (Vals)',
      responsible: 'DJ & Novios',
      responsibleStatus: 'ok',
      detail: 'Vals tradicional de los novios y apertura de la pista de baile',
      activities: [
        { id: 'sub_vals_1', name: 'Vals de novios con iluminación cálida', responsible: 'DJ', responsibleStatus: 'ok' },
        { id: 'sub_vals_2', name: 'Baile con padres y llamado general a la pista', responsible: 'DJ', responsibleStatus: 'ok' }
      ]
    },
    {
      id: 'act_inv_fiesta',
      time: '18:00',
      timeStart: '18:00',
      timeEnd: '21:00',
      title: '¡Música & Fiesta!',
      responsible: 'DJ & Barman',
      responsibleStatus: 'ok',
      detail: 'Pista de baile encendida, cotillón festivo y barra abierta campestre',
      activities: [
        { id: 'sub_fie_1', name: 'Apertura de barra campestre libre', responsible: 'Barman', responsibleStatus: 'ok' },
        { id: 'sub_fie_2', name: 'Reparto de cotillón temático y pantuflas cómodas', responsible: 'Amigos de los Novios', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Pantuflas y Chalas Cómodas para la Fiesta', shopCategory: 'Fiesta', shopCost: '$40.000', shopStatus: 'ok' }
      ]
    },
    {
      id: 'act_bajon_final',
      time: '21:00',
      timeStart: '21:00',
      timeEnd: '22:00',
      title: 'Bajón de Tarde-Noche & Despedida',
      responsible: 'Banquetera & Hermano del Novio',
      responsibleStatus: 'ok',
      detail: 'Tapaditos calientes, pizzas artesanales y despedida de novios con bengalas',
      activities: [
        { id: 'sub_baj_1', name: 'Servicio de trasnoche con tapaditos calientes y café', responsible: 'Banquetera', responsibleStatus: 'ok' },
        { id: 'sub_baj_2', name: 'Túnel de despedida con chispas de bengala', responsible: 'Hermano del Novio', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Kit de Luces de Bengala para Despedida', shopCategory: 'Detalles', shopCost: '$25.000', shopStatus: 'ok' }
      ]
    }
  ];

  // Carga inteligente de cronograma y migración
  const savedTimelineV3 = localStorage.getItem('boda_org_timeline_v3');
  const savedTimelineV2 = localStorage.getItem('boda_org_timeline_v2') || localStorage.getItem('boda_org_timeline');
  let rawTimeline = savedTimelineV3 || savedTimelineV2;
  let parsedTimeline = null;

  if (rawTimeline) {
    try {
      parsedTimeline = JSON.parse(rawTimeline);
    } catch(e) {
      console.error('Error parsing timeline:', e);
    }
  }

  // Identificadores de ejemplos antiguos
  const legacyDefaultIds = new Set(['act_1', 'act_2', 'act_recepcion', 'act_3', 'act_4', 'act_5', 'act_6', 'act_7', 'act_8', 'act_9', 'act_10', 'act_11', 'act_12']);
  
  // Rescatar hitos creados por el usuario que NO eran parte del ejemplo viejo
  let customUserItems = [];
  if (parsedTimeline && Array.isArray(parsedTimeline)) {
    customUserItems = parsedTimeline.filter(item => !legacyDefaultIds.has(item.id) && !item.id.startsWith('act_inv_') && !item.id.startsWith('act_previa_') && item.id !== 'act_vals_novios' && item.id !== 'act_bajon_final');
  }

  // Respaldo secundario permanente
  try {
    const customSaved = JSON.parse(localStorage.getItem('boda_org_timeline_custom_ye') || '[]');
    if (Array.isArray(customSaved) && customSaved.length > 0) {
      customSaved.forEach(c => {
        if (!customUserItems.some(u => u.id === c.id || (u.title === c.title && u.timeStart === c.timeStart))) {
          customUserItems.push(c);
        }
      });
    }
  } catch(e) {}

  // Si no hay v3 o se detecta cronograma antiguo vespertino (con ceremonia a las 17:00), actualizar al de la invitación
  const hasOldEveningSchedule = parsedTimeline && parsedTimeline.some(item => 
    item.id === 'act_6' || item.time === '17:00' || item.title === 'Ceremonia Civil & Votos Simbólicos' || item.title === 'Entrada Triunfal al Salón & Banquete'
  );

  if (!savedTimelineV3 || hasOldEveningSchedule || !parsedTimeline || parsedTimeline.length === 0) {
    timeline = JSON.parse(JSON.stringify(DEFAULT_EXAMPLE_TIMELINE));
    // Conservar hitos personalizados del usuario
    if (customUserItems.length > 0) {
      customUserItems.forEach(c => {
        if (!timeline.some(t => t.id === c.id || (t.title === c.title && t.timeStart === c.timeStart))) {
          timeline.push(c);
        }
      });
    }
    // Guardar en v3
    localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(timeline));
  } else {
    timeline = parsedTimeline;
    if (customUserItems.length > 0) {
      customUserItems.forEach(c => {
        if (!timeline.some(t => t.id === c.id || (t.title === c.title && t.timeStart === c.timeStart))) {
          timeline.push(c);
        }
      });
    }
  }

  // Ordenar cronograma por hora de inicio
    // Asegurar que el hito 'Todo el Evento' esté presente en el cronograma
  if (Array.isArray(timeline) && !timeline.some(t => t.id === 'act_todo_el_evento' || (t.title && t.title.toLowerCase().includes('todo el evento')))) {
    timeline.unshift({
      id: 'act_todo_el_evento',
      time: 'Todo el Evento',
      timeStart: 'Todo el Evento',
      timeEnd: '',
      title: 'Todo el Evento',
      responsible: 'Coordinador General & Novios',
      responsibleStatus: 'ok',
      detail: 'Servicios continuos, ambientación musical, comodidades para los invitados y coordinación general durante toda la jornada.',
      activities: [
        { id: 'sub_ev_1', name: 'Coordinación y supervisión general de tiempos', responsible: 'Coordinador General', responsibleStatus: 'ok' },
        { id: 'sub_ev_2', name: 'Estación de hidratación, café y comodidades', responsible: 'Banquetera', responsibleStatus: 'ok' },
        { id: 'sub_ev_3', name: 'Kits de emergencia y baño (damas y varones)', responsible: 'Damas de Honor', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Kit de Baño / Emergencia (Hombres y Mujeres)', shopCategory: 'Varios', shopCost: '$18.000', shopStatus: 'pending' },
        { id: 'sub_ev_4', name: 'Marcos de fotos con Códigos QR y libro de firmas', responsible: 'Hermano del Novio', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Carteles y Marcos para Códigos QR de Fotos', shopCategory: 'Decoración', shopCost: '$15.000', shopStatus: 'pending' }
      ]
    });
  }

  timeline.sort((a, b) => getTimelineSortKey(a).localeCompare(getTimelineSortKey(b)));

  // Carga robusta de compras y sincronización con cronograma
  const DEFAULT_SHOPPING_ITEMS = [
    {
      id: 'shop_cartel_rec',
      item: 'Cartel de Bienvenidos (Madera / Acrílico)',
      activityTitle: 'Llegada & Momento Manta: Instalación de Cartel de Bienvenida',
      activityId: 'act_inv_llegada',
      category: 'Decoración',
      responsible: 'Hermano del Novio',
      responsibleStatus: 'ok',
      detail: 'Para la entrada principal de la casona',
      cost: '$25.000',
      status: 'in_progress'
    },
    {
      id: 'shop_1',
      item: 'Kit de Luces de Bengala para Salida de Ceremonia',
      activityTitle: 'Bajón de Tarde-Noche & Despedida: Túnel de despedida con chispas de bengala',
      activityId: 'act_bajon_final',
      category: 'Ceremonia',
      detail: '100 unidades de chispas largas (45 cm) para el atardecer',
      cost: '$25.000',
      status: 'ok'
    },
    {
      id: 'shop_2',
      item: 'Cámaras Desechables Vintage para cada mesa',
      activityTitle: 'Sobremesa & Fotos Instagrameables 📸✨: Activación de photo spots y cámaras vintage en mesas',
      activityId: 'act_inv_sobremesa',
      category: 'Detalles',
      detail: '8 cámaras instantáneas desechables para las mesas',
      cost: '$60.000',
      status: 'ok'
    },
    {
      id: 'shop_3',
      item: 'Pantuflas y Chalas Cómodas para la Fiesta',
      activityTitle: '¡Música & Fiesta!: Reparto de cotillón temático y pantuflas cómodas',
      activityId: 'act_inv_fiesta',
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
      activityTitle: 'Ceremonia Civil & Religiosa: Lluvia de pétalos naturales a la salida',
      activityId: 'act_inv_ceremonia',
      detail: '70 conos de papel kraft biodegradables',
      cost: '$12.000',
      status: 'ok'
    },
    {
      id: 'shop_7',
      item: 'Cotillón Neón y Pulseras Luminosas LED',
      category: 'Fiesta',
      activityTitle: '¡Música & Fiesta!: Reparto de cotillón temático y pantuflas cómodas',
      activityId: 'act_inv_fiesta',
      responsible: 'Amigos de los Novios',
      responsibleStatus: 'ok',
      detail: 'Pack fiesta flúor con lentes LED y barras de luz',
      cost: '$35.000',
      status: 'in_progress'
    }
  ];

  const savedShoppingV2 = localStorage.getItem('boda_org_shopping_v2');
  const savedShoppingV1 = localStorage.getItem('boda_org_shopping');
  let loadedShopping = null;

  if (savedShoppingV2) {
    try { loadedShopping = JSON.parse(savedShoppingV2); } catch(e) {}
  }
  if ((!loadedShopping || loadedShopping.length === 0) && savedShoppingV1) {
    try { loadedShopping = JSON.parse(savedShoppingV1); } catch(e) {}
  }

  // Respaldo de compras personalizadas agregadas por el usuario
  let customSavedShopping = [];
  try {
    customSavedShopping = JSON.parse(localStorage.getItem('boda_org_shopping_custom_ye') || '[]');
  } catch(e) {}

  if (loadedShopping && Array.isArray(loadedShopping) && loadedShopping.length > 0) {
    shopping = loadedShopping;
  } else {
    shopping = JSON.parse(JSON.stringify(DEFAULT_SHOPPING_ITEMS));
  }

  // Reintegrar compras del respaldo personalizado si faltan
  if (Array.isArray(customSavedShopping) && customSavedShopping.length > 0) {
    customSavedShopping.forEach(cs => {
      if (!shopping.some(s => s.id === cs.id || (s.item && s.item.toLowerCase() === (cs.item || '').toLowerCase()))) {
        shopping.push(cs);
      }
    });
  }

  // Sincronizar compras requeridas desde las actividades del cronograma
  if (Array.isArray(timeline)) {
    timeline.forEach(m => {
      if (Array.isArray(m.activities)) {
        m.activities.forEach(a => {
          if (a.needsPurchase && (a.shopItem || a.name)) {
            const itemName = a.shopItem || `Insumo para: ${a.name}`;
            const exists = shopping.some(s => 
              (a.shopItemId && s.id === a.shopItemId) ||
              (s.activityId === m.id && s.item && s.item.toLowerCase() === itemName.toLowerCase()) ||
              (s.item && s.item.toLowerCase() === itemName.toLowerCase())
            );
            if (!exists) {
              const newShop = {
                id: a.shopItemId || ('shop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
                activityId: m.id,
                activityTitle: `${m.title}: ${a.name}`,
                item: itemName,
                category: a.shopCategory || 'Decoración',
                responsible: a.responsible || m.responsible || 'Novios',
                responsibleStatus: a.responsibleStatus || 'ok',
                detail: `Vinculado al hito: ${m.title}`,
                cost: a.shopCost || '',
                status: a.shopStatus || 'in_progress'
              };
              shopping.push(newShop);
            }
          }
        });
      }
    });
  }

  // Guardar compras consolidadas
  localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(shopping));

  // Normalizar ítems de cronograma (compatibilidad con timeStart y timeEnd)
  if (Array.isArray(timeline)) {
    timeline.forEach(item => {
      if (!item.timeStart && item.time) {
        const parts = item.time.split(/[-–—]/);
        item.timeStart = parts[0] ? parts[0].trim() : item.time;
        item.timeEnd = parts[1] ? parts[1].trim() : '';
      }
      if (!item.responsibleStatus) {
        item.responsibleStatus = 'ok';
      }
    });
  }

  // Normalizar compras para asegurar encargado y hito vinculado
  if (Array.isArray(shopping)) {
    shopping.forEach(item => {
      if (!item.responsibleStatus) {
        item.responsibleStatus = item.responsible ? 'ok' : 'pending';
      }
    });
  }

  // Cargar y cosechar directorio de responsables/proveedores desde cronograma y compras
  if (typeof loadResponsibles === 'function') {
    loadResponsibles();
  }
  if (typeof window.harvestResponsiblesFromData === 'function') {
    window.harvestResponsiblesFromData();
  }
}

function saveData() {
  if (typeof syncAllShoppingToTimeline === 'function') {
    syncAllShoppingToTimeline();
  }
  localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(tables));
  localStorage.setItem(STORAGE_KEY_UNASSIGNED, JSON.stringify(unassignedGuests));
  localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(timeline));
  localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(shopping));
}

function renderAll() {
  if (typeof syncAllShoppingToTimeline === 'function') {
    syncAllShoppingToTimeline();
  }
  sortTablesAscending();
  updateNextTableNumberInput();
  renderMetrics();
  renderTables();
  renderFloorplan();
  renderUnassignedList();
  renderTimeline();
  renderShopping();
  renderResponsibles();
}

/* ==========================================================================
   2. DETECCIÓN DE PAREJAS / MISMA INVITACIÓN (Acompañantes Vinculados)
   ========================================================================== */

// Determinación de Rol: "I" (Invitado Principal / name1) o "A" (Acompañante / name2)
function getGuestRoleInInvitation(guestName) {
  if (!guestName || typeof guestName !== 'string') return 'I';
  const clean = guestName.trim().toLowerCase();

  let invs = [];
  try {
    const raw = localStorage.getItem('wedding_invitations_cloud_v1');
    if (raw) invs = JSON.parse(raw);
  } catch (e) {}
  const allInvs = [...invs, ...DEFAULT_SEED_INVITATIONS];

  for (const inv of allInvs) {
    if (inv.name1 && isGuestNameMatch(inv.name1, clean)) {
      return 'I';
    }
    if (inv.name2 && isGuestNameMatch(inv.name2, clean)) {
      return 'A';
    }
  }
  return 'I';
}

// Clasificación de Género para Colores 2D: Verde (Hombre) o Calipso (Mujer)
function getGuestGender(guestName) {
  if (!guestName || typeof guestName !== 'string') return 'male';
  const clean = guestName.trim().toLowerCase();
  const first = clean.split(' ')[0];

  const femaleKnown = new Set([
    'natalia', 'bárbara', 'barbara', 'emilia', 'gladys', 'paz', 'valesca', 'priscila',
    'katherine', 'paulina', 'jenn', 'bianca', 'guisselle', 'denisse', 'jaqueline',
    'karen', 'sandra', 'yorka', 'pamela', 'constanza', 'cecilia', 'claudia', 'camila',
    'tah', 'daniela', 'jessica', 'reny', 'evelyn', 'eve', 'carola', 'maria', 'ana', 'sofia', 'lucia',
    'valentina', 'fernanda', 'catalina', 'javiera', 'isidora', 'florencia', 'paula',
    'carolina', 'francisca', 'loreto', 'macarena', 'monica', 'patricia', 'susana'
  ]);

  const maleKnown = new Set([
    'bastian', 'bastián', 'maximo', 'máximo', 'jonathan', 'mateo', 'sebastián', 'sebastian',
    'francisco', 'llergers', 'cristobal', 'cristóbal', 'michel', 'bruno', 'oscar', 'óscar',
    'nicolas', 'nicolás', 'roberto', 'isaac', 'luis', 'jhankhel', 'marcial', 'hugo',
    'eduardo', 'cristopher', 'yimmy', 'carlos', 'felipe', 'juan', 'pedro', 'diego', 'ignacio',
    'matias', 'matías', 'joaquin', 'joaquín', 'manuel', 'jorge', 'alvaro', 'álvaro',
    'gonzalo', 'rodrigo', 'claudio', 'marcelo', 'andres', 'andrés', 'fabián', 'fabian'
  ]);

  if (clean.includes('pastora') || clean.includes('señora') || clean.includes('tía')) return 'female';
  if (clean.includes('pastor') || clean.includes('don') || clean.includes('tío')) return 'male';

  if (femaleKnown.has(first)) return 'female';
  if (maleKnown.has(first)) return 'male';

  if (anyInString(clean, ['jonathan', 'mateo', 'sebastian', 'bastian', 'maximo', 'cristobal'])) return 'male';
  if (anyInString(clean, ['gladys', 'barbara', 'priscila', 'emilia', 'yorka', 'guisselle'])) return 'female';

  if (first.endsWith('a') || first.endsWith('th') || first.endsWith('is')) return 'female';
  return 'male';
}

function anyInString(str, substrs) {
  return substrs.some(s => str.includes(s));
}

function getCompanion(guestName) {
  if (!guestName) return null;
  const clean = guestName.trim().toLowerCase();

  // Revisar si algún acompañante ha declinado (no asiste)
  let declinedCompanions = new Set();
  try {
    const rawR = localStorage.getItem('wedding_rsvps_cloud_v1');
    if (rawR) {
      const rsvps = JSON.parse(rawR);
      rsvps.forEach(r => {
        const att = safeLower(r.attendance);
        const att1 = safeLower(r.attendance1);
        const att2 = safeLower(r.attendance2);
        if (att === 'no' || att1 === 'no' || r.isCompanionDeclined) {
          if (r.name) declinedCompanions.add(r.name.trim().toLowerCase());
        }
        if (att === 'no' || att2 === 'no') {
          if (r.name2) declinedCompanions.add(r.name2.trim().toLowerCase());
        }
        if (r.originalCompanion && (att2 === 'no' || r.isSingleAttendee)) {
          declinedCompanions.add(r.originalCompanion.trim().toLowerCase());
        }
      });
    }
  } catch (e) {}

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
      if (clean === n1) {
        if (declinedCompanions.has(n2)) return null;
        return inv.name2.trim();
      }
      if (clean === n2) {
        if (declinedCompanions.has(n1)) return null;
        return inv.name1.trim();
      }
    }
  }
  return null;
}

function removeGuestFromEverywhere(guestName) {
  if (!guestName || typeof guestName !== 'string') return;
  const clean = guestName.trim().toLowerCase();
  unassignedGuests = unassignedGuests.filter(g => g && typeof g === 'string' && g.trim().toLowerCase() !== clean);
  tables.forEach(t => {
    if (Array.isArray(t.guests)) {
      t.guests = t.guests.map(g => (g && typeof g === 'string' && g.trim().toLowerCase() === clean) ? null : g);
      ensureTableSeatsArray(t);
    }
  });
}

/**
 * Asigna un invitado a una mesa, y si tiene acompañante en la misma invitación,
 * también asigna automáticamente a su acompañante a la misma mesa.
 */
function assignGuestToTable(guestName, tableId) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return false;

  ensureTableSeatsArray(table);
  const companion = getCompanion(guestName);
  const companionAlreadyThere = companion && (table.guests || []).some(g => isGuestNameMatch(g, companion));

  let companionToMove = null;
  let neededSeats = 1;

  if (companion && !companionAlreadyThere) {
    companionToMove = companion;
    neededSeats = 2;
  }

  const seatedCount = getSeatedCount(table);
  const availableSeats = table.capacity - seatedCount;
  if (availableSeats < 1) {
    alert(`La "${table.name}" está completa. No tiene asientos disponibles.`);
    return false;
  }

  // Asignar al invitado principal en el primer asiento libre
  removeGuestFromEverywhere(guestName);
  const emptyIdx = table.guests.findIndex(g => !g || typeof g !== 'string' || !g.trim());
  if (emptyIdx !== -1) {
    table.guests[emptyIdx] = guestName;
  } else if (table.guests.length < table.capacity) {
    table.guests.push(guestName);
  }
  ensureTableSeatsArray(table);

  let toastMessage = `¡Se asignó a ${guestName} a "${table.name}"!`;

  // Asignar automáticamente a la pareja si tienen la misma invitación
  if (companionToMove) {
    if (availableSeats >= 2) {
      removeGuestFromEverywhere(companionToMove);
      const emptyIdx2 = table.guests.findIndex(g => !g || typeof g !== 'string' || !g.trim());
      if (emptyIdx2 !== -1) {
        table.guests[emptyIdx2] = companionToMove;
      } else if (table.guests.length < table.capacity) {
        table.guests.push(companionToMove);
      }
      ensureTableSeatsArray(table);
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
    totalSeated += getSeatedCount(t);
  });

  const totalTablesEl = document.getElementById('metricTotalTables');
  const totalSeatedEl = document.getElementById('metricTotalSeated');
  const availableSeatsEl = document.getElementById('metricAvailableSeats');

  if (totalTablesEl) totalTablesEl.textContent = tables.length;
  if (totalSeatedEl) totalSeatedEl.textContent = `${totalSeated} / ${totalCapacity}`;
  if (availableSeatsEl) availableSeatsEl.textContent = Math.max(0, totalCapacity - totalSeated);

  const metricTimelineEl = document.getElementById('metricTimelineProgress');
  if (metricTimelineEl) metricTimelineEl.textContent = `${timeline.length} Hitos`;

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
    ensureTableSeatsArray(table);
    const seatedGuests = getSeatedGuests(table);
    const seatedCount = seatedGuests.length;
    const isFull = seatedCount >= table.capacity;

    const card = document.createElement('div');
    card.className = 'table-card';
    card.dataset.tableId = table.id;

    // Dropzone attributes
    card.addEventListener('dragover', (e) => handleTableDragOver(e, table.id));
    card.addEventListener('dragleave', (e) => handleTableDragLeave(e, table.id));
    card.addEventListener('drop', (e) => handleTableDrop(e, table.id));

    let guestsHtml = '';
    if (seatedCount === 0) {
      guestsHtml = '<li style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 8px 0;">Sin invitados asignados aún (arrastra aquí)</li>';
    } else {
      table.guests.forEach((guest, idx) => {
        if (!guest || typeof guest !== 'string' || !guest.trim()) return;
        const companion = getCompanion(guest);
        const hasCompanionInTable = companion && seatedGuests.some(g => isGuestNameMatch(g, companion));
        const ringsIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.3" style="display:inline-block; vertical-align:middle; margin-right:3px;"><circle cx="8.5" cy="12" r="5.5"/><circle cx="15.5" cy="12" r="5.5"/></svg>`;
        const companionBadge = hasCompanionInTable ? `<small style="font-size: 0.72rem; color: #475569; font-weight: 700;" title="Acompañante de invitación: ${escapeHtml(companion)}">${ringsIcon} Pareja: ${escapeHtml(companion)}</small>` : '';

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
        <div class="table-card-info">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span class="table-badge-capacity ${isFull ? 'full' : ''}" title="Asientos asignados / Capacidad total">
              ${seatedCount} / ${table.capacity}
            </span>
          </div>
          <h3 class="table-card-title">${escapeHtml(table.name)}</h3>
        </div>
        <div class="table-card-header-actions">
          <button class="btn-table-edit" onclick="openEditTableModal('${table.id}')" title="Editar nombre y capacidad de asientos">
            <i class="ri-edit-line"></i> <span>Editar</span>
          </button>
        </div>
      </div>
      <ul class="table-guests-list">
        ${guestsHtml}
      </ul>
      <div class="table-card-footer">
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
const STORAGE_KEY_GUEST_SHAPE = 'boda_org_guest_shape_v2';
const STORAGE_KEY_NOVIOS_SHAPE = 'boda_org_novios_shape_v2';

function isNoviosTable(table) {
  if (!table) return false;
  // Solo la mesa 1 es la mesa de los novios (evitar confundir con 'Familia del Novio')
  if (table.id === 't_1' || table.number === 1) return true;
  const name = (table.name || '').toLowerCase();
  return /\b(los\s+novios|mesa\s+presidencial)\b/i.test(name) && !/\bfamilia\b/i.test(name);
}

function getGuestTablesShape() {
  return localStorage.getItem(STORAGE_KEY_GUEST_SHAPE) || 'round';
}

function getNoviosTableShape() {
  return localStorage.getItem(STORAGE_KEY_NOVIOS_SHAPE) || 'rectangular';
}

function getTableShape(table) {
  if (isNoviosTable(table)) {
    return table.shape || getNoviosTableShape();
  }
  return table.shape || getGuestTablesShape();
}

window.setAllGuestTablesShape = function(newShape) {
  localStorage.setItem(STORAGE_KEY_GUEST_SHAPE, newShape);
  tables.forEach(t => {
    if (!isNoviosTable(t)) {
      t.shape = newShape;
      t.type = newShape;
    }
  });
  saveData();
  renderAll();
  updateShapeToggleButtons();
  const label = newShape === 'round' ? 'redondas' : (newShape === 'square' ? 'cuadradas' : 'rectangulares');
  showToast(`¡Todas las mesas de invitados cambiaron a forma ${label}!`);
};

window.setNoviosTableShape = function(newShape) {
  localStorage.setItem(STORAGE_KEY_NOVIOS_SHAPE, newShape);
  const noviosTable = tables.find(isNoviosTable);
  if (noviosTable) {
    noviosTable.shape = newShape;
    noviosTable.type = newShape;
    saveData();
  }
  renderAll();
  updateShapeToggleButtons();
  const label = newShape === 'round' ? 'redonda' : (newShape === 'square' ? 'cuadrada' : 'rectangular');
  showToast(`¡Mesa de los novios cambiada a forma ${label}!`);
};

function updateShapeToggleButtons() {
  const guestShape = getGuestTablesShape();
  const noviosShape = getNoviosTableShape();

  document.querySelectorAll('#groupGuestTableShapes .btn-shape-toggle').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.guestShape === guestShape);
  });

  document.querySelectorAll('#groupNoviosTableShapes .btn-shape-toggle').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.noviosShape === noviosShape);
  });
}

function renderFloorplan() {
  const canvas = document.getElementById('floorplanCanvas');
  if (!canvas) return;

  canvas.innerHTML = '';
  updateShapeToggleButtons();

  // Ajustar la altura mínima del lienzo dinámicamente si hay muchas mesas hacia abajo
  let maxY = 680;
  tables.forEach(t => {
    if (t.posY !== undefined) {
      maxY = Math.max(maxY, t.posY + 220);
    }
  });
  canvas.style.minHeight = `${maxY}px`;

  tables.forEach((table, tableIdx) => {
    ensureTableSeatsArray(table);
    const seatedCount = getSeatedCount(table);
    const isFull = seatedCount >= table.capacity;
    const isNovios = isNoviosTable(table);
    const shape = getTableShape(table);
    const rectWidth = Math.max(200, (table.capacity || 8) * 75 + 40);

    const node = document.createElement('div');
    node.className = `fp-table-node fp-shape-${shape} ${isNovios ? 'fp-is-novios' : ''}`;
    node.id = `fp_node_${table.id}`;
    node.dataset.tableId = table.id;
    node.style.left = `${table.posX !== undefined ? table.posX : 100}px`;
    node.style.top = `${table.posY !== undefined ? table.posY : 100}px`;

    if (shape === 'rectangular') {
      node.style.width = `${rectWidth}px`;
      node.style.height = '85px';
    } else {
      node.style.width = '';
      node.style.height = '';
    }

    // Distintivo de Cabecera para Mesa de los Novios (100% visible dentro de la superficie)
    let noviosCrownTag = '';
    if (isNovios) {
      noviosCrownTag = '<div class="fp-novios-crown-tag"><i class="ri-vip-crown-2-fill"></i> Mesa de los Novios</div>';
    }

    const cleanName = getCleanTableName(table.name);
    const displayName = isNovios ? (cleanName || 'Presidencial') : cleanName;

    // Superficie central de la mesa
    node.innerHTML = `
      <div class="fp-table-surface" onclick="openEditTableModal('${table.id}')" title="Haz clic al centro de la mesa para editarla (nombre, capacidad, número) o arrástrala por el salón">
        ${noviosCrownTag}
        <span class="fp-table-number">Mesa ${table.number || (tableIdx + 1)}</span>
        <span class="fp-table-name" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</span>
        <span class="fp-table-capacity ${isFull ? 'full' : ''}">${seatedCount} / ${table.capacity}</span>
        <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
          <button type="button" class="fp-btn-edit-table-inline" onclick="event.stopPropagation(); openEditTableModal('${table.id}')" title="Editar mesa">
            <i class="ri-edit-line"></i> Editar
          </button>
          <button type="button" class="fp-btn-manage-seats" onclick="event.stopPropagation(); openSeatsModal('${table.id}')" title="Acomodar puestos de invitados y parejas">
            <i class="ri-user-shared-line"></i> Puestos
          </button>
        </div>
      </div>
    `;

    // Dropzone en la superficie de la mesa para asignar invitados arrastrados
    node.addEventListener('dragover', (e) => {
      if (e.target.closest('.fp-chair')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      node.classList.add('drag-over');
    });

    node.addEventListener('dragleave', (e) => {
      node.classList.remove('drag-over');
    });

    node.addEventListener('drop', (e) => {
      if (e.target.closest('.fp-chair')) return;
      e.preventDefault();
      node.classList.remove('drag-over');
      if (draggedGuestName) {
        assignGuestToTable(draggedGuestName, table.id);
        draggedGuestName = null;
        draggedSourceTableId = null;
        draggedSourceSeatIndex = null;
      }
    });

    // Renderizar sillas con nombres visibles y puestos arrastrables
    const chairs = generateChairsForTable(table);
    chairs.forEach(chair => {
      node.appendChild(chair);
    });

    canvas.appendChild(node);
  });
}

function ensureNoviosInCenterOfTable(table) {
  if (!isNoviosTable(table) || !table.guests || table.seatsCustom) return;
  const seated = getSeatedGuests(table);
  if (seated.length < 2) return;

  // Identificar a los novios
  let novio1 = seated.find(isNovioGuest) || seated[0];
  let comp = getCompanion(novio1);
  let novio2 = comp ? seated.find(g => isGuestNameMatch(g, comp)) : seated.find(g => isNovioGuest(g) && !isGuestNameMatch(g, novio1));
  if (!novio2 && seated.length > 1) {
    novio2 = seated.find(g => !isGuestNameMatch(g, novio1));
  }
  if (!novio2) return;

  const others = seated.filter(g => !isGuestNameMatch(g, novio1) && !isGuestNameMatch(g, novio2));

  const cap = table.capacity || 2;
  const newGuests = new Array(cap).fill(null);

  if (others.length === 0) {
    // Solo los novios: centrados exactamente en los asientos del medio de la mesa
    const centerStart = Math.max(0, Math.floor((cap - 2) / 2));
    newGuests[centerStart] = novio1;
    if (centerStart + 1 < cap) {
      newGuests[centerStart + 1] = novio2;
    }
  } else {
    // Novios e invitados adicionales: centrados simétricamente
    const totalCount = 2 + others.length;
    const startIdx = Math.max(0, Math.floor((cap - totalCount) / 2));
    const leftCount = Math.floor(others.length / 2);
    const leftOthers = others.slice(0, leftCount);
    const rightOthers = others.slice(leftCount);

    let cur = startIdx;
    for (const g of leftOthers) {
      if (cur < cap) newGuests[cur++] = g;
    }
    if (cur < cap) newGuests[cur++] = novio1;
    if (cur < cap) newGuests[cur++] = novio2;
    for (const g of rightOthers) {
      if (cur < cap) newGuests[cur++] = g;
    }
  }

  table.guests = newGuests;
  ensureTableSeatsArray(table);
}

function generateChairsForTable(table) {
  const chairs = [];
  const capacity = table.capacity || 8;
  const isNovios = isNoviosTable(table);
  const shape = getTableShape(table);

  if (shape === 'round') {
    // 🟡 Redonda (Circular): Puestos distribuidos uniformemente en 360°
    const R = 88;
    const centerX = 70;
    const centerY = 70;

    for (let i = 0; i < capacity; i++) {
      const angle = (2 * Math.PI * i / capacity) - (Math.PI / 2);
      const x = Math.round(centerX + R * Math.cos(angle));
      const y = Math.round(centerY + R * Math.sin(angle));

      chairs.push(createChairElement(table, i, x, y));
    }
  } else if (shape === 'square') {
    // ⬜ Cuadrada: Puestos distribuidos alrededor de los 4 costados (Arriba, Derecha, Abajo, Izquierda)
    const N = capacity;
    const q = Math.floor(N / 4);
    const r = N % 4;

    const topCount = q + (r > 0 ? 1 : 0);
    const rightCount = q + (r > 2 ? 1 : 0);
    const bottomCount = q + (r > 1 ? 1 : 0);
    const leftCount = q;

    let seatIdx = 0;

    // 1. Lado Arriba (de izquierda a derecha)
    for (let k = 0; k < topCount; k++) {
      const step = 140 / (topCount + 1);
      const x = Math.round(step * (k + 1));
      const y = -14;
      chairs.push(createChairElement(table, seatIdx++, x, y));
    }

    // 2. Lado Derecho (de arriba a abajo)
    for (let k = 0; k < rightCount; k++) {
      const step = 140 / (rightCount + 1);
      const x = 154;
      const y = Math.round(step * (k + 1));
      chairs.push(createChairElement(table, seatIdx++, x, y));
    }

    // 3. Lado Abajo (de derecha a izquierda)
    for (let k = 0; k < bottomCount; k++) {
      const step = 140 / (bottomCount + 1);
      const x = Math.round(140 - step * (k + 1));
      const y = 154;
      chairs.push(createChairElement(table, seatIdx++, x, y));
    }

    // 4. Lado Izquierdo (de abajo a arriba)
    for (let k = 0; k < leftCount; k++) {
      const step = 140 / (leftCount + 1);
      const x = -14;
      const y = Math.round(140 - step * (k + 1));
      chairs.push(createChairElement(table, seatIdx++, x, y));
    }
  } else {
    // ▭ Rectangular: Todos los invitados ubicados uno al lado del otro en un solo lado (frente al salón)
    // y los novios al centro de la mesa
    if (isNovios) {
      ensureNoviosInCenterOfTable(table);
    }

    const rectWidth = Math.max(200, capacity * 75 + 40);
    const step = rectWidth / (capacity + 1);
    const y = -34; // En la parte superior de la mesa, mirando hacia las otras mesas del salón

    for (let i = 0; i < capacity; i++) {
      const x = Math.round(step * (i + 1));
      chairs.push(createChairElement(table, i, x, y));
    }
  }

  return chairs;
}

function createChairElement(table, seatIndex, x, y) {
  const chair = document.createElement('div');
  const guest = (table.guests && seatIndex < table.guests.length) ? table.guests[seatIndex] : null;
  const isOccupied = !!(guest && typeof guest === 'string' && guest.trim());
  const isNovios = isNoviosTable(table);

  chair.style.left = `${x}px`;
  chair.style.top = `${y}px`;
  chair.dataset.tableId = table.id;
  chair.dataset.seatIndex = seatIndex;

  // Drop targets para sillas (reubicar o intercambiar puestos)
  chair.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    chair.classList.add('drag-over');
  });

  chair.addEventListener('dragleave', (e) => {
    e.stopPropagation();
    chair.classList.remove('drag-over');
  });

  chair.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    chair.classList.remove('drag-over');
    handleChairDrop(table.id, seatIndex);
  });

  if (isOccupied && guest) {
    chair.draggable = true;
    chair.dataset.guest = guest;

    const companion = getCompanion(guest);
    const hasCompanionInTable = companion && (table.guests || []).some(g => isGuestNameMatch(g, companion));
    
    // EXCLUSIVAMENTE Laura y Nico son los novios (nadie más por posición de silla)
    const isNovio = isNovioGuest(guest);

    const role = getGuestRoleInInvitation(guest); // 'I' (Invitado) o 'A' (Acompañante)
    const gender = getGuestGender(guest); // 'male' (Verde) o 'female' (Calipso)
    const firstName = guest.split(' ')[0] || guest;

    // Si es novio/novia, AMBOS tienen el MISMO COLOR VIP REAL (distinto a verde y calipso)
    const colorClass = isNovio ? 'novios' : gender;
    chair.className = `fp-chair seated ${hasCompanionInTable ? 'couple' : ''} ${isNovio ? 'is-novio' : ''} color-${colorClass} role-${role.toLowerCase()}`;

    const circleLetter = `<span class="fp-role-letter">${role}</span>`;
    const crownMini = isNovio ? '<i class="ri-vip-crown-2-fill fp-crown-mini" title="Novios VIP"></i>' : '';

    const roleTitle = isNovio ? `Novios VIP (${role === 'I' ? 'Novio I' : 'Novia A'})` : (role === 'I' ? 'Invitado Principal (I)' : 'Acompañante (A)');
    const colorTitle = isNovio ? 'Color Especial Novios' : (gender === 'male' ? 'Hombre (Verde)' : 'Mujer (Calipso)');

    chair.innerHTML = `
      <div class="fp-chair-circle circle-${colorClass}" title="${escapeHtml(guest)} — ${roleTitle} • ${colorTitle}">
        ${circleLetter}
        ${crownMini}
      </div>
      <div class="fp-chair-name name-${colorClass}" title="${escapeHtml(guest)}">${escapeHtml(firstName)}</div>
    `;

    const roleText = role === 'I' ? 'Invitado Principal (I)' : 'Acompañante (A)';
    const genderText = gender === 'male' ? 'Hombre' : 'Mujer';
    const tooltipText = `Puesto ${seatIndex + 1}: ${guest} — ${roleText} • ${genderText}` + (hasCompanionInTable ? ` (👥 Pareja con: ${companion})` : '') + ' (Arrastra para mover de puesto)';
    chair.dataset.tooltip = tooltipText;

    chair.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      draggedGuestName = guest;
      draggedSourceTableId = table.id;
      draggedSourceSeatIndex = seatIndex;
      chair.classList.add('dragging');
      e.dataTransfer.setData('text/plain', guest);
      e.dataTransfer.effectAllowed = 'move';
    });

    chair.addEventListener('dragend', () => {
      chair.classList.remove('dragging');
      document.querySelectorAll('.fp-chair, .fp-table-node, .table-card, #unassignedList').forEach(el => {
        el.classList.remove('drag-over');
      });
      draggedGuestName = null;
      draggedSourceTableId = null;
      draggedSourceSeatIndex = null;
    });

    chair.addEventListener('click', (e) => {
      e.stopPropagation();
      openSeatsModal(table.id);
    });

  } else {
    // Asiento libre
    chair.className = 'fp-chair empty';
    chair.innerHTML = `
      <div class="fp-chair-circle"><i class="ri-add-line" style="font-size: 0.72rem;"></i></div>
      <div class="fp-chair-name empty">Libre</div>
    `;
    chair.dataset.tooltip = `Puesto ${seatIndex + 1}: Asiento Libre (Clic o arrastra un invitado aquí)`;

    chair.addEventListener('click', (e) => {
      e.stopPropagation();
      openAssignModal(table.id);
    });
  }

  return chair;
}

function handleChairDrop(targetTableId, targetSeatIndex) {
  if (!draggedGuestName) return;

  const targetTable = tables.find(t => t.id === targetTableId);
  if (!targetTable) return;
  ensureTableSeatsArray(targetTable);

  const srcTableId = draggedSourceTableId;
  const srcSeatIdx = draggedSourceSeatIndex;

  if (srcTableId === targetTableId) {
    // Reubicación dentro de la misma mesa
    if (srcSeatIdx !== null && srcSeatIdx !== undefined && srcSeatIdx !== targetSeatIndex) {
      const temp = targetTable.guests[srcSeatIdx];
      targetTable.guests[srcSeatIdx] = targetTable.guests[targetSeatIndex] || null;
      targetTable.guests[targetSeatIndex] = temp;
      targetTable.seatsCustom = true;
      ensureTableSeatsArray(targetTable);
      saveData();
      renderAll();
      showToast(`¡Puesto de ${draggedGuestName} reubicado en "${targetTable.name}"!`);
    }
  } else if (srcTableId === 'unassigned') {
    // Asignar desde la lista de pendientes al asiento
    const guestIdx = unassignedGuests.indexOf(draggedGuestName);
    if (guestIdx !== -1) {
      unassignedGuests.splice(guestIdx, 1);
    }
    const previousOccupant = targetTable.guests[targetSeatIndex];
    targetTable.guests[targetSeatIndex] = draggedGuestName;
    targetTable.seatsCustom = true;
    if (previousOccupant && typeof previousOccupant === 'string' && previousOccupant.trim()) {
      if (!unassignedGuests.includes(previousOccupant)) {
        unassignedGuests.push(previousOccupant);
      }
    }
    ensureTableSeatsArray(targetTable);
    saveData();
    renderAll();
    showToast(`¡${draggedGuestName} asignado al puesto en "${targetTable.name}"!`);
  } else {
    // Mover desde otra mesa hacia esta
    const srcTable = tables.find(t => t.id === srcTableId);
    if (!srcTable) return;
    ensureTableSeatsArray(srcTable);

    const targetGuest = targetTable.guests[targetSeatIndex];
    srcTable.guests[srcSeatIdx] = (targetGuest && typeof targetGuest === 'string' && targetGuest.trim()) ? targetGuest : null;
    targetTable.guests[targetSeatIndex] = draggedGuestName;
    srcTable.seatsCustom = true;
    targetTable.seatsCustom = true;
    ensureTableSeatsArray(srcTable);
    ensureTableSeatsArray(targetTable);

    saveData();
    renderAll();
    if (targetGuest && typeof targetGuest === 'string' && targetGuest.trim()) {
      showToast(`¡Intercambiados ${draggedGuestName} y ${targetGuest} entre mesas!`);
    } else {
      showToast(`¡${draggedGuestName} movido a "${targetTable.name}"!`);
    }
  }

  draggedGuestName = null;
  draggedSourceTableId = null;
  draggedSourceSeatIndex = null;
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

  sortTablesAscending();

  const noviosTable = tables.find(isNoviosTable) || tables.find(t => t.number === 1) || tables[0];
  const canvas = document.getElementById('floorplanCanvas');
  const canvasWidth = canvas ? (canvas.clientWidth || 1050) : 1050;
  const noviosShape = getTableShape(noviosTable);
  const noviosWidth = (noviosShape === 'rectangular')
    ? Math.max(200, (noviosTable.capacity || 2) * 75 + 40)
    : (noviosShape === 'square' ? 130 : 136);

  noviosTable.posX = Math.round((canvasWidth - noviosWidth) / 2);
  noviosTable.posY = 50;

  const others = tables.filter(t => t !== noviosTable);
  others.sort((a, b) => {
    const numA = parseInt(a.number, 10) || 0;
    const numB = parseInt(b.number, 10) || 0;
    return numA - numB;
  });

  others.forEach((t, i) => {
    const coords = getCoordsForTableNumber(i + 2);
    t.posX = coords.x;
    t.posY = coords.y;
  });

  saveData();
  renderFloorplan();
  showToast('¡Mesas auto-alineadas organizadas por número en el salón!');
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
  const seated = getSeatedGuests(table);

  if (seated.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px 15px; color: var(--text-muted); background: #F8FAFC; border-radius: 12px; border: 1.5px dashed #CBD5E1;">
        <i class="ri-user-unfollow-line" style="font-size: 2rem; color: #94A3B8; display: block; margin-bottom: 8px;"></i>
        Esta mesa aún no tiene comensales sentados.<br>
        Usa <strong>"Asignar Invitado"</strong> para ubicar a las personas aquí.
      </div>
    `;
    return;
  }

  seated.forEach((guest, idx) => {
    const companion = getCompanion(guest);
    const hasCompanionInTable = companion && seated.some(g => isGuestNameMatch(g, companion));

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
        <button type="button" class="btn-seat-move" onclick="moveSeatItem('${table.id}', ${idx}, 1)" ${idx === seated.length - 1 ? 'disabled' : ''} title="Mover puesto hacia atrás">
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

  const idx1 = table.guests.findIndex(g => isGuestNameMatch(g, guestName));
  const idx2 = table.guests.findIndex(g => isGuestNameMatch(g, companion));

  if (idx1 !== -1 && idx2 !== -1) {
    const temp = table.guests[idx1];
    table.guests[idx1] = table.guests[idx2];
    table.guests[idx2] = temp;
    table.seatsCustom = true;

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
  if (!guest) return;
  const companion = getCompanion(guest);
  const companionIdx = companion ? table.guests.findIndex(g => isGuestNameMatch(g, companion)) : -1;

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

  table.seatsCustom = true;
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
    const companionBadge = companion ? `<small style="font-size: 0.7rem; color: #475569; font-weight: 700; display: block;">👥 Pareja: ${escapeHtml(companion)}</small>` : '';

    const item = document.createElement('li');
    item.className = 'unassigned-item';
    item.draggable = true;
    item.dataset.guest = guest;
    item.dataset.source = 'unassigned';
    item.title = "Arrastra hacia cualquier mesa o pulsa 'Ubicar'";

    item.innerHTML = `
      <div class="guest-name-pill" style="flex-direction: column; align-items: flex-start; gap: 2px;">
        <span style="display: flex; align-items: center; gap: 5px;">
          <i class="ri-user-line" style="color: #475569;"></i>
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
    const seatedCount = getSeatedCount(table);
    const freeSeats = Math.max(0, table.capacity - seatedCount);
    const needed = companion ? 2 : 1;
    const hasSpace = freeSeats >= needed;

    const row = document.createElement('div');
    row.className = `pick-table-row ${hasSpace ? '' : 'disabled'}`;

    row.innerHTML = `
      <div class="pick-table-info">
        <span class="pick-table-name">${escapeHtml(table.name)}</span>
        <span class="pick-table-seats">
          ${seatedCount} / ${table.capacity} (${freeSeats} disponibles)
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

  const seatedCount = getSeatedCount(table);
  capInput.value = table.capacity;
  capInput.min = Math.max(1, seatedCount);

  if (seatsHint) {
    seatsHint.textContent = `Actualmente hay ${seatedCount} personas sentadas. La capacidad mínima permitida es ${seatedCount}.`;
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
   9. Cronograma (Hitos Minuto a Minuto) & Compras Vinculadas
   ========================================================================== */

function formatTimelineTime(item) {
  if (!item) return '—';
  const rawStart = (item.timeStart || item.time || '').trim();
  if (rawStart.toLowerCase().includes('todo el evento') || item.id === 'act_todo_el_evento') {
    return 'Todo el Evento';
  }
  const start = item.timeStart || item.time || '';
  const end = item.timeEnd || '';
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return `Hasta ${end}`;
  return '—';
}

function getTimelineSortKey(item) {
  if (!item) return '99:99';
  const raw = (item.timeStart || item.time || '').trim().toLowerCase();
  if (raw.includes('todo el evento') || item.id === 'act_todo_el_evento') {
    return '00:00'; // Siempre al inicio del día
  }
  return (item.timeStart || item.time || '99:99').trim();
}

function populateShoppingModalActivities() {
  const select = document.getElementById('shopLinkedActivity');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '<option value="">— Ninguno (Compra general) —</option>';
  timeline.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    const timeFormatted = formatTimelineTime(t);
    opt.textContent = `${t.title} (${timeFormatted})`;
    select.appendChild(opt);
  });
  if (currentVal) select.value = currentVal;
}

window.goToShopping = function(shopId) {
  switchTab('pane-shopping');
  setTimeout(() => {
    const row = document.getElementById(`shop_row_${shopId}`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.style.transition = 'background 0.5s ease';
      row.style.background = '#FEF3C7';
      setTimeout(() => { row.style.background = ''; }, 2000);
    }
  }, 120);
};

window.goToTimelineActivity = function(titleOrId) {
  switchTab('pane-timeline');
  if (!window.expandedMilestones) window.expandedMilestones = new Set();
  const act = timeline.find(t => t.id === titleOrId || (t.title && t.title.toLowerCase().includes((titleOrId || '').toLowerCase())));
  if (act) {
    window.expandedMilestones.add(act.id);
    renderTimeline();
    setTimeout(() => {
      const card = document.querySelector(`.timeline-milestone-card[data-milestone-id="${act.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
        card.style.borderColor = 'var(--gold-primary)';
        card.style.boxShadow = '0 0 0 3px rgba(148, 163, 184, 0.4)';
        setTimeout(() => {
          card.style.boxShadow = '';
        }, 1800);
      }
    }, 100);
  }
};

window.quickAddShopForActivity = function(activityId) {
  const act = timeline.find(t => t.id === activityId);
  const shoppingModal = document.getElementById('shoppingModal');
  const shopItem = document.getElementById('shopItem');
  const shopLinked = document.getElementById('shopLinkedActivity');
  const shopResp = document.getElementById('shopResponsible');
  const shopRespStat = document.getElementById('shopRespStatus');

  populateShoppingModalActivities();

  if (shopLinked && act) {
    shopLinked.value = act.id;
  }
  if (shopResp) {
    if (typeof window.populateResponsibleSelect === 'function') {
      window.populateResponsibleSelect(shopResp, (act && act.responsible && !isResponsibleDeleted(act.responsible)) ? act.responsible : '');
    } else {
      shopResp.value = (act && act.responsible) ? act.responsible : '';
    }
  }
  if (shopRespStat && act && act.responsibleStatus) {
    shopRespStat.value = act.responsibleStatus;
  }
  if (shopItem) {
    shopItem.value = '';
    setTimeout(() => shopItem.focus(), 150);
  }

  if (shoppingModal) shoppingModal.classList.add('active');
};


/* ==========================================================================
   GESTIÓN DE ACTIVIDADES MÚLTIPLES DENTRO DE HITOS
   ========================================================================== */
function createSubActivityCard(data = {}) {
  const cardId = 'subact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const card = document.createElement('div');
  card.className = 'subact-card';
  card.dataset.subactId = cardId;

  const currentCount = document.querySelectorAll('#subActivitiesContainer .subact-card').length + 1;
  const isPurchaseChecked = !!data.needsPurchase;

  card.innerHTML = `
    <div class="subact-card-top">
      <span class="subact-num"><i class="ri-checkbox-circle-line"></i> Actividad ${currentCount}</span>
      <button type="button" class="btn-del-subact" title="Quitar esta actividad" onclick="removeSubActivityCard(this)">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>

    <div class="form-group-org" style="margin-bottom: 10px;">
      <label>Nombre de la Actividad *</label>
      <input type="text" class="input-org input-subact-name" placeholder="Ej.: Cartel de bienvenida / Aguas saborizadas" value="${escapeHtml(data.name || '')}">
    </div>

    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 10px; margin-bottom: 10px;">
      <div class="form-group-org" style="margin-bottom: 0;">
        <label>Encargado(a)</label>
        <input type="text" class="input-org input-subact-resp" list="responsiblesDatalist" placeholder="Selecciona o escribe encargado..." value="${escapeHtml(data.responsible || '')}">
      </div>
      <div class="form-group-org" style="margin-bottom: 0;">
        <label>¿Encargado OK?</label>
        <select class="select-org select-subact-resp-status">
          <option value="ok" ${data.responsibleStatus === 'ok' ? 'selected' : ''}>✓ Confirmado / OK</option>
          <option value="pending" ${data.responsibleStatus === 'pending' ? 'selected' : ''}>⏳ Por Buscar</option>
        </select>
      </div>
    </div>

    <!-- Sección Compra / Mandar a hacer -->
    <div class="subact-purchase-box">
      <label class="subact-purchase-toggle">
        <input type="checkbox" class="check-subact-purchase" ${isPurchaseChecked ? 'checked' : ''} onchange="toggleSubactPurchase(this)">
        <span>🛍️ ¿Hay que comprar o mandar a hacer algo para esta actividad?</span>
      </label>

      <div class="subact-purchase-fields" style="display: ${isPurchaseChecked ? 'block' : 'none'};">
        <div class="form-group-org" style="margin-bottom: 8px;">
          <label>¿Qué hay que comprar o mandar a hacer? *</label>
          <input type="text" class="input-org input-subact-item" placeholder="Ej.: Cartel de bienvenida en acrílico" value="${escapeHtml(data.shopItem || '')}">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div class="form-group-org" style="margin-bottom: 0;">
            <label>Categoría</label>
            <select class="select-org select-subact-cat">
              <option value="Decoración" ${data.shopCategory === 'Decoración' ? 'selected' : ''}>Decoración</option>
              <option value="Ceremonia" ${data.shopCategory === 'Ceremonia' ? 'selected' : ''}>Ceremonia</option>
              <option value="Fiesta" ${data.shopCategory === 'Fiesta' ? 'selected' : ''}>Fiesta</option>
              <option value="Vestuario" ${data.shopCategory === 'Vestuario' ? 'selected' : ''}>Vestuario</option>
              <option value="Detalles" ${data.shopCategory === 'Detalles' ? 'selected' : ''}>Detalles</option>
              <option value="Varios" ${(!data.shopCategory || data.shopCategory === 'Varios') ? 'selected' : ''}>Varios</option>
            </select>
          </div>
          <div class="form-group-org" style="margin-bottom: 0;">
            <label>Costo Estimado</label>
            <input type="text" class="input-org input-subact-cost" placeholder="Ej.: $25.000" value="${escapeHtml(data.shopCost || '')}">
          </div>
          <div class="form-group-org" style="margin-bottom: 0;">
            <label>¿Estado?</label>
            <select class="select-org select-subact-status">
              <option value="pending" ${data.shopStatus === 'pending' ? 'selected' : ''}>⏳ Pendiente</option>
              <option value="in_progress" ${data.shopStatus === 'in_progress' ? 'selected' : ''}>🎨 Mandado a Hacer</option>
              <option value="ok" ${data.shopStatus === 'ok' ? 'selected' : ''}>✓ Ya Listo</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;

  return card;
}

window.toggleSubactPurchase = function(checkbox) {
  const box = checkbox.closest('.subact-purchase-box');
  if (!box) return;
  const fields = box.querySelector('.subact-purchase-fields');
  const itemInput = box.querySelector('.input-subact-item');
  if (fields) {
    fields.style.display = checkbox.checked ? 'block' : 'none';
  }
  
  if (checkbox.checked) {
    setTimeout(() => {
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  }
};

window.removeSubActivityCard = function(btn) {
  const container = document.getElementById('subActivitiesContainer');
  const card = btn.closest('.subact-card');
  if (container && card) {
    if (container.querySelectorAll('.subact-card').length <= 1) {
      showToast('El hito debe tener al menos una actividad');
      return;
    }
    card.remove();
    // Renumerar tarjetas restantes
    container.querySelectorAll('.subact-card').forEach((c, idx) => {
      const numSpan = c.querySelector('.subact-num');
      if (numSpan) numSpan.innerHTML = `<i class="ri-checkbox-circle-line"></i> Actividad ${idx + 1}`;
    });
  }
};

window.toggleMilestoneSubactResp = function(milestoneId, subactIdx) {
  const m = timeline.find(t => t.id === milestoneId);
  if (!m || !m.activities || !m.activities[subactIdx]) return;
  const current = m.activities[subactIdx].responsibleStatus || 'ok';
  m.activities[subactIdx].responsibleStatus = (current === 'ok') ? 'pending' : 'ok';
  saveData();
  renderAll();
  showToast(`Estado del encargado actualizado a "${m.activities[subactIdx].responsibleStatus === 'ok' ? 'Confirmado' : 'Por Buscar'}"`);
};

// Estado global de hitos expandidos en el cronograma
window.expandedMilestones = window.expandedMilestones || new Set();

function getMilestoneIcon(item) {
  const t = (item.title || '').toLowerCase();
  const d = (item.detail || '').toLowerCase();
  if (t.includes('maquillaje') || t.includes('peinado') || d.includes('peinado')) return 'ri-magic-line';
  if (t.includes('foto') || t.includes('fotógrafo') || t.includes('cámara') || t.includes('spot')) return 'ri-camera-lens-line';
  if (t.includes('montaje') || t.includes('floral') || t.includes('decor') || t.includes('mesa')) return 'ri-flower-line';
  if (t.includes('sonido') || t.includes('dj') || t.includes('micrófono')) return 'ri-mic-line';
  if (t.includes('manta') || t.includes('llegada') || t.includes('pasto') || t.includes('bienvenida')) return 'ri-sun-line';
  if (t.includes('ceremonia') || t.includes('votos') || t.includes('civil') || t.includes('religios')) return 'ri-hearts-line';
  if (t.includes('cóctel') || t.includes('coctel') || t.includes('brindis') || t.includes('champaña')) return 'ri-goblet-line';
  if (t.includes('almuerzo') || t.includes('banquete') || t.includes('cena') || t.includes('comida')) return 'ri-restaurant-2-line';
  if (t.includes('sobremesa') || t.includes('café') || t.includes('torta') || t.includes('postre')) return 'ri-cake-3-line';
  if (t.includes('vals') || t.includes('baile')) return 'ri-music-2-line';
  if (t.includes('fiesta') || t.includes('música') || t.includes('barra')) return 'ri-disc-line';
  if (t.includes('bajón') || t.includes('trasnoche') || t.includes('despedida') || t.includes('bengala')) return 'ri-moon-line';
  if (t.includes('todo el evento')) return 'ri-calendar-todo-line';
  return 'ri-time-line';
}

function updateToggleAllButtonText() {
  const btn = document.getElementById('btnToggleAllTimeline');
  const txt = document.getElementById('toggleAllTimelineText');
  if (!btn || !txt) return;
  const isAllExpanded = timeline.length > 0 && window.expandedMilestones.size >= timeline.length;
  if (isAllExpanded) {
    btn.innerHTML = '<i class="ri-collapse-diagonal-line"></i> <span id="toggleAllTimelineText">Colapsar Todo</span>';
  } else {
    btn.innerHTML = '<i class="ri-expand-up-down-line"></i> <span id="toggleAllTimelineText">Expandir Todo</span>';
  }
}

window.toggleMilestoneCard = function(id) {
  if (!window.expandedMilestones) window.expandedMilestones = new Set();
  const card = document.querySelector(`.timeline-milestone-card[data-milestone-id="${id}"]`);
  if (!card) return;
  const body = card.querySelector('.milestone-card-body');

  if (window.expandedMilestones.has(id)) {
    window.expandedMilestones.delete(id);
    card.classList.remove('expanded');
    if (body) body.style.display = 'none';
  } else {
    window.expandedMilestones.add(id);
    card.classList.add('expanded');
    if (body) body.style.display = 'block';
  }
  updateToggleAllButtonText();
};

window.toggleAllTimelineMilestones = function() {
  if (!window.expandedMilestones) window.expandedMilestones = new Set();
  const allCards = document.querySelectorAll('.timeline-milestone-card');
  const shouldExpand = window.expandedMilestones.size < timeline.length;
  if (shouldExpand) {
    timeline.forEach(t => window.expandedMilestones.add(t.id));
    allCards.forEach(c => {
      c.classList.add('expanded');
      const b = c.querySelector('.milestone-card-body');
      if (b) b.style.display = 'block';
    });
  } else {
    window.expandedMilestones.clear();
    allCards.forEach(c => {
      c.classList.remove('expanded');
      const b = c.querySelector('.milestone-card-body');
      if (b) b.style.display = 'none';
    });
  }
  updateToggleAllButtonText();
};

window.quickAddSubActivityToMilestone = function(milestoneId) {
  const m = timeline.find(t => t.id === milestoneId);
  if (!m) return;
  const name = prompt(`Nueva actividad que va dentro de "${m.title}":`);
  if (!name || !name.trim()) return;
  const resp = prompt(`¿Quién será el encargado(a) para "${name}"?`, m.responsible || '');
  const cleanResp = (resp || '').trim() || 'Por definir';
  if (cleanResp && !cleanResp.toLowerCase().includes('por definir') && typeof window.ensureResponsibleExists === 'function') {
    window.ensureResponsibleExists(cleanResp, 'Proveedor');
  }
  if (!m.activities) m.activities = [];
  m.activities.push({
    id: 'sub_' + Date.now(),
    name: name.trim(),
    responsible: cleanResp,
    responsibleStatus: 'ok'
  });
  saveData();
  renderAll();
  showToast(`Actividad agregada al horario de "${m.title}"`);
};

window.editingMilestoneId = null;

window.editMilestone = function(milestoneId) {
  const m = timeline.find(t => t.id === milestoneId);
  if (!m) return;
  window.editingMilestoneId = milestoneId;

  const modal = document.getElementById('activityModal');
  const titleEl = document.getElementById('activityModalTitle');
  const btnText = document.getElementById('btnSaveMilestoneText');
  const container = document.getElementById('subActivitiesContainer');

  if (titleEl) titleEl.innerHTML = `<i class="ri-edit-line" style="color: var(--gold-dark);"></i> Editar Hito: ${escapeHtml(m.title)}`;
  if (btnText) btnText.textContent = 'Guardar Cambios del Hito';

  const actTimeStart = document.getElementById('actTimeStart');
  const actTimeEnd = document.getElementById('actTimeEnd');
  const actTitle = document.getElementById('actTitle');
  const actDetail = document.getElementById('actDetail');

  if (actTimeStart) actTimeStart.value = m.timeStart || m.time || '12:00';
  if (actTimeEnd) actTimeEnd.value = m.timeEnd || '';
  if (actTitle) actTitle.value = m.title || '';
  if (actDetail) actDetail.value = m.detail || '';

  if (container) {
    container.innerHTML = '';
    const acts = (m.activities && Array.isArray(m.activities) && m.activities.length > 0)
      ? m.activities
      : [{
          id: 'sub_' + Date.now(),
          name: m.title,
          responsible: m.responsible || 'Novios / Coordinador',
          responsibleStatus: m.responsibleStatus || 'ok'
        }];

    acts.forEach(a => {
      const linkedShop = shopping.find(s => (a.shopItemId && s.id === a.shopItemId) || (s.activityId === m.id && s.item === a.shopItem));
      const cardData = {
        id: a.id,
        name: a.name,
        responsible: a.responsible,
        responsibleStatus: a.responsibleStatus,
        needsPurchase: a.needsPurchase || !!linkedShop,
        shopItem: (linkedShop ? linkedShop.item : a.shopItem) || '',
        shopCategory: (linkedShop ? linkedShop.category : a.shopCategory) || 'Decoración',
        shopCost: (linkedShop ? linkedShop.cost : a.shopCost) || '',
        shopStatus: (linkedShop ? linkedShop.status : a.shopStatus) || 'in_progress'
      };
      container.appendChild(createSubActivityCard(cardData));
    });
  }

  if (modal) modal.classList.add('active');
};

window.deleteTimelineActivity = function(idx) {
  if (!timeline[idx]) return;
  const item = timeline[idx];
  if (confirm(`¿Eliminar el hito "${item.title}" y sus actividades asociadas del cronograma?`)) {
    const deleted = timeline.splice(idx, 1)[0];
    if (window.expandedMilestones) window.expandedMilestones.delete(deleted.id);
    saveData();
    renderAll();
    showToast(`Hito "${deleted.title}" eliminado`);
  }
};

window.toggleMilestoneSubactResp = function(milestoneId, subactIdx) {
  const m = timeline.find(t => t.id === milestoneId);
  if (!m || !m.activities || !m.activities[subactIdx]) return;
  const current = m.activities[subactIdx].responsibleStatus || 'ok';
  m.activities[subactIdx].responsibleStatus = (current === 'ok') ? 'pending' : 'ok';
  
  // Sincronizar hacia shopping si tiene compra vinculada
  const act = m.activities[subactIdx];
  const linkedShop = shopping.find(s => 
    (act.shopItemId && s.id === act.shopItemId) ||
    (s.activityId === m.id && s.item && s.item.toLowerCase() === (act.shopItem || act.name || '').toLowerCase())
  );
  if (linkedShop) {
    linkedShop.responsibleStatus = m.activities[subactIdx].responsibleStatus;
  }

  saveData();
  renderAll();
  showToast(`Estado del encargado: "${m.activities[subactIdx].responsibleStatus === 'ok' ? 'Confirmado' : 'Por Buscar'}"`);
};

/* ==========================================================================
   SINCRONIZACIÓN AUTOMÁTICA COMPRAS <-> CRONOGRAMA
   ========================================================================== */
window.syncShoppingItemToTimeline = function(item, previousMilestoneId = null) {
  if (!item || !Array.isArray(timeline)) return;

  // 1. Si tenía un hito anterior y ahora es otro (o ninguno), quitar del hito anterior
  if (previousMilestoneId && previousMilestoneId !== item.activityId) {
    const oldM = timeline.find(t => t.id === previousMilestoneId);
    if (oldM && Array.isArray(oldM.activities)) {
      oldM.activities = oldM.activities.filter(a => !(
        (a.shopItemId && a.shopItemId === item.id) ||
        (a.shopItem && a.shopItem.toLowerCase() === (item.item || '').toLowerCase())
      ));
    }
  }

  // 2. Si está vinculada a un hito actual
  if (item.activityId) {
    const m = timeline.find(t => t.id === item.activityId);
    if (m) {
      if (!Array.isArray(m.activities)) m.activities = [];

      let act = m.activities.find(a => (
        (a.shopItemId && a.shopItemId === item.id) ||
        (a.shopItem && a.shopItem.toLowerCase() === (item.item || '').toLowerCase()) ||
        (a.name && a.name.toLowerCase() === (item.item || '').toLowerCase())
      ));

      if (act) {
        act.name = item.item;
        act.responsible = item.responsible || act.responsible || 'Novios';
        act.responsibleStatus = item.responsibleStatus || 'ok';
        act.needsPurchase = true;
        act.shopItemId = item.id;
        act.shopItem = item.item;
        act.shopCategory = item.category || 'Varios';
        act.shopCost = item.cost || '';
        act.shopStatus = item.status || 'pending';
      } else {
        m.activities.push({
          id: 'sub_' + item.id,
          name: item.item,
          responsible: item.responsible || 'Novios',
          responsibleStatus: item.responsibleStatus || 'ok',
          needsPurchase: true,
          shopItemId: item.id,
          shopItem: item.item,
          shopCategory: item.category || 'Varios',
          shopCost: item.cost || '',
          shopStatus: item.status || 'pending'
        });
      }
    }
  }
};

window.syncAllShoppingToTimeline = function() {
  if (!Array.isArray(shopping) || !Array.isArray(timeline)) return;
  shopping.forEach(item => {
    if (item.activityId) {
      window.syncShoppingItemToTimeline(item);
    }
  });
};

/* ==========================================================================
   MODAL PARA EDITAR ACTIVIDAD INDIVIDUAL DEL CRONOGRAMA
   ========================================================================== */
window.openEditActivityModal = function(milestoneId, actKey) {
  const m = timeline.find(t => t.id === milestoneId);
  if (!m) return;

  const modal = document.getElementById('modalEditSingleActivity');
  if (!modal) return;

  const origMilestoneInput = document.getElementById('editActOriginalMilestoneId');
  const actIdInput = document.getElementById('editActId');
  const nameInput = document.getElementById('editActName');
  const milestoneSelect = document.getElementById('editActMilestoneSelect');
  const respSelect = document.getElementById('editActResp');
  const respStatusSelect = document.getElementById('editActRespStatus');
  const needsPurchaseCheck = document.getElementById('editActNeedsPurchase');
  const purchaseFields = document.getElementById('editActPurchaseFields');
  const shopItemInput = document.getElementById('editActShopItem');
  const shopCatSelect = document.getElementById('editActShopCategory');
  const shopCostInput = document.getElementById('editActShopCost');
  const shopStatusSelect = document.getElementById('editActShopStatus');

  const acts = m.activities || [];
  let act = acts.find((a, i) => a.id === actKey || String(i) === String(actKey));
  if (!act) {
    act = {
      id: actKey || ('sub_' + Date.now()),
      name: m.title,
      responsible: m.responsible || 'Novios',
      responsibleStatus: m.responsibleStatus || 'ok'
    };
  }

  const linkedShop = shopping.find(s => 
    (act.shopItemId && s.id === act.shopItemId) ||
    (s.activityId === m.id && s.item && s.item.toLowerCase() === (act.shopItem || act.name || '').toLowerCase())
  );

  if (origMilestoneInput) origMilestoneInput.value = m.id;
  if (actIdInput) actIdInput.value = act.id || '';
  if (nameInput) nameInput.value = act.name || '';

  if (milestoneSelect) {
    milestoneSelect.innerHTML = timeline.map(t => {
      const timeFmt = formatTimelineTime(t);
      return `<option value="${t.id}" ${t.id === m.id ? 'selected' : ''}>[${escapeHtml(timeFmt)}] ${escapeHtml(t.title)}</option>`;
    }).join('');
  }

  if (respSelect) {
    populateResponsibleSelect(respSelect, (act && act.responsible && !isResponsibleDeleted(act.responsible)) ? act.responsible : ((m && m.responsible && !isResponsibleDeleted(m.responsible)) ? m.responsible : ''));
  }
  if (respStatusSelect) {
    respStatusSelect.value = act.responsibleStatus || 'ok';
  }

  const hasPurchase = !!(act.needsPurchase || linkedShop);
  if (needsPurchaseCheck) needsPurchaseCheck.checked = hasPurchase;
  if (purchaseFields) purchaseFields.style.display = hasPurchase ? 'block' : 'none';

  if (shopItemInput) shopItemInput.value = (linkedShop ? linkedShop.item : act.shopItem) || act.name || '';
  if (shopCatSelect) shopCatSelect.value = (linkedShop ? linkedShop.category : act.shopCategory) || 'Decoración';
  if (shopCostInput) shopCostInput.value = (linkedShop ? linkedShop.cost : act.shopCost) || '';
  if (shopStatusSelect) shopStatusSelect.value = (linkedShop ? linkedShop.status : act.shopStatus) || 'pending';

  modal.classList.add('active');
  if (nameInput) setTimeout(() => nameInput.focus(), 120);
};

window.closeEditActivityModal = function() {
  const modal = document.getElementById('modalEditSingleActivity');
  if (modal) modal.classList.remove('active');
};

window.handleEditActRespChange = function(selectEl) {
  const customInput = document.getElementById('editActRespCustom') ||
    (selectEl.parentElement ? selectEl.parentElement.querySelector('input[type="text"]') : null);
  if (!customInput) return;
  if (selectEl.value === '__custom__') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
  }
};

window.toggleEditActPurchase = function(show) {
  const purchaseFields = document.getElementById('editActPurchaseFields');
  if (purchaseFields) purchaseFields.style.display = show ? 'block' : 'none';
};

window.handleSaveSingleActivity = function(e) {
  if (e) e.preventDefault();

  const origMilestoneId = document.getElementById('editActOriginalMilestoneId')?.value;
  const targetMilestoneId = document.getElementById('editActMilestoneSelect')?.value || origMilestoneId;
  const actId = document.getElementById('editActId')?.value;
  const actName = (document.getElementById('editActName')?.value || '').trim();

  if (!actName) {
    alert('Por favor escribe un nombre para la actividad.');
    return;
  }

  let responsible = (document.getElementById('editActResp')?.value || '').trim();
  if (responsible === '__custom__') {
    responsible = (document.getElementById('editActRespCustom')?.value || '').trim();
  }
  if (!responsible) responsible = '';
  else if (responsible !== '__custom__' && typeof window.ensureResponsibleExists === 'function') {
    window.ensureResponsibleExists(responsible, 'Proveedor');
  }
  const respStatus = document.getElementById('editActRespStatus')?.value || 'ok';

  const needsPurchase = !!document.getElementById('editActNeedsPurchase')?.checked;
  const shopItem = (document.getElementById('editActShopItem')?.value || '').trim() || actName;
  const shopCategory = document.getElementById('editActShopCategory')?.value || 'Varios';
  const shopCost = (document.getElementById('editActShopCost')?.value || '').trim();
  const shopStatus = document.getElementById('editActShopStatus')?.value || 'pending';

  const origM = timeline.find(t => t.id === origMilestoneId);
  const targetM = timeline.find(t => t.id === targetMilestoneId);
  if (!targetM) return;

  // 1. Obtener o crear la actividad
  let actData = null;
  if (origM && Array.isArray(origM.activities)) {
    const actIdx = origM.activities.findIndex(a => a.id === actId);
    if (actIdx >= 0) {
      actData = origM.activities[actIdx];
      if (origMilestoneId !== targetMilestoneId) {
        origM.activities.splice(actIdx, 1);
      }
    }
  }

  if (!actData) {
    actData = { id: actId || ('sub_' + Date.now()) };
  }

  // 2. Actualizar propiedades de la actividad
  actData.name = actName;
  actData.responsible = responsible;
  actData.responsibleStatus = respStatus;
  actData.needsPurchase = needsPurchase;
  actData.shopItem = needsPurchase ? shopItem : '';
  actData.shopCategory = needsPurchase ? shopCategory : '';
  actData.shopCost = needsPurchase ? shopCost : '';
  actData.shopStatus = needsPurchase ? shopStatus : '';

  // 3. Si se cambió de hito o era nueva, insertar en targetM.activities
  if (!Array.isArray(targetM.activities)) targetM.activities = [];
  const targetIdx = targetM.activities.findIndex(a => a.id === actData.id);
  if (targetIdx >= 0) {
    targetM.activities[targetIdx] = actData;
  } else {
    targetM.activities.push(actData);
  }

  // 4. Sincronizar con Shopping
  let existingShop = shopping.find(s => 
    (actData.shopItemId && s.id === actData.shopItemId) ||
    (s.activityId === origMilestoneId && s.item && s.item.toLowerCase() === actName.toLowerCase()) ||
    (needsPurchase && s.item && s.item.toLowerCase() === shopItem.toLowerCase())
  );

  if (needsPurchase) {
    if (existingShop) {
      existingShop.item = shopItem;
      existingShop.activityId = targetMilestoneId;
      existingShop.activityTitle = targetM.title;
      existingShop.category = shopCategory;
      existingShop.responsible = responsible;
      existingShop.responsibleStatus = respStatus;
      existingShop.cost = shopCost;
      existingShop.status = shopStatus;
      actData.shopItemId = existingShop.id;
    } else {
      const newShop = {
        id: 'shop_' + Date.now(),
        activityId: targetMilestoneId,
        activityTitle: targetM.title,
        item: shopItem,
        category: shopCategory,
        responsible: responsible,
        responsibleStatus: respStatus,
        cost: shopCost,
        status: shopStatus,
        detail: `Vinculado al hito: ${targetM.title}`
      };
      shopping.push(newShop);
      actData.shopItemId = newShop.id;
    }
  } else if (existingShop) {
    existingShop.activityId = '';
    existingShop.activityTitle = '';
    actData.shopItemId = '';
  }

  saveData();
  renderAll();
  closeEditActivityModal();
  showToast(`¡Actividad "${actName}" actualizada con éxito!`);
};

window.handleDeleteSingleActivity = function() {
  const origMilestoneId = document.getElementById('editActOriginalMilestoneId')?.value;
  const actId = document.getElementById('editActId')?.value;
  const actName = document.getElementById('editActName')?.value || 'esta actividad';

  if (!confirm(`¿Eliminar la actividad "${actName}" del cronograma?`)) return;

  const m = timeline.find(t => t.id === origMilestoneId);
  if (m && Array.isArray(m.activities)) {
    m.activities = m.activities.filter(a => a.id !== actId);
  }

  const shopItem = shopping.find(s => s.activityId === origMilestoneId && s.item && s.item.toLowerCase() === actName.toLowerCase());
  if (shopItem) {
    shopItem.activityId = '';
    shopItem.activityTitle = '';
  }

  saveData();
  renderAll();
  closeEditActivityModal();
  showToast(`Actividad "${actName}" eliminada.`);
};

/* ==========================================================================
   RENDER DEL CRONOGRAMA MINUTO A MINUTO (ACORDEÓN INTUITIVO VOGUE)
   ========================================================================== */
function renderTimeline() {
  if (typeof syncAllShoppingToTimeline === 'function') {
    syncAllShoppingToTimeline();
  }

  const container = document.getElementById('timelineCardsContainer');
  const summaryBar = document.getElementById('timelineSummaryBar');
  if (!container) return;

  // 1. Render de Métricas Rápidas en la barra superior
  if (summaryBar) {
    let totalActs = 0;
    let okResps = 0;
    let pendingResps = 0;

    timeline.forEach(item => {
      const acts = (item.activities && item.activities.length > 0) ? item.activities : [{ responsibleStatus: item.responsibleStatus || 'ok' }];
      totalActs += acts.length;
      acts.forEach(a => {
        if (a.responsibleStatus === 'ok') okResps++;
        else pendingResps++;
      });
    });

    const totalShopLinked = shopping.filter(s => s.activityId || s.activityTitle).length;

    summaryBar.innerHTML = `
      <div class="timeline-metric-card">
        <div class="timeline-metric-icon"><i class="ri-calendar-check-line"></i></div>
        <div class="timeline-metric-info">
          <span class="timeline-metric-value">${timeline.length}</span>
          <span class="timeline-metric-label">Hitos Programados</span>
        </div>
      </div>
      <div class="timeline-metric-card">
        <div class="timeline-metric-icon"><i class="ri-list-check-2"></i></div>
        <div class="timeline-metric-info">
          <span class="timeline-metric-value">${totalActs}</span>
          <span class="timeline-metric-label">Actividades Totales</span>
        </div>
      </div>
      <div class="timeline-metric-card">
        <div class="timeline-metric-icon" style="color: #059669; background: #ECFDF5; border-color: #A7F3D0;"><i class="ri-user-star-line"></i></div>
        <div class="timeline-metric-info">
          <span class="timeline-metric-value">${okResps} <small style="font-size: 0.8rem; color: #64748B;">/ ${okResps + pendingResps}</small></span>
          <span class="timeline-metric-label">Encargados OK</span>
        </div>
      </div>
      <div class="timeline-metric-card">
        <div class="timeline-metric-icon" style="color: #D97706; background: #FFFBEB; border-color: #FDE68A;"><i class="ri-shopping-bag-3-line"></i></div>
        <div class="timeline-metric-info">
          <span class="timeline-metric-value">${totalShopLinked}</span>
          <span class="timeline-metric-label">Compras Vinculadas</span>
        </div>
      </div>
    `;
  }

  // 2. Render de Tarjetas de Hitos
  container.innerHTML = '';

  if (timeline.length === 0) {
    container.innerHTML = `
      <div style="background: #FFFFFF; border: 1.5px dashed rgba(148, 163, 184,0.4); border-radius: 16px; padding: 40px 20px; text-align: center;">
        <i class="ri-calendar-line" style="font-size: 3rem; color: var(--gold-primary); margin-bottom: 12px; display: block;"></i>
        <h3 style="font-family: var(--font-serif); color: var(--navy-royal); margin-bottom: 6px;">No hay hitos en el cronograma</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 18px;">Comienza agregando el primer horario de tu gran día.</p>
        <button class="btn-org-action" onclick="document.getElementById('btnOpenActivityModal').click()">
          <i class="ri-add-line"></i> Agregar Primer Hito
        </button>
      </div>
    `;
    updateToggleAllButtonText();
    return;
  }

  timeline.forEach((item, idx) => {
    const timeFormatted = formatTimelineTime(item);
    const iconClass = getMilestoneIcon(item);
    const isExpanded = window.expandedMilestones && window.expandedMilestones.has(item.id);

    // Actividades internas
    const subActs = (item.activities && Array.isArray(item.activities) && item.activities.length > 0)
      ? item.activities
      : [
          {
            id: 'sub_default_' + idx,
            name: item.title,
            responsible: item.responsible || 'Novios / Coordinador',
            responsibleStatus: item.responsibleStatus || 'ok'
          }
        ];

    // Compras vinculadas
    const linkedShopItems = shopping.filter(s => {
      if (s.activityId && s.activityId === item.id) return true;
      if (s.activityTitle && (s.activityTitle.toLowerCase().includes(item.title.toLowerCase()) || isGuestNameMatch(s.activityTitle, item.title))) return true;
      return false;
    });

    const card = document.createElement('div');
    card.className = `timeline-milestone-card ${isExpanded ? 'expanded' : ''}`;
    card.dataset.milestoneId = item.id;
    card.dataset.title = item.title;

    // Encargado principal de resumen
    const mainResp = item.responsible || (subActs[0] ? subActs[0].responsible : 'Novios');

    card.innerHTML = `
      <!-- Header Clickeable para desplegar/contraer -->
      <div class="milestone-card-header" onclick="toggleMilestoneCard('${item.id}')" title="Haz clic para ${isExpanded ? 'colapsar' : 'ver todo lo que va dentro de este horario'}">
        <div class="milestone-header-left">
          <span class="milestone-time-pill">
            <i class="${iconClass}"></i>
            <span>${escapeHtml(timeFormatted)}</span>
          </span>
          <div class="milestone-title-wrap">
            <h3 class="milestone-title">${escapeHtml(item.title)}</h3>
            <div class="milestone-subheading">
              <i class="ri-user-star-line"></i> Encargado(a): <strong>${escapeHtml(mainResp)}</strong>
            </div>
          </div>
        </div>

        <div class="milestone-header-right">
          <span class="milestone-chip chip-act" title="Número de actividades en este horario">
            <i class="ri-checkbox-circle-line"></i> ${subActs.length} ${subActs.length === 1 ? 'actividad' : 'actividades'}
          </span>
          ${linkedShopItems.length > 0 ? `
            <span class="milestone-chip chip-shop" title="Compras o mandados a hacer asociados">
              <i class="ri-shopping-bag-3-line"></i> ${linkedShopItems.length} compra${linkedShopItems.length > 1 ? 's' : ''}
            </span>
          ` : ''}
          <button type="button" class="btn-milestone-header-edit" onclick="event.stopPropagation(); editMilestone('${item.id}')" title="Editar este horario y sus actividades">
            <i class="ri-edit-line"></i> Editar Horario
          </button>
          <button type="button" class="milestone-chevron-btn" aria-label="Desplegar">
            <i class="ri-arrow-down-s-line"></i>
          </button>
        </div>
      </div>

      <!-- Contenido Interior que se ve al abrir el horario -->
      <div class="milestone-card-body" style="display: ${isExpanded ? 'block' : 'none'};">
        ${item.detail ? `
          <div class="milestone-context-box">
            <i class="ri-information-line"></i>
            <div>${escapeHtml(item.detail)}</div>
          </div>
        ` : ''}

        <!-- Subactividades & Encargados -->
        <div class="milestone-section-title">
          <i class="ri-task-line" style="color: var(--gold-dark);"></i> Actividades dentro de este horario (${subActs.length}) <small style="font-weight: normal; color: #64748B; font-size: 0.78rem;">(Haz clic en cualquiera para editarla)</small>:
        </div>
        <div class="milestone-subacts-grid">
          ${subActs.map((act, actIdx) => {
            const isOk = act.responsibleStatus === 'ok';
            const actKey = act.id || String(actIdx);
            return `
              <div class="subact-vogue-item" onclick="openEditActivityModal('${item.id}', '${actKey}')" title="Haz clic en esta actividad para editarla">
                <div class="subact-vogue-name">
                  <i class="ri-checkbox-circle-fill"></i>
                  <span>${escapeHtml(act.name)}</span>
                </div>
                <div class="subact-vogue-meta">
                  <span class="subact-vogue-resp">
                    <i class="ri-user-star-line"></i> <strong>${escapeHtml(act.responsible || 'Por definir')}</strong>
                  </span>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <button type="button" class="badge-status-xs ${isOk ? 'ok' : 'pending'}" onclick="event.stopPropagation(); toggleMilestoneSubactResp('${item.id}', ${actIdx})" title="Clic para alternar si el encargado está confirmado o pendiente de buscar">
                      ${isOk ? '✓ Confirmado' : '⏳ Por Buscar'}
                    </button>
                    <button type="button" class="btn-subact-edit-pill" onclick="event.stopPropagation(); openEditActivityModal('${item.id}', '${actKey}')" title="Editar esta actividad">
                      <i class="ri-edit-line"></i> Editar
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Compras & Mandados a Hacer vinculados -->
        <div class="milestone-section-title" style="margin-top: 16px;">
          <i class="ri-shopping-cart-2-line" style="color: var(--gold-dark);"></i> Compras, Insumos o Encargos:
        </div>
        ${linkedShopItems.length > 0 ? `
          <div class="milestone-shop-grid">
            ${linkedShopItems.map(s => {
              const st = s.status || 'pending';
              let badgeColor = 'var(--amber-bg)';
              let badgeText = '⏳ Pendiente';
              let tagClass = 'pending';
              if (st === 'ok') {
                badgeColor = 'var(--mint-bg)';
                badgeText = '✓ Ya Listo';
                tagClass = 'ok';
              } else if (st === 'in_progress') {
                badgeColor = '#FFFDF0';
                badgeText = '🎨 Mandado a Hacer';
                tagClass = 'in_progress';
              }
              return `
                <div class="shop-vogue-card ${tagClass}" onclick="event.stopPropagation(); editShoppingItem('${s.id}')" title="Clic para ver en la pestaña de Compras (${badgeText})">
                  <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span class="shop-vogue-title"><i class="ri-shopping-bag-line" style="color: var(--gold-dark);"></i> ${escapeHtml(s.item)}</span>
                    <span class="shop-vogue-cost">${escapeHtml(s.category || 'General')} • ${escapeHtml(s.cost || 'Sin costo')}</span>
                  </div>
                  <span class="badge-status-xs ${tagClass}">${badgeText}</span>
                </div>
              `;
            }).join('')}
            <button type="button" class="btn-milestone-action" onclick="event.stopPropagation(); quickAddShopForActivity('${item.id}')" title="Agregar otra compra para este hito">
              <i class="ri-add-line"></i> + Otra Compra
            </button>
          </div>
        ` : `
          <div style="display: flex; align-items: center; justify-content: space-between; background: #F8FAFC; border: 1px dashed rgba(148, 163, 184,0.3); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;">
            <span style="font-size: 0.84rem; color: #64748B;">No hay compras asociadas a este horario.</span>
            <button type="button" class="btn-milestone-action" onclick="event.stopPropagation(); quickAddShopForActivity('${item.id}')">
              <i class="ri-add-line"></i> + Agregar Compra / Insumo
            </button>
          </div>
        `}

        <!-- Barra inferior de acciones del hito -->
        <div class="milestone-actions-bar">
          <div class="milestone-actions-left">
            <button type="button" class="btn-milestone-action" onclick="event.stopPropagation(); quickAddSubActivityToMilestone('${item.id}')">
              <i class="ri-add-circle-line"></i> + Actividad adentro
            </button>
            <button type="button" class="btn-milestone-action" onclick="event.stopPropagation(); quickAddShopForActivity('${item.id}')">
              <i class="ri-shopping-cart-line"></i> + Compra adentro
            </button>
          </div>
          <div class="milestone-actions-right">
            <button type="button" class="btn-milestone-action" onclick="event.stopPropagation(); editMilestone('${item.id}')" title="Editar hito y todas sus actividades">
              <i class="ri-edit-line"></i> Editar
            </button>
            <button type="button" class="btn-milestone-del" onclick="event.stopPropagation(); deleteTimelineActivity(${idx})" title="Eliminar este hito del cronograma">
              <i class="ri-delete-bin-line"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  updateToggleAllButtonText();
}

window.editingShoppingId = null;

window.editShoppingItem = function(shopId) {
  const item = shopping.find(s => s.id === shopId);
  if (!item) return;
  window.editingShoppingId = shopId;

  const modal = document.getElementById('shoppingModal');
  const titleEl = document.getElementById('shoppingModalTitle');
  const btnText = document.getElementById('btnSaveShoppingText');

  if (titleEl) titleEl.innerHTML = `<i class="ri-edit-line" style="color: var(--gold-dark);"></i> Editar Ítem de Compra`;
  if (btnText) btnText.textContent = 'Guardar Cambios de Compra';

  populateShoppingModalActivities();

  const shopItem = document.getElementById('shopItem');
  const shopLinked = document.getElementById('shopLinkedActivity');
  const shopCategory = document.getElementById('shopCategory');
  const shopCost = document.getElementById('shopCost');
  const shopResponsible = document.getElementById('shopResponsible');
  const shopRespStatus = document.getElementById('shopRespStatus');
  const shopDetail = document.getElementById('shopDetail');
  const shopStatus = document.getElementById('shopStatus');

  if (shopItem) shopItem.value = item.item || '';
  if (shopLinked) shopLinked.value = item.activityId || '';
  if (shopCategory) shopCategory.value = item.category || 'Varios';
  if (shopCost) shopCost.value = item.cost || '';
  if (shopResponsible) {
    if (typeof window.populateResponsibleSelect === 'function') {
      window.populateResponsibleSelect(shopResponsible, (item && item.responsible && !isResponsibleDeleted(item.responsible)) ? item.responsible : '');
    } else {
      shopResponsible.value = item.responsible || '';
    }
  }
  if (shopRespStatus) shopRespStatus.value = item.responsibleStatus || 'ok';
  if (shopDetail) shopDetail.value = item.detail || '';
  if (shopStatus) shopStatus.value = item.status || 'pending';

  if (modal) modal.classList.add('active');
};


/* ==========================================================================
   DIRECTORIO DE RESPONSABLES Y PROVEEDORES
   ========================================================================== */
window.harvestResponsiblesFromData = function() {
  if (!Array.isArray(responsibles)) responsibles = [];
  loadDeletedResponsibles();
  let added = false;

  const registerIfNew = (name, category = 'Proveedor') => {
    if (!name || typeof name !== 'string') return;
    const clean = name.trim();
    if (!clean || clean === '__custom__' || clean === '__new_resp__' || clean.toLowerCase() === 'novios') return;
    const lower = clean.toLowerCase();
    if (lower === 'por definir' || lower === 'sin asignar' || lower === 'ninguno' || lower === '— sin asignar —') return;
    if (isResponsibleDeleted(clean)) return; // No auto-cosechar si fue eliminado explícitamente

    if (!responsibles.some(r => r.name.toLowerCase() === lower)) {
      responsibles.push({
        id: 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: clean,
        category: category || 'Proveedor',
        phone: ''
      });
      added = true;
    }
  };

  // 1. Recorrer compras activas
  if (Array.isArray(shopping)) {
    shopping.forEach(s => {
      registerIfNew(s.responsible, s.category || 'Proveedor');
    });
  }

  // 2. Recorrer cronograma e hitos
  if (Array.isArray(timeline)) {
    timeline.forEach(m => {
      registerIfNew(m.responsible, 'Proveedor');
      if (Array.isArray(m.activities)) {
        m.activities.forEach(a => {
          registerIfNew(a.responsible, 'Proveedor');
        });
      }
    });
  }

  // 3. Recorrer localStorage por compras y cronogramas guardados previamente
  try {
    const customShop = JSON.parse(localStorage.getItem('boda_org_shopping_custom_ye') || '[]');
    if (Array.isArray(customShop)) {
      customShop.forEach(s => registerIfNew(s.responsible, s.category || 'Proveedor'));
    }
  } catch(e) {}

  try {
    const v2Shop = JSON.parse(localStorage.getItem('boda_org_shopping_v2') || '[]');
    if (Array.isArray(v2Shop)) {
      v2Shop.forEach(s => registerIfNew(s.responsible, s.category || 'Proveedor'));
    }
  } catch(e) {}

  try {
    const customTime = JSON.parse(localStorage.getItem('boda_org_timeline_custom_ye') || '[]');
    if (Array.isArray(customTime)) {
      customTime.forEach(m => {
        registerIfNew(m.responsible, 'Proveedor');
        if (Array.isArray(m.activities)) {
          m.activities.forEach(a => registerIfNew(a.responsible, 'Proveedor'));
        }
      });
    }
  } catch(e) {}

  if (added) {
    saveResponsibles();
    renderResponsibles();
  }
};

function loadResponsibles() {
  loadDeletedResponsibles();
  const saved = localStorage.getItem(STORAGE_KEY_RESPONSIBLES);
  if (saved) {
    try {
      responsibles = JSON.parse(saved);
    } catch(e) {
      responsibles = [];
    }
  }
  if (!responsibles || responsibles.length === 0) {
    responsibles = JSON.parse(JSON.stringify(DEFAULT_RESPONSIBLES));
    responsibles = responsibles.filter(r => !isResponsibleDeleted(r.name));
    localStorage.setItem(STORAGE_KEY_RESPONSIBLES, JSON.stringify(responsibles));
  } else {
    const prevLen = responsibles.length;
    responsibles = responsibles.filter(r => !isResponsibleDeleted(r.name));
    if (responsibles.length !== prevLen) {
      saveResponsibles();
    }
  }
  // Auto-cosechar proveedores presentes en compras y cronograma para no perder ninguno
  if (typeof window.harvestResponsiblesFromData === 'function') {
    window.harvestResponsiblesFromData();
  }
}

function saveResponsibles() {
  localStorage.setItem(STORAGE_KEY_RESPONSIBLES, JSON.stringify(responsibles));
}

window.editingResponsibleId = null;

window.openAddResponsibleModal = function() {
  window.editingResponsibleId = null;
  const nameInput = document.getElementById('newRespName');
  const catInput = document.getElementById('newRespCategory');
  const phoneInput = document.getElementById('newRespPhone');
  const btnText = document.getElementById('btnSubmitRespText');
  const btnCancel = document.getElementById('btnCancelEditResp');

  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (catInput) catInput.value = 'Proveedor';
  if (btnText) btnText.textContent = 'Agregar';
  if (btnCancel) btnCancel.style.display = 'none';

  renderResponsibles();
  const modal = document.getElementById('responsiblesModal');
  if (modal) modal.classList.add('active');
  if (nameInput) setTimeout(() => nameInput.focus(), 120);
};

window.openResponsiblesModal = function() {
  renderResponsibles();
  const modal = document.getElementById('responsiblesModal');
  if (modal) modal.classList.add('active');
};

window.editResponsible = function(id) {
  const r = responsibles.find(x => x.id === id);
  if (!r) return;
  window.editingResponsibleId = id;

  const modal = document.getElementById('responsiblesModal');
  const nameInput = document.getElementById('newRespName');
  const catInput = document.getElementById('newRespCategory');
  const phoneInput = document.getElementById('newRespPhone');
  const btnText = document.getElementById('btnSubmitRespText');
  const btnCancel = document.getElementById('btnCancelEditResp');

  if (nameInput) nameInput.value = r.name || '';
  if (catInput) catInput.value = r.category || 'Proveedor';
  if (phoneInput) phoneInput.value = r.phone || '';
  if (btnText) btnText.textContent = 'Guardar Cambios';
  if (btnCancel) btnCancel.style.display = 'inline-flex';

  if (modal) modal.classList.add('active');
  if (nameInput) setTimeout(() => nameInput.focus(), 120);
};

window.cancelEditResponsible = function() {
  window.editingResponsibleId = null;
  const nameInput = document.getElementById('newRespName');
  const phoneInput = document.getElementById('newRespPhone');
  const btnText = document.getElementById('btnSubmitRespText');
  const btnCancel = document.getElementById('btnCancelEditResp');

  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (btnText) btnText.textContent = 'Agregar';
  if (btnCancel) btnCancel.style.display = 'none';
};

window.editSelectedProviderFromCombobox = function() {
  const select = document.getElementById('selectQuickProvider');
  if (!select) return;
  const selVal = select.value;
  if (!selVal) {
    showToast('⚠️ Selecciona un proveedor del listado para editar');
    return;
  }
  const r = responsibles.find(x => x.id === selVal || x.name === selVal);
  if (r) {
    window.editResponsible(r.id);
  } else {
    showToast('⚠️ Proveedor no encontrado');
  }
};

window.ensureResponsibleExists = function(name, category = 'Proveedor', phone = '') {
  if (!name || typeof name !== 'string') return null;
  const clean = name.trim();
  if (!clean || clean === '__custom__' || clean === '__new_resp__' || clean.toLowerCase() === 'novios') return null;
  const lower = clean.toLowerCase();
  if (lower === 'por definir' || lower === 'sin asignar' || lower === 'ninguno' || lower === '— sin asignar —') return null;
  if (isResponsibleDeleted(clean)) return null; // No crear si el usuario lo eliminó

  if (!Array.isArray(responsibles)) responsibles = [];

  let existing = responsibles.find(r => r.name.toLowerCase() === lower);
  if (!existing) {
    existing = {
      id: 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: clean,
      category: category || 'Proveedor',
      phone: phone || ''
    };
    responsibles.push(existing);
    saveResponsibles();
    renderResponsibles();
  }
  return existing;
};

window.handleSaveResponsible = function(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('newRespName');
  const catInput = document.getElementById('newRespCategory');
  const phoneInput = document.getElementById('newRespPhone');

  const name = (nameInput?.value || '').trim();
  const cat = catInput?.value || 'Proveedor';
  const phone = (phoneInput?.value || '').trim();

  if (!name) return;

  if (window.editingResponsibleId) {
    // ACTUALIZAR RESPONSABLE EXISTENTE
    const r = responsibles.find(x => x.id === window.editingResponsibleId);
    if (r) {
      const oldName = r.name;
      r.name = name;
      r.category = cat;
      r.phone = phone;

      // Si cambió de nombre, sincronizar en actividades y compras que lo tenían asignado
      if (oldName !== name) {
        if (Array.isArray(timeline)) {
          timeline.forEach(m => {
            if (m.responsible === oldName) m.responsible = name;
            if (Array.isArray(m.activities)) {
              m.activities.forEach(a => {
                if (a.responsible === oldName) a.responsible = name;
              });
            }
          });
        }
        if (Array.isArray(shopping)) {
          shopping.forEach(s => {
            if (s.responsible === oldName) s.responsible = name;
          });
        }
      }

      showToast(`¡Proveedor / Responsable "${name}" actualizado con éxito!`);
    }
    cancelEditResponsible();
  } else {
    // AGREGAR NUEVO
    if (responsibles.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      showToast(`El responsable "${name}" ya está registrado.`);
      return;
    }

    const newResp = {
      id: 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name,
      category: cat,
      phone: phone
    };
    responsibles.push(newResp);

    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';

    showToast(`¡"${name}" agregado al directorio de responsables!`);
  }

  saveResponsibles();
  saveData();
  renderAll();
};

window.deleteResponsible = function(idx) {
  if (!responsibles || !responsibles[idx]) return;
  const deleted = responsibles[idx];
  const deletedName = (deleted.name || '').trim();

  // 1. Marcar como permanentemente eliminado para evitar resurrección
  markResponsibleDeleted(deletedName);

  // 2. Remover del array de responsables
  responsibles.splice(idx, 1);
  saveResponsibles();

  // 3. Resetear selectores en el DOM si tenían seleccionado este nombre
  const shopRespSelect = document.getElementById('shopResponsible');
  if (shopRespSelect && (shopRespSelect.value === deletedName || shopRespSelect.value === deleted.id)) {
    shopRespSelect.value = '';
  }
  const editActRespSelect = document.getElementById('editActResp');
  if (editActRespSelect && (editActRespSelect.value === deletedName || editActRespSelect.value === deleted.id)) {
    editActRespSelect.value = '';
  }

  // 4. Limpiar de items de compras y cronograma si aún figuraban
  let modifiedData = false;
  if (Array.isArray(shopping)) {
    shopping.forEach(s => {
      if (s.responsible && s.responsible.trim().toLowerCase() === deletedName.toLowerCase()) {
        s.responsible = '— Sin Asignar —';
        s.respStatus = 'pending';
        modifiedData = true;
      }
    });
  }
  if (Array.isArray(timeline)) {
    timeline.forEach(m => {
      if (m.responsible && m.responsible.trim().toLowerCase() === deletedName.toLowerCase()) {
        m.responsible = '— Sin Asignar —';
        modifiedData = true;
      }
      if (Array.isArray(m.activities)) {
        m.activities.forEach(a => {
          if (a.responsible && a.responsible.trim().toLowerCase() === deletedName.toLowerCase()) {
            a.responsible = '— Sin Asignar —';
            modifiedData = true;
          }
        });
      }
    });
  }
  if (modifiedData) {
    saveData();
    if (typeof renderShopping === 'function') renderShopping();
    if (typeof renderTimeline === 'function') renderTimeline();
  }

  // 5. Renderizar lista actualizada de responsables
  renderResponsibles();
  showToast(`"${deletedName}" eliminado permanentemente del directorio.`);
};


// Función para poblar el desplegable de Encargados/Proveedores con todos los registrados
window.populateResponsibleSelect = function(selectEl, currentValue) {
  if (!selectEl) return;

  // Asegurar que la lista de proveedores esté inicializada
  if (!responsibles || responsibles.length === 0) {
    if (typeof loadResponsibles === 'function') loadResponsibles();
  }
  if (typeof window.harvestResponsiblesFromData === 'function') {
    window.harvestResponsiblesFromData();
  }

  const cleanVal = (currentValue || '').trim();

  // Si cleanVal es un proveedor personalizado que no existía, agregarlo oficialmente al directorio
  if (cleanVal && cleanVal !== '__custom__' && cleanVal !== '__new_resp__') {
    window.ensureResponsibleExists(cleanVal, 'Proveedor');
  }

  selectEl.innerHTML = '';

  // Opción por defecto / placeholder si está vacío
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '— Selecciona un Proveedor / Encargado —';
  selectEl.appendChild(defaultOpt);

  let matchFound = false;

  // Listar TODOS los proveedores y responsables registrados
  (responsibles || []).forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.name;
    opt.textContent = `👤 ${r.name} (${r.category})`;
    if (cleanVal && r.name.toLowerCase() === cleanVal.toLowerCase()) {
      opt.selected = true;
      matchFound = true;
    }
    selectEl.appendChild(opt);
  });

  // Si no se pasó valor o no hubo match, preseleccionar Novios si existe
  if (!cleanVal || !matchFound) {
    for (let i = 0; i < selectEl.options.length; i++) {
      if (selectEl.options[i].value.toLowerCase().includes('novios')) {
        selectEl.options[i].selected = true;
        matchFound = true;
        break;
      }
    }
  }

  // Opción para ingresar otro encargado manualmente
  const newOpt = document.createElement('option');
  newOpt.value = '__custom__';
  newOpt.textContent = '➕ Escribir otro / Nuevo Encargado...';
  if (cleanVal === '__custom__') newOpt.selected = true;
  selectEl.appendChild(newOpt);

  // Manejar visibilidad del campo personalizado dinámicamente
  const customInput = (selectEl.parentElement ? selectEl.parentElement.querySelector('input[type="text"]') : null) ||
    document.getElementById(selectEl.id === 'editActResp' ? 'editActRespCustom' : 'shopResponsibleCustom');
  if (customInput) {
    if (cleanVal === '__custom__' || selectEl.value === '__custom__') {
      customInput.style.display = 'block';
    } else {
      customInput.style.display = 'none';
      customInput.value = '';
    }
  }
};

window.handleShopResponsibleChange = function(selectEl) {
  const customInput = (selectEl.parentElement ? selectEl.parentElement.querySelector('input[type="text"]') : null) ||
    document.getElementById(selectEl.id === 'editActResp' ? 'editActRespCustom' : 'shopResponsibleCustom');
  if (!customInput) return;
  if (selectEl.value === '__custom__') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
  }
};

function renderResponsibles() {
  // 1. Contador en el botón
  const countEl = document.getElementById('countResponsibles');
  if (countEl) countEl.textContent = responsibles.length;

  // 2. Datalist para autocompletar en todos los inputs
  const datalist = document.getElementById('responsiblesDatalist');
  if (datalist) {
    datalist.innerHTML = responsibles.map(r => `<option value="${escapeHtml(r.name)}">${escapeHtml(r.name)} (${escapeHtml(r.category)})</option>`).join('');
  }

  // 3. Combobox de Proveedores en el Panel Compacto del Cronograma
  const selectQuick = document.getElementById('selectQuickProvider');
  if (selectQuick) {
    const currentVal = selectQuick.value;
    selectQuick.innerHTML = responsibles.map(r => `
      <option value="${r.id}" ${r.id === currentVal ? 'selected' : ''}>
        👤 ${escapeHtml(r.name)} (${escapeHtml(r.category)})
      </option>
    `).join('');
    if (currentVal && responsibles.some(r => r.id === currentVal)) {
      selectQuick.value = currentVal;
    }
  }

  // 4. Lista dentro del modal con botón de Editar y Eliminar
  const listContainer = document.getElementById('responsiblesListContainer');
  if (listContainer) {
    listContainer.innerHTML = responsibles.map((r, idx) => `
      <div class="resp-item-row">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <strong style="color: var(--navy-royal); font-size: 0.9rem;">
            <i class="ri-user-star-line" style="color: var(--gold-dark);"></i> ${escapeHtml(r.name)}
          </strong>
          <span style="font-size: 0.78rem; color: #64748B;">
            ${escapeHtml(r.category)} ${r.phone ? `• 📞 ${escapeHtml(r.phone)}` : ''}
          </span>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button type="button" class="btn-sm-edit-provider" onclick="editResponsible('${r.id}')" title="Editar este proveedor / responsable" style="padding: 4px 10px; font-size: 0.78rem;">
            <i class="ri-edit-line"></i> Editar
          </button>
          <button type="button" class="btn-table-del" onclick="deleteResponsible(${idx})" title="Eliminar responsable">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // 5. Refrescar selectores de proveedores si están en el DOM
  const shopRespSelect = document.getElementById('shopResponsible');
  if (shopRespSelect && typeof window.populateResponsibleSelect === 'function') {
    const currentSelected = shopRespSelect.value;
    window.populateResponsibleSelect(shopRespSelect, (currentSelected && !isResponsibleDeleted(currentSelected)) ? currentSelected : '');
  }
  const editActRespSelect = document.getElementById('editActResp');
  if (editActRespSelect && typeof window.populateResponsibleSelect === 'function') {
    const currentSelected = editActRespSelect.value;
    if (currentSelected && currentSelected !== '__custom__') {
      window.populateResponsibleSelect(editActRespSelect, currentSelected);
    }
  }
}

/* ==========================================================================
   ACTUALIZACIÓN INLINE EN TABLA DE COMPRAS (SIN ENTRAR A EDITAR)
   ========================================================================== */
window.quickUpdateShoppingResp = function(shopId, selectedValue) {
  const item = shopping.find(s => s.id === shopId);
  if (!item) return;

  if (selectedValue === '__new_resp__') {
    const newName = prompt('Nombre de la persona o proveedor encargado:');
    if (!newName || !newName.trim()) {
      renderShopping();
      return;
    }
    const cleanName = newName.trim();
    window.ensureResponsibleExists(cleanName, 'Proveedor');
    item.responsible = cleanName;
    item.responsibleStatus = 'ok';
    showToast(`Encargado(a) "${cleanName}" asignado a "${item.item}".`);
  } else {
    item.responsible = selectedValue;
    if (selectedValue) {
      item.responsibleStatus = 'ok';
      showToast(`Encargado(a) de "${item.item}" actualizado a "${selectedValue}".`);
    } else {
      item.responsibleStatus = 'pending';
      showToast(`Encargado(a) de "${item.item}" desasignado.`);
    }
  }

  if (typeof syncShoppingItemToTimeline === 'function') {
    syncShoppingItemToTimeline(item);
  }

  saveData();
  renderAll();
};

window.reassignShoppingMilestone = function(shopId, newMilestoneId) {
  const item = shopping.find(s => s.id === shopId);
  if (!item) return;

  const oldMilestoneId = item.activityId;

  if (!newMilestoneId) {
    item.activityId = '';
    item.activityTitle = '';
    if (typeof syncShoppingItemToTimeline === 'function') {
      syncShoppingItemToTimeline(item, oldMilestoneId);
    }
    showToast(`"${item.item}" marcada como Compra General.`);
  } else {
    const m = timeline.find(t => t.id === newMilestoneId);
    if (m) {
      item.activityId = m.id;
      item.activityTitle = m.title;
      if (typeof syncShoppingItemToTimeline === 'function') {
        syncShoppingItemToTimeline(item, oldMilestoneId);
      }
      showToast(`"${item.item}" reasignada al hito "${m.title}".`);
    }
  }

  try {
    const customShop = JSON.parse(localStorage.getItem('boda_org_shopping_custom_ye') || '[]');
    const idx = customShop.findIndex(x => x.id === item.id);
    if (idx >= 0) customShop[idx] = item;
    else customShop.push(item);
    localStorage.setItem('boda_org_shopping_custom_ye', JSON.stringify(customShop));
  } catch(e) {}

  saveData();
  renderAll();
};

/* ==========================================================================
   ORDENAMIENTO Y REORGANIZACIÓN DE ÍTEMS DE COMPRA
   ========================================================================== */
window.currentShoppingSort = 'manual';
window.shoppingSortDirections = {
  name: 'asc',
  milestone: 'asc',
  category: 'asc',
  responsible: 'asc',
  cost: 'desc',
  status: 'asc'
};

function getShoppingItemTime(item) {
  if (!item.activityId && !item.activityTitle) return '99:99';
  const m = timeline.find(t => 
    t.id === item.activityId || 
    (t.title && item.activityTitle && (
      item.activityTitle.toLowerCase().includes(t.title.toLowerCase()) || 
      t.title.toLowerCase().includes(item.activityTitle.toLowerCase())
    ))
  );
  if (m && m.timeStart) {
    return m.timeStart.padStart(5, '0');
  }
  return '99:99';
}

function saveShoppingOrder(setManual = true) {
  saveData();
  try {
    localStorage.setItem('boda_org_shopping_custom_ye', JSON.stringify(shopping));
  } catch(e) {}
  if (setManual) {
    window.currentShoppingSort = 'manual';
    const sortSelect = document.getElementById('selectShoppingSort');
    if (sortSelect) sortSelect.value = 'manual';
  }
}

window.moveShoppingItem = function(fromIndex, delta) {
  const toIndex = fromIndex + delta;
  if (toIndex < 0 || toIndex >= shopping.length) return;

  const item = shopping.splice(fromIndex, 1)[0];
  shopping.splice(toIndex, 0, item);

  saveShoppingOrder(true);
  renderShopping();
  showToast(`Ítem "${item.item}" movido de posición.`);
};

window.applyShoppingSort = function(criteria) {
  window.currentShoppingSort = criteria;

  if (criteria === 'manual') {
    renderShopping();
    return;
  }

  if (criteria === 'milestone') {
    shopping.sort((a, b) => {
      const timeA = getShoppingItemTime(a);
      const timeB = getShoppingItemTime(b);
      if (timeA !== timeB) return timeA.localeCompare(timeB);
      return (a.item || '').localeCompare(b.item || '');
    });
  } else if (criteria === 'status_pending') {
    const rank = { 'pending': 0, 'in_progress': 1, 'ok': 2 };
    shopping.sort((a, b) => {
      const rA = rank[a.status || 'pending'] ?? 1;
      const rB = rank[b.status || 'pending'] ?? 1;
      if (rA !== rB) return rA - rB;
      return (a.item || '').localeCompare(b.item || '');
    });
  } else if (criteria === 'status_ok') {
    const rank = { 'ok': 0, 'in_progress': 1, 'pending': 2 };
    shopping.sort((a, b) => {
      const rA = rank[a.status || 'pending'] ?? 1;
      const rB = rank[b.status || 'pending'] ?? 1;
      if (rA !== rB) return rA - rB;
      return (a.item || '').localeCompare(b.item || '');
    });
  } else if (criteria === 'responsible') {
    shopping.sort((a, b) => {
      const respA = (a.responsible || 'Sin Asignar').trim().toLowerCase();
      const respB = (b.responsible || 'Sin Asignar').trim().toLowerCase();
      if (respA !== respB) return respA.localeCompare(respB);
      return (a.item || '').localeCompare(b.item || '');
    });
  } else if (criteria === 'category') {
    shopping.sort((a, b) => {
      const catA = (a.category || 'Varios').trim().toLowerCase();
      const catB = (b.category || 'Varios').trim().toLowerCase();
      if (catA !== catB) return catA.localeCompare(catB);
      return (a.item || '').localeCompare(b.item || '');
    });
  } else if (criteria === 'name_asc') {
    shopping.sort((a, b) => (a.item || '').localeCompare(b.item || ''));
  } else if (criteria === 'name_desc') {
    shopping.sort((a, b) => (b.item || '').localeCompare(a.item || ''));
  } else if (criteria === 'cost') {
    shopping.sort((a, b) => {
      const numA = parseInt((a.cost || '').replace(/\D/g, '') || '0', 10);
      const numB = parseInt((b.cost || '').replace(/\D/g, '') || '0', 10);
      if (numA !== numB) return numB - numA;
      return (a.item || '').localeCompare(b.item || '');
    });
  }

  saveShoppingOrder(false);
  renderShopping();

  const sortSelect = document.getElementById('selectShoppingSort');
  if (sortSelect) sortSelect.value = criteria;

  const names = {
    milestone: 'Hito del Cronograma',
    status_pending: 'Estado (Pendientes primero)',
    status_ok: 'Estado (Comprados primero)',
    responsible: 'Encargado(a)',
    category: 'Categoría',
    name_asc: 'Nombre de Ítem (A-Z)',
    name_desc: 'Nombre de Ítem (Z-A)',
    cost: 'Mayor Costo Primero'
  };
  showToast(`Lista ordenada por: ${names[criteria] || criteria}`);
};

window.handleShoppingHeaderSort = function(col) {
  const currentDir = window.shoppingSortDirections[col] || 'asc';
  const newDir = currentDir === 'asc' ? 'desc' : 'asc';
  window.shoppingSortDirections[col] = newDir;

  if (col === 'name') {
    applyShoppingSort(newDir === 'asc' ? 'name_asc' : 'name_desc');
  } else if (col === 'milestone') {
    applyShoppingSort('milestone');
  } else if (col === 'status') {
    applyShoppingSort(newDir === 'asc' ? 'status_pending' : 'status_ok');
  } else if (col === 'responsible') {
    applyShoppingSort('responsible');
  } else if (col === 'category') {
    applyShoppingSort('category');
  } else if (col === 'cost') {
    applyShoppingSort('cost');
  }
};

function updateShoppingHeaderSortIcons() {
  const cols = ['name', 'milestone', 'category', 'responsible', 'cost', 'status'];
  cols.forEach(col => {
    const icon = document.getElementById(`sortIcon_${col}`);
    const th = icon?.closest('.th-sortable');
    if (!icon) return;

    let isCurrent = false;
    let isAsc = true;
    if (col === 'name' && (window.currentShoppingSort === 'name_asc' || window.currentShoppingSort === 'name_desc')) {
      isCurrent = true;
      isAsc = window.currentShoppingSort === 'name_asc';
    } else if (col === 'milestone' && window.currentShoppingSort === 'milestone') {
      isCurrent = true;
      isAsc = true;
    } else if (col === 'category' && window.currentShoppingSort === 'category') {
      isCurrent = true;
      isAsc = true;
    } else if (col === 'responsible' && window.currentShoppingSort === 'responsible') {
      isCurrent = true;
      isAsc = true;
    } else if (col === 'cost' && window.currentShoppingSort === 'cost') {
      isCurrent = true;
      isAsc = false;
    } else if (col === 'status' && (window.currentShoppingSort === 'status_pending' || window.currentShoppingSort === 'status_ok')) {
      isCurrent = true;
      isAsc = window.currentShoppingSort === 'status_pending';
    }

    if (th) {
      th.classList.remove('sorted-asc', 'sorted-desc');
    }

    if (isCurrent) {
      if (th) th.classList.add(isAsc ? 'sorted-asc' : 'sorted-desc');
      icon.className = isAsc ? 'ri-arrow-up-line sort-icon' : 'ri-arrow-down-line sort-icon';
      icon.style.color = '#334155';
    } else {
      icon.className = 'ri-arrow-up-down-line sort-icon';
      icon.style.color = '#94A3B8';
    }
  });
}

let draggedShopIndex = null;

function initShoppingDragAndDrop() {
  const tbody = document.getElementById('shoppingTableBody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr[data-shop-index]');
  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      if (e.target.closest('select, input, button, a')) {
        e.preventDefault();
        return;
      }
      draggedShopIndex = parseInt(row.dataset.shopIndex, 10);
      row.classList.add('shopping-row-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(draggedShopIndex));
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const targetIndex = parseInt(row.dataset.shopIndex, 10);
      if (draggedShopIndex === null || targetIndex === draggedShopIndex) return;

      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      row.classList.remove('drop-target-above', 'drop-target-below');
      if (e.clientY < midY) {
        row.classList.add('drop-target-above');
      } else {
        row.classList.add('drop-target-below');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drop-target-above', 'drop-target-below');
    });

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drop-target-above', 'drop-target-below');
      const targetIndex = parseInt(row.dataset.shopIndex, 10);
      if (draggedShopIndex === null || isNaN(targetIndex) || draggedShopIndex === targetIndex) return;

      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      let insertIndex = (e.clientY < midY) ? targetIndex : targetIndex + 1;

      if (draggedShopIndex < insertIndex) {
        insertIndex--;
      }

      const moved = shopping.splice(draggedShopIndex, 1)[0];
      shopping.splice(insertIndex, 0, moved);

      draggedShopIndex = null;
      saveShoppingOrder(true);
      renderShopping();
      showToast(`Ítem "${moved.item}" reubicado.`);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('shopping-row-dragging', 'drop-target-above', 'drop-target-below');
      draggedShopIndex = null;
      rows.forEach(r => r.classList.remove('drop-target-above', 'drop-target-below', 'shopping-row-dragging'));
    });
  });
}

function renderShopping() {
  const tbody = document.getElementById('shoppingTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  shopping.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.id = `shop_row_${item.id}`;
    tr.dataset.shopIndex = idx;
    tr.dataset.shopId = item.id;
    tr.draggable = true;
    tr.className = 'shopping-table-row';

    const isOk = item.status === 'ok';
    const respOk = item.responsibleStatus === 'ok';

    // Selector interactivo para cambiar hito directamente desde la tabla de compras
    const milestoneSelectorHtml = `
      <select class="select-inline-milestone" onchange="reassignShoppingMilestone('${item.id}', this.value)" title="Cambiar hito al que corresponde esta compra">
        <option value="">— Ninguno (Compra General) —</option>
        ${timeline.map(m => {
          const isMatch = (item.activityId === m.id) || (!item.activityId && item.activityTitle && (item.activityTitle.toLowerCase().includes(m.title.toLowerCase()) || isGuestNameMatch(item.activityTitle, m.title)));
          const timeFmt = formatTimelineTime(m);
          return `<option value="${m.id}" ${isMatch ? 'selected' : ''}>[${escapeHtml(timeFmt)}] ${escapeHtml(m.title)}</option>`;
        }).join('')}
      </select>
    `;

    // Selector interactivo para cambiar encargado directamente sin entrar a editar
    const respSelectorHtml = `
      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
        <select class="select-inline-resp" onchange="quickUpdateShoppingResp('${item.id}', this.value)" title="Cambiar encargado(a) directamente">
          <option value="">— Sin Asignar —</option>
          ${responsibles.map(r => `<option value="${escapeHtml(r.name)}" ${r.name === item.responsible ? 'selected' : ''}>👤 ${escapeHtml(r.name)}</option>`).join('')}
          ${(!responsibles.some(r => r.name === item.responsible) && item.responsible) ? `<option value="${escapeHtml(item.responsible)}" selected>👤 ${escapeHtml(item.responsible)}</option>` : ''}
          <option value="__new_resp__">+ Nuevo Encargado...</option>
        </select>
        <button type="button" class="badge-status ${respOk ? 'ok' : 'pending'}" onclick="toggleShoppingRespStatus(${idx})" title="Clic para alternar estado del encargado">
          ${respOk ? '<i class="ri-check-line"></i> Confirmado' : '<i class="ri-search-eye-line"></i> Por Buscar'}
        </button>
      </div>
    `;

    tr.innerHTML = `
      <td class="col-drag" title="Arrastra la fila para ordenar o usa ▲ ▼">
        <div style="display: flex; align-items: center; justify-content: center; gap: 3px;">
          <span class="shop-drag-handle" title="Arrastrar para mover posición"><i class="ri-drag-move-fill"></i></span>
          <div style="display: flex; flex-direction: column; gap: 1px;">
            <button type="button" class="btn-shop-move" onclick="moveShoppingItem(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Subir">▲</button>
            <button type="button" class="btn-shop-move" onclick="moveShoppingItem(${idx}, 1)" ${idx === shopping.length - 1 ? 'disabled' : ''} title="Bajar">▼</button>
          </div>
        </div>
      </td>
      <td>
        <strong style="color: var(--navy-royal); font-size: 0.95rem;">${escapeHtml(item.item)}</strong>
        ${item.detail ? `<div style="color: var(--text-muted); font-size: 0.82rem; margin-top: 3px;">${escapeHtml(item.detail)}</div>` : ''}
      </td>
      <td style="min-width: 170px;">${milestoneSelectorHtml}</td>
      <td><span class="time-badge" style="background: #F4EFEA; font-size: 0.78rem;">${escapeHtml(item.category || 'Varios')}</span></td>
      <td style="min-width: 160px;">${respSelectorHtml}</td>
      <td><strong style="color: var(--gold-dark);">${escapeHtml(item.cost || '—')}</strong></td>
      <td>
        ${(() => {
          const st = item.status || 'pending';
          if (st === 'ok') {
            return `<button class="badge-status ok" onclick="toggleShoppingStatus(${idx})" title="Estado: Comprado / Listo. Clic para cambiar a Pendiente"><i class="ri-check-line"></i> Comprado / OK</button>`;
          } else if (st === 'in_progress') {
            return `<button class="badge-status in-progress" onclick="toggleShoppingStatus(${idx})" title="Estado: Mandado a Hacer / En Proceso. Clic para marcar como Listo"><i class="ri-palette-line"></i> Mandado a Hacer</button>`;
          } else {
            return `<button class="badge-status pending" onclick="toggleShoppingStatus(${idx})" title="Estado: Pendiente por Comprar. Clic para cambiar a Mandado a Hacer"><i class="ri-time-line"></i> Pendiente</button>`;
          }
        })()}
      </td>
      <td style="white-space: nowrap;">
        <button type="button" class="btn-table-edit" onclick="editShoppingItem('${item.id}')" title="Editar este ítem de compra" style="background: transparent; border: none; color: var(--gold-dark); cursor: pointer; font-size: 1.05rem; padding: 4px 6px; margin-right: 4px;">
          <i class="ri-edit-line"></i>
        </button>
        <button type="button" class="btn-table-del" onclick="deleteShoppingItem(${idx})" title="Eliminar ítem">
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  initShoppingDragAndDrop();
  updateShoppingHeaderSortIcons();
}

window.toggleShoppingStatus = function(idx) {
  if (!shopping[idx]) return;
  const current = shopping[idx].status || 'pending';
  let next = 'pending';
  let msg = '';
  if (current === 'pending') {
    next = 'in_progress';
    msg = `"${shopping[idx].item}" marcado como: 🎨 Mandado a Hacer / En Proceso`;
  } else if (current === 'in_progress') {
    next = 'ok';
    msg = `¡"${shopping[idx].item}" marcado como: ✓ Ya Comprado / Listo!`;
  } else {
    next = 'pending';
    msg = `"${shopping[idx].item}" marcado como: ⏳ Pendiente por Comprar`;
  }
  shopping[idx].status = next;
  if (typeof syncShoppingItemToTimeline === 'function') {
    syncShoppingItemToTimeline(shopping[idx]);
  }
  saveData();
  renderAll();
  showToast(msg);
};

window.toggleShoppingRespStatus = function(idx) {
  if (!shopping[idx]) return;
  shopping[idx].responsibleStatus = shopping[idx].responsibleStatus === 'ok' ? 'pending' : 'ok';
  if (typeof syncShoppingItemToTimeline === 'function') {
    syncShoppingItemToTimeline(shopping[idx]);
  }
  saveData();
  renderAll();
  showToast(`Estado del encargado actualizado a "${shopping[idx].responsibleStatus === 'ok' ? 'Confirmado' : 'Por Buscar'}"`);
};

window.deleteShoppingItem = function(idx) {
  if (!shopping[idx]) return;
  const item = shopping[idx];
  if (confirm(`¿Eliminar el ítem "${item.item}"?`)) {
    const deleted = shopping.splice(idx, 1)[0];
    if (deleted && deleted.activityId) {
      const m = timeline.find(t => t.id === deleted.activityId);
      if (m && Array.isArray(m.activities)) {
        m.activities = m.activities.filter(a => !(
          (a.shopItemId && a.shopItemId === deleted.id) ||
          (a.shopItem && a.shopItem.toLowerCase() === deleted.item.toLowerCase())
        ));
      }
    }
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
      const type = getGuestTablesShape();

      if (!rawName) return;

      const cleanName = getCleanTableName(rawName);
      const fullName = getFormattedTableName(num, cleanName || rawName);
      const coords = getNonCollidingCoords(num);

      tables.push({
        id: 't_' + Date.now(),
        number: num,
        name: fullName,
        type: type,
        shape: type,
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

      const seatedCount = getSeatedCount(table);
      if (newCap < seatedCount) {
        alert(`La capacidad no puede ser menor a la cantidad de personas ya sentadas (${seatedCount}).`);
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

      table.number = newNum;
      table.name = fullName;
      table.capacity = newCap;

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

  // Modal Nuevo Hito & Actividades del Cronograma
  const btnOpenActivityModal = document.getElementById('btnOpenActivityModal');
  const activityModal = document.getElementById('activityModal');
  const formAddActivity = document.getElementById('formAddActivity');
  const btnAddSubActivity = document.getElementById('btnAddSubActivity');

  function handleAppendSubActivity() {
    const container = document.getElementById('subActivitiesContainer');
    if (container) {
      const card = createSubActivityCard();
      container.appendChild(card);
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const nameInput = card.querySelector('.input-subact-name');
      if (nameInput) setTimeout(() => nameInput.focus(), 80);
    }
  }

  if (btnAddSubActivity) {
    btnAddSubActivity.addEventListener('click', handleAppendSubActivity);
  }

  const btnAddSubActivityBottom = document.getElementById('btnAddSubActivityBottom');
  if (btnAddSubActivityBottom) {
    btnAddSubActivityBottom.addEventListener('click', handleAppendSubActivity);
  }

  if (btnOpenActivityModal && activityModal) {
    btnOpenActivityModal.addEventListener('click', () => {
      window.editingMilestoneId = null;
      const titleEl = document.getElementById('activityModalTitle');
      const btnText = document.getElementById('btnSaveMilestoneText');
      if (titleEl) titleEl.innerHTML = '<i class="ri-calendar-event-line" style="color: var(--gold-dark);"></i> Agregar Hito al Cronograma';
      if (btnText) btnText.textContent = 'Guardar Hito & Actividades';

      const container = document.getElementById('subActivitiesContainer');
      if (container) {
        container.innerHTML = '';
        container.appendChild(createSubActivityCard());
      }
      if (formAddActivity) formAddActivity.reset();
      activityModal.classList.add('active');
    });
  }

  window.handleSaveMilestone = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const timeStart = (document.getElementById('actTimeStart')?.value || '16:00').trim();
      const timeEnd = (document.getElementById('actTimeEnd')?.value || '').trim();
      const titleInput = document.getElementById('actTitle');
      const title = (titleInput?.value || '').trim();
      const detail = (document.getElementById('actDetail')?.value || '').trim();

      if (!title) {
        if (titleInput) {
          titleInput.style.borderColor = '#DC2626';
          titleInput.focus();
          setTimeout(() => { titleInput.style.borderColor = ''; }, 3000);
        }
        showToast('⚠️ Por favor escribe el nombre del hito o momento');
        return;
      }

      const cards = document.querySelectorAll('#subActivitiesContainer .subact-card');
      const subActivities = [];
      const actId = window.editingMilestoneId || ('act_' + Date.now());
      let createdShopCount = 0;

      cards.forEach((card, idx) => {
        let name = (card.querySelector('.input-subact-name')?.value || '').trim();
        if (!name) name = `${title} (Actividad ${idx + 1})`;

        const responsible = (card.querySelector('.input-subact-resp')?.value || '').trim() || 'Novios / Coordinador';
        if (responsible && !responsible.toLowerCase().includes('por definir') && typeof window.ensureResponsibleExists === 'function') {
          window.ensureResponsibleExists(responsible, 'Proveedor');
        }
        const responsibleStatus = card.querySelector('.select-subact-resp-status')?.value || 'ok';
        const isPurchase = card.querySelector('.check-subact-purchase')?.checked || false;

        const subAct = {
          id: 'sub_' + Date.now() + '_' + idx,
          name: name,
          responsible: responsible,
          responsibleStatus: responsibleStatus,
          needsPurchase: isPurchase
        };

        if (isPurchase) {
          let itemText = (card.querySelector('.input-subact-item')?.value || '').trim();
          if (!itemText) itemText = `Insumo para: ${name}`;

          const category = card.querySelector('.select-subact-cat')?.value || 'Varios';
          const cost = (card.querySelector('.input-subact-cost')?.value || '').trim();
          const buyStatus = card.querySelector('.select-subact-status')?.value || 'pending';

          // Actualizar compra existente vinculada o crear nueva
          let existingShop = shopping.find(s => s.activityId === actId && (s.item === itemText || s.activityTitle?.includes(name)));
          if (existingShop) {
            existingShop.item = itemText;
            existingShop.category = category;
            existingShop.cost = cost;
            existingShop.status = buyStatus;
            existingShop.responsible = responsible;
            existingShop.responsibleStatus = responsibleStatus;
            existingShop.activityTitle = `${title}: ${name}`;
            subAct.shopItemId = existingShop.id;
          } else {
            const shopId = 'shop_' + Date.now() + '_' + idx;
            const newShopItem = {
              id: shopId,
              activityId: actId,
              activityTitle: `${title}: ${name}`,
              item: itemText,
              category: category,
              responsible: responsible,
              responsibleStatus: responsibleStatus,
              detail: `Para el hito: ${title} (${name})`,
              cost: cost,
              status: buyStatus
            };
            shopping.push(newShopItem);
            subAct.shopItemId = shopId;
            createdShopCount++;

            try {
              const customShop = JSON.parse(localStorage.getItem('boda_org_shopping_custom_ye') || '[]');
              customShop.push(newShopItem);
              localStorage.setItem('boda_org_shopping_custom_ye', JSON.stringify(customShop));
            } catch(e) {}
          }
        }

        subActivities.push(subAct);
      });

      if (subActivities.length === 0) {
        subActivities.push({
          id: 'sub_' + Date.now() + '_0',
          name: title,
          responsible: 'Novios / Coordinador',
          responsibleStatus: 'ok',
          needsPurchase: false
        });
      }

      if (window.editingMilestoneId) {
        // ACTUALIZAR HITO EXISTENTE
        const existingM = timeline.find(t => t.id === window.editingMilestoneId);
        if (existingM) {
          existingM.time = timeStart;
          existingM.timeStart = timeStart;
          existingM.timeEnd = timeEnd;
          existingM.title = title;
          existingM.responsible = subActivities[0]?.responsible || 'Novios / Coordinador';
          existingM.responsibleStatus = subActivities[0]?.responsibleStatus || 'ok';
          existingM.detail = detail;
          existingM.activities = subActivities;
        }

        try {
          const customSaved = JSON.parse(localStorage.getItem('boda_org_timeline_custom_ye') || '[]');
          const cIdx = customSaved.findIndex(c => c.id === window.editingMilestoneId);
          if (cIdx >= 0) {
            customSaved[cIdx] = existingM;
            localStorage.setItem('boda_org_timeline_custom_ye', JSON.stringify(customSaved));
          }
        } catch(e) {}

        showToast(`¡Hito "${title}" y todas sus actividades actualizados con éxito!`);
      } else {
        // CREAR NUEVO HITO
        const newMilestone = {
          id: actId,
          time: timeStart,
          timeStart: timeStart,
          timeEnd: timeEnd,
          title: title,
          responsible: subActivities[0]?.responsible || 'Novios / Coordinador',
          responsibleStatus: subActivities[0]?.responsibleStatus || 'ok',
          detail: detail,
          activities: subActivities
        };

        timeline.push(newMilestone);

        try {
          const customSaved = JSON.parse(localStorage.getItem('boda_org_timeline_custom_ye') || '[]');
          customSaved.push(newMilestone);
          localStorage.setItem('boda_org_timeline_custom_ye', JSON.stringify(customSaved));
        } catch(e) {}

        showToast(`¡Hito "${title}" guardado en el cronograma` + (createdShopCount > 0 ? ` y ${createdShopCount} compra(s) vinculada(s)!` : `!`));
      }

        // Asegurar que el hito 'Todo el Evento' esté presente en el cronograma
  if (Array.isArray(timeline) && !timeline.some(t => t.id === 'act_todo_el_evento' || (t.title && t.title.toLowerCase().includes('todo el evento')))) {
    timeline.unshift({
      id: 'act_todo_el_evento',
      time: 'Todo el Evento',
      timeStart: 'Todo el Evento',
      timeEnd: '',
      title: 'Todo el Evento',
      responsible: 'Coordinador General & Novios',
      responsibleStatus: 'ok',
      detail: 'Servicios continuos, ambientación musical, comodidades para los invitados y coordinación general durante toda la jornada.',
      activities: [
        { id: 'sub_ev_1', name: 'Coordinación y supervisión general de tiempos', responsible: 'Coordinador General', responsibleStatus: 'ok' },
        { id: 'sub_ev_2', name: 'Estación de hidratación, café y comodidades', responsible: 'Banquetera', responsibleStatus: 'ok' },
        { id: 'sub_ev_3', name: 'Kits de emergencia y baño (damas y varones)', responsible: 'Damas de Honor', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Kit de Baño / Emergencia (Hombres y Mujeres)', shopCategory: 'Varios', shopCost: '$18.000', shopStatus: 'pending' },
        { id: 'sub_ev_4', name: 'Marcos de fotos con Códigos QR y libro de firmas', responsible: 'Hermano del Novio', responsibleStatus: 'ok', needsPurchase: true, shopItem: 'Carteles y Marcos para Códigos QR de Fotos', shopCategory: 'Decoración', shopCost: '$15.000', shopStatus: 'pending' }
      ]
    });
  }

  timeline.sort((a, b) => getTimelineSortKey(a).localeCompare(getTimelineSortKey(b)));
      saveData();
      renderAll();
      populateShoppingModalActivities();

      // Resetear estado del modal
      window.editingMilestoneId = null;
      const titleEl = document.getElementById('activityModalTitle');
      const btnText = document.getElementById('btnSaveMilestoneText');
      if (titleEl) titleEl.innerHTML = '<i class="ri-calendar-event-line" style="color: var(--gold-dark);"></i> Agregar Hito al Cronograma';
      if (btnText) btnText.textContent = 'Guardar Hito & Actividades';

      const form = document.getElementById('formAddActivity');
      if (form) form.reset();
      const activityModal = document.getElementById('activityModal');
      if (activityModal) activityModal.classList.remove('active');

    } catch(err) {
      console.error('Error al guardar hito:', err);
      alert('Ocurrió un error al guardar: ' + err.message);
    }
  };
  if (formAddActivity) {
    formAddActivity.addEventListener('submit', window.handleSaveMilestone);
  }

  // Modal Nuevo Ítem de Compra
  const btnOpenShoppingModal = document.getElementById('btnOpenShoppingModal');
  const shoppingModal = document.getElementById('shoppingModal');
  const formAddShopping = document.getElementById('formAddShopping');

  if (btnOpenShoppingModal && shoppingModal) {
    btnOpenShoppingModal.addEventListener('click', () => {
      window.editingShoppingId = null;
      const titleEl = document.getElementById('shoppingModalTitle');
      const btnText = document.getElementById('btnSaveShoppingText');
      if (titleEl) titleEl.innerHTML = '<i class="ri-shopping-bag-3-line" style="color: var(--gold-dark);"></i> Agregar Ítem de Compra / Insumo';
      if (btnText) btnText.textContent = 'Guardar Ítem en Compras';

      populateShoppingModalActivities();
      if (formAddShopping) formAddShopping.reset();

      const shopRespSelect = document.getElementById('shopResponsible');
      if (shopRespSelect && typeof window.populateResponsibleSelect === 'function') {
        window.populateResponsibleSelect(shopRespSelect, '');
      }

      shoppingModal.classList.add('active');
    });
  }

  if (formAddShopping && shoppingModal) {
    formAddShopping.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const item = (document.getElementById('shopItem')?.value || '').trim();
        const linkedActId = document.getElementById('shopLinkedActivity')?.value || '';
        const category = document.getElementById('shopCategory')?.value || 'Varios';
        let responsible = (document.getElementById('shopResponsible')?.value || '').trim();
        if (responsible === '__custom__') {
          responsible = (document.getElementById('shopResponsibleCustom')?.value || '').trim();
        }
        if (!responsible) responsible = '';
        else if (responsible !== '__custom__' && typeof window.ensureResponsibleExists === 'function') {
          window.ensureResponsibleExists(responsible, category || 'Proveedor');
        }
        const respStatus = document.getElementById('shopRespStatus')?.value || 'ok';
        const detail = (document.getElementById('shopDetail')?.value || '').trim();
        const cost = (document.getElementById('shopCost')?.value || '').trim();
        const status = document.getElementById('shopStatus')?.value || 'pending';

        let linkedTitle = '';
        if (linkedActId) {
          const linkedAct = timeline.find(t => t.id === linkedActId);
          if (linkedAct) linkedTitle = linkedAct.title;
        }

        if (window.editingShoppingId) {
          // ACTUALIZAR ÍTEM EXISTENTE
          const existingItem = shopping.find(s => s.id === window.editingShoppingId);
          if (existingItem) {
            const oldActId = existingItem.activityId;
            existingItem.item = item;
            existingItem.activityId = linkedActId;
            existingItem.activityTitle = linkedTitle;
            existingItem.category = category;
            existingItem.responsible = responsible;
            existingItem.responsibleStatus = respStatus;
            existingItem.detail = detail;
            existingItem.cost = cost;
            existingItem.status = status;

            if (typeof syncShoppingItemToTimeline === 'function') {
              syncShoppingItemToTimeline(existingItem, oldActId);
            }

            try {
              const customShop = JSON.parse(localStorage.getItem('boda_org_shopping_custom_ye') || '[]');
              const idx = customShop.findIndex(x => x.id === window.editingShoppingId);
              if (idx >= 0) customShop[idx] = existingItem;
              else customShop.push(existingItem);
              localStorage.setItem('boda_org_shopping_custom_ye', JSON.stringify(customShop));
            } catch(e) {}
          }
          showToast(`¡Ítem "${item}" actualizado con éxito!`);
        } else {
          // CREAR NUEVO ÍTEM
          const newShopItem = {
            id: 'shop_' + Date.now(),
            activityId: linkedActId,
            activityTitle: linkedTitle,
            item: item,
            category: category,
            responsible: responsible,
            responsibleStatus: respStatus,
            detail: detail,
            cost: cost,
            status: status
          };
          shopping.push(newShopItem);

          if (typeof syncShoppingItemToTimeline === 'function') {
            syncShoppingItemToTimeline(newShopItem);
          }

          try {
            const customShop = JSON.parse(localStorage.getItem('boda_org_shopping_custom_ye') || '[]');
            customShop.push(newShopItem);
            localStorage.setItem('boda_org_shopping_custom_ye', JSON.stringify(customShop));
          } catch(e) {}

          showToast(`¡Ítem "${item}" agregado a compras!`);
        }

        window.editingShoppingId = null;
        const titleEl = document.getElementById('shoppingModalTitle');
        const btnText = document.getElementById('btnSaveShoppingText');
        if (titleEl) titleEl.innerHTML = '<i class="ri-shopping-bag-3-line" style="color: var(--gold-dark);"></i> Agregar Ítem de Compra / Insumo';
        if (btnText) btnText.textContent = 'Guardar Ítem en Compras';

        formAddShopping.reset();
        shoppingModal.classList.remove('active');
        saveData();
        renderAll();
      } catch(err) {
        console.error('Error al guardar ítem de compra:', err);
        alert('Ocurrió un error al guardar el ítem: ' + err.message);
      }
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

let viewSwitchInitialized = false;

function initViewSwitch() {
  const btnCards = document.getElementById('btnViewCards');
  const btnFp = document.getElementById('btnViewFloorplan');
  const containerCards = document.getElementById('viewModeCardsContainer');
  const containerFp = document.getElementById('viewModeFloorplanContainer');

  if (btnCards && btnFp && containerCards && containerFp && !viewSwitchInitialized) {
    viewSwitchInitialized = true;
    btnCards.addEventListener('click', () => {
      btnCards.classList.add('active');
      btnFp.classList.remove('active');
      containerCards.style.display = 'block';
      containerCards.classList.add('active');
      containerFp.style.display = 'none';
      containerFp.classList.remove('active');
      renderTables();
    });

    btnFp.addEventListener('click', () => {
      btnFp.classList.add('active');
      btnCards.classList.remove('active');
      containerCards.style.display = 'none';
      containerCards.classList.remove('active');
      containerFp.style.display = 'block';
      containerFp.classList.add('active');
      renderFloorplan();
    });
  }

  const btnAuto = document.getElementById('btnAutoLayout');
  if (btnAuto && !btnAuto.dataset.hasListener) {
    btnAuto.dataset.hasListener = 'true';
    btnAuto.addEventListener('click', autoLayoutTables);
  }

  const btnReset = document.getElementById('btnResetFloorplanZoom');
  if (btnReset && !btnReset.dataset.hasListener) {
    btnReset.dataset.hasListener = 'true';
    btnReset.addEventListener('click', () => {
      const wrapper = document.getElementById('floorplanWrapper');
      if (wrapper) {
        wrapper.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
      }
    });
  }

  // Listeners para los botones de cambio de forma de mesas
  document.querySelectorAll('#groupGuestTableShapes .btn-shape-toggle').forEach(btn => {
    if (!btn.dataset.hasListener) {
      btn.dataset.hasListener = 'true';
      btn.addEventListener('click', () => {
        if (btn.dataset.guestShape) {
          setAllGuestTablesShape(btn.dataset.guestShape);
        }
      });
    }
  });

  document.querySelectorAll('#groupNoviosTableShapes .btn-shape-toggle').forEach(btn => {
    if (!btn.dataset.hasListener) {
      btn.dataset.hasListener = 'true';
      btn.addEventListener('click', () => {
        if (btn.dataset.noviosShape) {
          setNoviosTableShape(btn.dataset.noviosShape);
        }
      });
    }
  });

  // Listener para cerrar modal de puestos
  const btnCloseSeats = document.getElementById('btnCloseSeatsModal');
  if (btnCloseSeats && !btnCloseSeats.dataset.hasListener) {
    btnCloseSeats.dataset.hasListener = 'true';
    btnCloseSeats.addEventListener('click', () => {
      const modal = document.getElementById('seatsModal');
      if (modal) modal.classList.remove('active');
    });
  }

  updateShapeToggleButtons();
}

/* ==========================================================================
   11. Pestañas y Helpers
   ========================================================================== */
function switchTab(targetId, updateUrl = true) {
  const tabs = document.querySelectorAll('.org-nav-tabs .tab-btn');
  const targetPane = document.getElementById(targetId);
  const targetTabBtn = document.querySelector(`.org-nav-tabs .tab-btn[data-target="${targetId}"]`);

  if (targetPane && targetTabBtn) {
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.org-pane').forEach(p => p.classList.remove('active'));

    targetTabBtn.classList.add('active');
    targetPane.classList.add('active');

    if (updateUrl) {
      let hashKey = 'mesas';
      if (targetId === 'pane-timeline') hashKey = 'cronograma';
      else if (targetId === 'pane-shopping') hashKey = 'compras';

      try {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('tab');
        newUrl.hash = hashKey;
        window.history.replaceState(null, '', newUrl.toString());
      } catch (e) {
        window.location.hash = hashKey;
      }
    }
  }
}

function handleTabFromUrl() {
  const hash = (window.location.hash || '').toLowerCase().replace('#', '').trim();
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = (urlParams.get('tab') || '').toLowerCase().trim();

  // El hash del usuario siempre tiene máxima prioridad
  const key = hash || tabParam;

  if (key === 'cronograma' || key === 'timeline' || key === 'pane-timeline') {
    switchTab('pane-timeline', false);
  } else if (key === 'compras' || key === 'shopping' || key === 'pane-shopping') {
    switchTab('pane-shopping', false);
  } else if (key === 'mesas' || key === 'tables' || key === 'pane-tables') {
    switchTab('pane-tables', false);
  }
}

function initTabs() {
  const tabs = document.querySelectorAll('.org-nav-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.dataset.target;
      switchTab(targetId, true);
    });
  });

  handleTabFromUrl();
  window.addEventListener('hashchange', handleTabFromUrl);
}

function showToast(msg) {
  const toast = document.getElementById('orgToast');
  if (!toast) return;
  toast.innerHTML = `<i class="ri-checkbox-circle-line" style="color: #94A3B8; margin-right: 6px;"></i> ${msg}`;
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
