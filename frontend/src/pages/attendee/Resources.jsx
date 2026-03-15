import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  QueueListIcon,
  QueueListIcon as DocumentIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '../../components/Icons';

const Resources = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      // Fetch confirmed sessions — only those with materials (slides_url)
      const res = await axios.get('/api/attendee-portal/schedule');
      const confirmed = Array.isArray(res.data)
        ? res.data.filter(s => s.status === 'CONFIRMED')
        : [];
      setSessions(confirmed);
    } catch (err) {
      console.error('Error fetching resources', err);
    } finally {
      setLoading(false);
    }
  };

  const hasMaterial = (session) => session.slides_url || session.materials_url;

  const available = sessions.filter(hasMaterial);
  const pending = sessions.filter(s => !hasMaterial(s));

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Fetching session materials...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Session Resources</h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">
          Slides, code samples, and links from sessions you attended
        </p>
      </header>

      {sessions.length === 0 ? (
        <div className="py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <DocumentIcon className="h-12 w-12 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">Materials appear here after you attend sessions.</p>
          <a href="/attendee" className="inline-block mt-6 text-blue-600 font-black text-xs uppercase hover:underline">
            Browse & Register
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Available Materials */}
          {available.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" /> Materials Available ({available.length})
              </h2>
              {available.map(session => (
                <div key={session.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <DocumentIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{session.title}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {session.room_name ? `${session.room_name} · ` : ''}Slides &amp; Resources
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      {session.slides_url && (
                        <a
                          href={session.slides_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm"
                        >
                          View Slides <ArrowRightIcon className="h-3 w-3" />
                        </a>
                      )}
                      {session.materials_url && (
                        <a
                          href={session.materials_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                        >
                          <QueueListIcon className="h-3.5 w-3.5" /> More
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Sessions Without Materials Yet */}
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Pending Upload ({pending.length})
              </h2>
              {pending.map(session => (
                <div key={session.id} className="bg-slate-50 p-5 rounded-2xl border border-dashed border-slate-200 flex items-center gap-4 opacity-60">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <DocumentIcon className="h-5 w-5 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm">{session.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      Materials not yet uploaded by speaker
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;
