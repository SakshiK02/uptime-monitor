import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { MonitorFormModal, type MonitorFormValues } from '../components/MonitorFormModal';
import { StatusBadge } from '../components/StatusBadge';
import { useCreateMonitor, useDeleteMonitor, useMonitors, useUpdateMonitor } from '../hooks/useMonitors';
import { useToast } from '../context/ToastContext';
import { formatRelative } from '../utils/format';
import type { Monitor } from '../types/api';

export function MonitorsPage() {
  const { data: monitors = [], isLoading } = useMonitors();
  const createMutation = useCreateMonitor();
  const updateMutation = useUpdateMonitor();
  const deleteMutation = useDeleteMonitor();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Monitor | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSubmit(values: MonitorFormValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, input: values }, { onSuccess: () => showToast('Monitor updated') });
    } else {
      createMutation.mutate(values, { onSuccess: () => showToast('Monitor added — checks will start shortly') });
    }
    setIsFormOpen(false);
    setEditing(undefined);
  }

  function handleDelete() {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        showToast('Monitor deleted');
        setDeletingId(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Monitors</h1>
        <Button onClick={() => setIsFormOpen(true)}>Add monitor</Button>
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : monitors.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No monitors yet" description="Add a URL to start watching it every few minutes." />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">URL</th>
                <th className="px-6 py-3">Interval</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last checked</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {monitors.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <Link to={`/monitors/${m.id}`} className="font-medium text-indigo-600 hover:underline">
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{m.url}</td>
                  <td className="px-6 py-3 text-slate-500">Every {m.intervalMinutes}m</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={m.isActive ? m.currentStatus : 'pending'} />
                  </td>
                  <td className="px-6 py-3 text-slate-500">{formatRelative(m.lastCheckedAt)}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      className="mr-3 text-xs font-medium text-indigo-600 hover:underline"
                      onClick={() => {
                        setEditing(m);
                        setIsFormOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button className="text-xs font-medium text-rose-600 hover:underline" onClick={() => setDeletingId(m.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <MonitorFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(undefined);
        }}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        initial={editing}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete monitor"
        message="This will stop all checks and remove its history. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
