const fs = require('fs');

const filesToFix = [
  './app/+not-found.tsx',
  './app/login.tsx',
  './app/modal.tsx',
  './app/register.tsx',
  './app/viewer/[id].tsx'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let source = fs.readFileSync(file, 'utf-8');
    
    // Skip if it seems to be already using useTheme heavily, but inject if we need
    if (!source.includes('useTheme')) {
      source = source.replace(/import \{ Colors[^\}]*\} from '@\/constants\/theme';/, "import { Colors, Spacing } from '@/constants/theme';\nimport { useTheme } from '@/hooks/useTheme';");
      // Add a fallback if Colors wasn't there
      if (!source.includes('import { useTheme }')) {
         source = source.replace("import { StyleSheet,", "import { StyleSheet,\n");
         // I'll be careful, replacing export default function
      }
    }
    
    // Convert components to use useTheme
    // For +not-found.tsx
    source = source.replace('export default function NotFoundScreen() {', 'export default function NotFoundScreen() {\n  const { colors } = useTheme();\n  const styles = createStyles(colors);');
    // For login.tsx
    source = source.replace('export default function LoginScreen() {', 'export default function LoginScreen() {\n  const { colors } = useTheme();\n  const styles = createStyles(colors);');
    // For modal.tsx
    source = source.replace('export default function ModalScreen() {', 'export default function ModalScreen() {\n  const { colors } = useTheme();\n  const styles = createStyles(colors);');
    // For register.tsx
    source = source.replace('export default function RegisterScreen() {', 'export default function RegisterScreen() {\n  const { colors } = useTheme();\n  const styles = createStyles(colors);');
    // For viewer/[id].tsx
    source = source.replace('export default function ModelViewerScreen() {', 'export default function ModelViewerScreen() {\n  const { colors } = useTheme();\n  const styles = createStyles(colors);');

    // Replace usages
    source = source.replace(/Colors\.light\./g, 'colors.');
    
    // Replace placeholder text colors specially if they span lines and hardcoded
    // source = source.replace(/placeholderTextColor=\{Colors.light.textSecondary\}/g, "placeholderTextColor={colors.textSecondary}");

    // Convert styles definition
    source = source.replace(/const styles = StyleSheet\.create\(\{/, 'const createStyles = (colors: any) => StyleSheet.create({');

    fs.writeFileSync(file, source);
  }
});
