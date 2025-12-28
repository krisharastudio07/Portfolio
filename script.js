// Particle System (lazy init when hero is visible)
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    const particleCount = 40; // slightly reduced for performance

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';

        particlesContainer.appendChild(particle);
    }
}

// Lazy-init particles when hero enters view (avoid DOM cost on initial load)
let particlesCreated = false;
const heroEl = document.getElementById('home');
if (heroEl && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !particlesCreated) {
                createParticles();
                particlesCreated = true;
                obs.unobserve(heroEl);
            }
        });
    }, { threshold: 0.05 });

    heroObserver.observe(heroEl);
} else {
    // Fallback
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(createParticles, 200);
    });
} 

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Navbar element (handled in unified scroll handler)
const navbar = document.querySelector('.navbar');

// NOTE: navbar class updates are performed in the unified, throttled scroll handler below (using requestAnimationFrame)

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for Animations (AOS)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// Counter Animation for Stats
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
};

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            animateCounter(entry.target, target);
            entry.target.classList.add('counted');
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statObserver.observe(stat);
});

// Enhanced Portfolio Video Hover Effects
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioItems.forEach(item => {
    const video = item.querySelector('video');
    const playButton = item.querySelector('.play-button');
    const overlay = item.querySelector('.portfolio-overlay');

    if (video) {
        video.style.opacity = '1';
        video.style.visibility = 'visible';
        video.style.zIndex = '100';
        video.style.position = 'relative';
        // ensure videos don't preload large content until needed
        video.preload = 'none';
    }

    if (overlay) {
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        overlay.style.background = 'none';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '-1';
        overlay.style.width = '0';
        overlay.style.height = '0';
        overlay.style.overflow = 'hidden';
    }

    item.addEventListener('mouseenter', () => {
        // only show overlay and scale button; do NOT autoplay to avoid unnecessary bandwidth
        if (playButton) playButton.style.transform = 'scale(1.1)';
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)';
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            overlay.style.pointerEvents = 'auto';
            overlay.style.zIndex = '20';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.overflow = 'visible';
        }
    });

    item.addEventListener('mouseleave', () => {
        if (playButton) playButton.style.transform = '';
        if (overlay) {
            overlay.style.display = 'none';
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            overlay.style.background = 'none';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '-1';
            overlay.style.width = '0';
            overlay.style.height = '0';
            overlay.style.overflow = 'hidden';
        }
    });

    // Click to play/pause (ensure source is loaded before playing)
    item.addEventListener('click', (e) => {
        if (!video) return;
        // load source if needed
        const srcEl = video.querySelector('source');
        if (srcEl && !srcEl.src) {
            const src = srcEl.dataset && srcEl.dataset.src ? srcEl.dataset.src : item.getAttribute('data-video');
            if (src) { srcEl.src = src; video.load(); }
        }

        if (!e.target.closest('video') && !e.target.closest('.play-button')) {
            if (video.paused) video.play().catch(() => {});
            else video.pause();
        }
    });
});

// Lazy-load portfolio videos when they enter the viewport
if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const video = item.querySelector('video');
                if (video) {
                    const srcEl = video.querySelector('source');
                    if (srcEl && !srcEl.src) {
                        const dataSrc = srcEl.dataset && srcEl.dataset.src ? srcEl.dataset.src : item.getAttribute('data-video');
                        if (dataSrc) {
                            srcEl.src = dataSrc;
                            // Don't auto-play; just load so the video is ready if the user interacts
                            video.load();
                        }
                    }
                }
                obs.unobserve(item);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.portfolio-item').forEach(i => videoObserver.observe(i));
} else {
    // Fallback: load all sources
    document.querySelectorAll('.portfolio-item').forEach(item => {
        const video = item.querySelector('video');
        if (video) {
            const srcEl = video.querySelector('source');
            if (srcEl && !srcEl.src) {
                const dataSrc = srcEl.dataset && srcEl.dataset.src ? srcEl.dataset.src : item.getAttribute('data-video');
                if (dataSrc) { srcEl.src = dataSrc; video.load(); }
            }
        }
    });
} 


// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input[type="email"]');
        const button = newsletterForm.querySelector('button');
        
        const originalButtonHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        input.value = '';
        
        setTimeout(() => {
            button.innerHTML = originalButtonHTML;
            button.style.background = '';
        }, 2000);
    });
}

// Unified throttled scroll handler (updates navbar, hero parallax, shapes, and progress bar)
let isTicking = false;
const hero = document.querySelector('.hero');
const shapes = Array.from(document.querySelectorAll('.shape'));
const heroContent = document.querySelector('.hero-content');

function handleScroll() {
    const scrolled = window.pageYOffset || document.documentElement.scrollTop;

    // Navbar
    if (navbar) {
        if (scrolled > 100) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
    }

    // Hero parallax and opacity
    if (hero) {
        const opacity = Math.max(0, 1 - scrolled / 800);
        hero.style.opacity = opacity;
    }
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = Math.max(0, 1 - scrolled / 600);
    }

    // Shapes
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.3;
        shape.style.transform = `translateY(${scrolled * speed * 0.1}px) rotate(${scrolled * 0.05}deg)`;
    });

    // Progress bar
    if (progressBar) {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolledPercent = windowHeight > 0 ? (scrolled / windowHeight) * 100 : 0;
        progressBar.style.width = scrolledPercent + '%';
    }

    isTicking = false;
}

window.addEventListener('scroll', () => {
    if (!isTicking) {
        window.requestAnimationFrame(handleScroll);
        isTicking = true;
    }
}, { passive: true });

// Enhanced Typing Effect for Hero Title
const typingText = document.querySelector('.typing-text');
if (typingText) {
    const text = typingText.textContent;
    typingText.textContent = '';
    let index = 0;
    
    const typeWriter = () => {
        if (index < text.length) {
            typingText.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 80);
        } else {
            // Remove cursor after typing
            setTimeout(() => {
                typingText.style.borderRight = 'none';
            }, 500);
        }
    };
    
    setTimeout(typeWriter, 1000);
}

// Add Ripple Effect to Buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Enhanced Service Card 3D Tilt Effect
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
    let tiltTicking = false;
    let lastEvent = null;

    function applyTilt() {
        if (!lastEvent) return;
        const rect = card.getBoundingClientRect();
        const x = lastEvent.clientX - rect.left;
        const y = lastEvent.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`;

        const icon = card.querySelector('.service-icon');
        if (icon) {
            icon.style.transform = `translate(${(centerX - x) / 20}px, ${(centerY - y) / 20}px)`;
        }

        tiltTicking = false;
    }

    card.addEventListener('mousemove', (e) => {
        lastEvent = e;
        if (!tiltTicking) {
            window.requestAnimationFrame(applyTilt);
            tiltTicking = true;
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        const icon = card.querySelector('.service-icon');
        if (icon) icon.style.transform = '';
        lastEvent = null;
    });
});

// Scroll Progress Indicator (create bar only; updates occur in scroll handler)
const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    return progressBar;
};

const progressBar = createScrollProgress();

// Add Loading Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Console Welcome Message
console.log('%c🎬 Welcome to KrishAra Studio!', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cEdit Your Era With Flux', 'font-size: 14px; color: #8b5cf6;');

