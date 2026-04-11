const fs = require('fs');
const path = require('path');
const pagesDir = './src/pages';

const replacements = [
  // Brand name
  ['iSTUDIO', 'BSNG Construction'],
  // Tagline / slogan
  ['An Award Winning Studio Since 1990', 'Build Strong For Next Generations'],
  ['Award Winning Studio Since 1990', 'Build Strong For Next Generations'],
  // Phone
  ['+012 345 67890', '+250 737 213 060'],
  // Email
  ['info@example.com', 'info.buildstronggenerations@gmail.com'],
  // Address
  ['123 Street, New York, USA', 'Kibagabaga, Kigali, Rwanda'],
  // Footer site name
  ['Your Site Name', 'BSNG Construction'],
  // Hero heading
  ['We Make Your <span className="text-primary">Home</span>\n                        Better', 'We <span className="text-primary">Build Strong</span>\n                        For Next Generations'],
  // Footer description
  ['Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam amet diam et eos labore.', 'Build Strong For Next Generations (BSNG) — Your trusted partner in construction, real estate and property management in Rwanda.'],
  // Footer popular links section
  ['Interior Design', 'House Construction'],
  ['Project Planning', 'Plot Sales'],
  ['Renovation', 'Renovation'],
  ['Implement', 'Property Rental'],
  ['Landscape Design', 'Brokerage'],
  // Subheadings on service section
  ['Crafted Furniture', 'House Construction'],
  ['Sustainable Material', 'Plot Sales'],
  ['Innovative Architects', 'Renovation'],
  ['Budget Friendly', 'Property Rental'],
  // About page history text
  ['History of Our Creation', 'History of Our Company'],
  // Features page
  ['Best Interior Design', 'Expert Construction'],
  ['25+ Years Experience', '10+ Years Experience'],
  // Contact buy pro version button - hide it
  ['Buy Pro Version', 'Contact Us'],
  // Footer About Us link keep
  // Feature items
  ['Customer Satisfaction', 'Client Satisfaction'],
];

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  replacements.forEach(([from, to]) => {
    content = content.split(from).join(to);
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${file}`);
});

console.log('\nAll pages updated with BSNG Construction content!');
