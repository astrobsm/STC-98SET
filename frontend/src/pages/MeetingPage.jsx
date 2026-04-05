import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiVideo, FiVideoOff, FiLink, FiCalendar, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { eventsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export default function MeetingPage() {
  const { user, isAdminOrExco } = useAuthStore();
  const [inMeeting, setInMeeting] = useState(false);
  const [roomName, setRoomName] = useState('STOBA98-General');
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const { data: eventsData } = useQuery({
    queryKey: ['meeting-events'],
    queryFn: () => eventsAPI.getAll({ type: 'meeting', upcoming: 'true', limit: 5 }),
  });

  const meetings = eventsData?.data?.events || [];

  const startMeeting = (room) => {
    const name = room || roomName;
    // Sanitize room name for Jitsi
    const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '');
    setRoomName(sanitized);
    setInMeeting(true);
  };

  const leaveMeeting = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setInMeeting(false);
  };

  useEffect(() => {
    if (!inMeeting || !jitsiContainerRef.current) return;

    // Load Jitsi Meet External API
    const script = document.createElement('script');
    script.src = 'https://8x8.vc/vpaas-magic-cookie-ef5ce88c523d41a599c8b1dc5b3ab765/external_api.js';
    script.async = true;

    script.onload = () => {
      if (!window.JitsiMeetExternalAPI) {
        // Fallback to public Jitsi
        loadPublicJitsi();
        return;
      }
      try {
        jitsiApiRef.current = new window.JitsiMeetExternalAPI('8x8.vc', {
          roomName: `vpaas-magic-cookie-ef5ce88c523d41a599c8b1dc5b3ab765/${roomName}`,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: user?.full_name || 'STOBA Member',
            email: user?.email || '',
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'desktop', 'chat',
              'raisehand', 'participants-pane', 'tileview', 'hangup',
            ],
            SHOW_JITSI_WATERMARK: false,
            APP_NAME: 'STOBA 98 Meeting',
          },
        });
        jitsiApiRef.current.addEventListener('readyToClose', leaveMeeting);
      } catch {
        loadPublicJitsi();
      }
    };

    script.onerror = () => {
      loadPublicJitsi();
    };

    document.head.appendChild(script);

    function loadPublicJitsi() {
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://meet.jit.si/external_api.js';
      fallbackScript.async = true;
      fallbackScript.onload = () => {
        if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current) return;
        jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: `STOBA98-${roomName}`,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: user?.full_name || 'STOBA Member',
            email: user?.email || '',
          },
          configOverwrite: {
            startWithAudioMuted: true,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            APP_NAME: 'STOBA 98 Meeting',
          },
        });
        jitsiApiRef.current.addEventListener('readyToClose', leaveMeeting);
      };
      document.head.appendChild(fallbackScript);
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [inMeeting, roomName, user]);

  const copyLink = (room) => {
    const link = `https://meet.jit.si/STOBA98-${room || roomName}`;
    navigator.clipboard.writeText(link).then(
      () => toast.success('Meeting link copied!'),
      () => toast.error('Failed to copy')
    );
  };

  if (inMeeting) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiVideo className="text-stoba-green" /> In Meeting: {roomName}
          </h1>
          <button onClick={leaveMeeting} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
            <FiVideoOff className="inline mr-2" size={16} />Leave Meeting
          </button>
        </div>
        <div
          ref={jitsiContainerRef}
          className="w-full rounded-xl overflow-hidden bg-gray-900"
          style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meeting Room</h1>

      {/* Quick Join */}
      <div className="card bg-gradient-to-br from-stoba-green to-stoba-green-light text-white">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <FiVideo /> Start or Join a Meeting
            </h3>
            <p className="text-green-100 text-sm mb-3">Enter a room name or use the default</p>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-stoba-yellow"
              placeholder="Room name (e.g. STOBA98-General)"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => startMeeting()} className="btn-secondary whitespace-nowrap">
              <FiVideo className="inline mr-2" size={16} />Join Meeting
            </button>
            <button onClick={() => copyLink()} className="p-2.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors" title="Copy meeting link">
              <FiLink size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="card">
        <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <FiCalendar className="text-stoba-green" /> Upcoming Meetings
        </h3>
        {meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map((m) => {
              const eventDate = new Date(m.event_date);
              const isToday = eventDate.toDateString() === new Date().toDateString();
              return (
                <div key={m.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border ${isToday ? 'border-stoba-green bg-stoba-green/5' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className="min-w-[50px] text-center">
                      <span className="text-xs text-stoba-green font-medium">
                        {eventDate.toLocaleDateString('en-NG', { month: 'short' })}
                      </span>
                      <span className="block text-xl font-bold text-stoba-green leading-none">
                        {eventDate.getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{m.title}</h4>
                      <p className="text-sm text-gray-500">
                        {eventDate.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        {m.location && ` · ${m.location}`}
                      </p>
                      {isToday && <span className="inline-block mt-1 text-xs bg-stoba-green text-white px-2 py-0.5 rounded-full">Today</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    {m.meeting_link ? (
                      <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2 px-4">
                        <FiVideo className="inline mr-1" size={14} />Join
                      </a>
                    ) : (
                      <button
                        onClick={() => startMeeting(m.title.replace(/[^a-zA-Z0-9]/g, '-'))}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        <FiVideo className="inline mr-1" size={14} />Start
                      </button>
                    )}
                    <button
                      onClick={() => copyLink(m.title.replace(/[^a-zA-Z0-9]/g, '-'))}
                      className="btn-outline text-sm py-2 px-3"
                      title="Copy link"
                    >
                      <FiLink size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiCalendar size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">No upcoming meetings scheduled</p>
          </div>
        )}
      </div>

      {/* Quarterly Meetings Info */}
      <div className="card bg-stoba-yellow/10 border-stoba-yellow/30">
        <h3 className="font-semibold text-stoba-brown mb-3 flex items-center gap-2">
          <FiUsers /> Quarterly Meeting Schedule
        </h3>
        <p className="text-sm text-gray-600 mb-3">Meetings are held on the last Sunday of these months:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['March', 'June', 'September', 'December'].map((month) => (
            <div key={month} className="text-center p-3 bg-white rounded-lg border border-stoba-yellow/20">
              <p className="font-semibold text-stoba-brown">{month}</p>
              <p className="text-xs text-gray-500">Last Sunday</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
