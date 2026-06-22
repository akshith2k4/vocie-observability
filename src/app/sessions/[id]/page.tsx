'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Bot, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Volume2,
  FileCode,
  Gauge
} from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';

interface Turn {
  id: string;
  sessionId: string;
  userTranscript: string | null;
  llmRawContent: string | null;
  llmToolCalls: any;
  agentTranscript: string | null;
  userAudioUrl: string | null;
  agentAudioUrl: string | null;
  latencyStt: number | null;
  latencyLlm: number | null;
  latencyTts: number | null;
  latencyTotal: number | null;
  createdAt: string;
}

interface Session {
  id: string;
  userName: string | null;
  startedAt: string;
  endedAt: string | null;
  status: string;
  formId: string | null;
}

export default function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const [data, setData] = useState<{ session: Session; turns: Turn[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTurns, setExpandedTurns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) {
          throw new Error('Failed to load session details');
        }
        const json = await res.json();
        setData(json);
        
        // Expand LLM brain node for turns that have tool calls by default
        const initialExpanded: Record<string, boolean> = {};
        json.turns.forEach((turn: Turn) => {
          if (turn.llmToolCalls && (Array.isArray(turn.llmToolCalls) ? turn.llmToolCalls.length > 0 : Object.keys(turn.llmToolCalls).length > 0)) {
            initialExpanded[turn.id] = true;
          }
        });
        setExpandedTurns(initialExpanded);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const toggleLLMNode = (turnId: string) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [turnId]: !prev[turnId],
    }));
  };

  const getLatencyColor = (ms: number | null) => {
    if (ms === null || ms === undefined) return 'text-slate-500 bg-slate-900 border-slate-800';
    if (ms < 1000) return 'text-emerald-400 bg-emerald-500/10 border-emerald-550/20';
    if (ms < 2000) return 'text-amber-400 bg-amber-500/10 border-amber-550/20';
    return 'text-rose-450 bg-rose-500/10 border-rose-550/20';
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Activity className="w-3 animate-pulse" /> Active Session
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3" /> Completed
          </span>
        );
      case 'errored':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3" /> Errored
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <Cpu className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-450 text-sm">Retrieving session timeline and audio keys...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-8">
          <XCircle className="w-12 h-12 mx-auto text-rose-500" />
          <h2 className="text-xl font-bold">Failed to load Session</h2>
          <p className="text-slate-400 text-sm">{error || 'Session details not found.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-semibold text-white border border-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { session, turns } = data;

  // Calculate average latency for overview
  const validTurns = turns.filter(t => t.latencyTotal !== null);
  const avgLatency = validTurns.length > 0 
    ? Math.round(validTurns.reduce((acc, curr) => acc + (curr.latencyTotal || 0), 0) / validTurns.length)
    : 0;

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sessions
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Session ID: {session.id}
                </span>
                {getStatusBadge(session.status)}
              </div>
              <h1 className="text-2xl font-bold text-white mt-3">
                Voice Session Debugger
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-850">
              <div>
                <span className="block text-slate-500 font-medium">USERNAME</span>
                <span className="font-mono text-slate-205">{session.userName || 'Anonymous'}</span>
              </div>
              <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
              <div>
                <span className="block text-slate-500 font-medium">FORM TARGET</span>
                <span className="font-semibold text-indigo-305">{session.formId || 'N/A'}</span>
              </div>
              <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
              <div>
                <span className="block text-slate-500 font-medium">AVG LATENCY</span>
                <span className="font-semibold text-slate-205">{avgLatency ? `${avgLatency}ms` : '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline container */}
        {turns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-850 p-16 text-center text-slate-500">
            <Volume2 className="w-12 h-12 mx-auto text-slate-650 mb-3" />
            <p className="font-medium text-slate-400">No Conversation Turns Recorded</p>
            <p className="text-xs text-slate-500 mt-1">This session started, but no voice messages have been captured yet.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-4 md:ml-6 pl-6 md:pl-10 space-y-10 py-4">
            {turns.map((turn, index) => {
              const isLlmExpanded = expandedTurns[turn.id] || false;
              const hasToolCalls = turn.llmToolCalls && (
                Array.isArray(turn.llmToolCalls) 
                  ? turn.llmToolCalls.length > 0 
                  : Object.keys(turn.llmToolCalls).length > 0
              );

              return (
                <div key={turn.id} className="relative group">
                  
                  {/* Timeline bullet / node marker */}
                  <span className="absolute -left-[35px] md:-left-[51px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 border border-slate-800 ring-4 ring-[#0b0f19]">
                    <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                  </span>

                  <div className="space-y-4">
                    
                    {/* User Transcript Node */}
                    {turn.userTranscript && (
                      <div className="flex gap-4 items-start max-w-3xl">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20 shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 rounded-xl bg-slate-900/60 border border-slate-800 p-4 shadow-sm hover:border-slate-700 transition-colors">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">User Transcript</span>
                            <span className="text-[10px] text-slate-500">{new Date(turn.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                            "{turn.userTranscript}"
                          </p>
                          {turn.userAudioUrl && (
                            <div className="mt-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-1">
                                <Volume2 className="w-3 h-3 text-blue-400" /> User Audio
                              </span>
                              <AudioPlayer src={turn.userAudioUrl} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* LLM Brain (Middle) collapsible Node */}
                    <div className="flex gap-4 items-start max-w-3xl ml-4 md:ml-8">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 shrink-0 mt-1">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div className="flex-1 rounded-xl bg-slate-950/40 border border-slate-850 overflow-hidden shadow-sm hover:border-slate-800 transition-colors">
                        <button 
                          onClick={() => toggleLLMNode(turn.id)}
                          className="w-full flex items-center justify-between p-3 text-xs font-medium text-slate-400 hover:bg-slate-900/50 transition-colors text-left"
                        >
                          <span className="flex items-center gap-2">
                            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                            LLM Processing {hasToolCalls && <span className="px-1.5 py-0.2 text-[9px] bg-indigo-500/20 text-indigo-300 rounded font-semibold border border-indigo-500/30">Tool Triggered</span>}
                          </span>
                          <span className="flex items-center gap-2">
                            {turn.latencyLlm ? (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono border ${getLatencyColor(turn.latencyLlm)}`}>
                                LLM: {turn.latencyLlm}ms
                              </span>
                            ) : null}
                            {isLlmExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>

                        {isLlmExpanded && (
                          <div className="p-4 border-t border-slate-850 bg-slate-950/80 space-y-3.5 text-xs">
                            {turn.llmRawContent && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase">Raw LLM Response</span>
                                <p className="text-slate-300 bg-slate-900/50 p-2.5 rounded border border-slate-850 leading-relaxed font-mono whitespace-pre-wrap">
                                  {turn.llmRawContent}
                                </p>
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Tool Execution / JSON Payload</span>
                              {turn.llmToolCalls ? (
                                <pre className="bg-slate-900/90 text-slate-350 p-3 rounded border border-slate-800 font-mono overflow-x-auto text-[11px] leading-normal max-h-60">
                                  {JSON.stringify(turn.llmToolCalls, null, 2)}
                                </pre>
                              ) : (
                                <p className="text-slate-500 italic py-1">No tool calls dispatched.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Agent Transcript Node */}
                    {turn.agentTranscript && (
                      <div className="flex gap-4 items-start max-w-3xl">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20 shrink-0 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="flex-1 rounded-xl bg-slate-900/60 border border-slate-800 p-4 shadow-sm hover:border-slate-700 transition-colors">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Agent Response</span>
                            <span className="text-[10px] text-slate-500">{new Date(turn.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-emerald-50/90 text-sm leading-relaxed whitespace-pre-wrap">
                            "{turn.agentTranscript}"
                          </p>
                          {turn.agentAudioUrl && (
                            <div className="mt-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-1">
                                <Volume2 className="w-3 h-3 text-emerald-400" /> Synthesized Agent Audio
                              </span>
                              <AudioPlayer src={turn.agentAudioUrl} />
                            </div>
                          )}

                          {/* Latency Badges */}
                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-slate-500 uppercase mr-1">
                              <Gauge className="w-3 h-3" /> Latencies:
                            </span>
                            {turn.latencyStt !== null && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${getLatencyColor(turn.latencyStt)}`}>
                                STT: {turn.latencyStt}ms
                              </span>
                            )}
                            {turn.latencyLlm !== null && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${getLatencyColor(turn.latencyLlm)}`}>
                                LLM: {turn.latencyLlm}ms
                              </span>
                            )}
                            {turn.latencyTts !== null && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${getLatencyColor(turn.latencyTts)}`}>
                                TTS: {turn.latencyTts}ms
                              </span>
                            )}
                            {turn.latencyTotal !== null && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getLatencyColor(turn.latencyTotal)}`}>
                                Total: {turn.latencyTotal}ms
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
