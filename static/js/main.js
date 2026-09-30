const menuButton = document.querySelector(".menu-toggle");

const primaryNavigation = document.querySelector(".primary-navigation");

if (menuButton && primaryNavigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    primaryNavigation.classList.toggle("is-open", !isOpen);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menuButton.getAttribute("aria-expanded") !== "true") return;
    menuButton.setAttribute("aria-expanded", "false");
    primaryNavigation.classList.remove("is-open");
    menuButton.focus();
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      primaryNavigation.classList.remove("is-open");
    }
  });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroSlideshow = document.querySelector("[data-hero-slideshow]");

if (heroSlideshow) {
  const slides = [...heroSlideshow.querySelectorAll("[data-hero-slide]")];
  const heroInteraction = heroSlideshow.closest(".hero") || heroSlideshow;
  const slideImages = slides.map((slide) => slide.querySelector("img"));
  let currentSlide = 0;
  let timer = null;
  let pointerPaused = false;
  let focusPaused = false;
  let userPaused = false;
  let imagesReady = false;
  const toggle = heroSlideshow.querySelector("[data-hero-toggle]");

  const renderHeroSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentSlide;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
  };

  const stopHeroTimer = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };

  const startHeroTimer = () => {
    stopHeroTimer();
    if (!imagesReady || reducedMotion.matches || pointerPaused || focusPaused || userPaused) return;
    timer = window.setInterval(() => renderHeroSlide(currentSlide + 1), 6000);
  };
  heroInteraction.addEventListener("pointerenter", () => {
    pointerPaused = true;
    stopHeroTimer();
  });
  heroInteraction.addEventListener("pointerleave", () => {
    pointerPaused = false;
    startHeroTimer();
  });
  heroInteraction.addEventListener("focusin", () => {
    focusPaused = true;
    stopHeroTimer();
  });
  heroInteraction.addEventListener("focusout", (event) => {
    if (heroInteraction.contains(event.relatedTarget)) return;
    focusPaused = false;
    startHeroTimer();
  });
  toggle?.addEventListener("click", () => {
    userPaused = !userPaused;
    toggle.setAttribute("aria-label", userPaused ? "Play homepage photographs" : "Pause homepage photographs");
    toggle.setAttribute("aria-pressed", String(userPaused));
    toggle.querySelector("[data-hero-pause]").toggleAttribute("hidden", userPaused);
    toggle.querySelector("[data-hero-play]").toggleAttribute("hidden", !userPaused);
    startHeroTimer();
  });
  const syncMotion = () => {
    if (toggle) toggle.hidden = reducedMotion.matches;
    if (reducedMotion.matches) renderHeroSlide(0);
    startHeroTimer();
  };
  reducedMotion.addEventListener("change", syncMotion);
  syncMotion();
  renderHeroSlide(0);
  const prepareHeroSlides = async () => {
    slideImages.slice(1).forEach((image) => {
      image.loading = "eager";
    });
    await Promise.all(slideImages.map((image) => image.decode().catch(() => {})));
    imagesReady = true;
    startHeroTimer();
  };
  if (document.readyState === "complete") prepareHeroSlides();
  else window.addEventListener("load", prepareHeroSlides, { once: true });
}

const foundationStatements = document.querySelectorAll(".foundation-statements article");

if (foundationStatements.length && "IntersectionObserver" in window) {
  let statementObserver;
  const syncStatementMotion = () => {
    statementObserver?.disconnect();
    foundationStatements.forEach((statement) => {
      statement.classList.remove("statement-reveal", "is-visible");
    });
    if (reducedMotion.matches) return;

    // Observe the stationary article so text transforms cannot retrigger visibility.
    statementObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
        if (isIntersecting && intersectionRatio >= 0.2) {
          target.classList.add("is-visible");
        } else if (!isIntersecting) {
          target.classList.remove("is-visible");
        }
      });
    }, { threshold: [0, 0.2] });

    foundationStatements.forEach((statement) => {
      statement.classList.add("statement-reveal");
      statementObserver.observe(statement);
    });
  };
  reducedMotion.addEventListener("change", syncStatementMotion);
  syncStatementMotion();
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
  let lightboxPointerStartX = null;

  const renderLightbox = (index) => {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCaption.textContent = item.caption;
    lightboxPosition.textContent = `${currentIndex + 1} of ${galleryItems.length}`;
    lightboxImage.classList.remove("is-changing");
    void lightboxImage.offsetWidth;
    lightboxImage.classList.add("is-changing");
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
  lightboxImage.addEventListener("pointerdown", (event) => {
    lightboxPointerStartX = event.clientX;
  });
  lightboxImage.addEventListener("pointerup", (event) => {
    if (lightboxPointerStartX !== null) {
      const distance = event.clientX - lightboxPointerStartX;
      if (Math.abs(distance) >= 50) renderLightbox(currentIndex + (distance < 0 ? 1 : -1));
    }
    lightboxPointerStartX = null;
  });
  lightboxImage.addEventListener("pointercancel", () => {
    lightboxPointerStartX = null;
  });
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

const focusableElements = (container) => [...container.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")].filter((element) => !element.hidden && element.offsetParent !== null);

const keepFocusInDialog = (dialog, event) => {
  if (event.key !== "Tab") return;
  const focusable = focusableElements(dialog);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const requirementsDialog = document.querySelector(".requirements-dialog");

if (requirementsDialog) {
  const requirementButtons = [...document.querySelectorAll("[data-requirements]")];
  const requirementPanels = [...requirementsDialog.querySelectorAll("[data-requirement-panel]")];
  const requirementsClose = requirementsDialog.querySelector(".requirements-close");
  let requirementsReturnFocus = null;

  const closeRequirements = () => requirementsDialog.close();
  requirementButtons.forEach((button) => {
    button.addEventListener("click", () => {
      requirementsReturnFocus = button;
      requirementPanels.forEach((panel) => {
        panel.hidden = panel.dataset.requirementPanel !== button.dataset.requirements;
      });
      document.body.classList.add("dialog-open");
      requirementsDialog.showModal();
      requirementsClose.focus();
    });
  });
  requirementsClose.addEventListener("click", closeRequirements);
  requirementsDialog.addEventListener("click", (event) => {
    if (event.target === requirementsDialog) closeRequirements();
  });
  requirementsDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeRequirements();
  });
  requirementsDialog.addEventListener("keydown", (event) => keepFocusInDialog(requirementsDialog, event));
  requirementsDialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    requirementsReturnFocus?.focus();
  });
}

const applicationDialog = document.querySelector(".application-dialog");

if (applicationDialog) {
  const applyTriggers = [...document.querySelectorAll("[data-apply-trigger]")];
  const applicationClose = applicationDialog.querySelector(".application-close");
  const wizard = applicationDialog.querySelector("[data-application-wizard]");
  const steps = [...wizard.querySelectorAll("[data-application-step]")];
  const stepLabels = [...applicationDialog.querySelectorAll(".application-step-list li")];
  const progress = applicationDialog.querySelector("[data-application-progress]");
  const progressCount = applicationDialog.querySelector("[data-progress-count]");
  const progressTitle = applicationDialog.querySelector("[data-progress-title]");
  const applicationStatus = applicationDialog.querySelector("[data-application-status]");
  const backButton = applicationDialog.querySelector("[data-application-back]");
  const nextButton = applicationDialog.querySelector("[data-application-next]");
  const submitButton = applicationDialog.querySelector("[data-application-submit]");
  const review = applicationDialog.querySelector("[data-application-review]");
  const documentGuidance = applicationDialog.querySelector("[data-document-guidance]");
  const declaration = applicationDialog.querySelector("#application-declaration");
  const completionMessage = applicationDialog.querySelector("[data-application-complete]");
  const intendedForm = applicationDialog.querySelector("#intended-form");
  const sameAddress = applicationDialog.querySelector("#guardian-same-address");
  const learnerAddress = applicationDialog.querySelector("#learner-address");
  const guardianAddress = applicationDialog.querySelector("#guardian-address");
  const useGuardian = applicationDialog.querySelector("#emergency-use-guardian");
  const stepTitles = ["Learner Details", "Entry Details", "Guardian Details", "Emergency Contact", "Documents", "Review"];
  let currentStep = 0;
  let applicationReturnFocus = null;

  steps.forEach((step) => step.querySelector("legend")?.setAttribute("tabindex", "-1"));

  applicationDialog.querySelectorAll(".field-error").forEach((error) => {
    error.id = `${error.dataset.errorFor}-error`;
    const field = applicationDialog.querySelector(`#${error.dataset.errorFor}`);
    field?.setAttribute("aria-describedby", error.id);
  });

  const clearFieldError = (field) => {
    field.removeAttribute("aria-invalid");
    const error = applicationDialog.querySelector(`[data-error-for="${field.id}"]`);
    if (error) error.textContent = "";
  };

  const validateCurrentStep = () => {
    const fields = [...steps[currentStep].querySelectorAll("input, select, textarea")].filter((field) => !field.disabled && field.type !== "checkbox");
    let firstInvalid = null;
    fields.forEach((field) => {
      clearFieldError(field);
      if (!field.checkValidity()) {
        field.setAttribute("aria-invalid", "true");
        const error = applicationDialog.querySelector(`[data-error-for="${field.id}"]`);
        if (error) error.textContent = field.validity.valueMissing ? "This field is required." : field.validationMessage;
        firstInvalid ||= field;
      }
    });
    firstInvalid?.focus();
    if (firstInvalid) applicationStatus.textContent = `Please complete the required fields in ${stepTitles[currentStep]}.`;
    return !firstInvalid;
  };

  const renderDocumentGuidance = () => {
    const form = Number(intendedForm.value);
    if (documentGuidance.dataset.form === intendedForm.value) return;
    documentGuidance.dataset.form = intendedForm.value;
    const checklist = (items) => `<div class="document-checklist">${items.map((item) => `<label class="application-check"><input type="checkbox" data-document-name="${item}"> ${item}</label>`).join("")}</div>`;
    if (form === 1) documentGuidance.innerHTML = `<p>Form 1 document readiness</p>${checklist(["Birth certificate", "Previous-school or results documentation"])}`;
    else if (form >= 2 && form <= 4) documentGuidance.innerHTML = `<p>Forms 2–4 document readiness</p>${checklist(["Transfer letter", "Relevant school or results information"])}`;
    else if (form === 5) documentGuidance.innerHTML = `<p>Verified Form 5 document readiness</p>${checklist(["Birth certificate", "O-Level results"])}`;
    else if (form === 6) documentGuidance.innerHTML = `<p><strong>Contact the school for current Form 6 requirements.</strong> The verified Form 5 requirements are not automatically applied to Form 6.</p>`;
    else documentGuidance.innerHTML = "<p>Select an intended Form in Entry Details to see the relevant checklist.</p>";
  };

  const fieldValue = (id) => applicationDialog.querySelector(`#${id}`)?.value.trim() || "Not provided";
  const escapeHTML = (value) => value.replace(/[&<>'"]/g, (character) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[character]));
  const reviewGroup = (title, step, rows) => `<section class="review-group"><h3>${title}</h3><dl>${rows.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHTML(value)}</dd>`).join("")}</dl><button class="review-edit" type="button" data-edit-step="${step}">Edit ${title}</button></section>`;

  const buildReview = () => {
    const readyDocuments = [...documentGuidance.querySelectorAll("[data-document-name]:checked")].map((item) => item.dataset.documentName);
    review.innerHTML = [
      reviewGroup("Learner Details", 0, [["Surname", fieldValue("learner-surname")], ["Given names", fieldValue("learner-given-names")], ["Gender", fieldValue("learner-gender")], ["Date of birth", fieldValue("learner-date-of-birth")], ["Birth certificate number", fieldValue("learner-birth-certificate")], ["Residential address", fieldValue("learner-address")]]),
      reviewGroup("Entry Details", 1, [["Intended Form", intendedForm.value ? `Form ${intendedForm.value}` : "Not provided"], ["Previous school", fieldValue("previous-school")], ["Previous-school address", fieldValue("previous-school-address")], ["Completed level", fieldValue("completed-level")]]),
      reviewGroup("Guardian Details", 2, [["Full name", fieldValue("guardian-name")], ["Relationship", fieldValue("guardian-relationship")], ["National ID", fieldValue("guardian-id")], ["Primary phone", fieldValue("guardian-phone")], ["Alternative phone", fieldValue("guardian-phone-alternative")], ["Email", fieldValue("guardian-email")], ["Residential address", fieldValue("guardian-address")]]),
      reviewGroup("Emergency Contact", 3, [["Full name", fieldValue("emergency-name")], ["Relationship", fieldValue("emergency-relationship")], ["Phone", fieldValue("emergency-phone")]]),
      reviewGroup("Documents", 4, [["Marked as ready", readyDocuments.length ? readyDocuments.join(", ") : intendedForm.value === "6" ? "Contact school for Form 6 guidance" : "None selected"]])
    ].join("");
  };

  const buildApplicationPayload = () => ({
    learner: {
      surname: fieldValue("learner-surname"),
      givenNames: fieldValue("learner-given-names"),
      gender: fieldValue("learner-gender"),
      dateOfBirth: fieldValue("learner-date-of-birth"),
      birthCertificateNumber: fieldValue("learner-birth-certificate"),
      residentialAddress: fieldValue("learner-address")
    },
    entry: {
      intendedForm: intendedForm.value,
      previousSchool: fieldValue("previous-school"),
      previousSchoolAddress: fieldValue("previous-school-address"),
      completedLevel: fieldValue("completed-level")
    },
    guardian: {
      fullName: fieldValue("guardian-name"),
      relationship: fieldValue("guardian-relationship"),
      nationalId: fieldValue("guardian-id"),
      primaryPhone: fieldValue("guardian-phone"),
      alternativePhone: fieldValue("guardian-phone-alternative"),
      email: fieldValue("guardian-email"),
      residentialAddress: fieldValue("guardian-address")
    },
    emergencyContact: {
      fullName: fieldValue("emergency-name"),
      relationship: fieldValue("emergency-relationship"),
      phone: fieldValue("emergency-phone")
    },
    readyDocuments: [...documentGuidance.querySelectorAll("[data-document-name]:checked")].map((item) => item.dataset.documentName)
  });

  const showStep = (index, moveFocus = true) => {
    completionMessage.hidden = true;
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== currentStep; });
    stepLabels.forEach((label, labelIndex) => {
      if (labelIndex === currentStep) label.setAttribute("aria-current", "step");
      else label.removeAttribute("aria-current");
    });
    progress.value = currentStep + 1;
    progress.textContent = `${currentStep + 1} of ${steps.length}`;
    progressCount.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    progressTitle.textContent = stepTitles[currentStep];
    applicationStatus.textContent = `Step ${currentStep + 1} of ${steps.length}: ${stepTitles[currentStep]}`;
    backButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    if (currentStep === 4) renderDocumentGuidance();
    if (currentStep === 5) buildReview();
    if (moveFocus) steps[currentStep].querySelector("legend")?.focus?.();
    applicationDialog.querySelector(".application-dialog-shell").scrollTo({top: 0, behavior: reducedMotion.matches ? "auto" : "smooth"});
  };

  const syncGuardianAddress = () => {
    if (sameAddress.checked) guardianAddress.value = learnerAddress.value;
    guardianAddress.disabled = sameAddress.checked;
    if (sameAddress.checked) clearFieldError(guardianAddress);
  };
  const syncEmergencyContact = () => {
    const mappings = [["emergency-name", "guardian-name"], ["emergency-relationship", "guardian-relationship"], ["emergency-phone", "guardian-phone"]];
    mappings.forEach(([targetId, sourceId]) => {
      const target = applicationDialog.querySelector(`#${targetId}`);
      if (useGuardian.checked) target.value = fieldValue(sourceId) === "Not provided" ? "" : fieldValue(sourceId);
      target.disabled = useGuardian.checked;
      if (useGuardian.checked) clearFieldError(target);
    });
  };

  const resetApplication = () => {
    wizard.querySelectorAll("input, select, textarea").forEach((field) => {
      if (field.type === "checkbox") field.checked = false;
      else field.value = "";
      field.disabled = false;
      clearFieldError(field);
    });
    delete documentGuidance.dataset.form;
    renderDocumentGuidance();
    review.innerHTML = "";
    completionMessage.hidden = true;
    showStep(0, false);
  };

  const openApplication = (trigger = null) => {
    if (applicationDialog.open) return;
    applicationReturnFocus = trigger || applyTriggers.find((item) => item.offsetParent !== null) || null;
    document.body.classList.add("dialog-open");
    applicationDialog.showModal();
    if (location.hash !== "#apply") history.pushState(null, "", `${location.pathname}${location.search}#apply`);
    applicationClose.focus();
  };
  const closeApplication = () => applicationDialog.close();

  applyTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openApplication(trigger);
    });
  });
  applicationClose.addEventListener("click", closeApplication);
  applicationDialog.addEventListener("click", (event) => {
    if (event.target === applicationDialog) closeApplication();
  });
  applicationDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeApplication();
  });
  applicationDialog.addEventListener("keydown", (event) => keepFocusInDialog(applicationDialog, event));
  applicationDialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    if (location.hash === "#apply") history.replaceState(null, "", `${location.pathname}${location.search}`);
    resetApplication();
    applicationReturnFocus?.focus();
  });
  nextButton.addEventListener("click", () => {
    if (validateCurrentStep()) showStep(currentStep + 1);
  });
  backButton.addEventListener("click", () => showStep(currentStep - 1));
  wizard.addEventListener("input", (event) => {
    if (event.target.matches("input, select, textarea")) clearFieldError(event.target);
    if (event.target === learnerAddress && sameAddress.checked) syncGuardianAddress();
    if (useGuardian.checked && ["guardian-name", "guardian-relationship", "guardian-phone"].includes(event.target.id)) syncEmergencyContact();
  });
  wizard.addEventListener("change", (event) => {
    if (event.target === sameAddress) syncGuardianAddress();
    if (event.target === useGuardian) syncEmergencyContact();
    if (event.target === intendedForm) renderDocumentGuidance();
  });
  review.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit-step]");
    if (edit) showStep(Number(edit.dataset.editStep));
  });
  submitButton.addEventListener("click", () => {
    completionMessage.hidden = true;
    if (!declaration.checked) {
      applicationStatus.textContent = "Confirm that the application information is accurate before finishing the review.";
      declaration.focus();
      return;
    }
    buildApplicationPayload();
    completionMessage.hidden = false;
    applicationStatus.textContent = "Application review complete. No information has been sent or stored.";
    completionMessage.focus?.();
  });
  window.addEventListener("hashchange", () => {
    if (location.hash === "#apply") openApplication();
  });
  resetApplication();
  if (location.hash === "#apply") openApplication();
}

document.querySelectorAll("[data-about-carousel]").forEach((carousel) => {
  const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
  const previous = carousel.querySelector("[data-carousel-previous]");
  const next = carousel.querySelector("[data-carousel-next]");
  const status = carousel.querySelector("[data-carousel-status]");
  const interval = Number(carousel.dataset.autoplay || 0);
  const supportsSwipe = carousel.hasAttribute("data-swipe");
  const pausesOnHold = carousel.hasAttribute("data-hold-pause");
  const pauseReasons = new Set();
  let activeSlide = 0;
  let rotationTimer = null;
  let pointerStartX = null;

  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      const dot = dots[slideIndex];
      if (dot) {
        dot.classList.toggle("is-active", isActive);
        if (isActive) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      }
    });
    if (status) status.textContent = `Image ${activeSlide + 1} of ${slides.length}`;
  };

  const stopRotation = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = null;
  };

  const startRotation = () => {
    stopRotation();
    if (!interval || pauseReasons.size || reducedMotion.matches) return;
    rotationTimer = window.setInterval(() => showSlide(activeSlide + 1), interval);
  };

  const pauseFor = (reason) => {
    pauseReasons.add(reason);
    stopRotation();
  };

  const resumeFrom = (reason) => {
    pauseReasons.delete(reason);
    startRotation();
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startRotation();
    });
  });
  previous?.addEventListener("click", () => showSlide(activeSlide - 1));
  next?.addEventListener("click", () => showSlide(activeSlide + 1));

  carousel.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
    if (pausesOnHold) pauseFor("hold");
  });
  carousel.addEventListener("pointerup", (event) => {
    if (supportsSwipe && pointerStartX !== null) {
      const distance = event.clientX - pointerStartX;
      if (Math.abs(distance) >= 50) showSlide(activeSlide + (distance < 0 ? 1 : -1));
    }
    pointerStartX = null;
    if (pausesOnHold) resumeFrom("hold");
  });
  carousel.addEventListener("pointercancel", () => {
    pointerStartX = null;
    if (pausesOnHold) resumeFrom("hold");
  });
  carousel.addEventListener("pointerleave", () => {
    pointerStartX = null;
    if (pausesOnHold) resumeFrom("hold");
  });
  if (interval) {
    carousel.addEventListener("mouseenter", () => pauseFor("hover"));
    carousel.addEventListener("mouseleave", () => resumeFrom("hover"));
    carousel.addEventListener("focusin", () => pauseFor("focus"));
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) resumeFrom("focus");
    });
    reducedMotion.addEventListener("change", startRotation);
  }
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeSlide + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });
  showSlide(0);
  startRotation();
});
