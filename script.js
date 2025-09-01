document.addEventListener('DOMContentLoaded', () => {
    // Initialisation du panier à partir du stockage local
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Numéro WhatsApp pour la commande
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

    /**
     * Met à jour l'affichage du panier (modale et icône flottante).
     */
    function updateCartDisplay() {
        if (!cartItemsList) return; // Ne rien faire si les éléments du panier n'existent pas sur la page

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
                    <p>${item.price} Fcfa</p>
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

        if (cartTotalDiv) cartTotalDiv.textContent = `Total : ${total} Fcfa`;
        if (cartCountSpan) cartCountSpan.textContent = totalItems;
        
        // Sauvegarde le panier dans le stockage local
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    /**
     * Affiche une notification lorsqu'un produit est ajouté.
     * @param {object} item - L'objet du produit ajouté.
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
     * Supprime un article du panier.
     * @param {number} index - L'index de l'article à supprimer.
     */
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    }

    /**
     * Finalise la commande en redirigeant vers WhatsApp.
     */
    function checkout() {
        if (cart.length === 0) {
            alert("Votre panier est vide.");
            return;
        }

        let orderMessage = "Salut ! 👋 J'aimerais passer la commande suivante :\n\n";
        let total = 0;

        cart.forEach(item => {
            orderMessage += `🛒 ${item.name} x${item.quantity} - ${item.price * item.quantity} Fcfa\n`;
            total += item.price * item.quantity;
        });

        orderMessage += `\n💰 Total : ${total} Fcfa`;
        orderMessage += `\n\nMerci de me donner les détails de la livraison et du paiement ! 🙏`;

        const encodedMessage = encodeURIComponent(orderMessage);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Redirige l'onglet actuel vers WhatsApp. C'est plus fiable.
        window.location.href = whatsappURL;
        
        // Les lignes ci-dessous sont désactivées pour ne pas vider le panier
        // si l'utilisateur revient sur la page sans commander.
        // cart = [];
        // updateCartDisplay();
        // if (cartModal) cartModal.style.display = 'none';
    }

    // --- GESTION DES ÉVÉNEMENTS ---

    // Ajout au panier pour chaque produit
    document.querySelectorAll('.product').forEach(product => {
        const decrementBtn = product.querySelector('.decrement-btn');
        const incrementBtn = product.querySelector('.increment-btn');
        const quantitySpan = product.querySelector('.quantity-count');
        const addToCartBtn = product.querySelector('.add-to-cart');

        incrementBtn.addEventListener('click', () => {
            let quantity = parseInt(quantitySpan.textContent);
            quantity++;
            quantitySpan.textContent = quantity;
            addToCartBtn.disabled = false;
        });

        decrementBtn.addEventListener('click', () => {
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity > 0) {
                quantity--;
                quantitySpan.textContent = quantity;
            }
            if (quantity === 0) {
                addToCartBtn.disabled = true;
            }
        });

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
                    cart.push({ name: productName, price: productPrice, img: productImage, quantity: quantity });
                }

                updateCartDisplay();
                showNotification({ name: productName, img: productImage });

                // Réinitialise la quantité à 0 après l'ajout
                quantitySpan.textContent = "0";
                addToCartBtn.disabled = true;
            }
        });
    });

    // Événements pour la modale du panier
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            updateCartDisplay(); // S'assure que le panier est à jour avant de l'afficher
            cartModal.style.display = 'block';
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }
    
    // Événement pour supprimer un article depuis la modale
    if (cartItemsList) {
        cartItemsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item')) {
                const index = parseInt(event.target.dataset.index, 10);
                removeFromCart(index);
            }
        });
    }

    // Logique pour l'accordéon FAQ et les animations au défilement
    const faqItems = document.querySelectorAll('.faq-item h3');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            item.parentElement.classList.toggle('active');
        });
    });

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

    // Met à jour l'affichage initial du panier au chargement de la page
    updateCartDisplay();
});
