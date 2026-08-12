# PRINGGASURYA

PRINGGASURYA adalah prototipe platform **solar-first, grid-assisted smart irrigation** untuk Kecamatan Pringgarata, Kabupaten Lombok Tengah, Nusa Tenggara Barat. Sistem menyatukan energi, air, pertanian, analisis ekonomi, dan dampak lingkungan dalam satu antarmuka.

> **Simulation Mode:** seluruh telemetry, tren, peringatan, dan kontrol pada versi ini adalah simulasi. Aplikasi belum terhubung ke pompa, sensor, MQTT, database, atau jaringan PLN.

## Prinsip sistem

1. PLTS menjadi sumber utama saat energi matahari tersedia.
2. PLN membantu ketika produksi surya tidak mencukupi atau kebutuhan air tidak dapat ditunda.
3. Pompa memindahkan air ke tandon sebagai buffer operasional.
4. Baterai kecil/UPS hanya menopang sensor, RTU, dan komunikasi.
5. Proteksi pompa tetap berjalan pada panel dan RTU lapangan tanpa bergantung pada internet.

**Instead of storing electricity, we store water.**

## Modul antarmuka

- **Home:** narasi editorial dan project journey lima chapter yang menghubungkan Sistem, Operasi, Irigasi, Dampak, dan Kelayakan.
- **Operate:** Live Monitoring, Water, Energy, Smart Irrigation, Water Quality, dan Alerts.
- **Analyze:** Analytics, Environmental Impact, dan Economic Analysis.
- **Plan:** System Sizing, Scalability, dan Deployment.
- **Research:** Study Area, Methodology, dan References.
- **Settings:** kesiapan environment dan batas integrasi.

Routing memakai `HashRouter` agar setiap rute aman dibuka pada GitHub Pages, misalnya `/#/operate/live`.

## Fitur interaktif

- **Interactive System Explorer:** komponen dapat diklik; garis energi dan air bergerak mengikuti daya serta debit skenario aktif.
- **Scenario Control Center:** Play/Pause, jam simulasi, kecepatan 1×/5×/20×, cuaca, irradiance, PLN, level tandon, luas lahan, total head, dan kebutuhan irigasi.
- **Scenario comparison:** menyimpan maksimal tiga konfigurasi untuk membandingkan solar fraction, tandon, biaya, dan emisi.
- **Interactive Field Map:** memilih zona, membaca parameter tanaman, dan mengubah katup simulasi melalui dialog konfirmasi.
- **Crop Configuration Lab:** profil Padi, Hortikultura, dan Palawija dengan fase tumbuh serta kebutuhan air.
- **Agrivoltaic Comparison Lab:** membandingkan open field, panel di tandon, panel di saluran, dan naungan parsial.
- **Economic–Environmental Calculator:** memperbarui CAPEX, biaya tahunan, biaya air, payback, emisi, evaporasi, suhu mikro, dan land equivalent ratio secara reaktif.

Seluruh kalkulasi interaktif berbagi satu `SimulationInputs` dan simulation engine. Perubahan pada satu halaman memengaruhi keluaran halaman lainnya selama sesi browser yang sama.

## Visual direction

Versi 2.2 memakai art direction **clean, technical, agricultural, and grounded**. Komposisi tidak lagi bergantung pada grid card seragam. Setiap chapter memiliki focal point tersendiri, sedangkan `ProjectJourney` pada Home dan `PageContinuation` di akhir chapter menjaga seluruh pengalaman terbaca sebagai satu alur proyek.

## Arsitektur frontend

```text
src/
├── app/                 # providers dan route composition
├── components/          # komponen umum, chart, dan system flow
├── config/              # navigation configuration
├── contexts/            # crop dan scenario selection
├── domain/              # type, schema, dan sensor catalog
├── hooks/               # query hooks
├── layouts/             # desktop sidebar, topbar, mobile navigation
├── pages/               # route-level modules
├── services/
│   ├── contracts/       # interface bebas implementasi data
│   └── simulation/      # scenario-based telemetry engine
└── styles/              # design tokens dan responsive system
```

Frontend tidak boleh terhubung langsung ke hardware atau MQTT. Jalur integrasi masa depan:

```text
Sensor/aktuator → RTU & interlock → gateway → MQTT → backend → API/SSE → frontend
```

## Sensor dan aktuator utama

| Kode | Parameter | Jenis awal | Sinyal | Penggunaan |
|---|---|---|---|---|
| WL-01 | Muka air sawah | Vented hydrostatic level transmitter, IP68 | 4–20 mA | Parameter utama padi/AWD |
| TL-01 | Level tandon | Ultrasonic level sensor, IP67 | RS485/4–20 mA | Persediaan dan kontrol pengisian |
| FS-01 | Batas tandon | Float switch high/low, NC | Dry contact | Proteksi independen |
| FM-01 | Debit utama | Electromagnetic flow meter, IP67 | RS485 + pulse | Volume, dry-run, kebocoran |
| PT-01 | Tekanan discharge | Pressure transmitter 0–10 bar | 4–20 mA | Sumbatan dan kondisi pompa |
| SM-01 | Kelembapan tanah | FDR/capacitive multi-depth, IP68 | RS485 | Hortikultura dan palawija |
| PH-01 | pH air | Industrial immersion pH probe | RS485/4–20 mA | Peringatan dini kualitas |
| EC-01 | Konduktivitas | EC sensor + kompensasi suhu | RS485/4–20 mA | Salinitas/perubahan ion |
| TU-01 | Kekeruhan | Optical turbidity sensor | RS485 | Sedimen dan risiko sumbatan |
| EM-01 | Energi pompa/PLN | Multifunction meter + CT | RS485 | Daya, tegangan, arus, kWh |
| PV-01 | Produksi PLTS | Register inverter/MPPT | RS485 | Daya dan solar fraction |
| WX-01 | Cuaca mikro | SHT35 + rain gauge | RS485/SDI-12 | ET dan evaluasi agrivoltaik |
| MV-01 | Katup zona | Motorized valve + limit switch | Relay + feedback | Distribusi per zona |

Spesifikasi final harus mengikuti survei debit, total dynamic head, kualitas air, jenis tanah, pola tanam, dan kondisi instalasi.

## Menjalankan lokal

Prasyarat: Node.js 24 dan npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Pemeriksaan sebelum commit:

```bash
npm run typecheck
npm run test
npm run build
```

## Environment

Lihat `.env.example`. Variabel `VITE_*` selalu terbaca oleh browser dan tidak boleh berisi credential, token, password, broker secret, atau database secret.

Live mode harus menampilkan **LIVE SYSTEM NOT CONFIGURED** ketika backend belum tersedia dan tidak boleh otomatis mengganti data live dengan simulasi.

## Deployment

Push ke `main` menjalankan test, production build, dan deployment GitHub Pages melalui `.github/workflows/deploy-pages.yml`.

- Repository: <https://github.com/dhefaseptiana/pringgasurya>
- Website: <https://dhefaseptiana.github.io/pringgasurya/>

## Batas fase

Versi ini menyelesaikan frontend dalam Simulation Mode. Historical database, API/SSE, autentikasi, command acknowledgment, audit log, dan koneksi IoT berada pada fase selanjutnya.
