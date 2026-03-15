import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  UserCircleIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  PlusIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '../../components/Icons';

// ─── Inline Tag Input for expertise ───────────────────────────────────────────
const TagInput = ({ tags, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };
  return (
    <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl bg-white min-h-[44px] focus-within:ring-2 focus-within:ring-blue-500">
      {tags.map((t, i) => (
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((_, idx) => idx !== i))} className="text-blue-400 hover:text-blue-700">✕</button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] outline-none text-sm font-medium text-slate-700 bg-transparent"
        value={input}
        placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
      />
    </div>
  );
};

// ─── Profile Edit Panel ────────────────────────────────────────────────────────
const ProfilePanel = ({ profile, onClose, onSaved }) => {
  const [form, setForm] = useState({
    bio: profile?.bio || '',
    expertise: profile?.expertise || [],
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/api/speaker-portal/profile', form);
      onSaved(res.data);
      onClose();
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="px-8 pb-8">
          <div className="w-16 h-16 rounded-full bg-white ring-4 ring-white shadow-lg -mt-8 mb-4 flex items-center justify-center text-slate-200">
            <UserCircleIcon className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">{profile?.name}</h2>
          <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-6">Edit your public profile</p>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bio</label>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={4}
                placeholder="Tell attendees about yourself, your background, and what drives you..."
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Expertise <span className="normal-case font-medium text-slate-400">(press Enter or comma to add)</span>
              </label>
              <TagInput
                tags={form.expertise}
                onChange={expertise => setForm({ ...form, expertise })}
                placeholder="e.g. Kubernetes, GitOps..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-black text-sm transition-all shadow-md"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const SpeakerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, sessionsRes, feedbackRes] = await Promise.all([
          axios.get('/api/speaker-portal/profile'),
          axios.get('/api/speaker-portal/sessions'),
          axios.get('/api/speaker-portal/feedback').catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
        setFeedback(Array.isArray(feedbackRes.data) ? feedbackRes.data : []);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading dashboard...</p>
    </div>
  );

  const confirmed = sessions.filter(s => s.status === 'APPROVED');
  const pending = sessions.filter(s => s.status === 'PENDING');
  const rejected = sessions.filter(s => s.status === 'REJECTED');

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : null;

  return (
    <>
      {editingProfile && (
        <ProfilePanel
          profile={profile}
          onClose={() => setEditingProfile(false)}
          onSaved={(updated) => setProfile(updated)}
        />
      )}

      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-3xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setEditingProfile(true)}
              className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all group relative shrink-0"
              title="Edit Profile"
            >
              <UserCircleIcon className="h-10 w-10 text-white/70 group-hover:text-white transition-colors" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[9px] text-white font-black">✏</span>
            </button>
            <div>
              <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1">Speaker Dashboard</p>
              <h1 className="text-2xl font-black text-white">{profile?.name || 'Speaker'}</h1>
              {profile?.expertise?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(profile.expertise || []).slice(0, 4).map((e, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/10 text-white text-[10px] font-bold rounded-full">{e}</span>
                  ))}
                </div>
              ) : (
                <button onClick={() => setEditingProfile(true)} className="mt-2 text-blue-300 hover:text-white text-xs font-bold underline underline-offset-2">
                  + Add expertise to your profile
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditingProfile(true)}
            className="shrink-0 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-black text-sm transition-all"
          >
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Confirmed', value: confirmed.length, icon: CheckCircleIcon, color: 'emerald' },
            { label: 'Pending Review', value: pending.length, icon: ClockIcon, color: 'amber' },
            { label: 'Rejected', value: rejected.length, icon: ExclamationCircleIcon, color: 'rose' },
            { label: 'Avg Rating', value: avgRating ?? '—', icon: ChatBubbleLeftRightIcon, color: 'blue' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
              </div>
              <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center`}>
                <Icon className={`h-6 w-6 text-${color}-500`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bio section (if set) */}
        {profile?.bio && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Your Bio</h2>
              <button onClick={() => setEditingProfile(true)} className="text-xs text-blue-600 font-black hover:underline">Edit</button>
            </div>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Sessions list */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Confirmed Schedule
            </h2>
            <span className="text-xs font-black text-slate-400 uppercase">{confirmed.length} session{confirmed.length !== 1 ? 's' : ''}</span>
          </div>

          {confirmed.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {confirmed.map(session => (
                <div key={session.id} className="flex items-center p-6 gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{session.title}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">{session.track_name} · {session.level}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase">Approved</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <ExclamationCircleIcon className="h-12 w-12 text-slate-100 mx-auto mb-3" />
              <p className="text-slate-400 font-bold text-sm">No confirmed sessions yet.</p>
              <p className="text-slate-300 text-xs mt-1">Go to <strong>My Sessions</strong> to submit a proposal.</p>
            </div>
          )}
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h2 className="font-black text-amber-700 text-sm uppercase tracking-widest mb-3">
              ⏳ Awaiting Review ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map(s => (
                <div key={s.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-amber-100">
                  <ClockIcon className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-800 text-sm">{s.title}</span>
                  <span className="ml-auto text-[10px] font-black text-slate-400 uppercase">{s.track_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Feedback */}
        {feedback.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                Recent Attendee Feedback
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {feedback.slice(0, 5).map(f => (
                <div key={f.id} className="p-5 flex gap-4">
                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-sm font-black text-slate-600 shrink-0">
                    {f.rating}★
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{f.session_title}</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{f.comment || <span className="italic text-slate-300">No comment</span>}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SpeakerDashboard;
