'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Clock,
  MessageSquare,
  Search,
  RefreshCw,
  Layers,
  ChevronRight
} from 'lucide-react';

interface Session {
  id: string;
  userName: string | null;
  startedAt: string;
  endedAt: string | null;
  status: 'active' | 'completed' | 'errored' | string;
  formId: string | null;
  turnsCount: number;
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }
      const data = await response.json();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
            <Activity className="w-3 animate-pulse" /> Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3" /> Completed
          </span>
        );
      case 'errored':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-300">
            <XCircle className="w-3" /> Errored
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDuration = (started: string, ended: string | null) => {
    if (!ended) return 'Ongoing';
    const durationMs = new Date(ended).getTime() - new Date(started).getTime();
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch =
      session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.formId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      session.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.status?.toLowerCase() === 'active').length;
  const erroredSessions = sessions.filter(s => s.status?.toLowerCase() === 'errored').length;
  const totalTurns = sessions.reduce((acc, curr) => acc + (curr.turnsCount || 0), 0);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-300 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Krish Observability
            </h1>
            <p className="mt-2 text-slate-600 text-sm md:text-base">
              Real-time telemetry, conversation flows, and latencies for AI voice sessions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-300 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Total Sessions</span>
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 border border-indigo-200">
                <PlayCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">{totalSessions}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Active Sessions</span>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 border border-blue-200">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">{activeSessions}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Errors</span>
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600 border border-rose-200">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">{erroredSessions}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Total Turns</span>
              <div className="p-2 bg-violet-100 rounded-lg text-violet-600 border border-violet-200">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">{totalTurns}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by session, user, or form ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'active', 'completed', 'errored'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all whitespace-nowrap ${statusFilter === status
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
            <p className="font-semibold">Error Loading Sessions</p>
            <p className="mt-1 text-sm opacity-80">{error}</p>
            <button
              onClick={fetchSessions}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 border border-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-600 text-sm">Loading observability data...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <Layers className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="font-medium text-slate-600">No Sessions Found</p>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              There are no voice agent sessions matching your filters or written in the database.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Session ID</th>
                    <th scope="col" className="px-6 py-4">Username</th>
                    <th scope="col" className="px-6 py-4">Started At</th>
                    <th scope="col" className="px-6 py-4">Duration</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Form ID</th>
                    <th scope="col" className="px-6 py-4 text-right">Turns</th>
                    <th scope="col" className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="group cursor-pointer hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 max-w-[200px] truncate">
                        <Link href={`/sessions/${session.id}`} className="block focus:outline-none">
                          <span className="font-mono text-xs text-indigo-600 group-hover:underline">
                            {session.id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        <Link href={`/sessions/${session.id}`} className="block">
                          {session.userName || '—'}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/sessions/${session.id}`} className="block">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateTime(session.startedAt)}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <Link href={`/sessions/${session.id}`} className="block">
                          {getDuration(session.startedAt, session.endedAt)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/sessions/${session.id}`} className="block">
                          {getStatusBadge(session.status)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/sessions/${session.id}`} className="block">
                          {session.formId ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                              {session.formId}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">
                        <Link href={`/sessions/${session.id}`} className="block">
                          {session.turnsCount}
                        </Link>
                      </td>
                      <td className="pr-4 text-right text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Link href={`/sessions/${session.id}`} className="block">
                          <ChevronRight className="w-5 h-5 ml-auto" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}