// src/components/LocationIqAutocomplete.jsx
import { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
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

        setSuggestions(res.data || []);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error(err);
        }
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [value]);

  const handleSelect = (item) => {
    const city =
      item.address?.city || item.address?.town || item.address?.village || "";
    const state = item.address?.state || "";

    const inSultanKudarat = state === "Sultan Kudarat";
    const inAllowedMunicipality = city && ALLOWED_MUNICIPALITIES.includes(city);

    if (!inSultanKudarat || !inAllowedMunicipality) {
      alert("Please choose an address within Sultan Kudarat only.");
      return;
    }

    onChange(item.display_name || "");
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your address"
        autoComplete="street-address"
        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
        required
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto text-sm">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s)}
              className="px-3 py-2 hover:bg-amber-50 cursor-pointer"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
