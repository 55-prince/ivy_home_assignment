# Ivy Homes Software Engineering Assignment

A full-stack real estate application built for the Ivy Homes Software Engineering assignment.

## Tech Stack

- React.js
- Vite
- Tailwind CSS
- DaisyUI
- Node.js
- Express.js
- Express Session

## Features

- User login with session-based authentication
- Listings with pagination
- Filters by locality, bedrooms, price and furnishing
- Listing detail pages
- Save and remove listings
- User-specific saved listings
- Rental listings with filters
- Project listings and project details
- Market insights and analytics
- Data quality and suspicious listing checks

## Project Structure

```text
ivy-frontend/
├── public/
├── src/
├── server/
│   ├── data/
│   └── index.cjs
├── submission.json
├── findings.json
├── package.json
├── vite.config.js
└── README.md
```

## How to Run

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Create a `.env` file in the project root:

```env
IVY_API_KEY=YOUR_API_KEY
IVY_BASE_URL=https://solve.ivy.homes
PORT=5000
NODE_ENV=development
```

The API key is kept in `.env` and is not committed to the repository.

### 3. Start the application

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

The backend will run on:

```text
http://localhost:5000
```

## API Documentation vs Actual Behaviour

While working on the assignment, I found a few differences between the API documentation and the behaviour of the live API.

I tested the documented requests instead of assuming the documentation was always correct.

For authentication, the documentation says that the API key can be passed using `?api_key=...`. The live API rejected this request and required the key in the `X-API-Key` header.

The `/v1/listings` endpoint also required a Bearer token obtained from `/auth/login`. Therefore, the application performs user login before requesting listings.

Pagination was another difference. The documentation describes `page` and `limit` with a maximum limit of 200. The live API actually uses `offset` and `limit`, with the limit capped at 50.

I recorded these discrepancies in `submission.json` under `findings`.

## Data Quality Checks

I checked the listing and project data for inconsistencies instead of assuming that every record was valid.

The checks included:

- `carpet_area > super_built_up_area`
- `floor > total_floors`
- Negative listing prices
- Incorrect project listing counts
- Duplicate property records
- Timestamp format differences
- Project price unit differences

These findings are documented in `submission.json` along with the method used to find them and evidence IDs where applicable.

## Fake Listing Detection

I did not classify listings as fake just because they were unverified or because one contact had many listings. Many legitimate brokers can have multiple listings.

Instead, I looked for a stronger pattern where the same contact appeared across many unrelated apartments, several localities and multiple source websites, while having a low verification ratio.

For example, one contact appeared on 10 listings across 6 localities, 10 apartment names and 4 websites, with only 2 verified records.

This pattern is more consistent with lead-generation inventory than a normal single-property owner. Using these combined signals, I identified 41 fake/lead-generation candidates.

## Insights

The documented `/v1/analytics/summary` endpoint returned `404 Not Found` when tested. The alternative v2 endpoint mentioned in the documentation was also not implemented.

Because of this, I calculated the required insights from the listing data instead of depending on the unavailable analytics endpoint.

## Main Results

```text
Total listing records       : 4400
Unique properties            : 4316
Active listings              : 3477
Total monthly rent Madhapur  : ₹5,978,500
Average 2BHK price/sqft      : ₹17,868.79
Costliest project            : P20384
Listings in last 7 days      : 141
Fake/lead-generation records : 41
Wrong project listing counts : 363
```

The complete answers and findings are available in `submission.json`.

## What I Would Improve With More Time

If I had another two days, I would focus on:

1. Adding more automated tests for authentication, filters and pagination.
2. Improving loading, error and empty states.
3. Moving saved listings from the local JSON file to a persistent database for production.
4. Improving the insights screen with more visual analytics.
5. Adding a more centralized data validation pipeline.
6. Improving production security and session configuration.

## LLM Usage

I used an LLM as a development assistant for debugging, understanding API behaviour, reviewing implementation decisions and solving development issues.

I independently tested the API behaviour, dataset calculations and application locally before using the results in the submission.