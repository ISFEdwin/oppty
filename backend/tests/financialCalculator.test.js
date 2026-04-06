/**
 * financialCalculator.test.js
 * Unit tests for the Oppty core financial calculation logic.
 */

const {
  calcLaborHours,
  calcFutureValue,
  calcRecurringFutureValue,
  calcUtilitySwaps,
  calcSubscriptionUtilization,
  buildRationalityReport,
} = require("../src/services/financialCalculator");

describe("calcLaborHours", () => {
  test("converts price to labour hours correctly", () => {
    const result = calcLaborHours(1500, 24.19); // $1500 laptop at ~$24/hr
    expect(result.hours).toBeGreaterThan(60);
    expect(result.hours).toBeLessThan(65);
    expect(result.formatted).toMatch(/h \d+m of work/);
  });

  test("returns minutes for small purchases", () => {
    const result = calcLaborHours(5, 30); // $5 coffee at $30/hr
    expect(result.hours).toBeCloseTo(0.17, 1);
    expect(result.formatted).toMatch(/\d+ minutes of work/);
  });

  test("throws on non-positive hourly rate", () => {
    expect(() => calcLaborHours(100, 0)).toThrow("Hourly rate must be positive");
    expect(() => calcLaborHours(100, -5)).toThrow("Hourly rate must be positive");
  });

  test("calculates exact result for round numbers", () => {
    const result = calcLaborHours(100, 25);
    expect(result.hours).toBe(4);
    expect(result.formatted).toBe("4h 0m of work");
  });
});

describe("calcFutureValue", () => {
  test("computes FV correctly with default 7% over 10 years", () => {
    const { futureValue, opportunityCost } = calcFutureValue(1000);
    expect(futureValue).toBeCloseTo(1967.15, 0);
    expect(opportunityCost).toBeCloseTo(967.15, 0);
  });

  test("computes FV for zero rate (no growth)", () => {
    const { futureValue, opportunityCost } = calcFutureValue(500, 0, 20);
    expect(futureValue).toBe(500);
    expect(opportunityCost).toBe(0);
  });

  test("throws on negative price", () => {
    expect(() => calcFutureValue(-100)).toThrow("Price must be non-negative");
  });

  test("throws on non-positive years", () => {
    expect(() => calcFutureValue(100, 0.07, 0)).toThrow("Years must be positive");
  });

  test("coffee future value: $5/day for 30 years", () => {
    const { futureValue } = calcFutureValue(5 * 365, 0.07, 30);
    // $1,825/yr for 30 years at 7% → ~$172k lump-sum FV
    expect(futureValue).toBeGreaterThan(10000);
  });
});

describe("calcRecurringFutureValue", () => {
  test("models daily coffee over 30 years", () => {
    const result = calcRecurringFutureValue(5, 0.07, 30);
    expect(result.futureValue).toBeGreaterThan(30000);
    expect(result.totalSpent).toBeCloseTo(5 * 365 * 30, -1);
    expect(result.opportunityCost).toBeGreaterThan(0);
  });

  test("handles zero rate (pure sum)", () => {
    const result = calcRecurringFutureValue(10, 0, 1);
    expect(result.futureValue).toBeCloseTo(10 * 365, 0);
    expect(result.opportunityCost).toBe(0);
  });
});

describe("calcUtilitySwaps", () => {
  test("returns multiple alternatives for $600", () => {
    const swaps = calcUtilitySwaps(600);
    expect(swaps.length).toBeGreaterThan(0);
    const flight = swaps.find((s) => s.label.includes("flight"));
    expect(flight).toBeDefined();
    // 600 / 800 = 0.75, rounded to 1 decimal → 0.8
    expect(flight.equivalents).toBeCloseTo(0.8, 1);
  });

  test("filters out tiny equivalents (< 0.5)", () => {
    const swaps = calcUtilitySwaps(1); // $1 purchase
    const expensive = swaps.filter((s) => s.equivalents < 0.5);
    expect(expensive).toHaveLength(0);
  });

  test("throws on negative price", () => {
    expect(() => calcUtilitySwaps(-10)).toThrow("Price must be non-negative");
  });
});

describe("calcSubscriptionUtilization", () => {
  test("detects over-priced streaming service", () => {
    const result = calcSubscriptionUtilization(15, 2, 2.0);
    expect(result.costPerHour).toBe(7.5);
    expect(result.exceeds).toBe(true);
    expect(result.wastedAmount).toBeGreaterThan(0);
  });

  test("reports ok when utilisation is good", () => {
    const result = calcSubscriptionUtilization(15, 10, 2.0);
    expect(result.costPerHour).toBe(1.5);
    expect(result.exceeds).toBe(false);
  });

  test("handles zero usage (never used)", () => {
    const result = calcSubscriptionUtilization(15, 0, 2.0);
    expect(result.costPerHour).toBe(Infinity);
    expect(result.exceeds).toBe(true);
    expect(result.wastedAmount).toBe(15);
  });
});

describe("buildRationalityReport", () => {
  test("returns a complete report for a $1500 laptop", () => {
    const report = buildRationalityReport({
      price: 1500,
      hourlyRateNet: 24,
      annualRate: 0.07,
      years: 10,
      category: "tech",
    });
    expect(report.price).toBe(1500);
    expect(report.laborHours.hours).toBeGreaterThan(60);
    expect(report.futureValue.futureValue).toBeGreaterThan(1500);
    expect(report.utilitySwaps.length).toBeGreaterThan(0);
  });
});
