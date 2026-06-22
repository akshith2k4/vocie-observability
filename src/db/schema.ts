import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey(),
  userName: varchar('username'),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  status: varchar('status'), // 'active', 'completed', 'errored'
  formId: varchar('form_id'),
});

export const turns = pgTable('turns', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id').references(() => sessions.id),
  
  // Text
  userTranscript: text('user_transcript'),
  llmRawContent: text('llm_raw_content'),
  llmToolCalls: jsonb('llm_tool_calls'),
  agentTranscript: text('agent_transcript'),
  
  // Audio URLs (S3 Keys)
  userAudioUrl: text('user_audio_url'),
  agentAudioUrl: text('agent_audio_url'),
  
  // Latencies (ms)
  latencyStt: integer('latency_stt'),
  latencyLlm: integer('latency_llm'),
  latencyTts: integer('latency_tts'),
  latencyTotal: integer('latency_total'),
  
  createdAt: timestamp('created_at').defaultNow(),
});
