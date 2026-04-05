import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FiGift, FiHeart, FiCalendar, FiSend, FiClock, FiStar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { birthdaysAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const BIRTHDAY_EMOJIS = ['🎂', '🎉', '🥳', '🎊', '🎈', '🌟', '✨'];

function getRandomEmoji() {
  return BIRTHDAY_EMOJIS[Math.floor(Math.random() * BIRTHDAY_EMOJIS.length)];
}

function CelebrationCard({ member, type = 'birthday', onSendMessage }) {
  const isBirthday = type === 'birthday';
  const firstName = member.full_name?.split(' ')[0];
  const daysUntil = isBirthday ? member.days_until_birthday : member.days_until_anniversary;
  const isToday = isBirthday ? member.is_birthday_today : member.is_anniversary_today;
  const info = isBirthday
    ? `Turning ${member.age}`
    : `${member.years_married} years married`;

  return (
    <div className={`card border-2 transition-all ${
      isToday ? 'border-stoba-yellow bg-gradient-to-br from-stoba-yellow/10 to-orange-50 shadow-lg' : 'border-gray-100 hover:border-stoba-green/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow ${
          isToday ? 'bg-stoba-yellow text-stoba-brown-dark' : 'bg-stoba-green/10 text-stoba-green'
        }`}>
          {member.full_name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 truncate">{member.full_name}</h3>
            {isToday && <span className="text-lg">{getRandomEmoji()}</span>}
          </div>
          <p className="text-sm text-gray-500">{info}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isBirthday
              ? member.date_of_birth && new Date(member.date_of_birth).toLocaleDateString('en-NG', { month: 'long', day: 'numeric' })
              : member.wedding_anniversary && new Date(member.wedding_anniversary).toLocaleDateString('en-NG', { month: 'long', day: 'numeric' })}
          </p>
          {isToday ? (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-stoba-yellow text-stoba-brown-dark px-2 py-0.5 rounded-full font-bold animate-pulse">
                <FiStar size={10} /> TODAY!
              </span>
            </div>
          ) : (
            <p className="text-xs text-stoba-green font-medium mt-1">
              <FiClock className="inline mr-1" size={10} />
              {daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days away`}
            </p>
          )}
        </div>
        {isBirthday && (
          <button
            onClick={() => onSendMessage(member)}
            className="flex-shrink-0 bg-stoba-green text-white p-2 rounded-lg hover:bg-stoba-green-dark transition-colors"
            title="Send birthday message"
          >
            <FiSend size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function BirthdaysPage() {
  const { isAdmin, isAdminOrExco } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('birthdays');
  const [sentMessage, setSentMessage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['birthdays'],
    queryFn: () => birthdaysAPI.getAll(),
  });

  const sendMsgMutation = useMutation({
    mutationFn: (userId) => birthdaysAPI.sendMessage({ user_id: userId }),
    onSuccess: (res) => {
      const msg = res?.data?.message;
      setSentMessage(msg);
      toast.success('Birthday message sent!');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send'),
  });

  const todayBirthdays = data?.data?.today_birthdays || [];
  const upcomingBirthdays = data?.data?.upcoming_birthdays || [];
  const allBirthdays = data?.data?.all_birthdays || [];
  const anniversaries = data?.data?.anniversaries || [];

  const handleSendMessage = (member) => {
    sendMsgMutation.mutate(member.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiGift className="text-stoba-yellow" /> Celebrations
          </h1>
          <p className="text-sm text-gray-500 mt-1">Birthdays, anniversaries & celebrations</p>
        </div>
      </div>

      {/* Today's Birthdays Banner */}
      {todayBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-stoba-yellow via-orange-300 to-stoba-yellow rounded-xl p-6 text-center shadow-lg">
          <div className="text-4xl mb-2">🎂🎉🥳</div>
          <h2 className="text-xl font-bold text-stoba-brown-dark mb-2">
            Happy Birthday{todayBirthdays.length > 1 ? ' to' : ', '}
            {todayBirthdays.map((m, i) => (
              <span key={m.id}>
                {i > 0 && (i === todayBirthdays.length - 1 ? ' & ' : ', ')}
                {m.full_name}
              </span>
            ))}!
          </h2>
          <p className="text-stoba-brown text-sm">The STOBA 98 family celebrates you today! 🎊</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          onClick={() => setTab('birthdays')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'birthdays' ? 'border-stoba-green text-stoba-green' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiGift className="inline mr-1" /> Birthdays
        </button>
        <button
          onClick={() => setTab('anniversaries')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'anniversaries' ? 'border-stoba-green text-stoba-green' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiHeart className="inline mr-1" /> Anniversaries
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'all' ? 'border-stoba-green text-stoba-green' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiCalendar className="inline mr-1" /> All Members
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading celebrations...</div>
      ) : (
        <>
          {tab === 'birthdays' && (
            <div className="space-y-6">
              {/* Upcoming */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiClock className="text-stoba-green" /> Upcoming Birthdays (Next 30 Days)
                </h3>
                {upcomingBirthdays.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {upcomingBirthdays.map((m) => (
                      <CelebrationCard key={m.id} member={m} type="birthday" onSendMessage={handleSendMessage} />
                    ))}
                  </div>
                ) : (
                  <div className="card text-center py-8">
                    <FiCalendar size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">No birthdays in the next 30 days</p>
                  </div>
                )}
              </div>

              {/* Today */}
              {todayBirthdays.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiStar className="text-stoba-yellow" /> Today's Birthday Stars
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {todayBirthdays.map((m) => (
                      <CelebrationCard key={m.id} member={m} type="birthday" onSendMessage={handleSendMessage} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'anniversaries' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiHeart className="text-red-400" /> Wedding Anniversaries
              </h3>
              {anniversaries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {anniversaries.map((m) => (
                    <CelebrationCard key={m.id} member={m} type="anniversary" onSendMessage={() => {}} />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-8">
                  <FiHeart size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">No anniversary data yet</p>
                </div>
              )}
            </div>
          )}

          {tab === 'all' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">All Member Birthdays</h3>
              {allBirthdays.length > 0 ? (
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-2 px-3 text-left text-gray-500 font-medium">Name</th>
                        <th className="py-2 px-3 text-left text-gray-500 font-medium">Birthday</th>
                        <th className="py-2 px-3 text-left text-gray-500 font-medium">Age</th>
                        <th className="py-2 px-3 text-left text-gray-500 font-medium">Days Until</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBirthdays.map((m) => (
                        <tr key={m.id} className={`border-b border-gray-50 ${m.is_birthday_today ? 'bg-stoba-yellow/10' : ''}`}>
                          <td className="py-2 px-3 font-medium text-gray-900">
                            {m.full_name} {m.is_birthday_today && '🎂'}
                          </td>
                          <td className="py-2 px-3 text-gray-600">
                            {m.date_of_birth && new Date(m.date_of_birth).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2 px-3 text-gray-600">{m.age}</td>
                          <td className="py-2 px-3">
                            {m.is_birthday_today ? (
                              <span className="text-stoba-yellow font-bold">Today!</span>
                            ) : (
                              <span className="text-gray-500">{m.days_until_birthday} days</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card text-center py-8">
                  <p className="text-gray-400 text-sm">No birthday data available</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Sent Message Modal */}
      {sentMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎂🎉</div>
              <h3 className="text-lg font-bold text-gray-900">Birthday Message Sent!</h3>
            </div>
            <div className="bg-gradient-to-br from-stoba-green/5 to-stoba-yellow/10 border border-stoba-green/20 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {sentMessage}
            </div>
            <button
              onClick={() => setSentMessage(null)}
              className="mt-4 w-full btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
