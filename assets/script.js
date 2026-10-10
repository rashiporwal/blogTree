import { animate, inView, stagger, spring } from "motion";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  navigation?.classList.toggle("is-open", open);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  });
});

document.addEventListener("click", (event) => {
  if (!navigation?.classList.contains("is-open")) return;
  if (!header?.contains(event.target)) {
    menuButton?.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }
});

if (!reducedMotion) {
  const heroElements = document.querySelectorAll(".hero-reveal");
  if (heroElements.length) {
    animate(heroElements, { opacity: [0, 1], y: [28, 0] }, {
      duration: .85,
      delay: stagger(.09, { startDelay: .16 }),
      ease: [0.22, 1, 0.36, 1]
    });
  }

  inView(".reveal", (element) => {
    animate(element, { opacity: 1, y: 0 }, { duration: .72, ease: [0.22, 1, 0.36, 1] });
  }, { margin: "0px 0px -8% 0px", amount: .12 });

  const heroMedia = document.querySelector(".hero-media");
  if (heroMedia && finePointer) {
    document.querySelector(".hero")?.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth - .5) * -12;
      const y = (event.clientY / window.innerHeight - .5) * -8;
      animate(heroMedia, { x, y }, { duration: 1.2, ease: "easeOut" });
    });
  }

  document.querySelectorAll(".tilt-card").forEach((card) => {
    if (!finePointer) return;
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 5;
      const rotateX = -((event.clientY - rect.top) / rect.height - .5) * 5;
      animate(card, { rotateX, rotateY, scale: 1.008 }, { duration: .28, ease: "easeOut" });
    });
    card.addEventListener("pointerleave", () => {
      animate(card, { rotateX: 0, rotateY: 0, scale: 1 }, { duration: .5, type: spring, stiffness: 180, damping: 20 });
    });
  });

  document.querySelectorAll(".stack-card").forEach((card, index) => {
    animate(card, { y: [0, index % 2 ? -10 : 10, 0] }, { duration: 5 + index, repeat: Infinity, ease: "easeInOut" });
  });
}

const filterButtons = document.querySelectorAll("[data-filter]");
const galleryItems = document.querySelectorAll(".gallery-item");
const galleryCount = document.querySelector(".gallery-count");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    let visible = 0;
    galleryItems.forEach((item) => {
      const show = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    if (galleryCount) galleryCount.textContent = `${visible} photograph${visible === 1 ? "" : "s"}`;

    if (!reducedMotion) {
      animate(document.querySelectorAll(".gallery-item:not(.is-hidden)"), { opacity: [0, 1], scale: [.97, 1] }, { duration: .4, delay: stagger(.045) });
    }
  });
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("p");
const lightboxClose = lightbox?.querySelector(".lightbox-close");

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector("img")?.alt || "Gallery photograph";
    lightboxCaption.textContent = item.dataset.caption || "";
    lightbox.showModal();
  });
});

lightboxClose?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

const spirit = document.querySelector("#forest-spirit");
const spiritFigure = spirit?.querySelector(".spirit-figure");
let dragging = false;
let pointerOffset = { x: 0, y: 0 };

if (spirit && !reducedMotion) {
  animate(spiritFigure, { y: [0, -8, 0], rotate: [-2, 2, -2] }, { duration: 3.3, repeat: Infinity, ease: "easeInOut" });
  animate(spirit.querySelector(".spirit-leaf"), { rotate: [-28, -12, -28] }, { duration: 2.2, repeat: Infinity, ease: "easeInOut" });

  const placeSpirit = (clientX, clientY) => {
    const rect = spirit.getBoundingClientRect();
    const left = Math.max(6, Math.min(window.innerWidth - rect.width - 6, clientX - pointerOffset.x));
    const top = Math.max(74, Math.min(window.innerHeight - rect.height - 6, clientY - pointerOffset.y));
    spirit.style.right = "auto";
    spirit.style.bottom = "auto";
    spirit.style.left = `${left}px`;
    spirit.style.top = `${top}px`;
  };

  spirit.addEventListener("pointerdown", (event) => {
    dragging = true;
    const rect = spirit.getBoundingClientRect();
    pointerOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    spirit.setPointerCapture(event.pointerId);
    animate(spiritFigure, { scale: .9 }, { duration: .18 });
  });
  spirit.addEventListener("pointermove", (event) => {
    if (dragging) placeSpirit(event.clientX, event.clientY);
  });
  spirit.addEventListener("pointerup", (event) => {
    dragging = false;
    spirit.releasePointerCapture(event.pointerId);
    animate(spiritFigure, { scale: [1.08, 1] }, { duration: .5, type: spring, stiffness: 260, damping: 14 });
  });
  spirit.addEventListener("keydown", (event) => {
    const delta = event.shiftKey ? 30 : 12;
    const rect = spirit.getBoundingClientRect();
    const movement = {
      ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta]
    }[event.key];
    if (!movement) return;
    event.preventDefault();
    pointerOffset = { x: 0, y: 0 };
    placeSpirit(rect.left + movement[0], rect.top + movement[1]);
  });
}

const contactForm = document.querySelector(".contact-form");
contactForm?.addEventListener("submit", () => {
  const submit = contactForm.querySelector("button[type='submit']");
  if (submit) {
    submit.disabled = true;
    submit.textContent = "Sending…";
  }
});
