import test from "node:test";
import assert from "node:assert/strict";
import { resolveLoginDestination } from "./loginRedirect.ts";

test("member does not return to an admin-only page", () => {
  assert.equal(resolveLoginDestination("/admin/payments", false), "/profile");
});

test("admin can return to the requested admin page", () => {
  assert.equal(resolveLoginDestination("/admin/payments?status=pending", true), "/admin/payments?status=pending");
});

test("member returns to a requested customer page", () => {
  assert.equal(resolveLoginDestination("/orders/123", false), "/orders/123");
});

test("external and protocol-relative destinations are rejected", () => {
  assert.equal(resolveLoginDestination("https://example.com", false), "/profile");
  assert.equal(resolveLoginDestination("//example.com", true), "/admin");
});
