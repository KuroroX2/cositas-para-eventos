/**
 * store.js - Sistema de datos y persistencia compartido para el Cumpleaños
 * Conecta la invitación (index.html) y el panel del organizador (organizador.html)
 */

const STORAGE_KEY = 'cumple_domi_data_v2';

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
      titulo: "Gran Banquete de Completos de Gala",
      descripcion: "A las 18:00 hrs. Solemne y distinguido momento gastronómico donde nos deleitaremos con la más selecta preparación de completos al estilo de gala, servidos con gran pompa y sabor."
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
    this.data = this.load();
  }

  load() {
    try {
      // Limpiar versiones anteriores que contenían datos de ejemplo
      if (localStorage.getItem('cumple_domi_data_v1')) {
        localStorage.removeItem('cumple_domi_data_v1');
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sincronizar cronograma actualizado si tiene hitos anteriores, conservando intactos todos los invitados
        if (parsed.cronograma && (!parsed.cronograma.some(c => c.id === 'cr-completos') || parsed.cronograma.some(c => c.descripcion && c.descripcion.includes('cóctel')))) {
          parsed.cronograma = JSON.parse(JSON.stringify(INITIAL_DATA.cronograma));
          this.save(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error al cargar datos de localStorage:', e);
    }
    // Si no hay datos, inicializamos con los valores por defecto
    this.save(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  save(dataToSave = this.data) {
    try {
      this.data = dataToSave;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
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
    this.save(JSON.parse(JSON.stringify(INITIAL_DATA)));
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