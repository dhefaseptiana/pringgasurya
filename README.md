# PRINGGASURYA Smart Irrigation

PRINGGASURYA adalah prototipe dashboard irigasi pintar untuk konsep **solar-first, grid-assisted smart irrigation** di Pringgarata. Aplikasi menggabungkan pemantauan air, energi surya, cadangan PLN, zona tanaman, emisi, dan perangkat lapangan dalam satu antarmuka.

> Dashboard saat ini menggunakan data simulasi untuk mendemonstrasikan alur sistem. Pengendalian perangkat fisik harus melalui RTU dan interlock keselamatan lokal.

## Fitur

- Ringkasan kondisi air, tandon, debit, energi, dan status sistem.
- Profil irigasi Padi, Hortikultura, dan Palawija.
- Simulasi kontrol pompa dan katup untuk beberapa zona.
- Pemantauan produksi PLTS, konsumsi pompa, PLN, dan emisi terhindarkan.
- Katalog sensor berisi tipe, sinyal, lokasi, koneksi, interval, dan perawatan.
- Riwayat aktivitas serta indikator evaluasi pilot.
- Tampilan responsif untuk desktop dan perangkat seluler.

## Arsitektur lapangan

```text
Sensor lapangan
      ↓
I/O RS485, 4–20 mA, dan digital yang terisolasi
      ↓
RTU ESP32 industri dan interlock lokal
      ↓
LoRa AS923 / MQTT gateway
      ↓
Dashboard PRINGGASURYA
```

Perintah dari dashboard hanya berupa permintaan atau setpoint. RTU tetap memeriksa float switch, dry-run, overload, tekanan, emergency stop, dan status kontaktor sebelum menjalankan pompa.

## Sensor dan aktuator

| Kode | Perangkat | Jenis utama | Sinyal | Prioritas |
|---|---|---|---|---|
| WL-01 | Tinggi muka air sawah | Vented hydrostatic level transmitter 0–1 m, IP68 | 4–20 mA | Wajib untuk padi |
| TL-01 | Ketinggian tandon | Ultrasonic level sensor IP67 | RS485/4–20 mA | Wajib |
| FS-01 | Batas tandon | Float switch high/low, normally closed | Dry contact | Wajib |
| FM-01 | Debit air | Electromagnetic flow meter IP67 | RS485 + pulse | Wajib |
| PT-01 | Tekanan pompa | Pressure transmitter 0–10 bar | 4–20 mA | Disarankan |
| SM-01 | Kelembapan tanah | FDR/capacitive multi-depth probe IP68 | RS485 | Wajib untuk hortikultura/palawija |
| PH-01 | pH air | Industrial immersion pH probe | RS485/4–20 mA | Disarankan |
| EC-01 | Konduktivitas air | Conductivity sensor dengan kompensasi suhu | RS485/4–20 mA | Disarankan |
| TU-01 | Kekeruhan air | Optical turbidity sensor | RS485 | Opsional |
| EM-01 | Energi pompa dan PLN | Multifunction energy meter + CT | RS485 | Wajib |
| PV-01 | Daya panel surya | Inverter/MPPT register atau DC meter | RS485 | Wajib |
| WX-01 | Cuaca mikro | SHT35, rain gauge, pyranometer opsional | RS485/SDI-12/pulse | Opsional |
| MV-01 | Katup zona | Motorized valve dengan limit switch | 24 VDC + feedback | Aktuator |

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Untuk memastikan versi produksi dapat dibuat:

```bash
npm run build
```

## Deployment

Setiap perubahan yang masuk ke branch `main` akan dibangun dan diterbitkan otomatis melalui workflow GitHub Pages di `.github/workflows/deploy-pages.yml`.

Website: <https://dhefaseptiana.github.io/pringgasurya/>

## Catatan keselamatan

- Sensor 4–20 mA tidak dihubungkan langsung ke pin ESP32; gunakan ADC industri terisolasi.
- Gunakan enclosure minimal IP65, grounding, SPD, MCB, dan pemisahan kabel daya dengan kabel sinyal.
- Emergency stop, overload, dry-run, dan float switch harus tetap bekerja tanpa internet.
- Spesifikasi pompa, sensor, panel surya, pipa, dan tandon harus disesuaikan kembali setelah survei debit, total head, kualitas air, dan kebutuhan tanaman.
