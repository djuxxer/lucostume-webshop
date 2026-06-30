// =========================================================
// LU COSTUME — Shop frontend logic
// =========================================================
(function () {
  'use strict';

  const state = {
    products: [],
    heroSlides: [],
    cart: [], // {id, name, price, qty, size, image}
    settings: { shipping_cost: 350, free_shipping_threshold: 15000 },
    currentHeroIndex: 0,
    activeCategory: 'all',
  };

  const CART_KEY = 'lucostume_cart';

  // ---------- Utilities ----------
  function formatPrice(n) {
    return new Intl.NumberFormat('sr-RS').format(n) + ' рсд';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch (e) {}
  }
  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) state.cart = JSON.parse(raw);
    } catch (e) { state.cart = []; }
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Greška na serveru.');
    return data;
  }

  // =========================================================
  // HERO SLIDER
  // =========================================================
  function renderHero() {
    const track = document.getElementById('heroTrack');
    const dotsWrap = document.getElementById('heroDots');
    if (!state.heroSlides.length) {
      track.innerHTML = `
        <div class="hero-slide no-image">
          <div class="hero-slide-bg"></div>
          <div class="hero-content">
            <div class="hero-content-inner">
              <h1>Kvalitetni, udobni i moderni kostimi koji ističu vaš stil i pokret.</h1>
              <a href="#products" class="btn btn-primary">Pogledaj kolekciju</a>
            </div>
          </div>
        </div>`;
      dotsWrap.innerHTML = '';
      return;
    }

    track.innerHTML = state.heroSlides.map((slide) => `
      <div class="hero-slide ${slide.image ? '' : 'no-image'}">
        <div class="hero-slide-bg" style="${slide.image ? `background-image:url('${escapeHtml(slide.image)}')` : ''}"></div>
        <div class="hero-content">
          <div class="hero-content-inner">
            ${slide.title ? `<h1>${escapeHtml(slide.title)}</h1>` : ''}
            ${slide.subtitle ? `<p>${escapeHtml(slide.subtitle)}</p>` : ''}
            ${slide.button_text ? `<a href="${escapeHtml(slide.button_link || '#products')}" class="btn btn-primary">${escapeHtml(slide.button_text)}</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    if (state.heroSlides.length > 1) {
      dotsWrap.innerHTML = state.heroSlides.map((_, i) =>
        `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slajd ${i + 1}"></button>`
      ).join('');
      dotsWrap.querySelectorAll('.hero-dot').forEach((dot) => {
        dot.addEventListener('click', () => goToHeroSlide(parseInt(dot.dataset.index)));
      });
      startHeroAutoplay();
    } else {
      dotsWrap.innerHTML = '';
    }
  }

  function goToHeroSlide(index) {
    state.currentHeroIndex = index;
    const track = document.getElementById('heroTrack');
    track.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === index));
  }

  let heroInterval = null;
  function startHeroAutoplay() {
    if (heroInterval) clearInterval(heroInterval);
    heroInterval = setInterval(() => {
      const next = (state.currentHeroIndex + 1) % state.heroSlides.length;
      goToHeroSlide(next);
    }, 6000);
  }

  // =========================================================
  // PRODUCTS
  // =========================================================
  function renderCategoryFilter() {
    const wrap = document.getElementById('categoryFilter');
    const cats = [...new Set(state.products.map((p) => p.category).filter(Boolean))];
    if (cats.length < 2) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = [`<button class="cat-pill active" data-cat="all">Sve</button>`]
      .concat(cats.map((c) => `<button class="cat-pill" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`))
      .join('');
    wrap.querySelectorAll('.cat-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.dataset.cat;
        wrap.querySelectorAll('.cat-pill').forEach((b) => b.classList.toggle('active', b === btn));
        renderProducts();
      });
    });
  }

  function getMainImage(p) {
    if (p.image) return p.image;
    if (p.images && p.images.length) return p.images[0];
    return '';
  }

  function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('productsEmpty');
    const filtered = state.activeCategory === 'all'
      ? state.products
      : state.products.filter((p) => p.category === state.activeCategory);

    if (!filtered.length) {
      grid.innerHTML = '';
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    grid.innerHTML = filtered.map((p) => {
      const img = getMainImage(p);
      return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-img-wrap ${img ? '' : 'no-img'}" data-quickview="${p.id}">
          ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy">` : `<span>${escapeHtml(p.name)}</span>`}
          <button class="quick-view-btn" data-quickview="${p.id}">Brzi pregled</button>
        </div>
        <div class="product-info">
          ${p.category ? `<span class="product-cat">${escapeHtml(p.category)}</span>` : ''}
          <span class="product-name">${escapeHtml(p.name)}</span>
          <span class="product-price">${formatPrice(p.price)}</span>
          <div class="product-actions">
            <button class="add-to-cart-btn" data-add="${p.id}">Dodaj u korpu</button>
          </div>
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('[data-quickview]').forEach((el) => {
      el.addEventListener('click', () => openQuickView(parseInt(el.dataset.quickview)));
    });
    grid.querySelectorAll('[data-add]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = state.products.find((p) => p.id === parseInt(el.dataset.add));
        if (!product) return;
        const sizes = (product.sizes || '').split(',').map((s) => s.trim()).filter(Boolean);
        addToCart(product, sizes[0] || '');
        el.textContent = 'Dodato ✓';
        el.classList.add('added');
        setTimeout(() => { el.textContent = 'Dodaj u korpu'; el.classList.remove('added'); }, 1400);
      });
    });
  }

  // =========================================================
  // QUICK VIEW MODAL
  // =========================================================
  function openQuickView(productId) {
    const p = state.products.find((x) => x.id === productId);
    if (!p) return;
    const img = getMainImage(p);
    const sizes = (p.sizes || '').split(',').map((s) => s.trim()).filter(Boolean);
    let selectedSize = sizes[0] || '';

    const content = document.getElementById('quickViewContent');
    content.innerHTML = `
      <button class="modal-close" id="qvClose" aria-label="Zatvori">&times;</button>
      <div class="qv-layout">
        <div class="qv-image">${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}">` : ''}</div>
        <div class="qv-info">
          ${p.category ? `<span class="product-cat">${escapeHtml(p.category)}</span>` : ''}
          <h3>${escapeHtml(p.name)}</h3>
          <span class="product-price">${formatPrice(p.price)}</span>
          ${p.description ? `<p class="qv-desc">${escapeHtml(p.description)}</p>` : ''}
          ${sizes.length ? `
            <div class="qv-sizes" id="qvSizes">
              ${sizes.map((s, i) => `<button class="qv-size-btn ${i === 0 ? 'active' : ''}" data-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
            </div>` : ''}
          <button class="add-to-cart-btn" id="qvAddBtn">Dodaj u korpu</button>
        </div>
      </div>
    `;
    content.querySelector('#qvClose').addEventListener('click', closeAllModals);
    content.querySelectorAll('.qv-size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedSize = btn.dataset.size;
        content.querySelectorAll('.qv-size-btn').forEach((b) => b.classList.toggle('active', b === btn));
      });
    });
    content.querySelector('#qvAddBtn').addEventListener('click', () => {
      addToCart(p, selectedSize);
      const btn = content.querySelector('#qvAddBtn');
      btn.textContent = 'Dodato ✓';
      setTimeout(() => closeAllModals(), 700);
    });

    openModal('quickViewOverlay');
  }

  // =========================================================
  // CART
  // =========================================================
  function addToCart(product, size) {
    const img = getMainImage(product);
    const existing = state.cart.find((i) => i.id === product.id && i.size === size);
    if (existing) {
      existing.qty = Math.min(20, existing.qty + 1);
    } else {
      state.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1, size, image: img });
    }
    saveCart();
    renderCart();
    updateCartCount();
    openCart();
  }

  function updateCartCount() {
    const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById('cartCount').textContent = count;
  }

  function getCartSubtotal() {
    return state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getShippingCost(subtotal) {
    if (subtotal === 0) return 0;
    if (subtotal >= state.settings.free_shipping_threshold) return 0;
    return state.settings.shipping_cost;
  }

  function renderCart() {
    const wrap = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    if (!state.cart.length) {
      wrap.innerHTML = `<p class="cart-empty">Korpa je prazna.<br>Dodaj kostim iz kolekcije.</p>`;
      footer.style.display = 'none';
      return;
    }
    footer.style.display = 'block';

    wrap.innerHTML = state.cart.map((item, idx) => `
      <div class="cart-item" data-idx="${idx}">
        ${item.image ? `<img class="cart-item-img" src="${escapeHtml(item.image)}" alt="">` : `<div class="cart-item-img"></div>`}
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          ${item.size ? `<div class="cart-item-meta">Veličina: ${escapeHtml(item.size)}</div>` : ''}
          <div class="cart-item-row">
            <div class="qty-control">
              <button class="qty-btn" data-action="dec" data-idx="${idx}">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
            </div>
            <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
          </div>
          <div class="cart-item-remove" data-action="remove" data-idx="${idx}">Ukloni</div>
        </div>
      </div>
    `).join('');

    wrap.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        const action = el.dataset.action;
        if (action === 'inc') state.cart[idx].qty = Math.min(20, state.cart[idx].qty + 1);
        if (action === 'dec') {
          state.cart[idx].qty -= 1;
          if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
        }
        if (action === 'remove') state.cart.splice(idx, 1);
        saveCart();
        renderCart();
        updateCartCount();
      });
    });

    const subtotal = getCartSubtotal();
    const shipping = getShippingCost(subtotal);
    document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
    document.getElementById('cartShipping').textContent = shipping === 0 ? 'Besplatno' : formatPrice(shipping);
    document.getElementById('cartTotal').textContent = formatPrice(subtotal + shipping);
  }

  function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
  }
  function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  }

  // =========================================================
  // MODALS (generic)
  // =========================================================
  function openModal(id) {
    document.getElementById(id).classList.add('open');
  }
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('open'));
  }

  // =========================================================
  // CHECKOUT
  // =========================================================
  function renderCheckoutSummary() {
    const subtotal = getCartSubtotal();
    const shipping = getShippingCost(subtotal);
    document.getElementById('checkoutSummary').innerHTML = `
      <div class="cart-line"><span>Proizvodi (${state.cart.reduce((s, i) => s + i.qty, 0)})</span><span>${formatPrice(subtotal)}</span></div>
      <div class="cart-line"><span>Dostava (pouzećem)</span><span>${shipping === 0 ? 'Besplatno' : formatPrice(shipping)}</span></div>
      <div class="cart-line cart-total"><span>Ukupno za naplatu</span><span>${formatPrice(subtotal + shipping)}</span></div>
    `;
  }

  async function submitOrder(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('checkoutError');
    const submitBtn = document.getElementById('checkoutSubmit');
    errorEl.hidden = true;

    if (!state.cart.length) {
      errorEl.textContent = 'Korpa je prazna.';
      errorEl.hidden = false;
      return;
    }

    const formData = new FormData(form);
    const payload = {
      customer_name: formData.get('customer_name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      city: formData.get('city'),
      postal_code: formData.get('postal_code'),
      note: formData.get('note'),
      items: state.cart.map((i) => ({ id: i.id, qty: i.qty, size: i.size })),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Slanje porudžbine...';

    try {
      const result = await api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
      state.cart = [];
      saveCart();
      renderCart();
      updateCartCount();
      closeCart();
      closeAllModals();
      document.getElementById('successOrderNumber').textContent = result.order_number;
      openModal('successOverlay');
      form.reset();
    } catch (err) {
      errorEl.textContent = err.message || 'Došlo je do greške. Pokušajte ponovo.';
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Potvrdi porudžbinu (plaćanje pouzećem)';
    }
  }

  // =========================================================
  // DATA LOADING
  // =========================================================
  async function loadData() {
    try {
      const [products, hero, settings] = await Promise.all([
        api('/api/products'),
        api('/api/hero'),
        api('/api/settings/public'),
      ]);
      state.products = products;
      state.heroSlides = hero;
      state.settings = settings;
    } catch (e) {
      console.error('Greška pri učitavanju podataka:', e);
    }
  }

  // =========================================================
  // EVENT BINDINGS
  // =========================================================
  function bindEvents() {
    document.getElementById('burgerBtn').addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      const btn = document.getElementById('burgerBtn');
      const isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });
    document.querySelectorAll('.main-nav a').forEach((a) => {
      a.addEventListener('click', () => document.getElementById('mainNav').classList.remove('open'));
    });

    document.getElementById('cartToggle').addEventListener('click', openCart);
    document.getElementById('cartClose').addEventListener('click', closeCart);
    document.getElementById('cartOverlay').addEventListener('click', closeCart);

    document.getElementById('checkoutBtn').addEventListener('click', () => {
      if (!state.cart.length) return;
      renderCheckoutSummary();
      closeCart();
      openModal('checkoutOverlay');
    });
    document.getElementById('checkoutClose').addEventListener('click', closeAllModals);
    document.getElementById('checkoutForm').addEventListener('submit', submitOrder);

    document.getElementById('successClose').addEventListener('click', closeAllModals);

    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAllModals(); });
    });

    document.getElementById('newsletterForm').addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('newsletterMsg').textContent = 'Hvala na prijavi!';
      e.target.reset();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeAllModals(); closeCart(); }
    });
  }

  // =========================================================
  // INIT
  // =========================================================
  async function init() {
    loadCart();
    bindEvents();
    updateCartCount();
    renderCart();
    await loadData();
    renderHero();
    renderCategoryFilter();
    renderProducts();

    // settings for footer
    if (state.settings.shop_email) document.getElementById('footerEmail').textContent = state.settings.shop_email;
    if (state.settings.shop_phone) document.getElementById('footerPhone').textContent = state.settings.shop_phone;

    document.getElementById('pageLoader').classList.add('loaded');
  }

  init();
})();
