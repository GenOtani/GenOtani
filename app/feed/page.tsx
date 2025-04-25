import PostCard from "@/components/post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, Home, Search, Bell, User } from "lucide-react"

export default function FeedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white p-4 border-b z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">フィード</h1>
          <Avatar className="w-8 h-8 border-2 border-pink-500">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="プロフィール" />
            <AvatarFallback>ユ</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 p-4 space-y-6">
        <PostCard username="アート好き" caption="今日の一枚 #アート #イラスト" likes={42} comments={5} />

        <PostCard username="デザイナー" caption="新作イラスト完成しました" likes={128} comments={24} />
      </main>

      {/* フッターナビゲーション */}
      <footer className="sticky bottom-0 bg-white border-t p-2">
        <div className="flex justify-around">
          <Button variant="ghost" size="icon">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-pink-500 text-white border-none">
            <Plus className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-6 w-6" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
