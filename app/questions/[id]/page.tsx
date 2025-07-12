'use client';

import type React from 'react';
import { useParams } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageCircle, Share, Check, ArrowLeft } from 'lucide-react';
import { RichTextEditor } from '@/components/rich-text-editor';
import Link from 'next/link';

interface Answer {
	id: string;
	content: string;
	author_username: string;
	author_avatar: string;
	author_reputation: number;
	votes: number;
	is_accepted: boolean;
	created_at: string;
}

interface Question {
	id: string;
	title: string;
	content: string;
	tags: string[];
	author_username: string;
	author_avatar: string;
	author_reputation: number;
	votes: number;
	views: number;
	created_at: string;
	answers?: Answer[];
}

export default function QuestionDetailPage() {
	const params = useParams();
	const id = params.id as string;
	const { data: session, status } = useSession();

	// Helper function to format dates
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			const now = new Date();
			const diffMs = now.getTime() - date.getTime();
			const diffMinutes = Math.floor(diffMs / (1000 * 60));
			const diffHours = Math.floor(diffMinutes / 60);
			const diffDays = Math.floor(diffHours / 24);

			if (diffMinutes < 1) return 'just now';
			if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
			if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
			if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

			return date.toLocaleDateString();
		} catch {
			return dateString; // Fallback to original string if parsing fails
		}
	};

	const [question, setQuestion] = useState<Question | null>(null);
	const [answers, setAnswers] = useState<Answer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		const fetchQuestion = async () => {
			try {
				const res = await fetch(`/api/questions/${id}`);

				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}

				const data = await res.json();
				console.log('API Response:', data);

				if (data.success && data.question) {
					setQuestion(data.question);
					setAnswers(data.question.answers || []);
				} else {
					throw new Error('Invalid response format');
				}
			} catch (err) {
				console.error('Failed to fetch question:', err);
				setError(err instanceof Error ? err.message : 'Failed to fetch question');
			} finally {
				setLoading(false);
			}
		};

		fetchQuestion();
	}, [id]);

	const [newAnswer, setNewAnswer] = useState('');
	const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
	const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

	const handleVote = (type: 'up' | 'down') => {
		if (status !== 'authenticated') {
			alert('You must be logged in to vote.');
			return;
		}
		setUserVote(userVote === type ? null : type);
		// TODO: Implement actual voting API call here
	};

	const handleAnswerSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newAnswer.trim() || !question) return;

		if (status !== 'authenticated' || !session?.user?.email) {
			alert('You must be logged in to post an answer.');
			return;
		}

		setIsSubmittingAnswer(true);

		try {
			const res = await fetch('/api/answers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: newAnswer,
					questionId: question.id,
					authorId: session.user.email,
				}),
			});

			if (!res.ok) throw new Error('Failed to post answer');

			const data = await res.json();

			// Create the new answer with proper interface structure
			const newAnswerObj: Answer = {
				id: data.answer.id,
				content: data.answer.content,
				author_username: session.user.name || session.user.email || 'You',
				author_avatar: session.user.image || '/placeholder.svg?height=32&width=32',
				author_reputation: 0,
				votes: 0,
				is_accepted: false,
				created_at: data.answer.created_at || new Date().toISOString(),
			};

			setAnswers([...answers, newAnswerObj]);
			setNewAnswer('');
		} catch (error) {
			console.error('Error submitting answer:', error);
			alert('Failed to post answer. Please try again.');
		} finally {
			setIsSubmittingAnswer(false);
		}
	};

	const handleAcceptAnswer = (answerId: string) => {
		if (status !== 'authenticated') {
			alert('You must be logged in to accept answers.');
			return;
		}

		// Check if the current user is the question author
		if (session?.user?.email !== question?.author_username) {
			alert('Only the question author can accept answers.');
			return;
		}

		setAnswers(
			answers.map((answer) => ({
				...answer,
				is_accepted: answer.id === answerId ? !answer.is_accepted : false,
			}))
		);
		// TODO: Implement actual accept answer API call here
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
					<ArrowLeft className="w-4 h-4" />
					Back to Questions
				</Link>
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p className="text-gray-500">Loading question...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
					<ArrowLeft className="w-4 h-4" />
					Back to Questions
				</Link>
				<div className="text-center py-12">
					<div className="bg-red-50 border border-red-200 rounded-lg p-6">
						<p className="text-red-800 font-medium mb-2">Error loading question</p>
						<p className="text-red-600 text-sm mb-4">{error}</p>
						<Button onClick={() => window.location.reload()} variant="outline" className="mr-2">
							Try Again
						</Button>
						<Link href="/" className="text-blue-500 hover:underline">
							Back to Questions
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!question) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
					<ArrowLeft className="w-4 h-4" />
					Back to Questions
				</Link>
				<div className="text-center py-12">
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
						<p className="text-gray-800 font-medium mb-2">Question not found</p>
						<p className="text-gray-600 text-sm mb-4">
							The question you're looking for doesn't exist or has been removed.
						</p>
						<Link href="/" className="text-blue-500 hover:underline">
							Back to Questions
						</Link>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
				<ArrowLeft className="w-4 h-4" />
				Back to Questions
			</Link>

			{/* Question */}
			<Card className="mb-8">
				<CardHeader>
					<div className="flex items-start gap-4">
						<div className="flex flex-col items-center gap-2">
							<Button
								variant={userVote === 'up' ? 'default' : 'outline'}
								size="sm"
								onClick={() => handleVote('up')}
							>
								<ThumbsUp className="w-4 h-4" />
							</Button>
							<span className="font-semibold text-lg">{question.votes}</span>
							<Button
								variant={userVote === 'down' ? 'default' : 'outline'}
								size="sm"
								onClick={() => handleVote('down')}
							>
								<ThumbsDown className="w-4 h-4" />
							</Button>
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold mb-4">{question.title}</h1>
							<div className="prose max-w-none mb-4">
								<div
									dangerouslySetInnerHTML={{
										__html: question.content
											? question.content.replace(/\n/g, '<br>')
											: 'No content available',
									}}
								/>
							</div>
							{question.tags && question.tags.length > 0 && (
								<div className="flex flex-wrap gap-2 mb-4">
									{question.tags.map((tag: string) => (
										<Badge key={tag} variant="secondary">
											{tag}
										</Badge>
									))}
								</div>
							)}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<Button variant="ghost" size="sm">
										<Share className="w-4 h-4 mr-1" />
										Share
									</Button>
									<span className="text-sm text-gray-500">
										{question.views || 0} view{(question.views || 0) !== 1 ? 's' : ''}
									</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-500">
									<Avatar className="w-6 h-6">
										<AvatarImage src={question.author_avatar || '/placeholder.svg'} />
										<AvatarFallback>
											{(question.author_username || 'U').charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span>{question.author_username || 'Unknown User'}</span>
									<span>•</span>
									<span>{formatDate(question.created_at)}</span>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Answers */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">
					{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
				</h2>

				<div className="space-y-6">
					{answers.map((answer) => (
						<Card key={answer.id} className={answer.is_accepted ? 'border-green-200 bg-green-50' : ''}>
							<CardContent className="pt-6">
								<div className="flex items-start gap-4">
									<div className="flex flex-col items-center gap-2">
										<Button variant="outline" size="sm">
											<ThumbsUp className="w-4 h-4" />
										</Button>
										<span className="font-semibold">{answer.votes}</span>
										<Button variant="outline" size="sm">
											<ThumbsDown className="w-4 h-4" />
										</Button>
										{answer.is_accepted && <Check className="w-6 h-6 text-green-500 mt-2" />}
									</div>
									<div className="flex-1">
										<div className="prose max-w-none mb-4">
											<div
												dangerouslySetInnerHTML={{
													__html: answer.content.replace(/\n/g, '<br>'),
												}}
											/>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												{/* Only show accept button if user is the question author */}
												{status === 'authenticated' &&
													session?.user?.email === question?.author_username && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleAcceptAnswer(answer.id)}
														>
															{answer.is_accepted ? 'Unaccept' : 'Accept Answer'}
														</Button>
													)}
												<Button variant="ghost" size="sm">
													<MessageCircle className="w-4 h-4 mr-1" />
													Comment
												</Button>
											</div>
											<div className="flex items-center gap-2 text-sm text-gray-500">
												<Avatar className="w-6 h-6">
													<AvatarImage src={answer.author_avatar || '/placeholder.svg'} />
													<AvatarFallback>
														{(answer.author_username || 'U').charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<span>{answer.author_username}</span>
												<span>•</span>
												<span>{formatDate(answer.created_at)}</span>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Answer Form */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Your Answer</h3>
						{status === 'authenticated' && session?.user && (
							<div className="flex items-center gap-2 text-sm text-gray-500">
								<Avatar className="w-6 h-6">
									<AvatarImage src={session.user.image || '/placeholder.svg'} />
									<AvatarFallback>
										{(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span>{session.user.name || session.user.email}</span>
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{status === 'loading' ? (
						<div className="text-center py-4">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : status === 'authenticated' ? (
						<form onSubmit={handleAnswerSubmit}>
							<RichTextEditor
								content={newAnswer}
								onChange={setNewAnswer}
								placeholder="Write your answer here..."
							/>
							<div className="flex gap-2 mt-4">
								<Button type="submit" disabled={!newAnswer.trim() || isSubmittingAnswer}>
									{isSubmittingAnswer ? 'Posting...' : 'Post Answer'}
								</Button>
								<Button type="button" variant="outline" onClick={() => setNewAnswer('')}>
									Cancel
								</Button>
							</div>
						</form>
					) : (
						<div className="text-center py-6 bg-gray-50 rounded-lg">
							<p className="text-gray-600 mb-4">You must be logged in to post an answer.</p>
							<Link href="/login">
								<Button>Sign In to Answer</Button>
							</Link>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
