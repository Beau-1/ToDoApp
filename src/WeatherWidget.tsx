import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface WeatherData {
    temp: number;
    icon: string;
}

function WeatherWidget(): JSX.Element | null {
    const [weather, setWeather] = useState<WeatherData | null>(null);

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
                }
            );
        } else {
            console.error("Geolocation not supported.");
            toast.error("Geolocation not supported by this browser.");
        }
    }, []);

    if (!weather) return null;

    return (
        <div className="weather-widget">
            <img src={weather.icon} alt="Weather" />
            <span>{weather.temp}°</span>
        </div>
    );
}

export default WeatherWidget;
