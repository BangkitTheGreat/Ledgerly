    // Inisialisasi Lenis Smooth Scroll
    const lenis = new Lenis({
      autoRaf: true
    });

    // Integrasi navigasi hash agar sinkron dengan Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          lenis.scrollTo(targetEl, {
            offset: -100 // berikan ruang offset untuk floating navbar
          });
        }
      });
    });

    // Toggle kelas .scrolled pada floating navbar
    window.addEventListener('scroll', function () {
      var nav = document.getElementById('nav-utama');
      if (nav) {
        if (window.scrollY > 20) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    });

    // IntersectionObserver untuk Scroll-Reveal animasi
    document.addEventListener('DOMContentLoaded', function () {
      // toggle mobile hamburger menu
      const btnToggle = document.getElementById('btn-toggle-menu');
      const navUtama = document.getElementById('nav-utama');

      if (btnToggle && navUtama) {
        btnToggle.addEventListener('click', function (e) {
          e.stopPropagation();
          navUtama.classList.toggle('menu-open');
        });

        // tutup menu klo klik di luar navbar
        document.addEventListener('click', function (event) {
          if (!navUtama.contains(event.target)) {
            navUtama.classList.remove('menu-open');
          }
        });

        // tutup menu pas klik salah satu link di dalemnya
        const mobileLinks = navUtama.querySelectorAll('.mobile-menu a');
        mobileLinks.forEach(function (link) {
          link.addEventListener('click', function () {
            navUtama.classList.remove('menu-open');
          });
        });
      }

      var revealElements = document.querySelectorAll('.scroll-reveal');
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Hanya animasi satu kali
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    });

    // toggle FAQ accordion
    function toggleFaq(btn) {
      var item = btn.closest('.faq-item');
      // tutup yg lain dulu
      document.querySelectorAll('.faq-item').forEach(function (el) {
        if (el !== item) el.classList.remove('open');
      });
      item.classList.toggle('open');
    }

    // FAQ Card Glow effect
    function setCardGlow(event) {
      var target = event.currentTarget;
      var rect = target.getBoundingClientRect();
      target.style.setProperty("--faq-x", (event.clientX - rect.left) + "px");
      target.style.setProperty("--faq-y", (event.clientY - rect.top) + "px");
    }

    function clearCardGlow(event) {
      var target = event.currentTarget;
      target.style.removeProperty("--faq-x");
      target.style.removeProperty("--faq-y");
    }

    // Beams Background Animation
    (function () {
      const canvas = document.getElementById('beams-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let beams = [];
      let animationFrameId;
      const MINIMUM_BEAMS = 20;
      // using intensity 'strong' -> 1
      const opacityMultiplier = 1;

      function createBeam(width, height) {
        const angle = -35 + Math.random() * 10;
        return {
          x: Math.random() * width * 1.5 - width * 0.25,
          y: Math.random() * height * 1.5 - height * 0.25,
          width: 30 + Math.random() * 60,
          length: height * 2.5,
          angle: angle,
          speed: 0.6 + Math.random() * 1.2,
          opacity: 0.12 + Math.random() * 0.16,
          hue: 190 + Math.random() * 70, // indigo to purple/blue hues
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        };
      }

      function resetBeam(beam, index, totalBeams) {
        if (!canvas) return beam;
        const column = index % 3;
        const spacing = canvas.width / 3;
        beam.y = canvas.height + 100;
        beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
        beam.width = 100 + Math.random() * 100;
        beam.speed = 0.5 + Math.random() * 0.4;
        beam.hue = 190 + (index * 70) / totalBeams;
        beam.opacity = 0.2 + Math.random() * 0.1;
        return beam;
      }

      function updateCanvasSize() {
        const section = document.getElementById('simulasi-section');
        if (!section) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = section.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        // canvas.style.width is handled by absolute inset
        ctx.scale(dpr, dpr);

        const totalBeams = MINIMUM_BEAMS * 1.5;
        beams = Array.from({ length: totalBeams }, () => createBeam(rect.width, rect.height));
      }

      function drawBeam(ctx, beam) {
        ctx.save();
        ctx.translate(beam.x, beam.y);
        ctx.rotate((beam.angle * Math.PI) / 180);

        const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMultiplier;
        const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

        gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
        gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
        gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
        gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
        gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
        ctx.restore();
      }

      function animate() {
        if (!canvas || !ctx) return;
        // Need to use rect width/height because ctx is scaled
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        const totalBeams = beams.length;
        beams.forEach((beam, index) => {
          beam.y -= beam.speed;
          beam.pulse += beam.pulseSpeed;
          if (beam.y + beam.length < -100) {
            resetBeam(beam, index, totalBeams);
          }
          drawBeam(ctx, beam);
        });
        animationFrameId = requestAnimationFrame(animate);
      }

      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      animate();
    })();

    // Cinematic Footer JS Logic
    (function () {
      // 1. Magnetic Buttons
      const magneticBtns = document.querySelectorAll('.magnetic-btn');
      magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px) rotateX(${-y * 0.15}deg) rotateY(${x * 0.15}deg) scale(1.05)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = `translate(0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
      });

      // 2. Parallax & Reveal
      const curtain = document.querySelector('.cinematic-curtain');
      const giantText = document.getElementById('footer-giant-text');
      const heading = document.getElementById('footer-heading');
      const links = document.getElementById('footer-links');
      const secondaryLinks = document.getElementById('footer-secondary-links');

      // Set initial state
      if (heading) { heading.style.transform = `translateY(50px)`; heading.style.opacity = 0; }
      if (links) { links.style.transform = `translateY(50px)`; links.style.opacity = 0; }
      if (secondaryLinks) { secondaryLinks.style.transform = `translateY(50px)`; secondaryLinks.style.opacity = 0; }

      window.addEventListener('scroll', () => {
        if (!curtain) return;
        const rect = curtain.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight) {
          let progress = 1 - (rect.top / windowHeight);
          if (progress < 0) progress = 0;
          if (progress > 1) progress = 1;

          if (giantText) {
            const yOffset = (1 - progress) * 10;
            const scale = 0.8 + (progress * 0.2);
            giantText.style.transform = `translateX(-50%) translateY(${yOffset}vh) scale(${scale})`;
            giantText.style.opacity = progress;
          }

          if (progress > 0.4) {
            const revealProgress = Math.min(1, (progress - 0.4) / 0.6);
            const yMove = (1 - revealProgress) * 50;

            if (heading) {
              heading.style.transform = `translateY(${yMove}px)`;
              heading.style.opacity = revealProgress;
            }
            if (links) {
              links.style.transform = `translateY(${yMove}px)`;
              links.style.opacity = revealProgress;
            }
            if (secondaryLinks) {
              secondaryLinks.style.transform = `translateY(${yMove}px)`;
              secondaryLinks.style.opacity = revealProgress;
            }
          } else {
            if (heading) { heading.style.transform = `translateY(50px)`; heading.style.opacity = 0; }
            if (links) { links.style.transform = `translateY(50px)`; links.style.opacity = 0; }
            if (secondaryLinks) { secondaryLinks.style.transform = `translateY(50px)`; secondaryLinks.style.opacity = 0; }
          }
        }
      });
    })();

// Ambil nomor wa.me 'Hubungi Sales' dari Platform_Settings (diatur superadmin).
// REST ringan (gak load SDK supabase penuh) — env di-inject vite ke window.process.
(function () {
  try {
    var env = (window.process && window.process.env) ? window.process.env : {};
    var url = env.VITE_SUPABASE_URL, key = env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(url + '/rest/v1/Platform_Settings?key=eq.wa_admin&select=value', {
      headers: { apikey: key, Authorization: 'Bearer ' + key }
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (data && data[0] && data[0].value) {
        var cta = document.getElementById('cta-wa-sales');
        if (cta) {
          var pesan = encodeURIComponent('Halo Admin Ledgerly, saya tertarik dengan Paket Enterprise Kustom untuk multi-cabang.');
          cta.href = 'https://wa.me/' + data[0].value + '?text=' + pesan;
        }
      }
    }).catch(function () { /* fallback ke nomor default di html */ });
  } catch (e) {}
})();
