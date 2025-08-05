// Create Chrome Web Store package
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Chrome Web Store package for WebSnip...');

// Files to include in the Chrome Web Store package
const filesToInclude = [
    'src/manifest.json',
    'src/background.js',
    'src/icons/icon16.svg',
    'src/icons/icon48.svg', 
    'src/icons/icon128.svg',
    'src/content/media-formatter.js',
    'src/content/media-handler.js',
    'src/content/text-handler.js',
    'src/content/utils.js'
];

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Create webstore-package directory
const packageDir = path.join(distDir, 'webstore-package');
if (fs.existsSync(packageDir)) {
    fs.rmSync(packageDir, { recursive: true, force: true });
}
fs.mkdirSync(packageDir, { recursive: true });

// Copy files to package directory
console.log('📁 Copying extension files...');
filesToInclude.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(packageDir, file.replace('src/', ''));
    
    // Create destination directory if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied: ${file}`);
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

// Create README for the package
const packageReadme = `# WebSnip Chrome Extension - Store Package

This directory contains the files ready for Chrome Web Store submission.

## Package Contents:
- manifest.json - Extension manifest
- background.js - Service worker
- icons/ - Extension icons (16x16, 48x48, 128x128)
- content/ - Content scripts and utilities

## Installation for Testing:
1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this directory

## Store Submission:
1. Zip this entire directory
2. Upload to Chrome Web Store Developer Dashboard
3. Fill in store listing information from store-descriptions.md
4. Submit for review

Generated: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(packageDir, 'README.md'), packageReadme);

// Create zip file for store submission
console.log('📦 Creating ZIP package...');
try {
    const zipPath = path.join(distDir, 'websnip-chrome-extension.zip');
    
    // Remove existing zip if it exists
    if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
    }
    
    // Create zip using PowerShell on Windows
    const powershellCommand = `Compress-Archive -Path "${packageDir}\\*" -DestinationPath "${zipPath}"`;
    execSync(powershellCommand, { shell: 'powershell.exe' });
    
    console.log('✅ ZIP package created successfully!');
    console.log(`📍 Location: ${zipPath}`);
    
    // Show package info
    const stats = fs.statSync(zipPath);
    console.log(`📊 Package size: ${(stats.size / 1024).toFixed(2)} KB`);
    
} catch (error) {
    console.error('❌ Error creating ZIP package:', error.message);
    console.log('💡 Manual zip creation: Compress the webstore-package directory manually');
}

console.log('\n🎉 Chrome Web Store package preparation completed!');
console.log('\n📋 Next steps:');
console.log('1. Test the extension by loading the webstore-package directory in Chrome');
console.log('2. Upload websnip-chrome-extension.zip to Chrome Web Store');
console.log('3. Use descriptions from store-descriptions.md');
console.log('4. Include privacy policy from PRIVACY_POLICY.md');
console.log('5. Submit for review (usually takes 1-3 days)');