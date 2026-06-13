// ============ CONFIG ============
// Pledges are emailed via FormSubmit.co (no server needed on GitHub Pages).
// First submission sends an activation link to this inbox; click it once and
// every pledge after that arrives as a formatted email.
const GK_FORM_ENDPOINT = 'https://formsubmit.co/ajax/helpinghutngo@gmail.com';
const GK_WHATSAPP_NUMBER = '919482118208'; // Raghvendra Pratap Singh (organiser)

// ============ SCROLL ANIMATIONS ============
function gkInitScrollAnimations() {
    const animatables = document.querySelectorAll(
        '.gk-appeal-card, .gk-why-card, .gk-story-text, .gk-story-deck-wrap, .gk-donate-card, .gk-step-card, .gk-form, .gk-pledge-aside, .gk-contact-card, .gk-map, .gk-donate-note'
    );
    animatables.forEach(el => el.classList.add('gk-animate'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('gk-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.gk-animate').forEach(el => observer.observe(el));
}

// ============ FORM HELPERS ============
function gkGetFormData() {
    const form = document.getElementById('gkPledgeForm');
    const items = Array.from(form.querySelectorAll('input[name="items"]:checked')).map(cb => cb.value);
    const delivery = form.querySelector('input[name="delivery"]:checked');
    return {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        city: form.city.value.trim(),
        items: items,
        details: form.details.value.trim(),
        delivery: delivery ? delivery.value : '',
        message: form.message.value.trim(),
        honey: form._honey.value
    };
}

function gkValidate(data) {
    const errors = [];
    const form = document.getElementById('gkPledgeForm');

    form.querySelectorAll('.gk-invalid').forEach(el => el.classList.remove('gk-invalid'));

    if (!data.name) {
        errors.push('Please enter your name.');
        form.name.classList.add('gk-invalid');
    }
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (!/^[0-9+\s\-]{10,15}$/.test(data.phone) || phoneDigits.length < 10 || phoneDigits.length > 12) {
        errors.push('Please enter a valid 10-digit phone number.');
        form.phone.classList.add('gk-invalid');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Please enter a valid email address (or leave it blank).');
        form.email.classList.add('gk-invalid');
    }
    if (data.items.length === 0) {
        errors.push('Please select at least one item to donate.');
        form.querySelector('.gk-checkgroup').classList.add('gk-invalid');
    }
    if (!data.delivery) {
        errors.push('Please choose how the donation will reach Gopalpura.');
        form.querySelector('.gk-radiogroup').classList.add('gk-invalid');
    }
    return errors;
}

function gkShowStatus(type, html) {
    const status = document.getElementById('gkFormStatus');
    status.className = 'gk-form-status ' + (type === 'ok' ? 'gk-status-ok' : 'gk-status-err');
    status.innerHTML = html;
    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============ FORM SUBMIT (FormSubmit.co AJAX) ============
function gkInitForm() {
    const form = document.getElementById('gkPledgeForm');
    if (!form) return;
    const submitBtn = document.getElementById('gkSubmitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = gkGetFormData();

        if (data.honey) return; // spam bot filled the hidden field

        const errors = gkValidate(data);
        if (errors.length > 0) {
            gkShowStatus('err', '<i class="fa-solid fa-circle-exclamation"></i> ' + errors.join('<br>'));
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        try {
            const response = await fetch(GK_FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: 'New GyanKutir donation pledge: ' + data.name,
                    _template: 'table',
                    _captcha: 'false',
                    'Name': data.name,
                    'Phone / WhatsApp': data.phone,
                    'Email': data.email || 'Not given',
                    'City': data.city || 'Not given',
                    'Items pledged': data.items.join(', '),
                    'Item details': data.details || 'Not given',
                    'Delivery preference': data.delivery,
                    'Message': data.message || 'Not given'
                })
            });

            // FormSubmit can answer HTTP 200 with {"success":"false"} (e.g. while the
            // form is still unactivated), so the body must be checked too.
            const result = await response.json().catch(() => null);
            if (!response.ok || !result || String(result.success) !== 'true') {
                throw new Error('FormSubmit rejected the submission');
            }

            form.reset();
            gkClearChecked();
            gkShowStatus('ok',
                '<i class="fa-solid fa-circle-check"></i> <strong>Thank you, your pledge has been sent!</strong><br>' +
                'We will contact you within 2&ndash;3 days. You can also reach the organiser directly at ' +
                '<a href="tel:+919482118208">+91 94821 18208</a>.');
        } catch (err) {
            gkShowStatus('err',
                '<i class="fa-solid fa-circle-exclamation"></i> <strong>Something went wrong while sending.</strong><br>' +
                'Please use the <em>Pledge on WhatsApp</em> button instead, or call the organiser at ' +
                '<a href="tel:+919482118208">+91 94821 18208</a>.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send My Pledge';
        }
    });
}

// ============ SELECTED-STATE HIGHLIGHT ============
// Class-based instead of :has(input:checked) so the green highlight also
// works on older Android browsers.
function gkRefreshChecked() {
    document.querySelectorAll('.gk-checks label, .gk-radiogroup > label').forEach(label => {
        const input = label.querySelector('input');
        label.classList.toggle('gk-checked', !!(input && input.checked));
    });
}

function gkClearChecked() {
    document.querySelectorAll('label.gk-checked').forEach(label => label.classList.remove('gk-checked'));
}

function gkInitCheckedHighlight() {
    const form = document.getElementById('gkPledgeForm');
    if (!form) return;
    form.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"], input[type="radio"]')) gkRefreshChecked();
    });
}

// ============ WHATSAPP PLEDGE ============
function gkInitWhatsapp() {
    const btn = document.getElementById('gkWhatsappBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const data = gkGetFormData();
        let text = 'Namaste! I want to donate to the GyanKutir library in Gopalpura.';
        if (data.name) text += '\nName: ' + data.name;
        if (data.items.length) text += '\nItems: ' + data.items.join(', ');
        if (data.details) text += '\nDetails: ' + data.details;
        if (data.delivery) text += '\nDelivery: ' + data.delivery;
        if (data.city) text += '\nFrom: ' + data.city;

        const url = 'https://wa.me/' + GK_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
        window.open(url, '_blank', 'noopener');
    });
}

// ============ STORY PHOTO DECK + LIGHTBOX ============
// A stack of polaroid-style cards that auto-shuffle one by one: the top card
// flicks off and tucks to the back of the pile. Pauses on hover/focus, the
// dots jump to any photo, and tapping a card opens it in the shared lightbox.
function gkInitStory() {
    const deck = document.getElementById('gkDeck');
    if (!deck) return;

    const cards = Array.from(deck.querySelectorAll('.gk-deck-card'));
    const n = cards.length;
    if (!n) return;

    const dotsWrap = document.getElementById('gkStoryDots');
    const capEl = document.getElementById('gkStoryCaption');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let order = cards.map((_, i) => i); // order[0] = front of the pile
    let timer = null;
    let paused = false;

    // progress dots, one per photo
    const dots = cards.map((card, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'gk-story-dot';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Show: ' + (card.dataset.cap || ('photo ' + (i + 1))));
        d.addEventListener('click', () => bringToFront(i));
        if (dotsWrap) dotsWrap.appendChild(d);
        return d;
    });

    function render() {
        order.forEach((id, p) => {
            const c = cards[id];
            c.classList.remove('gk-pos-0', 'gk-pos-1', 'gk-pos-2', 'gk-pos-back', 'gk-card-flick');
            c.classList.add(p === 0 ? 'gk-pos-0' : p === 1 ? 'gk-pos-1' : p === 2 ? 'gk-pos-2' : 'gk-pos-back');
            c.style.zIndex = String(n - p);
            c.setAttribute('aria-hidden', p === 0 ? 'false' : 'true');
            c.tabIndex = p === 0 ? 0 : -1;
        });
        const frontId = order[0];
        if (capEl) {
            const next = cards[frontId].dataset.cap || '';
            if (capEl.textContent !== next) {
                capEl.style.opacity = '0';
                setTimeout(() => { capEl.textContent = next; capEl.style.opacity = '1'; }, 200);
            }
        }
        dots.forEach((d, i) => d.classList.toggle('gk-dot-active', i === frontId));
    }

    function advance() {
        const front = cards[order[0]];
        front.classList.add('gk-card-flick');
        front.style.zIndex = String(n + 5);
        setTimeout(() => {
            order.push(order.shift()); // front goes to the back of the pile
            render();
        }, 430);
    }

    function bringToFront(id) {
        const idx = order.indexOf(id);
        if (idx > 0) order = order.slice(idx).concat(order.slice(0, idx));
        render();
        restart();
    }

    function start() {
        if (reduce.matches || timer) return;
        timer = setInterval(() => { if (!paused) advance(); }, 3200);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    // pause while hovered / focused so the pile is readable and clickable
    deck.addEventListener('mouseenter', () => { paused = true; });
    deck.addEventListener('mouseleave', () => { paused = false; });
    deck.addEventListener('focusin', () => { paused = true; });
    deck.addEventListener('focusout', () => { paused = false; });

    render();
    start();

    // ----- lightbox (reuses the shared overlay) -----
    const box = document.getElementById('gkLightbox');
    if (!box) return;
    const lbImg = document.getElementById('gkLbImg');
    const lbCap = document.getElementById('gkLbCap');
    const btnClose = document.getElementById('gkLbClose');
    const btnPrev = document.getElementById('gkLbPrev');
    const btnNext = document.getElementById('gkLbNext');
    let lbIndex = 0;
    let lastFocused = null;

    function lbShow(i) {
        lbIndex = (i + n) % n;
        const c = cards[lbIndex];
        lbImg.src = c.dataset.full;
        const im = c.querySelector('img');
        lbImg.alt = im ? im.alt : '';
        lbCap.textContent = c.dataset.cap || '';
    }
    function lbOpen(i) {
        lastFocused = document.activeElement;
        paused = true;
        lbShow(i);
        box.hidden = false;
        document.body.style.overflow = 'hidden';
        btnClose.focus();
    }
    function lbClose() {
        box.hidden = true;
        document.body.style.overflow = '';
        lbImg.src = '';
        paused = false;
        if (lastFocused) lastFocused.focus();
    }

    cards.forEach((c, i) => c.addEventListener('click', () => lbOpen(i)));
    btnClose.addEventListener('click', lbClose);
    btnPrev.addEventListener('click', () => lbShow(lbIndex - 1));
    btnNext.addEventListener('click', () => lbShow(lbIndex + 1));
    box.addEventListener('click', (e) => {
        if (e.target === box || e.target.classList.contains('gk-lb-figure')) lbClose();
    });
    document.addEventListener('keydown', (e) => {
        if (box.hidden) return;
        if (e.key === 'Escape') lbClose();
        else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
        else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    });
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', () => {
    gkInitScrollAnimations();
    gkInitForm();
    gkInitWhatsapp();
    gkInitCheckedHighlight();
    gkInitStory();
});
