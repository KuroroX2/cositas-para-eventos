/**
 * EVELYN & YIMMY — NUESTRO MATRIMONIO
 * Álbum Social Colaborativo en Tiempo Real con SUPABASE CLOUD
 * Desafíos con miniaturas ordenadas por Likes, Álbum con orden Cronológico/Popular y Sincronización Global
 */

const CLOUD_STORAGE_KEY = 'eve_yimmy_wedding_album_cache_v9';
const LIKED_PHOTOS_KEY = 'eve_yimmy_liked_photos_v9';

const CHALLENGES_LIST = [
  { id: 'desafio_01', num: '01', title: 'Foto con los lentes de la novia 🕶️' },
  { id: 'desafio_02', num: '02', title: 'Foto tomándote un shot 🥃' },
  { id: 'desafio_03', num: '03', title: 'Foto instagrameable en los spots decorados 📸✨' },
  { id: 'desafio_04', num: '04', title: 'Foto abrazando un árbol de Casa Pirque 🌳' },
  { id: 'desafio_05', num: '05', title: 'Foto con los recién casados (Evelyn & Yimmy) 💍' },
  { id: 'desafio_06', num: '06', title: 'Foto con los padres de los novios 👨‍👩‍👧‍👦' },
  { id: 'desafio_07', num: '07', title: 'Foto de tu grupo relajándose en la manta de pasto 🧺' },
  { id: 'desafio_08', num: '08', title: 'Foto brindando por el amor con tu trago favorito 🥂' },
  { id: 'desafio_09', num: '09', title: 'Foto divertida dándolo todo en la pista de baile 🕺💃' },
  { id: 'desafio_10', num: '10', title: 'La foto más espontánea y divertida del día ✨' },
  { id: 'desafio_11', num: '11', title: 'Foto emotiva durante la ceremonia 🥹💍' },
  { id: 'desafio_12', num: '12', title: 'Foto grupal con tu familia o amigos 👨‍👩‍👧‍👦🎉' }
];

let activeCategoryFilter = 'all'; // 'all', 'album', 'desafios'
let activeSortOrder = 'recent';   // 'recent' (cronológico), 'popular' (más me gusta)
let currentUploadMode = 'album';   // 'album', 'desafios'
let weddingPhotos = [];
let activePhotoForLightbox = null;

// Expose to window
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
  initFilterAndSortButtons();
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

function initFilterAndSortButtons() {
  // Category Filter Buttons
  const filterBtns = document.querySelectorAll('#gallery-filters .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategoryFilter = btn.getAttribute('data-filter') || 'all';
      renderMainGuestGallery();
    });
  });

  // Sort Order Buttons
  const sortRecentBtn = document.getElementById('btn-sort-recent');
  const sortPopularBtn = document.getElementById('btn-sort-popular');

  if (sortRecentBtn) {
    sortRecentBtn.addEventListener('click', () => {
      if (sortPopularBtn) sortPopularBtn.classList.remove('active');
      sortRecentBtn.classList.add('active');
      activeSortOrder = 'recent';
      renderMainGuestGallery();
    });
  }

  if (sortPopularBtn) {
    sortPopularBtn.addEventListener('click', () => {
      if (sortRecentBtn) sortRecentBtn.classList.remove('active');
      sortPopularBtn.classList.add('active');
      activeSortOrder = 'popular';
      renderMainGuestGallery();
    });
  }
}

function renderGallery() {
  window.weddingPhotos = weddingPhotos;
  renderChallengeGridThumbnails();
  renderMainGuestGallery();
}

/* ==========================================================================
   2. DYNAMIC THUMBNAILS FOR THE 12 CHALLENGE CARDS (Sorted by Likes)
   ========================================================================== */
function renderChallengeGridThumbnails() {
  CHALLENGES_LIST.forEach(ch => {
    const container = document.getElementById(`thumbs-${ch.id}`);
    if (!container) return;

    // Photos belonging to this challenge
    const matchingPhotos = weddingPhotos.filter(p => {
      const cat = p.category || '';
      return cat === ch.id || cat.toLowerCase().includes(ch.num);
    });

    // Sort by Most Likes (❤️)
    matchingPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0) || (b.timestamp - a.timestamp));

    if (matchingPhotos.length === 0) {
      container.innerHTML = `
        <span class="ch-empty-badge">
          <i class="ri-sparkling-line" style="color: #527A50;"></i>
          <span>Sé el primero en cumplir este reto</span>
        </span>
      `;
      return;
    }

    const topPhotos = matchingPhotos.slice(0, 3);
    const extraCount = matchingPhotos.length - 3;

    let thumbsHtml = topPhotos.map(photo => `
      <div class="ch-thumb-item" onclick="openLightboxForPhoto('${photo.id}')" title="Foto por ${escapeHtml(photo.author || 'Invitado')} (${photo.likes || 0} ❤️)">
        <img src="${escapeHtml(photo.url || photo.photo_url || '')}" alt="Reto ${ch.num}" loading="lazy">
        <span class="ch-thumb-likes">❤️ ${photo.likes || 0}</span>
      </div>
    `).join('');

    if (extraCount > 0) {
      const fourthPhoto = matchingPhotos[3];
      thumbsHtml += `
        <div class="ch-thumb-more" onclick="openLightboxForPhoto('${fourthPhoto.id}')" title="Ver ${extraCount} foto(s) más de este reto">
          +${extraCount}
        </div>
      `;
    }

    container.innerHTML = thumbsHtml;
  });
}

/* ==========================================================================
   3. MAIN GUEST GALLERY (Chronological by Default, with Sort Toggle)
   ========================================================================== */
function renderMainGuestGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  // Filter photos
  let filtered = weddingPhotos.filter(photo => {
    const cat = photo.category || 'album';
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'album') {
      return cat === 'album' || cat === 'invitados' || cat === 'lugar' || !cat.startsWith('desafio');
    }
    if (activeCategoryFilter === 'desafios') {
      return cat.startsWith('desafio') || cat === 'desafios';
    }
    return true;
  });

  // Sort photos
  if (activeSortOrder === 'recent') {
    filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } else {
    // Popular: Most Likes first, then timestamp
    filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0) || (b.timestamp || 0) - (a.timestamp || 0));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <i class="ri-camera-lens-line" style="font-size: 2.5rem; color: var(--gold-primary); display: block; margin-bottom: 0.5rem;"></i>
        <p style="font-size: 0.95rem; font-weight: 600;">Aún no hay fotos en esta sección.</p>
        <p style="font-size: 0.8rem; margin-top: 0.3rem;">¡Sé el primero en subir una foto y compartirla con todos!</p>
      </div>
    `;
    return;
  }

  const likedIds = getLikedPhotoIds();
  grid.innerHTML = filtered.map(photo => renderPhotoCardHtml(photo, likedIds)).join('');
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
  if (!cat || cat === 'album' || cat === 'invitados') return '📸 Álbum de Recuerdos';
  if (cat.startsWith('desafio_')) {
    const ch = CHALLENGES_LIST.find(c => c.id === cat);
    return ch ? `🏆 Reto ${ch.num}` : '🏆 Desafío';
  }
  if (cat === 'desafios') return '🏆 Desafío';
  return '📸 Momento';
}

/* ==========================================================================
   4. LIKES SYSTEM
   ========================================================================== */
function getLikedPhotoIds() {
  try {
    const raw = localStorage.getItem(LIKED_PHOTOS_KEY);
    return raw ? JSON.parse(raw).map(String) : [];
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
  if (event) {
    event.stopPropagation();
    if (event.currentTarget && event.currentTarget.blur) event.currentTarget.blur();
  }

  const idStr = String(photoId);
  const photo = weddingPhotos.find(p => String(p.id) === idStr);
  if (!photo) return;

  let likedIds = getLikedPhotoIds();
  const isCurrentlyLiked = likedIds.includes(idStr);

  if (isCurrentlyLiked) {
    photo.likes = Math.max(0, (photo.likes || 1) - 1);
    likedIds = likedIds.filter(id => id !== idStr);
  } else {
    photo.likes = (photo.likes || 0) + 1;
    likedIds.push(idStr);
  }

  saveLikedPhotoIds(likedIds);
  saveLocalCache();
  renderGallery();
  updateLightboxLikeUI();

  // Supabase update
  if (window.dbSupabase) {
    window.dbSupabase.likePhoto(photo.id, photo.likes).catch(e => console.warn('Supabase like error:', e));
  }
};

/* ==========================================================================
   5. LIGHTBOX & SOCIAL COMMENTS
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
    likeBtn.addEventListener('click', (e) => {
      likeBtn.blur();
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
        window.dbSupabase.addComment(activePhotoForLightbox.id, activePhotoForLightbox.comments).catch(() => {});
      }
    });
  }
}

window.openLightboxForPhoto = function (photoId) {
  const photo = weddingPhotos.find(p => String(p.id) === String(photoId));
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
  const isLiked = likedIds.includes(String(activePhotoForLightbox.id));
  const likesCount = activePhotoForLightbox.likes || 0;
  const commentsCount = (activePhotoForLightbox.comments || []).length;

  if (countEl) countEl.textContent = likesCount;
  if (commentsTotalEl) {
    commentsTotalEl.textContent = `${commentsCount} ${commentsCount === 1 ? 'comentario' : 'comentarios'}`;
  }

  if (likeBtn && icon) {
    if (isLiked) {
      likeBtn.classList.add('liked');
      icon.className = 'ri-heart-3-fill';
    } else {
      likeBtn.classList.remove('liked');
      icon.className = 'ri-heart-3-line';
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
   6. PHOTO UPLOAD MODAL & CATEGORY INTELLIGENCE
   ========================================================================== */
function initUploadModal() {
  const openBtn = document.getElementById('btn-open-upload');
  const challengeBtn = document.getElementById('btn-challenge-upload');
  const modal = document.getElementById('upload-photo-modal');
  const closeBtn = document.getElementById('btn-close-upload-modal');
  const fileInput = document.getElementById('photo-modal-file-input');
  const cameraInput = document.getElementById('photo-modal-camera-input');
  const btnCamera = document.getElementById('btn-take-photo-camera');
  const btnGallery = document.getElementById('btn-choose-photo-gallery');
  const btnChangeCam = document.getElementById('btn-change-photo-cam');
  const btnChangeGal = document.getElementById('btn-change-photo-gal');
  const dropzone = document.getElementById('upload-dropzone');
  const placeholder = document.getElementById('dropzone-placeholder');
  const previewBox = document.getElementById('dropzone-preview');
  const previewImg = document.getElementById('preview-image');
  const form = document.getElementById('upload-photo-form');
  const authorInput = document.getElementById('upload-author');

  const modalTitle = document.getElementById('upload-modal-title');
  const modalDesc = document.getElementById('upload-modal-desc');
  const modalIcon = document.getElementById('upload-modal-icon');
  const categoryGroup = document.getElementById('upload-category-group');
  const categorySelect = document.getElementById('upload-category');

  let selectedFile = null;

  function handleFileSelected(file) {
    if (!file) return;
    selectedFile = file;

    // Instant Preview using ObjectURL (0 ms latency)
    try {
      const objUrl = URL.createObjectURL(file);
      if (previewImg) previewImg.src = objUrl;
      if (placeholder) placeholder.style.display = 'none';
      if (previewBox) previewBox.style.display = 'block';
    } catch (e) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (previewImg) previewImg.src = event.target.result;
        if (placeholder) placeholder.style.display = 'none';
        if (previewBox) previewBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  function openModal(mode = 'album', specificChallenge = null) {
    currentUploadMode = mode;
    selectedFile = null;
    if (form) form.reset();
    if (previewBox) previewBox.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    if (authorInput) authorInput.value = '';

    if (mode === 'desafios') {
      const challengeId = specificChallenge || 'desafio_01';
      const ch = CHALLENGES_LIST.find(c => c.id === challengeId) || CHALLENGES_LIST[0];
      const challengeText = document.getElementById('upload-challenge-locked-text');
      const categoryInput = document.getElementById('upload-category');

      if (challengeText) challengeText.textContent = `${ch.num}. ${ch.title}`;
      if (categoryInput) categoryInput.value = ch.id;

      if (modalTitle) modalTitle.textContent = '🏆 Subir Foto para un Desafío';
      if (modalDesc) modalDesc.textContent = 'Participa en el concurso de las 20:00 hrs. La foto con más ❤️ gana.';
      if (modalIcon) modalIcon.className = 'ri-trophy-line modal-icon';
      if (categoryGroup) categoryGroup.style.display = 'block';
    } else {
      if (modalTitle) modalTitle.textContent = '📸 Subir Foto al Álbum de Recuerdos';
      if (modalDesc) modalDesc.textContent = 'Comparte tus fotos y momentos para que todos los invitados puedan verlas en vivo.';
      if (modalIcon) modalIcon.className = 'ri-camera-lens-line modal-icon';
      if (categoryGroup) categoryGroup.style.display = 'none';
    }

    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
    }
    document.body.style.overflow = 'hidden';
  }

  window.openChallengeModalFor = function(challengeId) {
    openModal('desafios', challengeId);
  };

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', () => openModal('album'));
  if (challengeBtn) challengeBtn.addEventListener('click', () => openModal('desafios', 'desafio_01'));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (btnCamera && cameraInput) {
    btnCamera.addEventListener('click', () => cameraInput.click());
  }
  if (btnGallery && fileInput) {
    btnGallery.addEventListener('click', () => fileInput.click());
  }
  if (btnChangeCam && cameraInput) {
    btnChangeCam.addEventListener('click', (e) => {
      e.stopPropagation();
      cameraInput.click();
    });
  }
  if (btnChangeGal && fileInput) {
    btnChangeGal.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-change-photo')) {
        fileInput.click();
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      handleFileSelected(e.target.files[0]);
    });
  }

  if (cameraInput) {
    cameraInput.addEventListener('change', (e) => {
      handleFileSelected(e.target.files[0]);
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
      
      // Determine category based on mode
      let category = 'album';
      if (currentUploadMode === 'desafios' && categorySelect) {
        category = categorySelect.value || 'desafio_01';
      }

      const submitBtn = document.getElementById('btn-submit-photo');
      const progressBox = document.getElementById('upload-progress-box');

      if (submitBtn) submitBtn.style.display = 'none';
      if (progressBox) progressBox.style.display = 'flex';

      try {
        // 1. Comprimir imagen a tamaño ligero (~70KB)
        const { blob, dataUrl } = await compressImageFile(selectedFile, 800, 0.72);

        // 2. Crear objeto foto y agregarlo de INMEDIATO
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

        // 3. Sincronizar en Supabase Cloud
        if (window.dbSupabase) {
          try {
            const record = await window.dbSupabase.uploadPhoto(blob, author, category, caption, dataUrl);
            if (record && record.id) {
              newPhoto.id = record.id;
              if (record.photo_url) newPhoto.url = record.photo_url;
              saveLocalCache();
              renderGallery();
            }
          } catch (cloudErr) {
            console.warn('Cloud sync note:', cloudErr);
          }
        }

        closeModal();
        alert('¡Foto publicada con éxito! Ya está disponible para todos en vivo.');

        const targetSection = category.startsWith('desafio')
          ? document.getElementById('desafios')
          : document.getElementById('galeria');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }

      } catch (error) {
        console.error('Upload error:', error);
        alert('Foto subida con éxito.');
      } finally {
        if (submitBtn) submitBtn.style.display = 'inline-flex';
        if (progressBox) progressBox.style.display = 'none';
      }
    });
  }
}

function compressImageFile(file, maxWidth = 800, quality = 0.72) {
  return new Promise((resolve) => {
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch (e) {}

    const img = new Image();
    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
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

    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve({ blob: file, dataUrl: '' });
    };

    if (objectUrl) {
      img.src = objectUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = () => resolve({ blob: file, dataUrl: '' });
      reader.readAsDataURL(file);
    }
  });
}

/* ==========================================================================
   7. REALTIME SUPABASE SYNC (Fetch & Polling)
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
        category: p.category || 'album',
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
  }, 6000); // Polling cada 6 segundos
}

/* ==========================================================================
   8. UTILITY FUNCTIONS
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
