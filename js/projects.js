/**
 * projects.js — Portfolio carousel with animated transitions
 * Loads projects from projects.json and renders an animated carousel
 */

const Portfolio = (function () {
  let projects = [];
  let currentIndex = 0;
  let track = null;
  let indicators = null;
  let isAnimating = false;

  /**
   * Load projects from JSON based on current language
   */
  async function loadProjects() {
    const lang = I18n ? I18n.getLang() : 'fr';
    try {
      const response = await fetch('projects.json');
      const data = await response.json();
      projects = data[lang] || data['en'] || [];
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Render project cards into the carousel track
   */
  function renderProjects() {
    if (!track) return;
    
    track.innerHTML = projects.map(function (project, i) {
      const isActive = i === 0 ? ' active' : '';
      const visibility = i === 0 ? 'visible' : 'hidden';
      return `
        <div class="carousel-slide${isActive}" data-index="${i}" style="visibility: ${visibility};">
          <figure class="project-card">
            <img
              src="${project.image}"
              alt="${project.title}"
              width="800"
              height="600"
              loading="lazy"
            >
            <figcaption class="project-info">
              <span class="project-category">${project.category}</span>
              <h3 class="project-title">${project.title}</h3>
              <p class="project-desc">${project.description}</p>
            </figcaption>
          </figure>
        </div>
      `;
    }).join('');

    // Create indicators
    if (indicators) {
      indicators.innerHTML = projects.map(function (_, i) {
        return `<button class="carousel-indicator${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to project ${i + 1}"></button>`;
      }).join('');
    }
  }

  /**
   * Update project translations when language changes
   * Uses cached data after first load to avoid refetching
   */
  async function updateTranslations() {
    const lang = I18n ? I18n.getLang() : 'fr';
    // Re-fetch only if projects haven't been loaded yet
    if (projects.length === 0) {
      await loadProjects();
    } else {
      projects = projects; // Already loaded, just re-render with current lang context
      // For proper i18n, the data should be language-aware; re-fetch if needed
      const response = await fetch('projects.json');
      const data = await response.json();
      projects = data[lang] || data['en'] || [];
    }
    renderProjects();
    setupEvents();
    
    // Reset to first slide
    goToSlide(0);
  }

  /**
   * Navigate to a specific slide
   */
  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    if (index < 0 || index >= projects.length) return;

    isAnimating = true;
    const direction = index > currentIndex ? 1 : -1;
    
    // Hide all slides
    track.querySelectorAll('.carousel-slide').forEach(function (slide) {
      slide.classList.remove('active');
      slide.style.visibility = 'hidden';
    });
    
    // Prepare and show next slide
    const nextSlide = track.querySelector(`[data-index="${index}"]`);
    
    if (nextSlide) {
      nextSlide.classList.add('active');
      nextSlide.style.visibility = 'visible';
      gsap.set(nextSlide, { opacity: 0, x: direction * 100 });
      
      gsap.to(nextSlide, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: function () {
          isAnimating = false;
        }
      });
    }

    currentIndex = index;
    updateIndicators();
  }

  /**
   * Go to next slide
   */
  function next() {
    const nextIndex = (currentIndex + 1) % projects.length;
    goToSlide(nextIndex);
  }

  /**
   * Go to previous slide
   */
  function prev() {
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    goToSlide(prevIndex);
  }

  /**
   * Update indicator buttons
   */
  function updateIndicators() {
    if (!indicators) return;
    
    indicators.querySelectorAll('.carousel-indicator').forEach(function (btn, i) {
      if (i === currentIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Setup event listeners
   */
  function setupEvents() {
    // Previous button
    const prevBtn = document.querySelector('.carousel-btn--prev');
    if (prevBtn) prevBtn.addEventListener('click', prev);
    
    // Next button
    const nextBtn = document.querySelector('.carousel-btn--next');
    if (nextBtn) nextBtn.addEventListener('click', next);
    
    // Indicator buttons
    if (!indicators) return;
    indicators.addEventListener('click', function (e) {
      if (e.target.classList.contains('carousel-indicator')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        goToSlide(index);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    }, { passive: true });
  }

  /**
   * Initialize the carousel
   */
  async function init() {
    track = document.getElementById('carousel-track');
    indicators = document.getElementById('carousel-indicators');
    
    const loaded = await loadProjects();
    if (!loaded || projects.length === 0) {
      return;
    }

    renderProjects();
    setupEvents();
    
    // Initial animation
    const firstSlide = track.querySelector('[data-index="0"]');
    if (firstSlide) {
      gsap.from(firstSlide, {
        opacity: 0,
        x: 50,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
    
  }

  return {
    init: init,
    updateTranslations: updateTranslations
  };
})();

// Portfolio is initialized centrally from index.html after I18n.init()
// No auto-init here to avoid duplicate calls
