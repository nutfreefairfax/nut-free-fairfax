// Your listings live here. One block per place.
// Only add a place AFTER you have confirmed them with the business. Never copy claims from a website alone.
// lastVerified format: YYYY-MM-DD
// cuisine: type any label, but spell it the same way every time (Bakery, American, Italian...).
// level: leave out for 100% nut free places. Use "accommodates" for places that are NOT nut free but told you how they handle allergy orders.
// kitchen: use exactly "dedicated" (dedicated nut free kitchen), "shared" (no nuts on menu, shared kitchen), "nuts" (uses nuts in the kitchen) or "stored" (nuts stored on site).
//          Leave it out if staff did not say. Only record what staff told you.
// area: spell it the same way every time. Use "City of Fairfax" for places inside the city.
// staffSaid: a list of short plain sentences, one per thing STAFF said. Lead with any nuts they use. Each line is shown as a bullet.
// important: one line about what the confirmation does NOT cover (shown as "Important:"). Use it on every accommodates card.
// extra: optional neutral line, such as something their website says (shown as "Also:"). Not used for confirmation.
// method: how you confirmed it: "phone", "email" or "message". Shown after the date.
window.LISTINGS = [
  {
    name: "Out of the Bubble Bakery",
    type: "bakery",
    area: "Springfield",
    cuisine: "Vegan bakery",
    kitchen: "dedicated",
    address: "6230-A Rolling Rd, Springfield, VA 22152",
    phone: "571-336-2280",
    website: "https://obubblebakery.com",
    lastVerified: "2026-11-24",
    method: "phone",
    staffSaid: [
      "The business confirmed that no peanuts or tree nuts are used or stored on the premises.",
      "The business confirmed that the kitchen is nut free."
    ],
    extra: "Their website also says all products are peanut free and tree nut free."
  },
  {
    name: "Fairfax Bakery",
    type: "bakery",
    level: "accommodates",
    area: "Fairfax",
    cuisine: "Turkish bakery",
    kitchen: "nuts",
    address: "11211 Lee Hwy Service Rd j, Fairfax, VA 22030",
    phone: "703-277-9999",
    website: "https://fairfaxbakery.com",
    lastVerified: "2026-11-24",
    method: "phone",
    staffSaid: [
      "The bakery uses walnuts and pistachios.",
      "The bakery does not use peanuts.",
      "Allergy orders are prepared separately, and ingredient sources are checked before they are added.",
      "Staff estimate that about 90% of products contain no nuts."
    ],
    important: "Other tree nuts were not discussed. Contact the bakery directly to ask about them and confirm its current practices."
  },
  {
    name: "Manjares Bakery",
    type: "bakery",
    level: "accommodates",
    area: "Fairfax",
    cuisine: "Mexican bakery",
    kitchen: "stored",
    address: "9540 Blenheim Blvd, Fairfax, VA 22031",
    phone: "571-596-4660",
    lastVerified: "2026-11-24",
    method: "phone",
    staffSaid: [
      "Nuts are kept in the storage room, and everything has its own compartment.",
      "There are no peanuts or tree nuts in the kitchen."
    ],
    important: "This covers what staff shared about the kitchen, not individual ingredients or products. Contact the bakery directly to confirm its current practices."
  }
];
