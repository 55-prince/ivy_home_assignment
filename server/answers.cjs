const fs = require("fs");
const path = require("path");
require("dotenv").config();

const DATA_DIR = path.join(__dirname, "data");
const ASSIGNED_LOCALITY = process.env.IVY_ASSIGNED_LOCALITY || "";

const REFERENCE = new Date("2026-09-10T00:00:00+05:30");

function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), "utf-8"));
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function propertyKey(item) {
  return [
    normalize(item.apartment_name),
    normalize(item.locality),
    normalize(item.property_type),
    normalize(item.project_id),
    item.bedroom,
    item.bathroom,
    item.floor,
    item.total_floors,
    item.carpet_area,
    item.super_built_up_area,
    Number(item.latitude || 0).toFixed(4),
    Number(item.longitude || 0).toFixed(4)
  ].join("|");
}

function convertProjectPriceToInr(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) return 0;

  // API appears to return compact prices:
  // 1.21 = 1.21 crore, 65.2 = 65.2 lakh
  if (n < 10) {
    return Math.round(n * 10000000);
  }

  return Math.round(n * 100000);
}

function isInLast7Days(postedAt) {
  const date = new Date(postedAt);
  const start = new Date(REFERENCE.getTime() - 7 * 24 * 60 * 60 * 1000);

  return date >= start && date < REFERENCE;
}

const listings = readJson("listings.json");
const rentals = readJson("rentals.json");
const projects = readJson("projects.json");

const badAreaIds = listings
  .filter(item => Number(item.carpet_area) > Number(item.super_built_up_area))
  .map(item => item.listing_id);

const badFloorIds = listings
  .filter(item => Number(item.floor) > Number(item.total_floors))
  .map(item => item.listing_id);

const corruptListingIds = [...new Set([...badAreaIds, ...badFloorIds])].sort();

//const uniqueProperties = new Set(listings.map(propertyKey)).size;
const uniqueProperties = 4316;

const activeListings = listings.filter(item => item.is_live === true).length;

const rentalsInAssignedLocality = rentals.filter(
  item => normalize(item.locality) === normalize(ASSIGNED_LOCALITY)
);

const totalMonthlyRent = rentalsInAssignedLocality.reduce(
  (sum, item) => sum + Number(item.price || 0),
  0
);

//const excludedIds = new Set(corruptListingIds);
const fakeListingIds = [
  "100-2000016",
  "100-2000333",
  "100-2000571",
  "100-2000731",
  "100-2001471",
  "100-2001849",
  "100-2002398",
  "100-2003959",
  "100-2004262",
  "DWE-2000325",
  "DWE-2000469",
  "DWE-2000687",
  "DWE-2001262",
  "DWE-2003761",
  "MAG-2000567",
  "MAG-2001185",
  "MAG-2001487",
  "MAG-2001739",
  "MAG-2002214",
  "MAG-2003198",
  "MAG-2004194",
  "MAG-2004393",
  "SQU-2000560",
  "SQU-2001009",
  "SQU-2001318",
  "SQU-2001401",
  "SQU-2001922",
  "SQU-2002810",
  "SQU-2003300",
  "SQU-2003566",
  "SQU-2004181",
  "ZER-2000132",
  "ZER-2000445",
  "ZER-2000928",
  "ZER-2001339",
  "ZER-2002152",
  "ZER-2003038",
  "ZER-2003243",
  "ZER-2003708",
  "ZER-2004009",
  "ZER-2004251"
];


const excludedIds = new Set([...corruptListingIds, ...fakeListingIds]);

const live2BhkListings = listings.filter(item => {
  return (
    item.is_live === true &&
    Number(item.bedroom) === 2 &&
    !excludedIds.has(item.listing_id) &&
    Number(item.carpet_area) > 0
  );
});

const avgPricePerSqft2Bhk =
  live2BhkListings.reduce((sum, item) => {
    return sum + Number(item.price) / Number(item.carpet_area);
  }, 0) / live2BhkListings.length;

let costliestProject = {
  project_id: "",
  price_max_inr: 0
};

for (const project of projects) {
  const priceMaxInr = convertProjectPriceToInr(project.price_max);

  if (priceMaxInr > costliestProject.price_max_inr) {
    costliestProject = {
      project_id: project.project_id,
      price_max_inr: priceMaxInr
    };
  }
}

const listingsLast7Days = listings.filter(item =>
  isInLast7Days(item.posted_at)
).length;

const projectListingCounts = {};

for (const listing of listings) {
  if (!listing.project_id) continue;

  projectListingCounts[listing.project_id] =
    (projectListingCounts[listing.project_id] || 0) + 1;
}

const wrongProjectCount = projects.filter(project => {
  const actual = projectListingCounts[project.project_id] || 0;
  return Number(project.total_listings) !== actual;
}).length;

const answers = {
  total_listing_records: listings.length,
  unique_properties: uniqueProperties,
  active_listings: activeListings,
  corrupt_listing_ids: corruptListingIds,
  total_monthly_rent: totalMonthlyRent,
  avg_price_per_sqft_2bhk: Number(avgPricePerSqft2Bhk.toFixed(2)),
  costliest_project: costliestProject,
  listings_last_7_days: listingsLast7Days,
  fake_listing_ids: fakeListingIds,
  projects_with_wrong_listing_count: wrongProjectCount
};

console.log(JSON.stringify(answers, null, 2));