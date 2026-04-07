/* ============================================
   FAITH BOUTIQUE COIFFURE — Scripts
   ============================================ */
 
let cart = [];
function toggleCart() {
  const p = document.getElementById('cartPanel');
  const o = document.getElementById('cartOverlay');
  const open = p.classList.toggle('open');
  o.style.display = open ? 'block' : 'none';
}
function addToCart(name, price, img) {
  cart.push({ name, price, img });
  updateCart();
  showNotif('✓ ' + name + ' ajouté au panier');
}
function removeFromCart(i) { cart.splice(i,1); updateCart(); }
function updateCart() {
  document.getElementById('cartBadge').textContent = cart.length;
  const items = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!cart.length) { items.innerHTML='<div class="cart-empty">Votre panier est vide</div>'; footer.style.display='none'; return; }
  footer.style.display='block';
  items.innerHTML = cart.map((item,i)=>`
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}">
      <div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">${item.price}</div></div>
      <button class="cart-item-remove" onclick="removeFromCart(${i})">×</button>
    </div>`).join('');
  document.getElementById('cartTotal').textContent = cart.length + ' article(s)';
}
function filterJewelry(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.jewelry-card').forEach(card=>{
    card.style.display = (cat==='all'||card.dataset.cat===cat) ? 'block' : 'none';
  });
}
function openResa(service) {
  document.getElementById('resaServiceLabel').textContent = service;
  document.getElementById('resaModal').classList.add('open');
  document.getElementById('resaSuccess').style.display='none';
  document.getElementById('resaPrenom').value='';
  document.getElementById('resaTel').value='';
}
function closeResa() { document.getElementById('resaModal').classList.remove('open'); }
function submitResa() {
  if(!document.getElementById('resaPrenom').value || !document.getElementById('resaTel').value) { showNotif('⚠ Veuillez remplir tous les champs'); return; }
  document.getElementById('resaSuccess').style.display='block';
  setTimeout(closeResa, 2600);
}
function submitForm() {
  if(!document.getElementById('cPrenom').value || !document.getElementById('cEmail').value || !document.getElementById('cMsg').value) { showNotif('⚠ Veuillez remplir tous les champs'); return; }
  document.getElementById('successMsg').style.display='block';
}
function showNotif(msg) {
  const n=document.getElementById('notif');
  n.textContent=msg; n.classList.add('show');
  setTimeout(()=>n.classList.remove('show'),2800);
}
const obs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{ if(e.isIntersecting) setTimeout(()=>e.target.classList.add('visible'),i*60); });
},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));