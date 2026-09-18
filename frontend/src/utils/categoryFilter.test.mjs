import assert from "node:assert/strict";
import test from "node:test";

import { resolveCategoryFilter } from "./categoryFilter.ts";
import { collectVariantImageUrls, resolveSeaweedImageUrl } from "./imageUrl.ts";
import { getSessionCartAction } from "./sessionCartSync.ts";
import { calculateAdminPageSize, paginateItems } from "./pagination.ts";

test("does not query every product when a requested category is missing", () => {
  const filter = resolveCategoryFilter("Mechanical", [
    { id: "keyboard", name: "Keyboard" },
  ]);

  assert.equal(filter.categoryId, undefined);
  assert.equal(filter.canQuery, false);
});

test("allows an unfiltered query when no category was requested", () => {
  const filter = resolveCategoryFilter(undefined, []);

  assert.equal(filter.categoryId, undefined);
  assert.equal(filter.canQuery, true);
});

test("maps a private Seaweed S3 URL to the public filer URL", () => {
  assert.equal(
    resolveSeaweedImageUrl(
      "http://localhost:8333/products/generated.png",
      "http://localhost:8888",
    ),
    "http://localhost:8888/buckets/products/generated.png",
  );
});

test("maps a stored Seaweed path to the public filer URL", () => {
  assert.equal(
    resolveSeaweedImageUrl("/products/generated.png", "http://localhost:8888"),
    "http://localhost:8888/buckets/products/generated.png",
  );
});

test("collects every unique product variant image in source order", () => {
  assert.deepEqual(
    collectVariantImageUrls(
      ["/products/one.png", undefined, "/products/two.png", "/products/one.png"],
      (value) => `https://images.test${value}`,
    ),
    ["https://images.test/products/one.png", "https://images.test/products/two.png"],
  );
});

test("refreshes the server cart once when an authenticated session hydrates", () => {
  assert.equal(getSessionCartAction(false, true, false), "none");
  assert.equal(getSessionCartAction(true, true, false), "refresh");
  assert.equal(getSessionCartAction(true, true, true), "none");
});

test("resets cart state after the authenticated session ends", () => {
  assert.equal(getSessionCartAction(true, false, true), "reset");
});

test("paginates admin lists and clamps pages after deletion", () => {
  const items = Array.from({ length: 23 }, (_, index) => index + 1);
  assert.deepEqual(paginateItems(items, 2, 10).items, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  assert.equal(paginateItems(items.slice(0, 9), 3, 10).page, 1);
});

test("fits admin rows into the viewport and moves overflow to the next page", () => {
  assert.equal(calculateAdminPageSize({
    containerHeight: 560,
    headerHeight: 48,
    rowHeight: 72,
    paginationHeight: 65,
    itemCount: 20,
  }), 6);
  assert.equal(calculateAdminPageSize({
    containerHeight: 560,
    headerHeight: 48,
    rowHeight: 72,
    paginationHeight: 65,
    itemCount: 7,
  }), 7);
});
