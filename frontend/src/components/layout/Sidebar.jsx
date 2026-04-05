import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiDollarSign, FiCalendar, FiFileText, FiUsers,
  FiBell, FiUser, FiVideo, FiCheckSquare, FiAward, FiX, FiLogOut, FiTarget, FiGift,
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/payments', icon: FiDollarSign, label: 'Payments' },
  { to: '/contributions', icon: FiTarget, label: 'Contributions' },
  { to: '/events', icon: FiCalendar, label: 'Events' },
  { to: '/constitution', icon: FiFileText, label: 'Constitution' },
  { to: '/exco', icon: FiAward, label: 'EXCO Members' },
  { to: '/meeting', icon: FiVideo, label: 'Meeting Room' },
  { to: '/birthdays', icon: FiGift, label: 'Celebrations' },
  { to: '/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

const adminItems = [
  { to: '/members', icon: FiUsers, label: 'All Members' },
  { to: '/payment-approvals', icon: FiCheckSquare, label: 'Payment Approvals' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdminOrExco } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-stoba-yellow/20 text-stoba-green-dark'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="STOBA 98" className="w-10 h-10 rounded-full border-2 border-stoba-green" />
            <div>
              <h2 className="font-bold text-stoba-green text-sm">STOBA 98</h2>
              <p className="text-xs text-gray-400">Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600" aria-label="Close sidebar">
            <FiX size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-stoba-green flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.full_name?.charAt(0) || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {isAdminOrExco() && (
            <>
              <div className="pt-4 pb-2 px-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</p>
              </div>
              {adminItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <FiLogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
