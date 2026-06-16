const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");
const form = document.querySelector(".preinscription-form");
const formMessage = document.querySelector(".form-message");
const offerButtons = document.querySelectorAll(".offer-button");
const selectedOfferInput = document.querySelector(".selected-offer-input");
const paymentOptions = document.querySelector(".payment-options");
const paymentInputs = document.querySelectorAll('input[name="payment"]');
const soundToggle = document.querySelector(".sound-toggle");
const soundToggleLabel = document.querySelector(".sound-toggle-label");
const muteToggle = document.querySelector(".mute-toggle");
const muteToggleLabel = document.querySelector(".mute-toggle-label");
const volumeSlider = document.querySelector(".volume-slider");

const soundPreferenceKey = "auxPremiersPasSound";
const mutePreferenceKey = "auxPremiersPasMuted";
const volumePreferenceKey = "auxPremiersPasVolume";
const audioBaseVolume = 0.085;
const hoverDebounce = 0.085;
const clickDebounce = 0.055;

let audioContext;
let masterGain;
let ambientGain;
let effectsGain;
let ambientLfo;
let ambientNodes = [];
let soundEnabled = getPreference(soundPreferenceKey) === "on";
let muted = getPreference(mutePreferenceKey) === "on";
let volume = Number(getPreference(volumePreferenceKey) || 42) / 100;
let audioReady = false;
let lastHoverSound = 0;
let lastClickSound = 0;
let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, t: performance.now(), speed: 0 };

if (volumeSlider) volumeSlider.value = String(Math.round(volume * 100));

function getPreference(key) {
  try {
    return window.localStorage?.getItem(key);
  } catch {
    return null;
  }
}

function setPreference(key, value) {
  try {
    window.localStorage?.setItem(key, value);
  } catch {
    // Audio preferences are optional; the interface still works without persistence.
  }
}

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const sections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

window.addEventListener(
  "scroll",
  () => {
    const current = sections.findLast((section) => section.offsetTop <= window.scrollY + 120);

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", current && link.getAttribute("href") === `#${current.id}`);
    });
  },
  { passive: true }
);

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "Merci, votre demande a bien été prise en compte.";
  form.reset();
  offerButtons.forEach((button) => {
    button.classList.remove("is-selected");
    button.closest(".price-card")?.classList.remove("is-selected");
  });
  if (paymentOptions) paymentOptions.hidden = true;
  paymentInputs.forEach((input) => {
    input.required = false;
  });
});

offerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedOffer = button.dataset.offer || "";

    offerButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-selected", isSelected);
      item.closest(".price-card")?.classList.toggle("is-selected", isSelected);
    });

    if (selectedOfferInput) selectedOfferInput.value = selectedOffer;
    if (paymentOptions) paymentOptions.hidden = false;
    paymentInputs.forEach((input) => {
      input.required = true;
    });

    form?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function effectiveVolume() {
  return soundEnabled && !muted ? volume : 0;
}

function setAudioButtonState() {
  const soundLabel = soundEnabled ? "Mettre l'ambiance sonore en pause" : "Activer l'ambiance sonore";
  const muteLabel = muted ? "Réactiver le son" : "Couper le son";

  soundToggle?.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle?.setAttribute("aria-label", soundLabel);
  muteToggle?.setAttribute("aria-pressed", String(muted));
  muteToggle?.setAttribute("aria-label", muteLabel);

  if (soundToggleLabel) soundToggleLabel.textContent = soundLabel;
  if (muteToggleLabel) muteToggleLabel.textContent = muteLabel;
}

function rampParam(param, target, timeConstant = 0.38) {
  if (!audioContext || !param) return;
  const now = audioContext.currentTime;
  param.cancelScheduledValues(now);
  param.setTargetAtTime(target, now, timeConstant);
}

function updateMasterVolume(timeConstant = 0.28) {
  if (!masterGain) return;
  rampParam(masterGain.gain, effectiveVolume(), timeConstant);
}

function createAudioGraph() {
  if (audioContext) return;

  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;

  audioContext = new AudioEngine();
  masterGain = audioContext.createGain();
  ambientGain = audioContext.createGain();
  effectsGain = audioContext.createGain();

  masterGain.gain.value = 0;
  ambientGain.gain.value = 0;
  effectsGain.gain.value = 0.52;

  ambientGain.connect(masterGain);
  effectsGain.connect(masterGain);
  masterGain.connect(audioContext.destination);

  const now = audioContext.currentTime;
  const notes = [130.81, 196, 261.63, 329.63, 392];

  ambientNodes = notes.map((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    const panner = audioContext.createStereoPanner();

    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    filter.type = "lowpass";
    filter.frequency.value = 420 + index * 90;
    gain.gain.value = 0.105 / notes.length;
    panner.pan.value = (index - 2) * 0.16;

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(ambientGain);
    oscillator.start(now + index * 0.08);

    return { oscillator, filter, gain, panner };
  });

  ambientLfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  ambientLfo.type = "sine";
  ambientLfo.frequency.value = 0.035;
  lfoGain.gain.value = 0.012;
  ambientLfo.connect(lfoGain);
  ambientNodes.forEach((node) => lfoGain.connect(node.gain.gain));
  ambientLfo.start(now);
}

async function unlockAudio() {
  createAudioGraph();
  if (!audioContext) return false;

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  audioReady = audioContext.state === "running";
  return audioReady;
}

function fadeAmbient(targetVolume) {
  if (!ambientGain) return;
  rampParam(ambientGain.gain, targetVolume, targetVolume > 0 ? 0.7 : 0.42);
}

async function enableSound() {
  soundEnabled = true;
  setPreference(soundPreferenceKey, "on");
  setAudioButtonState();

  const unlocked = await unlockAudio();
  if (unlocked) {
    updateMasterVolume(0.18);
    fadeAmbient(audioBaseVolume);
  }
}

function pauseSound() {
  soundEnabled = false;
  setPreference(soundPreferenceKey, "off");
  setAudioButtonState();
  fadeAmbient(0);
  updateMasterVolume(0.35);
}

function setMuted(nextMuted) {
  muted = nextMuted;
  setPreference(mutePreferenceKey, muted ? "on" : "off");
  setAudioButtonState();
  updateMasterVolume(0.24);
}

function pointerProfile(event) {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const x = event?.clientX ?? lastPointer.x;
  const y = event?.clientY ?? lastPointer.y;
  const pan = clamp((x / width) * 2 - 1, -0.82, 0.82);
  const verticalTone = 1 + clamp((height - y) / height, 0, 1) * 0.22;
  const speedTone = 1 + clamp(lastPointer.speed / 1300, 0, 0.34);
  const intensity = clamp(0.54 + lastPointer.speed / 1700, 0.54, 1);

  return { pan, verticalTone, speedTone, intensity };
}

function playInteractionSound(type, event) {
  if (!soundEnabled || muted || !audioReady || !audioContext || !effectsGain) return;

  const now = audioContext.currentTime;
  const debounce = type === "click" ? clickDebounce : hoverDebounce;
  const last = type === "click" ? lastClickSound : lastHoverSound;
  if (now - last < debounce) return;
  if (type === "click") lastClickSound = now;
  else lastHoverSound = now;

  const profile = pointerProfile(event);
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const panner = audioContext.createStereoPanner();

  const isClick = type === "click";
  const baseFrequency = (isClick ? 420 : 760) * profile.verticalTone * profile.speedTone;
  const targetFrequency = baseFrequency * (isClick ? 0.72 : 1.32);
  const peak = (isClick ? 0.13 : 0.065) * profile.intensity;
  const duration = isClick ? 0.24 : 0.16;

  oscillator.type = isClick ? "triangle" : "sine";
  oscillator.frequency.setValueAtTime(baseFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, targetFrequency), now + duration * 0.58);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(isClick ? 1900 : 2700, now);
  filter.frequency.exponentialRampToValueAtTime(isClick ? 820 : 1800, now + duration);

  panner.pan.setValueAtTime(profile.pan, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(panner);
  panner.connect(effectsGain);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.04);
}

setAudioButtonState();

soundToggle?.addEventListener("click", async (event) => {
  if (soundEnabled) {
    pauseSound();
  } else {
    await enableSound();
  }
  playInteractionSound("click", event);
});

muteToggle?.addEventListener("click", async (event) => {
  if (!audioReady) await unlockAudio();
  setMuted(!muted);
  playInteractionSound("click", event);
});

volumeSlider?.addEventListener("input", (event) => {
  volume = Number(event.target.value) / 100;
  setPreference(volumePreferenceKey, String(Math.round(volume * 100)));
  if (volume > 0 && muted) setMuted(false);
  updateMasterVolume(0.12);
});

window.addEventListener(
  "pointermove",
  (event) => {
    const now = performance.now();
    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;
    const dt = Math.max(16, now - lastPointer.t);
    lastPointer = {
      x: event.clientX,
      y: event.clientY,
      t: now,
      speed: Math.hypot(dx, dy) / dt * 1000,
    };
  },
  { passive: true }
);

window.addEventListener(
  "pointerdown",
  async (event) => {
    if (soundEnabled && !audioReady) {
      const unlocked = await unlockAudio();
      if (unlocked) {
        updateMasterVolume(0.18);
        fadeAmbient(audioBaseVolume);
      }
    }
    playInteractionSound("click", event);
  },
  { passive: true }
);

const soundTargets =
  "a, button, .value-card, .price-card, .room-grid article, .family-grid article, .quick-info article, input, select, textarea";

document.querySelectorAll(soundTargets).forEach((element) => {
  element.addEventListener("pointerenter", (event) => playInteractionSound("hover", event));
  element.addEventListener("click", (event) => playInteractionSound("click", event));
});

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.12,
};

const observer = new IntersectionObserver((entries, revealObserver) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".reveal, .reveal-group").forEach((element) => {
  observer.observe(element);
});
