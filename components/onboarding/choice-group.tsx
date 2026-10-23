import { cn } from "@/lib/utils";

export function ChoiceGroup<T extends string>({
  id,
  legend,
  value,
  options,
  onChange,
  error,
}: {
  id: string;
  legend: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string; hint?: string }>;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend id={id} tabIndex={-1} className="mb-3 text-sm font-semibold">
        {legend}
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm hover:border-primary/50",
              value === option.value ? "border-primary bg-accent" : "bg-card",
            )}
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 size-4 shrink-0 accent-primary"
            />
            <span>
              <span className="block font-medium">{option.label}</span>
              {option.hint ? (
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {option.hint}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
