"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TagInput } from "@/components/tag-input"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AskQuestionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Question submitted:", { title, description, tags })
    setIsSubmitting(false)

    // Redirect to question page or show success message
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </Link>
        <h1 className="text-3xl font-bold">Ask a Question</h1>
        <p className="text-gray-600 mt-2">Get help from the community by asking a clear, detailed question.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., How to implement authentication in Next.js?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific and imagine you're asking a question to another person.
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <div className="mt-1">
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Provide details about your question. Include what you've tried and what you're expecting to happen."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags *</Label>
              <div className="mt-1">
                <TagInput
                  tags={tags}
                  onChange={setTags}
                  placeholder="Add up to 5 tags to describe what your question is about"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Add tags to help others find and answer your question.</p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={!title || !description || tags.length === 0 || isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? "Posting..." : "Post Question"}
              </Button>
              <Link href="/">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
