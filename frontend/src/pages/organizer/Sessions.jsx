import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDuration } from '../../utils/formatters';

const statusStyle = {
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
  PENDING: 'bg-amber-50 text-amber-700',
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [newSession, setNewSession] = useState({
    track_id: '', title: '', description: '', level: 'Beginner', duration: '01:00:00', prerequisites: '', speaker_ids: []
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, trackRes, speakRes] = await Promise.all([
        axios.get('/api/sessions'),
        axios.get('/api/tracks'),          // ← fixed: no hardcoded URL, no conferenceId needed
        axios.get('/api/speakers'),
      ]);
      setSessions(Array.isArray(sessRes.data) ? sessRes.data : []);
      setTracks(Array.isArray(trackRes.data) ? trackRes.data : []);
      setSpeakers(Array.isArray(speakRes.data) ? speakRes.data : []);
    } catch (err) {
      console.error('Error fetching sessions data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/sessions/${id}/status`, { status });
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/sessions', {
        ...newSession,
        prerequisites: newSession.prerequisites.split(',').map(p => p.trim()).filter(Boolean),
      });
      setNewSession({ track_id: '', title: '', description: '', level: 'Beginner', duration: '01:00:00', prerequisites: '', speaker_ids: [] });
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create session');
    }
  };

  const filtered = filter === 'ALL' ? sessions : sessions.filter(s => s.status === filter);
  const counts = {
    ALL: sessions.length,
    PENDING: sessions.filter(s => s.status === 'PENDING').length,
    APPROVED: sessions.filter(s => s.status === 'APPROVED').length,
    REJECTED: sessions.filter(s => s.status === 'REJECTED').length,
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading sessions...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sessions</h2>
          <p className="text-slate-500 font-medium">Review and approve speaker submissions.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm uppercase tracking-wider"
        >
          + Add Session
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab} <span className="ml-1 text-[9px]">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
            <p className="text-slate-400 font-bold">No {filter !== 'ALL' ? filter.toLowerCase() : ''} sessions found.</p>
          </div>
        )}
        {filtered.map(session => (
          <div key={session.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all">
            <div className="flex flex-col md:flex-row justify-between gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase">
                    {session.track_name || 'No Track'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${statusStyle[session.status] || 'bg-slate-100 text-slate-600'}`}>
                    {session.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{session.title}</h3>
                <p className="text-slate-500 text-sm font-medium mb-3">
                  {session.level} · {formatDuration(session.duration)}
                </p>
                {/* Speakers */}
                {session.speakers?.some(s => s.id) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {session.speakers.filter(s => s.id).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-slate-600 text-sm font-medium line-clamp-2 italic">"{session.description}"</p>
              </div>

              {/* Action buttons */}
              <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                {session.status !== 'APPROVED' && (
                  <button
                    onClick={() => updateStatus(session.id, 'APPROVED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase transition-all"
                  >
                    ✓ Approve
                  </button>
                )}
                {session.status !== 'REJECTED' && (
                  <button
                    onClick={() => updateStatus(session.id, 'REJECTED')}
                    className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 rounded-lg text-xs font-black uppercase transition-all"
                  >
                    ✕ Reject
                  </button>
                )}
                {session.status === 'APPROVED' && (
                  <button
                    onClick={() => updateStatus(session.id, 'PENDING')}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-black uppercase transition-all"
                  >
                    ↺ Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Session Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={() => setIsAdding(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-900 mb-6">Create New Session</h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Session Title *</label>
                  <input required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm" placeholder="e.g. Master Cluster Management" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Track *</label>
                  <select required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm" value={newSession.track_id} onChange={e => setNewSession({...newSession, track_id: e.target.value})}>
                    <option value="">Select a Track</option>
                    {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea required rows={3} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm" placeholder="What will attendees learn?" value={newSession.description} onChange={e => setNewSession({...newSession, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Level</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm" value={newSession.level} onChange={e => setNewSession({...newSession, level: e.target.value})}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Duration (HH:MM:SS)</label>
                  <input className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm" value={newSession.duration} onChange={e => setNewSession({...newSession, duration: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Speakers</label>
                <select multiple className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm h-28" value={newSession.speaker_ids} onChange={e => setNewSession({...newSession, speaker_ids: Array.from(e.target.selectedOptions, o => o.value)})}>
                  {speakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm uppercase tracking-wider">Create Session</button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-200 text-sm uppercase tracking-wider">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
