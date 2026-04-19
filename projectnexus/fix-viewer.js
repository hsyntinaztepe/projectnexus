const fs = require('fs');
let file = './app/viewer/[id].tsx';
let source = fs.readFileSync(file, 'utf-8');

source = source.replace('export default function ViewerScreen() {', 'export default function ViewerScreen() {\n  const { colors } = useTheme();\n  const styles = createStyles(colors);');
source = source.replace(/Colors\.light\./g, 'colors.');
source = source.replace(/const styles = StyleSheet\.create\(\{/, 'const createStyles = (colors: any) => StyleSheet.create({');

fs.writeFileSync(file, source);
