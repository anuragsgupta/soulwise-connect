# 🎨 Dynamic Font System - Mann Mitra

## Current Configuration

**Active Font Set:** Option 1 - Calm & Professional

- **Heading Font:** Poppins (Modern, friendly, professional)
- **Body Font:** Inter (Clean, highly readable)
- **Accent Font:** Quicksand (Soft, approachable)

---

## 🚀 How to Switch Fonts (Super Easy!)

### Method 1: Use Pre-configured Font Sets

1. Open `/src/config/fonts.ts`
2. Find this line (around line 132):
   ```typescript
   export const ACTIVE_FONT_SET: keyof typeof FONT_PRESETS = 'option1';
   ```
3. Change `'option1'` to:
   - `'option2'` - for Friendly & Approachable (Outfit + DM Sans + Quicksand)
   - `'option3'` - for Elegant & Calming (Plus Jakarta Sans + Manrope + Space Grotesk)
4. Save the file
5. Rebuild: `npm run build`
6. Done! 🎉 All fonts update automatically across the entire app!

### Method 2: Add Your Own Custom Fonts

1. Open `/src/config/fonts.ts`
2. Import your desired Google Fonts at the top:
   ```typescript
   import { YourHeadingFont, YourBodyFont, YourAccentFont } from 'next/font/google';
   ```
3. Configure the fonts:
   ```typescript
   export const yourHeadingFont = YourHeadingFont({
     subsets: ['latin'],
     weight: ['400', '600', '700'],
     variable: '--font-heading',
     display: 'swap',
   });
   ```
4. Add a new preset in `FONT_PRESETS`:
   ```typescript
   option4: {
     name: 'Your Custom Style',
     description: 'Your description here',
     heading: yourHeadingFont,
     body: yourBodyFont,
     accent: yourAccentFont,
     headingName: 'Your Heading Font Name',
     bodyName: 'Your Body Font Name',
     accentName: 'Your Accent Font Name',
   },
   ```
5. Change `ACTIVE_FONT_SET` to `'option4'`
6. Rebuild and enjoy!

---

## 📚 Available Font Presets

### Option 1: Calm & Professional ⭐ (Recommended)
**Perfect for mental health apps - warm, readable, trustworthy**

- **Heading:** Poppins - Modern, friendly, professional
- **Body:** Inter - Clean, highly readable
- **Accent:** Quicksand - Soft, approachable

**Best for:**
- Mental health platforms
- Healthcare applications
- Professional yet warm feel
- Maximum readability

**Characteristics:**
- ⭐⭐⭐⭐⭐ Readability
- ⭐⭐⭐⭐⭐ Friendliness
- ⭐⭐⭐⭐⭐ Professionalism
- ⭐⭐⭐⭐⭐ Accessibility

---

### Option 2: Friendly & Approachable
**Best for younger audience - playful yet professional**

- **Heading:** Outfit - Modern, friendly
- **Body:** DM Sans - Clean, versatile
- **Accent:** Quicksand - Soft, approachable

**Best for:**
- Student-focused platforms
- Youth mental health services
- Playful but not childish
- Modern feel

**Characteristics:**
- ⭐⭐⭐⭐ Readability
- ⭐⭐⭐⭐⭐ Friendliness
- ⭐⭐⭐⭐ Professionalism
- ⭐⭐⭐⭐ Accessibility

---

### Option 3: Elegant & Calming
**Premium feel - sophisticated mental wellness**

- **Heading:** Plus Jakarta Sans - Elegant, modern
- **Body:** Manrope - Geometric, readable
- **Accent:** Space Grotesk - Unique, memorable

**Best for:**
- Premium mental health services
- Corporate wellness programs
- Sophisticated audience
- Elegant branding

**Characteristics:**
- ⭐⭐⭐⭐ Readability
- ⭐⭐⭐⭐ Friendliness
- ⭐⭐⭐⭐⭐ Professionalism
- ⭐⭐⭐⭐ Accessibility

---

## 💡 Usage in Components

### Using Font Classes in Your JSX

```tsx
import { fontClasses } from '@/config/fonts';

// For headings
<h1 className={`${fontClasses.heading} text-4xl font-bold`}>
  Mental Health Matters
</h1>

// For body text (this is the default, but you can be explicit)
<p className={`${fontClasses.body} text-base`}>
  Welcome to Mann Mitra, your mental health companion.
</p>

// For buttons and CTAs
<button className={`${fontClasses.accent} px-6 py-3 font-medium`}>
  Get Started
</button>

// Or just use Tailwind's font utilities
<h2 className="font-heading text-3xl">Easy Heading</h2>
<p className="font-body text-lg">Body text</p>
<button className="font-accent">Button</button>
```

### Programmatic Access

```tsx
import { fontConfig } from '@/config/fonts';

console.log(fontConfig.current); // 'option1'
console.log(fontConfig.name); // 'Calm & Professional'
console.log(fontConfig.fonts.heading.name); // 'Poppins'
```

---

## 🎯 Font Usage Guidelines

### When to Use Each Font Type

#### Heading Font (Poppins)
Use for:
- ✅ Page titles and section headers
- ✅ Card titles
- ✅ Important announcements
- ✅ Hero text
- ✅ Navigation items

```tsx
<h1 className="font-heading text-4xl font-bold">Main Title</h1>
<h2 className="font-heading text-2xl font-semibold">Section Title</h2>
```

#### Body Font (Inter)
Use for:
- ✅ Paragraphs and descriptions
- ✅ Chat messages
- ✅ Form labels
- ✅ List items
- ✅ Long-form content

```tsx
<p className="font-body text-base leading-relaxed">
  Your mental health journey starts here...
</p>
```

#### Accent Font (Quicksand)
Use for:
- ✅ Buttons and CTAs
- ✅ Badges and tags
- ✅ Interactive elements
- ✅ Emphasis text
- ✅ Call-to-action links

```tsx
<button className="font-accent font-medium px-4 py-2">
  Book Appointment
</button>
```

---

## 🔧 Technical Details

### Font Loading Strategy

All fonts use:
- **Display:** `swap` - Shows fallback font immediately, swaps when custom font loads
- **Subsets:** `latin` - Optimized for English language
- **Variable Fonts:** Used where available for smaller file sizes

### CSS Variables

The system automatically creates these CSS variables:
- `--font-heading` - Heading font
- `--font-body` - Body font
- `--font-accent` - Accent font

### Tailwind Classes

Available Tailwind utilities:
- `font-heading` - Apply heading font
- `font-body` - Apply body font
- `font-accent` - Apply accent font
- `font-sans` - Default to body font

---

## 🎨 Font Pairing Best Practices

### Do's ✅
- Use heading font for titles and important text
- Use body font for readable content
- Use accent font for interactive elements
- Maintain consistent hierarchy
- Limit to 3 font families max

### Don'ts ❌
- Don't mix too many font weights
- Don't use accent font for long paragraphs
- Don't use all caps with decorative fonts
- Don't ignore line height and spacing
- Don't forget about mobile readability

---

## 🚀 Performance Tips

1. **Preload Critical Fonts:** Already configured with `display: swap`
2. **Subset Optimization:** Using `latin` subset only
3. **Variable Fonts:** Next.js automatically optimizes Google Fonts
4. **Font Display:** Using `swap` strategy for instant text visibility

---

## 📊 Font Testing Checklist

After changing fonts, test these:

- [ ] Headings are clear and prominent (h1-h6)
- [ ] Body text is readable at 16px
- [ ] Buttons look clickable and friendly
- [ ] Mobile view is comfortable (320px width)
- [ ] Chat messages are easy to read
- [ ] Forms and inputs are accessible
- [ ] Line height is comfortable (1.5-1.7 for body)
- [ ] Letter spacing is appropriate
- [ ] Weight hierarchy is clear
- [ ] All screens maintain consistency

---

## 🎓 Quick Reference

| Element | Font | Class | Weight |
|---------|------|-------|--------|
| H1 | Poppins | `font-heading` | 700 |
| H2-H6 | Poppins | `font-heading` | 600 |
| Body Text | Inter | `font-body` | 400-600 |
| Buttons | Quicksand | `font-accent` | 500-600 |
| Chat Messages | Inter | `font-body` | 400 |
| Navigation | Poppins | `font-heading` | 500 |
| Small Text | Inter | `font-body` | 300-400 |

---

## 🔄 Migration from Old Fonts

If you're upgrading from Nunito:

1. The system automatically applies new fonts
2. No manual changes needed in components
3. Build the project to see changes
4. Test all pages for readability
5. Adjust font weights if needed

---

## 🆘 Troubleshooting

### Fonts not loading?
1. Clear `.next` folder: `rm -rf .next`
2. Rebuild: `npm run build`
3. Clear browser cache

### Fonts look different in production?
- Next.js optimizes fonts automatically
- Google Fonts are self-hosted in production
- This is normal and improves performance

### Want different weights?
Edit the font configuration in `/src/config/fonts.ts`:
```typescript
export const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'], // Add more weights
  // ... rest of config
});
```

---

## 📞 Support

For more font options, check:
- [Google Fonts](https://fonts.google.com/)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

---

**Remember:** The goal is readability, accessibility, and creating a warm, trustworthy experience for mental health support! 💙
