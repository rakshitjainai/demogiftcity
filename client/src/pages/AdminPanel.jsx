import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, ShieldAlert, BookOpen, HelpCircle, TrendingUp, Search, 
  RefreshCw, Eye, UserCheck, LayoutDashboard, Briefcase, Activity, 
  Clock, BarChart2, PieChart, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserDetailsModal from '../components/UserDetailsModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminPanel() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [planDistribution, setPlanDistribution] = useState({});
  const [topChapters, setTopChapters] = useState([]);
  const [topQuizzes, setTopQuizzes] = useState([]);
  const [recentActivityFeed, setRecentActivityFeed] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dateRange, setDateRange] = useState('all');

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/users`, { headers })
      ]);

      if (statsRes.ok && usersRes.ok) {
        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        setStats(statsData.stats);
        setGrowth(statsData.growth || []);
        setPlanDistribution(statsData.planDistribution || {});
        setTopChapters(statsData.topChapters || []);
        setTopQuizzes(statsData.topQuizzes || []);
        setRecentActivityFeed(statsData.recentActivityFeed || []);
        setUsers(usersData.users || []);
      } else {
        setError('Failed to fetch administrative data. Ensure you have admin credentials.');
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError('Backend connection error while loading admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleToggleMembership = async (userId, status, plan) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/toggle-membership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, status, plan })
      });

      if (response.ok) {
        await fetchAdminData();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, membershipStatus: status, subscriptionPlan: plan } : null);
        }
      }
    } catch (err) {
      console.error('Toggle membership error:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') return matchesSearch && u.membershipStatus === 'active';
    if (filterStatus === 'free') return matchesSearch && u.membershipStatus !== 'active';
    return matchesSearch;
  });

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'recently';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 card-shadow space-y-6 text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Loading RegMate Admin Dashboard...</h3>
            <p className="text-xs text-slate-500">Fetching real-time metrics and database records.</p>
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-slate-100 rounded-md w-3/4 mx-auto" />
            <div className="h-4 bg-slate-100 rounded-md w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 sm:p-6 flex-shrink-0 flex flex-col justify-between card-shadow">
        <div className="space-y-6">
          
          {/* Admin Header */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold shadow-sm">
              RM
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">RegMate Admin</h2>
              <span className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live MongoDB
              </span>
            </div>
          </div>

          {/* Navigation Menu (Scrollable horizontally on mobile, stacked on desktop) */}
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-1.5 lg:gap-0 lg:space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'users', label: 'Users Directory', icon: Users, badge: users.length },
              { id: 'knowledge', label: 'Knowledge Hub', icon: BookOpen },
              { id: 'membership', label: 'Membership Tiers', icon: Crown },
              { id: 'jobs', label: 'Jobs Activity', icon: Briefcase },
              { id: 'search', label: 'Search & Insights', icon: Search }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`whitespace-nowrap flex-shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ml-2 ${
                      isActive ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-200 px-2 space-y-2">
          <button
            onClick={fetchAdminData}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Sync MongoDB Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                System Administration
              </span>
              <span className="text-xs text-slate-500 font-mono">Real-time Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Platform Overview & KPI Analytics'}
              {activeTab === 'users' && 'Registered Users Management'}
              {activeTab === 'knowledge' && 'Knowledge Hub & Reading Metrics'}
              {activeTab === 'membership' && 'Membership & Subscription Analytics'}
              {activeTab === 'jobs' && 'Job Product & Activity Metrics'}
              {activeTab === 'search' && 'Search & Content Performance Insights'}
            </h1>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Range Selector */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs card-shadow">
              {['all', '30d', '7d'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded-lg font-semibold uppercase text-[10px] transition-all cursor-pointer ${
                    dateRange === range ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={fetchAdminData}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center space-x-2 border border-slate-200 cursor-pointer min-h-[38px] card-shadow"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchAdminData} className="underline text-rose-700 hover:text-rose-900 cursor-pointer font-bold">
              Retry Connection
            </button>
          </div>
        )}

        {/* 1. TOP KPI CARDS GRID */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</p>
              <span className="text-[10px] text-slate-500 block">Registered MongoDB accounts</span>
            </div>

            <div className="bg-gradient-to-br from-amber-50/50 to-white p-4 sm:p-5 rounded-2xl border border-amber-200 card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Active Members</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-extrabold text-amber-900">{stats.activeMembers}</p>
                <span className="text-xs font-bold text-amber-700">({stats.conversionRate}%)</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Full membership access</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/50 to-white p-4 sm:p-5 rounded-2xl border border-emerald-200 card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">New This Month</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-900">{stats.newUsersThisMonth}</p>
              <span className="text-[10px] text-slate-500 block">Registrations in current month</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quiz Attempts</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-teal-800">{stats.totalQuizAnswers}</p>
              <span className="text-[10px] text-slate-500 block">Tracked question responses</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chapters Read</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-purple-900">{stats.totalReadingAccess}</p>
              <span className="text-[10px] text-slate-500 block">Reading views logged</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Attempts</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-indigo-900">{stats.totalExamAttempts}</p>
              <span className="text-[10px] text-slate-500 block">ExamReady mock tests</span>
            </div>

          </div>
        )}

        {/* TAB 1: MAIN DASHBOARD OVERVIEW */}
        {(activeTab === 'dashboard' || activeTab === 'knowledge') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* User Growth Line/Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-emerald-700" />
                  <span>User Registrations & Growth Trends</span>
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">Monthly breakdown</span>
              </div>

              <div className="h-56 flex items-end justify-between space-x-3 pt-8 pb-2 px-4 bg-slate-50 rounded-2xl border border-slate-200">
                {growth.length > 0 ? (
                  growth.map((g, idx) => {
                    const maxCount = Math.max(...growth.map(item => item.count), 1);
                    const heightPct = Math.max((g.count / maxCount) * 100, 15);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center space-y-2 group">
                        <span className="text-[10px] font-bold text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity">
                          {g.count} users
                        </span>
                        <div
                          className="w-full bg-emerald-600 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-500"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[10px] text-slate-600 font-medium truncate w-full text-center">
                          {g.month}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">No registration trends recorded yet</p>
                    <p className="text-[11px]">User growth metrics will plot dynamically as users sign up.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Distribution Donut */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 card-shadow flex flex-col justify-between space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-amber-600" />
                <span>Membership Distribution</span>
              </h3>

              {stats && (
                <div className="space-y-5">
                  <div className="flex items-center justify-center relative py-4">
                    <div className="w-36 h-36 rounded-full border-8 border-amber-400 border-t-slate-200 flex flex-col items-center justify-center bg-amber-50/30">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {stats.conversionRate}%
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Conversion</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-amber-950 font-semibold">Active Premium Members</span>
                      </div>
                      <span className="font-mono text-amber-900 font-bold">{stats.activeMembers}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        <span className="text-slate-700 font-semibold">Free Tier Users</span>
                      </div>
                      <span className="font-mono text-slate-900 font-bold">{stats.nonMembers}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* KNOWLEDGE & RECENT ACTIVITY GRID */}
        {(activeTab === 'dashboard' || activeTab === 'knowledge') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Learning Topics & Quiz Performance */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 card-shadow space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Knowledge Hub Popular Topics</span>
              </h3>

              <div className="space-y-3">
                {topChapters.length > 0 ? (
                  topChapters.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-medium text-slate-800">Chapter {item.chapter}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-mono font-bold">
                        {item.count} reads
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
                    No reading history recorded yet in MongoDB.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Real Activity Feed */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 card-shadow space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Recent Platform Activity Feed</span>
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {recentActivityFeed.length > 0 ? (
                  recentActivityFeed.map((act, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        act.type === 'signup' ? 'bg-teal-600' :
                        act.type === 'membership' ? 'bg-amber-500' : 'bg-emerald-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-slate-800">
                          <strong className="text-slate-900 font-bold">{act.userName}</strong> {act.text}
                        </p>
                        <span className="text-[10px] text-slate-500">{formatTimeAgo(act.timestamp)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
                    No platform activity logged yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 2. RECENT USERS DIRECTORY TABLE */}
        {(activeTab === 'dashboard' || activeTab === 'users') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 card-shadow">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  <span>Registered User Directory ({filteredUsers.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real MongoDB user records. View phone numbers, quiz usage, and toggle active membership privileges.
                </p>
              </div>

              {/* Controls Bar */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, phone..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-600"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Members Only</option>
                  <option value="free">Free Non-Members</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Membership Status</th>
                    <th className="p-4">Quiz Answers</th>
                    <th className="p-4">Chapters Read</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isMem = u.membershipStatus === 'active';
                      return (
                        <tr key={u.id} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                                <div className="text-[11px] text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-slate-700">
                            {u.phone || <span className="text-slate-400 italic">N/A</span>}
                          </td>

                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              u.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {u.role || 'member'}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              isMem
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {isMem ? <Crown className="w-3 h-3 text-amber-600" /> : <ShieldAlert className="w-3 h-3 text-slate-400" />}
                              <span>{isMem ? 'Active Member' : 'Free Tier'}</span>
                            </span>
                          </td>

                          <td className="p-4 font-mono font-bold text-teal-700">
                            {u.quizQuestionsAnswered || 0}
                          </td>

                          <td className="p-4 font-mono font-bold text-purple-700">
                            {u.chaptersReadCount || 0}
                          </td>

                          <td className="p-4 text-slate-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs"
                                title="View Full Profile"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                <span>View</span>
                              </button>
                              
                              <button
                                onClick={() => handleToggleMembership(u.id, isMem ? 'free' : 'active', isMem ? 'Free Tier' : 'Premium Member')}
                                className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                                  isMem 
                                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300' 
                                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                }`}
                              >
                                {isMem ? 'Revoke' : 'Make Member'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                        No registered users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleMembership={handleToggleMembership}
        />
      )}
    </div>
  );
}
