<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radar Satelit dan Dinamika Cuaca — Atmosferia</title>
    <!-- Web Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- Header -->
    <header class="site-header mb-4">
        <div class="container d-flex justify-content-between align-items-center">
            <a href="index.html" class="d-flex align-items-center gap-2 text-decoration-none flex-shrink-0">
                <div class="brand-symbol"><i class="bi bi-cloud-sun"></i></div>
                <div class="d-flex flex-column justify-content-center">
                    <span class="brand-text">Atmosferia</span>
                    <span class="brand-tagline d-block">Prakiraan Cuaca Indonesia</span>
                </div>
            </a>
            <nav class="site-nav">
                <a href="index.html" class="nav-item-link"><i class="bi bi-arrow-left"></i> Beranda</a>
                <a href="prakiraan-cuaca.php" class="nav-item-link d-none d-md-inline-flex"><i class="bi bi-broadcast"></i> Stasiun BMKG</a>
                <a href="cuaca-buruk.php" class="nav-item-link d-none d-md-inline-flex"><i class="bi bi-shield-exclamation"></i> Siaga Cuaca</a>
                <a href="topan.php" class="nav-item-link d-none d-md-inline-flex"><i class="bi bi-hurricane"></i> Topan</a>
            </nav>
        </div>
    </header>

    <div class="container pb-5">
        
        <!-- Hero Header -->
        <div class="editorial-card mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
                <span class="text-tertiary x-small fw-bold d-block mb-1">Observasi Numerik Atmosfer</span>
                <h1 class="h4 text-white fw-bold mb-1">Radar Satelit dan Dinamika Angin Nusantara</h1>
                <p class="text-secondary small mb-0">Pantauan visual awan konvektif, kelembapan atmosfer, dan arus hembusan angin permukaan.</p>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-light px-3 py-1 x-small rounded-2" onclick="toggleLayarPenuh()">
                    <i class="bi bi-arrows-fullscreen me-1"></i> Layar Penuh
                </button>
            </div>
        </div>

        <!-- Controls Bar -->
        <div class="editorial-card p-3 mb-4">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <!-- Layer Buttons -->
                <div class="d-flex align-items-center flex-wrap gap-2">
                    <span class="text-tertiary x-small fw-bold me-1">Lapisan Data:</span>
                    <button class="region-tag active" onclick="gantiLayer('wind', this)"><i class="bi bi-wind me-1"></i> Angin</button>
                    <button class="region-tag" onclick="gantiLayer('rain', this)"><i class="bi bi-cloud-rain me-1"></i> Hujan dan Petir</button>
                    <button class="region-tag" onclick="gantiLayer('temp', this)"><i class="bi bi-thermometer-half me-1"></i> Suhu Udara</button>
                    <button class="region-tag" onclick="gantiLayer('clouds', this)"><i class="bi bi-clouds me-1"></i> Liputan Awan</button>
                    <button class="region-tag" onclick="gantiLayer('waves', this)"><i class="bi bi-water me-1"></i> Gelombang Laut</button>
                </div>

                <!-- Region Zoom -->
                <div class="d-flex align-items-center flex-wrap gap-2">
                    <span class="text-tertiary x-small fw-bold me-1">Pilihan Wilayah:</span>
                    <button class="region-tag" onclick="zoomWilayah(-7.25, 110.0, 7)">Jawa</button>
                    <button class="region-tag" onclick="zoomWilayah(0.5, 101.5, 6)">Sumatera</button>
                    <button class="region-tag" onclick="zoomWilayah(-0.5, 114.0, 6)">Kalimantan</button>
                    <button class="region-tag" onclick="zoomWilayah(-2.5, 121.0, 6)">Sulawesi</button>
                    <button class="region-tag" onclick="zoomWilayah(-8.5, 115.5, 8)">Bali-Nusa</button>
                    <button class="region-tag" onclick="zoomWilayah(-3.5, 138.0, 6)">Papua</button>
                    <button class="region-tag" onclick="zoomWilayah(-2.5, 118.0, 5)">Seluruh Indonesia</button>
                </div>
            </div>
        </div>

        <!-- Radar Frame -->
        <div id="radarContainer" class="editorial-card p-2 mb-4" style="background: var(--surface-1);">
            <div class="ratio ratio-21x9 rounded-2 overflow-hidden" style="min-height: 560px;">
                <iframe id="iframeRadar" src="https://embed.windy.com/embed2.html?lat=-2.548&lon=118.014&zoom=5&level=surface&overlay=wind&menu=&message=&marker=true&pressure=&wind=map&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>

        <!-- Data Notes -->
        <div class="row g-3">
            <div class="col-md-4">
                <div class="editorial-card p-3 h-100">
                    <strong class="text-white small d-block mb-1"><i class="bi bi-mouse text-blue me-1"></i> Navigasi Peta</strong>
                    <p class="text-secondary x-small mb-0">Geser peta untuk melihat wilayah samudera di sekitar khatulistiwa. Gunakan roda gulir mouse atau cubit layar sentuh untuk memperbesar gambar.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="editorial-card p-3 h-100">
                    <strong class="text-white small d-block mb-1"><i class="bi bi-play-circle text-yellow me-1"></i> Kontrol Animasi</strong>
                    <p class="text-secondary x-small mb-0">Tekan tombol putar di bagian bawah kiri peta untuk mengamati simulasi pergerakan arah angin dan awan dalam 24 hingga 72 jam ke depan.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="editorial-card p-3 h-100">
                    <strong class="text-white small d-block mb-1"><i class="bi bi-check2-circle text-green me-1"></i> Model ECMWF dan GFS</strong>
                    <p class="text-secondary x-small mb-0">Data didasarkan pada perpaduan model numerik resolusi tinggi ECMWF dan satelit geostasioner dengan pembaruan berskala global.</p>
                </div>
            </div>
        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        let currentLat = -2.548;
        let currentLon = 118.014;
        let currentZoom = 5;
        let currentOverlay = 'wind';

        function renderRadarUrl() {
            const iframe = document.getElementById('iframeRadar');
            iframe.src = `https://embed.windy.com/embed2.html?lat=${currentLat}&lon=${currentLon}&zoom=${currentZoom}&level=surface&overlay=${currentOverlay}&menu=&message=&marker=true&pressure=&wind=map&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
        }

        function gantiLayer(layer, btnElement) {
            currentOverlay = layer;
            document.querySelectorAll('.region-tag').forEach(b => b.classList.remove('active'));
            if (btnElement) btnElement.classList.add('active');
            renderRadarUrl();
        }

        function zoomWilayah(lat, lon, zoom) {
            currentLat = lat;
            currentLon = lon;
            currentZoom = zoom;
            renderRadarUrl();
        }

        function toggleLayarPenuh() {
            const container = document.getElementById('radarContainer');
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => alert("Fullscreen error: " + err.message));
            } else {
                document.exitFullscreen();
            }
        }
    </script>
</body>
</html>
