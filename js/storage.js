// ==========================================================================
// Atmosferia - Storage Module (js/storage.js)
// Mengelola persistensi data di localStorage dan caching di sessionStorage
// ==========================================================================

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit

export const Storage = {
    // --- LocalStorage Helpers ---
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

    // --- User Preferences ---
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
        // Cegah duplikasi berturut-turut pada kota dan jenis yang sama
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

    // --- Developer-Only GPS Location Audit Logs ---
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
        if (logs.length > 50) logs.pop(); // simpan hingga 50 riwayat terakhir
        this.set('atm_dev_geo_logs', logs);
        return entry;
    },

    clearDevGeoLogs() {
        this.set('atm_dev_geo_logs', []);
    },

    // --- SessionStorage Caching (10 Menit) ---
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
            const payload = {
                timestamp: Date.now(),
                data: data
            };
            sessionStorage.setItem(`atm_cache_${key}`, JSON.stringify(payload));
        } catch (err) {
            console.warn('Gagal menyimpan cache sessionStorage:', err);
        }
    }
};

