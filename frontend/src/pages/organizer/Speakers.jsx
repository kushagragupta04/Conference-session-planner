import { useState, useEffect } from 'react';
import axios from 'axios';

const Speakers = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSpeaker, setNewSpeaker] = useState({ 
    name: '', bio: '', expertise: '' 
  });

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/speakers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSpeakers(res.data);
    } catch (err) {
      console.error('Error fetching speakers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpeaker = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/speakers', {
        ...newSpeaker,
        expertise: newSpeaker.expertise.split(',').map(e => e.trim()).filter(e => e)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewSpeaker({ name: '', bio: '', expertise: '' });
      setIsAdding(false);
      fetchSpeakers();
    } catch (err) {
      console.error('Error adding speaker:', err);
    }
  };

  if (loading) return <div className="text-slate-500 font-bold">Loading speakers...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Speakers</h2>
          <p className="text-slate-500 font-medium">Manage conference speakers and their profiles.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm uppercase tracking-wider"
        >
          Add Speaker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {speakers.map((speaker) => (
          <div key={speaker.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-1">{speaker.name}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Speaker Profile</p>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
              {speaker.bio || 'No bio available.'}
            </p>
            <div className="flex flex-wrap gap-1">
              {speaker.expertise?.map((exp, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-tight">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        ))}
        {speakers.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-lg p-12 text-center">
            <p className="text-slate-400 font-medium font-italic italic">No speakers added yet.</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Speaker</h3>
            <form onSubmit={handleAddSpeaker} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Speaker Name</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                  placeholder="e.g. Jane Doe"
                  value={newSpeaker.name}
                  onChange={(e) => setNewSpeaker({...newSpeaker, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium text-sm"
                  placeholder="Speaker's professional background..."
                  rows="3"
                  value={newSpeaker.bio}
                  onChange={(e) => setNewSpeaker({...newSpeaker, bio: e.target.value})}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Expertise (comma separated)</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium text-sm"
                  placeholder="Docker, CI/CD, AWS"
                  value={newSpeaker.expertise}
                  onChange={(e) => setNewSpeaker({...newSpeaker, expertise: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors uppercase tracking-wider text-xs">Save Speaker</button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-md font-bold hover:bg-slate-200 transition-colors uppercase tracking-wider text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Speakers;
