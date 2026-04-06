/**
 * routes/analysis.js
 * POST /api/analysis/report  – Generate a full Rationality Report for a purchase
 * POST /api/analysis/recurring – Recurring cost (e.g. daily coffee) FV impact
 */

const express = require("express");
const router = express.Router();
const {
  buildRationalityReport,
  calcRecurringFutureValue,
} = require("../services/financialCalculator");

// POST /api/analysis/report
router.post("/report", (req, res) => {
  try {
    const { price, hourlyRateNet, annualRate, years, category, itemName } = req.body;

    if (price == null || price < 0)
      return res.status(400).json({ error: "price must be a non-negative number" });
    if (!hourlyRateNet || hourlyRateNet <= 0)
      return res.status(400).json({ error: "hourlyRateNet must be a positive number" });

    const report = buildRationalityReport({
      price: Number(price),
      hourlyRateNet: Number(hourlyRateNet),
      annualRate: annualRate != null ? Number(annualRate) : 0.07,
      years: years != null ? Number(years) : 10,
      category: category || "general",
    });

    res.json({ itemName: itemName || null, ...report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/recurring
router.post("/recurring", (req, res) => {
  try {
    const { dailyCost, annualRate, years } = req.body;

    if (dailyCost == null || dailyCost <= 0)
      return res.status(400).json({ error: "dailyCost must be a positive number" });

    const result = calcRecurringFutureValue(
      Number(dailyCost),
      annualRate != null ? Number(annualRate) : 0.07,
      years != null ? Number(years) : 30
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
