const fs = require('node:fs');
const path = 'src/pages/Dashboard.jsx';
let source = fs.readFileSync(path, 'utf8');
source = source.replace(/(setMaintenance\(next\);\r?\n)\s*return true;(\r?\n\s*onFlash\(next[^\r\n]+;)/, '$1$2\n      return true;');
fs.writeFileSync(path, source);
for (const file of ['src/components/admin/AdminOperationsCenter.jsx', 'src/components/dashboard/LearningCenter.jsx']) {
  const content = fs.readFileSync(file, 'utf8').replace(/[ \t]+$/gm, '').replace(/\s+$/, '\n');
  fs.writeFileSync(file, content);
}
