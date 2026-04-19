const fs = require('fs');
let file = './app/(tabs)/index.tsx';
let source = fs.readFileSync(file, 'utf-8');

source = source.replace("import { Colors, Spacing } from '@/constants/theme';", "import { Spacing } from '@/constants/theme';\nimport { useTheme } from '@/hooks/useTheme';");
source = source.replace('export default function IndexScreen() {', 'export default function IndexScreen() {\n  const { colors } = useTheme();\n  const styles = createStyles(colors);');
source = source.replace(/const styles = StyleSheet\.create\(\{/, 'const createStyles = (colors: any) => StyleSheet.create({');
source = source.replace(/Colors\.(?:light\.)?/g, 'colors.');

fs.writeFileSync(file, source);
