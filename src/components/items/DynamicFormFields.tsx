import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea";
  required?: boolean;
  options?: string[];
}

interface DynamicFormFieldsProps {
  fieldsConfig: FieldConfig[];
  values: Record<string, string | number | undefined>;
  onChange: (key: string, value: string | number) => void;
  errors?: Record<string, string>;
}

export function DynamicFormFields({
  fieldsConfig,
  values,
  onChange,
  errors = {},
}: DynamicFormFieldsProps) {
  if (fieldsConfig.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fieldsConfig.map((field) => {
        const value = values[field.key] ?? "";
        const errorMsg = errors[field.key];

        return (
          <div key={field.key} className="grid gap-1.5">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === "select" && field.options ? (
              <select
                id={field.key}
                aria-label={field.label}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={String(value)}
                onChange={(e) => onChange(field.key, e.target.value)}
                required={field.required}
              >
                <option value="">Select…</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.key}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={String(value)}
                onChange={(e) => onChange(field.key, e.target.value)}
                required={field.required}
              />
            ) : (
              <Input
                id={field.key}
                type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                value={String(value)}
                onChange={(e) =>
                  onChange(
                    field.key,
                    field.type === "number" ? Number(e.target.value) : e.target.value,
                  )
                }
                required={field.required}
              />
            )}

            {errorMsg && (
              <p className="text-xs text-destructive">{errorMsg}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
