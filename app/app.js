const PRICE = 20;
const form = document.getElementById('checkout-form');
const qty = form.querySelector('[name=qty]');
const coupon = form.querySelector('[name=coupon]');
const email = form.querySelector('[name=email]');
const total = document.getElementById('total');
const msg = document.getElementById('msg');
function recalc() {
  const q = Math.max(0, parseInt(qty.value || '0', 10));
  let t = q * PRICE;
  if (coupon.value.trim().toUpperCase() === 'SAVE10') t = t * 0.9;
  total.textContent = t.toFixed(2);
}
qty.addEventListener('input', recalc);
coupon.addEventListener('input', recalc);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = parseInt(qty.value || '0', 10);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) { msg.className = 'err'; msg.textContent = 'Please enter a valid email'; return; }
  if (!(q >= 1 && q <= 10)) { msg.className = 'err'; msg.textContent = 'Quantity must be between 1 and 10'; return; }
  msg.className = 'ok'; msg.textContent = 'Payment accepted: $' + total.textContent;
});
form.querySelector('button[type=button]').addEventListener('click', () => { msg.className = ''; msg.textContent = 'Order cancelled'; });
