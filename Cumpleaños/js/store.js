/**
 * store.js - Sistema de datos y persistencia compartido para el Cumpleaños
 * Conecta la invitación (index.html) y el panel del organizador (organizador.html)
 */

const STORAGE_KEY = 'cumple_domi_data_v1';

const INITIAL_DATA = {
  evento: {
    nombreCumpleanera: "Dominga",
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
  invitados: [
    {
      id: "inv-1",
      nombre: "Familia Gómez Pérez",
      telefono: "+56987654321",
      asistira: true,
      adultos: 2,
      ninos: 1,
      disfraz: "Princesa Ariel y Tritón",
      alergias: "Ninguna",
      dedicatoria: "¡Feliz primer añito Domi hermosa! Nos vemos con nuestros disfraces.",
      mesaId: "mesa-1",
      fechaRegistro: "2026-10-20 18:30"
    },
    {
      id: "inv-2",
      nombre: "Tía Marcela y Tío Carlos",
      telefono: "+56976543210",
      asistira: true,
      adultos: 2,
      ninos: 0,
      disfraz: "Piratas del Caribe",
      alergias: "Intolerancia a la lactosa",
      dedicatoria: "¡No nos perdemos este gran día por nada del mundo!",
      mesaId: "mesa-2",
      fechaRegistro: "2026-10-21 10:15"
    },
    {
      id: "inv-3",
      nombre: "Amiguitos del Jardín (Lucas)",
      telefono: "+56965432109",
      asistira: true,
      adultos: 1,
      ninos: 2,
      disfraz: "Tiburón y Pez Payaso",
      alergias: "Alergia al maní",
      dedicatoria: "¡A bailar y romper la piñata!",
      mesaId: "mesa-3",
      fechaRegistro: "2026-10-21 11:40"
    }
  ],
  mesas: [
    { id: "mesa-1", numero: 1, nombre: "Mesa Sirenas (Familia Principal)", capacidad: 8 },
    { id: "mesa-2", numero: 2, nombre: "Mesa Océano Mágico (Tíos y Primos)", capacidad: 8 },
    { id: "mesa-3", numero: 3, nombre: "Mesa Estrellas de Mar (Amigos & Niños)", capacidad: 10 },
    { id: "mesa-4", numero: 4, nombre: "Mesa Caballitos de Mar (Abuelitos)", capacidad: 6 }
  ],
  comida: [
    { id: "f-1", categoria: "Torta", item: "Torta temática Sirenita (30 personas)", cantidad: "1 unidad", estado: "encargado", costo: 45000, notas: "Sabor manjar nuez y lúcuma" },
    { id: "f-2", categoria: "Mesa Dulce", item: "Cupcakes decorados de conchitas y perlas", cantidad: "24 unidades", estado: "comprado", costo: 22000, notas: "Color lila y menta pastel" },
    { id: "f-3", categoria: "Mesa Dulce", item: "Cake pops de cola de sirena", cantidad: "30 unidades", estado: "pendiente", costo: 18000, notas: "Para mesa de niños" },
    { id: "f-4", categoria: "Salado / Coctel", item: "Empanaditas de cóctel mixtas (queso, pino, champiñón)", cantidad: "100 unidades", estado: "encargado", costo: 32000, notas: "Calentar 15 min antes" },
    { id: "f-5", categoria: "Salado / Coctel", item: "Tapaitos de ave pimentón y jamón queso", cantidad: "80 unidades", estado: "pendiente", costo: 25000, notas: "Mantener refrigerados" },
    { id: "f-6", categoria: "Salado / Coctel", item: "Pizzetas cóctel para niños", cantidad: "50 unidades", estado: "pendiente", costo: 15000, notas: "Sin cebolla" },
    { id: "f-7", categoria: "Bebidas", item: "Jugos naturales (frutilla, piña, naranja) y aguas saborizadas", cantidad: "15 litros", estado: "comprado", costo: 20000, notas: "En dispensadores de vidrio" },
    { id: "f-8", categoria: "Bebidas", item: "Bebidas gaseosas regulares y zero", cantidad: "10 botellas (3L)", estado: "comprado", costo: 26000, notas: "Coca-Cola, Sprite, Fanta" }
  ],
  cotillon: [
    { id: "c-1", categoria: "Decoración", item: "Arco orgánico de globos tonos pastel (lila, celeste, rosa, perlado)", cantidad: "1 set grande", estado: "encargado", costo: 38000, notas: "Para backdrop de fotos" },
    { id: "c-2", categoria: "Decoración", item: "Fondo telón Sirenita + luces microled", cantidad: "1 unidad", estado: "comprado", costo: 22000, notas: "Medidas 2x2m" },
    { id: "c-3", categoria: "Juegos", item: "Piñata forma Número 1 / Cola de sirena", cantidad: "1 piñata + dulces", estado: "comprado", costo: 28000, notas: "Rellena de dulces no duros y confeti" },
    { id: "c-4", categoria: "Sorpresitas", item: "Bolsitas de recuerdos temáticas con regalitos", cantidad: "25 bolsitas", estado: "pendiente", costo: 25000, notas: "Burbujeros, stickers y juguetitos marinos" },
    { id: "c-5", categoria: "Vajilla", item: "Platos, vasos, servilletas y cubiertos ecológicos pastel", cantidad: "3 paquetes c/u", estado: "comprado", costo: 16000, notas: "Diseño sirena con destellos" },
    { id: "c-6", categoria: "Cotillón", item: "Cintillos de sirena, antifaces y bonetes de fiesta", cantidad: "30 unidades", estado: "comprado", costo: 18000, notas: "Para repartir a la llegada" }
  ],
  cronograma: [
    { id: "cr-1", hora: "15:00", titulo: "Bienvenida & Recepción", descripcion: "Llegada de invitados con sus mejores disfraces, entrega de cintillos y fotos de bienvenida." },
    { id: "cr-2", hora: "15:45", titulo: "Apertura Cóctel & Candy Bar", descripcion: "Degustación de tapaditos, empanaditas, jugos naturales y cupcakes temáticos." },
    { id: "cr-3", hora: "16:30", titulo: "Juegos & Ronda Infantil", descripcion: "Bailes entretenidos, concurso de disfraces y juegos adaptados para los peques." },
    { id: "cr-4", hora: "17:30", titulo: "La Gran Piñata Marina", descripcion: "Momento esperado de romper la piñata de sirena llena de premios y sorpresas." },
    { id: "cr-5", hora: "18:15", titulo: "Cumpleaños Feliz & Torta", descripcion: "Canto de cumpleaños a Dominga, apagar la velita N°1 y corte de la torta." },
    { id: "cr-6", hora: "19:00", titulo: "Fotos de Despedida & Sorpresitas", descripcion: "Agradecimientos, entrega de bolsitas de recuerdos y cierre del evento." }
  ]
};

class CumpleStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
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
      id: 'inv-' + Date.now(),
      fechaRegistro: new Date().toISOString().slice(0, 16).replace('T', ' '),
      adultos: 1,
      ninos: 0,
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