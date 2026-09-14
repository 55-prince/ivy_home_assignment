const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, "data");

function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`${filename} missing. Run npm run seed first.`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function filterProperties(data, query) {
  let result = [...data];

  if (query.locality) {
    result = result.filter(
      item => normalize(item.locality) === normalize(query.locality)
    );
  }

  if (query.bedroom) {
    result = result.filter(
      item => Number(item.bedroom) === Number(query.bedroom)
    );
  }

  if (query.min_price) {
    result = result.filter(
      item => Number(item.price) >= Number(query.min_price)
    );
  }

  if (query.max_price) {
    result = result.filter(
      item => Number(item.price) <= Number(query.max_price)
    );
  }

  if (query.furnishing) {
    result = result.filter(
      item => normalize(item.furnishing) === normalize(query.furnishing)
    );
  }

  return result;
}

function paginate(data, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);

  const start = (page - 1) * limit;
  const results = data.slice(start, start + limit);

  return {
    total: data.length,
    page,
    limit,
    count: results.length,
    has_more: start + limit < data.length,
    results
  };
}

app.get("/api/listings", (req, res) => {
  try {
    const listings = readJson("listings.json");
    const filtered = filterProperties(listings, req.query);
    res.json(paginate(filtered, req.query));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/listings/:id", (req, res) => {
  try {
    const listings = readJson("listings.json");
    const listing = listings.find(item => item.listing_id === req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/rentals", (req, res) => {
  try {
    const rentals = readJson("rentals.json");
    const filtered = filterProperties(rentals, req.query);
    res.json(paginate(filtered, req.query));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/projects", (req, res) => {
  try {
    let projects = readJson("projects.json");

    if (req.query.locality) {
      projects = projects.filter(
        item => normalize(item.locality) === normalize(req.query.locality)
      );
    }

    res.json(paginate(projects, req.query));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/projects/:id", (req, res) => {
  try {
    const projects = readJson("projects.json");
    const project = projects.find(item => item.project_id === req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});