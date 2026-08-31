import { cn } from '@/utils/cn';
import { initials } from '@/utils/format';

const sizes = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
} as const;

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      title={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700',
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
