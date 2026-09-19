const menuButton = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector(".primary-navigation");

if (menuButton && primaryNavigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    primaryNavigation.classList.toggle("is-open", !isOpen);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      primaryNavigation.classList.remove("is-open");
    }
  });
}

const heroVideo = document.querySelector(".hero-video");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (heroVideo) {
  const syncVideoMotion = () => {
    if (reducedMotion.matches) {
      heroVideo.pause();
    } else if (heroVideo.paused) {
      heroVideo.play().catch(() => {});
    }
  };

  heroVideo.addEventListener("loadeddata", syncVideoMotion);
  reducedMotion.addEventListener("change", syncVideoMotion);
  syncVideoMotion();
}

const lightbox = document.querySelector(".gallery-lightbox");
const galleryDataElement = document.querySelector("#gallery-data");

if (lightbox && galleryDataElement) {
  const galleryItems = JSON.parse(galleryDataElement.textContent);
  const openButtons = [...document.querySelectorAll(".gallery-open")];
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-previous");
  const nextButton = lightbox.querySelector(".lightbox-next");
  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxCaption = lightbox.querySelector("#lightbox-caption");
  const lightboxPosition = lightbox.querySelector("#lightbox-position");
  let currentIndex = 0;
  let returnFocus = null;

  const renderLightbox = (index) => {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCaption.textContent = item.caption;
    lightboxPosition.textContent = `${currentIndex + 1} of ${galleryItems.length}`;
  };

  const closeLightbox = () => lightbox.close();

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      returnFocus = button;
      renderLightbox(Number(button.dataset.galleryIndex));
      document.body.classList.add("lightbox-open");
      lightbox.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", () => renderLightbox(currentIndex - 1));
  nextButton.addEventListener("click", () => renderLightbox(currentIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeLightbox();
  });
  lightbox.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    returnFocus?.focus();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      renderLightbox(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      renderLightbox(currentIndex + 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
    } else if (event.key === "Tab") {
      const controls = [closeButton, previousButton, nextButton];
      const activeIndex = controls.indexOf(document.activeElement);
      if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        controls.at(-1).focus();
      } else if (!event.shiftKey && activeIndex === controls.length - 1) {
        event.preventDefault();
        controls[0].focus();
      }
    }
  });
}

const contactEnquiryPreview = document.querySelector(".contact-enquiry-preview");

if (contactEnquiryPreview) {
  contactEnquiryPreview.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

const admissionsApplicationPreview = document.querySelector(".application-preview");

if (admissionsApplicationPreview) {
  admissionsApplicationPreview.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}
