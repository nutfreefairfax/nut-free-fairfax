(function () {
  var RECHECK_DAYS = 183; // about 6 months
  var CONTACT_EMAIL = "nutfreefairfax@gmail.com"; 
  var listEl = document.getElementById("list");
  var countEl = document.getElementById("count");
  var areaEl = document.getElementById("area");
  var typeEl = document.getElementById("type");
  var hideOldEl = document.getElementById("hideOld");
  var tabBtns = document.querySelectorAll(".tab");
  var tabNoteEl = document.getElementById("tabNote");
  var currentLevel = "nutfree"; // "nutfree" or "accommodates"

  var TAB_NOTES = {
    nutfree: "",
    accommodates:
      "These places are not nut-free, and nuts may be used in their kitchens or pose a risk of cross-contact. " +
      "They\u2019ve shared how they handle food allergy requests, which I\u2019ve included to help you make informed choices. " +
      "Please remember that practices can vary, and no allergen-free meal is guaranteed. " +
      "Always call ahead, discuss your specific allergy with the staff, and decide if you\u2019re comfortable dining there."
  };

  function levelOf(i) { return i.level === "accommodates" ? "accommodates" : "nutfree"; }

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
      shared: "No nuts on menu, shared kitchen",
      nuts: "Uses nuts in the kitchen",
      stored: "Nuts stored on site"
    };
    return map[k] ? '<p class="chips"><span class="chip">' + map[k] + "</span></p>" : "";
  }

  function card(item) {
    var age = daysSince(item.lastVerified);
    var old = age > RECHECK_DAYS;
    var acc = levelOf(item) === "accommodates";
    var badge = old
      ? '<span class="badge old">Needs recheck</span>'
      : acc
        ? '<span class="badge acc">Accommodates, not nut free</span>'
        : '<span class="badge ok">Confirmed with the business</span>';
    var tel = (item.phone || "").replace(/[^0-9+]/g, "");
    var site = safeUrl(item.website);
    return (
      '<article class="card' + (old ? " is-old" : "") + (acc ? " is-acc" : "") + '">' +
        '<div class="card-top"><h3>' + esc(item.name) + "</h3>" + badge + "</div>" +
        '<p class="meta">' + esc([item.type, item.cuisine, item.area].filter(Boolean).join(" \u00b7 ")) + "</p>" +
        kitchenChip(item.kitchen) +
        (acc ? '<p class="warn-line">This is not a nut free kitchen. Call before you go and tell them about your allergy.</p>' : "") +
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
      if (levelOf(i) !== currentLevel) return false;
      if (type !== "all" && i.type !== type) return false;
      if (hideOld && daysSince(i.lastVerified) > RECHECK_DAYS) return false;
      if (area !== "all" && i.area !== area) return false;
      return true;
    });
    // Newest verified first
    items.sort(function (a, b) { return a.lastVerified < b.lastVerified ? 1 : -1; });
    var noneInTab = !(window.LISTINGS || []).some(function (i) { return levelOf(i) === currentLevel; });
    listEl.innerHTML = items.map(card).join("") ||
      '<p class="empty">' + (noneInTab
        ? "I'm reaching out to businesses now. The first places will show up here soon."
        : "Nothing here yet. Try a different area or type.") + "</p>";
    countEl.textContent = items.length + (items.length === 1 ? " place" : " places");
    tabNoteEl.innerHTML = TAB_NOTES[currentLevel];
    tabNoteEl.hidden = !TAB_NOTES[currentLevel];
  }

  // Fill the Area dropdown from the listings in the open tab, so you never edit it by hand.
  function buildAreas() {
    var seen = {};
    (window.LISTINGS || []).forEach(function (i) {
      if (levelOf(i) === currentLevel && i.area) seen[i.area] = true;
    });
    areaEl.innerHTML = '<option value="all">All areas</option>';
    Object.keys(seen).sort().forEach(function (name) {
      var o = document.createElement("option");
      o.value = name; o.textContent = name;
      areaEl.appendChild(o);
    });
  }

  function countFor(level) {
    return (window.LISTINGS || []).filter(function (i) { return levelOf(i) === level; }).length;
  }

  function setTab(level) {
    currentLevel = level;
    Array.prototype.forEach.call(tabBtns, function (b) {
      var on = b.getAttribute("data-level") === level;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.classList.toggle("on", on);
      var n = countFor(b.getAttribute("data-level"));
      b.querySelector(".tab-n").textContent = n;
    });
    buildAreas();
    render();
  }

  Array.prototype.forEach.call(tabBtns, function (b) {
    b.addEventListener("click", function () { setTab(b.getAttribute("data-level")); });
  });

  [areaEl, typeEl, hideOldEl].forEach(function (el) {
    el.addEventListener("input", render);
  });
  // Stats strip
  var all = window.LISTINGS || [];
  document.getElementById("statCount").textContent = countFor("nutfree");
  if (all.length) {
    var latest = all.map(function (i) { return i.lastVerified; }).sort().pop();
    document.getElementById("statUpdated").textContent = prettyDate(latest);
  }
  setTab("nutfree");
})();
