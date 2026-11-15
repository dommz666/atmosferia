<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Siklon Tropis dan Topan Samudera — Atmosferia</title>
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
            <span class="text-tertiary x-small fw-bold d-block mb-1">Buletin Meteorologi Maritim dan Samudera</span>
            <h1 class="h4 text-white fw-bold mb-1">Informasi Siklon Tropis dan Pusaran Badai</h1>
            <p class="text-secondary small mb-0">Pemantauan bibit siklon tropis, tekanan rendah, dan dinamika badai di Samudera Hindia dan Pasifik.</p>
        </div>

        <!-- Status Samudera Terkini -->
        <div class="editorial-card p-4 mb-4 text-center py-5">
            <div class="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); color: var(--color-green);">
                <i class="bi bi-shield-check display-4"></i>
            </div>
            <h4 class="text-white fw-bold mb-2">Samudera Nusantara Terpantau Tenang</h4>
            <p class="text-secondary small mx-auto mb-3" style="max-width: 600px;">
                Berdasarkan pantauan satelit cuaca Himawari-9 dan stasiun TCWC (Tropical Cyclone Warning Centre) Jakarta, saat ini <strong>tidak ada bibit siklon tropis aktif</strong> di wilayah perairan Indonesia.
            </p>
            <div class="d-flex justify-content-center flex-wrap gap-2">
                <span class="region-tag"><i class="bi bi-check2 text-green me-1"></i> Samudera Hindia: 1.0 – 1.8 m (Normal)</span>
                <span class="region-tag"><i class="bi bi-check2 text-green me-1"></i> Laut Timor: 0.8 – 1.5 m (Kondusif)</span>
                <span class="region-tag"><i class="bi bi-check2 text-green me-1"></i> Pasifik Utara Papua: 1.2 – 2.0 m (Normal)</span>
            </div>
        </div>

        <!-- Skala Kategori Siklon -->
        <div class="editorial-card mb-4">
            <h6 class="text-white fw-bold mb-3"><i class="bi bi-speedometer text-blue me-2"></i>Skala Kategori Siklon Tropis (BOM / WMO)</h6>

            <div class="row g-2">
                <div class="col-md">
                    <div class="p-3 rounded-2 h-100" style="background: var(--surface-1); border-top: 3px solid #3d84e8;">
                        <span class="badge bg-secondary x-small mb-1">Kategori 1</span>
                        <div class="text-white fw-bold mono-num small">63 – 88 km/j</div>
                        <p class="text-tertiary x-small mb-0 mt-1">Dampak ringan: ranting patah, perahu nelayan waspada gelombang 2.5m.</p>
                    </div>
                </div>
                <div class="col-md">
                    <div class="p-3 rounded-2 h-100" style="background: var(--surface-1); border-top: 3px solid #e69a19;">
                        <span class="badge bg-secondary x-small mb-1">Kategori 2</span>
                        <div class="text-white fw-bold mono-num small">89 – 117 km/j</div>
                        <p class="text-tertiary x-small mb-0 mt-1">Dampak sedang: atap seng terangkat, gelombang laut 3.5 - 5.0m.</p>
                    </div>
                </div>
                <div class="col-md">
                    <div class="p-3 rounded-2 h-100" style="background: var(--surface-1); border-top: 3px solid #d94d38;">
                        <span class="badge bg-secondary x-small mb-1">Kategori 3</span>
                        <div class="text-white fw-bold mono-num small">118 – 159 km/j</div>
                        <p class="text-tertiary x-small mb-0 mt-1">Dampak berat: kerusakan struktur bangunan ringan, gelombang > 5m.</p>
                    </div>
                </div>
                <div class="col-md">
                    <div class="p-3 rounded-2 h-100" style="background: var(--surface-1); border-top: 3px solid #b91c1c;">
                        <span class="badge bg-danger x-small mb-1">Kategori 4</span>
                        <div class="text-white fw-bold mono-num small">160 – 199 km/j</div>
                        <p class="text-tertiary x-small mb-0 mt-1">Dampak parah: pepohonan roboh, bahaya rob dan erosi pesisir kuat.</p>
                    </div>
                </div>
                <div class="col-md">
                    <div class="p-3 rounded-2 h-100" style="background: var(--surface-1); border-top: 3px solid #6f6fe8;">
                        <span class="badge bg-danger x-small mb-1">Kategori 5</span>
                        <div class="text-white fw-bold mono-num small">> 200 km/j</div>
                        <p class="text-tertiary x-small mb-0 mt-1">Bencana dahsyat: kehancuran infrastruktur, evakuasi pesisir penuh.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Penjelasan Ilmiah Fenomena -->
        <div class="row g-4">
            <div class="col-md-6">
                <div class="editorial-card h-100">
                    <h6 class="text-white fw-bold mb-2"><i class="bi bi-globe text-blue me-2"></i>Perlindungan Alami Gaya Coriolis Khatulistiwa</h6>
                    <p class="text-secondary small mb-0">
                        Indonesia dilewati garis khatulistiwa di mana <strong>Gaya Coriolis bernilai nol</strong>. Gaya ini adalah gaya semu yang memutar arah angin menjadi pusaran siklon. Oleh karena itu, siklon tropis tidak dapat terbentuk di khatulistiwa dan selalu bergerak menjauhi kepulauan Indonesia menuju perairan subtropis.
                    </p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="editorial-card h-100">
                    <h6 class="text-white fw-bold mb-2"><i class="bi bi-water text-yellow me-2"></i>Waspadai Efek Ekor Siklon (Tail Effect)</h6>
                    <p class="text-secondary small mb-0">
                        Walau mata siklon tidak menyentuh daratan Indonesia, pusaran badai sering menarik massa udara basah. Ini menimbulkan efek tarikan angin kencang (tail effect) berupa hujan berintensitas lebat, gelombang tinggi, dan anomali cuaca di pesisir barat Sumatera serta pesisir selatan Jawa dan Nusa Tenggara.
                    </p>
                </div>
            </div>
        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
