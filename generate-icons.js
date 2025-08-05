// Generate WebSnip icons programmatically
const fs = require('fs');
const path = require('path');

// Create simple SVG icons that can be converted to PNG
function createSVGIcon(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4285f4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#34a853;stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.125}" ry="${size * 0.125}" fill="url(#grad)"/>
    <text x="${size / 2}" y="${size / 2}" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">WS</text>
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Generate SVG icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const filename = path.join(iconsDir, `icon${size}.svg`);
    fs.writeFileSync(filename, svgContent);
    console.log(`Generated: ${filename}`);
});

console.log('SVG icons generated successfully!');
console.log('Note: These are temporary icons. You can replace them with your custom designs later.');