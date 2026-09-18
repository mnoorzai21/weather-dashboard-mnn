require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const API_KEY = process.env.OPENWEATHER_API_KEY;

// Serve your website files
app.use(express.static(__dirname));

// Weather API
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({
      message: "City is required.",
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
