import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_KEY =process.env.REACT_APP_OPENWEATHER_KEY; // replace with your actual key
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (city, { rejectWithValue }) => {
    try {
      const geoRes = await axios.get(GEO_URL, {
        params: { q: city, limit: 1, appid: API_KEY },
      });

      if (!geoRes.data?.length) {
        return rejectWithValue("City not found");
      }

      const { lat, lon } = geoRes.data[0];

      const weatherRes = await axios.get(FORECAST_URL, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: "metric",
          cnt: 5,
        },
      });

      return {
        city: geoRes.data[0].name,
        list: weatherRes.data.list,
      };
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("Invalid API key");
      }
      return rejectWithValue("Unable to fetch weather");
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: { data: null, loading: false, error: null,
    suggestions: [] },
  reducers: {
    clearWeather: (state) => {
      state.data = null;
      state.error = null;
    },

    clearSuggestions: (state) => {
          state.suggestions = [];
        }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCitySuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
        })
      .addCase(fetchCitySuggestions.pending, (state) => {
        state.suggestions = [];
    });
  },
});

export const fetchCitySuggestions = createAsyncThunk(
    "weather/fetchCitySuggestions",
    async (query, { rejectWithValue }) => {
      try {
        const res = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
          params: {
            q: query,
            limit: 5,
            appid: API_KEY,
          },
        });
  
        return res.data;  
      } catch (err) {
        return rejectWithValue("Failed to load suggestions");
      }
    }
  );

  
export const { clearWeather,clearSuggestions } = weatherSlice.actions;
export default weatherSlice.reducer;
