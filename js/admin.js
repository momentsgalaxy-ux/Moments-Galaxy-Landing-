/**
 * Moments Galaxy — Dynamic Admin Panel Controller
 * Handles configuration editing, real-time sync, coupon master toggle,
 * inquiry lead management, audio/video uploading, and backup/restore.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
});

function initAdminAuth() {
  const loginOverlay = document.getElementById('loginOverlay');
  const loginForm = document.getElementById('adminLoginForm');
  const pinInput = document.getElementById('adminPinInput');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  // Check existing session
  const isUnlocked = sessionStorage.getItem('moments_galaxy_admin_unlocked') === 'true';

  if (isUnlocked) {
    if (loginOverlay) loginOverlay.style.display = 'none';
    initAdminPanel();
  } else {
    if (loginOverlay) loginOverlay.style.display = 'flex';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = pinInput.value.trim();
      const expectedPin = window.GalaxyData.data.admin.pinHash || 'admin123';

      if (enteredPin === expectedPin) {
        sessionStorage.setItem('moments_galaxy_admin_unlocked', 'true');
        loginOverlay.style.display = 'none';
        showAdminToast('Dashboard Unlocked Successfully! 🔓');
        initAdminPanel();
      } else {
        alert('Invalid Security PIN! Default is admin123');
        pinInput.value = '';
        pinInput.focus();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('moments_galaxy_admin_unlocked');
      location.reload();
    });
  }
}

function initAdminPanel() {
  const data = window.GalaxyData.data;

  initTabNavigation();
  populateFormFields(data);
  initHeroAndNoticeVideoUploads();
  initTheatersEditor(data);
  initCouponsEditor(data);
  initFaqsEditor(data);
  renderInquiriesTable();
  initMediaUploader();
  initBackupAndReset();

  // Save All Changes Master Button
  const saveBtn = document.getElementById('btnSaveMaster');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveAllAdminChanges();
    });
  }
}

/* ==========================================================================
   TAB NAVIGATION
   ========================================================================== */
function initTabNavigation() {
  const navBtns = document.querySelectorAll('.nav-item-btn[data-tab]');
  const panes = document.querySelectorAll('.tab-pane');
  const titleDisplay = document.getElementById('tabTitleDisplay');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) targetPane.classList.add('active');

      if (titleDisplay) {
        titleDisplay.innerHTML = btn.innerHTML;
      }
    });
  });
}

/* ==========================================================================
   POPULATE FORM FIELDS FROM GALAXYDATA
   ========================================================================== */
function populateFormFields(data) {
  // Stats
  const inquiries = window.GalaxyData.getInquiries();
  const statInq = document.getElementById('statInquiries');
  const inqBadge = document.getElementById('inquiriesCountBadge');
  if (statInq) statInq.textContent = inquiries.length;
  if (inqBadge) inqBadge.textContent = inquiries.length;

  const statCoup = document.getElementById('statCoupons');
  const coupBadge = document.getElementById('couponsStateBadge');
  const isCoupOn = data.coupons && data.coupons.enabled;
  if (statCoup) statCoup.textContent = isCoupOn ? 'Active (ON)' : 'Hidden (OFF)';
  if (coupBadge) coupBadge.textContent = isCoupOn ? 'ON' : 'OFF';

  // Hero Fields
  setValue('heroWelcomeSubtitleInput', data.hero.welcomeSubtitle);
  setValue('heroBrandTitleInput', data.hero.brandName);
  setValue('heroTaglineInput', data.hero.tagline);
  setValue('heroDescriptionInput', data.hero.description);
  setValue('heroVideoUrlInput', data.hero.videoUrl);
  setValue('heroPosterInput', data.hero.videoPoster);
  setValue('heroUnmuteLabelInput', data.hero.unmuteLabel);
  setValue('heroExploreBtnInput', data.hero.exploreButtonText);

  // Quick Action Buttons
  setValue('linkAddonsInput', data.links.addonsUrl);
  setValue('linkFoodInput', data.links.foodUrl);
  setValue('linkBookingInput', data.links.bookingUrl);

  // Public Discount Coupons
  const toggleCoupons = document.getElementById('toggleCouponsEnabled');
  const toggleLabel = document.getElementById('couponsToggleText');
  if (toggleCoupons) {
    toggleCoupons.checked = !!data.coupons.enabled;
    if (toggleLabel) toggleLabel.textContent = `Coupons: ${toggleCoupons.checked ? 'ON' : 'OFF'}`;

    toggleCoupons.onchange = () => {
      if (toggleLabel) toggleLabel.textContent = `Coupons: ${toggleCoupons.checked ? 'ON' : 'OFF'}`;
      if (coupBadge) coupBadge.textContent = toggleCoupons.checked ? 'ON' : 'OFF';
    };
  }
  setValue('couponsHeadingInput', data.coupons.heading);
  setValue('couponsSubheadingInput', data.coupons.subheading);

  // Notice & FAQs
  setValue('noticeVideoUrlInput', data.notice.videoUrl);
  setValue('noticeVideoDurationInput', data.notice.videoDuration);
  setValue('noticeHeadingInput', data.notice.heading);
  setValue('noticeSubheadingInput', data.notice.subheading);

  // Map & Location
  setValue('mapCoordsInput', data.location.coordinates);
  setValue('mapTitleInput', data.location.title);
  setValue('mapAddressInput', data.location.address);
  setValue('mapDirectUrlInput', data.location.mapsUrl);
  setValue('mapEmbedUrlInput', data.location.embedUrl);

  // Contact & Socials
  setValue('contactWaInput', data.contact.whatsapp);
  setValue('contactWaDisplayInput', data.contact.whatsappDisplay);
  setValue('contactPhoneInput', data.contact.phone);
  setValue('contactPhoneDisplayInput', data.contact.phoneDisplay);
  setValue('contactInstaInput', data.contact.instagramUrl);
  setValue('contactYtInput', data.contact.youtubeUrl);
  setValue('contactFbInput', data.contact.facebookUrl);

  // Theme & Appearance
  setValue('themeDefaultModeSelect', data.theme.defaultMode || 'dark');
  setValue('themeVisitorToggleSelect', String(data.theme.allowVisitorToggle));
  setValue('themeAccentColorInput', data.theme.accentColor || '#dfb15b');
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

/* ==========================================================================
   HERO & NOTICE DIRECT VIDEO UPLOADS (OPTION B)
   ========================================================================== */
function initHeroAndNoticeVideoUploads() {
  // Hero Video Upload & Live Preview
  const heroFileInput = document.getElementById('heroVideoFileInput');
  const heroCard = document.getElementById('heroVideoUploadedContainer');
  const heroName = document.getElementById('heroVideoUploadedName');
  const heroSize = document.getElementById('heroVideoUploadedSize');
  const heroPreview = document.getElementById('heroVideoAdminPreview');
  const btnRemoveHero = document.getElementById('btnRemoveHeroVideo');

  if (heroFileInput) {
    window.GalaxyMediaDB.getMedia('hero_video').then(rec => {
      if (rec && rec.blob) {
        heroName.textContent = rec.name;
        heroSize.textContent = `(${(rec.size / (1024 * 1024)).toFixed(1)} MB)`;
        heroPreview.src = URL.createObjectURL(rec.blob);
        heroCard.style.display = 'block';
      }
    });

    heroFileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.GalaxyMediaDB.saveMedia('hero_video', file, file.name).then(saved => {
        heroName.textContent = saved.name;
        heroSize.textContent = `(${(saved.size / (1024 * 1024)).toFixed(1)} MB)`;
        heroPreview.src = URL.createObjectURL(saved.blob);
        heroCard.style.display = 'block';
        showAdminToast('Hero welcome video uploaded directly! 🎉');
        window.GalaxyData.notifyUpdate();
      });
    };

    if (btnRemoveHero) {
      btnRemoveHero.onclick = () => {
        if (confirm('Remove uploaded hero video? Will revert to URL.')) {
          window.GalaxyMediaDB.deleteMedia('hero_video').then(() => {
            heroPreview.pause();
            heroPreview.src = '';
            heroCard.style.display = 'none';
            heroFileInput.value = '';
            showAdminToast('Uploaded hero video removed');
            window.GalaxyData.notifyUpdate();
          });
        }
      };
    }
  }

  // Notice Video Upload & Live Preview
  const noticeFileInput = document.getElementById('noticeVideoFileInput');
  const noticeCard = document.getElementById('noticeVideoUploadedContainer');
  const noticeName = document.getElementById('noticeVideoUploadedName');
  const noticeSize = document.getElementById('noticeVideoUploadedSize');
  const noticePreview = document.getElementById('noticeVideoAdminPreview');
  const btnRemoveNotice = document.getElementById('btnRemoveNoticeVideo');

  if (noticeFileInput) {
    window.GalaxyMediaDB.getMedia('notice_video').then(rec => {
      if (rec && rec.blob) {
        noticeName.textContent = rec.name;
        noticeSize.textContent = `(${(rec.size / (1024 * 1024)).toFixed(1)} MB)`;
        noticePreview.src = URL.createObjectURL(rec.blob);
        noticeCard.style.display = 'block';
      }
    });

    noticeFileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.GalaxyMediaDB.saveMedia('notice_video', file, file.name).then(saved => {
        noticeName.textContent = saved.name;
        noticeSize.textContent = `(${(saved.size / (1024 * 1024)).toFixed(1)} MB)`;
        noticePreview.src = URL.createObjectURL(saved.blob);
        noticeCard.style.display = 'block';
        showAdminToast('Notice guidelines video uploaded directly! 🎉');
        window.GalaxyData.notifyUpdate();
      });
    };

    if (btnRemoveNotice) {
      btnRemoveNotice.onclick = () => {
        if (confirm('Remove uploaded notice video? Will revert to URL.')) {
          window.GalaxyMediaDB.deleteMedia('notice_video').then(() => {
            noticePreview.pause();
            noticePreview.src = '';
            noticeCard.style.display = 'none';
            noticeFileInput.value = '';
            showAdminToast('Uploaded notice video removed');
            window.GalaxyData.notifyUpdate();
          });
        }
      };
    }
  }
}

/* ==========================================================================
   THEATERS EDITOR (4 CARDS WITH DUAL URL / DIRECT UPLOAD)
   ========================================================================== */
function initTheatersEditor(data) {
  const container = document.getElementById('theatersListContainer');
  if (!container) return;

  container.innerHTML = '';

  data.theaters.forEach((theater, idx) => {
    const box = document.createElement('div');
    box.className = 'theater-edit-box';

    box.innerHTML = `
      <div class="theater-edit-header">
        <span>🎬 Theater #${idx + 1}: ${theater.title}</span>
        <span class="sidebar-badge">${theater.badge || 'POPULAR'}</span>
      </div>

      <div class="form-grid-3">
        <div class="form-field">
          <label class="field-label">Theater Title</label>
          <input type="text" class="field-input th-title" value="${theater.title}">
        </div>
        <div class="form-field">
          <label class="field-label">Duration Badge (e.g. 01:12)</label>
          <input type="text" class="field-input th-duration" value="${theater.duration}">
        </div>
        <div class="form-field">
          <label class="field-label">Top Ribbon Badge (e.g. POPULAR, VIP)</label>
          <input type="text" class="field-input th-badge" value="${theater.badge || ''}">
        </div>
      </div>

      <!-- Dual Option: Video URL OR Direct PC File Upload -->
      <div class="form-field">
        <label class="field-label">Video Demo Source (Choose URL or Direct PC Upload)</label>
        <div class="media-dual-box">
          <div class="media-options-grid">
            <div>
              <label class="field-label" style="font-size: 11px;">Option A: Paste Video URL</label>
              <input type="text" class="field-input th-video" value="${theater.videoUrl}" placeholder="https://example.com/demo.mp4">
            </div>
            <div class="media-divider-or">— OR —</div>
            <div class="media-upload-area">
              <label class="field-label" style="font-size: 11px;">Option B: Direct Upload From PC</label>
              <input type="file" class="th-file-input" accept="video/mp4,video/webm,video/*" style="display: none;">
              <button type="button" class="btn-upload-direct th-upload-btn">
                <span>📁 Upload Video File (MP4/WebM)</span>
              </button>
            </div>
          </div>

          <div class="th-upload-card" style="display: none; margin-top: 12px;">
            <div class="media-uploaded-card">
              <div class="media-file-info">
                <span>🎬 Active Upload:</span>
                <span class="th-upload-name">video.mp4</span>
                <span style="font-size: 11px; opacity: 0.8;" class="th-upload-size"></span>
              </div>
              <button type="button" class="btn-remove-media th-remove-btn">✕ Remove Upload</button>
            </div>
            <video class="media-preview-player th-preview-player" controls playsinline style="margin-top: 10px;"></video>
          </div>
        </div>
      </div>

      <div class="form-grid-3">
        <div class="form-field">
          <label class="field-label">Poster Image URL / File Path</label>
          <input type="text" class="field-input th-poster" value="${theater.poster}">
        </div>
        <div class="form-field">
          <label class="field-label">Guest Capacity (e.g. 2 - 6 Guests)</label>
          <input type="text" class="field-input th-capacity" value="${theater.capacity || '2 - 6 Guests'}">
        </div>
        <div class="form-field">
          <label class="field-label">Best Suited For</label>
          <input type="text" class="field-input th-bestfor" value="${theater.bestFor || 'Birthdays'}">
        </div>
      </div>

      <div class="form-field">
        <label class="field-label">Theater Description</label>
        <textarea class="field-textarea th-desc">${theater.description}</textarea>
      </div>
    `;

    // Connect upload button to file input
    const fileInput = box.querySelector('.th-file-input');
    const uploadBtn = box.querySelector('.th-upload-btn');
    const uploadCard = box.querySelector('.th-upload-card');
    const uploadName = box.querySelector('.th-upload-name');
    const uploadSize = box.querySelector('.th-upload-size');
    const removeBtn = box.querySelector('.th-remove-btn');
    const previewPlayer = box.querySelector('.th-preview-player');

    uploadBtn.onclick = () => fileInput.click();

    // Check if there is an existing uploaded video in IndexedDB
    const storageKey = 'theater_' + theater.id;
    window.GalaxyMediaDB.getMedia(storageKey).then(rec => {
      if (rec && rec.blob) {
        uploadName.textContent = rec.name;
        uploadSize.textContent = `(${(rec.size / (1024 * 1024)).toFixed(1)} MB)`;
        previewPlayer.src = URL.createObjectURL(rec.blob);
        uploadCard.style.display = 'block';
      }
    });

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.GalaxyMediaDB.saveMedia(storageKey, file, file.name).then(saved => {
        uploadName.textContent = saved.name;
        uploadSize.textContent = `(${(saved.size / (1024 * 1024)).toFixed(1)} MB)`;
        previewPlayer.src = URL.createObjectURL(saved.blob);
        uploadCard.style.display = 'block';
        showAdminToast(`${theater.title} video uploaded directly! 🎉`);
        window.GalaxyData.notifyUpdate();
      });
    };

    removeBtn.onclick = () => {
      if (confirm(`Remove uploaded video for ${theater.title}? Will revert to URL.`)) {
        window.GalaxyMediaDB.deleteMedia(storageKey).then(() => {
          previewPlayer.pause();
          previewPlayer.src = '';
          uploadCard.style.display = 'none';
          fileInput.value = '';
          showAdminToast(`Uploaded video removed for ${theater.title}`);
          window.GalaxyData.notifyUpdate();
        });
      }
    };

    container.appendChild(box);
  });
}

/* ==========================================================================
   PUBLIC DISCOUNT COUPONS EDITOR
   ========================================================================== */
function initCouponsEditor(data) {
  const container = document.getElementById('couponsItemsContainer');
  const addBtn = document.getElementById('btnAddCoupon');
  if (!container) return;

  container.innerHTML = '';

  (data.coupons.items || []).forEach(coupon => {
    addCouponRow(coupon);
  });

  if (addBtn) {
    addBtn.onclick = () => {
      addCouponRow({
        id: 'c_' + Date.now(),
        code: 'GALAXY' + Math.floor(Math.random() * 900 + 100),
        title: 'New Celebration Offer',
        discount: '10% OFF',
        description: 'Special discount on theater packages',
        validUntil: 'Valid this week',
        active: true
      });
    };
  }

  function addCouponRow(item) {
    const row = document.createElement('div');
    row.className = 'coupon-item-row';
    row.dataset.id = item.id;

    row.innerHTML = `
      <div>
        <label class="field-label" style="font-size: 11px;">CODE</label>
        <input type="text" class="field-input cp-code" value="${item.code}" style="font-weight: 800; font-family: monospace;">
      </div>
      <div>
        <label class="field-label" style="font-size: 11px;">TITLE & DISCOUNT</label>
        <input type="text" class="field-input cp-title" value="${item.title}" placeholder="Offer title">
      </div>
      <div>
        <label class="field-label" style="font-size: 11px;">DESCRIPTION / VALIDITY</label>
        <input type="text" class="field-input cp-desc" value="${item.description}" placeholder="Details">
      </div>
      <div>
        <label class="field-label" style="font-size: 11px;">STATUS</label>
        <select class="field-select cp-active" style="padding: 9px 8px;">
          <option value="true" ${item.active !== false ? 'selected' : ''}>Active</option>
          <option value="false" ${item.active === false ? 'selected' : ''}>Hidden</option>
        </select>
      </div>
      <div style="text-align: center;">
        <label class="field-label" style="font-size: 11px;">ACTION</label>
        <button type="button" class="btn-remove-row btn-del-cp">Delete</button>
      </div>
    `;

    row.querySelector('.btn-del-cp').onclick = () => {
      row.remove();
    };

    container.appendChild(row);
  }
}

/* ==========================================================================
   VOICE FAQS EDITOR
   ========================================================================== */
function initFaqsEditor(data) {
  const container = document.getElementById('faqsContainer');
  const addBtn = document.getElementById('btnAddFaq');
  if (!container) return;

  container.innerHTML = '';

  (data.notice.faqs || []).forEach(faq => {
    addFaqBlock(faq);
  });

  if (addBtn) {
    addBtn.onclick = () => {
      addFaqBlock({
        id: 'faq_' + Date.now(),
        question: 'Q. New Question Title?',
        answer: 'Written answer details explaining guidelines to the customer.',
        audioUrl: '',
        audioDuration: '00:20',
        voiceText: 'Hindi or English voice transcript spoken for the customer.'
      });
    };
  }

  function addFaqBlock(faq) {
    const box = document.createElement('div');
    box.className = 'theater-edit-box';
    box.dataset.id = faq.id;

    box.innerHTML = `
      <div class="theater-edit-header">
        <span>🎙️ FAQ Question: <span class="faq-q-preview">${faq.question}</span></span>
        <button type="button" class="btn-remove-row btn-del-faq">Delete FAQ</button>
      </div>

      <div class="form-field">
        <label class="field-label">Question in Writing</label>
        <input type="text" class="field-input fq-question" value="${faq.question}">
      </div>

      <div class="form-field">
        <label class="field-label">Answer in Writing</label>
        <textarea class="field-textarea fq-answer">${faq.answer}</textarea>
      </div>

      <!-- Dual Option: Custom Audio URL OR Direct Audio File Upload -->
      <div class="form-field">
        <label class="field-label">Voice Note Audio Source (Choose URL or Direct PC Upload)</label>
        <div class="media-dual-box">
          <div class="media-options-grid">
            <div>
              <label class="field-label" style="font-size: 11px;">Option A: Paste Audio URL</label>
              <input type="text" class="field-input fq-audiourl" value="${faq.audioUrl || ''}" placeholder="Leave empty for synthesized natural voice">
            </div>
            <div class="media-divider-or">— OR —</div>
            <div class="media-upload-area">
              <label class="field-label" style="font-size: 11px;">Option B: Direct Upload From PC</label>
              <input type="file" class="fq-file-input" accept="audio/*,audio/mp3,audio/wav" style="display: none;">
              <button type="button" class="btn-upload-direct fq-upload-btn">
                <span>📁 Upload Audio File (MP3/WAV)</span>
              </button>
            </div>
          </div>

          <div class="fq-upload-card" style="display: none; margin-top: 12px;">
            <div class="media-uploaded-card">
              <div class="media-file-info">
                <span>🎙️ Active Upload:</span>
                <span class="fq-upload-name">audio.mp3</span>
                <span style="font-size: 11px; opacity: 0.8;" class="fq-upload-size"></span>
              </div>
              <button type="button" class="btn-remove-media fq-remove-btn">✕ Remove Upload</button>
            </div>
            <audio class="fq-preview-player" controls style="width: 100%; height: 38px; margin-top: 10px;"></audio>
          </div>
        </div>
      </div>

      <div class="form-field">
        <label class="field-label">Voice Note Duration Display (e.g. 00:24)</label>
        <input type="text" class="field-input fq-audioduration" value="${faq.audioDuration || '00:24'}">
      </div>

      <div class="form-field">
        <label class="field-label">Voice Text (Speech Synthesis Transcript for Audio Player)</label>
        <input type="text" class="field-input fq-voicetext" value="${faq.voiceText || faq.answer}">
      </div>
    `;

    // Connect audio upload handlers
    const audioFileInput = box.querySelector('.fq-file-input');
    const audioUploadBtn = box.querySelector('.fq-upload-btn');
    const audioUploadCard = box.querySelector('.fq-upload-card');
    const audioUploadName = box.querySelector('.fq-upload-name');
    const audioUploadSize = box.querySelector('.fq-upload-size');
    const audioRemoveBtn = box.querySelector('.fq-remove-btn');
    const audioPreviewPlayer = box.querySelector('.fq-preview-player');

    audioUploadBtn.onclick = () => audioFileInput.click();

    const faqStorageKey = 'faq_' + faq.id;
    window.GalaxyMediaDB.getMedia(faqStorageKey).then(rec => {
      if (rec && rec.blob) {
        audioUploadName.textContent = rec.name;
        audioUploadSize.textContent = `(${(rec.size / 1024).toFixed(1)} KB)`;
        audioPreviewPlayer.src = URL.createObjectURL(rec.blob);
        audioUploadCard.style.display = 'block';
      }
    });

    audioFileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.GalaxyMediaDB.saveMedia(faqStorageKey, file, file.name).then(saved => {
        audioUploadName.textContent = saved.name;
        audioUploadSize.textContent = `(${(saved.size / 1024).toFixed(1)} KB)`;
        audioPreviewPlayer.src = URL.createObjectURL(saved.blob);
        audioUploadCard.style.display = 'block';
        showAdminToast(`FAQ voice note uploaded! 🎙️`);
        window.GalaxyData.notifyUpdate();
      });
    };

    audioRemoveBtn.onclick = () => {
      if (confirm('Remove uploaded voice note audio?')) {
        window.GalaxyMediaDB.deleteMedia(faqStorageKey).then(() => {
          audioPreviewPlayer.pause();
          audioPreviewPlayer.src = '';
          audioUploadCard.style.display = 'none';
          audioFileInput.value = '';
          showAdminToast('Uploaded voice note removed');
          window.GalaxyData.notifyUpdate();
        });
      }
    };

    box.querySelector('.fq-question').oninput = (e) => {
      box.querySelector('.faq-q-preview').textContent = e.target.value;
    };

    box.querySelector('.btn-del-faq').onclick = () => {
      box.remove();
    };

    container.appendChild(box);
  }
}

/* ==========================================================================
   INQUIRIES LEADS TABLE
   ========================================================================== */
function renderInquiriesTable() {
  const tbody = document.getElementById('inquiriesTableBody');
  const exportBtn = document.getElementById('btnExportInquiries');
  const clearBtn = document.getElementById('btnClearInquiries');

  if (!tbody) return;

  const inquiries = window.GalaxyData.getInquiries();
  tbody.innerHTML = '';

  if (inquiries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No customer inquiries received yet. Submit an inquiry on the landing page to test! ✨
        </td>
      </tr>
    `;
    return;
  }

  inquiries.forEach(inq => {
    const tr = document.createElement('tr');
    const createdDate = new Date(inq.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const cleanPhone = (inq.whatsapp || '').replace(/\D/g, '');

    tr.innerHTML = `
      <td style="white-space: nowrap; color: var(--text-muted); font-size: 12px;">${createdDate}</td>
      <td style="font-weight: 700; color: #fff;">${inq.name}</td>
      <td>
        <span style="font-family: monospace; font-size: 13px;">${inq.whatsapp}</span>
      </td>
      <td>${inq.occasion || 'Celebration'}</td>
      <td><span class="sidebar-badge" style="font-size: 11px;">${inq.theater}</span></td>
      <td>${inq.date || 'TBD'}</td>
      <td style="max-width: 220px; font-size: 12.5px; color: var(--text-muted);">${inq.details || '—'}</td>
      <td>
        <select class="field-select inq-status-select" data-id="${inq.id}" style="padding: 4px 8px; font-size: 12px; width: 110px;">
          <option value="New" ${inq.status === 'New' ? 'selected' : ''}>New</option>
          <option value="Contacted" ${inq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="Booked" ${inq.status === 'Booked' ? 'selected' : ''}>Booked</option>
          <option value="Archived" ${inq.status === 'Archived' ? 'selected' : ''}>Archived</option>
        </select>
      </td>
      <td style="white-space: nowrap;">
        <!-- WhatsApp Direct -->
        <a href="https://wa.me/91${cleanPhone}?text=Hi%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20Moments%20Galaxy!%20Regarding%20your%20${encodeURIComponent(inq.occasion)}%20booking:" 
           target="_blank" class="action-btn-circle wa-btn" title="Chat with customer on WhatsApp">
          💬
        </a>
        <!-- Call Direct -->
        <a href="tel:${cleanPhone}" class="action-btn-circle call-btn" title="Call Customer">
          📞
        </a>
        <!-- Delete Lead -->
        <button type="button" class="action-btn-circle btn-del-inq" data-id="${inq.id}" title="Delete Lead" style="background: rgba(214,48,49,0.2); border-color: var(--danger); color: #ff7675; cursor: pointer;">
          ✕
        </button>
      </td>
    `;

    // Status change listener
    const statusSelect = tr.querySelector('.inq-status-select');
    statusSelect.onchange = (e) => {
      window.GalaxyData.updateInquiryStatus(inq.id, e.target.value);
      showAdminToast(`Inquiry marked as ${e.target.value}!`);
    };

    // Delete listener
    const delBtn = tr.querySelector('.btn-del-inq');
    delBtn.onclick = () => {
      if (confirm(`Delete inquiry from ${inq.name}?`)) {
        window.GalaxyData.deleteInquiry(inq.id);
        renderInquiriesTable();
        showAdminToast('Inquiry deleted');
      }
    };

    tbody.appendChild(tr);
  });

  // Export CSV
  if (exportBtn) {
    exportBtn.onclick = () => {
      exportInquiriesToCSV(inquiries);
    };
  }

  // Clear All
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm('Are you sure you want to clear all inquiries?')) {
        window.GalaxyData.clearAllInquiries();
        renderInquiriesTable();
        showAdminToast('All inquiries cleared');
      }
    };
  }
}

function exportInquiriesToCSV(inquiries) {
  if (!inquiries || inquiries.length === 0) {
    alert('No inquiries to export');
    return;
  }

  const headers = ['ID', 'Date', 'Name', 'WhatsApp', 'Occasion', 'Theater', 'EventDate', 'Details', 'Status'];
  const rows = inquiries.map(i => [
    i.id,
    `"${new Date(i.createdAt).toLocaleString()}"`,
    `"${i.name.replace(/"/g, '""')}"`,
    `"${i.whatsapp}"`,
    `"${i.occasion}"`,
    `"${i.theater}"`,
    `"${i.date}"`,
    `"${(i.details || '').replace(/"/g, '""')}"`,
    `"${i.status}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `moments_galaxy_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   MEDIA UPLOADER (LOCAL FILE READING TO BLOB/DATA URL)
   ========================================================================== */
function initMediaUploader() {
  const fileInput = document.getElementById('mediaFileInput');
  const feedback = document.getElementById('mediaUploadFeedback');
  const urlInput = document.getElementById('mediaGeneratedUrl');

  if (!fileInput) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultDataUrl = event.target.result;
      if (urlInput) urlInput.value = resultDataUrl;
      if (feedback) feedback.style.display = 'block';
      showAdminToast(`Loaded ${file.name}! URL ready to copy.`);
    };

    reader.readAsDataURL(file);
  });
}

/* ==========================================================================
   BACKUP, EXPORT & RESTORE
   ========================================================================== */
function initBackupAndReset() {
  const exportBtn = document.getElementById('btnExportConfig');
  const importFile = document.getElementById('importConfigFile');
  const resetBtn = document.getElementById('btnResetDefaults');

  if (exportBtn) {
    exportBtn.onclick = () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(window.GalaxyData.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `moments_galaxy_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showAdminToast('Backup configuration exported! 📥');
    };
  }

  if (importFile) {
    importFile.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          window.GalaxyData.saveConfig(imported);
          alert('Configuration imported successfully! Reloading...');
          location.reload();
        } catch (err) {
          alert('Invalid JSON file format!');
        }
      };
      reader.readAsText(file);
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('Are you sure you want to reset all configurations to factory defaults?')) {
        window.GalaxyData.resetToDefault();
        alert('Reset to defaults complete! Reloading...');
        location.reload();
      }
    };
  }
}

/* ==========================================================================
   SAVE ALL ADMIN CHANGES
   ========================================================================== */
function saveAllAdminChanges() {
  const current = window.GalaxyData.data;

  // 1. Hero
  const hero = {
    ...current.hero,
    welcomeSubtitle: document.getElementById('heroWelcomeSubtitleInput').value,
    brandName: document.getElementById('heroBrandTitleInput').value,
    tagline: document.getElementById('heroTaglineInput').value,
    description: document.getElementById('heroDescriptionInput').value,
    videoUrl: document.getElementById('heroVideoUrlInput').value,
    videoPoster: document.getElementById('heroPosterInput').value,
    unmuteLabel: document.getElementById('heroUnmuteLabelInput').value,
    exploreButtonText: document.getElementById('heroExploreBtnInput').value
  };

  // 2. Theaters (4 items)
  const theaterBoxes = document.querySelectorAll('.theater-edit-box');
  const theaters = [];
  theaterBoxes.forEach((box, i) => {
    // Only theater boxes have th-title
    const titleEl = box.querySelector('.th-title');
    if (titleEl) {
      theaters.push({
        id: (current.theaters[i] && current.theaters[i].id) || `theater-${i+1}`,
        title: titleEl.value,
        duration: box.querySelector('.th-duration').value,
        badge: box.querySelector('.th-badge').value,
        videoUrl: box.querySelector('.th-video').value,
        poster: box.querySelector('.th-poster').value,
        capacity: box.querySelector('.th-capacity').value,
        bestFor: box.querySelector('.th-bestfor').value,
        description: box.querySelector('.th-desc').value
      });
    }
  });

  // 3. Quick Links
  const links = {
    addonsUrl: document.getElementById('linkAddonsInput').value,
    foodUrl: document.getElementById('linkFoodInput').value,
    bookingUrl: document.getElementById('linkBookingInput').value
  };

  // 4. Coupons
  const toggleCoupons = document.getElementById('toggleCouponsEnabled');
  const couponRows = document.querySelectorAll('.coupon-item-row');
  const couponItems = [];

  couponRows.forEach(row => {
    couponItems.push({
      id: row.dataset.id || ('c_' + Math.random().toString(36).substr(2, 5)),
      code: row.querySelector('.cp-code').value.trim(),
      title: row.querySelector('.cp-title').value.trim(),
      discount: row.querySelector('.cp-title').value.trim(),
      description: row.querySelector('.cp-desc').value.trim(),
      validUntil: 'Special Offer',
      active: row.querySelector('.cp-active').value === 'true'
    });
  });

  const coupons = {
    enabled: toggleCoupons ? toggleCoupons.checked : true,
    heading: document.getElementById('couponsHeadingInput').value,
    subheading: document.getElementById('couponsSubheadingInput').value,
    items: couponItems
  };

  // 5. Notice & Voice FAQs
  const faqBoxes = document.querySelectorAll('#faqsContainer .theater-edit-box');
  const faqs = [];

  faqBoxes.forEach(box => {
    const qEl = box.querySelector('.fq-question');
    if (qEl) {
      faqs.push({
        id: box.dataset.id || ('faq_' + Math.random().toString(36).substr(2, 5)),
        question: qEl.value,
        answer: box.querySelector('.fq-answer').value,
        audioUrl: box.querySelector('.fq-audiourl').value.trim(),
        audioDuration: box.querySelector('.fq-audioduration').value.trim() || '00:24',
        voiceText: box.querySelector('.fq-voicetext').value
      });
    }
  });

  const notice = {
    ...current.notice,
    videoUrl: document.getElementById('noticeVideoUrlInput').value,
    videoDuration: document.getElementById('noticeVideoDurationInput').value,
    heading: document.getElementById('noticeHeadingInput').value,
    subheading: document.getElementById('noticeSubheadingInput').value,
    faqs: faqs
  };

  // 6. Map & Location
  const coords = document.getElementById('mapCoordsInput').value;
  const location = {
    ...current.location,
    coordinates: coords,
    title: document.getElementById('mapTitleInput').value,
    address: document.getElementById('mapAddressInput').value,
    mapsUrl: document.getElementById('mapDirectUrlInput').value,
    embedUrl: document.getElementById('mapEmbedUrlInput').value
  };

  // 7. Contacts & Socials
  const contact = {
    ...current.contact,
    whatsapp: document.getElementById('contactWaInput').value.trim(),
    whatsappDisplay: document.getElementById('contactWaDisplayInput').value.trim(),
    phone: document.getElementById('contactPhoneInput').value.trim(),
    phoneDisplay: document.getElementById('contactPhoneDisplayInput').value.trim(),
    instagramUrl: document.getElementById('contactInstaInput').value.trim(),
    youtubeUrl: document.getElementById('contactYtInput').value.trim(),
    facebookUrl: document.getElementById('contactFbInput').value.trim()
  };

  // 8. Theme
  const theme = {
    ...current.theme,
    defaultMode: document.getElementById('themeDefaultModeSelect').value,
    allowVisitorToggle: document.getElementById('themeVisitorToggleSelect').value === 'true',
    accentColor: document.getElementById('themeAccentColorInput').value
  };

  // Master Assemble
  const updated = {
    ...current,
    hero,
    theaters: theaters.length > 0 ? theaters : current.theaters,
    links,
    coupons,
    notice,
    location,
    contact,
    theme
  };

  window.GalaxyData.saveConfig(updated);
  showAdminToast('All Changes Saved & Synced Live! ✨💾');
}

function showAdminToast(msg) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}
