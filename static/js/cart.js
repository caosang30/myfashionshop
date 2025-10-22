// Cart management with LocalStorage
class CartManager {
    constructor() {
        this.cartKey = 'fashion_shop_cart';
        this.cart = this.loadCart();
        this.init();
    }
    
    init() {
        this.updateCartUI();
        this.bindEvents();
    }
    
    loadCart() {
        const cartData = localStorage.getItem(this.cartKey);
        return cartData ? JSON.parse(cartData) : [];
    }
    
    saveCart() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
        this.updateCartUI();
    }
    
    addToCart(productId, sizeId, quantity = 1) {
        const existingItem = this.cart.find(item => 
            item.product_id === productId && item.size_id === sizeId
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                product_id: productId,
                size_id: sizeId,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.showAddToCartMessage();
    }
    
    updateQuantity(productId, sizeId, quantity) {
        const item = this.cart.find(item => 
            item.product_id === productId && item.size_id === sizeId
        );
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId, sizeId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }
    
    removeFromCart(productId, sizeId) {
        this.cart = this.cart.filter(item => 
            !(item.product_id === productId && item.size_id === sizeId)
        );
        this.saveCart();
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
    }
    
    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    updateCartUI() {
        const cartCount = this.getCartCount();
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'inline' : 'none';
        });
        
        // Update cart total if element exists
        const cartTotalElement = document.querySelector('.cart-total');
        if (cartTotalElement) {
            cartTotalElement.textContent = this.getCartTotal().toLocaleString('vi-VN') + 'đ';
        }
    }
    
    showAddToCartMessage() {
        // Create or update notification
        let notification = document.getElementById('cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.className = 'alert alert-success position-fixed';
            notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            document.body.appendChild(notification);
        }
        
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Đã thêm sản phẩm vào giỏ hàng!
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification && notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
    
    bindEvents() {
        // Bind add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                const sizeId = e.target.dataset.sizeId;
                const quantity = parseInt(e.target.dataset.quantity) || 1;
                
                if (productId && sizeId) {
                    this.addToCart(parseInt(productId), parseInt(sizeId), quantity);
                }
            }
        });
        
        // Bind cart icon click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-icon')) {
                e.preventDefault();
                window.location.href = '/cart/';
            }
        });
    }
    
    async loadCartData() {
        if (this.cart.length === 0) {
            return [];
        }
        
        try {
            const response = await fetch('/cart/get-data/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({
                    cart_items: this.cart
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.cart_data;
            } else {
                console.error('Error loading cart data:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error loading cart data:', error);
            return [];
        }
    }
    
    proceedToCheckout() {
        // Redirect to checkout page
        window.location.href = '/orders/checkout/';
    }
}

// Initialize cart manager when page loads
let cartManager;
document.addEventListener('DOMContentLoaded', function() {
    cartManager = new CartManager();
});

// Global functions for template compatibility
function addToCart(productId, sizeId, quantity = 1) {
    if (cartManager) {
        cartManager.addToCart(parseInt(productId), parseInt(sizeId), quantity);
    }
}

function proceedToCheckout() {
    if (cartManager) {
        cartManager.proceedToCheckout();
    }
}

// Export for use in other scripts
window.CartManager = CartManager;
window.cartManager = cartManager;
