import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiMapPin, FiPhone, FiMail, FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiGrid, FiMaximize } from 'react-icons/fi';
import { usersAPI } from '../services/api';

const SLIDE_INTERVAL = 5000; // 5 seconds per slide

export default function MemberGalleryPage() {
  const [mode, setMode] = useState('grid'); // 'grid' | 'slideshow'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['gallery-members'],
    queryFn: () => usersAPI.getAll({ limit: 500 }),
  });

  const members = (data?.data?.users || data?.data || []).filter(
    (m) => m.status !== 'suspended'
  );

  // Auto-advance slideshow
  useEffect(() => {
    if (mode !== 'slideshow' || !playing || members.length === 0) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % members.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [mode, playing, members.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % members.length);
  }, [members.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + members.length) % members.length);
  }, [members.length]);

  // Keyboard navigation
  useEffect(() => {
    if (mode !== 'slideshow') return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === 'Escape') setMode('grid');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, goNext, goPrev]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stoba-green" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-16">
        <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No members found</p>
      </div>
    );
  }

  // ===== SLIDESHOW MODE =====
  if (mode === 'slideshow') {
    const member = members[currentIndex];
    return (
      <div className="space-y-4">
        {/* Controls bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-stoba-green" /> Member Slideshow
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">
              {currentIndex + 1} / {members.length}
            </span>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? <FiPause size={18} /> : <FiPlay size={18} />}
            </button>
            <button
              onClick={() => { setMode('grid'); setPlaying(false); }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Grid view"
            >
              <FiGrid size={18} />
            </button>
          </div>
        </div>

        {/* Slide card */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden" style={{ minHeight: '500px' }}>
          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/80 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/80 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <FiChevronRight size={24} />
          </button>

          {/* Member content */}
          <div className="flex flex-col items-center justify-center py-12 px-6">
            {/* Avatar */}
            <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden shadow-2xl border-4 border-stoba-green mb-8">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stoba-green to-stoba-green-light flex items-center justify-center text-white text-7xl font-bold">
                  {member.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>

            {/* Info */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{member.full_name}</h2>
            <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium capitalize mb-4 ${
              member.role === 'admin' ? 'bg-red-100 text-red-700' :
              member.role === 'exco' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>{member.role}</span>

            <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600">
              {member.state_of_residence && (
                <span className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-full text-sm">
                  <FiMapPin className="text-stoba-green" size={16} />
                  {member.state_of_residence}
                </span>
              )}
              {member.phone && (
                <span className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-full text-sm">
                  <FiPhone className="text-stoba-green" size={16} />
                  {member.phone}
                </span>
              )}
              {member.email && (
                <span className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-full text-sm">
                  <FiMail className="text-stoba-green" size={16} />
                  {member.email}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {playing && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-stoba-green"
                style={{
                  animation: `slideProgress ${SLIDE_INTERVAL}ms linear`,
                  animationFillMode: 'forwards',
                }}
                key={currentIndex}
              />
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-thin">
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                i === currentIndex ? 'border-stoba-green scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {m.avatar_url ? (
                <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stoba-green flex items-center justify-center text-white text-xs font-bold">
                  {m.full_name?.charAt(0) || '?'}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* CSS animation for progress bar */}
        <style>{`
          @keyframes slideProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // ===== GRID MODE =====
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiUsers className="text-stoba-green" /> Member Gallery
          <span className="text-sm font-normal text-gray-500 ml-2">({members.length} members)</span>
        </h1>
        <button
          onClick={() => { setMode('slideshow'); setCurrentIndex(0); setPlaying(true); }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <FiMaximize size={14} /> Slideshow
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {members.map((m, i) => (
          <button
            key={m.id}
            onClick={() => { setMode('slideshow'); setCurrentIndex(i); setPlaying(false); }}
            className="card p-4 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow cursor-pointer text-center group"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-stoba-green transition-colors">
              {m.avatar_url ? (
                <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stoba-green to-stoba-green-light flex items-center justify-center text-white text-2xl font-bold">
                  {m.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{m.full_name}</p>
              {m.state_of_residence && (
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <FiMapPin size={10} /> {m.state_of_residence}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
