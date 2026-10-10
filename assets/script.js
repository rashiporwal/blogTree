import { animate, inView, stagger, spring } from "motion";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
document.body.append(scrollProgress);

const ambientGraphics = document.createElement("div");
ambientGraphics.className = "ambient-graphics";
ambientGraphics.setAttribute("aria-hidden", "true");
ambientGraphics.innerHTML = '<span class="ambient-orb ambient-orb-one"></span><span class="ambient-orb ambient-orb-two"></span><span class="ambient-line"></span><span class="pointer-reflection"></span>';
document.body.prepend(ambientGraphics);

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const themeToggle = document.querySelector(".theme-toggle");
const root = document.documentElement;

const updateThemeLabel = () => {
  const dark = root.dataset.theme === "dark";
  themeToggle?.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
  themeToggle?.setAttribute("title", `Switch to ${dark ? "light" : "dark"} mode`);
};

updateThemeLabel();
themeToggle?.addEventListener("click", (event) => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.style.setProperty("--theme-x", `${event.clientX}px`);
  root.style.setProperty("--theme-y", `${event.clientY}px`);
  const applyTheme = () => {
    root.dataset.theme = nextTheme;
    try { localStorage.setItem("rashi-theme", nextTheme); } catch { /* Theme remains active for this visit. */ }
    updateThemeLabel();
  };
  if (document.startViewTransition && !reducedMotion) document.startViewTransition(applyTheme);
  else applyTheme();
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
};
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
      card.style.setProperty("--shine-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty("--shine-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
      animate(card, { rotateX, rotateY, scale: 1.008 }, { duration: .28, ease: "easeOut" });
    });
    card.addEventListener("pointerleave", () => {
      animate(card, { rotateX: 0, rotateY: 0, scale: 1 }, { duration: .5, type: spring, stiffness: 180, damping: 20 });
    });
  });

  document.querySelectorAll(".stack-card").forEach((card, index) => {
    animate(card, { y: [0, index % 2 ? -10 : 10, 0] }, { duration: 5 + index, repeat: Infinity, ease: "easeInOut" });
  });

  animate(".ambient-orb-one", { x: [0, -35, 20, 0], y: [0, 28, -18, 0], scale: [1, 1.05, .97, 1] }, { duration: 18, repeat: Infinity, ease: "easeInOut" });
  animate(".ambient-orb-two", { x: [0, 42, -15, 0], y: [0, -28, 22, 0], scale: [1, .95, 1.04, 1] }, { duration: 22, repeat: Infinity, ease: "easeInOut" });
  animate(".ambient-line", { rotate: [-18, -12, -18], x: [-20, 25, -20], opacity: [.4, .8, .4] }, { duration: 12, repeat: Infinity, ease: "easeInOut" });
  animate(".page-number", { y: [0, -12, 0], opacity: [.18, .27, .18] }, { duration: 5.5, repeat: Infinity, ease: "easeInOut" });

  if (finePointer) {
    const pointerReflection = document.querySelector(".pointer-reflection");
    let pointerFrame = null;
    window.addEventListener("pointermove", (event) => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        pointerReflection.style.transform = `translate3d(${event.clientX - 220}px, ${event.clientY - 220}px, 0)`;
      });
    }, { passive: true });

    document.querySelectorAll(".button, .circle-link").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .1;
        const y = (event.clientY - rect.top - rect.height / 2) * .1;
        animate(element, { x, y }, { duration: .22, ease: "easeOut" });
      });
      element.addEventListener("pointerleave", () => animate(element, { x: 0, y: 0 }, { duration: .45, type: spring, stiffness: 180, damping: 17 }));
    });
  }

  const hero = document.querySelector(".hero");
  if (hero) {
    const particles = document.createElement("div");
    particles.className = "hero-particles";
    particles.setAttribute("aria-hidden", "true");
    const particleCount = window.innerWidth < 640 ? 4 : 8;
    for (let index = 0; index < particleCount; index += 1) {
      const petal = document.createElement("span");
      petal.className = "hero-petal";
      petal.style.left = `${12 + (index * 83) % 82}%`;
      petal.style.opacity = String(.35 + (index % 4) * .12);
      particles.append(petal);
      animate(petal, { y: ["-10vh", "112vh"], x: [0, index % 2 ? 80 : -65, 20], rotate: [0, 220 + index * 30], scale: [.7, 1.1, .8] }, { duration: 10 + index * 1.2, delay: -(index * 1.7), repeat: Infinity, ease: "linear" });
    }
    hero.append(particles);
  }
}

const disciplineContent = {
  frontend: {
    index: "01",
    label: "Frontend experiences",
    title: "Interfaces that feel clear before they feel clever.",
    copy: "I build responsive, accessible interfaces where motion supports the story, performance stays visible, and every screen has a reason to exist.",
    points: ["Responsive UI systems", "Accessible interaction design", "Performance-aware animation"]
  },
  fullstack: {
    index: "02",
    label: "Full-stack builds",
    title: "Useful products need calm systems behind them.",
    copy: "From interface state to API and data flow, I enjoy connecting the layers of a MERN application so the experience stays predictable for users and maintainable for developers.",
    points: ["MERN application structure", "API and data flow", "Maintainable components"]
  },
  community: {
    index: "03",
    label: "Community & writing",
    title: "Knowledge becomes stronger when it can travel.",
    copy: "Leadership and technical writing taught me to explain ideas without hiding the difficult parts. I create documentation and learning spaces that help people take their next step.",
    points: ["Technical documentation", "Developer communities", "Learning in public"]
  }
};

const disciplinePanel = document.querySelector(".discipline-panel");
document.querySelectorAll("[data-discipline]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const content = disciplineContent[tab.dataset.discipline];
    if (!content || !disciplinePanel) return;

    document.querySelectorAll("[data-discipline]").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });

    disciplinePanel.querySelector("[data-discipline-index]").textContent = content.index;
    disciplinePanel.querySelector("[data-discipline-label]").textContent = content.label;
    disciplinePanel.querySelector("[data-discipline-title]").textContent = content.title;
    disciplinePanel.querySelector("[data-discipline-copy]").textContent = content.copy;
    disciplinePanel.querySelector("[data-discipline-points]").innerHTML = content.points.map((point) => `<li>${point}</li>`).join("");
    if (!reducedMotion) animate(disciplinePanel, { opacity: [0, 1], y: [12, 0] }, { duration: .42, ease: [0.22, 1, 0.36, 1] });
  });
});

const journalCards = [...document.querySelectorAll("[data-journal-card]")];
const journalSearch = document.querySelector("[data-journal-search]");
const journalFilters = [...document.querySelectorAll("[data-journal-filter]")];
const journalCount = document.querySelector("[data-journal-count]");
const journalEmpty = document.querySelector("[data-journal-empty]");
let activeJournalFilter = "all";
let savedArticles = new Set();

try {
  savedArticles = new Set(JSON.parse(localStorage.getItem("rashi-saved-articles") || "[]"));
} catch {
  savedArticles = new Set();
}

const updateBookmarkButtons = () => {
  document.querySelectorAll("[data-bookmark]").forEach((button) => {
    const saved = savedArticles.has(button.dataset.bookmark);
    button.setAttribute("aria-pressed", String(saved));
    button.innerHTML = `<span aria-hidden="true">${saved ? "◆" : "◇"}</span> ${saved ? "Saved" : "Save"}`;
  });
};

const applyJournalFilters = () => {
  const query = journalSearch?.value.trim().toLowerCase() || "";
  let visible = 0;
  journalCards.forEach((card) => {
    const matchesSearch = !query || card.dataset.searchText.includes(query);
    const matchesFilter = activeJournalFilter === "all"
      || card.dataset.category === activeJournalFilter
      || (activeJournalFilter === "saved" && savedArticles.has(card.dataset.articleId));
    const show = matchesSearch && matchesFilter;
    card.classList.toggle("is-filtered-out", !show);
    if (show) visible += 1;
  });
  if (journalCount) journalCount.textContent = `Showing ${visible} note${visible === 1 ? "" : "s"}`;
  if (journalEmpty) journalEmpty.hidden = visible !== 0;
};

updateBookmarkButtons();
journalSearch?.addEventListener("input", applyJournalFilters);
journalFilters.forEach((button) => {
  button.addEventListener("click", () => {
    activeJournalFilter = button.dataset.journalFilter;
    journalFilters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    applyJournalFilters();
  });
});
document.querySelectorAll("[data-bookmark]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.bookmark;
    if (savedArticles.has(id)) savedArticles.delete(id);
    else savedArticles.add(id);
    try { localStorage.setItem("rashi-saved-articles", JSON.stringify([...savedArticles])); } catch { /* Bookmarks remain available for this visit. */ }
    updateBookmarkButtons();
    if (activeJournalFilter === "saved") applyJournalFilters();
  });
});

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
    if (galleryCount) galleryCount.textContent = `${visible} photograph${visible === 1 ? "" : "s"} · drag to arrange`;

    if (!reducedMotion) {
      animate(document.querySelectorAll(".gallery-item:not(.is-hidden)"), { opacity: [0, 1], scale: [.97, 1] }, { duration: .4, delay: stagger(.045) });
    }
  });
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("p");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
let galleryDragJustEnded = false;

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (galleryDragJustEnded) return;
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

const galleryGrid = document.querySelector(".gallery-grid");
const defaultGalleryOrder = [...galleryItems].map((item) => item.dataset.galleryId);

const saveGalleryOrder = () => {
  if (!galleryGrid) return;
  const order = [...galleryGrid.querySelectorAll(".gallery-item")].map((item) => item.dataset.galleryId);
  try { localStorage.setItem("rashi-gallery-order", JSON.stringify(order)); } catch { /* Reordering still works for this visit. */ }
};

const restoreGalleryOrder = () => {
  if (!galleryGrid) return;
  try {
    const order = JSON.parse(localStorage.getItem("rashi-gallery-order") || "[]");
    if (!Array.isArray(order)) return;
    order.forEach((id) => {
      const item = galleryGrid.querySelector(`[data-gallery-id="${id}"]`);
      if (item) galleryGrid.append(item);
    });
  } catch {
    localStorage.removeItem("rashi-gallery-order");
  }
};

const animateGalleryReflow = (before) => {
  if (reducedMotion || !galleryGrid) return;
  galleryGrid.querySelectorAll(".gallery-item:not(.is-hidden)").forEach((item) => {
    const previous = before.get(item);
    if (!previous) return;
    const next = item.getBoundingClientRect();
    const x = previous.left - next.left;
    const y = previous.top - next.top;
    if (x || y) animate(item, { x: [x, 0], y: [y, 0] }, { duration: .35, ease: [0.22, 1, 0.36, 1] });
  });
};

restoreGalleryOrder();

if (galleryGrid) {
  let draggedGalleryItem = null;
  let dragHandle = null;
  let dragPointerId = null;
  let dragStart = { x: 0, y: 0 };
  let galleryDragging = false;

  galleryItems.forEach((item) => {
    const handle = item.querySelector(".drag-handle");
    handle?.addEventListener("click", (event) => event.stopPropagation());
    handle?.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      draggedGalleryItem = item;
      dragHandle = handle;
      dragPointerId = event.pointerId;
      dragStart = { x: event.clientX, y: event.clientY };
      handle.setPointerCapture(event.pointerId);
    });

    item.addEventListener("keydown", (event) => {
      if (!event.shiftKey || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const before = new Map([...galleryGrid.querySelectorAll(".gallery-item:not(.is-hidden)")].map((node) => [node, node.getBoundingClientRect()]));
      const moveBackward = event.key === "ArrowLeft" || event.key === "ArrowUp";
      const sibling = moveBackward ? item.previousElementSibling : item.nextElementSibling;
      if (!sibling) return;
      if (moveBackward) galleryGrid.insertBefore(item, sibling);
      else galleryGrid.insertBefore(sibling, item);
      animateGalleryReflow(before);
      saveGalleryOrder();
      item.focus();
    });
  });

  window.addEventListener("pointermove", (event) => {
    if (!draggedGalleryItem || event.pointerId !== dragPointerId) return;
    const distance = Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y);
    if (!galleryDragging && distance < 8) return;
    galleryDragging = true;
    draggedGalleryItem.classList.add("is-dragging");

    const hovered = document.elementFromPoint(event.clientX, event.clientY)?.closest(".gallery-item:not(.is-hidden)");
    galleryItems.forEach((item) => item.classList.toggle("is-drag-over", item === hovered && item !== draggedGalleryItem));
    if (!hovered || hovered === draggedGalleryItem) return;

    const before = new Map([...galleryGrid.querySelectorAll(".gallery-item:not(.is-hidden)")].map((node) => [node, node.getBoundingClientRect()]));
    const rect = hovered.getBoundingClientRect();
    const insertAfter = event.clientY > rect.top + rect.height / 2 || (Math.abs(event.clientY - (rect.top + rect.height / 2)) < rect.height * .25 && event.clientX > rect.left + rect.width / 2);
    galleryGrid.insertBefore(draggedGalleryItem, insertAfter ? hovered.nextElementSibling : hovered);
    animateGalleryReflow(before);
  }, { passive: true });

  const endGalleryDrag = (event) => {
    if (!draggedGalleryItem || event.pointerId !== dragPointerId) return;
    if (dragHandle?.hasPointerCapture(dragPointerId)) dragHandle.releasePointerCapture(dragPointerId);
    draggedGalleryItem.classList.remove("is-dragging");
    galleryItems.forEach((item) => item.classList.remove("is-drag-over"));
    if (galleryDragging) {
      saveGalleryOrder();
      galleryDragJustEnded = true;
      window.setTimeout(() => { galleryDragJustEnded = false; }, 220);
    }
    draggedGalleryItem = null;
    dragHandle = null;
    dragPointerId = null;
    galleryDragging = false;
  };
  window.addEventListener("pointerup", endGalleryDrag);
  window.addEventListener("pointercancel", endGalleryDrag);
}

document.querySelector("[data-gallery-reset]")?.addEventListener("click", () => {
  if (!galleryGrid) return;
  const before = new Map([...galleryGrid.querySelectorAll(".gallery-item:not(.is-hidden)")].map((node) => [node, node.getBoundingClientRect()]));
  defaultGalleryOrder.forEach((id) => {
    const item = galleryGrid.querySelector(`[data-gallery-id="${id}"]`);
    if (item) galleryGrid.append(item);
  });
  try { localStorage.removeItem("rashi-gallery-order"); } catch { /* Nothing else to reset. */ }
  animateGalleryReflow(before);
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
const messageField = document.querySelector("#message");
const messageCount = document.querySelector("[data-message-count]");
const updateMessageCount = () => {
  if (messageField && messageCount) messageCount.textContent = `${messageField.value.length} / ${messageField.maxLength}`;
};
messageField?.addEventListener("input", updateMessageCount);
updateMessageCount();
contactForm?.addEventListener("submit", () => {
  const submit = contactForm.querySelector("button[type='submit']");
  if (submit) {
    submit.disabled = true;
    submit.textContent = "Sending…";
  }
});
