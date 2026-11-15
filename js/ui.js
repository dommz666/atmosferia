// ==========================================================================
// Atmosferia - UI Controller Module (js/ui.js)
// Mengelola rendering DOM, kartu cuaca, 7-hari outlook, radar Windy, modal & tema
// ==========================================================================

import { I18n } from './i18n.js';
import { Storage } from './storage.js';

let localClockInterval = null;
let currentRadarCity = { lat: -6.9175, lon: 107.6191 };
let currentRadarOverlay = 'wind';
let radarLoaded = false;

export const UI = {
    // --- 1. SKELETON LOADER & ERROR STATE ---
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
                <div class="row g-3">
                    <div class="col-6 col-md-3"><div class="skeleton-shimmer" style="height: 90px;"></div></div>
                    <div class="col-6 col-md-3"><div class="skeleton-shimmer" style="height: 90px;"></div></div>
                    <div class="col-6 col-md-3"><div class="skeleton-shimmer" style="height: 90px;"></div></div>
                    <div class="col-6 col-md-3"><div class="skeleton-shimmer" style="height: 90px;"></div></div>
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
                <div class="mb-3 text-red fs-1">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
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

    // --- 2. JAM REAL-TIME WILAYAH KOTA (WIB / WITA / WIT) ---
    startRealtimeClock(utcOffsetSeconds = 25200) {
        if (localClockInterval) clearInterval(localClockInterval);

        const elSuasana = document.getElementById('suasanaKota');
        if (!elSuasana) return;

        const updateClock = () => {
            const now = new Date();
            // Kalkulasi waktu target berdasarkan utcOffsetSeconds
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

    // --- 3. EVALUASI DAN PERINGATAN CUACA EKSTREM ---
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

        // Kriteria cuaca ekstrem:
        // 1. Badai petir dengan hujan es atau badai hebat (WMO 95, 96, 99)
        if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
            isExtreme = true;
            alertType = 'Badai Petir & Kilat';
            alertDetail = `Terdeteksi potensi badai petir aktif disertai kilat di area ${cityObj.name}. Harap waspada dan hindari berteduh di bawah pohon atau struktur terbuka.`;
        } 
        // 2. Angin kencang (kecepatan angin >= 35 km/j)
        else if (windSpeed >= 35 || maxWindDaily >= 45) {
            isExtreme = true;
            alertType = 'Angin Kencang';
            alertDetail = `Kecepatan angin permukaan mencapai ${Math.round(windSpeed)} km/j (maksimal ${Math.round(maxWindDaily)} km/j). Waspadai potensi dahan patah atau reklame roboh di sekitar ${cityObj.name}.`;
        }
        // 3. Hujan lebat berkelanjutan (curah hujan >= 10 mm/jam)
        else if (rainAmount >= 10 || (cur.rain && cur.rain >= 10)) {
            isExtreme = true;
            alertType = 'Hujan Lebat';
            alertDetail = `Curah hujan tinggi (${rainAmount.toFixed(1)} mm/j) terpantau di ${cityObj.name}. Waspadai genangan air dan potensi penurunan jarak pandang di jalan raya.`;
        }
        // 4. Indeks UV Ekstrem (UV >= 11)
        else if (maxUV >= 11 && (cur.is_day === 1)) {
            isExtreme = true;
            alertType = 'Indeks UV Ekstrem';
            alertDetail = `Indeks radiasi UV mencapai ${maxUV.toFixed(1)} (Kategori Ekstrem). Kurangi paparan langsung sinar matahari antara pukul 11:00-14:00 dan gunakan tabir surya.`;
        }

        if (isExtreme) {
            judul.textContent = `Peringatan: Potensi ${alertType} di ${cityObj.name}`;
            pesan.textContent = alertDetail;
            banner.classList.remove('d-none');
            banner.setAttribute('aria-live', 'assertive');

            // Catat ke Log Riwayat Peringatan secara otomatis
            Storage.addDisasterLog(cityObj.name, alertType, alertDetail);
        } else {
            banner.classList.add('d-none');
            banner.removeAttribute('aria-live');
        }
    },

    // --- 4. TEMA DINAMIS CUACA & WAKTU (Solid, Natural, Non-AI) ---
    applyAtmosphericTheme(weatherCode, isDay) {
        const body = document.body;
        // Bersihkan tema lama
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

        // Klasifikasi tema cuaca
        if (code >= 95) {
            // Badai Petir
            body.classList.add(day ? 'theme-storm-day' : 'theme-storm-night');
        } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
            // Hujan (Gerimis, Sedang, Lebat)
            body.classList.add(day ? 'theme-rain-day' : 'theme-rain-night');
        } else if (code >= 71 && code <= 77) {
            // Salju/Butir Es
            body.classList.add(day ? 'theme-rain-day' : 'theme-rain-night');
        } else if (code >= 45 && code <= 48) {
            // Kabut
            body.classList.add(day ? 'theme-fog-day' : 'theme-fog-night');
        } else if (code === 1 || code === 2 || code === 3) {
            // Berawan
            body.classList.add(day ? 'theme-clouds-day' : 'theme-clouds-night');
        } else {
            // Cerah (0)
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

    // --- 5. RENDER KONDISI CUACA SAAT INI ---
    renderCurrentWeather(data, cityObj) {
        const cur = data.current || {};
        const daily = data.daily || {};
        const isDay = cur.is_day !== undefined ? cur.is_day === 1 : true;
        const code = cur.weather_code ?? 0;

        // Info Wilayah
        const elNamaWilayah = document.getElementById('namaWilayah');
        if (elNamaWilayah) {
            const regionExtra = cityObj.admin1 ? `, ${cityObj.admin1}` : '';
            elNamaWilayah.textContent = `${cityObj.name}${regionExtra}`;
        }

        // Timestamp Pembaruan Pasti (Contoh: "Diperbarui 14:30 WIB")
        const elWaktuUpdate = document.getElementById('waktuUpdate');
        if (elWaktuUpdate) {
            const now = new Date();
            const tz = I18n.resolveTimezoneLabel(data.utc_offset_seconds);
            const hours = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            elWaktuUpdate.textContent = `${I18n.t('updated_at')} ${hours}:${mins} ${tz}`;
        }

        // Terapkan Tema Dinamis
        this.applyAtmosphericTheme(code, isDay);

        // Jalankan Jam Real-Time
        this.startRealtimeClock(data.utc_offset_seconds || 25200);

        // Suhu & Kondisi
        const tempVal = cur.temperature_2m ?? 0;
        const feelsVal = cur.apparent_temperature ?? tempVal;
        const tempText = I18n.formatTemp(tempVal);
        const feelsText = I18n.formatTemp(feelsVal);

        const elSuhu = document.getElementById('suhuCuaca');
        const elDeskripsi = document.getElementById('deskripsiCuaca');
        const elTerasa = document.getElementById('terasaSeperti');
        const elIkon = document.getElementById('ikonCuaca');

        if (elSuhu) elSuhu.textContent = tempText;
        if (elDeskripsi) elDeskripsi.textContent = I18n.getWeatherDesc(code);
        if (elTerasa) elTerasa.textContent = `${I18n.t('feels_like')} ${feelsText}`;
        if (elIkon) elIkon.className = `${I18n.getWeatherIcon(code, isDay)} display-3`;

        // Rentang Suhu Min - Maks Hari Ini
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

        // Render Editorial Briefing
        this.renderEditorialBriefing(data, cityObj);

        // Render Stasiun Parameter Atmosfer (Kelembapan, Angin, Matahari, Tekanan, UV, AQI, Hujan)
        this.renderAtmosphericStations(data);

        // Evaluasi Cuaca Ekstrem
        this.evaluateSevereWeather(data, cityObj);
    },

    // --- 6. RINGKASAN EDITORIAL ALAMI (Daily Briefing) ---
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

    // --- 7. STASIUN PARAMETER ATMOSFERIK LENGKAP ---
    renderAtmosphericStations(data) {
        const cur = data.current || {};
        const daily = data.daily || {};
        const aqi = data.aqi || {};

        // 1. Kelembapan Udara
        const humidityVal = cur.relative_humidity_2m ?? 75;
        const elKelembapan = document.getElementById('kelembapan');
        const elBadgeKenyamanan = document.getElementById('badgeKenyamanan');
        if (elKelembapan) elKelembapan.textContent = `${humidityVal}%`;
        if (elBadgeKenyamanan) {
            if (humidityVal < 45) {
                elBadgeKenyamanan.className = 'metric-badge badge-comfort-good';
                elBadgeKenyamanan.textContent = 'Udara Kering';
            } else if (humidityVal <= 75) {
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

        // 2. Angin & Dial Kompas
        const windSpeedVal = cur.wind_speed_10m ?? 10;
        const windDirVal = cur.wind_direction_10m ?? 0;
        const elAngin = document.getElementById('kecepatanAngin');
        const elArahTeks = document.getElementById('arahAnginTeks');
        const elNeedle = document.getElementById('compassNeedle');

        if (elAngin) elAngin.textContent = `${Math.round(windSpeedVal)} km/j`;
        if (elArahTeks) {
            const mataAngin = I18n.getWindDirection(windDirVal);
            elArahTeks.textContent = `${mataAngin} (${Math.round(windDirVal)}°)`;
        }
        if (elNeedle) {
            elNeedle.style.transform = `rotate(${windDirVal}deg)`;
        }

        // 3. Matahari & Siklus Siang
        const sunriseIso = (daily.sunrise && daily.sunrise[0]) ? daily.sunrise[0] : '';
        const sunsetIso = (daily.sunset && daily.sunset[0]) ? daily.sunset[0] : '';
        const formatTimeFromIso = (iso) => {
            if (!iso) return '--:--';
            const parts = iso.split('T');
            return parts[1] ? parts[1].substring(0, 5) : '--:--';
        };

        const elTerbit = document.getElementById('waktuTerbit');
        const elTerbenam = document.getElementById('waktuTerbenam');
        const elSiklusTeks = document.getElementById('siklusMatahariTeks');

        if (elTerbit) elTerbit.textContent = formatTimeFromIso(sunriseIso);
        if (elTerbenam) elTerbenam.textContent = formatTimeFromIso(sunsetIso);
        if (elSiklusTeks) {
            const isDay = cur.is_day === 1;
            elSiklusTeks.textContent = isDay ? 'Matahari di atas horizon' : 'Malam hari di bawah horizon';
        }

        // 4. Jarak Pandang & Tekanan Udara
        const hourlyVis = (data.hourly && data.hourly.visibility && data.hourly.visibility[0] !== undefined)
            ? (data.hourly.visibility[0] / 1000).toFixed(1) : '10.0';
        const pressureVal = cur.surface_pressure ? Math.round(cur.surface_pressure) : 1013;

        const elJarak = document.getElementById('jarakPandang');
        const elTekanan = document.getElementById('tekananUdara');
        if (elJarak) elJarak.textContent = `${hourlyVis} km`;
        if (elTekanan) elTekanan.textContent = `${pressureVal} hPa`;

        // 5. Parameter Tambahan: Peluang Hujan, Indeks UV, Kualitas Udara (AQI)
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

        // Kualitas Udara (AQI)
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

    // --- 8. PRAKIRAAN CUACA PER JAM (Timeline 24 Jam) ---
    renderHourlyForecast(hourlyData, utcOffsetSeconds = 25200) {
        const container = document.getElementById('wadahPrakiraan');
        if (!container || !hourlyData || !hourlyData.time) return;

        const times = hourlyData.time;
        const temps = hourlyData.temperature_2m || [];
        const codes = hourlyData.weather_code || [];
        const probs = hourlyData.precipitation_probability || [];

        // Hitung jam lokal target saat ini
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
                    <div class="text-tertiary x-small mb-2 fw-medium">${hourLabel}</div>
                    <div class="my-2">
                        <i class="${iconClass} fs-4"></i>
                    </div>
                    <div class="text-white fw-bold mono-num fs-6">${I18n.formatTemp(temp)}</div>
                    <div class="timeline-condition text-secondary x-small mt-1 text-truncate" title="${desc}">${desc}</div>
                    ${prob > 15 ? `<div class="x-small text-blue mt-1"><i class="bi bi-droplet-fill"></i> ${prob}%</div>` : ''}
                </div>
            `;
        }

        container.innerHTML = html;
    },

    // --- 9. PRAKIRAAN 7 HARI KE DEPAN (Fitur Baru B.1) ---
    renderDailyForecast(dailyData) {
        const container = document.getElementById('wadahPrakiraanMingguan');
        if (!container || !dailyData || !dailyData.time) return;

        const times = dailyData.time;
        const codes = dailyData.weather_code || [];
        const minTemps = dailyData.temperature_2m_min || [];
        const maxTemps = dailyData.temperature_2m_max || [];
        const probs = dailyData.precipitation_probability_max || [];

        const dayNamesId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const isId = Storage.getLang() === 'id';
        const dayNames = isId ? dayNamesId : dayNamesEn;

        let html = '';
        const count = Math.min(times.length, 7);

        for (let i = 0; i < count; i++) {
            const dateObj = new Date(times[i] + 'T00:00:00');
            let dayLabel = dayNames[dateObj.getDay()];
            if (i === 0) dayLabel = isId ? 'Hari Ini' : 'Today';
            else if (i === 1) dayLabel = isId ? 'Besok' : 'Tomorrow';

            const dateLabel = `${dateObj.getDate()} ${dateObj.toLocaleString(isId ? 'id-ID' : 'en-US', { month: 'short' })}`;
            const code = codes[i] ?? 0;
            const minT = minTemps[i] ?? 20;
            const maxT = maxTemps[i] ?? 30;
            const prob = probs[i] ?? 0;
            const iconClass = I18n.getWeatherIcon(code, true);
            const desc = I18n.getWeatherDesc(code);

            html += `
                <div class="daily-forecast-item d-flex align-items-center justify-content-between p-3 mb-2 rounded-2">
                    <div class="d-flex align-items-center gap-3" style="min-width: 140px;">
                        <i class="${iconClass} fs-4"></i>
                        <div>
                            <strong class="text-white small d-block">${dayLabel}</strong>
                            <span class="text-tertiary x-small">${dateLabel}</span>
                        </div>
                    </div>

                    <div class="text-secondary small d-none d-md-block flex-grow-1 px-3 text-truncate">
                        ${desc}
                    </div>

                    <div class="d-flex align-items-center gap-3">
                        <div class="d-flex align-items-center gap-1 text-blue x-small" style="min-width: 55px;">
                            <i class="bi bi-droplet-fill"></i>
                            <span class="mono-num">${prob}%</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 mono-num small" style="min-width: 110px; justify-content: flex-end;">
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

        container.innerHTML = html;
    },

    // --- 10. RADAR INTERAKTIF WINDY DENGAN LAZY LOADING & PILIHAN OVERLAY ---
    setupRadarOverlay(lat, lon, overlay = 'wind', forceReload = false) {
        currentRadarCity = { lat, lon };
        currentRadarOverlay = overlay;

        // Perbarui tombol overlay aktif
        const overlayButtons = document.querySelectorAll('.btn-radar-overlay');
        overlayButtons.forEach(btn => {
            const btnOverlay = btn.getAttribute('data-overlay');
            if (btnOverlay === overlay) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const iframe = document.getElementById('windyIframe');
        if (!iframe) return;

        // Lazy load: Jika belum dimuat atau diperintahkan reload paksa
        if (forceReload || radarLoaded) {
            const windyUrl = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=8&level=surface&overlay=${overlay}&menu=&message=&marker=true&pressure=&wind=map&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
            iframe.src = windyUrl;
            radarLoaded = true;
        }
    },

    bukaPetaCuaca() {
        const sectionPeta = document.getElementById('sectionPeta');
        if (!sectionPeta) return;

        sectionPeta.classList.remove('d-none');
        this.setupRadarOverlay(currentRadarCity.lat, currentRadarCity.lon, currentRadarOverlay, true);

        // Atur bubble / penanda menu aktif
        this.setActiveNav('radar');

        // Scroll halus ke section peta radar
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

    // --- 11. NAVIGASI AKTIF (Fix Bubble Bug Nav) ---
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
        } else if (activeName === 'radar') {
            document.querySelectorAll('.nav-link-radar').forEach(el => {
                el.classList.add('active');
                el.setAttribute('aria-current', 'page');
            });
        }
    },

    // --- 12. MODAL KOTA TERSIMPAN & RIWAYAT PERINGATAN ---
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

        // Pasang event handler
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

    // --- 13. TOAST NOTIFIKASI ---
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
    }
};

