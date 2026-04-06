/**
 * routes/subscriptions.js
 * CRUD for tracked subscriptions and utilisation audits.
 *
 * In-memory store used for MVP (swap for PostgreSQL queries in production).
 */

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { calcSubscriptionUtilization } = require("../services/financialCalculator");

// Simple in-memory store (per-process, resets on restart)
const subscriptions = new Map();

// GET /api/subscriptions
router.get("/", (req, res) => {
  const userId = req.query.userId || "default";
  const userSubs = [...subscriptions.values()].filter((s) => s.userId === userId);
  res.json(userSubs);
});

// POST /api/subscriptions
router.post("/", (req, res) => {
  const { userId = "default", name, monthlyCost, category } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  if (!monthlyCost || monthlyCost <= 0)
    return res.status(400).json({ error: "monthlyCost must be positive" });

  const id = uuidv4();
  const sub = {
    id,
    userId,
    name,
    monthlyCost: Number(monthlyCost),
    category: category || "entertainment",
    hoursUsed: 0,
    createdAt: new Date().toISOString(),
  };
  subscriptions.set(id, sub);
  res.status(201).json(sub);
});

// PUT /api/subscriptions/:id/usage
router.put("/:id/usage", (req, res) => {
  const sub = subscriptions.get(req.params.id);
  if (!sub) return res.status(404).json({ error: "Subscription not found" });

  const { hoursUsed, targetUtility = 2.0 } = req.body;
  if (hoursUsed == null || hoursUsed < 0)
    return res.status(400).json({ error: "hoursUsed must be >= 0" });

  sub.hoursUsed = Number(hoursUsed);
  const audit = calcSubscriptionUtilization(sub.monthlyCost, sub.hoursUsed, Number(targetUtility));
  Object.assign(sub, { audit, updatedAt: new Date().toISOString() });
  subscriptions.set(sub.id, sub);
  res.json(sub);
});

// DELETE /api/subscriptions/:id
router.delete("/:id", (req, res) => {
  if (!subscriptions.has(req.params.id))
    return res.status(404).json({ error: "Subscription not found" });
  subscriptions.delete(req.params.id);
  res.status(204).end();
});

module.exports = router;
