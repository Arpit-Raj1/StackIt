"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, MessageCircle, Eye, Check } from "lucide-react"

interface Question {
  id: string
  title: string
  description: string
  tags: string[]
  author: {
    username: string
    avatar?: string
  }
  votes: number
  answers: number
  views: number
  hasAcceptedAnswer: boolean
  createdAt: string
}

export function QuestionList() {
  const [questions] = useState<Question[]>([
    {
      id: "1",
      title: "How to implement authentication in Next.js 14?",
      description:
        "I'm trying to implement authentication in my Next.js 14 application using the app router. What are the best practices?",
      tags: ["nextjs", "authentication", "react"],
      author: {
        username: "johndoe",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      votes: 15,
      answers: 3,
      views: 245,
      hasAcceptedAnswer: true,
      createdAt: "2 hours ago",
    },
    {
      id: "2",
      title: "React useState vs useReducer - when to use which?",
      description:
        "I'm confused about when to use useState and when to use useReducer in React. Can someone explain the differences?",
      tags: ["react", "hooks", "state-management"],
      author: {
        username: "sarah_dev",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      votes: 8,
      answers: 2,
      views: 156,
      hasAcceptedAnswer: false,
      createdAt: "4 hours ago",
    },
    {
      id: "3",
      title: "Best practices for TypeScript with React components?",
      description:
        "What are the best practices for typing React components with TypeScript? Should I use interfaces or types?",
      tags: ["typescript", "react", "best-practices"],
      author: {
        username: "mike_codes",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      votes: 12,
      answers: 5,
      views: 389,
      hasAcceptedAnswer: true,
      createdAt: "1 day ago",
    },
  ])

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <Link href={`/questions/${question.id}`} className="flex-1 hover:text-primary">
                <h3 className="text-lg font-semibold leading-tight">{question.title}</h3>
              </Link>
              {question.hasAcceptedAnswer && <Check className="w-5 h-5 text-green-500 flex-shrink-0" />}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-600 mb-4 line-clamp-2">{question.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {question.votes}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {question.answers}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {question.views}
                </div>
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
