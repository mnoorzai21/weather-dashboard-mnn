// Define constants for DOM elements
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#toSearch");
const searchList = document.querySelector("#searchList");
const searchBtn = document.querySelector(".btn");
const todayResult = document.querySelector("#today");
const fiveDaysResult = document.querySelector("#fiveDays");

let searchHistory = [];
const apiKey = "b1a68922cfde0b1d07bee887e415302e";

// Function to fetch and display weather data
async function getWeatherData(cityName) {
  todayResult.innerHTML = "";
  fiveDaysResult.innerHTML = "";

  try {
    // Fetch weather data using the city name and country (optional)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // Log the weather data to inspect the structure
    console.log("Current Weather Data:", weatherData);

    // Check if the response contains valid data
    if (!weatherData || weatherData.cod !== 200) {
      throw new Error("Error fetching weather data.");
    }

    // Now fetch the 5-day forecast using the 5-day endpoint (not onecall)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}&units=imperial`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    // Log the forecast data to inspect the structure
    console.log("5-Day Forecast Data:", forecastData);

    // Call the function to display both current weather and the 5-day forecast
    displayWeather(weatherData, forecastData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Error fetching weather data. Please try again.");
  }
}

// Function to display both current weather and 5-day forecast
function displayWeather(currentWeatherData, forecastData) {
  // Display Current Weather
  const currentWeather = currentWeatherData.main;
  const weatherDescription = currentWeatherData.weather[0].description;

  const cityNameEl = document.createElement("h3");

  // Get the current date and format it
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString(); // Format it as needed

  cityNameEl.textContent = `${currentWeatherData.name.toUpperCase()} - ${weatherDescription} (${dateString})`;

  // Add weather icon
  const weatherIcon = document.createElement("img");
  weatherIcon.setAttribute(
    "src",
    `https://openweathermap.org/img/w/${currentWeatherData.weather[0].icon}.png`
  );

  cityNameEl.append(weatherIcon);
  todayResult.append(cityNameEl);

  const temperature = document.createElement("p");
  const wind = document.createElement("p");
  const humidity = document.createElement("p");

  // Ensure the properties exist before accessing them
  if (currentWeather) {
    temperature.textContent = `Temp: ${currentWeather.temp} °F`;
    wind.textContent = `Wind: ${currentWeatherData.wind.speed} MPH`;
    humidity.textContent = `Humidity: ${currentWeather.humidity} %`;
  } else {
    temperature.textContent = "Temperature data not available.";
    wind.textContent = "Wind data not available.";
    humidity.textContent = "Humidity data not available.";
  }

  todayResult.append(temperature, wind, humidity);

  // Display 5-Day Forecast
  const fiveDaysEl = document.createElement("h3");
  fiveDaysEl.textContent = "Five Days Forecast";
  fiveDaysResult.append(fiveDaysEl);

  if (forecastData.list && forecastData.list.length > 0) {
    forecastData.list.slice(0, 5).forEach((dayData) => {
      const weatherCard = document.createElement("div");
      weatherCard.classList.add("fiveDaysForcast");

      // Format the date properly
      const date = moment.unix(dayData.dt).format("MMMM DD, YYYY"); // Ensure the format string is correct
      const dateEl = document.createElement("p");
      dateEl.textContent = date;

      // Append the formatted date to the weather card
      weatherCard.append(dateEl);

      // Add weather icon
      const dayIcon = document.createElement("img");
      dayIcon.setAttribute(
        "src",
        `https://openweathermap.org/img/w/${dayData.weather[0].icon}.png`
      );
      weatherCard.append(dayIcon);

      // Add temperature details
      const temp = document.createElement("p");
      temp.textContent = `Temp: ${dayData.main.temp} °F`;
      weatherCard.append(temp);

      // Add wind speed
      const wind = document.createElement("p");
      wind.textContent = `Wind: ${dayData.wind.speed} MPH`;
      weatherCard.append(wind);

      // Add humidity details
      const humidity = document.createElement("p");
      humidity.textContent = `Humidity: ${dayData.main.humidity} %`;
      weatherCard.append(humidity);

      // Append the weather card to the forecast section
      fiveDaysResult.append(weatherCard);
    });
  } else {
    fiveDaysResult.innerHTML = "<p>No forecast data available.</p>";
  }
}

// Function to fetch 5-day forecast data
async function fetchForecastData(coord) {
  const apiKey = "your_api_key_here"; // Make sure to use the correct API key for forecast data
  const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=hourly,minutely&appid=${apiKey}&units=imperial`;

  const response = await fetch(forecastUrl);
  const forecastData = await response.json();

  return forecastData;
}

// Function to handle the search button click event
searchBtn.addEventListener("click", function (event) {
  event.preventDefault();

  const searchValue = searchInput.value.trim();
  if (!searchValue) {
    return;
  }

  searchHistory.push(searchValue);
  getWeatherData(searchValue);
  updateSearchHistory();
  searchInput.value = "";
});

// Initialize app and load search history from localStorage
function init() {
  const savedSearchHistory = JSON.parse(localStorage.getItem("searchHistory"));

  if (savedSearchHistory) {
    searchHistory = savedSearchHistory;
  }
  updateSearchHistory();
}

// Update the search history in the UI and localStorage
function updateSearchHistory() {
  searchList.innerHTML = "";

  searchHistory.forEach((city) => {
    const savedCityBtn = document.createElement("button");
    savedCityBtn.textContent = city;
    savedCityBtn.setAttribute("data-index", city);

    savedCityBtn.addEventListener("click", function () {
      const cityName = this.getAttribute("data-index");
      getWeatherData(cityName);
    });

    searchList.append(savedCityBtn);
  });

  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

// Initialize the app
init();
