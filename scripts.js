/* ==========================================================================
   Trasteos y Mudanzas San Miguel - Motor Principal Optimizado (v5.0 Senior UI/UX)
   Incluye:
   - Control estricto de scroll y navegación
   - Autoguardado inteligente en sessionStorage (No pierde datos al recargar)
   - Estimador de vehículo furgonado en tiempo real según volumen
   - Despeje automático de botones flotantes al cotizar en móvil
   ========================================================================== */

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function handlePageInitialScroll() {
  const hash = window.location.hash;
  const search = window.location.search;
  const hasCotizadorHash = hash === '#cotizador';
  const hasServiceParam = search.includes('servicio=');

  if (hasCotizadorHash || hasServiceParam) {
    setTimeout(() => {
      const cotizador = document.getElementById('cotizador');
      if (cotizador) {
        cotizador.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  } else if (!hash || hash === '#') {
    window.scrollTo(0, 0);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handlePageInitialScroll);
} else {
  handlePageInitialScroll();
}

document.addEventListener("DOMContentLoaded", () => {
  initStatusChip();
  initFloatingButtonObserver();
  initPendingNotices();
  initHeader();
  initActiveNavSpy();
  initMobileDrawer();
  initScrollReveal();
  initVideoLazyLoad();
  initHeroCounters();
  initTimelineAnimation();
  initGalleryLightbox();
  initSpecializedQuoteWizard();
  initQuickQuoteCards();
  initServiceDirectLinks();
  initCoberturaDropdown();
  initCotizadorViewportWatcher();
});

/* --- 0. Control de Marcadores Pendientes --- */
function initPendingNotices() {
  if (window.APP_CONFIG && window.APP_CONFIG.MOSTRAR_PENDIENTES === true) {
    document.body.classList.add("show-pending");
  } else {
    document.body.classList.remove("show-pending");
  }
}

/* --- 1. Header con reducción al hacer scroll --- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* --- 2. Indicador de Sección Activa --- */
function initActiveNavSpy() {
  const navContainer = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length || !navLinks.length || !navContainer) return;

  let indicator = navContainer.querySelector(".nav-sliding-indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "nav-sliding-indicator";
    indicator.setAttribute("aria-hidden", "true");
    navContainer.appendChild(indicator);
  }

  const updateIndicator = (activeLink) => {
    if (!activeLink) {
      indicator.style.opacity = "0";
      return;
    }
    const containerRect = navContainer.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - containerRect.left;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${linkRect.width}px`;
    indicator.style.opacity = "1";
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          const href = link.getAttribute("href") || "";
          if (href === `#${id}` || href.endsWith(`#${id}`)) {
            link.classList.add("active");
            updateIndicator(link);
          } else if (!href.includes("valle-del-cauca") && !href.includes("nacional")) {
            link.classList.remove("active");
          }
        });
      }
    });
  }, { rootMargin: "-20% 0px -60% 0px" });

  sections.forEach(sec => observer.observe(sec));

  navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => updateIndicator(link));
  });

  navContainer.addEventListener("mouseleave", () => {
    const active = navContainer.querySelector(".nav-link.active");
    updateIndicator(active);
  });

  window.addEventListener("resize", () => {
    const active = navContainer.querySelector(".nav-link.active");
    updateIndicator(active);
  }, { passive: true });

  setTimeout(() => {
    const initialActive = navContainer.querySelector(".nav-link.active") || navLinks[0];
    updateIndicator(initialActive);
  }, 100);
}

/* --- 3. Menú Móvil --- */
function initMobileDrawer() {
  const btn = document.querySelector(".hamburger-btn");
  const drawer = document.querySelector(".mobile-nav-drawer");
  const backdrop = document.getElementById("mobileDrawerBackdrop");
  if (!btn || !drawer) return;

  const openDrawer = () => {
    btn.setAttribute("aria-expanded", "true");
    drawer.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-active");
    document.body.style.overflow = "hidden";
    document.body.classList.add("menu-abierto");
  };

  const closeDrawer = () => {
    btn.setAttribute("aria-expanded", "false");
    drawer.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-active");
    document.body.style.overflow = "";
    document.body.classList.remove("menu-abierto");
  };

  btn.addEventListener("click", () => {
    const isExpanded = btn.getAttribute("aria-expanded") === "true";
    isExpanded ? closeDrawer() : openDrawer();
  });

  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  drawer.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
      btn.focus();
    }
  });
}

/* --- 4. Revelado Escalonado al Scroll --- */
function initScrollReveal() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) {
    document.documentElement.classList.add("js-motion");
    document.body.classList.add("js-motion");
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-reveal], .reveal-on-scroll").forEach(el => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const parent = target.parentElement;
        const siblings = parent ? Array.from(parent.children).filter(c => c.hasAttribute("data-reveal")) : [];
        const index = siblings.indexOf(target);
        const delay = index > 0 ? Math.min(index * 60, 300) : 0;

        target.style.setProperty("--reveal-delay", `${delay}ms`);
        target.classList.add("is-revealed");
        obs.unobserve(target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  const targets = document.querySelectorAll(
    ".section-header, .where-info-card, .bento-card-large, .bento-card-small, .service-card-v52, " +
    ".timeline-step-card, .guarantee-item-card, .factor-card, .review-card, .faq-item, " +
    ".gallery-photo-card, .quote-wizard-card, .additional-services-strip"
  );

  targets.forEach((el) => {
    if (!el.hasAttribute("data-reveal")) {
      el.setAttribute("data-reveal", "up");
    }
    observer.observe(el);
  });
}

/* --- 5. Carga Diferida de Video --- */
function initVideoLazyLoad() {
  const video = document.getElementById("sanMiguelVideo");
  if (!video) return;

  const loadVideoSource = () => {
    const source = video.querySelector("source");
    if (source && source.dataset.src && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadVideoSource();
          observer.disconnect();
        }
      });
    }, { rootMargin: "200px" });
    observer.observe(video);
  }
  video.addEventListener("play", loadVideoSource, { once: true });
}

/* --- 6. Contador Animado en Portada --- */
function initHeroCounters() {
  const statsBar = document.querySelector(".hero-bottom-stats-bar");
  if (!statsBar || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let animated = false;
  const numElem = statsBar.querySelector(".stat-pill-item:first-child .stat-pill-num");
  if (!numElem) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateHeroStat(numElem, 6, "+", " AÑOS");
        observer.disconnect();
      }
    });
  }, { threshold: 0.15 });

  observer.observe(statsBar);
}

function animateHeroStat(element, target, prefix = "+", suffix = " AÑOS") {
  const duration = 800;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.max(1, Math.floor(easeOut * target));
    element.textContent = `${prefix}${current}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = `${prefix}${target}${suffix}`;
    }
  }
  requestAnimationFrame(update);
}

/* --- 7. Animación de Línea de Tiempo --- */
function initTimelineAnimation() {
  const timeline = document.querySelector(".timeline-steps-grid");
  if (!timeline || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        timeline.classList.add("is-active");
        observer.disconnect();
      }
    });
  }, { threshold: 0.25 });

  observer.observe(timeline);
}

/* --- 8. Lightbox Modal para Galería --- */
function initGalleryLightbox() {
  const photoCards = document.querySelectorAll(".gallery-photo-card");
  const modal = document.getElementById("imageLightboxModal");
  const modalImg = document.getElementById("lightboxImage");
  const closeBtn = document.getElementById("lightboxCloseBtn");

  if (!photoCards.length || !modal || !modalImg) return;

  const openModal = (card) => {
    const img = card.querySelector("img");
    if (img) {
      modalImg.src = img.src;
      modalImg.alt = img.alt || "Fotografía de Trasteos San Miguel";
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
  };

  photoCards.forEach(card => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
}

/* --- 9. Enlaces Directos Unificados (Sin duplicación) --- */
function initServiceDirectLinks() {
  document.querySelectorAll('a[data-select-service], .btn-cotizar-service').forEach(btn => {
    btn.addEventListener("click", () => {
      const serviceVal = btn.getAttribute("data-select-service") || btn.getAttribute("data-preselect-service");
      if (serviceVal) {
        selectQueMoverRadio(serviceVal);
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href && href.length > 1 && href !== "#") {
        const targetEl = document.getElementById(href.substring(1));
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

function selectQueMoverRadio(val) {
  const radio = document.querySelector(`input[name="wizQueMover"][value="${val}"]`);
  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

/* --- 10. Ocultar botón de llamada flotante al cotizar en móvil --- */
function initCotizadorViewportWatcher() {
  const cotizador = document.getElementById("cotizador");
  if (!cotizador || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      document.body.classList.toggle("in-cotizador-view", entry.isIntersecting);
    });
  }, { threshold: 0.15 });

  observer.observe(cotizador);
}

/* ==========================================================================
   VALIDACIONES DE ENTRADA
   ========================================================================== */
function validateName(name) {
  const val = String(name || "").trim();
  if (val.length < 6 && val.split(/\s+/).length < 2) return false;
  if (val.toUpperCase() === "SA") return false;
  if (/^([a-zA-ZáéíóúÁÉÍÓÚñÑ])\1+$/i.test(val)) return false;
  const words = val.split(/\s+/).filter(w => w.length > 1);
  return words.length >= 2 || val.length >= 6;
}

function validateColombiaPhone(phone) {
  let clean = String(phone || "").trim().replace(/[\s\-\(\)\.]/g, "");
  if (clean.startsWith("+57")) clean = clean.slice(3);
  else if (clean.startsWith("57") && clean.length === 12) clean = clean.slice(2);
  return /^3\d{9}$/.test(clean);
}

function validateAddress(addr) {
  const str = String(addr || "").trim();
  if (str.length < 5) return false;
  if (!/[aeiouáéíóúAEIOUÁÉÍÓÚ]/i.test(str)) return false;
  if (/([a-zA-Z])\1{3,}/i.test(str)) return false;
  if (/^(sewewewed2|dewdsw565|asdfgh|qwerty|123456)/i.test(str)) return false;

  const prefijosCol = /\b(calle|cl|cll|carrera|cra|kr|cr|avenida|av|diagonal|dg|transversal|tv|circular|manzana|mz|via|vía|km|kilometro|callejon|callejón|autopista)\b/i;
  const tienePrefijo = prefijosCol.test(str);
  const tieneNumero = /\d+/.test(str);
  const palabras = str.split(/[\s,#\-\.\/]+/).filter(w => w.length >= 3 && /[aeiouáéíóú]/i.test(w));
  return (tienePrefijo && tieneNumero) || palabras.length >= 2;
}

function validateCity(city) {
  return String(city || "").trim().length >= 3;
}

function validateFutureDate(dateVal) {
  if (!dateVal) return false;
  const todayStr = new Date().toISOString().split("T")[0];
  return dateVal >= todayStr;
}

function setFieldError(input, errorElement, isError) {
  if (!input || !errorElement) return;
  if (isError) {
    input.classList.add("input-error");
    input.setAttribute("aria-invalid", "true");
    errorElement.style.display = "block";
  } else {
    input.classList.remove("input-error");
    input.removeAttribute("aria-invalid");
    errorElement.style.display = "none";
  }
}

/* ==========================================================================
   MOTOR DEL COTIZADOR EN 4 PASOS (Con Autoguardado y Estimador de Camión)
   ========================================================================== */
function initSpecializedQuoteWizard() {
  const wizardContainer = document.getElementById("quoteWizard");
  if (!wizardContainer) return;

  const wizardType = wizardContainer.getAttribute("data-wizard-type") ||
    (window.location.pathname.includes("nacional") ? "nacional" : "local");
  const isNacional = wizardType === "nacional";
  const storageKey = `sanMiguelQuote_${wizardType}`;

  let currentStep = 1;
  const totalSteps = 4;

  const quoteData = {
    tipoCotizador: isNacional ? "Nacional" : "Local",
    nombre: "",
    telefono: "",
    queMover: "Hogar",
    origenLocal: "",
    origenLat: "",
    origenLng: "",
    tipoOrigenLocal: "Casa",
    pisoOrigenLocal: "1",
    ascensorOrigenLocal: "No aplica",
    accesoOrigenLocal: "Sí",
    destinoLocal: "",
    destinoLat: "",
    destinoLng: "",
    tipoDestinoLocal: "Casa",
    pisoDestinoLocal: "1",
    ascensorDestinoLocal: "No aplica",
    accesoDestinoLocal: "Sí",
    deptoOrigenNac: "Valle del Cauca",
    muniOrigenNac: "Cali",
    barrioOrigenNac: "",
    direccionOrigenNac: "",
    tipoOrigenNac: "Casa",
    pisoOrigenNac: "1",
    ascensorOrigenNac: "No aplica",
    accesoOrigenNac: "Sí",
    deptoDestinoNac: "",
    muniDestinoNac: "",
    barrioDestinoNac: "",
    direccionDestinoNac: "",
    tipoDestinoNac: "Casa",
    pisoDestinoNac: "1",
    ascensorDestinoNac: "No aplica",
    accesoDestinoNac: "Sí",
    maquinaria: {
      tipo: "Panadería o cocina industrial",
      cantidad: 1,
      peso: "",
      medidas: "",
      desarmable: "No, pieza completa",
      ruedas: "No",
      escaleras: "No, paso amplio a nivel",
      pisoAcceso: ""
    },
    fecha: "",
    horario: "Mañana (7:00 a.m. - 12:00 m.)",
    ayudantes: "2 ayudantes + conductor",
    extras: [],
    inventario: {},
    notas: "",
    consent: false
  };

  // Restaurar sesión previa si existe en sessionStorage
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(quoteData, parsed);
    }
  } catch (e) {}

  function saveQuoteSession() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(quoteData));
    } catch (e) {}
  }

  const panes = wizardContainer.querySelectorAll(".wizard-step-pane");
  const nodes = wizardContainer.querySelectorAll(".wizard-step-node");
  const progressFill = wizardContainer.querySelector(".wizard-progress-fill");
  const btnPrev = document.getElementById("wizardBtnPrev");
  const btnNext = document.getElementById("wizardBtnNext");
  const btnSubmit = document.getElementById("wizardBtnSubmit");

  const inputFecha = document.getElementById("wizFecha");
  if (inputFecha) {
    inputFecha.min = new Date().toISOString().split("T")[0];
  }

  // Insertar barra estimadora de vehículo en el Paso 3
  const step3Header = document.querySelector("#stepPane3 .step-pane-header");
  let truckEstimatorEl = document.getElementById("truckEstimatorBadge");
  if (step3Header && !truckEstimatorEl) {
    truckEstimatorEl = document.createElement("div");
    truckEstimatorEl.id = "truckEstimatorBadge";
    truckEstimatorEl.className = "truck-estimator-badge";
    step3Header.insertAdjacentElement("afterend", truckEstimatorEl);
  }

  function getEstimatedTruckSize() {
    if (quoteData.queMover.includes("pequeña")) {
      return "Mini-Furgón / Camioneta Cerrada (1 a 4 objetos)";
    }
    if (quoteData.queMover.includes("Maquinaria")) {
      return "Furgón Técnico Especializado con Sujeción";
    }
    const totalCount = Object.values(quoteData.inventario || {}).reduce((acc, n) => acc + (parseInt(n, 10) || 0), 0);
    if (totalCount === 0) return "Selecciona tus objetos para sugerir el furgón ideal";
    if (totalCount <= 5) return `Furgón Ligero NHR (${totalCount} ítems seleccionados)`;
    if (totalCount <= 14) return `Camión Furgonado Mediano NKR (${totalCount} ítems seleccionados)`;
    return `Camión Furgonado Grande NPR / Gran Volumen (${totalCount} ítems seleccionados)`;
  }

  function updateTruckEstimatorUI() {
    if (!truckEstimatorEl) return;
    const recommendation = getEstimatedTruckSize();
    truckEstimatorEl.innerHTML = `
      <div class="truck-estimator-info">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span>Vehículo sugerido: <strong>${escapeHTML(recommendation)}</strong></span>
      </div>
      <button type="button" class="btn-reset-quote" id="btnResetInventory">Limpiar lista</button>
    `;
    document.getElementById("btnResetInventory")?.addEventListener("click", () => {
      quoteData.inventario = {};
      wizardContainer.querySelectorAll(".counter-val").forEach(el => el.textContent = "0");
      updatePequenaCounterLimit();
      updateTruckEstimatorUI();
      renderWizardSummary();
      saveQuoteSession();
    });
  }

  // Hidratar campos si había sesión guardada
  const nombreEl = document.getElementById("wizNombre");
  const telEl = document.getElementById("wizTelefono");
  if (nombreEl && quoteData.nombre) nombreEl.value = quoteData.nombre;
  if (telEl && quoteData.telefono) telEl.value = quoteData.telefono;

  Object.entries(quoteData.inventario || {}).forEach(([itemName, count]) => {
    const btnPlus = wizardContainer.querySelector(`.btn-counter[data-item="${itemName}"]`);
    if (btnPlus) {
      const key = btnPlus.getAttribute("data-item-key");
      const countSpan = document.getElementById(`count-${key}`);
      if (countSpan) countSpan.textContent = String(count);
    }
  });

  // Preselección por parámetro URL
  const urlParams = new URLSearchParams(window.location.search);
  const paramServicio = urlParams.get("servicio");
  if (paramServicio) {
    let serviceValue = "Hogar";
    if (paramServicio === "empresa") serviceValue = "Oficina o empresa";
    else if (paramServicio === "pequena" || paramServicio === "expres") serviceValue = "Mudanza pequeña (hasta 4 objetos)";
    else if (paramServicio === "maquinaria") serviceValue = "Maquinaria o equipos";
    quoteData.queMover = serviceValue;
  }

  const initialRadio = wizardContainer.querySelector(`input[name="wizQueMover"][value="${quoteData.queMover}"]`);
  if (initialRadio) {
    initialRadio.checked = true;
    wizardContainer.querySelectorAll(".que-mover-card").forEach(c => c.classList.remove("selected"));
    initialRadio.closest(".que-mover-card")?.classList.add("selected");
  }

  function initElevatorControls() {
    const placeSelects = wizardContainer.querySelectorAll(".place-type-select");
    const floorSelects = wizardContainer.querySelectorAll(".floor-select");

    function updateElevatorState(targetSuffix) {
      const typeSelect = wizardContainer.querySelector(`.place-type-select[data-target="${targetSuffix}"]`);
      const floorSelect = wizardContainer.querySelector(`.floor-select[data-target="${targetSuffix}"]`);
      const elevatorGroup = document.getElementById(`grpAscensor${targetSuffix}`);
      if (!typeSelect || !floorSelect || !elevatorGroup) return;

      const isEligibleType = typeSelect.value === "Apartamento" || typeSelect.value === "Oficina o local";
      const isFloor2Plus = floorSelect.value !== "1";

      if (isEligibleType && isFloor2Plus) {
        elevatorGroup.style.display = "block";
      } else {
        elevatorGroup.style.display = "none";
        const elevatorSelect = document.getElementById(`wizAscensor${targetSuffix}`);
        if (elevatorSelect) elevatorSelect.value = "No aplica";
      }
    }

    placeSelects.forEach(sel => sel.addEventListener("change", () => updateElevatorState(sel.getAttribute("data-target"))));
    floorSelects.forEach(sel => sel.addEventListener("change", () => updateElevatorState(sel.getAttribute("data-target"))));
    ["OrigenLocal", "DestinoLocal", "OrigenNac", "DestinoNac"].forEach(updateElevatorState);
  }

  initElevatorControls();

  function syncItemsPaneWithService(service) {
    const paneHogar = document.getElementById("paneItemsHogar");
    const paneEmpresa = document.getElementById("paneItemsEmpresa");
    const panePequena = document.getElementById("paneItemsPequena");
    const paneMaquinaria = document.getElementById("paneItemsMaquinaria");
    const customItemWrap = document.getElementById("customItemContainer");

    if (paneHogar) paneHogar.style.display = "none";
    if (paneEmpresa) paneEmpresa.style.display = "none";
    if (panePequena) panePequena.style.display = "none";
    if (paneMaquinaria) paneMaquinaria.style.display = "none";

    if (service === "Hogar") {
      if (paneHogar) paneHogar.style.display = "block";
      if (customItemWrap) customItemWrap.style.display = "block";
    } else if (service === "Oficina o empresa") {
      if (paneEmpresa) paneEmpresa.style.display = "block";
      if (customItemWrap) customItemWrap.style.display = "block";
    } else if (service.includes("pequeña")) {
      if (panePequena) panePequena.style.display = "block";
      if (customItemWrap) customItemWrap.style.display = "none";
      updatePequenaCounterLimit();
    } else if (service.includes("Maquinaria")) {
      if (paneMaquinaria) paneMaquinaria.style.display = "block";
      if (customItemWrap) customItemWrap.style.display = "none";
    }
    updateTruckEstimatorUI();
  }

  function syncPlaceTypesWithService(service) {
    let defaultPlace = "Casa";
    if (service === "Oficina o empresa") defaultPlace = "Oficina o local";
    else if (service.includes("Maquinaria")) defaultPlace = "Bodega";

    const placeSelects = wizardContainer.querySelectorAll(".place-type-select");
    placeSelects.forEach(sel => {
      if (Array.from(sel.options).some(opt => opt.value === defaultPlace)) {
        sel.value = defaultPlace;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  const queMoverCards = wizardContainer.querySelectorAll('.que-mover-card');
  queMoverCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    card.addEventListener("click", () => {
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    if (radio) {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          queMoverCards.forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          quoteData.queMover = radio.value;
          syncItemsPaneWithService(radio.value);
          syncPlaceTypesWithService(radio.value);
          renderWizardSummary();
          saveQuoteSession();
        }
      });
    }
  });

  syncItemsPaneWithService(quoteData.queMover);

  function setupAddressBlurConfirmation() {
    const addrInputs = wizardContainer.querySelectorAll("#wizOrigenLocal, #wizDestinoLocal, #wizDireccionOrigenNac, #wizDireccionDestinoNac");
    addrInputs.forEach(input => {
      const errEl = document.getElementById(input.getAttribute("aria-describedby") || ("err" + input.id.replace("wiz", "")));
      input.addEventListener("blur", () => {
        const val = input.value.trim();
        let confirmBox = document.getElementById(`confirm-${input.id}`);
        if (!confirmBox) {
          confirmBox = document.createElement("div");
          confirmBox.id = `confirm-${input.id}`;
          confirmBox.className = "addr-confirm-box";
          input.parentNode.appendChild(confirmBox);
        }

        if (validateAddress(val)) {
          const formatted = val.charAt(0).toUpperCase() + val.slice(1);
          confirmBox.innerHTML = `✓ Dirección verificada: <strong>${escapeHTML(formatted)}</strong>`;
          confirmBox.style.display = "flex";
          if (errEl) errEl.style.display = "none";
          input.classList.remove("input-error");
        } else {
          confirmBox.style.display = "none";
          if (val.length > 0 && errEl) {
            errEl.style.display = "block";
            input.classList.add("input-error");
          }
        }
        renderWizardSummary();
        saveQuoteSession();
      });
      input.addEventListener("input", () => renderWizardSummary());
    });
  }

  setupAddressBlurConfirmation();

  ['wizFecha', 'wizHorario', 'wizAyudantes', 'wizExtraEmbalaje', 'wizExtraDesarme'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        if (id === 'wizFecha') quoteData.fecha = el.value;
        if (id === 'wizHorario') quoteData.horario = el.value;
        if (id === 'wizAyudantes') quoteData.ayudantes = el.value;
        renderWizardSummary();
        saveQuoteSession();
      });
    }
  });

  // Tabs de categorías en Hogar
  const catTabs = wizardContainer.querySelectorAll(".cat-tab-btn");
  const groupPanes = wizardContainer.querySelectorAll(".items-group-pane");
  catTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      catTabs.forEach(t => t.classList.remove("active"));
      groupPanes.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const cat = tab.getAttribute("data-category");
      document.getElementById(`pane-${cat}`)?.classList.add("active");
    });
  });

  // Contadores de objetos
  wizardContainer.querySelectorAll(".btn-counter:not(.btn-counter-pequena)").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const itemKey = btn.getAttribute("data-item-key");
      const itemName = btn.getAttribute("data-item");
      const countEl = document.getElementById(`count-${itemKey}`);
      if (!countEl) return;

      let current = parseInt(countEl.textContent, 10) || 0;
      current = action === "plus" ? Math.min(current + 1, 99) : Math.max(current - 1, 0);
      countEl.textContent = current;
      quoteData.inventario[itemName] = current;
      updateTruckEstimatorUI();
      renderWizardSummary();
      saveQuoteSession();
    });
  });

  function updatePequenaCounterLimit() {
    const pequenaRows = wizardContainer.querySelectorAll("#paneItemsPequena .item-counter-row");
    let totalPequena = 0;
    pequenaRows.forEach(row => {
      totalPequena += parseInt(row.querySelector(".counter-val")?.textContent, 10) || 0;
    });

    const countValDisplay = document.getElementById("pequenaCountVal");
    if (countValDisplay) countValDisplay.textContent = totalPequena;

    const limitBadge = document.getElementById("pequenaLimitBadge");
    const warningBanner = document.getElementById("pequenaWarningBanner");
    const plusButtons = wizardContainer.querySelectorAll("#paneItemsPequena button[data-action='plus']");

    const reached = totalPequena >= 4;
    limitBadge?.classList.toggle("limit-reached", reached);
    warningBanner?.classList.toggle("visible", reached);
    plusButtons.forEach(b => b.disabled = reached);
    return totalPequena;
  }

  wizardContainer.querySelectorAll(".btn-counter-pequena").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const itemKey = btn.getAttribute("data-item-key");
      const itemName = btn.getAttribute("data-item");
      const countEl = document.getElementById(`count-${itemKey}`);
      if (!countEl) return;

      let current = parseInt(countEl.textContent, 10) || 0;
      const currentTotal = updatePequenaCounterLimit();

      if (action === "plus" && currentTotal < 4) current += 1;
      else if (action === "minus") current = Math.max(current - 1, 0);

      countEl.textContent = current;
      quoteData.inventario[itemName] = current;
      updatePequenaCounterLimit();
      updateTruckEstimatorUI();
      renderWizardSummary();
      saveQuoteSession();
    });
  });

  // Objeto personalizado
  const btnAddCustom = document.getElementById("btnAddCustomItem");
  const inputCustom = document.getElementById("customItemName");
  const customList = document.getElementById("customItemsList");
  if (btnAddCustom && inputCustom && customList) {
    btnAddCustom.addEventListener("click", () => {
      const name = inputCustom.value.trim();
      if (!name) return;
      const key = "custom_" + Date.now();
      quoteData.inventario[name] = 1;

      const itemRow = document.createElement("div");
      itemRow.className = "item-counter-row";
      itemRow.style.marginTop = "0.5rem";
      itemRow.innerHTML = `
        <span class="item-name">${escapeHTML(name)}</span>
        <div class="counter-controls">
          <button type="button" class="btn-counter" data-action="minus">−</button>
          <span class="counter-val" id="count-${key}">1</span>
          <button type="button" class="btn-counter" data-action="plus">+</button>
        </div>
      `;

      itemRow.querySelector('[data-action="plus"]').addEventListener("click", () => {
        let val = Math.min((parseInt(document.getElementById(`count-${key}`).textContent, 10) || 1) + 1, 99);
        document.getElementById(`count-${key}`).textContent = val;
        quoteData.inventario[name] = val;
        updateTruckEstimatorUI();
        renderWizardSummary();
        saveQuoteSession();
      });

      itemRow.querySelector('[data-action="minus"]').addEventListener("click", () => {
        let val = Math.max((parseInt(document.getElementById(`count-${key}`).textContent, 10) || 1) - 1, 0);
        document.getElementById(`count-${key}`).textContent = val;
        quoteData.inventario[name] = val;
        if (val === 0) itemRow.remove();
        updateTruckEstimatorUI();
        renderWizardSummary();
        saveQuoteSession();
      });

      customList.appendChild(itemRow);
      inputCustom.value = "";
      updateTruckEstimatorUI();
      renderWizardSummary();
      saveQuoteSession();
    });
  }

  initGooglePlacesAutocomplete(isNacional);

  btnNext.addEventListener("click", () => {
    if (!validateCurrentStep(currentStep)) return;
    saveQuoteSession();
    if (currentStep < totalSteps) {
      currentStep++;
      updateWizardView("forward");
    }
  });

  btnPrev.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizardView("backward");
    }
  });

  function validateCurrentStep(step) {
    if (step === 1) {
      const nombreInput = document.getElementById("wizNombre");
      const telInput = document.getElementById("wizTelefono");
      const isNameValid = validateName(nombreInput?.value);
      const isTelValid = validateColombiaPhone(telInput?.value);

      setFieldError(nombreInput, document.getElementById("errNombre"), !isNameValid);
      setFieldError(telInput, document.getElementById("errTelefono"), !isTelValid);

      if (!isNameValid) { nombreInput?.focus(); return false; }
      if (!isTelValid) { telInput?.focus(); return false; }

      quoteData.nombre = nombreInput.value.trim();
      quoteData.telefono = telInput.value.trim();
      return true;
    }

    if (step === 2) {
      if (isNacional) {
        const muniOrigen = document.getElementById("wizMuniOrigenNac");
        const barrioOrigen = document.getElementById("wizBarrioOrigenNac");
        const dirOrigen = document.getElementById("wizDireccionOrigenNac");
        const deptoDestino = document.getElementById("wizDeptoDestinoNac");
        const muniDestino = document.getElementById("wizMuniDestinoNac");
        const dirDestino = document.getElementById("wizDireccionDestinoNac");

        const validMuniOri = validateCity(muniOrigen?.value);
        const validBarrioOri = (barrioOrigen?.value || "").trim().length >= 3;
        const validDirOri = validateAddress(dirOrigen?.value);
        const validDeptoDes = !!deptoDestino?.value;
        const validMuniDes = validateCity(muniDestino?.value);
        const validDirDes = validateAddress(dirDestino?.value);

        setFieldError(muniOrigen, document.getElementById("errMuniOrigenNac"), !validMuniOri);
        setFieldError(barrioOrigen, document.getElementById("errBarrioOrigenNac"), !validBarrioOri);
        setFieldError(dirOrigen, document.getElementById("errDireccionOrigenNac"), !validDirOri);
        setFieldError(deptoDestino, document.getElementById("errDeptoDestinoNac"), !validDeptoDes);
        setFieldError(muniDestino, document.getElementById("errMuniDestinoNac"), !validMuniDes);
        setFieldError(dirDestino, document.getElementById("errDireccionDestinoNac"), !validDirDes);

        if (!validMuniOri) { muniOrigen?.focus(); return false; }
        if (!validBarrioOri) { barrioOrigen?.focus(); return false; }
        if (!validDirOri) { dirOrigen?.focus(); return false; }
        if (!validDeptoDes) { deptoDestino?.focus(); return false; }
        if (!validMuniDes) { muniDestino?.focus(); return false; }
        if (!validDirDes) { dirDestino?.focus(); return false; }

        quoteData.muniOrigenNac = muniOrigen.value.trim();
        quoteData.barrioOrigenNac = barrioOrigen.value.trim();
        quoteData.direccionOrigenNac = dirOrigen.value.trim();
        quoteData.tipoOrigenNac = document.getElementById("wizTipoOrigenNac")?.value || "Casa";
        quoteData.pisoOrigenNac = document.getElementById("wizPisoOrigenNac")?.value || "1";
        quoteData.ascensorOrigenNac = document.getElementById("wizAscensorOrigenNac")?.value || "No aplica";
        quoteData.accesoOrigenNac = document.getElementById("wizAccesoOrigenNac")?.value || "Sí";

        quoteData.deptoDestinoNac = deptoDestino.value;
        quoteData.muniDestinoNac = muniDestino.value.trim();
        quoteData.barrioDestinoNac = document.getElementById("wizBarrioDestinoNac")?.value.trim() || "Por definir";
        quoteData.direccionDestinoNac = dirDestino.value.trim();
        quoteData.tipoDestinoNac = document.getElementById("wizTipoDestinoNac")?.value || "Casa";
        quoteData.pisoDestinoNac = document.getElementById("wizPisoDestinoNac")?.value || "1";
        quoteData.ascensorDestinoNac = document.getElementById("wizAscensorDestinoNac")?.value || "No aplica";
        quoteData.accesoDestinoNac = document.getElementById("wizAccesoDestinoNac")?.value || "Sí";
      } else {
        const origenInput = document.getElementById("wizOrigenLocal");
        const destinoInput = document.getElementById("wizDestinoLocal");
        const isOrigenValid = validateAddress(origenInput?.value);
        const isDestinoValid = validateAddress(destinoInput?.value);

        setFieldError(origenInput, document.getElementById("errOrigenLocal"), !isOrigenValid);
        setFieldError(destinoInput, document.getElementById("errDestinoLocal"), !isDestinoValid);

        if (!isOrigenValid) { origenInput?.focus(); return false; }
        if (!isDestinoValid) { destinoInput?.focus(); return false; }

        quoteData.origenLocal = origenInput.value.trim();
        quoteData.tipoOrigenLocal = document.getElementById("wizTipoOrigenLocal")?.value || "Casa";
        quoteData.pisoOrigenLocal = document.getElementById("wizPisoOrigenLocal")?.value || "1";
        quoteData.ascensorOrigenLocal = document.getElementById("wizAscensorOrigenLocal")?.value || "No aplica";
        quoteData.accesoOrigenLocal = document.getElementById("wizCamionEntraOrigenLocal")?.value || "Sí";

        quoteData.destinoLocal = destinoInput.value.trim();
        quoteData.tipoDestinoLocal = document.getElementById("wizTipoDestinoLocal")?.value || "Casa";
        quoteData.pisoDestinoLocal = document.getElementById("wizPisoDestinoLocal")?.value || "1";
        quoteData.ascensorDestinoLocal = document.getElementById("wizAscensorDestinoLocal")?.value || "No aplica";
        quoteData.accesoDestinoLocal = document.getElementById("wizCamionEntraDestinoLocal")?.value || "Sí";
      }
      return true;
    }

    if (step === 3 && quoteData.queMover === "Maquinaria o equipos") {
      quoteData.maquinaria.tipo = document.getElementById("wizMaqTipo")?.value || "Maquinaria comercial";
      quoteData.maquinaria.cantidad = document.getElementById("wizMaqCantidad")?.value || 1;
      quoteData.maquinaria.peso = document.getElementById("wizMaqPeso")?.value || "";
      quoteData.maquinaria.medidas = document.getElementById("wizMaqMedidas")?.value || "";
      quoteData.maquinaria.desarmable = document.getElementById("wizMaqDesarmable")?.value || "No, pieza completa";
      quoteData.maquinaria.ruedas = document.getElementById("wizMaqRuedas")?.value || "No";
      quoteData.maquinaria.escaleras = document.getElementById("wizMaqEscaleras")?.value || "No, paso amplio a nivel";
      quoteData.maquinaria.pisoAcceso = document.getElementById("wizMaqPisoAcceso")?.value || "";
    }
    return true;
  }

  function updateWizardView(direction = "forward") {
    panes.forEach(p => p.classList.remove("active", "slide-forward", "slide-backward"));
    const currentPane = document.getElementById(`stepPane${currentStep}`);
    if (currentPane) {
      currentPane.classList.add("active", direction === "forward" ? "slide-forward" : "slide-backward");
    }

    const progressPercentages = { 1: 25, 2: 50, 3: 75, 4: 100 };
    const pct = progressPercentages[currentStep] || 25;
    if (progressFill) {
      progressFill.style.width = `${pct}%`;
      progressFill.style.setProperty("--progreso", String(pct / 100));
    }

    nodes.forEach((node, idx) => {
      const stepNum = idx + 1;
      if (stepNum === currentStep) {
        node.setAttribute("aria-current", "step");
        node.classList.add("is-current", "active");
        node.classList.remove("is-passed", "is-future");
        node.onclick = null;
      } else if (stepNum < currentStep) {
        node.removeAttribute("aria-current");
        node.classList.add("is-passed", "active");
        node.classList.remove("is-current", "is-future");
        node.style.cursor = "pointer";
        node.onclick = () => {
          currentStep = stepNum;
          updateWizardView("backward");
        };
      } else {
        node.removeAttribute("aria-current");
        node.classList.add("is-future");
        node.classList.remove("is-current", "is-passed", "active");
        node.onclick = null;
      }
    });

    btnPrev.hidden = (currentStep === 1);
    btnNext.hidden = (currentStep === totalSteps);
    btnSubmit.hidden = (currentStep !== totalSteps);
    const actionsBar = wizardContainer.querySelector(".quote-actions");
    if (actionsBar) actionsBar.dataset.step = String(currentStep);

    updateTruckEstimatorUI();
    renderWizardSummary();
    if (currentStep === totalSteps) syncConsentState();
  }

  function renderWizardSummary() {
    const summaryBox = document.getElementById("quoteSummaryContent");
    if (!summaryBox) return;

    const solicitanteText = (quoteData.nombre || quoteData.telefono)
      ? `${escapeHTML(quoteData.nombre || "Pendiente")} · ${escapeHTML(quoteData.telefono || "Pendiente")}`
      : "Pendiente";

    const recogidaText = isNacional
      ? `${quoteData.muniOrigenNac}${quoteData.barrioOrigenNac ? `, ${quoteData.barrioOrigenNac}` : ""}${quoteData.direccionOrigenNac ? ` - ${quoteData.direccionOrigenNac}` : ""}`
      : (quoteData.origenLocal || "Falta ingresar dirección");

    const entregaText = isNacional
      ? (quoteData.muniDestinoNac ? `${quoteData.muniDestinoNac}, ${quoteData.deptoDestinoNac} (${quoteData.direccionDestinoNac})` : "Destino nacional por definir")
      : (quoteData.destinoLocal || "Falta ingresar dirección");

    let itemsText = "";
    if (quoteData.queMover === "Maquinaria o equipos") {
      const m = quoteData.maquinaria;
      itemsText = `${m.tipo} (${m.cantidad} unid)${m.peso ? ` · ${m.peso} kg` : ""}`;
    } else {
      const activeItems = Object.entries(quoteData.inventario || {})
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => `${name} (${count})`)
        .join(", ");
      itemsText = activeItems || "A coordinar por WhatsApp";
    }

    const fechaInputVal = document.getElementById("wizFecha")?.value || quoteData.fecha;
    const fechaHTML = fechaInputVal
      ? `<strong>${escapeHTML(fechaInputVal)}</strong>`
      : `<span style="color: #DC2626; font-weight: 700;">Falta elegir fecha</span>`;

    summaryBox.innerHTML = `
      <div class="summary-list">
        <div class="summary-row"><span class="summary-label">Solicitante:</span><span class="summary-value">${solicitanteText}</span></div>
        <div class="summary-row"><span class="summary-label">Servicio:</span><span class="summary-value">${escapeHTML(quoteData.queMover)}</span></div>
        <div class="summary-row"><span class="summary-label">Vehículo sugerido:</span><span class="summary-value">${escapeHTML(getEstimatedTruckSize())}</span></div>
        <div class="summary-row"><span class="summary-label">Recogida:</span><span class="summary-value">${escapeHTML(recogidaText)}</span></div>
        <div class="summary-row"><span class="summary-label">Entrega:</span><span class="summary-value">${escapeHTML(entregaText)}</span></div>
        <div class="summary-row"><span class="summary-label">Objetos:</span><span class="summary-value">${escapeHTML(itemsText)}</span></div>
        <div class="summary-row"><span class="summary-label">Fecha estimada:</span><span class="summary-value">${fechaHTML}</span></div>
      </div>
      <div class="summary-actions-row">
        <button type="button" class="btn btn--sm btn--secondary" id="btnEditQuoteData">Modificar datos</button>
      </div>
    `;

    document.getElementById("btnEditQuoteData")?.addEventListener("click", () => {
      currentStep = 1;
      updateWizardView("backward");
    });
  }

  const consentBox = document.getElementById("wizConsent");
  const consentHint = document.getElementById("quoteConsentHint");
  function syncConsentState() {
    const ok = !!consentBox?.checked;
    btnSubmit.disabled = !ok;
    btnSubmit.setAttribute("aria-disabled", String(!ok));
    if (consentHint) {
      consentHint.textContent = ok
        ? "Listo: al pulsar Enviar se abrirá WhatsApp con tu cotización."
        : "Marca la casilla de tratamiento de datos para habilitar el envío.";
      consentHint.classList.toggle("is-ok", ok);
    }
  }
  consentBox?.addEventListener("change", syncConsentState);

  btnSubmit.addEventListener("click", () => {
    if (btnSubmit.classList.contains("is-loading")) return;
    const fechaInput = document.getElementById("wizFecha");
    const isFechaValid = validateFutureDate(fechaInput?.value);
    setFieldError(fechaInput, document.getElementById("errFecha"), !isFechaValid);
    if (!isFechaValid) { fechaInput?.focus(); return; }

    if (!consentBox?.checked) {
      document.getElementById("errConsent").style.display = "block";
      consentBox?.focus();
      return;
    }

    quoteData.fecha = fechaInput.value;
    quoteData.horario = document.getElementById("wizHorario")?.value || "Mañana";
    quoteData.ayudantes = document.getElementById("wizAyudantes")?.value || "2 ayudantes + conductor";
    quoteData.extras = [];
    if (document.getElementById("wizExtraEmbalaje")?.checked) quoteData.extras.push("Protección con papel vitafilm");
    if (document.getElementById("wizExtraDesarme")?.checked) quoteData.extras.push("Desarme y armado de muebles");
    quoteData.notas = document.getElementById("wizNotas")?.value.trim() || "";

    btnSubmit.classList.add("is-loading");
    const messageText = generateBloqueGWhatsAppText(quoteData, isNacional);
    const waPhone = window.APP_CONFIG?.PHONE_RAW || "573217676571";
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(messageText)}`;

    sessionStorage.removeItem(storageKey);

    setTimeout(() => {
      btnSubmit.classList.remove("is-loading");
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }, 200);
  });

  updateWizardView("forward");
}

function initGooglePlacesAutocomplete(isNacional) {
  const apiKey = window.APP_CONFIG?.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("[PENDIENTE")) return;
}

function formatSpanishDate(dateStr, horario) {
  if (!dateStr) return "Por convenir";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return `${days[date.getDay()]} ${d} de ${months[m - 1]} de ${y} (${horario})`;
  } catch (e) {
    return dateStr;
  }
}

function generateBloqueGWhatsAppText(data, isNacional) {
  const lineas = [];
  lineas.push(isNacional
    ? "Hola, quiero cotizar una mudanza nacional con San Miguel."
    : "Hola, quiero cotizar una mudanza local en Cali y Valle con San Miguel.");
  lineas.push(`*Nombre:* ${data.nombre}`);
  lineas.push(`*Celular:* ${data.telefono}`);
  lineas.push(`*Servicio:* ${data.queMover}`);

  const recogidaStr = isNacional
    ? `${data.direccionOrigenNac}, barrio ${data.barrioOrigenNac}, ${data.muniOrigenNac}, ${data.tipoOrigenNac} (Piso ${data.pisoOrigenNac})`
    : `${data.origenLocal}, Cali/Valle, ${data.tipoOrigenLocal} (Piso ${data.pisoOrigenLocal})`;
  lineas.push(`*Recogida:* ${recogidaStr}`);

  const entregaStr = isNacional
    ? `${data.direccionDestinoNac}, barrio ${data.barrioDestinoNac}, ${data.muniDestinoNac} (${data.deptoDestinoNac}), ${data.tipoDestinoNac} (Piso ${data.pisoDestinoNac})`
    : `${data.destinoLocal}, Cali/Valle, ${data.tipoDestinoLocal} (Piso ${data.pisoDestinoLocal})`;
  lineas.push(`*Entrega:* ${entregaStr}`);

  lineas.push(`*Fecha:* ${formatSpanishDate(data.fecha, data.horario)}`);
  lineas.push(`*Ayudantes:* ${data.ayudantes}`);
  lineas.push(`*Extras:* ${data.extras.length ? data.extras.join(", ") : "Ninguno"}`);

  const items = Object.entries(data.inventario || {}).filter(([_, c]) => c > 0).map(([k, c]) => `${k} (${c})`);
  lineas.push(`*Objetos:* ${items.length ? items.join(", ") : "A detallar por chat"}`);
  if (data.notas) lineas.push(`*Notas:* ${data.notas}`);
  lineas.push("¿Me pueden indicar el valor y la disponibilidad?");
  return lineas.join("\n");
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function initQuickQuoteCards() {}

function initCoberturaDropdown() {
  const btn = document.getElementById('coberturaDropdownBtn');
  if (!btn) return;
  const menu = btn.parentElement.querySelector('.dropdown-menu');
  if (!menu) return;

  const toggle = (open) => {
    const isOpen = typeof open === 'boolean' ? open : !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  };

  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) toggle(false);
  });
}


/* ==========================================================================
   V6: MICROINTERACCIONES, CHIP DE ESTADO Y BOTONES FLOTANTES INTELIGENTES
   ========================================================================== */

/**
 * Chip de estado sobre el título del Hero
 * Lee HORARIO de config.js (window.APP_CONFIG.HORARIO)
 * Si no está configurado (hoy es así): 'Cotización gratis por WhatsApp'
 * Si está configurado: 'Atendiendo ahora' o 'Te respondemos por WhatsApp'
 */
function initStatusChip() {
  const chipTexts = document.querySelectorAll('.status-chip-text');
  if (!chipTexts.length) return;

  const config = window.APP_CONFIG || {};
  const horario = config.HORARIO;
  let text = 'Cotización gratis por WhatsApp';

  if (horario && Array.isArray(horario.dias) && typeof horario.abre === 'number' && typeof horario.cierra === 'number') {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + (now.getMinutes() / 60);
    const isOpen = horario.dias.includes(day) && (hour >= horario.abre && hour < horario.cierra);
    text = isOpen ? 'Atendiendo ahora' : 'Te respondemos por WhatsApp';
  }

  chipTexts.forEach(el => {
    el.textContent = text;
    const dot = el.parentElement.querySelector('.status-chip-dot');
    if (dot) dot.setAttribute('aria-label', text);
  });
}

/**
 * Observador de visibilidad para botón flotante de WhatsApp
 * Se desvanece y desactiva (pointer-events: none) cuando están en pantalla:
 * - El cotizador (#cotizador)
 * - Los botones de acción del Hero (.hero-v5-actions)
 * - El llamado a la acción final (.cta-banner-photo)
 * - El menú móvil abierto
 */
function initFloatingButtonObserver() {
  const fabContainer = document.querySelector('.floating-actions-container');
  if (!fabContainer) return;

  const targets = [];
  const cotizador = document.getElementById('cotizador');
  if (cotizador) targets.push(cotizador);

  const heroActions = document.querySelector('.hero-v5-actions');
  if (heroActions) targets.push(heroActions);

  const ctaFinal = document.querySelector('.cta-banner-photo');
  if (ctaFinal) targets.push(ctaFinal);

  const intersectingTargets = new Set();

  function updateFabVisibility() {
    const mobileDrawer = document.getElementById('mobileDrawer');
    const isMenuOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');
    if (intersectingTargets.size > 0 || isMenuOpen) {
      fabContainer.classList.add('is-hidden');
    } else {
      fabContainer.classList.remove('is-hidden');
    }
  }

  if ('IntersectionObserver' in window && targets.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          intersectingTargets.add(entry.target);
        } else {
          intersectingTargets.delete(entry.target);
        }
      });
      updateFabVisibility();
    }, {
      root: null,
      threshold: 0.05
    });

    targets.forEach(t => observer.observe(t));
  }

  // Observer para el botón hamburguesa / menú móvil
  const hamburger = document.querySelector('.hamburger-btn');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      setTimeout(updateFabVisibility, 50);
    });
  }
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      setTimeout(updateFabVisibility, 50);
    });
  }
}
