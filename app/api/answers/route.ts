import { answerQueries } from '@/lib/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content, questionId, authorId } = await req.json();
    if (!content || !questionId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const answer = await answerQueries.createAnswer(content, questionId, authorId);
    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 