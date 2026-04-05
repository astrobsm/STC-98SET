import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiBell, FiCheckCircle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../services/api';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => {
      toast.success('All marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const notifications = data?.data?.notifications || [];
  const unread = notifications.filter(n => !n.read_status).length;

  const typeIcon = (type) => {
    if (type === 'payment') return '💰';
    if (type === 'meeting') return '📅';
    return '🔔';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="btn-outline text-sm flex items-center gap-2" disabled={markAllMutation.isPending}>
            <FiCheck /> Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start gap-3 cursor-pointer transition-colors ${
                !n.read_status ? 'bg-stoba-green/5 border-stoba-green/20' : ''
              }`}
              onClick={() => !n.read_status && markReadMutation.mutate(n.id)}
            >
              <span className="text-xl">{typeIcon(n.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read_status ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              {!n.read_status && (
                <div className="w-2 h-2 rounded-full bg-stoba-green flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FiBell size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">No notifications</p>
        </div>
      )}
    </div>
  );
}
