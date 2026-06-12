// ============ CONFIG ============
// Pledges are emailed via FormSubmit.co (no server needed on GitHub Pages).
// First submission sends an activation link to this inbox; click it once and
// every pledge after that arrives as a formatted email.
const GK_FORM_ENDPOINT = 'https://formsubmit.co/ajax/helpinghutngo@gmail.com';
const GK_WHATSAPP_NUMBER = '919482118208'; // Raghvendra Pratap Singh (organiser)

// ============ SCROLL ANIMATIONS ============
function gkInitScrollAnimations() {
    const animatables = document.querySelectorAll(
        '.gk-appeal-card, .gk-why-card, .gk-donate-card, .gk-step-card, .gk-form, .gk-pledge-aside, .gk-contact-card, .gk-map, .gk-donate-note'
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
                    _subject: 'New Gyan Kutir donation pledge: ' + data.name,
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
        let text = 'Namaste! I want to donate to the Gyan Kutir library in Gopalpura.';
        if (data.name) text += '\nName: ' + data.name;
        if (data.items.length) text += '\nItems: ' + data.items.join(', ');
        if (data.details) text += '\nDetails: ' + data.details;
        if (data.delivery) text += '\nDelivery: ' + data.delivery;
        if (data.city) text += '\nFrom: ' + data.city;

        const url = 'https://wa.me/' + GK_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
        window.open(url, '_blank', 'noopener');
    });
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', () => {
    gkInitScrollAnimations();
    gkInitForm();
    gkInitWhatsapp();
    gkInitCheckedHighlight();
});
