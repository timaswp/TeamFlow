import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const controlClasses =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-brand-400 disabled:bg-slate-50';

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, htmlFor, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <Field label={label} error={error} htmlFor={inputId}>
      <input
        id={inputId}
        ref={ref}
        className={cn(controlClasses, error && 'border-red-400', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </Field>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <Field label={label} error={error} htmlFor={inputId}>
      <textarea
        id={inputId}
        ref={ref}
        rows={props.rows ?? 3}
        className={cn(controlClasses, 'resize-y', error && 'border-red-400', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </Field>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <Field label={label} error={error} htmlFor={inputId}>
      <select
        id={inputId}
        ref={ref}
        className={cn(controlClasses, error && 'border-red-400', className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
});
