import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = process.env.REACT_APP_OPENWEATHER_KEY;
const DEFAULT_CITY = 'Bengaluru';

function App() {
  const [displayName, setDisplayName] = useState(DEFAULT_CITY);
  const [lastCoords, setLastCoords] = useState(null); 
  const [lastCity, setLastCity] = useState(DEFAULT_CITY);   
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [units, setUnits] = useState('metric');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchRef = useRef(null);
  const hasLoaded = useRef(false);


  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const initLocation = async () => {
      if (!navigator.geolocation) {
        await fetchWeatherByCity(DEFAULT_CITY);
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLastCoords({ lat: latitude, lon: longitude });

          try {
            const geoRes = await axios.get(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            );
            const city = geoRes.data[0];
            setDisplayName(city ? `${city.name}, ${city.country}` : `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
          } catch {
            setDisplayName(`Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
          }

          await fetchWeatherByCoords(latitude, longitude);
          setLoading(false);
        },
        async () => {
          setError(`Location denied. Showing ${DEFAULT_CITY}.`);
          setLastCity(DEFAULT_CITY);
          await fetchWeatherByCity(DEFAULT_CITY);
          setLoading(false);
        }
      );
    };

    initLocation();
  }, []);

  
  useEffect(() => {
    if (!hasLoaded.current) return;

    if (lastCoords) {
      fetchWeatherByCoords(lastCoords.lat, lastCoords.lon);
    } else if (lastCity) {
      fetchWeatherByCity(lastCity);
    }
  }, [units]);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`)
      ]);

      setWeather(currentRes.data);
      const daily = forecastRes.data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
      setForecast(daily);
      setError('');
    } catch {
      setError('Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${API_KEY}`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${API_KEY}`)
      ]);

      setWeather(currentRes.data);
      const daily = forecastRes.data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
      setForecast(daily);
      setError('');
    } catch {
      setError('City not found');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (searchInput.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(() => {
      axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${searchInput}&limit=6&appid=${API_KEY}`)
        .then(res => {
          setSuggestions(res.data);
          setShowSuggestions(true);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectCity = (city) => {
    setLastCoords(null);
    setLastCity(city.name);
    setDisplayName(`${city.name}, ${city.country}`);
    fetchWeatherByCity(city.name);
    setSearchInput('');
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const city = searchInput.trim().split(',')[0];
      setLastCoords(null);
      setLastCity(city);
      setDisplayName(searchInput.trim());
      fetchWeatherByCity(city);
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLastCoords({ lat: latitude, lon: longitude });
        setLastCity(null);

        try {
          const res = await axios.get(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
          );
          const city = res.data[0];
          setDisplayName(city ? `${city.name}, ${city.country}` : `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
        } catch {
          setDisplayName(`Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
        }
        await fetchWeatherByCoords(latitude, longitude);
        setLoading(false);
      },
      () => {
        setError('Location denied');
        setLoading(false);
      }
    );
  };

  return (
    <div className={`app ${theme}`}>
      <div className="container">
        <div className="top-bar">
          <button onClick={getCurrentLocation} className="location-btn">Current Location</button>
          <div className="right-controls">
            <button onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')} className="unit-btn">
              {units === 'metric' ? 'Switch to °F' : 'Switch to °C'}
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="theme-btn">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>

        <div className="search-section" ref={searchRef}>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-submit">Search</button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-box">
              {suggestions.map((city) => (
                <div key={`${city.lat}-${city.lon}`} className="suggestion-item" onClick={() => selectCity(city)}>
                  <span className="city-name">{city.name}</span>
                  {city.state && <span className="state">, {city.state}</span>}
                  <span className="country">, {city.country}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="message error">{error}</div>}
        {loading && <div className="message loading">Loading weather...</div>}

        {weather && !loading && (
          <div className="weather-card">
            <div className="location">
              <h2>{displayName}</h2>
            </div>
            <div className="weather-main">
              <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="" className="weather-icon-small" />
              <div className="temp-big">{Math.round(weather.main.temp)}°</div>
            </div>
            <p className="condition">
              {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
            </p>
            <div className="weather-details">
              <div className="detail"><span>Feels like</span><strong>{Math.round(weather.main.feels_like)}°</strong></div>
              <div className="detail"><span>Humidity</span><strong>{weather.main.humidity}%</strong></div>
              <div className="detail"><span>Wind</span><strong>{Math.round(weather.wind.speed * (units === 'metric' ? 3.6 : 2.237))} {units === 'metric' ? 'km/h' : 'mph'}</strong></div>
            </div>
          </div>
        )}

        {forecast.length > 0 && !loading && (
          <div className="forecast-section">
            <h3>5-Day Forecast</h3>
            <div className="forecast-list">
              {forecast.map((day, i) => (
                <div key={i} className="forecast-day">
                  <p className="day-name">
                    {i === 0 ? 'Tomorrow' : new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}
                  </p>
                  <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} alt="" />
                  <div className="temps">
                    <span className="high">{Math.round(day.main.temp_max)}°</span>
                    <span className="low">{Math.round(day.main.temp_min)}°</span>
                  </div>
                  <p className="forecast-text">{day.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;