const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");
const form = document.querySelector(".preinscription-form");
const formMessage = document.querySelector(".form-message");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const sections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

window.addEventListener("scroll", () => {
  const current = sections.findLast((section) => section.offsetTop <= window.scrollY + 120);

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", current && link.getAttribute("href") === `#${current.id}`);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "Merci, votre demande a bien ete prise en compte.";
  form.reset();
});
