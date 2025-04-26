"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function StorageResetButton() {
  // ローカルストレージをリセットする関数
  const resetLocalStorage = () => {
    try {
      // ToDoアプリ関連のデータをクリア
      localStorage.removeItem("todos")
      localStorage.removeItem("completionOrder")
      localStorage.removeItem("healthState")
      localStorage.removeItem("lastCompletionTime")
      localStorage.removeItem("isMuted")

      // ページをリロード
      window.location.reload()
    } catch (error) {
      console.error("ローカルストレージのリセットに失敗しました:", error)
      alert("データのリセットに失敗しました。もう一度お試しください。")
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          データをリセット
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>データをリセットしますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作を行うと、すべてのタスクと進捗状況が削除されます。この操作は元に戻せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={resetLocalStorage} className="bg-red-600 hover:bg-red-700">
            リセット
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
