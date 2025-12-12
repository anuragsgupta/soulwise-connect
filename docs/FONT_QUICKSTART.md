# 🚀 Quick Start: Switch Fonts in 30 Seconds

## Current Setup
✅ **Heading Font:** Poppins (Modern, friendly, professional)
✅ **Body Font:** Inter (Clean, highly readable)
✅ **Accent Font:** Quicksand (Soft, approachable)

---

## 🔄 How to Switch Fonts

### Step 1: Open the Config File
```bash
/src/config/fonts.ts
```

### Step 2: Find This Line (Line 132)
```typescript
export const ACTIVE_FONT_SET: keyof typeof FONT_PRESETS = 'option1';
```

### Step 3: Change to Another Option
```typescript
// For Friendly & Approachable (Younger audience)
export const ACTIVE_FONT_SET: keyof typeof FONT_PRESETS = 'option2';

// OR for Elegant & Calming (Premium feel)
export const ACTIVE_FONT_SET: keyof typeof FONT_PRESETS = 'option3';
```

### Step 4: Rebuild
```bash
npm run build
npm run dev
```

### Done! 🎉
All fonts update automatically everywhere in your app!

---

## 🎨 Available Options

### Option 1: Calm & Professional ⭐ (Current)
**Perfect for mental health apps**
- Heading: Poppins
- Body: Inter  
- Accent: Quicksand
- Feel: Warm, trustworthy, readable

### Option 2: Friendly & Approachable
**Best for younger audience**
- Heading: Outfit
- Body: DM Sans
- Accent: Quicksand  
- Feel: Playful, modern, friendly

### Option 3: Elegant & Calming
**Premium mental wellness**
- Heading: Plus Jakarta Sans
- Body: Manrope
- Accent: Space Grotesk
- Feel: Sophisticated, elegant, calming

---

## 💡 Quick Tips

### In Your Components

```tsx
// Headings automatically use heading font
<h1 className="text-4xl font-bold">Title</h1>

// Body text automatically uses body font  
<p className="text-base">Content here</p>

// Buttons automatically use accent font
<button className="px-6 py-3">Click Me</button>

// Or be explicit with these classes:
<div className="font-heading">Heading font</div>
<div className="font-body">Body font</div>
<div className="font-accent">Accent font</div>
```

---

## 📖 Full Documentation

- **Comprehensive Guide:** `/FONTS.md`
- **Implementation Details:** `/FONT_IMPLEMENTATION.md`
- **Font Config:** `/src/config/fonts.ts`
- **Live Examples:** `/src/components/FontShowcase.tsx`

---

## 🎯 That's It!

One line change = Entire app's typography updated! 🚀

**The beauty of the system:** You can experiment with different fonts in seconds and see which combination works best for your mental health platform!

Try switching between options and see which one resonates best with your audience! 💙
