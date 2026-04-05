import { useQuery } from '@tanstack/react-query';
import { FiMenu, FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuthStore();
  const { data } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => notificationsAPI.getAll({ unread_only: 'true', limit: 1 }),
    refetchInterval: 30000,
  });

  const unreadCount = data?.data?.pagination?.total || 0;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
            Welcome, {user?.full_name?.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <FiBell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/profile" className="flex items-center gap-2">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-stoba-green flex items-center justify-center text-white text-sm font-bold">
                {user?.full_name?.charAt(0) || '?'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
