/* =============================================
   sidebar.js — komponen sidebar navigasi
   mode tampilan ala Supabase (tombol "Sidebar control" di bawah):
   expanded | collapsed | hover (sempit, melebar pas di-hover)
   ============================================= */

var SIDEBAR_MODE_KEY = "ledgerly_sidebar_mode";
var SIDEBAR_MODES = [
  { id: "expanded", label: "Expanded" },
  { id: "collapsed", label: "Collapsed" },
  { id: "hover", label: "Expand on hover" }
];

function modeSidebar() {
  let m = localStorage.getItem(SIDEBAR_MODE_KEY);
  if (!m) {
    // migrasi dr tombol minimize lama (ledgerly_sidebar_collapsed=true)
    m = localStorage.getItem("ledgerly_sidebar_collapsed") === "true" ? "collapsed" : "expanded";
  }
  return SIDEBAR_MODES.some(function (x) { return x.id === m; }) ? m : "expanded";
}

function terapkanModeSidebar(mode) {
  let shell = document.querySelector(".dasbor-shell");
  if (!shell) return;
  shell.classList.toggle("sidebar-collapsed", mode === "collapsed");
  shell.classList.toggle("sidebar-mode-hover", mode === "hover");
}

function renderSidebar() {
  let el = document.getElementById("sidebar");
  if (!el) return;

  let user = store.user || {};
  let inisial = (user.nama || "U")
    .split(" ")
    .map(function (w) {
      return w[0];
    })
    .join("")
    .toUpperCase()
    .slice(0, 2);

  let mode = modeSidebar();
  terapkanModeSidebar(mode);

  let navHtml = "";
  if (user.role === "superadmin") {
    navHtml += navLink("#dasbor-superadmin", icon("fileBarChart"), "Ikhtisar Sistem");
    navHtml += navLink("#kelola-pemilik", icon("users"), "Kelola Pemilik");
    navHtml += navLink("#kelola-pengumuman", icon("bell"), "Kelola Pengumuman");
    navHtml += navLink("#pengaturan-platform", icon("settings"), "Pengaturan Platform");
  } else {
    navHtml += navLink("#beranda", icon("barChart"), "Beranda");
    navHtml += navLink("#inventaris", icon("package"), "Inventaris");
    navHtml += navLink("#keuangan", icon("wallet"), "Keuangan");
    navHtml += navLink("#transaksi", icon("arrowLeftRight"), "Transaksi");
    navHtml += navLink("#laporan", icon("fileBarChart"), "Laporan");
    navHtml += navLink("#keputusan", icon("lightbulb"), "Keputusan");
    navHtml += navLink("#pengumuman", icon("bell"), "Pengumuman");
    navHtml += navLink("#pengaturan", icon("settings"), "Pengaturan");
  }

  let opsiMode = SIDEBAR_MODES.map(function (m) {
    let aktif = m.id === mode;
    return `<button type="button" class="sidebar-mode-opt${aktif ? " aktif" : ""}" role="menuitemradio" aria-checked="${aktif}" data-mode="${m.id}">
        <span class="sidebar-mode-dot" aria-hidden="true"></span>${m.label}
      </button>`;
  }).join("");

  // nama/bisnis diisi user sendiri -> wajib di-escape (cegah XSS lewat nama)
  el.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-logo">
        <div style="padding: 8px">
          <img src="assets/logo.svg" alt="Ledgerly Logo" style="width: 100%; height: 100%; filter: brightness(0) invert(1)" />
        </div>
      </div>
      <div class="sidebar-brand-text">
        <div class="sidebar-app-name">Ledgerly</div>
        <div class="sidebar-app-sub">Sistem UMKM</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${navHtml}
    </nav>
    <div class="sidebar-footer">
      <!-- expanded: [sidebar control][tema] sebaris. sempit: numpuk, tema pas di atas akun -->
      <div class="sidebar-kontrol-baris">
        <div class="sidebar-kontrol">
          <button type="button" class="sidebar-kontrol-btn" id="sidebar-kontrol-btn" title="Sidebar control" aria-label="Sidebar control" aria-haspopup="menu" aria-expanded="false" onclick="toggleMenuSidebar(event)">
            ${icon("panelLeft", 16)}
          </button>
          <div class="sidebar-mode-menu" id="sidebar-mode-menu" role="menu" aria-label="Sidebar control" hidden>
            <div class="sidebar-mode-judul">Sidebar control</div>
            ${opsiMode}
          </div>
        </div>
        <button class="sidebar-tema-toggle js-tema-toggle" type="button" title="Ganti Tema" aria-label="Ganti Tema"></button>
      </div>
      <div class="sidebar-user">
        <a href="#akun" class="sidebar-akun-link${halamanSkrg === "#akun" ? " active" : ""}" title="Akun saya" aria-label="Akun saya">
          <div class="sidebar-avatar">${escapeHtml(inisial)}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${escapeHtml(user.nama || "User")}</div>
            <div class="sidebar-user-biz">${escapeHtml(user.bisnis || "")}</div>
          </div>
        </a>
        <button class="sidebar-logout" type="button" onclick="logout()" title="Logout" aria-label="Logout">${icon("logOut")}</button>
      </div>
    </div>
  `;

  // attach click events ke nav links
  el.querySelectorAll(".sidebar-link").forEach(function (link) {
    link.addEventListener("click", function () {
      navigasi(this.getAttribute("data-hash"));
    });
  });

  el.querySelectorAll(".sidebar-mode-opt").forEach(function (btn) {
    btn.addEventListener("click", function () {
      gantiModeSidebar(this.getAttribute("data-mode"));
    });
  });

  // sidebar di-render ulang tiap navigasi -> ikon toggle tema kosong.
  // theme.js expose pasangIkonTema buat ngegambar ulang ikon sesuai tema skrg.
  if (typeof window.pasangIkonTema === "function") window.pasangIkonTema();
}

// helper bikin nav link html
function navLink(hash, iconSvg, label) {
  let isActive = halamanSkrg === hash ? " active" : "";
  return `
    <button class="sidebar-link${isActive}" data-hash="${hash}" title="${label}">
      ${iconSvg}<span>${label}</span>
    </button>
  `;
}

function gantiModeSidebar(mode) {
  localStorage.setItem(SIDEBAR_MODE_KEY, mode);
  localStorage.removeItem("ledgerly_sidebar_collapsed");
  tutupMenuSidebar();
  renderSidebar();
}

function toggleMenuSidebar(e) {
  if (e) e.stopPropagation();
  let menu = document.getElementById("sidebar-mode-menu");
  if (!menu) return;
  if (menu.hidden) {
    menu.hidden = false;
    document.getElementById("sidebar-kontrol-btn").setAttribute("aria-expanded", "true");
    let aktif = menu.querySelector(".sidebar-mode-opt.aktif");
    if (aktif) aktif.focus();
  } else {
    tutupMenuSidebar();
  }
}

function tutupMenuSidebar() {
  let menu = document.getElementById("sidebar-mode-menu");
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  let btn = document.getElementById("sidebar-kontrol-btn");
  if (btn) btn.setAttribute("aria-expanded", "false");
}

// tutup menu klo klik di luar / tekan Escape
document.addEventListener("click", function (e) {
  if (!e.target.closest(".sidebar-kontrol")) tutupMenuSidebar();
});
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  let menu = document.getElementById("sidebar-mode-menu");
  if (menu && !menu.hidden) {
    tutupMenuSidebar();
    let btn = document.getElementById("sidebar-kontrol-btn");
    if (btn) btn.focus();
  }
});
