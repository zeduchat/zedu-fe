"use client";

import { useState, useEffect } from "react";
import { Country, countries } from "../components/pricing/CountrySelector";

interface LocationData {
  country: string;
  countryCode: string;
}

export const useLocationDetection = () => {
  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        setIsLoading(true);

        // Try to get location from IP geolocation service
        const response = await fetch("https://ipapi.co/json/");

        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }

        const data: LocationData = await response.json();

        // Map the detected country code to our countries list
        const foundCountry = countries?.find(
          (country) =>
            country.code === data.country ||
            (data.countryCode === "NG" && country.code === "NG") ||
            (data.countryCode === "GB" && country.code === "GB") ||
            (data.countryCode === "US" && country.code === "US") ||
            (data.countryCode === "CA" && country.code === "CA") ||
            (data.countryCode === "AU" && country.code === "AU") ||
            (data.countryCode === "JP" && country.code === "JP") ||
            (data.countryCode === "IN" && country.code === "IN") ||
            (data.countryCode === "SG" && country.code === "SG") ||
            (data.countryCode === "BR" && country.code === "BR") ||
            (data.countryCode === "MX" && country.code === "MX")
        );

        if (foundCountry) {
          setDetectedCountry(foundCountry);
        } else {
          // Default to US if country not found in our list
          setDetectedCountry(
            countries?.find((c) => c.code === "US") || countries[0]
          );
        }
      } catch (err) {
        console.warn("Location detection failed:", err);
        setError("Failed to detect location");
        // Default to US on error
        setDetectedCountry(
          countries?.find((c) => c.code === "US") || countries[0]
        );
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  return { detectedCountry, isLoading, error };
};
