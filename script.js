/* PARTICLE CANVAS */
document.documentElement.classList.add('js');

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
const sideNav = document.getElementById('sideNav');
const sideLinks = sideNav.querySelectorAll('a');
const sections = document.querySelectorAll('section');
const tabletViewport = window.matchMedia('(min-width: 601px) and (max-width: 900px)');
let navDrag = null;
let suppressNavClick = false;

sideNav.addEventListener('pointerdown', e => {
    if (!tabletViewport.matches || e.button !== 0 || !sideNav.classList.contains('visible')) return;
    navDrag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        left: sideNav.getBoundingClientRect().left,
        top: sideNav.getBoundingClientRect().top,
        moved: false
    };
});

sideNav.addEventListener('pointermove', e => {
    if (!navDrag || e.pointerId !== navDrag.pointerId) return;
    const dx = e.clientX - navDrag.startX;
    const dy = e.clientY - navDrag.startY;

    if (!navDrag.moved && Math.hypot(dx, dy) < 6) return;
    if (!navDrag.moved) {
        navDrag.moved = true;
        sideNav.classList.add('dragging');
        sideNav.style.transform = 'none';
        sideNav.setPointerCapture(e.pointerId);
    }

    const maxLeft = window.innerWidth - sideNav.offsetWidth - 8;
    const maxTop = window.innerHeight - sideNav.offsetHeight - 8;
    sideNav.style.left = `${Math.max(8, Math.min(maxLeft, navDrag.left + dx))}px`;
    sideNav.style.top = `${Math.max(8, Math.min(maxTop, navDrag.top + dy))}px`;
});

sideNav.addEventListener('pointerup', e => {
    if (!navDrag || e.pointerId !== navDrag.pointerId) return;
    suppressNavClick = navDrag.moved;
    navDrag = null;
    sideNav.classList.remove('dragging');
});

sideNav.addEventListener('pointercancel', () => {
    navDrag = null;
    sideNav.classList.remove('dragging');
});

sideNav.addEventListener('click', e => {
    if (!suppressNavClick) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    suppressNavClick = false;
}, true);

window.addEventListener('resize', () => {
    if (tabletViewport.matches) return;
    sideNav.style.removeProperty('left');
    sideNav.style.removeProperty('top');
    sideNav.style.removeProperty('transform');
    sideNav.classList.remove('dragging');
});

window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    document.getElementById('pb').style.width = (scrollPos / (document.body.scrollHeight - window.innerHeight) * 100) + '%';

    // Show/Hide Side Nav: only visible starting from the About section
    const aboutSection = document.getElementById('about');
    if (aboutSection && scrollPos >= aboutSection.offsetTop - 200) {
        sideNav.classList.add('visible');
    } else {
        sideNav.classList.remove('visible');
    }

    // Update Side Nav Active State
    sections.forEach(section => {
        const top = section.offsetTop - 150;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < bottom) {
            sideLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === id) {
                    link.classList.add('active');
                }
            });
        }
    });
});

/* SIDE NAV CLICK HANDLER (FOR HOME) */
sideLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('data-section') === 'home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Remove hash from URL without jumping
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    });
});

/* SCROLL REVEAL */
const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); ro.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.rv').forEach(el => ro.observe(el));

/* IMAGE LOADERS FOR PORTFOLIO CARDS */
document.querySelectorAll('.pci').forEach(card => {
    const img = card.querySelector('img');
    if (img) {
        // Create loader element
        const loader = document.createElement('div');
        loader.className = 'image-loader';
        loader.innerHTML = '<div class="loader-bar-track"><div class="loader-bar-fill"></div></div>';
        card.appendChild(loader);

        // Show loader initially
        loader.classList.remove('hidden');

        // Hide loader when image loads
        const hideLoader = () => loader.classList.add('hidden');
        img.addEventListener('load', hideLoader);
        img.addEventListener('error', hideLoader);

        // If image is already cached and loaded, hide loader
        if (img.complete) {
            hideLoader();
        }
    }
});

/* PORTFOLIO VIEW TOGGLE AND CAROUSELS */
const portfolioMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function initPortfolioGroup(group) {
    const track = group.querySelector('.pgrid');
    const toggleButtons = group.querySelectorAll('.portfolio-view-button');
    const groupName = group.querySelector('.subsection-title').textContent.trim();
    const storageKey = `portfolio-view-${group.dataset.groupKey}`;
    const originalCards = Array.from(track.children);

    // Clone elements for infinite loop if there's more than one card
    if (originalCards.length > 1) {
        const firstClone = originalCards[0].cloneNode(true);
        const lastClone = originalCards[originalCards.length - 1].cloneNode(true);
        firstClone.classList.add('clone');
        lastClone.classList.add('clone');
        // Remove reveal classes from clones to avoid duplicate animations
        firstClone.classList.remove('rv', 'on');
        lastClone.classList.remove('rv', 'on');
        // For <a>-wrapped cards, the .rv element is nested inside the clone
        firstClone.querySelectorAll('.rv').forEach(el => el.classList.remove('rv'));
        lastClone.querySelectorAll('.rv').forEach(el => el.classList.remove('rv'));
        track.appendChild(firstClone);
        track.insertBefore(lastClone, track.firstChild);
    }

    const cards = Array.from(track.children);
    const controls = document.createElement('div');
    const previousButton = document.createElement('button');
    const dots = document.createElement('div');
    const nextButton = document.createElement('button');
    let activeIndex = originalCards.length > 1 ? 1 : 0;
    let scrollUpdateScheduled = false;
    let mouseDrag = null;
    let suppressClick = false;
    let isJumping = false;
    let autoplayTimer = null;
    let isMorphing = false;
    let morphAnimations = [];
    let morphCleanup = null;
    let morphGhosts = new Map();
    let morphTargetView = null;

    try {
        group.dataset.view = window.localStorage.getItem(storageKey) === 'carousel' ? 'carousel' : 'grid';
    } catch (error) {
        console.warn(`Unable to restore the ${groupName} view preference:`, error);
        group.dataset.view = 'grid';
    }

    function updateToggleButtons(view) {
        toggleButtons.forEach(button => {
            const isActive = button.dataset.view === view;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    controls.className = 'portfolio-carousel-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', `${groupName} carousel controls`);

    previousButton.className = 'portfolio-carousel-button';
    previousButton.type = 'button';
    previousButton.setAttribute('aria-label', `Previous ${groupName} project`);
    previousButton.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';

    dots.className = 'portfolio-carousel-dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', `${groupName} slides`);

    nextButton.className = 'portfolio-carousel-button';
    nextButton.type = 'button';
    nextButton.setAttribute('aria-label', `Next ${groupName} project`);
    nextButton.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';

    function updateControls() {
        if (isJumping) return;

        const trackCenter = track.getBoundingClientRect().left + track.clientLeft + track.clientWidth / 2;
        activeIndex = cards.reduce((closestIndex, card, index) => {
            const bounds = card.getBoundingClientRect();
            const center = bounds.left + bounds.width / 2;
            const closestBounds = cards[closestIndex].getBoundingClientRect();
            const closestCenter = closestBounds.left + closestBounds.width / 2;
            return Math.abs(center - trackCenter) < Math.abs(closestCenter - trackCenter) ? index : closestIndex;
        }, 0);

        // Infinite loop jump logic
        if (originalCards.length > 1) {
            if (activeIndex === 0) {
                isJumping = true;
                activeIndex = cards.length - 2;
                track.style.scrollSnapType = 'none';
                scrollToCard(activeIndex, 'auto');
                setTimeout(() => {
                    track.style.scrollSnapType = 'x mandatory';
                    isJumping = false;
                }, 50);
            } else if (activeIndex === cards.length - 1) {
                isJumping = true;
                activeIndex = 1;
                track.style.scrollSnapType = 'none';
                scrollToCard(activeIndex, 'auto');
                setTimeout(() => {
                    track.style.scrollSnapType = 'x mandatory';
                    isJumping = false;
                }, 50);
            }
        }

        const realActiveIndex = originalCards.length > 1 ? activeIndex - 1 : activeIndex;
        dots.querySelectorAll('.portfolio-carousel-dot').forEach((dot, index) => {
            const isActive = index === realActiveIndex;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-current', String(isActive));
        });

        // Professional carousels don't disable buttons when infinite
        if (originalCards.length <= 1) {
            previousButton.disabled = true;
            nextButton.disabled = true;
        } else {
            previousButton.disabled = false;
            nextButton.disabled = false;
        }
    }

    function stopAutoplay() {
        window.clearTimeout(autoplayTimer);
        autoplayTimer = null;
    }

    function scheduleAutoplay() {
        stopAutoplay();
        if (group.dataset.view !== 'carousel' || originalCards.length < 2 ||
            portfolioMotionPreference.matches || document.hidden ||
            isMorphing ||
            track.matches(':hover') || controls.matches(':hover') ||
            track.contains(document.activeElement) || controls.contains(document.activeElement)) return;

        autoplayTimer = window.setTimeout(() => {
            autoplayTimer = null;
            scrollToCard(activeIndex + 1);
            scheduleAutoplay();
        }, 2500);
    }

    function scheduleControlsUpdate() {
        if (scrollUpdateScheduled) return;
        scrollUpdateScheduled = true;
        window.requestAnimationFrame(() => {
            scrollUpdateScheduled = false;
            updateControls();
        });
    }

    function scrollToCard(index, behavior = null) {
        const card = cards[index];
        if (!card) return;
        const trackBounds = track.getBoundingClientRect();
        const cardBounds = card.getBoundingClientRect();
        const left = track.scrollLeft + cardBounds.left - trackBounds.left - (track.clientWidth - cardBounds.width) / 2;
        if (behavior === 'auto') {
            const previousScrollBehavior = track.style.scrollBehavior;
            track.style.scrollBehavior = 'auto';
            track.scrollTo({ left, behavior: 'auto' });
            track.style.scrollBehavior = previousScrollBehavior;
            return;
        }

        track.scrollTo({
            left,
            behavior: behavior || (portfolioMotionPreference.matches ? 'auto' : 'smooth')
        });
    }

    originalCards.forEach((card, index) => {
        const dot = document.createElement('button');
        dot.className = 'portfolio-carousel-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show ${groupName} project ${index + 1} of ${originalCards.length}`);
        dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => scrollToCard(originalCards.length > 1 ? index + 1 : index));
        dots.appendChild(dot);
    });

    controls.append(previousButton, dots, nextButton);
    track.insertAdjacentElement('afterend', controls);
    updateToggleButtons(group.dataset.view);

    previousButton.addEventListener('click', () => {
        scrollToCard(activeIndex - 1);
        scheduleAutoplay();
    });
    nextButton.addEventListener('click', () => {
        scrollToCard(activeIndex + 1);
        scheduleAutoplay();
    });
    track.addEventListener('scroll', () => {
        scheduleControlsUpdate();
        scheduleAutoplay();
    }, { passive: true });
    track.addEventListener('keydown', event => {
        if (group.dataset.view !== 'carousel' || event.target !== track) return;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            scrollToCard(activeIndex - 1);
            scheduleAutoplay();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollToCard(activeIndex + 1);
            scheduleAutoplay();
        }
    });

    dots.addEventListener('click', event => {
        if (event.target.closest('.portfolio-carousel-dot')) scheduleAutoplay();
    });

    [track, controls].forEach(element => {
        element.addEventListener('mouseenter', stopAutoplay);
        element.addEventListener('mouseleave', scheduleAutoplay);
        element.addEventListener('focusin', stopAutoplay);
        element.addEventListener('focusout', event => {
            if (!track.contains(event.relatedTarget) && !controls.contains(event.relatedTarget)) {
                scheduleAutoplay();
            }
        });
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAutoplay();
        else scheduleAutoplay();
    });
    portfolioMotionPreference.addEventListener('change', () => {
        if (portfolioMotionPreference.matches) stopAutoplay();
        else scheduleAutoplay();
    });

    track.addEventListener('mousedown', event => {
        if (group.dataset.view !== 'carousel' || event.button !== 0) return;
        mouseDrag = { startX: event.clientX, scrollLeft: track.scrollLeft, moved: false };
    });

    window.addEventListener('mousemove', event => {
        if (!mouseDrag) return;
        const distance = event.clientX - mouseDrag.startX;
        if (!mouseDrag.moved && Math.abs(distance) < 6) return;
        if (!mouseDrag.moved) {
            mouseDrag.moved = true;
            track.classList.add('is-dragging');
        }
        track.scrollLeft = mouseDrag.scrollLeft - distance;
    });

    window.addEventListener('mouseup', () => {
        if (!mouseDrag) return;
        if (mouseDrag.moved) {
            suppressClick = true;
            window.requestAnimationFrame(() => { suppressClick = false; });
        }
        mouseDrag = null;
        track.classList.remove('is-dragging');
        scheduleControlsUpdate();
        scheduleAutoplay();
    });

    track.addEventListener('click', event => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
    }, true);
    track.addEventListener('dragstart', event => {
        if (group.dataset.view === 'carousel') event.preventDefault();
    });

    function setView(view) {
        if (morphCleanup && view === morphTargetView) return;

        const startingOverrides = new Map();
        if (morphCleanup) {
            morphGhosts.forEach((ghost, card) => {
                const rect = ghost.getBoundingClientRect();
                const pci = ghost.querySelector('.pci');
                startingOverrides.set(card, {
                    rect,
                    pciHeight: pci ? pci.getBoundingClientRect().height : null,
                    opacity: Number(getComputedStyle(ghost).opacity)
                });
            });
            morphAnimations.forEach(animation => animation.cancel());
            morphCleanup();
            morphCleanup = null;
            morphAnimations = [];
            morphGhosts = new Map();
            morphTargetView = null;
        }
        if (view === group.dataset.view) {
            try {
                window.localStorage.setItem(storageKey, view);
            } catch (error) {
                console.warn(`Unable to save the ${groupName} view preference:`, error);
            }
            scheduleAutoplay();
            return;
        }

        stopAutoplay();
        isMorphing = false;
        isJumping = false;

        const previousView = group.dataset.view;
        const shouldAnimate = !portfolioMotionPreference.matches &&
            typeof Element.prototype.animate === 'function' &&
            originalCards.length > 0;
        const duration = 600;
        const controlsDuration = 150;
        const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
        const getCard = item => item.matches('.pc') ? item : item.querySelector('.pc');
        const realCards = originalCards.map(getCard).filter(Boolean);
        const trackStyles = ['overflow', 'scrollSnapType', 'scrollBehavior'];
        const groupStyles = ['overflow', 'height'];
        const saveInlineStyles = (element, properties) => properties.reduce((saved, property) => {
            saved[property] = element.style[property];
            return saved;
        }, {});
        const restoreInlineStyles = (element, saved) => {
            Object.entries(saved).forEach(([property, value]) => {
                element.style[property] = value;
            });
        };
        let visibleCardIndex = 0;

        if (previousView === 'carousel' && realCards.length) {
            const trackRect = track.getBoundingClientRect();
            const center = trackRect.left + track.clientLeft + track.clientWidth / 2;
            visibleCardIndex = realCards.reduce((closest, card, index) => {
                const rect = card.getBoundingClientRect();
                const closestRect = realCards[closest].getBoundingClientRect();
                return Math.abs(rect.left + rect.width / 2 - center) <
                    Math.abs(closestRect.left + closestRect.width / 2 - center) ? index : closest;
            }, 0);
        }

        try {
            window.localStorage.setItem(storageKey, view);
        } catch (error) {
            console.warn(`Unable to save the ${groupName} view preference:`, error);
        }

        if (!shouldAnimate) {
            group.dataset.view = view;
            updateToggleButtons(view);
            if (view === 'carousel') {
                track.tabIndex = 0;
                track.setAttribute('role', 'region');
                track.setAttribute('aria-label', `${groupName} projects`);
                activeIndex = originalCards.length > 1 ? 1 : 0;
                if (originalCards.length > 1) scrollToCard(activeIndex, 'auto');
                else track.scrollLeft = 0;
                updateControls();
                scheduleAutoplay();
            } else {
                track.removeAttribute('tabindex');
                track.removeAttribute('role');
                track.removeAttribute('aria-label');
                track.scrollLeft = 0;
            }
            return;
        }

        const firstGroupRect = group.getBoundingClientRect();
        const firstCards = new Map(realCards.map(card => {
            const override = startingOverrides.get(card);
            const pci = card.querySelector('.pci');
            return [card, {
                rect: override?.rect || card.getBoundingClientRect(),
                pciHeight: override?.pciHeight ?? pci?.getBoundingClientRect().height ?? 0,
                opacity: override?.opacity ?? 1,
                visibility: card.style.visibility
            }];
        }));
        const savedTrackStyles = saveInlineStyles(track, trackStyles);
        const savedGroupStyles = saveInlineStyles(group, groupStyles);
        const savedControlsStyles = saveInlineStyles(controls, ['opacity', 'transform']);
        const savedMorphControls = group.getAttribute('data-morph-controls');
        const ghosts = new Map();
        const animations = [];
        let cleaned = false;
        let gridPreFadeAnimation = null;

        const ghostCards = view === 'carousel'
            ? realCards.slice(0, 1)
            : previousView === 'carousel'
                ? [realCards[visibleCardIndex]]
                : realCards;
        ghostCards.forEach(card => {
            const ghost = card.cloneNode(true);
            [ghost, ...ghost.querySelectorAll('*')].forEach(element => {
                element.classList.remove('rv', 'on', 'clone');
                element.removeAttribute('id');
            });
            ghost.style.visibility = 'visible';
            const source = firstCards.get(card);
            const rect = source.rect;
            const computed = getComputedStyle(card);
            ghost.classList.add('portfolio-morph-ghost');
            ghost.dataset.portfolioMorphFrom = previousView;
            ghost.dataset.portfolioMorphTo = view;
            ghost.setAttribute('aria-hidden', 'true');
            Object.assign(ghost.style, {
                position: 'fixed',
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                margin: '0',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: '9999',
                opacity: String(source.opacity),
                transform: 'none',
                transition: 'none',
                borderRadius: computed.borderRadius,
                boxShadow: computed.boxShadow
            });
            document.body.appendChild(ghost);
            ghosts.set(card, ghost);
        });
        ghostCards.forEach(card => {
            card.style.visibility = 'hidden';
        });

        const setViewState = () => {
            group.dataset.view = view;
            updateToggleButtons(view);

            if (view === 'carousel') {
                track.tabIndex = 0;
                track.setAttribute('role', 'region');
                track.setAttribute('aria-label', `${groupName} projects`);
                activeIndex = originalCards.length > 1 ? 1 : 0;
                if (originalCards.length > 1) scrollToCard(activeIndex, 'auto');
                else track.scrollLeft = 0;
            } else {
                track.removeAttribute('tabindex');
                track.removeAttribute('role');
                track.removeAttribute('aria-label');
                track.scrollLeft = 0;
            }
        };

        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            animations.forEach(animation => animation.cancel());
            gridPreFadeAnimation?.cancel();
            ghosts.forEach(ghost => ghost.remove());
            firstCards.forEach((saved, card) => {
                card.style.visibility = saved.visibility;
            });
            restoreInlineStyles(track, savedTrackStyles);
            restoreInlineStyles(group, savedGroupStyles);
            restoreInlineStyles(controls, savedControlsStyles);
            if (savedMorphControls === null) group.removeAttribute('data-morph-controls');
            else group.setAttribute('data-morph-controls', savedMorphControls);
            group.classList.remove('portfolio-morphing');
            isMorphing = false;
        };

        morphGhosts = ghosts;
        morphTargetView = view;
        morphAnimations = animations;
        morphCleanup = cleanup;
        isMorphing = true;
        isJumping = true;
        group.classList.add('portfolio-morphing');
        track.style.scrollSnapType = 'none';
        track.style.scrollBehavior = 'auto';
        if (view === 'carousel') group.dataset.morphControls = 'true';

        const animateMorph = () => {
            if (morphCleanup !== cleanup) return;

            setViewState();
            const lastGroupHeight = group.getBoundingClientRect().height;
            const lastRects = new Map(realCards.map(card => [card, card.getBoundingClientRect()]));
            const lastPciHeights = new Map(realCards.map(card => [
                card,
                card.querySelector('.pci')?.getBoundingClientRect().height ?? 0
            ]));
            group.style.height = `${firstGroupRect.height}px`;
            const selectedCard = previousView === 'carousel'
                ? realCards[visibleCardIndex]
                : realCards[0];

            ghosts.forEach((ghost, card) => {
                const first = firstCards.get(card);
                const last = lastRects.get(card);
                if (!first || !last) return;

                if (card === selectedCard) {
                    const ghostPci = ghost.querySelector('.pci');
                    animations.push(ghost.animate([
                        {
                            left: `${first.rect.left}px`,
                            top: `${first.rect.top}px`,
                            width: `${first.rect.width}px`,
                            height: `${first.rect.height}px`
                        },
                        {
                            left: `${last.left}px`,
                            top: `${last.top}px`,
                            width: `${last.width}px`,
                            height: `${last.height}px`
                        }
                    ], { duration, easing, fill: 'both' }));
                    if (ghostPci) {
                        animations.push(ghostPci.animate([
                            { height: `${first.pciHeight}px` },
                            { height: `${lastPciHeights.get(card)}px` }
                        ], { duration, easing, fill: 'both' }));
                    }
                } else if (view === 'grid') {
                    Object.assign(ghost.style, {
                        left: `${last.left}px`,
                        top: `${last.top}px`,
                        width: `${last.width}px`,
                        height: `${last.height}px`,
                        opacity: '0',
                        transform: 'scale(0.94)'
                    });
                    animations.push(ghost.animate([
                        { opacity: 0, transform: 'scale(0.94)', offset: 0.4 },
                        { opacity: 1, transform: 'scale(1)' }
                    ], { duration, easing, fill: 'both' }));
                }
            });

            animations.push(group.animate([
                { height: `${firstGroupRect.height}px` },
                { height: `${lastGroupHeight}px` }
            ], { duration, easing, fill: 'both' }));

            if (view === 'carousel') {
                controls.style.opacity = '0';
                controls.style.transform = 'translateY(6px)';
                animations.push(controls.animate([
                    { opacity: 0, transform: 'translateY(6px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], { duration: 180, delay: duration, easing: 'ease-out', fill: 'both' }));
            }

            Promise.all(animations.map(animation => animation.finished.catch(() => null)))
                .then(() => {
                    if (morphCleanup !== cleanup) return;
                    cleanup();
                    morphCleanup = null;
                    morphAnimations = [];
                    morphGhosts = new Map();
                    morphTargetView = null;
                    isJumping = false;
                    if (view === 'carousel') {
                        updateControls();
                        scheduleAutoplay();
                    }
                });
        };

        if (view === 'grid' && previousView === 'carousel') {
            gridPreFadeAnimation = controls.animate([
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(6px)' }
            ], { duration: controlsDuration, easing: 'ease-in', fill: 'both' });
            animations.push(gridPreFadeAnimation);
            gridPreFadeAnimation.finished.then(() => {
                if (morphCleanup === cleanup) animateMorph();
            }).catch(() => {});
        } else {
            animateMorph();
        }
    }

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => setView(button.dataset.view));
    });

    if (group.dataset.view === 'carousel') {
        track.tabIndex = 0;
        track.setAttribute('role', 'region');
        track.setAttribute('aria-label', `${groupName} projects`);
        if (originalCards.length > 1) {
            window.requestAnimationFrame(() => {
                scrollToCard(1, 'auto');
                updateControls();
                scheduleAutoplay();
            });
        } else {
            updateControls();
            scheduleAutoplay();
        }
    }
}

document.querySelectorAll('[data-portfolio-group]').forEach(initPortfolioGroup);

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
const roles = ['.NET Full-Stack Developer', 'ASP.NET Core & Razor Pages', 'WordPress Specialist', 'Web Application Developer'];
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
