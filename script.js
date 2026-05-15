document.addEventListener('DOMContentLoaded', () => {

    /* --- Loading Screen Logic --- */
    const loader = document.getElementById('loader');
    const progressBar = document.querySelector('.cyber-progress');
    
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if(progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
        
        if(progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 1000);
            }, 500);
        }
    }, 200);

    /* --- Custom Cursor Trail Logic --- */
    const trailCanvas = document.getElementById('trailCanvas');
    const tCtx = trailCanvas.getContext('2d');
    let trails = [];

    function resizeCanvas() {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
        trails.push({
            x: e.clientX,
            y: e.clientY,
            life: 1,
            size: 5 + Math.random() * 5,
            color: `hsl(${280 + Math.random() * 80}, 100%, 60%)` // Neon purple/cyan/pink
        });
    });

    function drawTrails() {
        tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        
        trails.forEach((t, index) => {
            tCtx.beginPath();
            tCtx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
            tCtx.fillStyle = t.color;
            tCtx.globalAlpha = t.life;
            tCtx.fill();
            
            t.life -= 0.05;
            t.y -= 1; // drift up
            
            if(t.life <= 0) {
                trails.splice(index, 1);
            }
        });
        
        tCtx.globalAlpha = 1; // reset
        requestAnimationFrame(drawTrails);
    }
    drawTrails();

    /* --- Background Particles (Meteor/Stars) --- */
    const pCanvas = document.getElementById('particlesCanvas');
    const pCtx = pCanvas.getContext('2d');
    let particles = [];

    function initParticlesCanvas() {
        pCanvas.width = window.innerWidth;
        pCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', initParticlesCanvas);
    initParticlesCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * pCanvas.width;
            this.y = Math.random() * pCanvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * -1 - 0.5; // Float up
            this.glow = Math.random() > 0.5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if(this.y < 0) {
                this.y = pCanvas.height;
                this.x = Math.random() * pCanvas.width;
            }
        }
        draw() {
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            pCtx.fillStyle = this.glow ? '#00f3ff' : '#ffffff';
            if(this.glow) {
                pCtx.shadowBlur = 10;
                pCtx.shadowColor = '#00f3ff';
            } else {
                pCtx.shadowBlur = 0;
            }
            pCtx.fill();
        }
    }

    for(let i=0; i<100; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    /* --- Mouse Parallax & Hover Tilt for Cards --- */
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
            const rotateY = ((x - centerX) / centerX) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            card.style.transition = 'none'; // remove transition for smooth follow
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });
    });


    /* --- Scroll Reveal Animations --- */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-title, .product-card').forEach(el => observer.observe(el));


    /* --- Dynamic Cart Logic --- */
    const cartIcon = document.getElementById('cartIcon');
    const closeCart = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCountEl = document.getElementById('cartCount');
    const addButtons = document.querySelectorAll('.add-to-cart');

    let cart = [];

    // Open/Close Cart
    function toggleCart() {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }

    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Add to Cart Logic
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Ripple or feedback effect
            const btnEl = e.currentTarget;
            btnEl.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            setTimeout(() => {
                btnEl.innerHTML = 'Add to Cart <i class="fa-solid fa-plus"></i>';
            }, 1500);

            const id = btnEl.dataset.id;
            const name = btnEl.dataset.name;
            const price = parseFloat(btnEl.dataset.price);

            const existingItem = cart.find(item => item.id === id);
            if(existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            updateCartUI();
        });
    });

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            count += item.quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="price">${item.price} C x ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="changeQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
                    <button onclick="removeItem(${index})" style="background: rgba(255,0,0,0.2); color: #ff0055;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartTotalEl.innerText = total.toFixed(2);
        cartCountEl.innerText = count;

        // Mini pulse animation on cart icon
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    }

    // Global functions for inline onclick in injected HTML
    window.changeQty = (index, delta) => {
        cart[index].quantity += delta;
        if(cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        updateCartUI();
    };

    window.removeItem = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    /* --- Theme Toggle --- */
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const root = document.documentElement;
        if(root.getAttribute('data-theme') === 'dark') {
            root.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            root.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    });

    /* --- Sound Toggle (Visual only for now) --- */
    const soundToggle = document.getElementById('soundToggle');
    let soundOn = true;
    soundToggle.addEventListener('click', () => {
        soundOn = !soundOn;
        soundToggle.innerHTML = soundOn ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
        soundToggle.style.color = soundOn ? 'inherit' : '#ff0055';
    });

});
