import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { ivyApi } from "../api/ivyApi";
import PageLayout from "../components/PageLayout";
import PropertyCard from "../components/PropertyCard";
import "./saved.css";

function Saved() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSavedListings();
  }, []);

  async function loadSavedListings() {
    try {
      setLoading(true);
      setError("");

      const data = await ivyApi.getSavedListings();

      const results =
        data?.results ||
        data?.listings ||
        data?.data ||
        data ||
        [];

      setListings(Array.isArray(results) ? results : []);
    } catch (err) {
      setError(
        err.message || "Unable to load saved listings."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <main className="saved-page">
        <div className="saved-header">
          <div>
            <p className="saved-eyebrow">
              YOUR COLLECTION
            </p>

            <h1>Saved homes.</h1>

            <p>
              Properties you've saved for later.
            </p>
          </div>

          <div className="saved-count">
            <Heart size={17} />
            {listings.length} saved
          </div>
        </div>

        {loading && (
          <div className="saved-state">
            Loading saved properties...
          </div>
        )}

        {error && !loading && (
          <div className="saved-state saved-error">
            <h2>Something went wrong</h2>
            <p>{error}</p>

            <button
              type="button"
              onClick={loadSavedListings}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="saved-state saved-empty">
            <Heart size={32} />

            <h2>No saved homes yet</h2>

            <p>
              Save a property from the listings page
              and it will appear here.
            </p>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="saved-grid">
            {listings.map((listing) => (
              <PropertyCard
                key={
                  listing.listing_id ||
                  listing.id ||
                  listing._id
                }
                listing={listing}
              />
            ))}
          </div>
        )}
      </main>
    </PageLayout>
  );
}

export default Saved;
