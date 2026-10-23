import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createDemoAccountService,
  DEMO_ACCOUNT,
} from "../lib/auth/demo-service";
import {
  signInSchema,
  signUpSchema,
  fieldErrors,
  type SignUpValues,
} from "../lib/auth/validation";

const valid: SignUpValues = {
  fullName: "Amina Demo",
  email: "amina@example.com",
  password: DEMO_ACCOUNT.password,
  confirmPassword: DEMO_ACCOUNT.password,
  acceptTerms: true,
};
const service = createDemoAccountService(async () => {});

test("sign-up validates all required fields and requires matching passwords and consent", () => {
  const result = signUpSchema.safeParse({
    fullName: " ",
    email: "not-email",
    password: "short",
    confirmPassword: "different",
    acceptTerms: false,
  });
  assert.equal(result.success, false);
  if (!result.success)
    assert.deepEqual(Object.keys(fieldErrors(result.error)).sort(), [
      "acceptTerms",
      "confirmPassword",
      "email",
      "fullName",
      "password",
    ]);
  assert.equal(signUpSchema.safeParse(valid).success, true);
});

test("email and name are normalised while passwords are preserved exactly", () => {
  const password = " example password ";
  const parsed = signUpSchema.parse({
    ...valid,
    fullName: " Amina Demo ",
    email: " AMINA@EXAMPLE.COM ",
    password,
    confirmPassword: password,
  });
  assert.equal(parsed.fullName, "Amina Demo");
  assert.equal(parsed.email, "amina@example.com");
  assert.equal(parsed.password, password);
  assert.equal(
    signUpSchema.safeParse({
      ...valid,
      password: "a".repeat(129),
      confirmPassword: "a".repeat(129),
    }).success,
    false,
  );
});

test("the demo adapter rejects invalid input instead of trusting form validation", async () => {
  const result = await service.signUp({ ...valid, acceptTerms: false });
  assert.equal(result.ok, false);
  assert.equal(
    await service
      .signIn({ email: "bad", password: "" })
      .then((result) => result.ok),
    false,
  );
});

test("a successful sign-up returns only a simulated verification result without passwords", async () => {
  const result = await service.signUp(valid);
  assert.deepEqual(result, {
    ok: true,
    mode: "demo",
    email: valid.email,
    verification: "simulated",
  });
  assert.equal(JSON.stringify(result).includes(valid.password), false);
});

test("the shared sample account triggers the existing-account state", async () => {
  const result = await service.signUp({ ...valid, email: DEMO_ACCOUNT.email });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "EXISTING_ACCOUNT");
});

test("new demo submissions do not create accounts or make personal passwords valid", async () => {
  await service.signUp(valid);
  const result = await service.signIn({
    email: valid.email,
    password: valid.password,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "INVALID_CREDENTIALS");
  assert.equal(
    (await service.signIn({ email: DEMO_ACCOUNT.email, password: "wrong" })).ok,
    false,
  );
});

test("only public sample credentials complete demo sign-in, with no session token returned", async () => {
  const result = await service.signIn({
    email: " LEARNER@EXAMPLE.COM ",
    password: DEMO_ACCOUNT.password,
  });
  assert.deepEqual(result, {
    ok: true,
    mode: "demo",
    displayName: DEMO_ACCOUNT.fullName,
  });
  assert.equal(
    signInSchema.safeParse({ email: DEMO_ACCOUNT.email, password: "" }).success,
    false,
  );
});

test("verification resend validates the address and performs only its simulated operation", async () => {
  let calls = 0;
  const adapter = createDemoAccountService(async () => {
    calls++;
  });
  await adapter.resendVerification(valid.email);
  assert.equal(calls, 1);
  await assert.rejects(() => adapter.resendVerification("invalid-email"));
  assert.equal(calls, 1);
});
