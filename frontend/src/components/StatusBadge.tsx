import clsx from 'clsx';
import type { MonitorStatus } from '../types/api';

const styles: Record<MonitorStatus, string> = {
  up: 'bg-emerald-100 text-emerald-700',
  down: 'bg-rose-100 text-rose-700',
  pending: 'bg-slate-100 text-slate-500',
};

const labels: Record<MonitorStatus, string> = {
  up: 'Up',
  down: 'Down',
  pending: 'Pending',
};

export function StatusBadge({ status }: { status: MonitorStatus }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', styles[status])}>
      <span className={clsx('h-1.5 w-1.5 rounded-full', status === 'up' ? 'bg-emerald-500' : status === 'down' ? 'bg-rose-500' : 'bg-slate-400')} />
      {labels[status]}
    </span>
  );
}
