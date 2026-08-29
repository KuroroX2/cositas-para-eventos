/**
 * EVELYN & YIMMY — CONEXIÓN SUPABASE CLOUD
 * Cliente centralizado para Base de Datos y Almacenamiento
 */

const SUPABASE_URL = 'https://igzxrpfghohdzcsqekir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenhycGZnaG9oZHpjc3Fla2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTM2ODksImV4cCI6MjEwMzU4OTY4OX0.5iCkpu-usMMGeUfrPUpaWuJJmLEXALePauKKE-U2AgI';

// Inicializar cliente Supabase de forma dinámica
function getSupabaseClient() {
  if (window._sbClient) return window._sbClient;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window._sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return window._sbClient;
  }
  return null;
}

window.dbSupabase = {
  get client() {
    return getSupabaseClient();
  },

  // ==========================================
  // 1. INVITACIONES OFICIALES
  // ==========================================
  async getInvitations() {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Error al obtener invitaciones:', e);
      return [];
    }
  },

  async createInvitation(invData) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('invitations')
        .insert([{
          id: invData.id,
          event_slug: 'eve-y-yimmy',
          pases: invData.pases,
          name1: invData.name1,
          name2: invData.name2 || '',
          phone: invData.phone || ''
        }])
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (e) {
      console.error('Error al crear invitación en Supabase:', e);
      return null;
    }
  },

  // ==========================================
  // 2. CONFIRMACIONES RSVP
  // ==========================================
  async getRsvps() {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Error al obtener RSVPs:', e);
      return [];
    }
  },

  async saveRsvp(rsvpData) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      // Eliminar registros anteriores para esta misma invitación o código para evitar duplicados
      if (rsvpData.invCode) {
        await client.from('rsvps').delete().eq('invitation_id', rsvpData.invCode);
      } else if (rsvpData.code) {
        await client.from('rsvps').delete().eq('pass_code', rsvpData.code);
      }

      const { data, error } = await client
        .from('rsvps')
        .insert([{
          event_slug: 'eve-y-yimmy',
          invitation_id: rsvpData.invCode || null,
          pass_code: rsvpData.code || 'EY-2026',
          name1: rsvpData.name,
          attendance1: rsvpData.attendance === 'si' || rsvpData.attendance1 === 'si',
          dietary1: rsvpData.dietary || 'Ninguna',
          name2: rsvpData.name2 || '',
          attendance2: rsvpData.attendance2 === 'si',
          dietary2: rsvpData.dietary2 || 'Ninguna',
          phone: rsvpData.phone || '',
          song_request: rsvpData.song || '',
          message: rsvpData.message || ''
        }]);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error al registrar RSVP:', e);
      return false;
    }
  },

  async updateRsvpAttendanceManual(invitationIdOrCode, isAttendanceYes, name1, name2, pases) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { data } = await client.from('rsvps')
        .select('*')
        .or(`invitation_id.eq.${invitationIdOrCode},pass_code.eq.${invitationIdOrCode}`);

      if (data && data.length > 0) {
        const { error } = await client.from('rsvps')
          .update({
            attendance1: isAttendanceYes,
            attendance2: (pases === 2 || name2) ? isAttendanceYes : false
          })
          .eq('id', data[0].id);
        if (error) throw error;
      } else {
        const { error } = await client.from('rsvps').insert([{
          event_slug: 'eve-y-yimmy',
          invitation_id: invitationIdOrCode,
          pass_code: 'EY-' + Math.floor(1000 + Math.random() * 9000),
          name1: name1 || 'Invitado',
          name2: name2 || '',
          attendance1: isAttendanceYes,
          attendance2: (pases === 2 || name2) ? isAttendanceYes : false
        }]);
        if (error) throw error;
      }
      return true;
    } catch (e) {
      console.error('Error actualizando asistencia manual:', e);
      return false;
    }
  },

  async deleteRsvpFromCloud(idOrCode) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('rsvps').delete().or(`id.eq.${idOrCode},invitation_id.eq.${idOrCode},pass_code.eq.${idOrCode}`);
      return true;
    } catch (e) {
      console.error('Error al eliminar RSVP en nube:', e);
      return false;
    }
  },

  // ==========================================
  // 3. ÁLBUM SOCIAL Y FOTOS
  // ==========================================
  async getPhotos() {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Error al obtener fotos:', e);
      return [];
    }
  },

  async uploadPhoto(fileOrBlob, guestName, category, caption, fallbackDataUrl) {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase no inicializado');
    
    let finalPhotoUrl = fallbackDataUrl || '';

    // Intento 1: Subir al Storage Bucket 'wedding-photos' si está disponible
    try {
      const cleanExt = (fileOrBlob.name ? fileOrBlob.name.split('.').pop() : 'jpg') || 'jpg';
      const filePath = `eve-y-yimmy/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
      
      const { data: storageData, error: uploadError } = await client.storage
        .from('wedding-photos')
        .upload(filePath, fileOrBlob, {
          contentType: fileOrBlob.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadError && storageData) {
        const { data: publicUrlData } = client.storage
          .from('wedding-photos')
          .getPublicUrl(filePath);
        if (publicUrlData && publicUrlData.publicUrl) {
          finalPhotoUrl = publicUrlData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn('Storage fallback to direct insert:', storageErr);
    }

    if (!finalPhotoUrl && fallbackDataUrl) {
      finalPhotoUrl = fallbackDataUrl;
    }

    // Registrar en tabla photos
    const { data: photoRecord, error: dbError } = await client
      .from('photos')
      .insert([{
        event_slug: 'eve-y-yimmy',
        photo_url: finalPhotoUrl,
        author_name: guestName || 'Invitado Especial',
        category: category || 'invitados',
        caption: caption || '',
        likes: 0,
        comments: []
      }])
      .select();

    if (dbError) {
      console.error('Error insert photo in Supabase:', dbError);
      throw dbError;
    }
    return photoRecord ? photoRecord[0] : null;
  },

  async likePhoto(photoId, currentLikes) {
    const client = getSupabaseClient();
    if (!client) return (currentLikes || 0) + 1;
    try {
      const newLikes = (currentLikes || 0) + 1;
      const { error } = await client
        .from('photos')
        .update({ likes: newLikes })
        .eq('id', photoId);
      if (error) throw error;
      return newLikes;
    } catch (e) {
      console.warn('Error al dar like:', e);
      return (currentLikes || 0) + 1;
    }
  },

  async addComment(photoId, currentComments, newComment) {
    const client = getSupabaseClient();
    if (!client) return currentComments;
    try {
      const updated = [...(currentComments || []), newComment];
      const { error } = await client
        .from('photos')
        .update({ comments: updated })
        .eq('id', photoId);
      if (error) throw error;
      return updated;
    } catch (e) {
      console.warn('Error al agregar comentario:', e);
      return currentComments;
    }
  }
};
