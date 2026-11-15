<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pusat Siaga Cuaca Buruk dan Darurat — Atmosferia</title>
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
                <a href="topan.php" class="nav-item-link d-none d-md-inline-flex"><i class="bi bi-hurricane"></i> Topan</a>
            </nav>
        </div>
    </header>

    <div class="container pb-5">
        
        <!-- Hero Header -->
        <div class="editorial-card mb-4">
            <span class="text-red x-small fw-bold d-block mb-1">Protokol Kesiapsiagaan Hidrometeorologi</span>
            <h1 class="h4 text-white fw-bold mb-1">Pusat Siaga Cuaca Buruk dan Tanggap Darurat</h1>
            <p class="text-secondary small mb-0">Informasi wilayah berisiko tinggi, panduan keselamatan mandiri, dan nomor kontak bantuan darurat resmi.</p>
        </div>

        <!-- Banner Alert Utama -->
        <div class="alert-strip mb-4">
            <div class="d-flex align-items-start gap-3">
                <i class="bi bi-exclamation-triangle-fill fs-3 text-red flex-shrink-0 mt-1"></i>
                <div>
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="badge bg-danger bg-opacity-25 text-danger px-2 py-0.5 x-small fw-bold">Status: Siaga II</span>
                        <span class="text-tertiary x-small">Masa Pantau 24 Jam ke Depan</span>
                    </div>
                    <h5 class="fw-bold text-white mb-2 fs-6">Potensi Hujan Lebat Disertai Kilat dan Angin Kencang Sesaat</h5>
                    <p class="text-secondary small mb-0">Aktivitas konvergensi antartropis dan gelombang atmosfer memicu pertumbuhan awan kumulonimbus tebal di sepanjang pulau Jawa hingga Nusa Tenggara. Warga diimbau waspada terhadap bahaya genangan, pohon tumbang, serta tanah longsor di kawasan perbukitan.</p>
                </div>
            </div>
        </div>

        <div class="row g-4 mb-4">
            
            <!-- Wilayah Pantauan -->
            <div class="col-lg-7">
                <div class="editorial-card h-100">
                    <h6 class="text-white fw-bold mb-3"><i class="bi bi-geo-alt text-red me-2"></i>Status Wilayah Berisiko</h6>
                    
                    <div class="d-flex flex-column gap-3">
                        <div class="p-3 rounded-2" style="background: var(--bg-surface-elevated); border-left: 3px solid var(--color-red);">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="badge bg-danger bg-opacity-25 text-danger x-small fw-bold">Siaga Tinggi</span>
                                <span class="text-tertiary x-small">Sore sampai Malam Hari</span>
                            </div>
                            <strong class="text-white d-block mb-1">Jawa Barat dan Banten</strong>
                            <p class="text-secondary x-small mb-0">Wilayah Bogor, Sukabumi, Cianjur, Bandung Raya: Potensi curah hujan intensif berdurasi lebih dari 2 jam disertai petir kuat.</p>
                        </div>

                        <div class="p-3 rounded-2" style="background: var(--bg-surface-elevated); border-left: 3px solid var(--color-yellow);">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="badge bg-warning bg-opacity-25 text-warning x-small fw-bold">Waspada</span>
                                <span class="text-tertiary x-small">Siang Menjelang Sore</span>
                            </div>
                            <strong class="text-white d-block mb-1">DKI Jakarta dan Sekitarnya</strong>
                            <p class="text-secondary x-small mb-0">Jakarta Selatan dan Jakarta Timur: Potensi hembusan angin 30-40 km/jam dan genangan di kawasan cekungan jalan.</p>
                        </div>

                        <div class="p-3 rounded-2" style="background: var(--bg-surface-elevated); border-left: 3px solid var(--color-yellow);">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="badge bg-warning bg-opacity-25 text-warning x-small fw-bold">Waspada</span>
                                <span class="text-tertiary x-small">Dini Hari</span>
                            </div>
                            <strong class="text-white d-block mb-1">Jawa Tengah dan Pesisir Selatan</strong>
                            <p class="text-secondary x-small mb-0">Pesisir Samudera Hindia: Potensi peningkatan gelombang laut setinggi 2.5 hingga 4.0 meter bagi kapal nelayan kecil.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Kontak Darurat -->
            <div class="col-lg-5">
                <div class="editorial-card h-100">
                    <h6 class="text-white fw-bold mb-2"><i class="bi bi-telephone-outbound text-blue me-2"></i>Kontak Cepat Bantuan Darurat</h6>
                    <p class="text-secondary x-small mb-3">Layanan resmi pemerintah untuk penanganan situasi bencana:</p>

                    <div class="d-flex flex-column gap-2">
                        <a href="tel:117" class="d-flex justify-content-between align-items-center p-3 rounded-2 text-decoration-none" style="background: var(--surface-1); border: 1px solid var(--border-subtle);">
                            <div>
                                <strong class="text-white d-block small">BNPB (Bencana Nasional)</strong>
                                <span class="text-tertiary x-small">Pusat Komando dan Operasi</span>
                            </div>
                            <span class="badge bg-danger text-white fs-6 px-3 py-1 rounded-2 mono-num">117</span>
                        </a>

                        <a href="tel:115" class="d-flex justify-content-between align-items-center p-3 rounded-2 text-decoration-none" style="background: var(--surface-1); border: 1px solid var(--border-subtle);">
                            <div>
                                <strong class="text-white d-block small">BASARNAS (Pencarian dan Penyelamatan)</strong>
                                <span class="text-tertiary x-small">Evakuasi darurat warga</span>
                            </div>
                            <span class="badge bg-warning text-dark fs-6 px-3 py-1 rounded-2 mono-num">115</span>
                        </a>

                        <a href="tel:196" class="d-flex justify-content-between align-items-center p-3 rounded-2 text-decoration-none" style="background: var(--surface-1); border: 1px solid var(--border-subtle);">
                            <div>
                                <strong class="text-white d-block small">BMKG Call Center</strong>
                                <span class="text-tertiary x-small">Informasi gempa dan cuaca</span>
                            </div>
                            <span class="badge bg-secondary text-white fs-6 px-3 py-1 rounded-2 mono-num">196</span>
                        </a>

                        <a href="tel:123" class="d-flex justify-content-between align-items-center p-3 rounded-2 text-decoration-none" style="background: var(--surface-1); border: 1px solid var(--border-subtle);">
                            <div>
                                <strong class="text-white d-block small">PLN Gangguan Listrik</strong>
                                <span class="text-tertiary x-small">Kabel putus / korsleting</span>
                            </div>
                            <span class="badge bg-secondary text-white fs-6 px-3 py-1 rounded-2 mono-num">123</span>
                        </a>
                    </div>
                </div>
            </div>

        </div>

        <!-- Panduan Checklist Keselamatan -->
        <div class="editorial-card">
            <h6 class="text-white fw-bold mb-3"><i class="bi bi-clipboard-check text-green me-2"></i>Panduan Kesiapsiagaan Mandiri</h6>
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="p-3 rounded-2 h-100" style="background: var(--bg-surface-elevated);">
                        <strong class="text-white small d-block mb-2"><i class="bi bi-house text-blue me-1"></i> Keamanan Tempat Tinggal:</strong>
                        <ul class="text-secondary x-small ps-3 mb-0">
                            <li class="mb-1">Periksa talang dan bersihkan saluran air dari tumpukan sampah.</li>
                            <li class="mb-1">Pangkas ranting pepohonan lapuk di sekitar atap rumah.</li>
                            <li class="mb-1">Cabut peralatan elektronik sensitif saat mendengar suara petir.</li>
                            <li>Amankan dokumen penting dalam wadah kedap air.</li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 rounded-2 h-100" style="background: var(--bg-surface-elevated);">
                        <strong class="text-white small d-block mb-2"><i class="bi bi-car-front text-yellow me-1"></i> Saat Berkendara:</strong>
                        <ul class="text-secondary x-small ps-3 mb-0">
                            <li class="mb-1">Kurangi kecepatan dan pertahankan jarak aman 2x lipat.</li>
                            <li class="mb-1">Hindari berteduh di bawah baliho reklame dan pohon besar.</li>
                            <li class="mb-1">Jangan nekat menerobos banjir bila genangan melebihi knalpot.</li>
                            <li>Nyalakan lampu utama untuk membantu jarak pandang.</li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 rounded-2 h-100" style="background: var(--bg-surface-elevated);">
                        <strong class="text-white small d-block mb-2"><i class="bi bi-backpack text-red me-1"></i> Perlengkapan Darurat:</strong>
                        <ul class="text-secondary x-small ps-3 mb-0">
                            <li class="mb-1">Senter cadangan dengan baterai penuh.</li>
                            <li class="mb-1">Kotak P3K dan obat-obatan pribadi esensial.</li>
                            <li class="mb-1">Powerbank ponsel terisi daya cadangan.</li>
                            <li>Cadangan air bersih dalam botol tertutup.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
