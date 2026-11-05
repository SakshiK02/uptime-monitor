import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './Button';
import { Modal } from './Modal';
import type { Monitor } from '../types/api';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  url: z.string().url('Enter a valid URL, including https://'),
  intervalMinutes: z.coerce.number().int().min(1, 'Minimum 1 minute'),
  isActive: z.boolean(),
});

type MonitorFormInput = z.input<typeof schema>;
export type MonitorFormValues = z.output<typeof schema>;

interface MonitorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MonitorFormValues) => void;
  isSubmitting?: boolean;
  initial?: Monitor;
}

export function MonitorFormModal({ isOpen, onClose, onSubmit, isSubmitting, initial }: MonitorFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MonitorFormInput, unknown, MonitorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? { name: initial.name, url: initial.url, intervalMinutes: initial.intervalMinutes, isActive: initial.isActive }
      : { name: '', url: '', intervalMinutes: 5, isActive: true },
  });

  function submitAndReset(values: MonitorFormValues) {
    onSubmit(values);
    reset();
  }

  return (
    <Modal title={initial ? 'Edit monitor' : 'Add monitor'} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(submitAndReset)} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input {...register('name')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Portfolio site" />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
        </label>

        <label className="block text-sm font-medium text-slate-700">
          URL to check
          <input {...register('url')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="https://example.com" />
          {errors.url && <p className="mt-1 text-xs text-rose-600">{errors.url.message}</p>}
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Check every (minutes)
          <input type="number" {...register('intervalMinutes')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          {errors.intervalMinutes && <p className="mt-1 text-xs text-rose-600">{errors.intervalMinutes.message}</p>}
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register('isActive')} className="rounded border-slate-300" />
          Active (uncheck to pause monitoring)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
