"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, Strikethrough, List, ListOrdered, Link, ImageIcon, Smile } from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const handleBold = () => insertText("**", "**")
  const handleItalic = () => insertText("*", "*")
  const handleStrikethrough = () => insertText("~~", "~~")
  const handleBulletList = () => insertText("\n- ", "")
  const handleNumberedList = () => insertText("\n1. ", "")
  const handleLink = () => insertText("[", "](url)")
  const handleImage = () => insertText("![alt text](", ")")
  const handleEmoji = () => insertText("😊", "")

  const renderPreview = (text: string) => {
    // Simple markdown-like rendering
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      .replace(/!\[([^\]]*)\]$$([^)]+)$$/g, '<img src="$2" alt="$1" class="max-w-full h-auto" />')
      .replace(/\n- (.*)/g, "<li>$1</li>")
      .replace(/\n\d+\. (.*)/g, "<li>$1</li>")
      .replace(/\n/g, "<br>")
  }

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <Button type="button" variant="ghost" size="sm" onClick={handleBold} className="h-8 w-8 p-0">
          <Bold className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleItalic} className="h-8 w-8 p-0">
          <Italic className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleStrikethrough} className="h-8 w-8 p-0">
          <Strikethrough className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={handleBulletList} className="h-8 w-8 p-0">
          <List className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleNumberedList} className="h-8 w-8 p-0">
          <ListOrdered className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={handleLink} className="h-8 w-8 p-0">
          <Link className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleImage} className="h-8 w-8 p-0">
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleEmoji} className="h-8 w-8 p-0">
          <Smile className="w-4 h-4" />
        </Button>
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            variant={!isPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(false)}
          >
            Write
          </Button>
          <Button type="button" variant={isPreview ? "default" : "ghost"} size="sm" onClick={() => setIsPreview(true)}>
            Preview
          </Button>
        </div>
      </div>

      <div className="p-3">
        {isPreview ? (
          <div className="min-h-32 prose max-w-none" dangerouslySetInnerHTML={{ __html: renderPreview(content) }} />
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-32 border-0 p-0 resize-none focus-visible:ring-0"
          />
        )}
      </div>
    </div>
  )
}
