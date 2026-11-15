// ==========================================================================
// Atmosferia - API Service Module (js/api.js)
// Mengintegrasikan Open-Meteo (Gratis, Tanpa API Key) & BMKG Proxy
// ==========================================================================

import { Storage } from './storage.js';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export const WeatherAPI = {
    // 1. Pencarian Kota Bebas (Autocomplete)
    async searchCities(query) {
        if (!query || query.trim().length < 2) return [];

        const cleanQuery = query.trim().toLowerCase();
        const cacheKey = `geo_${cleanQuery}`;
        const cached = Storage.getCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `${GEOCODING_BASE}?name=${encodeURIComponent(cleanQuery)}&count=7&language=id&format=json`;
            const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
            if (!res.ok) throw new Error('Geocoding service error');

            const data = await res.json();
            const results = (data.results || []).map(item => ({
                id: item.id,
                name: item.name,
                admin1: item.admin1 || '',
                admin2: item.admin2 || '',
                country: item.country || '',
                country_code: item.country_code || '',
                latitude: item.latitude,
                longitude: item.longitude,
                timezone: item.timezone || 'Asia/Jakarta'
            }));

            Storage.setCache(cacheKey, results);
            return results;
        } catch (err) {
            console.warn('Geocoding search failed:', err.message);
            return [];
        }
    },

    // 2. Mengambil Seluruh Data Cuaca, Prakiraan 7 Hari & Kualitas Udara
    async fetchFullWeather(lat, lon) {
        const cacheKey = `wx_${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
        const cached = Storage.getCache(cacheKey);
        if (cached) return cached;

        const forecastUrl = `${FORECAST_BASE}?latitude=${lat}&longitude=${lon}`
            + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m`
            + `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility`
            + `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max`
            + `&timezone=auto`;

        const aqiUrl = `${AIR_QUALITY_BASE}?latitude=${lat}&longitude=${lon}`
            + `&current=european_aqi,us_aqi,pm10,pm2_5`;

        const [forecastRes, aqiRes] = await Promise.allSettled([
            fetch(forecastUrl, { signal: AbortSignal.timeout(8000) }),
            fetch(aqiUrl, { signal: AbortSignal.timeout(8000) })
        ]);

        if (forecastRes.status !== 'fulfilled' || !forecastRes.value.ok) {
            throw new Error('Gagal mengambil data prakiraan dari satelit Open-Meteo.');
        }

        const forecastData = await forecastRes.value.json();
        let aqiData = null;
        if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
            try {
                aqiData = await aqiRes.value.json();
            } catch {
                aqiData = null;
            }
        }

        const combinedPayload = {
            latitude: forecastData.latitude,
            longitude: forecastData.longitude,
            timezone: forecastData.timezone,
            utc_offset_seconds: forecastData.utc_offset_seconds || 0,
            current: forecastData.current || {},
            hourly: forecastData.hourly || {},
            daily: forecastData.daily || {},
            aqi: aqiData && aqiData.current ? aqiData.current : null,
            fetchedAt: new Date().toISOString()
        };

        Storage.setCache(cacheKey, combinedPayload);
        return combinedPayload;
    },

    // 3. Mengambil Peringatan Resmi BMKG (Proxy Serverless / Fallback)
    async fetchBMKGWarnings() {
        try {
            const res = await fetch('/api/bmkg-warning', { signal: AbortSignal.timeout(5000) });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null; // Graceful fallback
        }
    }
};

