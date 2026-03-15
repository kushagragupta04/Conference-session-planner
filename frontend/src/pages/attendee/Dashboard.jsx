import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarIcon,
  Squares2X2Icon,
  BellIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
  UserCircleIcon
} from '../../components/Icons';

const StatCard = ({ icon: Icon, label, value, color, href }) => (
  <Link to={href} className={`group bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5 hover:border-${color}-400 hover:shadow-md transition-all`}>
    <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-${color}-600 group-hover:text-white transition-all`}>
      <Icon className="h-7 w-7" />
    </div>
    <div>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-sm font-bold text-slate-500 mt-0.5">{label}</p>
    </div>
  </Link>
);

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ confirmed: 0, waitlisted: 0, bookmarks: 0, available: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [scheduleRes, bookmarksRes, sessionsRes, notifsRes, recsRes] = await Promise.all([
          axios.get('/api/attendee-portal/schedule').catch(() => ({ data: [] })),
          axios.get('/api/attendee-portal/bookmarks').catch(() => ({ data: [] })),
          axios.get('/api/attendee-portal/sessions').catch(() => ({ data: [] })),
          axios.get('/api/notifications').catch(() => ({ data: [] })),
          axios.get('/api/attendee-portal/recommendations').catch(() => ({ data: [] })),
        ]);

        const schedule = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
        const bookmarks = Array.isArray(bookmarksRes.data) ? bookmarksRes.data : [];
        const sessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
        const notifs = Array.isArray(notifsRes.data) ? notifsRes.data : [];
        const recs = Array.isArray(recsRes.data) ? recsRes.data : [];

        setStats({
          confirmed: schedule.filter(s => s.status === 'CONFIRMED').length,
          waitlisted: schedule.filter(s => s.status === 'WAITLISTED').length,
          bookmarks: bookmarks.length,
          available: sessions.length,
        });

        const now = new Date();
        const upcomingItems = schedule
          .filter(s => s.status === 'CONFIRMED' && s.start_time && new Date(s.start_time) > now)
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          .slice(0, 3);
        setUpcoming(upcomingItems);
        setNotifications(notifs.slice(0, 3));
        setRecommended(recs.slice(0, 3));
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatTime = (iso) => {
    if (!iso) return 'TBA';
    const d = new Date(iso);
    return d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntil = (iso) => {
    if (!iso) return '';
    const diff = new Date(iso) - new Date();
    if (diff < 0) return 'Started';
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `In ${mins}m`;
    if (mins < 1440) return `In ${Math.round(mins / 60)}h`;
    return `In ${Math.round(mins / 1440)}d`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-1">Good{new Date().getHours() < 12 ? ' morning' : new Date().getHours() < 18 ? ' afternoon' : ' evening'}</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name || 'Attendee'} 👋</h1>
          <p className="text-slate-500 font-medium mt-1">Here's your DevOps Conference overview</p>
        </div>
        <Link
          to="/attendee/schedule"
          className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-lg"
        >
          <CalendarIcon className="h-4 w-4" />
          My Schedule
        </Link>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircleIcon} label="Confirmed Sessions" value={stats.confirmed} color="emerald" href="/attendee/schedule" />
        <StatCard icon={ClockIcon} label="Waitlisted" value={stats.waitlisted} color="amber" href="/attendee/schedule" />
        <StatCard icon={BookmarkIcon} label="Saved Sessions" value={stats.bookmarks} color="blue" href="/attendee/saved" />
        <StatCard icon={Squares2X2Icon} label="Sessions Available" value={stats.available} color="violet" href="/attendee" />
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Sessions (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Upcoming Sessions</h2>
            <Link to="/attendee/schedule" className="text-xs font-black text-blue-600 uppercase tracking-wider hover:underline flex items-center gap-1">
              View All <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
              <CalendarIcon className="h-10 w-10 text-slate-100 mx-auto mb-3" />
              <p className="text-slate-400 font-bold text-sm mb-4">No upcoming sessions registered yet.</p>
              <Link
                to="/attendee"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase"
              >
                Discover Sessions
              </Link>
            </div>
          ) : upcoming.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-5 hover:border-blue-400 transition-all group">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shrink-0">
                <span className="text-[10px] font-black uppercase">{getTimeUntil(item.start_time)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{item.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" />{formatTime(item.start_time)}</span>
                  {item.room_name && <span>· {item.room_name}</span>}
                </div>
              </div>
              <span className="shrink-0 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                Confirmed
              </span>
            </div>
          ))}
        </div>

        {/* Right column: Notifications + Recommendations */}
        <div className="space-y-6">

          {/* Latest Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-slate-900">Notifications</h2>
              <Link to="/attendee/notifications" className="text-xs font-black text-blue-600 uppercase hover:underline">
                All
              </Link>
            </div>
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <BellIcon className="h-8 w-8 text-slate-100 mx-auto mb-2" />
                <p className="text-slate-400 font-bold text-xs">No new notifications</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} className="bg-white rounded-xl border border-slate-100 p-4 mb-2">
                <p className="text-slate-800 font-bold text-sm line-clamp-2">{n.message}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Browse All Sessions', href: '/attendee', icon: Squares2X2Icon, color: 'text-blue-600' },
                { label: 'View Speaker Directory', href: '/attendee/speakers', icon: UserCircleIcon, color: 'text-violet-600' },
                { label: 'My Ratings & Feedback', href: '/attendee/ratings', icon: ChartBarIcon, color: 'text-amber-600' },
                { label: 'Session Materials', href: '/attendee/resources', icon: BookmarkIcon, color: 'text-emerald-600' },
              ].map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group"
                >
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                  <span className="flex-1 text-sm font-bold text-slate-700 group-hover:text-slate-900">{link.label}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Recommended for You</h2>
            <Link to="/attendee/recommendations" className="text-xs font-black text-blue-600 uppercase tracking-wider hover:underline flex items-center gap-1">
              See All <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.map(session => (
              <div key={session.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded uppercase tracking-widest">
                  {session.track_name || 'General'}
                </span>
                <h3 className="font-bold text-slate-900 mt-3 leading-snug line-clamp-2">{session.title}</h3>
                <p className="text-slate-500 text-xs font-medium mt-2 line-clamp-2">{session.description}</p>
                <Link
                  to="/attendee"
                  className="inline-flex items-center gap-1 text-blue-600 font-black text-xs uppercase mt-4 hover:underline"
                >
                  Register <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AttendeeDashboard;
