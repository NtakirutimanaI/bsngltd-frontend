import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const filePath = path.join(dir, f);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDir(filePath);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;

            // Pattern 1: RootLayout
            if (filePath.includes('RootLayout.tsx')) {
                content = content.replace(/style={{ left: '12px', width: '18px', height: '18px' }}/g, "style={{ right: '12px', width: '18px', height: '18px' }}");
                content = content.replace(/style={{ paddingLeft: '40px' }}/g, "style={{ paddingRight: '40px', paddingLeft: '12px' }}");
            }

            // Pattern 2: Projects, Properties, Payments
            if (filePath.includes('Projects.tsx') || filePath.includes('Properties.tsx') || filePath.includes('Payments.tsx')) {
                content = content.replace(/style={{ left: '0', width: '20px', height: '20px' }}/g, "style={{ right: '0', width: '20px', height: '20px' }}");
                content = content.replace(/paddingLeft: '30px'/g, "paddingRight: '30px'");
                content = content.replace(/paddingLeft: '40px'/g, "paddingRight: '40px'");
            }

            // Pattern 3: Standard dashboard inputs (Bootstrap classes)
            // Example: <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
            content = content.replace(
                /<Search([^>]*?)(start-0)([^>]*?)(ms-[0-9]+)([^>]*?)\/>/g,
                (match, p1, p2, p3, p4, p5) => {
                    return `<Search${p1}end-0${p3}${p4.replace('ms-', 'me-')}${p5}/>`;
                }
            );

            // Same for input classes: ps-5 -> ps-3 pe-5
            // But we only want to do it if the input is near a "Search" placeholder so we don't accidentally break other inputs
            const lines = content.split('\n');
            let inSearchContainer = false;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('<Search') && lines[i].includes('position-absolute') && lines[i].includes('end-0')) {
                    inSearchContainer = true;
                }
                if (inSearchContainer && lines[i].includes('<input')) {
                    // next few lines should have className and placeholder
                    for (let j = i; j < i + 5 && j < lines.length; j++) {
                        if (lines[j].includes('className=') && lines[j].includes('ps-5')) {
                            lines[j] = lines[j].replace('ps-5', 'ps-3 pe-5');
                            inSearchContainer = false;
                            break;
                        }
                    }
                }
            }
            content = lines.join('\n');

            if (content !== original) {
                fs.writeFileSync(filePath, content);
                console.log(`Updated ${filePath}`);
            }
        }
    });
}

processDir(path.join(__dirname, 'src/app'));
console.log('Done!');
