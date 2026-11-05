import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './Button';
import { Modal } from './Modal';

const schema = z.object({
  type: z.enum(['email', 'telegram', 'ntfy']),
  target: z.string().min(1, 'Required'),
  isEnabled: z.boolean(),
});


export type AlertChannelFormValues = z.infer<typeof schema>;

interface AlertChannelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AlertChannelFormValues) => void;
  isSubmitting?: boolean;
}

export function AlertChannelFormModal({ isOpen, onClose, onSubmit, isSubmitting }: AlertChannelFormModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AlertChannelFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'email', target: '', isEnabled: true },
  });

  const type = watch('type');

  function submitAndReset(values: AlertChannelFormValues) {
    onSubmit(values);
    reset();
  }

  return (
    <Modal title="Add alert channel" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(submitAndReset)} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Channel type
          <select {...register('type')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="email">Email</option>
            <option value="telegram">Telegram</option>
            <option value="ntfy">Ntfy (phone push)</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          {type === 'email' ? 'Email address' : type === 'telegram' ? 'Telegram chat ID' : 'Ntfy topic name'}
          <input
            {...register('target')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder={type === 'email' ? 'you@example.com' : type === 'telegram' ? '123456789' : 'pingwatch-your-name-1234'}
          />
          {errors.target && <p className="mt-1 text-xs text-rose-600">{errors.target.message}</p>}
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
