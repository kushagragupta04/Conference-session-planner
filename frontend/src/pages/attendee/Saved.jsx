import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookmarkIcon, 
  TrashIcon, 
  ArrowRightIcon,
  Squares2X2Icon
} from '../../components/Icons';

const Saved = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('/api/attendee-portal/bookmarks');
      setBookmarks(res.data);
    } catch (err) {
      console.error('Error fetching bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id) => {
    try {
      await axios.post('/api/attendee-portal/bookmarks', { session_id: id });
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error removing bookmark', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-blue-600 font-bold">Loading Bookmarks...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Sessions</h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">Sessions you're keeping an eye on</p>
      </header>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <BookmarkIcon className="h-12 w-12 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">You haven't bookmarked any sessions yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((session) => (
            <div key={session.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:border-blue-500 transition-all group">
               <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                  {session.track_name}
                </span>
                <button 
                    onClick={() => removeBookmark(session.id)}
                    className="text-blue-500 hover:text-rose-500 transition-colors"
                >
                  <BookmarkIcon className="h-6 w-6 fill-current" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{session.title}</h3>
              <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">
                {session.description}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                <a 
                    href="/attendee" // Simplified for now
                    className="text-blue-600 font-black text-xs uppercase flex items-center hover:translate-x-1 transition-transform"
                >
                  View Details
                </a>
                <button 
                  onClick={() => removeBookmark(session.id)}
                  className="text-slate-400 hover:text-rose-500 font-bold text-xs uppercase"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
