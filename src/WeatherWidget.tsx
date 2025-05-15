import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface WeatherData {
    temp: number;
    icon: string;
}

function WeatherWidget(): JSX.Element {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const apiKey = "c1738b6ccdcd321c4fe80efdfb659dfd";
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
                );
                if (!response.ok) throw new Error("Weather API failed");

                const data = await response.json();
                setWeather({
                    temp: Math.round(data.main.temp),
                    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
                });
            } catch (error) {
                console.error("Failed to fetch weather:", error);
                toast.error("Failed to load weather data.");
            } finally {
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast.error("Location access denied. Weather unavailable.");
                    setLoading(false);
                }
            );
        } else {
            console.error("Geolocation not supported.");
            toast.error("Geolocation not supported by this browser.");
            setLoading(false);
        }
    }, []);

    return (
        <div className="weather-widget">
            {loading ? (
                <span className="button-spinner"></span>
            ) : weather ? (
                <>
                    <img src={weather.icon} alt="Weather" />
                    <span>{weather.temp}°</span>
                </>
            ) : null}
        </div>
    );
}

export default WeatherWidget;
