import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDuration } from '../../utils/formatters';
import { 
  VideoCameraIcon, 
  PlusIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  XMarkIcon,
  QueueListIcon,
  ArrowRightIcon,
  TrashIcon
} from '../../components/Icons';

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'APPROVED') return (
    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase">
      <CheckCircleIcon className="h-3 w-3" /> Approved
    </span>
  );
  if (status === 'REJECTED') return (
    <span className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-black rounded-full uppercase">
      <XCircleIcon className="h-3 w-3" /> Rejected
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase">
      <ClockIcon className="h-3 w-3" /> Pending
    </span>
  );
};

// ─── Session Detail Slideout ───────────────────────────────────────────────────
const SessionDetail = ({ session, onClose, onUploadSlides }) => {
  const [slidesUrl, setSlidesUrl] = useState(session.slides_url || '');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!slidesUrl.trim()) return;
    setUploading(true);
    try {
      await axios.post('/api/speaker-portal/materials', { session_id: session.id, slides_url: slidesUrl });
      onUploadSlides(session.id, slidesUrl);
      onClose();
    } catch {
      alert('Failed to save slides URL');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <StatusBadge status={session.status} />
            <h2 className="text-xl font-black text-slate-900 mt-2 leading-tight">{session.title}</h2>
            <p className="text-xs font-black text-slate-400 uppercase mt-1">
              {session.track_name} · {session.level} · {formatDuration(session.duration)}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center shrink-0">
            <XMarkIcon className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{session.description}</p>
          </div>
          {session.prerequisites?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prerequisites</p>
              <div className="flex flex-wrap gap-2">
                {session.prerequisites.map((p, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{p}</span>
                ))}
              </div>
            </div>
          )}
          {session.equipment_requirements && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Equipment</p>
              <p className="text-slate-700 text-sm font-medium">{session.equipment_requirements}</p>
            </div>
          )}
          {session.status === 'APPROVED' && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Upload Slides / Materials URL</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://slides.com/your-deck"
                  value={slidesUrl}
                  onChange={e => setSlidesUrl(e.target.value)}
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase transition-all"
                >
                  Save
                </button>
              </div>
              {session.slides_url && (
                <a href={session.slides_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 font-bold text-xs mt-2 hover:underline">
                  <ArrowRightIcon className="h-3 w-3" /> Current slides
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import SlotPicker from '../../components/SlotPicker';

// ─── Proposal Modal (Two-Step Wizard) ──────────────────────────────────────────
const ProposalModal = ({ tracks, onClose, onSubmitted }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', track_id: '',
    level: 'Beginner',
    prerequisites: '', equipment_requirements: '',
    selected_slots: []
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (form.selected_slots.length === 0) { alert('Please select at least one time slot.'); return; }
    setSubmitting(true);
    try {
      const prereqArray = form.prerequisites.split(',').map(s => s.trim()).filter(Boolean);
      await axios.post('/api/speaker-portal/proposals', { ...form, prerequisites: prereqArray });
      onSubmitted();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label, key, el) => (
    <div>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</label>
      {el}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-8 pt-7 pb-5 border-b border-slate-100 flex justify-between items-center z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                {step === 1 ? 'Step 1: Details' : 'Step 1: Done ✓'}
              </span>
              {step === 2 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white animate-pulse">
                  Step 2: Select Slot
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {step === 1 ? 'Describe your Session' : 'Pick your Time Slot'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center shrink-0">
            <XMarkIcon className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              {field('Session Title *',  'title',
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g., Scaling Kubernetes in Production" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              )}
              {field('Description *', 'description',
                <textarea required rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" placeholder="What will attendees learn? What's the key takeaway?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {field('Track *', 'track_id',
                  <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={form.track_id} onChange={e => setForm({...form, track_id: e.target.value})}>
                    <option value="">— Select a track —</option>
                    {tracks.length === 0
                      ? <option disabled>No tracks configured yet</option>
                      : tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                    }
                  </select>
                )}
                {field('Level', 'level',
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                )}
              </div>

              {field('Equipment Requirements', 'equipment_requirements',
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Projector, Whiteboard..." value={form.equipment_requirements} onChange={e => setForm({...form, equipment_requirements: e.target.value})} />
              )}
              {field('Prerequisites (comma separated)', 'prerequisites',
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Docker basics, CLI..." value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} />
              )}
            </div>
          ) : (
            <SlotPicker 
              selectedSlots={form.selected_slots}
              onSelect={(slots) => setForm({...form, selected_slots: slots})}
            />
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
            {step === 1 ? (
              <button 
                type="button"
                onClick={() => {
                  if (!form.title || !form.description || !form.track_id) {
                    alert('Please fill in title, description and track.');
                    return;
                  }
                  setStep(2);
                }}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                Continue to Slot Selection <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase transition-all"
                >
                  Back to Details
                </button>
                <button 
                  type="button"
                  disabled={submitting || form.selected_slots.length === 0}
                  onClick={handleSubmit}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-100"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Submit Proposal'}
                </button>
              </>
            )}
            <button type="button" onClick={onClose} className="px-6 py-4 text-slate-400 hover:text-rose-500 font-black text-xs uppercase transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main MySessions Page ─────────────────────────────────────────────────────
const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch sessions
    try {
      const res = await axios.get('/api/speaker-portal/sessions');
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching sessions:', err.response?.data?.message || err.message);
    }

    // Fetch tracks
    try {
      const res = await axios.get('/api/tracks');
      console.log('Speaker portal fetched tracks:', res.data);
      setTracks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching tracks:', err.response?.data?.message || err.message);
    }

    setLoading(false);
  };

  const handleUploadSlides = (sessionId, slidesUrl) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, slides_url: slidesUrl } : s));
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to withdraw this proposal? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/api/speaker-portal/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete session');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading sessions...</p>
    </div>
  );

  return (
    <>
      {showProposalModal && (
        <ProposalModal
          tracks={tracks}
          onClose={() => setShowProposalModal(false)}
          onSubmitted={fetchData}
        />
      )}
      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onUploadSlides={handleUploadSlides}
        />
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Sessions</h1>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">
              {sessions.length} proposal{sessions.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
          <button
            onClick={() => setShowProposalModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            Submit Proposal
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
            <VideoCameraIcon className="h-12 w-12 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No proposals submitted yet.</p>
            <p className="text-slate-300 text-sm mt-1">Click "Submit Proposal" to get started.</p>
            <button
              onClick={() => setShowProposalModal(true)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg"
            >
              <PlusIcon className="h-4 w-4" /> Submit your first proposal
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Session</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Track</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Scheduled Time</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Slides</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map(session => (
                    <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{session.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xs mt-0.5">{session.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                          {session.track_name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {session.start_time ? (
                          <>
                            <p className="text-xs font-black text-slate-700">
                              {new Date(session.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                              {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                              {session.room_name && ` · ${session.room_name}`}
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-300 text-xs font-bold italic">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={session.status} />
                      </td>
                      <td className="px-6 py-4">
                        {session.slides_url ? (
                          <a href={session.slides_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-black text-xs hover:underline flex items-center gap-1">
                            <QueueListIcon className="h-3.5 w-3.5" /> View
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs font-bold">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-black uppercase flex items-center gap-1"
                          >
                            Open <ArrowRightIcon className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                            title="Withdraw Proposal"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MySessions;
