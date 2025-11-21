import "../styles/components/weatherCard.scss";

const WeatherCard = ({ data }) => {
  return (
<>
      <h2 className="cityHeader">{data.city}</h2>

      <div className="weatherCard">


      {data.list.map((item, index) => {
        const icon = item.weather[0].icon;
        return (
          <div className="forecastBox" key={index}>
            <div className="temp">{Math.round(item.main.temp)}°C</div>

            <div className="desc">
              <img
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt=""
              />
              <span>{item.weather[0].description}</span>
            </div>

            <div className="small">
              <p>Humidity: {item.main.humidity}%</p>
              <p>Wind: {item.wind.speed} m/s</p>
              <p>{item.dt_txt}</p>
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};

export default WeatherCard;
