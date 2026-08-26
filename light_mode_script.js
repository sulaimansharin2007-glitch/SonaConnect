const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

const replacements = [
  // text colors
  { regex: /text-white\/([0-9]+)/g, replace: 'text-slate-700/$1' },
  { regex: /text-white(?![\w\-\/])/g, replace: 'text-slate-900' },
  
  // bg colors
  { regex: /bg-dark-([0-9]+)/g, replace: 'bg-slate-50' },
  { regex: /bg-dark(?![\w\-\/])/g, replace: 'bg-white' },
  
  { regex: /bg-white\/([0-9]+)/g, replace: 'bg-slate-900/$1' },
  
  // borders
  { regex: /border-white\/([0-9]+)/g, replace: 'border-slate-900/$1' },
  
  // specific dark components
  { regex: /glass-dark/g, replace: 'glass' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      replacements.forEach(({regex, replace}) => {
        content = content.replace(regex, replace);
      });
      
      // Keep button text white since buttons have dark/primary backgrounds
      // Hack: revert text-slate-900 back to text-white if inside btn-primary or similar
      // Since it's hard to parse JSX with regex, we can just hope most buttons use 'text-white' explicitly or rely on .btn-primary in index.css.
      // Wait, in index.css, .btn-primary has text-white directly in the @apply layer! So buttons will stay white.
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done transforming to light theme');
