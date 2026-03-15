import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '../../components/Icons';

const StarIcon = CheckCircleIcon;

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${value >= star ? 'bg-yellow-400 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-300 hover:bg-yellow-100 hover:text-yellow-400'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const RatingCard = ({ item }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { alert('Please select a star rating.'); return; }
    setLoading(true);
    try {
      await axios.post('/api/attendee-portal/ratings', {
        session_id: item.session_id,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit. You may have already rated this session.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-sm text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircleIcon className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-slate-900">{item.title}</h3>
        <p className="text-emerald-600 font-black text-sm uppercase tracking-widest">Feedback Submitted ✓</p>
        <div className="flex justify-center gap-1 mt-2">
          {[1,2,3,4,5].map(s => (
            <span key={s} className={`text-xl ${s <= rating ? 'text-yellow-400' : 'text-slate-100'}`}>★</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.title}</h3>

      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Your Thoughts (optional)
        </label>
        <textarea
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="What did you love? What could be improved?"
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !rating}
        className="w-full py-3 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

const Ratings = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSchedule(); }, []);

  const fetchSchedule = async () => {
    try {
      const res = await axios.get('/api/attendee-portal/schedule');
      setSchedule(Array.isArray(res.data) ? res.data.filter(s => s.status === 'CONFIRMED') : []);
    } catch (err) {
      console.error('Error fetching schedule', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading your sessions...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Session Ratings</h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">
          Your feedback shapes future conferences
        </p>
      </header>

      {schedule.length === 0 ? (
        <div className="py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-400 font-bold max-w-sm mx-auto">
            Register for and attend sessions to rate them here.
          </p>
          <a href="/attendee" className="inline-block mt-6 text-blue-600 font-black text-xs uppercase hover:underline">
            Browse Sessions
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedule.map(item => <RatingCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
};

export default Ratings;
