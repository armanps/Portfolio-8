/* PARTICLE CANVAS */
const cvs = document.getElementById('bgc');
const ctx = cvs.getContext('2d');
let W, H, pts = [], mx = -999, my = -999;
const resize = () => { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; };
resize(); window.addEventListener('resize', resize);
const PC = ['rgba(79,142,247,', 'rgba(124,92,191,', 'rgba(34,211,168,'];

class P {
    constructor(init) {
        this.x = Math.random() * (window.innerWidth || 1200);
        this.y = init ? Math.random() * (window.innerHeight || 800) : (window.innerHeight || 800) + 10;
        this.r = Math.random() * 1.5 + 0.3;
        this.vx = (Math.random() - .5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.1);
        this.a = Math.random() * 0.5 + 0.1;
        this.c = PC[Math.floor(Math.random() * 3)];
        this.l = 0; this.ml = Math.random() * 300 + 150;
    }
    step() {
        this.l++;
        const dx = this.x - mx, dy = this.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) { this.vx += dx / d * .08; this.vy += dy / d * .08; }
        this.vx *= .98; this.vy *= .98; this.x += this.vx; this.y += this.vy;
        if (this.l > this.ml || this.y < -10) { Object.assign(this, new P(false)); }
    }
    draw() {
        const f = Math.min(this.l / 40, 1, (this.ml - this.l) / 40);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c + (this.a * f) + ')'; ctx.fill();
    }
}
for (let i = 0; i < 120; i++) pts.push(new P(true));

function conns() {
    const md = 130;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < md) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(79,142,247,${(1 - d / md) * .12})`; ctx.lineWidth = .5; ctx.stroke();
        }
    }
}
(function loop() { ctx.clearRect(0, 0, W, H); conns(); pts.forEach(p => { p.step(); p.draw(); }); requestAnimationFrame(loop); })();
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

/* FLOATING ORBS */
function mkOrb() {
    const o = document.createElement('div'); o.className = 'orb';
    const s = Math.random() * 80 + 20;
    o.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}vw;bottom:-${s}px;animation-duration:${Math.random() * 18 + 12}s;animation-delay:${Math.random() * 3}s;border:1px solid ${Math.random() > .5 ? 'rgba(79,142,247,.1)' : 'rgba(34,211,168,.08)'}`;
    document.body.appendChild(o);
    o.addEventListener('animationend', () => { o.remove(); mkOrb(); });
}
for (let i = 0; i < 7; i++) setTimeout(mkOrb, i * 1800);

/* SCROLL PROGRESS + NAV */
window.addEventListener('scroll', () => {
    document.getElementById('pb').style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
    document.getElementById('nav').classList.toggle('sc', window.scrollY > 40);
});

/* SCROLL REVEAL */
const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); ro.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.rv').forEach(el => ro.observe(el));

/* TABS */
function showT(id, btn) {
    document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
    document.querySelectorAll('.tp').forEach(p => p.classList.remove('on'));
    btn.classList.add('on');
    const p = document.getElementById('tb-' + id); p.classList.add('on');
    if (id === 'sk') setTimeout(() => p.querySelectorAll('.skf').forEach(b => b.style.width = b.getAttribute('data-w')), 80);
}
document.querySelectorAll('.skf').forEach(b => b.style.width = '0');

/* TYPED */
const roles = ['Software & Web Developer', '.NET & Razor Pages Dev', 'WordPress Specialist', 'Full Stack Developer'];
let ri = 0, ci = 0, del = false;
const tel = document.getElementById('typed');
function type() {
    const cur = roles[ri];
    if (!del) { ci++; tel.textContent = cur.slice(0, ci); if (ci === cur.length) { del = true; setTimeout(type, 2200); return; } setTimeout(type, 60); }
    else { ci--; tel.textContent = cur.slice(0, ci); if (ci === 0) { del = false; ri = (ri + 1) % roles.length; setTimeout(type, 400); return; } setTimeout(type, 35); }
}
setTimeout(type, 1000);

/* MOBILE NAV */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = navMenu.querySelectorAll('a');

function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    navMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 600) {
        closeMobileMenu();
    }
});

/* CONTACT FORM SUBMISSION */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        formMessage.style.display = 'none';

        // Collect form data
        const formData = {
            name: contactForm.name.value.trim(),
            email: contactForm.email.value.trim(),
            subject: contactForm.subject.value.trim(),
            message: contactForm.message.value.trim()
        };

        try {
            // Send data to PHP backend
            const response = await fetch('send_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            // Show message
            formMessage.style.display = 'block';
            formMessage.textContent = result.message;

            if (response.ok && result.success) {
                formMessage.style.background = 'rgba(34, 211, 168, 0.15)';
                formMessage.style.color = '#22d3a8';
                formMessage.style.border = '1px solid #22d3a8';

                // Reset form
                contactForm.reset();

                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                formMessage.style.background = 'rgba(255, 59, 48, 0.15)';
                formMessage.style.color = '#ff3b30';
                formMessage.style.border = '1px solid #ff3b30';
            }
        } catch (error) {
            formMessage.style.display = 'block';
            formMessage.textContent = 'Error sending message. Please check your connection and try again.';
            formMessage.style.background = 'rgba(255, 59, 48, 0.15)';
            formMessage.style.color = '#ff3b30';
            formMessage.style.border = '1px solid #ff3b30';
            console.error('Form submission error:', error);
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
}
