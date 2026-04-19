const fs = require('fs');
let file = './app/product/[id].tsx';
let source = fs.readFileSync(file, 'utf-8');

source = source.replace(/backgroundColor: '#E5E7EB',/, "backgroundColor: colors.card,");

fs.writeFileSync(file, source);
