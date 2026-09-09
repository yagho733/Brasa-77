'use strict';

const SITE = window.BRASA_CONFIG || {};
const menu = Array.isArray(window.BRASA_MENU) ? window.BRASA_MENU : [];
const media = window.BRASA_MEDIA || {};
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const liveRegion = $('#liveRegion');
const announce = message => { if (liveRegion) liveRegion.textContent = message; };
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = Boolean(navigator.connection?.saveData);

function hydrateSiteConfig() {
  const address = $('[data-site="address"]');
  const week = $('[data-site="hours-week"]');
  const weekend = $('[data-site="hours-weekend"]');
  const sunday = $('[data-site="hours-sunday"]');
  const maps = $('[data-site-link="maps"]');
  const social = $('[data-site="restaurant-social"]');
  if (address) address.textContent = SITE.address || SITE.city || 'Pelotas — RS';
  if (week) week.textContent = SITE.hours?.week || '18H — 23H';
  if (weekend) weekend.textContent = SITE.hours?.weekend || '18H — 00H';
  if (sunday) sunday.textContent = SITE.hours?.sunday || '18H — 23H';
  if (maps) maps.href = SITE.mapsUrl || 'https://maps.google.com/?q=Pelotas+RS';
  if (social && SITE.instagram) {
    const a = document.createElement('a');
    a.href = SITE.instagram;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.textContent = 'Instagram';
    social.replaceWith(a);
  }
}
hydrateSiteConfig();

const productsEl = $('#products');
const featured = menu.filter(item => item.featured);
if (productsEl) {
  productsEl.innerHTML = featured.map((item, index) => `
    <article class="product reveal">
      <div class="product-media" data-label="${item.name}">
        <img src="${item.image}" alt="${item.name}: ${item.description}" loading="lazy" decoding="async" />
      </div>
      <div class="product-copy">
        <span class="product-index">${String(index + 1).padStart(2, '0')}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="product-spec">${item.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
        <div class="product-bottom">
          <strong class="product-price">${money(item.price)}</strong>
          <button class="product-add add-to-cart" data-id="${item.id}">ADICIONAR AO PEDIDO</button>
        </div>
      </div>
    </article>`).join('');
}

function bindImageFallbacks(scope = document) {
  scope.querySelectorAll('img').forEach(img => {
    if (img.dataset.fallbackBound) return;
    img.dataset.fallbackBound = '1';
    img.addEventListener('error', () => {
      const frame = img.parentElement;
      if (frame) frame.classList.add('media-error');
      img.hidden = true;
    }, { once: true });
  });
}
bindImageFallbacks();

let activeCategory = 'smash';
const menuList = $('#menuList');
const previewImage = $('#menuPreviewImage');
const previewName = $('#menuPreviewName');
const previewIndex = $('#menuPreviewIndex');

function setPreview(item, index) {
  if (!item || !previewImage) return;
  previewImage.classList.add('swap');
  window.setTimeout(() => {
    previewImage.hidden = false;
    previewImage.src = item.image;
    previewImage.alt = `${item.name}: ${item.description}`;
    previewName.textContent = item.name.toUpperCase();
    previewIndex.textContent = String(index + 1).padStart(2, '0');
    previewImage.classList.remove('swap');
  }, 160);
}

function renderMenu() {
  const items = menu.filter(item => item.category === activeCategory);
  if (!menuList) return;
  menuList.innerHTML = items.map((item, index) => `
    <div class="menu-item ${index === 0 ? 'active' : ''}" data-id="${item.id}" tabindex="0" role="button" aria-label="Ver ${item.name}">
      <div class="menu-item-main"><strong>${item.name.toUpperCase()}</strong><p>${item.description}</p></div>
      <span class="menu-item-price">${money(item.price)}</span>
      <button class="menu-item-add add-to-cart" data-id="${item.id}" aria-label="Adicionar ${item.name}">+</button>
    </div>`).join('');
  setPreview(items[0], 0);
  const rows = $$('.menu-item');
  rows.forEach((row, index) => {
    const item = menu.find(i => i.id === row.dataset.id);
    const activate = () => {
      rows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      setPreview(item, index);
    };
    row.addEventListener('mouseenter', activate);
    row.addEventListener('focus', activate);
    row.addEventListener('click', event => { if (!event.target.closest('button')) activate(); });
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });
  bindImageFallbacks(menuList);
}

$$('.menu-tabs button').forEach(btn => btn.addEventListener('click', () => {
  $$('.menu-tabs button').forEach(button => {
    button.classList.remove('active');
    button.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  activeCategory = btn.dataset.category;
  renderMenu();
}));
renderMenu();

const CART_KEY = 'brasa77-cart-v1';
const cart = new Map();
const drawer = $('#cartDrawer');
const backdrop = $('#cartBackdrop');
const cartItems = $('#cartItems');
const cartEmpty = $('#cartEmpty');
const cartFooter = $('#cartFooter');
const cartTotal = $('#cartTotal');
const cartCount = $('#cartCount');
const mobileCartCount = $('#mobileCartCount');
let lastFocusedElement = null;

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    stored.forEach(({ id, qty }) => {
      const item = menu.find(product => product.id === id);
      if (item && Number.isFinite(qty) && qty > 0) cart.set(id, { item, qty: Math.min(qty, 20) });
    });
  } catch { localStorage.removeItem(CART_KEY); }
}
function persistCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify([...cart].map(([id, row]) => ({ id, qty: row.qty }))));
  } catch { /* storage may be unavailable */ }
}
function openCart() {
  if (!drawer) return;
  lastFocusedElement = document.activeElement;
  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#cartClose')?.focus({ preventScroll: true });
}
function closeCart() {
  if (!drawer) return;
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus({ preventScroll: true });
}

$('#cartOpen')?.addEventListener('click', openCart);
$('#mobileCartOpen')?.addEventListener('click', openCart);
$('#cartClose')?.addEventListener('click', closeCart);
$('#cartGoMenu')?.addEventListener('click', closeCart);
backdrop?.addEventListener('click', closeCart);

function addToCart(id) {
  const item = menu.find(product => product.id === id);
  if (!item) return;
  const current = cart.get(id) || { item, qty: 0 };
  current.qty = Math.min(current.qty + 1, 20);
  cart.set(id, current);
  persistCart();
  renderCart();
  announce(`${item.name} adicionado ao carrinho.`);
  openCart();
}
function changeQty(id, delta) {
  const current = cart.get(id);
  if (!current) return;
  current.qty += delta;
  if (current.qty <= 0) cart.delete(id);
  else current.qty = Math.min(current.qty, 20);
  persistCart();
  renderCart();
}
function renderCart() {
  const entries = [...cart.values()];
  const count = entries.reduce((sum, row) => sum + row.qty, 0);
  const total = entries.reduce((sum, row) => sum + (row.item.price * row.qty), 0);
  if (cartCount) cartCount.textContent = count;
  if (mobileCartCount) mobileCartCount.textContent = count;
  cartEmpty?.classList.toggle('show', entries.length === 0);
  if (cartFooter) cartFooter.style.display = entries.length ? 'block' : 'none';
  if (cartItems) {
    cartItems.innerHTML = entries.map(({ item, qty }) => `
      <div class="cart-row">
        <div class="cart-thumb" data-label="${item.name}"><img src="${item.image}" alt="${item.name}" loading="lazy" /></div>
        <div>
          <h3>${item.name.toUpperCase()}</h3>
          <span class="cart-unit">${money(item.price)} cada</span>
          <div class="qty">
            <button data-action="minus" data-id="${item.id}" aria-label="Diminuir ${item.name}">−</button>
            <span>${qty}</span>
            <button data-action="plus" data-id="${item.id}" aria-label="Aumentar ${item.name}">+</button>
          </div>
        </div>
        <button class="cart-remove" data-action="remove" data-id="${item.id}" aria-label="Remover ${item.name}">×</button>
      </div>`).join('');
    bindImageFallbacks(cartItems);
  }
  if (cartTotal) cartTotal.textContent = money(total);
}

document.addEventListener('click', event => {
  const button = event.target.closest('.add-to-cart');
  if (button) addToCart(button.dataset.id);
});
cartItems?.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  if (button.dataset.action === 'plus') changeQty(button.dataset.id, 1);
  if (button.dataset.action === 'minus') changeQty(button.dataset.id, -1);
  if (button.dataset.action === 'remove') {
    cart.delete(button.dataset.id);
    persistCart();
    renderCart();
  }
});
loadCart();
renderCart();

function orderText() {
  const entries = [...cart.values()];
  const total = entries.reduce((sum, row) => sum + (row.item.price * row.qty), 0);
  const lines = entries.map(({ item, qty }) => `${qty}x ${item.name} — ${money(item.price * qty)}`);
  return `Olá! Quero fazer um pedido na ${SITE.brandName || 'Brasa 77'}:\n\n${lines.join('\n')}\n\nTotal: ${money(total)}`;
}

const demoModal = $('#demoModal');
const demoBackdrop = $('#demoBackdrop');
const demoOrderText = $('#demoOrderText');
let modalReturnFocus = null;
function openDemoCheckout() {
  modalReturnFocus = document.activeElement;
  if (demoOrderText) demoOrderText.textContent = orderText();
  if (demoBackdrop) demoBackdrop.hidden = false;
  demoModal?.classList.add('open');
  demoModal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#demoClose')?.focus({ preventScroll: true });
}
function closeDemoCheckout() {
  if (demoBackdrop) demoBackdrop.hidden = true;
  demoModal?.classList.remove('open');
  demoModal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (modalReturnFocus instanceof HTMLElement) modalReturnFocus.focus({ preventScroll: true });
}
$('#demoClose')?.addEventListener('click', closeDemoCheckout);
demoBackdrop?.addEventListener('click', closeDemoCheckout);
$('#copyOrder')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(orderText());
    announce('Pedido copiado.');
    $('#copyOrder').textContent = 'PEDIDO COPIADO';
    window.setTimeout(() => { $('#copyOrder').textContent = 'COPIAR PEDIDO'; }, 1600);
  } catch { announce('Não foi possível copiar automaticamente.'); }
});

$('#checkout')?.addEventListener('click', () => {
  if (!cart.size) return;
  const number = String(SITE.whatsapp || '').replace(/\D/g, '');
  if (SITE.demoMode || number.length < 10) {
    closeCart();
    window.setTimeout(openDemoCheckout, 220);
    return;
  }
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(orderText())}`, '_blank', 'noopener,noreferrer');
});

const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
function closeMobileMenu() {
  mobileMenu?.classList.remove('open');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
menuToggle?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) mobileMenu.querySelector('a')?.focus({ preventScroll: true });
});
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (demoModal?.classList.contains('open')) closeDemoCheckout();
    else if (drawer?.classList.contains('open')) closeCart();
    else closeMobileMenu();
  }
});

const header = $('#header');
const progress = $('#progressBar');
function onScroll() {
  header?.classList.toggle('scrolled', window.scrollY > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  if (progress) progress.style.width = `${ratio * 100}%`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .1, rootMargin: '0px 0px -35px' });
$$('.reveal').forEach(el => revealObserver.observe(el));

function createEmbers() {
  const layer = $('#heroEmbers');
  if (!layer || isReducedMotion || saveData) return;
  const amount = window.innerWidth < 760 ? 5 : 12;
  layer.innerHTML = '';
  for (let i = 0; i < amount; i += 1) {
    const ember = document.createElement('span');
    ember.className = 'ember';
    ember.style.left = `${5 + Math.random() * 90}%`;
    ember.style.setProperty('--dur', `${7 + Math.random() * 8}s`);
    ember.style.setProperty('--delay', `${Math.random() * 8}s`);
    ember.style.setProperty('--drift', `${-45 + Math.random() * 90}px`);
    const size = .9 + Math.random() * 2;
    ember.style.width = `${size}px`;
    ember.style.height = `${size}px`;
    layer.appendChild(ember);
  }
}
createEmbers();
window.addEventListener('resize', () => {
  clearTimeout(window.__emberResize);
  window.__emberResize = window.setTimeout(createEmbers, 200);
}, { passive: true });

function optimizeMotionMedia() {
  if (isReducedMotion || saveData) {
    $$('.optional-motion').forEach(video => {
      video.pause();
      video.hidden = true;
    });
  }
  const managed = $$('.managed-video');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && !document.hidden && !isReducedMotion) video.play().catch(() => {});
      else video.pause();
    });
  }, { rootMargin: '180px 0px', threshold: .01 });
  managed.forEach(video => observer.observe(video));
  document.addEventListener('visibilitychange', () => {
    managed.forEach(video => {
      if (document.hidden) video.pause();
      else if (video.getBoundingClientRect().bottom > -180 && video.getBoundingClientRect().top < innerHeight + 180 && !isReducedMotion) video.play().catch(() => {});
    });
  });
}
optimizeMotionMedia();

$$('video').forEach(video => video.addEventListener('error', () => {
  video.style.display = 'none';
  video.parentElement?.classList.add('video-fallback');
}));
