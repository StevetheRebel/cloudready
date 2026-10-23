import { z } from "zod";
import { emailSchema, passwordSchema } from "./validation";

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Your passwords do not match.",
  });
export type RecoveryLinkState =
  "valid" | "missing" | "invalid" | "expired" | "used";

// These are public UI fixtures, never reset tokens or proof of identity.
export function recoveryLinkState(
  params: Pick<URLSearchParams, "getAll">,
): RecoveryLinkState {
  if (params.getAll("token").length) return "invalid";
  const preview = params.getAll("preview");
  if (!preview.length) return "missing";
  if (preview.length !== 1) return "invalid";
  if (
    preview[0] === "valid" ||
    preview[0] === "expired" ||
    preview[0] === "used"
  )
    return preview[0];
  return "invalid";
}

export const RECOVERY_CONFIRMATION =
  "For a live account, an eligible address would receive reset instructions. This preview sends no email and does not confirm whether an account exists.";

export function createDemoRecoveryService(
  pause: () => Promise<void> = () =>
    new Promise((resolve) => setTimeout(resolve, 450)),
) {
  return {
    async request(email: string) {
      if (!emailSchema.safeParse(email).success)
        return { ok: false as const, message: "Enter a valid email address." };
      await pause();
      return {
        ok: true as const,
        mode: "demo" as const,
        delivery: "not-sent" as const,
        message: RECOVERY_CONFIRMATION,
      };
    },
    async reset(
      state: RecoveryLinkState,
      values: z.infer<typeof resetPasswordSchema>,
    ) {
      if (state !== "valid")
        return {
          ok: false as const,
          message:
            "Open the valid demo preview to try this form. Real reset links are not supported yet.",
        };
      if (!resetPasswordSchema.safeParse(values).success)
        return {
          ok: false as const,
          message: "Check the password fields and try again.",
        };
      await pause();
      return {
        ok: true as const,
        mode: "demo" as const,
        passwordChanged: false as const,
      };
    },
  };
}
