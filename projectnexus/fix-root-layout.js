const fs = require('fs');
let file = './app/_layout.tsx';
let source = fs.readFileSync(file, 'utf-8');

source = source.replace(/import \{ useColorScheme \} from '@\/components\/useColorScheme';/, "import { useTheme } from '@/hooks/useTheme';");
source = source.replace(/function RootLayoutNav\(\) \{[\s\S]*?const colorScheme = useColorScheme\(\) \?\? 'light';/, "function RootLayoutNav() {\n  const { theme } = useTheme();\n  const colorScheme = theme;");

fs.writeFileSync(file, source);
