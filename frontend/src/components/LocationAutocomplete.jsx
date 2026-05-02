import { useEffect, useRef, useState } from "react";
import { suggestLocations } from "../services/carsService";

function LocationAutocomplete({ value, onChange, placeholder = "Nhập địa điểm" }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const keyword = value.trim();

      if (!keyword) {
        setSuggestions([]);
        return;
      }

      try {
        const data = await suggestLocations(keyword);
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi gợi ý địa điểm:", error);
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="location-autocomplete" ref={wrapperRef}>
      <input
        type="text"
        className="search-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && suggestions.length > 0 && (
        <div className="location-dropdown">
          {suggestions.map((item, index) => (
            <button
              key={`${item}-${index}`}
              type="button"
              className="location-dropdown-item"
              onClick={() => {
                onChange(item);
                setShowDropdown(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;