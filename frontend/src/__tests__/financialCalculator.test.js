/**
 * financialCalculator.test.js (frontend)
 * Tests the client-side financial calculation utilities.
 */

import { describe, test, expect } from "vitest";
import {
  calcLaborHours,
  calcFutureValue,
  calcRecurringFutureValue,
  calcUtilitySwaps,
  calcSubscriptionUtilization,
  fmt,
  fmtDec,
} from "../utils/financialCalculator.js";

describe("calcLaborHours", () => {
  test("converts $1500 at $28/hr to labour hours", () => {
    const result = calcLaborHours(1500, 28);
    expect(result.hours).toBeGreaterThan(53);
    expect(result.formatted).toMatch(/h \d+m of work/);
  });

  test("returns null for zero or negative hourly rate", () => {
    expect(calcLaborHours(100, 0)).toBeNull();
    expect(calcLaborHours(100, -5)).toBeNull();
  });

  test("returns minutes string for sub-hour amount", () => {
    const result = calcLaborHours(5, 60); // $5 at $60/hr = 5 mins
    expect(result.formatted).toMatch(/\d+ minutes of work/);
  });
});

describe("calcFutureValue", () => {
  test("computes FV correctly at 7% for 10 years", () => {
    const { futureValue } = calcFutureValue(1000, 0.07, 10);
    expect(futureValue).toBeCloseTo(1967.15, 0);
  });

  test("futureValue equals price when rate is 0", () => {
    const { futureValue, opportunityCost } = calcFutureValue(500, 0, 5);
    expect(futureValue).toBe(500);
    expect(opportunityCost).toBe(0);
  });
});

describe("calcRecurringFutureValue", () => {
  test("models daily coffee over 30 years", () => {
    const result = calcRecurringFutureValue(5, 0.07, 30);
    expect(result.futureValue).toBeGreaterThan(30000);
    expect(result.totalSpent).toBeCloseTo(5 * 365 * 30, -1);
  });
});

describe("calcUtilitySwaps", () => {
  test("generates swaps for $600 purchase", () => {
    const swaps = calcUtilitySwaps(600);
    expect(swaps.length).toBeGreaterThan(0);
    expect(swaps.every((s) => s.equivalents >= 0.5)).toBe(true);
  });

  test("each swap has required fields", () => {
    const swaps = calcUtilitySwaps(300);
    swaps.forEach((s) => {
      expect(s).toHaveProperty("label");
      expect(s).toHaveProperty("equivalents");
      expect(s).toHaveProperty("unit");
    });
  });
});

describe("calcSubscriptionUtilization", () => {
  test("flags zombie service with cost > target", () => {
    const result = calcSubscriptionUtilization(15, 2, 2.0);
    expect(result.exceeds).toBe(true);
    expect(result.costPerHour).toBe(7.5);
  });

  test("reports efficient when cost < target", () => {
    const result = calcSubscriptionUtilization(10, 10, 2.0);
    expect(result.exceeds).toBe(false);
    expect(result.costPerHour).toBe(1);
  });

  test("handles zero hours used gracefully", () => {
    const result = calcSubscriptionUtilization(15, 0, 2.0);
    expect(result.costPerHour).toBe(Infinity);
    expect(result.exceeds).toBe(true);
    expect(result.wastedAmount).toBe(15);
  });
});

describe("fmt / fmtDec", () => {
  test("fmt formats whole numbers as USD currency", () => {
    expect(fmt(1500)).toBe("$1,500");
    expect(fmt(0)).toBe("$0");
  });

  test("fmtDec formats with specified decimal places", () => {
    expect(fmtDec(9.99)).toBe("$9.99");
    expect(fmtDec(15, 2)).toBe("$15.00");
  });

  test("fmt returns ∞ for Infinity", () => {
    expect(fmt(Infinity)).toBe("∞");
  });
});
