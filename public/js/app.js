/* ===== twon Portfolio — JavaScript v2.0 ===== */

// Force scroll to top on page refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
if (window.location.hash) {
  history.replaceState(null, null, window.location.pathname + window.location.search);
}

let currentLang = localStorage.getItem('lang') || 'en';

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initParticles();
  initNavbar();
  initActiveNav();
  initBackToTop();

  initTypingEffect();
  initTestimonialCarousel();
  initProgressBar();
  initPageTransitions();
  fetchSiteData().then(() => {
    initSplitText();
    initScrollReveal();
    initAdvancedGrid();
    initTextHighlight();
    initServiceStagger();
  });
  initOdometerCount();
  initContactForm();
  updateLangButtons();

  if (window.innerWidth > 768) {

    initMagneticButtons();
    initParallax();
    initGlitch();

    initGradientShift();
    initSmoothScroll();
  }
});

function setLang(lang) {
  if (currentLang === lang) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  updateLangButtons();
  fetchSiteData();
  showToast(lang === 'tr' ? 'Türkçe seçildi' : 'English selected', 'info', 2000);
}

function updateLangButtons() {
  const btnTr = document.getElementById('btn-tr');
  const btnEn = document.getElementById('btn-en');
  const langSwitch = document.getElementById('lang-switch');
  if (btnTr) btnTr.classList.toggle('active', currentLang === 'tr');
  if (btnEn) btnEn.classList.toggle('active', currentLang === 'en');
  if (langSwitch) langSwitch.setAttribute('data-active', currentLang);
}

async function fetchSiteData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Data fetch failed');
    const allData = await res.json();
    const data = allData[currentLang];

    // Update texts
    if (data && data.siteData) {
      const heroTitle = document.getElementById('heroTitle');
      if (heroTitle) heroTitle.innerHTML = data.siteData.heroTitle;

      const aboutText = document.getElementById('aboutText');
      if (aboutText) aboutText.innerHTML = data.siteData.aboutText;
    }

    // Update static i18n
    if (data && data.static) {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data.static[key]) el.innerHTML = data.static[key];
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (data.static[key]) el.setAttribute('placeholder', data.static[key]);
      });
    }

    // Render portfolio (replace skeletons)
    const grid = document.getElementById('portfolio-grid');
    if (grid && data.portfolio) {
      grid.innerHTML = data.portfolio.map((item) => `
        <div class="portfolio-card reveal-scale active" data-video="${item.videoUrl}" data-category="${item.category || 'all'}">
          <div class="card-glow"></div>
          <div class="portfolio-thumb">
            <img src="${item.thumbUrl}" alt="${item.name}">
            <div class="portfolio-overlay">
              <div class="play-btn">▶</div>
            </div>
          </div>
          <div class="portfolio-info">
            <div class="portfolio-name">${item.name}</div>
            <div class="portfolio-desc">${item.desc}</div>
          </div>
        </div>
      `).join('');

      initModal(); // Attach listeners to new cards
      initSplitText();
      initScrollReveal(); // Trigger reveals for newly loaded texts and split words
      if (window.innerWidth > 768) {
        initTilt();
      }
      initPortfolioFilters();
    }

    // Render FAQ
    const faqContainer = document.getElementById('faq-container');
    if (faqContainer && data.faq) {
      faqContainer.innerHTML = data.faq.map((item) => `
        <div class="faq-item">
          <button class="faq-question">${item.q}</button>
          <div class="faq-answer"><p>${item.a}</p></div>
        </div>
      `).join('');
      initFAQ();
    }
  } catch (e) {
    console.error('Data fetch error:', e);
  }
}

/* ===== PARTICLES ===== */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 150;

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.speedY = (Math.random() * -0.3) - 0.1; // Float upwards softly
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '139, 92, 246' : '6, 182, 212';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
        this.y = canvas.height + 10; // Respawn at bottom
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ===== NAVBAR ===== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navLinks?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ===== ACTIVE NAV INDICATOR (5) ===== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('active'), i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => observer.observe(el));
}

function toYouTubeEmbed(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return 'https://www.youtube.com/embed/' + match[2];
  }
  return url;
}

function initModal() {
  const modal = document.getElementById('modal-overlay');
  if (!modal) return;
  const closeBtn = document.getElementById('modal-close');
  const iframe = modal.querySelector('iframe');
  const modalTitle = modal.querySelector('.modal-details h3');
  const modalDesc = modal.querySelector('.modal-details p');

  document.querySelectorAll('.portfolio-card').forEach(card => {
    if (card.dataset.modalInit) return;
    card.dataset.modalInit = 'true';

    card.addEventListener('click', () => {
      let videoUrl = card.dataset.video;
      const title = card.querySelector('.portfolio-name')?.textContent;
      const desc = card.querySelector('.portfolio-desc')?.textContent;

      // Convert any YouTube URL to embed format
      videoUrl = toYouTubeEmbed(videoUrl);

      if (iframe) iframe.src = videoUrl;

      modalTitle.textContent = title || '';
      modalDesc.textContent = desc || '';

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (!closeBtn.dataset.modalInit) {
    closeBtn.dataset.modalInit = 'true';
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (iframe) iframe.src = '';
      }, 300);
    };
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
  }
}

/* ===== ODOMETER COUNTER ===== */
function initOdometerCount() {
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.odometerDone) return;
        el.dataset.odometerDone = 'true';
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const digits = target.toString().split('');
        el.innerHTML = '';

        digits.forEach((digit, i) => {
          const wrapper = document.createElement('span');
          wrapper.className = 'odometer-digit';
          const inner = document.createElement('span');
          inner.className = 'odometer-digit-inner';
          for (let n = 0; n <= 9; n++) {
            const num = document.createElement('span');
            num.className = 'odometer-num';
            num.textContent = n;
            inner.appendChild(num);
          }
          wrapper.appendChild(inner);
          el.appendChild(wrapper);
          setTimeout(() => {
            inner.style.transform = `translateY(-${parseInt(digit) * 10}%)`;
          }, 300 + i * 200);
        });

        if (suffix) {
          const suffixEl = document.createElement('span');
          suffixEl.className = 'odometer-suffix';
          suffixEl.textContent = suffix;
          el.appendChild(suffixEl);
          setTimeout(() => { suffixEl.style.opacity = '1'; }, 300 + digits.length * 200 + 300);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

/* ===== CONTACT FORM ===== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Gönderiliyor...';

    const data = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        btn.innerHTML = '✓ Mesajınız Gönderildi!';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          form.reset();
        }, 3000);
      } else {
        throw new Error('Hata');
      }
    } catch (err) {
      btn.innerHTML = '✕ Hata Oluştu';
      btn.style.background = '#ff4444';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 3000);
    }
  });
}

/* ===== PREMIUM UI EFFECTS ===== */

// 1. Custom Cursor


// 2. 3D Tilt Effect
function initTilt() {
  const cards = document.querySelectorAll('.portfolio-card, .service-card');
  cards.forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = 'true';
    card.classList.add('tilt-card');

    let glareWrap = card.querySelector('.tilt-glare-wrap');
    if (!glareWrap) {
      glareWrap = document.createElement('div');
      glareWrap.className = 'tilt-glare-wrap';
      const glare = document.createElement('div');
      glare.className = 'tilt-glare';
      glareWrap.appendChild(glare);
      card.appendChild(glareWrap);
    }
    const glare = card.querySelector('.tilt-glare');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      if (card.classList.contains('service-card')) {
        card.style.setProperty('--glow-x', `${x}px`);
        card.style.setProperty('--glow-y', `${y}px`);
      }

      if (glare) {
        glare.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        glare.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      if (glare) glare.style.opacity = '0';
    });
  });
}

// 3. Magnetic Buttons
function initMagneticButtons() {
  const magnets = document.querySelectorAll('.magnetic');
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const h = rect.width / 2;
      const w = rect.height / 2;
      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - w;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });
}

// 4. Enhanced Parallax with 3D Depth
function initParallax() {
  const gradients = document.querySelectorAll('.hero-gradient');
  const parallaxElements = document.querySelectorAll('.parallax-element');
  const aboutImage = document.querySelector('.about-image-wrapper');
  const aboutVisual = document.querySelector('.about-visual');

  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    gradients.forEach((g, i) => {
      const speed = (i + 1) * 0.15;
      g.style.transform = `translateY(${scroll * speed}px)`;
    });
    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      const offset = (centerY - viewCenter) * 0.04;
      el.style.transform = `translateY(${offset}px)`;
    });
  });

  // 3D depth tilt on about image
  if (aboutVisual && aboutImage) {
    aboutVisual.addEventListener('mousemove', (e) => {
      const rect = aboutVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      aboutImage.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
    });
    aboutVisual.addEventListener('mouseleave', () => {
      aboutImage.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
    });
  }

  const floatCards = document.querySelectorAll('.about-float-card');
  window.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth - e.pageX * 2) / 90;
    const y = (window.innerHeight - e.pageY * 2) / 90;
    floatCards.forEach((c, i) => {
      const factor = i === 0 ? 1 : -1;
      c.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });
}

// 5. Glitch Effect
function initGlitch() {
  const text = document.querySelector('.hero-title .gradient-text');
  if (!text) return;
  setInterval(() => {
    text.classList.add('is-glitching');
    setTimeout(() => {
      text.classList.remove('is-glitching');
    }, 400);
  }, 3500);
}

// 6. Preloader
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const percentEl = document.getElementById('render-percent');
  const fillEl = document.querySelector('.render-bar-fill');
  const statusEl = document.getElementById('render-status');
  if (!preloader) return;

  document.body.style.overflow = 'hidden';

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 4; // Orta hız
    if (progress > 100) progress = 100;
    
    if (percentEl) percentEl.textContent = progress;
    if (fillEl) fillEl.style.width = progress + '%';
    
    if (statusEl) {
      if (progress < 50) statusEl.textContent = 'EDITING...';
      else statusEl.textContent = 'RENDERING...';
    }
    
    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        document.body.style.overflow = '';
        setTimeout(() => preloader.style.display = 'none', 500);
      }, 500); 
    }
  }, 90); // Süre biraz kısaltıldı
}


// 8. Split Text Reveal (Upgraded to GSAP)
function initSplitText() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const headings = document.querySelectorAll('.section-title');
  headings.forEach(heading => {
    if (heading.querySelector('.gsap-word')) return;
    let html = heading.innerHTML;
    // Replace <br> with space-padded <br> to split correctly
    html = html.replace(/<br\s*\/?>/gi, ' <br> ');
    const words = html.trim().split(/\s+/);

    heading.innerHTML = '';

    words.forEach((word, i) => {
      if (word.toLowerCase() === '<br>') {
        heading.appendChild(document.createElement('br'));
      } else {
        const span = document.createElement('span');
        span.className = 'gsap-word';
        span.style.display = 'inline-block';
        const needsSpace = (i < words.length - 1) && (words[i + 1].toLowerCase() !== '<br>');
        span.innerHTML = word + (needsSpace ? '&nbsp;' : '');
        heading.appendChild(span);
      }
    });

    gsap.fromTo(heading.querySelectorAll('.gsap-word'), 
      { opacity: 0, y: 40, rotationX: -40, transformOrigin: "0% 50% -50" },
      { 
        opacity: 1, y: 0, rotationX: 0, 
        duration: 0.8, 
        stagger: 0.08, 
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: heading,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
}

/* ===== NEW FEATURES ===== */

// 9. Smooth Scroll
function initSmoothScroll() {
  document.documentElement.style.scrollBehavior = 'smooth';

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });
}

// 10. Back to Top (7)
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}



// 12. Typing Effect
function initTypingEffect() {
  const container = document.getElementById('typing-current');
  if (!container) return;

  const words = {
    tr: ['Video Kurgu', 'Motion Graphics', 'Color Grading', 'Ses Tasarımı'],
    en: ['Video Editing', 'Motion Graphics', 'Color Grading', 'Sound Design']
  };

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWords = words[currentLang] || words.en;
    const currentWord = currentWords[wordIndex % currentWords.length];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }
    container.textContent = currentWord.substring(0, charIndex);

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex++;
      speed = 400;
    }

    setTimeout(type, speed);
  }

  type();
}

// 13. Testimonial Carousel (13)
function initTestimonialCarousel() {
  const track = document.getElementById('testimonial-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || !dotsContainer) return;

  const cards = track.querySelectorAll('.testimonial-card');
  if (cards.length === 0) return;

  let currentSlide = 0;
  let autoplayTimer;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    resetAutoplay();
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % cards.length);
  }

  function prevSlide() {
    goToSlide((currentSlide - 1 + cards.length) % cards.length);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  // Start autoplay
  autoplayTimer = setInterval(nextSlide, 5000);

  // Pause on hover
  const carousel = document.getElementById('testimonial-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    carousel.addEventListener('mouseleave', () => {
      autoplayTimer = setInterval(nextSlide, 5000);
    });
  }
}

// 14. Gradient Shift (12)
function initGradientShift() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth * 100).toFixed(1);
    const y = (e.clientY / window.innerHeight * 100).toFixed(1);
    heroBg.style.setProperty('--mouse-x', x + '%');
    heroBg.style.setProperty('--mouse-y', y + '%');
  });
}

// 15. Scroll Progress Bar (1)
function initProgressBar() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// 16. Page Transitions (11)
function initPageTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#contact') return; // Don't transition for small movements or contact 

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        overlay.classList.add('active');

        setTimeout(() => {
          // Fallback if smooth scroll is off, handled by smoothScroll loop usually
          if (window.innerWidth <= 768) {
            const targetScroll = target.offsetTop - 80;
            window.scrollTo({ top: targetScroll });
          }
          overlay.classList.remove('active');
        }, 300);
      }
    });
  });
}

// 17. Staggered Grid Reveal & Lazy Loading (8, 9)
function initAdvancedGrid() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  // Staggered Reveal
  const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('stagger-visible')) {
        setTimeout(() => {
          entry.target.classList.add('stagger-visible');
        }, delay);
        delay += 150; // 150ms stagger
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  // Add classes to all real cards (skip skeletons)
  grid.querySelectorAll('.portfolio-card:not(.skeleton-card)').forEach(card => {
    card.classList.add('stagger-enter');
    observer.observe(card);

    // Lazy loading for images inside cards
    const img = card.querySelector('img');
    if (img) {
      img.classList.add('lazy-image');

      // Artificial delay to show the blur effect for demo
      setTimeout(() => {
        if (img.complete) {
          img.classList.add('loaded');
        } else {
          img.addEventListener('load', () => img.classList.add('loaded'));
        }
      }, Math.random() * 500 + 500);
    }
  });
}

// 19. Text Highlight (Phase 2)
function initTextHighlight() {
  const aboutText = document.getElementById('aboutText');
  if (!aboutText) return;

  aboutText.classList.add('text-highlight');

  window.addEventListener('scroll', () => {
    const rect = aboutText.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate how much of the text is visible
    let progress = 0;
    if (rect.top < windowHeight && rect.bottom > 0) {
      const totalScrollable = rect.height + windowHeight;
      const scrolled = windowHeight - rect.top;
      progress = Math.max(0, Math.min(100, (scrolled / totalScrollable) * 100));
    }

    // Adjust logic to fill faster
    progress = progress * 1.5;
    if (progress > 100) progress = 100;

    aboutText.style.setProperty('--scroll-percent', progress + '%');
  });
}

/* ===== SERVICE STAGGER REVEAL ===== */
function initServiceStagger() {
  const cards = document.querySelectorAll('.service-card');
  if (cards.length === 0) return;

  cards.forEach(card => {
    card.classList.add('stagger-item');
    card.classList.remove('reveal');
  });

  const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('stagger-visible')) {
        setTimeout(() => {
          entry.target.classList.add('stagger-visible');
        }, delay);
        delay += 150;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  cards.forEach(card => observer.observe(card));
}

/* ===== TOAST NOTIFICATION SYSTEM ===== */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ===== PORTFOLIO FILTERS ===== */
function initPortfolioFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  if (buttons.length === 0 || cards.length === 0) return;

  buttons.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      newBtn.classList.add('active');
      const filter = newBtn.getAttribute('data-filter');

      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('hidden');
          // re-trigger animation
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = null;
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ===== FAQ ACCORDION ===== */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}
