// declare my variables
var searchForm = document.querySelector("#searchForm");
var searchInput = document.querySelector("#toSearch");
var searchList = document.querySelector("#searchList");
var searchBtn = document.querySelector(".btn");
var searchCity = document.querySelector("#searchCity");
var todayResult = document.querySelector("#today");
var fiveDays = document.querySelector("#fiveDays");

var search = [];
var apiKey = "b1a68922cfde0b1d07bee887e415302e";

function weatherUpdate(cityName) {

    todayResult.innerHTML = "";
    fiveDays.innerHTML = "";

    var requesLatLontUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' +
        cityName + '&limit=5&appid=' + apiKey;

    fetch(requesLatLontUrl)
        .then(function(response) {
            return response.json();
        })

    .then(function(data) {
        var cityInfo = data[0];
        var weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' +
            cityInfo.lat +
            '&lon=' +
            cityInfo.lon +
            '&exclude=minutely,hourly&units=imperial&appid=' +
            apiKey;

        fetch(weatherUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(forecastDay) {
                var cityNameEl = document.createElement("h3");
                cityNameEl.textContent =
                    cityName.toUpperCase() +
                    " " +
                    moment.unix(forecastDay.current.sunrise).format("MMMM DD, YYYY");
                var weatherIcon = document.createElement("img");
                weatherIcon.setAttribute(
                    "src",
                    "https://openweathermap.org/img/w/" +
                    forecastDay.current.weather[0].icon +
                    ".png"
                );

                cityNameEl.append(weatherIcon);
                todayResult.append(cityNameEl);

                var temperature = document.createElement("p");
                var wind = document.createElement("p");
                var humidity = document.createElement("p");
                var uvi = document.createElement("p");

                temperature.textContent = "Temp: " + forecastDay.current.temp + " F " + " ";
                wind.textContent = " Wind: " + forecastDay.current.wind_speed + " MPH ";
                humidity.textContent = " Humidity: " + forecastDay.current.humidity + " % ";
                uvi.textContent = "UV Index: " + forecastDay.current.uvi;

                todayResult.append(temperature);
                todayResult.append(wind);
                todayResult.append(humidity);
                todayResult.append(uvi);

                var fiveDaysResult = document.createElement("h3");
                fiveDaysResult.textContent = "Five Days Forecast";
                fiveDays.append(fiveDaysResult);

                for (var i = 0; i < 5; i++) {
                    var nextDayWeather = forecastDay.daily[i];
                    var nextDayWeatherCard = document.createElement("p");
                    nextDayWeatherCard.style.width = "30%";

                    var date = moment.unix(nextDayWeather.sunrise).format("MMMM DD, YYYY");
                    nextDayWeatherCard.append(date);
                    var weatherIcon = document.createElement("img");
                    weatherIcon.setAttribute("src", " http://openweathermap.org/img/w/" + nextDayWeather.weather[0].icon + ".png");

                    nextDayWeatherCard.append(weatherIcon);
                    var temp = document.createElement("p");
                    temp.textContent = "Temp: " + nextDayWeather.temp.day + " F ";
                    nextDayWeatherCard.append(temp);

                    var wind = document.createElement("p");
                    wind.textContent = "Wind: " + nextDayWeather.wind_speed + " MPH ";
                    nextDayWeatherCard.append(wind);

                    var humidity = document.createElement("p");
                    humidity.textContent =
                        "Humidty: " + nextDayWeather.humidity + " %";
                    nextDayWeatherCard.append(humidity);

                    fiveDays.append(nextDayWeatherCard);
                }
            });
    });
}

searchBtn.addEventListener("click", function(event) {
    event.preventDefault();

    var searchValue = searchInput.value.trim();
    if (!searchValue) {
        return;
    }

    search.push(searchValue);
    weatherUpdate(searchValue);
    saveHistory();
    searchInput.value = '';
});


function init() {

    var saveSearch = JSON.parse(localStorage.getItem("search"));

    if (saveSearch) {
        search = saveSearch;
    }
    saveHistory();
}

function saveHistory() {
    searchList.innerHTML = "";

    for (var i = search.length - 1; i >= 0; i--) {

        var toSearch = search[i];

        var savedCity = document.createElement("button");

        savedCity.textContent = toSearch;
        savedCity.setAttribute("data-index", toSearch);

        savedCity.addEventListener("click", function() {

            var searchCity = this.getAttribute("data-index");
            weatherUpdate(searchCity);
        });
        searchList.append(savedCity);
    }

    localStorage.setItem("search", JSON.stringify(search));
}
init();