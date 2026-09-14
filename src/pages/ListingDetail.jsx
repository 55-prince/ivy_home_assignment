import {
  ArrowLeft,
  Heart,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { ivyApi } from "../api/ivyApi";
import PageLayout from "../components/PageLayout";
import "./ListingDetail.css";

function ListingDetail() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadListing();
  }, [id]);

  async function loadListing() {
    try {
      setLoading(true);
      setError("");

      const data = await ivyApi.getListing(id);

      setListing(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load this listing."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="detail-state">
          Loading property...
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="detail-state detail-error">
          <h2>Unable to load property</h2>

          <p>{error}</p>

          <Link to="/listings">
            <ArrowLeft size={16} />
            Back to listings
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (!listing) {
    return (
      <PageLayout>
        <div className="detail-state">
          <h2>Property not found</h2>

          <Link to="/listings">
            <ArrowLeft size={16} />
            Back to listings
          </Link>
        </div>
      </PageLayout>
    );
  }

  const title =
    listing.apartment_name ||
    listing.title ||
    "Residential property";

  const locality =
    listing.locality ||
    listing.city ||
    "Location unavailable";

  const bedrooms =
    listing.bedroom ??
    listing.bedrooms ??
    listing.bhk;

  const bathrooms =
    listing.bathroom ??
    listing.bathrooms;

  const area =
    listing.super_built_up_area ??
    listing.built_up_area ??
    listing.carpet_area;

  const price =
    listing.price ??
    listing.monthly_rent ??
    listing.rent;

  const furnishing =
    listing.furnishing ??
    listing.furnishing_status;

  const floor = listing.floor;
  const totalFloors =
    listing.total_floors;

  const image =
    listing.image_url ||
    listing.image ||
    listing.images?.[0];

  return (
    <PageLayout>
      <main className="listing-detail">
        <Link
          className="back-link"
          to="/listings"
        >
          <ArrowLeft size={16} />
          Back to listings
        </Link>

        <section className="detail-layout">
          <div className="detail-image">
            {image ? (
              <img
                src={image}
                alt={title}
              />
            ) : (
              <div className="detail-image-placeholder">
                Ivy Homes
              </div>
            )}
          </div>

          <div className="detail-content">
            <div className="detail-actions">
              <span className="detail-badge">
                {listing.property_type ||
                  "PROPERTY"}
              </span>

              <button
                type="button"
                className="detail-save"
                aria-label="Save listing"
              >
                <Heart size={18} />
              </button>
            </div>

            <h1>{title}</h1>

            <div className="detail-location">
              <MapPin size={17} />
              <span>{locality}</span>
            </div>

            <div className="detail-price">
              {price != null
                ? `₹${Number(
                    price
                  ).toLocaleString("en-IN")}`
                : "Price on request"}
            </div>

            <div className="detail-specs">
              {bedrooms != null && (
                <div>
                  <span>Bedrooms</span>
                  <strong>
                    {bedrooms}
                  </strong>
                </div>
              )}

              {bathrooms != null && (
                <div>
                  <span>Bathrooms</span>
                  <strong>
                    {bathrooms}
                  </strong>
                </div>
              )}

              {area != null && (
                <div>
                  <span>Area</span>
                  <strong>
                    {Number(
                      area
                    ).toLocaleString("en-IN")}{" "}
                    sq ft
                  </strong>
                </div>
              )}

              {furnishing && (
                <div>
                  <span>Furnishing</span>
                  <strong>
                    {furnishing}
                  </strong>
                </div>
              )}

              {floor != null && (
                <div>
                  <span>Floor</span>
                  <strong>
                    {floor}
                    {totalFloors != null
                      ? ` / ${totalFloors}`
                      : ""}
                  </strong>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h2>Property information</h2>

              <div className="detail-information">
                {listing.project_id && (
                  <div>
                    <span>
                      Project ID
                    </span>

                    <strong>
                      {listing.project_id}
                    </strong>
                  </div>
                )}

                {listing.listing_id && (
                  <div>
                    <span>
                      Listing ID
                    </span>

                    <strong>
                      {listing.listing_id}
                    </strong>
                  </div>
                )}

                {listing.property_type && (
                  <div>
                    <span>
                      Property type
                    </span>

                    <strong>
                      {listing.property_type}
                    </strong>
                  </div>
                )}

                {listing.is_live != null && (
                  <div>
                    <span>
                      Listing status
                    </span>

                    <strong>
                      {listing.is_live
                        ? "Live"
                        : "Not live"}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="save-listing-button"
            >
              <Heart size={18} />
              Save this property
            </button>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

export default ListingDetail;