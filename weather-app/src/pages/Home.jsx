import { useSelector } from "react-redux";
import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import Loader from "../components/Loader";

const Home = () => {
  const { data, loading, error } = useSelector((s) => s.weather);

  return (
    <div className="appContainer">
      <h1>Weather Now</h1>
      <SearchBar />

      {loading && <Loader />}
      {error && <p className="error">{error}</p>}
      {data && !loading && <WeatherCard data={data} />}
    </div>
  );
};

export default Home;
