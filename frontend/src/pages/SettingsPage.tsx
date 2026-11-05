import { useState } from 'react';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { AlertChannelFormModal, type AlertChannelFormValues } from '../components/AlertChannelFormModal';
import { useAlertChannels, useCreateAlertChannel, useDeleteAlertChannel } from '../hooks/useAlertChannels';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function SettingsPage() {
  const { user } = useAuth();
  const { data: channels = [], isLoading } = useAlertChannels();
  const createMutation = useCreateAlertChannel();
  const deleteMutation = useDeleteAlertChannel();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSubmit(values: AlertChannelFormValues) {
    createMutation.mutate(values, { onSuccess: () => showToast('Alert channel added') });
    setIsFormOpen(false);
  }

  function handleDelete() {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        showToast('Alert channel removed');
        setDeletingId(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="max-w-md rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Profile</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Username</dt>
            <dd className="font-medium text-slate-800">{user?.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{user?.email}</dd>
          </div>
        </dl>
      </div>

      <div className="max-w-md rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Alert channels</h2>
          <Button onClick={() => setIsFormOpen(true)}>Add channel</Button>
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : channels.length === 0 ? (
          <EmptyState title="No alert channels" description="Add an email or Telegram chat to get notified when a monitor goes down." />
        ) : (
          <ul className="space-y-2">
            {channels.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium capitalize text-slate-700">{c.type}</p>
                  <p className="text-xs text-slate-400">{c.target}</p>
                </div>
                <button className="text-xs font-medium text-rose-600 hover:underline" onClick={() => setDeletingId(c.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertChannelFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Remove alert channel"
        message="You will stop receiving alerts on this channel."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
