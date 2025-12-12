# 🎮 Quick Game Testing Guide

## How to Test the Interactive Games

### 1. Start the Dev Server
```bash
npm run dev
```
Server runs on: `http://localhost:3001` (or 3000 if available)

---

## 2. Access the Games

### Option A: Direct Navigation
1. Open browser to `http://localhost:3001`
2. Log in to the dashboard (if not already logged in)
3. Navigate to **Resource Hub** section
4. Click the **"Games"** tab in the category filter

### Option B: Search
1. In Resource Hub, use the search bar
2. Type: `breathing`, `ball`, `circle`, or `box`
3. Games will appear in filtered results

---

## 3. Test Each Game

### 🎯 **Breathing Ball** (4-4-4-2 Pattern)

**How to Launch:**
- Click the card: **"Interactive Breathing Ball"**

**What to Test:**
1. ✅ Modal opens with animated ball
2. ✅ Click **Play** → Ball starts expanding/contracting
3. ✅ Watch phases change: Inhale → Hold → Exhale → Rest
4. ✅ Countdown timer updates every second
5. ✅ Cycle counter increments after each complete cycle
6. ✅ Click **Pause** → Animation stops
7. ✅ Click **Resume** → Animation continues from current phase
8. ✅ Click **Reset** → Resets to 0 cycles, returns to start
9. ✅ Click **X** button → Modal closes
10. ✅ Check responsive behavior:
    - Resize window to mobile width (320px)
    - Resize to tablet (768px)
    - Resize to desktop (1920px)

**Expected Behavior:**
- Ball scales from 75% (exhale) to 150% (inhale)
- Colors change: Teal → Blue → Purple → Gray
- Smooth 4-second transitions
- Total cycle: 14 seconds

---

### 📦 **Box Breathing** (Navy SEAL Technique)

**How to Launch:**
- Click the card: **"Box Breathing Exercise"**

**What to Test:**
1. ✅ Modal opens with box visualization
2. ✅ Click **Settings** icon → Settings panel appears
3. ✅ Adjust duration slider (3-8 seconds)
4. ✅ Click **Play** → Dot starts moving around box
5. ✅ Watch dot travel: Top edge → Right → Bottom → Left
6. ✅ Corner indicators light up as dot passes
7. ✅ Center text shows: countdown number and phase name
8. ✅ Cycle counter increments after completing box path
9. ✅ Click **Pause** → Dot stops moving
10. ✅ Click **Reset** → Returns to start position
11. ✅ Change duration while paused → New timing applies
12. ✅ Click **X** button → Modal closes
13. ✅ Test responsive behavior at different screen sizes

**Expected Behavior:**
- Dot travels clockwise around box
- Default: 4 seconds per side (16s total)
- Smooth SVG animations
- Phase labels: "Breathe In" → "Hold" → "Breathe Out" → "Hold"

---

### 🌀 **Calm Circle** (4-7-8 Technique)

**How to Launch:**
- Click the card: **"Calm Circle - Breath Pacer"**

**What to Test:**
1. ✅ Modal opens with pulsing circle
2. ✅ Three sliders visible: Inhale, Hold, Exhale
3. ✅ Adjust each slider independently:
   - Inhale: 2-8 seconds
   - Hold: 2-10 seconds
   - Exhale: 2-12 seconds
4. ✅ Click **Play** → Circle starts pulsing
5. ✅ Watch circle grow (inhale) and shrink (exhale)
6. ✅ Progress ring fills around edge during each phase
7. ✅ Colors change per phase (teal → blue → purple gradients)
8. ✅ Center shows countdown and phase name
9. ✅ Cycle counter updates
10. ✅ Total time displays in MM:SS format
11. ✅ Click **Sound** icon (currently non-functional, but toggle works)
12. ✅ Click **Pause** → Circle stops at current size
13. ✅ Click **Reset** → Returns to default state
14. ✅ Click **X** button → Modal closes
15. ✅ Test responsive behavior

**Expected Behavior:**
- Default 4-7-8 pattern: 4s inhale, 7s hold, 8s exhale (19s cycle)
- Circle scales 50% to 100%
- Smooth pulsing with glow effect
- Customizable timing persists during session

---

## 4. Cross-Browser Testing

Test in multiple browsers:

### Desktop Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Browsers
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ✅ Samsung Internet

---

## 5. Responsive Testing

### Mobile (320px - 480px)
- [ ] Game fills screen appropriately
- [ ] Text is readable (not too small)
- [ ] Controls are touch-friendly (min 44px targets)
- [ ] Animations are smooth (no lag)
- [ ] Modal is scrollable if content overflows

### Tablet (481px - 1024px)
- [ ] Game centered in viewport
- [ ] Adequate white space around modal
- [ ] Text scales appropriately
- [ ] Controls well-spaced

### Desktop (1025px+)
- [ ] Max-width constraint applied (2xl = 672px)
- [ ] Modal doesn't get too large
- [ ] Hover effects work on buttons
- [ ] Smooth animations at 60fps

---

## 6. Performance Testing

### Monitor These Metrics

**Browser DevTools → Performance Tab:**
1. **FPS**: Should stay at 60fps during animations
2. **Memory**: No memory leaks after 5+ cycles
3. **CPU**: Should be < 20% usage on modern devices

**Console Warnings:**
- Check for React warnings
- Check for missing dependencies
- Check for prop type errors

---

## 7. Accessibility Testing

### Keyboard Navigation
- [ ] **Tab**: Navigate between controls
- [ ] **Enter/Space**: Activate buttons
- [ ] **Escape**: Close modal (if implemented)

### Screen Reader
- [ ] Button labels are descriptive
- [ ] Phase changes announced (if aria-live implemented)
- [ ] Stats are readable

### Color Contrast
- [ ] Text meets WCAG AA standard (4.5:1 ratio)
- [ ] Controls are distinguishable
- [ ] Focus indicators visible

---

## 8. Edge Cases to Test

### Timing Edge Cases
- [ ] Set all sliders to minimum values (2s, 2s, 2s)
- [ ] Set all sliders to maximum values (8s, 10s, 12s)
- [ ] Start, pause immediately, then resume
- [ ] Reset multiple times in quick succession

### UI Edge Cases
- [ ] Open multiple games simultaneously (only one should show)
- [ ] Close game mid-cycle
- [ ] Resize window while game is running
- [ ] Switch tabs and return (should pause or continue?)
- [ ] Rotate device (mobile) during exercise

### Network Edge Cases
- [ ] Test offline (PWA should work)
- [ ] Slow 3G connection
- [ ] Assets should be cached

---

## 9. Integration Testing

### Resource Hub Integration
- [ ] All 14 resources display correctly
- [ ] Category filter shows "Games" with Gamepad icon
- [ ] Search finds games by keyword
- [ ] Game cards have correct metadata (duration, rating, downloads)
- [ ] Clicking non-game resources doesn't break
- [ ] Featured collections card for "Games" displays

### Dashboard Integration
- [ ] Games accessible from dashboard
- [ ] No layout shifts when opening games
- [ ] Games don't interfere with other dashboard features
- [ ] Navbar remains visible and functional

---

## 10. Build & Production Testing

### Test Production Build
```bash
npm run build
npm start
```

**Check:**
- [ ] Build completes without errors
- [ ] Bundle size is reasonable (< 60 kB dashboard)
- [ ] Games work in production mode
- [ ] Service worker caches game assets
- [ ] PWA install prompt works
- [ ] No console errors in production

---

## 🐛 Bug Reporting Template

If you find a bug, use this template:

```markdown
**Bug Title:** [Short description]

**Game:** [Breathing Ball / Box Breathing / Calm Circle]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: [Chrome 120, Firefox 118, etc.]
- Device: [iPhone 14, Desktop, etc.]
- Screen Size: [1920x1080, 375x667, etc.]
- OS: [Windows 11, macOS 14, Android 13, iOS 17, etc.]

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Copy any errors from console]
```

---

## ✅ Quick Test Checklist

Use this for rapid testing:

### Breathing Ball
- [ ] Opens
- [ ] Plays
- [ ] Pauses
- [ ] Resets
- [ ] Closes
- [ ] Responsive

### Box Breathing
- [ ] Opens
- [ ] Settings work
- [ ] Dot animates
- [ ] Cycles count
- [ ] Closes
- [ ] Responsive

### Calm Circle
- [ ] Opens
- [ ] Sliders work
- [ ] Circle pulses
- [ ] Colors change
- [ ] Closes
- [ ] Responsive

---

## 🎉 Success Criteria

All tests pass when:
- ✅ All 3 games launch correctly
- ✅ Animations are smooth (60fps)
- ✅ Controls work as expected
- ✅ Statistics update accurately
- ✅ Modal closes properly
- ✅ Responsive on all screen sizes
- ✅ No console errors
- ✅ Build succeeds
- ✅ Production-ready

---

**Happy Testing! 🚀**

If everything works, you're ready to deploy to production!
