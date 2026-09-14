const fs = require("fs");
const path = require("path");

const listings = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "listings.json"), "utf-8")
);

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

const groups = new Map();

for (const item of listings) {
  if (!item.posted_by_contact) continue;

  if (!groups.has(item.posted_by_contact)) {
    groups.set(item.posted_by_contact, []);
  }

  groups.get(item.posted_by_contact).push(item);
}

const strongContacts = [];

for (const [contact, items] of groups.entries()) {
  const localities = new Set(items.map(x => normalize(x.locality)));
  const apartments = new Set(items.map(x => normalize(x.apartment_name)));
  const websites = new Set(items.map(x => normalize(x.website)));
  const verifiedCount = items.filter(x => x.is_verified === true).length;

  const verifiedRatio = verifiedCount / items.length;

  const looksLikeLeadGen =
    items.length >= 10 &&
    localities.size >= 4 &&
    apartments.size >= 9 &&
    websites.size >= 4 &&
    verifiedRatio <= 0.35;

  if (looksLikeLeadGen) {
    strongContacts.push({
      contact,
      count: items.length,
      localities: localities.size,
      apartments: apartments.size,
      websites: websites.size,
      verifiedCount,
      verifiedRatio: Number(verifiedRatio.toFixed(2)),
      listing_ids: items.map(x => x.listing_id).sort(),
      examples: items.slice(0, 5).map(x => ({
        listing_id: x.listing_id,
        apartment_name: x.apartment_name,
        locality: x.locality,
        website: x.website,
        is_verified: x.is_verified,
        is_live: x.is_live
      }))
    });
  }
}

const fakeListingIds = strongContacts
  .flatMap(contact => contact.listing_ids)
  .sort();

console.log("Strong fake contacts:", strongContacts.length);
console.log("Strong fake listing ids:", fakeListingIds.length);

console.log("\nContacts:");
console.log(JSON.stringify(strongContacts, null, 2));

console.log("\nFinal candidate fake_listing_ids:");
console.log(JSON.stringify(fakeListingIds, null, 2));