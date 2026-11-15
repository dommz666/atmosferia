// ==========================================================================
// Atmosferia - Internationalization & Formatting Module (js/i18n.js)
// Kamus dwibahasa (ID/EN), format suhu, dan konversi WMO
// ==========================================================================

export const translations = {
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
        sun_title: 'Matahari dan Siklus Siang',
        vis_press_title: 'Jarak Pandang dan Tekanan',
        rain_prob_title: 'Peluang Hujan',
        uv_title: 'Indeks UV Maksimal',
        aqi_title: 'Kualitas Udara (AQI)',
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
        loading_text: 'Mengambil data stasiun atmosfer untuk',
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
        radar_temp: 'Suhu Udara',
        radar_clouds: 'Awan Satelit',
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
        vis_press_title: 'Visibility and Pressure',
        rain_prob_title: 'Rain Probability',
        uv_title: 'Peak UV Index',
        aqi_title: 'Air Quality (AQI)',
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
        loading_text: 'Fetching weather station data for',
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
        radar_temp: 'Air Temperature',
        radar_clouds: 'Satellite Clouds',
        disclaimer_text: 'Atmosferia provides modern weather observations powered by Open-Meteo numerical models and Windy embeds. It is not an official government disaster early warning channel.',
        disclaimer_link: 'Visit Official BMKG Portal (bmkg.go.id)',
        source_label: 'Data Sources: Open-Meteo (Keyless), BMKG, & Windy Community.'
    }
};

// Pemetaan WMO Weather Codes (WMO 4677 standard)
export const WMO_TABLE = {
    0:  { descID: 'Langit Cerah', descEN: 'Clear Sky', iconDay: 'bi-sun', iconNight: 'bi-moon-stars', type: 'clear' },
    1:  { descID: 'Sebagian Besar Cerah', descEN: 'Mainly Clear', iconDay: 'bi-cloud-sun', iconNight: 'bi-cloud-moon', type: 'clear' },
    2:  { descID: 'Sebagian Berawan', descEN: 'Partly Cloudy', iconDay: 'bi-cloud-sun', iconNight: 'bi-cloud-moon', type: 'clouds' },
    3:  { descID: 'Awan Mendung', descEN: 'Overcast', iconDay: 'bi-clouds', iconNight: 'bi-clouds', type: 'clouds' },
    45: { descID: 'Berkabut', descEN: 'Foggy', iconDay: 'bi-cloud-fog2', iconNight: 'bi-cloud-fog2', type: 'fog' },
    48: { descID: 'Kabut Tebal', descEN: 'Dense Fog', iconDay: 'bi-cloud-fog2', iconNight: 'bi-cloud-fog2', type: 'fog' },
    51: { descID: 'Gerimis Ringan', descEN: 'Light Drizzle', iconDay: 'bi-cloud-drizzle', iconNight: 'bi-cloud-drizzle', type: 'rain' },
    53: { descID: 'Gerimis Sedang', descEN: 'Moderate Drizzle', iconDay: 'bi-cloud-drizzle', iconNight: 'bi-cloud-drizzle', type: 'rain' },
    55: { descID: 'Gerimis Lebat', descEN: 'Dense Drizzle', iconDay: 'bi-cloud-drizzle', iconNight: 'bi-cloud-drizzle', type: 'rain' },
    61: { descID: 'Hujan Ringan', descEN: 'Slight Rain', iconDay: 'bi-cloud-rain', iconNight: 'bi-cloud-rain', type: 'rain' },
    63: { descID: 'Hujan Sedang', descEN: 'Moderate Rain', iconDay: 'bi-cloud-rain', iconNight: 'bi-cloud-rain', type: 'rain' },
    65: { descID: 'Hujan Lebat', descEN: 'Heavy Rain', iconDay: 'bi-cloud-rain-heavy', iconNight: 'bi-cloud-rain-heavy', type: 'rain' },
    80: { descID: 'Hujan Rintik-Rintik', descEN: 'Light Showers', iconDay: 'bi-cloud-sun-rain', iconNight: 'bi-cloud-moon-rain', type: 'rain' },
    81: { descID: 'Hujan Curah Sedang', descEN: 'Moderate Showers', iconDay: 'bi-cloud-rain', iconNight: 'bi-cloud-rain', type: 'rain' },
    82: { descID: 'Hujan Deras Terputus', descEN: 'Violent Showers', iconDay: 'bi-cloud-rain-heavy', iconNight: 'bi-cloud-rain-heavy', type: 'rain' },
    95: { descID: 'Badai Petir', descEN: 'Thunderstorm', iconDay: 'bi-cloud-lightning-rain', iconNight: 'bi-cloud-lightning-rain', type: 'storm' },
    96: { descID: 'Badai Petir dan Hujan Es', descEN: 'Thunderstorm with Hail', iconDay: 'bi-cloud-lightning-rain', iconNight: 'bi-cloud-lightning-rain', type: 'storm' },
    99: { descID: 'Badai Petir Ekstrem', descEN: 'Heavy Hailstorm', iconDay: 'bi-cloud-lightning-rain', iconNight: 'bi-cloud-lightning-rain', type: 'storm' }
};

export const I18n = {
    currentLang: 'id',
    currentUnit: 'C',

    init(lang, unit) {
        this.currentLang = lang || 'id';
        this.currentUnit = unit || 'C';
    },

    t(key) {
        const dict = translations[this.currentLang] || translations.id;
        return dict[key] !== undefined ? dict[key] : key;
    },

    formatTemp(celsiusVal) {
        if (celsiusVal === null || celsiusVal === undefined || isNaN(celsiusVal)) return '--°';
        if (this.currentUnit === 'F') {
            const f = (celsiusVal * 9 / 5) + 32;
            return `${Math.round(f)}°F`;
        }
        return `${Math.round(celsiusVal)}°C`;
    },

    getWmoInfo(code, isDay = 1) {
        const entry = WMO_TABLE[code] || WMO_TABLE[0];
        return {
            description: this.currentLang === 'en' ? entry.descEN : entry.descID,
            icon: isDay ? entry.iconDay : entry.iconNight,
            type: entry.type
        };
    },

    getTimezoneAbbr(utcOffsetSeconds) {
        if (utcOffsetSeconds === 25200) return 'WIB';
        if (utcOffsetSeconds === 28800) return 'WITA';
        if (utcOffsetSeconds === 32400) return 'WIT';
        const hours = utcOffsetSeconds / 3600;
        return `GMT${hours >= 0 ? '+' : ''}${hours}`;
    },

    formatCardinalWind(deg) {
        const id = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
        const en = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
        const idx = Math.round((deg % 360) / 45) % 8;
        return this.currentLang === 'en' ? en[idx] : id[idx];
    },

    getAqiCategory(aqi) {
        if (aqi === null || aqi === undefined || isNaN(aqi)) {
            return { label: '--', class: 'badge-secondary', desc: '--' };
        }
        if (aqi <= 50) {
            return { 
                label: this.currentLang === 'en' ? 'Good' : 'Baik', 
                class: 'badge-success', 
                color: 'var(--color-green)' 
            };
        }
        if (aqi <= 100) {
            return { 
                label: this.currentLang === 'en' ? 'Moderate' : 'Sedang', 
                class: 'badge-warning', 
                color: 'var(--color-yellow)' 
            };
        }
        if (aqi <= 150) {
            return { 
                label: this.currentLang === 'en' ? 'Unhealthy for Sensitive' : 'Sensitif', 
                class: 'badge-warning', 
                color: '#f97316' 
            };
        }
        return { 
            label: this.currentLang === 'en' ? 'Unhealthy' : 'Tidak Sehat', 
            class: 'badge-danger', 
            color: 'var(--color-red)' 
        };
    },

    getUvCategory(uv) {
        if (uv === null || uv === undefined || isNaN(uv)) return { label: '--', color: 'var(--text-secondary)' };
        if (uv <= 2) return { label: this.currentLang === 'en' ? 'Low' : 'Rendah', color: 'var(--color-green)' };
        if (uv <= 5) return { label: this.currentLang === 'en' ? 'Moderate' : 'Sedang', color: 'var(--color-yellow)' };
        if (uv <= 7) return { label: this.currentLang === 'en' ? 'High' : 'Tinggi', color: '#f97316' };
        if (uv <= 10) return { label: this.currentLang === 'en' ? 'Very High' : 'Sangat Tinggi', color: 'var(--color-red)' };
        return { label: this.currentLang === 'en' ? 'Extreme' : 'Ekstrem', color: '#9333ea' };
    },

    kapitalkanTeks(str) {
        if (!str) return '';
        return str.replace(/(?:^|[\s\-])\S/g, a => a.toUpperCase());
    }
};

