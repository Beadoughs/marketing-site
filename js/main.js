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

// Contact form
const form = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formNote.hidden = false;
  form.reset();
  focusSelect?.classList.remove("prefilled");
  sessionStorage.removeItem("rc-focus");
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Request Sent";
  stickyCta?.classList.remove("visible");
});

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
