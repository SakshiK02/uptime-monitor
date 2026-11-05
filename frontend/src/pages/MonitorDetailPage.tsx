import { Link, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMonitor, useMonitorChecks } from '../hooks/useMonitors';
import { useIncidents } from '../hooks/useIncidents';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { formatDateTime, formatDuration, formatRelative } from '../utils/format';
import { averageResponseTime, uptimePercent } from '../utils/uptime';

export function MonitorDetailPage() {
  const { id = '' } = useParams();
  const { data: monitor, isLoading: isMonitorLoading } = useMonitor(id);
  const { data: checks = [] } = useMonitorChecks(id, 24);
  const { data: incidents = [] } = useIncidents(id);

  if (isMonitorLoading) return <p className="text-sm text-slate-400">Loading...</p>;
  if (!monitor) return <EmptyState title="Monitor not found" />;

  const chartData = checks.map((c) => ({
    time: new Date(c.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    responseTimeMs: c.responseTimeMs ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link to="/monitors" className="text-sm text-slate-400 hover:text-slate-600">
          ← Back to monitors
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{monitor.name}</h1>
            <p className="text-sm text-slate-400">{monitor.url}</p>
          </div>
          <StatusBadge status={monitor.currentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Uptime (24h)" value={`${uptimePercent(checks)}%`} />
        <SummaryCard label="Avg response time" value={averageResponseTime(checks) != null ? `${averageResponseTime(checks)} ms` : '—'} />
        <SummaryCard label="Last checked" value={formatRelative(monitor.lastCheckedAt)} />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Response time (last 24h)</h2>
        {chartData.length === 0 ? (
          <EmptyState title="No checks recorded yet" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} interval={Math.max(0, Math.floor(chartData.length / 8))} />
              <YAxis tick={{ fontSize: 12 }} unit="ms" />
              <Tooltip formatter={(value) => [`${value} ms`, 'Response time']} />
              <Line type="monotone" dataKey="responseTimeMs" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Incident history</h2>
        {incidents.length === 0 ? (
          <EmptyState title="No incidents" description="This monitor has never gone down." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">Started</th>
                <th className="py-2">Duration</th>
                <th className="py-2">Cause</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-600">{formatDateTime(inc.startedAt)}</td>
                  <td className="py-2 text-slate-600">{formatDuration(inc.startedAt, inc.resolvedAt)}</td>
                  <td className="py-2 text-slate-600">{inc.cause}</td>
                  <td className="py-2">
                    {inc.resolvedAt ? (
                      <span className="text-xs font-medium text-emerald-600">Resolved</span>
                    ) : (
                      <span className="text-xs font-medium text-rose-600">Ongoing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
