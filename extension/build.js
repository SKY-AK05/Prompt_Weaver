
// Simple build script for Chrome Extension
const fs = require('fs');
const path = require('path');

// Copy icons from public assets if they exist
function copyIcons() {
  const assetsDir = path.join(__dirname, '../public/assets');
  const iconsDir = path.join(__dirname, 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Use the new logo file name. Please ensure 'promptweaver-icon.png' exists in 'public/assets'.
  // If your new logo file has a different name, please update it here.
  const logoFile = path.join(assetsDir, 'promptweaver-icon.png'); 
  
  if (fs.existsSync(logoFile)) {
    // For now, just copy the same file to all sizes
    // In production, you'd want to resize these properly
    const iconSizes = ['16', '32', '48', '128'];
    
    iconSizes.forEach(size => {
      const targetFile = path.join(iconsDir, `icon-${size}.png`);
      if (!fs.existsSync(targetFile)) { // Only copy if it doesn't exist to avoid unnecessary writes
        fs.copyFileSync(logoFile, targetFile);
        console.log(`Created icon-${size}.png from ${logoFile}`);
      }
    });
  } else {
    console.warn(`Warning: Logo file not found at ${logoFile}. Please add your new logo file to /public/assets/ and update the filename in extension/build.js if necessary. Default icons might not be updated.`);
  }
}

console.log('Building Chrome Extension...');
copyIcons();
console.log('Extension build complete! Check the /extension/icons/ directory.');

