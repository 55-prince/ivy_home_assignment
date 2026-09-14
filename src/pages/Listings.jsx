import { useEffect, useState } from "react";

import { ivyApi } from "../api/ivyApi";
import FilterBar from "../components/FilterBar";
import PageLayout from "../components/PageLayout";
import PropertyCard from "../components/PropertyCard";

function Listings() {
  const [listings, setListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    locality: "",
    bedrooms: "",
    furnishing: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    try {
      setLoading(true);
      setError("");

      const response = await ivyApi.getListings();

      const results =
        response?.results ??
        response ??
        [];

      setListings(
        Array.isArray(results) ? results : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load listings."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      locality: "",
      bedrooms: "",
      furnishing: "",
      minPrice: "",
      maxPrice: "",
    });
  }

  const filteredListings = listings.filter(
    (listing) => {
      const locality = String(
        listing.locality ??
          listing.city ??
          ""
      ).toLowerCase();

      const furnishing = String(
        listing.furnishing ??
          listing.furnishing_status ??
          ""
      ).toLowerCase();

      const bedrooms = Number(
        listing.bedroom ??
          listing.bedrooms ??
          listing.bhk ??
          0
      );

      const price = Number(
        listing.price ??
          listing.monthly_rent ??
          listing.rent ??
          0
      );

      if (
        filters.locality &&
        !locality.includes(
          filters.locality.toLowerCase()
        )
      ) {
        return false;
      }

      if (
        filters.bedrooms &&
        bedrooms !== Number(filters.bedrooms)
      ) {
        return false;
      }

      if (
        filters.furnishing &&
        !furnishing.includes(
          filters.furnishing.toLowerCase()
        )
      ) {
        return false;
      }

      if (
        filters.minPrice &&
        price < Number(filters.minPrice)
      ) {
        return false;
      }

      if (
        filters.maxPrice &&
        price > Number(filters.maxPrice)
      ) {
        return false;
      }

      return true;
    }
  );

  return (
    <PageLayout>
      <div className="listings-page">
        <section className="listings-header">
          <div>
            <span className="eyebrow">
              EXPLORE HOMES
            </span>

            <h1>
              Find your next home.
            </h1>

            <p>
              Browse properties and narrow
              down your search using the
              filters.
            </p>
          </div>

          <div className="listing-count">
            <strong>
              {filteredListings.length}
            </strong>

            <span>properties</span>
          </div>
        </section>

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
        />

        {loading && (
          <div className="state-message">
            Loading properties...
          </div>
        )}

        {error && !loading && (
          <div className="state-message error-state">
            <strong>
              Unable to load properties.
            </strong>

            <p>{error}</p>

            <button
              type="button"
              className="primary-button"
              onClick={loadListings}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredListings.length > 0 ? (
              <section className="listing-grid">
                {filteredListings.map(
                  (listing) => (
                    <PropertyCard
                      key={
                        listing.id ||
                        listing.listing_id
                      }
                      listing={listing}
                    />
                  )
                )}
              </section>
            ) : (
              <div className="empty-state">
                <h2>
                  No properties found
                </h2>

                <p>
                  Try changing your filters
                  to find more homes.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={clearFilters}
                >
                  Reset filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default Listings;