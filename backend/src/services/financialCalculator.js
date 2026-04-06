/**
 * financialCalculator.js
 * Core financial logic for the Oppty "Rational Multiplier."
 * All functions are pure (no side-effects) so they are easy to test.
 */

/**
 * Labor-Hour Dimension
 * Converts a price into the equivalent hours of net (after-tax) labour.
 *
 * @param {number} price - Purchase price in dollars
 * @param {number} hourlyRateNet - User's net (after-tax) hourly wage in dollars
 * @returns {{ hours: number, formatted: string }}
 */
function calcLaborHours(price, hourlyRateNet) {
  if (hourlyRateNet <= 0) throw new Error("Hourly rate must be positive");
  const hours = price / hourlyRateNet;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const formatted =
    h > 0
      ? `${h}h ${m}m of work`
      : `${m} minutes of work`;
  return { hours: parseFloat(hours.toFixed(2)), formatted };
}

/**
 * Future-Value Dimension
 * Calculates what a purchase would be worth if invested instead.
 * FV = P × (1 + r)^n
 *
 * @param {number} price - Purchase price in dollars
 * @param {number} annualRate - Expected annual return (decimal, default 0.07)
 * @param {number} years - Investment horizon in years (default 10)
 * @returns {{ futureValue: number, opportunityCost: number }}
 */
function calcFutureValue(price, annualRate = 0.07, years = 10) {
  if (price < 0) throw new Error("Price must be non-negative");
  if (annualRate < 0) throw new Error("Annual rate must be non-negative");
  if (years <= 0) throw new Error("Years must be positive");
  const futureValue = price * Math.pow(1 + annualRate, years);
  return {
    futureValue: parseFloat(futureValue.toFixed(2)),
    opportunityCost: parseFloat((futureValue - price).toFixed(2)),
  };
}

/**
 * Daily-Coffee Compound Scenario
 * Models recurring daily spending as a retirement impact.
 *
 * @param {number} dailyCost - Daily cost in dollars
 * @param {number} annualRate - Expected annual return (decimal, default 0.07)
 * @param {number} years - Investment horizon in years (default 30)
 * @returns {{ totalSpent: number, futureValue: number, opportunityCost: number }}
 */
function calcRecurringFutureValue(dailyCost, annualRate = 0.07, years = 30) {
  const periodsPerYear = 365;
  const ratePerPeriod = annualRate / periodsPerYear;
  const periods = years * periodsPerYear;
  // Future value of an ordinary annuity: FV = C × [(1+r)^n − 1] / r
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

/**
 * Utility-Swap Dimension
 * Suggests alternative purchases of potentially higher utility.
 *
 * @param {number} price - Purchase price in dollars
 * @param {string} category - Category of the item (e.g. "clothing", "tech", "food")
 * @returns {Array<{ label: string, equivalents: number, unit: string }>}
 */
const UTILITY_BENCHMARKS = [
  { label: "Round-trip economy flights (NYC→Tokyo)", cost: 800, unit: "flight" },
  { label: "Months of gym membership", cost: 50, unit: "month" },
  { label: "Books", cost: 15, unit: "book" },
  { label: "Days of travel in Southeast Asia", cost: 60, unit: "day" },
  { label: "Months of a high-yield savings contribution", cost: 100, unit: "month" },
  { label: "Streaming service months", cost: 15, unit: "month" },
  { label: "Weeks of groceries for two", cost: 120, unit: "week" },
  { label: "Charity donations (impact equivalent)", cost: 50, unit: "donation" },
];

function calcUtilitySwaps(price) {
  if (price < 0) throw new Error("Price must be non-negative");
  return UTILITY_BENCHMARKS.map(({ label, cost, unit }) => ({
    label,
    equivalents: parseFloat((price / cost).toFixed(1)),
    unit,
  })).filter((s) => s.equivalents >= 0.5);
}

/**
 * Subscription Utilisation Audit
 * Calculates the effective cost-per-hour of a subscription.
 *
 * @param {number} monthlyCost - Monthly subscription fee in dollars
 * @param {number} hoursUsedThisMonth - Hours the subscription was used
 * @param {number} targetUtility - User's acceptable cost-per-hour threshold
 * @returns {{ costPerHour: number, exceeds: boolean, wastedAmount: number }}
 */
function calcSubscriptionUtilization(monthlyCost, hoursUsedThisMonth, targetUtility = 2.0) {
  if (monthlyCost < 0) throw new Error("Monthly cost must be non-negative");
  if (hoursUsedThisMonth < 0) throw new Error("Hours used must be non-negative");
  const costPerHour =
    hoursUsedThisMonth === 0 ? Infinity : parseFloat((monthlyCost / hoursUsedThisMonth).toFixed(2));
  const exceeds = costPerHour > targetUtility;
  const breakEvenHours = parseFloat((monthlyCost / targetUtility).toFixed(1));
  const wastedAmount =
    hoursUsedThisMonth === 0
      ? monthlyCost
      : Math.max(0, parseFloat((monthlyCost - hoursUsedThisMonth * targetUtility).toFixed(2)));
  return { costPerHour, exceeds, breakEvenHours, wastedAmount };
}

/**
 * Build a full "Rationality Report" for a single purchase.
 *
 * @param {object} params
 * @param {number} params.price
 * @param {number} params.hourlyRateNet
 * @param {number} [params.annualRate]
 * @param {number} [params.years]
 * @param {string} [params.category]
 * @returns {object}
 */
function buildRationalityReport({
  price,
  hourlyRateNet,
  annualRate = 0.07,
  years = 10,
  category = "general",
}) {
  return {
    price,
    category,
    laborHours: calcLaborHours(price, hourlyRateNet),
    futureValue: calcFutureValue(price, annualRate, years),
    utilitySwaps: calcUtilitySwaps(price),
  };
}

module.exports = {
  calcLaborHours,
  calcFutureValue,
  calcRecurringFutureValue,
  calcUtilitySwaps,
  calcSubscriptionUtilization,
  buildRationalityReport,
  UTILITY_BENCHMARKS,
};
