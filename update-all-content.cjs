const fs = require('fs');
const path = require('path');
const pagesDir = './src/pages';

// All replacements - order matters (longer/more specific patterns first)
const replacements = [
  // ===== BRAND & CONTACT =====
  ['iSTUDIO', 'BSNG Construction'],
  ['Your Site Name', 'BSNG Construction'],
  ['+012 345 67890', '+250 737 213 060'],
  ['+0123456789', '+250 737 213 060'],
  ['info@example.com', 'info.buildstronggenerations@gmail.com'],
  ['123 Street, New York, USA', 'Kibagabaga, Kigali, Rwanda'],

  // ===== HERO / SLOGANS =====
  ['An Award Winning Studio Since 1990', 'Build Strong For Next Generations'],
  ['Award Winning Studio Since 1990', 'Build Strong For Next Generations'],
  ['We Make Your <span className="text-primary">Home</span>\r\n                        Better', 'We <span className="text-primary">Build Strong</span>\r\n                        For Next Generations'],

  // ===== SERVICE NAMES =====
  ['Interior Design', 'House Construction'],
  ['Project Planning', 'Plot Sales & Purchase'],
  ['Implement', 'Property Sales & Rental'],
  ['Landscape Design', 'Brokerage Services'],
  ['Our Creative <span\r\n                            className="text-uppercase text-primary bg-light px-2">Services</span>', 'Our Professional <span\r\n                            className="text-uppercase text-primary bg-light px-2">Services</span>'],
  ['Commercial', 'Brokerage & Rentals'],
  ['Property Rental', 'Plot Sales'],

  // ===== HERO ITEMS =====
  ['Crafted Furniture', 'House Construction'],
  ['Sustainable Material', 'Plot Sales & Purchase'],
  ['Innovative Architects', 'Home Renovation'],
  ['Budget Friendly', 'Property Rental'],

  // ===== ABOUT SECTION =====
  ['<span className="text-uppercase text-primary bg-light px-2">History</span> of Our\r\n                        Creation', '<span className="text-uppercase text-primary bg-light px-2">History</span> of Our\r\n                        Company'],
  ['<span className="text-uppercase text-primary bg-light px-2">History</span> of Our Creation', '<span className="text-uppercase text-primary bg-light px-2">History</span> of Our Company'],

  // ===== FEATURE SECTION =====
  ['25+ Years Experience', 'Trusted Experience'],
  ['Best Interior Design', 'Expert Construction'],
  ['Customer Satisfaction', 'Client Satisfaction'],

  // ===== BUY PRO VERSION =====
  ['Buy Pro Version', 'Get a Quote'],
  ['https://htmlcodex.com/downloading/?item=3587', '/contact'],

  // ===== CALL US SECTION =====
  ['Call us direct 24/7 for get a free consultation', 'Call us anytime for a free consultation'],

  // ===== NEWSLETTER =====
  ['Diam sed sed dolor stet amet eirmod', 'Stay updated on our latest projects and property listings in Rwanda.'],
  ['Subscribe the <span className="text-uppercase text-primary bg-white px-2">Newsletter</span>', 'Subscribe to Our <span className="text-uppercase text-primary bg-white px-2">Newsletter</span>'],

  // ===== LOREM IPSUM PARAGRAPHS (most specific first) =====
  
  // Footer description
  ['Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam amet diam et eos labore.', 'Build Strong For Next Generations (BSNG) \u2014 Your trusted partner in construction, real estate, and property management across Rwanda.'],

  // About page paragraphs
  ['Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam\r\n                        amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus\r\n                        clita duo justo et tempor eirmod magna dolore erat amet', 'Founded with a vision to transform Rwanda\'s construction landscape, BSNG Construction has grown into a trusted name in quality building, real estate, and property management. We are committed to delivering durable, affordable, and modern structures that stand the test of time.'],
  ['Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no\r\n                        labore lorem sit. Sanctus clita duo justo et tempor.', 'From residential homes to commercial properties, our team of skilled professionals brings expertise and dedication to every project. We build strong \u2014 for next generations.'],

  // Services page intro paragraphs
  ['Aliqu diam\r\n                        amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus\r\n                        clita duo justo et tempor eirmod magna dolore erat amet', 'BSNG Construction offers comprehensive construction and real estate services across Rwanda. From building your dream home to buying and selling prime plots, we are your trusted partner.'],
  ['Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam\r\n                        amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus\r\n                        clita duo justo et tempor eirmod magna dolore erat amet', 'Whether you need renovation, property rental, or expert brokerage services, our experienced team delivers quality results on time and within budget. We build strong \u2014 for next generations.'],

  // Service card descriptions
  ['Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam\r\n                                    stet diam sed stet lorem.', 'We deliver quality construction, renovation, and real estate services across Kigali and Rwanda with guaranteed satisfaction.'],

  // Testimonial descriptions
  ['Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed\r\n                                            stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna\r\n                                            dolore erat\r\n                                            amet', 'BSNG Construction built our family home in Kibagabaga. The quality of work and attention to detail exceeded our expectations. Highly recommended!'],
  ['Clita erat ipsum et lorem et sit, sed\r\n                                            stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna\r\n                                            dolore erat\r\n                                            amet', 'Working with BSNG on our commercial property was a great experience. They delivered on time and within budget. A truly professional team.'],
  ['Diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed\r\n                                            stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna\r\n                                            dolore erat\r\n                                            amet', 'BSNG helped us find the perfect plot in Kigali and handled the entire purchasing process seamlessly. We couldn\'t be happier with their brokerage service.'],

  // Feature descriptions
  ['Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet', 'Our dedicated team ensures every project is completed to the highest standards, delivering exceptional value and lasting quality for our clients across Rwanda.'],

  // General catch-all lorem replacements
  ['Tempor erat elitr rebum at clita.', 'We are committed to excellence.'],
  ['Diam dolor diam ipsum et tempor sit.', 'Quality is our foundation.'],
  ['Aliqu diam amet diam et eos labore.', 'Building dreams into reality across Rwanda.'],

  // Team member names and roles
  ['Boris Johnson', 'Jean-Pierre Habimana'],
  ['Donald Pakura', 'Marie Claire Uwimana'],
  ['Bradley Gordon', 'Patrick Nshimiyimana'],
  ['Alexander Bell', 'Diane Mukamana'],
  ['Architect', 'Construction Manager'],

  // Testimonial section headings
  ['Plot Sales', 'What Our Clients Say'],
  ['Client Satisfaction', 'Trusted by Homeowners'],

  // Project names - make them construction related
  ['Web Design', 'Residential Complex'],
  ['Graphic Design', 'Commercial Building'],
  ['Exterior Design', 'Plot Development'],

  // ===== REMAINING GENERIC TEXT =====
  ['Award Winning', 'Quality Assured'],
  ['Professional Staff', 'Skilled Workers'],
  ['24/7 Support', 'Reliable Support'],
  ['Fair Prices', 'Competitive Pricing'],
];

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  replacements.forEach(([from, to]) => {
    // Use split/join for safe string replacement (no regex escaping needed)
    content = content.split(from).join(to);
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${file}`);
});

console.log('\n--- All pages fully updated with BSNG Construction content! ---');
