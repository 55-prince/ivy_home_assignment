import {
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import "./FilterBar.css";

function FilterBar({
  filters,
  onChange,
  onClear,
}) {
  const hasFilters =
    Object.values(filters).some(
      (value) => value !== ""
    );

  return (
    <section className="filter-panel">

      <div className="filter-heading">

        <div className="filter-title">

          <div className="filter-title-icon">
            <SlidersHorizontal size={16} />
          </div>

          <div>
            <strong>
              Filter properties
            </strong>

            <span>
              Refine your search
            </span>
          </div>

        </div>

        <button
          type="button"
          className="clear-filters"
          onClick={onClear}
          disabled={!hasFilters}
        >
          <RotateCcw size={14} />
          Clear all
        </button>

      </div>


      <div className="filters">

        <label className="filter-field locality-field">
          <span>Locality</span>

          <input
            type="text"
            name="locality"
            value={filters.locality}
            onChange={onChange}
            placeholder="e.g. Madhapur"
          />
        </label>


        <label className="filter-field">
          <span>Bedrooms</span>

          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={onChange}
          >
            <option value="">
              Any bedrooms
            </option>

            <option value="1">
              1 BHK
            </option>

            <option value="2">
              2 BHK
            </option>

            <option value="3">
              3 BHK
            </option>

            <option value="4">
              4 BHK
            </option>
          </select>
        </label>


        <label className="filter-field">
          <span>Furnishing</span>

          <select
            name="furnishing"
            value={filters.furnishing}
            onChange={onChange}
          >
            <option value="">
              Any furnishing
            </option>

            <option value="fully-furnished">
              Fully-furnished
            </option>

            <option value="semi-furnished">
              Semi-furnished
            </option>

            <option value="unfurnished">
              Unfurnished
            </option>
          </select>
        </label>


        <label className="filter-field">
          <span>Minimum price</span>

          <div className="price-input">
            <span>₹</span>

            <input
              type="number"
              name="min_price"
              value={filters.min_price}
              onChange={onChange}
              placeholder="Min"
              min="0"
            />
          </div>
        </label>


        <label className="filter-field">
          <span>Maximum price</span>

          <div className="price-input">
            <span>₹</span>

            <input
              type="number"
              name="max_price"
              value={filters.max_price}
              onChange={onChange}
              placeholder="Max"
              min="0"
            />
          </div>
        </label>

      </div>

    </section>
  );
}

export default FilterBar;