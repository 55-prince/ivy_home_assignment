const fs = require("fs");
const path = require("path");
require("dotenv").config();

const BASE_URL = process.env.IVY_BASE_URL || "https://solve.ivy.homes";
const API_KEY = process.env.IVY_API_KEY;
const PASSWORD = process.env.IVY_PASSWORD;
const EMAIL = process.env.IVY_EMAIL || "demo1@ivy.homes";

const DATA_DIR = path.join(__dirname, "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function login() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data.access_token || data.token;
}

async function extractData(endpoint, filename, token) {
  const filePath = path.join(DATA_DIR, filename);

  if (fs.existsSync(filePath)) {
    console.log(`${filename} already exists. Skipping.`);
    return;
  }

  let allData = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    console.log(`Fetching ${endpoint}, offset ${offset}`);

    const response = await fetch(
      `${BASE_URL}${endpoint}?offset=${offset}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Key": API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];

    allData = allData.concat(results);

    if (!data.has_more || results.length === 0) {
      break;
    }

    offset += limit;
  }

  fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
  console.log(`Saved ${allData.length} records to ${filename}`);
}

async function seed() {
  if (!API_KEY || !PASSWORD) {
    throw new Error("Please add IVY_API_KEY and IVY_PASSWORD in .env");
  }

  const token = await login();

  await extractData("/v1/listings", "listings.json", token);
  await extractData("/v1/rentals", "rentals.json", token);
  await extractData("/v1/projects", "projects.json", token);

  console.log("Seed complete.");
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
});