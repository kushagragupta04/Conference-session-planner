import { useState, useEffect } from 'react';
import axios from 'axios';

const Overview = () => {
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    timezone: 'UTC'
  });

  useEffect(() => {
    const fetchConference = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/conferences', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data.length > 0) {
          setConference(res.data[0]);
        }
      } catch (err) {
        console.error('Error fetching conference:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConference();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/conferences', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConference(res.data);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating conference:', err);
      alert('Failed to create conference');
    }
  };

  if (loading) return <div className="text-slate-500 font-bold">Loading conference data...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {conference ? 'Conference Overview' : 'Initialize Conference'}
        </h2>
        {conference && (
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md border border-slate-200 text-sm font-bold transition-all">
            Edit Details
          </button>
        )}
      </div>
      
      {conference ? (
        <>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 mb-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{conference.name}</h3>
                  <p className="text-slate-500 font-medium">
                    {new Date(conference.start_date).toLocaleDateString()} - {new Date(conference.end_date).toLocaleDateString()} ({conference.timezone})
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Sessions</p>
              <p className="text-4xl font-black text-blue-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Speakers</p>
              <p className="text-4xl font-black text-blue-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Rooms Capacity</p>
              <p className="text-4xl font-black text-blue-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Conflicts</p>
              <p className="text-4xl font-black text-green-500 text-sm italic">Clean Architecture</p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 border-dashed flex flex-col items-center justify-center text-center py-16">
          {!showCreateForm ? (
            <>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Initialize your Conference</h3>
              <p className="text-slate-500 max-w-sm mb-8 font-medium">
                Start by creating your conference event and configuring the basic details.
              </p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-sm uppercase tracking-wider text-sm"
              >
                Create Conference
              </button>
            </>
          ) : (
            <form onSubmit={handleCreate} className="w-full max-w-md text-left">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Conference Name</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                    placeholder="DevOps Days 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium text-sm"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium text-sm"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Timezone</label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                    value={formData.timezone}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  >
                    <option value="UTC">UTC</option>
                    <option value="IST">IST (India Standard Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-sm uppercase tracking-wider text-xs"
                  >
                    Initialize Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-md font-bold hover:bg-slate-200 transition-colors uppercase tracking-wider text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Overview;
