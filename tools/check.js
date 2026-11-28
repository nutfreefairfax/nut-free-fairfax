// Run before every push:  node tools/check.js
// Checks data/listings.js against the site rules and scans the site files for wording drift.
// Exit code 1 means fix the errors first. Warnings are worth a look but do not block.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data/listings.js"), "utf8"), ctx);
const L = ctx.window.LISTINGS || [];
const AREAS = ["Annandale","Burke","Centreville","Chantilly","City of Fairfax","City of Falls Church","Clifton","Fairfax","Great Falls","Herndon","Lorton","McLean","Reston","Springfield","Tysons","Vienna"];
const errors = [], warns = [];
const err = (n, m) => errors.push(n + ": " + m);
const warn = (n, m) => warns.push(n + ": " + m);
const BAD = /\b(safe|safely|safety|guarantee[sd]?|certified|told me|100%|100 percent)\b|nut-free|peanut-free|[–—]|\s-\s|\w-\w/i;

const seen = {};
L.forEach(function (i) {
  const n = i.name || "(no name)";
  ["name","type","area","cuisine","address","lastVerified","method"].forEach(f => { if (!i[f]) err(n, "missing " + f); });
  if (i.type && !["bakery","restaurant"].includes(i.type)) err(n, "type must be bakery or restaurant");
  if (i.area && !AREAS.includes(i.area)) err(n, "area '" + i.area + "' is not in the allowed list");
  if (i.level && i.level !== "accommodates") err(n, "level must be left out or 'accommodates'");
  if (i.kitchen && !["dedicated","shared","nuts","stored"].includes(i.kitchen)) err(n, "kitchen value not allowed");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(i.lastVerified || "")) err(n, "lastVerified must be YYYY-MM-DD");
  else {
    const age = (Date.now() - new Date(i.lastVerified + "T00:00:00")) / 864e5;
    if (age < -1) err(n, "lastVerified is in the future");
    if (age > 183) warn(n, "needs recheck (" + Math.floor(age) + " days)");
  }
  if (i.method && !["phone","email","message"].includes(i.method)) err(n, "method must be phone, email or message");
  if (!i.phone && !i.website) err(n, "needs a phone or a website");
  if (i.phone && !/^\d{3}-\d{3}-\d{4}$/.test(i.phone)) err(n, "phone format should be 555-555-5555");
  if (i.website && !/^https:\/\//.test(i.website)) err(n, "website must start with https://");
  ["notes","extra","important"].forEach(f => { if (i[f]) err(n, "field '" + f + "' is retired, use staffSaid or notCovered"); });
  if (!Array.isArray(i.staffSaid) || !i.staffSaid.length) { err(n, "staffSaid must be a list with at least one line"); return; }
  const acc = i.level === "accommodates";
  i.staffSaid.concat(i.notCovered ? [i.notCovered] : []).forEach(function (t) {
    if (BAD.test(t)) err(n, "wording rule broken in: " + t);
    if (!/[.]$/.test(t)) err(n, "line should end with a period: " + t);
    if (/%|percent/i.test(t) && !(/estimate/i.test(t) && /contain no nuts/i.test(t))) err(n, "percentages must say 'estimate' and 'contain no nuts': " + t);
  });
  if (!acc) {
    if (!["dedicated","shared"].includes(i.kitchen)) err(n, "first tab places need kitchen dedicated or shared");
    if (i.staffSaid.length !== 1 || !/^Staff confirmed that /.test(i.staffSaid[0])) err(n, "first tab: use ONE bullet starting 'Staff confirmed that'");
  } else {
    if (i.kitchen === "dedicated") err(n, "accommodates places cannot be dedicated nut free");
    if (!i.kitchen) warn(n, "no kitchen value, so no chip is shown");
    if (i.staffSaid.some(t => /^Staff confirmed/.test(t))) warn(n, "'Staff confirmed' is reserved for the first tab");
  }
  const key = (i.name + "|" + i.address).toLowerCase();
  if (seen[key]) err(n, "duplicate listing"); seen[key] = 1;
});

// Site wide wording scan (visible files only)
const files = [];
(function walk(d) { fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
  if (e.name === ".git" || e.name === "tools" || e.name === "node_modules") return;
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.(html|js)$/.test(e.name) && e.name !== "listings.js") files.push(p);
}); })(root);
files.forEach(function (f) {
  fs.readFileSync(f, "utf8").split("\n").forEach(function (line, k) {
    const code = line.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g, " ");
    if (/nut-free|peanut-free|[–—]|&mdash;|&ndash;/i.test(code)) warn(path.relative(root, f) + ":" + (k + 1), "hyphenated 'nut-free' or a long dash");
    if (/\btold me\b/i.test(code)) warn(path.relative(root, f) + ":" + (k + 1), "'told me' (use 'shared' or 'said')");
  });
});

console.log(L.length + " listings checked.");
warns.forEach(w => console.log("WARN  " + w));
errors.forEach(e => console.log("ERROR " + e));
console.log(errors.length ? errors.length + " error(s). Fix before pushing." : "All listing rules pass.");
process.exit(errors.length ? 1 : 0);
