/**
 * content.js — Oppty Chrome Extension Content Script
 *
 * Detects price tags on e-commerce pages and overlays them with
 * "True Cost" information (labor hours & future value).
 *
 * Manifest V3 compatible. Runs at document_idle.
 */

(function () {
  "use strict";

  // ─── Configuration ────────────────────────────────────────────────────────
  const DEFAULT_HOURLY_RATE = 25; // USD/hr after tax
  const DEFAULT_ANNUAL_RATE = 0.07;
  const DEFAULT_YEARS = 10;
  const OVERLAY_CLASS = "oppty-overlay";
  const PROCESSED_ATTR = "data-oppty-processed";

  // Price regex: matches $1,234.56 · $1234 · $0.99 etc.
  const PRICE_REGEX = /\$\s?[\d,]+(?:\.\d{1,2})?/g;

  // ─── Financial calculations (mirrors backend logic) ────────────────────────
  function calcLaborHours(price, hourlyRateNet) {
    const hours = price / hourlyRateNet;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h > 0) return `${h}h ${m}m of work`;
    return `${m} min of work`;
  }

  function calcFutureValue(price, rate, years) {
    const fv = price * Math.pow(1 + rate, years);
    return `$${Math.round(fv).toLocaleString()} in ${years}yr`;
  }

  function parsePrice(str) {
    return parseFloat(str.replace(/[$,\s]/g, ""));
  }

  // ─── Settings (loaded from chrome.storage.sync) ────────────────────────────
  let settings = {
    hourlyRateNet: DEFAULT_HOURLY_RATE,
    annualRate: DEFAULT_ANNUAL_RATE,
    years: DEFAULT_YEARS,
    mode: "hours", // "hours" | "fv" | "both"
    enabled: true,
  };

  function loadSettings(cb) {
    chrome.storage.sync.get(
      ["hourlyRateNet", "annualRate", "years", "mode", "enabled"],
      (stored) => {
        Object.assign(settings, stored);
        cb();
      }
    );
  }

  // ─── Overlay rendering ─────────────────────────────────────────────────────
  function makeOverlay(price) {
    const wrap = document.createElement("span");
    wrap.className = OVERLAY_CLASS;
    wrap.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.85em;
      font-weight: 700;
      background: #0d1117;
      color: #58a6ff;
      border: 1px solid #30363d;
      border-radius: 4px;
      padding: 1px 6px;
      margin-left: 4px;
      vertical-align: middle;
      cursor: help;
      white-space: nowrap;
    `;

    const laborText = calcLaborHours(price, settings.hourlyRateNet);
    const fvText = calcFutureValue(price, settings.annualRate, settings.years);

    let content;
    if (settings.mode === "hours") content = `⬡ ${laborText}`;
    else if (settings.mode === "fv") content = `◈ ${fvText}`;
    else content = `⬡ ${laborText} · ◈ ${fvText}`;

    wrap.textContent = content;

    const tooltip = `Oppty True Cost:\n• ${laborText} (at $${settings.hourlyRateNet}/hr net)\n• Future value: ${fvText} at ${(settings.annualRate * 100).toFixed(1)}%`;
    wrap.title = tooltip;

    return wrap;
  }

  // ─── DOM processing ────────────────────────────────────────────────────────
  /**
   * Known price element selectors for major e-commerce sites.
   * Falls back to text scanning for uncovered sites.
   */
  const SITE_SELECTORS = [
    // Amazon
    ".a-price .a-offscreen",
    ".a-price-whole",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    ".apexPriceToPay .a-offscreen",
    // Best Buy
    ".priceView-hero-price span",
    ".priceView-customer-price span",
    // Apple
    ".rc-prices-fullprice",
    ".price",
    // Walmart
    "[itemprop='price']",
    ".price-characteristic",
    // eBay
    ".x-price-primary .ux-textspans",
    "#prcIsum",
    // Target
    "[data-test='product-price']",
    // Etsy
    ".wt-text-title-01 .currency-value",
    ".listing-page-price-info .currency-value",
  ];

  function processElement(el) {
    if (el.hasAttribute(PROCESSED_ATTR)) return;
    const text = el.textContent.trim();
    const match = text.match(/[\d,]+(?:\.\d{1,2})?/);
    if (!match) return;
    const price = parseFloat(match[0].replace(/,/g, ""));
    if (!isFinite(price) || price <= 0 || price > 1_000_000) return;

    el.setAttribute(PROCESSED_ATTR, "true");
    const overlay = makeOverlay(price);
    el.insertAdjacentElement("afterend", overlay);
  }

  function processPage() {
    if (!settings.enabled) return;

    // Try structured selectors first
    const found = new Set();
    for (const selector of SITE_SELECTORS) {
      document.querySelectorAll(selector).forEach((el) => {
        if (!found.has(el)) {
          found.add(el);
          processElement(el);
        }
      });
    }
  }

  // ─── MutationObserver for dynamic pages (SPAs) ────────────────────────────
  const observer = new MutationObserver((mutations) => {
    let needsProcess = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        needsProcess = true;
        break;
      }
    }
    if (needsProcess) processPage();
  });

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  loadSettings(() => {
    if (!settings.enabled) return;
    processPage();
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Listen for settings updates from popup
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SETTINGS_UPDATED") {
      Object.assign(settings, msg.settings);
      // Remove existing overlays and re-process
      document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach((el) => el.remove());
      document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) =>
        el.removeAttribute(PROCESSED_ATTR)
      );
      processPage();
    }
  });
})();
