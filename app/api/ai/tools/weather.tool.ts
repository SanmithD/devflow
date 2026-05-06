import { DynamicTool } from "@langchain/core/tools";
import axios from "axios";
import { fetchWeatherApi } from "openmeteo";

export const weatherTool = new DynamicTool({
  name: "weather_search",
  description:
    "Get current weather using either a location name (e.g. 'Bangalore', 'Mumbai') or latitude and longitude.",

  func: async (input: string): Promise<any> => {
    try {
      let parsed: any;

      // Step 1: Parse safely (models sometimes send trash)
      try {
        parsed = JSON.parse(input);
      } catch {
        // fallback: assume raw string is location
        parsed = { location: input };
      }

      let lat = parsed.lat;
      let long = parsed.long;

      // 🌍 Step 2: If no lat/long → use geocoding
      if (!lat || !long) {
        if (!parsed.location) {
          return "Missing location or coordinates.";
        }

        const geoRes = await axios.get(
          "https://geocoding-api.open-meteo.com/v1/search",
          {
            params: {
              name: parsed.location,
              count: 1,
            },
          }
        );

        if (!geoRes.data.results || geoRes.data.results.length === 0) {
          return `Could not find location: ${parsed.location}`;
        }

        const place = geoRes.data.results[0];
        lat = place.latitude;
        long = place.longitude;

        parsed.location = place.name;
        parsed.country = place.country;
      }

      // 🌦️ Step 3: Fetch weather
      const params = {
        latitude: lat,
        longitude: long,
        current_weather: true,
      };

      const url = "https://api.open-meteo.com/v1/forecast";
      const responses = await fetchWeatherApi(url, params);

      const response = responses[0];
      const current = response.current();

      // Step 4: Return clean structured data
      return {
        location: parsed.location || "Unknown",
        country: parsed.country || "Unknown",
        latitude: lat,
        longitude: long,
        temperature: current?.variables(0)?.value(),
        windspeed: current?.variables(1)?.value(),
        weathercode: current?.variables(2)?.value(),
      };
    } catch (error) {
      console.error("WeatherTool error:", error);

      if (axios.isAxiosError(error)) {
        return `Weather fetch failed: ${error.message}`;
      }

      return `Weather fetch failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  },
});