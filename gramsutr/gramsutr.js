// ============ PIE CHART (Canvas) ============
function drawPieChart() {
    const canvas = document.getElementById('gsFundChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 220;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 85;
    const innerRadius = 50;

    const data = [
        { value: 40, color: '#FF8F00', label: 'Education' },
        { value: 30, color: '#FF7043', label: 'Health' },
        { value: 20, color: '#42A5F5', label: 'Logistics' },
        { value: 10, color: '#AB47BC', label: 'Corpus' }
    ];

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = -Math.PI / 2;

    // Clear
    ctx.clearRect(0, 0, size, size);

    data.forEach(slice => {
        const sliceAngle = (slice.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();

        // Label
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = cx + (radius * 0.65) * Math.cos(midAngle);
        const labelY = cy + (radius * 0.65) * Math.sin(midAngle);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(slice.value + '%', labelX, labelY);

        startAngle = endAngle;
    });

    // Inner circle (donut)
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#F5F7FA';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 14px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Funds', cx, cy - 8);
    ctx.font = '11px Poppins, sans-serif';
    ctx.fillStyle = '#717171';
    ctx.fillText('Breakdown', cx, cy + 10);
}

// ============ SCROLL ANIMATIONS ============
function initScrollAnimations() {
    const animatedSections = document.querySelectorAll(
        '.gs-why, .gs-pillars, .gs-roadmap, .gs-trust, .gs-volunteers, .gs-fundraiser, .gs-editions'
    );

    animatedSections.forEach(section => {
        const animatables = section.querySelectorAll(
            '.gs-pillar-card, .gs-timeline-item, .gs-trust-card, .gs-vol-group, .gs-edition-card, .gs-quote, .gs-why-icons, .gs-fund-widget'
        );
        animatables.forEach(el => el.classList.add('gs-animate'));
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('gs-visible');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.gs-animate').forEach(el => observer.observe(el));
}

// ============ PILLAR CARD FLIP INTERACTION ============
function initPillarCards() {
    const cards = document.querySelectorAll('.gs-pillar-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from others
            cards.forEach(c => c.classList.remove('gs-pillar-active'));
            card.classList.toggle('gs-pillar-active');
        });
    });
}

// ============ SMOOTH PROGRESS BAR ANIMATION ============
function animateProgress() {
    const fill = document.getElementById('gsProgressFill');
    if (!fill) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate to demo value (update this when real data is available)
                setTimeout(() => {
                    fill.style.width = '0%'; // Update with real percentage
                }, 300);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(fill);
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', () => {
    drawPieChart();
    initScrollAnimations();
    initPillarCards();
    animateProgress();
});
