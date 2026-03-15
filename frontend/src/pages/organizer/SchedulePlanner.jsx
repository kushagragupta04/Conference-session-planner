import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatDuration } from '../../utils/formatters';
import { 
  CalendarIcon, 
  HomeModernIcon, 
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '../../components/Icons';

const STATUS_COLORS = {
  PENDING: 'bg-white border-slate-200 text-slate-400',
  APPROVED: 'bg-blue-50 border-blue-200 text-blue-700',
  PENDING_CONFLICT: 'bg-rose-50 border-rose-300 text-rose-800',
  SCHEDULED: 'bg-emerald-50 border-emerald-300 text-emerald-800',
};

const SchedulePlanner = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [sessions, setSessions] = useState([]); // Side panel sessions (Approved)
  const [schedule, setSchedule] = useState([]); // Placed sessions
  const [conference, setConference] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  
  // Drag and drop state
  const [draggingSession, setDraggingSession] = useState(null);
  const [selectedSessionInfo, setSelectedSessionInfo] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [confRes, roomRes, sessRes, schedRes] = await Promise.all([
        axios.get('/api/conferences'),
        axios.get('/api/venues').then(vRes => 
          vRes.data.length > 0 ? axios.get(`/api/rooms/venue/${vRes.data[0].id}`) : { data: [] }
        ),
        axios.get('/api/sessions'),
        axios.get('/api/schedule')
      ]);

      const conf = confRes.data[0];
      setConference(conf);
      setRooms(roomRes.data);
      setSchedule(schedRes.data);
      
      // SIDE PANEL: All sessions except REJECTED
      // (Even if scheduled, so the user has a full list)
      setSessions(sessRes.data.filter(s => s.status !== 'REJECTED'));
    } catch (err) {
      console.error('Error fetching planner data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Generate time slots: 09:00 to 22:30 (last slot ends at 23:00)
  const timeSlots = [];
  for (let hour = 9; hour < 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const handleDragStart = (session) => {
    setDraggingSession(session);
  };

  const handleDrop = async (room, timeStr) => {
    if (!draggingSession || !conference) return;

    const baseDate = new Date(conference.start_date);
    baseDate.setDate(baseDate.getDate() + selectedDay);
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const start_time = new Date(baseDate);
    start_time.setHours(hours, minutes, 0, 0);

    // Calculate end time based on duration (default 1h if parsing fails)
    let durationMinutes = 60;
    const dur = draggingSession.duration;
    if (typeof dur === 'object' && dur.minutes) durationMinutes = dur.minutes + (dur.hours || 0) * 60;
    else if (typeof dur === 'string') {
        const matches = dur.match(/(\d+)\s*min/);
        if (matches) durationMinutes = parseInt(matches[1]);
    }

    const end_time = new Date(start_time);
    end_time.setMinutes(start_time.getMinutes() + durationMinutes);

    try {
      const res = await axios.post('/api/schedule', {
        session_id: draggingSession.id,
        room_id: room.id,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString()
      });

      if (res.data.status === 'PENDING_CONFLICT') {
        alert('Warning: Speaker conflict detected for this slot. Session marked as conflict.');
      }
      
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign session');
    } finally {
      setDraggingSession(null);
    }
  };

  const confirmSession = async (sessionId) => {
    try {
      await axios.patch(`/api/schedule/${sessionId}/confirm`);
      fetchData();
    } catch (err) {
      alert('Failed to confirm schedule');
    }
  };

  const removeSession = async (sessionId) => {
    try {
      await axios.delete(`/api/schedule/${sessionId}`);
      fetchData();
    } catch (err) {
      alert('Failed to remove session');
    }
  };

  const updateSessionStatus = async (id, status) => {
    try {
      await axios.patch(`/api/sessions/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Hydrating Timetable...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            Schedule Planner
          </h2>
          <p className="text-slate-500 font-medium mt-1">Drag approved sessions into rooms to build the timeline.</p>
        </div>
        
        {/* Day Selector */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
           <button 
             onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
             disabled={selectedDay === 0}
             className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-700 disabled:opacity-30"
            >
             <ChevronLeftIcon className="h-5 w-5" />
           </button>
           <div className="px-6 text-center min-w-[140px]">
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Day {selectedDay + 1}</p>
             <p className="text-sm font-bold text-slate-900">
               {conference ? (() => {
                 const [y, m, d] = conference.start_date.split('-').map(Number);
                 const date = new Date(Date.UTC(y, m - 1, d));
                 date.setUTCDate(date.getUTCDate() + selectedDay);
                 return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
               })() : '---'}
             </p>
           </div>
           <button 
             onClick={() => {
               if (!conference) return;
               const [sy, sm, sd] = conference.start_date.split('-').map(Number);
               const [ey, em, ed] = conference.end_date.split('-').map(Number);
               const start = new Date(Date.UTC(sy, sm - 1, sd));
               const end = new Date(Date.UTC(ey, em - 1, ed));
               let totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
               
               // DEFENSIVE: Ensure at least X days if it feels restricted
               if (totalDays < 7) totalDays = 7; 
               
               if (selectedDay < totalDays - 1) setSelectedDay(selectedDay + 1);
             }}
             disabled={conference && (() => {
               const [sy, sm, sd] = conference.start_date.split('-').map(Number);
               const [ey, em, ed] = conference.end_date.split('-').map(Number);
               const start = new Date(Date.UTC(sy, sm - 1, sd));
               const end = new Date(Date.UTC(ey, em - 1, ed));
               let totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
               if (totalDays < 7) totalDays = 7;
               return selectedDay >= totalDays - 1;
             })()}
             className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-700 disabled:opacity-30"
           >
             <ChevronRightIcon className="h-5 w-5" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
        
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
              Sessions
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px]">{sessions.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
            {sessions.map(s => (
              <div 
                key={s.id}
                draggable
                onDragStart={() => handleDragStart(s)}
                className="group p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative"
              >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex flex-col gap-1">
                     <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase w-fit">
                       {s.track_name || 'General'}
                     </span>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase w-fit ${
                       s.status === 'SCHEDULED' ? 'bg-emerald-100 text-emerald-700' :
                       s.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                       s.status === 'PENDING_CONFLICT' ? 'bg-rose-100 text-rose-700' :
                       'bg-slate-100 text-slate-400'
                     }`}>
                       {s.status}
                     </span>
                   </div>
                   <div className="flex gap-1">
                     {s.status === 'PENDING' && (
                       <button 
                         onClick={(e) => { e.stopPropagation(); updateSessionStatus(s.id, 'APPROVED'); }}
                         className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                         title="Approve"
                       >
                         <CheckCircleIcon className="h-4 w-4" />
                       </button>
                     )}
                     {(s.status === 'PENDING' || s.status === 'APPROVED' || s.status === 'PENDING_CONFLICT') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(confirm('Reject this session?')) updateSessionStatus(s.id, 'REJECTED'); }}
                          className="p-1 text-rose-400 hover:bg-rose-50 rounded transition-colors"
                          title="Reject"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                     )}
                     {s.status === 'SCHEDULED' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateSessionStatus(s.id, 'APPROVED'); }}
                          className="p-1 text-amber-500 hover:bg-amber-50 rounded transition-colors"
                          title="Un-schedule / Revert to Approved"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                     )}
                     <button onClick={() => setSelectedSessionInfo(s)} className="p-1 text-slate-300 hover:text-blue-500 transition-colors">
                       <InformationCircleIcon className="h-4 w-4" />
                     </button>
                   </div>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors">{s.title}</h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase">
                   <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" /> {formatDuration(s.duration)}</span>
                   <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" /> {s.speakers?.[0]?.name || 'TBA'}</span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <CheckCircleIcon className="h-12 w-12 text-slate-100 mb-2" />
                <p className="text-slate-400 text-sm font-bold">All approved sessions are scheduled!</p>
              </div>
            )}
          </div>
        </div>

        {/* TIMETABLE GRID */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 relative scrollbar-thin scrollbar-thumb-slate-200">
             <table className="w-full border-collapse table-fixed min-w-[800px]">
               <thead>
                 <tr className="sticky top-0 z-20 bg-white">
                   <th className="w-20 p-4 border-b border-slate-100 bg-white"></th>
                   {rooms.map(room => (
                     <th key={room.id} className="p-4 border-b border-slate-100 border-l border-slate-50 bg-slate-50/50">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Room</p>
                        <h4 className="text-sm font-black text-slate-900 truncate">{room.name}</h4>
                        <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-bold mt-1">
                           <UsersIcon className="h-3 w-3" /> Cap: {room.capacity}
                        </div>
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {timeSlots.map(timeStr => (
                   <tr key={timeStr} className="group">
                     <td className="p-3 text-center border-b border-slate-50 align-top">
                        <span className="text-[11px] font-black text-slate-400 group-hover:text-blue-600 transition-colors">{timeStr}</span>
                     </td>
                     {rooms.map(room => {
                        // Find session in this room/time
                        const sessionInSlot = schedule.find(sch => {
                          const start = new Date(sch.start_time);
                          const end = new Date(sch.end_time);
                          const [sy, sm, sd] = conference.start_date.split('-').map(Number);
                          const slotDate = new Date(Date.UTC(sy, sm - 1, sd));
                          slotDate.setUTCDate(slotDate.getUTCDate() + selectedDay);
                          const [h, m] = timeStr.split(':').map(Number);
                          slotDate.setUTCHours(h, m, 0, 0);

                          const isStart = start.getTime() === slotDate.getTime();
                          const isOccupied = slotDate >= start && slotDate < end;
                          
                          return sch.room_id === room.id && isOccupied;
                        });

                        const isStart = sessionInSlot && (new Date(sessionInSlot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) === timeStr);

                        return (
                          <td 
                            key={`${room.id}-${timeStr}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(room, timeStr)}
                            className={`p-1 border-b border-slate-50 border-l border-slate-50 relative min-h-[80px] group/cell ${draggingSession ? 'hover:bg-blue-50/50 cursor-pointer active:bg-blue-100' : ''}`}
                          >
                            {sessionInSlot ? (
                              isStart ? (
                                <div className={`
                                  absolute inset-1 p-2 rounded-lg border-2 shadow-sm z-10 overflow-hidden
                                  ${STATUS_COLORS[sessionInSlot.status] || 'bg-white border-slate-200'}
                                `}>
                                  <div className="flex justify-between items-start gap-1">
                                     <p className="text-[9px] font-black uppercase truncate max-w-[80%]">{sessionInSlot.title}</p>
                                     {sessionInSlot.status === 'PENDING_CONFLICT' && <XCircleIcon className="h-3 w-3 text-rose-500 shrink-0" />}
                                     {sessionInSlot.status === 'SCHEDULED' && <CheckCircleIcon className="h-3 w-3 text-emerald-500 shrink-0" />}
                                  </div>
                                   <div className="flex gap-1 mt-2">
                                      {sessionInSlot.status !== 'SCHEDULED' ? (
                                        <button 
                                          onClick={() => confirmSession(sessionInSlot.session_id)}
                                          className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 shadow-sm transition-colors"
                                          title="Confirm Schedule / Mark as Scheduled"
                                        >
                                          <CheckCircleIcon className="h-3 w-3" />
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => updateSessionStatus(sessionInSlot.session_id, 'APPROVED')}
                                          className="bg-amber-500 text-white p-1 rounded hover:bg-amber-600 shadow-sm transition-colors"
                                          title="Un-confirm / Revert to Approved"
                                        >
                                          <XCircleIcon className="h-3 w-3" />
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => removeSession(sessionInSlot.session_id)}
                                        className="bg-slate-100 text-slate-400 p-1 rounded hover:bg-rose-50 hover:text-rose-600 shadow-sm transition-colors"
                                        title="Remove from slot"
                                      >
                                        <XMarkIcon className="h-3 w-3" />
                                      </button>
                                   </div>
                                </div>
                              ) : (
                                <div className="absolute inset-x-1 inset-y-0.5 bg-slate-50 border-x-2 border-slate-200 flex items-center justify-center">
                                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Occupied</span>
                                </div>
                              )
                            ) : (
                               <div className="h-full w-full opacity-0 group-hover/cell:opacity-100 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-blue-200 rounded-full"></div>
                               </div>
                            )}
                          </td>
                        );
                     })}
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* FOOTER: Legend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-8 items-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-full mb-2 lg:mb-0 lg:w-auto mr-4">Legend:</p>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300"></div>
            <span className="text-xs font-bold text-slate-600 uppercase">Pending Review</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-50 border border-rose-300"></div>
            <span className="text-xs font-bold text-slate-600 uppercase">Speaker Conflict</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-300"></div>
            <span className="text-xs font-bold text-slate-600 uppercase">Scheduled & Published</span>
         </div>
      </div>

      {/* SESSION INFO MODAL (Optional) */}
      {selectedSessionInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedSessionInfo(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedSessionInfo.title}</h3>
             <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-4">{selectedSessionInfo.track_name}</p>
             <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6 italic">"{selectedSessionInfo.description}"</p>
             <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speaker</p>
                   <p className="text-sm font-bold text-slate-900">{selectedSessionInfo.speakers?.[0]?.name || 'TBA'}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</p>
                   <p className="text-sm font-bold text-slate-900">{selectedSessionInfo.level}</p>
                </div>
             </div>
             <button 
               onClick={() => setSelectedSessionInfo(null)}
               className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all"
             >
               Close
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePlanner;

function XMarkIcon({className}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
