"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // Rate to convert from USD
  flag: string;
}

const countries: Country[] = [
  {
    code: "US",
    name: "United States",
    currency: "USD",
    currencySymbol: "$",
    exchangeRate: 1,
    flag: "🇺🇸",
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    exchangeRate: 0.79,
    flag: "🇬🇧",
  },
  {
    code: "EU",
    name: "European Union",
    currency: "EUR",
    currencySymbol: "€",
    exchangeRate: 0.85,
    flag: "🇪🇺",
  },
  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    currencySymbol: "C$",
    exchangeRate: 1.35,
    flag: "🇨🇦",
  },
  {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    currencySymbol: "A$",
    exchangeRate: 1.52,
    flag: "🇦🇺",
  },
  {
    code: "JP",
    name: "Japan",
    currency: "JPY",
    currencySymbol: "¥",
    exchangeRate: 149,
    flag: "🇯🇵",
  },
  {
    code: "IN",
    name: "India",
    currency: "INR",
    currencySymbol: "₹",
    exchangeRate: 83,
    flag: "🇮🇳",
  },
  {
    code: "NG",
    name: "Nigeria",
    currency: "NGN",
    currencySymbol: "₦",
    exchangeRate: 1650,
    flag: "🇳🇬",
  },
  {
    code: "SG",
    name: "Singapore",
    currency: "SGD",
    currencySymbol: "S$",
    exchangeRate: 1.34,
    flag: "🇸🇬",
  },
  {
    code: "BR",
    name: "Brazil",
    currency: "BRL",
    currencySymbol: "R$",
    exchangeRate: 5.1,
    flag: "🇧🇷",
  },
  {
    code: "MX",
    name: "Mexico",
    currency: "MXN",
    currencySymbol: "MX$",
    exchangeRate: 17.2,
    flag: "🇲🇽",
  },
];

interface CountrySelectorProps {
  selectedCountry: Country;
  // eslint-disable-next-line
  onCountryChange: (country: Country) => void;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#E6EAEF] rounded-xl hover:border-[#7141F8] transition-colors duration-200 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-[#101828]">
            {selectedCountry.name}
          </span>
          <span className="text-xs text-[#475467]">
            ({selectedCountry.currency})
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#475467] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E6EAEF] rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleCountrySelect(country)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] transition-colors duration-150 ${
                selectedCountry.code === country.code
                  ? "bg-[#F9FAFB] border-l-2 border-[#7141F8]"
                  : ""
              }`}
            >
              <span className="text-lg">{country.flag}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#101828]">
                  {country.name}
                </div>
                <div className="text-xs text-[#475467]">
                  {country.currency} ({country.currencySymbol})
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
export { countries };
