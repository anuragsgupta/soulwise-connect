# 📲 PWA Install Prompt Feature

## Overview

Your Mann Mitra PWA now has **two ways** to prompt users to install the app:

### 1. 🎯 Auto Install Popup
- **Appears after**: 10 seconds of browsing
- **Frequency**: Once every 3 days if dismissed
- **Features**:
  - Beautiful modal dialog with app benefits
  - "Install Now" button
  - "Remind Me Later" option (shows again next visit)
  - "No Thanks" option (hides for 3 days)
  - Auto-detects if app is already installed

### 2. 🔘 Manual Install Button
- **Location**: Top navbar (desktop only)
- **Always available**: Shows whenever installation is possible
- **Hides automatically**: When app is already installed

---

## 🎨 Features

### Auto Popup (`PWAInstallPrompt`)
- ✅ Appears 10 seconds after page load
- ✅ Beautiful gradient design with teal theme
- ✅ Shows 3 key benefits:
  - Native app experience
  - Offline access
  - Quick home screen access
- ✅ Smart dismissal logic:
  - "No Thanks" = hidden for 3 days
  - "Remind Later" = shows on next visit
- ✅ Respects user if already installed
- ✅ Stores preferences in localStorage

### Manual Button (`InstallButton`)
- ✅ Clean outline button in navbar
- ✅ Download icon with "Install App" text
- ✅ Shows toast notification on success
- ✅ Helpful error message if not available
- ✅ Hidden on mobile (space saving)
- ✅ Auto-hides when app is installed

---

## 🧪 Testing

### Development Mode
**Note**: PWA features are disabled in dev mode, but you can still see the UI.

To test the popup:

1. **Build for production**:
```bash
npm run build
npm start
```

2. **Open in browser**: http://localhost:3000

3. **Wait 10 seconds**: Popup should appear

4. **Test buttons**:
   - "Install Now" → Triggers browser install
   - "Remind Me Later" → Closes (shows next visit)
   - "No Thanks" → Closes (hidden for 3 days)

### Manual Button Test

1. Look for "Install App" button in navbar (desktop)
2. Click to trigger installation
3. Should show success toast
4. Button disappears after installation

---

## 🎯 User Experience Flow

### First Visit
```
User lands on site
    ↓
Browses for 10 seconds
    ↓
✨ Popup appears
    ↓
User clicks "Install Now"
    ↓
Browser install prompt
    ↓
App installed! 🎉
    ↓
Popup never shows again
```

### If User Dismisses
```
User clicks "No Thanks"
    ↓
Stored in localStorage
    ↓
Won't see popup for 3 days
    ↓
But "Install App" button still available
```

### Already Installed
```
User has app installed
    ↓
Both popup and button hidden
    ↓
Clean UI, no annoying prompts
```

---

## ⚙️ Customization

### Change Popup Timing

Edit `/src/components/PWAInstallPrompt.tsx`:

```typescript
// Show after 10 seconds (10000ms)
setTimeout(() => {
  setShowPrompt(true);
}, 10000); // ← Change this value
```

### Change Dismissal Period

```typescript
// Hide for 3 days after "No Thanks"
const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // ← Change this
```

### Modify Popup Content

Edit the `DialogContent` section in `PWAInstallPrompt.tsx`:
- Change title
- Update benefits list
- Modify button text
- Adjust styling

### Customize Button Style

Edit `/src/components/InstallButton.tsx`:

```typescript
<Button
  className="your-custom-classes"
  size="lg" // sm, md, lg
  variant="outline" // ghost, default, etc.
>
  Install App
</Button>
```

---

## 📊 Analytics (Optional Enhancement)

Track install events:

```typescript
// In PWAInstallPrompt.tsx
const handleInstallClick = async () => {
  // ... existing code
  
  // Track in your analytics
  analytics.track('pwa_install_clicked', {
    source: 'auto_popup',
    outcome: outcome
  });
};

// In InstallButton.tsx
const handleInstallClick = async () => {
  // ... existing code
  
  analytics.track('pwa_install_clicked', {
    source: 'manual_button',
    outcome: outcome
  });
};
```

---

## 🚀 Browser Support

| Browser | Popup | Button | Install |
|---------|-------|--------|---------|
| Chrome Desktop | ✅ | ✅ | ✅ |
| Chrome Mobile | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Safari iOS | ⚠️* | ⚠️* | ⚠️* |
| Firefox | ❌ | ❌ | ⚠️** |

*Safari uses its own install mechanism (Add to Home Screen)  
**Firefox on Android supports PWA installation

---

## 🔧 Troubleshooting

### Popup Not Showing?

**Check:**
1. Are you in production mode? (`npm run build && npm start`)
2. Is app already installed?
3. Has it been dismissed in last 3 days?
4. Clear localStorage: `localStorage.removeItem('pwa-install-dismissed')`

### Button Not Showing?

**Check:**
1. Browser supports PWA installation
2. App not already installed
3. Using HTTPS or localhost
4. Service Worker is active

### Install Not Working?

**Requirements:**
- ✅ HTTPS (or localhost)
- ✅ Valid manifest.json
- ✅ Service Worker registered
- ✅ Icons available
- ✅ Production build

---

## 📁 Files Added

```
src/components/
├── PWAInstallPrompt.tsx    # Auto popup dialog
└── InstallButton.tsx         # Manual install button

src/app/
└── layout.tsx               # Updated (added PWAInstallPrompt)

src/components/landing/
└── Navbar.tsx               # Updated (added InstallButton)
```

---

## ✨ Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Auto Popup | ✅ | Global (all pages) |
| Manual Button | ✅ | Navbar (desktop) |
| Smart Timing | ✅ | 10 seconds delay |
| Dismissal Logic | ✅ | 3-day cooldown |
| Install Detection | ✅ | Auto-hide when installed |
| Toast Notifications | ✅ | Success/error messages |
| Mobile Optimized | ✅ | Responsive design |
| localStorage | ✅ | Remembers preferences |

---

## 🎯 Next Steps

1. **Test in Production**:
   ```bash
   npm run build
   npm start
   # Visit http://localhost:3000
   ```

2. **Deploy**:
   ```bash
   git add .
   git commit -m "feat: Add PWA install prompt"
   git push
   ```

3. **Monitor**:
   - Track how many users install
   - Check dismissal rates
   - A/B test timing and messaging

---

## 💡 Pro Tips

1. **Timing is Key**: 10 seconds is optimal - not too fast, not too slow
2. **Don't Be Pushy**: 3-day cooldown prevents annoyance
3. **Always Provide Manual Option**: Some users prefer it
4. **Mobile First**: Auto-popup works great on mobile
5. **Test Everything**: Different browsers behave differently

---

Your PWA install experience is now complete! 🎉

Users will see a beautiful, non-intrusive prompt to install your app, with the option to dismiss or install later.
