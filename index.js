// DOM elements selection
const videoContainer = document.querySelector('.video-container');
const bgVideo = document.getElementById('bg-video');
const heroText = document.querySelector('.hero-text-wrap');
const header = document.querySelector('.header');

// Variables for smooth easing scroll interpolation (Lerp)
let targetScrollY = 0;
let currentScrollY = 0;
const ease = 0.085; // Lower values = smoother, heavier glide (0.085 is optimal for 60fps)

// Smooth scroll loop
function animateSmoothScroll() {
  // Interpolation logic
  currentScrollY += (targetScrollY - currentScrollY) * ease;

  const viewportHeight = window.innerHeight;
  const isMobile = window.innerWidth <= 768;
  const headerHeightPx = isMobile ? 60 : 80;
  
  // Target cutout margins and radius
  const targetTop = headerHeightPx;                 // Exactly matches header height in pixels
  const targetBottom = isMobile ? 26 : 32;          // vh margin to cut on bottom (32vh)
  const targetLeftRight = isMobile ? 8 : 18;        // vw margin to cut on left/right (18vw)
  const targetRadius = isMobile ? 40 : 56;          // px rounded corners (56px)

  // 100% Natural Alignment Sync Formula:
  const animationDistance = viewportHeight * (targetBottom / 100); // Exactly 32vh in pixels
  const ratio = Math.min(currentScrollY / animationDistance, 1);

  // 1. Header background styling (Triggered by actual/target scroll position)
  if (targetScrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // 2. Video Container Scale Down Effect (Reflow-free clip-path)
  const currentTop = ratio * targetTop;
  const currentBottom = ratio * targetBottom;
  const currentLeftRight = ratio * targetLeftRight;
  const currentRadius = ratio * targetRadius;

  // Apply clip-path with pixel-level precision for the top cut
  videoContainer.style.clipPath = `inset(${currentTop}px ${currentLeftRight}vw ${currentBottom}vh ${currentLeftRight}vw round ${currentRadius}px)`;

  // 3. Dynamic Video Content Scaling (Zoom-out)
  // Instead of just cropping the edges via clip-path, we scale down the actual video content
  // in 1:1 sync with the clipping mask to fit the entire video scene within the card!
  const targetVideoScale = isMobile ? 0.78 : 0.65; // Matches the physical boundary of the card
  const currentVideoScale = 1 - (ratio * (1 - targetVideoScale));
  bgVideo.style.transform = `scale3d(${currentVideoScale}, ${currentVideoScale}, 1)`;
  bgVideo.style.transformOrigin = 'center center';

  // 4. Hero text scale down, align & keep bright (Directly synced with video shrink)
  const targetTextScale = 0.60;
  const currentTextScale = 1 - (ratio * (1 - targetTextScale));
  const textTranslateY = -ratio * 40; // Parallax lift
  const textTranslateX = currentLeftRight;

  heroText.style.opacity = 1.0; 
  heroText.style.transform = `translate3d(${textTranslateX}vw, ${textTranslateY}px, 0) scale3d(${currentTextScale}, ${currentTextScale}, 1)`;
  heroText.style.transformOrigin = 'left center'; 

  // 5. Handle fixed-to-scroll translation after shrink animation completes (Magnet Sync Fix)
  const overflowScroll = Math.max(currentScrollY - animationDistance, 0);
  videoContainer.style.transform = `translate3d(0, -${overflowScroll}px, 0)`;

  // 6. Add shadow when shrunk
  if (ratio > 0.1) {
    videoContainer.style.boxShadow = `0 25px 50px -12px rgba(0, 0, 0, ${ratio * 0.55})`;
  } else {
    videoContainer.style.boxShadow = 'none';
  }

  // 7. Calculate 3D perspective height stretching for Marquee Cards
  updateCardPerspective();

  // Keep looping the animation frame
  requestAnimationFrame(animateSmoothScroll);
}

// Track target scroll position on window scroll event
window.addEventListener('scroll', () => {
  targetScrollY = window.scrollY;
});

// Initialize the smooth animation loop
window.addEventListener('DOMContentLoaded', () => {
  // Set initial scroll state in case of browser refresh
  targetScrollY = window.scrollY;
  currentScrollY = window.scrollY;
  
  // Start loop
  animateSmoothScroll();
});

// Update logic instantly on window resize
window.addEventListener('resize', () => {
  targetScrollY = window.scrollY;
});

// 5. Logo Click -> Smooth scroll to top
const logoBtn = document.getElementById('logo-btn');
logoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  targetScrollY = 0; // Sync animation target
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// 6. Navigation Link Click -> Smooth scroll with dynamic header offset
const navLinks = document.querySelectorAll('.nav a');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const headerOffset = window.innerWidth <= 768 ? 60 : 80; // Match dynamic header heights
      const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      
      targetScrollY = offsetPosition; // Sync animation target
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// 7. iParking-inspired High-Contrast 3D Perspective Curvature & Edge Height Stretching
function updateCardPerspective() {
  const cards = document.querySelectorAll('.gallery-card');
  const windowWidth = window.innerWidth;
  const centerX = windowWidth / 2;

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.right > -250 && rect.left < windowWidth + 250) {
      const cardCenterX = rect.left + rect.width / 2;
      const distFromCenter = (cardCenterX - centerX) / (centerX * 0.9);
      const clampedDist = Math.max(-1, Math.min(1, distFromCenter));
      const absDist = Math.abs(clampedDist);

      // High-contrast height stretching: 0.82 at center -> 1.38 at edges (68% vertical contrast gap!)
      const scaleY = 0.82 + Math.pow(absDist, 1.3) * 0.56;
      // 3D perspective Y-axis rotation
      const rotateY = -clampedDist * 10;
      // Parallax depth translation
      const translateZ = -absDist * 30;

      card.style.transform = `perspective(900px) rotateY(${rotateY.toFixed(2)}deg) scaleY(${scaleY.toFixed(3)}) translateZ(${translateZ.toFixed(1)}px)`;
      card.style.transformOrigin = 'center center';
    }
  });
}

// ----------------------------------------------------
// Scroll-driven Title Splitting and Merging Effect
// ----------------------------------------------------
window.addEventListener('scroll', () => {
  const splitTitles = document.querySelectorAll('.scroll-split-title');
  if (splitTitles.length === 0) return;

  const winHeight = window.innerHeight;
  const isMobile = window.innerWidth <= 768;

  splitTitles.forEach(title => {
    const leftText = title.querySelector('.split-left');
    const rightText = title.querySelector('.split-right');
    if (!leftText || !rightText) return;

    const rect = title.getBoundingClientRect();

    // Triggers when title is in scroll-view range (both mobile & desktop)
    if (rect.top < winHeight && rect.bottom > 0) {
      // Progress range: 0 (entering viewport) to 1 (leaving viewport)
      const progress = (winHeight - rect.top) / (winHeight + rect.height);
      
      // Responsive Maximum side displacement in pixels (Mobile: ~100px, Desktop: ~180px)
      const maxOffset = isMobile ? Math.min(window.innerWidth * 0.3, 110) : 180;
      
      // Linear multiplier (2.2) guarantees fast merge/lock by the time title reaches mid-screen
      const offset = Math.max(0, maxOffset * (1 - (progress * 2.2)));
      const opacity = Math.min(1, progress * 2.5);

      leftText.style.transform = `translateX(${-offset.toFixed(1)}px)`;
      leftText.style.opacity = opacity.toFixed(2);

      rightText.style.transform = `translateX(${offset.toFixed(1)}px)`;
      rightText.style.opacity = opacity.toFixed(2);
    }
  });
});

// ----------------------------------------------------
// Scroll-linked 3D Zoom Document Showcase
// ----------------------------------------------------
window.addEventListener('scroll', () => {
  const docArea = document.getElementById('scrollZoomDocArea');
  const wrapper = document.getElementById('scrollZoomWrapper');
  const license = document.getElementById('scrollZoomLicense');
  const badge = document.getElementById('scrollZoomBadge');
  
  if (!docArea || !wrapper || !license || !badge) return;

  const isMobile = window.innerWidth <= 768;
  const rect = docArea.getBoundingClientRect();
  const winHeight = window.innerHeight;
  const docAreaHeight = rect.height;

  // Sticky alignment locks at 15vh from top to match refined CSS
  const triggerPoint = winHeight * 0.15;
  
  // Compute dynamic height of wrapper instead of hardcoded value
  const wrapperHeight = wrapper.offsetHeight || 310;

  // Start zooming the very moment the container enters from the bottom of the screen
  if (rect.top < winHeight) {
    // Determine the scroll path length from entering bottom to the pinning midpoint
    const zoomStartPos = winHeight;
    const zoomEndPos = triggerPoint + wrapperHeight;
    const totalZoomPath = zoomStartPos - zoomEndPos;
    
    // Linear progress ratio: 0 (just entering bottom) to 1 (reaches near mid-lock)
    let progress = Math.min(1, Math.max(0, (winHeight - rect.top) / totalZoomPath));
    
    // Fine-tuned progress curve for smoother deceleration
    const easedProgress = Math.sin(progress * Math.PI / 2);

    // Scale spans from 0.6x (compact) to 1.45x maximum to ensure no height overflow/cropping
    const scale = 0.6 + (easedProgress * 0.85);
    
    wrapper.style.transform = `scale(${scale.toFixed(3)}) translateZ(0)`;
    wrapper.style.opacity = Math.min(1, 0.35 + easedProgress * 0.65).toFixed(2);

    // Seal and badge pops in elasticaly when it scales to 85% completion
    if (progress > 0.85) {
      license.classList.add('active');
      badge.classList.add('active');
      wrapper.classList.add('full-expansion');
    } else {
      license.classList.remove('active');
      badge.classList.remove('active');
      wrapper.classList.remove('full-expansion');
    }
  } else {
    // Completely out of screen view at the bottom
    wrapper.style.transform = `scale(0.6) translateZ(0)`;
    wrapper.style.opacity = '0';
    license.classList.remove('active');
    badge.classList.remove('active');
    wrapper.classList.remove('full-expansion');
  }

  // Handle Option B: 3D Depth Pop-out & Neon Glow Pulse Triggers for all portfolio blocks
  const pulsePops = document.querySelectorAll('.scroll-pulse-pop');
  pulsePops.forEach(pulsePop => {
    const pRect = pulsePop.getBoundingClientRect();
    // Triggers instantly when entering lower 88% of screen to eliminate any scroll delay or fatigue
    if (pRect.top < winHeight * 0.88 && pRect.bottom > 0) {
      pulsePop.classList.add('active');
    } else {
      pulsePop.classList.remove('active');
    }
  });


});

/* ==========================================================================
   3-Row Alternating Infinite Marquee Gallery System (AI Creator Awards Inspired)
   ========================================================================== */
// 1. Global Competition Assets
const row1Assets = [
  { title: 'Aim High World Finals 국제 스트릿 댄스 배틀', src: '/images/02portfolio/global/1591241549941.jpg' },
  { title: '글로벌 아티스트 초청 및 마스터 클래스 워크숍', src: '/images/02portfolio/global/1591241595359.jpg' },
  { title: '세계 무대 출전 지도자 선발 파이널 무대', src: '/images/02portfolio/global/1591241600534.jpg' },
  { title: 'Aim High World Finals 챔피언십 시상식', src: '/images/02portfolio/global/1591244732690.jpg' },
  { title: '벨리 댄스 국제 부문 그랑프리 경연 현장', src: '/images/02portfolio/global/1592998449624.jpg' },
  { title: 'Aim High World Finals 갈라쇼 현장', src: '/images/02portfolio/global/1592998480670.jpg' },
  { title: '전세계 20개국 참가 지도사 아카이빙 세션', src: '/images/02portfolio/global/1592998653888.jpg' },
  { title: '글로벌 청소년 댄스 루키 인터내셔널 매치', src: '/images/02portfolio/global/1592998678795.jpg' }
];

const row2Assets = [
  { title: '국제 스트릿 댄스 지도사 심사위원단 워크숍', src: '/images/02portfolio/global/1592998693647.jpg' },
  { title: 'Aim High World Finals 백스테이지 아티스트 세션', src: '/images/02portfolio/global/1592998696248.jpg' },
  { title: '국제 대회 무대 기획 및 연출 디렉션', src: '/images/02portfolio/global/1592998921623.jpg' },
  { title: '글로벌 챔피언십 결선 무대 하이라이트', src: '/images/02portfolio/global/1592998971935.jpg' },
  { title: 'Aim High World Finals 메인 오프닝 퍼포먼스', src: '/images/02portfolio/global/1592999873619.jpg' },
  { title: '국제 벨리댄스 라이징 스타 그랑프리 무대', src: '/images/02portfolio/global/1593000006434.jpg' },
  { title: '글로벌 지도사 연합 시그니처 갈라 쇼', src: '/images/02portfolio/global/1593000017662.jpg' },
  { title: 'Aim High World Finals 시상 및 메달 수여식', src: '/images/02portfolio/global/1593000031670.jpg' }
];

const row3Assets = [
  { title: '글로벌 댄스 배틀 챔피언십 파이널 듀엣 경연', src: '/images/02portfolio/global/1593000035541.jpg' },
  { title: '국제 대표 심사위원단 공식 기념 촬영', src: '/images/02portfolio/global/1593000166839.jpg' },
  { title: 'Aim High World Finals 주니어 인터내셔널 매치', src: '/images/02portfolio/global/1593000169670.jpg' },
  { title: '전세계 지도자 교류 웰컴 레셉션 파티', src: '/images/02portfolio/global/1593000172625.jpg' },
  { title: '글로벌 아티스트 무대 퍼포먼스 클라이맥스', src: '/images/02portfolio/global/1593000179988.jpg' },
  { title: 'Aim High World Finals 크루 배틀 파이널전', src: '/images/02portfolio/global/1593000182900.jpg' },
  { title: '국제 대회 공로상 및 트로피 수여식 현장', src: '/images/02portfolio/global/1593000189497.jpg' },
  { title: 'Aim High World Finals 엔딩 하모니 콘서트', src: '/images/02portfolio/global/1593000214539.jpg' },
  { title: '글로벌 아티스트 아카이빙 세션', src: '/images/02portfolio/global/kakaostory_2023_05_09_14_40_09.jpg' },
  { title: '글로벌 스트릿 댄스 지도사 네트워킹 아카이브', src: '/images/02portfolio/global/1593000233349.jpg' }
];

// 2. Regional & Category Competition Assets
const regionalRow1Assets = [
  { title: '전국 50개 지부 통합 지도사 영재 발굴전', src: '/images/02portfolio/regional/1529930870314.jpg' },
  { title: '대한민국 대표 지도자 시그니처 루틴 경연', src: '/images/02portfolio/regional/1591241561056.jpg' },
  { title: 'Aim High Korea 지역 예선 챔피언십', src: '/images/02portfolio/regional/1592997986362.jpg' },
  { title: '실용무용 및 에어로빅스 지도사 실기 검증전', src: '/images/02portfolio/regional/1741565553400-29.jpg' },
  { title: '전국 주니어 댄스 아티스트 챔피언십 무대', src: '/images/02portfolio/regional/1771916297494.jpg' },
  { title: '지역 지부 연계 예술 체육 네트워크 기획', src: '/images/02portfolio/regional/1776900947932.jpg' },
  { title: 'NMAC 남양주 밸리댄스 대회 메인 갈라쇼', src: '/images/02portfolio/regional/20170610_220944.jpg' }
];

const regionalRow2Assets = [
  { title: 'NMAC 밸리댄스 전국 선수권 대회 현장', src: '/images/02portfolio/regional/20170611_123928.jpg' },
  { title: 'Aim High Korea 지역 지부 시상 및 파티', src: '/images/02portfolio/regional/AV3U6591.jpg' },
  { title: 'NMAC 유소년 밸리댄스 영재 부문 시상식', src: '/images/02portfolio/regional/AV3U6725.jpg' },
  { title: '지역 대표 지도자 연합 갈라 퍼포먼스', src: '/images/02portfolio/regional/AV3U6798.jpg' },
  { title: 'NMAC 챔피언십 그랑프리 시상 현장', src: '/images/02portfolio/regional/AV3U6801.jpg' },
  { title: '전국 지부 대표 지도자 하모니 콘서트', src: '/images/02portfolio/regional/1777736336268.jpg' },
  { title: 'Aim High Korea 시상 및 성과 보고 파티', src: '/images/02portfolio/regional/1776903492671.jpg' }
];

const regionalRow3Assets = [
  { title: 'NMAC 전국 밸리댄스 경연 대회 듀엣 부문', src: '/images/02portfolio/regional/1771916298941.jpg' },
  { title: '지역 예술 체육 네트워킹 아카이빙 세션', src: '/images/02portfolio/regional/1771916299463.jpg' },
  { title: 'Aim High Korea 주니어 댄스 파이널 시상', src: '/images/02portfolio/regional/B612_20190623_115826_650.jpg' },
  { title: 'NMAC 밸리댄스 페스티벌 오프닝 무대', src: '/images/02portfolio/regional/B612_20210515_201045_658.jpg' },
  { title: '카카오스토리 아카이브 밸리댄스 대회 현장', src: '/images/02portfolio/regional/kakaostory_20220223_175421.jpg' },
  { title: '전국 밸리댄스 참가 선수단 단체 기념 촬영', src: '/images/02portfolio/regional/kakaostory_20220223_175429.jpg' },
  { title: 'NMAC 지도자 포럼 및 성과 파티 세션', src: '/images/02portfolio/regional/kakaostory_20220314_201204.jpg' }
];

// 3. Certification Archive Assets
const certRow1Assets = [
  { title: '대한민국 주무부처 정식 등록 지도자 자격 검증서', src: '/images/01about/license.jpg' },
  { title: 'IICA 사단법인 인가 공식 CERTIFIED 마크', src: '/images/01about/certified.png' },
  { title: '글로벌 표준 지도자 자격 검증 실적 아카이브', src: '/images/01about/cert_3048.jpg' },
  { title: '국제 대표 지도자 공인 인증 배지', src: '/images/01about/certified_badge.png' },
  { title: '대한민국 주무부처 정식 등록 지도자 자격 검증서', src: '/images/01about/license.jpg' }
];

const certRow2Assets = [
  { title: 'IICA 사단법인 인가 공식 CERTIFIED 마크', src: '/images/01about/certified.png' },
  { title: '글로벌 표준 지도자 자격 검증 실적 아카이브', src: '/images/01about/cert_3048.jpg' },
  { title: '대한민국 주무부처 정식 등록 지도자 자격 검증서', src: '/images/01about/license.jpg' },
  { title: '국제 대표 지도자 공인 인증 배지', src: '/images/01about/certified_badge.png' },
  { title: 'IICA 사단법인 인가 공식 CERTIFIED 마크', src: '/images/01about/certified.png' }
];

const certRow3Assets = [
  { title: '글로벌 표준 지도자 자격 검증 실적 아카이브', src: '/images/01about/cert_3048.jpg' },
  { title: '대한민국 주무부처 정식 등록 지도자 자격 검증서', src: '/images/01about/license.jpg' },
  { title: '대한민국 주무부처 정식 등록 지도자 자격 검증서', src: '/images/01about/license.jpg' },
  { title: '국제 대표 지도자 공인 인증 배지', src: '/images/01about/certified_badge.png' },
  { title: 'IICA 사단법인 인가 공식 CERTIFIED 마크', src: '/images/01about/certified.png' },
  { title: '글로벌 표준 지도자 자격 검증 실적 아카이브', src: '/images/01about/cert_3048.jpg' }
];

function initMultiRowMarquee() {
  const track1 = document.getElementById('marqueeTrack1');
  const track2 = document.getElementById('marqueeTrack2');
  const track3 = document.getElementById('marqueeTrack3');
  
  const regTrack1 = document.getElementById('regMarqueeTrack1');
  const regTrack2 = document.getElementById('regMarqueeTrack2');
  const regTrack3 = document.getElementById('regMarqueeTrack3');

  const certTrack1 = document.getElementById('certMarqueeTrack1');
  const certTrack2 = document.getElementById('certMarqueeTrack2');
  const certTrack3 = document.getElementById('certMarqueeTrack3');

  const lightbox = document.getElementById('portfolioLightbox');
  const lightboxImg = document.getElementById('portfolioLightboxImg');
  const lightboxClose = document.getElementById('portfolioLightboxClose');

  window.openCertLightbox = function(src) {
    const modal = document.getElementById('certLightboxModal');
    const img = document.getElementById('certLightboxImg');
    if (modal && img) {
      img.src = encodeURI(src);
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCertLightbox = function() {
    const modal = document.getElementById('certLightboxModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeCertLightbox();
    }
  });

  function initCertTabScroll() {
    const tabItems = document.querySelectorAll('.cert-tab-item');
    const certSections = document.querySelectorAll('.urban-cert-item');

    if (!tabItems.length || !certSections.length) return;

    tabItems.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetId = tab.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    window.addEventListener('scroll', () => {
      let currentId = '';
      certSections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 250 && rect.bottom >= 150) {
          currentId = sec.getAttribute('id');
        }
      });

      if (currentId) {
        tabItems.forEach(tab => {
          if (tab.getAttribute('href') === `#${currentId}`) {
            tab.classList.add('active');
          } else {
            tab.classList.remove('active');
          }
        });
      }
    });
  }

  initCertTabScroll();

  function populateTrack(trackElement, assets) {
    if (!trackElement) return;
    trackElement.innerHTML = '';
    
    // Duplicate array 2 times for infinite seamless loop
    const doubleAssets = [...assets, ...assets];

    doubleAssets.forEach(item => {
      const card = document.createElement('div');
      card.className = item.isVideo ? 'marquee-card video-card' : 'marquee-card';
      const safeSrc = encodeURI(item.src);

      if (item.isVideo) {
        card.innerHTML = `
          <video src="${safeSrc}" autoplay loop muted playsinline preload="metadata"></video>
        `;
      } else {
        card.innerHTML = `
          <img src="${safeSrc}" alt="${item.title}" loading="lazy" decoding="async">
        `;
      }

      card.addEventListener('click', () => {
        openLightbox(item.src);
      });

      trackElement.appendChild(card);
    });
  }

  // Populate Global Competition Tracks
  populateTrack(track1, row1Assets);
  populateTrack(track2, row2Assets);
  populateTrack(track3, row3Assets);

  // Populate Regional & Category Competition Tracks
  populateTrack(regTrack1, regionalRow1Assets);
  populateTrack(regTrack2, regionalRow2Assets);
  populateTrack(regTrack3, regionalRow3Assets);

  // Populate Certification Archive Tracks (Reserved for New Format)
  // populateTrack(certTrack1, certRow1Assets);
  // populateTrack(certTrack2, certRow2Assets);
  // populateTrack(certTrack3, certRow3Assets);
}

document.addEventListener('DOMContentLoaded', initMultiRowMarquee);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initMultiRowMarquee();
}



