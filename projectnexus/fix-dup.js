const fs = require('fs');
let file = './app/(tabs)/index.tsx';
let source = fs.readFileSync(file, 'utf-8');
const lines = source.split('\n');
const out = lines.filter((v, i, a) => !(v.includes('import { useTheme }') && a.indexOf(v) !== i));
fs.writeFileSync(file, out.join('\n'));
