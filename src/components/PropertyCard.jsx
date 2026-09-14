import {
  Heart,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { useSavedListings } from "../context/SavedListingsContext";

import "./PropertyCard.css";

function PropertyCard({ listing }) {
  const listingId = String(
    listing.listing_id ??
      listing.id
  );

  const {
    isSaved,
    toggleSaved,
  } = useSavedListings();

  const [saving, setSaving] =
    useState(false);

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

  const saved = isSaved(listingId);

  async function handleSave(event) {
    event.preventDefault();
    event.stopPropagation();

    if (saving) return;

    try {
      setSaving(true);

      await toggleSaved(listingId);
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
            saved ? "saved" : ""
          }`}
          onClick={handleSave}
          disabled={saving}
          aria-label={
            saved
              ? "Remove from saved listings"
              : "Save listing"
          }
          title={
            saved
              ? "Remove from saved"
              : "Save listing"
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
              ? `₹${Number(
                  price
                ).toLocaleString(
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