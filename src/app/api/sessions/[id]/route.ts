import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, turns } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getPresignedUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // 1. Fetch the specific session
    const sessionRows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (sessionRows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionRows[0];

    // 2. Fetch all turns for this session, ordered by createdAt ASC
    const turnsRows = await db
      .select()
      .from(turns)
      .where(eq(turns.sessionId, sessionId))
      .orderBy(asc(turns.createdAt));

    // 3. Resolve S3 audio keys to presigned URLs
    const resolvedTurns = await Promise.all(
      turnsRows.map(async (turn) => {
        const userAudioUrl = turn.userAudioUrl
          ? await getPresignedUrl(turn.userAudioUrl).catch((err) => {
              console.error(`Error resolving userAudioUrl for turn ${turn.id}:`, err);
              return '';
            })
          : null;

        const agentAudioUrl = turn.agentAudioUrl
          ? await getPresignedUrl(turn.agentAudioUrl).catch((err) => {
              console.error(`Error resolving agentAudioUrl for turn ${turn.id}:`, err);
              return '';
            })
          : null;

        return {
          ...turn,
          userAudioUrl,
          agentAudioUrl,
        };
      })
    );

    return NextResponse.json({
      session,
      turns: resolvedTurns,
    });
  } catch (error: any) {
    console.error('Error fetching session details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session detail' },
      { status: 500 }
    );
  }
}
