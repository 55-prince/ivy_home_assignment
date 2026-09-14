import { SlidersHorizontal } from "lucide-react";

function FilterBar({ filters, onChange, onClear }) {
  return (
    <section className="filter-panel">
      <div className="filter-heading">
        <div className="filter-title">
          <SlidersHorizontal size={17} />
          <strong>Filter properties</strong>
        </div>

        <button
          type="button"
          className="clear-filters"
          onClick={onClear}
        >
          Clear all
        </button>
      </div>

      <div className="filters">
        <label>
          <span>Locality</span>

          <input
            name="locality"
            value={filters.locality}
            onChange={onChange}
            placeholder="e.g. Koramangala"
          />
        </label>

        <label>
          <span>Bedrooms</span>

          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={onChange}
          >
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
          </select>
        </label>

        <label>
          <span>Furnishing</span>

          <select
            name="furnishing"
            value={filters.furnishing}
            onChange={onChange}
          >
            <option value="">Any</option>
            <option value="furnished">Furnished</option>
            <option value="semi">Semi-furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </label>

        <label>
          <span>Min price</span>

          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={onChange}
            placeholder="₹ Min"
            min="0"
          />
        </label>

        <label>
          <span>Max price</span>

          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={onChange}
            placeholder="₹ Max"
            min="0"
          />
        </label>
      </div>
    </section>
  );
}

export default FilterBar;