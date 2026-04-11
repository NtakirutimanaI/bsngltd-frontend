const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace standard navbar logo
  content = content.replace(
    /<h1>BSNG<\/h1>/g,
    '<h1 className="d-flex align-items-center m-0"><img src="/img/logo.png" alt="BSNG Logo" style={{ height: \'45px\', marginRight: \'10px\' }} />BSNG</h1>'
  );

  // Replace footer logo
  content = content.replace(
    /<h1 className="text-white">BSNG<\/h1>/g,
    '<h1 className="text-white d-flex align-items-center m-0"><img src="/img/logo.png" alt="BSNG Logo" style={{ height: \'45px\', marginRight: \'10px\' }} />BSNG</h1>'
  );

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Added logo to all pages!');
