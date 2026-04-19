const fs = require('fs');
let file = './app/product/[id].tsx';
let source = fs.readFileSync(file, 'utf-8');

if (!source.includes('useTheme')) {
  source = source.replace(/import \{ Colors, Spacing \} from '@\/constants\/theme';/, "import { Colors, Spacing } from '@/constants/theme';\nimport { useTheme } from '@/hooks/useTheme';");
}

source = source.replace('export default function ProductDetail() {', 'export default function ProductDetail() {\n  const { colors } = useTheme();\n  let styles = createStyles(colors);');
source = source.replace(/Colors\.light\./g, 'colors.');
source = source.replace(/const styles = StyleSheet\.create\(\{/, 'const createStyles = (colors: any) => StyleSheet.create({');

fs.writeFileSync(file, source);
