/**
 * EVELYN & YIMMY — NUESTRO MATRIMONIO
 * Álbum Social Colaborativo en Tiempo Real con SUPABASE CLOUD
 * Subida inmediata, Sincronización Global, Likes y Comentarios en Vivo
 */

const CLOUD_STORAGE_KEY = 'eve_yimmy_wedding_album_cache_v7';
const LIKED_PHOTOS_KEY = 'eve_yimmy_liked_photos_v7';

let activeCategoryFilter = 'all';
let weddingPhotos = [];
let activePhotoForLightbox = null;

// Expose to window for admin panel
window.weddingPhotos = weddingPhotos;

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initUploadModal();
  initLightboxSocial();
  startCloudPolling();
});

/* ==========================================================================
   1. GALLERY INITIALIZATION & SUPABASE FETCH
   ========================================================================== */
function initGallery() {
  loadLocalCache();
  renderGallery();
  initFilterButtons();
  fetchCloudPhotos();
}

function loadLocalCache() {
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        weddingPhotos = parsed;
        return;
      }
    }
  } catch (e) {}
  weddingPhotos = [];
}

function saveLocalCache() {
  try {
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(weddingPhotos));
  } catch (e) {}
}

function initFilterButtons() {
  const filterBtns = document.querySelectorAll('#gallery-filters .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategoryFilter = btn.getAttribute('data-filter') || 'all';
      renderGallery();
    });
  });
}

function renderGallery() {
  window.weddingPhotos = weddingPhotos;
  renderMainGuestGallery();
  renderChallengeGallery();
}

function renderMainGuestGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const filtered = activeCategoryFilter === 'all'
    ? weddingPhotos
    : weddingPhotos.filter(p => p.category === activeCategoryFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <i class="ri-camera-lens-line" style="font-size: 2.5rem; color: var(--gold-primary); display: block; margin-bottom: 0.5rem;"></i>
        <p style="font-size: 0.95rem; font-weight: 600;">Aún no hay fotos en esta categoría.</p>
        <p style="font-size: 0.8rem; margin-top: 0.3rem;">¡Sé el primero en subir una foto y compartirla con todos!</p>
      </div>
    `;
    return;
  }

  const likedIds = getLikedPhotoIds();
  grid.innerHTML = filtered.map(photo => renderPhotoCardHtml(photo, likedIds)).join('');
}

function renderChallengeGallery() {
  const challengeGrid = document.getElementById('challenge-gallery-grid');
  if (!challengeGrid) return;

  const challengePhotos = weddingPhotos.filter(p => p.category === 'desafios');

  if (challengePhotos.length === 0) {
    challengeGrid.innerHTML = `
      <div class="gallery-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem 1rem; color: var(--text-muted); background: rgba(0,0,0,0.02); border: 1px dashed var(--border-gold); border-radius: var(--border-radius-card);">
        <i class="ri-camera-lens-line" style="font-size: 2.2rem; color: var(--gold-primary); display: block; margin-bottom: 0.5rem;"></i>
        <p style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">Aún no se han subido fotos para los desafíos fotográficos.</p>
        <p style="font-size: 0.78rem; margin-top: 0.3rem;">¡Cumple uno de los 12 desafíos de arriba, sube tu foto y compite por el premio de las 20:00 hrs! 🏆✨</p>
      </div>
    `;
    return;
  }

  const likedIds = getLikedPhotoIds();
  challengeGrid.innerHTML = challengePhotos.map(photo => renderPhotoCardHtml(photo, likedIds)).join('');
}

function renderPhotoCardHtml(photo, likedIds) {
  const isLiked = likedIds.includes(photo.id);
  const likesCount = photo.likes || 0;
  const commentsCount = (photo.comments || []).length;
  const authorName = photo.author || photo.author_name || 'Invitado';
  const categoryLabel = getCategoryBadgeLabel(photo.category);
  const photoUrl = photo.url || photo.photo_url || '';

  return `
    <div class="photo-card" data-photo-id="${photo.id}">
      <div class="photo-card-media" onclick="openLightboxForPhoto('${photo.id}')">
        <img src="${escapeHtml(photoUrl)}" alt="Foto por ${escapeHtml(authorName)}" loading="lazy">
        <span class="photo-badge-cat">${categoryLabel}</span>
      </div>
      <div class="photo-card-info">
        <div class="photo-meta">
          <span class="photo-author"><i class="ri-user-heart-line"></i> ${escapeHtml(authorName)}</span>
          <span class="photo-time">${formatRelativeTime(photo.timestamp || photo.created_at)}</span>
        </div>
        ${photo.caption ? `<p class="photo-caption" onclick="openLightboxForPhoto('${photo.id}')">${escapeHtml(photo.caption)}</p>` : ''}
        <div class="photo-social-actions">
          <button class="btn-like-social ${isLiked ? 'liked' : ''}" onclick="togglePhotoLike(event, '${photo.id}')">
            <i class="${isLiked ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
            <span class="like-counter">${likesCount}</span>
          </button>
          <button class="btn-comment-social" onclick="openLightboxForPhoto('${photo.id}')">
            <i class="ri-chat-1-line"></i>
            <span>${commentsCount}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function getCategoryBadgeLabel(cat) {
  switch (cat) {
    case 'invitados': return '👥 Invitados';
    case 'preparativos': return '✨ Preparativos';
    case 'ceremonia': return '💍 Ceremonia';
    case 'fiesta': return '🎉 Fiesta & Pasto';
    case 'desafios': return '🎯 Reto Cumplido';
    default: return '📸 Momento';
  }
}

/* ==========================================================================
   2. LIKES SYSTEM
   ========================================================================== */
function getLikedPhotoIds() {
  try {
    const raw = localStorage.getItem(LIKED_PHOTOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLikedPhotoIds(ids) {
  try {
    localStorage.setItem(LIKED_PHOTOS_KEY, JSON.stringify(ids));
  } catch (e) {}
}

window.togglePhotoLike = async function(event, photoId) {
  if (event) event.stopPropagation();

  const photo = weddingPhotos.find(p => p.id === photoId);
  if (!photo) return;

  let likedIds = getLikedPhotoIds();
  const isCurrentlyLiked = likedIds.includes(photoId);

  if (isCurrentlyLiked) {
    photo.likes = Math.max(0, (photo.likes || 1) - 1);
    likedIds = likedIds.filter(id => id !== photoId);
  } else {
    photo.likes = (photo.likes || 0) + 1;
    likedIds.push(photoId);
  }

  saveLikedPhotoIds(likedIds);
  saveLocalCache();
  renderGallery();
  updateLightboxLikeUI();

  // Supabase update
  if (window.dbSupabase) {
    window.dbSupabase.likePhoto(photoId, photo.likes).catch(() => {});
  }
};

/* ==========================================================================
   3. LIGHTBOX & SOCIAL COMMENTS
   ========================================================================== */
function initLightboxSocial() {
  const modal = document.getElementById('lightbox-modal');
  const closeBtns = [
    document.getElementById('lightbox-close'),
    document.getElementById('btn-close-lightbox')
  ];
  const likeBtn = document.getElementById('btn-lightbox-like');
  const commentForm = document.getElementById('lightbox-comment-form');

  closeBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', closeLightbox);
    }
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      const uploadModal = document.getElementById('upload-photo-modal');
      if (uploadModal) {
        uploadModal.classList.remove('active');
        uploadModal.style.display = 'none';
        document.body.style.overflow = '';
      }
      const adminModal = document.getElementById('admin-modal');
      if (adminModal) {
        adminModal.classList.remove('active');
        adminModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }
  });

  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      if (activePhotoForLightbox) {
        window.togglePhotoLike(null, activePhotoForLightbox.id);
      }
    });
  }

  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activePhotoForLightbox) return;

      const authorInput = document.getElementById('comment-author-input');
      const textInput = document.getElementById('comment-text-input');

      const author = (authorInput.value || '').trim() || 'Invitado Especial';
      const text = (textInput.value || '').trim();

      if (!text) return;

      if (!activePhotoForLightbox.comments) {
        activePhotoForLightbox.comments = [];
      }

      const newComment = {
        id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        author: author,
        text: text,
        timestamp: Date.now()
      };

      activePhotoForLightbox.comments.push(newComment);
      textInput.value = '';

      saveLocalCache();
      renderGallery();
      renderLightboxComments();
      updateLightboxLikeUI();

      if (window.dbSupabase) {
        window.dbSupabase.addComment(activePhotoForLightbox.id, activePhotoForLightbox.comments, newComment).catch(() => {});
      }
    });
  }
}

window.openLightboxForPhoto = function (photoId) {
  const photo = weddingPhotos.find(p => p.id === photoId);
  if (!photo) return;

  activePhotoForLightbox = photo;

  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const authorEl = document.getElementById('lightbox-author');
  const timeEl = document.getElementById('lightbox-time');
  const descEl = document.getElementById('lightbox-desc');
  const nameInput = document.getElementById('comment-author-input');

  if (img) img.src = photo.url || photo.photo_url || '';
  if (authorEl) authorEl.textContent = photo.author || photo.author_name || 'Invitado';
  if (timeEl) timeEl.textContent = formatRelativeTime(photo.timestamp || photo.created_at);
  if (descEl) descEl.textContent = photo.caption || '';

  if (nameInput) {
    nameInput.value = '';
  }

  updateLightboxLikeUI();
  renderLightboxComments();

  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
  document.body.style.overflow = 'hidden';
};

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
  document.body.style.overflow = '';
  activePhotoForLightbox = null;
}

function updateLightboxLikeUI() {
  if (!activePhotoForLightbox) return;
  const countEl = document.getElementById('lightbox-like-count');
  const icon = document.getElementById('lightbox-like-icon');
  const likeBtn = document.getElementById('btn-lightbox-like');
  const commentsTotalEl = document.getElementById('lightbox-comments-total');

  const likedIds = getLikedPhotoIds();
  const isLiked = likedIds.includes(activePhotoForLightbox.id);
  const likesCount = activePhotoForLightbox.likes || 0;
  const commentsCount = (activePhotoForLightbox.comments || []).length;

  if (countEl) countEl.textContent = likesCount;
  if (commentsTotalEl) {
    commentsTotalEl.textContent = `${commentsCount} ${commentsCount === 1 ? 'comentario' : 'comentarios'}`;
  }

  if (likeBtn && icon) {
    if (isLiked) {
      likeBtn.classList.add('liked');
      icon.className = 'ri-heart-fill';
    } else {
      likeBtn.classList.remove('liked');
      icon.className = 'ri-heart-line';
    }
  }
}

function renderLightboxComments() {
  const listEl = document.getElementById('comments-list');
  if (!listEl || !activePhotoForLightbox) return;

  const comments = activePhotoForLightbox.comments || [];

  if (comments.length === 0) {
    listEl.innerHTML = `
      <div class="comments-empty-state" style="text-align: center; padding: 2rem 1rem; color: #888;">
        <i class="ri-chat-heart-line" style="font-size: 2rem; color: #527A50; display: block; margin-bottom: 0.3rem;"></i>
        <p style="font-size: 0.85rem;">Aún no hay comentarios. ¡Sé el primero en dejar una dedicatoria!</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = comments.map(c => {
    const author = (typeof c === 'object' ? (c.author || c.author_name || c.name) : 'Invitado') || 'Invitado';
    const text = (typeof c === 'object' ? (c.text || c.comment || c.message) : c) || '';
    const time = (typeof c === 'object' ? (c.timestamp || c.created_at) : null);

    return `
      <div class="comment-item" style="padding: 0.6rem 0; border-bottom: 1px solid rgba(82, 122, 80, 0.1);">
        <div class="comment-item-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
          <span class="comment-author-name" style="font-weight: 700; font-size: 0.82rem; color: #243525;">
            <i class="ri-chat-heart-line" style="color: #527A50;"></i> ${escapeHtml(author)}
          </span>
          <span class="comment-time" style="font-size: 0.72rem; color: #777;">${formatRelativeTime(time)}</span>
        </div>
        <p class="comment-item-body" style="margin: 0; font-size: 0.85rem; color: #333; line-height: 1.35;">${escapeHtml(text)}</p>
      </div>
    `;
  }).join('');

  listEl.scrollTop = listEl.scrollHeight;
}

/* ==========================================================================
   4. PHOTO UPLOAD MODAL & INSTANT SYNC
   ========================================================================== */
function initUploadModal() {
  const openBtn = document.getElementById('btn-open-upload');
  const challengeBtn = document.getElementById('btn-challenge-upload');
  const modal = document.getElementById('upload-photo-modal');
  const closeBtn = document.getElementById('btn-close-upload-modal');
  const fileInput = document.getElementById('photo-modal-file-input');
  const dropzone = document.getElementById('upload-dropzone');
  const placeholder = document.getElementById('dropzone-placeholder');
  const previewBox = document.getElementById('dropzone-preview');
  const previewImg = document.getElementById('preview-image');
  const changeBtn = document.getElementById('btn-change-photo');
  const form = document.getElementById('upload-photo-form');
  const authorInput = document.getElementById('upload-author');

  let selectedFile = null;

  function openModal(defaultCategory = 'invitados') {
    selectedFile = null;
    if (form) form.reset();
    if (previewBox) previewBox.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    if (authorInput) {
      authorInput.value = '';
    }
    const catSelect = document.getElementById('upload-category');
    if (catSelect) catSelect.value = defaultCategory;

    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
    }
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', () => openModal('invitados'));
  if (challengeBtn) challengeBtn.addEventListener('click', () => openModal('desafios'));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== changeBtn && !changeBtn.contains(e.target)) {
        fileInput.click();
      }
    });
  }

  if (changeBtn && fileInput) {
    changeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      selectedFile = file;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (previewImg) previewImg.src = event.target.result;
        if (placeholder) placeholder.style.display = 'none';
        if (previewBox) previewBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!selectedFile) {
        alert('Por favor selecciona una foto para subir.');
        return;
      }

      const author = (document.getElementById('upload-author').value || '').trim() || 'Invitado Especial';
      const caption = (document.getElementById('upload-caption').value || '').trim();
      const category = document.getElementById('upload-category').value || 'invitados';

      const submitBtn = document.getElementById('btn-submit-photo');
      const progressBox = document.getElementById('upload-progress-box');

      if (submitBtn) submitBtn.style.display = 'none';
      if (progressBox) progressBox.style.display = 'flex';

      try {
        // 1. Comprimir imagen a tamaño optimizado (~70KB) para que viaje a Supabase al instante
        const { blob, dataUrl } = await compressImageFile(selectedFile, 800, 0.72);

        // 2. Crear objeto foto y mostrarlo de INMEDIATO
        const tempId = 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const newPhoto = {
          id: tempId,
          url: dataUrl,
          author: author,
          category: category,
          caption: caption,
          likes: 0,
          timestamp: Date.now(),
          comments: []
        };

        weddingPhotos.unshift(newPhoto);
        saveLocalCache();
        renderGallery();

        // 3. Sincronizar en Supabase Cloud para que se vea en todos los dispositivos
        if (window.dbSupabase) {
          const record = await window.dbSupabase.uploadPhoto(blob, author, category, caption, dataUrl);
          if (record && record.id) {
            newPhoto.id = record.id;
            if (record.photo_url) newPhoto.url = record.photo_url;
            saveLocalCache();
            renderGallery();
          }
        }

        closeModal();
        alert('¡Foto publicada con éxito! Ya está disponible en la nube para todos los invitados.');

        const targetSection = category === 'desafios'
          ? document.getElementById('desafios')
          : document.getElementById('galeria');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }

      } catch (error) {
        console.error('Upload error:', error);
        alert('Foto subida con éxito en tu dispositivo. Sincronizando con la nube...');
      } finally {
        if (submitBtn) submitBtn.style.display = 'inline-flex';
        if (progressBox) progressBox.style.display = 'none';
      }
    });
  }
}

function compressImageFile(file, maxWidth = 800, quality = 0.72) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob((blob) => {
          resolve({ blob: blob || file, dataUrl });
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve({ blob: file, dataUrl: event.target.result });
    };
    reader.onerror = () => resolve({ blob: file, dataUrl: '' });
  });
}

/* ==========================================================================
   5. REALTIME SUPABASE SYNC (Fetch & Polling)
   ========================================================================== */
async function fetchCloudPhotos() {
  if (!window.dbSupabase) return;
  try {
    const rawPhotos = await window.dbSupabase.getPhotos();
    if (rawPhotos && rawPhotos.length > 0) {
      weddingPhotos = rawPhotos.map(p => ({
        id: p.id,
        url: p.photo_url,
        author: p.author_name,
        category: p.category,
        caption: p.caption,
        likes: p.likes || 0,
        timestamp: new Date(p.created_at).getTime(),
        comments: p.comments || []
      }));
      saveLocalCache();
      renderGallery();
    }
  } catch (e) {
    console.warn('Supabase photos fetch:', e);
  }
}

function startCloudPolling() {
  setInterval(() => {
    fetchCloudPhotos();
  }, 10000); // Polling cada 10 segundos
}

/* ==========================================================================
   6. UTILITY FUNCTIONS
   ========================================================================== */
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Hace un momento';
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const diffSec = Math.floor((Date.now() - time) / 1000);

  if (diffSec < 60) return 'Hace un momento';
  if (diffSec < 3600) return `Hace ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `Hace ${Math.floor(diffSec / 3600)} h`;
  const days = Math.floor(diffSec / 86400);
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
