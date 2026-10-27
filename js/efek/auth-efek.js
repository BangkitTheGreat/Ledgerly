    // Beams Background Animation
    (function() {
      const canvas = document.getElementById('beams-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let beams = [];
      let animationFrameId;
      const MINIMUM_BEAMS = 20;
      // Using higher opacityMultiplier for light background
      const opacityMultiplier = 2.5; 

      function createBeam(width, height) {
        const angle = -35 + Math.random() * 10;
        return {
          x: Math.random() * width * 1.5 - width * 0.25,
          y: Math.random() * height * 1.5 - height * 0.25,
          width: 40 + Math.random() * 60,
          length: height * 2.5,
          angle: angle,
          speed: 0.8 + Math.random() * 1.2,
          opacity: 0.15 + Math.random() * 0.2,
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
        beam.opacity = 0.2 + Math.random() * 0.15;
        return beam;
      }

      function updateCanvasSize() {
        const section = document.querySelector('.login-wrapper');
        if (!section) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = section.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
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
