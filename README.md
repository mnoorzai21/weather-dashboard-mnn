# Weather Dashboard: City Weather and Five-Day Forecast

A responsive weather app that shows the current conditions and a five-day forecast for any city, with your recent searches saved for one-click access.

**Live demo:** https://mnoorzai21.github.io/weather-dashboard-mnn/ (the backend runs on Render's free plan, so the first search after a quiet period can take up to a minute while the server wakes up)

![Weather Dashboard showing current weather, a five-day forecast, and search history for San Diego](docs/weather-dashboard.jpg)

## Features

- **City search:** look up current weather for any city in the world
- **Current conditions:** temperature, humidity, wind speed, and a weather description with an icon
- **Five-day forecast:** one card per day, picked from the forecast's 3-hour readings
- **Search history:** recent cities are saved in the browser, so one click searches again
- **Live date and time:** a clock in the header that updates every second
- **Responsive layout:** works on phones, tablets, and desktops

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Bootstrap 4.6
- **Backend:** Node.js, Express 5 (a small API that keeps the OpenWeatherMap key private)
- **Database:** None; search history is stored in the browser's localStorage
- **External API:** OpenWeatherMap (current weather and five-day forecast)
- **Testing & CI:** None yet
- **Hosting:** GitHub Pages (frontend), Render (backend)

## How It Works

```
Browser (GitHub Pages) ──/api/weather?city=…──▶ Express API (Render) ──▶ OpenWeatherMap
        │                                              │
   localStorage                              API key stays on the server
 (search history)
```

- **The API key never reaches the browser.** The frontend calls my Express server, and only the server talks to OpenWeatherMap with the key from an environment variable.
- **Waking the free server early.** Render's free plan sleeps when idle, so the page pings `/api/health` as soon as it loads; by the time the user types a city, the server is usually awake.
- **One request, two results.** The server fetches the current weather first, then uses that city's coordinates to fetch the five-day forecast, and returns both together.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A free [OpenWeatherMap](https://openweathermap.org/api) API key

### Install

```bash
git clone https://github.com/mnoorzai21/weather-dashboard-mnn.git
cd weather-dashboard-mnn
npm install
```

### Configure

Create a `.env` file in the project root (never commit it):

```env
OPENWEATHER_API_KEY=your_openweathermap_api_key
```

### Run

```bash
npm start
```

Open http://localhost:3000. Note: `API_BASE_URL` in `assets/script/script.js` points to the live Render API; change it to `http://localhost:3000` to use your local server instead.

### Test

No automated tests yet.

## Deployment

**Backend (Render):**
1. Create a **Web Service** from this repository.
2. Build command: `npm install`. Start command: `npm start`.
3. Add the environment variable `OPENWEATHER_API_KEY` in the Render dashboard.

**Frontend (GitHub Pages):**
1. In the repository, go to **Settings → Pages**.
2. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Make sure `API_BASE_URL` in `script.js` points to the Render service URL.

## What I Learned

- **Keeping an API key out of the browser.** At first the frontend called OpenWeatherMap directly, which exposed the key to anyone who opened DevTools. I added a small Express server that holds the key in an environment variable and forwards the requests.
- **Working around free-plan cold starts.** Render's free server sleeps when idle, so the first search could take a minute. Pinging a health endpoint as soon as the page loads wakes the server while the user is still typing.

## Author

**Mohammad Nabi Noorzai**

- GitHub: [@mnoorzai21](https://github.com/mnoorzai21)
- LinkedIn: [Mohammad Nabi Noorzai](https://linkedin.com/in/mnoorzai21)
- Portfolio: [mnoorzai.vercel.app](https://mnoorzai.vercel.app)