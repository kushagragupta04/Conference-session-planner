import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowRightIcon,
  Squares2X2Icon,
  HomeModernIcon as SparklesIcon
} from '../../components/Icons';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get('/api/attendee-portal/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      console.error('Error fetching recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-blue-600 font-bold">Matching Sessions to your interests...</div>;

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <header>
        <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">For You</h1>
            <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">
                Beta AI
            </div>
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">Personalized session matches based on your activity</p>
      </header>

      {recommendations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
          <p className="text-slate-400 font-bold max-w-sm mx-auto">
            Bookmark or register for a few sessions first so our engine can understand your interests!
          </p>
          <a href="/attendee" className="inline-block mt-6 text-blue-600 font-black text-xs uppercase hover:underline">
            Go to Discovery
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((session) => (
            <div key={session.id} className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-500 transition-all shadow-sm flex gap-6">
              <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                <SparklesIcon className="h-8 w-8" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                        {session.track_name}
                    </span>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">98% Match</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{session.title}</h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">
                  {session.description}
                </p>
                <a 
                    href="/attendee" 
                    className="inline-flex items-center text-blue-600 font-black text-xs uppercase group-hover:gap-2 transition-all"
                >
                  Regiser now <ArrowRightIcon className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Social Proof Section */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="relative z-10">
              <h4 className="text-lg font-bold mb-1">Stay ahead of the curve</h4>
              <p className="text-slate-400 text-sm font-medium">Join 500+ attendees who are leveraging AI-driven scheduling.</p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-10 -mt-10 rounded-full"></div>
      </div>
    </div>
  );
};

export default Recommendations;
