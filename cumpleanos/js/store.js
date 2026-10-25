/**
 * store.js - Sistema de datos y persistencia compartido para el Cumpleaños
 * Conecta la invitación (index.html) y el panel del organizador (organizador.html)
 */

function isDemoContext() {
  const p = (typeof window !== 'undefined' && window.location && window.location.pathname ? window.location.pathname : '').toLowerCase();
  return p.includes('/demo/') || p.endsWith('/demo');
}

function getActiveStorageKey() {
  return isDemoContext() ? 'cumple_demo_data_v2' : 'cumple_domi_data_v2';
}

const INITIAL_DATA = {
  evento: {
    nombreCumpleanera: "Dominique",
    edad: "1 añito",
    titulo: "Mi Cumpleaños N°1",
    fecha: "2026-10-31",
    hora: "15:00",
    lugar: "Club Valle del Sol",
    direccion: "Senecio 4593, Puente Alto",
    mapaUrl: "https://maps.google.com/?q=Senecio+4593,+Puente+Alto",
    tematica: "Sirenita & Bajo el Mar Pastel con Halloween",
    dressCode: "¡Con Disfraz! (Bajo el mar o Halloween)",
    whatsappOrganizador: "+56912345678"
  },
  invitados: [],
  mesas: [],
  comida: [],
  cotillon: [],
  cronograma: [
    {
      id: "cr-1",
      hora: "15:00",
      titulo: "Conversar sobre Domi y Comer Cositas Ricas",
      descripcion: "De 15:00 a 16:00 hrs. Bienvenida, ricas cositas para picar y un hermoso momento para compartir, hablar de lo bella, inteligente, risueña y adorable que es Domi en su primer añito."
    },
    {
      id: "cr-2",
      hora: "16:00",
      titulo: "Cantar Cumpleaños Feliz & Apertura de Regalos",
      descripcion: "A las 16:00 hrs. Canto del cumpleaños feliz junto a la torta, apagar la velita N°1 y apertura de regalos con mucho amor."
    },
    {
      id: "cr-completos",
      hora: "18:00",
      titulo: "Gran Banquete de Completos de Etiqueta",
      descripcion: "A las 18:00 hrs. Solemne y distinguido momento gastronómico donde nos deleitaremos con la más selecta preparación de completos al estilo de etiqueta, servidos con gran pompa y sabor."
    },
    {
      id: "cr-3",
      hora: "19:00",
      titulo: "Salir a Pedir Dulces",
      descripcion: "De 19:00 a 20:00 hrs. ¡Momento de dulces y diversión! Salir a pedir dulces con los niños y sus disfraces compartiendo risas y ricas golosinas."
    },
    {
      id: "cr-4",
      hora: "20:00",
      titulo: "Regreso al Club & Despedida",
      descripcion: "A las 20:00 hrs. Tras salir a pedir dulces, pueden volver con toda tranquilidad al club a descansar, recoger sus pertenencias, abrigarse y despedirnos con un gran abrazo."
    }
  ]
};

const DEMO_INITIAL_DATA = {
  evento: {
    nombreCumpleanera: "Dominique (Demo)",
    edad: "1 añito",
    titulo: "Mi Cumpleaños N°1 — Modo Demostración",
    fecha: "2026-10-31",
    hora: "15:00",
    lugar: "Club Valle del Sol",
    direccion: "Senecio 4593, Puente Alto",
    mapaUrl: "https://maps.google.com/?q=Senecio+4593,+Puente+Alto",
    tematica: "Sirenita & Bajo el Mar Pastel con Halloween",
    dressCode: "¡Con Disfraz! (Bajo el mar o Halloween)",
    whatsappOrganizador: "+56912345678"
  },
  invitados: [
    {
      id: "inv-demo-1",
      fechaRegistro: "2026-10-25 10:30",
      tipo: "familia",
      nombre: "Familia Morales",
      familia: "Familia Morales",
      nombresIntegrantes: "Carlos, Carolina y Mateo",
      asistira: true,
      adultos: 2,
      ninos: 1,
      dedicatoria: "¡Muchísimas felicidades Domi hermosa en tu primer añito!",
      mesaId: "mesa-1"
    },
    {
      id: "inv-demo-2",
      fechaRegistro: "2026-10-25 11:15",
      tipo: "pareja",
      name1: "Gonzalo",
      name2: "Valentina",
      nombre: "Gonzalo & Valentina",
      asistira: true,
      adultos: 2,
      ninos: 0,
      dedicatoria: "¡Ahí estaremos con nuestros disfraces marinos!",
      mesaId: "mesa-2"
    },
    {
      id: "inv-demo-3",
      fechaRegistro: "2026-10-25 12:00",
      tipo: "individual",
      nombre: "Tía Claudia",
      asistira: true,
      adultos: 1,
      ninos: 0,
      dedicatoria: "Un besote enorme a la sirenita más tierna de todas.",
      mesaId: "mesa-1"
    },
    {
      id: "inv-demo-4",
      fechaRegistro: "2026-10-25 13:45",
      tipo: "familia",
      nombre: "Familia Henríquez",
      familia: "Familia Henríquez",
      nombresIntegrantes: "Felipe, Marcela, Sofía y Lucas",
      asistira: null,
      adultos: 2,
      ninos: 2,
      mesaId: null
    }
  ],
  mesas: [
    { id: "mesa-1", nombre: "Mesa 1: Océano Mágico", capacidad: 8, notas: "Familia cercana" },
    { id: "mesa-2", nombre: "Mesa 2: Sirenitas & Piratas", capacidad: 8, notas: "Amigos y peques" }
  ],
  comida: [
    { id: "com-1", item: "Vienesas de Primera Calidad", cantidad: "80 un.", comprado: true, notas: "Para los completos de etiqueta" },
    { id: "com-2", item: "Panes de Completo Especial", cantidad: "80 un.", comprado: true, notas: "Panadería local" },
    { id: "com-3", item: "Paltas y Tomates frescos", cantidad: "8 kg", comprado: false, notas: "Comprar el día anterior" },
    { id: "com-4", item: "Torta Temática Sirenita N°1", cantidad: "1 grande (40 porciones)", comprado: true, notas: "Pastelería fina" }
  ],
  cotillon: [
    { id: "cot-1", item: "Piñata Artesanal Sirenita Bebé", cantidad: "1 un.", comprado: true, notas: "Con dulces y sorpresas" },
    { id: "cot-2", item: "Banderines Holográficos Bajo el Mar", cantidad: "3 tiras", comprado: true, notas: "Para el fondo de fotos" },
    { id: "cot-3", item: "Vasos y Platos Biodegradables Marinos", cantidad: "100 un.", comprado: false, notas: "Diseño pastel" },
    { id: "cot-4", item: "Bolsitas de Dulces para Salir a Pedir", cantidad: "30 un.", comprado: true, notas: "Con temática Halloween/Mar" }
  ],
  cronograma: [
    {
      id: "cr-1",
      hora: "15:00",
      titulo: "Conversar sobre Domi y Comer Cositas Ricas",
      descripcion: "De 15:00 a 16:00 hrs. Bienvenida, ricas cositas para picar y un hermoso momento para compartir, hablar de lo bella, inteligente, risueña y adorable que es Domi en su primer añito."
    },
    {
      id: "cr-2",
      hora: "16:00",
      titulo: "Cantar Cumpleaños Feliz & Apertura de Regalos",
      descripcion: "A las 16:00 hrs. Canto del cumpleaños feliz junto a la torta, apagar la velita N°1 y apertura de regalos con mucho amor."
    },
    {
      id: "cr-completos",
      hora: "18:00",
      titulo: "Gran Banquete de Completos de Etiqueta",
      descripcion: "A las 18:00 hrs. Solemne y distinguido momento gastronómico donde nos deleitaremos con la más selecta preparación de completos al estilo de etiqueta, servidos con gran pompa y sabor."
    },
    {
      id: "cr-3",
      hora: "19:00",
      titulo: "Salir a Pedir Dulces",
      descripcion: "De 19:00 a 20:00 hrs. ¡Momento de dulces y diversión! Salir a pedir dulces con los niños y sus disfraces compartiendo risas y ricas golosinas."
    },
    {
      id: "cr-4",
      hora: "20:00",
      titulo: "Regreso al Club & Despedida",
      descripcion: "A las 20:00 hrs. Tras salir a pedir dulces, pueden volver con toda tranquilidad al club a descansar, recoger sus pertenencias, abrigarse y despedirnos con un gran abrazo."
    }
  ]
};

class CumpleStore {
  constructor() {
    this.storageKey = getActiveStorageKey();
    this.data = this.load();
  }

  getInitialTemplate() {
    return isDemoContext() 
      ? JSON.parse(JSON.stringify(DEMO_INITIAL_DATA))
      : JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.cronograma && (!parsed.cronograma.some(c => c.id === 'cr-completos') || parsed.cronograma.some(c => c.descripcion && c.descripcion.includes('cóctel')))) {
          parsed.cronograma = JSON.parse(JSON.stringify(INITIAL_DATA.cronograma));
          this.save(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error al cargar datos de localStorage:', e);
    }
    const template = this.getInitialTemplate();
    this.save(template);
    return template;
  }

  save(dataToSave = this.data) {
    try {
      this.data = dataToSave;
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent('cumple_store_updated', { detail: this.data }));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  }

  getData() {
    return this.data;
  }

  // --- MÉTODOS PARA INVITADOS ---
  getInvitados() {
    return this.data.invitados || [];
  }

  addInvitado(invitado) {
    const nuevo = {
      id: 'inv-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
      fechaRegistro: new Date().toISOString().slice(0, 16).replace('T', ' '),
      tipo: 'individual',
      nombre: '',
      familia: '',
      nombresIntegrantes: '',
      name1: '',
      name2: '',
      telefono: '',
      asistira: null, // null = pendiente, true = confirmado, false = no asiste
      adultos: 1,
      ninos: 0,
      dedicatoria: '',
      mesaId: null,
      ...invitado
    };
    this.data.invitados.unshift(nuevo);
    this.save();
    return nuevo;
  }

  updateInvitado(id, updates) {
    const idx = this.data.invitados.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data.invitados[idx] = { ...this.data.invitados[idx], ...updates };
      this.save();
      return this.data.invitados[idx];
    }
    return null;
  }

  findInvitado(code, name) {
    if (code) {
      const found = this.data.invitados.find(i => i.id === code);
      if (found) return found;
    }
    if (name) {
      const clean = name.toLowerCase().trim();
      return this.data.invitados.find(i => 
        (i.nombre && i.nombre.toLowerCase().trim() === clean) ||
        (i.familia && i.familia.toLowerCase().trim() === clean) ||
        (i.name1 && i.name1.toLowerCase().trim() === clean)
      );
    }
    return null;
  }

  deleteInvitado(id) {
    this.data.invitados = this.data.invitados.filter(i => i.id !== id);
    this.save();
  }

  // --- MÉTODOS PARA MESAS ---
  getMesas() {
    return this.data.mesas || [];
  }

  addMesa(mesa) {
    const nueva = {
      id: 'mesa-' + Date.now(),
      numero: (this.data.mesas.length || 0) + 1,
      capacidad: 8,
      ...mesa
    };
    this.data.mesas.push(nueva);
    this.save();
    return nueva;
  }

  updateMesa(id, updates) {
    const idx = this.data.mesas.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.mesas[idx] = { ...this.data.mesas[idx], ...updates };
      this.save();
      return this.data.mesas[idx];
    }
    return null;
  }

  deleteMesa(id) {
    // Desasignar invitados de esta mesa
    this.data.invitados.forEach(inv => {
      if (inv.mesaId === id) inv.mesaId = null;
    });
    this.data.mesas = this.data.mesas.filter(m => m.id !== id);
    this.save();
  }

  asignarInvitadoAMesa(invitadoId, mesaId) {
    const inv = this.data.invitados.find(i => i.id === invitadoId);
    if (inv) {
      inv.mesaId = mesaId || null;
      this.save();
      return true;
    }
    return false;
  }

  // --- MÉTODOS PARA COMIDA ---
  getComida() {
    return this.data.comida || [];
  }

  addItemComida(item) {
    const nuevo = {
      id: 'f-' + Date.now(),
      estado: 'pendiente',
      costo: 0,
      ...item
    };
    this.data.comida.push(nuevo);
    this.save();
    return nuevo;
  }

  updateItemComida(id, updates) {
    const idx = this.data.comida.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.comida[idx] = { ...this.data.comida[idx], ...updates };
      this.save();
      return this.data.comida[idx];
    }
    return null;
  }

  deleteItemComida(id) {
    this.data.comida = this.data.comida.filter(c => c.id !== id);
    this.save();
  }

  // --- MÉTODOS PARA COTILLÓN ---
  getCotillon() {
    return this.data.cotillon || [];
  }

  addItemCotillon(item) {
    const nuevo = {
      id: 'c-' + Date.now(),
      estado: 'pendiente',
      costo: 0,
      ...item
    };
    this.data.cotillon.push(nuevo);
    this.save();
    return nuevo;
  }

  updateItemCotillon(id, updates) {
    const idx = this.data.cotillon.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.cotillon[idx] = { ...this.data.cotillon[idx], ...updates };
      this.save();
      return this.data.cotillon[idx];
    }
    return null;
  }

  deleteItemCotillon(id) {
    this.data.cotillon = this.data.cotillon.filter(c => c.id !== id);
    this.save();
  }

  // --- MÉTODOS PARA CRONOGRAMA ---
  getCronograma() {
    // Sincronizar automáticamente con el itinerario oficial si tiene la versión antigua o falta el banquete de completos
    if (!this.data.cronograma || !this.data.cronograma.some(c => c.id === 'cr-completos') || this.data.cronograma.some(c => c.titulo && c.titulo.includes('la Domi')) || this.data.cronograma.some(c => c.hora === '17:00' && c.id === 'cr-2')) {
      this.data.cronograma = JSON.parse(JSON.stringify(INITIAL_DATA.cronograma));
      this.save(this.data);
    }
    return this.data.cronograma || [];
  }

  addItemCronograma(item) {
    const nuevo = {
      id: 'cr-' + Date.now(),
      ...item
    };
    this.data.cronograma.push(nuevo);
    // Ordenar cronograma por hora
    this.data.cronograma.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
    this.save();
    return nuevo;
  }

  updateItemCronograma(id, updates) {
    const idx = this.data.cronograma.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.cronograma[idx] = { ...this.data.cronograma[idx], ...updates };
      this.data.cronograma.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
      this.save();
      return this.data.cronograma[idx];
    }
    return null;
  }

  deleteItemCronograma(id) {
    this.data.cronograma = this.data.cronograma.filter(c => c.id !== id);
    this.save();
  }

  // --- REINICIAR / EXPORTAR / IMPORTAR ---
  resetToDefaults() {
    this.save(this.getInitialTemplate());
  }

  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.evento && parsed.invitados) {
        this.save(parsed);
        return true;
      }
    } catch (e) {
      console.error('JSON inválido:', e);
    }
    return false;
  }
}

// Instancia global
window.cumpleStore = new CumpleStore();