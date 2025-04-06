// Define constants for DOM elements
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#toSearch");
const searchList = document.querySelector("#searchList");
const searchBtn = document.querySelector(".btn");
const searchCity = document.querySelector("#searchCity");
const todayResult = document.querySelector("#today");
const fiveDaysResult = document.querySelector("#fiveDays");

let searchHistory = [];
const apiKey = "b1a68922cfde0b1d07bee887e415302e";

// Function to fetch and display weather data
async function getWeatherData(cityName) {
  todayResult.innerHTML = "";
  fiveDaysResult.innerHTML = "";

try {
    // Fetch latitude and longitude for the city
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();
    const cityInfo = geoData[0];

    if (!cityInfo) {
      throw new Error("City not found.");
    }

    // Fetch weather data for the city
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityInfo.lat}&lon=${cityInfo.lon}&exclude=minutely,hourly&units=imperial&appid=${apiKey}`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    displayCurrentWeather(weatherData, cityName);
    displayFiveDayForecast(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Error fetching weather data. Please try again.");
  }
}

// Function to display current weather
function displayCurrentWeather(weatherData, cityName) {
  const currentWeather = weatherData.current;
  const cityNameEl = document.createElement("h3");
  cityNameEl.textContent = `${cityName.toUpperCase()} ${moment.unix(currentWeather.sunrise).format("MMMM DD, YYYY")}`;

  const weatherIcon = document.createElement("img");
  weatherIcon.setAttribute("src", `https://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`);
  
  cityNameEl.append(weatherIcon);
  todayResult.append(cityNameEl);

  const temperature = document.createElement("p");
  const wind = document.createElement("p");
  const humidity = document.createElement("p");
  const uvi = document.createElement("p");

  temperature.textContent = `Temp: ${currentWeather.temp} °F`;
  wind.textContent = `Wind: ${currentWeather.wind_speed} MPH`;
  humidity.textContent = `Humidity: ${currentWeather.humidity} %`;
  uvi.textContent = `UV Index: ${currentWeather.uvi}`;

  todayResult.append(temperature, wind, humidity, uvi);
}

// Function to display the 5-day forecast
function displayFiveDayForecast(weatherData) {
  const fiveDaysEl = document.createElement("h3");
  fiveDaysEl.textContent = "Five Days Forecast";
  fiveDaysResult.append(fiveDaysEl);

  weatherData.daily.slice(0, 5).forEach(dayData => {
    const weatherCard = document.createElement("div");
    weatherCard.classList.add("fiveDaysForcast");

    const date = moment.unix(dayData.sunrise).format("MMMM DD, YYYY");
    const dateEl = document.createElement("p");
    dateEl.textContent = date;
    weatherCard.append(dateEl);

    const weatherIcon = document.createElement("img");
    weatherIcon.setAttribute("src", `https://openweathermap.org/img/w/${dayData.weather[0].icon}.png`);
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
}

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
