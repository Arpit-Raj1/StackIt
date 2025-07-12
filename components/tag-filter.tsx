"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TagFilter() {
  const [popularTags] = useState([
    { name: "react", count: 1234 },
    { name: "javascript", count: 2156 },
    { name: "typescript", count: 987 },
    { name: "nextjs", count: 654 },
    { name: "nodejs", count: 543 },
    { name: "css", count: 432 },
    { name: "html", count: 321 },
    { name: "python", count: 876 },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Popular Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Badge
              key={tag.name}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              {tag.name} ({tag.count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
