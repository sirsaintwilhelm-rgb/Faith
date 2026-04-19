/* ============================================
   FAITH BOUTIQUE COIFFURE — Scripts
   Compte utilisateur + Paiement CinetPay
   ============================================ */

/* ─────────────────────────────────────────
   CONFIG CINETPAY
   Remplacez par vos vraies clés sur cinetpay.com
   ───────────────────────────────────────── */
const CINETPAY_CONFIG = {
  apikey:     'VOTRE_API_KEY_CINETPAY',
  site_id:    'VOTRE_SITE_ID_CINETPAY',
  notify_url: 'https://votre-site.com/notify',
  return_url: 'https://votre-site.com/merci',
  mode:       'TEST'   // Passer en 'PRODUCTION' pour le live
};

/* ─────────────────────────────────────────
   PANIER
   ───────────────────────────────────────── */
let cart = [];

function toggleCart() {
  const p = document.getElementById('cartPanel');
  const o = document.getElementById('cartOverlay');
  const open = p.classList.toggle('open');
  o.style.display = open ? 'block' : 'none';
}

function addToCart(name, price, img) {
  const rawPrice = parseInt(price.replace(/[^0-9]/g, '')) || 0;
  cart.push({ name, price, img, rawPrice });
  updateCart();
  showNotif('✓ ' + name + ' ajouté au panier');
}

function removeFromCart(i) { cart.splice(i, 1); updateCart(); }

function updateCart() {
  document.getElementById('cartBadge').textContent = cart.length;
  const items  = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!cart.length) {
    items.innerHTML = '<div class="cart-empty">Votre panier est vide</div>';
    footer.style.display = 'none'; return;
  }
  footer.style.display = 'block';
  items.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i})">×</button>
    </div>`).join('');
  const total = cart.reduce((s, i) => s + i.rawPrice, 0);
  document.getElementById('cartTotal').textContent = total.toLocaleString('fr-FR') + ' FCFA';
}

/* ─────────────────────────────────────────
   PAIEMENT CINETPAY
   ───────────────────────────────────────── */
function proceedToPayment() {
  const user = getCurrentUser();
  if (!user) {
    showNotif('⚠ Connectez-vous avant de payer');
    openAuthModal('login');
    toggleCart();
    return;
  }
  if (!cart.length) { showNotif('⚠ Votre panier est vide'); return; }

  const total = cart.reduce((s, i) => s + i.rawPrice, 0);
  const txId  = 'FAITH_' + Date.now();
  const desc  = 'Commande Faith : ' + cart.map(i => i.name).join(', ');

  if (typeof CinetPay === 'undefined') {
    showNotif('⚠ SDK CinetPay non chargé');
    return;
  }

  CinetPay.setConfig({
    apikey:     CINETPAY_CONFIG.apikey,
    site_id:    CINETPAY_CONFIG.site_id,
    notify_url: CINETPAY_CONFIG.notify_url,
    return_url: CINETPAY_CONFIG.return_url,
    mode:       CINETPAY_CONFIG.mode
  });

  CinetPay.getCheckout({
    transaction_id:       txId,
    amount:               total,
    currency:             'XOF',
    channels:             'ALL',
    description:          desc,
    customer_name:        user.prenom,
    customer_surname:     user.nom,
    customer_email:       user.email,
    customer_phone_number: user.telephone || '',
    customer_city:        'Abidjan',
    customer_country:     'CI',
    customer_state:       'CI',
    customer_zip_code:    '00225',
    lang:                 'fr'
  });

  CinetPay.waitResponse(function(data) {
    if (data.status === 'ACCEPTED') {
      cart = []; updateCart(); toggleCart();
      document.getElementById('paySuccessId').textContent    = txId;
      document.getElementById('paySuccessTotal').textContent = total.toLocaleString('fr-FR') + ' FCFA';
      document.getElementById('paySuccessModal').classList.add('open');
    } else {
      showNotif('❌ Paiement refusé. Réessayez.');
    }
  });

  CinetPay.onError(function(data) {
    console.error('CinetPay error:', data);
    showNotif('❌ Erreur de paiement. Contactez-nous.');
  });
}

/* ─────────────────────────────────────────
   COMPTE UTILISATEUR (localStorage — demo)
   En production : remplacez par appels API
   ───────────────────────────────────────── */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('faith_user') || 'null'); } catch(e) { return null; }
}
function setCurrentUser(u) { localStorage.setItem('faith_user', JSON.stringify(u)); }

function logoutUser() {
  localStorage.removeItem('faith_user');
  updateAuthUI();
  showNotif('✓ Vous êtes déconnecté(e)');
}

function updateAuthUI() {
  const user    = getCurrentUser();
  const loginBtn = document.getElementById('authBtn');
  const userMenu = document.getElementById('userMenu');
  const userName = document.getElementById('userName');
  if (!loginBtn) return;
  if (user) {
    loginBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    userName.textContent   = user.prenom;
  } else {
    loginBtn.style.display = 'inline-flex';
    userMenu.style.display = 'none';
  }
}

function openAuthModal(tab) {
  document.getElementById('authModal').classList.add('open');
  switchAuthTab(tab || 'login');
  ['loginError','registerError'].forEach(id => document.getElementById(id).style.display = 'none');
}
function closeAuthModal() { document.getElementById('authModal').classList.remove('open'); }

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
  document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
  document.getElementById('form-' + tab).style.display = 'block';
}

function handleRegister() {
  const prenom   = document.getElementById('reg-prenom').value.trim();
  const nom      = document.getElementById('reg-nom').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const tel      = document.getElementById('reg-tel').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const errEl    = document.getElementById('registerError');

  if (!prenom || !nom || !email || !password) {
    errEl.textContent = 'Veuillez remplir tous les champs obligatoires.';
    errEl.style.display = 'block'; return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
    errEl.style.display = 'block'; return;
  }
  if (password !== confirm) {
    errEl.textContent = 'Les mots de passe ne correspondent pas.';
    errEl.style.display = 'block'; return;
  }
  const users = JSON.parse(localStorage.getItem('faith_users') || '[]');
  if (users.find(u => u.email === email)) {
    errEl.textContent = 'Cet email est déjà utilisé.';
    errEl.style.display = 'block'; return;
  }
  users.push({ prenom, nom, email, telephone: tel, password });
  localStorage.setItem('faith_users', JSON.stringify(users));
  setCurrentUser({ prenom, nom, email, telephone: tel });
  closeAuthModal(); updateAuthUI();
  showNotif('✓ Compte créé ! Bienvenue ' + prenom + ' 🎉');
}

function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('loginError');
  if (!email || !password) {
    errEl.textContent = 'Veuillez remplir tous les champs.';
    errEl.style.display = 'block'; return;
  }
  const users = JSON.parse(localStorage.getItem('faith_users') || '[]');
  const user  = users.find(u => u.email === email && u.password === password);
  if (!user) {
    errEl.textContent = 'Email ou mot de passe incorrect.';
    errEl.style.display = 'block'; return;
  }
  setCurrentUser({ prenom: user.prenom, nom: user.nom, email: user.email, telephone: user.telephone });
  closeAuthModal(); updateAuthUI();
  showNotif('✓ Bienvenue ' + user.prenom + ' !');
}

/* ─────────────────────────────────────────
   FILTRES / RESA / CONTACT
   ───────────────────────────────────────── */
function filterJewelry(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.jewelry-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'block' : 'none';
  });
}

function openResa(service) {
  document.getElementById('resaServiceLabel').textContent = service;
  document.getElementById('resaModal').classList.add('open');
  document.getElementById('resaSuccess').style.display = 'none';
  const user = getCurrentUser();
  document.getElementById('resaPrenom').value = user ? user.prenom : '';
  document.getElementById('resaTel').value    = user ? (user.telephone || '') : '';
}
function closeResa() { document.getElementById('resaModal').classList.remove('open'); }
function submitResa() {
  if (!document.getElementById('resaPrenom').value || !document.getElementById('resaTel').value) {
    showNotif('⚠ Veuillez remplir tous les champs'); return;
  }
  document.getElementById('resaSuccess').style.display = 'block';
  setTimeout(closeResa, 2600);
}

function submitForm() {
  if (!document.getElementById('cPrenom').value ||
      !document.getElementById('cEmail').value ||
      !document.getElementById('cMsg').value) {
    showNotif('⚠ Veuillez remplir tous les champs'); return;
  }
  document.getElementById('successMsg').style.display = 'block';
}

/* ─────────────────────────────────────────
   UTILITAIRES
   ───────────────────────────────────────── */
function showNotif(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg; n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 2800);
}

const obs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 60);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

document.addEventListener('DOMContentLoaded', updateAuthUI);