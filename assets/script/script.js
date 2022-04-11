// declare my variables
var searchForm = document.querySelector("#searchForm");
var searchInput = document.querySelector("#toSearch");
var searchCount = document.querySelector("#search-count");
var searchList = document.querySelector("#searchList");
var searchBtn = document.querySelector(".btn");
var searchCity = document.querySelector("#searchCity");
var todayResult = document.querySelector("#today");
var fiveDays = document.querySelector("#fiveDays");

var search = [];
var apiKey = "b1a68922cfde0b1d07bee887e415302e";

function getWeatherUpdate(cityName) {

    todayResult.innerHTML = "";
    fiveDays.innerHTML = "";
    // make request to the weather website
    var requesLatLontUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' +
        cityName + ',US&limit=5&appid=' + apiKey;
    // request fetch function for the weather
    fetch(requesLatLontUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var cityInfo = data[0];
            var weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' +
                cityInfo.lat + '&lon=' + cityInfo.lon +
                '&exclude=hourly,minutely,units,alerts&appid=' +
                apiKey;
        });

    fetch(weatherUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(forecostDay) {

                var cityName = document.createElement("h3");
                cityName.textContent = cityName.toUpperCase() + " " + moment.unix(forecostDay.current.sunrise).format("MMMM DD, YYYY");
                var weatherIcon = document.createElement("img");
                weatherIcon.setAttribute(src = 'http://openweathermap.org/img/wn/' + forecostDay.current.weather[0].icon + '.png');
                cityName.append(weatherIcon);
                todayResult.append(cityName);

                var temperature = document.createElement("p");
                var wind = document.createElement("p");
                var humidity = document.createElement("p");
                var uvi = document.createElement("p");

                temperature.textContent = "Temp: " + forecostDay.current.temp + " F";
                wind.textContent = "Wind " + forecostDay.current.wind_speed + " MPH";
                humidity.textContent = "Humidity: " + forecostDay.current.humidity + " %";
                uvi.textContent = "UV Index: " + forecostDay.current.uvi;

                todayResult.append(temperature);
                todayResult.append(wind);
                todayResult.append(humidity);
                todayResult.append(uvi);

                var fiveDaysResult = document.createElement("h3");
                fiveDaysResult.textContent = "Five Days Forecast";
                fiveDays.append(fiveDaysResult);

                for (var i = 0; i < 5; i++) {
                    var nextDayWeather = forecostDay.daily[i];
                    var nextDayWeatherCard = document.createElement("p");
                    nextDayWeatherCard.style.width = "18%";

                    var date = moment.(nextDayWeather.sunrise).format("MMMM DD, YYYY");
                    nextDayWeatherCard.append(date);
                    var weatherIcon = document.createElement("img");
                    weatherIcon.setAttribute("src", " http://openweathermap.org/img/w/" + nextDayWeather.weather[0].icon + ".png");


                }
                // response function
                // get the response from the weather website
                // request function for the lat and lon
                // make request to the weather website
                // connect it to the search button
                // add one city for now
                // display it to the user














                // save to local storage

                // function saveHistory() {
                //     searchList.innerHTML = "";

                //     for (var i = 0; i < search.length; i++) {
                //         var toSearch = search[i];

                //         var li = document.createElement("li");
                //         li.textContent = toSearch;
                //         li.setAttribute("data-index", i);

                //         var button = document.createElement("button");
                //         button.textContent = "";

                //         searchList.appendChild(li);
                //     }
                // }

                // function init() {

                //     var saveSearch = JSON.parse(localStorage.getItem("search"));

                //     if (saveSearch) {
                //         search = saveSearch;
                //     }
                //     saveHistory();
                // }

                // function saveSearch() {

                //     localStorage.setItem("search", JSON.stringify(search));
                // }
                // searchForm.addEventListener("submit", function(event) {
                //     event.preventDefault();

                //     var searchText = searchInput.value.trim();

                //     if (searchText === "") {
                //         return;
                //     }
                //     search.push(searchText);
                //     searchInput.value = "";

                //     saveSearch();
                //     saveHistory();
                // });
                // init();