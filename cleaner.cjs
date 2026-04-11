const fs = require('fs');
const path = require('path');
const dir = './src/pages';

fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.jsx')) return;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove the entire spinner div
    const spinnerStart = content.indexOf('<div id="spinner"');
    if (spinnerStart !== -1) {
        // find the closing div by just matching up to the end of the spinner block manually
        // Since it's exactly 6 lines, let's just do a simple replacement
        const regex = /<div id="spinner"[\s\S]*?<span className="sr-only">Loading...<\/span>[\s\S]*?<\/div>\s*<\/div>/g;
        content = content.replace(regex, '');
    }

    // Remove WOW animations so they don't break on Hot Reload or hide elements
    content = content.replace(/wow fadeIn/g, 'fadeIn');
    content = content.replace(/wow fadeInUp/g, 'fadeInUp');
    content = content.replace(/wow /g, '');
    content = content.replace(/ animated /g, ' ');

    fs.writeFileSync(filePath, content);
    console.log('Cleaned ' + file);
});
