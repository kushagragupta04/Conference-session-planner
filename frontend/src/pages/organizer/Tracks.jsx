import { useState, useEffect } from 'react';
import axios from 'axios';

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
];

const DEFAULTS = [
  { name: 'CI/CD',               description: 'Continuous Integration and Deployment pipelines.' },
  { name: 'Kubernetes',          description: 'Container orchestration and Helm chart management.' },
  { name: 'Observability',       description: 'Monitoring, logging, and distributed tracing.' },
  { name: 'Security',            description: 'DevSecOps, compliance and supply-chain hardening.' },
  { name: 'Platform Engineering',description: 'Internal developer platforms and golden paths.' },
  { name: 'Cloud Native',        description: 'Serverless, microservices and multi-cloud patterns.' },
];

// Inline add / edit row
const InlineForm = ({ initial, onCancel, onSave }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Track name is required'); return; }
    setError('');
    setBusy(true);
    try {
      let res;
      if (initial?.id) {
        res = await axios.put(`/api/tracks/${initial.id}`, { name: name.trim(), description });
      } else {
        res = await axios.post('/api/tracks', { name: name.trim(), description });
      }
      onSave(res.data, initial?.id ? 'edit' : 'add');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed — check server logs');
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className="bg-blue-50/80 border-y-2 border-blue-300">
      <td className="px-4 py-3 w-1/3">
        <input
          autoFocus
          className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-400' : 'border-blue-300'}`}
          placeholder="e.g. Technology, Finance…"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Escape' && onCancel()}
        />
        {error && <p className="text-red-500 text-[10px] font-bold mt-1">{error}</p>}
      </td>
      <td className="px-4 py-3">
        <input
          className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save(e)}
        />
      </td>
      <td className="px-4 py-3 text-center text-slate-300 text-sm">—</td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <button onClick={save} disabled={busy} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-black rounded-lg uppercase mr-2">
          {busy ? '…' : initial?.id ? 'Update' : 'Save'}
        </button>
        <button onClick={onCancel} className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-black rounded-lg border border-slate-200 uppercase">
          Cancel
        </button>
      </td>
    </tr>
  );
};

const Tracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await axios.get('/api/tracks');
      setTracks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load tracks';
      setFetchError(msg);
      console.error('GET /api/tracks failed:', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = (saved, mode) => {
    if (mode === 'edit') {
      setTracks(prev => prev.map(t => t.id === saved.id ? { ...t, ...saved } : t));
      setEditingId(null);
    } else {
      setTracks(prev => [...prev, { ...saved, session_count: 0 }]);
      setAdding(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete track "${name}"? Sessions using it will lose their track.`)) return;
    try {
      await axios.delete(`/api/tracks/${id}`);
      setTracks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const addDefaults = async () => {
    const existing = tracks.map(t => t.name.toLowerCase());
    const toAdd = DEFAULTS.filter(d => !existing.includes(d.name.toLowerCase()));
    if (toAdd.length === 0) { alert('All default tracks already exist.'); return; }
    try {
      const results = await Promise.all(
        toAdd.map(d => axios.post('/api/tracks', d).catch(e => { console.error(e); return null; }))
      );
      const added = results.filter(Boolean).map(r => ({ ...r.data, session_count: 0 }));
      if (added.length > 0) setTracks(prev => [...prev, ...added]);
      else alert('Failed to add defaults — check server logs');
    } catch {
      load();
    }
  };

  const filtered = search
    ? tracks.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : tracks;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tracks</h2>
          <p className="text-slate-500 font-medium mt-1">Session categories · {tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addDefaults} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold transition-all">
            + Add DevOps Defaults
          </button>
          <button
            onClick={() => { setAdding(true); setEditingId(null); }}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
          >
            + Add Track
          </button>
        </div>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-bold text-sm flex items-start gap-2">
          <span>⚠️</span>
          <div>
            <p>Failed to load tracks</p>
            <p className="font-mono text-xs mt-1 text-red-500">{fetchError}</p>
            <button onClick={load} className="mt-2 text-xs underline font-black">Retry</button>
          </div>
        </div>
      )}

      {/* Search */}
      {tracks.length > 3 && (
        <input
          className="w-full max-w-xs px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Search tracks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/3">Track Name</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-24">Sessions</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adding && (
              <InlineForm onCancel={() => setAdding(false)} onSave={handleSave} />
            )}

            {!adding && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center">
                  <p className="text-slate-400 font-bold text-sm">No tracks yet.</p>
                  <p className="text-slate-300 text-xs mt-1">Click <strong className="text-slate-400">+ Add Track</strong> or <strong className="text-slate-400">+ Add DevOps Defaults</strong>.</p>
                </td>
              </tr>
            )}

            {filtered.map((track, idx) =>
              editingId === track.id ? (
                <InlineForm key={track.id} initial={track} onCancel={() => setEditingId(null)} onSave={handleSave} />
              ) : (
                <tr key={track.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${COLORS[idx % COLORS.length]}`}>
                      {track.name}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-500 font-medium line-clamp-1">
                      {track.description || <span className="italic text-slate-300">—</span>}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${(track.session_count || 0) > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                      {track.session_count || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(track.id); setAdding(false); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-lg uppercase">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(track.id, track.name)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-lg uppercase">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tracks;
