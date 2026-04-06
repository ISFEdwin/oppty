import { useState, useCallback } from "react";
import { calcSubscriptionUtilization, fmt, fmtDec } from "../utils/financialCalculator.js";

const INITIAL_SUBS = [
  { id: "1", name: "Netflix", monthlyCost: 15.49, category: "entertainment", hoursUsed: 2 },
  { id: "2", name: "Spotify", monthlyCost: 9.99, category: "music", hoursUsed: 30 },
  { id: "3", name: "Adobe Creative Cloud", monthlyCost: 54.99, category: "productivity", hoursUsed: 5 },
  { id: "4", name: "Gym Membership", monthlyCost: 49.99, category: "health", hoursUsed: 8 },
];

function getAudit(sub, targetUtility) {
  return calcSubscriptionUtilization(sub.monthlyCost, sub.hoursUsed, targetUtility);
}

export default function SubscriptionAuditor() {
  const [subs, setSubs] = useState(INITIAL_SUBS);
  const [targetUtility, setTargetUtility] = useState(2.0);
  const [newForm, setNewForm] = useState({ name: "", monthlyCost: "", category: "entertainment" });

  const addSub = useCallback(() => {
    if (!newForm.name || !newForm.monthlyCost) return;
    setSubs((s) => [
      ...s,
      {
        id: Date.now().toString(),
        name: newForm.name,
        monthlyCost: parseFloat(newForm.monthlyCost),
        category: newForm.category,
        hoursUsed: 0,
      },
    ]);
    setNewForm({ name: "", monthlyCost: "", category: "entertainment" });
  }, [newForm]);

  const updateHours = (id, hours) => {
    setSubs((s) =>
      s.map((sub) => (sub.id === id ? { ...sub, hoursUsed: parseFloat(hours) || 0 } : sub))
    );
  };

  const removeSub = (id) => setSubs((s) => s.filter((sub) => sub.id !== id));

  const totalMonthly = subs.reduce((acc, s) => acc + s.monthlyCost, 0);
  const zombies = subs.filter((s) => {
    const audit = getAudit(s, targetUtility);
    return audit.exceeds;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">◇ Subscription Auditor</h1>
        <p className="page-subtitle">
          Track your subscriptions and expose the ones you are overpaying for.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid-3 mb-24">
        <div className="stat-chip accent-blue">
          <div className="stat-label">Monthly Spend</div>
          <div className="stat-value">{fmtDec(totalMonthly)}</div>
          <div className="stat-sub">{fmtDec(totalMonthly * 12)} / year</div>
        </div>
        <div className="stat-chip accent-red">
          <div className="stat-label">Zombie Services</div>
          <div className="stat-value">{zombies.length}</div>
          <div className="stat-sub">exceeding {fmtDec(targetUtility)}/hr threshold</div>
        </div>
        <div className="stat-chip accent-amber">
          <div className="stat-label">Potential Monthly Savings</div>
          <div className="stat-value">
            {fmtDec(zombies.reduce((acc, s) => acc + s.monthlyCost, 0))}
          </div>
          <div className="stat-sub">if zombie services are cancelled</div>
        </div>
      </div>

      {/* Target utility control */}
      <div className="card mb-16">
        <div className="card-header">
          <div>
            <div className="card-title">Target Utility Threshold</div>
            <div className="card-subtitle">
              Maximum acceptable cost per hour for any subscription
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="mono text-amber" style={{ fontSize: 20, fontWeight: 700 }}>
              {fmtDec(targetUtility)}/hr
            </span>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={targetUtility}
              onChange={(e) => setTargetUtility(parseFloat(e.target.value))}
              style={{ width: 120 }}
            />
          </div>
        </div>
      </div>

      {/* Subscriptions table */}
      <div className="card mb-16">
        <div className="card-title mb-16">Active Subscriptions</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Monthly</th>
              <th>Hours Used</th>
              <th>Cost / Hour</th>
              <th>Status</th>
              <th>Break-even</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subs.map((sub) => {
              const audit = getAudit(sub, targetUtility);
              return (
                <tr key={sub.id}>
                  <td className="mono">{sub.name}</td>
                  <td className="mono">{fmtDec(sub.monthlyCost)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={sub.hoursUsed}
                      onChange={(e) => updateHours(sub.id, e.target.value)}
                      style={{
                        width: 70,
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: "var(--radius-sm)",
                        padding: "4px 8px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                      }}
                    />
                    <span className="text-muted" style={{ fontSize: 11, marginLeft: 4 }}>hrs</span>
                  </td>
                  <td className={`mono ${audit.exceeds ? "text-red" : "text-green"}`}>
                    {isFinite(audit.costPerHour) ? fmtDec(audit.costPerHour) : "∞"}
                  </td>
                  <td>
                    {audit.exceeds ? (
                      <span className="badge badge-red">Zombie</span>
                    ) : (
                      <span className="badge badge-green">Efficient</span>
                    )}
                  </td>
                  <td className="mono text-secondary">
                    {audit.breakEvenHours}h/mo
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                      onClick={() => removeSub(sub.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add subscription form */}
      <div className="card">
        <div className="card-title mb-16">+ Add Subscription</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Service Name</label>
            <input
              className="form-input"
              placeholder="e.g. Disney+"
              value={newForm.name}
              onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Cost ($)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="9.99"
              value={newForm.monthlyCost}
              onChange={(e) => setNewForm((f) => ({ ...f, monthlyCost: e.target.value }))}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={newForm.category}
            onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="entertainment">Entertainment</option>
            <option value="music">Music</option>
            <option value="productivity">Productivity</option>
            <option value="health">Health & Fitness</option>
            <option value="news">News & Education</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={addSub}
          disabled={!newForm.name || !newForm.monthlyCost}
        >
          + Add Subscription
        </button>
      </div>
    </div>
  );
}
