import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, turns } from '@/db/schema';
import { desc, sql, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await db
      .select({
        id: sessions.id,
        userName: sessions.userName,
        startedAt: sessions.startedAt,
        endedAt: sessions.endedAt,
        status: sessions.status,
        formId: sessions.formId,
        turnsCount: sql<number>`cast(count(${turns.id}) as integer)`,
      })
      .from(sessions)
      .leftJoin(turns, eq(sessions.id, turns.sessionId))
      .groupBy(sessions.id)
      .orderBy(desc(sessions.startedAt))
      .limit(50);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
