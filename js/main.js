const header = document.getElementById("header");
const hero = document.querySelector(".hero");
const stickyCta = document.getElementById("sticky-cta");
const contactSection = document.getElementById("contact");

// Header state
function updateHeader() {
  const heroBottom = hero ? hero.offsetHeight : 0;
  const scrolled = window.scrollY > 40;
  const inHero = window.scrollY < heroBottom - 100;
  const menuOpen = document.querySelector(".nav-links.open");

  header.classList.toggle("scrolled", scrolled);
  header.classList.toggle("hero-visible", inHero && !menuOpen);

  if (stickyCta && contactSection) {
    const contactTop = contactSection.offsetTop;
    const showSticky = window.scrollY > heroBottom * 0.6 && window.scrollY < contactTop - 200;
    stickyCta.classList.toggle("visible", showSticky);
  }
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Mobile nav
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.classList.toggle("active", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  updateHeader();
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
    updateHeader();
  });
});

// Scroll reveal
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

document.querySelectorAll(".hero .reveal").forEach((el, i) => {
  el.style.transitionDelay = `${0.2 + i * 0.1}s`;
  requestAnimationFrame(() => el.classList.add("visible"));
});

// Parallax
const parallaxLayers = document.querySelectorAll("[data-parallax]");
let ticking = false;

function updateParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const scrollY = window.scrollY;
  parallaxLayers.forEach((layer) => {
    const speed = parseFloat(layer.dataset.parallax) || 0.2;
    const rect = layer.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const offset = (center - window.innerHeight / 2) * speed * -0.15;
    layer.style.transform = `translate3d(0, ${offset}px, 0)`;
  });

  if (hero && scrollY < hero.offsetHeight) {
    const heroMedia = hero.querySelector(".hero-media");
    if (heroMedia) heroMedia.style.transform = `translate3d(0, ${scrollY * 0.35}px, 0)`;
  }

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });

updateParallax();

// Pipeline animation
const pipeline = document.getElementById("pipeline");
const pipelineFill = document.getElementById("pipeline-fill");
const pipelineDetail = document.getElementById("pipeline-detail");

const pipelineCopy = [
  "Get found where customers search.",
  "Earn confidence in three seconds.",
  "Turn interest into conversations.",
  "Leads arrive already convinced.",
  "Customers become advocates.",
  "Sustainable, compounding growth.",
];

if (pipeline) {
  const steps = pipeline.querySelectorAll(".pipeline-step");
  let activeStep = -1;

  function setPipelineStep(index) {
    if (index === activeStep) return;
    activeStep = index;

    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
      step.classList.toggle("passed", i < index);
    });

    if (pipelineFill) {
      pipelineFill.style.width = `${((index + 1) / steps.length) * 100}%`;
    }

    if (pipelineDetail) {
      pipelineDetail.style.opacity = "0";
      setTimeout(() => {
        pipelineDetail.textContent = pipelineCopy[index] || "";
        pipelineDetail.style.opacity = "1";
      }, 150);
    }
  }

  const pipelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let step = 0;
          setPipelineStep(0);
          const interval = setInterval(() => {
            step++;
            if (step < steps.length) setPipelineStep(step);
            else clearInterval(interval);
          }, 700);
          pipelineObserver.unobserve(pipeline);
        }
      });
    },
    { threshold: 0.35 }
  );

  pipelineObserver.observe(pipeline);
  steps.forEach((step, i) => step.addEventListener("mouseenter", () => setPipelineStep(i)));
}

// Magnetic button hover
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

// FAQ accordion — one open at a time
document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

// Service links → pre-fill focus area on enquiry form
const focusSelect = document.getElementById("focus");

function setFocusArea(serviceId) {
  if (!focusSelect || !serviceId) return;
  const option = focusSelect.querySelector(`option[value="${serviceId}"]`);
  if (!option) return;
  focusSelect.value = serviceId;
  focusSelect.classList.add("prefilled");
}

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    setFocusArea(link.dataset.service);
    sessionStorage.setItem("rc-focus", link.dataset.service);
  });
});

if (focusSelect) {
  const savedFocus = sessionStorage.getItem("rc-focus");
  if (savedFocus) setFocusArea(savedFocus);

  focusSelect.addEventListener("change", () => {
    focusSelect.classList.toggle("prefilled", focusSelect.value !== "");
  });
}

// Contact form → team@rcmarketingtas.com via Resend (Vercel serverless API)
const form = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const FORM_FALLBACK_EMAIL = "team@rcmarketingtas.com";
const FORM_MAILTO = `mailto:${FORM_FALLBACK_EMAIL}?subject=${encodeURIComponent("Website enquiry")}`;

function isFormDevHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/** Same-origin API URL; works on Vercel root deploy and GitHub Pages project subpaths. */
function getFormEndpoint() {
  const override = document.querySelector('meta[name="contact-api"]')?.content?.trim();
  if (override) return override;
  return new URL("api/send-enquiry", window.location.href).href;
}

function logFormDev(label, payload) {
  if (!isFormDevHost()) return;
  console.error(`[contact-form] ${label}`, payload);
}

function messageForFailedSubmit(response, data) {
  if (data?.error) return data.error;

  if (response.status === 404) {
    return `The enquiry form is not available on this host (API not found). Please email ${FORM_FALLBACK_EMAIL} or deploy this site to Vercel with the serverless API enabled.`;
  }

  if (response.status === 503) {
    return `The enquiry form is not set up yet (missing email configuration). Please email ${FORM_FALLBACK_EMAIL}.`;
  }

  if (response.status === 502) {
    return `We could not send your enquiry (email provider error). Please email ${FORM_FALLBACK_EMAIL}.`;
  }

  return `Something went wrong — please try again or email ${FORM_FALLBACK_EMAIL}.`;
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button[type=submit]");
    const btnDefault = btn.innerHTML;
    const endpoint = getFormEndpoint();
    btn.disabled = true;
    btn.textContent = "Sending…";
    formNote.hidden = true;
    formNote.classList.remove("form-note--error");
    formNote.textContent = "Thank you — we'll be in touch shortly.";

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      business: form.business.value.trim(),
      focus: form.focus.value,
      website: form.website?.value?.trim() || "",
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let data = {};
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        logFormDev("submit failed", {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          body: data,
          raw: rawText.slice(0, 500),
        });
        const err = new Error(messageForFailedSubmit(response, data));
        if (data.details && isFormDevHost()) err.details = data.details;
        throw err;
      }

      formNote.hidden = false;
      form.reset();
      focusSelect?.classList.remove("prefilled");
      sessionStorage.removeItem("rc-focus");
      btn.textContent = "Request Sent";
      stickyCta?.classList.remove("visible");
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = btnDefault;
      logFormDev("request error", {
        endpoint: getFormEndpoint(),
        message: err.message,
        details: err.details,
        cause: err.cause,
      });

      let note =
        err.message ||
        `Something went wrong — please try again or email ${FORM_FALLBACK_EMAIL}.`;
      if (err.details && isFormDevHost()) {
        note += ` (${err.details})`;
      }
      formNote.textContent = note;
      formNote.classList.add("form-note--error");
      formNote.hidden = false;

      if (isFormDevHost() && !form.querySelector(".form-fallback-link")) {
        const link = document.createElement("a");
        link.className = "form-fallback-link";
        link.href = FORM_MAILTO;
        link.textContent = `Email ${FORM_FALLBACK_EMAIL} instead`;
        formNote.after(link);
      }
    }
  });
}

// Hero video performance
const heroVideo = document.querySelector(".hero-video");
if (heroVideo) {
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) heroVideo.play().catch(() => {});
        else heroVideo.pause();
      });
    },
    { threshold: 0.1 }
  ).observe(heroVideo);
}
