/* ─────────────────────────────────────────────
       THEME RIPPLE TRANSITION
    ───────────────────────────────────────────── */
    window.triggerRipple = function triggerRipple(e) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const nextTheme = isDark ? 'light' : 'dark';
      const nextBg = isDark ? '#FAFAF8' : '#0F0F0F';

      // Get toggle button position
      const btn = document.getElementById('theme-toggle');
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Compute ripple size — must cover full viewport
      const maxDist = Math.max(
        Math.hypot(cx, cy),
        Math.hypot(window.innerWidth - cx, cy),
        Math.hypot(cx, window.innerHeight - cy),
        Math.hypot(window.innerWidth - cx, window.innerHeight - cy)
      );
      const diameter = maxDist * 2;

      // Create ripple div
      const ripple = document.createElement('div');
      ripple.className = 'theme-ripple';
      ripple.style.cssText = `
    width: ${diameter}px;
    height: ${diameter}px;
    top: ${cy - diameter / 2}px;
    left: ${cx - diameter / 2}px;
    background: ${nextBg};
  `;
      document.body.appendChild(ripple);

      // Force reflow, then expand
      ripple.getBoundingClientRect();
      ripple.style.transform = 'scale(1)';

      // Swap theme at peak and persist
      setTimeout(() => {
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
      }, 450);

      // Fade ripple out
      setTimeout(() => {
        ripple.style.transition = 'opacity 200ms ease';
        ripple.style.opacity = '0';
      }, 500);

      // Remove ripple
      setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 720);
    }

    /* ─────────────────────────────────────────────
       NAVBAR SCROLL EFFECT
    ───────────────────────────────────────────── */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    /* ─────────────────────────────────────────────
       MOBILE DRAWER
    ───────────────────────────────────────────── */
    window.toggleDrawer = function toggleDrawer() {
      const drawer = document.getElementById('nav-drawer');
      drawer.classList.toggle('open');
    }

    /* ─────────────────────────────────────────────
       HERO MOUSE PARALLAX
    ───────────────────────────────────────────── */
    const heroSection = document.getElementById('hero');
    const heroImg = document.getElementById('heroImg');
    let rafId = null;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = (e.clientX - cx) * -0.018;
      targetY = (e.clientY - cy) * -0.018;

      if (!rafId) {
        rafId = requestAnimationFrame(animateParallax);
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function animateParallax() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      heroImg.style.transform = `translate(${currentX}px, ${currentY}px)`;
      rafId = requestAnimationFrame(animateParallax);
    }

    /* ─────────────────────────────────────────────
       INTERSECTION OBSERVER — SCROLL REVEALS
    ───────────────────────────────────────────── */
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('hidden-reset');
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
          entry.target.classList.add('hidden-reset');
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ─────────────────────────────────────────────
       STAT COUNTERS
    ───────────────────────────────────────────── */
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animateCounter(el, target, isDecimal, suffix) {
      const duration = 1500;
      const start = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = easeOut(progress) * target;

        if (isDecimal) {
          el.textContent = value.toFixed(2) + suffix;
        } else {
          el.textContent = Math.floor(value) + suffix;
        }

        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = (isDecimal ? target.toFixed(2) : target) + suffix;
      }

      requestAnimationFrame(step);
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const numEl = card.querySelector('[data-count]');
          if (!numEl) return;
          const target = parseFloat(card.dataset.target);
          const suffix = card.dataset.suffix || '';
          const isDecimal = card.dataset.decimal === 'true';
          animateCounter(numEl, target, isDecimal, suffix);
        } else {
          // Reset counter to 0 so it replays on re-enter
          const numEl = entry.target.querySelector('[data-count]');
          const suffix = entry.target.dataset.suffix || '';
          if (numEl) numEl.textContent = '0' + suffix;
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-card[data-target]').forEach(el => counterObserver.observe(el));

    /* ─────────────────────────────────────────────
       ENDING HEADLINE LINES — STAGGERED REVEAL
    ───────────────────────────────────────────── */
    const endingHeadline = document.getElementById('endingHeadline');
    const endingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lines = entry.target.querySelectorAll('.line');
          lines.forEach((line, i) => {
            setTimeout(() => line.classList.add('visible'), i * 300);
          });
        } else {
          // Reset all lines so stagger replays on re-enter
          const lines = entry.target.querySelectorAll('.line');
          lines.forEach(line => line.classList.remove('visible'));
        }
      });
    }, { threshold: 0.3 });

    if (endingHeadline) endingObserver.observe(endingHeadline);

    /* ─────────────────────────────────────────────
       GSAP PROJECT CARDS
    ───────────────────────────────────────────── */
    function initGSAP() {
      if (typeof gsap === 'undefined') return;
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo('.project-card',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: 'elastic.out(1, 0.6)',
          scrollTrigger: {
            trigger: '#projectsGrid',
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    // Wait for GSAP to load
    if (typeof gsap !== 'undefined') {
      initGSAP();
    } else {
      window.addEventListener('load', initGSAP);
    }

    /* ─────────────────────────────────────────────
       TIMELINE DRAG-TO-SCROLL
    ───────────────────────────────────────────── */
    const tlScroll = document.getElementById('timelineScroll');
    if (tlScroll) {
      let isDown = false, startX, scrollLeft;

      tlScroll.addEventListener('mousedown', e => {
        isDown = true;
        startX = e.pageX - tlScroll.offsetLeft;
        scrollLeft = tlScroll.scrollLeft;
      });
      tlScroll.addEventListener('mouseleave', () => isDown = false);
      tlScroll.addEventListener('mouseup', () => isDown = false);
      tlScroll.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tlScroll.offsetLeft;
        const walk = (x - startX) * 1.5;
        tlScroll.scrollLeft = scrollLeft - walk;
      });
    }

    /* ─────────────────────────────────────────────
       PHOTOGRAPHY GRID — trigger reveal on scroll
    ───────────────────────────────────────────── */
    const masonryObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.photo-card').forEach(card => {
            // Reset and replay the animation
            card.style.animation = 'none';
            card.offsetHeight; // force reflow
            card.style.animation = '';
            card.style.animationPlayState = 'running';
          });
        } else {
          // Reset cards to invisible so animation replays
          entry.target.querySelectorAll('.photo-card').forEach(card => {
            card.style.animationPlayState = 'paused';
            card.style.opacity = '0';
          });
        }
      });
    }, { threshold: 0.1 });

    const masonryGrid = document.getElementById('masonryGrid');
    if (masonryGrid) {
      // Pause animations until in view
      masonryGrid.querySelectorAll('.photo-card').forEach(card => {
        card.style.animationPlayState = 'paused';
      });
      masonryObserver.observe(masonryGrid);
    }

    /* ─────────────────────────────────────────────
       SCROLL PROGRESS INDICATOR
    ───────────────────────────────────────────── */
    window.addEventListener('scroll', () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = (scrollPosition / scrollTotal) * 100;
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) progressBar.style.width = scrollPercentage + '%';
    });

    /* ─────────────────────────────────────────────
       FILM STRIP CENTERING LIGHTBOX
     ───────────────────────────────────────────── */
    (function () {
      const lightbox = document.getElementById('film-lightbox');
      const lbImg = document.getElementById('film-lightbox-img');
      const lbLabel = document.getElementById('film-lightbox-label');
      const frames = document.querySelectorAll('.film-frame-row');
      const total = frames.length;
      let hideTimer = null;

      function openLightbox(img, index) {
        if (window.innerWidth < 768) return;
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        lightbox.classList.remove('hiding');
        lbImg.src = img.src;
        lbLabel.textContent =
          String(index + 1).padStart(2, '0') + ' / ' +
          String(total).padStart(2, '0');
        lightbox.classList.add('active');
      }

      function closeLightbox() {
        if (window.innerWidth < 768) return;
        lightbox.classList.add('hiding');
        hideTimer = setTimeout(function () {
          lightbox.classList.remove('active', 'hiding');
          lbImg.src = '';
        }, 320);
      }

      frames.forEach(function (row, i) {
        var img = row.querySelector('.film-img');
        if (!img) return;
        row.addEventListener('mouseenter', function () { openLightbox(img, i); });
        row.addEventListener('mouseleave', closeLightbox);
      });

      // Keep existing spring float on .film-frame-row hover (do not remove)
    })();

    /* ─────────────────────────────────────────────
       LENS GRID HOVER LIGHTBOX
     ───────────────────────────────────────────── */
    (function () {
      var lightbox = document.getElementById('lens-lightbox');
      var lbImg = document.getElementById('lens-lightbox-img');
      var lbLabel = document.getElementById('lens-lightbox-label');
      var cards = document.querySelectorAll('#masonryGrid .photo-card');
      var total = cards.length;
      var hideTimer = null;
      var hoverTimer = null; // 0.5-second delay before opening

      function openLens(imgSrc, index) {
        if (window.innerWidth < 768) return;
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        lightbox.classList.remove('hiding');
        lbImg.src = imgSrc;
        lbLabel.textContent =
          String(index + 1).padStart(2, '0') + ' / ' +
          String(total).padStart(2, '0');
        lightbox.classList.add('active');
      }

      function closeLens() {
        if (window.innerWidth < 768) return;
        // Cancel any pending hover-open
        if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
        lightbox.classList.add('hiding');
        hideTimer = setTimeout(function () {
          lightbox.classList.remove('active', 'hiding');
          lbImg.src = '';
        }, 320);
      }

      cards.forEach(function (card, i) {
        var img = card.querySelector('.photo-card-img-wrap img');
        if (!img) return;
        card.addEventListener('mouseenter', function () {
          // Clear any previous pending open
          if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
          // Wait before opening the lightbox
          hoverTimer = setTimeout(function () {
            openLens(img.src, i);
            hoverTimer = null;
          }, 500);
        });
        card.addEventListener('mouseleave', closeLens);
      });
    })();

    /* ─────────────────────────────────────────────
       RESUME VIEWER
    ───────────────────────────────────────────── */
    (function () {
      const overlay = document.getElementById('resume-overlay');
      const iframe = document.getElementById('resumeIframe');
      const zoomIn = document.getElementById('resumeZoomIn');
      const zoomOut = document.getElementById('resumeZoomOut');
      const zoomLabel = document.getElementById('resumeZoomLevel');
      const closeBtn = document.getElementById('resumeClose');
      const openButtons = document.querySelectorAll('#resume-open-button, #resume-open-btn-end');
      let scale = 1;

      function updateZoom() {
        scale = Math.min(2, Math.max(0.8, scale));
        if (iframe) {
          iframe.style.transform = `scale(${scale})`;
        }
        if (zoomLabel) {
          zoomLabel.textContent = `${Math.round(scale * 100)}%`;
        }
      }

      function openResumeViewer(event) {
        if (event) event.preventDefault();
        if (!overlay) return;
        overlay.classList.add('active');
        overlay.classList.remove('closing');
        document.body.style.overflow = 'hidden';
        scale = 1;
        updateZoom();
        overlay.setAttribute('aria-hidden', 'false');
      }

      function closeResumeViewer() {
        if (!overlay || !overlay.classList.contains('active')) return;
        overlay.classList.add('closing');
        overlay.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          overlay.classList.remove('active', 'closing');
          document.body.style.overflow = '';
        }, 220);
      }

      openButtons.forEach(btn => {
        btn.addEventListener('click', openResumeViewer);
      });

      if (closeBtn) closeBtn.addEventListener('click', closeResumeViewer);
      if (zoomIn) zoomIn.addEventListener('click', () => { scale += 0.1; updateZoom(); });
      if (zoomOut) zoomOut.addEventListener('click', () => { scale -= 0.1; updateZoom(); });

      if (overlay) {
        overlay.addEventListener('click', (event) => {
          if (event.target === overlay) {
            closeResumeViewer();
          }
        });
      }

      window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay && overlay.classList.contains('active')) {
          closeResumeViewer();
        }
      });
    })();