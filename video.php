<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Meteorologi dan Analisis Cuaca — Atmosferia</title>
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
                <a href="radar.php" class="nav-item-link d-none d-md-inline-flex"><i class="bi bi-radar"></i> Radar Satelit</a>
                <a href="prakiraan-cuaca.php" class="nav-item-link d-none d-md-inline-flex"><i class="bi bi-broadcast"></i> Stasiun BMKG</a>
                <a href="cuaca-buruk.php" class="nav-item-link d-none d-md-inline-flex"><i class="bi bi-shield-exclamation"></i> Siaga Cuaca</a>
            </nav>
        </div>
    </header>

    <div class="container pb-5">
        
        <!-- Hero Header -->
        <div class="editorial-card mb-4">
            <span class="text-yellow x-small fw-bold d-block mb-1">Analisis Visual dan Edukasi Atmosfer</span>
            <h1 class="h4 text-white fw-bold mb-1">Video Analisis Cuaca dan Iklim Indonesia</h1>
            <p class="text-secondary small mb-0">Ulasan dinamika cuaca, pergerakan monsun khatulistiwa, dan panduan mitigasi bencana hidrometeorologi.</p>
        </div>

        <!-- Filter Kategori -->
        <div class="d-flex flex-wrap gap-2 mb-4">
            <button class="region-tag active" onclick="filterVideo('all', this)">Semua Topik</button>
            <button class="region-tag" onclick="filterVideo('analisis', this)">Dinamika Atmosfer</button>
            <button class="region-tag" onclick="filterVideo('edukasi', this)">Mitigasi Bencana</button>
            <button class="region-tag" onclick="filterVideo('fenomena', this)">Fenomena Iklim</button>
        </div>

        <!-- Grid Video -->
        <div class="row g-4" id="videoGrid">
            
            <!-- Video 1 -->
            <div class="col-lg-6 video-item" data-category="analisis">
                <div class="editorial-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="ratio ratio-16x9 rounded-2 overflow-hidden mb-3" style="border: 1px solid var(--border-subtle);">
                            <iframe src="https://www.youtube.com/embed/Y0A3u_54T8w" title="Memahami Pola Cuaca Tropis Indonesia" allowfullscreen></iframe>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-blue x-small fw-semibold">Dinamika Atmosfer</span>
                            <span class="text-tertiary x-small">Sumber: BMKG Media</span>
                        </div>
                        <h5 class="text-white fs-6 fw-bold mb-1">Mengapa Cuaca di Indonesia Cepat Berubah? Pengaruh Monsun dan ITCZ</h5>
                        <p class="text-secondary x-small mb-0">Penjelasan ilmiah mengenai sirkulasi angin monsun Asia-Australia dan pembentukan awan konvektif di sepanjang sabuk khatulistiwa.</p>
                    </div>
                </div>
            </div>

            <!-- Video 2 -->
            <div class="col-lg-6 video-item" data-category="edukasi">
                <div class="editorial-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="ratio ratio-16x9 rounded-2 overflow-hidden mb-3" style="border: 1px solid var(--border-subtle);">
                            <iframe src="https://www.youtube.com/embed/QhD7T4lR10c" title="Mitigasi Bencana Banjir" allowfullscreen></iframe>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-yellow x-small fw-semibold">Mitigasi Bencana</span>
                            <span class="text-tertiary x-small">Kesiapsiagaan BNPB</span>
                        </div>
                        <h5 class="text-white fs-6 fw-bold mb-1">Kesiapsiagaan Mandiri Menghadapi Curah Hujan Ekstrem dan Banjir</h5>
                        <p class="text-secondary x-small mb-0">Langkah terstruktur dalam mengamankan instalasi listrik, persiapan tas siaga bencana, dan evakuasi mandiri sebelum air naik.</p>
                    </div>
                </div>
            </div>

            <!-- Video 3 -->
            <div class="col-lg-6 video-item" data-category="fenomena">
                <div class="editorial-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="ratio ratio-16x9 rounded-2 overflow-hidden mb-3" style="border: 1px solid var(--border-subtle);">
                            <iframe src="https://www.youtube.com/embed/d_68hO8hY_c" title="Fenomena El Nino & La Nina" allowfullscreen></iframe>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-green x-small fw-semibold">Fenomena Iklim</span>
                            <span class="text-tertiary x-small">Klimatologi</span>
                        </div>
                        <h5 class="text-white fs-6 fw-bold mb-1">Mengenal El Niño dan La Niña: Pengaruh Suhu Permukaan Laut</h5>
                        <p class="text-secondary x-small mb-0">Ulasan sirkulasi Walker di Samudera Pasifik yang memicu anomali musim kemarau panjang atau curah hujan di atas normal.</p>
                    </div>
                </div>
            </div>

            <!-- Video 4 -->
            <div class="col-lg-6 video-item" data-category="fenomena">
                <div class="editorial-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="ratio ratio-16x9 rounded-2 overflow-hidden mb-3" style="border: 1px solid var(--border-subtle);">
                            <iframe src="https://www.youtube.com/embed/J2__3t49KGg" title="Siklon Tropis" allowfullscreen></iframe>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-red x-small fw-semibold">Badai Samudera</span>
                            <span class="text-tertiary x-small">TCWC Jakarta</span>
                        </div>
                        <h5 class="text-white fs-6 fw-bold mb-1">Mekanisme Pembentukan Siklon Tropis di Perairan Selatan Indonesia</h5>
                        <p class="text-secondary x-small mb-0">Pelajari bagaimana pusaran tekanan rendah di Samudera Hindia dan Laut Timor dapat berkembang menjadi badai tropis berkecepatan tinggi.</p>
                    </div>
                </div>
            </div>

        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function filterVideo(category, btnEl) {
            document.querySelectorAll('.region-tag').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');

            const videos = document.querySelectorAll('.video-item');
            videos.forEach(video => {
                if (category === 'all' || video.getAttribute('data-category') === category) {
                    video.style.display = 'block';
                } else {
                    video.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
