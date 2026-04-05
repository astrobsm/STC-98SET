import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiCalendar, FiUsers, FiAlertCircle,
  FiTrendingUp, FiCheckCircle, FiClock, FiGift, FiHeart,
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import { paymentsAPI, eventsAPI, usersAPI, birthdaysAPI } from '../services/api';

function StatCard({ icon: Icon, label, value, color, to }) {
  const card = (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function DashboardPage() {
  const { user, isAdminOrExco } = useAuthStore();

  const { data: summaryData } = useQuery({
    queryKey: ['payment-summary'],
    queryFn: () => paymentsAPI.getSummary(),
  });

  const { data: eventsData } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => eventsAPI.getAll({ upcoming: 'true', limit: 5 }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersAPI.getStats(),
    enabled: isAdminOrExco(),
  });

  const { data: celebrationsData } = useQuery({
    queryKey: ['upcoming-celebrations'],
    queryFn: () => birthdaysAPI.getUpcoming(),
  });

  const summary = summaryData?.data?.summary;
  const events = eventsData?.data?.events || [];
  const stats = statsData?.data?.stats;
  const weekBirthdays = celebrationsData?.data?.birthdays || [];
  const weekAnniversaries = celebrationsData?.data?.anniversaries || [];

  const formatMoney = (val) => `₦${Number(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiClock size={16} />
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdminOrExco() ? (
          <>
            <StatCard icon={FiUsers} label="Total Members" value={stats?.total} color="bg-stoba-green" to="/members" />
            <StatCard icon={FiTrendingUp} label="Total Collected" value={formatMoney(summary?.total_collected)} color="bg-blue-600" />
            <StatCard icon={FiAlertCircle} label="Outstanding" value={formatMoney(summary?.outstanding)} color="bg-orange-500" />
            <StatCard icon={FiCheckCircle} label="Fully Paid" value={summary?.members_fully_paid} color="bg-emerald-600" />
          </>
        ) : (
          <>
            <StatCard icon={FiDollarSign} label="Annual Dues" value={formatMoney(summary?.total_due)} color="bg-stoba-green" />
            <StatCard icon={FiCheckCircle} label="Amount Paid" value={formatMoney(summary?.total_paid)} color="bg-blue-600" to="/payments" />
            <StatCard icon={FiAlertCircle} label="Outstanding" value={formatMoney(summary?.outstanding)} color="bg-orange-500" to="/payments" />
            <StatCard icon={FiCalendar} label="Upcoming Events" value={events.length} color="bg-stoba-brown" to="/events" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Details Card */}
        <div className="card bg-gradient-to-br from-stoba-green to-stoba-green-light text-white">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FiDollarSign /> Payment Information
          </h3>
          <div className="space-y-2 text-green-50">
            <p><span className="text-green-200 text-sm">Bank:</span> <span className="font-semibold">Access Bank</span></p>
            <p><span className="text-green-200 text-sm">Account Number:</span> <span className="font-bold text-stoba-yellow text-xl tracking-wider">0760005400</span></p>
            <p><span className="text-green-200 text-sm">Account Name:</span> <span className="font-semibold">STOBA 98</span></p>
            <p><span className="text-green-200 text-sm">Annual Dues:</span> <span className="font-semibold">₦10,000</span></p>
          </div>
          <Link to="/payments" className="mt-4 inline-block bg-stoba-yellow text-stoba-brown-dark px-4 py-2 rounded-lg font-semibold text-sm hover:bg-stoba-yellow-light transition-colors">
            Make Payment
          </Link>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <FiCalendar className="text-stoba-green" /> Upcoming Events
            </h3>
            <Link to="/events" className="text-sm text-stoba-green hover:underline">View All</Link>
          </div>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 4).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-[48px] h-12 bg-stoba-green/10 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs text-stoba-green font-medium">
                      {new Date(event.event_date).toLocaleDateString('en-NG', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-stoba-green leading-none">
                      {new Date(event.event_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{event.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No upcoming events</p>
          )}
        </div>
      </div>

      {/* Upcoming Celebrations This Week */}
      {(weekBirthdays.length > 0 || weekAnniversaries.length > 0) && (
        <div className="card border-2 border-stoba-yellow/30 bg-gradient-to-br from-stoba-yellow/5 to-orange-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <FiGift className="text-stoba-yellow" /> Celebrations This Week
            </h3>
            <Link to="/birthdays" className="text-sm text-stoba-green hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {weekBirthdays.map((m) => (
              <div key={`bd-${m.id}`} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-stoba-green flex items-center justify-center text-white font-bold">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    m.full_name?.charAt(0) || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.full_name}</p>
                  <p className="text-xs text-gray-500">
                    🎂 Birthday &bull; {new Date(m.date_of_birth + 'T00:00:00').toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  m.days_until_birthday === 0
                    ? 'bg-stoba-yellow text-stoba-brown-dark animate-pulse'
                    : 'bg-stoba-green/10 text-stoba-green'
                }`}>
                  {m.days_until_birthday === 0 ? 'TODAY!' : m.days_until_birthday === 1 ? 'Tomorrow' : `${m.days_until_birthday}d`}
                </span>
              </div>
            ))}
            {weekAnniversaries.map((m) => (
              <div key={`an-${m.id}`} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-stoba-brown flex items-center justify-center text-white font-bold">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    m.full_name?.charAt(0) || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.full_name}</p>
                  <p className="text-xs text-gray-500">
                    💍 Wedding Anniversary &bull; {m.years_married} year{m.years_married !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  m.days_until_anniversary === 0
                    ? 'bg-stoba-yellow text-stoba-brown-dark animate-pulse'
                    : 'bg-stoba-brown/10 text-stoba-brown'
                }`}>
                  {m.days_until_anniversary === 0 ? 'TODAY!' : m.days_until_anniversary === 1 ? 'Tomorrow' : `${m.days_until_anniversary}d`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watermark */}
      <div className="flex justify-center opacity-10 mt-8">
        <img src="/logo.png" alt="" className="w-24 h-24" />
      </div>
    </div>
  );
}
