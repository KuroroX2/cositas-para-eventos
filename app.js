// ==========================================================================
// COSITAS PARA EVENTOS - JAVASCRIPT LOGIC & INTERACTIVITY
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initCategoryFilters();
  initWeddingDemo();
  initBudgetCalculator();
  initCountdown();
});

// --------------------------------------------------------------------------
// 1. Category Filtering
// --------------------------------------------------------------------------
function initCategoryFilters() {
  const tabs = document.querySelectorAll('.category-tabs .tab-btn');
  const cards = document.querySelectorAll('.feature-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selectedCat = tab.getAttribute('data-category');

      cards.forEach(card => {
        const itemCats = card.getAttribute('data-cat') || '';
        if (selectedCat === 'all' || itemCats.includes(selectedCat)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// --------------------------------------------------------------------------
// 2. Wedding Live Demo Interactions (Yimmy & Eve)
// --------------------------------------------------------------------------
function initWeddingDemo() {
  // Demo Tabs
  const demoTabs = document.querySelectorAll('.demo-tab-btn');
  const demoContents = document.querySelectorAll('.demo-tab-content');

  demoTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      demoTabs.forEach(b => b.classList.remove('active'));
      demoContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.getAttribute('data-target');
      const content = document.getElementById(target);
      if (content) content.classList.add('active');
    });
  });

  // RSVP Form Demo Submission
  const rsvpForm = document.getElementById('demoRsvpForm');
  const successMsg = document.getElementById('rsvpSuccessMsg');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('guestName').value;
      const diet = document.getElementById('guestDiet').value;

      if (successMsg) {
        successMsg.innerHTML = `🎉 <strong>¡Asistencia confirmada, ${name}!</strong> Preferencia: ${diet}. Los datos se guardarían en Supabase en tiempo real.`;
        successMsg.style.display = 'block';
      }
      rsvpForm.reset();
    });
  }

  // Photo Quest Simulation Upload
  const questBtns = document.querySelectorAll('.simulate-upload');
  const questSuccess = document.getElementById('questUploadSuccess');

  questBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const questName = btn.getAttribute('data-quest');
      btn.innerText = '✅ ¡Cazada!';
      btn.style.background = '#10b981';
      btn.style.color = 'white';

      if (questSuccess) {
        questSuccess.innerHTML = `✨ <strong>¡Foto cazada para el desafío "${questName}"!</strong> Se ha sumado al muro colectivo y al ranking del evento.`;
        questSuccess.style.display = 'block';
      }
    });
  });
}

// --------------------------------------------------------------------------
// 3. Countdown Timer (Mock for Nov 28, 2026)
// --------------------------------------------------------------------------
function initCountdown() {
  const targetDate = new Date('November 28, 2026 17:00:00').getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('countDays');
      const hEl = document.getElementById('countHours');
      const mEl = document.getElementById('countMins');
      const sEl = document.getElementById('countSecs');

      if (dEl) dEl.innerText = days;
      if (hEl) hEl.innerText = String(hours).padStart(2, '0');
      if (mEl) mEl.innerText = String(mins).padStart(2, '0');
      if (sEl) sEl.innerText = String(secs).padStart(2, '0');
    }
  }

  update();
  setInterval(update, 1000);
}

// --------------------------------------------------------------------------
// 4. Interactive Budget Calculator
// --------------------------------------------------------------------------
function initBudgetCalculator() {
  const guestsRange = document.getElementById('guestsRange');
  const guestsDisplay = document.getElementById('guestsDisplay');
  const summaryGuests = document.getElementById('summaryGuests');
  const checkboxes = document.querySelectorAll('.service-check-card input[type="checkbox"]');
  const calcItemsList = document.getElementById('calcItemsList');
  const totalPriceDisplay = document.getElementById('totalPriceDisplay');
  const btnWhatsappQuote = document.getElementById('btnWhatsappQuote');

  function calculate() {
    const numGuests = parseInt(guestsRange.value, 10);
    guestsDisplay.innerText = `${numGuests} invitados`;
    if (summaryGuests) summaryGuests.innerText = numGuests;

    let total = 0;
    let selectedItems = [];

    checkboxes.forEach(cb => {
      const parent = cb.closest('.service-check-card');
      if (cb.checked) {
        parent.classList.add('checked');
        const name = cb.getAttribute('data-name');
        let itemPrice = 0;

        if (cb.hasAttribute('data-price')) {
          itemPrice = parseInt(cb.getAttribute('data-price'), 10);
        } else if (cb.hasAttribute('data-price-per-guest')) {
          const perGuest = parseInt(cb.getAttribute('data-price-per-guest'), 10);
          itemPrice = perGuest * numGuests;
        }

        total += itemPrice;
        selectedItems.push({
          name: name,
          price: itemPrice
        });
      } else {
        parent.classList.remove('checked');
      }
    });

    // Update Summary List
    if (calcItemsList) {
      if (selectedItems.length === 0) {
        calcItemsList.innerHTML = '<li style="color: var(--text-dim);">No has seleccionado ningún servicio aún.</li>';
      } else {
        calcItemsList.innerHTML = selectedItems.map(item => `
          <li>
            <span>${item.name}</span>
            <span>$${item.price.toLocaleString('es-CL')}</span>
          </li>
        `).join('');
      }
    }

    // Update Total Display
    if (totalPriceDisplay) {
      totalPriceDisplay.innerText = `$${total.toLocaleString('es-CL')} CLP`;
    }

    // Update WhatsApp Button Link
    if (btnWhatsappQuote) {
      const itemsText = selectedItems.map(i => `• ${i.name} ($${i.price.toLocaleString('es-CL')} CLP)`).join('%0A');
      const whatsappMsg = `¡Hola Cositas para Eventos! Me gustaría cotizar un pack para mi evento con ${numGuests} invitados:%0A%0A${itemsText}%0A%0ATotal Estimado: $${total.toLocaleString('es-CL')} CLP.%0A¿Tienen disponibilidad?`;
      btnWhatsappQuote.onclick = () => {
        window.open(`https://wa.me/56912345678?text=${whatsappMsg}`, '_blank');
      };
    }
  }

  if (guestsRange) {
    guestsRange.addEventListener('input', calculate);
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', calculate);
  });

  // Quick select buttons from cards
  document.querySelectorAll('.select-service-btn, .select-product-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const serviceType = btn.getAttribute('data-service') || btn.getAttribute('data-product');
      if (serviceType === 'invitacion-web') {
        document.getElementById('checkWeb').checked = true;
      } else if (serviceType === 'caza-fotos') {
        document.getElementById('checkQuest').checked = true;
      } else if (serviceType === 'playlist-dj') {
        document.getElementById('checkMusic').checked = true;
      } else if (serviceType === 'cartas-pokemon') {
        document.getElementById('checkCards').checked = true;
      } else if (serviceType === 'tazos-retro') {
        document.getElementById('checkTazos').checked = true;
      } else if (serviceType === 'tarjetas-burbujas') {
        document.getElementById('checkBubbles').checked = true;
      } else if (serviceType === 'juegos-mesa') {
        document.getElementById('checkGames').checked = true;
      }
      calculate();
    });
  });

  // Initial calculation
  calculate();
}
