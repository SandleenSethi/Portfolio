// ===== NAVIGATION =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
let mobileMenu = null;

function createMobileMenu() {
    mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    const ul = document.createElement('ul');
    navLinks.querySelectorAll('a').forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = a.getAttribute('href');
            closeMobileMenu();
            setTimeout(() => scrollToTarget(targetId), 300);
        });
        li.appendChild(a);
        ul.appendChild(li);
    });
    mobileMenu.appendChild(ul);
    document.body.appendChild(mobileMenu);
}

function openMobileMenu() {
    mobileMenu.classList.add('active');
    navToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
    if (mobileMenu && mobileMenu.classList.contains('active')) closeMobileMenu();
    else openMobileMenu();
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    updateActiveNavLink();
});

// ===== SMOOTH SCROLLING =====
function scrollToTarget(sel) {
    const el = document.querySelector(sel);
    if (el) {
        window.scrollTo({
            top: el.offsetTop - navbar.offsetHeight,
            behavior: 'smooth'
        });
    }
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (id && id !== '#') {
            e.preventDefault();
            scrollToTarget(id);
        }
    });
});

// ===== ACTIVE NAV =====
function updateActiveNavLink() {
    const secs = document.querySelectorAll('section[id]');
    const sp = window.scrollY + navbar.offsetHeight + 100;
    secs.forEach(s => {
        if (sp >= s.offsetTop && sp < s.offsetTop + s.offsetHeight) {
            document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
                a.classList.remove('active-link');
                if (a.getAttribute('href') === `#${s.id}`) a.classList.add('active-link');
            });
        }
    });
}

// ===== PROJECT CAROUSEL =====
class ProjectCarousel {
    constructor(card) {
        this.track = card.querySelector('.psc-track');
        this.slides = card.querySelectorAll('.psc-slide');
        this.dots = card.querySelectorAll('.psc-dots span');
        this.prevBtn = card.querySelector('.psc-nav.prev');
        this.nextBtn = card.querySelector('.psc-nav.next');
        this.currentIndex = 0;
        this.total = this.slides.length;

        if (this.total <= 1) {
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
            if (this.dots.length <= 1) {
                const dotsContainer = card.querySelector('.psc-dots');
                if (dotsContainer) dotsContainer.style.display = 'none';
            }
            return;
        }

        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.goTo(i)));

        let startX = 0;
        let isDragging = false;
        const carouselEl = card.querySelector('.psc-carousel');

        carouselEl.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        carouselEl.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.next();
                else this.prev();
            }
            isDragging = false;
        });
    }

    update() {
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.total) % this.total;
        this.update();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.total;
        this.update();
    }

    goTo(index) {
        this.currentIndex = index;
        this.update();
    }
}

// ===== SCROLL REVEAL =====
function initReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const delay = parseInt(e.target.dataset.delay) || 0;
                setTimeout(() => e.target.classList.add('visible'), delay);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el, i) => {
        el.dataset.delay = i * 35;
        obs.observe(el);
    });
}

function addRevealClass() {
    document.querySelectorAll('section:not(#hero) > .container > *').forEach(el => el.classList.add('reveal'));
}

// ===== WORKFLOW STEP ANIMATIONS =====
function initWorkflowAnimations() {
    const steps = document.querySelectorAll('.workflow-step');

    const stepObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('step-visible');
                stepObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    steps.forEach((step, i) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        step.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 100}ms, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 100}ms`;
        stepObs.observe(step);
    });

    const style = document.createElement('style');
    style.textContent = `.step-visible { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMessage');
    const ic = t.querySelector('iconify-icon');
    m.textContent = msg;
    if (type === 'error') {
        t.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        ic.setAttribute('icon', 'lucide:alert-circle');
    } else {
        t.style.borderColor = '';
        ic.setAttribute('icon', 'lucide:check-circle');
    }
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== YEAR =====
document.getElementById('currentYear').textContent = new Date().getFullYear();

// ===== INIT =====
function init() {
    document.querySelectorAll('[data-carousel]').forEach(card => {
        new ProjectCarousel(card);
    });

    createMobileMenu();
    addRevealClass();
    initReveal();
    initWorkflowAnimations();
}

document.addEventListener('DOMContentLoaded', init);