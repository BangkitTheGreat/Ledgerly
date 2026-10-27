/* =============================================
   akun.js — halaman Akun Saya
   profil, langganan, ringkasan toko. semua teks dr user di-escape.
   edit profil tetap lewat halaman Pengaturan (yg udah ada).
   ============================================= */

var LABEL_PAKET = { starter: 'Starter', business: 'Profesional', enterprise: 'Enterprise' };

function initAkun() {
  let user = store.user || {};
  let superadmin = user.role === 'superadmin';
  let inisial = (user.nama || 'U').split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  let paket = LABEL_PAKET[user.paket] || 'Starter';

  let profil = document.getElementById('akun-profil');
  if (profil) {
    let badges = '<span class="badge badge-info">' + (superadmin ? 'Superadmin' : 'Pemilik Toko') + '</span>';
    if (!superadmin) badges += '<span class="badge badge-success">Paket ' + escapeHtml(paket) + '</span>';
    if (window.LEDGERLY_DEMO) badges += '<span class="badge badge-neutral">Mode Demo</span>';

    let aksi = '';
    if (!superadmin) aksi += '<a href="#pengaturan" class="btn btn-secondary">' + icon('settings') + ' Edit Profil</a>';
    aksi += '<button type="button" class="btn btn-secondary" onclick="logout()">' + icon('logOut') + ' Keluar</button>';

    profil.innerHTML =
      '<div class="akun-avatar" aria-hidden="true">' + escapeHtml(inisial) + '</div>' +
      '<div class="akun-identitas">' +
        '<div class="akun-nama">' + escapeHtml(user.nama || 'User') + '</div>' +
        '<div class="akun-email">' + escapeHtml(user.email || '-') + '</div>' +
        '<div class="akun-badges">' + badges + '</div>' +
      '</div>' +
      '<div class="akun-aksi">' + aksi + '</div>';
  }

  // ringkasan toko — superadmin gak punya toko sendiri
  let statsRow = document.getElementById('akun-stats-row');
  if (statsRow) {
    if (superadmin) {
      statsRow.remove();
    } else {
      let inv = hitungInventaris();
      statsRow.innerHTML =
        statCard('Total Produk', inv.totalSKU + ' SKU', icon('package'), 'Produk di katalog') +
        statCard('Total Transaksi', (store.transaksi || []).length, icon('arrowLeftRight'), 'Semua periode') +
        statCard('Nilai Inventaris', formatRupiah(inv.totalNilai), icon('dollarSign'), 'Berdasarkan harga beli', 'success');
    }
  }

  let info = document.getElementById('akun-info');
  if (info) {
    let baris = [
      ['Nama lengkap', user.nama],
      ['Email', user.email],
      ['Peran', superadmin ? 'Superadmin' : 'Pemilik Toko']
    ];
    if (!superadmin) {
      baris.push(['Nama bisnis', user.bisnis]);
      baris.push(['No. WhatsApp', user.noTelp ? '+' + user.noTelp : '']);
    }
    baris.push(['Terdaftar sejak', formatTanggalAkun(user.tglDaftar)]);
    info.innerHTML = renderBarisAkun(baris);
  }

  let langganan = document.getElementById('akun-langganan');
  if (langganan) {
    if (superadmin) {
      langganan.innerHTML = renderBarisAkun([['Akses', 'Penuh (pengelola platform)']]);
    } else {
      let status = 'Aktif';
      let berlaku = 'Tanpa batas waktu';
      if (user.paket === 'business' && user.tglExpired) {
        let sisa = Math.ceil((new Date(user.tglExpired) - new Date()) / 86400000);
        status = (user.statusLangganan === 'langganan' ? 'Langganan' : 'Trial') + ' · sisa ' + Math.max(sisa, 0) + ' hari';
        berlaku = formatTanggalAkun(user.tglExpired);
      }
      langganan.innerHTML = renderBarisAkun([
        ['Paket', paket],
        ['Status', status],
        ['Berlaku hingga', berlaku]
      ]);
    }
  }
}

function renderBarisAkun(baris) {
  return baris.map(function (b) {
    return '<div class="akun-info-baris"><dt>' + escapeHtml(b[0]) + '</dt><dd>' + escapeHtml(b[1] || '-') + '</dd></div>';
  }).join('');
}

function formatTanggalAkun(val) {
  if (!val) return '';
  let d = new Date(val);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
