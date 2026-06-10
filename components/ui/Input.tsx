import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = ({
  label,
  error,
  icon,
  className = "",
  id,
  type = "text",
  ...rest
}: InputProps) => {
  const inputId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={[
            "w-full rounded-btn border bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900",
            "placeholder:text-neutral-400 transition-colors",
            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600",
            icon ? "pl-10" : "",
            error ? "border-danger focus:ring-danger" : "border-neutral-300",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
