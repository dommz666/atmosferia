// ==========================================================================
// Atmosferia - Main Application Controller (js/app.js)
// Mengorkestrasi Storage, I18n, WeatherAPI, UI & Interaksi Pengguna
// ==========================================================================

import { Storage } from './storage.js';
import { I18n } from './i18n.js';
import { WeatherAPI } from './api.js';
import { UI } from './ui.js';

let currentCity = Storage.getLastCity();
let currentWeatherData = null;
let searchDebounceTimer = null;
let activeDropdownIndex = -1;

// --- 1. INISIALISASI APLIKASI ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageAndUnit();
    initSearchAutocomplete();
    initRadarControls();
    initSavedCitiesAndHistory();
    initDeveloperTriggers();
    initGlobalExpositions();

    // Muat cuaca kota terakhir yang tersimpan atau default (Bandung)
    loadCityWeather(currentCity);

    // Cek feed peringatan resmi BMKG di latar belakang
    checkBMKGFeed();
});

// --- 2. SISTEM TEMA GELAP / TERANG (Sesuai Preferensi Sistem & Tersimpan) ---
function initTheme() {
    const savedMode = Storage.getThemeMode(); // 'dark', 'light', 'auto'
    applyThemeMode(savedMode);

    // Pantau perubahan prefers-color-scheme dari sistem OS
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
    if (mode === 'light') {
        useLight = true;
    } else if (mode === 'dark') {
        useLight = false;
    } else { // auto
        useLight = !isDarkOS;
    }

    document.body.classList.toggle('light-mode', useLight);

    if (btnThemeToggle) {
        btnThemeToggle.setAttribute('aria-label', useLight ? 'Beralih ke mode gelap' : 'Beralih ke mode terang');
        btnThemeToggle.innerHTML = useLight ? '<i class="bi bi-moon-stars"></i>' : '<i class="bi bi-sun"></i>';
    }
}

// --- 3. SATUAN SUHU & BAHASA ---
function initLanguageAndUnit() {
    // Satuan Suhu (°C / °F)
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

    // Bahasa (ID / EN)
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
        if (translated) {
            el.textContent = translated;
        }
    });

    // Update placeholders
    const searchInput = document.getElementById('inputKota');
    if (searchInput) {
        searchInput.placeholder = I18n.t('search_placeholder');
    }
}

function reRenderData() {
    if (currentWeatherData && currentCity) {
        UI.renderCurrentWeather(currentWeatherData, currentCity);
        UI.renderHourlyForecast(currentWeatherData.hourly, currentWeatherData.utc_offset_seconds);
        UI.renderDailyForecast(currentWeatherData.daily);
    }
}

// --- 4. MUAT DATA CUACA KOTA ---
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

        // Sinkronisasi posisi radar dengan kota terpilih
        UI.setupRadarOverlay(cityObj.latitude, cityObj.longitude);

        // Update tag aktif kota cepat
        updateActiveRegionTag(cityObj.name);
    } catch (err) {
        console.error('Error loading weather data:', err);
        UI.renderError(err.message, () => loadCityWeather(cityObj));
    }
}

// --- 5. PENCARIAN KOTA BEBAS & AUTOCOMPLETE (Open-Meteo Geocoding) ---
function initSearchAutocomplete() {
    const input = document.getElementById('inputKota');
    const btnCari = document.getElementById('btnCari');
    const searchWrapper = document.querySelector('.search-wrapper');
    if (!input || !searchWrapper) return;

    // Buat wadah dropdown autocomplete jika belum ada
    let dropdown = document.getElementById('searchAutocompleteDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'searchAutocompleteDropdown';
        dropdown.className = 'search-autocomplete-dropdown d-none';
        dropdown.setAttribute('role', 'listbox');
        dropdown.setAttribute('aria-label', 'Saran nama kota');
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

        // Debounce 300ms untuk performa
        searchDebounceTimer = setTimeout(async () => {
            const results = await WeatherAPI.searchCities(query);
            renderAutocompleteResults(results);
        }, 300);
    });

    // Navigasi Keyboard (Arrow Down, Arrow Up, Enter, Escape)
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

    // Tutup dropdown saat klik di luar
    document.addEventListener('click', (e) => {
        if (!searchWrapper.contains(e.target)) {
            closeAutocomplete();
        }
    });
}

function renderAutocompleteResults(results) {
    const dropdown = document.getElementById('searchAutocompleteDropdown');
    if (!dropdown) return;

    if (!results || results.length === 0) {
        dropdown.innerHTML = `
            <div class="p-3 text-secondary x-small text-center">
                Kota tidak ditemukan. Coba ketikkan nama kota lain.
            </div>
        `;
        dropdown.classList.remove('d-none');
        return;
    }

    dropdown.innerHTML = '';
    results.forEach((city, idx) => {
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
        nameStrong.textContent = city.name; // Sanitasi input aman

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

// --- 6. GEOLOKASI PENGGUNA (Cek Lokasi Saya) ---
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
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`,
                    { signal: AbortSignal.timeout(4000) }
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
            if (error.code === error.POSITION_UNAVAILABLE) {
                msg = 'Sinyal lokasi tidak tersedia.';
            } else if (error.code === error.TIMEOUT) {
                msg = 'Waktu permintaan lokasi habis.';
            }
            UI.showToast(msg, 'warning');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

// --- 7. PILIHAN KOTA CEPAT (11 Kota Populer) ---
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
        if (tag.textContent.trim().toLowerCase() === cityName.toLowerCase()) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
}

// --- 8. KONTROL RADAR WINDY & OVERLAY SWITCHER ---
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

// --- 9. KOTA FAVORIT & RIWAYAT PERINGATAN BENCANA ---
function initSavedCitiesAndHistory() {
    // Render awal saat modal dibuka
    const modalSaved = document.getElementById('modalSaved');
    if (modalSaved) {
        modalSaved.addEventListener('show.bs.modal', () => {
            tampilkanKotaTersimpan();
        });
    }

    const modalRiwayat = document.getElementById('modalRiwayatBencana');
    if (modalRiwayat) {
        modalRiwayat.addEventListener('show.bs.modal', () => {
            muatRiwayatBencana();
        });
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
            // Tutup modal bootstrap jika terbuka
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

// --- 10. CEK PERINGATAN RESMI BMKG (Proxy Serverless /api/bmkg-warning) ---
async function checkBMKGFeed() {
    try {
        const warnings = await WeatherAPI.fetchBMKGWarnings();
        if (warnings && warnings.Infogempa && warnings.Infogempa.gempa) {
            const gempa = warnings.Infogempa.gempa;
            const mag = parseFloat(gempa.Magnitude);
            if (mag >= 5.0) {
                // Potensi gempa signifikan di Indonesia
                Storage.addDisasterLog(
                    gempa.Wilayah || 'Indonesia',
                    `Gempa M ${gempa.Magnitude}`,
                    `Info BMKG: ${gempa.Wilayah} (${gempa.Tanggal} ${gempa.Jam}). Kedalaman: ${gempa.Kedalaman}. ${gempa.Potensi || ''}`
                );
            }
        }
    } catch (err) {
        // BMKG check adalah pelengkap opsional; gagal diam tanpa mengganggu UX
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

// --- 12. GLOBAL WINDOW EXPOSITIONS (Kompatibilitas Lengkap untuk HTML Event Handlers) ---
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

