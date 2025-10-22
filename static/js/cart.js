// LocalStorage-based cart utilities and UI helpers
(function () {
  const CART_KEY = 'fs_cart';
  // items: [{ productId, sizeId, name, sizeName, price, imageUrl, quantity }]

  function getItems() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadges(items);
  }

  function updateBadges(items) {
    const count = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
    const total = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
    const elQty = document.querySelector('.cart-quantity-text');
    if (elQty) { elQty.textContent = String(count); }
    localStorage.setItem('fs_cart_count', String(count));
    localStorage.setItem('fs_cart_total', String(total));
  }

  function addItem(product) {
    const items = getItems();
    const idx = items.findIndex(it => it.productId === product.productId && it.sizeId === product.sizeId);
    if (idx >= 0) {
      items[idx].quantity += product.quantity;
    } else {
      items.push(product);
    }
    saveItems(items);
  }

  function updateQuantity(productId, sizeId, quantity) {
    const items = getItems();
    const idx = items.findIndex(it => it.productId === productId && it.sizeId === sizeId);
    if (idx >= 0) {
      items[idx].quantity = Math.max(1, Number(quantity));
      saveItems(items);
    }
  }

  function removeItem(productId, sizeId) {
    const items = getItems().filter(it => !(it.productId === productId && it.sizeId === sizeId));
    saveItems(items);
  }

  function clear() {
    localStorage.removeItem(CART_KEY);
    updateBadges([]);
  }

  function formatCurrency(v) {
    try {
      return Number(v).toLocaleString('vi-VN') + ' đ';
    } catch (e) {
      return v + ' đ';
    }
  }

  function renderCartTable(options) {
    const opts = Object.assign({ allowEdit: true }, options || {});
    const table = document.getElementById('cart-table');
    const empty = document.getElementById('cart-empty');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    const items = getItems();
    if (!items.length) {
      table.style.display = 'none';
      if (empty) empty.style.display = '';
      updateBadges(items);
      const totalEl = document.getElementById('cart-total');
      if (totalEl) totalEl.textContent = '0 đ';
      return;
    }
    table.style.display = '';
    if (empty) empty.style.display = 'none';

    let total = 0;
    items.forEach(it => {
      const tr = document.createElement('tr');
      const subtotal = Number(it.price) * Number(it.quantity);
      total += subtotal;
      tr.innerHTML = `
        <td style="display:flex; align-items:center; gap:8px">
          ${it.imageUrl ? `<img src="${it.imageUrl}" alt="${it.name}" style="width:60px; height:60px; object-fit:cover"/>` : ''}
          <div>
            <div><strong>${it.name}</strong></div>
          </div>
        </td>
        <td>${it.sizeName || ''}</td>
        <td>${formatCurrency(it.price)}</td>
        <td>${opts.allowEdit ? `<input type="number" min="1" value="${it.quantity}" data-pid="${it.productId}" data-sid="${it.sizeId}" class="qty-input" style="width:64px"/>` : it.quantity}</td>
        <td>${formatCurrency(subtotal)}</td>
        <td>${opts.allowEdit ? `<button class="btn btn-sm remove-btn" data-pid="${it.productId}" data-sid="${it.sizeId}">Xóa</button>` : ''}</td>
      `;
      tbody.appendChild(tr);
    });

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = formatCurrency(total);
    updateBadges(items);

    if (opts.allowEdit) {
      tbody.querySelectorAll('.qty-input').forEach(inp => {
        inp.addEventListener('change', (e) => {
          const el = e.target;
          updateQuantity(Number(el.getAttribute('data-pid')), Number(el.getAttribute('data-sid')), Number(el.value));
          renderCartTable(opts);
        });
      });
      tbody.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const el = e.target;
          removeItem(Number(el.getAttribute('data-pid')), Number(el.getAttribute('data-sid')));
          renderCartTable(opts);
        });
      });
    }
  }

  window.Cart = { getItems, addItem, updateQuantity, removeItem, clear };
  window.CartUI = { renderCartTable, formatCurrency };

  // Initialize badge on load
  document.addEventListener('DOMContentLoaded', () => updateBadges(getItems()));
})();

