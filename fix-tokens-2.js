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
    // Using string matching to avoid regex escaping headaches completely.
    let changed = false;
    let newContent = content;
    
    // Check and replace
    const variations = [
      "localStorage.getItem('token')",
      "localStorage.getItem(\"token\")",
      "localStorage.removeItem('token')",
      "localStorage.removeItem(\"token\")",
      "localStorage.setItem('token',",
      "localStorage.setItem(\"token\","
    ];
    
    variations.forEach(searchStr => {
      if (newContent.includes(searchStr)) {
        changed = true;
        let replaceStr = searchStr.replace(/token/, 'auth_token');
        newContent = newContent.split(searchStr).join(replaceStr);
      }
    });
    
    if(changed) {
        fs.writeFileSync(file, newContent);
        console.log('Fixed:', file);
    }
});
