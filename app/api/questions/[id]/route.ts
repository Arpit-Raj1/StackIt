import { NextRequest, NextResponse } from 'next/server';
import { questionQueries } from '@/lib/queries';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		console.log('Fetching question with id:', id);

		// Validate ID format (UUID)
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(id)) {
			return NextResponse.json({ error: 'Invalid question ID format' }, { status: 400 });
		}

		const question = await questionQueries.getQuestionById(id);
		console.log('Question found:', question ? 'Yes' : 'No');

		if (!question) {
			return NextResponse.json({ error: 'Question not found' }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			question,
		});
	} catch (error) {
		console.error('Error fetching question:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
