// fix-html.js
// Script para reemplazar <Html> por <html> en src/app

const fs = require("fs");
const path = require("path");

const targetDir = path.resolve("./src/app");

function fixHtmlTags(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Reemplazo de tags con regex global
  const fixedContent = content
    .replace(/<Html>/g, "<html>")
    .replace(/<\/Html>/g, "</html>");

  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent, "utf8");
    console.log(`✅ Fixed: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      traverse(filePath);
    } else if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
      fixHtmlTags(filePath);
    }
  }
}

console.log("🔍 Buscando y corrigiendo <Html> en src/app ...");
try {
  if (fs.existsSync(targetDir)) {
    traverse(targetDir);
    console.log("✨ Limpieza completada");
  } else {
    console.log(`⚠️  El directorio ${targetDir} no existe. No se ha realizado ninguna acción.`);
  }
} catch (error) {
    console.error("❌ Error durante la ejecución del script:", error);
}
