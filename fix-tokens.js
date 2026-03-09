const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('c:/OpenGuild/app');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/localStorage\.getItem\(['"`]token['"`]\)/g, "localStorage.getItem('auth_token')")
        .replace(/localStorage\.removeItem\(['"`]token['"`]\)/g, "localStorage.removeItem('auth_token')")
        .replace(/localStorage\.setItem\(['"`]token['"`],\s*/g, "localStorage.setItem('auth_token', ");
        
    if(content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log('Fixed:', file);
    }
});
