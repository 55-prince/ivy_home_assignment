const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

const IVY_BASE_URL =
  process.env.IVY_BASE_URL || "https://solve.ivy.homes";

const IVY_API_KEY = process.env.IVY_API_KEY;

const DATA_DIR = path.join(__dirname, "data");
const SAVED_FILE = path.join(DATA_DIR, "saved-listings.json");


// --------------------------------------------------
// Basic middleware
// --------------------------------------------------

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "development-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);


// --------------------------------------------------
// Helpers
// --------------------------------------------------

function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `${filename} missing. Run npm run seed first.`
    );
  }

  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}


function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}


function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}


function getCurrentUserEmail(req) {
  return req.session?.user?.email || null;
}


function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({
      message: "Not authenticated.",
    });
  }

  next();
}


// --------------------------------------------------
// Filtering
// --------------------------------------------------

function filterProperties(data, query) {
  let result = [...data];

  const locality = normalize(query.locality);

  const bedrooms =
    query.bedrooms !== undefined
      ? Number(query.bedrooms)
      : null;

  const minPrice =
    query.min_price !== undefined
      ? Number(query.min_price)
      : null;

  const maxPrice =
    query.max_price !== undefined
      ? Number(query.max_price)
      : null;

  const furnishing = normalize(query.furnishing);


  if (locality) {
    result = result.filter((item) => {
      return normalize(
        item.locality ||
          item.city ||
          item.location
      ).includes(locality);
    });
  }


  if (bedrooms !== null && !Number.isNaN(bedrooms)) {
    result = result.filter((item) => {
      const value =
        item.bedroom ??
        item.bedrooms ??
        item.bhk;

      return Number(value) === bedrooms;
    });
  }


  if (minPrice !== null && !Number.isNaN(minPrice)) {
    result = result.filter((item) => {
      const price =
        item.price ??
        item.monthly_rent ??
        item.rent;

      return Number(price) >= minPrice;
    });
  }


  if (maxPrice !== null && !Number.isNaN(maxPrice)) {
    result = result.filter((item) => {
      const price =
        item.price ??
        item.monthly_rent ??
        item.rent;

      return Number(price) <= maxPrice;
    });
  }


  if (furnishing) {
    result = result.filter((item) => {
      return normalize(
        item.furnishing ??
          item.furnishing_status
      ) === furnishing;
    });
  }


  return result;
}


// --------------------------------------------------
// Pagination
// --------------------------------------------------

function paginate(data, query) {
  const page = Math.max(
    Number(query.page || 1),
    1
  );

  const limit = Math.min(
    Math.max(Number(query.limit || 20), 1),
    50
  );

  const start = (page - 1) * limit;

  const results = data.slice(
    start,
    start + limit
  );

  return {
    total: data.length,
    page,
    limit,
    count: results.length,
    has_more: start + limit < data.length,
    results,
  };
}


// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});


// --------------------------------------------------
// AUTH
// --------------------------------------------------

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }


    const response = await fetch(
      `${IVY_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": IVY_API_KEY,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );


    const data = await response.json();


    if (!response.ok) {
      return res.status(response.status).json({
        message:
          data?.message ||
          data?.detail ||
          "Login failed.",
      });
    }


    const token =
      data?.access_token ||
      data?.token;


    if (!token) {
      return res.status(502).json({
        message:
          "Login succeeded but no access token was returned.",
      });
    }


    req.session.ivyToken = token;

    req.session.user = {
      email,
    };


    return res.json({
      user: {
        email,
      },
    });

  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to login.",
    });
  }
});


app.get(
  "/api/auth/me",
  (req, res) => {
    if (!req.session?.user) {
      return res.status(401).json({
        message: "Not authenticated.",
      });
    }

    res.json({
      user: req.session.user,
    });
  }
);


app.post(
  "/api/auth/logout",
  (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({
          message: "Logout failed.",
        });
      }

      res.clearCookie("connect.sid");

      res.json({
        message: "Logged out successfully.",
      });
    });
  }
);


// --------------------------------------------------
// LISTINGS
// --------------------------------------------------

app.get(
  "/api/listings",
  (req, res) => {
    try {
      const listings =
        readJson("listings.json");

      const filtered =
        filterProperties(
          listings,
          req.query
        );

      const result =
        paginate(
          filtered,
          req.query
        );

      res.json(result);

    } catch (error) {
      console.error(
        "Listings error:",
        error.message
      );

      res.status(500).json({
        message: error.message,
      });
    }
  }
);


app.get(
  "/api/listings/:id",
  (req, res) => {
    try {
      const listings =
        readJson("listings.json");

      const listing =
        listings.find(
          (item) =>
            String(
              item.listing_id ??
                item.id
            ) ===
            String(req.params.id)
        );


      if (!listing) {
        return res.status(404).json({
          message: "Listing not found.",
        });
      }


      res.json(listing);

    } catch (error) {
      console.error(
        "Listing detail error:",
        error.message
      );

      res.status(500).json({
        message: error.message,
      });
    }
  }
);


// --------------------------------------------------
// RENTALS
// --------------------------------------------------

// app.get(
//   "/api/rentals",
//   (req, res) => {
//     try {
//       let rentals =
//         readJson("rentals.json");

//       const {
//         locality,
//         bedrooms,
//         furnishing,
//         min_price,
//         max_price,
//       } = req.query;

//       // Locality
//       if (locality) {
//         const searchLocality =
//           normalize(locality);

//         rentals = rentals.filter(
//           (rental) =>
//             normalize(
//               rental.locality
//             ).includes(
//               searchLocality
//             )
//         );
//       }

//       // Bedrooms
//       if (bedrooms !== undefined && bedrooms !== "") {
//         const bedroomCount =
//           Number(bedrooms);

//         if (
//           !Number.isNaN(
//             bedroomCount
//           )
//         ) {
//           rentals = rentals.filter(
//             (rental) =>
//               Number(
//                 rental.bedroom
//               ) === bedroomCount
//           );
//         }
//       }

//       // Furnishing
//       if (
//         furnishing !== undefined &&
//         furnishing !== ""
//       ) {
//         const requestedFurnishing =
//           normalize(furnishing);

//         rentals = rentals.filter(
//           (rental) =>
//             normalize(
//               rental.furnishing
//             ) ===
//             requestedFurnishing
//         );
//       }

//       // Minimum monthly rent
//       if (
//         min_price !== undefined &&
//         min_price !== ""
//       ) {
//         const minPrice =
//           Number(min_price);

//         if (
//           !Number.isNaN(minPrice)
//         ) {
//           rentals = rentals.filter(
//             (rental) =>
//               Number(
//                 rental.price
//               ) >= minPrice
//           );
//         }
//       }

//       // Maximum monthly rent
//       if (
//         max_price !== undefined &&
//         max_price !== ""
//       ) {
//         const maxPrice =
//           Number(max_price);

//         if (
//           !Number.isNaN(maxPrice)
//         ) {
//           rentals = rentals.filter(
//             (rental) =>
//               Number(
//                 rental.price
//               ) <= maxPrice
//           );
//         }
//       }

//       // Pagination AFTER filtering
//       const result =
//         paginate(
//           rentals,
//           req.query
//         );

//       res.json(result);

//     } catch (error) {
//       console.error(
//         "Rentals error:",
//         error.message
//       );

//       res.status(500).json({
//         message:
//           error.message,
//       });
//     }
//   }
// );
// --------------------------------------------------
// RENTALS
// --------------------------------------------------

app.get("/api/rentals", (req, res) => {
  try {
    let rentals = readJson("rentals.json");

    console.log("Rental query:", req.query);

    const {
      locality,
      bedrooms,
      furnishing,
      min_price,
      max_price,
    } = req.query;

    // ----------------------------------------------
    // Locality
    // ----------------------------------------------

    if (locality) {
      const searchLocality =
        normalize(locality);

      rentals = rentals.filter((rental) =>
        normalize(rental.locality).includes(
          searchLocality
        )
      );
    }

    // ----------------------------------------------
    // Bedrooms
    // ----------------------------------------------

    if (bedrooms) {
      const bedroomCount =
        Number(bedrooms);

      if (!Number.isNaN(bedroomCount)) {
        rentals = rentals.filter(
          (rental) =>
            Number(rental.bedroom) ===
            bedroomCount
        );
      }
    }

    // ----------------------------------------------
    // Furnishing
    // ----------------------------------------------

    if (furnishing) {
      const requestedFurnishing =
        normalize(furnishing);

      rentals = rentals.filter(
        (rental) =>
          normalize(rental.furnishing) ===
          requestedFurnishing
      );
    }

    // ----------------------------------------------
    // MINIMUM PRICE
    // ----------------------------------------------

    if (
      min_price !== undefined &&
      min_price !== ""
    ) {
      const minimum =
        Number(min_price);

      if (!Number.isNaN(minimum)) {
        rentals = rentals.filter(
          (rental) =>
            Number(rental.price) >=
            minimum
        );
      }
    }

    // ----------------------------------------------
    // MAXIMUM PRICE
    // ----------------------------------------------

    if (
      max_price !== undefined &&
      max_price !== ""
    ) {
      const maximum =
        Number(max_price);

      if (!Number.isNaN(maximum)) {
        rentals = rentals.filter(
          (rental) =>
            Number(rental.price) <=
            maximum
        );
      }
    }

    console.log(
      "Filtered rentals:",
      rentals.length
    );

    const result = paginate(
      rentals,
      req.query
    );

    res.json(result);

  } catch (error) {
    console.error(
      "Rentals error:",
      error.message
    );

    res.status(500).json({
      message: error.message,
    });
  }
});
// --------------------------------------------------
// PROJECTS
// --------------------------------------------------

app.get(
  "/api/projects",
  (req, res) => {
    try {
      const projects =
        readJson("projects.json");

      const filtered =
        filterProperties(
          projects,
          req.query
        );

      const result =
        paginate(
          filtered,
          req.query
        );

      res.json(result);

    } catch (error) {
      console.error(
        "Projects error:",
        error.message
      );

      res.status(500).json({
        message: error.message,
      });
    }
  }
);


app.get(
  "/api/projects/:id",
  (req, res) => {
    try {
      const projects =
        readJson("projects.json");

      const project =
        projects.find(
          (item) =>
            String(
              item.project_id ??
                item.id
            ) ===
            String(req.params.id)
        );


      if (!project) {
        return res.status(404).json({
          message: "Project not found.",
        });
      }


      res.json(project);

    } catch (error) {
      console.error(
        "Project detail error:",
        error.message
      );

      res.status(500).json({
        message: error.message,
      });
    }
  }
);


// --------------------------------------------------
// SAVED LISTINGS
// --------------------------------------------------
//
// Saved listings are intentionally stored locally.
// We do NOT guess an Ivy upstream favourites endpoint.
//
// Data structure:
//
// {
//   "user@email.com": ["listing-id-1", "listing-id-2"]
// }
//
// This gives each logged-in user their own persistent
// saved listings.
// --------------------------------------------------

function readSavedListings() {
  if (!fs.existsSync(SAVED_FILE)) {
    return {};
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        SAVED_FILE,
        "utf-8"
      )
    );
  } catch {
    return {};
  }
}


function writeSavedListings(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(
      DATA_DIR,
      { recursive: true }
    );
  }

  fs.writeFileSync(
    SAVED_FILE,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}


app.get(
  "/api/saved-listings",
  requireAuth,
  (req, res) => {
    try {
      const email =
        getCurrentUserEmail(req);

      const saved =
        readSavedListings();

      const ids =
        saved[email] || [];


      const listings =
        readJson("listings.json");


      const results =
        listings.filter((listing) => {
          const id = String(
            listing.listing_id ??
              listing.id
          );

          return ids.includes(id);
        });


      res.json({
        results,
        count: results.length,
      });

    } catch (error) {
      console.error(
        "Get saved listings error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to get saved listings.",
      });
    }
  }
);


app.post(
  "/api/saved-listings",
  requireAuth,
  (req, res) => {
    try {
      const {
        listing_id,
        id,
      } = req.body;


      const listingId =
        String(
          listing_id ?? id ?? ""
        );


      if (!listingId) {
        return res.status(400).json({
          message:
            "listing_id is required.",
        });
      }


      const listings =
        readJson("listings.json");


      const listing =
        listings.find(
          (item) =>
            String(
              item.listing_id ??
                item.id
            ) === listingId
        );


      if (!listing) {
        return res.status(404).json({
          message: "Listing not found.",
        });
      }


      const email =
        getCurrentUserEmail(req);

      const saved =
        readSavedListings();


      if (!saved[email]) {
        saved[email] = [];
      }


      if (!saved[email].includes(listingId)) {
        saved[email].push(listingId);
      }


      writeSavedListings(saved);


      res.status(201).json({
        message:
          "Listing saved successfully.",
        listing_id: listingId,
      });

    } catch (error) {
      console.error(
        "Save listing error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to save listing.",
      });
    }
  }
);


app.delete(
  "/api/saved-listings/:id",
  requireAuth,
  (req, res) => {
    try {
      const email =
        getCurrentUserEmail(req);

      const listingId =
        String(req.params.id);


      const saved =
        readSavedListings();


      if (!saved[email]) {
        return res.json({
          message:
            "Listing removed.",
        });
      }


      saved[email] =
        saved[email].filter(
          (id) =>
            String(id) !== listingId
        );


      writeSavedListings(saved);


      res.json({
        message:
          "Listing removed successfully.",
      });

    } catch (error) {
      console.error(
        "Remove saved listing error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to remove saved listing.",
      });
    }
  }
);


// --------------------------------------------------
// ANALYTICS
// --------------------------------------------------

function median(values) {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle = Math.floor(
    sorted.length / 2
  );

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] +
        sorted[middle]) /
      2
    );
  }

  return sorted[middle];
}

app.get(
  "/api/analytics/summary",
  requireAuth,
  (req, res) => {
    try {
      const listings =
        readJson("listings.json");

      // Use only live listings for current
      // market insights.
      const liveListings =
        listings.filter(
          (listing) =>
            listing.is_live === true
        );

      // -----------------------------
      // Overall price statistics
      // -----------------------------

      const prices =
        liveListings
          .map((listing) =>
            Number(listing.price)
          )
          .filter((price) =>
            Number.isFinite(price)
          );

      const medianPrice =
        median(prices);

      // -----------------------------
      // Median price per sq.ft.
      // -----------------------------

      const pricePerSqft =
        liveListings
          .map((listing) => {
            const price =
              Number(listing.price);

            const area =
              Number(
                listing.super_built_up_area
              );

            if (
              !Number.isFinite(price) ||
              !Number.isFinite(area) ||
              area <= 0
            ) {
              return null;
            }

            return price / area;
          })
          .filter((value) =>
            Number.isFinite(value)
          );

      const medianPricePerSqft =
        median(pricePerSqft);

      // -----------------------------
      // Locality statistics
      // -----------------------------

      const localityMap = {};

      liveListings.forEach(
        (listing) => {
          const locality =
            listing.locality
              ?.trim()
              .toLowerCase();

          if (!locality) {
            return;
          }

          if (!localityMap[locality]) {
            localityMap[locality] = [];
          }

          localityMap[locality].push(
            listing
          );
        }
      );

      const byLocality =
        Object.entries(localityMap)
          .map(
            ([locality, items]) => {
              const localityPrices =
                items
                  .map((item) =>
                    Number(item.price)
                  )
                  .filter((price) =>
                    Number.isFinite(price)
                  );

              return {
                locality,
                count: items.length,
                median_price:
                  median(
                    localityPrices
                  ),
              };
            }
          )
          .sort(
            (a, b) =>
              b.count - a.count
          );

      // -----------------------------
      // BHK statistics
      // -----------------------------

      const bhkMap = {};

      liveListings.forEach(
        (listing) => {
          const bedroom =
            Number(
              listing.bedroom
            );

          if (
            !Number.isFinite(
              bedroom
            )
          ) {
            return;
          }

          bhkMap[bedroom] =
            (bhkMap[bedroom] || 0) +
            1;
        }
      );

      const byBhk =
        Object.entries(bhkMap)
          .map(
            ([bedroom, count]) => ({
              bedroom:
                Number(bedroom),
              count,
            })
          )
          .sort(
            (a, b) =>
              a.bedroom -
              b.bedroom
          );

      // -----------------------------
      // Final analytics response
      // -----------------------------

      res.json({
        city: "Hyderabad",

        total_listings:
          liveListings.length,

        median_price:
          medianPrice,

        median_price_per_sqft:
          medianPricePerSqft,

        by_locality:
          byLocality,

        by_bhk:
          byBhk,

        source:
          "local-v1-listings",
      });
    } catch (error) {
      console.error(
        "Analytics error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to calculate analytics.",
      });
    }
  }
);

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `API server running on http://localhost:${PORT}`
  );
});