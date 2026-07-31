// =============================================================================
// IICA Website - Internationalization (i18n) Language Switcher
// Supports: Korean (ko), English (en), Chinese (zh), Japanese (ja), Russian (ru)
// =============================================================================

(function() {
  'use strict';

  const LANG_LABELS = {
    ko: '한국어',
    en: 'English',
    zh: '中文',
    ja: '日本語',
    ru: 'Русский'
  };

  const LANG_SHORT = {
    ko: 'KR',
    en: 'EN',
    zh: 'ZH',
    ja: 'JA',
    ru: 'RU'
  };

  let currentLang = localStorage.getItem('iica_lang') || 'ko';

  // ---- DOM Ready ----
  document.addEventListener('DOMContentLoaded', function() {
    buildLangDropdown();
    applyLanguage(currentLang);
  });

  // ---- Build Language Dropdown UI ----
  function buildLangDropdown() {
    const langSelector = document.querySelector('.lang-selector');
    if (!langSelector) return;

    langSelector.innerHTML = '';

    // Main button
    const btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.id = 'langToggleBtn';
    btn.textContent = LANG_SHORT[currentLang] || 'KR';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');

    // Dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown';
    dropdown.id = 'langDropdown';

    Object.keys(LANG_LABELS).forEach(function(code) {
      const item = document.createElement('button');
      item.className = 'lang-dropdown-item' + (code === currentLang ? ' active' : '');
      item.setAttribute('data-lang', code);
      item.innerHTML = '<span class="lang-code">' + LANG_SHORT[code] + '</span><span class="lang-name">' + LANG_LABELS[code] + '</span>';
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        switchLanguage(code);
      });
      dropdown.appendChild(item);
    });

    langSelector.appendChild(btn);
    langSelector.appendChild(dropdown);

    // Toggle dropdown
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', function() {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  // ---- Switch Language ----
  function switchLanguage(lang) {
    if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('iica_lang', lang);
    applyLanguage(lang);

    // Update button text
    const btn = document.getElementById('langToggleBtn');
    if (btn) btn.textContent = LANG_SHORT[lang];

    // Update active state
    document.querySelectorAll('.lang-dropdown-item').forEach(function(item) {
      item.classList.toggle('active', item.getAttribute('data-lang') === lang);
    });

    // Close dropdown
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) dropdown.classList.remove('open');

    // Update html lang attribute
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  }

  // ---- Apply Language to All data-i18n Elements ----
  function applyLanguage(lang) {
    if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) return;
    const t = window.TRANSLATIONS[lang];

    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        // Check if element has child elements that should be preserved
        if (el.getAttribute('data-i18n-html') === 'true') {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    // Handle placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) {
        el.placeholder = t[key];
      }
    });

    // Handle title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      const key = el.getAttribute('data-i18n-title');
      if (t[key] !== undefined) {
        el.title = t[key];
      }
    });

    // Update page title
    if (t['page_title']) {
      document.title = t['page_title'];
    }
  }

  // Expose for external use
  window.switchLanguage = switchLanguage;
  window.applyLanguage = applyLanguage;
})();
