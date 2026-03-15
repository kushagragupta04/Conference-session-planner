import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserCircleIcon, 
  AcademicCapIcon, 
  CheckCircleIcon,
  ArrowRightIcon
} from '../../components/Icons';

const Speakers = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchSpeakers(); }, []);

  const fetchSpeakers = async () => {
    try {
      const res = await axios.get('/api/speakers');
      setSpeakers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching speakers', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpeakers = speakers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    (s.expertise || []).some(e => e?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Gathering speaker bios...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Speakers</h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">
          {speakers.length} speakers · Research the experts before choosing your track
        </p>
      </header>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name or expertise..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <AcademicCapIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
      </div>

      {filteredSpeakers.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <p className="text-slate-400 font-bold">No speakers found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpeakers.map(speaker => (
            <div key={speaker.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-500 hover:shadow-md transition-all group flex flex-col">
              {/* Header Banner */}
              <div className="h-20 bg-gradient-to-r from-slate-700 to-slate-900 relative" />

              <div className="p-6 flex flex-col flex-1 -mt-10">
                {/* Avatar */}
                <div className="w-16 h-16 bg-white ring-4 ring-white shadow-lg rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <UserCircleIcon className="h-12 w-12" />
                </div>

                <h3 className="text-xl font-black text-slate-900">{speaker.name}</h3>

                {/* Expertise Tags */}
                {speaker.expertise?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                    {(speaker.expertise || []).slice(0, 4).map((exp, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">{exp}</span>
                    ))}
                  </div>
                )}

                {/* Bio */}
                <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed flex-1">
                  {speaker.bio || 'No bio available for this speaker yet.'}
                </p>

                {/* Sessions Link */}
                <a
                  href={`/attendee?speaker_id=${speaker.id}`}
                  className="mt-6 flex items-center justify-center gap-2 py-2.5 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  View Sessions <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Speakers;
