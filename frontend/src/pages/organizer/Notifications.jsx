import { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', target_role: 'ALL' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/notifications', newAnnouncement, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewAnnouncement({ title: '', message: '', target_role: 'ALL' });
      setIsSending(false);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error sending announcement:', err);
    }
  };

  if (loading) return <div className="text-slate-500 font-bold">Loading announcements...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Announcements</h2>
          <p className="text-slate-500 font-medium">Broadcast updates to speakers and attendees.</p>
        </div>
        <button 
          onClick={() => setIsSending(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm uppercase tracking-wider"
        >
          Send Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{ann.target_role}</span>
                 <h3 className="text-xl font-bold text-slate-900 mt-1">{ann.title}</h3>
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(ann.created_at).toLocaleDateString()}</p>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">{ann.message}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-12 text-center">
            <p className="text-slate-400 font-medium italic">No announcements broadcast yet.</p>
          </div>
        )}
      </div>

      {isSending && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight">New Broadcast</h3>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                  placeholder="Schedule Update / Call for Sessions"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium text-sm"
                  placeholder="Broadcast details..."
                  rows="4"
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                  value={newAnnouncement.target_role}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, target_role: e.target.value})}
                >
                  <option value="ALL">Everyone</option>
                  <option value="SPEAKER">Speakers Only</option>
                  <option value="ATTENDEE">Attendees Only</option>
                </select>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors uppercase tracking-wider text-xs shadow-md">Broadcast Now</button>
                <button type="button" onClick={() => setIsSending(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-md font-bold hover:bg-slate-200 transition-colors uppercase tracking-wider text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
