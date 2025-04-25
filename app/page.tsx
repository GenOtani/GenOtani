"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Pencil, Check, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// キャラクターの状態を表す画像の配列
const characterStages = [
  {
    id: "child",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_1.jpg-L3itBA8oXfs9h7ISMXjCRyusIjf2C9.jpeg",
    alt: "子供の状態",
    threshold: 0,
  },
  {
    id: "student",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_2.jpg-igdOpsyytyvRkiDPO0M2vgQEKt4C0i.jpeg",
    alt: "学生の状態",
    threshold: 0.2,
  },
  {
    id: "healthy",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_13.jpg-NPZORK3Fw2vzFBKvRRHRnZpysq51XX.jpeg",
    alt: "健康な状態",
    threshold: 0.5,
  },
  {
    id: "very-healthy",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_11.jpg-HdInipJjwrjH4bIEcsd7E6FepeS8N8.jpeg",
    alt: "とても健康な状態",
    threshold: 0.8,
  },
  {
    id: "wedding",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_8.jpg-xUUTLfmK37MbDEtJtFJVHHRQV9m5F7.jpeg",
    alt: "結婚式",
    threshold: 1.0,
  },
  {
    id: "death",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_14.jpg-usoKXIzcAf3DaXxUU1fkdBHkhb4duT.jpeg",
    alt: "墓石",
    threshold: -0.5, // 特別な状態：タスクの失敗が多すぎる場合
  },
]

// ToDoアイテムの型定義
interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [characterStage, setCharacterStage] = useState(characterStages[0])

  // キャラクター状態更新ロジックを修正
  useEffect(() => {
    if (todos.length === 0) {
      setCharacterStage(characterStages[0]) // 子供の状態
      return
    }

    // 完了したタスクの数と割合を計算
    const completedTasks = todos.filter((todo) => todo.completed)
    const completedCount = completedTasks.length
    const completionRate = completedCount / todos.length

    // 未完了のタスクが多すぎる場合は「死亡」状態に
    if (todos.length > 5 && completionRate < 0.2) {
      setCharacterStage(characterStages[5]) // 墓石
      return
    }

    // タスクが5個以上完了しており、達成率が100%の時にウエディングドレスの写真を表示
    if (completedCount >= 5 && completionRate === 1.0) {
      setCharacterStage(characterStages[4]) // 結婚式
      return
    }

    // 完了率に基づいて適切なステージを選択
    if (completionRate >= 0 && completionRate < 0.2) {
      setCharacterStage(characterStages[0]) // 子供の状態
    } else if (completionRate >= 0.2 && completionRate < 0.5) {
      setCharacterStage(characterStages[1]) // 学生の状態
    } else if (completionRate >= 0.5 && completionRate < 0.8) {
      setCharacterStage(characterStages[2]) // 健康な状態
    } else if (completionRate >= 0.8) {
      setCharacterStage(characterStages[3]) // とても健康な状態
    }
  }, [todos])

  // 新しいToDoを追加
  const addTodo = () => {
    if (newTodo.trim() === "") return

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      createdAt: new Date(),
    }

    setTodos([...todos, todo])
    setNewTodo("")
    setIsAddDialogOpen(false)
  }

  // ToDoの完了状態を切り替え
  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  // ToDoを削除
  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // ToDoを編集
  const updateTodo = () => {
    if (!editingTodo || editingTodo.text.trim() === "") return

    setTodos(todos.map((todo) => (todo.id === editingTodo.id ? editingTodo : todo)))

    setEditingTodo(null)
    setIsEditDialogOpen(false)
  }

  // 編集ダイアログを開く
  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo)
    setIsEditDialogOpen(true)
  }

  // 完了したタスクの数と割合を計算
  const completedTasks = todos.filter((todo) => todo.completed)
  const completedCount = completedTasks.length
  const completionRate = todos.length > 0 ? completedCount / todos.length : 0
  const completionPercentage = Math.round(completionRate * 100)

  // 結婚式の条件を満たしているかチェック
  const isWeddingConditionMet = completedCount >= 5 && completionRate === 1.0

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      <header className="bg-amber-100 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-amber-800">成長するToDoリスト</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center max-w-md mx-auto w-full">
        {/* キャラクター表示エリア */}
        <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden border-4 border-amber-200 shadow-md mb-6">
          <Image
            src={characterStage.src || "/placeholder.svg"}
            alt={characterStage.alt}
            fill
            className="object-cover"
            priority
          />

          {/* 結婚式の条件を満たした場合に表示するメッセージ */}
          {isWeddingConditionMet && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-800/80 to-transparent p-4 text-white">
              <p className="text-center font-bold">おめでとう！すべてのタスクを完了しました！</p>
            </div>
          )}
        </div>

        {/* 進捗状況 */}
        {todos.length > 0 && (
          <div className="w-full mb-4">
            <div className="flex justify-between text-sm text-amber-800 mb-1">
              <span>達成率: {completionPercentage}%</span>
              <span>
                {completedCount}/{todos.length} 完了
                {isWeddingConditionMet && " 🎉"}
              </span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isWeddingConditionMet ? "bg-amber-600" : "bg-amber-500"
                }`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* ToDoリスト */}
        <div className="w-full space-y-2 mb-4">
          {todos.length === 0 ? (
            <p className="text-center text-amber-700 py-4">タスクを追加してキャラクターを成長させましょう！</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={cn(
                  "flex items-center p-3 rounded-lg border",
                  todo.completed ? "bg-green-50 border-green-200" : "bg-white border-amber-200",
                )}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full mr-3 border-2",
                    todo.completed
                      ? "bg-green-100 border-green-500 text-green-500"
                      : "bg-amber-100 border-amber-300 text-amber-500",
                  )}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>

                <span className={cn("flex-1", todo.completed && "line-through text-gray-500")}>{todo.text}</span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-amber-600"
                  onClick={() => openEditDialog(todo)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 ml-1"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* アクションボタン */}
      <footer className="p-4 flex justify-start gap-4 bg-amber-100">
        <Button
          variant="outline"
          size="icon"
          className="w-14 h-14 rounded-xl border-2 border-amber-800 bg-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-8 w-8 text-amber-800" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-14 h-14 rounded-xl border-2 border-amber-800 bg-white"
          onClick={() => todos.length > 0 && openEditDialog(todos[0])}
          disabled={todos.length === 0}
        >
          <Pencil className="h-8 w-8 text-amber-800" />
        </Button>
      </footer>

      {/* 追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新しいタスクを追加</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="タスクを入力してください"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={addTodo}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>タスクを編集</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="タスクを入力してください"
              value={editingTodo?.text || ""}
              onChange={(e) => setEditingTodo((prev) => (prev ? { ...prev, text: e.target.value } : null))}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateTodo()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={updateTodo}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
