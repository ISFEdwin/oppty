/**
 * popup.js — Oppty Extension Popup Controller
 */

(function () {
  "use strict";

  const APP_URL = "http://localhost:3000"; // Update for production deployment

  const enabledToggle = document.getElementById("enabled-toggle");
  const toggleLabel = document.getElementById("toggle-label");
  const hourlyRateInput = document.getElementById("hourly-rate");
  const annualRateInput = document.getElementById("annual-rate");
  const yearsInput = document.getElementById("years");
  const saveBtn = document.getElementById("save-btn");
  const openAppBtn = document.getElementById("open-app-btn");
  const statusEl = document.getElementById("status");
  const fvSettings = document.getElementById("fv-settings");
  const modeBtns = document.querySelectorAll(".mode-btn");

  let selectedMode = "hours";

  // ─── Load saved settings ────────────────────────────────────────────────
  chrome.storage.sync.get(
    ["hourlyRateNet", "annualRate", "years", "mode", "enabled"],
    (stored) => {
      if (stored.hourlyRateNet) hourlyRateInput.value = stored.hourlyRateNet;
      if (stored.annualRate) annualRateInput.value = (stored.annualRate * 100).toFixed(1);
      if (stored.years) yearsInput.value = stored.years;
      if (stored.mode) {
        selectedMode = stored.mode;
        updateModeBtns();
      }
      if (stored.enabled === false) {
        enabledToggle.checked = false;
        toggleLabel.textContent = "OFF";
      }
      updateFvVisibility();
    }
  );

  // ─── Mode buttons ────────────────────────────────────────────────────────
  function updateModeBtns() {
    modeBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === selectedMode);
    });
  }

  function updateFvVisibility() {
    fvSettings.style.display =
      selectedMode === "fv" || selectedMode === "both" ? "flex" : "none";
  }

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedMode = btn.dataset.mode;
      updateModeBtns();
      updateFvVisibility();
    });
  });

  // ─── Toggle ──────────────────────────────────────────────────────────────
  enabledToggle.addEventListener("change", () => {
    toggleLabel.textContent = enabledToggle.checked ? "ON" : "OFF";
  });

  // ─── Save ────────────────────────────────────────────────────────────────
  saveBtn.addEventListener("click", () => {
    const newSettings = {
      hourlyRateNet: parseFloat(hourlyRateInput.value) || 25,
      annualRate: (parseFloat(annualRateInput.value) || 7) / 100,
      years: parseInt(yearsInput.value) || 10,
      mode: selectedMode,
      enabled: enabledToggle.checked,
    };

    chrome.storage.sync.set(newSettings, () => {
      // Notify active tab's content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "SETTINGS_UPDATED",
            settings: newSettings,
          });
        }
      });
      statusEl.textContent = "✓ Settings applied to this page";
      setTimeout(() => (statusEl.textContent = ""), 2500);
    });
  });

  // ─── Open App ───────────────────────────────────────────────────────────
  openAppBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: APP_URL });
  });
})();
