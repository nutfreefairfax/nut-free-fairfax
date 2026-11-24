(function () {
  var RECHECK_DAYS = 183; // about 6 months
  var CONTACT_EMAIL = "nutfreefairfax@gmail.com"; 
  var listEl = document.getElementById("list");
  var countEl = document.getElementById("count");
  var areaEl = document.getElementById("area");
  var typeEl = document.getElementById("type");
  var hideOldEl = document.getElementById("hideOld");

  function daysSince(dateStr) {
    var then = new Date(dateStr + "T00:00:00");
    return Math.floor((Date.now() - then.getTime()) / 86400000);
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function prettyDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function safeUrl(u) {
    return /^https?:\/\//i.test(u || "") ? u : "";
  }

  function kitchenChip(k) {
    var map = {
      dedicated: "Dedicated nut free kitchen",
      shared: "No nuts on menu, shared kitchen"
    };
    return map[k] ? '<p class="chips"><span class="chip">' + map[k] + "</span></p>" : "";
  }

  function card(item) {
    var age = daysSince(item.lastVerified);
    var old = age > RECHECK_DAYS;
    var badge = old
      ? '<span class="badge old">Needs recheck</span>'
      : '<span class="badge ok">Confirmed with the business</span>';
    var tel = (item.phone || "").replace(/[^0-9+]/g, "");
    var site = safeUrl(item.website);
    return (
      '<article class="card' + (old ? " is-old" : "") + '">' +
        '<div class="card-top"><h3>' + esc(item.name) + "</h3>" + badge + "</div>" +
        '<p class="meta">' + esc([item.type, item.cuisine, item.area].filter(Boolean).join(" \u00b7 ")) + "</p>" +
        kitchenChip(item.kitchen) +
        '<p class="said">' + esc(item.staffSaid) + "</p>" +
        (item.notes ? '<p class="notes">' + esc(item.notes) + "</p>" : "") +
        '<p class="verified">Last confirmed: ' + esc(prettyDate(item.lastVerified)) +
          " (" + age + " days ago)</p>" +
        '<p class="links">' +
          (tel ? '<a href="tel:' + esc(tel) + '">Call ' + esc(item.phone) + "</a>" : "") +
          (site ? ' <a href="' + esc(site) + '" rel="noopener">Website</a>' : "") +
        "</p>" +
        '<p class="addr">' + esc(item.address) + "</p>" +
        '<p class="report"><a href="mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent("Correction: " + item.name) + '">See something out of date? Tell me.</a></p>' +
      "</article>"
    );
  }

  function render() {
    var area = areaEl.value;
    var type = typeEl.value;
    var hideOld = hideOldEl.checked;
    var items = (window.LISTINGS || []).filter(function (i) {
      if (type !== "all" && i.type !== type) return false;
      if (hideOld && daysSince(i.lastVerified) > RECHECK_DAYS) return false;
      if (area !== "all" && i.area !== area) return false;
      return true;
    });
    // Newest verified first
    items.sort(function (a, b) { return a.lastVerified < b.lastVerified ? 1 : -1; });
    var noneAtAll = !(window.LISTINGS || []).length;
    listEl.innerHTML = items.map(card).join("") ||
      '<p class="empty">' + (noneAtAll
        ? "I'm reaching out to businesses now. The first places will show up here soon."
        : "Nothing here yet. Try a different area or type.") + "</p>";
    countEl.textContent = items.length + (items.length === 1 ? " place" : " places");
  }

  // Fill the Area dropdown from the listings, so you never edit it by hand.
  var seen = {};
  (window.LISTINGS || []).forEach(function (i) { if (i.area) seen[i.area] = true; });
  Object.keys(seen).sort().forEach(function (name) {
    var o = document.createElement("option");
    o.value = name; o.textContent = name;
    areaEl.appendChild(o);
  });

  [areaEl, typeEl, hideOldEl].forEach(function (el) {
    el.addEventListener("input", render);
  });
  // Stats strip
  var all = window.LISTINGS || [];
  document.getElementById("statCount").textContent = all.length;
  if (all.length) {
    var latest = all.map(function (i) { return i.lastVerified; }).sort().pop();
    document.getElementById("statUpdated").textContent = prettyDate(latest);
  }
  render();
})();
