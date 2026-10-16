// ==============================
// DOM ELEMENTS
// ==============================

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#toSearch");
const searchList = document.querySelector("#searchList");
const todayResult = document.querySelector("#today");
const fiveDaysResult = document.querySelector("#fiveDays");

// ==============================
// VARIABLES
// ==============================

let searchHistory = [];

// Keep the history list short so the sidebar stays tidy
const MAX_HISTORY = 8;

// Counts searches so a slow, older response can't
// overwrite the result of a newer search
let latestRequestId = 0;

// Backend API (hosted on Render)
const API_BASE_URL = "https://weather-dashboard-mnn.onrender.com";

// ==============================
// WAKE UP BACKEND
// ==============================

// Render's free tier puts the server to sleep when idle.
// Ping it as soon as the page loads so it is awake
// by the time the user searches for a city.
function wakeUpServer() {
  fetch(`${API_BASE_URL}/api/health`).catch(() => {
    // Ignore errors here; the search request will report any problem
  });
}

// ==============================
// GET WEATHER DATA
// ==============================

async function getWeatherData(cityName) {
  const requestId = ++latestRequestId;

  // Show a loading message while waiting for the server
  showMessage(`Loading weather for ${cityName}...`);
  fiveDaysResult.innerHTML = "";

  // If the server is still waking up, let the user know
  const slowTimer = setTimeout(() => {
    if (requestId === latestRequestId) {
      showMessage(
        "Waking up the weather server, this can take up to a minute the first time...",
      );
    }
  }, 4000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/weather?city=${encodeURIComponent(cityName)}`,
    );

    const data = await response.json();

    // A newer search has started; ignore this result
    if (requestId !== latestRequestId) {
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Unable to get weather data.");
    }

    displayWeather(data.weatherData, data.forecastData);

    // Only save cities that were actually found,
    // using the official name from the API
    addToSearchHistory(data.weatherData.name);
  } catch (error) {
    if (requestId !== latestRequestId) {
      return;
    }

    console.error(error);

    showMessage(capitalize(error.message));
    fiveDaysResult.innerHTML = "";
  } finally {
    clearTimeout(slowTimer);
  }
}

// Show a status or error message in the today section
function showMessage(text) {
  const messageEl = document.createElement("p");

  messageEl.textContent = text;

  todayResult.replaceChildren(messageEl);
}

// ==============================
// DATE HELPERS
// ==============================

// OpenWeather gives times in UTC plus the city's offset
// (in seconds). Shifting by the offset and reading the
// result as UTC gives the time *in that city*, no matter
// where the person viewing the page is.
function toCityTime(unixSeconds, offsetSeconds) {
  return new Date((unixSeconds + offsetSeconds) * 1000);
}

// YYYY-MM-DD in the city's local time
function cityDateKey(unixSeconds, offsetSeconds) {
  return toCityTime(unixSeconds, offsetSeconds).toISOString().slice(0, 10);
}

function formatCityDate(unixSeconds, offsetSeconds, options) {
  return toCityTime(unixSeconds, offsetSeconds).toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
}

// ==============================
// DISPLAY WEATHER
// ==============================

function displayWeather(currentWeatherData, forecastData) {
  // =========================
  // CLEAR PREVIOUS WEATHER
  // =========================

  todayResult.innerHTML = "";
  fiveDaysResult.innerHTML = "";

  // =========================
  // TODAY'S WEATHER
  // =========================

  const currentWeather = currentWeatherData.main;
  const currentCondition = currentWeatherData.weather[0];
  const cityOffset = currentWeatherData.timezone;
  const nowSeconds = Math.floor(Date.now() / 1000);

  // Today's date in the searched city
  const formattedToday = formatCityDate(nowSeconds, cityOffset, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // City
  const cityNameEl = document.createElement("h3");

  cityNameEl.textContent = `${currentWeatherData.name} - ${formattedToday}`;

  todayResult.append(cityNameEl);

  // Weather description
  const descriptionEl = document.createElement("p");

  descriptionEl.textContent = capitalize(currentCondition.description);

  todayResult.append(descriptionEl);

  // Weather icon
  const weatherIcon = document.createElement("img");

  weatherIcon.src = `https://openweathermap.org/img/wn/${currentCondition.icon}@2x.png`;

  weatherIcon.alt = currentCondition.description;

  todayResult.append(weatherIcon);

  // Temperature
  const temperature = document.createElement("p");

  temperature.textContent = `Temp: ${Math.round(currentWeather.temp)} °F`;

  todayResult.append(temperature);

  // Wind
  const wind = document.createElement("p");

  wind.textContent = `Wind: ${Math.round(currentWeatherData.wind.speed)} MPH`;

  todayResult.append(wind);

  // Humidity
  const humidity = document.createElement("p");

  humidity.textContent = `Humidity: ${currentWeather.humidity}%`;

  todayResult.append(humidity);

  // =========================
  // FIND ONE FORECAST PER DAY
  // =========================

  // The forecast API returns a reading every 3 hours.
  // For each upcoming day (skipping today), keep the
  // reading closest to midday so it reflects daytime weather.
  const forecastOffset = forecastData.city?.timezone ?? cityOffset;
  const todayKey = cityDateKey(nowSeconds, forecastOffset);
  const middayByDate = new Map();

  forecastData.list.forEach((reading) => {
    const dateKey = cityDateKey(reading.dt, forecastOffset);

    if (dateKey === todayKey) {
      return;
    }

    const hour = toCityTime(reading.dt, forecastOffset).getUTCHours();
    const distanceFromNoon = Math.abs(hour - 12);
    const saved = middayByDate.get(dateKey);

    if (!saved || distanceFromNoon < saved.distanceFromNoon) {
      middayByDate.set(dateKey, { reading, distanceFromNoon });
    }
  });

  const dailyForecasts = [...middayByDate.values()].map(
    (entry) => entry.reading,
  );

  // =========================
  // DISPLAY FIVE DAYS
  // =========================

  dailyForecasts.slice(0, 5).forEach((dayData) => {
    // Forecast Card
    const weatherCard = document.createElement("div");

    weatherCard.classList.add("fiveDaysForecast");

    // Date
    const dateEl = document.createElement("p");

    dateEl.textContent = formatCityDate(dayData.dt, forecastOffset, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    weatherCard.append(dateEl);

    // Weather Icon
    const dayIcon = document.createElement("img");

    dayIcon.src = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`;

    dayIcon.alt = dayData.weather[0].description;

    weatherCard.append(dayIcon);

    // Temperature
    const temp = document.createElement("strong");

    temp.textContent = `${Math.round(dayData.main.temp)} °F`;

    weatherCard.append(temp);

    // Weather Description
    const description = document.createElement("span");

    description.textContent = capitalize(dayData.weather[0].description);

    weatherCard.append(description);

    // Wind
    const wind = document.createElement("p");

    wind.textContent = `Wind: ${Math.round(dayData.wind.speed)} MPH`;

    weatherCard.append(wind);

    // Humidity
    const humidity = document.createElement("p");

    humidity.textContent = `Humidity: ${dayData.main.humidity}%`;

    weatherCard.append(humidity);

    // Add card to forecast
    fiveDaysResult.append(weatherCard);
  });
}

// "light rain" -> "Light rain"
function capitalize(text) {
  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ==============================
// SEARCH FORM
// ==============================

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchValue = searchInput.value.trim();

  if (!searchValue) {
    return;
  }

  getWeatherData(searchValue);

  // Clear input
  searchInput.value = "";
});

// ==============================
// SEARCH HISTORY
// ==============================

function addToSearchHistory(city) {
  // Remove any existing copy (case-insensitive) so the
  // city moves to the top instead of appearing twice
  searchHistory = searchHistory.filter(
    (savedCity) => savedCity.toLowerCase() !== city.toLowerCase(),
  );

  searchHistory.unshift(city);
  searchHistory = searchHistory.slice(0, MAX_HISTORY);

  updateSearchHistory();
}

function updateSearchHistory() {
  searchList.innerHTML = "";

  searchHistory.forEach((city) => {
    const savedCityBtn = document.createElement("button");

    savedCityBtn.textContent = city;

    savedCityBtn.type = "button";

    savedCityBtn.addEventListener("click", function () {
      getWeatherData(city);
    });

    searchList.append(savedCityBtn);
  });

  // Save history (storage can be unavailable, e.g. private browsing)
  try {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  } catch (error) {
    console.warn("Could not save search history.", error);
  }
}

// ==============================
// INITIALIZE APP
// ==============================

function loadSearchHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem("searchHistory"));

    if (Array.isArray(saved)) {
      return saved.filter((city) => typeof city === "string");
    }
  } catch (error) {
    console.warn("Could not read search history.", error);
  }

  return [];
}

function init() {
  wakeUpServer();

  searchHistory = loadSearchHistory().slice(0, MAX_HISTORY);

  updateSearchHistory();
}

// ==============================
// START APP
// ==============================

init();
