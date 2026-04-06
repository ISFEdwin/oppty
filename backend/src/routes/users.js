/**
 * routes/users.js
 * User profile – hourly rate, target utility threshold, name, etc.
 * In-memory store for MVP.
 */

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const users = new Map();

// GET /api/users/:id
router.get("/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// POST /api/users  – create / onboard a user
router.post("/", (req, res) => {
  const { name, hourlyRateNet, targetUtility = 2.0, annualRate = 0.07 } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  if (!hourlyRateNet || hourlyRateNet <= 0)
    return res.status(400).json({ error: "hourlyRateNet must be a positive number" });

  const id = uuidv4();
  const user = {
    id,
    name,
    hourlyRateNet: Number(hourlyRateNet),
    targetUtility: Number(targetUtility),
    annualRate: Number(annualRate),
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  res.status(201).json(user);
});

// PUT /api/users/:id  – update profile
router.put("/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { name, hourlyRateNet, targetUtility, annualRate } = req.body;
  if (name) user.name = name;
  if (hourlyRateNet != null) user.hourlyRateNet = Number(hourlyRateNet);
  if (targetUtility != null) user.targetUtility = Number(targetUtility);
  if (annualRate != null) user.annualRate = Number(annualRate);
  user.updatedAt = new Date().toISOString();

  users.set(user.id, user);
  res.json(user);
});

module.exports = router;
