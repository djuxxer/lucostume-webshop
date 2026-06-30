// =========================================================
// LU COSTUME — Admin panel logic
// =========================================================
(function () {
  'use strict';

  const state = {
    products: [],
    heroSlides: [],
    orders: [],
    settings: {},
    currentView: 'products',
    productImages: [], // working list of image URLs for the open product modal
    heroImage: '',
  };

  // ---------- API helper ----------
  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: 'include',
      headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Greška na serveru.');
    return data;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  function formatPrice(n) {
    return new Intl.NumberFormat('sr-RS').format(n) + ' рсд';
  }

  function formatDate(iso) {
    const d = new Date(iso.replace(' ', 'T'));
    return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
  }

  // =========================================================
  // AUTH / LOGIN
  // =========================================================
  async function checkAuth() {
    try {
      await api('/api/admin/me');
      showApp();
    } catch (e) {
      showLogin();
    }
  }

  function showLogin() {
    document.getElementById('loginScreen').hidden = false;
    document.getElementById('adminApp').hidden = true;
  }

  async function showApp() {
    document.getElementById('loginScreen').hidden = true;
    document.getElementById('adminApp').hidden = false;
    await loadAllData();
    renderCurrentView();
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('loginError');
    errorEl.hidden = true;
    const formData = new FormData(e.target);
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: formData.get('username'), password: formData.get('password') }),
      });
      showApp();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' });
    showLogin();
  });

  // =========================================================
  // NAVIGATION
  // =========================================================
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentView = btn.dataset.view;
      document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.view').forEach((v) => v.hidden = v.id !== `view-${btn.dataset.view}`);
      renderCurrentView();
    });
  });

  function renderCurrentView() {
    if (state.currentView === 'products') renderProductsTable();
    if (state.currentView === 'hero') renderHeroList();
    if (state.currentView === 'orders') renderOrdersTable();
    if (state.currentView === 'settings') renderSettingsForms();
  }

  // =========================================================
  // DATA LOADING
  // =========================================================
  async function loadAllData() {
    try {
      const [products, hero, orders, settings] = await Promise.all([
        api('/api/admin/products'),
        api('/api/admin/hero'),
        api('/api/admin/orders'),
        api('/api/admin/settings'),
      ]);
      state.products = products;
      state.heroSlides = hero;
      state.orders = orders;
      state.settings = settings;
    } catch (e) {
      console.error(e);
    }
  }

  // =========================================================
  // PRODUCTS
  // =========================================================
  function renderProductsTable() {
    const tbody = document.getElementById('productsTbody');
    const emptyMsg = document.getElementById('productsEmptyMsg');
    if (!state.products.length) {
      tbody.innerHTML = '';
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;
    tbody.innerHTML = state.products.map((p) => {
      const img = p.image || (p.images && p.images[0]) || '';
      return `
      <tr data-id="${p.id}">
        <td>${img ? `<img class="row-thumb" src="${escapeHtml(img)}">` : `<div class="row-thumb-placeholder">—</div>`}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.category || '—')}</td>
        <td>${formatPrice(p.price)}</td>
        <td><span class="status-badge ${p.active ? 'active' : 'inactive'}">${p.active ? 'Aktivan' : 'Skriven'}</span></td>
        <td class="row-actions">
          <button data-edit="${p.id}">Uredi</button>
          <button data-delete="${p.id}">Obriši</button>
        </td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openProductModal(parseInt(btn.dataset.edit)));
    });
    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.delete)));
    });
  }

  function renderProductImages() {
    const list = document.getElementById('productImagesList');
    list.innerHTML = state.productImages.map((url, idx) => `
      <div class="image-thumb-wrap ${idx === 0 ? 'is-main' : ''}" data-idx="${idx}">
        <img src="${escapeHtml(url)}">
        <button type="button" class="image-thumb-remove" data-remove-img="${idx}">&times;</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-remove-img]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.productImages.splice(parseInt(btn.dataset.removeImg), 1);
        renderProductImages();
      });
    });
  }

  function openProductModal(productId) {
    const form = document.getElementById('productForm');
    form.reset();
    document.getElementById('productFormError').hidden = true;
    const deleteBtn = document.getElementById('deleteProductBtn');

    if (productId) {
      const p = state.products.find((x) => x.id === productId);
      document.getElementById('productModalTitle').textContent = 'Uredi proizvod';
      form.elements.id.value = p.id;
      form.elements.name.value = p.name;
      form.elements.price.value = p.price;
      form.elements.category.value = p.category || '';
      form.elements.sizes.value = p.sizes || '';
      form.elements.description.value = p.description || '';
      form.elements.active.checked = !!p.active;
      form.elements.sort_order.value = p.sort_order || 0;
      state.productImages = p.images && p.images.length ? [...p.images] : (p.image ? [p.image] : []);
      deleteBtn.hidden = false;
      deleteBtn.onclick = () => deleteProduct(p.id, true);
    } else {
      document.getElementById('productModalTitle').textContent = 'Novi proizvod';
      form.elements.id.value = '';
      form.elements.active.checked = true;
      state.productImages = [];
      deleteBtn.hidden = true;
    }
    renderProductImages();
    openModal('productModalOverlay');
  }

  document.getElementById('newProductBtn').addEventListener('click', () => openProductModal(null));
  document.getElementById('productModalClose').addEventListener('click', () => closeModal('productModalOverlay'));

  document.getElementById('productImagesInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    try {
      const result = await api('/api/admin/upload-multi', { method: 'POST', body: fd });
      state.productImages.push(...result.urls);
      renderProductImages();
    } catch (err) {
      alert('Greška pri otpremanju slika: ' + err.message);
    }
    e.target.value = '';
  });

  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('productFormError');
    errorEl.hidden = true;
    const id = form.elements.id.value;
    const payload = {
      name: form.elements.name.value.trim(),
      price: parseInt(form.elements.price.value) || 0,
      category: form.elements.category.value.trim(),
      sizes: form.elements.sizes.value.trim(),
      description: form.elements.description.value.trim(),
      active: form.elements.active.checked,
      sort_order: parseInt(form.elements.sort_order.value) || 0,
      images: state.productImages,
      image: state.productImages[0] || '',
    };
    if (!payload.name || !payload.price) {
      errorEl.textContent = 'Naziv i cena su obavezni.';
      errorEl.hidden = false;
      return;
    }
    try {
      if (id) {
        await api(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      await loadAllData();
      renderProductsTable();
      closeModal('productModalOverlay');
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
  });

  async function deleteProduct(id, fromModal = false) {
    if (!confirm('Obrisati ovaj proizvod? Ova radnja se ne može poništiti.')) return;
    try {
      await api(`/api/admin/products/${id}`, { method: 'DELETE' });
      await loadAllData();
      renderProductsTable();
      if (fromModal) closeModal('productModalOverlay');
    } catch (err) {
      alert('Greška: ' + err.message);
    }
  }

  // =========================================================
  // HERO SLIDES
  // =========================================================
  function renderHeroList() {
    const wrap = document.getElementById('heroList');
    if (!state.heroSlides.length) {
      wrap.innerHTML = `<p class="table-empty">Nema dodatih hero slika. Klikni "Novi slajd" da dodaš prvi.</p>`;
      return;
    }
    wrap.innerHTML = state.heroSlides.map((h) => `
      <div class="hero-item" data-id="${h.id}">
        ${h.image ? `<img class="hero-item-thumb" src="${escapeHtml(h.image)}">` : `<div class="hero-item-thumb-placeholder">Bez slike</div>`}
        <div class="hero-item-info">
          <div class="hero-item-title">${escapeHtml(h.title || '(bez naslova)')}</div>
          <div class="hero-item-sub">${h.active ? 'Aktivan' : 'Skriven'} · redosled ${h.sort_order}</div>
        </div>
        <div class="row-actions">
          <button data-edit-hero="${h.id}">Uredi</button>
          <button data-delete-hero="${h.id}">Obriši</button>
        </div>
      </div>
    `).join('');
    wrap.querySelectorAll('[data-edit-hero]').forEach((btn) => {
      btn.addEventListener('click', () => openHeroModal(parseInt(btn.dataset.editHero)));
    });
    wrap.querySelectorAll('[data-delete-hero]').forEach((btn) => {
      btn.addEventListener('click', () => deleteHero(parseInt(btn.dataset.deleteHero)));
    });
  }

  function renderHeroImagePreview() {
    const wrap = document.getElementById('heroImagePreview');
    wrap.innerHTML = state.heroImage ? `
      <div class="image-thumb-wrap is-main">
        <img src="${escapeHtml(state.heroImage)}">
        <button type="button" class="image-thumb-remove" id="removeHeroImg">&times;</button>
      </div>
    ` : '';
    const removeBtn = document.getElementById('removeHeroImg');
    if (removeBtn) removeBtn.addEventListener('click', () => { state.heroImage = ''; renderHeroImagePreview(); });
  }

  function openHeroModal(heroId) {
    const form = document.getElementById('heroForm');
    form.reset();
    document.getElementById('heroFormError').hidden = true;
    const deleteBtn = document.getElementById('deleteHeroBtn');

    if (heroId) {
      const h = state.heroSlides.find((x) => x.id === heroId);
      document.getElementById('heroModalTitle').textContent = 'Uredi slajd';
      form.elements.id.value = h.id;
      form.elements.title.value = h.title || '';
      form.elements.subtitle.value = h.subtitle || '';
      form.elements.button_text.value = h.button_text || '';
      form.elements.button_link.value = h.button_link || '';
      form.elements.active.checked = !!h.active;
      form.elements.sort_order.value = h.sort_order || 0;
      state.heroImage = h.image || '';
      deleteBtn.hidden = false;
      deleteBtn.onclick = () => deleteHero(h.id, true);
    } else {
      document.getElementById('heroModalTitle').textContent = 'Novi hero slajd';
      form.elements.id.value = '';
      form.elements.active.checked = true;
      state.heroImage = '';
      deleteBtn.hidden = true;
    }
    renderHeroImagePreview();
    openModal('heroModalOverlay');
  }

  document.getElementById('newHeroBtn').addEventListener('click', () => openHeroModal(null));
  document.getElementById('heroModalClose').addEventListener('click', () => closeModal('heroModalOverlay'));

  document.getElementById('heroImageInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      const result = await api('/api/admin/upload', { method: 'POST', body: fd });
      state.heroImage = result.url;
      renderHeroImagePreview();
    } catch (err) {
      alert('Greška pri otpremanju slike: ' + err.message);
    }
    e.target.value = '';
  });

  document.getElementById('heroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.elements.id.value;
    const payload = {
      title: form.elements.title.value.trim(),
      subtitle: form.elements.subtitle.value.trim(),
      button_text: form.elements.button_text.value.trim(),
      button_link: form.elements.button_link.value.trim(),
      active: form.elements.active.checked,
      sort_order: parseInt(form.elements.sort_order.value) || 0,
      image: state.heroImage,
    };
    try {
      if (id) {
        await api(`/api/admin/hero/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/admin/hero', { method: 'POST', body: JSON.stringify(payload) });
      }
      await loadAllData();
      renderHeroList();
      closeModal('heroModalOverlay');
    } catch (err) {
      document.getElementById('heroFormError').textContent = err.message;
      document.getElementById('heroFormError').hidden = false;
    }
  });

  async function deleteHero(id, fromModal = false) {
    if (!confirm('Obrisati ovaj hero slajd?')) return;
    try {
      await api(`/api/admin/hero/${id}`, { method: 'DELETE' });
      await loadAllData();
      renderHeroList();
      if (fromModal) closeModal('heroModalOverlay');
    } catch (err) {
      alert('Greška: ' + err.message);
    }
  }

  // =========================================================
  // ORDERS
  // =========================================================
  const STATUS_LABELS = {
    novo: 'Novo',
    'potvrđeno': 'Potvrđeno',
    poslato: 'Poslato',
    'završeno': 'Završeno',
    otkazano: 'Otkazano',
  };

  function renderOrdersTable() {
    const tbody = document.getElementById('ordersTbody');
    const emptyMsg = document.getElementById('ordersEmptyMsg');
    if (!state.orders.length) {
      tbody.innerHTML = '';
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;
    tbody.innerHTML = state.orders.map((o) => `
      <tr data-id="${o.id}">
        <td>${escapeHtml(o.order_number)}</td>
        <td>${escapeHtml(o.customer_name)}</td>
        <td>${escapeHtml(o.phone)}</td>
        <td>${escapeHtml(o.city)}</td>
        <td>${formatPrice(o.total)}</td>
        <td>
          <select class="status-select" data-status-id="${o.id}">
            ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </td>
        <td>${formatDate(o.created_at)}</td>
        <td class="row-actions"><button data-view-order="${o.id}">Detalji</button></td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-status-id]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        try {
          await api(`/api/admin/orders/${sel.dataset.statusId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: sel.value }),
          });
          const order = state.orders.find((o) => o.id === parseInt(sel.dataset.statusId));
          if (order) order.status = sel.value;
        } catch (err) {
          alert('Greška: ' + err.message);
        }
      });
    });
    tbody.querySelectorAll('[data-view-order]').forEach((btn) => {
      btn.addEventListener('click', () => openOrderModal(parseInt(btn.dataset.viewOrder)));
    });
  }

  function openOrderModal(orderId) {
    const o = state.orders.find((x) => x.id === orderId);
    if (!o) return;
    const content = document.getElementById('orderModalContent');
    content.innerHTML = `
      <button class="modal-close" id="orderModalCloseBtn">&times;</button>
      <h3>Porudžbina ${escapeHtml(o.order_number)}</h3>
      <div class="order-detail-grid">
        <div><span>Kupac</span>${escapeHtml(o.customer_name)}</div>
        <div><span>Telefon</span>${escapeHtml(o.phone)}</div>
        <div><span>Email</span>${escapeHtml(o.email || '—')}</div>
        <div><span>Status</span>${STATUS_LABELS[o.status] || o.status}</div>
        <div><span>Adresa</span>${escapeHtml(o.address)}</div>
        <div><span>Grad</span>${escapeHtml(o.city)} ${escapeHtml(o.postal_code || '')}</div>
        <div><span>Plaćanje</span>Pouzećem</div>
        <div><span>Datum</span>${formatDate(o.created_at)}</div>
      </div>
      ${o.note ? `<div style="margin-bottom:16px;"><span style="display:block;color:var(--ink-soft);font-size:0.76rem;margin-bottom:3px;">Napomena</span>${escapeHtml(o.note)}</div>` : ''}
      <div class="order-items-list">
        ${o.items.map((i) => `
          <div class="order-item-row">
            <span>${escapeHtml(i.name)} ${i.size ? `(${escapeHtml(i.size)})` : ''} × ${i.qty}</span>
            <span>${formatPrice(i.price * i.qty)}</span>
          </div>
        `).join('')}
        <div class="order-item-row"><span>Dostava</span><span>${o.shipping_cost === 0 ? 'Besplatno' : formatPrice(o.shipping_cost)}</span></div>
        <div class="order-total-row"><span>Ukupno</span><span>${formatPrice(o.total)}</span></div>
      </div>
    `;
    content.querySelector('#orderModalCloseBtn').addEventListener('click', () => closeModal('orderModalOverlay'));
    openModal('orderModalOverlay');
  }

  // =========================================================
  // SETTINGS
  // =========================================================
  function renderSettingsForms() {
    const s = state.settings;
    const shippingForm = document.getElementById('shippingForm');
    shippingForm.elements.shipping_cost.value = s.shipping_cost || 0;
    shippingForm.elements.free_shipping_threshold.value = s.free_shipping_threshold || 0;

    const shopForm = document.getElementById('shopInfoForm');
    shopForm.elements.shop_name.value = s.shop_name || '';
    shopForm.elements.shop_email.value = s.shop_email || '';
    shopForm.elements.shop_phone.value = s.shop_phone || '';
  }

  document.getElementById('shippingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    await api('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        shipping_cost: form.elements.shipping_cost.value,
        free_shipping_threshold: form.elements.free_shipping_threshold.value,
      }),
    });
    await loadAllData();
    alert('Sačuvano!');
  });

  document.getElementById('shopInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    await api('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        shop_name: form.elements.shop_name.value,
        shop_email: form.elements.shop_email.value,
        shop_phone: form.elements.shop_phone.value,
      }),
    });
    await loadAllData();
    alert('Sačuvano!');
  });

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const msgEl = document.getElementById('passwordMsg');
    try {
      await api('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: form.elements.current_password.value,
          new_password: form.elements.new_password.value,
        }),
      });
      msgEl.style.color = 'var(--success)';
      msgEl.textContent = 'Lozinka je promenjena.';
      form.reset();
    } catch (err) {
      msgEl.style.color = 'var(--danger)';
      msgEl.textContent = err.message;
    }
  });

  // =========================================================
  // MODAL HELPERS
  // =========================================================
  function openModal(id) { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
  });

  // =========================================================
  // INIT
  // =========================================================
  checkAuth();
})();
