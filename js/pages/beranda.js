/* =============================================
   beranda.js — halaman Beranda (ringkasan toko)
   semua angka dr store yg udah dihitung app.js (penjualanHarian, arusKas,
   produkTerlaris) -> gak ada request tambahan ke database.
   ============================================= */

var chartBerSpark = null,
    chartBerGauge = null,
    chartBerBar = null;

var WARNA_AVATAR = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #10b981, #0ea5e9)'
];

function initBeranda() {
  let user = store.user || {};
  let harian = store.penjualanHarian || [];
  let hariIni = harian[harian.length - 1] || { omzet: 0, pesanan: 0 };
  let ringkas30 = hitungRingkasan(30);

  // sapaan + tanggal
  let namaDepan = (user.nama || '').split(' ')[0];
  setTeks('ber-sapaan', namaDepan ? 'Halo, ' + namaDepan : 'Beranda');
  setTeks('ber-tanggal', new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · ringkasan toko Anda');

  // hero
  setTeks('ber-omzet-hari', formatRupiah(hariIni.omzet));
  setTeks('ber-pesanan-hari', hariIni.pesanan + ' pesanan');
  setTeks('ber-laba-30', formatRupiah(ringkas30.labaBersih));
  setHtml('ber-ikon-pesanan', icon('shoppingCart', 16));
  setHtml('ber-ikon-laba', icon('trendingUp', 16));
  setHtml('ber-ikon-omzet', icon('dollarSign', 16));

  renderSparkBeranda(harian.slice(-14));
  renderGaugeBeranda();
  renderBarBeranda();
  renderTerlarisBeranda();
  renderMetodeBeranda();
}

function setTeks(id, val) { let el = document.getElementById(id); if (el) el.textContent = val; }
function setHtml(id, val) { let el = document.getElementById(id); if (el) el.innerHTML = val; }

// -- tren omzet 14 hari (garis putih di atas hero) --
function renderSparkBeranda(data) {
  let ctx = document.getElementById('ber-spark');
  if (!ctx) return;
  if (chartBerSpark) chartBerSpark.destroy();
  chartBerSpark = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(function (d) {
        return new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      }),
      datasets: [{
        data: data.map(function (d) { return d.omzet; }),
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function (c) { return formatRupiah(c.parsed.y); } } }
      },
      scales: { x: { display: false }, y: { display: false, beginAtZero: true } }
    }
  });
}

// -- kesehatan stok: % produk yg stoknya >= minimum --
function renderGaugeBeranda() {
  let produk = store.produk || [];
  let total = produk.length;
  let aman = produk.filter(function (p) { return p.stok >= p.minStok; }).length;
  let perlu = total - aman;
  let persen = total ? Math.round(aman / total * 100) : 0;

  setTeks('ber-sehat-persen', persen);
  let teks = document.getElementById('ber-gauge-teks');
  if (teks) {
    teks.innerHTML = !total
      ? 'Belum ada produk. Tambahkan produk untuk mulai memantau stok.'
      : perlu
        ? '<strong>' + aman + ' dari ' + total + ' produk</strong> stoknya aman. ' + perlu + ' produk sudah di bawah batas minimum dan perlu segera di-restock.'
        : '<strong>Semua ' + total + ' produk</strong> stoknya aman. Pertahankan!';
  }
  setTeks('ber-gauge-cta-teks', perlu ? 'Lihat ' + perlu + ' produk perlu restock' : 'Lihat rekomendasi restock');

  let ctx = document.getElementById('ber-gauge');
  if (!ctx) return;
  if (chartBerGauge) chartBerGauge.destroy();
  chartBerGauge = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [persen, 100 - persen],
        backgroundColor: ['#f97316', 'rgba(249, 115, 22, 0.15)'],
        borderWidth: 0,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 180,
      cutout: '78%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });
}

// -- omzet 6 bulan (batang membulat) --
function renderBarBeranda() {
  let arus = store.arusKas || [];
  let bulanIni = arus[arus.length - 1];
  setTeks('ber-omzet-bulan', formatRupiah(bulanIni ? bulanIni.masuk : 0));

  let ctx = document.getElementById('ber-bar');
  if (!ctx) return;
  if (chartBerBar) chartBerBar.destroy();
  chartBerBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: arus.map(function (a) { return a.bulan; }),
      datasets: [{
        data: arus.map(function (a) { return a.masuk; }),
        backgroundColor: arus.map(function (a, i) {
          return i === arus.length - 1 ? '#6366f1' : 'rgba(99, 102, 241, 0.35)';
        }),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 18
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function (c) { return formatRupiah(c.parsed.y); } } }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
        y: { display: false, beginAtZero: true }
      }
    }
  });
}

// -- 3 produk terlaris --
function renderTerlarisBeranda() {
  let ul = document.getElementById('ber-terlaris');
  if (!ul) return;
  let list = (store.produkTerlaris || []).slice(0, 3);
  if (!list.length) {
    ul.innerHTML = '<li class="beranda-kosong">Belum ada penjualan.</li>';
    return;
  }
  ul.innerHTML = list.map(function (t, i) {
    let p = (store.produk || []).find(function (x) { return x.id === t.produkId; });
    let nama = p ? p.nama : (cariNamaTransaksi(t.produkId) || 'Produk');
    let inisial = nama.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
    return '<li>' +
      '<span class="beranda-avatar" style="background:' + WARNA_AVATAR[i % WARNA_AVATAR.length] + '" aria-hidden="true">' + escapeHtml(inisial) + '</span>' +
      '<div class="beranda-terlaris-info">' +
        '<div class="beranda-terlaris-nama">' + escapeHtml(nama) + '</div>' +
        '<div class="beranda-terlaris-kat">' + escapeHtml(p ? p.kategori : '-') + '</div>' +
      '</div>' +
      '<span class="beranda-chip">' + t.unit + ' unit</span>' +
    '</li>';
  }).join('');
}

function cariNamaTransaksi(produkId) {
  let t = (store.transaksi || []).find(function (x) { return x.produkId === produkId; });
  return t ? t.produkNama : '';
}

// -- metode pembayaran penjualan 30 hari --
function renderMetodeBeranda() {
  let ul = document.getElementById('ber-metode');
  if (!ul) return;
  let batas = new Date();
  batas.setDate(batas.getDate() - 30);
  let hitung = {}, total = 0;
  (store.transaksi || []).forEach(function (t) {
    if (t.tipe !== 'KELUAR' || new Date(t.tanggal) < batas) return;
    let m = (t.metode || 'manual').toLowerCase();
    hitung[m] = (hitung[m] || 0) + 1;
    total++;
  });
  if (!total) {
    ul.innerHTML = '<li class="beranda-kosong">Belum ada penjualan 30 hari terakhir.</li>';
    return;
  }
  let label = { cash: 'Tunai', transfer: 'Transfer', qris: 'QRIS', manual: 'Manual', csv: 'Import CSV' };
  ul.innerHTML = Object.keys(hitung)
    .sort(function (a, b) { return hitung[b] - hitung[a]; })
    .map(function (m) {
      let pct = Math.round(hitung[m] / total * 100);
      return '<li>' +
        '<div class="beranda-metode-baris"><span>' + escapeHtml(label[m] || m) + ' · ' + hitung[m] + ' trx</span><span>' + pct + '%</span></div>' +
        '<div class="beranda-track" role="presentation"><span style="width:' + pct + '%"></span></div>' +
      '</li>';
    }).join('');
}
