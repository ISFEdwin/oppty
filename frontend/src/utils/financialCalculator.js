/**
 * financialCalculator.js
 * Client-side mirror of the backend financial calculations.
 * Used for instant local computation without API round-trips.
 */

export function calcLaborHours(price, hourlyRateNet) {
  if (!hourlyRateNet || hourlyRateNet <= 0) return null;
  const hours = price / hourlyRateNet;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const formatted = h > 0 ? `${h}h ${m}m of work` : `${m} minutes of work`;
  return { hours: parseFloat(hours.toFixed(2)), formatted };
}

export function calcFutureValue(price, annualRate = 0.07, years = 10) {
  const futureValue = price * Math.pow(1 + annualRate, years);
  return {
    futureValue: parseFloat(futureValue.toFixed(2)),
    opportunityCost: parseFloat((futureValue - price).toFixed(2)),
  };
}

export function calcRecurringFutureValue(dailyCost, annualRate = 0.07, years = 30) {
  const periodsPerYear = 365;
  const ratePerPeriod = annualRate / periodsPerYear;
  const periods = years * periodsPerYear;
  const futureValue =
    ratePerPeriod === 0
      ? dailyCost * periods
      : dailyCost * ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod);
  const totalSpent = dailyCost * periods;
  return {
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    futureValue: parseFloat(futureValue.toFixed(2)),
    opportunityCost: parseFloat((futureValue - totalSpent).toFixed(2)),
  };
}

const UTILITY_BENCHMARKS = [
  { label: "Round-trip flights (NYC→Tokyo)", cost: 800, unit: "flight" },
  { label: "Months of gym membership", cost: 50, unit: "month" },
  { label: "Books", cost: 15, unit: "book" },
  { label: "Days of travel (SE Asia)", cost: 60, unit: "day" },
  { label: "High-yield savings contributions", cost: 100, unit: "month" },
  { label: "Streaming service months", cost: 15, unit: "month" },
  { label: "Weeks of groceries (2 people)", cost: 120, unit: "week" },
  { label: "Charity donations", cost: 50, unit: "donation" },
];

export function calcUtilitySwaps(price) {
  return UTILITY_BENCHMARKS.map(({ label, cost, unit }) => ({
    label,
    equivalents: parseFloat((price / cost).toFixed(1)),
    unit,
  })).filter((s) => s.equivalents >= 0.5);
}

export function calcSubscriptionUtilization(monthlyCost, hoursUsed, targetUtility = 2.0) {
  const costPerHour =
    hoursUsed === 0 ? Infinity : parseFloat((monthlyCost / hoursUsed).toFixed(2));
  const exceeds = costPerHour > targetUtility;
  const breakEvenHours = parseFloat((monthlyCost / targetUtility).toFixed(1));
  const wastedAmount =
    hoursUsed === 0
      ? monthlyCost
      : Math.max(0, parseFloat((monthlyCost - hoursUsed * targetUtility).toFixed(2)));
  return { costPerHour, exceeds, breakEvenHours, wastedAmount };
}

export function fmt(n) {
  if (!isFinite(n)) return "∞";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDec(n, digits = 2) {
  if (!isFinite(n)) return "∞";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}
