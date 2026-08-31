import { cn } from '@/utils/cn';

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
