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
    tematica: "Sirenita & Bajo el Mar Pastel",
    dressCode: "¡Te espero con tu mejor disfraz!",
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
      titulo: "Conversar sobre la Domi y Comer Cositas Ricas",
      descripcion: "Inicio a las 15:00 hasta las 17:00 hrs. Bienvenida, cóctel y un lindo momento para compartir anécdotas y celebrar el primer añito de Dominique."
    },
    {
      id: "cr-2",
      hora: "17:00",
      titulo: "Cantar Cumpleaños Feliz & Apertura de Regalos",
      descripcion: "A las 17:00 hrs. Canto del cumpleaños feliz junto a la torta, apagar la velita N°1 y apertura de regalos."
    },
    {
      id: "cr-3",
      hora: "18:00",
      titulo: "Salir a Pedir Dulces",
      descripcion: "A las 18:00 hasta las 20:00 hrs. ¡Momento de disfraces y dulces de Halloween! Salir a pedir dulces con los niños."
    },
    {
      id: "cr-4",
      hora: "21:00",
      titulo: "Fin del Cumpleaños",
      descripcion: "21:00 hrs. Cierre del cumpleaños, fotos de despedida y agradecimientos."
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
        return JSON.parse(stored);
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
      disfraz: '',
      alergias: '',
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