// State Aplikasi Atmosferia
let currentDataCurrent = null;
let currentDataForecast = null;
let currentUnit = localStorage.getItem('ln_unit') || 'C'; // 'C' or 'F'
let currentLang = localStorage.getItem('ln_lang') || 'id'; // 'id' or 'en'
let currentLoadedCity = 'Bandung';

const apiKey = '4efcaf23f5f6853f0ea9336d9849494b';

// DOM Elements
const inputKota = document.getElementById('inputKota');
const btnCari = document.getElementById('btnCari');
const btnGeo = document.getElementById('btnGeo');
const hasilCuaca = document.getElementById('hasilCuaca');
const pesanInfo = document.getElementById('pesanInfo');

const namaWilayah = document.getElementById('namaWilayah');
const waktuUpdate = document.getElementById('waktuUpdate');
const suhuCuaca = document.getElementById('suhuCuaca');
const terasaSeperti = document.getElementById('terasaSeperti');
const suhuMin = document.getElementById('suhuMin');
const suhuMax = document.getElementById('suhuMax');
const deskripsiCuaca = document.getElementById('deskripsiCuaca');
const ringkasanCuaca = document.getElementById('ringkasanCuaca');
const tempFillBar = document.getElementById('tempFillBar');

// Metrics
const kelembapan = document.getElementById('kelembapan');
const badgeKenyamanan = document.getElementById('badgeKenyamanan');
const kecepatanAngin = document.getElementById('kecepatanAngin');
const arahAnginTeks = document.getElementById('arahAnginTeks');
const compassNeedle = document.getElementById('compassNeedle');
const tekananUdara = document.getElementById('tekananUdara');
const jarakPandang = document.getElementById('jarakPandang');
const waktuTerbit = document.getElementById('waktuTerbit');
const waktuTerbenam = document.getElementById('waktuTerbenam');
const siklusMatahariTeks = document.getElementById('siklusMatahariTeks');
const ikonCuaca = document.getElementById('ikonCuaca');
const wadahPrakiraan = document.getElementById('wadahPrakiraan');
const windyIframe = document.getElementById('windyIframe');

// Kamus Translasi Editorial
const translations = {
    id: {
        app_tagline: 'Prakiraan Cuaca Nusantara',
        search_placeholder: 'Cari nama kota (misal: Bandung, Jakarta, Denpasar)...',
        search_btn: 'Cari Kota',
        btn_gps_title: 'Deteksi Lokasi GPS Anda',
        region_title: 'Pilihan Kota:',
        feels_like: 'Terasa seperti',
        min: 'Min',
        max: 'Maks',
        daily_briefing: 'Ringkasan dan Rekomendasi Hari Ini',
        humidity_title: 'Kelembapan Udara',
        wind_title: 'Angin Permukaan',
        sun_title: 'Matahari dan Siklus Siang',
        vis_press_title: 'Jarak Pandang dan Tekanan Udara',
        hourly_forecast: 'Prakiraan Cuaca per Jam',
        hourly_desc: 'Pergerakan suhu dan kondisi tiap 3 jam',
        btn_view_radar: 'Buka Radar Peta',
        saved_title: 'Daftar Kota Tersimpan',
        btn_save_city: 'Simpan Kota Ini',
        history_title: 'Log Peringatan Bencana',
        history_clear: 'Kosongkan Log',
        modal_close: 'Tutup',
        menu_title: 'Layanan dan Informasi Khusus',
        radar_label: 'Radar Satelit Cuaca',
        radar_desc: 'Pantauan langsung pergerakan awan konvektif, angin, dan hujan di Nusantara.',
        video_label: 'Video Analisis BMKG',
        video_desc: 'Laporan visual dinamika atmosfer dan edukasi kesiapsiagaan.',
        alert_label: 'Siaga Cuaca Buruk',
        alert_desc: 'Protokol darurat bencana hidrometeorologi dan kontak pertolongan.',
        cyclone_label: 'Siklon Tropis dan Topan',
        cyclone_desc: 'Pemantauan bibit siklon di Samudera Hindia dan Pasifik.',
        bmkg_label: 'Stasiun Resmi BMKG',
        bmkg_desc: 'Data prakiraan resmi tingkat kecamatan dan kelurahan BMKG.',
        view_link: 'Lihat Selengkapnya',
        loading_text: 'Mengambil data stasiun cuaca untuk',
        error_not_found: 'Kota tidak ditemukan. Periksa kembali ejaan nama kota.',
        save_success: 'tersimpan ke daftar favorit.',
        already_saved: 'sudah ada di daftar favorit.',
        geo_not_supported: 'Perangkat tidak mendukung deteksi lokasi.',
        geo_denied: 'Izin lokasi tidak diberikan.',
        geo_loading: 'Mendeteksi titik koordinat Anda...'
    },
    en: {
        app_tagline: 'Indonesian Weather Portal',
        search_placeholder: 'Search city (e.g. Bandung, Jakarta, Bali)...',
        search_btn: 'Search',
        btn_gps_title: 'Detect GPS Location',
        region_title: 'Popular Cities:',
        feels_like: 'Feels like',
        min: 'Min',
        max: 'Max',
        daily_briefing: 'Daily Summary and Recommendation',
        humidity_title: 'Relative Humidity',
        wind_title: 'Surface Wind',
        sun_title: 'Daylight Cycle',
        vis_press_title: 'Visibility and Pressure',
        hourly_forecast: 'Hourly Trend Forecast',
        hourly_desc: '3-hour temperature & sky projection',
        btn_view_radar: 'View on Radar Map',
        saved_title: 'Saved Locations',
        btn_save_city: 'Save Current City',
        history_title: 'Alert History Log',
        history_clear: 'Clear Log',
        modal_close: 'Close',
        menu_title: 'Specialized Meteorological Services',
        radar_label: 'Satellite Radar Map',
        radar_desc: 'Live observation of clouds, wind vectors, and precipitation.',
        video_label: 'Meteorology Videos',
        video_desc: 'Visual briefings, atmosphere analysis, and mitigation guides.',
        alert_label: 'Severe Weather Warning',
        alert_desc: 'Hydrometeorological protocols and direct hotlines.',
        cyclone_label: 'Tropical Cyclones',
        cyclone_desc: 'Oceanic depression tracking in Indian and Pacific oceans.',
        bmkg_label: 'Official BMKG Stations',
        bmkg_desc: 'Official administrative village-level BMKG forecasts.',
        view_link: 'View Details',
        loading_text: 'Fetching weather station data for',
        error_not_found: 'City not found. Please verify spelling.',
        save_success: 'saved to favorite locations.',
        already_saved: 'is already in your saved locations.',
        geo_not_supported: 'Geolocation not supported by this device.',
        geo_denied: 'Location permission denied.',
        geo_loading: 'Detecting your coordinates...'
    }
};

// Formatting & Conversion Helpers
function formatTemp(celsiusVal) {
    if (celsiusVal === null || celsiusVal === undefined || isNaN(celsiusVal)) return '--°';
    if (currentUnit === 'F') {
        const f = (celsiusVal * 9 / 5) + 32;
        return `${Math.round(f)}°F`;
    }
    return `${Math.round(celsiusVal)}°C`;
}

function setUnit(unit) {
    currentUnit = unit;
    localStorage.setItem('ln_unit', unit);
    updateUnitButtons();
    if (currentDataCurrent) {
        tampilkanData(currentDataCurrent, currentDataForecast);
    }
}

function updateUnitButtons() {
    const btnC = document.getElementById('unitC');
    const btnF = document.getElementById('unitF');
    if (btnC && btnF) {
        if (currentUnit === 'C') {
            btnC.classList.add('active');
            btnF.classList.remove('active');
        } else {
            btnF.classList.add('active');
            btnC.classList.remove('active');
        }
    }
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ln_lang', lang);
    updateLanguageButtons();
    applyLanguageTranslations();
    if (currentLoadedCity && currentDataCurrent) {
        ambilDataCuaca(currentLoadedCity);
    }
}

function updateLanguageButtons() {
    const btnId = document.getElementById('langId');
    const btnEn = document.getElementById('langEn');
    if (btnId && btnEn) {
        if (currentLang === 'id') {
            btnId.classList.add('active');
            btnEn.classList.remove('active');
        } else {
            btnEn.classList.add('active');
            btnId.classList.remove('active');
        }
    }
}

function applyLanguageTranslations() {
    const t = translations[currentLang] || translations.id;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    if (inputKota) inputKota.placeholder = t.search_placeholder;
}

// Convert wind degrees to cardinal text
function arahMataAngin(deg) {
    const cardID = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
    const cardEN = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    const idx = Math.round(deg / 45) % 8;
    return currentLang === 'en' ? cardEN[idx] : cardID[idx];
}

// Format each word with capital letter (e.g. "awan mendung" -> "Awan Mendung", "hujan rintik-rintik" -> "Hujan Rintik-Rintik")
function kapitalkanTeks(str) {
    if (!str) return '';
    return str.replace(/(?:^|[\s\-])\S/g, function(a) {
        return a.toUpperCase();
    });
}

// Natural Editorial Weather Briefing Generator
function buatRingkasanCuaca(data) {
    const temp = Math.round(data.main.temp);
    const cond = data.weather[0].main.toLowerCase();
    const hum = data.main.humidity;
    const windKm = (data.wind.speed * 3.6).toFixed(1);
    const kota = data.name;

    if (currentLang === 'en') {
        if (cond.includes('thunderstorm')) {
            return `Severe thunderstorm detected in ${kota}. Strong gusts of up to ${windKm} km/h are likely. Stay indoors and avoid sheltering under trees.`;
        } else if (cond.includes('rain') || cond.includes('drizzle')) {
            return `Rainfall currently affecting ${kota} at ${temp}°C with ${hum}% humidity. Roads are damp; keep an umbrella handy if heading out.`;
        } else if (cond.includes('clear')) {
            return `Clear skies over ${kota} at ${temp}°C. Comfortable outdoor conditions with gentle breezes at ${windKm} km/h.`;
        } else {
            return `Overcast to partly cloudy skies in ${kota} with a temperature of ${temp}°C. Steady atmospheric conditions for daily activities.`;
        }
    } else {
        if (cond.includes('thunderstorm')) {
            return `Terdeteksi potensi badai petir di wilayah ${kota}. Kecepatan angin mencapai ${windKm} km/j. Sangat disarankan berteduh di dalam bangunan permanen dan hindari tempat terbuka.`;
        } else if (cond.includes('rain') || cond.includes('drizzle')) {
            return `Hujan sedang berlangsung di ${kota} dengan suhu ${temp}°C dan kelembapan ${hum}%. Waspadai jalanan licin dan jarak pandang yang sedikit berkurang saat berkendara.`;
        } else if (cond.includes('clear')) {
            return `Langit cerah membentang di atas ${kota} dengan suhu ${temp}°C. Suasana sangat nyaman untuk beraktivitas luar ruangan ditemani semilir angin ${windKm} km/j.`;
        } else {
            return `Kondisi langit di ${kota} terpantau teduh dan berawan pada suhu ${temp}°C. Udara terasa bersahabat untuk kegiatan harian Anda.`;
        }
    }
}

// Icon mapper with day/night awareness
function pilihIkonCuaca(weatherCode, iconStr) {
    const isNight = iconStr && iconStr.endsWith('n');

    switch (weatherCode) {
        case 'Clear':
            return isNight ? 'bi-moon-stars' : 'bi-sun';
        case 'Clouds':
            if (iconStr === '02d') return 'bi-cloud-sun';
            if (iconStr === '02n') return 'bi-cloud-moon';
            if (iconStr === '03d' || iconStr === '03n') return 'bi-cloud';
            return 'bi-clouds';
        case 'Rain':
            if (iconStr === '10d') return 'bi-cloud-sun-rain';
            if (iconStr === '10n') return 'bi-cloud-moon-rain';
            return 'bi-cloud-rain-heavy';
        case 'Drizzle':
            return 'bi-cloud-drizzle';
        case 'Thunderstorm':
            return 'bi-cloud-lightning-rain';
        case 'Snow':
            return 'bi-snow';
        case 'Mist':
        case 'Haze':
        case 'Fog':
            return 'bi-cloud-haze2';
        case 'Tornado':
        case 'Squall':
            return 'bi-tornado';
        default:
            return isNight ? 'bi-moon' : 'bi-cloud-sun';
    }
}

// Subdued theme switcher
function pilihWarnaIkon(weatherCode, iconStr) {
    const isNight = iconStr && iconStr.endsWith('n');
    const weather = (weatherCode || '').toLowerCase();

    if (weather.includes('rain') || weather.includes('drizzle')) {
        return 'text-blue';
    } else if (weather.includes('thunderstorm')) {
        return 'text-yellow';
    } else if (weather.includes('clear')) {
        return isNight ? 'text-white' : 'text-yellow';
    } else if (weather.includes('cloud')) {
        return isNight ? 'text-secondary' : 'text-blue';
    } else {
        return 'text-secondary';
    }
}

function getWaktuLokalKota(offsetSec) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (offsetSec * 1000));
}

// Dynamic Weather & Time Theme Switcher (Menyesuaikan cuaca dan waktu kota secara otomatis)
function ubahTemaCuaca(data) {
    const bodyEl = document.body;
    bodyEl.classList.remove(
        'theme-rain-day', 'theme-rain-night',
        'theme-storm-day', 'theme-storm-night',
        'theme-clouds-day', 'theme-clouds-night',
        'theme-clear-morning', 'theme-clear-day', 'theme-clear-sunset', 'theme-clear-night',
        'theme-fog-day', 'theme-fog-night',
        'theme-rain', 'theme-clear', 'theme-clouds', 'theme-storm'
    );

    if (!data || !data.weather || !data.weather[0]) return;

    const weatherCode = data.weather[0].main || '';
    const weatherDesc = weatherCode.toLowerCase();
    const iconStr = data.weather[0].icon || '';


    const timezoneOffset = data.timezone !== undefined ? data.timezone : 25200;
    const localDate = getWaktuLokalKota(timezoneOffset);
    const hour = localDate.getHours();
    const minute = localDate.getMinutes();
    const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    // Tentukan waktu siang/malam/senja/pagi
    const isNightByIcon = iconStr.endsWith('n');
    const isNight = isNightByIcon || (hour < 6 || hour >= 18);
    const isMorning = (hour >= 5 && hour < 8);
    const isSunset = (hour >= 16 && hour < 18);

    let themeClass = 'theme-clear-day';
    let suasanaID = 'Siang Cerah';
    let suasanaEN = 'Clear Daytime';

    if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) {
        if (!isNight) {
            // Seperti permintaan: Hujan di siang hari membuat tema bernuansa hujan dan agak gelap
            themeClass = 'theme-rain-day';
            suasanaID = 'Siang Hujan (Redup)';
            suasanaEN = 'Rainy Daytime (Overcast)';
        } else {
            themeClass = 'theme-rain-night';
            suasanaID = 'Malam Hujan (Gelap Basah)';
            suasanaEN = 'Rainy Night';
        }
    } else if (weatherDesc.includes('thunderstorm')) {
        if (!isNight) {
            themeClass = 'theme-storm-day';
            suasanaID = 'Siang Badai Petir (Gelap)';
            suasanaEN = 'Daytime Thunderstorm';
        } else {
            themeClass = 'theme-storm-night';
            suasanaID = 'Malam Badai Petir';
            suasanaEN = 'Stormy Night';
        }
    } else if (weatherDesc.includes('cloud')) {
        if (!isNight) {
            themeClass = 'theme-clouds-day';
            suasanaID = 'Siang Berawan (Redup Teduh)';
            suasanaEN = 'Cloudy Daytime (Subdued)';
        } else {
            themeClass = 'theme-clouds-night';
            suasanaID = 'Malam Berawan';
            suasanaEN = 'Cloudy Night';
        }
    } else if (weatherDesc.includes('clear')) {
        if (isMorning) {
            themeClass = 'theme-clear-morning';
            suasanaID = 'Pagi Cerah (Segar)';
            suasanaEN = 'Crisp Morning';
        } else if (isSunset) {
            themeClass = 'theme-clear-sunset';
            suasanaID = 'Sore Cerah (Senja)';
            suasanaEN = 'Sunset Golden Hour';
        } else if (!isNight) {
            themeClass = 'theme-clear-day';
            suasanaID = 'Siang Cerah';
            suasanaEN = 'Clear Daylight';
        } else {
            themeClass = 'theme-clear-night';
            suasanaID = 'Malam Cerah (Langit Bersih)';
            suasanaEN = 'Clear Night';
        }
    } else if (weatherDesc.includes('mist') || weatherDesc.includes('fog') || weatherDesc.includes('haze') || weatherDesc.includes('smoke')) {
        if (!isNight) {
            themeClass = 'theme-fog-day';
            suasanaID = 'Siang Berkabut';
            suasanaEN = 'Hazy Daytime';
        } else {
            themeClass = 'theme-fog-night';
            suasanaID = 'Malam Berkabut';
            suasanaEN = 'Misty Night';
        }
    } else {
        themeClass = isNight ? 'theme-clear-night' : 'theme-clear-day';
        suasanaID = isNight ? 'Malam Hari' : 'Siang Hari';
        suasanaEN = isNight ? 'Nighttime' : 'Daytime';
    }

    bodyEl.classList.add(themeClass);

    // Perbarui lencana suasana kota di tampilan utama
    const suasanaEl = document.getElementById('suasanaKota');
    if (suasanaEl) {
        const suasanaText = currentLang === 'en' ? suasanaEN : suasanaID;
        let iconAtmosphere = 'bi-sun';
        if (isNight) {
            iconAtmosphere = 'bi-moon-stars';
        } else if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) {
            iconAtmosphere = 'bi-cloud-rain';
        } else if (weatherDesc.includes('thunderstorm')) {
            iconAtmosphere = 'bi-cloud-lightning-rain';
        } else if (weatherDesc.includes('cloud')) {
            iconAtmosphere = 'bi-cloud';
        } else if (isMorning || isSunset) {
            iconAtmosphere = 'bi-sunset';
        }

        suasanaEl.innerHTML = `<i class="bi ${iconAtmosphere} me-1"></i> ${timeFormatted} • ${suasanaText}`;
        suasanaEl.title = `Waktu lokal di ${data.name}: ${timeFormatted}`;
    }
}

// Editorial Toast Notification
function tampilkanToast(pesan, tipe = 'info') {
    let wadah = document.querySelector('.editorial-toast-container');
    if (!wadah) {
        wadah = document.createElement('div');
        wadah.className = 'editorial-toast-container';
        document.body.appendChild(wadah);
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'editorial-toast p-3 d-flex align-items-center gap-2 mb-2';
    
    let iconClass = 'bi-info-circle text-blue';
    if (tipe === 'success') iconClass = 'bi-check2-circle text-green';
    if (tipe === 'danger') iconClass = 'bi-exclamation-triangle text-red';

    toastEl.innerHTML = `
        <i class="bi ${iconClass} fs-5"></i>
        <div class="small text-white flex-grow-1">${pesan}</div>
        <button type="button" class="btn-close btn-close-white btn-sm" aria-label="Close"></button>
    `;

    wadah.appendChild(toastEl);
    toastEl.querySelector('.btn-close').addEventListener('click', () => toastEl.remove());
    setTimeout(() => { if (toastEl.parentNode) toastEl.remove(); }, 4000);
}

// Fetch Weather Data
async function ambilDataCuaca(kota) {
    const t = translations[currentLang] || translations.id;
    try {
        pesanInfo.innerHTML = `
            <div class="spinner-border text-secondary" role="status" style="width: 2rem; height: 2rem;"></div>
            <p class="mt-2 text-tertiary small">${t.loading_text} <strong>${kota}</strong>...</p>
        `;

        let urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(kota)},ID&units=metric&lang=${currentLang}&appid=${apiKey}`;
        let urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(kota)},ID&units=metric&lang=${currentLang}&appid=${apiKey}`;

        let [resCurrent, resForecast] = await Promise.all([fetch(urlCurrent), fetch(urlForecast)]);

        if (!resCurrent.ok) {
            urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(kota)}&units=metric&lang=${currentLang}&appid=${apiKey}`;
            urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(kota)}&units=metric&lang=${currentLang}&appid=${apiKey}`;
            [resCurrent, resForecast] = await Promise.all([fetch(urlCurrent), fetch(urlForecast)]);
        }

        if (!resCurrent.ok) throw new Error(t.error_not_found);

        const dataCurrent = await resCurrent.json();
        const dataForecast = resForecast.ok ? await resForecast.json() : null;

        currentDataCurrent = dataCurrent;
        currentDataForecast = dataForecast;
        currentLoadedCity = dataCurrent.name;

        tampilkanData(dataCurrent, dataForecast);
        deteksiPotensiBencana(dataCurrent);
        updatePetaKoordinat(dataCurrent.coord.lat, dataCurrent.coord.lon);
        tandaiTagKotaAktif(dataCurrent.name);

    } catch (error) {
        pesanInfo.innerHTML = `
            <div class="editorial-card text-center mx-auto" style="max-width: 440px;">
                <i class="bi bi-geo-alt text-clay fs-2 d-block mb-2"></i>
                <h6 class="text-white fw-bold mb-1">${t.error_not_found}</h6>
                <p class="text-tertiary x-small mb-0">${error.message}</p>
            </div>
        `;
        hasilCuaca.classList.add('d-none');
    }
}

// GPS Geolocation Handler
async function ambilDataCuacaKoordinat(lat, lon) {
    const t = translations[currentLang] || translations.id;
    try {
        pesanInfo.innerHTML = `
            <div class="spinner-border text-secondary" role="status" style="width: 2rem; height: 2rem;"></div>
            <p class="mt-2 text-tertiary small">${t.geo_loading}</p>
        `;

        const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${currentLang}&appid=${apiKey}`;
        const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=${currentLang}&appid=${apiKey}`;

        const [resCurrent, resForecast] = await Promise.all([fetch(urlCurrent), fetch(urlForecast)]);
        if (!resCurrent.ok) throw new Error(t.error_not_found);

        const dataCurrent = await resCurrent.json();
        const dataForecast = resForecast.ok ? await resForecast.json() : null;

        currentDataCurrent = dataCurrent;
        currentDataForecast = dataForecast;
        currentLoadedCity = dataCurrent.name;

        if (inputKota) inputKota.value = dataCurrent.name;
        tampilkanData(dataCurrent, dataForecast);
        deteksiPotensiBencana(dataCurrent);
        updatePetaKoordinat(lat, lon);
        tandaiTagKotaAktif(dataCurrent.name);

    } catch (error) {
        tampilkanToast(error.message, 'danger');
        pesanInfo.innerHTML = '';
    }
}

// Main Render Function
function tampilkanData(data, forecast) {
    const t = translations[currentLang] || translations.id;
    const country = data.sys && data.sys.country ? data.sys.country : '';

    namaWilayah.textContent = `${data.name}${country ? ', ' + country : ''}`;
    
    const timeFormatted = new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });
    waktuUpdate.textContent = `${currentLang === 'en' ? 'Observed at' : 'Pembaruan data'} ${timeFormatted}`;

    suhuCuaca.textContent = formatTemp(data.main.temp);
    terasaSeperti.textContent = `${t.feels_like} ${formatTemp(data.main.feels_like)}`;
    suhuMin.textContent = formatTemp(data.main.temp_min);
    suhuMax.textContent = formatTemp(data.main.temp_max);
    deskripsiCuaca.textContent = kapitalkanTeks(data.weather[0].description);

    // Editorial Briefing Card
    if (ringkasanCuaca) {
        ringkasanCuaca.textContent = buatRingkasanCuaca(data);
    }

    // Temperature Spectrum Bar Position
    if (tempFillBar) {
        const minT = data.main.temp_min;
        const maxT = data.main.temp_max;
        const curT = data.main.temp;
        let pct = 50;
        if (maxT > minT) {
            pct = Math.max(10, Math.min(90, Math.round(((curT - minT) / (maxT - minT)) * 100)));
        }
        tempFillBar.style.width = `${pct}%`;
    }

    // Metrics Station
    // 1. Humidity & Comfort Badge
    kelembapan.textContent = `${data.main.humidity}%`;
    if (badgeKenyamanan) {
        const hum = data.main.humidity;
        if (hum < 50) {
            badgeKenyamanan.className = 'metric-badge badge-comfort-good';
            badgeKenyamanan.textContent = currentLang === 'en' ? 'Comfortable / Dry' : 'Kering & Nyaman';
        } else if (hum <= 75) {
            badgeKenyamanan.className = 'metric-badge badge-comfort-humid';
            badgeKenyamanan.textContent = currentLang === 'en' ? 'Moderate Tropical' : 'Tropis Ideal';
        } else {
            badgeKenyamanan.className = 'metric-badge badge-comfort-high';
            badgeKenyamanan.textContent = currentLang === 'en' ? 'High Humidity' : 'Sangat Lembap';
        }
    }

    // 2. Wind & Compass
    const windSpeedKm = (data.wind.speed * 3.6).toFixed(1);
    kecepatanAngin.textContent = `${windSpeedKm} km/j`;
    const deg = data.wind.deg || 0;
    if (arahAnginTeks) {
        arahAnginTeks.textContent = `${arahMataAngin(deg)} (${deg}°)`;
    }
    if (compassNeedle) {
        compassNeedle.style.transform = `rotate(${deg}deg)`;
    }

    // 3. Sun & Daylight
    if (waktuTerbit && data.sys.sunrise) {
        waktuTerbit.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (waktuTerbenam && data.sys.sunset) {
        waktuTerbenam.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (siklusMatahariTeks && data.sys.sunrise && data.sys.sunset) {
        const nowSec = Date.now() / 1000;
        if (nowSec >= data.sys.sunrise && nowSec <= data.sys.sunset) {
            siklusMatahariTeks.textContent = currentLang === 'en' ? 'Daylight in progress' : 'Matahari di atas horizon';
        } else {
            siklusMatahariTeks.textContent = currentLang === 'en' ? 'Nighttime' : 'Malam hari';
        }
    }

    // 4. Pressure & Visibility
    tekananUdara.textContent = `${data.main.pressure} hPa`;
    jarakPandang.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Weather Icon & Theme
    const mainWeather = data.weather[0].main;
    const iconCode = data.weather[0].icon;
    ikonCuaca.className = `bi ${pilihIkonCuaca(mainWeather, iconCode)} display-3 ${pilihWarnaIkon(mainWeather, iconCode)}`;
    ubahTemaCuaca(data);

    // Hourly Forecast Strip
    if (forecast && forecast.list) {
        wadahPrakiraan.innerHTML = forecast.list.slice(0, 8).map((item, idx) => {
            const timeStr = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const itemIcon = pilihIkonCuaca(item.weather[0].main, item.weather[0].icon);
            const descFormatted = kapitalkanTeks(item.weather[0].description);
            return `
                <div class="timeline-hour-card flex-shrink-0 ${idx === 0 ? 'is-now' : ''}">
                    <span class="text-tertiary x-small d-block mb-1">${idx === 0 ? (currentLang === 'en' ? 'Now' : 'Saat ini') : timeStr}</span>
                    <i class="bi ${itemIcon} fs-5 d-block my-2 text-blue"></i>
                    <strong class="text-white d-block fs-6 mono-num mb-1">${formatTemp(item.main.temp)}</strong>
                    <span class="timeline-condition text-tertiary x-small text-truncate d-block" style="max-width: 90px;" title="${descFormatted}">
                        ${descFormatted}
                    </span>
                </div>
            `;
        }).join('');
    }

    pesanInfo.innerHTML = '';
    hasilCuaca.classList.remove('d-none');
}

function tandaiTagKotaAktif(namaKota) {
    document.querySelectorAll('.region-tag').forEach(tag => {
        if (tag.textContent.trim().toLowerCase() === namaKota.toLowerCase()) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
}

function cariKotaCepat(namaKota) {
    if (inputKota) inputKota.value = namaKota;
    ambilDataCuaca(namaKota);
}

function updatePetaKoordinat(lat, lon) {
    if (windyIframe) {
        windyIframe.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=8&level=surface&overlay=wind&menu=&message=&marker=true&pressure=&wind=map&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
    }
}

// Nav Active State Controller
function setActiveNav(navKey) {
    const linksKondisi = document.querySelectorAll('.nav-link-kondisi');
    const linksRadar = document.querySelectorAll('.nav-link-radar');

    if (navKey === 'radar') {
        linksRadar.forEach(el => el.classList.add('active'));
        linksKondisi.forEach(el => el.classList.remove('active'));
    } else {
        linksKondisi.forEach(el => el.classList.add('active'));
        linksRadar.forEach(el => el.classList.remove('active'));
    }
}

function bukaKondisiTerkini() {
    setActiveNav('kondisi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bukaPetaCuaca() {
    const secPeta = document.getElementById('sectionPeta');
    if (secPeta) {
        secPeta.classList.remove('d-none');
        setTimeout(() => {
            secPeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    }
    setActiveNav('radar');
}

function tutupPeta() {
    const secPeta = document.getElementById('sectionPeta');
    if (secPeta) secPeta.classList.add('d-none');
    setActiveNav('kondisi');
    bukaKondisiTerkini();
}

function toggleRadarLayarPenuh() {
    const secPeta = document.getElementById('sectionPeta');
    if (!secPeta) return;
    if (!document.fullscreenElement) {
        secPeta.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
}

// Saved Locations
function simpanKotaAktif() {
    const t = translations[currentLang] || translations.id;
    const targetKota = currentLoadedCity || (inputKota ? inputKota.value.trim() : '');
    if (!targetKota) {
        tampilkanToast('Pilih kota terlebih dahulu.', 'danger');
        return;
    }

    let list = JSON.parse(localStorage.getItem('ln_saved_cities')) || [];
    if (!list.includes(targetKota)) {
        list.push(targetKota);
        localStorage.setItem('ln_saved_cities', JSON.stringify(list));
        tampilkanToast(`${targetKota} ${t.save_success}`, 'success');
        tampilkanKotaTersimpan();
    } else {
        tampilkanToast(`${targetKota} ${t.already_saved}`, 'info');
    }
}

function tampilkanKotaTersimpan() {
    const wadah = document.getElementById('daftarKotaFavorit');
    if (!wadah) return;

    let list = JSON.parse(localStorage.getItem('ln_saved_cities')) || [];
    if (list.length === 0) {
        wadah.innerHTML = `<p class="text-tertiary text-center py-4 mb-0 small">Belum ada kota yang disimpan.</p>`;
        return;
    }

    wadah.innerHTML = list.map(kota => `
        <div class="d-flex justify-content-between align-items-center p-2 px-3 rounded-2 mb-2" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
            <span class="fw-semibold text-white"><i class="bi bi-geo-alt text-blue me-2"></i>${kota}</span>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-light px-3 py-1 x-small rounded-2" onclick="pilihKotaFavorit('${kota}')">Lihat</button>
                <button class="btn btn-sm btn-outline-danger px-2 py-1 x-small rounded-2" onclick="hapusKotaFavorit('${kota}')"><i class="bi bi-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function pilihKotaFavorit(kota) {
    if (inputKota) inputKota.value = kota;
    cariKotaCepat(kota);
    const modalEl = document.getElementById('modalSaved');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
}

function hapusKotaFavorit(kota) {
    let list = JSON.parse(localStorage.getItem('ln_saved_cities')) || [];
    list = list.filter(item => item !== kota);
    localStorage.setItem('ln_saved_cities', JSON.stringify(list));
    tampilkanKotaTersimpan();
}

// Early Disaster Warning
function deteksiPotensiBencana(data) {
    const banner = document.getElementById('bannerPeringatan');
    const judul = document.getElementById('judulPeringatan');
    const pesan = document.getElementById('pesanPeringatan');
    if (!banner || !judul || !pesan) return;

    let status = null;
    let detail = '';
    const windMs = data.wind.speed;
    const cond = data.weather[0].main.toLowerCase();

    if (windMs > 13.8) {
        status = currentLang === 'en' ? "High Wind Advisory" : "Waspada Angin Kencang";
        detail = currentLang === 'en' 
            ? `Wind gusts up to ${(windMs * 3.6).toFixed(1)} km/h detected in ${data.name}.`
            : `Hembusan angin mencapai ${(windMs * 3.6).toFixed(1)} km/j di wilayah ${data.name}.`;
    } else if (cond.includes('thunderstorm')) {
        status = currentLang === 'en' ? "Thunderstorm Alert" : "Peringatan Hujan Petir";
        detail = currentLang === 'en'
            ? `Thunderstorm and lightning activity present in ${data.name}.`
            : `Aktivitas petir dan kilat terdeteksi di sekitar ${data.name}.`;
    } else if (cond.includes('rain') && data.rain && data.rain['1h'] > 10) {
        status = currentLang === 'en' ? "Heavy Rain Warning" : "Waspada Curah Hujan Tinggi";
        detail = currentLang === 'en'
            ? `Heavy downpour recorded in ${data.name}. Watch for standing water.`
            : `Intensitas hujan lebat di wilayah ${data.name}. Waspadai genangan air.`;
    }

    if (status) {
        banner.classList.remove('d-none');
        judul.textContent = status;
        pesan.textContent = detail;
        simpanLogRiwayatBencana(data.name, status, detail);
    } else {
        banner.classList.add('d-none');
    }
}

function simpanLogRiwayatBencana(kota, jenis, detail) {
    let riwayat = JSON.parse(localStorage.getItem('ln_disaster_history')) || [];
    if (riwayat.length > 0 && riwayat[0].kota === kota && riwayat[0].jenis === jenis) return;

    const waktu = new Date().toLocaleString(currentLang === 'en' ? 'en-US' : 'id-ID', { timeZone: 'Asia/Jakarta' });
    riwayat.unshift({ waktu, kota, jenis, info: detail });
    if (riwayat.length > 20) riwayat.pop();
    localStorage.setItem('ln_disaster_history', JSON.stringify(riwayat));
    muatRiwayatBencana();
}

function muatRiwayatBencana() {
    const wadah = document.getElementById('wadahRiwayatBencana');
    if (!wadah) return;

    let riwayat = JSON.parse(localStorage.getItem('ln_disaster_history')) || [];
    if (riwayat.length === 0) {
        wadah.innerHTML = `<p class="text-tertiary text-center py-4 mb-0 small">Belum ada catatan anomali cuaca.</p>`;
        return;
    }

    wadah.innerHTML = riwayat.map(item => `
        <div class="p-3 rounded-2 mb-2" style="background: var(--bg-surface-elevated); border-left: 3px solid var(--color-red);">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-danger bg-opacity-25 text-danger px-2 py-0.5 x-small fw-bold">${item.jenis}</span>
                <span class="text-tertiary x-small">${item.waktu}</span>
            </div>
            <strong class="text-white d-block mb-1">${item.kota}</strong>
            <p class="text-secondary small mb-0">${item.info}</p>
        </div>
    `).join('');
}

function bersihkanRiwayatBencana() {
    localStorage.removeItem('ln_disaster_history');
    muatRiwayatBencana();
    tampilkanToast('Catatan riwayat dibersihkan.', 'success');
}

// Initial Events
document.addEventListener('DOMContentLoaded', () => {
    updateLanguageButtons();
    updateUnitButtons();
    applyLanguageTranslations();
    muatRiwayatBencana();

    if (btnCari) {
        btnCari.addEventListener('click', () => {
            const kota = inputKota.value.trim();
            if (kota !== '') ambilDataCuaca(kota);
        });
    }

    if (inputKota) {
        inputKota.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const kota = inputKota.value.trim();
                if (kota !== '') ambilDataCuaca(kota);
            }
        });
    }

    if (btnGeo) {
        btnGeo.addEventListener('click', () => {
            const t = translations[currentLang] || translations.id;
            if (!navigator.geolocation) {
                tampilkanToast(t.geo_not_supported, 'danger');
                return;
            }
            btnGeo.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`;
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    btnGeo.innerHTML = `<i class="bi bi-crosshair"></i>`;
                    ambilDataCuacaKoordinat(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    btnGeo.innerHTML = `<i class="bi bi-crosshair"></i>`;
                    tampilkanToast(t.geo_denied, 'danger');
                },
                { timeout: 10000 }
            );
        });
    }

    const btnC = document.getElementById('unitC');
    const btnF = document.getElementById('unitF');
    if (btnC) btnC.addEventListener('click', () => setUnit('C'));
    if (btnF) btnF.addEventListener('click', () => setUnit('F'));

    const btnId = document.getElementById('langId');
    const btnEn = document.getElementById('langEn');
    if (btnId) btnId.addEventListener('click', () => setLanguage('id'));
    if (btnEn) btnEn.addEventListener('click', () => setLanguage('en'));

    window.addEventListener('scroll', () => {
        const secPeta = document.getElementById('sectionPeta');
        if (!secPeta || secPeta.classList.contains('d-none')) {
            setActiveNav('kondisi');
            return;
        }
        const rect = secPeta.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
            setActiveNav('radar');
        } else if (window.scrollY < 300) {
            setActiveNav('kondisi');
        }
    }, { passive: true });

    cariKotaCepat('Bandung');
});
