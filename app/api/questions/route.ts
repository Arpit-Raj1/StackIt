import { NextRequest, NextResponse } from 'next/server';
import { questionQueries } from '@/lib/queries';

// GET method to fetch questions
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const sortBy = searchParams.get('sortBy') || 'created_at';

		const questions = await questionQueries.getQuestions(page, limit, sortBy);

		return NextResponse.json({
			success: true,
			questions,
			page,
			limit,
		});
	} catch (error) {
		console.error('Error fetching questions:', error);
		return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		console.log(body);

		const { title, content, tags, authorId } = body;

		// Validate required fields
		if (!title || !content || !authorId) {
			return NextResponse.json({ error: 'Title, content, and authorId are required' }, { status: 400 });
		}

		// Create the question in the database
		const question = await questionQueries.createQuestion(title, content, authorId, tags || []);

		return NextResponse.json(
			{
				success: true,
				question: {
					id: question.id,
					title: question.title,
					content: question.content,
					created_at: question.created_at,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating question:', error);
		return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
	}
}
