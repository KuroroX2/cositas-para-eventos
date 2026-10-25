/**
 * supabase-cumple.js - Sincronización en la Nube con Supabase para el Cumpleaños
 * Utiliza la tabla de base de datos relacional de Supabase con permisos de lectura y actualización
 */

const CUMPLE_SUPABASE_URL = 'https://igzxrpfghohdzcsqekir.supabase.co';
const CUMPLE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenhycGZnaG9oZHpjc3Fla2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTM2ODksImV4cCI6MjEwMzU4OTY4OX0.5iCkpu-usMMGeUfrPUpaWuJJmLEXALePauKKE-U2AgI';

class CumpleSupabaseClient {
  constructor() {
    this.url = CUMPLE_SUPABASE_URL;
    this.key = CUMPLE_SUPABASE_ANON_KEY;
  }

  getStoreSlug(isDemo = false) {
    return isDemo ? 'cumple-demo-store' : 'cumple-domi-store';
  }

  /**
   * Descarga el estado guardado en Supabase (tabla photos / JSONB)
   */
  async downloadState(isDemo = false) {
    const slug = this.getStoreSlug(isDemo);
    try {
      const endpoint = `${this.url}/rest/v1/photos?event_slug=eq.${slug}&select=*&order=created_at.desc&limit=1`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0].comments) {
          const state = rows[0].comments;
          // Validar si es un objeto con estado real
          if (state && typeof state === 'object' && (Array.isArray(state.comida) || Array.isArray(state.invitados) || state.evento)) {
            return state;
          }
        }
      }
    } catch (e) {
      console.warn('[Supabase Cloud] Error al descargar estado:', e);
    }
    return null;
  }

  /**
   * Sube el estado a Supabase con actualización segura (UPSERT / PATCH)
   */
  async uploadState(isDemo = false, data = {}) {
    const slug = this.getStoreSlug(isDemo);
    const syncTime = data._cloud_synced_at || new Date().toISOString();
    const payload = {
      ...data,
      _cloud_synced_at: syncTime
    };

    try {
      // 1. Buscar si ya existe el registro del estado
      const checkEndpoint = `${this.url}/rest/v1/photos?event_slug=eq.${slug}&select=id&limit=1`;
      const checkRes = await fetch(checkEndpoint, {
        method: 'GET',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Accept': 'application/json'
        }
      });

      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (Array.isArray(existing) && existing.length > 0 && existing[0].id) {
          // 2. Actualizar registro existente con PATCH
          const updateEndpoint = `${this.url}/rest/v1/photos?id=eq.${existing[0].id}`;
          const patchRes = await fetch(updateEndpoint, {
            method: 'PATCH',
            headers: {
              'apikey': this.key,
              'Authorization': `Bearer ${this.key}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              comments: payload,
              category: 'cloud_sync',
              caption: `cumple_sync_${Date.now()}`
            })
          });

          if (patchRes.ok) {
            console.log('[Supabase Cloud] Estado actualizado exitosamente en la nube (PATCH).');
            return true;
          }
        }
      }

      // 3. Si no existe, crear con POST
      const postEndpoint = `${this.url}/rest/v1/photos`;
      const postRes = await fetch(postEndpoint, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          event_slug: slug,
          author_name: 'CumpleStore',
          category: 'cloud_sync',
          caption: `cumple_init_${Date.now()}`,
          photo_url: 'https://placeholder.test/organizador.json',
          comments: payload
        })
      });

      if (postRes.ok) {
        console.log('[Supabase Cloud] Estado inicial creado exitosamente en la nube (POST).');
        return true;
      }
    } catch (e) {
      console.warn('[Supabase Cloud] Error al subir estado a Supabase:', e);
    }

    return false;
  }
}

// Instancia global
window.cumpleSupabase = new CumpleSupabaseClient();
