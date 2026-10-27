/* =============================================
   demo.js — mode "Coba Demo" (tanpa daftar, tanpa backend)

   cara kerja: di mode demo, js/supabase.js TIDAK bikin client Supabase asli,
   tapi pakai client palsu dr file ini yg bentuknya sama (from().select().eq()…)
   dan nyimpen data di sessionStorage tab ini. jadi semua halaman dasbor jalan
   apa adanya, tp gak ada satu request pun ke database.

   KEAMANAN:
   - demo cuma bisa dinyalain lewat tombol (masukDemo), bukan lewat URL, &
     cuma aktif di halaman dasbor. pindah ke halaman lain = demo selesai.
   - client asli gak pernah dibuat -> gak ada token, gak ada akses DB/RLS.
   - /api/chatbot gak dipanggil (butuh JWT asli) -> kuota Gemini aman.
   - data login asli di localStorage (ledgerly_user/settings) di-backup pas
     masuk demo & dipulihin pas keluar, biar demo gak nimpa akun asli.
   ============================================= */

(function () {
  var KEY_FLAG = 'ledgerly_demo';
  var KEY_DB = 'ledgerly_demo_db';
  var KEY_BACKUP = 'ledgerly_prademo';
  var DEMO_ID = 'd0000000-0000-4000-8000-000000000001';
  var DEMO_EMAIL = 'demo@ledgerly.local';

  function bacaSesi(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function hapusSesi(k) { try { sessionStorage.removeItem(k); } catch (e) {} }

  var diDasbor = location.pathname.indexOf('dasbor') !== -1;
  var aktif = diDasbor && bacaSesi(KEY_FLAG) === '1';
  window.LEDGERLY_DEMO = aktif;

  // pulihin data login asli yg di-backup pas masuk demo
  function pulihkanSebelumDemo() {
    try {
      var raw = localStorage.getItem(KEY_BACKUP);
      if (raw) {
        var b = JSON.parse(raw);
        if (b.user) localStorage.setItem('ledgerly_user', b.user); else localStorage.removeItem('ledgerly_user');
        if (b.settings) localStorage.setItem('ledgerly_settings', b.settings); else localStorage.removeItem('ledgerly_settings');
        localStorage.removeItem(KEY_BACKUP);
        return;
      }
      // backup udh dipake tab lain tp tab demo sempet nulis ulang -> buang sisa user demo
      // (cek pakai email: sync di app.js nulis ulang ledgerly_user tanpa flag demo)
      var u = JSON.parse(localStorage.getItem('ledgerly_user') || 'null');
      if (u && u.email === DEMO_EMAIL) localStorage.removeItem('ledgerly_user');
    } catch (e) {}
  }

  if (!aktif) {
    hapusSesi(KEY_FLAG);
    hapusSesi(KEY_DB);
    pulihkanSebelumDemo();
  }

  // dipanggil dr tombol "Coba Demo" (landing & login)
  window.masukDemo = function () {
    try {
      // backup cuma sekali — klo udh ada (demo sebelumnya blm dipulihin), jgn ditimpa
      if (!localStorage.getItem(KEY_BACKUP)) {
        localStorage.setItem(KEY_BACKUP, JSON.stringify({
          user: localStorage.getItem('ledgerly_user'),
          settings: localStorage.getItem('ledgerly_settings')
        }));
      }
      localStorage.setItem('ledgerly_user', JSON.stringify(USER_DEMO()));
      sessionStorage.setItem(KEY_FLAG, '1');
      sessionStorage.removeItem(KEY_DB); // selalu mulai dr data contoh yg bersih
    } catch (e) {
      alert('Mode demo butuh penyimpanan browser (sessionStorage). Matikan mode privat/blokir cookie lalu coba lagi.');
      return;
    }
    location.href = 'dasbor.html';
  };

  window.keluarDemo = function () {
    hapusSesi(KEY_FLAG);
    hapusSesi(KEY_DB);
    pulihkanSebelumDemo();
    location.href = 'index.html';
  };

  function USER_DEMO() {
    return {
      id: DEMO_ID, nama: 'Pengguna Demo', email: DEMO_EMAIL, bisnis: 'Toko Demo Sejahtera',
      role: 'pemilik', paket: 'enterprise', tglExpired: null, statusLangganan: null,
      noTelp: 6281234567890, tglDaftar: new Date().toISOString(), demo: true
    };
  }

  if (!aktif) return; // halaman lain cuma butuh masukDemo/keluarDemo

  // ============ DATA CONTOH ============
  var METODE = [
    { metode_id: 'b1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', metode_pembayaran: 'Cash' },
    { metode_id: 'b2b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', metode_pembayaran: 'Transfer' },
    { metode_id: 'b3b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', metode_pembayaran: 'QRIS' }
  ];

  function idDemo(grup, n) {
    return 'd' + grup + '000000-0000-4000-8000-' + String(n).padStart(12, '0');
  }

  // PRNG deterministik biar data contoh sama tiap kali (gak acak2an tiap reload)
  function acak(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function buatDataContoh() {
    var sekarang = new Date().toISOString();
    var kategori = ['Minuman', 'Makanan', 'Sembako', 'Kebutuhan Rumah'].map(function (nama, i) {
      return { kategori_id: idDemo(1, i + 1), nama_kategori: nama, user_id: DEMO_ID, created_at: sekarang };
    });
    // [nama, sku, kategori idx, stok, min, modal, harga, supplier]
    var daftar = [
      ['Aqua Mineral 600ml', 'MNM-001', 0, 120, 30, 2800, 4000, 'CV Tirta Jaya'],
      ['Teh Botol Sosro 450ml', 'MNM-002', 0, 18, 24, 4200, 6000, 'CV Tirta Jaya'],
      ['Kopi Kapal Api Sachet', 'MNM-003', 0, 85, 40, 1300, 2000, 'UD Kopi Makmur'],
      ['Indomie Goreng', 'MKN-001', 1, 160, 50, 2700, 3500, 'PT Sumber Pangan'],
      ['Roti Tawar Sari Roti', 'MKN-002', 1, 9, 12, 13500, 17000, 'PT Sumber Pangan'],
      ['Beras Premium 5kg', 'SMB-001', 2, 32, 10, 68000, 78000, 'Toko Beras Barokah'],
      ['Gula Pasir 1kg', 'SMB-002', 2, 45, 20, 15500, 18500, 'Toko Beras Barokah'],
      ['Minyak Goreng 2L', 'SMB-003', 2, 7, 15, 33000, 38500, 'Toko Beras Barokah'],
      ['Rinso Cair 650ml', 'RMH-001', 3, 26, 10, 17500, 22000, 'UD Bersih Selalu'],
      ['Sabun Lifebuoy 85g', 'RMH-002', 3, 64, 25, 3600, 5000, 'UD Bersih Selalu']
    ];
    var produk = daftar.map(function (d, i) {
      return {
        product_id: idDemo(2, i + 1), SKU: d[1], nama_product: d[0], kategori_id: kategori[d[2]].kategori_id,
        current_stok: d[3], min_stok: d[4], max_stok: d[3] * 2, modal: d[5], harga: d[6],
        supplier_nama: d[7], supplier_wa: '6281200000' + String(i).padStart(3, '0'), barcode: '899' + String(1000000000 + i * 7919),
        user_id: DEMO_ID, created_at: sekarang, updated_at: sekarang.slice(0, 10)
      };
    });

    // transaksi 60 hari terakhir: 2-5 penjualan/hari + restock tiap ~10 hari
    var rnd = acak(20260101);
    var transaksi = [], detail = [], n = 0;
    function catat(tgl, produkRow, jumlah, jual) {
      n++;
      var tid = idDemo(3, n);
      transaksi.push({
        transaction_id: tid, isPenjualan: jual, user_id: DEMO_ID,
        metode_id: METODE[Math.floor(rnd() * 3)].metode_id,
        catatan: jual ? '' : 'Restock dari ' + produkRow.supplier_nama, created_at: tgl.toISOString()
      });
      detail.push({
        detail_id: idDemo(4, n), transaction_id: tid, product_id: produkRow.product_id, jumlah: jumlah,
        nama_snapshot: produkRow.nama_product, harga_beli_snapshot: produkRow.modal,
        harga_jual_snapshot: produkRow.harga, user_id: DEMO_ID
      });
    }
    for (var hari = 59; hari >= 0; hari--) {
      var penjualan = 2 + Math.floor(rnd() * 4);
      for (var j = 0; j < penjualan; j++) {
        var tgl = new Date(); tgl.setDate(tgl.getDate() - hari); tgl.setHours(8 + Math.floor(rnd() * 12), Math.floor(rnd() * 60), 0, 0);
        catat(tgl, produk[Math.floor(rnd() * produk.length)], 1 + Math.floor(rnd() * 6), true);
      }
      if (hari % 10 === 3) {
        var tglR = new Date(); tglR.setDate(tglR.getDate() - hari); tglR.setHours(7, 30, 0, 0);
        catat(tglR, produk[Math.floor(rnd() * produk.length)], 24 + Math.floor(rnd() * 3) * 12, false);
      }
    }

    return {
      Users: [{
        user_id: DEMO_ID, email: DEMO_EMAIL, nama: 'Pengguna Demo', bisnis: 'Toko Demo Sejahtera', role: 'pemilik',
        noTelp: 6281234567890, paket: 'enterprise', tgl_expired: null, status_langganan: null, created_at: sekarang
      }],
      Kategori: kategori,
      Products: produk,
      Metode: METODE,
      Transactions: transaksi,
      Detail_Transactions: detail,
      Pengumuman: [{
        id: idDemo(5, 1), is_aktif: true, created_at: sekarang,
        judul: 'Selamat datang di mode demo 👋',
        isi: 'Semua data di sini adalah contoh dan hanya tersimpan di tab browser ini. Silakan coba tambah produk, catat transaksi, atau lihat laporan. Daftar akun gratis untuk menyimpan data asli Anda.'
      }],
      // samain dgn default di app.js (sync nimpa store.platformSettings)
      Platform_Settings: [
        { key: 'wa_admin', value: '6285750917686' },
        { key: 'wa_cs', value: '6285750917686' },
        { key: 'wa_saluran', value: '' },
        { key: 'pesan_upgrade', value: 'Halo Admin Ledgerly, saya tertarik untuk melakukan upgrade atau memperpanjang paket langganan toko saya.' },
        { key: 'pesan_cs', value: 'Halo CS Ledgerly, saya mengalami kendala di aplikasi Ledgerly dan memerlukan bantuan.' }
      ]
    };
  }

  // ============ CLIENT SUPABASE PALSU ============
  var PK = {
    Users: 'user_id', Kategori: 'kategori_id', Products: 'product_id', Metode: 'metode_id',
    Transactions: 'transaction_id', Detail_Transactions: 'detail_id', Pengumuman: 'id', Platform_Settings: 'key'
  };

  var db;
  try { db = JSON.parse(bacaSesi(KEY_DB) || 'null'); } catch (e) { db = null; }
  if (!db) db = buatDataContoh();
  function simpanDb() {
    try { sessionStorage.setItem(KEY_DB, JSON.stringify(db)); } catch (e) { /* penuh/diblok -> data cuma di memori */ }
  }
  simpanDb();

  function salin(x) { return JSON.parse(JSON.stringify(x)); }
  function idBaru() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : 'd9' + Date.now().toString(16) + '-0000-4000-8000-' + String(Math.floor(Math.random() * 1e12)).padStart(12, '0');
  }

  function query(tabel) {
    var op = 'select', isi = null, filter = [], urut = null, satu = 0, balikinBaris = false;
    var b = {
      select: function () { if (op !== 'select') balikinBaris = true; return b; },
      insert: function (v) { op = 'insert'; isi = v; return b; },
      update: function (v) { op = 'update'; isi = v; return b; },
      upsert: function (v) { op = 'upsert'; isi = v; return b; },
      delete: function () { op = 'delete'; return b; },
      eq: function (k, v) { filter.push(function (r) { return r[k] === v; }); return b; },
      in: function (k, arr) { filter.push(function (r) { return arr.indexOf(r[k]) !== -1; }); return b; },
      order: function (k, o) { urut = { k: k, naik: !o || o.ascending !== false }; return b; },
      single: function () { satu = 1; return b; },
      maybeSingle: function () { satu = 2; return b; },
      then: function (ok, gagal) {
        var hasil;
        try { hasil = jalankan(); } catch (e) { hasil = { data: null, error: { message: e.message } }; }
        return Promise.resolve(hasil).then(ok, gagal);
      }
    };

    function cocok(r) { return filter.every(function (f) { return f(r); }); }

    function jalankan() {
      var rows = db[tabel] || (db[tabel] = []);
      var data = null;

      if (op === 'select') {
        data = rows.filter(cocok);
        if (urut) data.sort(function (a, c) {
          var x = a[urut.k], y = c[urut.k];
          return (x > y ? 1 : x < y ? -1 : 0) * (urut.naik ? 1 : -1);
        });
      } else if (op === 'insert' || op === 'upsert') {
        var masuk = (Array.isArray(isi) ? isi : [isi]).map(function (v) {
          var r = salin(v), pk = PK[tabel];
          if (op === 'upsert' && pk && r[pk] != null) {
            var lama = rows.find(function (x) { return x[pk] === r[pk]; });
            if (lama) { Object.assign(lama, r); return lama; }
          }
          if (pk && r[pk] == null) r[pk] = idBaru();
          if (!r.created_at && tabel !== 'Platform_Settings' && tabel !== 'Metode') r.created_at = new Date().toISOString();
          if (r.user_id == null && tabel !== 'Pengumuman' && tabel !== 'Platform_Settings' && tabel !== 'Metode') r.user_id = DEMO_ID;
          rows.push(r);
          return r;
        });
        data = balikinBaris ? masuk : null;
      } else if (op === 'update') {
        data = rows.filter(cocok);
        data.forEach(function (r) { Object.assign(r, salin(isi)); });
        if (!balikinBaris) data = null;
      } else if (op === 'delete') {
        var hapus = rows.filter(cocok);
        db[tabel] = rows.filter(function (r) { return !cocok(r); });
        // tiru FK: produk/kategori dihapus -> referensinya jadi null
        if (tabel === 'Products') hapus.forEach(function (p) {
          db.Detail_Transactions.forEach(function (d) { if (d.product_id === p.product_id) d.product_id = null; });
        });
        if (tabel === 'Kategori') hapus.forEach(function (k) {
          db.Products.forEach(function (p) { if (p.kategori_id === k.kategori_id) p.kategori_id = null; });
        });
        if (tabel === 'Transactions') hapus.forEach(function (t) {
          db.Detail_Transactions = db.Detail_Transactions.filter(function (d) { return d.transaction_id !== t.transaction_id; });
        });
        data = balikinBaris ? hapus : null;
      }

      if (op !== 'select') simpanDb();

      data = data === null ? null : salin(data);
      if (satu && Array.isArray(data)) {
        if (!data.length) {
          return satu === 1 ? { data: null, error: { message: 'Data tidak ditemukan (demo)' } } : { data: null, error: null };
        }
        data = data[0];
      }
      return { data: data, error: null };
    }

    return b;
  }

  var authUser = { id: DEMO_ID, email: DEMO_EMAIL, created_at: new Date().toISOString() };
  window.buatClientDemo = function () {
    return {
      from: query,
      auth: {
        getUser: function () { return Promise.resolve({ data: { user: authUser }, error: null }); },
        // sengaja gak ada session/token: gak ada yg bisa dikirim ke server
        getSession: function () { return Promise.resolve({ data: { session: null }, error: null }); },
        // callback gak pernah dipanggil: app.js nge-logout klo dpt event tanpa session
        onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
        signOut: function () { return Promise.resolve({ error: null }); }
      }
    };
  };

  // ============ BANNER MODE DEMO ============
  document.addEventListener('DOMContentLoaded', function () {
    var css = document.createElement('style');
    // nowrap: tanpa ini left:50% bikin lebarnya mentok setengah layar & teks patah2.
    // HP: geser ke kiri & sembunyiin keterangan biar gak nabrak FAB chatbot (kanan bawah)
    css.textContent = '#demo-banner{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:10px;white-space:nowrap;padding:8px 8px 8px 14px;border-radius:9999px;background:#1e1b4b;color:#e0e7ff;font-size:12px;line-height:1.4;box-shadow:0 8px 24px rgba(15,23,42,.35);border:1px solid rgba(165,180,252,.35)}' +
      '#demo-banner button{border:0;border-radius:9999px;padding:6px 12px;background:#4f46e5;color:#fff;font:inherit;font-weight:600;cursor:pointer}' +
      '@media (max-width:640px){#demo-banner{left:16px;transform:none;bottom:24px}#demo-banner .demo-detail{display:none}}';
    document.head.appendChild(css);

    var el = document.createElement('div');
    el.id = 'demo-banner';
    el.setAttribute('role', 'status');
    el.innerHTML = '<span><strong>Mode Demo</strong><span class="demo-detail"> · data contoh, tidak tersimpan ke server</span></span>' +
      '<button type="button">Keluar Demo</button>';
    el.querySelector('button').addEventListener('click', window.keluarDemo);
    document.body.appendChild(el);
  });
})();
