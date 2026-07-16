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
