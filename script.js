const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();

function sendInquiry(event) {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const subject = encodeURIComponent(`Custom woodworking inquiry from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject idea:\n${message}`);
  window.location.href = `mailto:Alan.a4014@gmail.com?subject=${subject}&body=${body}`;
}

// Shop filtering
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      card.style.display = filter === 'all' || card.dataset.category === filter ? 'flex' : 'none';
    });
  });
});

// Shopping cart
let cart = JSON.parse(localStorage.getItem('alvarezCart') || '[]');
let activeProduct = null;

const modal = document.getElementById('customModal');
const drawer = document.getElementById('cartDrawer');
const backdrop = document.getElementById('drawerBackdrop');

function money(n) {
  return new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(n);
}

function saveCart() {
  localStorage.setItem('alvarezCart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const items = document.getElementById('cartItems');
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = money(total);

  if (!cart.length) {
    items.innerHTML = '<div class="empty-cart">Your cart is empty.<br><br>Choose a piece from the Custom Shop to get started.</div>';
    return;
  }

  items.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.optionsText || 'Custom configuration')}</p>
        <p>${money(item.price)} × ${item.qty}</p>
      </div>
      <button class="remove-item" onclick="removeCartItem(${i})">Remove</button>
    </div>
  `).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

window.removeCartItem = function(index) {
  cart.splice(index, 1);
  saveCart();
};

document.querySelectorAll('.add-product').forEach(button => {
  button.addEventListener('click', () => {
    activeProduct = {
      name: button.dataset.name,
      price: Number(button.dataset.price),
      options: button.dataset.options.split(',')
    };
    document.getElementById('modalTitle').textContent = activeProduct.name;
    document.getElementById('modalDescription').textContent = 'Select your preferences. Final pricing will be confirmed with you before the build begins.';
    document.getElementById('modalPrice').textContent = money(activeProduct.price);

    const fields = activeProduct.options.map((option, i) => `
      <div class="option-field">
        <label>${escapeHtml(option)}
          <select id="option-${i}">
            <option>Standard</option>
            <option>Premium</option>
            <option>Custom — discuss with maker</option>
          </select>
        </label>
      </div>
    `).join('');
    document.getElementById('optionFields').innerHTML = fields;
    document.getElementById('itemNotes').value = '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  });
});

document.getElementById('addToCart').addEventListener('click', () => {
  const selections = activeProduct.options.map((_, i) => document.getElementById(`option-${i}`).value);
  const notes = document.getElementById('itemNotes').value.trim();
  const optionsText = selections.join(' · ') + (notes ? ` · Notes: ${notes}` : '');
  cart.push({name: activeProduct.name, price: activeProduct.price, qty: 1, optionsText});
  saveCart();
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  backdrop.classList.add('open');
});

document.getElementById('modalClose').addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
});
document.getElementById('cartOpen').addEventListener('click', () => {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  backdrop.classList.add('open');
});
function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
  backdrop.classList.remove('open');
}
document.getElementById('cartClose').addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);

document.getElementById('checkoutBtn').addEventListener('click', async () => {
  if (!cart.length) {
    alert('Your cart is empty.');
    return;
  }

  // Production payment hook:
  // Set up a server endpoint such as /api/create-checkout-session that creates
  // a Stripe Checkout Session using your server-side Stripe secret key.
  // The browser must NEVER contain the Stripe secret key.
  //
  // When that endpoint is deployed, replace the request below with:
  // const response = await fetch('/api/create-checkout-session', {
  //   method:'POST',
  //   headers:{'Content-Type':'application/json'},
  //   body:JSON.stringify({items:cart})
  // });
  // const data = await response.json();
  // window.location.href = data.url;

  // Until the secure payment endpoint is connected, send the order by email.
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const lines = cart.map(item => `• ${item.name} — ${money(item.price)}\n  ${item.optionsText}`).join('\n');
  const subject = encodeURIComponent('Alvarez Woodworks order request');
  const body = encodeURIComponent(
    `Hello Alan,\n\nI'd like to request an order through the Alvarez Woodworks website.\n\n${lines}\n\nEstimated total: ${money(total)}\n\nPlease confirm the final price, materials, dimensions, timeline, and secure payment details.\n\nThank you!`
  );
  window.location.href = `mailto:Alan.a4014@gmail.com?subject=${subject}&body=${body}`;
});

renderCart();
