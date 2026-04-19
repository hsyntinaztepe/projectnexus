const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./app').concat(walk('./components'));

let affected = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');
  let changed = false;

  // Since we changed Colors to have .light and .dark, 
  // replacing Colors.X with Colors.light.X is a quick fix to restore compilation.
  // Then we can adopt true dynamic styling. But first, let's just make it dynamic directly.
  
  if (content.includes('Colors.')) {
     // replace Colors.X with colors.X 
     let orig = content;
     
     // 1. replace imported Colors
     if (content.includes('import { Colors, Spacing }')) {
         content = content.replace('import { Colors, Spacing } from \'@/constants/theme\';', 'import { Spacing } from \'@/constants/theme\';\nimport { useTheme } from \'@/hooks/useTheme\';');
     } else if (content.includes('import { Colors }')) {
         content = content.replace('import { Colors } from \'@/constants/theme\';', 'import { useTheme } from \'@/hooks/useTheme\';');
     } else if (content.includes('import { Spacing, Colors }')) {
         content = content.replace("import { Spacing, Colors } from '@/constants/theme';", "import { Spacing } from '@/constants/theme';\nimport { useTheme } from '@/hooks/useTheme';");
     }

     // 2. Wrap styles: const styles = StyleSheet.create({ -> const getStyles = (colors: any) => StyleSheet.create({
     content = content.replace(/const\s+styles\s*=\s*StyleSheet\.create\(\{/, 'const getStyles = (colors: any) => StyleSheet.create({');

     // 3. Find default export or component and inject `const { colors } = useTheme(); const styles = getStyles(colors);`
     // This is naive but works for standard functional components defined with export default function Name() {
     content = content.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/, 'export default function $1($2) {\n  const { colors } = useTheme();\n  const styles = getStyles(colors);');
     
     // 4. Also handle `const ComponentName = () => {`
     content = content.replace(/const\s+([A-Za-z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*\{/, 'const $1 = ($2) => {\n  const { colors } = useTheme();\n  if (typeof getStyles === "function") {\n    var styles = getStyles(colors);\n  }');

     // 5. Replace `Colors.` with `colors.`
     content = content.replace(/Colors\./g, 'colors.');

     // Wait, if it didn't find `getStyles`, we shouldn't rename Colors?
     // Let's just do it manually if this breaks.

     if (orig !== content) {
       fs.writeFileSync(f, content, 'utf-8');
       console.log('Modified', f);
       affected++;
     }
  }
});
console.log('Done refactoring ' + affected + ' files.');