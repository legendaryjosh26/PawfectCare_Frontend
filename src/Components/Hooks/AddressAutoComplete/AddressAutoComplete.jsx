// src/components/LocationIqAutocomplete.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import NotificationModal from "../../Modals/NotificationModal";

const ALLOWED_MUNICIPALITIES = [
  "Tacurong",
  "Bagumbayan",
  "Columbio",
  "Esperanza",
  "Isulan",
  "Kalamansig",
  "Lambayong",
  "Lebak",
  "Lutayan",
  "Palimbang",
  "President Quirino",
  "Senator Ninoy Aquino",
];

const API_KEY = import.meta.env.VITE_LOCATIONIQ_KEY;

export default function AddressAutoComplete({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "",
    message: "",
    redirectTo: "",
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Clear suggestions with timeout
  const clearSuggestionsWithTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setSuggestions([]);
      setShowSuggestions(false);
    }, 3000); // 3 seconds delay
  }, []);

  // Clear suggestions immediately
  const clearSuggestions = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        clearSuggestions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [clearSuggestions]);

  useEffect(() => {
    if (!value || value.length < 5) {
      clearSuggestions();
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(
          "https://us1.locationiq.com/v1/autocomplete.php",
          {
            params: {
              key: API_KEY,
              q: value,
              limit: 5,
              countrycodes: "ph",
              normalizecity: 1,
            },
            signal: controller.signal,
          }
        );

        const newSuggestions = res.data || [];
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);

        // Start auto-dismiss timer when new suggestions appear
        clearSuggestionsWithTimeout();
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error(err);
        }
        clearSuggestions();
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [value, clearSuggestionsWithTimeout, clearSuggestions]);

  // Reset timer when user types
  useEffect(() => {
    if (value && value.length >= 3 && suggestions.length > 0) {
      clearSuggestionsWithTimeout();
    }
  }, [value, suggestions.length, clearSuggestionsWithTimeout]);

  const handleSelect = (item) => {
    const city =
      item.address?.city || item.address?.town || item.address?.village || "";
    const state = item.address?.state || "";

    const inSultanKudarat = state === "Sultan Kudarat";
    const inAllowedMunicipality = city && ALLOWED_MUNICIPALITIES.includes(city);

    if (!inSultanKudarat || !inAllowedMunicipality) {
      setNotification({
        isOpen: true,
        type: "error",
        message: "Available within Tacurong City only.",
      });
      return;
    }

    onChange(item.display_name || "");
    clearSuggestions();
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
      clearSuggestionsWithTimeout();
    }
  };

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleInputFocus}
        placeholder="Enter your address"
        autoComplete="street-address"
        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
        required
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto text-sm">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s)}
              className="px-3 py-2 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        message={notification.message}
        redirectTo={notification.redirectTo}
      />
    </div>
  );
}
