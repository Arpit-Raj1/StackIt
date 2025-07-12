"use client"

import type React from "react"

import { RichTextEditor } from "@/components/rich-text-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Check, MessageCircle, Share, ThumbsDown, ThumbsUp } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { use, useState } from "react"

interface Answer {
  id: string
  content: string
  author: {
    username: string
    avatar?: string
  }
  votes: number
  isAccepted: boolean
  createdAt: string
}

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const resolvedParams = use(params);

  const [question] = useState({
    id: resolvedParams.id,
    title: "How to implement authentication in Next.js 14?",
    content: `I'm trying to implement authentication in my Next.js 14 application using the app router. I've looked at several tutorials but I'm confused about the best practices.

Here's what I've tried so far:

1. Using NextAuth.js
2. Implementing custom JWT authentication
3. Using Supabase Auth

**What I'm looking for:**
- Best practices for authentication in Next.js 14
- How to protect routes properly
- Session management recommendations

Any help would be appreciated!`,
    tags: ["nextjs", "authentication", "react"],
    author: {
      username: "johndoe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    votes: 15,
    views: 245,
    createdAt: "2 hours ago",
  })

  const [answers, setAnswers] = useState<Answer[]>([
    {
      id: "1",
      content: `For Next.js 14 with the app router, I'd recommend using **NextAuth.js v5** (Auth.js). Here's a complete setup:

## Installation
\`\`\`bash
npm install next-auth@beta
\`\`\`

## Configuration
Create \`auth.ts\` in your root directory:

\`\`\`typescript
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    session({ session, token }) {
      return session
    },
  },
})
\`\`\`

This approach is the most maintainable and follows Next.js best practices.`,
      author: {
        username: "sarah_dev",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      votes: 8,
      isAccepted: true,
      createdAt: "1 hour ago",
    },
    {
      id: "2",
      content: `I personally prefer using **Supabase Auth** for Next.js projects. It's simpler to set up and provides a complete backend solution.

Here's a quick setup:

1. Install Supabase client
2. Create auth components
3. Use middleware for route protection

The documentation is excellent and it handles all the edge cases for you.`,
      author: {
        username: "mike_codes",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      votes: 3,
      isAccepted: false,
      createdAt: "30 minutes ago",
    },
  ])

  const [newAnswer, setNewAnswer] = useState("")
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  const handleVote = (type: "up" | "down") => {
    setUserVote(userVote === type ? null : type)
  }

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    if (!session?.user?.email) {
      alert("You must be logged in to post an answer.");
      return;
    }
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newAnswer,
          questionId: question.id,
          authorId: session.user.email,
        }),
      });
      if (!res.ok) throw new Error("Failed to post answer");
      const data = await res.json();
      setAnswers([...answers, {
        id: data.answer.id,
        content: data.answer.content,
        author: {
          username: session.user.name || session.user.email || "You",
          avatar: session.user.image || "/placeholder.svg?height=32&width=32",
        },
        votes: 0,
        isAccepted: false,
        createdAt: data.answer.created_at || "just now",
      }]);
      setNewAnswer("");
    } catch (err) {
      alert("Error posting answer: " + (err as Error).message);
    }
  };

  const handleAcceptAnswer = (answerId: string) => {
    setAnswers(
      answers.map((answer) => ({
        ...answer,
        isAccepted: answer.id === answerId ? !answer.isAccepted : false,
      })),
    )
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
              <Button variant={userVote === "up" ? "default" : "outline"} size="sm" onClick={() => handleVote("up")}>
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-lg">{question.votes}</span>
              <Button
                variant={userVote === "down" ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote("down")}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
              <div className="prose max-w-none mb-4">
                <div dangerouslySetInnerHTML={{ __html: question.content.replace(/\n/g, "<br>") }} />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <span className="text-sm text-gray-500">{question.views} views</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={question.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{question.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{question.author.username}</span>
                  <span>•</span>
                  <span>{question.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        <div className="space-y-6">
          {answers.map((answer) => (
            <Card key={answer.id} className={answer.isAccepted ? "border-green-200 bg-green-50" : ""}>
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
                    {answer.isAccepted && <Check className="w-6 h-6 text-green-500 mt-2" />}
                  </div>
                  <div className="flex-1">
                    <div className="prose max-w-none mb-4">
                      <div dangerouslySetInnerHTML={{ __html: answer.content.replace(/\n/g, "<br>") }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleAcceptAnswer(answer.id)}>
                          {answer.isAccepted ? "Unaccept" : "Accept Answer"}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Comment
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={answer.author.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{answer.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{answer.author.username}</span>
                        <span>•</span>
                        <span>{answer.createdAt}</span>
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
          <h3 className="text-lg font-semibold">Your Answer</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnswerSubmit}>
            <RichTextEditor content={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={!newAnswer.trim()}>
                Post Answer
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
