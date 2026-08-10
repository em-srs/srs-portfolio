// ---- dark mode ----
const root = document.documentElement;
const lightBtn = document.getElementById('theme-light');
const darkBtn = document.getElementById('theme-dark');
const highlight = document.getElementById('theme-highlight');
const lcCard = document.getElementById('lc-card');

function applyTheme(mode) {
    if (mode === 'dark') {
        root.setAttribute('data-theme', 'dark');
        highlight.style.transform = 'translateX(100%)';
        darkBtn.style.color = 'var(--paper)';
        lightBtn.style.color = 'var(--ink)';
        if (lcCard) lcCard.src = 'https://leetcard.jacoblin.cool/me_srs?theme=dark&font=JetBrains%20Mono&ext=heatmap';
    } else {
        root.removeAttribute('data-theme');
        highlight.style.transform = 'translateX(0%)';
        lightBtn.style.color = 'var(--paper)';
        darkBtn.style.color = 'var(--ink)';
        if (lcCard) lcCard.src = 'https://leetcard.jacoblin.cool/me_srs?theme=light&font=JetBrains%20Mono&ext=heatmap';
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
document.querySelectorAll('a, button, input, textarea').forEach(el => {
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

// ---- github live stats ----
fetch('https://api.github.com/users/em-srs')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => {
        const boxes = document.querySelectorAll('#gh-stats .stat-box .display');
        if (boxes.length >= 3) {
            boxes[0].textContent = d.public_repos ?? '—';
            boxes[1].textContent = d.followers ?? '—';
            boxes[2].textContent = d.following ?? '—';
        }
    })
    .catch(() => {
        document.querySelectorAll('#gh-stats .stat-box .display').forEach(b => b.textContent = '—');
    });

// ---- mobile-friendly grid stacking ----
function stackForMobile() {
    const isMobile = window.innerWidth < 720;
    ['hero-grid', 'stats-grid', 'lens-grid', 'contact-grid'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.gridTemplateColumns = isMobile ? '1fr' : '';
    });
}
stackForMobile();
window.addEventListener('resize', stackForMobile);
