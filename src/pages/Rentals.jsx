import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  MapPin,
  RefreshCw,
  Ruler,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ivyApi } from "../api/ivyApi";
import FilterBar from "../components/FilterBar";
import PageLayout from "../components/PageLayout";
import { useSavedListings } from "../context/SavedListingsContext";

import "./Rentals.css";

const PAGE_SIZE = 20;

const EMPTY_FILTERS = {
  locality: "",
  bedrooms: "",
  furnishing: "",
  min_price: "",
  max_price: "",
};

function formatPrice(value) {
  if (value == null || value === "") {
    return "Price on request";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function formatArea(value) {
  if (value == null || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return `${number.toLocaleString("en-IN")} sq ft`;
}

function formatFurnishing(value) {
  if (!value) return "";

  return value
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function RentalCard({ rental }) {
  const listingId = String(
    rental.listing_id
  );

  const {
    isSaved,
    toggleSaved,
  } = useSavedListings();

  const [saving, setSaving] =
    useState(false);

  const saved = isSaved(listingId);

  const title =
    rental.title ||
    rental.apartment_name ||
    "Rental property";

  const area =
    rental.super_builtup_area ??
    rental.carpet_area;

  async function handleSave(event) {
    event.preventDefault();
    event.stopPropagation();

    if (saving) return;

    try {
      setSaving(true);
      await toggleSaved(listingId);
    } catch (error) {
      console.error(
        "Unable to update saved rental:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rental-card">
      <div className="rental-card-top">
        <div className="rental-property-icon">
          <Home size={21} />
        </div>

        <button
          type="button"
          className={`rental-heart ${
            saved ? "saved" : ""
          }`}
          onClick={handleSave}
          disabled={saving}
          aria-label={
            saved
              ? "Remove rental from saved listings"
              : "Save rental"
          }
          title={
            saved
              ? "Remove from saved"
              : "Save rental"
          }
        >
          <Heart
            size={19}
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      <div className="rental-status-row">
        <span className="rental-type">
          {rental.property_type ||
            "Apartment"}
        </span>

        {rental.is_live != null && (
          <span
            className={`rental-live-status ${
              rental.is_live
                ? "live"
                : "inactive"
            }`}
          >
            {rental.is_live
              ? "Live"
              : "Inactive"}
          </span>
        )}
      </div>

      <h2>{title}</h2>

      <div className="rental-location">
        <MapPin size={15} />

        <span>
          {rental.locality ||
            "Location unavailable"}
        </span>
      </div>

      <div className="rental-price">
        <strong>
          {formatPrice(rental.price)}
        </strong>

        <span>/ month</span>
      </div>

      <div className="rental-specs">
        {rental.bedroom != null && (
          <div>
            <BedDouble size={15} />

            <span>
              {rental.bedroom} BHK
            </span>
          </div>
        )}

        {rental.bathroom != null && (
          <div>
            <Bath size={15} />

            <span>
              {rental.bathroom} Bath
            </span>
          </div>
        )}

        {area != null && (
          <div>
            <Ruler size={15} />

            <span>
              {formatArea(area)}
            </span>
          </div>
        )}
      </div>

      <div className="rental-information">
        <div>
          <span>Furnishing</span>

          <strong>
            {formatFurnishing(
              rental.furnishing
            ) || "Not specified"}
          </strong>
        </div>

        <div>
          <span>Deposit</span>

          <strong>
            {formatPrice(
              rental.deposit
            )}
          </strong>
        </div>

        <div>
          <span>Maintenance</span>

          <strong>
            {rental.maintenance != null
              ? formatPrice(
                  rental.maintenance
                )
              : "Not specified"}
          </strong>
        </div>

        <div>
          <span>Floor</span>

          <strong>
            {rental.floor != null
              ? `${rental.floor}${
                  rental.total_floors != null
                    ? ` / ${rental.total_floors}`
                    : ""
                }`
              : "Not specified"}
          </strong>
        </div>
      </div>

      <div className="rental-footer">
        <div>
          <span>Listed by</span>

          <strong>
            {rental.posted_by_name ||
              rental.posted_by ||
              "Owner / Agent"}
          </strong>
        </div>
      </div>
    </article>
  );
}

function Rentals() {
  const [rentals, setRentals] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      total: 0,
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
    loadRentals();
  }, [page, filters]);

  async function loadRentals() {
    try {
      setLoading(true);
      setError("");

      const response =
        await ivyApi.getRentals({
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

      setRentals(results);

      setPagination({
        total: Number(
          response?.total ??
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
      setRentals([]);

      setPagination({
        total: 0,
        limit: PAGE_SIZE,
        has_more: false,
      });

      setError(
        err.message ||
          "Unable to load rental properties."
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

    setPage(1);
  }

  function clearFilters() {
    setFilters({
      ...EMPTY_FILTERS,
    });

    setPage(1);
  }

  function previousPage() {
    if (page <= 1) return;

    setPage(
      (current) => current - 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function nextPage() {
    if (!pagination.has_more) return;

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

  const hasFilters =
    Object.values(filters).some(
      (value) => value !== ""
    );

  return (
    <PageLayout>
      <main className="rentals-page">
        <section className="rentals-header">
          <div>
            <span className="rentals-eyebrow">
              RENTAL HOMES
            </span>

            <h1>
              Find your next rental.
            </h1>

            <p>
              Browse rental properties by
              locality, bedrooms, furnishing
              and monthly price.
            </p>
          </div>

          <div className="rentals-header-icon">
            <Home size={24} />
          </div>
        </section>

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
        />

        {loading && (
          <div className="rentals-state">
            <div className="rentals-spinner" />

            <span>
              Loading rental properties...
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="rentals-state rentals-error">
            <strong>
              Unable to load rentals.
            </strong>

            <p>{error}</p>

            <button
              type="button"
              className="primary-button"
              onClick={loadRentals}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error && (
            <>
              {rentals.length > 0 ? (
                <>
                  <div className="rentals-results-bar">
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

                    {hasFilters && (
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

                  <section className="rentals-grid">
                    {rentals.map(
                      (rental) => (
                        <RentalCard
                          key={
                            rental.listing_id
                          }
                          rental={rental}
                        />
                      )
                    )}
                  </section>

                  <div className="rentals-pagination">
                    <button
                      type="button"
                      disabled={
                        page === 1
                      }
                      onClick={
                        previousPage
                      }
                    >
                      <ChevronLeft
                        size={17}
                      />
                      Previous
                    </button>

                    <div>
                      Page{" "}
                      <strong>
                        {page}
                      </strong>
                    </div>

                    <button
                      type="button"
                      disabled={
                        !pagination.has_more
                      }
                      onClick={
                        nextPage
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
                <div className="rentals-empty">
                  <Home size={30} />

                  <h2>
                    No rental properties found
                  </h2>

                  <p>
                    Try changing your
                    locality, bedroom,
                    furnishing or price
                    filters.
                  </p>

                  {hasFilters && (
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
      </main>
    </PageLayout>
  );
}

export default Rentals;