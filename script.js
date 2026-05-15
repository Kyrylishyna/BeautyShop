let products = [
    {
        id: 1,
        name: 'Krem Nawilżający',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
        category: 'Pielęgnacja twarzy',
        description: 'Intensywnie nawilżający krem do twarzy z witaminą E'
    },
    {
        id: 2,
        name: 'Serum Witaminowe',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        category: 'Pielęgnacja twarzy',
        description: 'Serum z witaminą C rozświetlające skórę'
    },
    {
        id: 3,
        name: 'Maska do Twarzy',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
        category: 'Pielęgnacja twarzy',
        description: 'Oczyszczająca maska z glinką'
    },
    {
        id: 4,
        name: 'Balsam do Ciała',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',
        category: 'Pielęgnacja ciała',
        description: 'Odżywczy balsam z masłem shea'
    },
    {
        id: 5,
        name: 'Peeling Cukrowy',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400',
        category: 'Pielęgnacja ciała',
        description: 'Naturalny peeling z cukrem i olejkami'
    },
    {
        id: 6,
        name: 'Szampon Regenerujący',
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
        category: 'Pielęgnacja włosów',
        description: 'Szampon z keratyną do włosów zniszczonych'
    },
    {
        id: 7,
        name: 'Odżywka Nawilżająca',
        price: 42.99,
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
        category: 'Pielęgnacja włosów',
        description: 'Odżywka z proteinami jedwabiu'
    },
    {
        id: 8,
        name: 'Krem pod Oczy',
        price: 99.99,
        image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400',
        category: 'Pielęgnacja twarzy',
        description: 'Krem redukujący cienie i obrzęki'
    }
];

// Stan aplikacji
let cart = [];
let currentUser = null;
let currentCategory = 'Wszystkie';
let isLoginMode = true;
let checkoutData = {};

// Użytkownicy (w prawdziwej aplikacji byłoby to w bazie danych)
const users = {
    'admin@beautyshop.pl': { password: 'admin123', name: 'Administrator', role: 'admin' },
    'user@example.com': { password: 'user123', name: 'Jan Kowalski', role: 'user' }
};

// Inicjalizacja
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    renderProducts();
    renderCategories();
    updateCartUI();
    setupEventListeners();
});

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('beautyshop_products', JSON.stringify(products));
    localStorage.setItem('beautyshop_cart', JSON.stringify(cart));
}

function loadFromLocalStorage() {
    const savedProducts = localStorage.getItem('beautyshop_products');
    const savedCart = localStorage.getItem('beautyshop_cart');

    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Address form
    document.getElementById('address-form').addEventListener('submit', handleAddressSubmit);

    // Payment form
    document.getElementById('payment-form').addEventListener('submit', handlePaymentSubmit);

    // Add product form
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);

    // Payment method change
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });

    // Payment method labels
    document.querySelectorAll('.payment-method').forEach(label => {
        label.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Navigation
function showPage(pageName) {
    // Check if user is logged in for protected pages
    if (['checkout', 'payment', 'confirmation'].includes(pageName) && !currentUser) {
        showPage('login');
        return;
    }

    // Check if user is admin for admin page
    if (pageName === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
        alert('Tylko administrator ma dostęp do tego panelu!');
        return;
    }

    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageName + '-page').classList.add('active');

    // Update page-specific content
    if (pageName === 'checkout') {
        renderCheckoutItems();
    } else if (pageName === 'payment') {
        renderPaymentSummary();
    } else if (pageName === 'admin') {
        renderAdminProducts();
    }
}

// Categories
function renderCategories() {
    const categories = ['Wszystkie', ...new Set(products.map(p => p.category))];
    const container = document.getElementById('category-filters');

    container.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === currentCategory ? 'active' : ''}"
                onclick="filterByCategory('${cat}')">
            ${cat}
        </button>
    `).join('');
}

function filterByCategory(category) {
    currentCategory = category;
    renderCategories();
    renderProducts();
}

// Products
function renderProducts() {
    const container = document.getElementById('products-grid');
    const filtered = currentCategory === 'Wszystkie'
        ? products
        : products.filter(p => p.category === currentCategory);

    container.innerHTML = filtered.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">${product.price.toFixed(2)} zł</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Dodaj
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    saveToLocalStorage();

    // Animation feedback
    const btn = event.target;
    btn.textContent = '✓ Dodano';
    setTimeout(() => btn.textContent = 'Dodaj', 1000);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveToLocalStorage();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartUI();
        saveToLocalStorage();
    }
}

function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;

    // Update cart page
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Twój koszyk jest pusty</p>
                <button onclick="showPage('home')" class="btn btn-primary">Przeglądaj produkty</button>
            </div>
        `;
        cartSummary.style.display = 'none';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-category">${item.category}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} zł</div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️ Usuń</button>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = subtotal + 15;

        document.getElementById('summary-items').textContent = `${totalItems} szt.`;
        document.getElementById('summary-subtotal').textContent = `${subtotal.toFixed(2)} zł`;
        document.getElementById('summary-total').textContent = `${total.toFixed(2)} zł`;

        cartSummary.style.display = 'block';
    }
}

function proceedToCheckout() {
    if (!currentUser) {
        alert('Musisz się zalogować, aby kontynuować!');
        showPage('login');
        return;
    }

    if (cart.length === 0) {
        alert('Twój koszyk jest pusty!');
        return;
    }

    showPage('checkout');
}

// Login / Registration
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('login-title');
    const subtitle = document.getElementById('login-subtitle');
    const nameGroup = document.getElementById('name-group');
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    const toggleBtn = document.getElementById('toggle-auth');

    if (isLoginMode) {
        title.textContent = 'Zaloguj się';
        subtitle.textContent = 'Witaj ponownie w BeautyShop';
        nameGroup.style.display = 'none';
        submitBtn.textContent = 'Zaloguj się';
        toggleBtn.textContent = 'Nie masz konta? Zarejestruj się';
    } else {
        title.textContent = 'Zarejestruj się';
        subtitle.textContent = 'Stwórz nowe konto w BeautyShop';
        nameGroup.style.display = 'block';
        submitBtn.textContent = 'Zarejestruj się';
        toggleBtn.textContent = 'Masz już konto? Zaloguj się';
    }
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const name = document.getElementById('reg-name').value;

    if (isLoginMode) {
        // Login
        if (users[email] && users[email].password === password) {
            currentUser = { email, ...users[email] };
            updateAuthUI();
            showPage('home');
            alert(`Witaj ${currentUser.name}!`);
        } else {
            alert('Nieprawidłowy email lub hasło!');
        }
    } else {
        // Registration
        if (users[email]) {
            alert('Użytkownik z tym emailem już istnieje!');
        } else {
            users[email] = { password, name, role: 'user' };
            currentUser = { email, name, role: 'user' };
            updateAuthUI();
            showPage('home');
            alert(`Witaj ${currentUser.name}! Twoje konto zostało utworzone.`);
        }
    }

    document.getElementById('login-form').reset();
}

function logout() {
    currentUser = null;
    updateAuthUI();
    showPage('home');
}

function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const logoutLink = document.getElementById('logout-link');
    const adminLink = document.getElementById('admin-link');

    if (currentUser) {
        authLink.style.display = 'none';
        logoutLink.style.display = 'block';

        if (currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        authLink.style.display = 'block';
        logoutLink.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// Checkout
function renderCheckoutItems() {
    const container = document.getElementById('checkout-items');
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + 15;

    container.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-details">${item.quantity} × ${item.price.toFixed(2)} zł</div>
            </div>
        </div>
    `).join('');

    document.getElementById('checkout-subtotal').textContent = `${subtotal.toFixed(2)} zł`;
    document.getElementById('checkout-total').textContent = `${total.toFixed(2)} zł`;

    // Pre-fill email
    if (currentUser) {
        document.getElementById('email').value = currentUser.email;
    }
}

function handleAddressSubmit(e) {
    e.preventDefault();

    checkoutData.address = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        country: document.getElementById('country').value
    };

    showPage('payment');
}

// Payment
function handlePaymentMethodChange(e) {
    const method = e.target.value;

    document.getElementById('card-details').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('blik-details').style.display = method === 'blik' ? 'block' : 'none';
    document.getElementById('transfer-details').style.display = method === 'transfer' ? 'block' : 'none';
}

function renderPaymentSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + 15;

    const address = checkoutData.address;
    const addressText = `
        ${address.firstName} ${address.lastName}<br>
        ${address.street}<br>
        ${address.postalCode} ${address.city}<br>
        ${address.country}
    `;

    document.getElementById('delivery-address').innerHTML = addressText;
    document.getElementById('payment-subtotal').textContent = `${subtotal.toFixed(2)} zł`;
    document.getElementById('payment-total-summary').textContent = `${total.toFixed(2)} zł`;
    document.getElementById('payment-total').textContent = `${total.toFixed(2)} zł`;
}

function handlePaymentSubmit(e) {
    e.preventDefault();

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    checkoutData.paymentMethod = paymentMethod;
    checkoutData.orderNumber = 'BEA' + Date.now().toString().slice(-8);

    showConfirmation();
}

// Confirmation
function showConfirmation() {
    const address = checkoutData.address;
    const orderNumber = checkoutData.orderNumber;

    document.getElementById('order-number').textContent = orderNumber;

    document.getElementById('conf-address').innerHTML = `
        ${address.firstName} ${address.lastName}<br>
        ${address.street}<br>
        ${address.postalCode} ${address.city}<br>
        ${address.country}
    `;

    const paymentNames = {
        card: 'Karta płatnicza',
        transfer: 'Przelew bankowy',
        blik: 'BLIK'
    };

    document.getElementById('conf-details').innerHTML = `
        <strong>Płatność:</strong> ${paymentNames[checkoutData.paymentMethod]}<br>
        <strong>Email:</strong> ${address.email}<br>
        <strong>Telefon:</strong> ${address.phone}
    `;

    // Clear cart
    cart = [];
    saveToLocalStorage();

    showPage('confirmation');
}

// Admin Panel
function handleAddProduct(e) {
    e.preventDefault();

    const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        image: document.getElementById('product-image').value,
        category: document.getElementById('product-category').value,
        description: document.getElementById('product-description').value
    };

    products.push(newProduct);
    saveToLocalStorage();
    renderProducts();
    renderCategories();
    renderAdminProducts();

    document.getElementById('add-product-form').reset();
    alert('Produkt został dodany!');
}

function deleteProduct(productId) {
    if (confirm('Czy na pewno chcesz usunąć ten produkt?')) {
        products = products.filter(p => p.id !== productId);
        saveToLocalStorage();
        renderProducts();
        renderCategories();
        renderAdminProducts();
    }
}

function renderAdminProducts() {
    const container = document.getElementById('admin-products-list');

    container.innerHTML = products.map(product => `
        <div class="admin-product-item">
            <div class="admin-product-info">
                <h4>${product.name}</h4>
                <p>${product.category} - ${product.price.toFixed(2)} zł</p>
            </div>
            <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Usuń</button>
        </div>
    `).join('');
}





//PWA

let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Użytkownik zainstalował PWA');
      } else {
        console.log('Użytkownik odrzucił instalację');
      }
      deferredPrompt = null;
    });
  });
});

window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  console.log('Aplikacja została pomyślnie zainstalowana!');
});
