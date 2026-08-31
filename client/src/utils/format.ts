import { format, formatDistanceToNow, isPast, isToday, parseISO } from 'date-fns';

export function formatDate(value: string | null | undefined, pattern = 'MMM d'): string {
  if (!value) return '—';
  return format(parseISO(value), pattern);
}

export function formatLongDate(value: string | null | undefined): string {
  return formatDate(value, 'd MMMM yyyy');
}

export function formatRelative(value: string): string {
  return formatDistanceToNow(parseISO(value), { addSuffix: true });
}

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  return format(parseISO(value), 'yyyy-MM-dd');
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const date = parseISO(dueDate);
  return isPast(date) && !isToday(date);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
