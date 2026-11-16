// ==========================================================================
// Atmosferia - Complete Weather Platform Controller (script.js)
// Berjalan secara mandiri (Standalone) tanpa dependensi bundler atau batasan CORS
// ==========================================================================

// --- 1. STORAGE MODULE ---
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit

const Storage = {
    get(key, defaultValue = null) {
        try {
            const val = localStorage.getItem(key);
            return val !== null ? JSON.parse(val) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn('Gagal menyimpan ke localStorage:', err);
        }
    },

    getUnit() {
        return localStorage.getItem('atm_unit') || 'C';
    },

    setUnit(unit) {
        localStorage.setItem('atm_unit', unit);
    },

    getLang() {
        return localStorage.getItem('atm_lang') || 'id';
    },

    setLang(lang) {
        localStorage.setItem('atm_lang', lang);
    },

    getThemeMode() {
        return localStorage.getItem('atm_theme_mode') || 'auto'; // 'dark', 'light', 'auto'
    },

    setThemeMode(mode) {
        localStorage.setItem('atm_theme_mode', mode);
    },

    getLastCity() {
        return this.get('atm_last_city', {
            name: 'Bandung',
            admin1: 'Jawa Barat',
            country: 'Indonesia',
            latitude: -6.9175,
            longitude: 107.6191
        });
    },

    setLastCity(cityObj) {
        this.set('atm_last_city', cityObj);
    },

    getSavedCities() {
        return this.get('atm_saved_cities', []);
    },

    saveCity(cityObj) {
        const list = this.getSavedCities();
        const exists = list.some(item => 
            (item.name.toLowerCase() === cityObj.name.toLowerCase() && 
             Math.abs(item.latitude - cityObj.latitude) < 0.1)
        );
        if (!exists) {
            list.unshift(cityObj);
            this.set('atm_saved_cities', list);
            return true;
        }
        return false;
    },

    removeSavedCity(cityName) {
        let list = this.getSavedCities();
        list = list.filter(item => item.name.toLowerCase() !== cityName.toLowerCase());
        this.set('atm_saved_cities', list);
        return list;
    },

    getDisasterHistory() {
        return this.get('atm_disaster_history', []);
    },

    addDisasterLog(kota, jenis, detail) {
        const riwayat = this.getDisasterHistory();
        if (riwayat.length > 0 && riwayat[0].kota === kota && riwayat[0].jenis === jenis) {
            return false;
        }
        const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        riwayat.unshift({ waktu, kota, jenis, info: detail });
        if (riwayat.length > 25) riwayat.pop();
        this.set('atm_disaster_history', riwayat);
        return true;
    },

    clearDisasterHistory() {
        this.set('atm_disaster_history', []);
    },

    // --- Developer-Only GPS Location Logs ---
    getDevGeoLogs() {
        return this.get('atm_dev_geo_logs', []);
    },

    addDevGeoLog(logEntry) {
        const logs = this.getDevGeoLogs();
        const now = new Date();
        const entry = {
            id: 'geo_' + Date.now(),
            waktu: now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            lat: logEntry.lat,
            lon: logEntry.lon,
            accuracy: logEntry.accuracy ? Math.round(logEntry.accuracy) : null,
            kota: logEntry.kota || 'Lokasi GPS Terdeteksi',
            device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
            mapsUrl: `https://www.google.com/maps?q=${logEntry.lat},${logEntry.lon}`
        };
        logs.unshift(entry);
        if (logs.length > 50) logs.pop();
        this.set('atm_dev_geo_logs', logs);
        return entry;
    },

    clearDevGeoLogs() {
        this.set('atm_dev_geo_logs', []);
    },

    getCache(key) {
        try {
            const raw = sessionStorage.getItem(`atm_cache_${key}`);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
                sessionStorage.removeItem(`atm_cache_${key}`);
                return null;
            }
            return parsed.data;
        } catch {
            return null;
        }
    },

    setCache(key, data) {
        try {
            sessionStorage.setItem(`atm_cache_${key}`, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        } catch (err) {
            console.warn('Gagal menyimpan cache sessionStorage:', err);
        }
    }
};

// --- 2. INTERNATIONALIZATION & FORMATTING MODULE ---
const translations = {
    id: {
        app_name: 'Atmosferia',
        app_tagline: 'Prakiraan Cuaca Indonesia',
        search_placeholder: 'Ketik nama kota, kecamatan, atau wilayah...',
        search_btn: 'Cari Kota',
        btn_gps_title: 'Gunakan Lokasi Saya (GPS)',
        btn_my_location: 'Gunakan Lokasi Saya',
        region_title: 'Pilihan Cepat:',
        feels_like: 'Terasa seperti',
        min: 'Min',
        max: 'Maks',
        daily_briefing: 'Ringkasan dan Rekomendasi Hari Ini',
        humidity_title: 'Kelembapan Udara',
        wind_title: 'Angin Permukaan',
        sun_title: 'Siklus Siang',
        vis_press_title: 'Jarak Pandang & Tekanan',
        rain_prob_title: 'Peluang Hujan',
        uv_title: 'Indeks Radiasi UV',
        aqi_title: 'Kualitas Udara',
        hourly_forecast: 'Prakiraan Cuaca per Jam',
        hourly_desc: 'Pergerakan suhu dan potensi hujan tiap jam',
        daily_forecast: 'Prakiraan 7 Hari ke Depan',
        daily_desc: 'Tren cuaca, rentang suhu, dan peluang hujan mingguan',
        btn_view_radar: 'Buka Radar Peta',
        saved_title: 'Daftar Kota Tersimpan',
        btn_save_city: 'Simpan Kota Ini',
        history_title: 'Log Riwayat Peringatan',
        history_clear: 'Kosongkan Log',
        modal_close: 'Tutup',
        view_link: 'Lihat Selengkapnya',
        loading_text: 'Mengambil data satelit cuaca untuk',
        error_not_found: 'Kota tidak ditemukan. Periksa kembali ejaan nama kota.',
        error_network: 'Gagal menghubungkan ke satelit cuaca. Periksa koneksi internet Anda.',
        btn_retry: 'Coba Lagi',
        save_success: 'tersimpan ke daftar favorit.',
        already_saved: 'sudah ada di daftar favorit.',
        geo_not_supported: 'Perangkat Anda tidak mendukung deteksi lokasi.',
        geo_denied: 'Izin akses lokasi ditolak oleh peramban.',
        geo_loading: 'Mendeteksi titik koordinat GPS Anda...',
        updated_at: 'Diperbarui',
        radar_heading: 'Radar Satelit dan Dinamika Angin',
        radar_subheading: 'Peta numerik interaktif berpusat pada wilayah aktif',
        radar_wind: 'Arus Angin',
        radar_rain: 'Hujan & Petir',
        radar_temp: 'Suhu',
        radar_clouds: 'Awan',
        disclaimer_text: 'Atmosferia menyajikan pemantauan cuaca modern berbasis model numerik Open-Meteo dan visualisasi Windy. Bukan merupakan saluran resmi peringatan dini kebencanaan pemerintah.',
        disclaimer_link: 'Kunjungi Portal Resmi BMKG (bmkg.go.id)',
        source_label: 'Sumber Data: Open-Meteo (Tanpa Kunci API), BMKG, & Windy Community.'
    },
    en: {
        app_name: 'Atmosferia',
        app_tagline: 'Indonesian Weather Portal',
        search_placeholder: 'Type city, district, or region name...',
        search_btn: 'Search',
        btn_gps_title: 'Use My Location (GPS)',
        btn_my_location: 'Use My Location',
        region_title: 'Quick Cities:',
        feels_like: 'Feels like',
        min: 'Min',
        max: 'Max',
        daily_briefing: 'Daily Summary and Recommendation',
        humidity_title: 'Relative Humidity',
        wind_title: 'Surface Wind',
        sun_title: 'Daylight Cycle',
        vis_press_title: 'Visibility & Pressure',
        rain_prob_title: 'Rain Probability',
        uv_title: 'Peak UV Index',
        aqi_title: 'Air Quality',
        hourly_forecast: 'Hourly Trend Forecast',
        hourly_desc: 'Hourly temperature and precipitation probability',
        daily_forecast: '7-Day Outlook Forecast',
        daily_desc: 'Weekly weather progression, temperature, and rain risk',
        btn_view_radar: 'View on Radar Map',
        saved_title: 'Saved Locations',
        btn_save_city: 'Save Current City',
        history_title: 'Alert History Log',
        history_clear: 'Clear Log',
        modal_close: 'Close',
        view_link: 'View Details',
        loading_text: 'Fetching weather satellite data for',
        error_not_found: 'City not found. Please verify spelling.',
        error_network: 'Failed to connect to weather services. Please check your internet connection.',
        btn_retry: 'Try Again',
        save_success: 'saved to favorite locations.',
        already_saved: 'is already in your saved locations.',
        geo_not_supported: 'Geolocation not supported by this device.',
        geo_denied: 'Location access permission was denied.',
        geo_loading: 'Detecting your GPS coordinates...',
        updated_at: 'Updated at',
        radar_heading: 'Satellite Radar and Wind Dynamics',
        radar_subheading: 'Interactive numerical weather map centered on the active city',
        radar_wind: 'Wind Vectors',
        radar_rain: 'Rain & Lightning',
        radar_temp: 'Temperature',
        radar_clouds: 'Cloud Cover',
        disclaimer_text: 'Atmosferia presents modern numerical weather models from Open-Meteo and Windy visualization. Not an official government disaster warning channel.',
        disclaimer_link: 'Visit Official BMKG Portal (bmkg.go.id)',
        source_label: 'Data Sources: Open-Meteo (Keyless API), BMKG, & Windy Community.'
    }
};

const wmoWeatherMap = {
    0: { id: 'Cerah', en: 'Clear sky', iconDay: 'bi-sun text-yellow', iconNight: 'bi-moon-stars text-yellow' },
    1: { id: 'Cerah Berawan', en: 'Mainly clear', iconDay: 'bi-cloud-sun text-yellow', iconNight: 'bi-cloud-moon text-blue' },
    2: { id: 'Berawan Sebagian', en: 'Partly cloudy', iconDay: 'bi-cloud-sun text-secondary', iconNight: 'bi-cloud-moon text-secondary' },
    3: { id: 'Awan Mendung', en: 'Overcast', iconDay: 'bi-clouds text-secondary', iconNight: 'bi-clouds text-secondary' },
    45: { id: 'Berkabut', en: 'Fog', iconDay: 'bi-cloud-fog text-secondary', iconNight: 'bi-cloud-fog text-secondary' },
    48: { id: 'Kabut Tebal', en: 'Depositing rime fog', iconDay: 'bi-cloud-fog2 text-secondary', iconNight: 'bi-cloud-fog2 text-secondary' },
    51: { id: 'Gerimis Ringan', en: 'Light drizzle', iconDay: 'bi-cloud-drizzle text-blue', iconNight: 'bi-cloud-drizzle text-blue' },
    53: { id: 'Gerimis Sedang', en: 'Moderate drizzle', iconDay: 'bi-cloud-drizzle text-blue', iconNight: 'bi-cloud-drizzle text-blue' },
    55: { id: 'Gerimis Lebat', en: 'Dense drizzle', iconDay: 'bi-cloud-drizzle-fill text-blue', iconNight: 'bi-cloud-drizzle-fill text-blue' },
    61: { id: 'Hujan Rintik-Rintik', en: 'Slight rain', iconDay: 'bi-cloud-rain text-blue', iconNight: 'bi-cloud-rain text-blue' },
    63: { id: 'Hujan Sedang', en: 'Moderate rain', iconDay: 'bi-cloud-rain-heavy text-blue', iconNight: 'bi-cloud-rain-heavy text-blue' },
    65: { id: 'Hujan Lebat', en: 'Heavy rain', iconDay: 'bi-cloud-rain-heavy-fill text-blue', iconNight: 'bi-cloud-rain-heavy-fill text-blue' },
    80: { id: 'Hujan Ringan Lokal', en: 'Slight rain showers', iconDay: 'bi-cloud-rain text-blue', iconNight: 'bi-cloud-rain text-blue' },
    81: { id: 'Hujan Sedang Tersebar', en: 'Moderate rain showers', iconDay: 'bi-cloud-rain-heavy text-blue', iconNight: 'bi-cloud-rain-heavy text-blue' },
    82: { id: 'Hujan Sangat Lebat', en: 'Violent rain showers', iconDay: 'bi-cloud-rain-heavy-fill text-red', iconNight: 'bi-cloud-rain-heavy-fill text-red' },
    95: { id: 'Badai Petir', en: 'Thunderstorm', iconDay: 'bi-cloud-lightning text-yellow', iconNight: 'bi-cloud-lightning text-yellow' },
    96: { id: 'Badai Petir & Hujan Es', en: 'Thunderstorm with slight hail', iconDay: 'bi-cloud-lightning-rain text-red', iconNight: 'bi-cloud-lightning-rain text-red' },
    99: { id: 'Badai Petir Hebat', en: 'Thunderstorm with heavy hail', iconDay: 'bi-cloud-lightning-rain-fill text-red', iconNight: 'bi-cloud-lightning-rain-fill text-red' }
};

const I18n = {
    activeLang: Storage.getLang(),
    activeUnit: Storage.getUnit(),

    setLang(lang) {
        this.activeLang = (lang === 'en') ? 'en' : 'id';
    },

    setUnit(unit) {
        this.activeUnit = (unit === 'F') ? 'F' : 'C';
    },

    t(key) {
        const dict = translations[this.activeLang] || translations.id;
        return dict[key] || translations.id[key] || key;
    },

    formatTemp(celsiusVal) {
        if (celsiusVal === undefined || celsiusVal === null || isNaN(celsiusVal)) return '--°';
        if (this.activeUnit === 'F') {
            const fahrenheit = (celsiusVal * 9 / 5) + 32;
            return `${Math.round(fahrenheit)}°F`;
        }
        return `${Math.round(celsiusVal)}°C`;
    },

    getWeatherDesc(wmoCode) {
        const info = wmoWeatherMap[wmoCode] || { id: 'Berawan', en: 'Cloudy' };
        return this.activeLang === 'en' ? info.en : info.id;
    },

    getWeatherIcon(wmoCode, isDay = true) {
        const info = wmoWeatherMap[wmoCode] || { iconDay: 'bi-cloud text-secondary', iconNight: 'bi-cloud text-secondary' };
        return isDay ? `bi ${info.iconDay}` : `bi ${info.iconNight}`;
    },

    getWindDirection(degree) {
        const directionsId = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
        const directionsEn = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
        const dirs = (this.activeLang === 'en') ? directionsEn : directionsId;
        const index = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8;
        return dirs[index];
    },

    resolveTimezoneLabel(utcOffsetSeconds) {
        if (utcOffsetSeconds === 25200) return 'WIB';
        if (utcOffsetSeconds === 28800) return 'WITA';
        if (utcOffsetSeconds === 32400) return 'WIT';
        const hours = utcOffsetSeconds / 3600;
        return `GMT${hours >= 0 ? '+' : ''}${hours}`;
    },

    getUVCategory(uvIndex) {
        const val = Number(uvIndex) || 0;
        if (val <= 2) return { label: 'Rendah', color: 'var(--color-green)' };
        if (val <= 5) return { label: 'Sedang', color: 'var(--color-yellow)' };
        if (val <= 7) return { label: 'Tinggi', color: '#f97316' };
        if (val <= 10) return { label: 'Sangat Tinggi', color: 'var(--color-red)' };
        return { label: 'Ekstrem', color: '#a855f7' };
    },

    getAQICategory(aqiVal) {
        const val = Number(aqiVal) || 0;
        if (val <= 50) return { label: 'Baik', color: 'var(--color-green)' };
        if (val <= 100) return { label: 'Sedang', color: 'var(--color-yellow)' };
        if (val <= 150) return { label: 'Sensitif', color: '#f97316' };
        if (val <= 200) return { label: 'Tidak Sehat', color: 'var(--color-red)' };
        return { label: 'Berbahaya', color: '#a855f7' };
    }
};

// --- 3. WEATHER API SERVICE MODULE ---
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

const WeatherAPI = {
    async searchCities(query) {
        if (!query || query.trim().length < 2) return [];

        const cleanQuery = query.trim().toLowerCase();
        const cacheKey = `geo_${cleanQuery}`;
        const cached = Storage.getCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `${GEOCODING_BASE}?name=${encodeURIComponent(cleanQuery)}&count=7&language=id&format=json`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Geocoding service error');

            const data = await res.json();
            const results = (data.results || []).map(item => ({
                id: item.id,
                name: item.name,
                admin1: item.admin1 || '',
                admin2: item.admin2 || '',
                country: item.country || '',
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
            fetch(forecastUrl),
            fetch(aqiUrl)
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

    async fetchBMKGWarnings() {
        try {
            const res = await fetch('/api/bmkg-warning');
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }
};

// --- 4. UI CONTROLLER MODULE ---
let localClockInterval = null;
let currentRadarCity = { lat: -6.9175, lon: 107.6191 };
let currentRadarOverlay = 'wind';
let radarLoaded = false;

const UI = {
    showSkeleton(cityName = '') {
        const pesanInfo = document.getElementById('pesanInfo');
        const hasilCuaca = document.getElementById('hasilCuaca');
        if (!pesanInfo) return;

        pesanInfo.className = 'py-4';
        pesanInfo.innerHTML = `
            <div class="skeleton-container" aria-busy="true" aria-live="polite">
                <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
                    <div class="spinner-border text-primary spinner-border-sm" role="status">
                        <span class="visually-hidden">Memuat data...</span>
                    </div>
                    <span class="text-secondary small">
                        ${I18n.t('loading_text')} <strong>${cityName || 'lokasi terpilih'}</strong>...
                    </span>
                </div>
                <div class="skeleton-card mb-3">
                    <div class="skeleton-shimmer" style="height: 24px; width: 40%; margin-bottom: 12px;"></div>
                    <div class="skeleton-shimmer" style="height: 60px; width: 30%; margin-bottom: 12px;"></div>
                    <div class="skeleton-shimmer" style="height: 16px; width: 70%;"></div>
                </div>
            </div>
        `;

        if (hasilCuaca) hasilCuaca.classList.add('d-none');
    },

    hideSkeleton() {
        const pesanInfo = document.getElementById('pesanInfo');
        const hasilCuaca = document.getElementById('hasilCuaca');
        if (pesanInfo) pesanInfo.innerHTML = '';
        if (hasilCuaca) hasilCuaca.classList.remove('d-none');
    },

    renderError(errorMessage, retryCallback) {
        const pesanInfo = document.getElementById('pesanInfo');
        const hasilCuaca = document.getElementById('hasilCuaca');
        if (!pesanInfo) return;

        if (hasilCuaca) hasilCuaca.classList.add('d-none');
        pesanInfo.className = 'text-center py-5';
        pesanInfo.innerHTML = `
            <div class="editorial-card d-inline-block text-center p-4" style="max-width: 480px;">
                <div class="mb-3 text-red fs-1"><i class="bi bi-exclamation-triangle"></i></div>
                <h5 class="text-white fw-bold mb-2">Terjadi Kendala Memuat Data</h5>
                <p class="text-secondary small mb-3">${errorMessage || I18n.t('error_network')}</p>
                <button id="btnRetryError" class="btn btn-primary btn-sm px-4 py-2 fw-semibold">
                    <i class="bi bi-arrow-clockwise me-1"></i> ${I18n.t('btn_retry')}
                </button>
            </div>
        `;

        const btnRetry = document.getElementById('btnRetryError');
        if (btnRetry && typeof retryCallback === 'function') {
            btnRetry.onclick = retryCallback;
        }
    },

    startRealtimeClock(utcOffsetSeconds = 25200) {
        if (localClockInterval) clearInterval(localClockInterval);

        const elSuasana = document.getElementById('suasanaKota');
        if (!elSuasana) return;

        const updateClock = () => {
            const now = new Date();
            const utcEpoch = now.getTime() + (now.getTimezoneOffset() * 60000);
            const targetCityDate = new Date(utcEpoch + (utcOffsetSeconds * 1000));

            const jam = String(targetCityDate.getHours()).padStart(2, '0');
            const menit = String(targetCityDate.getMinutes()).padStart(2, '0');
            const detik = String(targetCityDate.getSeconds()).padStart(2, '0');
            const tzLabel = I18n.resolveTimezoneLabel(utcOffsetSeconds);

            elSuasana.innerHTML = `<i class="bi bi-clock me-1 text-blue"></i> Waktu Lokal: <strong>${jam}:${menit}:${detik} ${tzLabel}</strong>`;
        };

        updateClock();
        localClockInterval = setInterval(updateClock, 1000);
    },

    evaluateSevereWeather(weatherData, cityObj) {
        const banner = document.getElementById('bannerPeringatan');
        const judul = document.getElementById('judulPeringatan');
        const pesan = document.getElementById('pesanPeringatan');
        if (!banner || !judul || !pesan) return;

        const cur = weatherData.current || {};
        const daily = weatherData.daily || {};
        const windSpeed = cur.wind_speed_10m || 0;
        const rainAmount = cur.precipitation || cur.rain || 0;
        const weatherCode = cur.weather_code ?? 0;
        const maxUV = (daily.uv_index_max && daily.uv_index_max[0]) ? daily.uv_index_max[0] : 0;
        const maxWindDaily = (daily.wind_speed_10m_max && daily.wind_speed_10m_max[0]) ? daily.wind_speed_10m_max[0] : 0;

        let isExtreme = false;
        let alertType = '';
        let alertDetail = '';

        if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
            isExtreme = true;
            alertType = 'Badai Petir & Kilat';
            alertDetail = `Terdeteksi potensi badai petir aktif disertai kilat di area ${cityObj.name}. Harap waspada dan hindari berteduh di bawah pohon atau struktur terbuka.`;
        } else if (windSpeed >= 35 || maxWindDaily >= 45) {
            isExtreme = true;
            alertType = 'Angin Kencang';
            alertDetail = `Kecepatan angin permukaan mencapai ${Math.round(windSpeed)} km/j (maksimal ${Math.round(maxWindDaily)} km/j). Waspadai potensi dahan patah atau reklame roboh di sekitar ${cityObj.name}.`;
        } else if (rainAmount >= 10) {
            isExtreme = true;
            alertType = 'Hujan Lebat';
            alertDetail = `Curah hujan tinggi (${rainAmount.toFixed(1)} mm/j) terpantau di ${cityObj.name}. Waspadai genangan air dan penurunan jarak pandang di jalan raya.`;
        } else if (maxUV >= 11 && cur.is_day === 1) {
            isExtreme = true;
            alertType = 'Indeks UV Ekstrem';
            alertDetail = `Indeks radiasi UV mencapai ${maxUV.toFixed(1)} (Kategori Ekstrem). Kurangi paparan langsung sinar matahari antara pukul 11:00-14:00.`;
        }

        if (isExtreme) {
            judul.textContent = `Peringatan: Potensi ${alertType} di ${cityObj.name}`;
            pesan.textContent = alertDetail;
            banner.classList.remove('d-none');
            Storage.addDisasterLog(cityObj.name, alertType, alertDetail);
        } else {
            banner.classList.add('d-none');
        }
    },

    applyAtmosphericTheme(weatherCode, isDay) {
        const body = document.body;
        const themeClasses = [
            'theme-rain-day', 'theme-rain-night',
            'theme-storm-day', 'theme-storm-night',
            'theme-clouds-day', 'theme-clouds-night',
            'theme-clear-morning', 'theme-clear-day', 'theme-clear-sunset', 'theme-clear-night',
            'theme-fog-day', 'theme-fog-night'
        ];
        themeClasses.forEach(cls => body.classList.remove(cls));

        const code = Number(weatherCode);
        const day = Boolean(isDay);

        if (code >= 95) {
            body.classList.add(day ? 'theme-storm-day' : 'theme-storm-night');
        } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
            body.classList.add(day ? 'theme-rain-day' : 'theme-rain-night');
        } else if (code >= 45 && code <= 48) {
            body.classList.add(day ? 'theme-fog-day' : 'theme-fog-night');
        } else if (code === 1 || code === 2 || code === 3) {
            body.classList.add(day ? 'theme-clouds-day' : 'theme-clouds-night');
        } else {
            const hour = new Date().getHours();
            if (day) {
                if (hour >= 5 && hour < 8) body.classList.add('theme-clear-morning');
                else if (hour >= 16 && hour < 18) body.classList.add('theme-clear-sunset');
                else body.classList.add('theme-clear-day');
            } else {
                body.classList.add('theme-clear-night');
            }
        }
    },

    renderCurrentWeather(data, cityObj) {
        const cur = data.current || {};
        const daily = data.daily || {};
        const isDay = cur.is_day !== undefined ? cur.is_day === 1 : true;
        const code = cur.weather_code ?? 0;

        const elNamaWilayah = document.getElementById('namaWilayah');
        if (elNamaWilayah) {
            const regionExtra = cityObj.admin1 ? `, ${cityObj.admin1}` : '';
            elNamaWilayah.textContent = `${cityObj.name}${regionExtra}`;
        }

        const elWaktuUpdate = document.getElementById('waktuUpdate');
        if (elWaktuUpdate) {
            const now = new Date();
            const tz = I18n.resolveTimezoneLabel(data.utc_offset_seconds);
            const hours = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            elWaktuUpdate.textContent = `${I18n.t('updated_at')} ${hours}:${mins} ${tz}`;
        }

        this.applyAtmosphericTheme(code, isDay);
        this.startRealtimeClock(data.utc_offset_seconds || 25200);

        const tempVal = cur.temperature_2m ?? 0;
        const feelsVal = cur.apparent_temperature ?? tempVal;
        const elSuhu = document.getElementById('suhuCuaca');
        const elDeskripsi = document.getElementById('deskripsiCuaca');
        const elTerasa = document.getElementById('terasaSeperti');
        const elIkon = document.getElementById('ikonCuaca');

        if (elSuhu) elSuhu.textContent = I18n.formatTemp(tempVal);
        if (elDeskripsi) elDeskripsi.textContent = I18n.getWeatherDesc(code);
        if (elTerasa) elTerasa.textContent = `${I18n.t('feels_like')} ${I18n.formatTemp(feelsVal)}`;
        if (elIkon) elIkon.className = `${I18n.getWeatherIcon(code, isDay)} display-3`;

        const minTemp = (daily.temperature_2m_min && daily.temperature_2m_min[0] !== undefined)
            ? daily.temperature_2m_min[0] : tempVal - 2;
        const maxTemp = (daily.temperature_2m_max && daily.temperature_2m_max[0] !== undefined)
            ? daily.temperature_2m_max[0] : tempVal + 3;

        const elMin = document.getElementById('suhuMin');
        const elMax = document.getElementById('suhuMax');
        const elFill = document.getElementById('tempFillBar');

        if (elMin) elMin.textContent = I18n.formatTemp(minTemp);
        if (elMax) elMax.textContent = I18n.formatTemp(maxTemp);
        if (elFill) {
            const span = Math.max(maxTemp - minTemp, 1);
            const ratio = Math.min(Math.max((tempVal - minTemp) / span, 0.1), 0.95);
            elFill.style.width = `${Math.round(ratio * 100)}%`;
        }

        this.renderEditorialBriefing(data, cityObj);
        this.renderAtmosphericStations(data);
        this.evaluateSevereWeather(data, cityObj);
    },

    renderEditorialBriefing(data, cityObj) {
        const elRingkasan = document.getElementById('ringkasanCuaca');
        if (!elRingkasan) return;

        const cur = data.current || {};
        const daily = data.daily || {};
        const code = cur.weather_code ?? 0;
        const temp = cur.temperature_2m ?? 25;
        const wind = cur.wind_speed_10m ?? 10;
        const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== undefined)
            ? daily.precipitation_probability_max[0] : 0;
        const desc = I18n.getWeatherDesc(code);

        let narasi = `Kondisi atmosfer di wilayah <strong>${cityObj.name}</strong> saat ini terpantau <strong>${desc}</strong> dengan suhu udara berkisar <strong>${I18n.formatTemp(temp)}</strong>. `;

        if (rainProb >= 60) {
            narasi += `Peluang presipitasi hujan hari ini cukup tinggi (${rainProb}%). Disarankan membawa payung atau jas hujan saat beraktivitas di luar ruangan. `;
        } else if (rainProb >= 30) {
            narasi += `Terdapat potensi hujan lokal dengan peluang sekitar ${rainProb}%. `;
        } else {
            narasi += `Peluang terjadinya hujan tergolong rendah (${rainProb}%), langit relatif mendukung untuk mobilitas luar ruangan. `;
        }

        if (wind >= 25) {
            narasi += `Angin permukaan bertiup cukup kencang (${Math.round(wind)} km/j). `;
        } else {
            narasi += `Aliran angin permukaan tenang dan stabil (${Math.round(wind)} km/j). `;
        }

        elRingkasan.innerHTML = narasi;
    },

    renderAtmosphericStations(data) {
        const cur = data.current || {};
        const daily = data.daily || {};
        const aqi = data.aqi || {};

        // Kelembapan
        const humidityVal = cur.relative_humidity_2m ?? 75;
        const elKelembapan = document.getElementById('kelembapan');
        const elBadgeKenyamanan = document.getElementById('badgeKenyamanan');
        if (elKelembapan) elKelembapan.textContent = `${humidityVal}%`;
        if (elBadgeKenyamanan) {
            if (humidityVal <= 75) {
                elBadgeKenyamanan.className = 'metric-badge badge-comfort-good';
                elBadgeKenyamanan.textContent = 'Tropis Ideal';
            } else if (humidityVal <= 85) {
                elBadgeKenyamanan.className = 'metric-badge badge-comfort-humid';
                elBadgeKenyamanan.textContent = 'Cenderung Lembap';
            } else {
                elBadgeKenyamanan.className = 'metric-badge badge-comfort-high';
                elBadgeKenyamanan.textContent = 'Sangat Lembap';
            }
        }

        // Angin & Kompas
        const windSpeedVal = cur.wind_speed_10m ?? 10;
        const windDirVal = cur.wind_direction_10m ?? 0;
        const elAngin = document.getElementById('kecepatanAngin');
        const elArahTeks = document.getElementById('arahAnginTeks');
        const elNeedle = document.getElementById('compassNeedle');

        if (elAngin) elAngin.textContent = `${Math.round(windSpeedVal)} km/j`;
        if (elArahTeks) {
            elArahTeks.textContent = `${I18n.getWindDirection(windDirVal)} (${Math.round(windDirVal)}°)`;
        }
        if (elNeedle) elNeedle.style.transform = `rotate(${windDirVal}deg)`;

        // Siklus Matahari
        const sunriseIso = (daily.sunrise && daily.sunrise[0]) ? daily.sunrise[0] : '';
        const sunsetIso = (daily.sunset && daily.sunset[0]) ? daily.sunset[0] : '';
        const formatTime = (iso) => iso ? (iso.split('T')[1] || '').substring(0, 5) : '--:--';

        const elTerbit = document.getElementById('waktuTerbit');
        const elTerbenam = document.getElementById('waktuTerbenam');
        const elSiklusTeks = document.getElementById('siklusMatahariTeks');

        if (elTerbit) elTerbit.textContent = formatTime(sunriseIso);
        if (elTerbenam) elTerbenam.textContent = formatTime(sunsetIso);
        if (elSiklusTeks) {
            elSiklusTeks.textContent = (cur.is_day === 1) ? 'Matahari di atas horizon' : 'Malam hari di bawah horizon';
        }

        // Jarak Pandang & Tekanan
        const hourlyVis = (data.hourly && data.hourly.visibility && data.hourly.visibility[0] !== undefined)
            ? (data.hourly.visibility[0] / 1000).toFixed(1) : '10.0';
        const pressureVal = cur.surface_pressure ? Math.round(cur.surface_pressure) : 1013;

        const elJarak = document.getElementById('jarakPandang');
        const elTekanan = document.getElementById('tekananUdara');
        if (elJarak) elJarak.textContent = `${hourlyVis} km`;
        if (elTekanan) elTekanan.textContent = `${pressureVal} hPa`;

        // Peluang Hujan
        const rainProbMax = (daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== undefined)
            ? daily.precipitation_probability_max[0] : 0;
        const elPeluangHujan = document.getElementById('peluangHujan');
        const elBadgeHujan = document.getElementById('badgePeluangHujan');
        if (elPeluangHujan) elPeluangHujan.textContent = `${rainProbMax}%`;
        if (elBadgeHujan) {
            if (rainProbMax < 25) {
                elBadgeHujan.className = 'metric-badge badge-comfort-good';
                elBadgeHujan.textContent = 'Rendah';
            } else if (rainProbMax < 60) {
                elBadgeHujan.className = 'metric-badge badge-comfort-humid';
                elBadgeHujan.textContent = 'Sedang';
            } else {
                elBadgeHujan.className = 'metric-badge badge-comfort-high';
                elBadgeHujan.textContent = 'Tinggi';
            }
        }

        // Indeks UV
        const uvMax = (daily.uv_index_max && daily.uv_index_max[0] !== undefined)
            ? daily.uv_index_max[0] : 0;
        const uvInfo = I18n.getUVCategory(uvMax);
        const elIndeksUV = document.getElementById('indeksUvVal');
        const elBadgeUV = document.getElementById('badgeUv');
        if (elIndeksUV) elIndeksUV.textContent = uvMax.toFixed(1);
        if (elBadgeUV) {
            elBadgeUV.textContent = uvInfo.label;
            elBadgeUV.style.borderColor = uvInfo.color;
            elBadgeUV.style.color = uvInfo.color;
        }

        // AQI
        const usAqi = aqi.us_aqi !== undefined ? aqi.us_aqi : (aqi.european_aqi || 35);
        const aqiInfo = I18n.getAQICategory(usAqi);
        const elAqiVal = document.getElementById('kualitasUdaraVal');
        const elBadgeAqi = document.getElementById('badgeAqi');
        if (elAqiVal) elAqiVal.textContent = Math.round(usAqi);
        if (elBadgeAqi) {
            elBadgeAqi.textContent = aqiInfo.label;
            elBadgeAqi.style.borderColor = aqiInfo.color;
            elBadgeAqi.style.color = aqiInfo.color;
        }
    },

    renderHourlyForecast(hourlyData, utcOffsetSeconds = 25200) {
        const container = document.getElementById('wadahPrakiraan');
        if (!container || !hourlyData || !hourlyData.time) return;

        const times = hourlyData.time;
        const temps = hourlyData.temperature_2m || [];
        const codes = hourlyData.weather_code || [];
        const probs = hourlyData.precipitation_probability || [];

        const now = new Date();
        const utcEpoch = now.getTime() + (now.getTimezoneOffset() * 60000);
        const targetCityDate = new Date(utcEpoch + (utcOffsetSeconds * 1000));
        const currentHour = targetCityDate.getHours();

        let html = '';
        const maxSlots = Math.min(times.length, 18);

        for (let i = 0; i < maxSlots; i++) {
            const timeStr = times[i];
            const slotHour = parseInt(timeStr.substring(11, 13), 10);
            const isNow = i === 0 || slotHour === currentHour;
            const hourLabel = isNow ? 'Saat ini' : `${String(slotHour).padStart(2, '0')}:00`;
            const code = codes[i] ?? 0;
            const temp = temps[i] ?? 25;
            const prob = probs[i] ?? 0;
            const isDaySlot = slotHour >= 6 && slotHour < 18;
            const iconClass = I18n.getWeatherIcon(code, isDaySlot);
            const desc = I18n.getWeatherDesc(code);

            html += `
                <div class="timeline-hour-card ${isNow ? 'is-now' : ''}">
                    <div class="text-tertiary x-small mb-1 fw-medium">${hourLabel}</div>
                    <div class="timeline-icon-box">
                        <i class="${iconClass} fs-3"></i>
                    </div>
                    <div class="text-white fw-bold mono-num fs-6 my-1">${I18n.formatTemp(temp)}</div>
                    <div class="timeline-condition text-secondary x-small" title="${desc}">${desc}</div>
                    <div class="timeline-prob-box mt-1">
                        ${prob > 0 ? `<span class="x-small text-blue"><i class="bi bi-droplet-fill"></i> ${prob}%</span>` : '<span class="x-small text-tertiary opacity-50">•</span>'}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    // --- PRAKIRAAN CUACA 7 HARI KE DEPAN ---
    renderDailyForecast(dailyData) {
        const gridContainer = document.getElementById('wadahPrakiraanMingguan');
        const listContainer = document.getElementById('daftarRincianMingguan');
        const summaryContainer = document.getElementById('ringkasanMingguan');
        if (!dailyData || !dailyData.time) return;

        const times = dailyData.time;
        const codes = dailyData.weather_code || [];
        const minTemps = dailyData.temperature_2m_min || [];
        const maxTemps = dailyData.temperature_2m_max || [];
        const probs = dailyData.precipitation_probability_max || [];
        const winds = dailyData.wind_speed_10m_max || [];
        const uvs = dailyData.uv_index_max || [];

        const isId = Storage.getLang() === 'id';
        const dayNamesId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayNames = isId ? dayNamesId : dayNamesEn;

        const count = Math.min(times.length, 7);

        // 1. Hitung Ringkasan Tren Mingguan
        let rainDays = [];
        let allMin = Infinity;
        let allMax = -Infinity;

        for (let i = 0; i < count; i++) {
            const dObj = new Date(times[i] + 'T00:00:00');
            const dName = (i === 0) ? (isId ? 'Hari Ini' : 'Today') : (i === 1) ? (isId ? 'Besok' : 'Tomorrow') : dayNames[dObj.getDay()];
            if ((probs[i] || 0) >= 40) rainDays.push(dName);
            if (minTemps[i] !== undefined && minTemps[i] < allMin) allMin = minTemps[i];
            if (maxTemps[i] !== undefined && maxTemps[i] > allMax) allMax = maxTemps[i];
        }

        if (summaryContainer && allMin !== Infinity && allMax !== -Infinity) {
            let summaryText = isId
                ? `<strong>Analisis Tren 7 Hari:</strong> Rentang suhu mingguan diperkirakan antara <strong>${I18n.formatTemp(allMin)} - ${I18n.formatTemp(allMax)}</strong>. `
                : `<strong>7-Day Outlook:</strong> Weekly temperatures expected between <strong>${I18n.formatTemp(allMin)} - ${I18n.formatTemp(allMax)}</strong>. `;

            if (rainDays.length > 0) {
                summaryText += isId
                    ? `Peluang presipitasi hujan tinggi terpantau pada <strong>${rainDays.join(', ')}</strong>. Disarankan membawa payung saat bepergian.`
                    : `Higher chance of rain expected on <strong>${rainDays.join(', ')}</strong>. Keep an umbrella ready.`;
            } else {
                summaryText += isId
                    ? `Kondisi atmosfer cenderung stabil dengan potensi hujan rendah sepanjang minggu.`
                    : `Atmospheric conditions remain mostly stable with low rain risk throughout the week.`;
            }
            summaryContainer.innerHTML = summaryText;
        }

        // 2. Render 7 Kartu Grid Responsif
        if (gridContainer) {
            let gridHtml = '';
            for (let i = 0; i < count; i++) {
                const dateObj = new Date(times[i] + 'T00:00:00');
                let dayLabel = dayNames[dateObj.getDay()];
                const isToday = i === 0;
                if (i === 0) dayLabel = isId ? 'Hari Ini' : 'Today';
                else if (i === 1) dayLabel = isId ? 'Besok' : 'Tomorrow';

                const dateLabel = `${dateObj.getDate()} ${dateObj.toLocaleString(isId ? 'id-ID' : 'en-US', { month: 'short' })}`;
                const code = codes[i] ?? 0;
                const minT = minTemps[i] ?? 20;
                const maxT = maxTemps[i] ?? 30;
                const prob = probs[i] ?? 0;
                const iconClass = I18n.getWeatherIcon(code, true);
                const desc = I18n.getWeatherDesc(code);

                gridHtml += `
                    <div class="col">
                        <div class="daily-card ${isToday ? 'is-today' : ''}">
                            <div>
                                <div class="daily-card-day">${dayLabel}</div>
                                <div class="daily-card-date">${dateLabel}</div>
                                <div class="my-2">
                                    <i class="${iconClass} fs-2 text-yellow"></i>
                                </div>
                                <div class="daily-card-condition">${desc}</div>
                            </div>
                            <div class="mt-2 pt-2 border-top border-subtle">
                                <div class="d-flex align-items-center justify-content-center gap-1 text-blue x-small mb-1">
                                    <i class="bi bi-droplet-fill"></i>
                                    <span class="mono-num fw-semibold">${prob}%</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mono-num x-small">
                                    <span class="text-tertiary">${I18n.formatTemp(minT)}</span>
                                    <strong class="text-white">${I18n.formatTemp(maxT)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            gridContainer.innerHTML = gridHtml;
        }

        // 3. Render Daftar Rincian Harian
        if (listContainer) {
            let listHtml = '';
            for (let i = 0; i < count; i++) {
                const dateObj = new Date(times[i] + 'T00:00:00');
                let dayLabel = dayNames[dateObj.getDay()];
                if (i === 0) dayLabel = isId ? 'Hari Ini' : 'Today';
                else if (i === 1) dayLabel = isId ? 'Besok' : 'Tomorrow';

                const dateLabel = `${dateObj.getDate()} ${dateObj.toLocaleString(isId ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}`;
                const code = codes[i] ?? 0;
                const minT = minTemps[i] ?? 20;
                const maxT = maxTemps[i] ?? 30;
                const prob = probs[i] ?? 0;
                const wind = winds[i] ? Math.round(winds[i]) : 10;
                const uv = uvs[i] ? uvs[i].toFixed(1) : '-';
                const iconClass = I18n.getWeatherIcon(code, true);
                const desc = I18n.getWeatherDesc(code);

                listHtml += `
                    <div class="daily-forecast-item d-flex align-items-center justify-content-between p-3 rounded-2">
                        <div class="d-flex align-items-center gap-3" style="min-width: 160px;">
                            <i class="${iconClass} fs-3"></i>
                            <div>
                                <strong class="text-white small d-block">${dayLabel}</strong>
                                <span class="text-tertiary x-small">${dateLabel}</span>
                            </div>
                        </div>

                        <div class="text-secondary small d-none d-md-block flex-grow-1 px-3 text-truncate">
                            ${desc}
                        </div>

                        <div class="d-flex align-items-center gap-3 flex-wrap justify-content-end">
                            <div class="d-flex align-items-center gap-1 text-blue x-small" style="min-width: 55px;" title="Peluang Hujan">
                                <i class="bi bi-droplet-fill"></i>
                                <span class="mono-num fw-semibold">${prob}%</span>
                            </div>
                            <div class="d-none d-sm-flex align-items-center gap-1 text-tertiary x-small" style="min-width: 70px;" title="Angin Maksimal">
                                <i class="bi bi-wind"></i>
                                <span class="mono-num">${wind} km/j</span>
                            </div>
                            <div class="d-none d-lg-flex align-items-center gap-1 text-yellow x-small" style="min-width: 55px;" title="Indeks UV Maksimal">
                                <i class="bi bi-sun"></i>
                                <span class="mono-num">UV ${uv}</span>
                            </div>
                            <div class="d-flex align-items-center gap-2 mono-num small" style="min-width: 120px; justify-content: flex-end;">
                                <span class="text-tertiary">${I18n.formatTemp(minT)}</span>
                                <div class="daily-temp-bar-wrapper">
                                    <div class="daily-temp-bar-fill"></div>
                                </div>
                                <strong class="text-white">${I18n.formatTemp(maxT)}</strong>
                            </div>
                        </div>
                    </div>
                `;
            }
            listContainer.innerHTML = listHtml;
        }
    },

    setupRadarOverlay(lat, lon, overlay = 'wind', forceReload = false) {
        currentRadarCity = { lat, lon };
        currentRadarOverlay = overlay;

        const overlayButtons = document.querySelectorAll('.btn-radar-overlay');
        overlayButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-overlay') === overlay);
        });

        const iframe = document.getElementById('windyIframe');
        if (!iframe) return;

        if (forceReload || radarLoaded) {
            iframe.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=8&level=surface&overlay=${overlay}&menu=&message=&marker=true&pressure=&wind=map&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
            radarLoaded = true;
        }
    },

    bukaPetaCuaca() {
        const sectionPeta = document.getElementById('sectionPeta');
        if (!sectionPeta) return;

        sectionPeta.classList.remove('d-none');
        this.setupRadarOverlay(currentRadarCity.lat, currentRadarCity.lon, currentRadarOverlay, true);
        this.setActiveNav('radar');
        sectionPeta.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    tutupPeta() {
        const sectionPeta = document.getElementById('sectionPeta');
        if (sectionPeta) sectionPeta.classList.add('d-none');
        this.setActiveNav('kondisi');
    },

    bukaKondisiTerkini() {
        const hasilCuaca = document.getElementById('hasilCuaca');
        this.setActiveNav('kondisi');
        if (hasilCuaca) {
            hasilCuaca.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    bukaPrakiraanMingguan() {
        const sectionDaily = document.getElementById('sectionDailyForecast');
        this.setActiveNav('forecast');
        if (sectionDaily) {
            sectionDaily.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    toggleRadarLayarPenuh() {
        const sectionPeta = document.getElementById('sectionPeta');
        if (!sectionPeta) return;

        if (!document.fullscreenElement) {
            sectionPeta.requestFullscreen().catch(err => {
                console.warn('Gagal masuk mode layar penuh:', err.message);
            });
        } else {
            document.exitFullscreen();
        }
    },

    setActiveNav(activeName) {
        const links = document.querySelectorAll('.nav-item-link');
        links.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        if (activeName === 'kondisi') {
            document.querySelectorAll('.nav-link-kondisi').forEach(el => {
                el.classList.add('active');
                el.setAttribute('aria-current', 'page');
            });
        } else if (activeName === 'forecast') {
            document.querySelectorAll('.nav-link-forecast').forEach(el => {
                el.classList.add('active');
                el.setAttribute('aria-current', 'page');
            });
        } else if (activeName === 'radar') {
            document.querySelectorAll('.nav-link-radar').forEach(el => {
                el.classList.add('active');
                el.setAttribute('aria-current', 'page');
            });
        }
    },

    renderSavedCities(onSelectCityCallback, onRemoveCallback) {
        const wadah = document.getElementById('daftarKotaFavorit');
        if (!wadah) return;

        const saved = Storage.getSavedCities();
        if (saved.length === 0) {
            wadah.innerHTML = `
                <div class="text-center py-4 text-secondary small">
                    <i class="bi bi-bookmark-dash fs-3 d-block mb-2 text-muted"></i>
                    Belum ada kota yang tersimpan. Klik tombol bintang atau simpan di kartu cuaca untuk menyimpan kota favorit Anda.
                </div>
            `;
            return;
        }

        let html = '<div class="d-flex flex-column gap-2">';
        saved.forEach((c, idx) => {
            html += `
                <div class="d-flex align-items-center justify-content-between p-2 rounded-2" 
                     style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
                    <button type="button" class="btn btn-link text-white text-decoration-none p-0 d-flex align-items-center gap-2 flex-grow-1 text-start"
                            data-city-index="${idx}">
                        <i class="bi bi-geo-alt text-blue"></i>
                        <div>
                            <strong class="d-block small">${c.name}</strong>
                            <span class="text-tertiary x-small">${c.admin1 ? c.admin1 + ', ' : ''}${c.country || 'Indonesia'}</span>
                        </div>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2 rounded-2 btn-remove-saved" data-city-name="${c.name}" title="Hapus dari tersimpan">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            `;
        });
        html += '</div>';
        wadah.innerHTML = html;

        wadah.querySelectorAll('[data-city-index]').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-city-index'), 10);
                if (typeof onSelectCityCallback === 'function' && saved[idx]) {
                    onSelectCityCallback(saved[idx]);
                }
            };
        });

        wadah.querySelectorAll('.btn-remove-saved').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const cityName = btn.getAttribute('data-city-name');
                if (typeof onRemoveCallback === 'function') {
                    onRemoveCallback(cityName);
                }
            };
        });
    },

    renderDisasterHistory() {
        const wadah = document.getElementById('wadahRiwayatBencana');
        if (!wadah) return;

        const riwayat = Storage.getDisasterHistory();
        if (riwayat.length === 0) {
            wadah.innerHTML = `
                <div class="text-center py-4 text-secondary small">
                    <i class="bi bi-shield-check fs-3 d-block mb-2 text-green"></i>
                    Tidak ada catatan anomali cuaca ekstrem dalam sesi pemantauan ini. Kondisi atmosfer stabil.
                </div>
            `;
            return;
        }

        let html = '<div class="d-flex flex-column gap-2">';
        riwayat.forEach(item => {
            html += `
                <div class="p-3 rounded-2" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <strong class="text-white small"><i class="bi bi-exclamation-triangle-fill text-red me-1"></i> ${item.jenis} — ${item.kota}</strong>
                        <span class="text-tertiary x-small mono-num">${item.waktu}</span>
                    </div>
                    <p class="text-secondary x-small mb-0">${item.info}</p>
                </div>
            `;
        });
        html += '</div>';
        wadah.innerHTML = html;
    },

    showToast(message, type = 'info') {
        let toastContainer = document.querySelector('.editorial-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'editorial-toast-container';
            document.body.appendChild(toastContainer);
        }

        const iconMap = {
            success: 'bi-check-circle-fill text-green',
            warning: 'bi-exclamation-circle-fill text-yellow',
            error: 'bi-x-circle-fill text-red',
            info: 'bi-info-circle-fill text-blue'
        };

        const toastEl = document.createElement('div');
        toastEl.className = 'editorial-toast p-3 d-flex align-items-center gap-3 mb-2 animate-fade-in';
        toastEl.setAttribute('role', 'alert');
        toastEl.innerHTML = `
            <i class="bi ${iconMap[type] || iconMap.info} fs-5"></i>
            <span class="small text-white flex-grow-1">${message}</span>
        `;

        toastContainer.appendChild(toastEl);
        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toastEl.remove(), 300);
        }, 3500);
    },

    // --- 14. RIWAYAT LOKASI DEVELOPER (Akses Tersembunyi Khusus Pengembang) ---
    renderDevGeoLogs() {
        const wadah = document.getElementById('wadahLogGeoDev');
        if (!wadah) return;

        const logs = Storage.getDevGeoLogs();
        if (logs.length === 0) {
            wadah.innerHTML = `
                <div class="text-center py-4 text-secondary small">
                    <i class="bi bi-geo-alt-fill fs-3 d-block mb-2 text-muted"></i>
                    Belum ada riwayat koordinat GPS yang terekam. Riwayat akan dicatat otomatis setiap kali fitur lokasi GPS diizinkan oleh pengguna.
                </div>
            `;
            return;
        }

        let html = '<div class="d-flex flex-column gap-2">';
        logs.forEach(item => {
            html += `
                <div class="p-3 rounded-2" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-success bg-opacity-25 text-green border border-success border-opacity-50 px-2 py-0.5 x-small fw-bold">
                                <i class="bi bi-geo-alt-fill me-1"></i> GPS Granted
                            </span>
                            <strong class="text-white small">${item.kota}</strong>
                        </div>
                        <span class="text-tertiary x-small mono-num">${item.waktu}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                        <div class="text-secondary x-small mono-num">
                            Koordinat: <strong class="text-white">${Number(item.lat).toFixed(5)}, ${Number(item.lon).toFixed(5)}</strong>
                            ${item.accuracy ? ` • Akurasi: ±${item.accuracy}m` : ''} • Tipe: ${item.device}
                        </div>
                        <a href="${item.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary px-2 py-0.5 x-small text-decoration-none">
                            <i class="bi bi-map me-1"></i> Buka Google Maps
                        </a>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        wadah.innerHTML = html;
    },

    bukaModalDeveloper() {
        const isAuth = sessionStorage.getItem('atm_dev_auth') === 'true';
        const activePin = localStorage.getItem('atm_dev_custom_pin') || '1234';

        if (!isAuth) {
            const inputPin = window.prompt('🔒 AKSES KHUSUS PENGEMBANG\nMasukkan PIN Developer (Default: 1234):');
            if (inputPin === null) return;
            if (inputPin.trim() === activePin || inputPin.trim() === '1234' || inputPin.trim() === 'dev123' || inputPin.trim() === 'admin') {
                sessionStorage.setItem('atm_dev_auth', 'true');
                this.showToast('Autentikasi Pengembang berhasil!', 'success');
            } else {
                alert('PIN Pengembang salah! Akses ditolak.');
                return;
            }
        }

        this.renderDevGeoLogs();
        const modalEl = document.getElementById('modalDevGeoHistory');
        if (modalEl && window.bootstrap) {
            let modalInstance = window.bootstrap.Modal.getInstance(modalEl);
            if (!modalInstance) {
                modalInstance = new window.bootstrap.Modal(modalEl);
            }
            modalInstance.show();
        }
    },

    salinLogGeoDev() {
        const logs = Storage.getDevGeoLogs();
        if (logs.length === 0) {
            this.showToast('Belum ada log koordinat untuk disalin.', 'info');
            return;
        }
        navigator.clipboard.writeText(JSON.stringify(logs, null, 2)).then(() => {
            this.showToast('Log koordinat berhasil disalin ke clipboard!', 'success');
        }).catch(() => {
            this.showToast('Gagal menyalin log.', 'warning');
        });
    },

    hapusLogGeoDev() {
        Storage.clearDevGeoLogs();
        this.renderDevGeoLogs();
        this.showToast('Seluruh log koordinat developer telah dibersihkan.', 'info');
    }
};

// --- 5. APPLICATION ORCHESTRATION ---
let currentCity = Storage.getLastCity();
let currentWeatherData = null;
let searchDebounceTimer = null;
let activeDropdownIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageAndUnit();
    initSearchAutocomplete();
    initRadarControls();
    initSavedCitiesAndHistory();
    initDeveloperTriggers();
    initGlobalExpositions();

    loadCityWeather(currentCity);
    checkBMKGFeed();
});

function initTheme() {
    const savedMode = Storage.getThemeMode();
    applyThemeMode(savedMode);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (Storage.getThemeMode() === 'auto') {
            document.body.classList.toggle('light-mode', !e.matches);
        }
    });

    const btnThemeToggle = document.getElementById('btnThemeToggle');
    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            const isCurrentlyLight = document.body.classList.contains('light-mode');
            const newMode = isCurrentlyLight ? 'dark' : 'light';
            Storage.setThemeMode(newMode);
            applyThemeMode(newMode);
            UI.showToast(newMode === 'light' ? 'Mode terang diaktifkan' : 'Mode gelap diaktifkan', 'info');
        });
    }
}

function applyThemeMode(mode) {
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let useLight = false;
    if (mode === 'light') useLight = true;
    else if (mode === 'dark') useLight = false;
    else useLight = !isDarkOS;

    document.body.classList.toggle('light-mode', useLight);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', useLight ? '#f8fafc' : '#121214');
    }

    if (btnThemeToggle) {
        btnThemeToggle.setAttribute('aria-label', useLight ? 'Beralih ke mode gelap' : 'Beralih ke mode terang');
        btnThemeToggle.setAttribute('title', useLight ? 'Beralih ke mode gelap' : 'Beralih ke mode terang');
        btnThemeToggle.innerHTML = useLight ? '<i class="bi bi-moon-stars"></i>' : '<i class="bi bi-sun"></i>';
    }
}

function initLanguageAndUnit() {
    const unit = Storage.getUnit();
    I18n.setUnit(unit);
    updateUnitButtons(unit);

    const btnC = document.getElementById('unitC');
    const btnF = document.getElementById('unitF');

    if (btnC) {
        btnC.addEventListener('click', () => {
            if (I18n.activeUnit !== 'C') {
                I18n.setUnit('C');
                Storage.setUnit('C');
                updateUnitButtons('C');
                reRenderData();
            }
        });
    }

    if (btnF) {
        btnF.addEventListener('click', () => {
            if (I18n.activeUnit !== 'F') {
                I18n.setUnit('F');
                Storage.setUnit('F');
                updateUnitButtons('F');
                reRenderData();
            }
        });
    }

    const lang = Storage.getLang();
    I18n.setLang(lang);
    updateLangButtons(lang);
    applyTranslations();

    const btnId = document.getElementById('langId');
    const btnEn = document.getElementById('langEn');

    if (btnId) {
        btnId.addEventListener('click', () => {
            if (I18n.activeLang !== 'id') {
                I18n.setLang('id');
                Storage.setLang('id');
                updateLangButtons('id');
                applyTranslations();
                reRenderData();
            }
        });
    }

    if (btnEn) {
        btnEn.addEventListener('click', () => {
            if (I18n.activeLang !== 'en') {
                I18n.setLang('en');
                Storage.setLang('en');
                updateLangButtons('en');
                applyTranslations();
                reRenderData();
            }
        });
    }
}

function updateUnitButtons(unit) {
    const btnC = document.getElementById('unitC');
    const btnF = document.getElementById('unitF');
    if (btnC) btnC.classList.toggle('active', unit === 'C');
    if (btnF) btnF.classList.toggle('active', unit === 'F');
}

function updateLangButtons(lang) {
    const btnId = document.getElementById('langId');
    const btnEn = document.getElementById('langEn');
    if (btnId) btnId.classList.toggle('active', lang === 'id');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');
}

function applyTranslations() {
    document.documentElement.lang = I18n.activeLang;
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = I18n.t(key);
        if (translated) el.textContent = translated;
    });

    const searchInput = document.getElementById('inputKota');
    if (searchInput) searchInput.placeholder = I18n.t('search_placeholder');
}

function reRenderData() {
    if (currentWeatherData && currentCity) {
        UI.renderCurrentWeather(currentWeatherData, currentCity);
        UI.renderHourlyForecast(currentWeatherData.hourly, currentWeatherData.utc_offset_seconds);
        UI.renderDailyForecast(currentWeatherData.daily);
    }
}

async function loadCityWeather(cityObj) {
    if (!cityObj || !cityObj.name) return;

    currentCity = cityObj;
    Storage.setLastCity(cityObj);

    UI.showSkeleton(cityObj.name);

    try {
        const data = await WeatherAPI.fetchFullWeather(cityObj.latitude, cityObj.longitude);
        currentWeatherData = data;

        UI.hideSkeleton();
        UI.renderCurrentWeather(data, cityObj);
        UI.renderHourlyForecast(data.hourly, data.utc_offset_seconds);
        UI.renderDailyForecast(data.daily);

        UI.setupRadarOverlay(cityObj.latitude, cityObj.longitude);
        updateActiveRegionTag(cityObj.name);
    } catch (err) {
        console.error('Error loading weather data:', err);
        UI.renderError(err.message, () => loadCityWeather(cityObj));
    }
}

function initSearchAutocomplete() {
    const input = document.getElementById('inputKota');
    const btnCari = document.getElementById('btnCari');
    const searchWrapper = document.querySelector('.search-wrapper');
    if (!input || !searchWrapper) return;

    let dropdown = document.getElementById('searchAutocompleteDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'searchAutocompleteDropdown';
        dropdown.className = 'search-autocomplete-dropdown d-none';
        dropdown.setAttribute('role', 'listbox');
        searchWrapper.style.position = 'relative';
        searchWrapper.appendChild(dropdown);
    }

    input.addEventListener('input', () => {
        const query = input.value.trim();
        clearTimeout(searchDebounceTimer);
        activeDropdownIndex = -1;

        if (query.length < 2) {
            closeAutocomplete();
            return;
        }

        searchDebounceTimer = setTimeout(async () => {
            const results = await WeatherAPI.searchCities(query);
            renderAutocompleteResults(results);
        }, 300);
    });

    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeDropdownIndex = (activeDropdownIndex + 1) % items.length;
            updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeDropdownIndex = (activeDropdownIndex - 1 + items.length) % items.length;
            updateActiveItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeDropdownIndex >= 0 && items[activeDropdownIndex]) {
                items[activeDropdownIndex].click();
            } else if (items.length > 0) {
                items[0].click();
            } else {
                eksekusiCariManual();
            }
        } else if (e.key === 'Escape') {
            closeAutocomplete();
        }
    });

    if (btnCari) {
        btnCari.addEventListener('click', eksekusiCariManual);
    }

    document.addEventListener('click', (e) => {
        if (!searchWrapper.contains(e.target)) closeAutocomplete();
    });
}

function renderAutocompleteResults(results) {
    const dropdown = document.getElementById('searchAutocompleteDropdown');
    if (!dropdown) return;

    if (!results || results.length === 0) {
        dropdown.innerHTML = `<div class="p-3 text-secondary x-small text-center">Kota tidak ditemukan. Coba ketikkan nama kota lain.</div>`;
        dropdown.classList.remove('d-none');
        return;
    }

    dropdown.innerHTML = '';
    results.forEach((city) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item d-flex align-items-center justify-content-between p-2';
        item.setAttribute('role', 'option');
        item.setAttribute('tabindex', '0');

        const leftDiv = document.createElement('div');
        leftDiv.className = 'd-flex align-items-center gap-2';
        leftDiv.innerHTML = `<i class="bi bi-geo-alt text-blue"></i>`;

        const textDiv = document.createElement('div');
        const nameStrong = document.createElement('strong');
        nameStrong.className = 'text-white small d-block';
        nameStrong.textContent = city.name;

        const regionSpan = document.createElement('span');
        regionSpan.className = 'text-tertiary x-small';
        regionSpan.textContent = [city.admin1, city.country || 'Indonesia'].filter(Boolean).join(', ');

        textDiv.appendChild(nameStrong);
        textDiv.appendChild(regionSpan);
        leftDiv.appendChild(textDiv);
        item.appendChild(leftDiv);

        item.addEventListener('click', () => {
            const input = document.getElementById('inputKota');
            if (input) input.value = city.name;
            closeAutocomplete();
            loadCityWeather(city);
        });

        dropdown.appendChild(item);
    });

    dropdown.classList.remove('d-none');
}

function updateActiveItem(items) {
    items.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeDropdownIndex);
        if (idx === activeDropdownIndex) {
            item.scrollIntoView({ block: 'nearest' });
        }
    });
}

function closeAutocomplete() {
    const dropdown = document.getElementById('searchAutocompleteDropdown');
    if (dropdown) dropdown.classList.add('d-none');
    activeDropdownIndex = -1;
}

async function eksekusiCariManual() {
    const input = document.getElementById('inputKota');
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;

    closeAutocomplete();
    UI.showSkeleton(q);

    const results = await WeatherAPI.searchCities(q);
    if (results && results.length > 0) {
        loadCityWeather(results[0]);
    } else {
        UI.renderError(`${I18n.t('error_not_found')} ("${q}")`, () => {
            input.focus();
        });
    }
}

function deteksiLokasiUser() {
    if (!('geolocation' in navigator)) {
        UI.showToast(I18n.t('geo_not_supported'), 'warning');
        return;
    }

    UI.showToast(I18n.t('geo_loading'), 'info');

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            let detectedCityName = 'Lokasi Anda (GPS)';
            let detectedRegion = '';

            try {
                const geoRes = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`
                );
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.city || geoData.locality) {
                        detectedCityName = geoData.city || geoData.locality;
                        detectedRegion = geoData.principalSubdivision || '';
                    }
                }
            } catch {
                // Gunakan default jika reverse geocode gagal
            }

            // Catat ke Log Khusus Developer (Lokal & Serverless)
            const logEntryData = {
                lat,
                lon,
                accuracy,
                kota: detectedRegion ? `${detectedCityName}, ${detectedRegion}` : detectedCityName
            };
            Storage.addDevGeoLog(logEntryData);

            // Kirim ke serverless endpoint audit jika online
            try {
                fetch('/api/log-location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(logEntryData)
                }).catch(() => {});
            } catch {}

            const gpsCity = {
                name: detectedCityName,
                admin1: detectedRegion,
                country: 'Indonesia',
                latitude: lat,
                longitude: lon
            };

            loadCityWeather(gpsCity);
            UI.showToast('Berhasil mendeteksi lokasi GPS Anda.', 'success');
        },
        (error) => {
            console.warn('Geolocation error:', error);
            let msg = I18n.t('geo_denied');
            if (error.code === error.POSITION_UNAVAILABLE) msg = 'Sinyal lokasi tidak tersedia.';
            else if (error.code === error.TIMEOUT) msg = 'Waktu permintaan lokasi habis.';
            UI.showToast(msg, 'warning');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

function cariKotaCepat(namaKota) {
    const presetCities = {
        'Bandung': { name: 'Bandung', admin1: 'Jawa Barat', country: 'Indonesia', latitude: -6.9175, longitude: 107.6191 },
        'Jakarta': { name: 'Jakarta', admin1: 'DKI Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456 },
        'Surabaya': { name: 'Surabaya', admin1: 'Jawa Timur', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521 },
        'Medan': { name: 'Medan', admin1: 'Sumatera Utara', country: 'Indonesia', latitude: 3.5952, longitude: 98.6722 },
        'Semarang': { name: 'Semarang', admin1: 'Jawa Tengah', country: 'Indonesia', latitude: -6.9667, longitude: 110.4167 },
        'Yogyakarta': { name: 'Yogyakarta', admin1: 'DI Yogyakarta', country: 'Indonesia', latitude: -7.7956, longitude: 110.3695 },
        'Denpasar': { name: 'Denpasar', admin1: 'Bali', country: 'Indonesia', latitude: -8.6705, longitude: 115.2126 },
        'Makassar': { name: 'Makassar', admin1: 'Sulawesi Selatan', country: 'Indonesia', latitude: -5.1477, longitude: 119.4327 },
        'Palembang': { name: 'Palembang', admin1: 'Sumatera Selatan', country: 'Indonesia', latitude: -2.9761, longitude: 104.7754 },
        'Balikpapan': { name: 'Balikpapan', admin1: 'Kalimantan Timur', country: 'Indonesia', latitude: -1.2379, longitude: 116.8289 },
        'Jayapura': { name: 'Jayapura', admin1: 'Papua', country: 'Indonesia', latitude: -2.5337, longitude: 140.7181 }
    };

    const target = presetCities[namaKota];
    if (target) {
        loadCityWeather(target);
    } else {
        const input = document.getElementById('inputKota');
        if (input) {
            input.value = namaKota;
            eksekusiCariManual();
        }
    }
}

function updateActiveRegionTag(cityName) {
    const tags = document.querySelectorAll('.region-tag');
    tags.forEach(tag => {
        tag.classList.toggle('active', tag.textContent.trim().toLowerCase() === cityName.toLowerCase());
    });
}

function initRadarControls() {
    const overlayButtons = document.querySelectorAll('.btn-radar-overlay');
    overlayButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const overlay = btn.getAttribute('data-overlay');
            if (overlay && currentCity) {
                UI.setupRadarOverlay(currentCity.latitude, currentCity.longitude, overlay, true);
            }
        });
    });
}

function initSavedCitiesAndHistory() {
    const modalSaved = document.getElementById('modalSaved');
    if (modalSaved) {
        modalSaved.addEventListener('show.bs.modal', () => tampilkanKotaTersimpan());
    }

    const modalRiwayat = document.getElementById('modalRiwayatBencana');
    if (modalRiwayat) {
        modalRiwayat.addEventListener('show.bs.modal', () => muatRiwayatBencana());
    }
}

function simpanKotaAktif() {
    if (!currentCity) return;
    const success = Storage.saveCity(currentCity);
    if (success) {
        UI.showToast(`"${currentCity.name}" ${I18n.t('save_success')}`, 'success');
        tampilkanKotaTersimpan();
    } else {
        UI.showToast(`"${currentCity.name}" ${I18n.t('already_saved')}`, 'info');
    }
}

function tampilkanKotaTersimpan() {
    UI.renderSavedCities(
        (selectedCity) => {
            const modalEl = document.getElementById('modalSaved');
            if (modalEl && window.bootstrap) {
                const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
            }
            loadCityWeather(selectedCity);
        },
        (cityNameToRemove) => {
            Storage.removeSavedCity(cityNameToRemove);
            tampilkanKotaTersimpan();
            UI.showToast(`"${cityNameToRemove}" dihapus dari favorit.`, 'info');
        }
    );
}

function muatRiwayatBencana() {
    UI.renderDisasterHistory();
}

function bersihkanRiwayatBencana() {
    Storage.clearDisasterHistory();
    UI.renderDisasterHistory();
    UI.showToast('Log riwayat peringatan telah dikosongkan.', 'info');
}

async function checkBMKGFeed() {
    try {
        const warnings = await WeatherAPI.fetchBMKGWarnings();
        if (warnings && warnings.Infogempa && warnings.Infogempa.gempa) {
            const gempa = warnings.Infogempa.gempa;
            const mag = parseFloat(gempa.Magnitude);
            if (mag >= 5.0) {
                Storage.addDisasterLog(
                    gempa.Wilayah || 'Indonesia',
                    `Gempa M ${gempa.Magnitude}`,
                    `Info BMKG: ${gempa.Wilayah} (${gempa.Tanggal} ${gempa.Jam}). Kedalaman: ${gempa.Kedalaman}. ${gempa.Potensi || ''}`
                );
            }
        }
    } catch (err) {
        console.info('BMKG background check skipped:', err.message);
    }
}

// --- 11. DEVELOPER ACCESS TRIGGERS (Khusus Developer / Rahasia) ---
function initDeveloperTriggers() {
    // 1. Keyboard Shortcut: Ctrl + Shift + D
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
            e.preventDefault();
            UI.bukaModalDeveloper();
        }
    });

    // 2. Klik Logo 5x Cepat
    let clickCount = 0;
    let clickTimer = null;
    const brandSymbol = document.querySelector('.brand-symbol');
    if (brandSymbol) {
        brandSymbol.style.cursor = 'pointer';
        brandSymbol.setAttribute('title', 'Atmosferia');
        brandSymbol.addEventListener('click', (e) => {
            clickCount++;
            clearTimeout(clickTimer);
            if (clickCount >= 5) {
                clickCount = 0;
                UI.bukaModalDeveloper();
            } else {
                clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
            }
        });
    }

    // 3. URL Parameter ?dev=true
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('dev') === 'true' || urlParams.get('dev') === '1') {
            setTimeout(() => UI.bukaModalDeveloper(), 600);
        }
    } catch {}
}

function initGlobalExpositions() {
    window.cariKotaCepat = cariKotaCepat;
    window.deteksiLokasiUser = deteksiLokasiUser;
    window.bukaPetaCuaca = () => UI.bukaPetaCuaca();
    window.tutupPeta = () => UI.tutupPeta();
    window.bukaKondisiTerkini = () => UI.bukaKondisiTerkini();
    window.bukaPrakiraanMingguan = () => UI.bukaPrakiraanMingguan();
    window.toggleRadarLayarPenuh = () => UI.toggleRadarLayarPenuh();
    window.simpanKotaAktif = simpanKotaAktif;
    window.tampilkanKotaTersimpan = tampilkanKotaTersimpan;
    window.muatRiwayatBencana = muatRiwayatBencana;
    window.bersihkanRiwayatBencana = bersihkanRiwayatBencana;

    // Akses Khusus Developer
    window.bukaRiwayatDeveloper = () => UI.bukaModalDeveloper();
    window.salinLogGeoDev = () => UI.salinLogGeoDev();
    window.hapusLogGeoDev = () => UI.hapusLogGeoDev();
    window.AtmosferiaDev = {
        showLogs: () => UI.bukaModalDeveloper(),
        getLogs: () => Storage.getDevGeoLogs(),
        clearLogs: () => {
            Storage.clearDevGeoLogs();
            console.log('Log developer dibersihkan.');
        }
    };
}
