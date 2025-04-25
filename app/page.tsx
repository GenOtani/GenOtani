"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Plus, Pencil, Check, X, Trash2, Mic, Square, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// キャラクターの状態を表す画像の配列と音声ファイルを修正
const characterStages = [
  {
    id: "child",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_1.jpg-L3itBA8oXfs9h7ISMXjCRyusIjf2C9.jpeg",
    alt: "子供の状態",
    threshold: 0,
    audioSrc: "/sounds/child.mp3", // 実際の音声ファイルへのパスに置き換えてください
    audioText: "なにしてんの？",
  },
  {
    id: "student",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_2.jpg-igdOpsyytyvRkiDPO0M2vgQEKt4C0i.jpeg",
    alt: "学生の状態",
    threshold: 0.2,
    audioSrc: "/sounds/student.mp3", // 実際の音声ファイルへのパスに置き換えてください
    audioText: "どこ見とん？",
  },
  {
    id: "healthy",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_13.jpg-NPZORK3Fw2vzFBKvRRHRnZpysq51XX.jpeg",
    alt: "健康な状態",
    threshold: 0.5,
    audioSrc: "/sounds/healthy.mp3", // 実際の音声ファイルへのパスに置き換えてください
    audioText: "絶対に許さん",
  },
  {
    id: "very-healthy",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_11.jpg-HdInipJjwrjH4bIEcsd7E6FepeS8N8.jpeg",
    alt: "とても健康な状態",
    threshold: 0.8,
    audioSrc: "/sounds/very_healthy.mp3", // 実際の音声ファイルへのパスに置き換えてください
    audioText: "謝っても遅いんやからな",
  },
  {
    id: "wedding",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_8.jpg-xUUTLfmK37MbDEtJtFJVHHRQV9m5F7.jpeg",
    alt: "結婚式",
    threshold: 1.0,
    audioSrc: "/sounds/wedding.mp3", // 実際の音声ファイルへのパスに置き換えてください
    audioText: "本気ってそんなもんなん？",
  },
  {
    id: "death",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_14.jpg-usoKXIzcAf3DaXxUU1fkdBHkhb4duT.jpeg",
    alt: "墓石",
    threshold: -0.5,
    audioSrc: "/sounds/death.mp3", // 実際の音声ファイルへのパスに置き換えてください
    audioText: "本気ってそんなもんなん？",
  },
]

// ToDoアイテムの型定義
interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  audioUrl?: string
  audioDuration?: number
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [characterStage, setCharacterStage] = useState(characterStages[0])

  // 音声録音関連の状態
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingStartTimeRef = useRef<number>(0)

  // キャラクター音声関連の状態
  const [isCharacterSpeaking, setIsCharacterSpeaking] = useState(false)
  const characterAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useState(false)

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

    // 達成率が0%の場合はお墓の状態に
    if (todos.length > 0 && completionRate === 0) {
      setCharacterStage(characterStages[5]) // 墓石
      return
    }

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
    if (completionRate > 0 && completionRate < 0.2) {
      setCharacterStage(characterStages[0]) // 子供の状態
    } else if (completionRate >= 0.2 && completionRate < 0.5) {
      setCharacterStage(characterStages[1]) // 学生の状態
    } else if (completionRate >= 0.5 && completionRate < 0.8) {
      setCharacterStage(characterStages[2]) // 健康な状態
    } else if (completionRate >= 0.8) {
      setCharacterStage(characterStages[3]) // とても健康な状態
    }
  }, [todos])

  // キャラクターの音声を再生する関数
  const playCharacterVoice = () => {
    if (isMuted) return

    // 現在再生中の音声があれば停止
    if (characterAudioRef.current) {
      characterAudioRef.current.pause()
      characterAudioRef.current = null
    }

    // 実際の音声ファイルがない場合は、Web Speech APIを使用してテキストを読み上げる
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(characterStage.audioText)
      utterance.lang = "ja-JP"
      utterance.onstart = () => setIsCharacterSpeaking(true)
      utterance.onend = () => setIsCharacterSpeaking(false)
      speechSynthesis.speak(utterance)
    } else {
      // Web Speech APIがサポートされていない場合、実際の音声ファイルを再生
      const audio = new Audio(characterStage.audioSrc)
      characterAudioRef.current = audio

      audio.onplay = () => setIsCharacterSpeaking(true)
      audio.onended = () => setIsCharacterSpeaking(false)
      audio.onpause = () => setIsCharacterSpeaking(false)

      audio.play().catch((error) => {
        console.error("音声の再生に失敗しました:", error)
        setIsCharacterSpeaking(false)
      })
    }
  }

  // キャラクターの音声を停止する関数
  const stopCharacterVoice = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }

    if (characterAudioRef.current) {
      characterAudioRef.current.pause()
      characterAudioRef.current = null
    }

    setIsCharacterSpeaking(false)
  }

  // ミュート状態を切り替える関数
  const toggleMute = () => {
    if (isCharacterSpeaking) {
      stopCharacterVoice()
    }
    setIsMuted(!isMuted)
  }

  // 音声録音を開始する関数
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // 録音時間を計算
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000
        setAudioDuration(Math.round(duration))

        // ストリームのトラックを停止
        stream.getTracks().forEach((track) => track.stop())
      }

      recordingStartTimeRef.current = Date.now()
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("マイクへのアクセスが拒否されました:", error)
      alert("音声を録音するにはマイクへのアクセスを許可してください。")
    }
  }

  // 音声録音を停止する関数
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // 音声を再生する関数
  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audioRef.current = audio

    audio.onplay = () => setIsPlaying(true)
    audio.onended = () => setIsPlaying(false)
    audio.onpause = () => setIsPlaying(false)

    audio.play()
  }

  // 音声を一時停止する関数
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  // 新しいToDoを追加
  const addTodo = () => {
    if (newTodo.trim() === "" && !audioUrl) return

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      createdAt: new Date(),
      audioUrl: audioUrl || undefined,
      audioDuration: audioDuration || undefined,
    }

    setTodos([...todos, todo])
    setNewTodo("")
    setAudioUrl(null)
    setAudioDuration(0)
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
    if (!editingTodo || (editingTodo.text.trim() === "" && !editingTodo.audioUrl)) return

    setTodos(todos.map((todo) => (todo.id === editingTodo.id ? editingTodo : todo)))

    setEditingTodo(null)
    setIsEditDialogOpen(false)
  }

  // 編集ダイアログを開く
  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo)
    setAudioUrl(todo.audioUrl || null)
    setAudioDuration(todo.audioDuration || 0)
    setIsEditDialogOpen(true)
  }

  // 完了したタスクの数と割合を計算
  const completedTasks = todos.filter((todo) => todo.completed)
  const completedCount = completedTasks.length
  const completionRate = todos.length > 0 ? completedCount / todos.length : 0
  const completionPercentage = Math.round(completionRate * 100)

  // 結婚式の条件を満たしているかチェック
  const isWeddingConditionMet = completedCount >= 5 && completionRate === 1.0

  // 音声の長さを表示用にフォーマット
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      <header className="bg-amber-100 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-amber-800">成長するToDoリスト</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center max-w-md mx-auto w-full">
        {/* キャラクター表示エリア */}
        <div
          className={`w-full aspect-[3/4] relative rounded-xl overflow-hidden border-4 ${
            isCharacterSpeaking ? "border-amber-400 shadow-lg" : "border-amber-200 shadow-md"
          } mb-6 cursor-pointer transition-all duration-300`}
          onClick={playCharacterVoice}
        >
          <Image
            src={characterStage.src || "/placeholder.svg"}
            alt={characterStage.alt}
            fill
            className={`object-cover ${isCharacterSpeaking ? "scale-105" : ""} transition-transform duration-300`}
            priority
          />

          {/* 音声再生中のインジケーター */}
          {isCharacterSpeaking && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white rounded-full p-2 animate-pulse">
              <Volume2 className="h-5 w-5" />
            </div>
          )}

          {/* ミュートボタン */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 left-3 bg-white/80 hover:bg-white border-amber-200"
            onClick={(e) => {
              e.stopPropagation() // クリックイベントの伝播を停止
              toggleMute()
            }}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          {/* 音声吹き出し */}
          {isCharacterSpeaking && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 rounded-lg p-3 shadow-md border border-amber-200">
              <p className="text-sm text-amber-800">{characterStage.audioText}</p>
            </div>
          )}

          {/* 結婚式の条件を満たした場合に表示するメッセージ */}
          {isWeddingConditionMet && !isCharacterSpeaking && (
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
                  "flex flex-col p-3 rounded-lg border",
                  todo.completed ? "bg-green-50 border-green-200" : "bg-white border-amber-200",
                )}
              >
                <div className="flex items-center">
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

                  <span className={cn("flex-1", todo.completed && "line-through text-gray-500")}>
                    {todo.text || (todo.audioUrl ? "音声メモ" : "無題のタスク")}
                  </span>

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

                {/* 音声メモがある場合に表示 */}
                {todo.audioUrl && (
                  <div className="mt-2 flex items-center gap-2 pl-11">
                    <Badge variant="outline" className="bg-amber-50">
                      <Mic className="h-3 w-3 mr-1" />
                      音声メモ {todo.audioDuration && formatDuration(todo.audioDuration)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-amber-100"
                      onClick={() => {
                        if (isPlaying && audioRef.current) {
                          pauseAudio()
                        } else {
                          playAudio(todo.audioUrl!)
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </div>
                )}
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
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // ダイアログが閉じられるときに録音を停止
            if (isRecording) {
              stopRecording()
            }
          }
          setIsAddDialogOpen(open)
        }}
      >
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

            {/* 音声録音UI */}
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500 mb-1">音声メモを追加（任意）</div>
              <div className="flex items-center gap-2">
                {!isRecording && !audioUrl && (
                  <Button variant="outline" onClick={startRecording} className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    録音開始
                  </Button>
                )}

                {isRecording && (
                  <Button
                    variant="outline"
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-red-50 text-red-500 border-red-200"
                  >
                    <Square className="h-4 w-4" />
                    録音停止
                  </Button>
                )}

                {audioUrl && (
                  <>
                    <Badge variant="outline" className="bg-amber-50">
                      <Mic className="h-3 w-3 mr-1" />
                      録音済み {formatDuration(audioDuration)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-amber-100"
                      onClick={() => {
                        if (isPlaying) {
                          pauseAudio()
                        } else {
                          playAudio(audioUrl)
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-100 text-red-500"
                      onClick={() => {
                        setAudioUrl(null)
                        setAudioDuration(0)
                        if (isPlaying) {
                          pauseAudio()
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (isRecording) {
                  stopRecording()
                }
                setIsAddDialogOpen(false)
                setAudioUrl(null)
                setAudioDuration(0)
              }}
            >
              キャンセル
            </Button>
            <Button onClick={addTodo} disabled={newTodo.trim() === "" && !audioUrl}>
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // ダイアログが閉じられるときに録音を停止
            if (isRecording) {
              stopRecording()
            }
          }
          setIsEditDialogOpen(open)
        }}
      >
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

            {/* 音声録音UI（編集時） */}
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500 mb-1">音声メモを追加（任意）</div>
              <div className="flex items-center gap-2">
                {!isRecording && !audioUrl && (
                  <Button variant="outline" onClick={startRecording} className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    録音開始
                  </Button>
                )}

                {isRecording && (
                  <Button
                    variant="outline"
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-red-50 text-red-500 border-red-200"
                  >
                    <Square className="h-4 w-4" />
                    録音停止
                  </Button>
                )}

                {audioUrl && (
                  <>
                    <Badge variant="outline" className="bg-amber-50">
                      <Mic className="h-3 w-3 mr-1" />
                      録音済み {formatDuration(audioDuration)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-amber-100"
                      onClick={() => {
                        if (isPlaying) {
                          pauseAudio()
                        } else {
                          playAudio(audioUrl)
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-100 text-red-500"
                      onClick={() => {
                        setAudioUrl(null)
                        setAudioDuration(0)
                        setEditingTodo((prev) =>
                          prev ? { ...prev, audioUrl: undefined, audioDuration: undefined } : null,
                        )
                        if (isPlaying) {
                          pauseAudio()
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (isRecording) {
                  stopRecording()
                }
                setIsEditDialogOpen(false)
                setEditingTodo(null)
              }}
            >
              キャンセル
            </Button>
            <Button onClick={updateTodo} disabled={editingTodo?.text.trim() === "" && !audioUrl}>
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
