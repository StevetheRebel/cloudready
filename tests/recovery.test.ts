import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createDemoRecoveryService,
  recoveryLinkState,
  RECOVERY_CONFIRMATION,
  resetPasswordSchema,
  type RecoveryLinkState,
} from "../lib/auth/recovery";
import {
  createDemoAccountService,
  DEMO_ACCOUNT,
} from "../lib/auth/demo-service";

const noPause = async () => {};
const values = {
  password: "ExamplePassword2!",
  confirmPassword: "ExamplePassword2!",
};

test("valid example addresses all return the same neutral recovery result without email disclosure", async () => {
  const service = createDemoRecoveryService(noPause);
  const results = await Promise.all(
    [DEMO_ACCOUNT.email, "unknown@example.com", "  LEARNER@EXAMPLE.COM  "].map(
      (email) => service.request(email),
    ),
  );
  assert.deepEqual(results[0], {
    ok: true,
    mode: "demo",
    delivery: "not-sent",
    message: RECOVERY_CONFIRMATION,
  });
  assert.ok(
    results.every(
      (result) => JSON.stringify(result) === JSON.stringify(results[0]),
    ),
  );
  assert.ok(!JSON.stringify(results).includes(DEMO_ACCOUNT.email));
});

test("malformed recovery email is rejected before the asynchronous operation", async () => {
  let pauses = 0;
  const service = createDemoRecoveryService(async () => {
    pauses++;
  });
  for (const email of ["", "not-an-email", "a@", "a b@example.com"])
    assert.equal((await service.request(email)).ok, false);
  assert.equal(pauses, 0);
});

test("public preview states distinguish missing, invalid, expired, used, and valid links", () => {
  for (const [query, expected] of [
    ["", "missing"],
    ["preview=valid", "valid"],
    ["preview=expired", "expired"],
    ["preview=used", "used"],
    ["preview=invalid", "invalid"],
    ["preview=anything", "invalid"],
    ["preview=", "invalid"],
    ["preview=valid&preview=expired", "invalid"],
    ["token=example", "invalid"],
    ["token=&preview=valid", "invalid"],
    ["preview=valid&token=example", "invalid"],
  ] as const)
    assert.equal(recoveryLinkState(new URLSearchParams(query)), expected);
});

test("reset validation requires matching 8–128 character passwords and preserves literal whitespace", () => {
  assert.equal(
    resetPasswordSchema.safeParse({
      password: "short",
      confirmPassword: "short",
    }).success,
    false,
  );
  assert.equal(
    resetPasswordSchema.safeParse({
      password: "x".repeat(129),
      confirmPassword: "x".repeat(129),
    }).success,
    false,
  );
  const mismatch = resetPasswordSchema.safeParse({
    ...values,
    confirmPassword: "OtherPassword2!",
  });
  assert.equal(mismatch.success, false);
  if (!mismatch.success)
    assert.ok(
      mismatch.error.issues.some(
        (issue) => issue.path[0] === "confirmPassword",
      ),
    );
  const spaces = {
    password: " ExamplePassword2! ",
    confirmPassword: " ExamplePassword2! ",
  };
  assert.deepEqual(resetPasswordSchema.parse(spaces), spaces);
  assert.equal(
    resetPasswordSchema.safeParse({
      password: "12345678",
      confirmPassword: "12345678",
    }).success,
    true,
  );
});

test("nonvalid states and malformed password values cannot complete the reset preview", async () => {
  let pauses = 0;
  const service = createDemoRecoveryService(async () => {
    pauses++;
  });
  for (const state of [
    "missing",
    "invalid",
    "expired",
    "used",
  ] as RecoveryLinkState[])
    assert.equal((await service.reset(state, values)).ok, false);
  assert.equal(
    (await service.reset("valid", { ...values, confirmPassword: "mismatch" }))
      .ok,
    false,
  );
  assert.equal(pauses, 0);
});

test("successful reset returns no password/token and never changes shared demo sign-in", async () => {
  const recovery = createDemoRecoveryService(noPause);
  assert.deepEqual(await recovery.reset("valid", values), {
    ok: true,
    mode: "demo",
    passwordChanged: false,
  });
  const accounts = createDemoAccountService(noPause);
  assert.equal(
    (
      await accounts.signIn({
        email: DEMO_ACCOUNT.email,
        password: values.password,
      })
    ).ok,
    false,
  );
  assert.equal((await accounts.signIn(DEMO_ACCOUNT)).ok, true);
  assert.deepEqual(
    await createDemoRecoveryService(noPause).reset("valid", values),
    { ok: true, mode: "demo", passwordChanged: false },
  );
});

test("local service failure can be retried without consuming a link or remembering input", async () => {
  let fail = true;
  const service = createDemoRecoveryService(async () => {
    if (fail) throw new Error("Preview unavailable");
  });
  await assert.rejects(
    service.request("learner@example.com"),
    /Preview unavailable/,
  );
  await assert.rejects(service.reset("valid", values), /Preview unavailable/);
  fail = false;
  assert.equal((await service.request("unknown@example.com")).ok, true);
  assert.equal((await service.reset("valid", values)).ok, true);
});
