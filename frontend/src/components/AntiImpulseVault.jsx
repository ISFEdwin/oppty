import { useState, useEffect } from "react";
import { calcLaborHours, calcFutureValue, calcUtilitySwaps, fmt, fmtDec } from "../utils/financialCalculator.js";

const COOLING_HOURS = 48;
const MS_PER_HOUR = 3600 * 1000;

function useCountdown(lockedUntil) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(lockedUntil) - Date.now()));

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, new Date(lockedUntil) - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, remaining]);

  if (remaining <= 0) return null;
  const h = Math.floor(remaining / MS_PER_HOUR);
  const m = Math.floor((remaining % MS_PER_HOUR) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function VaultItemCard({ item, onDecide, onRemove }) {
  const countdown = useCountdown(item.lockedUntil);
  const locked = countdown !== null;

  const lh = calcLaborHours(item.price, item.hourlyRateNet || 28);
  const fv = calcFutureValue(item.price, 0.07, 10);

  return (
    <div
      className="card"
      style={{ borderColor: locked ? "var(--accent-amber)" : "var(--border)" }}
    >
      <div className="card-header">
        <div>
          <div className="card-title">{item.itemName}</div>
          <div className="card-subtitle">{fmtDec(item.price)} · Added {new Date(item.addedAt).toLocaleDateString()}</div>
        </div>
        {locked ? (
          <span className="badge badge-amber">Cooling Off</span>
        ) : item.decision ? (
          <span className={`badge ${item.decision === "skip" ? "badge-green" : "badge-blue"}`}>
            {item.decision === "skip" ? "Skipped ✓" : "Purchased"}
          </span>
        ) : (
          <span className="badge badge-purple">Ready to Decide</span>
        )}
      </div>

      {locked && (
        <div className="alert alert-amber">
          <span className="alert-icon">⏱</span>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
              Cooling-off period expires in:
            </div>
            <div className="countdown">{countdown}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="report-dimension blue" style={{ flex: 1 }}>
          <span className="dimension-label">Labour Cost</span>
          <span className="dimension-value" style={{ fontSize: 16 }}>{lh?.formatted}</span>
        </div>
        <div className="report-dimension green" style={{ flex: 1 }}>
          <span className="dimension-label">10yr Opportunity</span>
          <span className="dimension-value" style={{ fontSize: 16 }}>{fmt(fv.futureValue)}</span>
        </div>
      </div>

      {item.goalName && (
        <div className="alert alert-blue" style={{ marginBottom: 12 }}>
          <span className="alert-icon">◉</span>
          <span>
            Skipping this gets you <strong>{fmt(item.price)}</strong> closer to your{" "}
            <strong>{item.goalName}</strong> goal
            {item.goalTarget ? ` (${fmt(item.goalTarget)} target)` : ""}.
          </span>
        </div>
      )}

      {!locked && !item.decision && (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-success"
            style={{ flex: 1 }}
            onClick={() => onDecide(item.id, "skip")}
          >
            ✓ Skip Purchase — Save {fmt(item.price)}
          </button>
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={() => onDecide(item.id, "buy")}
          >
            Proceed to Buy
          </button>
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn btn-danger"
          style={{ padding: "4px 10px", fontSize: 11 }}
          onClick={() => onRemove(item.id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function AntiImpulseVault() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    itemName: "",
    price: "",
    url: "",
    goalName: "",
    goalTarget: "",
    hourlyRateNet: "28",
    // Demo mode: for UI testing, we allow immediate unlock
    demoMode: false,
  });
  const [showForm, setShowForm] = useState(false);

  const addItem = () => {
    if (!form.itemName || !form.price) return;
    const now = new Date();
    const lockedUntil = form.demoMode
      ? new Date(now.getTime() + 10 * 1000).toISOString() // 10s for demo
      : new Date(now.getTime() + COOLING_HOURS * MS_PER_HOUR).toISOString();

    const newItem = {
      id: Date.now().toString(),
      itemName: form.itemName,
      price: parseFloat(form.price),
      url: form.url,
      goalName: form.goalName,
      goalTarget: form.goalTarget ? parseFloat(form.goalTarget) : null,
      hourlyRateNet: parseFloat(form.hourlyRateNet),
      addedAt: now.toISOString(),
      lockedUntil,
      decision: null,
    };
    setItems((prev) => [newItem, ...prev]);
    setForm({ itemName: "", price: "", url: "", goalName: "", goalTarget: "", hourlyRateNet: "28", demoMode: false });
    setShowForm(false);
  };

  const decide = (id, decision) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, decision, decidedAt: new Date().toISOString() } : item
      )
    );
  };

  const removeItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id));

  const locked = items.filter((i) => !i.decision && new Date(i.lockedUntil) > new Date());
  const pending = items.filter((i) => !i.decision && new Date(i.lockedUntil) <= new Date());
  const decided = items.filter((i) => i.decision);

  const moneySaved = decided
    .filter((i) => i.decision === "skip")
    .reduce((acc, i) => acc + i.price, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⬖ Anti-Impulse Vault</h1>
        <p className="page-subtitle">
          Lock high-value purchases for 48 hours. Let data, not dopamine, make the call.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid-3 mb-24">
        <div className="stat-chip accent-amber">
          <div className="stat-label">Items in Cooling Off</div>
          <div className="stat-value">{locked.length}</div>
          <div className="stat-sub">locked for 48 hrs</div>
        </div>
        <div className="stat-chip accent-purple">
          <div className="stat-label">Ready to Decide</div>
          <div className="stat-value">{pending.length}</div>
          <div className="stat-sub">cooling-off complete</div>
        </div>
        <div className="stat-chip accent-green">
          <div className="stat-label">Money Saved</div>
          <div className="stat-value">{fmt(moneySaved)}</div>
          <div className="stat-sub">by choosing to skip</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "⬖ Add Item to Vault"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card mb-24">
          <div className="card-title mb-16">Add Item to Vault</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input
                className="form-input"
                placeholder="e.g. Sony WH-1000XM5"
                value={form.itemName}
                onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="349.99"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Product URL (optional)</label>
            <input
              className="form-input"
              placeholder="https://amazon.com/..."
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your Net Hourly Rate ($)</label>
              <input
                className="form-input"
                type="number"
                min="0.01"
                step="0.01"
                value={form.hourlyRateNet}
                onChange={(e) => setForm((f) => ({ ...f, hourlyRateNet: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Link to a Goal (optional)</label>
              <input
                className="form-input"
                placeholder="e.g. House Down Payment"
                value={form.goalName}
                onChange={(e) => setForm((f) => ({ ...f, goalName: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Goal Target Amount ($)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                placeholder="50000"
                value={form.goalTarget}
                onChange={(e) => setForm((f) => ({ ...f, goalTarget: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={form.demoMode}
                  onChange={(e) => setForm((f) => ({ ...f, demoMode: e.target.checked }))}
                />
                Demo mode (unlock in 10s)
              </label>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={addItem}
            disabled={!form.itemName || !form.price}
          >
            ⬖ Lock in Vault
          </button>
        </div>
      )}

      {items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">⬖</div>
          <p>Your vault is empty. Next time you want to impulse-buy, add it here first.</p>
        </div>
      )}

      {/* Cooling-off items */}
      {locked.length > 0 && (
        <>
          <div className="card-title mb-12 text-amber">Cooling Off ({locked.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            {locked.map((item) => (
              <VaultItemCard key={item.id} item={item} onDecide={decide} onRemove={removeItem} />
            ))}
          </div>
        </>
      )}

      {/* Ready to decide */}
      {pending.length > 0 && (
        <>
          <div className="card-title mb-12 text-purple">Ready to Decide ({pending.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            {pending.map((item) => (
              <VaultItemCard key={item.id} item={item} onDecide={decide} onRemove={removeItem} />
            ))}
          </div>
        </>
      )}

      {/* Decided */}
      {decided.length > 0 && (
        <>
          <div className="schematic-divider" />
          <div className="card-title mb-12 text-muted">History ({decided.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {decided.map((item) => (
              <VaultItemCard key={item.id} item={item} onDecide={decide} onRemove={removeItem} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
