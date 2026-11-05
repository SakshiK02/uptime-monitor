import { Link } from 'react-router-dom';
import { useIncidents } from '../hooks/useIncidents';
import { useMonitors } from '../hooks/useMonitors';
import { EmptyState } from '../components/EmptyState';
import { formatDateTime, formatDuration } from '../utils/format';

export function IncidentsPage() {
  const { data: incidents = [], isLoading } = useIncidents();
  const { data: monitors = [] } = useMonitors();

  const monitorName = (id: string) => monitors.find((m) => m.id === id)?.name ?? 'Unknown monitor';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Incidents</h1>

      <div className="rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : incidents.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No incidents" description="Nothing has gone down yet — nice." />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">Monitor</th>
                <th className="px-6 py-3">Started</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Cause</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <Link to={`/monitors/${inc.monitorId}`} className="font-medium text-indigo-600 hover:underline">
                      {monitorName(inc.monitorId)}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{formatDateTime(inc.startedAt)}</td>
                  <td className="px-6 py-3 text-slate-600">{formatDuration(inc.startedAt, inc.resolvedAt)}</td>
                  <td className="px-6 py-3 text-slate-600">{inc.cause}</td>
                  <td className="px-6 py-3">
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
