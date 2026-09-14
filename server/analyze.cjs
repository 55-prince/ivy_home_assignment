const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), "utf-8"));
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

const listings = readJson("listings.json");
const rentals = readJson("rentals.json");
const projects = readJson("projects.json");

console.log("Listings:", listings.length);
console.log("Rentals:", rentals.length);
console.log("Projects:", projects.length);

const inactiveListings = listings.filter(item => item.is_live === false);

console.log("\nInactive listings returned from /v1/listings:");
console.log(inactiveListings.length);
console.log(inactiveListings.slice(0, 10).map(item => item.listing_id));

const badAreas = listings.filter(item => {
  return Number(item.carpet_area) > Number(item.super_built_up_area);
});

console.log("\nListings where carpet_area > super_built_up_area:");
console.log(badAreas.length);
console.log(badAreas.slice(0, 10).map(item => item.listing_id));

const badFloors = listings.filter(item => {
  return Number(item.floor) > Number(item.total_floors);
});

console.log("\nListings where floor > total_floors:");
console.log(badFloors.length);
console.log(badFloors.slice(0, 10).map(item => item.listing_id));

const projectListingCount = {};

for (const listing of listings) {
  if (!listing.project_id) continue;

  projectListingCount[listing.project_id] =
    (projectListingCount[listing.project_id] || 0) + 1;
}

const wrongProjectCounts = projects.filter(project => {
  const actualCount = projectListingCount[project.project_id] || 0;
  return Number(project.total_listings) !== actualCount;
});

console.log("\nProjects with wrong total_listings:");
console.log(wrongProjectCounts.length);
console.log(
  wrongProjectCounts.slice(0, 10).map(project => ({
    project_id: project.project_id,
    documented_count: project.total_listings,
    actual_count: projectListingCount[project.project_id] || 0
  }))
);

const suspiciousProjectPrices = projects.filter(project => {
  return Number(project.price_max) < 1000 || Number(project.price_min) < 1000;
});

console.log("\nProjects with suspicious price units:");
console.log(suspiciousProjectPrices.length);
console.log(
  suspiciousProjectPrices.slice(0, 10).map(project => ({
    project_id: project.project_id,
    price_min: project.price_min,
    price_max: project.price_max
  }))
);

const timestampWithoutZ = listings.filter(item => {
  return item.posted_at && !item.posted_at.endsWith("Z");
});

console.log("\nListings timestamps without Z:");
console.log(timestampWithoutZ.length);
console.log(timestampWithoutZ.slice(0, 10).map(item => ({
  listing_id: item.listing_id,
  posted_at: item.posted_at
})));