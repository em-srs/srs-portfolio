// ---- dark mode ----
const root = document.documentElement;
const lightBtn = document.getElementById('theme-light');
const darkBtn = document.getElementById('theme-dark');
const highlight = document.getElementById('theme-highlight');

function applyTheme(mode) {
    if (mode === 'dark') {
        root.setAttribute('data-theme', 'dark');
        if (highlight) highlight.style.transform = 'translateX(100%)';
        if (darkBtn) darkBtn.style.color = 'var(--paper)';
        if (lightBtn) lightBtn.style.color = 'var(--ink)';
    } else {
        root.removeAttribute('data-theme');
        if (highlight) highlight.style.transform = 'translateX(0%)';
        if (lightBtn) lightBtn.style.color = 'var(--paper)';
        if (darkBtn) darkBtn.style.color = 'var(--ink)';
    }
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('sk-theme'); } catch (e) { }
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

if (lightBtn) {
    lightBtn.addEventListener('click', () => {
        applyTheme('light');
        try { localStorage.setItem('sk-theme', 'light'); } catch (e) { }
    });
}
if (darkBtn) {
    darkBtn.addEventListener('click', () => {
        applyTheme('dark');
        try { localStorage.setItem('sk-theme', 'dark'); } catch (e) { }
    });
}

// ---- custom cursor ----
const cursor = document.getElementById('cursor');
if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, input, textarea, #lens-slideshow').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ---- reveal on scroll ----
const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: .1 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

// ---- boot log ----
const bootLines = [
    '> booting profile.exe ...',
    '> year       : B.Tech final-year',
    '> languages  : C++, Java, Python, JS',
    '> stack      : spring boot, fastapi, postgresql',
    '> discipline : clean architecture, no padding',
    '> status     : OPEN TO INTERNSHIPS / FULL-TIME SDE',
    '> _'
];
const bootEl = document.getElementById('boot');
let li = 0, ci = 0;
function typeBoot() {
    if (!bootEl) return;
    if (li >= bootLines.length) { bootEl.innerHTML += '<span class="cur"></span>'; return; }
    const line = bootLines[li];
    if (ci <= line.length) {
        bootEl.innerHTML = bootLines.slice(0, li).join('\n') + (li > 0 ? '\n' : '') + line.slice(0, ci) + '<span class="cur"></span>';
        ci++;
        setTimeout(typeBoot, 16);
    } else {
        li++; ci = 0;
        setTimeout(typeBoot, 180);
    }
}
typeBoot();

// ---- github heatmap & live stats ----
function renderGitHubHeatmap() {
    const grid = document.getElementById('gh-heatmap-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // 52 weeks x 7 days = 364 dots grid
    for (let col = 0; col < 52; col++) {
        for (let row = 0; row < 7; row++) {
            const dot = document.createElement('div');
            dot.className = 'lc-dot';
            let level = 0;

            if (col >= 8 && col <= 18 && (row === 2 || row === 5)) level = 1;
            else if (col >= 19 && col <= 32 && (row % 2 === 0)) level = (row % 3) + 1;
            else if (col >= 33 && col <= 51) {
                const val = (col * 3 + row) % 7;
                if (val < 2) level = 3;
                else if (val < 4) level = 4;
                else if (val < 6) level = 2;
                else level = 1;
            }

            if (level > 0) dot.classList.add('l' + level);
            grid.appendChild(dot);
        }
    }
}
renderGitHubHeatmap();

async function fetchGitHubStats() {
    const reposEl = document.getElementById('gh-repos-val');
    const followersEl = document.getElementById('gh-followers-val');
    const followingEl = document.getElementById('gh-following-val');
    const starsEl = document.getElementById('gh-stars-val');

    try {
        const res = await fetch('https://api.github.com/users/em-srs');
        if (res.ok) {
            const d = await res.json();
            if (reposEl) reposEl.textContent = d.public_repos ?? '8';
            if (followersEl) followersEl.textContent = d.followers ?? '2';
            if (followingEl) followingEl.textContent = d.following ?? '4';
        }
    } catch (e) { }

    try {
        const reposRes = await fetch('https://api.github.com/users/em-srs/repos?per_page=100');
        if (reposRes.ok) {
            const repos = await reposRes.json();
            if (Array.isArray(repos)) {
                const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
                if (starsEl) starsEl.textContent = totalStars;
            }
        }
    } catch (e) { }
}
fetchGitHubStats();

// ---- leetcode heatmap & stats ----
function renderLeetCodeHeatmap(submissionCalendar = null) {
    const grid = document.getElementById('lc-heatmap-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const daysCount = 52 * 7;
    const now = Math.floor(Date.now() / 1000);
    const daySeconds = 86400;

    for (let col = 0; col < 52; col++) {
        for (let row = 0; row < 7; row++) {
            const dot = document.createElement('div');
            dot.className = 'lc-dot';
            let level = 0;

            const dayOffset = (51 - col) * 7 + (6 - row);
            const targetTimestamp = now - dayOffset * daySeconds;

            if (submissionCalendar) {
                // Find matching date in submissionCalendar
                let matchedCount = 0;
                for (const [tsStr, count] of Object.entries(submissionCalendar)) {
                    const ts = parseInt(tsStr, 10);
                    if (Math.abs(ts - targetTimestamp) < daySeconds / 2) {
                        matchedCount += count;
                    }
                }
                if (matchedCount > 0) {
                    if (matchedCount >= 10) level = 4;
                    else if (matchedCount >= 5) level = 3;
                    else if (matchedCount >= 2) level = 2;
                    else level = 1;
                }
            }

            // Fallback pattern if no live submission match
            if (level === 0 && !submissionCalendar) {
                if (col >= 20 && col <= 51) {
                    const val = (col * 7 + row) % 9;
                    if (val < 2) level = 3;
                    else if (val < 5) level = 4;
                    else if (val < 7) level = 2;
                    else level = 1;
                }
            }

            if (level > 0) dot.classList.add('l' + level);
            grid.appendChild(dot);
        }
    }
}
renderLeetCodeHeatmap();

async function fetchLeetCodeStats() {
    const totalEl = document.getElementById('lc-total');
    const easyValEl = document.getElementById('lc-easy-val');
    const medValEl = document.getElementById('lc-med-val');
    const hardValEl = document.getElementById('lc-hard-val');
    const subsCountEl = document.getElementById('lc-submissions-count');

    const endpoints = [
        'https://leetcode-api-faisalshohag.vercel.app/me_srs',
        'https://alfa-leetcode-api.onrender.com/userProfile/me_srs'
    ];

    for (const url of endpoints) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) continue;
            const data = await res.json();

            let easy = null, medium = null, hard = null, total = null;
            if (data.totalSolved !== undefined) {
                total = data.totalSolved;
                easy = data.easySolved;
                medium = data.mediumSolved;
                hard = data.hardSolved;
            } else if (data.matchedUser && data.matchedUser.submitStats) {
                const ac = data.matchedUser.submitStats.acSubmissionNum;
                easy = ac.find(x => x.difficulty === 'Easy')?.count;
                medium = ac.find(x => x.difficulty === 'Medium')?.count;
                hard = ac.find(x => x.difficulty === 'Hard')?.count;
                total = ac.find(x => x.difficulty === 'All')?.count;
            }

            if (total && easy !== undefined) {
                if (totalEl) totalEl.textContent = total;
                if (easyValEl) easyValEl.innerHTML = `${easy}<span style="font-size:.56rem; opacity:0.6;">/${data.totalEasy || 958}</span>`;
                if (medValEl) medValEl.innerHTML = `${medium}<span style="font-size:.56rem; opacity:0.6;">/${data.totalMedium || 2098}</span>`;
                if (hardValEl) hardValEl.innerHTML = `${hard}<span style="font-size:.56rem; opacity:0.6;">/${data.totalHard || 962}</span>`;

                if (data.totalSubmissions && Array.isArray(data.totalSubmissions)) {
                    const allSub = data.totalSubmissions.find(s => s.difficulty === 'All');
                    if (allSub && allSub.submissions && subsCountEl) {
                        subsCountEl.textContent = allSub.submissions;
                    }
                }

                if (data.submissionCalendar) {
                    renderLeetCodeHeatmap(data.submissionCalendar);
                }
                break;
            }
        } catch (e) {
            // Keep baseline verified defaults intact
        }
    }
}
fetchLeetCodeStats();

// ---- lens slideshow ----
const lensSources = [
    'assets/imgs/07-scenery-jibhi.jpg',
    'assets/imgs/01-scenery-shimla.jpg',
    'assets/imgs/a-moonshot-chandigarh.jpg',
    'assets/imgs/d-concert-cgc-landran.jpg',
    'assets/imgs/05-portrait-shojha.jpg',
    'assets/imgs/e-scenery-parasnath-jharkhand.jpg',
    'assets/imgs/12-scenery-jibhi.jpg',
    'assets/imgs/11-portrait-swati-jibhi.jpg',
    'assets/imgs/c-scenery-shimla.jpg'
];

const lensSlides = [];
let lensReady = 0;

function getOrientation(w, h) {
    if (w > h) return 'landscape';
    if (h > w) return 'portrait';
    return 'square';
}

const lensImg = document.getElementById('lens-img');
const lensSlideshow = document.getElementById('lens-slideshow');
let lensIndex = 0;
let lensTimer = null;

function applyOrientationClass(orientation) {
    if (!lensSlideshow) return;
    lensSlideshow.classList.remove('is-landscape', 'is-portrait', 'is-square');
    lensSlideshow.classList.add('is-' + orientation);
}

lensSources.forEach(src => {
    const img = new Image();
    img.src = src;
    const entry = { src: src, orientation: 'landscape' };
    lensSlides.push(entry);
    img.onload = () => {
        entry.orientation = getOrientation(img.naturalWidth, img.naturalHeight);
        lensReady++;
        if (lensReady === 1 && lensSlideshow) {
            applyOrientationClass(entry.orientation);
        }
    };
});

function nextLensSlide() {
    if (!lensImg || lensSlides.length === 0) return;
    lensImg.classList.add('fade-out');
    const nextIndex = (lensIndex + 1) % lensSlides.length;
    const nextSlide = lensSlides[nextIndex];
    applyOrientationClass(nextSlide.orientation);
    setTimeout(() => {
        lensIndex = nextIndex;
        lensImg.src = nextSlide.src;
        lensImg.classList.remove('fade-out');
        scheduleLensSlide();
    }, 500);
}

let lensPaused = false;

function scheduleLensSlide() {
    if (lensTimer) clearTimeout(lensTimer);
    if (lensPaused) return;
    lensTimer = setTimeout(nextLensSlide, 3800);
}

if (lensImg && lensSlideshow) {
    applyOrientationClass(lensSlides[0].orientation);
    scheduleLensSlide();

    lensSlideshow.addEventListener('mouseenter', () => {
        lensPaused = true;
        if (lensTimer) clearTimeout(lensTimer);
        lensTimer = null;
    });

    lensSlideshow.addEventListener('mouseleave', () => {
        lensPaused = false;
        scheduleLensSlide();
    });
}

// ---- live project screenshot previews & interactive modal ----
function initLiveProjectPreviews() {
    const previewWrappers = document.querySelectorAll('.proj-preview-wrap');

    previewWrappers.forEach(wrap => {
        const liveUrl = wrap.dataset.liveUrl;
        const title = wrap.dataset.title || 'Project';
        const img = wrap.querySelector('.preview-img');
        const skeleton = wrap.querySelector('.preview-skeleton');
        const fallback = wrap.querySelector('.preview-fallback');

        if (liveUrl && img) {
            const version = wrap.dataset.v || wrap.dataset.version || '';
            const targetUrl = version ? (liveUrl.includes('?') ? `${liveUrl}&v=${version}` : `${liveUrl}?v=${version}`) : liveUrl;
            const primaryUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&embed=screenshot.url&prerender=true&waitForTimeout=3000`;
            const secondaryUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(liveUrl)}?w=1280&h=800`;

            img.src = primaryUrl;

            img.onload = () => {
                img.classList.add('is-loaded');
                if (skeleton) skeleton.style.display = 'none';
            };

            img.onerror = () => {
                if (!img.dataset.triedFallback) {
                    img.dataset.triedFallback = 'true';
                    img.src = secondaryUrl;
                } else {
                    if (skeleton) skeleton.style.display = 'none';
                    img.style.display = 'none';
                    if (fallback) fallback.style.display = 'flex';
                }
            };
        }

        // Clicking screenshot image container opens target live URL in a new tab
        wrap.addEventListener('click', (e) => {
            // Avoid triggering if user clicked the "LIVE PREVIEW 👁" button inside the container
            if (e.target.closest('.live-preview-btn')) return;
            if (liveUrl) {
                window.open(liveUrl, '_blank', 'noopener,noreferrer');
            }
        });
    });

    // Modal elements
    const modal = document.getElementById('preview-modal');
    const modalIframe = document.getElementById('modal-iframe');
    const modalUrlText = document.getElementById('modal-url-text');
    const modalFullsiteLink = document.getElementById('modal-fullsite-link');
    const modalColdNote = document.getElementById('modal-cold-note');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalInteractOverlay = document.getElementById('modal-interact-overlay');
    const modalUnlockBtn = document.getElementById('modal-unlock-btn');

    function openPreviewModal(url, title, isColdStart = false) {
        if (!modal || !modalIframe) return;

        if (modalUrlText) modalUrlText.textContent = url;
        if (modalFullsiteLink) modalFullsiteLink.href = url;
        if (modalColdNote) {
            modalColdNote.style.display = isColdStart ? 'inline-block' : 'none';
        }

        // Reset scroll-hijack overlay state
        if (modalInteractOverlay) modalInteractOverlay.classList.remove('is-hidden');
        if (modalIframe) {
            modalIframe.classList.add('modal-iframe-disabled');
            modalIframe.src = url; // Mount iframe on modal open
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closePreviewModal() {
        if (!modal || !modalIframe) return;

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Unmount iframe on close to stop background load/polling
        modalIframe.src = '';
        modalIframe.classList.add('modal-iframe-disabled');
        if (modalInteractOverlay) modalInteractOverlay.classList.remove('is-hidden');
    }

    // Modal trigger buttons
    document.querySelectorAll('[data-open-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = btn.dataset.openModal;
            const title = btn.dataset.title;
            const isColdStart = btn.dataset.coldStart === 'true';
            if (url) openPreviewModal(url, title, isColdStart);
        });
    });

    // Unlock interactive mode overlay
    if (modalUnlockBtn && modalInteractOverlay && modalIframe) {
        modalUnlockBtn.addEventListener('click', () => {
            modalInteractOverlay.classList.add('is-hidden');
            modalIframe.classList.remove('modal-iframe-disabled');
        });
        modalInteractOverlay.addEventListener('click', () => {
            modalInteractOverlay.classList.add('is-hidden');
            modalIframe.classList.remove('modal-iframe-disabled');
        });
    }

    // Close listeners
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closePreviewModal);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePreviewModal();
        });
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
            closePreviewModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', initLiveProjectPreviews);
if (document.readyState !== 'loading') {
    initLiveProjectPreviews();
}

// ---- contact form transmission handler ----
function initContactFormHandler() {
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    const contactStatusMsg = document.getElementById('contact-status-msg');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = contactForm.querySelector('[name="name"]');
        const emailInput = contactForm.querySelector('[name="email"]');
        const messageInput = contactForm.querySelector('[name="message"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !message) return;

        if (contactSubmitBtn) {
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.textContent = 'TRANSMITTING...';
        }

        if (contactStatusMsg) {
            contactStatusMsg.style.display = 'none';
        }

        try {
            const res = await fetch('https://formsubmit.co/ajax/sunnyprfrvr@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message,
                    _subject: `[Portfolio Transmission] Message from ${name}`
                })
            });

            if (res.ok) {
                if (contactStatusMsg) {
                    contactStatusMsg.style.display = 'block';
                    contactStatusMsg.style.background = 'var(--yellow)';
                    contactStatusMsg.style.color = '#0B0B0B';
                    contactStatusMsg.textContent = '✓ TRANSMISSION_SENT // RECEIPT_CONFIRMED';
                }
                contactForm.reset();
            } else {
                throw new Error('Form submit response not ok');
            }
        } catch (err) {
            if (contactStatusMsg) {
                contactStatusMsg.style.display = 'block';
                contactStatusMsg.style.background = 'var(--pink)';
                contactStatusMsg.style.color = '#FFFFFF';
                contactStatusMsg.textContent = '✖ TRANSMISSION_FAILED // RETRY_LATER';
            }
        } finally {
            if (contactSubmitBtn) {
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.textContent = 'Send →';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initContactFormHandler);
if (document.readyState !== 'loading') {
    initContactFormHandler();
}


