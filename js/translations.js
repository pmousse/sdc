/**
 * translations.js — Multilingual support
 * 
 * Usage:
 *   1. Add data-i18n="key" to HTML elements (e.g., data-i18n="hero.title")
 *   2. Add data-i18n-placeholder="key" for input placeholders
 *   3. Add data-i18n-alt="key" for img alt text
 *   4. Call I18n.init() after DOM loads
 *   5. Call I18n.setLang('fr') or I18n.setLang('en') to switch
 * 
 * To add a language:
 *   1. Add translations to translations.json
 *   2. Add a button to the language switcher in HTML
 */

const I18n = (function () {
  let translations = {};
  let currentLang = 'fr'; // Default to French

  /**
   * Load translations from JSON file
   */
  async function loadTranslations() {
    try {
      const response = await fetch('translations.json');
      translations = await response.json();
    } catch (e) {
      // Fallback: try to use localStorage cached translations
      const cached = localStorage.getItem('i18n_translations');
      if (cached) {
        translations = JSON.parse(cached);
      }
    }
  }

  /**
   * Get a nested value from translations using dot notation
   * e.g., 'hero.title' → translations.en.hero.title
   */
  function t(key) {
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations['en'];
        for (const kk of keys) {
          if (value && typeof value === 'object' && kk in value) {
            value = value[kk];
          } else {
            return key; // Return key itself if not found
          }
        }
      }
    }
    return typeof value === 'string' ? value : key;
  }

  /**
   * Apply translations to all elements with data-i18n attributes
   */
  function applyTranslations() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const value = t(key);
      if (value) el.textContent = value;
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = t(key);
      if (value) el.setAttribute('placeholder', value);
    });

    // Alt text for images
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-alt');
      const value = t(key);
      if (value) el.setAttribute('alt', value);
    });

    // Page title
    const titleEl = document.querySelector('title');
    const siteTitle = t('site.title');
    if (titleEl && siteTitle) titleEl.textContent = siteTitle;

    // Meta description
    const descEl = document.querySelector('meta[name="description"]');
    const siteDesc = t('site.description');
    if (descEl && siteDesc) descEl.setAttribute('content', siteDesc);
  }

  /**
   * Update active state on language switcher buttons
   */
  function updateActiveButton() {
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      if (btn.getAttribute('data-lang') === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Set language and apply
   */
  async function setLang(lang) {
    if (!translations[lang]) {
      console.warn('[I18n] Language not available:', lang);
      return;
    }
    currentLang = lang;
    localStorage.setItem('i18n_lang', lang);
    applyTranslations();
    updateActiveButton();
    
    // Update portfolio translations if available
    if (typeof Portfolio !== 'undefined' && Portfolio.updateTranslations) {
      await Portfolio.updateTranslations();
    }
  }

  /**
   * Initialize: load translations and apply
   */
  function init() {
    // Detect language from localStorage or browser
    const saved = localStorage.getItem('i18n_lang');
    const browser = navigator.language && navigator.language.startsWith('fr') ? 'fr' : 'en';
    currentLang = saved || browser;

    return loadTranslations().then(function () {
      applyTranslations();
      updateActiveButton();
    });
  }

  return {
    init: init,
    setLang: setLang,
    t: t,
    getLang: function () { return currentLang; }
  };
})();

// I18n is initialized centrally from index.html
// No auto-init here to avoid duplicate calls
