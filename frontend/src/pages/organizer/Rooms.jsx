import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrashIcon } from '../../components/Icons';

const Rooms = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  
  const [newVenue, setNewVenue] = useState({ name: '', address: '' });
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', resources: '' });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/venues', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const venuesWithRooms = await Promise.all(res.data.map(async (v) => {
        const roomsRes = await axios.get(`http://localhost:8000/api/rooms/venue/${v.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return { ...v, rooms: roomsRes.data };
      }));
      setVenues(venuesWithRooms);
    } catch (err) {
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/venues', newVenue, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewVenue({ name: '', address: '' });
      setIsAddingVenue(false);
      fetchVenues();
    } catch (err) {
      console.error('Error adding venue:', err);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/rooms', {
        ...newRoom,
        venue_id: selectedVenueId,
        resources: newRoom.resources.split(',').map(r => r.trim()).filter(r => r)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewRoom({ name: '', capacity: '', resources: '' });
      setIsAddingRoom(false);
      fetchVenues();
    } catch (err) {
      console.error('Error adding room:', err);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm('Are you sure you want to delete this venue? This will also remove all its rooms.')) return;
    try {
      await axios.delete(`http://localhost:8000/api/venues/${venueId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchVenues();
    } catch (err) {
      console.error('Error deleting venue:', err);
      alert('Failed to delete venue');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchVenues();
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Failed to delete room');
    }
  };

  if (loading) return <div className="text-slate-500 font-bold">Loading venues and rooms...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Venues & Rooms</h2>
          <p className="text-slate-500 font-medium">Manage physical locations and their capacities.</p>
        </div>
        <button 
          onClick={() => setIsAddingVenue(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm uppercase tracking-wider"
        >
          Add Venue
        </button>
      </div>

      <div className="space-y-8">
        {venues.map((venue) => (
          <div key={venue.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{venue.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{venue.address}</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedVenueId(venue.id); setIsAddingRoom(true); }}
                  className="text-blue-600 text-sm font-bold hover:underline"
                >
                  + Add Room
                </button>
                <button 
                  onClick={() => handleDeleteVenue(venue.id)}
                  className="text-slate-300 hover:text-rose-600 transition-colors"
                  title="Delete Venue"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venue.rooms?.map((room) => (
                  <div key={room.id} className="border border-slate-100 p-4 rounded-md bg-slate-50/30">
                    <div className="flex justify-between items-start mb-2 text-slate-900">
                      <h4 className="font-bold">{room.name}</h4>
                      <button 
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors"
                        title="Delete Room"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Capacity: {room.capacity}</p>
                    <div className="flex flex-wrap gap-1">
                      {room.resources?.map((r, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {(!venue.rooms || venue.rooms.length === 0) && (
                  <p className="text-slate-400 text-sm italic py-4">No rooms added to this venue yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Venue Modal */}
      {isAddingVenue && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Venue</h3>
            <form onSubmit={handleAddVenue} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                  placeholder="Main Convention Center"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({...newVenue, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                  placeholder="123 Conference Way, Tech City"
                  rows="2"
                  value={newVenue.address}
                  onChange={(e) => setNewVenue({...newVenue, address: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors uppercase tracking-wider text-xs">Save Venue</button>
                <button type="button" onClick={() => setIsAddingVenue(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-md font-bold hover:bg-slate-200 transition-colors uppercase tracking-wider text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddingRoom && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Room</h3>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                  placeholder="Grand Ballroom A"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium"
                    placeholder="200"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Resources (comma separated)</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans font-medium text-sm"
                  placeholder="Projector, Wi-Fi, Whiteboard"
                  value={newRoom.resources}
                  onChange={(e) => setNewRoom({...newRoom, resources: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors uppercase tracking-wider text-xs">Save Room</button>
                <button type="button" onClick={() => setIsAddingRoom(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-md font-bold hover:bg-slate-200 transition-colors uppercase tracking-wider text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
