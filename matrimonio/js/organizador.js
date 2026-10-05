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
  'Cristopher', 'Reny',
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

  // 1. Leer de wedding_rsvps_cloud_v1 (identificar confirmados y rechazados de forma segura)
  try {
    const rawRsvps = localStorage.getItem('wedding_rsvps_cloud_v1');
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

  // 1.b Leer de wedding_invitations_cloud_v1 para asegurar todos los invitados
  try {
    const rawInvs = localStorage.getItem('wedding_invitations_cloud_v1');
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
        guests: ['Pamela', 'Marcial', 'Constanza', 'Cecilia', 'Barbara', null, null, null]
      },
      {
        id: 't_3',
        number: 3,
        name: 'Mesa 3: Familia del Novio',
        capacity: 8,
        guests: ['Carlos', 'Carola', 'Felipe', 'Camila', null, null, null, null]
      },
      {
        id: 't_4',
        number: 4,
        name: 'Mesa 4: Amigos del Colegio',
        capacity: 8,
        guests: ['Jessica', 'Eduardo', 'Guisselle', 'Nicolas', null, null, null, null]
      },
      {
        id: 't_5',
        number: 5,
        name: 'Mesa 5: Amigos de la Universidad',
        capacity: 8,
        guests: ['Jaqueline', 'Luis', 'Isaac', 'Denisse', null, null, null, null]
      },
      {
        id: 't_6',
        number: 6,
        name: 'Mesa 6: Mesa Infantil / Niños',
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

  const savedTimeline = localStorage.getItem(STORAGE_KEY_TIMELINE);
  if (savedTimeline) {
    try {
      timeline = JSON.parse(savedTimeline);
    } catch(e) {
      console.error('Error parsing timeline:', e);
      timeline = [];
    }
  }

  // Respaldo de hitos personalizados del usuario
  try {
    const customSaved = JSON.parse(localStorage.getItem('boda_org_timeline_custom') || '[]');
    if (Array.isArray(customSaved) && customSaved.length > 0) {
      if (!timeline) timeline = [];
      customSaved.forEach(c => {
        if (!timeline.some(t => t.id === c.id || (t.title === c.title && t.timeStart === c.timeStart))) {
          timeline.push(c);
        }
      });
    }
  } catch(e) {}

  if (!timeline || timeline.length === 0) {
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
        id: 'act_recepcion',
        time: '11:30',
        timeStart: '11:30',
        timeEnd: '17:00',
        title: 'Recepción',
        responsible: 'Hermano del Novio',
        responsibleStatus: 'ok',
        detail: 'Recepción de invitados y montaje de bienvenida',
        activities: [
          {
            id: 'sub_rec_1',
            name: 'Instalación de Cartel de Bienvenida',
            responsible: 'Hermano del Novio',
            responsibleStatus: 'ok',
            needsPurchase: true,
            shopItem: 'Cartel de bienvenidos',
            shopCategory: 'Decoración',
            shopCost: '$25.000',
            shopStatus: 'in_progress'
          }
        ]
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
        id: 'shop_cartel_rec',
        item: 'Cartel de Bienvenidos (Madera / Acrílico)',
        activityTitle: 'Recepción: Instalación de Cartel de Bienvenida',
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
        activityTitle: 'Fiesta, Baile & Cotillón',
        responsible: 'DJ & Animador',
        responsibleStatus: 'ok',
        detail: 'Pack fiesta flúor con lentes LED y barras de luz',
        cost: '$35.000',
        status: 'pending'
      }
    ];
  }

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
        const ringsIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.3" style="display:inline-block; vertical-align:middle; margin-right:3px;"><circle cx="8.5" cy="12" r="5.5"/><circle cx="15.5" cy="12" r="5.5"/></svg>`;
        const companionBadge = hasCompanionInTable ? `<small style="font-size: 0.72rem; color: #99742a; font-weight: 700;" title="Acompañante de invitación: ${escapeHtml(companion)}">${ringsIcon} Pareja: ${escapeHtml(companion)}</small>` : '';

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
      <div class="fp-table-surface" title="Arrastra la mesa para moverla por el salón">
        ${noviosCrownTag}
        <span class="fp-table-number">Mesa ${table.number || (tableIdx + 1)}</span>
        <span class="fp-table-name" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</span>
        <span class="fp-table-capacity ${isFull ? 'full' : ''}">${seatedCount} / ${table.capacity}</span>
        <button type="button" class="fp-btn-manage-seats" onclick="openSeatsModal('${table.id}')" title="Acomodar puestos de invitados y parejas">
          <i class="ri-user-shared-line"></i> Puestos
        </button>
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
  let novio1 = seated.find(g => isGuestNameMatch(g, 'Cristopher') || isGuestNameMatch(g, 'Reny')) || seated[0];
  let comp = getCompanion(novio1);
  let novio2 = comp ? seated.find(g => isGuestNameMatch(g, comp)) : seated.find(g => !isGuestNameMatch(g, novio1));
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
    
    // Si la mesa es de novios y son los dos comensales centrales o iniciales
    const isNovioSeat = isNovios && (seatIndex === 0 || seatIndex === 1 || (hasCompanionInTable && seatIndex <= 3));

    chair.className = `fp-chair seated ${hasCompanionInTable ? 'couple' : ''} ${isNovioSeat ? 'is-novio' : ''}`;

    const firstName = guest.split(' ')[0] || guest;
    const initial = isNovioSeat ? '<i class="ri-vip-crown-2-fill"></i>' : guest.charAt(0).toUpperCase();

    chair.innerHTML = `
      <div class="fp-chair-circle">${initial}</div>
      <div class="fp-chair-name" title="${escapeHtml(guest)}">${escapeHtml(firstName)}</div>
    `;

    const tooltipText = `Puesto ${seatIndex + 1}: ${guest}` + (hasCompanionInTable ? ` (👥 Pareja con: ${companion})` : '') + ' (Arrastra para mover de puesto)';
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
  const start = item.timeStart || item.time || '';
  const end = item.timeEnd || '';
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return `Hasta ${end}`;
  return '—';
}

function getTimelineSortKey(item) {
  if (!item) return '99:99';
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

window.goToTimelineActivity = function(title) {
  switchTab('pane-timeline');
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
  if (shopResp && act && act.responsible) {
    shopResp.value = act.responsible;
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
        <input type="text" class="input-org input-subact-resp" placeholder="Ej.: Hermano del Novio / Banquetera" value="${escapeHtml(data.responsible || '')}">
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

function renderTimeline() {
  const tbody = document.getElementById('timelineTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  timeline.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const timeFormatted = formatTimelineTime(item);
    const respOk = item.responsibleStatus === 'ok';

    // Compras vinculadas a este hito
    const linkedItems = shopping.filter(s => {
      if (s.activityId && s.activityId === item.id) return true;
      if (s.activityTitle && isGuestNameMatch(s.activityTitle, item.title)) return true;
      return false;
    });

    let shoppingCellHtml = '';
    if (linkedItems.length > 0) {
      shoppingCellHtml = linkedItems.map(s => {
        const st = s.status || 'pending';
        let bClass = 'pending';
        let bIcon = 'ri-time-line';
        let bText = 'Pendiente';
        if (st === 'ok') {
          bClass = 'ok';
          bIcon = 'ri-checkbox-circle-fill';
          bText = 'Listo';
        } else if (st === 'in_progress') {
          bClass = 'in_progress';
          bIcon = 'ri-palette-line';
          bText = 'Mandado a Hacer';
        }
        return `
          <div class="timeline-linked-shop-badge ${bClass}" onclick="goToShopping('${s.id}')" title="Clic para ver en la pestaña de compras (${bText})">
            <i class="${bIcon}"></i>
            <span class="shop-name">${escapeHtml(s.item)}</span>
            <span class="shop-tag">${bText}</span>
          </div>
        `;
      }).join('');
    } else {
      shoppingCellHtml = `
        <button type="button" class="btn-sm-add-shop" onclick="quickAddShopForActivity('${item.id}')" title="Agregar una compra o insumo necesario para este hito">
          <i class="ri-add-line"></i> <span>+ Compra</span>
        </button>
      `;
    }

    // Bloque Actividades & Encargados
    let activitiesColHtml = '';
    if (item.activities && Array.isArray(item.activities) && item.activities.length > 0) {
      activitiesColHtml = `
        <div class="milestone-subacts-table">
          ${item.activities.map((act, actIdx) => {
            const isSubRespOk = act.responsibleStatus === 'ok';
            return `
              <div class="milestone-subact-row">
                <div class="subact-main">
                  <i class="ri-checkbox-blank-circle-fill" style="color: var(--gold-dark); font-size: 0.45rem;"></i>
                  <strong>${escapeHtml(act.name)}</strong>
                </div>
                <div class="subact-resp-box">
                  <span class="subact-resp-name"><i class="ri-user-star-line"></i> ${escapeHtml(act.responsible || 'Por definir')}</span>
                  <button type="button" class="badge-status-xs ${isSubRespOk ? 'ok' : 'pending'}" onclick="toggleMilestoneSubactResp('${item.id}', ${actIdx})" title="Clic para alternar si el encargado está confirmado o pendiente de buscar">
                    ${isSubRespOk ? '✓ OK' : '⏳ Por Buscar'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      activitiesColHtml = `
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
          <span style="color: var(--gold-dark); font-weight: 700; font-size: 0.88rem;">
            <i class="ri-user-star-line"></i> ${escapeHtml(item.responsible || 'Por definir')}
          </span>
          <button type="button" class="badge-status ${respOk ? 'ok' : 'pending'}" onclick="toggleTimelineRespStatus(${idx})" title="Clic para alternar si el encargado está confirmado o pendiente de buscar">
            ${respOk ? '<i class="ri-check-line"></i> Confirmado' : '<i class="ri-search-eye-line"></i> Por Buscar'}
          </button>
        </div>
      `;
    }

    tr.innerHTML = `
      <td>
        <span class="time-badge"><i class="ri-time-line"></i> ${escapeHtml(timeFormatted)}</span>
      </td>
      <td>
        <strong style="color: var(--navy-royal); font-size: 1.02rem; display: block; margin-bottom: 2px;">${escapeHtml(item.title)}</strong>
        ${item.detail ? `<div style="color: var(--text-muted); font-size: 0.82rem; line-height: 1.4;">${escapeHtml(item.detail)}</div>` : ''}
      </td>
      <td>
        ${activitiesColHtml}
      </td>
      <td style="color: var(--text-muted); font-size: 0.88rem;">
        ${item.detail ? escapeHtml(item.detail) : '—'}
      </td>
      <td>
        <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-start;">
          ${shoppingCellHtml}
        </div>
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

window.toggleTimelineRespStatus = function(idx) {
  if (!timeline[idx]) return;
  timeline[idx].responsibleStatus = timeline[idx].responsibleStatus === 'ok' ? 'pending' : 'ok';
  saveData();
  renderAll();
  showToast(`Estado del encargado actualizado a "${timeline[idx].responsibleStatus === 'ok' ? 'Confirmado' : 'Por Buscar'}"`);
};

window.deleteTimelineActivity = function(idx) {
  if (!timeline[idx]) return;
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
    tr.id = `shop_row_${item.id}`;
    const isOk = item.status === 'ok';
    const respOk = item.responsibleStatus === 'ok';

    let activityBadge = '';
    if (item.activityTitle) {
      activityBadge = `
        <span class="badge-shopping-activity" onclick="goToTimelineActivity('${escapeHtml(item.activityTitle)}')" title="Clic para ir al hito en el cronograma">
          <i class="ri-calendar-event-line"></i> ${escapeHtml(item.activityTitle)}
        </span>
      `;
    } else {
      activityBadge = `<span style="color: #94A3B8; font-size: 0.82rem;">General (Todo el evento)</span>`;
    }

    tr.innerHTML = `
      <td>
        <strong style="color: var(--navy-royal); font-size: 0.95rem;">${escapeHtml(item.item)}</strong>
        ${item.detail ? `<div style="color: var(--text-muted); font-size: 0.82rem; margin-top: 3px;">${escapeHtml(item.detail)}</div>` : ''}
      </td>
      <td>${activityBadge}</td>
      <td><span class="time-badge" style="background: #F4EFEA; font-size: 0.78rem;">${escapeHtml(item.category || 'Varios')}</span></td>
      <td>
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--navy-royal);">${escapeHtml(item.responsible || 'Por definir')}</span>
          <button type="button" class="badge-status ${respOk ? 'ok' : 'pending'}" onclick="toggleShoppingRespStatus(${idx})" title="Clic para cambiar estado del encargado">
            ${respOk ? '<i class="ri-check-line"></i> Confirmado' : '<i class="ri-search-eye-line"></i> Por Buscar'}
          </button>
        </div>
      </td>
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
  saveData();
  renderAll();
  showToast(msg);
};

window.toggleShoppingRespStatus = function(idx) {
  if (!shopping[idx]) return;
  shopping[idx].responsibleStatus = shopping[idx].responsibleStatus === 'ok' ? 'pending' : 'ok';
  saveData();
  renderAll();
  showToast(`Estado del encargado actualizado a "${shopping[idx].responsibleStatus === 'ok' ? 'Confirmado' : 'Por Buscar'}"`);
};

window.deleteShoppingItem = function(idx) {
  if (!shopping[idx]) return;
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

  if (btnAddSubActivity) {
    btnAddSubActivity.addEventListener('click', () => {
      const container = document.getElementById('subActivitiesContainer');
      if (container) {
        const card = createSubActivityCard();
        container.appendChild(card);
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const nameInput = card.querySelector('.input-subact-name');
        if (nameInput) setTimeout(() => nameInput.focus(), 80);
      }
    });
  }

  if (btnOpenActivityModal && activityModal) {
    btnOpenActivityModal.addEventListener('click', () => {
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
      const actId = 'act_' + Date.now();
      let createdShopCount = 0;

      cards.forEach((card, idx) => {
        let name = (card.querySelector('.input-subact-name')?.value || '').trim();
        if (!name) name = `${title} (Actividad ${idx + 1})`;

        const responsible = (card.querySelector('.input-subact-resp')?.value || '').trim() || 'Novios / Coordinador';
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
          const shopId = 'shop_' + Date.now() + '_' + idx;

          shopping.push({
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
          });

          subAct.shopItemId = shopId;
          createdShopCount++;
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
      timeline.sort((a, b) => getTimelineSortKey(a).localeCompare(getTimelineSortKey(b)));

      // Guardar de inmediato
      saveData();

      // Guardar también en respaldo para garantizar permanencia
      try {
        const customSaved = JSON.parse(localStorage.getItem('boda_org_timeline_custom') || '[]');
        customSaved.push(newMilestone);
        localStorage.setItem('boda_org_timeline_custom', JSON.stringify(customSaved));
      } catch(e) {}

      renderAll();
      populateShoppingModalActivities();

      const form = document.getElementById('formAddActivity');
      if (form) form.reset();
      const activityModal = document.getElementById('activityModal');
      if (activityModal) activityModal.classList.remove('active');

      showToast(`¡Hito "${title}" guardado en el cronograma` + (createdShopCount > 0 ? ` y ${createdShopCount} compra(s) vinculada(s)!` : `!`));
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
      populateShoppingModalActivities();
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
        const responsible = (document.getElementById('shopResponsible')?.value || '').trim() || 'Novios';
        const respStatus = document.getElementById('shopRespStatus')?.value || 'ok';
        const detail = (document.getElementById('shopDetail')?.value || '').trim();
        const cost = (document.getElementById('shopCost')?.value || '').trim();
        const status = document.getElementById('shopStatus')?.value || 'pending';

        let linkedTitle = '';
        if (linkedActId) {
          const linkedAct = timeline.find(t => t.id === linkedActId);
          if (linkedAct) linkedTitle = linkedAct.title;
        }

        shopping.push({
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
        });

        formAddShopping.reset();
        shoppingModal.classList.remove('active');
        saveData();
        renderAll();
        showToast(`¡Ítem "${item}" agregado a compras!`);
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
