import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWeather, fetchCitySuggestions } from "../features/weather/weatherSlice";
import { clearSuggestions } from "../features/weather/weatherSlice";
import "../styles/components/searchBar.scss";

const SearchBar = () => {
  const [city, setCity] = useState("");
  const [selectedFromList, setSelectedFromList] = useState(false);
  const dispatch = useDispatch();
  const suggestions = useSelector((s) => s.weather.suggestions);
console.log("suggestions",suggestions)
  // debounce
  useEffect(() => {

    if (selectedFromList) return;
    if (city.trim().length < 2) {
        
        dispatch(clearSuggestions())
        return
    };

    const timeout = setTimeout(() => {
      dispatch(fetchCitySuggestions(city.trim()));
    }, 300);

    return () => clearTimeout(timeout);
  }, [city,selectedFromList,dispatch]);

  const onSelectSuggestion = (name) => {
    setSelectedFromList(true);  
    setCity(name);
    dispatch(fetchWeather(name));
    dispatch(clearSuggestions()); 
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
  
    dispatch(fetchWeather(city.trim()));
    dispatch(clearSuggestions());
    setCity("");
  };



  return (
    <div className="searchContainer">
      <form className="searchBar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(e) => {
            setSelectedFromList(false);  
            setCity(e.target.value)}}
        />
        <button type="submit">Search</button>
      </form>

      {suggestions.length > 0 && (
        <ul className="suggestionBox">
          {suggestions.map((c, index) => (
            <li key={index} onClick={() => onSelectSuggestion(c.name)}>
              {c.name}, {c.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
