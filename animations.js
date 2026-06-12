import {
  animate,
  inView,
  stagger,
  spring,
  scroll
} from "https://cdn.jsdelivr.net/npm/motion@11/dist/motion.js";

// ============================================================
// HELPERS
// ============================================================
const q  = (sel, root = document) => root.querySelector(sel);
const qq = (sel, root = document) => [...root.querySelectorAll(sel)];
const isMobile = window.matchMedia("(max-width: 768px)").matches;

// ============================================================
// 1. HERO ENTRANCE — Spring cascade
// ============================================================
const heroEls = [
  q(".hero-logo"),
  q("#hero-title"),
  q(".hero-copy"),
  q(".hero-actions"),
];

// Set initial hidden state instantly via JS (no CSS dependency)
heroEls.forEach((el) => {
  if (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
  }
});

// Staggered spring entrance after a short delay
heroEls.forEach((el, i) => {
  if (!el) return;
  animate(
    el,
    { opacity: [0, 1], y: [32, 0] },
    {
      duration: 1.1,
      delay: 0.15 + i * 0.18,
      easing: spring({ stiffness: 110, damping: 20 }),
    }
  );
});

// ============================================================
// 2. KEN BURNS — Slow dreamy zoom on hero background
// ============================================================
const heroImage = q(".hero-image");
if (heroImage) {
  animate(
    heroImage,
    { scale: [1, 1.07] },
    {
      duration: 18,
      easing: "ease-in-out",
      repeat: Infinity,
      direction: "alternate",
    }
  );
}

// ============================================================
// 3. HEADER — Frosted glass on scroll
// ============================================================
const header = q(".site-header");
window.addEventListener(
  "scroll",
  () => {
    if (header) header.classList.toggle("header-elevated", window.scrollY > 70);
  },
  { passive: true }
);

// ============================================================
// 4. SCROLL PROGRESS BAR
// ============================================================
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.appendChild(progressBar);

scroll(({ y }) => {
  progressBar.style.transform = `scaleX(${y.progress})`;
});

// ============================================================
// 5. QUICK-INFO — Staggered bounce
// ============================================================
inView(
  ".quick-info",
  () => {
    animate(
      qq(".quick-info article"),
      { opacity: [0, 1], y: [36, 0], scale: [0.88, 1] },
      {
        delay: stagger(0.1, { start: 0.05 }),
        easing: spring({ stiffness: 200, damping: 22 }),
      }
    );
  },
  { amount: 0.2 }
);

// ============================================================
// 6. INTRO SECTIONS — Fade + slide
// ============================================================
qq(".intro-section").forEach((section) => {
  inView(
    section,
    () => {
      const kicker = q(".section-kicker", section);
      const gridCols = qq(".intro-grid > *", section);
      if (kicker) {
        animate(kicker, { opacity: [0, 1], x: [-16, 0] }, {
          duration: 0.7, easing: [0.16, 1, 0.3, 1], delay: 0.05,
        });
      }
      if (gridCols.length) {
        animate(gridCols, { opacity: [0, 1], y: [40, 0] }, {
          delay: stagger(0.14, { start: 0.2 }),
          duration: 0.95,
          easing: spring({ stiffness: 130, damping: 22 }),
        });
      }
    },
    { amount: 0.1 }
  );
});

// ============================================================
// 7. VALUE CARDS — Playful bounce with tilt
// ============================================================
inView(
  ".value-section",
  () => {
    animate(
      qq(".value-card"),
      { opacity: [0, 1], y: [60, 0], rotate: [4, 0], scale: [0.88, 1] },
      {
        delay: stagger(0.14),
        easing: spring({ stiffness: 160, damping: 18 }),
      }
    );
  },
  { amount: 0.15 }
);

// ============================================================
// 8. TIMELINE — Footsteps from the left
// ============================================================
inView(
  ".timeline",
  () => {
    animate(
      qq(".timeline article"),
      { opacity: [0, 1], x: [-50, 0] },
      {
        delay: stagger(0.2, { start: 0.1 }),
        duration: 0.9,
        easing: spring({ stiffness: 140, damping: 20 }),
      }
    );
  },
  { amount: 0.1 }
);

// ============================================================
// 9. ROOM GRID — Gentle pop
// ============================================================
inView(
  ".room-grid",
  () => {
    animate(
      qq(".room-grid article"),
      { opacity: [0, 1], y: [50, 0], scale: [0.9, 1] },
      {
        delay: stagger(0.1),
        easing: spring({ stiffness: 180, damping: 22 }),
      }
    );
  },
  { amount: 0.1 }
);

// ============================================================
// 10. PRICING — Spring rise
// ============================================================
inView(
  ".pricing-section",
  () => {
    animate(
      qq(".price-card"),
      { opacity: [0, 1], y: [60, 0], scale: [0.84, 1] },
      {
        delay: stagger(0.16, { start: 0.1 }),
        easing: spring({ stiffness: 180, damping: 20 }),
      }
    );
  },
  { amount: 0.1 }
);

// ============================================================
// 11. CONTACT — Slide from sides
// ============================================================
inView(
  ".contact-section",
  () => {
    const panel = q(".contact-panel");
    const form  = q(".preinscription-form");
    if (panel) {
      animate(panel, { opacity: [0, 1], x: [-50, 0] }, {
        duration: 1,
        easing: spring({ stiffness: 130, damping: 20 }),
        delay: 0.1,
      });
    }
    if (form) {
      animate(form, { opacity: [0, 1], x: [50, 0] }, {
        duration: 1,
        easing: spring({ stiffness: 130, damping: 20 }),
        delay: 0.25,
      });
    }
  },
  { amount: 0.1 }
);

// ============================================================
// 12. FOOTER — Soft staggered reveal
// ============================================================
inView(
  ".site-footer",
  () => {
    const cols = [
      q(".footer-brand"),
      q(".footer-links"),
      q(".footer-contact"),
    ].filter(Boolean);
    if (cols.length) {
      animate(cols, { opacity: [0, 1], y: [30, 0] }, {
        delay: stagger(0.15, { start: 0.1 }),
        duration: 0.9,
        easing: [0.16, 1, 0.3, 1],
      });
    }
  },
  { amount: 0.05 }
);

// ============================================================
// 13. CURSOR BLOB — Soft emotional presence (desktop only)
// ============================================================
if (!isMobile) {
  const blob = document.createElement("div");
  blob.className = "cursor-blob";
  document.body.appendChild(blob);

  let bx = -200, by = -200, mx = -200, my = -200;
  let visible = false;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      visible = true;
      animate(blob, { opacity: [0, 1] }, { duration: 0.6 });
    }
  });

  document.addEventListener("mouseleave", () => {
    visible = false;
    animate(blob, { opacity: 0 }, { duration: 0.5 });
  });

  // Blob grows on interactive elements
  qq("a, button, .value-card, .price-card, .room-grid article").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      animate(blob, { scale: 2.8, opacity: 0.22 }, {
        duration: 0.5,
        easing: spring({ stiffness: 250, damping: 22 }),
      });
    });
    el.addEventListener("mouseleave", () => {
      animate(blob, { scale: 1, opacity: 0.14 }, {
        duration: 0.5,
        easing: spring({ stiffness: 250, damping: 22 }),
      });
    });
  });

  // Smooth RAF follow loop
  function blobLoop() {
    bx += (mx - bx) * 0.09;
    by += (my - by) * 0.09;
    blob.style.left = bx - 30 + "px";
    blob.style.top  = by - 30 + "px";
    requestAnimationFrame(blobLoop);
  }
  blobLoop();
}

// ============================================================
// 14. FLOATING PARTICLES — Hero warmth
// ============================================================
const heroSection = q(".hero");
if (heroSection) {
  const wrap = document.createElement("div");
  wrap.className = "hero-particles";
  heroSection.appendChild(wrap);

  const colors = [
    "var(--teal)",
    "var(--mint)",
    "var(--gold)",
    "rgba(0,167,168,0.6)",
  ];

  for (let i = 0; i < 16; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 8 + 3;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 95}%;
      bottom: ${Math.random() * 50 + 5}%;
      animation-delay: ${Math.random() * 10}s;
      animation-duration: ${Math.random() * 12 + 10}s;
      opacity: ${Math.random() * 0.28 + 0.05};
      background: ${colors[Math.floor(Math.random() * colors.length)]};
    `;
    wrap.appendChild(p);
  }
}
