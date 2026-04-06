import { useState } from "react";
import { Link } from "react-router-dom";
import { calcLaborHours, calcFutureValue, calcRecurringFutureValue, fmt } from "../utils/financialCalculator.js";

// Hardcoded demo profile for the dashboard overview
const DEMO_PROFILE = { hourlyRateNet: 28, annualRate: 0.07 };
const DEMO_ITEMS = [
  { name: "MacBook Pro 14″", price: 2499, category: "tech" },
  { name: "Daily Coffee ☕", price: 5.5, daily: true, years: 30 },
  { name: "Designer Jacket", price: 600, category: "clothing" },
];

export default function Dashboard() {
  const [hourlyRate] = useState(DEMO_PROFILE.hourlyRateNet);

  const laptop = calcLaborHours(2499, hourlyRate);
  const coffee = calcRecurringFutureValue(5.5, 0.07, 30);
  const jacket = calcFutureValue(600, 0.07, 10);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Financial Cockpit</h1>
        <p className="page-subtitle">
          Every price tag, translated into its true cost. Make rational decisions, not emotional ones.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid-4 mb-24">
        <div className="stat-chip accent-blue">
          <div className="stat-label">Hourly Rate (net)</div>
          <div className="stat-value">{fmt(hourlyRate)}</div>
          <div className="stat-sub">per hour after tax</div>
        </div>
        <div className="stat-chip accent-amber">
          <div className="stat-label">Daily Coffee FV (30yr)</div>
          <div className="stat-value">{fmt(coffee.futureValue)}</div>
          <div className="stat-sub">if invested instead</div>
        </div>
        <div className="stat-chip accent-green">
          <div className="stat-label">Laptop in Work Hours</div>
          <div className="stat-value">{laptop?.hours}h</div>
          <div className="stat-sub">at {fmt(hourlyRate)}/hr net</div>
        </div>
        <div className="stat-chip accent-purple">
          <div className="stat-label">Jacket Opportunity</div>
          <div className="stat-value">{fmt(jacket.futureValue)}</div>
          <div className="stat-sub">in 10 years at 7%</div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="grid-2 gap-16">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">⬡ Example Purchases</div>
              <div className="card-subtitle">Labour-hour translation at {fmt(hourlyRate)}/hr net</div>
            </div>
            <Link to="/report" className="btn btn-ghost">Analyse →</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Hours of Work</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ITEMS.filter((i) => !i.daily).map((item) => {
                const lh = calcLaborHours(item.price, hourlyRate);
                return (
                  <tr key={item.name}>
                    <td className="mono">{item.name}</td>
                    <td className="mono text-amber">{fmt(item.price)}</td>
                    <td className="mono text-blue">{lh?.formatted}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">◈ Recurring Cost Impact</div>
              <div className="card-subtitle">Daily coffee at $5.50 · 30 years · 7% return</div>
            </div>
            <Link to="/report" className="btn btn-ghost">Model →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
            <div className="report-dimension blue">
              <span className="dimension-label">Total Spent</span>
              <span className="dimension-value">{fmt(coffee.totalSpent)}</span>
              <span className="dimension-desc">Out-of-pocket over 30 years</span>
            </div>
            <div className="report-dimension green">
              <span className="dimension-label">Future Value if Invested</span>
              <span className="dimension-value">{fmt(coffee.futureValue)}</span>
              <span className="dimension-desc">Compound growth at 7% annually</span>
            </div>
            <div className="report-dimension purple">
              <span className="dimension-label">Opportunity Cost</span>
              <span className="dimension-value">{fmt(coffee.opportunityCost)}</span>
              <span className="dimension-desc">The "price" of convenience</span>
            </div>
          </div>
        </div>
      </div>

      <div className="schematic-divider mt-24" />

      {/* Feature Quick Links */}
      <div className="grid-3 gap-16 mt-16">
        {[
          {
            to: "/vault",
            icon: "⬖",
            title: "Anti-Impulse Vault",
            desc: "Lock high-ticket purchases for 48 hours. Let logic, not emotion, decide.",
            accent: "var(--accent-amber)",
          },
          {
            to: "/subscriptions",
            icon: "◇",
            title: "Subscription Audit",
            desc: "Calculate your cost-per-hour for every subscription. Spot the zombie services.",
            accent: "var(--accent-red)",
          },
          {
            to: "/goals",
            icon: "◉",
            title: "Goal Tracker",
            desc: "Track progress toward Big Goals — house, car, retirement, freedom.",
            accent: "var(--accent-green)",
          },
        ].map(({ to, icon, title, desc, accent }) => (
          <Link
            key={to}
            to={to}
            style={{ textDecoration: "none" }}
          >
            <div
              className="card"
              style={{
                borderColor: accent,
                transition: "transform 0.15s",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div className="card-title" style={{ marginBottom: 6 }}>{title}</div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
