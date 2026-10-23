"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, Input, fieldDescription } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete = "new-password",
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: "new-password" | "current-password";
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={fieldDescription(id, hint, error)}
          className="pr-14"
        />
        <Button
          variant="ghost"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          className="absolute top-0 right-0 min-w-11 px-3"
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </Button>
      </div>
    </Field>
  );
}
