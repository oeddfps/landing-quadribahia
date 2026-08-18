const root = document.documentElement;
const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress");
const heroImage = document.querySelector(".hero-image");

root.classList.add("js");

window.addEventListener("load", () => {
  document.body.classList.add("is-loaded");
});

const revealItems = [
  ...document.querySelectorAll(".section .container, .steps-grid > div, .feature-grid article, .schedule-times span, .photo-grid figure, .cta-box"),
];

revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.setProperty("--delay", `${Math.min(index * 55, 360)}ms`);
});

document.querySelectorAll(".photo-grid figure").forEach((figure, index) => {
  figure.classList.add("photo-reveal");
  figure.style.setProperty("--photo-delay", `${index * 90}ms`);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => observer.observe(item));

let ticking = false;

function onScroll() {
  if (ticking) return;

  window.requestAnimationFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);

    if (heroImage && window.matchMedia("(min-width: 861px)").matches) {
      const offset = Math.min(window.scrollY * 0.12, 80);
      heroImage.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`;
    }

    ticking = false;
  });

  ticking = true;
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -7;
    const rotateY = ((x / rect.width) - 0.5) * 7;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

const lightbox = document.querySelector("#image-lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
let lastOpenedImage = null;

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;

  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
  lastOpenedImage?.focus();
}

function openLightbox(image) {
  if (!lightbox || !lightboxImage) return;

  lastOpenedImage = image.closest("figure");
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose?.focus();
}

document.querySelectorAll(".photo-grid figure").forEach((figure) => {
  const image = figure.querySelector("img");
  if (!image) return;

  figure.setAttribute("role", "button");
  figure.setAttribute("tabindex", "0");
  figure.setAttribute("aria-label", `Ampliar imagem: ${image.alt}`);
  figure.addEventListener("click", () => openLightbox(image));
  figure.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openLightbox(image);
  });
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
});
