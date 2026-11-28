// Run before every push:  node tools/stamp.js
// Adds ?v=<time> to the CSS and JS links in every page, so browsers fetch the newest files
// instead of showing an old saved copy. Without it, visitors can see old text for a while.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const v = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
let n = 0;
(function walk(d) { fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
  if ([".git", "tools", "node_modules"].includes(e.name)) return;
  const p = path.join(d, e.name);
  if (e.isDirectory()) return walk(p);
  if (!/\.html$/.test(e.name)) return;
  const s = fs.readFileSync(p, "utf8");
  const t = s.replace(/((?:href|src)="[^"]*?(?:style\.css|app\.js|listings\.js))(\?v=\d+)?"/g, '$1?v=' + v + '"');
  if (t !== s) { fs.writeFileSync(p, t); n++; }
}); })(root);
console.log("Stamped " + n + " page(s) with v=" + v);
