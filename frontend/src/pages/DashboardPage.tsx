import { Link } from 'react-router-dom';
import { useMonitors } from '../hooks/useMonitors';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { formatRelative } from '../utils/format';

export function DashboardPage() {
  const { data: monitors = [], isLoading } = useMonitors();

  const up = monitors.filter((m) => m.currentStatus === 'up').length;
  const down = monitors.filter((m) => m.currentStatus === 'down').length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Monitors" value={String(monitors.length)} accent="text-slate-900" />
        <SummaryCard label="Up" value={String(up)} accent="text-emerald-600" />
        <SummaryCard label="Down" value={String(down)} accent="text-rose-600" />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Your monitors</h2>
          <Link to="/monitors" className="text-sm font-medium text-indigo-600">
            Manage monitors →
          </Link>
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : monitors.length === 0 ? (
          <EmptyState title="No monitors yet" description="Add a URL to start watching it." />
        ) : (
          <div className="space-y-3">
            {monitors.map((m) => (
              <Link
                key={m.id}
                to={`/monitors/${m.id}`}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 hover:bg-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.url}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">Checked {formatRelative(m.lastCheckedAt)}</span>
                  <StatusBadge status={m.currentStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
