import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCalendar, FiMapPin, FiVideo, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { eventsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export default function EventsPage() {
  const { isAdminOrExco } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', event_date: '', type: 'meeting', location: '', meeting_link: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsAPI.getAll({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => eventsAPI.create(data),
    onSuccess: () => {
      toast.success('Event created!');
      setShowForm(false);
      setForm({ title: '', description: '', event_date: '', type: 'meeting', location: '', meeting_link: '' });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create event'),
  });

  const events = data?.data?.events || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const isPast = (date) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        {isAdminOrExco() && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <FiPlus /> {showForm ? 'Cancel' : 'Create Event'}
          </button>
        )}
      </div>

      {/* Create Event Form */}
      {showForm && (
        <div className="card border-2 border-stoba-green/20">
          <h3 className="font-semibold text-lg mb-4">New Event</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Title</label>
              <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Date & Time</label>
              <input type="datetime-local" className="input-field" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="meeting">Meeting</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Meeting Link</label>
              <input className="input-field" type="url" placeholder="https://" value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading events...</div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event.id} className={`card ${isPast(event.event_date) ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="min-w-[60px] h-16 bg-stoba-green/10 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs text-stoba-green font-medium">
                    {new Date(event.event_date).toLocaleDateString('en-NG', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold text-stoba-green leading-none">
                    {new Date(event.event_date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      event.type === 'meeting' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>{event.type}</span>
                    {isPast(event.event_date) && <span className="text-xs text-gray-400">(Past)</span>}
                  </div>
                  {event.description && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{event.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={12} />
                      {new Date(event.event_date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1"><FiMapPin size={12} />{event.location}</span>
                    )}
                    {event.meeting_link && (
                      <a href={event.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-stoba-green hover:underline">
                        <FiVideo size={12} /> Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FiCalendar size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">No events yet</p>
        </div>
      )}
    </div>
  );
}
