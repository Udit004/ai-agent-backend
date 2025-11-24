import axios from "axios";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = tool(
  async ({ location }) => {
    try {
      if (!location) return "City name missing";

      // Step 1: Get coordinates from city name
      const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        location
      )}`;
      const geoRes = await axios.get(geoURL);

      if (!geoRes.data.results?.length)
        return `City not found: ${location}`;

      const { latitude, longitude, name, country } = geoRes.data.results[0];

      // Step 2: Get detailed weather data with additional parameters
      const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum,precipitation_probability_max&timezone=auto`;
      
      const weatherRes = await axios.get(weatherURL);

      // Step 3: Get Air Quality Index (AQI) data
      const aqiURL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi`;
      
      let aqiData = null;
      try {
        const aqiRes = await axios.get(aqiURL);
        aqiData = aqiRes.data.current;
      } catch (aqiError) {
        console.log("AQI data unavailable:", aqiError.message);
      }

      // Step 4: Format weather condition based on weather code
      const weatherConditions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
      };

      const current = weatherRes.data.current;
      const daily = weatherRes.data.daily;

      // Step 5: Construct comprehensive weather response
      const weatherData = {
        location: {
          city: name,
          country: country,
          coordinates: {
            latitude: latitude.toFixed(4),
            longitude: longitude.toFixed(4)
          }
        },
        current: {
          temperature: `${current.temperature_2m}°C`,
          feelsLike: `${current.apparent_temperature}°C`,
          humidity: `${current.relative_humidity_2m}%`,
          condition: weatherConditions[current.weather_code] || "Unknown",
          weatherCode: current.weather_code,
          isDay: current.is_day === 1 ? "Day" : "Night",
          cloudCover: `${current.cloud_cover}%`,
          precipitation: `${current.precipitation} mm`,
          rain: `${current.rain} mm`,
          showers: `${current.showers} mm`,
          snowfall: `${current.snowfall} cm`,
          pressure: `${current.pressure_msl} hPa`,
          wind: {
            speed: `${current.wind_speed_10m} km/h`,
            direction: `${current.wind_direction_10m}°`,
            gusts: `${current.wind_gusts_10m} km/h`
          }
        },
        forecast: {
          today: {
            maxTemp: `${daily.temperature_2m_max[0]}°C`,
            minTemp: `${daily.temperature_2m_min[0]}°C`,
            sunrise: daily.sunrise[0],
            sunset: daily.sunset[0],
            totalPrecipitation: `${daily.precipitation_sum[0]} mm`,
            totalRain: `${daily.rain_sum[0]} mm`,
            precipitationProbability: `${daily.precipitation_probability_max[0]}%`
          }
        },
        airQuality: aqiData ? {
          europeanAQI: aqiData.european_aqi,
          usAQI: aqiData.us_aqi,
          pm2_5: `${aqiData.pm2_5} μg/m³`,
          pm10: `${aqiData.pm10} μg/m³`,
          carbonMonoxide: `${aqiData.carbon_monoxide} μg/m³`,
          nitrogenDioxide: `${aqiData.nitrogen_dioxide} μg/m³`,
          sulphurDioxide: `${aqiData.sulphur_dioxide} μg/m³`,
          ozone: `${aqiData.ozone} μg/m³`,
          quality: getAQIQuality(aqiData.us_aqi)
        } : {
          message: "Air quality data unavailable"
        },
        timestamp: current.time
      };

      return JSON.stringify(weatherData, null, 2);

    } catch (error) {
      return `Weather API failed: ${error.message}`;
    }
  },
  {
    name: "getWeather",
    description: "Get comprehensive weather information for ANY city including current conditions, temperature, humidity, precipitation, wind, air quality, AND daily forecast (max/min temp, sunrise/sunset, precipitation probability). Use this for ALL weather queries including 'current weather', 'tomorrow's weather', 'forecast', 'will it rain', etc.",
    schema: z.object({
      location: z.string().describe("The city name to get weather for (e.g., 'London', 'New York', 'Tokyo')"),
    }),
  }
);

// Helper function to interpret AQI values
function getAQIQuality(aqi) {
  if (!aqi) return "Unknown";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}
