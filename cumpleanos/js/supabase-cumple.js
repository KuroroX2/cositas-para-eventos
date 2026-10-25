/**
 * supabase-cumple.js - Sincronización en la Nube con Supabase para el Cumpleaños
 * Permite que los papás colaboren en tiempo real desde diferentes computadores y celulares.
 */

const CUMPLE_SUPABASE_URL = 'https://igzxrpfghohdzcsqekir.supabase.co';
const CUMPLE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenhycGZnaG9oZHpjc3Fla2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTM2ODksImV4cCI6MjEwMzU4OTY4OX0.5iCkpu-usMMGeUfrPUpaWuJJmLEXALePauKKE-U2AgI';
const STORAGE_BUCKET = 'wedding-photos';

class CumpleSupabaseClient {
  constructor() {
    this.url = CUMPLE_SUPABASE_URL;
    this.key = CUMPLE_SUPABASE_ANON_KEY;
    this.client = null;
    this.initClient();
  }

  initClient() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this.client = window.supabase.createClient(this.url, this.key);
      } catch (e) {
        console.warn('Error inicializando Supabase SDK:', e);
      }
    }
  }

  getSlug(isDemo = false) {
    return isDemo ? 'cumple-demo' : 'cumple-domi';
  }

  getStoragePath(slug) {
    return `cumpleanos/${slug}/state.json`;
  }

  getPublicUrl(slug) {
    return `${this.url}/storage/v1/object/public/${STORAGE_BUCKET}/${this.getStoragePath(slug)}?t=${Date.now()}`;
  }

  /**
   * Descarga el estado más reciente desde Supabase Storage
   */
  async downloadState(isDemo = false) {
    const slug = this.getSlug(isDemo);
    try {
      const res = await fetch(this.getPublicUrl(slug), {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn('[Supabase Cloud] No se pudo descargar estado desde la nube:', e);
    }
    return null;
  }

  /**
   * Sube el estado completo a Supabase Storage con sobrescritura (upsert)
   */
  async uploadState(isDemo = false, data = {}) {
    const slug = this.getSlug(isDemo);
    const path = this.getStoragePath(slug);
    const payload = JSON.stringify({
      ...data,
      _cloud_synced_at: new Date().toISOString()
    });

    // Método 1: vía fetch directo a Storage API
    try {
      const endpoint = `${this.url}/storage/v1/object/${STORAGE_BUCKET}/${path}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'x-upsert': 'true'
        },
        body: payload
      });

      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.warn('[Supabase Cloud] Error en uploadState fetch:', e);
    }

    // Método 2: vía SDK si está cargado
    if (this.client && this.client.storage) {
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        const { error } = await this.client.storage
          .from(STORAGE_BUCKET)
          .upload(path, blob, { upsert: true });
        if (!error) return true;
      } catch (err) {
        console.warn('[Supabase Cloud] Error en uploadState SDK:', err);
      }
    }

    return false;
  }

  /**
   * Guarda confirmaciones de invitados (RSVP) en la tabla relacional de Supabase
   */
  async recordRsvp(rsvpData) {
    try {
      const endpoint = `${this.url}/rest/v1/rsvps`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          event_slug: 'cumple-domi',
          name1: rsvpData.nombre || 'Invitado',
          attendance1: !!rsvpData.asistira,
          phone: rsvpData.telefono || '',
          message: rsvpData.dedicatoria || '',
          dietary1: `Adultos: ${rsvpData.adultos || 1}, Niños: ${rsvpData.ninos || 0}`
        })
      });
    } catch (e) {
      console.warn('[Supabase Cloud] Error registrando RSVP en tabla:', e);
    }
  }
}

// Instancia global
window.cumpleSupabase = new CumpleSupabaseClient();
