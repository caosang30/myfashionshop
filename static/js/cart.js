// LocalStorage Cart Store + UI helpers
(function (global) {
  const STORAGE_KEY = 'fs_cart_v1';

  function roundCurrency(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { items: [] };
      const data = JSON.parse(raw);
      if (!Array.isArray(data.items)) return { items: [] };
      return { items: data.items };
    } catch (_) {
      return { items: [] };
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const CartStore = {
    get() { return load(); },
    set(state) { save(state); return state; },
    clear() { save({ items: [] }); },
    addItem(product) {
      const state = load();
      const key = `${product.product_id}-${product.size_id || 'x'}`;
      const existing = state.items.find(i => `${i.product_id}-${i.size_id || 'x'}` === key);
      if (existing) {
        existing.quantity += product.quantity || 1;
      } else {
        state.items.push({
          product_id: product.product_id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          size_id: product.size_id || null,
          size_name: product.size_name || '',
          quantity: product.quantity || 1,
        });
      }
      save(state);
      return state;
    },
    removeItem(productId, sizeId) {
      const state = load();
      const key = `${productId}-${sizeId || 'x'}`;
      state.items = state.items.filter(i => `${i.product_id}-${i.size_id || 'x'}` !== key);
      save(state);
      return state;
    },
    updateQty(productId, sizeId, qty) {
      const state = load();
      const key = `${productId}-${sizeId || 'x'}`;
      const item = state.items.find(i => `${i.product_id}-${i.size_id || 'x'}` === key);
      if (item) {
        item.quantity = Math.max(1, parseInt(qty, 10) || 1);
        save(state);
      }
      return state;
    },
    total() {
      const state = load();
      return roundCurrency(state.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
    },
    quantity() {
      const state = load();
      return state.items.reduce((sum, i) => sum + i.quantity, 0);
    }
  };

  const CartUI = {
    mount(config) {
      this.config = config || {};
      this.refresh();
      // optional global binder for add-to-cart buttons
      this.bindAddToCart();
    },
    refresh() {
      const state = CartStore.get();
      // Update quantity badge
      if (this.config?.quantityBadgeSelector) {
        document.querySelectorAll(this.config.quantityBadgeSelector).forEach((el) => {
          el.textContent = String(CartStore.quantity());
        });
      }
      // Render table body if present
      const tbody = document.querySelector(this.config?.tbodySelector || '');
      if (tbody) {
        tbody.innerHTML = '';
        state.items.forEach((i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="padding:8px 4px;">
              <div style="display:flex; align-items:center; gap:8px;">
                ${i.image ? `<img src="${i.image}" alt="${i.name}" width="48" height="48" style="object-fit:cover;">` : ''}
                <div>
                  <div style="font-weight:500">${i.name}</div>
                </div>
              </div>
            </td>
            <td style="text-align:center;">${i.size_name || '-'}</td>
            <td style="text-align:right;">${Number(i.price).toLocaleString('vi-VN')}₫</td>
            <td style="text-align:center;">
              <input type="number" min="1" value="${i.quantity}" data-pid="${i.product_id}" data-size="${i.size_id || ''}" class="qty-input" style="width:64px;">
            </td>
            <td style="text-align:right;">${(i.price * i.quantity).toLocaleString('vi-VN')}₫</td>
            <td style="text-align:center;">
              <button data-remove="1" data-pid="${i.product_id}" data-size="${i.size_id || ''}" class="btn" style="padding:6px 10px;">Xóa</button>
            </td>`;
          tbody.appendChild(tr);
        });
        // Bind events
        tbody.querySelectorAll('.qty-input').forEach((input) => {
          input.addEventListener('change', (e) => {
            const target = e.target;
            CartStore.updateQty(Number(target.dataset.pid), target.dataset.size ? Number(target.dataset.size) : null, target.value);
            this.refresh();
          });
        });
        tbody.querySelectorAll('button[data-remove]')?.forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const b = e.currentTarget;
            CartStore.removeItem(Number(b.dataset.pid), b.dataset.size ? Number(b.dataset.size) : null);
            this.refresh();
          });
        });
      }

      const totalEl = document.querySelector(this.config?.totalSelector || '');
      if (totalEl) totalEl.textContent = `${CartStore.total().toLocaleString('vi-VN')}₫`;
    },
    bindAddToCart() {
      // Delegate click events for .add-to-cart-btn
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;
        const productId = Number(btn.dataset.productId);
        const productName = btn.dataset.productName;
        const productPrice = Number(btn.dataset.productPrice);
        const productImage = btn.dataset.productImage || '';
        // locate size select matching this product
        const sizeSelect = document.querySelector(`.size-select[data-product-id="${productId}"]`);
        let sizeId = null;
        let sizeName = '';
        if (sizeSelect && sizeSelect.value) {
          sizeId = Number(sizeSelect.value);
          sizeName = sizeSelect.options[sizeSelect.selectedIndex].textContent || '';
        }
        CartStore.addItem({
          product_id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          size_id: sizeId,
          size_name: sizeName,
          quantity: 1,
        });
        this.refresh();
      });
    }
  };

  global.CartStore = CartStore;
  global.CartUI = CartUI;
})(window);
