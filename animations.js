const q = (sel, root = document) => root.querySelector(sel);
const qq = (sel, root = document) => [...root.querySelectorAll(sel)];
const isMobile = window.matchMedia("(max-width: 768px)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ease = "cubic-bezier(0.16, 1, 0.3, 1)";

function revealElements(elements, options = {}) {
  if (reduceMotion) {
    elements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const {
    delay = 0,
    stagger = 80,
    duration = 760,
    from = "translate3d(0, 24px, 0)",
  } = options;

  elements.forEach((el, index) => {
    if (!el) return;
    el.animate(
      [
        { opacity: 0, transform: from },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
      ],
      {
        duration,
        delay: delay + index * stagger,
        easing: ease,
        fill: "forwards",
      }
    );
  });
}

const heroEls = [
  q(".hero-logo"),
  q("#hero-title"),
  q(".hero-copy"),
  q(".hero-actions"),
].filter(Boolean);

heroEls.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translate3d(0, 24px, 0)";
});

revealElements(heroEls, { delay: 90, stagger: 110, duration: 860 });

const header = q(".site-header");
window.addEventListener(
  "scroll",
  () => {
    if (header) header.classList.toggle("header-elevated", window.scrollY > 70);
  },
  { passive: true }
);

const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.appendChild(progressBar);

window.addEventListener(
  "scroll",
  () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
  },
  { passive: true }
);

const animated = new WeakSet();
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || animated.has(entry.target)) return;
      animated.add(entry.target);

      if (entry.target.matches(".quick-info")) {
        revealElements(qq(".quick-info article"), {
          from: "translate3d(0, 22px, 0) scale(0.98)",
          stagger: 80,
          duration: 700,
        });
      }

      if (entry.target.matches(".intro-section")) {
        revealElements([q(".section-kicker", entry.target)], {
          from: "translate3d(-16px, 0, 0)",
          duration: 680,
        });
        revealElements(qq(".intro-grid > *", entry.target), {
          delay: 140,
          stagger: 110,
          from: "translate3d(0, 28px, 0)",
          duration: 820,
        });
      }

      if (entry.target.matches(".value-section")) {
        revealElements(qq(".value-card"), {
          from: "translate3d(0, 28px, 0) scale(0.98)",
          stagger: 100,
          duration: 780,
        });
      }

      if (entry.target.matches(".timeline")) {
        revealElements(qq(".timeline article"), {
          from: "translate3d(-24px, 0, 0)",
          stagger: 120,
          duration: 780,
        });
      }

      if (entry.target.matches(".room-grid")) {
        revealElements(qq(".room-grid article"), {
          from: "translate3d(0, 26px, 0) scale(0.98)",
          stagger: 80,
          duration: 760,
        });
      }

      if (entry.target.matches(".family-grid")) {
        revealElements(qq(".family-grid article"), {
          from: "translate3d(0, 26px, 0) scale(0.98)",
          stagger: 85,
          duration: 760,
        });
      }

      if (entry.target.matches(".pricing-section")) {
        revealElements(qq(".price-card"), {
          from: "translate3d(0, 28px, 0) scale(0.98)",
          stagger: 100,
          duration: 780,
        });
      }

      if (entry.target.matches(".contact-section")) {
        revealElements([q(".contact-panel")], {
          from: "translate3d(-24px, 0, 0)",
          delay: 80,
          duration: 820,
        });
        revealElements([q(".preinscription-form")], {
          from: "translate3d(24px, 0, 0)",
          delay: 160,
          duration: 820,
        });
      }

      if (entry.target.matches(".site-footer")) {
        revealElements(
          [q(".footer-brand"), q(".footer-links"), q(".footer-contact")].filter(Boolean),
          { from: "translate3d(0, 22px, 0)", stagger: 100, duration: 760 }
        );
      }
    });
  },
  { threshold: 0.12 }
);

[
  ".quick-info",
  ".intro-section",
  ".value-section",
  ".timeline",
  ".room-grid",
  ".family-grid",
  ".pricing-section",
  ".contact-section",
  ".site-footer",
].forEach((selector) => qq(selector).forEach((el) => observer.observe(el)));

if (!isMobile && !reduceMotion) {
  const blob = document.createElement("div");
  const dot = document.createElement("div");
  blob.className = "cursor-blob";
  dot.className = "cursor-dot";
  document.body.append(blob, dot);

  let bx = -200;
  let by = -200;
  let mx = -200;
  let my = -200;
  let visible = false;
  let hover = false;

  document.addEventListener("mousemove", (event) => {
    mx = event.clientX;
    my = event.clientY;
    if (!visible) {
      visible = true;
      blob.style.opacity = "1";
      dot.style.opacity = "1";
    }
  });

  document.addEventListener("mouseleave", () => {
    visible = false;
    blob.style.opacity = "0";
    dot.style.opacity = "0";
  });

  qq("a, button, .value-card, .price-card, .room-grid article, .family-grid article, input, textarea, select").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      hover = true;
      blob.style.width = "58px";
      blob.style.height = "58px";
      dot.style.opacity = "0.45";
    });
    el.addEventListener("mouseleave", () => {
      hover = false;
      blob.style.width = "34px";
      blob.style.height = "34px";
      dot.style.opacity = visible ? "1" : "0";
    });
  });

  function cursorLoop() {
    bx += (mx - bx) * 0.16;
    by += (my - by) * 0.16;
    const radius = (hover ? 58 : 34) / 2;
    blob.style.transform = `translate3d(${bx - radius}px, ${by - radius}px, 0)`;
    dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
    requestAnimationFrame(cursorLoop);
  }

  cursorLoop();
}

const heroSection = q(".hero");
if (heroSection && !reduceMotion) {
  const wrap = document.createElement("div");
  wrap.className = "hero-particles";
  heroSection.appendChild(wrap);

  const colors = ["var(--teal)", "var(--mint)", "var(--gold)"];

  for (let i = 0; i < 9; i += 1) {
    const particle = document.createElement("div");
    const size = Math.random() * 6 + 3;
    particle.className = "particle";
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 92 + 4}%;
      bottom: ${Math.random() * 48 + 6}%;
      animation-delay: ${Math.random() * 10}s;
      animation-duration: ${Math.random() * 14 + 14}s;
      opacity: ${Math.random() * 0.16 + 0.04};
      background: ${colors[Math.floor(Math.random() * colors.length)]};
    `;
    wrap.appendChild(particle);
  }
}
