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

    // Check if the response contains valid data
    if (!weatherData || weatherData.cod !== 200) {
      throw new Error("Error fetching weather data.");
    }

    console.log("Weather Data:", weatherData); // Log the response to inspect the data

    // Now fetch the 5-day forecast using the onecall endpoint
    const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}&units=imperial`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

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
  cityNameEl.textContent = `${currentWeatherData.name.toUpperCase()} - ${weatherDescription}`;

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

  temperature.textContent = `Temp: ${currentWeather.temp} °F`;
  wind.textContent = `Wind: ${currentWeatherData.wind.speed} MPH`;
  humidity.textContent = `Humidity: ${currentWeather.humidity} %`;

  todayResult.append(temperature, wind, humidity);

  // Display 5-Day Forecast
  const fiveDaysEl = document.createElement("h3");
  fiveDaysEl.textContent = "Five Days Forecast";
  fiveDaysResult.append(fiveDaysEl);

  if (forecastData.daily && forecastData.daily.length > 0) {
    forecastData.daily.slice(0, 5).forEach((dayData) => {
      const weatherCard = document.createElement("div");
      weatherCard.classList.add("fiveDaysForcast");

      const date = moment.unix(dayData.dt).format("MMMM DD, YYYY");
      const dateEl = document.createElement("p");
      dateEl.textContent = date;
      weatherCard.append(dateEl);

      const weatherIcon = document.createElement("img");
      weatherIcon.setAttribute(
        "src",
        `https://openweathermap.org/img/w/${dayData.weather[0].icon}.png`
      );
      weatherCard.append(weatherIcon);

      const temp = document.createElement("p");
      temp.textContent = `Temp: ${dayData.temp.day} °F`;
      weatherCard.append(temp);

      const wind = document.createElement("p");
      wind.textContent = `Wind: ${dayData.wind_speed} MPH`;
      weatherCard.append(wind);

      const humidity = document.createElement("p");
      humidity.textContent = `Humidity: ${dayData.humidity} %`;
      weatherCard.append(humidity);

      fiveDaysResult.append(weatherCard);
    });
  } else {
    fiveDaysResult.innerHTML = "<p>No forecast data available.</p>";
  }
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
