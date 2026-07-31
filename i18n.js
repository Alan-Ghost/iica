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

  // ---- Safe Initialization ----
  function initI18n() {
    buildLangDropdown();
    applyLanguage(currentLang);
    startRosterRotation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    // Run immediately if already interactive or complete
    setTimeout(initI18n, 10);
  }

  // ---- Build Language Dropdown UI ----
  function buildLangDropdown() {
    const langSelector = document.querySelector('.lang-selector');
    if (!langSelector) return;

    langSelector.innerHTML = '';

    // Main button - iOS requires cursor:pointer on clickable non-anchor elements
    const btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.id = 'langToggleBtn';
    btn.textContent = LANG_SHORT[currentLang] || 'KR';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.style.cursor = 'pointer'; // iOS Safari clickability fix

    // Dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown';
    dropdown.id = 'langDropdown';

    Object.keys(LANG_LABELS).forEach(function(code) {
      const item = document.createElement('button');
      item.className = 'lang-dropdown-item' + (code === currentLang ? ' active' : '');
      item.setAttribute('data-lang', code);
      item.style.cursor = 'pointer';
      item.innerHTML = '<span class="lang-code">' + LANG_SHORT[code] + '</span><span class="lang-name">' + LANG_LABELS[code] + '</span>';

      function handleItemSelect(e) {
        e.preventDefault();
        e.stopPropagation();
        switchLanguage(code);
      }
      item.addEventListener('click', handleItemSelect);
      item.addEventListener('touchend', handleItemSelect);
      dropdown.appendChild(item);
    });

    langSelector.appendChild(btn);
    langSelector.appendChild(dropdown);

    // Toggle dropdown
    var dropdownOpen = false;

    function openDropdown() {
      dropdownOpen = true;
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
      dropdownOpen = false;
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    // Touch handling for mobile - use touchend to avoid conflicts
    var touchMoved = false;
    btn.addEventListener('touchstart', function(e) {
      touchMoved = false;
    }, { passive: true });

    btn.addEventListener('touchmove', function(e) {
      touchMoved = true;
    }, { passive: true });

    btn.addEventListener('touchend', function(e) {
      if (touchMoved) return; // was a scroll, not a tap
      e.preventDefault();
      e.stopPropagation();
      if (dropdownOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Click for desktop
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (dropdownOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Close on outside touch/click
    document.addEventListener('touchstart', function(e) {
      if (langSelector && !langSelector.contains(e.target)) {
        closeDropdown();
      }
    }, { passive: true });

    document.addEventListener('click', function(e) {
      if (langSelector && !langSelector.contains(e.target)) {
        closeDropdown();
      }
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
        if (el.getAttribute('data-i18n-html') === 'true') {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) {
        el.placeholder = t[key];
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      const key = el.getAttribute('data-i18n-title');
      if (t[key] !== undefined) {
        el.title = t[key];
      }
    });

    if (t['page_title']) {
      document.title = t['page_title'];
    }

    if (window.renderRosterSlots) {
      window.renderRosterSlots();
    }
  }

  // =============================================================================
  // 3x2 Dynamic Roster Card Spin Swap Engine
  // =============================================================================
  const ROSTER_MEMBERS = [
    { nameKey: 'roster_name_kang_bin', defaultName: '강O빈', items: [{ key: 'roster_item_kpop_1', defaultVal: '방송댄스 (K-pop) 1급' }] },
    { nameKey: 'roster_name_ko_ra', defaultName: '고O라', items: [{ key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }] },
    { nameKey: 'roster_name_kim_won', defaultName: '김O원', items: [{ key: 'roster_item_street_3', defaultVal: '스트릿댄스지도자 3급' }, { key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }, { key: 'roster_item_belly_3', defaultVal: '밸리댄스 3급' }] },
    { nameKey: 'roster_name_kim_hee', defaultName: '김O희', items: [{ key: 'roster_item_career_1', defaultVal: '취업전략지도관 1급' }] },
    { nameKey: 'roster_name_baek_jeong', defaultName: '백O정', items: [{ key: 'roster_item_belly_3', defaultVal: '밸리댄스 3급' }] },
    { nameKey: 'roster_name_park_woo', defaultName: '박O우', items: [{ key: 'roster_item_career_1', defaultVal: '취업전략지도관 1급' }] },
    { nameKey: 'roster_name_oh_na', defaultName: '오O나', items: [{ key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }] },
    { nameKey: 'roster_name_oh_hyun', defaultName: '오O현', items: [{ key: 'roster_item_career_1', defaultVal: '취업전략지도관 1급' }] },
    { nameKey: 'roster_name_yoon_won', defaultName: '윤O원', items: [{ key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }] },
    { nameKey: 'roster_name_yoon_jin', defaultName: '윤O진', items: [{ key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }] },
    { nameKey: 'roster_name_lee_ran', defaultName: '이O란', items: [{ key: 'roster_item_kpop_1', defaultVal: '방송댄스 (K-pop) 1급' }] },
    { nameKey: 'roster_name_lee_jin', defaultName: '이O진', items: [{ key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }] },
    { nameKey: 'roster_name_lim_eun', defaultName: '임O은', items: [{ key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }] },
    { nameKey: 'roster_name_cho_ram', defaultName: '조O람', items: [{ key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }, { key: 'roster_item_belly_3', defaultVal: '밸리댄스 3급' }, { key: 'roster_item_street_3', defaultVal: '스트릿댄스지도자 3급' }] },
    { nameKey: 'roster_name_cho_seo', defaultName: '조O서', items: [{ key: 'roster_item_belly_3', defaultVal: '밸리댄스 3급' }] },
    { nameKey: 'roster_name_cha_ryeong', defaultName: '차O령', items: [{ key: 'roster_item_belly_3', defaultVal: '밸리댄스 3급' }] },
    { nameKey: 'roster_name_choi_ji', defaultName: '최O지', items: [{ key: 'roster_item_kpop_3', defaultVal: '방송댄스 (K-pop) 3급' }] },
    { nameKey: 'roster_name_pyo_hee', defaultName: '표O희', items: [{ key: 'roster_item_career_1', defaultVal: '취업전략지도관 1급' }] }
  ];

  let currentSetIndex = 0;
  let rosterInterval = null;

  function getGroupIndices(setIdx) {
    const start = setIdx * 6;
    return [start, start + 1, start + 2, start + 3, start + 4, start + 5];
  }

  function renderCardContent(cardEl, memberIndex) {
    const member = ROSTER_MEMBERS[memberIndex];
    if (!member || !cardEl) return;
    const t = (window.TRANSLATIONS && window.TRANSLATIONS[currentLang]) || {};

    const nameText = t[member.nameKey] || member.defaultName;

    let itemsHtml = '';
    member.items.forEach(function(it) {
      const val = t[it.key] || it.defaultVal;
      itemsHtml += '<li data-i18n="' + it.key + '">' + val + '</li>';
    });

    cardEl.setAttribute('data-member-idx', memberIndex);
    cardEl.innerHTML = 
      '<h4 class="roster-name" data-i18n="' + member.nameKey + '">' + nameText + '</h4>' +
      '<ul class="roster-list">' + itemsHtml + '</ul>';
  }

  function renderRosterSlots() {
    const slots = document.querySelectorAll('.cert-roster-grid .roster-card');
    if (!slots || slots.length === 0) return;
    const currentIndices = getGroupIndices(currentSetIndex);
    slots.forEach(function(slotEl, i) {
      if (currentIndices[i] !== undefined) {
        renderCardContent(slotEl, currentIndices[i]);
      }
    });
  }

  function startRosterRotation() {
    var slots = document.querySelectorAll('.cert-roster-grid .roster-card');
    if (!slots || slots.length === 0) return;

    renderRosterSlots();

    if (rosterInterval) clearInterval(rosterInterval);

    var isMobile = window.innerWidth <= 768;

    rosterInterval = setInterval(function() {
      var activeSlots = document.querySelectorAll('.cert-roster-grid .roster-card');
      if (!activeSlots || activeSlots.length === 0) return;

      isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Mobile: scaleX flip + bounce (3D-free, WebKit-safe)
        activeSlots.forEach(function(slotEl, i) {
          slotEl.style.transition = 'transform 0.35s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
          slotEl.style.transform = 'scaleX(0) scaleY(0.8)';
        });

        setTimeout(function() {
          currentSetIndex = (currentSetIndex + 1) % 3;
          var nextIndices = getGroupIndices(currentSetIndex);
          activeSlots.forEach(function(slotEl, i) {
            if (nextIndices[i] !== undefined) {
              renderCardContent(slotEl, nextIndices[i]);
            }
            // Bounce back with overshoot
            slotEl.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            slotEl.style.transform = 'scaleX(1) scaleY(1)';
          });
        }, 380);

      } else {
        // Desktop: 3-turn 1080° spin swap
        activeSlots.forEach(function(slotEl) {
          slotEl.classList.remove('card-triple-spin');
          void slotEl.offsetWidth;
          slotEl.classList.add('card-triple-spin');
        });

        setTimeout(function() {
          currentSetIndex = (currentSetIndex + 1) % 3;
          var nextIndices = getGroupIndices(currentSetIndex);
          activeSlots.forEach(function(slotEl, i) {
            if (nextIndices[i] !== undefined) {
              renderCardContent(slotEl, nextIndices[i]);
            }
          });
        }, 450);

        setTimeout(function() {
          activeSlots.forEach(function(slotEl) {
            slotEl.classList.remove('card-triple-spin');
          });
        }, 950);
      }

    }, 3000);
  }

  window.renderRosterSlots = renderRosterSlots;
  window.startRosterRotation = startRosterRotation;

  // Expose for external use
  window.switchLanguage = switchLanguage;
  window.applyLanguage = applyLanguage;
})();
