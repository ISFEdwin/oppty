/**
 * routes/goals.js
 * Financial goals – track "Big Goals" (house, car, travel fund, retirement, etc.)
 */

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const goals = new Map();

// GET /api/goals
router.get("/", (req, res) => {
  const userId = req.query.userId || "default";
  const userGoals = [...goals.values()].filter((g) => g.userId === userId);
  res.json(userGoals);
});

// POST /api/goals
router.post("/", (req, res) => {
  const { userId = "default", name, targetAmount, category, targetDate } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  if (!targetAmount || targetAmount <= 0)
    return res.status(400).json({ error: "targetAmount must be positive" });

  const id = uuidv4();
  const goal = {
    id,
    userId,
    name,
    targetAmount: Number(targetAmount),
    savedAmount: 0,
    category: category || "general",
    targetDate: targetDate || null,
    createdAt: new Date().toISOString(),
  };
  goals.set(id, goal);
  res.status(201).json({ ...goal, progressPct: 0 });
});

// PUT /api/goals/:id/progress
router.put("/:id/progress", (req, res) => {
  const goal = goals.get(req.params.id);
  if (!goal) return res.status(404).json({ error: "Goal not found" });

  const { savedAmount } = req.body;
  if (savedAmount == null || savedAmount < 0)
    return res.status(400).json({ error: "savedAmount must be >= 0" });

  goal.savedAmount = Number(savedAmount);
  goal.updatedAt = new Date().toISOString();
  goals.set(goal.id, goal);

  const progressPct = Math.min(100, parseFloat(((goal.savedAmount / goal.targetAmount) * 100).toFixed(1)));
  res.json({ ...goal, progressPct });
});

// DELETE /api/goals/:id
router.delete("/:id", (req, res) => {
  if (!goals.has(req.params.id)) return res.status(404).json({ error: "Goal not found" });
  goals.delete(req.params.id);
  res.status(204).end();
});

module.exports = router;
