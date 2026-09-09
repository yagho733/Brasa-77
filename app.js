(() => {
  const config = window.BRASA_CONFIG || {};
  const menu = Array.isArray(window.BRASA_MENU) ? window.BRASA_MENU : [];
  const byId = (id) => document.getElementById(id);
  const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const state = { cart: new Map(), category: 'smash', previewId: menu[0]?.id || null };

  const announce = (text) => {
    const live = byId('liveRegion');
    if (live) live.textContent = text;
  };

  function applySiteConfig() {
    document.querySelectorAll('[data-site="address"]').forEach((el) => { el.textContent = config.address || config.city || 'Pelotas — RS'; });
    document.querySelectorAll('[data-site="hours-week"]').forEach((el) => { el.textContent = config.hours?.week || '18H — 23H'; });
    document.querySelectorAll('[data-site="hours-weekend"]').forEach((el) => { el.textContent = config.hours?.weekend || '18H — 00H'; });
    document.querySelectorAll('[data-site="hours-sunday"]').forEach((el) => { el.textContent = config.hours?.sunday || '18H — 23H'; });
    document.querySelectorAll('[data-site-link="maps"]').forEach((el) => { if (config.mapsUrl) el.href = config.mapsUrl; });
    const social = document.querySelector('[data-site="restaurant-social"]');
    if (social && config.instagram) {
      const link = document.createElement('a');
      link.href = config.instagram;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = 'Instagram';
      social.replaceWith(link);
    }
  }

  function safeImage(img, label) {
    img.addEventListener('error', () => {
      const parent = img.parentElement;
      if (!parent) return;
      parent.classList.add('media-error');
      parent.dataset.label = label || 'Brasa 77';
      img.hidden = true;
    }, { once: true });
  }

  function renderFeatured() {
    const root = byId('products');
    if (!root) return;
    const featured = menu.filter((item) => item.featured).slice(0, 4);
    root.innerHTML = featured.map((item, index) => `
      <article class="product reveal">
        <div class="product-media">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <span class="product-index">0${index + 1}</span>
        </div>
        <div class="product-copy">
          <span class="product-number">0${index + 1} / MAIS PEDIDOS</span>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="product-tags">${(item.tags || []).map((tag) => `<span>${tag}</span>`).join('')}</div>
          <div class="product-bottom"><strong>${money(item.price)}</strong><button class="add-to-cart" data-id="${item.id}">ADICIONAR</button></div>
        </div>
      </article>
    `).join('');
    root.querySelectorAll('img').forEach((img) => safeImage(img, img.alt));
  }

  function setPreview(item, index = 0) {
    if (!item) return;
    state.previewId = item.id;
    const image = byId('menuPreviewImage');
    const name = byId('menuPreviewName');
    const number = byId('menuPreviewIndex');
    if (image) { image.hidden = false; image.src = item.image; image.alt = item.name; safeImage(image, item.name); }
    if (name) name.textContent = item.name.toUpperCase();
    if (number) number.textContent = String(index + 1).padStart(2, '0');
  }

  function renderMenu(category = state.category) {
    state.category = category;
    const root = byId('menuList');
    if (!root) return;
    const items = menu.filter((item) => item.category === category);
    root.innerHTML = items.map((item, index) => `
      <article class="menu-item${index === 0 ? ' active' : ''}" data-menu-id="${item.id}" tabindex="0">
        <div class="menu-item-main"><strong>${item.name}</strong><p>${item.description}</p></div>
        <span class="menu-price">${money(item.price)}</span>
        <button class="menu-add add-to-cart" data-id="${item.id}" aria-label="Adicionar ${item.name}">+</button>
      </article>
    `).join('');
    if (items[0]) setPreview(items[0], 0);
    [...root.querySelectorAll('.menu-item')].forEach((row, index) => {
      const item = items[index];
      const activate = () => {
        root.querySelectorAll('.menu-item').forEach((el) => el.classList.remove('active'));
        row.classList.add('active');
        setPreview(item, index);
      };
      row.addEventListener('mouseenter', activate);
      row.addEventListener('focusin', activate);
      row.addEventListener('click', (event) => { if (!event.target.closest('button')) activate(); });
    });
  }

  function cartEntries() {
    return [...state.cart.entries()].map(([id, qty]) => ({ item: menu.find((p) => p.id === id), qty })).filter(({ item }) => item);
  }

  function cartTotal() {
    return cartEntries().reduce((sum, { item, qty }) => sum + item.price * qty, 0);
  }

  function updateCartUI() {
    const entries = cartEntries();
    const totalQty = entries.reduce((sum, entry) => sum + entry.qty, 0);
    const cartItems = byId('cartItems');
    const empty = byId('cartEmpty');
    const footer = byId('cartFooter');
    [byId('cartCount'), byId('mobileCartCount')].forEach((el) => { if (el) el.textContent = totalQty; });
    if (cartItems) {
      cartItems.innerHTML = entries.map(({ item, qty }) => `
        <article class="cart-item" data-cart-id="${item.id}">
          <div class="cart-thumb"><img src="${item.image}" alt="${item.name}" /></div>
          <div class="cart-item-copy"><strong>${item.name}</strong><small>${money(item.price)}</small><div class="qty"><button data-action="minus" aria-label="Diminuir quantidade">−</button><span>${qty}</span><button data-action="plus" aria-label="Aumentar quantidade">+</button></div></div>
          <strong class="cart-line-total">${money(item.price * qty)}</strong>
          <button class="cart-remove" data-action="remove" aria-label="Remover ${item.name}">REMOVER</button>
        </article>
      `).join('');
      cartItems.querySelectorAll('img').forEach((img) => safeImage(img, img.alt));
    }
    empty?.classList.toggle('show', entries.length === 0);
    if (footer) footer.style.display = entries.length ? 'block' : 'none';
    const total = byId('cartTotal');
    if (total) total.textContent = money(cartTotal());
  }

  function addItem(id) {
    const item = menu.find((product) => product.id === id);
    if (!item) return;
    state.cart.set(id, (state.cart.get(id) || 0) + 1);
    updateCartUI();
    announce(`${item.name} adicionado ao carrinho.`);
  }

  function changeQty(id, delta) {
    const current = state.cart.get(id) || 0;
    const next = current + delta;
    if (next <= 0) state.cart.delete(id); else state.cart.set(id, next);
    updateCartUI();
  }

  function openCart() {
    byId('cartDrawer')?.classList.add('open');
    byId('cartBackdrop')?.classList.add('show');
    byId('cartDrawer')?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeCart() {
    byId('cartDrawer')?.classList.remove('open');
    byId('cartBackdrop')?.classList.remove('show');
    byId('cartDrawer')?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function orderText() {
    const lines = cartEntries().map(({ item, qty }) => `${qty}x ${item.name} — ${money(item.price * qty)}`);
    return `Olá! Quero fazer um pedido na Brasa 77:\n\n${lines.join('\n')}\n\nTotal: ${money(cartTotal())}`;
  }

  function openDemoCheckout() {
    const modal = byId('demoModal');
    const backdrop = byId('demoBackdrop');
    const text = byId('demoOrderText');
    if (text) text.textContent = orderText();
    if (backdrop) { backdrop.hidden = false; backdrop.classList.add('show'); }
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
  }

  function closeDemoCheckout() {
    const modal = byId('demoModal');
    const backdrop = byId('demoBackdrop');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    if (backdrop) { backdrop.classList.remove('show'); backdrop.hidden = true; }
  }

  function checkout() {
    if (!state.cart.size) return;
    const phone = String(config.whatsapp || '').replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(orderText())}`, '_blank', 'noopener,noreferrer');
    } else {
      openDemoCheckout();
    }
  }

  function setupTabs() {
    document.querySelectorAll('.menu-tabs button').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.menu-tabs button').forEach((tab) => { tab.classList.remove('active'); tab.setAttribute('aria-selected', 'false'); });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        renderMenu(button.dataset.category);
      });
    });
  }

  function setupMenu() {
    const toggle = byId('menuToggle');
    const menuEl = byId('mobileMenu');
    const close = () => { menuEl?.classList.remove('open'); menuEl?.setAttribute('aria-hidden', 'true'); toggle?.setAttribute('aria-expanded', 'false'); };
    toggle?.addEventListener('click', () => {
      const open = !menuEl?.classList.contains('open');
      menuEl?.classList.toggle('open', open);
      menuEl?.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
    });
    menuEl?.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  }

  function setupScroll() {
    const header = byId('header');
    const progress = byId('progressBar');
    const onScroll = () => {
      header?.classList.toggle('scrolled', window.scrollY > 30);
      if (progress) {
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        progress.style.width = `${Math.min(100, (scrollY / max) * 100)}%`;
      }
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupReveal() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  function setupVideos() {
    const videos = document.querySelectorAll('.managed-video');
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) target.play().catch(() => {}); else target.pause();
      });
    }, { rootMargin: '200px 0px' });
    videos.forEach((video) => {
      video.addEventListener('error', () => video.parentElement?.classList.add('video-fallback'));
      observer.observe(video);
    });
  }

  function setupEmbers() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = byId('heroEmbers');
    if (!root) return;
    const amount = innerWidth < 760 ? 7 : 16;
    for (let i = 0; i < amount; i += 1) {
      const ember = document.createElement('i');
      ember.className = 'ember';
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.setProperty('--dur', `${5 + Math.random() * 6}s`);
      ember.style.setProperty('--delay', `${Math.random() * -10}s`);
      ember.style.setProperty('--drift', `${-50 + Math.random() * 100}px`);
      root.appendChild(ember);
    }
  }

  document.addEventListener('click', (event) => {
    const add = event.target.closest('.add-to-cart');
    if (add) addItem(add.dataset.id);
    const cartItem = event.target.closest('[data-cart-id]');
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (cartItem && action) {
      const id = cartItem.dataset.cartId;
      if (action === 'plus') changeQty(id, 1);
      if (action === 'minus') changeQty(id, -1);
      if (action === 'remove') { state.cart.delete(id); updateCartUI(); }
    }
  });

  byId('cartOpen')?.addEventListener('click', openCart);
  byId('mobileCartOpen')?.addEventListener('click', openCart);
  byId('cartClose')?.addEventListener('click', closeCart);
  byId('cartBackdrop')?.addEventListener('click', closeCart);
  byId('cartGoMenu')?.addEventListener('click', closeCart);
  byId('checkout')?.addEventListener('click', checkout);
  byId('demoClose')?.addEventListener('click', closeDemoCheckout);
  byId('demoBackdrop')?.addEventListener('click', closeDemoCheckout);
  byId('copyOrder')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(orderText()); announce('Pedido copiado.'); byId('copyOrder').textContent = 'PEDIDO COPIADO'; }
    catch { announce('Não foi possível copiar automaticamente.'); }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); closeDemoCheckout(); } });

  applySiteConfig();
  renderFeatured();
  renderMenu();
  updateCartUI();
  setupTabs();
  setupMenu();
  setupScroll();
  setupEmbers();
  setupVideos();
  requestAnimationFrame(setupReveal);
})();
