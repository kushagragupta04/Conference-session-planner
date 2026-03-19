import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDuration } from '../../utils/formatters';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BookmarkIcon,
  ClockIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  AcademicCapIcon
} from '../../components/Icons';

// ─── Speaker Profile Modal ───────────────────────────────────────────────────
const SpeakerModal = ({ speaker, onClose }) => {
  if (!speaker) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        {/* Avatar */}
        <div className="px-8 pb-8">
          <div className="w-20 h-20 rounded-full bg-white ring-4 ring-white shadow-xl -mt-10 mb-4 flex items-center justify-center text-slate-300 overflow-hidden">
            <UserCircleIcon className="h-14 w-14" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{speaker.name}</h2>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-0.5">Conference Speaker</p>

          {/* Expertise */}
          {speaker.expertise?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {speaker.expertise.map((e, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="mt-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">About</h4>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              {speaker.bio || 'No bio available for this speaker yet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Session Detail Panel ─────────────────────────────────────────────────────
const SessionPanel = ({ session, onClose, onBookmark, onRegister, isRegistered, isBookmarked }) => {
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  if (!session) return null;

  const isFull = session.current_attendance >= session.capacity && session.capacity;
  const fillPct = session.capacity ? Math.min((session.current_attendance / session.capacity) * 100, 100) : 0;

  return (
    <>
      {selectedSpeaker && <SpeakerModal speaker={selectedSpeaker} onClose={() => setSelectedSpeaker(null)} />}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-slate-100 flex justify-between items-start gap-4">
            <div className="flex-1">
              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded uppercase tracking-widest mb-2">
                {session.track_name}
              </span>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{session.title}</h2>
            </div>
            <button onClick={onClose} className="shrink-0 w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
              <XMarkIcon className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</p>
                <p className="font-bold text-slate-900">{session.level || 'All Levels'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room</p>
                <p className="font-bold text-slate-900">{session.room_name || 'TBA'}</p>
              </div>
              {session.venue_name && (
                <div className="bg-slate-50 rounded-2xl p-4 col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Venue</p>
                  <p className="font-bold text-slate-900">{session.venue_name}</p>
                  {session.venue_address && <p className="text-sm text-slate-500 mt-0.5">{session.venue_address}</p>}
                </div>
              )}
            </div>

            {/* Capacity Bar */}
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5">
                <span>Live Capacity</span>
                <span className={isFull ? 'text-rose-500' : 'text-emerald-500'}>
                  {session.current_attendance || 0} / {session.capacity || '∞'} attendees
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 rounded-full ${isFull ? 'bg-rose-500' : fillPct > 75 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              {isFull && (
                <p className="text-rose-500 text-xs font-bold mt-1.5 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-3 w-3" />
                  Session is full — you'll be added to the waitlist
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">About this session</p>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">{session.description}</p>
            </div>

            {/* Speakers */}
            {session.speakers?.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Speakers</p>
                <div className="space-y-3">
                  {session.speakers.map((sp) => (
                    <div key={sp.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors cursor-pointer group" onClick={() => setSelectedSpeaker(sp)}>
                      <div className="w-10 h-10 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center shrink-0">
                        <UserCircleIcon className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{sp.name}</p>
                        {sp.expertise?.length > 0 && (
                          <p className="text-xs text-slate-500">{sp.expertise.slice(0, 2).join(' · ')}</p>
                        )}
                      </div>
                      <AcademicCapIcon className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex gap-3">
            <button 
              onClick={() => onBookmark(session.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border font-black text-sm transition-all ${isBookmarked ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}
            >
              <BookmarkIcon className="h-4 w-4" />
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button 
              onClick={() => { onRegister(session.id); onClose(); }}
              className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${isRegistered ? 'bg-emerald-600 text-white cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              disabled={isRegistered}
            >
              {isRegistered ? '✓ Attending' : isFull ? 'Join Waitlist' : 'Attend Session'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Discover Page ────────────────────────────────────────────────────────
const Discover = () => {
  const [sessions, setSessions] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ track_id: '', level: '' });
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [registeredIds, setRegisteredIds] = useState(new Set());

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, tracksRes, bookmarksRes, scheduleRes] = await Promise.all([
        axios.get('/api/attendee-portal/sessions', { params: filters }),
        axios.get('/api/tracks'),
        axios.get('/api/attendee-portal/bookmarks').catch(() => ({ data: [] })),
        axios.get('/api/attendee-portal/schedule').catch(() => ({ data: [] })),
      ]);
      setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
      setTracks(Array.isArray(tracksRes.data) ? tracksRes.data : []);
      setBookmarkedIds(new Set((bookmarksRes.data || []).map(b => b.id)));
      setRegisteredIds(new Set((scheduleRes.data || []).map(s => s.session_id)));
    } catch (err) {
      console.error('Error fetching discovery data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (sessionId) => {
    try {
      await axios.post('/api/attendee-portal/bookmarks', { session_id: sessionId });
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        next.has(sessionId) ? next.delete(sessionId) : next.add(sessionId);
        return next;
      });
    } catch (err) { console.error('Error toggling bookmark', err); }
  };

  const handleRegister = async (sessionId) => {
    try {
      const res = await axios.post('/api/attendee-portal/register', { session_id: sessionId });
      alert(res.data.status === 'WAITLISTED' 
        ? '⏳ Session is full! You\'ve been added to the waitlist.' 
        : '✅ You are now attending this session!');
      setRegisteredIds(prev => new Set([...prev, sessionId]));
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const filteredSessions = sessions.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading sessions...</p>
    </div>
  );

  return (
    <>
      {selectedSession && (
        <SessionPanel
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onBookmark={handleBookmark}
          onRegister={handleRegister}
          isBookmarked={bookmarkedIds.has(selectedSession.id)}
          isRegistered={registeredIds.has(selectedSession.id)}
        />
      )}

      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Discover Sessions</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">
            {filteredSessions.length} sessions · Click any card to explore
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title or topic..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>
          <select
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.track_id}
            onChange={e => setFilters({ ...filters, track_id: e.target.value })}
          >
            <option value="">All Tracks</option>
            {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.level}
            onChange={e => setFilters({ ...filters, level: e.target.value })}
          >
            <option value="">All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        {/* Session Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const isFull = session.current_attendance >= session.capacity && session.capacity;
            const fillPct = session.capacity ? Math.min((session.current_attendance / session.capacity) * 100, 100) : 0;
            const isBookmarked = bookmarkedIds.has(session.id);
            const isRegistered = registeredIds.has(session.id);

            return (
              <div
                key={session.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col"
                onClick={() => setSelectedSession(session)}
              >
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                      {session.track_name || 'General'}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); handleBookmark(session.id); }}
                      className={`transition-colors ${isBookmarked ? 'text-blue-500' : 'text-slate-200 hover:text-blue-400'}`}
                    >
                      <BookmarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {session.title}
                  </h3>

                  <p className="text-slate-500 text-sm font-medium line-clamp-2">
                    {session.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {session.level || 'All Levels'} · {formatDuration(session.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCircleIcon className="h-3.5 w-3.5" />
                      {session.speaker_names?.filter(Boolean).join(', ') || 'TBA'}
                    </span>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>Capacity</span>
                      <span className={isFull ? 'text-rose-500' : fillPct > 75 ? 'text-amber-500' : 'text-emerald-500'}>
                        {session.current_attendance || 0}/{session.capacity || '∞'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-rose-500' : fillPct > 75 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  {isRegistered ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs text-center flex items-center justify-center gap-2">
                      <CheckCircleIcon className="h-4 w-4" /> Attending
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); handleRegister(session.id); }}
                      className={`w-full py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 ${isFull ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}
                    >
                      {isFull ? 'Join Waitlist' : 'Attend'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSessions.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No sessions found matching your criteria.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Discover;
