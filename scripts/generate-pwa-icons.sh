#!/bin/bash

# PWA Icon Generator Script
# This script generates PWA icons from your logo

echo "🎨 Generating PWA Icons for Mann Mitra..."

# Create icons directory if it doesn't exist
mkdir -p public/icons
mkdir -p public/screenshots

# Icon sizes needed for PWA
SIZES=(72 96 128 144 152 192 384 512)

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo "📦 Install it with:"
    echo "   - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   - macOS: brew install imagemagick"
    echo "   - Or use an online tool: https://realfavicongenerator.net/"
    exit 1
fi

# Check if source logo exists
if [ ! -f "src/assets/mann-mitra-logo.png" ]; then
    echo "❌ Source logo not found at src/assets/mann-mitra-logo.png"
    echo "📝 Please provide a logo image and rerun this script"
    exit 1
fi

echo "✅ Found source logo"
echo "🔄 Generating icons..."

# Generate icons for each size
for size in "${SIZES[@]}"; do
    convert src/assets/mann-mitra-logo.png \
        -resize "${size}x${size}" \
        -gravity center \
        -extent "${size}x${size}" \
        "public/icons/icon-${size}x${size}.png"
    echo "   ✓ Generated ${size}x${size} icon"
done

# Generate favicon
convert src/assets/mann-mitra-logo.png \
    -resize 32x32 \
    public/favicon.ico
echo "   ✓ Generated favicon.ico"

# Generate Apple touch icon
convert src/assets/mann-mitra-logo.png \
    -resize 180x180 \
    -gravity center \
    -extent 180x180 \
    public/apple-touch-icon.png
echo "   ✓ Generated apple-touch-icon.png"

echo ""
echo "✅ PWA icons generated successfully!"
echo ""
echo "📸 Next steps:"
echo "   1. Take screenshots of your app (desktop: 1920x1080, mobile: 750x1334)"
echo "   2. Save them as:"
echo "      - public/screenshots/desktop-1.png"
echo "      - public/screenshots/mobile-1.png"
echo "   3. Build your app: npm run build"
echo "   4. Test PWA with Lighthouse in Chrome DevTools"
echo ""
