require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const API_KEY = process.env.OPENWEATHER_API_KEY;

// Serve only the website files (not server.js, package.json, etc.)
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Lightweight endpoint the frontend calls on page load
// to wake the server up (Render free tier sleeps when idle)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Weather API
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  // Repeated ?city= params arrive as an array, so require a single string
  if (typeof city !== "string" || !city.trim()) {
    return res.status(400).json({
      message: "City is required.",
    });
  }

  if (!API_KEY) {
    console.error("OPENWEATHER_API_KEY is not set.");

    return res.status(500).json({
      message: "Weather service is not configured.",
    });
  }

  try {
    // Get current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=imperial`,
    );

    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) {
      return res.status(weatherResponse.status).json(weatherData);
    }

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}&units=imperial`,
    );

    const forecastData = await forecastResponse.json();

    if (!forecastResponse.ok) {
      return res.status(forecastResponse.status).json(forecastData);
    }

    res.json({
      weatherData,
      forecastData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to get weather data.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
});
