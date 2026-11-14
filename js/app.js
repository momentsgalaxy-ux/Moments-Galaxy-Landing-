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
  initInquiryForm(data);
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
    initTheme(updatedData);
  });
}

/* ==========================================================================
   THEME CONTROLLER (LIGHT / DARK LUXURY MODES)
   ========================================================================== */
function initTheme(data) {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeToggleIcon');
  const htmlEl = document.documentElement;

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
  window.GalaxyMediaDB.getMediaUrl('hero_video', hero.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-celebration-at-a-private-cinema-party-41804-large.mp4').then(targetUrl => {
    if (source && source.src !== targetUrl) {
      source.src = targetUrl;
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

  // Attempt unmuted autoplay by default
  function startHeroVideo() {
    video.muted = false;
    video.volume = 1.0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Autoplayed successfully WITH SOUND!
        updateSoundBadge(false);
        if (playBtn) playBtn.style.opacity = '0';
      }).catch((err) => {
        console.log('Unmuted autoplay deferred by browser policy. Playing muted first, then unmuting on first interaction:', err);
        // Play muted so video is 100% running immediately
        video.muted = true;
        video.play().then(() => {
          updateSoundBadge(true);
          if (playBtn) playBtn.style.opacity = '0';
        }).catch(e => console.log('Video play error:', e));

        // Unmute automatically on user's first touch/click/scroll anywhere
        const enableSoundOnGesture = () => {
          video.muted = false;
          video.volume = 1.0;
          updateSoundBadge(false);
          ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
            window.removeEventListener(evt, enableSoundOnGesture, { capture: true });
          });
        };

        ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
          window.addEventListener(evt, enableSoundOnGesture, { capture: true, once: true });
        });
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

  // Sound toggle button click
  if (unmutePill) {
    unmutePill.onclick = (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      if (!video.muted) video.volume = 1.0;
      updateSoundBadge(video.muted);
      if (video.paused) video.play();
    };
  }

  // Click on video toggles Play/Pause or Unmute
  if (heroTrigger) {
    heroTrigger.onclick = () => {
      if (video.muted) {
        video.muted = false;
        video.volume = 1.0;
        updateSoundBadge(false);
        if (video.paused) video.play();
        return;
      }

      if (video.paused) {
        video.play();
        if (playBtn) playBtn.style.opacity = '0';
      } else {
        video.pause();
        if (playBtn) {
          playBtn.style.opacity = '1';
          if (playIcon) playIcon.textContent = '▶';
        }
      }
    };
  }

  video.addEventListener('play', () => {
    if (playBtn) playBtn.style.opacity = '0';
  });

  video.addEventListener('pause', () => {
    if (playBtn) {
      playBtn.style.opacity = '1';
      if (playIcon) playIcon.textContent = '▶';
    }
  });
}

/* ==========================================================================
   02. OUR PRIVATE THEATERS SECTION
   ========================================================================== */
function renderTheaters(data) {
  const grid = document.getElementById('theatersGrid');
  if (!grid) return;

  grid.innerHTML = '';

  data.theaters.forEach((theater) => {
    const card = document.createElement('div');
    card.className = 'theater-card';

    card.innerHTML = `
      <div class="theater-video-thumb" data-theater-id="${theater.id}">
        <img src="${theater.poster}" alt="${theater.title}" loading="lazy">
        <span class="theater-tag-badge">${theater.badge || 'POPULAR'}</span>
        <span class="duration-badge">${theater.duration || '01:30'}</span>
        <div class="play-btn-circle" style="width: 58px; height: 58px; font-size: 20px;">
          <span>▶</span>
        </div>
      </div>
      <div class="theater-card-body">
        <h3 class="theater-card-title text-gold-gradient">${theater.title}</h3>
        <p class="theater-card-desc">${theater.description}</p>
        <div class="theater-meta-pills">
          <span class="meta-pill">👥 ${theater.capacity || '2 - 6 Guests'}</span>
          <span class="meta-pill">✨ ${theater.bestFor || 'Celebrations'}</span>
        </div>
        <div class="theater-card-actions">
          <button type="button" class="btn-watch-demo" data-watch-id="${theater.id}">
            <span>▶</span>
            <span>Watch Demo</span>
          </button>
          <a href="${data.links.bookingUrl}" class="btn-book-card" target="_blank" rel="noopener">
            <span>📅</span>
            <span>Book Now</span>
          </a>
        </div>
      </div>
    `;

    // Click handler for thumb & watch demo (resolves direct upload or URL)
    const thumb = card.querySelector('.theater-video-thumb');
    const watchBtn = card.querySelector('.btn-watch-demo');

    const handleWatch = async () => {
      const activeVideoUrl = await window.GalaxyMediaDB.getMediaUrl('theater_' + theater.id, theater.videoUrl);
      openVideoModal({
        title: theater.title,
        desc: theater.description,
        videoUrl: activeVideoUrl,
        bookingUrl: data.links.bookingUrl
      });
    };

    if (thumb) thumb.addEventListener('click', handleWatch);
    if (watchBtn) watchBtn.addEventListener('click', handleWatch);

    grid.appendChild(card);
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
      const activeNoticeUrl = await window.GalaxyMediaDB.getMediaUrl('notice_video', notice.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-woman-explaining-a-presentation-video-41798-large.mp4');
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
   07. INQUIRY FORM CONTROLLER
   ========================================================================== */
function initInquiryForm(data) {
  const form = document.getElementById('inquiryForm');
  if (!form) return;

  // Set default min date to today
  const dateInput = document.getElementById('inqDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('inqName').value.trim();
    const whatsapp = document.getElementById('inqWhatsapp').value.trim();
    const occasion = document.getElementById('inqOccasion').value;
    const theater = document.getElementById('inqTheater').value;
    const date = document.getElementById('inqDate').value;
    const details = document.getElementById('inqDetails').value.trim();

    if (!name || !whatsapp) {
      showToast('Please fill in your name and WhatsApp number! ⚠️');
      return;
    }

    // Save to Local Database for Admin Panel
    const newInquiry = window.GalaxyData.addInquiry({
      name,
      whatsapp,
      occasion,
      theater,
      date,
      details
    });

    showToast('Inquiry submitted successfully! Opening WhatsApp... ✨');

    // Create Pre-filled WhatsApp message for instant booking conversation
    const waText = `Hi Moments Galaxy! 🌟\nI would like to inquire about booking a private theater.\n\n*Name:* ${name}\n*Phone:* ${whatsapp}\n*Occasion:* ${occasion}\n*Theater:* ${theater}\n*Date:* ${date}\n*Notes:* ${details || 'None'}\n\nPlease share available slots & package details!`;

    const waUrl = `https://wa.me/91${data.contact.whatsapp}?text=${encodeURIComponent(waText)}`;

    // Reset Form
    form.reset();

    // Redirect to WhatsApp after short delay
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
  });
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
   VIDEO PLAYER MODAL
   ========================================================================== */
function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const closeBtn = document.getElementById('closeVideoModalBtn');
  const videoEl = document.getElementById('modalVideoElement');

  function closeModal() {
    if (modal) modal.classList.remove('active');
    if (videoEl) {
      videoEl.pause();
      videoEl.src = '';
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

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
}

function openVideoModal({ title, desc, videoUrl, bookingUrl }) {
  const modal = document.getElementById('videoModal');
  const titleEl = document.getElementById('modalVideoTitle');
  const descEl = document.getElementById('modalVideoDesc');
  const videoEl = document.getElementById('modalVideoElement');
  const bookBtn = document.getElementById('modalBookNowBtn');

  if (titleEl) titleEl.textContent = title || 'Moments Galaxy Private Cinema';
  if (descEl) descEl.textContent = desc || 'Watch demo walkthrough video';
  if (bookBtn && bookingUrl) bookBtn.href = bookingUrl;

  if (videoEl && videoUrl) {
    videoEl.src = videoUrl;
    videoEl.play().catch(e => console.log('Autoplay deferred:', e));
  }

  if (modal) modal.classList.add('active');
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
