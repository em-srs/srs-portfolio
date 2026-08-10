// ---- dark mode ----
const root = document.documentElement;
const lightBtn = document.getElementById('theme-light');
const darkBtn = document.getElementById('theme-dark');
const highlight = document.getElementById('theme-highlight');

function applyTheme(mode) {
    if (mode === 'dark') {
        root.setAttribute('data-theme', 'dark');
        highlight.style.transform = 'translateX(100%)';
        darkBtn.style.color = 'var(--paper)';
        lightBtn.style.color = 'var(--ink)';
    } else {
        root.removeAttribute('data-theme');
        highlight.style.transform = 'translateX(0%)';
        lightBtn.style.color = 'var(--paper)';
        darkBtn.style.color = 'var(--ink)';
    }
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('sk-theme'); } catch (e) { }
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

lightBtn.addEventListener('click', () => {
    applyTheme('light');
    try { localStorage.setItem('sk-theme', 'light'); } catch (e) { }
});
darkBtn.addEventListener('click', () => {
    applyTheme('dark');
    try { localStorage.setItem('sk-theme', 'dark'); } catch (e) { }
});

// ---- custom cursor ----
const cursor = document.getElementById('cursor');
window.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, input, textarea, #lens-slideshow').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// ---- reveal on scroll ----
const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: .15 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

// ---- boot log ----
const bootLines = [
    '> booting profile.exe ...',
    '> year       : B.Tech final-year',
    '> languages  : C++, Java, Python',
    '> stack      : spring boot, fastapi, postgresql',
    '> discipline : clean architecture, no padding',
    '> status     : SEEKING INTERNSHIP / FULL-TIME SDE',
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
        setTimeout(typeBoot, 200);
    }
}
typeBoot();

// ---- github heatmap & live stats ----
function renderGitHubHeatmap() {
    const grid = document.getElementById('gh-heatmap-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // 52 weeks x 7 days = 364 dots grid
    // Replicates active commit pattern matching user's profile
    for (let col = 0; col < 52; col++) {
        for (let row = 0; row < 7; row++) {
            const dot = document.createElement('div');
            dot.className = 'lc-dot';
            let level = 0;

            if (col >= 10 && col <= 18 && (row === 2 || row === 5)) level = 1;
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

fetch('https://api.github.com/users/em-srs')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => {
        const reposEl = document.getElementById('gh-repos-val');
        const followersEl = document.getElementById('gh-followers-val');
        const followingEl = document.getElementById('gh-following-val');
        if (reposEl) reposEl.textContent = d.public_repos ?? '10';
        if (followersEl) followersEl.textContent = d.followers ?? '2';
        if (followingEl) followingEl.textContent = d.following ?? '4';
    })
    .catch(() => {});

// ---- leetcode heatmap & stats ----
function renderLeetCodeHeatmap() {
    const grid = document.getElementById('lc-heatmap-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // 52 weeks x 7 days = 364 dots grid
    // Matches activity pattern from user's profile screenshot
    for (let col = 0; col < 52; col++) {
        for (let row = 0; row < 7; row++) {
            const dot = document.createElement('div');
            dot.className = 'lc-dot';
            let level = 0;
            
            // Replicate realistic submission distribution
            if (col === 8 && row === 5) level = 2; // Oct
            else if (col >= 22 && col <= 26 && (row === 1 || row === 4)) level = (row % 2) + 1; // Feb-Mar
            else if (col >= 27 && col <= 34 && (row % 2 === 0 || row === 3)) level = ((col + row) % 3) + 1; // Apr-May
            else if (col >= 35 && col <= 51) {
                // Jun - Jul - Aug heavy active streak
                const val = (col * 7 + row) % 11;
                if (val < 3) level = 3;
                else if (val < 6) level = 4;
                else if (val < 9) level = 2;
                else level = 1;
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

    if (!totalEl) return;

    const endpoints = [
        'https://alfa-leetcode-api.onrender.com/userProfile/me_srs',
        'https://leetcode-api-faisalshohag.vercel.app/me_srs'
    ];

    for (const url of endpoints) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
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
                totalEl.textContent = total;
                if (easyValEl) easyValEl.innerHTML = `${easy}<span style="font-size:.56rem; opacity:0.6;">/958</span>`;
                if (medValEl) medValEl.innerHTML = `${medium}<span style="font-size:.56rem; opacity:0.6;">/2098</span>`;
                if (hardValEl) hardValEl.innerHTML = `${hard}<span style="font-size:.56rem; opacity:0.6;">/961</span>`;
                break;
            }
        } catch (e) {
            // Verified baseline stays intact
        }
    }
}
fetchLeetCodeStats();

// Layouts are handled cleanly via CSS media queries in style.css

// ---- lens slideshow ----
const lensSources = [
    'assets/imgs/07-scenery-jibhi.jpg',                 // 1 — portrait
    'assets/imgs/01-scenery-shimla.jpg',              // 2 — portrait
    'assets/imgs/a-moonshot-chandigarh.jpg',           // 3 — landscape
    'assets/imgs/d-concert-cgc-landran.jpg',            // 4 — portrait
    'assets/imgs/05-portrait-shojha.jpg',              // 5 — portrait
    'assets/imgs/e-scenery-parasnath-jharkhand.jpg',   // 6 — landscape
    'assets/imgs/12-scenery-jibhi.jpg',                // 7 — portrait
    'assets/imgs/11-portrait-swati-jibhi.jpg',         // 8 — landscape
    'assets/imgs/c-scenery-shimla.jpg'                 // 9 — portrait
];

// Preload images and detect orientation
const lensSlides = [];
let lensReady = 0;

function getOrientation(w, h) {
    if (w > h) return 'landscape';
    if (h > w) return 'portrait';
    return 'square';
}

lensSources.forEach(src => {
    const img = new Image();
    img.src = src;
    const entry = { src: src, orientation: 'landscape' }; // default
    lensSlides.push(entry);
    img.onload = () => {
        entry.orientation = getOrientation(img.naturalWidth, img.naturalHeight);
        lensReady++;
        // Apply orientation class for the first image once it loads
        if (lensReady === 1 && lensSlideshow) {
            applyOrientationClass(entry.orientation);
        }
    };
});

const lensImg = document.getElementById('lens-img');
const lensSlideshow = document.getElementById('lens-slideshow');
let lensIndex = 0;
let lensTimer = null;

function applyOrientationClass(orientation) {
    if (!lensSlideshow) return;
    lensSlideshow.classList.remove('is-landscape', 'is-portrait', 'is-square');
    lensSlideshow.classList.add('is-' + orientation);
}

function nextLensSlide() {
    if (!lensImg || lensSlides.length === 0) return;
    lensImg.classList.add('fade-out');
    const nextIndex = (lensIndex + 1) % lensSlides.length;
    const nextSlide = lensSlides[nextIndex];
    // Apply orientation class during the fade-out so box reshapes in sync
    applyOrientationClass(nextSlide.orientation);
    setTimeout(() => {
        lensIndex = nextIndex;
        lensImg.src = nextSlide.src;
        lensImg.classList.remove('fade-out');
        // Schedule next slide only after this transition is fully done
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
    // Set initial orientation class
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
