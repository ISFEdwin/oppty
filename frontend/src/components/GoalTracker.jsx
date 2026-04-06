import { useState } from "react";
import { fmt } from "../utils/financialCalculator.js";

const CATEGORY_COLORS = {
  retirement: "rgba(88, 166, 255, 0.2)",
  house: "rgba(57, 213, 208, 0.2)",
  travel: "rgba(188, 140, 255, 0.2)",
  car: "rgba(210, 153, 34, 0.2)",
  education: "rgba(63, 185, 80, 0.2)",
  other: "rgba(139, 148, 158, 0.15)",
};

const INITIAL_GOALS = [
  { id: "1", name: "Emergency Fund", targetAmount: 15000, savedAmount: 8200, category: "other", targetDate: "2025-12-31" },
  { id: "2", name: "House Down Payment", targetAmount: 80000, savedAmount: 12500, category: "house", targetDate: "2028-06-01" },
  { id: "3", name: "Retirement (Roth IRA)", targetAmount: 500000, savedAmount: 47000, category: "retirement", targetDate: "2055-01-01" },
];

function GoalCard({ goal, onUpdateProgress, onRemove }) {
  const progress = Math.min(100, ((goal.savedAmount / goal.targetAmount) * 100));
  const remaining = goal.targetAmount - goal.savedAmount;
  const color = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.other;
  const [editing, setEditing] = useState(false);
  const [tempSaved, setTempSaved] = useState(goal.savedAmount);

  return (
    <div
      className="goal-card"
      style={{ "--goal-color": color }}
    >
      <div className="card-header">
        <div>
          <div className="card-title">{goal.name}</div>
          <div className="card-subtitle">
            Target: {fmt(goal.targetAmount)}
            {goal.targetDate && ` · Due ${new Date(goal.targetDate).toLocaleDateString()}`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="badge"
            style={{
              background: color,
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {goal.category}
          </span>
          <button
            className="btn btn-danger"
            style={{ padding: "3px 8px", fontSize: 11 }}
            onClick={() => onRemove(goal.id)}
          >
            ×
          </button>
        </div>
      </div>

      {/* Watercolor progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="mono text-blue" style={{ fontSize: 20, fontWeight: 700 }}>
            {fmt(goal.savedAmount)}
          </span>
          <span className="mono text-muted" style={{ fontSize: 13 }}>
            {progress.toFixed(1)}% · {fmt(remaining)} remaining
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progress}%`,
              background:
                progress >= 100
                  ? "linear-gradient(90deg, var(--accent-green), #56d364)"
                  : progress >= 50
                  ? "linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))"
                  : "linear-gradient(90deg, var(--accent-amber), var(--accent-blue))",
            }}
          />
        </div>
      </div>

      {/* Watercolor landscape emoji row — becomes more vivid as progress increases */}
      <div
        style={{
          fontSize: 20,
          letterSpacing: 2,
          opacity: 0.3 + (progress / 100) * 0.7,
          transition: "opacity 0.5s",
          marginBottom: 12,
          filter: progress < 50 ? "grayscale(80%)" : progress < 80 ? "grayscale(30%)" : "none",
        }}
      >
        {progress < 25 ? "🌫️ 🏔️ · · · · · · · ·" :
         progress < 50 ? "🌤️ 🏔️ 🌿 · · · · · ·" :
         progress < 75 ? "☀️ 🏔️ 🌿 🏡 · · · · ·" :
         progress < 100 ? "☀️ 🏔️ 🌲 🏡 🌸 · · · ·" :
                          "🌟 🏔️ 🌲 🏡 🌸 🎊 🌈 ✨"}
      </div>

      {editing ? (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Update Saved Amount ($)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="100"
              value={tempSaved}
              onChange={(e) => setTempSaved(parseFloat(e.target.value) || 0)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { onUpdateProgress(goal.id, tempSaved); setEditing(false); }}
          >
            Save
          </button>
          <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn-ghost" onClick={() => { setTempSaved(goal.savedAmount); setEditing(true); }}>
          Update Progress
        </button>
      )}
    </div>
  );
}

export default function GoalTracker() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    category: "other",
    targetDate: "",
  });

  const addGoal = () => {
    if (!form.name || !form.targetAmount) return;
    setGoals((g) => [
      ...g,
      {
        id: Date.now().toString(),
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        savedAmount: 0,
        category: form.category,
        targetDate: form.targetDate || null,
      },
    ]);
    setForm({ name: "", targetAmount: "", category: "other", targetDate: "" });
    setShowForm(false);
  };

  const updateProgress = (id, savedAmount) => {
    setGoals((g) => g.map((goal) => (goal.id === id ? { ...goal, savedAmount } : goal)));
  };

  const removeGoal = (id) => setGoals((g) => g.filter((goal) => goal.id !== id));

  const totalSaved = goals.reduce((acc, g) => acc + g.savedAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">◉ Goal Tracker</h1>
        <p className="page-subtitle">
          Your financial landscape — from a rough sketch to a full-colour painting.
        </p>
      </div>

      {/* Overview */}
      <div className="card mb-24">
        <div className="card-header">
          <div>
            <div className="card-title">Overall Progress</div>
            <div className="card-subtitle">
              {fmt(totalSaved)} saved of {fmt(totalTarget)} across {goals.length} goals
            </div>
          </div>
          <span className="mono text-blue" style={{ fontSize: 20, fontWeight: 700 }}>
            {overallProgress.toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar-track" style={{ height: 10 }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${overallProgress}%`, height: "100%" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "◉ Add Goal"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-24">
          <div className="card-title mb-16">New Goal</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Goal Name</label>
              <input
                className="form-input"
                placeholder="e.g. Japan Trip Fund"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Amount ($)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="100"
                placeholder="10000"
                value={form.targetAmount}
                onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="retirement">Retirement</option>
                <option value="house">House</option>
                <option value="travel">Travel</option>
                <option value="car">Car</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Date (optional)</label>
              <input
                className="form-input"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={addGoal}
            disabled={!form.name || !form.targetAmount}
          >
            ◉ Create Goal
          </button>
        </div>
      )}

      {goals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◉</div>
          <p>No goals yet. Create your first Big Goal to start building your financial future.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdateProgress={updateProgress}
            onRemove={removeGoal}
          />
        ))}
      </div>
    </div>
  );
}
