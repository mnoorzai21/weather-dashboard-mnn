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

// ==============================
// GET WEATHER DATA
// ==============================

async function getWeatherData(cityName) {
  try {
    const response = await fetch(
      `/api/weather?city=${encodeURIComponent(cityName)}`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to get weather data.");
    }

    displayWeather(data.weatherData, data.forecastData);
  } catch (error) {
    console.error(error);

    todayResult.innerHTML = `<p>${error.message}</p>`;
    fiveDaysResult.innerHTML = "";
  }
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

  // Today's date
  const today = new Date();

  const formattedToday = today.toLocaleDateString("en-US", {
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

  descriptionEl.textContent = currentCondition.description;

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
  // 5-DAY FORECAST
  // =========================

  // Clear previous forecast
  fiveDaysResult.innerHTML = "";

  // =========================
  // FIND ONE FORECAST PER DAY
  // =========================

  const dailyForecasts = [];
  const usedDates = new Set();

  forecastData.list.forEach((dayData) => {
    // Convert OpenWeather timestamp
    // into JavaScript Date object
    const forecastDate = new Date(dayData.dt * 1000);

    // Get YYYY-MM-DD
    const dateKey = forecastDate.toLocaleDateString("en-CA");

    // Only keep the first forecast for each day
    if (!usedDates.has(dateKey)) {
      usedDates.add(dateKey);

      dailyForecasts.push(dayData);
    }
  });

  // =========================
  // DISPLAY FIVE DAYS
  // =========================

  dailyForecasts.slice(0, 5).forEach((dayData) => {
    // =========================
    // Forecast Card
    // =========================

    const weatherCard = document.createElement("div");

    weatherCard.classList.add("fiveDaysForecast");

    // =========================
    // Date
    // =========================

    const forecastDate = new Date(dayData.dt * 1000);

    const dateEl = document.createElement("p");

    dateEl.textContent = forecastDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    weatherCard.append(dateEl);

    // =========================
    // Weather Icon
    // =========================

    const dayIcon = document.createElement("img");

    dayIcon.src = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`;

    dayIcon.alt = dayData.weather[0].description;

    weatherCard.append(dayIcon);

    // =========================
    // Temperature
    // =========================

    const temp = document.createElement("p");

    temp.textContent = `${Math.round(dayData.main.temp)} °F`;

    weatherCard.append(temp);

    // =========================
    // Weather Description
    // =========================

    const description = document.createElement("span");

    description.textContent = dayData.weather[0].description;

    weatherCard.append(description);

    // =========================
    // Wind
    // =========================

    const wind = document.createElement("p");

    wind.textContent = `Wind: ${Math.round(dayData.wind.speed)} MPH`;

    weatherCard.append(wind);

    // =========================
    // Humidity
    // =========================

    const humidity = document.createElement("p");

    humidity.textContent = `Humidity: ${dayData.main.humidity}%`;

    weatherCard.append(humidity);

    // Add card to forecast
    fiveDaysResult.append(weatherCard);
  });
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

  // Get weather
  getWeatherData(searchValue);

  // Add city to search history
  if (!searchHistory.includes(searchValue)) {
    searchHistory.push(searchValue);

    updateSearchHistory();
  }

  // Clear input
  searchInput.value = "";
});

// ==============================
// SEARCH HISTORY
// ==============================

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

  // Save history
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

// ==============================
// INITIALIZE APP
// ==============================

function init() {
  const savedSearchHistory = JSON.parse(localStorage.getItem("searchHistory"));

  if (savedSearchHistory) {
    searchHistory = savedSearchHistory;
  }

  updateSearchHistory();
}

// ==============================
// START APP
// ==============================

init();
