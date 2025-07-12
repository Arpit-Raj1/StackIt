import { NextRequest, NextResponse } from 'next/server';
import { questionQueries } from '@/lib/queries';

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
