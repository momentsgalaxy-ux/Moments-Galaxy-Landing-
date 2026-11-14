/**
 * Moments Galaxy - Dynamic Data Layer
 * Handles configuration, local persistence (localStorage + IndexedDB),
 * inquiry logging, media storage, and multi-tab synchronization.
 */

const STORAGE_KEY = 'moments_galaxy_data_v1';
const INQUIRIES_KEY = 'moments_galaxy_inquiries_v1';
const THEME_KEY = 'moments_galaxy_theme_preference';

// Default Master Configuration
const DEFAULT_CONFIG = {
  theme: {
    defaultMode: 'dark', // 'dark' or 'light'
    allowVisitorToggle: true,
    accentColor: '#dfb15b'
  },
  contact: {
    phone: '8699505560',
    phoneDisplay: '+91 8699505560',
    whatsapp: '8699505560',
    whatsappDisplay: '+91 8699505560',
    whatsappMessage: 'Hi Moments Galaxy, I want to book a private mini theater for a special celebration!',
    instagramUrl: 'https://instagram.com/moments_galaxy',
    youtubeUrl: 'https://youtube.com',
    facebookUrl: 'https://facebook.com',
    email: 'info@momentsgalaxy.com'
  },
  links: {
    addonsUrl: 'https://momentsgalaxy.com/add-ons',
    foodUrl: 'https://momentsgalaxy.com/food-order',
    bookingUrl: 'https://momentsgalaxy.com/booking'
  },
  hero: {
    welcomeSubtitle: 'Welcome to',
    brandName: 'Moments Galaxy',
    tagline: 'Your Moments, Our Galaxy ❤️',
    description: 'Celebrate Birthdays, Anniversaries, Proposals & all Special Occasions in your own Private Mini Theater.',
    exploreButtonText: 'Explore Our Theaters ↓',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-celebration-at-a-private-cinema-party-41804-large.mp4',
    videoPoster: 'assets/images/hero-presenter.svg',
    unmuteLabel: 'Sound ON'
  },
  theaters: [
    {
      id: 'star-basic',
      title: 'Star Theater – Basic',
      duration: '01:12',
      badge: 'POPULAR',
      description: 'Cozy romantic mini theater setup with high-definition cinema projection, surround sound, and balloon decor.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-romantic-dinner-table-with-candles-in-a-cozy-room-41802-large.mp4',
      poster: 'assets/images/star-basic.svg',
      capacity: '2 - 6 Guests',
      bestFor: 'Birthdays & Dates'
    },
    {
      id: 'star-addons',
      title: 'Star Theater – With Add-ons',
      duration: '01:45',
      badge: 'DELUXE',
      description: 'Upgraded Star Theater with neon ambient lights, fog effect, luxury balloon arch, rose petal path, and photo booth setup.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-laughing-and-enjoying-a-movie-at-a-cinema-41800-large.mp4',
      poster: 'assets/images/star-addons.svg',
      capacity: '2 - 8 Guests',
      bestFor: 'Proposals & Anniversaries'
    },
    {
      id: 'prime-basic',
      title: 'Prime Theater – Basic',
      duration: '01:20',
      badge: 'WIDE SCREEN',
      description: 'Grand VIP private theater featuring ultra-luxurious recliner sofas, massive 4K laser projection, and Dolby 7.1 audio.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cinema-auditorium-with-movie-playing-on-screen-41799-large.mp4',
      poster: 'assets/images/prime-basic.svg',
      capacity: '4 - 12 Guests',
      bestFor: 'Family & Group Celebrations'
    },
    {
      id: 'prime-addons',
      title: 'Prime Theater – With Add-ons',
      duration: '01:55',
      badge: 'PREMIUM VIP',
      description: 'The ultimate royal experience: I-LOVE-YOU / MARRY-ME marquee lights, red carpet, cake table, rose bouquets, and customized photo slideshow.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-party-with-sparklers-and-lights-41801-large.mp4',
      poster: 'assets/images/prime-addons.svg',
      capacity: '4 - 15 Guests',
      bestFor: 'Surprise Proposals & Grand Parties'
    }
  ],
  coupons: {
    enabled: true, // Controls visibility: "Discount cupones show tbhi hoge jb hum on krege nhi to ye part hi nhi rhega yhn."
    heading: 'Special Celebration Offers & Discount Coupons',
    subheading: 'Limited time festive discounts! Apply coupon code at checkout or mention in your inquiry.',
    items: [
      {
        id: 'c-1',
        code: 'GALAXY500',
        title: 'Flat ₹500 OFF',
        discount: '₹500 OFF',
        description: 'Valid on all Star & Prime Theater celebrations booked for Monday to Thursday.',
        validUntil: 'Valid this month',
        active: true
      },
      {
        id: 'c-2',
        code: 'LOVEBIRDS',
        title: 'Romantic Add-on Free',
        discount: 'FREE CAKE + ROSES',
        description: 'Book any Theater with Add-ons package and get complimentary Heart Cake & Red Roses bouquet.',
        validUntil: 'Couples Special',
        active: true
      },
      {
        id: 'c-3',
        code: 'FIRSTMOMENT',
        title: '15% First Booking',
        discount: '15% OFF',
        description: 'Exclusive first-time booking discount on bookings with Food Order combos.',
        validUntil: 'New Customers Only',
        active: true
      }
    ]
  },
  notice: {
    heading: 'Have Questions? Check Our Notice',
    subheading: 'Watch the quick guidelines video & listen to voice answers for common questions.',
    videoDuration: '00:48',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-explaining-a-presentation-video-41798-large.mp4',
    videoPoster: 'assets/images/notice-poster.svg',
    faqs: [
      {
        id: 'faq-1',
        question: 'Q. How many persons are allowed?',
        answer: 'Our Star Theater comfortably accommodates 2 to 6 guests, while the Prime Theater accommodates up to 12-15 guests. Packages are typically priced for up to 4 guests, and extra guests can be added for a small charge.',
        audioUrl: '', // Fallback to SpeechSynthesis if empty or custom audio
        audioDuration: '00:24',
        voiceText: 'Star theater mein do se che log aur Prime theater mein baara se pandrah log aaraam se baith sakte hain. Extra guests ke liye nominal charge hota hai.'
      },
      {
        id: 'faq-2',
        question: 'Q. Can I add more persons?',
        answer: 'Yes, absolutely! You can add extra persons to both Star and Prime theaters by paying ₹300 per additional person. Recliner seats and extra props will be arranged seamlessly.',
        audioUrl: '',
        audioDuration: '00:18',
        voiceText: 'Haan bilkul! Aap extra persons add kar sakte hain, per person extra seating aur props arrange kar diye jaate hain.'
      },
      {
        id: 'faq-3',
        question: 'Q. Is decoration included?',
        answer: 'Basic decorative ambient lighting, happy celebration backdrop, and LED neon boards are included in the Basic package. With Add-ons packages, you get full balloon arches, romantic rose petal decorations, marquee lights, and fog entry!',
        audioUrl: '',
        audioDuration: '00:30',
        voiceText: 'Basic package mein ambient lights aur backdrop shaamil hota hai. Add-on package mein full balloon decoration, rose petals, aur marquee lights milti hain.'
      },
      {
        id: 'faq-4',
        question: 'Q. Can we play our own Netflix, YouTube or Movies?',
        answer: 'Yes! You can play anything of your choice — your personal photos/videos slideshow, Netflix, Prime Video, YouTube, Hotstar, or plug in a phone/laptop directly into our HD projector.',
        audioUrl: '',
        audioDuration: '00:22',
        voiceText: 'Haan ji! Aap apna personal photo video slideshow, Netflix, YouTube ya Prime video jo chahein projector par chala sakte hain.'
      },
      {
        id: 'faq-5',
        question: 'Q. Can we bring our own cake and outside food?',
        answer: 'You are welcome to bring your own birthday/anniversary cake! For hot food and snacks, you can order directly through our delicious in-house food ordering menu.',
        audioUrl: '',
        audioDuration: '00:20',
        voiceText: 'Aap apna cake bilkul laa sakte hain. Khane peene ke liye hamara tasty food menu available hai jismein se aap order kar sakte hain.'
      }
    ]
  },
  location: {
    title: 'Visit Moments Galaxy',
    subtitle: 'Find us in Chandigarh - Mohali region',
    address: 'Moments Galaxy Private Theater, Near Tricity Hub, Chandigarh / Mohali',
    coordinates: '30.726564696917464, 76.7252708362585',
    latitude: 30.726564696917464,
    longitude: 76.7252708362585,
    mapsUrl: 'https://www.google.com/maps?q=30.726564696917464,76.7252708362585',
    embedUrl: 'https://maps.google.com/maps?q=30.726564696917464,76.7252708362585&hl=en&z=15&output=embed'
  },
  admin: {
    pinHash: 'admin123', // Simple default security PIN
    siteTitle: 'Moments Galaxy — Luxury Private Theaters'
  }
};

class GalaxyDataManager {
  constructor() {
    this.data = this.loadConfig();
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Deep merge with DEFAULT_CONFIG in case new fields were added
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          theme: { ...DEFAULT_CONFIG.theme, ...(parsed.theme || {}) },
          contact: { ...DEFAULT_CONFIG.contact, ...(parsed.contact || {}) },
          links: { ...DEFAULT_CONFIG.links, ...(parsed.links || {}) },
          hero: { ...DEFAULT_CONFIG.hero, ...(parsed.hero || {}) },
          coupons: { ...DEFAULT_CONFIG.coupons, ...(parsed.coupons || {}) },
          notice: { ...DEFAULT_CONFIG.notice, ...(parsed.notice || {}) },
          location: { ...DEFAULT_CONFIG.location, ...(parsed.location || {}) },
          admin: { ...DEFAULT_CONFIG.admin, ...(parsed.admin || {}) }
        };
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using defaults', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  saveConfig(newConfig) {
    this.data = { ...newConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.notifyUpdate();
    return this.data;
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.notifyUpdate();
    return this.data;
  }

  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('galaxyDataUpdated', { detail: this.data }));
  }

  // --- INQUIRIES MANAGEMENT ---
  getInquiries() {
    try {
      const list = localStorage.getItem(INQUIRIES_KEY);
      return list ? JSON.parse(list) : [];
    } catch (e) {
      return [];
    }
  }

  addInquiry(inquiry) {
    const inquiries = this.getInquiries();
    const newEntry = {
      id: 'inq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      name: inquiry.name || '',
      whatsapp: inquiry.whatsapp || '',
      occasion: inquiry.occasion || 'Birthday',
      theater: inquiry.theater || 'Star Theater – Basic',
      date: inquiry.date || '',
      details: inquiry.details || '',
      status: 'New' // New, Contacted, Booked, Cancelled
    };
    inquiries.unshift(newEntry);
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
    return newEntry;
  }

  updateInquiryStatus(id, newStatus) {
    const inquiries = this.getInquiries();
    const target = inquiries.find(i => i.id === id);
    if (target) {
      target.status = newStatus;
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
      return true;
    }
    return false;
  }

  deleteInquiry(id) {
    let inquiries = this.getInquiries();
    inquiries = inquiries.filter(i => i.id !== id);
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
    return inquiries;
  }

  clearAllInquiries() {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify([]));
  }
}

// Global instance
window.GalaxyData = new GalaxyDataManager();

/* ==========================================================================
   INDEXED-DB MEDIA STORAGE ENGINE
   Supports direct binary video & audio uploads of any size (MP4, WebM, MP3)
   without hitting browser localStorage 5MB quota limit.
   ========================================================================== */
const MEDIA_DB_NAME = 'MomentsGalaxyMediaDB';
const MEDIA_DB_VERSION = 1;
const MEDIA_STORE_NAME = 'media_blobs';

class GalaxyMediaStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  init() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported in this browser environment.');
        return resolve(null);
      }
      const request = indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
          db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => {
        console.error('IndexedDB open error:', e);
        resolve(null);
      };
    });
  }

  async saveMedia(key, fileOrBlob, customName) {
    await this.initPromise;
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([MEDIA_STORE_NAME], 'readwrite');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const record = {
        key: key,
        blob: fileOrBlob,
        name: customName || fileOrBlob.name || 'uploaded_media',
        type: fileOrBlob.type || 'video/mp4',
        size: fileOrBlob.size || 0,
        updatedAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e);
    });
  }

  async getMedia(key) {
    await this.initPromise;
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([MEDIA_STORE_NAME], 'readonly');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e);
    });
  }

  async deleteMedia(key) {
    await this.initPromise;
    if (!this.db) return true;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([MEDIA_STORE_NAME], 'readwrite');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  }

  async getMediaUrl(key, fallbackUrl) {
    try {
      const record = await this.getMedia(key);
      if (record && record.blob) {
        return URL.createObjectURL(record.blob);
      }
    } catch (e) {
      console.warn('Error fetching media from IndexedDB:', e);
    }
    return fallbackUrl || '';
  }
}

window.GalaxyMediaDB = new GalaxyMediaStorage();
