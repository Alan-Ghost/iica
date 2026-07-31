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

    // Refresh dynamic 3x2 Roster cards for new language
    if (window.renderRosterSlots) {
      window.renderRosterSlots();
    }
  }

  // =============================================================================
  // 3x2 Dynamic Roster Card Spin Swap Engine
  // Displays 6 cards at a time, every 2 seconds one card swells, spins 360°, and swaps.
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

  // Active indices currently displayed in 6 slots [0..5]
  let activeIndices = [0, 1, 2, 3, 4, 5];
  let nextMemberIndex = 6;
  let slotPointer = 0;
  let rosterInterval = null;

  function renderCardContent(cardEl, memberIndex) {
    const member = ROSTER_MEMBERS[memberIndex];
    if (!member) return;
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
    if (slots.length < 6) return;
    slots.forEach(function(slotEl, i) {
      renderCardContent(slotEl, activeIndices[i]);
    });
  }

  function startRosterRotation() {
    const slots = document.querySelectorAll('.cert-roster-grid .roster-card');
    if (slots.length < 6) return;

    renderRosterSlots();

    if (rosterInterval) clearInterval(rosterInterval);

    rosterInterval = setInterval(function() {
      const targetSlot = slots[slotPointer];

      // Trigger swell & 360° spin animation
      targetSlot.classList.remove('card-spinning');
      void targetSlot.offsetWidth; // reflow
      targetSlot.classList.add('card-spinning');

      // Mid-spin swap member content at 350ms (when rotated 90deg edge-on)
      setTimeout(function() {
        const newMemberIdx = nextMemberIndex;
        activeIndices[slotPointer] = newMemberIdx;
        renderCardContent(targetSlot, newMemberIdx);

        // Advance indices
        nextMemberIndex = (nextMemberIndex + 1) % ROSTER_MEMBERS.length;
        slotPointer = (slotPointer + 1) % 6;
      }, 350);

      // Clean up animation class
      setTimeout(function() {
        targetSlot.classList.remove('card-spinning');
      }, 750);

    }, 2000);
  }

  document.addEventListener('DOMContentLoaded', function() {
    startRosterRotation();
  });

  window.renderRosterSlots = renderRosterSlots;

  // Expose for external use
  window.switchLanguage = switchLanguage;
  window.applyLanguage = applyLanguage;
})();
