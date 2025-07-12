"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageCircle, ThumbsUp, AtSign } from "lucide-react"

interface NotificationDropdownProps {
  count: number
}

interface Notification {
  id: string
  type: "answer" | "comment" | "mention" | "vote"
  message: string
  time: string
  read: boolean
  link: string
}

export function NotificationDropdown({ count }: NotificationDropdownProps) {
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "answer",
      message: 'Sarah answered your question "How to use React hooks?"',
      time: "2 minutes ago",
      read: false,
      link: "/questions/1",
    },
    {
      id: "2",
      type: "vote",
      message: "Your answer received 5 upvotes",
      time: "1 hour ago",
      read: false,
      link: "/questions/2",
    },
    {
      id: "3",
      type: "mention",
      message: "Mike mentioned you in a comment",
      time: "3 hours ago",
      read: false,
      link: "/questions/3",
    },
  ])

  const getIcon = (type: string) => {
    switch (type) {
      case "answer":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "vote":
        return <ThumbsUp className="w-4 h-4 text-green-500" />
      case "mention":
        return <AtSign className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full">
              Mark all as read
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
