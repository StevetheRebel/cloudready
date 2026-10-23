import {
  emailSchema,
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "./validation";

// Public, fictional test fixtures. These are not credentials for a real account.
export const DEMO_ACCOUNT = {
  email: "learner@example.com",
  password: "CloudReadyDemo1!",
  fullName: "Demo Learner",
} as const;
export type AuthFailure = {
  ok: false;
  code: "INVALID_INPUT" | "EXISTING_ACCOUNT" | "INVALID_CREDENTIALS";
  message: string;
};
export type SignUpResult =
  | AuthFailure
  | { ok: true; mode: "demo"; email: string; verification: "simulated" };
export type SignInResult =
  AuthFailure | { ok: true; mode: "demo"; displayName: string };
export interface AccountService {
  signUp(values: SignUpValues): Promise<SignUpResult>;
  signIn(values: SignInValues): Promise<SignInResult>;
  resendVerification(email: string): Promise<void>;
}

// No account registry, persistence, network calls, session tokens, or password storage.
// Replace this entire adapter with Better Auth when real account access is enabled.
export function createDemoAccountService(
  pause: () => Promise<void> = () =>
    new Promise((resolve) => setTimeout(resolve, 450)),
): AccountService {
  return {
    async signUp(values) {
      const parsed = signUpSchema.safeParse(values);
      if (!parsed.success)
        return {
          ok: false,
          code: "INVALID_INPUT",
          message: "Check the highlighted fields and try again.",
        };
      await pause();
      if (parsed.data.email === DEMO_ACCOUNT.email)
        return {
          ok: false,
          code: "EXISTING_ACCOUNT",
          message:
            "This sample account already exists. Sign in with the sample details or use a different example email.",
        };
      return {
        ok: true,
        mode: "demo",
        email: parsed.data.email,
        verification: "simulated",
      };
    },
    async signIn(values) {
      const parsed = signInSchema.safeParse(values);
      if (!parsed.success)
        return {
          ok: false,
          code: "INVALID_INPUT",
          message: "Enter a valid email and password.",
        };
      await pause();
      if (
        parsed.data.email !== DEMO_ACCOUNT.email ||
        parsed.data.password !== DEMO_ACCOUNT.password
      )
        return {
          ok: false,
          code: "INVALID_CREDENTIALS",
          message:
            "Those details do not match the sample account. Use Fill sample details to try the demo sign-in.",
        };
      return { ok: true, mode: "demo", displayName: DEMO_ACCOUNT.fullName };
    },
    async resendVerification(email) {
      emailSchema.parse(email);
      await pause();
    },
  };
}
