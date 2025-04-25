"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PostCardProps {
  imageUrl: string
  username: string
  caption?: string
  likes?: number
  comments?: number
}

export default function PostCard({
  imageUrl = "/placeholder.svg?height=600&width=450",
  username = "ユーザー名",
  caption = "投稿のキャプション...",
  likes = 0,
  comments = 0,
}: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white">
      <div className="relative aspect-[3/4] w-full">
        <Image src={imageUrl || "/placeholder.svg"} alt={caption || "投稿画像"} fill className="object-cover sepia" />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={handleLike} className={liked ? "text-red-500" : ""}>
            <Heart className={`h-6 w-6 ${liked ? "fill-red-500" : ""}`} />
          </Button>
          <span className="text-sm">{likeCount}</span>

          <Button variant="ghost" size="icon">
            <MessageCircle className="h-6 w-6" />
          </Button>
          <span className="text-sm">{comments}</span>

          <Button variant="ghost" size="icon" className="ml-auto">
            <Share2 className="h-6 w-6" />
          </Button>
        </div>

        <div>
          <p className="font-bold">{username}</p>
          <p className="text-sm text-gray-600">{caption}</p>
        </div>
      </div>
    </div>
  )
}
