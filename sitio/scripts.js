/**
 * Trasteos y Mudanzas San Miguel - Motor de Interacciones y Cotizador Unificado (v3.0)
 * Normas: Emil Kowalski UI Polish, WCAG 2.2 AA, Accesibilidad, Hardware Acceleration
 * Sin Emojis en Enlaces WhatsApp (Texto Plano UTF-8 Decodificable)
 */

document.addEventListener("DOMContentLoaded", () => {
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
  initServiceDirectLinks();
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

/* --- 2. Indicador de Sección Activa (Subrayado Deslizable - Bloque C) --- */
function initActiveNavSpy() {
  const navContainer = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length || !navLinks.length || !navContainer) return;

  // Crear el indicador deslizante en el DOM si no existe
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
    const width = linkRect.width;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
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

  // Inicializar indicador en la carga inicial
  setTimeout(() => {
    const initialActive = navContainer.querySelector(".nav-link.active") || navLinks[0];
    updateIndicator(initialActive);
  }, 100);
}

/* --- 3. Menú de las Tres Rayas (Panel Lateral Móvil) --- */
function initMobileDrawer() {
  const btn = document.querySelector(".hamburger-btn");
  const drawer = document.querySelector(".mobile-nav-drawer");
  const backdrop = document.getElementById("mobileDrawerBackdrop");
  const closeBtn = document.getElementById("mobileDrawerCloseBtn");
  if (!btn || !drawer) return;

  const openDrawer = () => {
    btn.setAttribute("aria-expanded", "true");
    drawer.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-active");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    btn.setAttribute("aria-expanded", "false");
    drawer.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-active");
    document.body.style.overflow = "";
  };

  btn.addEventListener("click", () => {
    const isExpanded = btn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeDrawer);
  }

  drawer.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
      btn.focus();
    }
  });
}

/* --- 4. Revelado Escalonado al Scroll (IntersectionObserver - FASE 7) --- */
function initScrollReveal() {
  // Marca para indicar que JavaScript está activo (contenido visible por defecto sin JS)
  document.body.classList.add("js-reveal-ready");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal-on-scroll, .stagger-card, .hero-section, .section-header, .how-it-works-section").forEach(el => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const parent = target.parentElement;
        const siblings = parent ? Array.from(parent.children).filter(c => c.classList.contains("stagger-card")) : [];
        const index = siblings.indexOf(target);
        const delay = index > 0 ? Math.min(index * 60, 360) : 0; // 60ms entre tarjetas, máx 6

        setTimeout(() => {
          target.classList.add("is-revealed");
        }, delay);

        obs.unobserve(target); // Una sola vez por elemento
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

  const targetCards = document.querySelectorAll(".service-row, .timeline-step-card, .guarantee-item-card, .factor-card, .review-card, .where-card, .reveal-on-scroll, .how-it-works-section, .section-header, .hero-section");
  targetCards.forEach(card => {
    card.classList.add("stagger-card");
    observer.observe(card);
  });
}

/* --- 5. Carga Diferida de Video con Poster --- */
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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadVideoSource();
        observer.disconnect();
      }
    });
  }, { rootMargin: "200px" });

  observer.observe(video);
  video.addEventListener("play", loadVideoSource, { once: true });
}

/* --- 6. Contador Animado para Cifras de Portada (Bloque F) --- */
function initHeroCounters() {
  const trustRow = document.querySelector(".hero-trust-row");
  if (!trustRow) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let animated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateNumber(document.getElementById("statAnos"), 6, "+", " Años");
        animateNumber(document.getElementById("statGratis"), 100, "", "% Gratis");
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(trustRow);
}

function animateNumber(element, target, prefix = "", suffix = "") {
  if (!element) return;
  let start = 0;
  const duration = 1200;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOutProgress * target);
    element.textContent = `${prefix}${current}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = `${prefix}${target}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}

/* --- 7. Animación de Línea de Tiempo en "Cómo funciona" (Bloque F) --- */
function initTimelineAnimation() {
  const timeline = document.querySelector(".timeline-steps-grid");
  if (!timeline) return;

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

/* --- 8. Lightbox Modal para Galería (Bloque E) --- */
function initGalleryLightbox() {
  const photoCards = document.querySelectorAll(".gallery-photo-card");
  const modal = document.getElementById("imageLightboxModal");
  const modalImg = document.getElementById("lightboxImage");
  const closeBtn = document.getElementById("lightboxCloseBtn");

  if (!photoCards.length || !modal || !modalImg) return;

  photoCards.forEach(card => {
    card.addEventListener("click", () => {
      const img = card.querySelector("img");
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || "Fotografía de Trasteos San Miguel";
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
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
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

/* --- 9. Enlaces de Servicios que Preseleccionan y Desplazan Suavemente (Bloque A.7) --- */
function initServiceDirectLinks() {
  document.querySelectorAll('a[data-select-service]').forEach(btn => {
    btn.addEventListener("click", (e) => {
      const serviceVal = btn.getAttribute("data-select-service");
      if (serviceVal) {
        selectQueMoverRadio(serviceVal);
      }
    });
  });

  document.querySelectorAll('a[data-select-dest]').forEach(btn => {
    btn.addEventListener("click", (e) => {
      const destVal = btn.getAttribute("data-select-dest");
      if (destVal) {
        selectHaciaDondeRadio(destVal);
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

function selectHaciaDondeRadio(val) {
  const radio = document.querySelector(`input[name="wizHaciaDonde"][value="${val}"]`);
  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

/* ==========================================================================
   VALIDACIONES ESTRICTAS DE ENTRADA (WCAG & SEGURIDAD)
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
  return String(addr || "").trim().length >= 5;
}

function validateCity(city) {
  return String(city || "").trim().length >= 3;
}

function validateFutureDate(dateVal) {
  if (!dateVal) return true;
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
   COTIZADORES ESPECIALIZADOS (LOCAL Y NACIONAL) - BLOQUE D
   ========================================================================== */
function initSpecializedQuoteWizard() {
  const wizardContainer = document.getElementById("quoteWizard");
  if (!wizardContainer) return;

  const wizardType = wizardContainer.getAttribute("data-wizard-type") || 
    (window.location.pathname.includes("nacional") ? "nacional" : "local");
  const isNacional = wizardType === "nacional";

  let currentStep = 1;
  const totalSteps = 4;

  const quoteData = {
    tipoCotizador: isNacional ? "Nacional" : "Local",
    nombre: "",
    telefono: "",
    queMover: "Hogar",
    // Local
    origenLocal: "",
    origenLat: "",
    origenLng: "",
    tipoOrigenLocal: "Casa primer piso",
    pisoOrigenLocal: 1,
    ascensorOrigenLocal: "No aplica",
    destinoLocal: "",
    destinoLat: "",
    destinoLng: "",
    tipoDestinoLocal: "Casa primer piso",
    pisoDestinoLocal: 1,
    ascensorDestinoLocal: "No aplica",
    // Nacional
    deptoOrigenNac: "Valle del Cauca",
    muniOrigenNac: "Cali",
    barrioOrigenNac: "",
    direccionOrigenNac: "",
    tipoOrigenNac: "Casa",
    pisoOrigenNac: 1,
    ascensorOrigenNac: "No aplica",
    accesoOrigenNac: "Sí, hasta la puerta",
    deptoDestinoNac: "",
    muniDestinoNac: "",
    barrioDestinoNac: "",
    direccionDestinoNac: "",
    tipoDestinoNac: "Casa",
    pisoDestinoNac: 1,
    ascensorDestinoNac: "No aplica",
    accesoDestinoNac: "Sí, hasta la puerta",
    // Maquinaria específica
    maquinaria: {
      tipo: "",
      cantidad: 1,
      peso: "",
      medidas: "",
      requerimientos: [],
      pisoAcceso: "",
      camionEntra: ""
    },
    // Fecha y Ayuda
    fecha: "",
    horario: "Mañana (7:00 a.m. - 12:00 m.)",
    ayudantes: "2 ayudantes + conductor",
    extras: [],
    // Objetos
    inventario: {},
    notas: "",
    consent: false
  };

  // Referencias DOM
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

  // Preselección por parámetro URL ?servicio=hogar|empresa|pequena|maquinaria
  const urlParams = new URLSearchParams(window.location.search);
  const paramServicio = urlParams.get("servicio");
  if (paramServicio) {
    let serviceValue = "Hogar";
    if (paramServicio === "empresa") serviceValue = "Oficina o empresa";
    else if (paramServicio === "pequena" || paramServicio === "expres") serviceValue = "Mudanza pequeña (hasta 4 objetos)";
    else if (paramServicio === "maquinaria") serviceValue = "Maquinaria o equipos";
    
    quoteData.queMover = serviceValue;
    const targetRadio = wizardContainer.querySelector(`input[name="wizQueMover"][value="${serviceValue}"]`);
    if (targetRadio) {
      targetRadio.checked = true;
      wizardContainer.querySelectorAll(".que-mover-card").forEach(c => c.classList.remove("selected"));
      targetRadio.closest(".que-mover-card")?.classList.add("selected");
    }
  }

  // Selección dinámica de paneles de objetos en Paso 3 según el servicio
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
    } else if (service.includes("pequeña") || service.includes("exprés")) {
      if (panePequena) panePequena.style.display = "block";
      if (customItemWrap) customItemWrap.style.display = "none";
      updatePequenaCounterLimit();
    } else if (service.includes("Maquinaria")) {
      if (paneMaquinaria) paneMaquinaria.style.display = "block";
      if (customItemWrap) customItemWrap.style.display = "none";
    }
  }

  // Radio cards: ¿Qué vas a mover?
  const queMoverCards = wizardContainer.querySelectorAll('.que-mover-card');
  queMoverCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    card.addEventListener("click", () => {
      queMoverCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      if (radio) {
        radio.checked = true;
        quoteData.queMover = radio.value;
        syncItemsPaneWithService(radio.value);
      }
    });
    if (radio) {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          queMoverCards.forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          quoteData.queMover = radio.value;
          syncItemsPaneWithService(radio.value);
        }
      });
    }
  });

  // Inicializar pane de objetos según servicio actual
  syncItemsPaneWithService(quoteData.queMover);

  // Tabs de categorías en Hogar
  const catTabs = wizardContainer.querySelectorAll(".cat-tab-btn");
  const groupPanes = wizardContainer.querySelectorAll(".items-group-pane");
  catTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      catTabs.forEach(t => t.classList.remove("active"));
      groupPanes.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const cat = tab.getAttribute("data-category");
      const targetPane = document.getElementById(`pane-${cat}`);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // Contadores generales de objetos
  wizardContainer.querySelectorAll(".btn-counter:not(.btn-counter-pequena)").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const itemKey = btn.getAttribute("data-item-key");
      const itemName = btn.getAttribute("data-item");
      const countEl = document.getElementById(`count-${itemKey}`);
      if (!countEl) return;

      let current = parseInt(countEl.textContent, 10) || 0;
      if (action === "plus") {
        current = Math.min(current + 1, 99);
      } else if (action === "minus") {
        current = Math.max(current - 1, 0);
      }
      countEl.textContent = current;
      quoteData.inventario[itemName] = current;
      renderWizardSummary();
    });
  });

  // Lógica Especial: Mudanza pequeña (Máx 4 objetos en total)
  function updatePequenaCounterLimit() {
    const pequenaRows = wizardContainer.querySelectorAll("#paneItemsPequena .item-counter-row");
    let totalPequena = 0;
    const pequenaItems = {};

    pequenaRows.forEach(row => {
      const valEl = row.querySelector(".counter-val");
      const count = parseInt(valEl?.textContent, 10) || 0;
      totalPequena += count;
    });

    const countValDisplay = document.getElementById("pequenaCountVal");
    if (countValDisplay) countValDisplay.textContent = totalPequena;

    const limitBadge = document.getElementById("pequenaLimitBadge");
    const warningBanner = document.getElementById("pequenaWarningBanner");

    const plusButtons = wizardContainer.querySelectorAll("#paneItemsPequena button[data-action='plus']");

    if (totalPequena >= 4) {
      if (limitBadge) limitBadge.classList.add("limit-reached");
      if (warningBanner) warningBanner.classList.add("visible");
      plusButtons.forEach(b => {
        b.disabled = true;
      });
    } else {
      if (limitBadge) limitBadge.classList.remove("limit-reached");
      if (warningBanner) warningBanner.classList.remove("visible");
      plusButtons.forEach(b => {
        b.disabled = false;
      });
    }

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

      if (action === "plus") {
        if (currentTotal < 4) {
          current += 1;
        }
      } else if (action === "minus") {
        current = Math.max(current - 1, 0);
      }
      countEl.textContent = current;
      quoteData.inventario[itemName] = current;
      updatePequenaCounterLimit();
      renderWizardSummary();
    });
  });

  // Objeto personalizado para Hogar y Oficina
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
      itemRow.innerHTML = `
        <span class="item-name">${escapeHTML(name)}</span>
        <div class="counter-controls">
          <button type="button" class="btn-counter" data-action="minus">−</button>
          <span class="counter-val" id="count-${key}">1</span>
          <button type="button" class="btn-counter" data-action="plus">+</button>
        </div>
      `;

      itemRow.querySelector('[data-action="plus"]').addEventListener("click", () => {
        let val = parseInt(document.getElementById(`count-${key}`).textContent, 10) || 1;
        val = Math.min(val + 1, 99);
        document.getElementById(`count-${key}`).textContent = val;
        quoteData.inventario[name] = val;
        renderWizardSummary();
      });

      itemRow.querySelector('[data-action="minus"]').addEventListener("click", () => {
        let val = parseInt(document.getElementById(`count-${key}`).textContent, 10) || 1;
        val = Math.max(val - 1, 0);
        document.getElementById(`count-${key}`).textContent = val;
        quoteData.inventario[name] = val;
        if (val === 0) itemRow.remove();
        renderWizardSummary();
      });

      customList.appendChild(itemRow);
      inputCustom.value = "";
      renderWizardSummary();
    });
  }

  // Integración defensiva de Google Places API (Places API New)
  initGooglePlacesAutocomplete(isNacional);

  // Navegación Siguiente
  btnNext.addEventListener("click", () => {
    if (!validateCurrentStep(currentStep)) return;
    if (currentStep < totalSteps) {
      currentStep++;
      updateWizardView("forward");
    }
  });

  // Navegación Anterior
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
      const errNombre = document.getElementById("errNombre");
      const errTel = document.getElementById("errTelefono");

      const isNameValid = validateName(nombreInput?.value);
      const isTelValid = validateColombiaPhone(telInput?.value);

      setFieldError(nombreInput, errNombre, !isNameValid);
      setFieldError(telInput, errTel, !isTelValid);

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
        const barrioDestino = document.getElementById("wizBarrioDestinoNac");
        const dirDestino = document.getElementById("wizDireccionDestinoNac");

        const errMuniOri = document.getElementById("errMuniOrigenNac");
        const errBarrioOri = document.getElementById("errBarrioOrigenNac");
        const errDirOri = document.getElementById("errDireccionOrigenNac");
        const errDeptoDes = document.getElementById("errDeptoDestinoNac");
        const errMuniDes = document.getElementById("errMuniDestinoNac");
        const errBarrioDes = document.getElementById("errBarrioDestinoNac");
        const errDirDes = document.getElementById("errDireccionDestinoNac");

        const validMuniOri = validateCity(muniOrigen?.value);
        const validBarrioOri = (barrioOrigen?.value || "").trim().length >= 3;
        const validDirOri = validateAddress(dirOrigen?.value);
        const validDeptoDes = !!deptoDestino?.value;
        const validMuniDes = validateCity(muniDestino?.value);
        const validBarrioDes = (barrioDestino?.value || "").trim().length >= 3;
        const validDirDes = validateAddress(dirDestino?.value);

        setFieldError(muniOrigen, errMuniOri, !validMuniOri);
        setFieldError(barrioOrigen, errBarrioOri, !validBarrioOri);
        setFieldError(dirOrigen, errDirOri, !validDirOri);
        setFieldError(deptoDestino, errDeptoDes, !validDeptoDes);
        setFieldError(muniDestino, errMuniDes, !validMuniDes);
        setFieldError(barrioDestino, errBarrioDes, !validBarrioDes);
        setFieldError(dirDestino, errDirDes, !validDirDes);

        if (!validMuniOri) { muniOrigen?.focus(); return false; }
        if (!validBarrioOri) { barrioOrigen?.focus(); return false; }
        if (!validDirOri) { dirOrigen?.focus(); return false; }
        if (!validDeptoDes) { deptoDestino?.focus(); return false; }
        if (!validMuniDes) { muniDestino?.focus(); return false; }
        if (!validBarrioDes) { barrioDestino?.focus(); return false; }
        if (!validDirDes) { dirDestino?.focus(); return false; }

        quoteData.muniOrigenNac = muniOrigen.value.trim();
        quoteData.barrioOrigenNac = barrioOrigen.value.trim();
        quoteData.direccionOrigenNac = dirOrigen.value.trim();
        quoteData.origenLat = document.getElementById("wizOrigenLat")?.value || "";
        quoteData.origenLng = document.getElementById("wizOrigenLng")?.value || "";
        quoteData.tipoOrigenNac = document.getElementById("wizTipoOrigenNac")?.value || "Casa";
        quoteData.pisoOrigenNac = document.getElementById("wizPisoOrigenNac")?.value || 1;
        quoteData.ascensorOrigenNac = document.getElementById("wizAscensorOrigenNac")?.value || "No aplica";
        quoteData.accesoOrigenNac = document.getElementById("wizAccesoOrigenNac")?.value || "Sí, hasta la puerta";

        quoteData.deptoDestinoNac = deptoDestino.value;
        quoteData.muniDestinoNac = muniDestino.value.trim();
        quoteData.barrioDestinoNac = barrioDestino.value.trim();
        quoteData.direccionDestinoNac = dirDestino.value.trim();
        quoteData.destinoLat = document.getElementById("wizDestinoLat")?.value || "";
        quoteData.destinoLng = document.getElementById("wizDestinoLng")?.value || "";
        quoteData.tipoDestinoNac = document.getElementById("wizTipoDestinoNac")?.value || "Casa";
        quoteData.pisoDestinoNac = document.getElementById("wizPisoDestinoNac")?.value || 1;
        quoteData.ascensorDestinoNac = document.getElementById("wizAscensorDestinoNac")?.value || "No aplica";
        quoteData.accesoDestinoNac = document.getElementById("wizAccesoDestinoNac")?.value || "Sí, hasta la puerta";
      } else {
        const origenInput = document.getElementById("wizOrigenLocal");
        const destinoInput = document.getElementById("wizDestinoLocal");
        const errOrigen = document.getElementById("errOrigenLocal");
        const errDestino = document.getElementById("errDestinoLocal");

        const isOrigenValid = validateAddress(origenInput?.value);
        const isDestinoValid = validateAddress(destinoInput?.value);

        setFieldError(origenInput, errOrigen, !isOrigenValid);
        setFieldError(destinoInput, errDestino, !isDestinoValid);

        if (!isOrigenValid) { origenInput?.focus(); return false; }
        if (!isDestinoValid) { destinoInput?.focus(); return false; }

        quoteData.origenLocal = origenInput.value.trim();
        quoteData.origenLat = document.getElementById("wizOrigenLat")?.value || "";
        quoteData.origenLng = document.getElementById("wizOrigenLng")?.value || "";
        quoteData.tipoOrigenLocal = document.getElementById("wizTipoOrigenLocal")?.value || "Casa primer piso";
        quoteData.pisoOrigenLocal = document.getElementById("wizPisoOrigenLocal")?.value || 1;
        quoteData.ascensorOrigenLocal = document.getElementById("wizAscensorOrigenLocal")?.value || "No aplica";

        quoteData.destinoLocal = destinoInput.value.trim();
        quoteData.destinoLat = document.getElementById("wizDestinoLat")?.value || "";
        quoteData.destinoLng = document.getElementById("wizDestinoLng")?.value || "";
        quoteData.tipoDestinoLocal = document.getElementById("wizTipoDestinoLocal")?.value || "Casa primer piso";
        quoteData.pisoDestinoLocal = document.getElementById("wizPisoDestinoLocal")?.value || 1;
        quoteData.ascensorDestinoLocal = document.getElementById("wizAscensorDestinoLocal")?.value || "No aplica";
      }
      return true;
    }

    if (step === 3) {
      if (quoteData.queMover === "Maquinaria o equipos") {
        quoteData.maquinaria.tipo = document.getElementById("wizMaqTipo")?.value || "Maquinaria comercial";
        quoteData.maquinaria.cantidad = document.getElementById("wizMaqCantidad")?.value || 1;
        quoteData.maquinaria.peso = document.getElementById("wizMaqPeso")?.value || "";
        quoteData.maquinaria.medidas = document.getElementById("wizMaqMedidas")?.value || "";
        
        quoteData.maquinaria.requerimientos = [];
        if (document.getElementById("wizMaqMontacargas")?.checked) quoteData.maquinaria.requerimientos.push("Montacargas");
        if (document.getElementById("wizMaqGrua")?.checked) quoteData.maquinaria.requerimientos.push("Grúa o elevación");
        if (document.getElementById("wizMaqRampa")?.checked) quoteData.maquinaria.requerimientos.push("Rampa hidráulica");
        if (document.getElementById("wizMaqManual")?.checked) quoteData.maquinaria.requerimientos.push("Cargue manual");

        quoteData.maquinaria.pisoAcceso = document.getElementById("wizMaqPisoAcceso")?.value || "";
        quoteData.maquinaria.camionEntra = document.getElementById("wizMaqCamionEntra")?.value || "";
      }
      return true;
    }

    return true;
  }

  function updateWizardView(direction = "forward") {
    panes.forEach(p => {
      p.classList.remove("active", "slide-forward", "slide-backward");
    });
    const currentPane = document.getElementById(`stepPane${currentStep}`);
    if (currentPane) {
      currentPane.classList.add("active");
      currentPane.classList.add(direction === "forward" ? "slide-forward" : "slide-backward");
    }

    nodes.forEach((node, idx) => {
      node.classList.toggle("active", idx + 1 <= currentStep);
    });

    if (progressFill) {
      const percentage = (currentStep / totalSteps) * 100;
      progressFill.style.width = `${percentage}%`;
    }

    btnPrev.style.display = currentStep > 1 ? "inline-flex" : "none";

    if (currentStep === totalSteps) {
      btnNext.style.display = "none";
      btnSubmit.style.display = "inline-flex";
      renderWizardSummary();
    } else {
      btnNext.style.display = "inline-flex";
      btnSubmit.style.display = "none";
    }

    wizardContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderWizardSummary() {
    const summaryBox = document.getElementById("quoteSummaryContent");
    if (!summaryBox) return;

    let itemsText = "";
    if (quoteData.queMover === "Maquinaria o equipos") {
      const m = quoteData.maquinaria;
      itemsText = `${m.tipo} (${m.cantidad} unid)${m.peso ? ` · Peso aprox: ${m.peso} kg` : ""}${m.medidas ? ` · Medidas: ${m.medidas}` : ""}`;
    } else {
      const activeItems = Object.entries(quoteData.inventario)
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => `${name} (${count})`)
        .join(", ");
      itemsText = activeItems || "Lista no especificada aún";
    }

    const rutaText = isNacional
      ? `Salida: Cali (${quoteData.barrioOrigenNac || "Barrio"}) → Llegada: ${quoteData.muniDestinoNac || "Ciudad"}, ${quoteData.deptoDestinoNac || "Departamento"}`
      : `${quoteData.origenLocal || "Origen"} → ${quoteData.destinoLocal || "Destino"}`;

    const inmueblesText = isNacional
      ? `Salida: ${quoteData.tipoOrigenNac} (Piso ${quoteData.pisoOrigenNac}, ${quoteData.ascensorOrigenNac}) | Llegada: ${quoteData.tipoDestinoNac} (Piso ${quoteData.pisoDestinoNac}, ${quoteData.ascensorDestinoNac})`
      : `Salida: ${quoteData.tipoOrigenLocal} (Piso ${quoteData.pisoOrigenLocal}) | Llegada: ${quoteData.tipoDestinoLocal} (Piso ${quoteData.pisoDestinoLocal})`;

    summaryBox.innerHTML = `
      <div class="summary-list">
        <div class="summary-row">
          <span class="summary-label">Solicitante:</span>
          <span class="summary-value">${escapeHTML(quoteData.nombre || "Pendiente")} · ${escapeHTML(quoteData.telefono || "Pendiente")}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Servicio:</span>
          <span class="summary-value">${escapeHTML(quoteData.queMover)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Ruta:</span>
          <span class="summary-value">${escapeHTML(rutaText)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Accesos:</span>
          <span class="summary-value">${escapeHTML(inmueblesText)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Objetos o carga:</span>
          <span class="summary-value">${escapeHTML(itemsText)}</span>
        </div>
      </div>
      <div style="margin-top: 0.85rem; text-align: right;">
        <button type="button" class="btn btn--sm btn--secondary" id="btnEditQuoteData">
          ✏️ Modificar datos
        </button>
      </div>
    `;

    document.getElementById("btnEditQuoteData")?.addEventListener("click", () => {
      currentStep = 1;
      updateWizardView("backward");
    });
  }

  // Envío: Abre WhatsApp + Guarda en Google Sheets
  btnSubmit.addEventListener("click", () => {
    // Validar paso 4
    const fechaInput = document.getElementById("wizFecha");
    const errFecha = document.getElementById("errFecha");
    const isFechaValid = validateFutureDate(fechaInput?.value);
    setFieldError(fechaInput, errFecha, !isFechaValid);
    if (!isFechaValid) { fechaInput?.focus(); return; }

    const consent = document.getElementById("wizConsent");
    const errConsent = document.getElementById("errConsent");
    const hp = document.getElementById("website_hp");

    if (!consent || !consent.checked) {
      if (errConsent) errConsent.style.display = "block";
      consent?.focus();
      return;
    } else {
      if (errConsent) errConsent.style.display = "none";
    }

    if (hp && hp.value.trim() !== "") {
      showFeedback("Solicitud procesada correctamente.", "success");
      return;
    }

    quoteData.fecha = fechaInput?.value || "Por convenir";
    quoteData.horario = document.getElementById("wizHorario")?.value || "Mañana";
    quoteData.ayudantes = document.getElementById("wizAyudantes")?.value || "2 ayudantes + conductor";
    
    quoteData.extras = [];
    if (document.getElementById("wizExtraEmbalaje")?.checked) quoteData.extras.push("Protección con vinipel");
    if (document.getElementById("wizExtraDesarme")?.checked) quoteData.extras.push("Desarme y armado de muebles");

    quoteData.notas = document.getElementById("wizNotas")?.value.trim() || "";
    quoteData.consent = true;

    btnSubmit.classList.add("is-loading");

    // 1. Mensaje en texto plano UTF-8 exacto según Bloque G
    const messageText = generateBloqueGWhatsAppText(quoteData, isNacional);
    const waPhone = window.APP_CONFIG?.PHONE_RAW || "573217676571";
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(messageText)}`;

    // 2. Envío Asíncrono a Google Sheets Apps Script
    postToAppsScript(quoteData);

    // 3. Apertura de WhatsApp y Pantalla de Confirmación
    setTimeout(() => {
      btnSubmit.classList.remove("is-loading");
      window.open(waUrl, "_blank", "noopener,noreferrer");
      displayConfirmationScreen(quoteData);
    }, 250);
  });

  function postToAppsScript(data) {
    const appsScriptUrl = window.APP_CONFIG?.APPS_SCRIPT_WEBAPP_URL || window.APP_CONFIG?.APPS_SCRIPT_URL;
    if (!appsScriptUrl || appsScriptUrl.includes("[PENDIENTE") || appsScriptUrl === "") {
      return Promise.resolve({ status: "skipped_no_url" });
    }

    return fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      mode: "no-cors"
    }).catch(err => {
      console.warn("Apps Script dispatch note:", err);
    });
  }

  function displayConfirmationScreen(data) {
    const wizardBody = wizardContainer.querySelector(".wizard-body");
    const wizardFooter = wizardContainer.querySelector(".wizard-footer");
    if (!wizardBody) return;

    if (wizardFooter) wizardFooter.style.display = "none";
    wizardBody.innerHTML = `
      <div class="confirmation-screen">
        <div class="confirmation-check">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style="font-size: 1.4rem; color: var(--blue-footer); margin-bottom: 0.5rem;">¡Solicitud enviada con éxito!</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 500px; margin: 0 auto 1.5rem auto;">
          Se ha abierto la conversación oficial de WhatsApp con tu cotización detallada. Nuestro equipo te responderá de inmediato con la tarifa exacta y disponibilidad.
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="${isNacional ? 'nacional.html' : 'valle-del-cauca.html'}" class="btn btn--secondary btn--sm">
            <span>Nueva cotización</span>
          </a>
          <a href="index.html" class="btn btn--primary btn--sm">
            <span>Volver al inicio</span>
          </a>
        </div>
      </div>
    `;
  }

  function showFeedback(msg, type) {
    const box = document.getElementById("submissionFeedback");
    if (!box) return;
    box.textContent = msg;
    box.className = `submission-feedback ${type}`;
    box.style.display = "block";
  }

  // Hook global de prueba para DevTools
  window.testQuoteData = quoteData;
}

/* ==========================================================================
   INTEGRACIÓN DEFENSIVA GOOGLE PLACES API (PLACES API NEW)
   ========================================================================== */
function initGooglePlacesAutocomplete(isNacional) {
  const apiKey = window.APP_CONFIG?.GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey.includes("[PENDIENTE")) {
    console.info("Google Places API Key no configurada; operando en modo texto libre con validación local.");
    return;
  }

  if (typeof google === "object" && typeof google.maps === "object" && google.maps.places) {
    setupAutocompleteFields(isNacional);
    return;
  }

  // Carga asíncrona del script de Google Maps Places API New
  const existingScript = document.getElementById("googleMapsPlacesScript");
  if (!existingScript) {
    const script = document.createElement("script");
    script.id = "googleMapsPlacesScript";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setupAutocompleteFields(isNacional);
    };
    script.onerror = () => {
      console.warn("No se pudo cargar Google Places API. Operando en modo texto estándar.");
    };
    document.head.appendChild(script);
  }
}

function setupAutocompleteFields(isNacional) {
  if (typeof google === "undefined" || !google.maps || !google.maps.places) return;

  const options = {
    componentRestrictions: { country: "co" },
    fields: ["formatted_address", "geometry", "name"]
  };

  if (!isNacional) {
    // Sesgo hacia Cali y Valle del Cauca
    options.bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(3.0, -77.2),
      new google.maps.LatLng(4.3, -75.8)
    );
    options.strictBounds = false;
  }

  const inputs = document.querySelectorAll(".places-autocomplete-input");
  inputs.forEach(input => {
    try {
      const autocomplete = new google.maps.places.Autocomplete(input, options);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place || !place.geometry) return;

        input.value = place.formatted_address || place.name || input.value;

        // Guardar coordenadas en campos ocultos correspondientes
        if (input.id.includes("Origen")) {
          const latField = document.getElementById("wizOrigenLat");
          const lngField = document.getElementById("wizOrigenLng");
          const fmtField = document.getElementById("wizOrigenFormatted");
          if (latField) latField.value = place.geometry.location.lat();
          if (lngField) lngField.value = place.geometry.location.lng();
          if (fmtField) fmtField.value = place.formatted_address || input.value;
        } else if (input.id.includes("Destino")) {
          const latField = document.getElementById("wizDestinoLat");
          const lngField = document.getElementById("wizDestinoLng");
          const fmtField = document.getElementById("wizDestinoFormatted");
          if (latField) latField.value = place.geometry.location.lat();
          if (lngField) lngField.value = place.geometry.location.lng();
          if (fmtField) fmtField.value = place.formatted_address || input.value;
        }
      });
    } catch (e) {
      console.warn("Error al inicializar Autocomplete en campo:", input.id, e);
    }
  });
}

/* ==========================================================================
   GENERADOR DE MENSAJE WHATSAPP SEGÚN FORMATO EXACTO BLOQUE G
   ========================================================================== */
function formatSpanishDate(dateStr, horario) {
  if (!dateStr) return "Por convenir";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
      const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      
      const dayName = days[date.getDay()];
      const monthName = months[month];
      
      let jornadaText = "en la mañana";
      if (horario && horario.toLowerCase().includes("tarde")) {
        jornadaText = "en la tarde";
      } else if (horario && horario.toLowerCase().includes("indiferente")) {
        jornadaText = "en jornada a convenir";
      }
      return `${dayName} ${day} de ${monthName} de ${year}, ${jornadaText}`;
    }
  } catch (e) {}
  return dateStr;
}

function generateBloqueGWhatsAppText(data, isNacional) {
  const lineas = [];

  const saludo = isNacional 
    ? "Hola, quiero cotizar una mudanza nacional con San Miguel." 
    : "Hola, quiero cotizar una mudanza local en Cali y Valle con San Miguel.";
  lineas.push(saludo);
  lineas.push(`*Nombre:* ${data.nombre}`);
  lineas.push(`*Celular:* ${data.telefono}`);
  lineas.push(`*Qué voy a mover:* ${data.queMover}`);

  // Recogida
  let recogidaStr = "";
  if (isNacional) {
    recogidaStr = `${data.direccionOrigenNac}, barrio ${data.barrioOrigenNac}, ${data.muniOrigenNac} (${data.deptoOrigenNac}), ${data.tipoOrigenNac}, piso ${data.pisoOrigenNac}`;
    if (data.ascensorOrigenNac && data.ascensorOrigenNac !== "No aplica") {
      recogidaStr += ` (${data.ascensorOrigenNac})`;
    }
    if (data.origenLat && data.origenLng) {
      recogidaStr += ` · Mapa: https://www.google.com/maps/search/?api=1&query=${data.origenLat},${data.origenLng}`;
    }
  } else {
    recogidaStr = `${data.origenLocal}, Cali / Valle del Cauca, ${data.tipoOrigenLocal}, piso ${data.pisoOrigenLocal}`;
    if (data.ascensorOrigenLocal && data.ascensorOrigenLocal !== "No aplica") {
      recogidaStr += ` (${data.ascensorOrigenLocal})`;
    }
    if (data.origenLat && data.origenLng) {
      recogidaStr += ` · Mapa: https://www.google.com/maps/search/?api=1&query=${data.origenLat},${data.origenLng}`;
    }
  }
  lineas.push(`*Recogida:* ${recogidaStr}`);

  // Entrega
  let entregaStr = "";
  if (isNacional) {
    entregaStr = `${data.direccionDestinoNac}, barrio ${data.barrioDestinoNac}, ${data.muniDestinoNac} (${data.deptoDestinoNac}), ${data.tipoDestinoNac}, piso ${data.pisoDestinoNac}`;
    if (data.ascensorDestinoNac && data.ascensorDestinoNac !== "No aplica") {
      entregaStr += ` (${data.ascensorDestinoNac})`;
    }
    if (data.destinoLat && data.destinoLng) {
      entregaStr += ` · Mapa: https://www.google.com/maps/search/?api=1&query=${data.destinoLat},${data.destinoLng}`;
    }
  } else {
    entregaStr = `${data.destinoLocal}, Cali / Valle del Cauca, ${data.tipoDestinoLocal}, piso ${data.pisoDestinoLocal}`;
    if (data.ascensorDestinoLocal && data.ascensorDestinoLocal !== "No aplica") {
      entregaStr += ` (${data.ascensorDestinoLocal})`;
    }
    if (data.destinoLat && data.destinoLng) {
      entregaStr += ` · Mapa: https://www.google.com/maps/search/?api=1&query=${data.destinoLat},${data.destinoLng}`;
    }
  }
  lineas.push(`*Entrega:* ${entregaStr}`);

  // Fecha
  const fechaFormateada = formatSpanishDate(data.fecha, data.horario);
  lineas.push(`*Fecha:* ${fechaFormateada}`);

  // Ayudantes
  lineas.push(`*Ayudantes:* ${data.ayudantes}`);

  // Servicios adicionales
  const serviciosExtraStr = data.extras && data.extras.length > 0 
    ? data.extras.join(", ") 
    : "Ninguno adicional";
  lineas.push(`*Servicios adicionales:* ${serviciosExtraStr}`);

  // Objetos
  let objetosStr = "";
  if (data.queMover === "Maquinaria o equipos") {
    const m = data.maquinaria;
    const reqs = m.requerimientos && m.requerimientos.length > 0 ? m.requerimientos.join(", ") : "Manual";
    objetosStr = `${m.tipo} (${m.cantidad} unid)${m.peso ? ` · Peso aprox: ${m.peso} kg` : ""}${m.medidas ? ` · Medidas: ${m.medidas}` : ""} · Manipulación: ${reqs}${m.pisoAcceso ? ` · Acceso: ${m.pisoAcceso}` : ""} [POR CONFIRMAR CON EL CLIENTE: peso y tipos aceptados]`;
  } else {
    const items = Object.entries(data.inventario || {})
      .filter(([_, count]) => count > 0)
      .map(([item, count]) => `${item} (${count})`);
    
    if (items.length > 0) {
      objetosStr = items.join(", ");
    } else {
      objetosStr = "Aún no tengo la lista, la envío por este chat.";
    }
  }
  lineas.push(`*Objetos:* ${objetosStr}`);

  // Notas
  lineas.push(`*Notas:* ${data.notas || "Sin observaciones adicionales."}`);

  // Cierre estricto Bloque G
  lineas.push("¿Me pueden indicar el valor y la disponibilidad?");

  return lineas.join("\n");
}

// Utilidad para pruebas de decodificación en DevTools (Bloque H)
window.testWhatsAppFormat = function(scenario = "local_hogar") {
  if (scenario === "local_hogar") {
    const sample = {
      nombre: "Carlos Mendoza",
      telefono: "3217676571",
      queMover: "Hogar",
      origenLocal: "Calle 14 # 85-20, Valle del Lili",
      tipoOrigenLocal: "Apartamento con ascensor",
      pisoOrigenLocal: 3,
      ascensorOrigenLocal: "Sí cuenta con ascensor",
      origenLat: "3.3762",
      origenLng: "-76.5358",
      destinoLocal: "Carrera 12 # 5-40, Alfaguara, Jamundí",
      tipoDestinoLocal: "Casa dos pisos",
      pisoDestinoLocal: 1,
      ascensorDestinoLocal: "No aplica",
      destinoLat: "3.2612",
      destinoLng: "-76.5410",
      fecha: "2026-10-26",
      horario: "Mañana (7:00 a.m. - 12:00 m.)",
      ayudantes: "2 ayudantes + conductor",
      extras: ["Protección con vinipel"],
      inventario: { "Sofá 3 puestos": 1, "Nevera": 1, "Cama Doble / Semidoble": 1 },
      notas: "Cuidado especial con el refrigerador."
    };
    const text = generateBloqueGWhatsAppText(sample, false);
    return {
      decoded: text,
      url: `https://wa.me/573217676571?text=${encodeURIComponent(text)}`
    };
  } else if (scenario === "local_maquinaria") {
    const sample = {
      nombre: "Distribuciones del Valle",
      telefono: "3158901234",
      queMover: "Maquinaria o equipos",
      origenLocal: "Calle 25 # 4-50, San Nicolás, Cali",
      tipoOrigenLocal: "Local u oficina",
      pisoOrigenLocal: 1,
      ascensorOrigenLocal: "No aplica",
      origenLat: "3.4485",
      origenLng: "-76.5298",
      destinoLocal: "Carrera 35 # 10-20, Acopi, Yumbo",
      tipoDestinoLocal: "Bodega",
      pisoDestinoLocal: 1,
      ascensorDestinoLocal: "No aplica",
      destinoLat: "3.5280",
      destinoLng: "-76.5050",
      fecha: "2026-10-28",
      horario: "Mañana (7:00 a.m. - 12:00 m.)",
      ayudantes: "3 o más ayudantes + conductor",
      extras: [],
      maquinaria: {
        tipo: "Equipos de panadería o cocina industrial",
        cantidad: 2,
        peso: "380",
        medidas: "1.90m × 1.10m × 1.30m",
        requerimientos: ["Rampa hidráulica", "Cargue manual"],
        pisoAcceso: "Nivel de andén sin desniveles",
        camionEntra: "Sí, entrada directa"
      },
      notas: "Equipos pesados de acero inoxidable."
    };
    const text = generateBloqueGWhatsAppText(sample, false);
    return {
      decoded: text,
      url: `https://wa.me/573217676571?text=${encodeURIComponent(text)}`
    };
  } else if (scenario === "nacional_oficina") {
    const sample = {
      nombre: "Consultores Asociados Cali",
      telefono: "3104567890",
      queMover: "Oficina o empresa",
      deptoOrigenNac: "Valle del Cauca",
      muniOrigenNac: "Cali",
      barrioOrigenNac: "Granada",
      direccionOrigenNac: "Avenida 9N # 12-40",
      tipoOrigenNac: "Oficina",
      pisoOrigenNac: 4,
      ascensorOrigenNac: "Sí cuenta con ascensor",
      origenLat: "3.4560",
      origenLng: "-76.5360",
      deptoDestinoNac: "Cundinamarca",
      muniDestinoNac: "Bogotá D.C.",
      barrioDestinoNac: "Chicó Norte",
      direccionDestinoNac: "Carrera 15 # 93-60",
      tipoDestinoNac: "Edificio empresarial",
      pisoDestinoNac: 5,
      ascensorDestinoNac: "Sí cuenta con ascensor",
      destinoLat: "4.6780",
      destinoLng: "-74.0530",
      fecha: "2026-11-02",
      horario: "Mañana (7:00 a.m. - 12:00 m.)",
      ayudantes: "2 ayudantes + conductor",
      extras: ["Protección con vinipel", "Desarme y armado de muebles"],
      inventario: { "Escritorios": 4, "Sillas oficina": 4, "Computadores y pantallas": 4, "Archivadores": 2 },
      notas: "Coordinar ingreso con administración del edificio en Bogotá."
    };
    const text = generateBloqueGWhatsAppText(sample, true);
    return {
      decoded: text,
      url: `https://wa.me/573217676571?text=${encodeURIComponent(text)}`
    };
  }
};

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
