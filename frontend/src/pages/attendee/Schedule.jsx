import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDuration } from '../../utils/formatters';
import { 
  CalendarIcon, 
  ClockIcon,
  HomeModernIcon as MapPin,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '../../components/Icons';

// ─── iCal Export Utility ──────────────────────────────────────────────────────
const toICalDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, '').replace('.000', '');
};

const exportToICal = (schedule) => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DevConf Session Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  schedule.forEach((item) => {
    if (!item.start_time) return;
    lines.push(
      'BEGIN:VEVENT',
      `UID:session-${item.session_id}@devconf.app`,
      `SUMMARY:${item.title || 'Session'}`,
      `DESCRIPTION:${(item.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${item.room_name || 'TBA'}`,
      `DTSTART:${toICalDate(item.start_time)}`,
      `DTEND:${toICalDate(item.end_time || item.start_time)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'devconf-schedule.ics';
  a.click();
  URL.revokeObjectURL(url);
};

const exportToGCalLink = (item) => {
  const fmt = (iso) => new Date(iso).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: item.title || 'Conference Session',
    details: item.description || '',
    location: item.room_name || 'TBA',
    dates: `${fmt(item.start_time)}/${fmt(item.end_time || item.start_time)}`,
  });
  window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank');
};

// ─── Schedule Card ─────────────────────────────────────────────────────────────
const ScheduleCard = ({ item, onLeave }) => {
  const [showExport, setShowExport] = useState(false);

  const formatTime = (iso) => {
    if (!iso) return 'TBA';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all group">
      <div className="p-5 flex flex-col md:flex-row md:items-center gap-5">
        {/* Time Block */}
        <div className="w-28 shrink-0 text-center md:text-left">
          <div className="text-blue-600 font-black text-xl">{formatTime(item.start_time)}</div>
          <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">{formatDate(item.start_time)}</div>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          {item.status === 'CONFIRMED' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase">
              <CheckCircleIcon className="h-3 w-3" /> Confirmed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase">
              <ClockIcon className="h-3 w-3" /> Waitlisted
            </span>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">{item.title}</h3>
          <div className="flex flex-wrap gap-x-4 mt-1.5">
            {item.room_name && (
              <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                <MapPin className="h-3 w-3" /> {item.room_name}
              </span>
            )}
            {item.venue_name && (
              <span className="text-slate-400 text-xs font-bold">{item.venue_name}</span>
            )}
            <span className="text-slate-400 text-xs font-bold whitespace-nowrap">
              ({formatDuration(item.duration)})
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 relative">
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-xs font-black uppercase transition-all border border-slate-100"
            >
              Export
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1 z-10">
                <button
                  onClick={() => { exportToGCalLink(item); setShowExport(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  📅 Google Calendar
                </button>
                <button
                  onClick={() => { exportToICal([item]); setShowExport(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  📁 iCal / Apple Cal
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => onLeave(item.session_id)}
            className="px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-black uppercase transition-all opacity-0 group-hover:opacity-100"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Schedule Page ────────────────────────────────────────────────────────
const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSchedule(); }, []);

  const fetchSchedule = async () => {
    try {
      const res = await axios.get('/api/attendee-portal/schedule');
      setSchedule(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching schedule', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to leave this session?')) return;
    try {
      await axios.delete('/api/attendee-portal/register', { data: { session_id: sessionId } });
      fetchSchedule();
    } catch (err) { console.error('Error leaving session', err); }
  };

  const confirmed = schedule.filter(s => s.status === 'CONFIRMED').sort((a,b) => new Date(a.start_time) - new Date(b.start_time));
  const waitlisted = schedule.filter(s => s.status === 'WAITLISTED');

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading schedule...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Schedule</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">Your personal conference journey</p>
        </div>
        {schedule.length > 0 && (
          <button
            onClick={() => exportToICal(confirmed)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all"
          >
            Export All (.ics)
          </button>
        )}
      </header>

      {schedule.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <CalendarIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold max-w-xs mx-auto mb-6">Your schedule is empty. Start registering for sessions!</p>
          <a href="/attendee" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all">
            Browse Sessions
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Confirmed Sessions */}
          {confirmed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                Confirmed ({confirmed.length})
              </h2>
              {confirmed.map(item => (
                <ScheduleCard key={item.id} item={item} onLeave={handleLeaveSession} />
              ))}
            </section>
          )}

          {/* Waitlisted */}
          {waitlisted.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <ExclamationCircleIcon className="h-4 w-4" />
                Waitlisted ({waitlisted.length})
              </h2>
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold mb-2">
                You'll be automatically confirmed if a spot opens up before the session starts.
              </div>
              {waitlisted.map(item => (
                <ScheduleCard key={item.id} item={item} onLeave={handleLeaveSession} />
              ))}
            </section>
          )}
        </div>
      )}

      {/* Tips Banner */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">💡</div>
        <p className="text-blue-800 text-xs font-bold leading-relaxed">
          Export individual sessions to your calendar via the <strong>Export</strong> button. Use <strong>Export All</strong> to download your entire schedule as an .ics file compatible with Google Calendar, Apple Calendar, and Outlook.
        </p>
      </div>
    </div>
  );
};

export default Schedule;
