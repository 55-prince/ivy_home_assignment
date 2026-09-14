import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ivyApi } from "../api/ivyApi";
import FilterBar from "../components/FilterBar";
import PageLayout from "../components/PageLayout";
import PropertyCard from "../components/PropertyCard";
import "./Listings.css";

const PAGE_SIZE = 20;

const EMPTY_FILTERS = {
  locality: "",
  bedrooms: "",
  furnishing: "",
  min_price: "",
  max_price: "",
};

function Listings() {
  const [listings, setListings] = useState([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState({
      total: 0,
      count: 0,
      limit: PAGE_SIZE,
      has_more: false,
    });

  const [filters, setFilters] =
    useState({
      ...EMPTY_FILTERS,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadListings();
  }, [page, filters]);

  async function loadListings() {
    const minPrice =
      filters.min_price === ""
        ? null
        : Number(filters.min_price);

    const maxPrice =
      filters.max_price === ""
        ? null
        : Number(filters.max_price);

    // Validate price range before making API request.
    if (
      minPrice !== null &&
      maxPrice !== null &&
      minPrice > maxPrice
    ) {
      setListings([]);

      setPagination({
        total: 0,
        count: 0,
        limit: PAGE_SIZE,
        has_more: false,
      });

      setError(
        "Minimum price cannot be greater than maximum price."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await ivyApi.getListings({
          page,
          limit: PAGE_SIZE,

          locality:
            filters.locality,

          bedrooms:
            filters.bedrooms,

          furnishing:
            filters.furnishing,

          min_price:
            filters.min_price,

          max_price:
            filters.max_price,
        });

      const results =
        Array.isArray(
          response?.results
        )
          ? response.results
          : [];

      setListings(results);

      setPagination({
        total: Number(
          response?.total ?? 0
        ),

        count: Number(
          response?.count ??
            results.length
        ),

        limit: Number(
          response?.limit ??
            PAGE_SIZE
        ),

        has_more: Boolean(
          response?.has_more
        ),
      });
    } catch (err) {
      setListings([]);

      setPagination({
        total: 0,
        count: 0,
        limit: PAGE_SIZE,
        has_more: false,
      });

      setError(
        err.message ||
          "Unable to load listings."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    // Always go back to first page
    // when filters change.
    setPage(1);
  }

  function clearFilters() {
    setFilters({
      ...EMPTY_FILTERS,
    });

    setPage(1);
  }

  function previousPage() {
    if (page === 1) {
      return;
    }

    setPage(
      (current) => current - 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function nextPage() {
    if (!pagination.has_more) {
      return;
    }

    setPage(
      (current) => current + 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const firstResult =
    pagination.total === 0
      ? 0
      : (page - 1) *
          pagination.limit +
        1;

  const lastResult =
    pagination.total === 0
      ? 0
      : Math.min(
          page * pagination.limit,
          pagination.total
        );

  const hasActiveFilters =
    Object.values(filters).some(
      (value) => value !== ""
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
              Browse properties and
              narrow down your search
              using the filters.
            </p>
          </div>

          <div className="listing-count">
            <strong>
              {pagination.total.toLocaleString(
                "en-IN"
              )}
            </strong>

            <span>
              {pagination.total === 1
                ? "property"
                : "properties"}
            </span>
          </div>
        </section>

        <FilterBar
          filters={filters}
          onChange={
            handleFilterChange
          }
          onClear={clearFilters}
        />

        {loading && (
          <div className="state-message">
            <div className="state-spinner" />

            <span>
              Loading properties...
            </span>
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
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error && (
            <>
              {listings.length > 0 ? (
                <>
                  <div className="results-bar">
                    <span>
                      Showing{" "}
                      <strong>
                        {firstResult}
                      </strong>
                      {" - "}
                      <strong>
                        {lastResult}
                      </strong>
                      {" of "}
                      <strong>
                        {pagination.total.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </span>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  <section className="listing-grid">
                    {listings.map(
                      (listing) => (
                        <PropertyCard
                          key={
                            listing.listing_id ??
                            listing.id
                          }
                          listing={
                            listing
                          }
                        />
                      )
                    )}
                  </section>

                  <div className="pagination">
                    <button
                      type="button"
                      className="pagination-button"
                      onClick={
                        previousPage
                      }
                      disabled={
                        page === 1
                      }
                    >
                      <ChevronLeft
                        size={17}
                      />
                      Previous
                    </button>

                    <div className="page-indicator">
                      <span>
                        Page
                      </span>

                      <strong>
                        {page}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="pagination-button"
                      onClick={
                        nextPage
                      }
                      disabled={
                        !pagination.has_more
                      }
                    >
                      Next

                      <ChevronRight
                        size={17}
                      />
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <h2>
                    No properties found
                  </h2>

                  <p>
                    No properties match
                    your current search
                    criteria.
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={
                        clearFilters
                      }
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
      </div>
    </PageLayout>
  );
}

export default Listings;