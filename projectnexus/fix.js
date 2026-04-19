const fs = require("fs");
let fProd = "./app/(tabs)/products.tsx";
let cProd = fs.readFileSync(fProd, "utf-8");
cProd = cProd.replace(/placeholder="[^"]+"/, "placeholder=\"Arama...\" placeholderTextColor={colors.textSecondary}");
cProd = cProd.replace(/searchInput:\s*\{\s*flex:\s*1,\s*fontSize:\s*16,?\s*\}/, "searchInput: { flex: 1, fontSize: 16, color: colors.text }");
fs.writeFileSync(fProd, cProd);
