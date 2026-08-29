/**
 * EVELYN & YIMMY — CONEXIÓN SUPABASE CLOUD
 * Cliente centralizado para Base de Datos y Almacenamiento
 */

const SUPABASE_URL = 'https://igzxrpfghohdzcsqekir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenhycGZnaG9oZHpjc3Fla2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTM2ODksImV4cCI6MjEwMzU4OTY4OX0.5iCkpu-usMMGeUfrPUpaWuJJmLEXALePauKKE-U2AgI';

// Inicializar cliente Supabase
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

window.dbSupabase = {
  client: supabase,

  // ==========================================
  // 1. INVITACIONES OFICIALES
  // ==========================================
  async getInvitations() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
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

  async createInvitation(inv) {
    if (!supabase) return false;
    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert([{
          id: inv.id,
          event_slug: 'eve-y-yimmy',
          pases: inv.pases || 1,
          name1: inv.name1,
          name2: inv.name2 || '',
          phone: inv.phone || ''
        }]);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error al guardar invitación:', e);
      return false;
    }
  },

  // ==========================================
  // 2. CONFIRMACIONES RSVP
  // ==========================================
  async getRsvps() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
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
    if (!supabase) return false;
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .insert([{
          event_slug: 'eve-y-yimmy',
          invitation_id: rsvpData.invCode || null,
          pass_code: rsvpData.code || 'EY-2026',
          name1: rsvpData.name,
          attendance1: rsvpData.attendance === 'si',
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

  // ==========================================
  // 3. ÁLBUM SOCIAL Y FOTOS
  // ==========================================
  async getPhotos() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
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
    if (!supabase) throw new Error('Supabase no inicializado');
    
    let finalPhotoUrl = fallbackDataUrl || '';

    // Intento 1: Subir al Storage Bucket 'wedding-photos'
    try {
      const cleanExt = (fileOrBlob.name ? fileOrBlob.name.split('.').pop() : 'jpg') || 'jpg';
      const filePath = `eve-y-yimmy/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
      
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(filePath, fileOrBlob, {
          contentType: fileOrBlob.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadError && storageData) {
        const { data: publicUrlData } = supabase.storage
          .from('wedding-photos')
          .getPublicUrl(filePath);
        if (publicUrlData && publicUrlData.publicUrl) {
          finalPhotoUrl = publicUrlData.publicUrl;
        }
      } else {
        console.warn('Storage upload notice, using DataURL fallback:', uploadError);
      }
    } catch (storageErr) {
      console.warn('Storage upload error, using fallback:', storageErr);
    }

    if (!finalPhotoUrl && fallbackDataUrl) {
      finalPhotoUrl = fallbackDataUrl;
    }

    // Registrar en tabla photos
    const { data: photoRecord, error: dbError } = await supabase
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

    if (dbError) throw dbError;
    return photoRecord ? photoRecord[0] : null;
  },

  async likePhoto(photoId, currentLikes) {
    if (!supabase) return currentLikes + 1;
    try {
      const newLikes = (currentLikes || 0) + 1;
      const { error } = await supabase
        .from('photos')
        .update({ likes: newLikes })
        .eq('id', photoId);
      if (error) throw error;
      return newLikes;
    } catch (e) {
      console.warn('Error al dar like:', e);
      return currentLikes + 1;
    }
  },

  async addComment(photoId, currentComments, newComment) {
    if (!supabase) return currentComments;
    try {
      const updated = [...(currentComments || []), newComment];
      const { error } = await supabase
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
