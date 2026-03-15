import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  UsersIcon,
  ExclamationCircleIcon
} from '../../components/Icons';

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get('/api/speaker-portal/feedback');
        setFeedback(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching feedback', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64 text-blue-600 font-bold">Loading Feedback...</div>;

  const averageRating = feedback.length > 0 
    ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Feedback & Ratings</h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Learn what attendees thought of your sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Overall Rating</p>
          <div className="flex items-end space-x-2">
            <p className="text-4xl font-black text-blue-600">{averageRating}</p>
            <p className="text-slate-400 font-bold mb-1">/ 5.0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total Responses</p>
          <p className="text-4xl font-black text-slate-900">{feedback.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Attendee Insight</p>
          <p className="text-sm font-bold text-slate-600">Great engagement levels reported!</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-blue-600" />
            Detailed Comments & Ratings
          </h2>
        </div>
        
        {Array.isArray(feedback) && feedback.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {feedback.map((item, i) => (
              <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900">{item.session_title}</h3>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-lg ${star <= item.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{item.feedback || 'No written feedback provided.'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ExclamationCircleIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No feedback received yet.</p>
            <p className="text-slate-400 text-sm">Feedback will appear here after your sessions conclude!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
