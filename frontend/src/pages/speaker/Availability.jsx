import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  UserCircleIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '../../components/Icons';

const Availability = () => {
  const [profile, setProfile] = useState({
    bio: '',
    expertise: [],
    availability: { slots: [] },
    name: ''
  });
  const [loading, setLoading] = useState(true);
  const [newExp, setNewExp] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/speaker-portal/profile');
      const data = res.data || {};
      
      setProfile({
        name: data.name || '',
        bio: data.bio || '',
        expertise: Array.isArray(data.expertise) ? data.expertise : [],
        availability: {
          slots: Array.isArray(data.availability?.slots) ? data.availability.slots : []
        }
      });
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/speaker-portal/profile', profile);
      alert('Profile and availability updated!');
    } catch (err) {
      console.error('Error saving profile', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addExpertise = (e) => {
    e.preventDefault();
    if (newExp && Array.isArray(profile.expertise) && !profile.expertise.includes(newExp)) {
      setProfile({ ...profile, expertise: [...profile.expertise, newExp] });
      setNewExp('');
    }
  };

  const removeExpertise = (exp) => {
    if (Array.isArray(profile.expertise)) {
      setProfile({ ...profile, expertise: profile.expertise.filter(e => e !== exp) });
    }
  };

  const addSlot = () => {
    const newSlot = { day: 'Day 1', start: '09:00', end: '10:00' };
    const currentSlots = Array.isArray(profile.availability?.slots) ? profile.availability.slots : [];
    setProfile({
      ...profile,
      availability: { slots: [...currentSlots, newSlot] }
    });
  };

  const updateSlot = (index, field, value) => {
    if (!Array.isArray(profile.availability?.slots)) return;
    const newSlots = [...profile.availability.slots];
    if (newSlots[index]) {
      newSlots[index][field] = value;
      setProfile({ ...profile, availability: { slots: newSlots } });
    }
  };

  const removeSlot = (index) => {
    if (!Array.isArray(profile.availability?.slots)) return;
    const newSlots = profile.availability.slots.filter((_, i) => i !== index);
    setProfile({ ...profile, availability: { slots: newSlots } });
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-blue-600 font-bold">Loading Availability...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans text-slate-900 border-none shadow-none">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Profile & Availability</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Customize your presence and schedule</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-black transition-colors shadow-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <UserCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
            Speaker Profile
          </h2>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Short Bio</label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm min-h-[120px]"
              value={profile.bio || ''}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expertise Tags</label>
            <form onSubmit={addExpertise} className="flex space-x-2 mb-4">
              <input
                type="text"
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                value={newExp}
                onChange={(e) => setNewExp(e.target.value)}
                placeholder="Cloud, DevOps..."
              />
              <button type="submit" className="bg-slate-100 p-2 rounded-lg text-slate-600 hover:bg-slate-200">
                <PlusIcon className="h-5 w-5" />
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(profile.expertise) && profile.expertise.map((exp, i) => (
                <span key={i} className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-full uppercase">
                  {exp}
                  <button onClick={() => removeExpertise(exp)} className="ml-2 hover:text-blue-900">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Availability Slots */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Availability Slots
            </h2>
            <button
              onClick={addSlot}
              className="text-blue-600 hover:text-blue-800 text-xs font-black uppercase flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add Slot
            </button>
          </div>
          
          <div className="space-y-4">
            {profile.availability?.slots && Array.isArray(profile.availability.slots) && profile.availability.slots.length > 0 ? (
              profile.availability.slots.map((slot, index) => (
                <div key={index} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <select
                    className="bg-transparent font-bold text-sm outline-none"
                    value={slot.day}
                    onChange={(e) => updateSlot(index, 'day', e.target.value)}
                  >
                    <option value="Day 1">Day 1</option>
                    <option value="Day 2">Day 2</option>
                    <option value="Day 3">Day 3</option>
                  </select>
                  <input
                    type="time"
                    className="bg-transparent font-bold text-sm outline-none"
                    value={slot.start}
                    onChange={(e) => updateSlot(index, 'start', e.target.value)}
                  />
                  <span className="text-slate-400 font-black">→</span>
                  <input
                    type="time"
                    className="bg-transparent font-bold text-sm outline-none"
                    value={slot.end}
                    onChange={(e) => updateSlot(index, 'end', e.target.value)}
                  />
                  <button
                    onClick={() => removeSlot(index)}
                    className="text-slate-400 hover:text-rose-500 ml-auto"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-bold">No availability slots defined.</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-amber-50 rounded-xl flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs leading-relaxed font-bold">
              Organizers will use these slots to find the best time for your session. Make sure to include all times you are reachable at the venue!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
