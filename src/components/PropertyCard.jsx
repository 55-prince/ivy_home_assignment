import { Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ivyApi } from "../api/ivyApi";
import "./PropertyCard.css";

function PropertyCard({ listing }) {
  const listingId = String(
    listing.listing_id ?? listing.id
  );

  const bedroom =
    listing.bedroom ??
    listing.bedrooms ??
    listing.bhk;

  const furnishing =
    listing.furnishing ??
    listing.furnishing_status;

  const title =
    listing.apartment_name ??
    listing.title ??
    "Residential property";

  const locality =
    listing.locality ??
    listing.city ??
    listing.location ??
    "Location unavailable";

  const price =
    listing.price ??
    listing.monthly_rent ??
    listing.rent;

  const image =
    listing.image_url ??
    listing.image ??
    listing.photo_url;


  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);


  // Check whether this listing is already saved
  // when the card is loaded.
  useEffect(() => {
    let mounted = true;

    async function checkSaved() {
      try {
        const response =
          await ivyApi.getSavedListings();

        const savedListings =
          response?.results ??
          response ??
          [];

        const exists =
          savedListings.some(
            (item) =>
              String(
                item.listing_id ??
                  item.id
              ) === listingId
          );

        if (mounted) {
          setIsSaved(exists);
        }
      } catch {
        // User may not be authenticated.
        // In that case the card simply stays unsaved.
      }
    }

    checkSaved();

    return () => {
      mounted = false;
    };
  }, [listingId]);


  async function handleSave(event) {
    // Do not navigate to the listing detail page
    // when clicking the heart.
    event.preventDefault();
    event.stopPropagation();

    if (saving) return;

    try {
      setSaving(true);

      if (isSaved) {
        await ivyApi.removeSavedListing(
          listingId
        );

        setIsSaved(false);
      } else {
        await ivyApi.saveListing(
          listingId
        );

        setIsSaved(true);
      }

    } catch (error) {
      console.error(
        "Unable to update saved listing:",
        error
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <article className="listing-card">

      <div className="listing-image">

        {image ? (
          <img
            src={image}
            alt={title}
          />
        ) : (
          <div className="image-placeholder">
            <span>Ivy Homes</span>
          </div>
        )}


        <button
          type="button"
          className={`favorite-icon ${
            isSaved ? "saved" : ""
          }`}
          onClick={handleSave}
          disabled={saving}
          aria-label={
            isSaved
              ? `Remove ${title} from saved listings`
              : `Save ${title}`
          }
          title={
            isSaved
              ? "Remove from saved"
              : "Save listing"
          }
        >
          <Heart
            size={19}
            fill={
              isSaved
                ? "currentColor"
                : "none"
            }
          />
        </button>

      </div>


      <div className="listing-content">

        <div className="listing-topline">
          <span>
            {bedroom
              ? `${bedroom} BHK`
              : "Residential"}
          </span>

          {furnishing && (
            <span>
              {furnishing}
            </span>
          )}
        </div>


        <h2>{title}</h2>


        <div className="listing-location">
          <MapPin size={14} />
          <span>{locality}</span>
        </div>


        <div className="listing-bottom">

          <strong>
            {price != null
              ? `₹${Number(price).toLocaleString(
                  "en-IN"
                )}`
              : "Price on request"}
          </strong>

          <Link
            to={`/listings/${listingId}`}
          >
            View details
          </Link>

        </div>

      </div>

    </article>
  );
}

export default PropertyCard;