const fs = require('fs');
const path = require('path');

const filesToProcess = [
  "src/screens/ServiceDetail/index.tsx",
  "src/screens/CartScreen/index.tsx",
  "src/hooks/useCategories.ts",
  "src/hooks/useServices.ts",
  "src/mappers/categoryMapper.ts",
  "src/context/CartContext.tsx",
  "src/context/AuthContext.tsx",
  "src/components/home/QuickServices/index.tsx",
  "src/components/home/BrowseAppliance/index.tsx",
  "src/components/home/PopularProblems/index.tsx"
];

for (const relPath of filesToProcess) {
  const filePath = path.join(__dirname, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove lines that contain console.log. This simple regex removes the whole line
    // where console.log is found, assuming it's on a single line.
    // To handle multiline console.log we can do a simple replacement for typical ones:
    content = content.replace(/^[ \t]*console\.log\([^]*?\);?[ \t]*$/gm, '');
    
    // To be safe against multiline we can just remove all console.log(...) 
    // This handles any console.log(...) that doesn't have nested parens matching issues.
    content = content.replace(/console\.log\([^;]+\);?/g, '');
    
    // Clean up empty lines that might have been left
    content = content.replace(/^\s*$(?:\r\n?|\n)/gm, '\n');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Processed " + filePath);
  }
}
