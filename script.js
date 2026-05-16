// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Set dynamic copyright year
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; // Trigger point

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    // Initial check and attach to scroll event
    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);

    // Header Background Change on Scroll
    const header = document.querySelector('.glass-header');
    const navContainer = document.querySelector('.nav-container');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navContainer.style.padding = '0.5rem 2rem';
            header.style.background = 'rgba(15, 23, 42, 0.9)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navContainer.style.padding = '1rem 2rem';
            header.style.background = 'rgba(15, 23, 42, 0.7)';
            header.style.boxShadow = 'none';
        }
    });

    // Mobile Menu Toggle (Basic Setup)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(15, 23, 42, 0.95)';
            navLinks.style.padding = '2rem';
            navLinks.style.borderBottom = '1px solid var(--glass-border)';
            navLinks.style.backdropFilter = 'blur(10px)';
        }
    });

    // Custom Cursor Tracking
    const cursorGlow = document.getElementById('cursorGlow');
    const cursorDot = document.getElementById('cursorDot');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    // Smooth glow follow with requestAnimationFrame
    function animateGlow() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Enlarge dot when hovering over interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .glass-card, .tags span, .tech-stack span, .menu-toggle');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('hover'));
    });

    // Hide cursor elements on touch devices
    if ('ontouchstart' in window) {
        cursorGlow.style.display = 'none';
        cursorDot.style.display = 'none';
        document.body.style.cursor = 'auto';
    }
});

// Interactive Particle System
(function () {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let smoothMouse = { x: null, y: null }; // Delayed/smoothed mouse position
    const PARTICLE_COUNT = 80;
    const MOUSE_LERP = 0.06; // Lower = more delay (0.01 to 0.1 range)

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        // Initialize smooth position on first move
        if (smoothMouse.x === null) {
            smoothMouse.x = mouse.x;
            smoothMouse.y = mouse.y;
        }
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
        smoothMouse.x = null;
        smoothMouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
            // Random blue/purple hue
            this.hue = Math.random() > 0.5 ? 220 : 260;
        }

        draw() {
            ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            // Gentle floating drift
            this.baseX += this.speedX;
            this.baseY += this.speedY;

            // Wrap around edges
            if (this.baseX < 0) this.baseX = canvas.width;
            if (this.baseX > canvas.width) this.baseX = 0;
            if (this.baseY < 0) this.baseY = canvas.height;
            if (this.baseY > canvas.height) this.baseY = 0;

            // Mouse interaction — push particles away (uses delayed mouse)
            if (smoothMouse.x !== null && smoothMouse.y !== null) {
                let dx = smoothMouse.x - this.baseX;
                let dy = smoothMouse.y - this.baseY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    let dirX = dx / distance;
                    let dirY = dy / distance;
                    this.x = this.baseX - dirX * force * 40;
                    this.y = this.baseY - dirY * force * 40;
                    this.opacity = Math.min(0.8, this.opacity + 0.02);
                } else {
                    this.x += (this.baseX - this.x) * 0.05;
                    this.y += (this.baseY - this.y) * 0.05;
                    this.opacity += (Math.random() * 0.5 + 0.1 - this.opacity) * 0.01;
                }
            } else {
                this.x += (this.baseX - this.x) * 0.05;
                this.y += (this.baseY - this.y) * 0.05;
            }

            this.draw();
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    let opacity = (1 - distance / 120) * 0.15;
                    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Smoothly lerp the mouse position for a trailing delay
        if (mouse.x !== null && smoothMouse.x !== null) {
            smoothMouse.x += (mouse.x - smoothMouse.x) * MOUSE_LERP;
            smoothMouse.y += (mouse.y - smoothMouse.y) * MOUSE_LERP;
        }

        particles.forEach(p => p.update());
        drawConnections();
        requestAnimationFrame(animate);
    }

    init();
    animate();

    // Re-initialize on resize for proper distribution
    window.addEventListener('resize', init);
})();
