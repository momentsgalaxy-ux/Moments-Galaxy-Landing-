# Moments Galaxy — Luxury Landing Page & Dynamic Admin Panel

**Moments Galaxy — Your Moments, Our Galaxy ❤️**
High-converting, luxury landing page and 100% dynamic admin control panel for private mini theaters and special celebrations (Birthdays, Anniversaries, Proposals, Date Nights, and Private Screenings).

---

## 🌟 Highlights & Features

1. **Header / Navigation**:
   - Golden brand logo with orbital star insignia.
   - Top Header **"📅 Book Now"** gold pill button.
   - **Light / Dark Mode Switcher** (Visitor toggleable, admin controlled).
   - Mobile responsive slide-out drawer menu.

2. **01. Welcome Information Video & Hero Banner**:
   - Professional host presenter video container with **"Tap to Unmute"** badge and glowing pulse **Play Button**.
   - Cursive luxury script: *"Welcome to"*, bold serif: *"Moments Galaxy"*.
   - Tagline: *"Your Moments, Our Galaxy ❤️"*.
   - Subtitle: *"Celebrate Birthdays, Anniversaries, Proposals & all Special Occasions in your own Private Mini Theater."*
   - Gold gradient CTA: *"Explore Our Theaters ↓"*.

3. **02. Demo Videos for Both Theaters (4 Cards)**:
   - **Video Star Theater – Basic** (Duration badge: `01:12`)
   - **Video Star Theater – With Add-ons** (Duration badge: `01:45`)
   - **Video Prime Theater – Basic** (Duration badge: `01:20`)
   - **Video Prime Theater – With Add-ons** (Duration badge: `01:55`)
   - Interactive high-definition Video Player Modal with playback controls and instant booking button.

4. **03. Three Quick Action Hub Buttons**:
   - **Add-ons** (🎁 Explore All Add-ons →) connects to: `https://momentsgalaxy.com/add-ons`
   - **Foods** (🍴 View Food Menu →) connects to: `https://momentsgalaxy.com/food-order`
   - **Book Now** (📅 Reserve Your Slot →) connects to: `https://momentsgalaxy.com/booking`

5. **04. Public Discount Coupons (Dynamic Toggle)**:
   - *Rule:* **"Discount cupones show tbhi hoge jb hum on krege nhi to ye part hi nhi rhega yhn."**
   - Admin master switch controls whether coupons appear or are completely removed from the page.
   - One-click **Copy Code** button with toast notification.

6. **05. Notice Video & Interactive Voice FAQ**:
   - **Notice Video** (00:48): Guidelines walkthrough for arrival, rules, and decorations.
   - **Interactive Voice FAQs**:
     - Question in writing.
     - Written answer explanation.
     - **Voice Play Note Audio Player**: Interactive waveform animation, play/pause controls, and audio timer.
     - Supports natural voice speech synthesis in Hindi/English + custom uploaded audio MP3 files from admin!

7. **06. Ready to Celebrate? (Contact Hub)**:
   - Arched gold ribbon banner with floating hearts.
   - **Book Now**: Direct slot reservation link (`https://momentsgalaxy.com/booking`).
   - **WhatsApp**: `+91 8699505560` (`https://wa.me/918699505560`).
   - **Call Us**: `+91 8699505560` (`tel:8699505560`).

8. **07. Luxury Inquiry Form**:
   - Flanked with 3D Gold Gift Box & Red Velvet Roses graphics.
   - Inputs: Your Name, WhatsApp Number, Occasion, Preferred Theater, Event Date, Additional Details.
   - Saves lead to the Admin Inquiries database and pre-fills a formatted WhatsApp message for instant booking confirmation!

9. **08. 100% Dynamic Admin Panel (`admin.html`)**:
   - Secure PIN protection (Default: `admin123`).
   - **Dual Media Video/Audio System (Dono Options Har Video Ke Liye)**:
     - **Option A:** Paste online Video/Audio URL (Catbox, Cloudinary, YouTube, MP4).
     - **Option B:** Direct file upload from computer (MP4, WebM, MP3) backed by **IndexedDB Storage Engine** (supports high-definition videos of any size without quota limits).
     - Live preview player right inside Admin with "✕ Remove Upload" option.
   - Manage Hero text, videos, and posters.
   - Manage all 4 theater video URLs, badges, and details.
   - Manage Add-ons, Food, and Booking links.
   - Manage coupons and turn them ON/OFF with 1-click.
   - Manage Notice video & Voice FAQ questions and audio clips.
   - Inquiries Lead Manager: Table of leads, 1-click WhatsApp customer chat, 1-click phone call, status update, and CSV export.
   - Theme control: Set default Light/Dark mode and toggle visitor permissions.
   - Configuration backup and factory reset.

10. **09. Google Map Location**:
    - Coordinates: `30.726564696917464, 76.7252708362585` (Chandigarh / Mohali).
    - Embedded Google Map with directions button.

11. **11. Connected Links & Details**:
    - Phone & WhatsApp: `8699505560`
    - Add-ons: `https://momentsgalaxy.com/add-ons`
    - Food Order: `https://momentsgalaxy.com/food-order`
    - Booking: `https://momentsgalaxy.com/booking`
    - Instagram: `https://instagram.com/moments_galaxy`
    - Google Map Coordinates: `30.726564696917464, 76.7252708362585`

12. **12. UI Light & Dark Mode Control**:
    - Dark mode: Obsidian Black & Royal Gold.
    - Light mode: Ivory Champagne & Rose Gold.
    - Controllable directly from Admin settings.

---

## 🚀 How to Run the Website

### Option 1: Direct Browser Launch (No server needed)
Simply double click `index.html` in your file explorer to open it directly in Google Chrome, Microsoft Edge, or any modern web browser!
To open Admin Panel, double click `admin.html`. (Default PIN: `admin123`).

### Option 2: Run Local Web Server (Windows PowerShell)
Open PowerShell in this folder and run:
```powershell
.\start-server.ps1
```
This will automatically launch the website on `http://localhost:8080/`.

---

## 📁 File Structure
```
c:\moments galaxy landing page code\
├── index.html                   # Main luxury landing page
├── admin.html                   # Dynamic admin control panel
├── start-server.ps1             # 1-click local web server script
├── README.md                    # Project documentation
├── css/
│   ├── style.css                # Master luxury styling (Dark/Light)
│   └── admin.css                # Admin dashboard styling
├── js/
│   ├── data.js                  # Centralized dynamic data store & state
│   ├── app.js                   # Landing page controller & voice player
│   └── admin.js                 # Admin panel controller & sync engine
└── assets/
    └── images/
        ├── logo.png             # Official Moments Galaxy golden wings logo
        ├── hero-presenter.svg   # Welcome host presenter artwork
        ├── star-basic.svg       # Star Theater Basic poster
        ├── star-addons.svg      # Star Theater With Add-ons poster
        ├── prime-basic.svg      # Prime Theater Basic poster
        ├── prime-addons.svg     # Prime Theater With Add-ons poster
        ├── notice-poster.svg    # Notice guidelines video poster
        └── luxury-gift-roses.svg# 3D Gift Box & Roses artwork
```

---

## 🔒 Admin Credentials
- **URL**: `admin.html` (or click "Admin Control Panel" in the footer/drawer)
- **Security PIN**: `admin123` (Changeable in settings)
