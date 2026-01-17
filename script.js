// =============================================================================
// SCRIPT.JS - MEDSHOP
// Gestion du panier, animations et interactions
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation du panier depuis le localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Numéro WhatsApp pour les commandes
    const whatsappNumber = "22870445866";

    // Sélection des éléments du DOM
    const cartButton = document.getElementById('cart-button');
    const cartCountSpan = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeButton = document.querySelector('.close-button');
    const cartItemsList = document.getElementById('cart-items');
    const checkoutButton = document.getElementById('checkout-button');
    const cartTotalDiv = document.getElementById('cart-total');
    const notification = document.getElementById('cart-notification');
    const notificationImg = document.getElementById('notification-img');
    const notificationMessage = document.getElementById('notification-message');

    // ==========================================================================
    // GESTION DU PANIER
    // ==========================================================================

    /**
     * Met à jour l'affichage du panier (modal et badge compteur)
     */
    function updateCartDisplay() {
        if (!cartItemsList) return;

        cartItemsList.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price} FCFA</p>
                    <div class="cart-item-quantity">
                        Quantité : ${item.quantity}
                    </div>
                </div>
                <button class="remove-item" data-index="${index}">&times;</button>
            `;
            cartItemsList.appendChild(li);
            total += item.price * item.quantity;
            totalItems += item.quantity;
        });

        if (cartTotalDiv) cartTotalDiv.textContent = `Total : ${total} FCFA`;
        if (cartCountSpan) cartCountSpan.textContent = totalItems;
        
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    /**
     * Affiche une notification lors de l'ajout au panier
     * @param {Object} item - L'article ajouté
     */
    function showNotification(item) {
        if (!notification) return;
        notificationImg.src = item.img;
        notificationMessage.textContent = `${item.name} a été ajouté au panier !`;
        notification.classList.add('visible');
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 3000);
    }

    /**
     * Supprime un article du panier
     * @param {number} index - L'index de l'article à supprimer
     */
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    }

    /**
     * Procède à la commande via WhatsApp
     */
    function checkout() {
        if (cart.length === 0) {
            alert("Votre panier est vide.");
            return;
        }

        let orderMessage = "Salut ! 👋 J'aimerais passer la commande suivante :\n\n";
        let total = 0;

        cart.forEach(item => {
            orderMessage += `🛒 ${item.name} x${item.quantity} - ${item.price * item.quantity} FCFA\n`;
            total += item.price * item.quantity;
        });

        orderMessage += `\n💰 Total : ${total} FCFA`;
        orderMessage += `\n\nMerci de me donner les détails de la livraison et du paiement ! 🙏`;

        const encodedMessage = encodeURIComponent(orderMessage);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.location.href = whatsappURL;
    }

    // ==========================================================================
    // ÉVÉNEMENTS DU PANIER
    // ==========================================================================

    // Ouvrir le modal du panier
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            updateCartDisplay();
            cartModal.style.display = 'block';
        });
    }

    // Fermer le modal
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }

    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Procéder à l'achat
    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }
    
    // Supprimer un article du panier
    if (cartItemsList) {
        cartItemsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item')) {
                const index = parseInt(event.target.dataset.index, 10);
                removeFromCart(index);
            }
        });
    }

    // ==========================================================================
    // GESTION DES PRODUITS (Pour les pages statiques uniquement)
    // Note: Les pages dynamiques gèrent leurs propres événements produits
    // ==========================================================================

    document.querySelectorAll('.product').forEach(product => {
        const decrementBtn = product.querySelector('.decrement-btn');
        const incrementBtn = product.querySelector('.increment-btn');
        const quantitySpan = product.querySelector('.quantity-count');
        const addToCartBtn = product.querySelector('.add-to-cart');

        if (!incrementBtn || !decrementBtn) return; // Skip si pas de sélecteurs

        incrementBtn.addEventListener('click', () => {
            let quantity = parseInt(quantitySpan.textContent);
            quantity++;
            quantitySpan.textContent = quantity;
            if (addToCartBtn) addToCartBtn.disabled = false;
        });

        decrementBtn.addEventListener('click', () => {
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity > 0) {
                quantity--;
                quantitySpan.textContent = quantity;
            }
            if (quantity === 0 && addToCartBtn) {
                addToCartBtn.disabled = true;
            }
        });

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const productName = product.dataset.name;
                const productPrice = parseFloat(product.dataset.price);
                const productImage = product.querySelector('img').src;
                const quantity = parseInt(quantitySpan.textContent);

                if (quantity > 0) {
                    const existingItem = cart.find(item => item.name === productName);
                    
                    if (existingItem) {
                        existingItem.quantity += quantity;
                    } else {
                        cart.push({ 
                            name: productName, 
                            price: productPrice, 
                            img: productImage, 
                            quantity: quantity 
                        });
                    }

                    updateCartDisplay();
                    showNotification({ name: productName, img: productImage });

                    quantitySpan.textContent = "0";
                    addToCartBtn.disabled = true;
                }
            });
        }
    });

    // ==========================================================================
    // ANIMATIONS ET INTERACTIONS
    // ==========================================================================

    // FAQ Accordéon
    const faqItems = document.querySelectorAll('.faq-item h3');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            item.parentElement.classList.toggle('active');
        });
    });

    // Animation au défilement (Intersection Observer)
    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    elementsToAnimate.forEach(element => observer.observe(element));
    
    // Bouton "Retour en haut"
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.onscroll = () => {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollTopBtn.style.display = "block";
            } else {
                scrollTopBtn.style.display = "none";
            }
        };
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================================================
    // INITIALISATION
    // ==========================================================================

    // Mettre à jour l'affichage initial du panier
    updateCartDisplay();

    // Log de démarrage (optionnel - pour debug)
    console.log('✅ MedShop initialisé avec succès');
    console.log(`📦 Panier: ${cart.length} produit(s)`);
});

// =============================================================================
// FONCTIONS UTILITAIRES GLOBALES
// =============================================================================

/**
 * Formatte un nombre avec des espaces pour les milliers
 * @param {number} num - Le nombre à formater
 * @returns {string} - Le nombre formaté
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Affiche un message toast
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de message (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Animations CSS pour le toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);