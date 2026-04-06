import { useState, useMemo } from "react";
import {
  calcLaborHours,
  calcFutureValue,
  calcRecurringFutureValue,
  calcUtilitySwaps,
  fmt,
  fmtDec,
} from "../utils/financialCalculator.js";

export default function RationalityReport() {
  const [form, setForm] = useState({
    itemName: "",
    price: "",
    hourlyRateNet: "28",
    annualRate: "7",
    years: "10",
    recurring: false,
    dailyCost: "",
    recurringYears: "30",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setSubmitted(false);
  };

  const report = useMemo(() => {
    if (!submitted) return null;
    const price = parseFloat(form.price);
    const hourlyRateNet = parseFloat(form.hourlyRateNet);
    const annualRate = parseFloat(form.annualRate) / 100;
    const years = parseInt(form.years);

    if (isNaN(price) || price <= 0 || isNaN(hourlyRateNet) || hourlyRateNet <= 0) return null;

    if (form.recurring) {
      const daily = parseFloat(form.dailyCost);
      const rYears = parseInt(form.recurringYears);
      if (isNaN(daily) || daily <= 0) return null;
      return {
        type: "recurring",
        itemName: form.itemName,
        dailyCost: daily,
        laborHours: calcLaborHours(daily, hourlyRateNet),
        recurringFV: calcRecurringFutureValue(daily, annualRate, rYears),
        years: rYears,
      };
    }

    return {
      type: "single",
      itemName: form.itemName,
      price,
      laborHours: calcLaborHours(price, hourlyRateNet),
      futureValue: calcFutureValue(price, annualRate, years),
      utilitySwaps: calcUtilitySwaps(price),
    };
  }, [submitted, form]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">◈ Rationality Report</h1>
        <p className="page-subtitle">
          Enter a purchase and see its True Cost across three behavioural dimensions.
        </p>
      </div>

      <div className="grid-2 gap-16">
        {/* Input panel */}
        <div className="card">
          <div className="card-title mb-16">Purchase Details</div>

          <div className="form-group">
            <label className="form-label">Item Name (optional)</label>
            <input
              className="form-input"
              name="itemName"
              placeholder="e.g. MacBook Pro 14″"
              value={form.itemName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                className="form-input"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="1500.00"
                value={form.price}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Net Hourly Rate ($)</label>
              <input
                className="form-input"
                name="hourlyRateNet"
                type="number"
                min="0.01"
                step="0.01"
                value={form.hourlyRateNet}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Expected Return (%)</label>
              <input
                className="form-input"
                name="annualRate"
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={form.annualRate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Investment Horizon (years)</label>
              <input
                className="form-input"
                name="years"
                type="number"
                min="1"
                max="60"
                step="1"
                value={form.years}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="schematic-divider" />

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                name="recurring"
                checked={form.recurring}
                onChange={handleChange}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>
                Model as recurring daily cost
              </span>
            </label>
          </div>

          {form.recurring && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Daily Cost ($)</label>
                <input
                  className="form-input"
                  name="dailyCost"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="5.50"
                  value={form.dailyCost}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Years</label>
                <input
                  className="form-input"
                  name="recurringYears"
                  type="number"
                  min="1"
                  max="60"
                  value={form.recurringYears}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            onClick={() => setSubmitted(true)}
            disabled={!form.price && !form.dailyCost}
          >
            ◈ Generate Rationality Report
          </button>
        </div>

        {/* Report panel */}
        <div className="card">
          <div className="card-title mb-16">
            {report ? `Report: ${report.itemName || "Unnamed Item"}` : "Awaiting Analysis..."}
          </div>

          {!report && (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <p>Fill in the details and click Generate to see your Rationality Report.</p>
            </div>
          )}

          {report?.type === "single" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="alert alert-blue">
                <span className="alert-icon">◈</span>
                <span>
                  <strong style={{ fontFamily: "var(--font-mono)" }}>
                    {fmtDec(report.price)}
                  </strong>{" "}
                  purchase — here is what it really costs.
                </span>
              </div>

              {/* Labour hours */}
              <div className="report-dimension blue">
                <span className="dimension-label">⬡ Dimension 1 — Labour Time</span>
                <span className="dimension-value">{report.laborHours?.formatted}</span>
                <span className="dimension-desc">
                  At {fmtDec(parseFloat(form.hourlyRateNet))}/hr net, this costs you{" "}
                  <strong>{report.laborHours?.hours} hours</strong> of your life.
                </span>
              </div>

              {/* Future value */}
              <div className="report-dimension green">
                <span className="dimension-label">◈ Dimension 2 — Future Value</span>
                <span className="dimension-value">{fmt(report.futureValue.futureValue)}</span>
                <span className="dimension-desc">
                  Invested at {form.annualRate}% for {form.years} years — opportunity cost:{" "}
                  <strong className="text-red">{fmt(report.futureValue.opportunityCost)}</strong>
                </span>
              </div>

              {/* Utility swaps */}
              {report.utilitySwaps.length > 0 && (
                <div className="report-dimension purple">
                  <span className="dimension-label">◇ Dimension 3 — Utility Swaps</span>
                  <span className="dimension-desc mb-8">
                    Instead, you could have:
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                    {report.utilitySwaps.slice(0, 5).map((swap) => (
                      <div
                        key={swap.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span>{swap.label}</span>
                        <span className="mono text-blue">×{swap.equivalents}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {report?.type === "recurring" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="alert alert-amber">
                <span className="alert-icon">⚠</span>
                <span>
                  <strong className="mono">{fmtDec(report.dailyCost)}/day</strong> — modelled
                  over <strong>{report.years} years</strong>
                </span>
              </div>
              <div className="report-dimension blue">
                <span className="dimension-label">Total Spent (out-of-pocket)</span>
                <span className="dimension-value">{fmt(report.recurringFV.totalSpent)}</span>
                <span className="dimension-desc">Every purchase, accumulated</span>
              </div>
              <div className="report-dimension green">
                <span className="dimension-label">Future Value if Invested</span>
                <span className="dimension-value">{fmt(report.recurringFV.futureValue)}</span>
                <span className="dimension-desc">
                  Daily contributions, compounded at {form.annualRate}% annually
                </span>
              </div>
              <div className="report-dimension purple">
                <span className="dimension-label">Compound Opportunity Cost</span>
                <span className="dimension-value text-red">
                  {fmt(report.recurringFV.opportunityCost)}
                </span>
                <span className="dimension-desc">
                  The compounding "price" of this daily habit over {report.years} years.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
