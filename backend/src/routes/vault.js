/**
 * routes/vault.js
 * Anti-Impulse Vault – 48-hour cooling-off period for high-value items.
 *
 * In-memory store used for MVP (swap for PostgreSQL in production).
 */

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { buildRationalityReport } = require("../services/financialCalculator");

const COOLING_HOURS = 48;
const vaultItems = new Map();

function isLocked(item) {
  const lockedUntil = new Date(item.lockedUntil);
  return new Date() < lockedUntil;
}

// GET /api/vault  – list all vault items for a user
router.get("/", (req, res) => {
  const userId = req.query.userId || "default";
  const items = [...vaultItems.values()]
    .filter((i) => i.userId === userId)
    .map((i) => ({ ...i, locked: isLocked(i) }));
  res.json(items);
});

// POST /api/vault  – add an item to the vault (starts cooling-off)
router.post("/", (req, res) => {
  const {
    userId = "default",
    itemName,
    price,
    url,
    hourlyRateNet = 25,
    annualRate = 0.07,
    years = 10,
    goalName,
    goalTarget,
  } = req.body;

  if (!itemName) return res.status(400).json({ error: "itemName is required" });
  if (!price || price <= 0) return res.status(400).json({ error: "price must be positive" });

  const id = uuidv4();
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + COOLING_HOURS * 60 * 60 * 1000).toISOString();

  const report = buildRationalityReport({
    price: Number(price),
    hourlyRateNet: Number(hourlyRateNet),
    annualRate: Number(annualRate),
    years: Number(years),
  });

  const item = {
    id,
    userId,
    itemName,
    price: Number(price),
    url: url || null,
    goalName: goalName || null,
    goalTarget: goalTarget ? Number(goalTarget) : null,
    rationalityReport: report,
    addedAt: now.toISOString(),
    lockedUntil,
    locked: true,
    decision: null,
  };

  vaultItems.set(id, item);
  res.status(201).json(item);
});

// PUT /api/vault/:id/decide  – user decides to buy or skip after cooling-off
router.put("/:id/decide", (req, res) => {
  const item = vaultItems.get(req.params.id);
  if (!item) return res.status(404).json({ error: "Vault item not found" });

  if (isLocked(item))
    return res.status(423).json({
      error: "Item is still in the cooling-off period",
      lockedUntil: item.lockedUntil,
    });

  const { decision } = req.body; // "buy" | "skip"
  if (!["buy", "skip"].includes(decision))
    return res.status(400).json({ error: 'decision must be "buy" or "skip"' });

  item.decision = decision;
  item.decidedAt = new Date().toISOString();
  vaultItems.set(item.id, item);
  res.json(item);
});

// DELETE /api/vault/:id  – remove item from vault
router.delete("/:id", (req, res) => {
  if (!vaultItems.has(req.params.id))
    return res.status(404).json({ error: "Vault item not found" });
  vaultItems.delete(req.params.id);
  res.status(204).end();
});

module.exports = router;
