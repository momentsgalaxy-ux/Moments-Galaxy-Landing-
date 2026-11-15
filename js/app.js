/**
 * Moments Galaxy — Landing Page Master Controller
 * Handles dynamic rendering, video modal player, audio voice notes,
 * coupon logic, inquiry submissions, and theme management.
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const data = window.GalaxyData.data;

  // Initialize Core Modules
  initTheme(data);
  initHeaderAndDrawer(data);
  renderHero(data);
  renderTheaters(data);
  renderQuickButtons(data);
  renderCoupons(data);
  renderNoticeAndVoiceFaq(data);
  renderCelebrateAndContacts(data);
  renderGoogleMap(data);
  renderInquirySection(data);
  initVideoModal();

  // Listen for real-time updates from Admin Panel (across tabs or in-page)
  window.addEventListener('galaxyDataUpdated', (e) => {
    const updatedData = e.detail;
    renderHero(updatedData);
    renderTheaters(updatedData);
    renderQuickButtons(updatedData);
    renderCoupons(updatedData);
    renderNoticeAndVoiceFaq(updatedData);
    renderCelebrateAndContacts(updatedData);
    renderGoogleMap(updatedData);
    renderInquirySection(updatedData);
    initTheme(updatedData);
  });

  // Cross-tab Real-time Reactive Sync via BroadcastChannel
  try {
    if (window.BroadcastChannel) {
      const bc = new BroadcastChannel('moments_galaxy_sync');
      bc.onmessage = (e) => {
        if (e.data && e.data.data) {
          const fresh = e.data.data;
          renderHero(fresh);
          renderTheaters(fresh);
          renderQuickButtons(fresh);
          renderCoupons(fresh);
          renderNoticeAndVoiceFaq(fresh);
          renderCelebrateAndContacts(fresh);
          renderGoogleMap(fresh);
          renderInquirySection(fresh);
          initTheme(fresh);
        }
      };
    }
  } catch (err) {
    // BroadcastChannel fallback
  }

  // Cross-tab fallback via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === 'moments_galaxy_data_v1' || e.key === 'moments_galaxy_active_theme') {
      const fresh = window.GalaxyData.loadConfig();
      renderHero(fresh);
      renderTheaters(fresh);
      renderQuickButtons(fresh);
      renderCoupons(fresh);
      renderNoticeAndVoiceFaq(fresh);
      renderCelebrateAndContacts(fresh);
      renderGoogleMap(fresh);
      renderInquirySection(fresh);
      initTheme(fresh);
    }
  });
}

/* ==========================================================================
   THEME CONTROLLER (4 PRO COLOR THEMES + LIGHT / DARK LUXURY MODES)
   ========================================================================== */
function initTheme(data) {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeToggleIcon');
  const htmlEl = document.documentElement;

  // Apply Pro Color Theme (obsidian-gold, ruby-rose, emerald-royalty, sapphire-galaxy)
  const activeColorTheme = data.theme.colorTheme || 'obsidian-gold';
  htmlEl.setAttribute('data-color-theme', activeColorTheme);
  if (document.body) {
    document.body.setAttribute('data-color-theme', activeColorTheme);
  }

  // Check visitor permission from Admin
  if (!data.theme.allowVisitorToggle) {
    if (themeToggleBtn) themeToggleBtn.style.display = 'none';
  } else {
    if (themeToggleBtn) themeToggleBtn.style.display = 'flex';
  }

  // Determine current active mode
  let currentMode = localStorage.getItem('moments_galaxy_theme_preference');
  if (!currentMode) {
    currentMode = data.theme.defaultMode || 'dark';
  }

  applyTheme(currentMode);

  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      const active = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(active);
      localStorage.setItem('moments_galaxy_theme_preference', active);
    };
  }

  function applyTheme(mode) {
    htmlEl.setAttribute('data-theme', mode);
    if (themeIcon) {
      themeIcon.textContent = mode === 'light' ? '☀️' : '🌙';
    }
  }
}

/* ==========================================================================
   HEADER & NAVIGATION DRAWER
   ========================================================================== */
function initHeaderAndDrawer(data) {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const navDrawer = document.getElementById('navDrawer');

  function openDrawer() {
    navDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    navDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Close drawer when any internal link clicked
  document.querySelectorAll('.drawer-links a').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Dynamic Header links
  const headerBookBtn = document.getElementById('headerBookBtn');
  if (headerBookBtn) headerBookBtn.href = data.links.bookingUrl;

  const drawerAddons = document.getElementById('drawerAddonsLink');
  if (drawerAddons) drawerAddons.href = data.links.addonsUrl;

  const drawerFood = document.getElementById('drawerFoodLink');
  if (drawerFood) drawerFood.href = data.links.foodUrl;

  const drawerBook = document.getElementById('drawerBookLink');
  if (drawerBook) drawerBook.href = data.links.bookingUrl;

  const drawerCall = document.getElementById('drawerCallLink');
  if (drawerCall) drawerCall.href = `tel:${data.contact.phone}`;

  const drawerWa = document.getElementById('drawerWaLink');
  if (drawerWa) drawerWa.href = `https://wa.me/91${data.contact.whatsapp}`;
}

/* ==========================================================================
   01. HERO / WELCOME SECTION (AUTOPLAY WITH SOUND BY DEFAULT)
   ========================================================================== */
function renderHero(data) {
  const hero = data.hero;

  const subEl = document.getElementById('heroWelcomeSubtitle');
  if (subEl) subEl.textContent = hero.welcomeSubtitle || 'Welcome to';

  const brandEl = document.getElementById('heroBrandTitle');
  if (brandEl) brandEl.textContent = hero.brandName || 'Moments Galaxy';

  const taglineEl = document.getElementById('heroTagline');
  if (taglineEl) taglineEl.textContent = hero.tagline || 'Your Moments, Our Galaxy ❤️';

  const descEl = document.getElementById('heroDescription');
  if (descEl) descEl.textContent = hero.description || '';

  const exploreBtn = document.getElementById('heroExploreBtn');
  if (exploreBtn && hero.exploreButtonText) {
    exploreBtn.querySelector('span').textContent = hero.exploreButtonText;
  }

  // Primary Hero Video Element Setup
  const video = document.getElementById('heroVideoElement');
  const source = document.getElementById('heroVideoSource');
  const unmutePill = document.getElementById('heroUnmutePill');
  const soundIcon = document.getElementById('soundIcon');
  const unmuteLabel = document.getElementById('unmuteLabelText');
  const playBtn = document.getElementById('heroPlayBtn');
  const playIcon = document.getElementById('heroPlayIcon');
  const heroTrigger = document.getElementById('heroVideoTrigger');

  if (!video) return;

  // Retrieve active video URL: checks IndexedDB direct upload first, then fallback config URL
  window.GalaxyMediaDB.getMediaUrl('hero_video', hero.videoUrl || 'assets/videos/hero-celebration.mp4').then(targetUrl => {
    if (targetUrl && (source && source.src !== targetUrl || video.src !== targetUrl)) {
      if (source) source.src = targetUrl;
      video.src = targetUrl;
      video.load();
      startHeroVideo();
    }
  });

  if (hero.videoPoster) {
    video.poster = hero.videoPoster;
  }

  function updateSoundBadge(isMuted) {
    if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
    if (unmuteLabel) unmuteLabel.textContent = isMuted ? 'Tap for Sound' : 'Sound ON';
    if (unmutePill) {
      if (isMuted) {
        unmutePill.classList.add('muted-prompt');
      } else {
        unmutePill.classList.remove('muted-prompt');
      }
    }
  }

  // Reliable Autoplay Function (starts muted for 100% mobile compatibility)
  function startHeroVideo() {
    video.muted = true;
    video.defaultMuted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateSoundBadge(true);
        if (playBtn) {
          playBtn.style.opacity = '0';
          playBtn.style.pointerEvents = 'none';
        }
      }).catch((err) => {
        console.log('Mobile autoplay deferred by policy:', err);
        // Show play button if browser blocked even muted autoplay (e.g. low power mode)
        if (playBtn) {
          playBtn.style.opacity = '1';
          playBtn.style.pointerEvents = 'auto';
          if (playIcon) playIcon.textContent = '▶';
        }
      });
    }
  }

  startHeroVideo();

  // Try again when page is fully loaded or becomes visible
  window.addEventListener('load', startHeroVideo, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && video.paused) {
      video.play().catch(() => {});
    }
  });

  // Sound toggle button click / touch
  function handleSoundToggle(e) {
    if (e) e.stopPropagation();
    video.muted = !video.muted;
    if (!video.muted) {
      video.volume = 1.0;
      updateSoundBadge(false);
      if (video.paused) video.play().catch(() => {});
    } else {
      updateSoundBadge(true);
    }
  }

  if (unmutePill) {
    unmutePill.addEventListener('click', handleSoundToggle);
    unmutePill.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleSoundToggle(e);
    });
  }

  // Direct user tap on video triggers Play / Pause / Unmute
  function handleVideoTap() {
    if (video.paused) {
      video.muted = false;
      video.volume = 1.0;
      updateSoundBadge(false);
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
      if (playBtn) {
        playBtn.style.opacity = '0';
        playBtn.style.pointerEvents = 'none';
      }
      return;
    }

    // If currently muted, unmute on first tap
    if (video.muted) {
      video.muted = false;
      video.volume = 1.0;
      updateSoundBadge(false);
      return;
    }

    // Otherwise toggle pause
    video.pause();
    if (playBtn) {
      playBtn.style.opacity = '1';
      playBtn.style.pointerEvents = 'auto';
      if (playIcon) playIcon.textContent = '▶';
    }
  }

  if (heroTrigger) {
    heroTrigger.addEventListener('click', handleVideoTap);
  }

  video.addEventListener('playing', () => {
    if (playBtn) {
      playBtn.style.opacity = '0';
      playBtn.style.pointerEvents = 'none';
    }
  });

  video.addEventListener('pause', () => {
    if (playBtn) {
      playBtn.style.opacity = '1';
      playBtn.style.pointerEvents = 'auto';
      if (playIcon) playIcon.textContent = '▶';
    }
  });

  // Global first user interaction (touch or click) allows unmuting if desired
  const enableSoundOnFirstTouch = () => {
    if (!video.paused && video.muted) {
      video.muted = false;
      video.volume = 1.0;
      updateSoundBadge(false);
    }
    ['click', 'touchstart'].forEach(evt => {
      window.removeEventListener(evt, enableSoundOnFirstTouch, { capture: true });
    });
  };
  ['click', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, enableSoundOnFirstTouch, { capture: true, once: true });
  });
}

/* ==========================================================================
   02. OUR PRIVATE THEATERS SECTION (PRIME THEATER 1ST, STAR THEATER 2ND)
   Each theater displays a single demo video with 2 select buttons (Basic / With Add-ons) & price.
   ========================================================================== */
const selectedPackages = {
  prime: 'basic',
  star: 'basic'
};

function renderTheaters(data) {
  const container = document.getElementById('theaterShowcaseWrapper') || document.getElementById('theatersGrid');
  if (!container) return;

  const theaters = data.theaters || [];
  const showPrices = data.theatersPricing ? data.theatersPricing.showPrices !== false : true;

  // Format price helper (e.g. 1999 -> ₹1,999)
  const formatPriceText = (val) => {
    if (!val && val !== 0) return '';
    const str = String(val).trim();
    const digits = str.replace(/[^\d]/g, '');
    if (!digits) return str;
    return '₹' + Number(digits).toLocaleString('en-IN');
  };

  // Group definitions: 1st Prime Theater, 2nd Star Theater
  const groups = [
    {
      id: 'prime',
      badge: '👑 ULTRA-LUXURY VIP',
      title: 'Prime Theater',
      capacity: '4 - 15 Guests',
      tagline: 'Grand VIP Ultra-Luxury Cinema with massive 4K projection & Dolby 7.1 audio'
    },
    {
      id: 'star',
      badge: '🌟 MOST POPULAR',
      title: 'Star Theater',
      capacity: '2 - 6 Guests',
      tagline: 'Cozy romantic mini theater setup with ambient decor & intimate cinema vibe'
    }
  ];

  container.innerHTML = groups.map((g, gIdx) => {
    // Current package selection for this theater (defaults to basic)
    const currentPkg = selectedPackages[g.id] || 'basic';

    // Filter items for this theater
    const currentTheaters = theaters.filter(t => {
      const grp = t.theaterGroup || (t.id.includes('prime') ? 'prime' : 'star');
      return grp === g.id;
    });

    const basicPkg = currentTheaters.find(t => (t.packageType === 'basic' || t.id.includes('basic'))) || currentTheaters[0] || {};
    const addonsPkg = currentTheaters.find(t => (t.packageType === 'addons' || t.id.includes('addons'))) || currentTheaters[1] || basicPkg;

    const activePkg = currentPkg === 'addons' ? addonsPkg : basicPkg;

    const basicPrice = formatPriceText(basicPkg.price || (g.id === 'prime' ? '2499' : '1999'));
    const addonsPrice = formatPriceText(addonsPkg.price || (g.id === 'prime' ? '4500' : '3500'));
    const activePrice = formatPriceText(activePkg.price || (currentPkg === 'addons' ? (g.id === 'prime' ? '4500' : '3500') : (g.id === 'prime' ? '2499' : '1999')));

    return `
      <div class="theater-showcase-section" data-theater-group="${g.id}">
        
        <!-- Theater Group Header Bar -->
        <div class="theater-section-header">
          <div class="theater-header-left">
            <span class="theater-group-badge">${g.badge}</span>
            <h3 class="theater-group-title text-gold-gradient">${g.title}</h3>
          </div>
          <span class="theater-group-meta">👥 Capacity: ${g.capacity}</span>
        </div>
        <p class="theater-group-desc" style="color: var(--text-muted); font-size: 14px; margin-bottom: 18px;">
          ${g.tagline}
        </p>

        <!-- 2 Package Select Buttons: Basic vs With Add-ons (Shows price before playing) -->
        <div class="package-select-tabs" role="tablist" aria-label="Select Package for ${g.title}">
          <button type="button" class="btn-pkg-select ${currentPkg === 'basic' ? 'active' : ''}" data-theater="${g.id}" data-pkg="basic">
            <div class="pkg-btn-inner">
              <span class="pkg-icon">🎬</span>
              <div class="pkg-info">
                <span class="pkg-name">Basic Package</span>
                <span class="pkg-sub">Romantic Setup</span>
              </div>
              ${showPrices ? `
                <div class="pkg-price-badge">${basicPrice}</div>
              ` : ''}
            </div>
          </button>

          <button type="button" class="btn-pkg-select ${currentPkg === 'addons' ? 'active' : ''}" data-theater="${g.id}" data-pkg="addons">
            <div class="pkg-btn-inner">
              <span class="pkg-icon">✨</span>
              <div class="pkg-info">
                <span class="pkg-name">With Add-ons</span>
                <span class="pkg-sub">Full Luxury Decor</span>
              </div>
              ${showPrices ? `
                <div class="pkg-price-badge">${addonsPrice}</div>
              ` : ''}
            </div>
          </button>
        </div>

        <!-- Single Grand Demo Video Showcase Card for this theater -->
        <div class="theater-showcase-card">
          
          <!-- Video Player Column -->
          <div class="showcase-video-col">
            <div class="theater-video-thumb showcase-thumb" data-theater-id="${activePkg.id}">
              <img src="${activePkg.poster || (g.id === 'prime' ? 'assets/images/prime-basic.svg' : 'assets/images/star-basic.svg')}" alt="${activePkg.title}" loading="lazy" class="showcase-poster-img">
              
              <span class="theater-tag-badge">${activePkg.badge || (currentPkg === 'addons' ? 'DELUXE VIP' : 'POPULAR')}</span>
              <span class="duration-badge">${activePkg.duration || '01:30'}</span>

              ${showPrices ? `
                <div class="showcase-price-tag">
                  <span class="price-tag-prefix">🏷️ Price:</span>
                  <span class="price-tag-value">${activePrice}</span>
                </div>
              ` : ''}

              <div class="play-btn-circle showcase-play-circle" title="Play Demo Video">
                <span>▶</span>
              </div>
            </div>
          </div>

          <!-- Video Details & Actions Column -->
          <div class="showcase-body-col">
            <div class="showcase-badge-row">
              <span class="meta-pill">👥 ${activePkg.capacity || g.capacity}</span>
              <span class="meta-pill">✨ ${activePkg.bestFor || 'Celebrations'}</span>
              <span class="meta-pill">🍿 HD Cinema & Surround</span>
            </div>

            <h4 class="showcase-title text-gold-gradient">${activePkg.title}</h4>
            <p class="showcase-desc">${activePkg.description}</p>

            ${showPrices ? `
              <div class="showcase-price-banner">
                <div class="price-banner-icon">🏷️</div>
                <div class="price-banner-text">
                  <span class="price-banner-label">Celebration Package Price</span>
                  <span class="price-banner-amount">${activePrice} <small>/ celebration</small></span>
                </div>
                <span class="price-banner-tag">Instant Confirmation</span>
              </div>
            ` : ''}

            <div class="showcase-action-btns">
              <button type="button" class="btn-watch-showcase btn-watch-item" data-theater-id="${activePkg.id}">
                <span>▶</span>
                <span>Watch Demo Video</span>
              </button>
              <a href="${data.links.bookingUrl}" class="btn-book-showcase" target="_blank" rel="noopener">
                <span>📅</span>
                <span>Book Now</span>
              </a>
            </div>
          </div>

        </div>

        ${gIdx < groups.length - 1 ? `
          <!-- Decorative Divider between Prime and Star Theater -->
          <div class="theater-section-divider">
            <span class="divider-sparkle">✦</span>
          </div>
        ` : ''}

      </div>
    `;
  }).join('');

  // 1. Package select buttons (Basic vs With Add-ons) for each theater
  container.querySelectorAll('.btn-pkg-select').forEach(btn => {
    btn.onclick = () => {
      const theaterId = btn.dataset.theater;
      const pkg = btn.dataset.pkg;
      if (selectedPackages[theaterId] !== pkg) {
        selectedPackages[theaterId] = pkg;
        renderTheaters(data);
      }
    };
  });

  // 2. Play video handlers (resolves IndexedDB direct upload or URL)
  container.querySelectorAll('.showcase-thumb').forEach(thumb => {
    thumb.onclick = async () => {
      const tid = thumb.dataset.theaterId;
      const theaterItem = theaters.find(t => t.id === tid) || {};
      const activeVideoUrl = await window.GalaxyMediaDB.getMediaUrl('theater_' + tid, theaterItem.videoUrl);
      openVideoModal({
        title: theaterItem.title,
        desc: theaterItem.description,
        videoUrl: activeVideoUrl,
        bookingUrl: data.links.bookingUrl
      });
    };
  });

  container.querySelectorAll('.btn-watch-item').forEach(btn => {
    btn.onclick = async () => {
      const tid = btn.dataset.theaterId;
      const theaterItem = theaters.find(t => t.id === tid) || {};
      const activeVideoUrl = await window.GalaxyMediaDB.getMediaUrl('theater_' + tid, theaterItem.videoUrl);
      openVideoModal({
        title: theaterItem.title,
        desc: theaterItem.description,
        videoUrl: activeVideoUrl,
        bookingUrl: data.links.bookingUrl
      });
    };
  });
}

/* ==========================================================================
   03. QUICK ACTION BUTTONS (ADD-ONS, FOODS, BOOK NOW)
   ========================================================================== */
function renderQuickButtons(data) {
  const btnAddons = document.getElementById('btnHubAddons');
  if (btnAddons) btnAddons.href = data.links.addonsUrl;

  const btnFoods = document.getElementById('btnHubFoods');
  if (btnFoods) btnFoods.href = data.links.foodUrl;

  const btnBooking = document.getElementById('btnHubBooking');
  if (btnBooking) btnBooking.href = data.links.bookingUrl;
}

/* ==========================================================================
   04. PUBLIC DISCOUNT COUPONS (DYNAMIC TOGGLE CONTROL)
   Requirement: "Discount cupones shoe tbhi hoge jb hum on krege nhi to ye part hi nhi rhega yhn."
   ========================================================================== */
function renderCoupons(data) {
  const section = document.getElementById('couponsSection');
  if (!section) return;

  // Toggle visibility according to admin state
  if (!data.coupons || !data.coupons.enabled) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  const headingEl = document.getElementById('couponsHeading');
  if (headingEl && data.coupons.heading) headingEl.textContent = data.coupons.heading;

  const subEl = document.getElementById('couponsSubheading');
  if (subEl && data.coupons.subheading) subEl.textContent = data.coupons.subheading;

  const grid = document.getElementById('couponsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const activeItems = (data.coupons.items || []).filter(item => item.active !== false);

  if (activeItems.length === 0) {
    section.style.display = 'none';
    return;
  }

  activeItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'coupon-ticket';

    card.innerHTML = `
      <span class="coupon-discount-pill">${item.discount || 'DISCOUNT'}</span>
      <h4 style="font-size: 18px; margin-bottom: 4px;">${item.title || item.code}</h4>
      <p class="coupon-desc">${item.description || ''}</p>
      
      <div class="coupon-code-box">
        <span class="coupon-code-text">${item.code}</span>
        <button type="button" class="btn-copy-code" data-code="${item.code}">
          Copy Code
        </button>
      </div>

      <div style="font-size: 11px; color: var(--gold-400); margin-top: auto;">
        ⏳ ${item.validUntil || 'Limited time offer'}
      </div>
    `;

    const copyBtn = card.querySelector('.btn-copy-code');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(item.code).then(() => {
          showToast(`Coupon "${item.code}" copied to clipboard! ✨`);
        }).catch(() => {
          showToast(`Coupon code: ${item.code}`);
        });
      });
    }

    grid.appendChild(card);
  });
}

/* ==========================================================================
   05. NOTICE VIDEO & INTERACTIVE VOICE FAQ SECTION
   Requirement: "Questions in writing answear use play voice and Weiting.
   Har question ke niche ek answear ki voice play note hoga"
   ========================================================================== */
let activeAudio = null;
let activePlayerEl = null;

function renderNoticeAndVoiceFaq(data) {
  const notice = data.notice;

  // Headings
  const mainHead = document.getElementById('noticeMainHeading');
  if (mainHead && notice.heading) mainHead.textContent = notice.heading;

  const subHead = document.getElementById('noticeSubHeading');
  if (subHead && notice.subheading) subHead.textContent = notice.subheading;

  const durationBadge = document.getElementById('noticeDurationBadge');
  if (durationBadge && notice.videoDuration) durationBadge.textContent = notice.videoDuration;

  const posterImg = document.getElementById('noticePosterImg');
  if (posterImg && notice.videoPoster) posterImg.src = notice.videoPoster;

  // Left Notice Video Trigger (resolves direct upload or URL)
  const noticeTrigger = document.getElementById('noticeVideoTrigger');
  if (noticeTrigger) {
    noticeTrigger.onclick = async () => {
      const activeNoticeUrl = await window.GalaxyMediaDB.getMediaUrl('notice_video', notice.videoUrl || 'assets/videos/notice-guidelines.mp4');
      openVideoModal({
        title: 'Moments Galaxy Notice & Guidelines',
        desc: 'Important guidelines for your private theater experience.',
        videoUrl: activeNoticeUrl,
        bookingUrl: data.links.bookingUrl
      });
    };
  }

  // Right FAQ Accordion List
  const list = document.getElementById('faqAccordionList');
  if (!list) return;

  list.innerHTML = '';

  (notice.faqs || []).forEach((faq, index) => {
    const card = document.createElement('div');
    card.className = `faq-card ${index === 0 ? 'open' : ''}`;
    card.id = `faqCard_${faq.id}`;

    // Waveform bars HTML
    const waveBars = Array.from({ length: 24 }).map((_, i) => {
      const h = Math.floor(Math.sin((i / 24) * Math.PI) * 20) + 4;
      return `<span class="wave-bar" style="height: ${h}px;"></span>`;
    }).join('');

    card.innerHTML = `
      <div class="faq-header">
        <div class="faq-title-wrap">
          <div class="faq-mic-icon" title="Voice note included">🎙️</div>
          <span class="faq-question-text">${faq.question}</span>
        </div>
        <span class="faq-chevron">▼</span>
      </div>

      <div class="faq-body">
        <div class="faq-body-inner">
          <p class="faq-answer-text">${faq.answer}</p>
          
          <!-- Interactive Voice Note Audio Player -->
          <div class="voice-note-player" id="voicePlayer_${faq.id}">
            <button type="button" class="btn-voice-play" id="btnVoicePlay_${faq.id}" aria-label="Play Voice Answer">
              <span class="play-icon">▶</span>
            </button>
            <div class="voice-waveform-wrap">
              ${waveBars}
            </div>
            <div class="voice-timer" id="voiceTimer_${faq.id}">${faq.audioDuration || '00:24'}</div>
          </div>
        </div>
      </div>
    `;

    // Accordion Toggle Header
    const header = card.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('open'));
      if (!isOpen) {
        card.classList.add('open');
      }
    });

    // Voice Note Play/Pause Handler
    const playBtn = card.querySelector(`#btnVoicePlay_${faq.id}`);
    const playerBox = card.querySelector(`#voicePlayer_${faq.id}`);
    const timerEl = card.querySelector(`#voiceTimer_${faq.id}`);

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleVoiceNote(faq, playerBox, playBtn, timerEl);
      });
    }

    list.appendChild(card);
  });
}

/**
 * Handles playing the audio voice note.
 * If faq.audioUrl exists, plays the HTML5 audio.
 * Otherwise, uses browser SpeechSynthesis with natural Hindi/English voice as fallback!
 */
async function toggleVoiceNote(faq, playerBox, playBtn, timerEl) {
  // If already playing this voice note, stop it
  if (playerBox.classList.contains('playing')) {
    stopCurrentVoiceNote();
    return;
  }

  // Stop any other active voice note first
  stopCurrentVoiceNote();

  playerBox.classList.add('playing');
  playBtn.querySelector('.play-icon').textContent = '⏸';
  activePlayerEl = playerBox;

  // Check if there is an uploaded voice recording or configured audio URL
  const activeAudioUrl = await window.GalaxyMediaDB.getMediaUrl('faq_' + faq.id, faq.audioUrl);

  if (activeAudioUrl && activeAudioUrl.trim() !== '') {
    // Custom audio file playback
    const audio = new Audio(activeAudioUrl);
    activeAudio = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        const remaining = Math.max(0, Math.ceil(audio.duration - audio.currentTime));
        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }
    };

    audio.onended = () => {
      stopCurrentVoiceNote();
    };

    audio.onerror = () => {
      console.warn('Audio URL failed to load, falling back to speech synthesis.');
      playSpeechSynthesis(faq, playerBox, playBtn, timerEl);
    };

    audio.play().catch(e => {
      console.warn('Audio play restricted, falling back to speech synthesis.', e);
      playSpeechSynthesis(faq, playerBox, playBtn, timerEl);
    });

  } else {
    // Web Speech Synthesis Fallback
    playSpeechSynthesis(faq, playerBox, playBtn, timerEl);
  }
}

function playSpeechSynthesis(faq, playerBox, playBtn, timerEl) {
  if (!('speechSynthesis' in window)) {
    showToast('Audio preview ready');
    stopCurrentVoiceNote();
    return;
  }

  window.speechSynthesis.cancel();

  const textToSpeak = faq.voiceText || faq.answer;
  const utterance = new SpeechSynthesisUtterance(textToSpeak);

  // Try to find Hindi voice or Indian English
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India')) || voices[0];
  if (preferredVoice) utterance.voice = preferredVoice;

  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  let totalSecs = parseInt((faq.audioDuration || '00:24').split(':')[1]) || 20;
  let remaining = totalSecs;

  const interval = setInterval(() => {
    remaining--;
    if (remaining >= 0) {
      const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
      const secs = String(remaining % 60).padStart(2, '0');
      timerEl.textContent = `${mins}:${secs}`;
    } else {
      clearInterval(interval);
    }
  }, 1000);

  utterance.onend = () => {
    clearInterval(interval);
    stopCurrentVoiceNote();
  };

  utterance.onerror = () => {
    clearInterval(interval);
    stopCurrentVoiceNote();
  };

  window.speechSynthesis.speak(utterance);
}

function stopCurrentVoiceNote() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activePlayerEl) {
    activePlayerEl.classList.remove('playing');
    const playIcon = activePlayerEl.querySelector('.play-icon');
    if (playIcon) playIcon.textContent = '▶';
    activePlayerEl = null;
  }
}

/* ==========================================================================
   06. READY TO CELEBRATE / CONTACTS
   ========================================================================== */
function renderCelebrateAndContacts(data) {
  // WhatsApp Link & Display
  const celebrateWaLink = document.getElementById('celebrateWaLink');
  const celebrateWaDisplay = document.getElementById('celebrateWaDisplay');
  if (celebrateWaLink) {
    celebrateWaLink.href = `https://wa.me/91${data.contact.whatsapp}?text=${encodeURIComponent(data.contact.whatsappMessage)}`;
  }
  if (celebrateWaDisplay) {
    celebrateWaDisplay.textContent = data.contact.whatsappDisplay || `+91 ${data.contact.whatsapp}`;
  }

  // Call Us Link & Display
  const celebrateCallLink = document.getElementById('celebrateCallLink');
  const celebrateCallDisplay = document.getElementById('celebrateCallDisplay');
  if (celebrateCallLink) {
    celebrateCallLink.href = `tel:${data.contact.phone}`;
  }
  if (celebrateCallDisplay) {
    celebrateCallDisplay.textContent = data.contact.phoneDisplay || `+91 ${data.contact.phone}`;
  }

  // Book Now in Celebrate arch
  const celebrateBookLink = document.getElementById('celebrateBookLink');
  if (celebrateBookLink) {
    celebrateBookLink.href = data.links.bookingUrl;
  }

  // Footer Social Links
  const footerInsta = document.getElementById('footerInstaLink');
  if (footerInsta && data.contact.instagramUrl) footerInsta.href = data.contact.instagramUrl;

  const footerYt = document.getElementById('footerYtLink');
  if (footerYt && data.contact.youtubeUrl) footerYt.href = data.contact.youtubeUrl;

  const footerFb = document.getElementById('footerFbLink');
  if (footerFb && data.contact.facebookUrl) footerFb.href = data.contact.facebookUrl;

  const footerWa = document.getElementById('footerWaLink');
  if (footerWa) footerWa.href = `https://wa.me/91${data.contact.whatsapp}`;
}

/* ==========================================================================
   07. INQUIRY & CONTACT SECTION CONTROLLER
   Requirement: "inqury form button https://momentsgalaxy.com/contact is link se connect rhegi form nhi hoga vhn"
   ========================================================================== */
function renderInquirySection(data) {
  const contactUrl = (data.links && data.links.contactUrl) || 'https://momentsgalaxy.com/contact';

  const inquiryLinkBtn = document.getElementById('btnInquiryContactLink');
  if (inquiryLinkBtn) {
    inquiryLinkBtn.href = contactUrl;
  }

  const drawerContactLink = document.getElementById('drawerContactLink');
  if (drawerContactLink) {
    drawerContactLink.href = contactUrl;
  }

  const waBtn = document.getElementById('btnInquiryWaLink');
  if (waBtn && data.contact && data.contact.whatsapp) {
    const cleanWa = data.contact.whatsapp.replace(/\D/g, '');
    const msg = encodeURIComponent(data.contact.whatsappMessage || 'Hi Moments Galaxy, I want to inquire about booking a private theater!');
    waBtn.href = `https://wa.me/91${cleanWa}?text=${msg}`;
  }
}

/* ==========================================================================
   09. GOOGLE MAP SECTION
   Coordinates: 30.726564696917464, 76.7252708362585
   ========================================================================== */
function renderGoogleMap(data) {
  const loc = data.location;
  if (!loc) return;

  const mapIframe = document.getElementById('googleMapIframe');
  if (mapIframe && loc.embedUrl) {
    mapIframe.src = loc.embedUrl;
  }

  const mapTitle = document.getElementById('mapTitle');
  if (mapTitle && loc.title) mapTitle.textContent = loc.title;

  const mapAddress = document.getElementById('mapAddress');
  if (mapAddress && loc.address) mapAddress.textContent = loc.address;

  const mapCoordsPill = document.getElementById('mapCoordsPill');
  if (mapCoordsPill && loc.coordinates) {
    mapCoordsPill.textContent = `Coordinates: ${loc.coordinates}`;
  }

  const btnOpenMaps = document.getElementById('btnOpenMaps');
  if (btnOpenMaps && loc.mapsUrl) {
    btnOpenMaps.href = loc.mapsUrl;
  }
}

/* ==========================================================================
   VIDEO PLAYER MODAL (100% RELIABLE ON MOBILE & DESKTOP)
   ========================================================================== */
function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const closeBtn = document.getElementById('closeVideoModalBtn');
  const videoEl = document.getElementById('modalVideoElement');
  const overlay = document.getElementById('modalPlayOverlay');

  function closeModal() {
    if (modal) modal.classList.remove('active');
    if (videoEl) {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
    }
    if (overlay) overlay.style.display = 'none';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Tap to play overlay for mobile browsers that defer async video play
  if (overlay && videoEl) {
    const triggerPlay = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      videoEl.play().then(() => {
        overlay.style.display = 'none';
      }).catch(err => {
        console.warn('Manual play failed:', err);
      });
    };
    overlay.addEventListener('click', triggerPlay);
    overlay.addEventListener('touchend', triggerPlay);
  }

  if (videoEl) {
    videoEl.addEventListener('playing', () => {
      if (overlay) overlay.style.display = 'none';
    });
    videoEl.addEventListener('pause', () => {
      // Don't re-show overlay if paused at end
      if (videoEl.ended && overlay) {
        overlay.style.display = 'flex';
      }
    });
  }
}

function openVideoModal({ title, desc, videoUrl, bookingUrl }) {
  const modal = document.getElementById('videoModal');
  const titleEl = document.getElementById('modalVideoTitle');
  const descEl = document.getElementById('modalVideoDesc');
  const videoEl = document.getElementById('modalVideoElement');
  const bookBtn = document.getElementById('modalBookNowBtn');
  const overlay = document.getElementById('modalPlayOverlay');

  if (titleEl) titleEl.textContent = title || 'Moments Galaxy Private Cinema';
  if (descEl) descEl.textContent = desc || 'Watch demo walkthrough video';
  if (bookBtn && bookingUrl) bookBtn.href = bookingUrl;

  if (modal) modal.classList.add('active');

  if (videoEl && videoUrl) {
    videoEl.src = videoUrl;
    videoEl.load();
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        if (overlay) overlay.style.display = 'none';
      }).catch(err => {
        console.log('Mobile video autoplay blocked by browser policy, showing tap-to-play overlay:', err);
        if (overlay) overlay.style.display = 'flex';
      });
    } else {
      if (overlay) overlay.style.display = 'flex';
    }
  }
}

/* ==========================================================================
   TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toastNotice');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
