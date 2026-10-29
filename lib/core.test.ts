import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { computePrice } from "./price.ts";
import { verifyRazorpaySignature } from "./razorpay-verify.ts";

test("computePrice: metal + making% + 3% GST", () => {
  assert.deepEqual(computePrice(10, 12, 9000), { metal: 90000, making: 10800, gst: 3024, total: 103824 });
});

test("verifyRazorpaySignature accepts valid, rejects tampered", () => {
  const sig = createHmac("sha256", "s3cret").update("order_1|pay_1").digest("hex");
  assert.equal(verifyRazorpaySignature("order_1", "pay_1", sig, "s3cret"), true);
  assert.equal(verifyRazorpaySignature("order_1", "pay_2", sig, "s3cret"), false);
  assert.equal(verifyRazorpaySignature("order_1", "pay_1", "", "s3cret"), false);
});

import { signSession, verifySession } from "./session.ts";
test("session cookie: valid, tampered, wrong secret, expired", () => {
  const t = signSession("u1", "k");
  assert.equal(verifySession(t, "k"), "u1");
  assert.equal(verifySession(t.replace("u1", "u2"), "k"), null);
  assert.equal(verifySession(t, "other"), null);
  assert.equal(verifySession(signSession("u1", "k", -1), "k"), null);
  assert.equal(verifySession(undefined, "k"), null);
});
