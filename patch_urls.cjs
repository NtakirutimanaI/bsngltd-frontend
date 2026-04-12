const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);

    for (let file of files) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Ensure apiUrl is defined if we use it
            if (content.includes("fetch('http://localhost:4000/api/") || content.includes("fetch(`http://localhost:4000/api/")) {
                if (!content.includes('const apiUrl = import.meta.env.VITE_API_URL') && !content.includes('const API_URL = import.meta.env.VITE_API_URL')) {
                    // Try to inject it right after the component export
                    content = content.replace(/export default function ([A-Za-z0-9_]+)\([^)]*\)\s*\{/, "export default function $1() {\n  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';");
                }
            }

            // Replace exact string matches
            content = content.replace(/'http:\/\/localhost:4000\/api\/([^']+)'/g, '`${apiUrl}/$1`');
            
            // Replace template literals
            content = content.replace(/`http:\/\/localhost:4000\/api\/([^`]+)`/g, '`${apiUrl}/$1`');

            if (content !== originalContent) {
                // If it missed injecting apiUrl because of an arrow function component instead of function declaration:
                if (content.includes('`${apiUrl}') && !content.includes('apiUrl =')) {
                   content = content.replace(/const ([A-Za-z0-9_]+) = \([^)]*\) =>\s*\{/, "const $1 = () => {\n  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';");
                }
                
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

findAndReplace(srcDir);
