// Cart management using LocalStorage
const CART_KEY = 'fashionshop_cart';

// Get cart from LocalStorage
function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Save cart to LocalStorage
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(productSizeId, productName, productPrice, productImage, sizeName) {
    const cart = getCart();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.product_size_id === productSizeId);
    
    if (existingItemIndex > -1) {
        // Item exists, increase quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            product_size_id: productSizeId,
            name: productName,
            price: productPrice,
            image: productImage,
            size: sizeName,
            quantity: 1
        });
    }
    
    saveCart(cart);
    alert('Đã thêm vào giỏ hàng!');
}

// Update cart count in navbar
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'inline' : 'none';
    });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

// Clear cart
function clearCart() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        if (typeof updateCartDisplay === 'function') {
            updateCartDisplay();
        }
    }
}
