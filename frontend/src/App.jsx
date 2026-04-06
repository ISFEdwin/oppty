import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./components/Dashboard.jsx";
import RationalityReport from "./components/RationalityReport.jsx";
import SubscriptionAuditor from "./components/SubscriptionAuditor.jsx";
import AntiImpulseVault from "./components/AntiImpulseVault.jsx";
import GoalTracker from "./components/GoalTracker.jsx";

const NAV_ITEMS = [
  { to: "/", icon: "⬡", label: "Dashboard", end: true },
  { to: "/report", icon: "◈", label: "Rationality Report" },
  { to: "/vault", icon: "⬖", label: "Anti-Impulse Vault" },
  { to: "/subscriptions", icon: "◇", label: "Subscription Audit" },
  { to: "/goals", icon: "◉", label: "Goals" },
];

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">Ø oppty</div>
          <div className="logo-sub">Opportunity Cost</div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Core</span>
          {NAV_ITEMS.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-label">v1.0.0 · MVP</div>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report" element={<RationalityReport />} />
          <Route path="/vault" element={<AntiImpulseVault />} />
          <Route path="/subscriptions" element={<SubscriptionAuditor />} />
          <Route path="/goals" element={<GoalTracker />} />
        </Routes>
      </main>
    </div>
  );
}
