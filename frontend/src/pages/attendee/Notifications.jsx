import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BellIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon
} from '../../components/Icons';

const NOTIF_ICONS = {
  info:    { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: BellIcon },
  warning: { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: ExclamationCircleIcon },
  success: { bg: 'bg-emerald-50',text: 'text-emerald-600', icon: CheckCircleIcon },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [notifRes, schedRes] = await Promise.all([
        axios.get('/api/notifications').catch(() => ({ data: [] })),
        axios.get('/api/attendee-portal/schedule').catch(() => ({ data: [] })),
      ]);

      setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);

      // Build session-start reminders from schedule
      const now = new Date();
      const upcoming = (Array.isArray(schedRes.data) ? schedRes.data : [])
        .filter(s => s.status === 'CONFIRMED' && s.start_time)
        .map(s => {
          const start = new Date(s.start_time);
          const minsUntil = Math.round((start - now) / 60000);
          let label = '';
          if (minsUntil < 0) label = 'Session has started';
          else if (minsUntil < 60) label = `Starts in ${minsUntil} min`;
          else if (minsUntil < 1440) label = `Starts in ${Math.round(minsUntil / 60)}h`;
          else label = start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
          return { id: `reminder-${s.session_id}`, title: s.title, label, minsUntil, room: s.room_name };
        })
        .sort((a, b) => a.minsUntil - b.minsUntil);

      setReminders(upcoming);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading notifications...</p>
    </div>
  );

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'reminders', label: 'Reminders', count: reminders.length },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">
          Event updates and session reminders
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
            {t.count > 0 && <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[9px]">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Session Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <ClockIcon className="h-10 w-10 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No upcoming sessions. Register for sessions to see reminders here.</p>
            </div>
          ) : reminders.map(r => (
            <div key={r.id} className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 ${r.minsUntil < 60 && r.minsUntil > 0 ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.minsUntil < 0 ? 'bg-emerald-100 text-emerald-600' : r.minsUntil < 60 ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                <ClockIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{r.title}</p>
                {r.room && <p className="text-xs text-slate-400 font-bold">{r.room}</p>}
              </div>
              <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase ${r.minsUntil < 0 ? 'bg-emerald-100 text-emerald-700' : r.minsUntil < 60 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {r.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* All Notifications Tab */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BellIcon className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold">All caught up! No new notifications.</p>
            </div>
          ) : (
            notifications.map(msg => {
              const type = msg.type || 'info';
              const style = NOTIF_ICONS[type] || NOTIF_ICONS.info;
              const Icon = style.icon;
              return (
                <div key={msg.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4 hover:border-blue-400 transition-all">
                  <div className={`w-10 h-10 ${style.bg} ${style.text} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold text-sm leading-relaxed">{msg.message}</p>
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                      <ClockIcon className="h-3 w-3" />
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="p-4 bg-slate-100 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        Notifications are cleared after 48 hours for your privacy.
      </div>
    </div>
  );
};

export default Notifications;
