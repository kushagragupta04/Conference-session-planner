import { useState, useEffect } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [stats, setStats] = useState({
    sessions: 0,
    speakers: 0,
    tracks: 0,
    rooms: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [sessRes, speakRes, trackRes, confRes] = await Promise.all([
          axios.get('http://localhost:8000/api/sessions', { headers: authHeader }),
          axios.get('http://localhost:8000/api/speakers', { headers: authHeader }),
          axios.get('http://localhost:8000/api/conferences', { headers: authHeader }).then(res => 
             res.data.length > 0 ? axios.get(`http://localhost:8000/api/tracks/conference/${res.data[0].id}`, { headers: authHeader }) : { data: [] }
          ),
          axios.get('http://localhost:8000/api/venues', { headers: authHeader }).then(vRes => 
             vRes.data.length > 0 ? axios.get(`http://localhost:8000/api/rooms/venue/${vRes.data[0].id}`, { headers: authHeader }) : { data: [] }
          )
        ]);

        setStats({
          sessions: sessRes.data.length,
          speakers: speakRes.data.length,
          tracks: trackRes.data.length,
          rooms: confRes.data.length
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-slate-500 font-bold">Loading analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Conference Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Sessions</p>
          <p className="text-4xl font-black text-blue-600">{stats.sessions}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Approved & Pending</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Onboarded Speakers</p>
          <p className="text-4xl font-black text-blue-600">{stats.speakers}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Verified Profiles</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Tracks</p>
          <p className="text-4xl font-black text-blue-600">{stats.tracks}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Tech Categories</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Available Rooms</p>
          <p className="text-4xl font-black text-blue-600">{stats.rooms}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Allocated Venues</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6 font-sans uppercase tracking-tight">Engagement Insights</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-blue-600 h-full w-[65%]"></div>
            </div>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Session Diversity</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-blue-600 h-full w-[40%]"></div>
            </div>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Slot Utilization</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
