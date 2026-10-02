var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../../private/tmp/web-radar-native-original/src/templates/themes/auravell/runtime.ts
function auravellRuntime() {
  if (typeof document === "undefined" || document.body.dataset.template !== "auravell" || document.body.dataset.auravellReady)
    return;
  document.body.dataset.auravellReady = "true";
  const menuButtons = document.querySelectorAll(".rt-menu-button-main, [data-auravell-menu]");
  const navMenu = document.querySelector(".rt-navbar-menu-wrapper, [data-auravell-nav]");
  const navOverlay = document.querySelector(".rt-navbar-overlay");
  menuButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = navMenu?.classList.contains("w--open") || navMenu?.hasAttribute("data-nav-menu-open");
      if (isOpen) {
        navMenu?.classList.remove("w--open");
        navMenu?.removeAttribute("data-nav-menu-open");
        btn.classList.remove("w--open");
        btn.setAttribute("aria-expanded", "false");
        if (navOverlay) navOverlay.style.display = "none";
      } else {
        navMenu?.classList.add("w--open");
        navMenu?.setAttribute("data-nav-menu-open", "");
        btn.classList.add("w--open");
        btn.setAttribute("aria-expanded", "true");
        if (navOverlay) navOverlay.style.display = "block";
      }
    });
  });
  if (navOverlay) {
    navOverlay.addEventListener("click", () => {
      navMenu?.classList.remove("w--open");
      navMenu?.removeAttribute("data-nav-menu-open");
      menuButtons.forEach((b) => b.classList.remove("w--open"));
      navOverlay.style.display = "none";
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu?.hasAttribute("data-nav-menu-open")) menuButtons[0]?.click();
  });
  const accordionHeaders = document.querySelectorAll(
    ".rt-accordion-heading, [data-auravell-accordion-trigger]"
  );
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.closest(".rt-accordion-item, .w-dropdown");
      if (!item) return;
      const body = item.querySelector(".rt-accordion-body, .w-dropdown-list");
      const isExpanded = item.classList.contains("w--open") || header.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        item.classList.remove("w--open");
        header.setAttribute("aria-expanded", "false");
        if (body) body.style.display = "none";
      } else {
        item.classList.add("w--open");
        header.setAttribute("aria-expanded", "true");
        if (body) body.style.display = "block";
      }
    });
  });
  const tabs = document.querySelectorAll("[data-auravell-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.auravellTab || "all";
      tabs.forEach((t) => t.classList.remove("w--current", "active"));
      tab.classList.add("w--current", "active");
      const cards = document.querySelectorAll("[data-auravell-category]");
      cards.forEach((card) => {
        if (category === "all" || card.dataset.auravellCategory === category) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
  const videoControls = document.querySelectorAll(".w-backgroundvideo-backgroundvideoplaypausebutton");
  videoControls.forEach((control) => {
    control.addEventListener("click", () => {
      const wrapper = control.closest(".w-background-video");
      const video = wrapper?.querySelector("video");
      if (!video) return;
      if (video.paused) {
        video.play();
        control.classList.remove("w-background-video--paused");
      } else {
        video.pause();
        control.classList.add("w-background-video--paused");
      }
    });
  });
  document.querySelectorAll("form[data-auravell-form]").forEach((form) => {
    let requestId = crypto.randomUUID(), previous = "";
    const selected = new URL(location.href).searchParams.get("productId");
    const select = form.querySelector('[name="productId"]');
    if (select && selected && [...select.options].some((o) => o.value === selected))
      select.value = selected;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector('[role="status"]');
      if (form.dataset.wrPreviewDisabled === "true" || !form.getAttribute("action") || form.getAttribute("action") === "#") {
        if (status) status.textContent = "Private preview \u2014 no message is sent.";
        return;
      }
      if (!form.reportValidity() || form.dataset.sending === "true") return;
      form.dataset.sending = "true";
      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      const fields = Object.fromEntries(new FormData(form)), serialized = JSON.stringify(fields);
      if (previous && previous !== serialized) requestId = crypto.randomUUID();
      previous = serialized;
      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...fields, requestId })
        });
        const result = await response.json();
        if (!response.ok)
          throw Error(result.message || result.error || "Unable to send your inquiry.");
        if (status)
          status.textContent = "Thank you. Your inquiry has been sent. Our team will confirm the next steps.";
        form.reset();
        requestId = crypto.randomUUID();
        previous = "";
      } catch (error) {
        if (status)
          status.textContent = error instanceof Error ? error.message : "Unable to send your inquiry.";
      } finally {
        delete form.dataset.sending;
        if (button) button.disabled = false;
      }
    });
  });
}
__name(auravellRuntime, "auravellRuntime");

// ../../../../private/tmp/web-radar-native-original/src/templates/themes/careflow/runtime.ts
function careflowRuntime() {
  if (document.body.dataset.template !== "careflow-healthcare" || document.body.dataset.careflowReady)
    return;
  document.body.dataset.careflowReady = "true";
  const toggle = document.querySelector("[data-careflow-menu]");
  const nav = document.getElementById("careflow-navigation");
  const closeMenu = /* @__PURE__ */ __name(() => {
    nav?.classList.remove("cf-menu-open");
    toggle?.setAttribute("aria-expanded", "false");
  }, "closeMenu");
  toggle?.addEventListener("click", () => {
    const open = !nav?.classList.contains("cf-menu-open");
    nav?.classList.toggle("cf-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav?.classList.contains("cf-menu-open")) {
      closeMenu();
      toggle?.focus();
    }
  });
  matchMedia("(min-width: 992px)").addEventListener("change", closeMenu);
  document.querySelectorAll(".accordion-item-wrapper").forEach((item, i) => {
    const heading = item.querySelector(".accordion-heading");
    const panel = item.querySelector(".accordion-body");
    if (!heading || !panel) return;
    panel.id = `careflow-accordion-${i}`;
    heading.setAttribute("role", "button");
    heading.tabIndex = 0;
    heading.setAttribute("aria-controls", panel.id);
    const set = /* @__PURE__ */ __name((open) => {
      heading.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      item.classList.toggle("cf-expanded", open);
    }, "set");
    set(i === 0);
    heading.addEventListener("click", () => set(Boolean(panel.hidden)));
    heading.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        set(Boolean(panel.hidden));
      }
    });
  });
  document.querySelectorAll(".w-tabs").forEach((group, groupIndex) => {
    const tabs = [...group.querySelectorAll(".w-tab-link")];
    const panels = [...group.querySelectorAll(".w-tab-pane")];
    group.querySelector(".w-tab-menu")?.setAttribute("role", "tablist");
    const activate = /* @__PURE__ */ __name((index) => {
      tabs.forEach((tab, i) => {
        tab.classList.toggle("w--current", i === index);
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        panel.classList.toggle("w--tab-active", i === index);
        panel.hidden = i !== index;
      });
    }, "activate");
    tabs.forEach((tab, i) => {
      tab.id = `careflow-tab-${groupIndex}-${i}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", `careflow-panel-${groupIndex}-${i}`);
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        activate(i);
      });
      tab.addEventListener("keydown", (e) => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
          e.preventDefault();
          const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
          activate(next);
          tabs[next].focus();
        }
      });
    });
    panels.forEach((panel, i) => {
      panel.id = `careflow-panel-${groupIndex}-${i}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `careflow-tab-${groupIndex}-${i}`);
    });
    activate(0);
  });
  document.querySelectorAll(".w-slider").forEach((slider) => {
    const track = slider.querySelector(".w-slider-mask");
    if (!track) return;
    for (const [cls, direction, label] of [
      [".w-slider-arrow-left", -1, "Previous specialists"],
      [".w-slider-arrow-right", 1, "Next specialists"]
    ]) {
      const button = slider.querySelector(cls);
      if (!button) continue;
      button.setAttribute("role", "button");
      button.tabIndex = 0;
      button.setAttribute("aria-label", label);
      const move = /* @__PURE__ */ __name(() => track.scrollBy({
        left: direction * (track.firstElementChild?.getBoundingClientRect().width || 400),
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
      }), "move");
      button.addEventListener("click", move);
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          move();
        }
      });
    }
  });
  document.querySelectorAll("form[data-careflow-form]").forEach((form) => {
    let requestId = crypto.randomUUID(), previous = "";
    const selected = new URL(location.href).searchParams.get("productId");
    const select = form.querySelector('[name="productId"]');
    if (select && selected && [...select.options].some((o) => o.value === selected))
      select.value = selected;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector('[role="status"]');
      if (form.dataset.wrPreviewDisabled === "true" || !form.getAttribute("action") || form.getAttribute("action") === "#") {
        if (status) status.textContent = "Private preview \u2014 no message is sent.";
        return;
      }
      if (!form.reportValidity() || form.dataset.sending === "true") return;
      form.dataset.sending = "true";
      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      const fields = Object.fromEntries(new FormData(form)), serialized = JSON.stringify(fields);
      if (previous && previous !== serialized) requestId = crypto.randomUUID();
      previous = serialized;
      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...fields, requestId })
        });
        const result = await response.json();
        if (!response.ok)
          throw Error(result.message || result.error || "Unable to send your inquiry.");
        if (status)
          status.textContent = "Thank you. Your inquiry has been sent. Our team will confirm the next steps.";
        form.reset();
        requestId = crypto.randomUUID();
        previous = "";
      } catch (error) {
        if (status)
          status.textContent = error instanceof Error ? error.message : "Unable to send your inquiry.";
      } finally {
        delete form.dataset.sending;
        if (button) button.disabled = false;
      }
    });
  });
}
__name(careflowRuntime, "careflowRuntime");
export {
  auravellRuntime,
  careflowRuntime
};
