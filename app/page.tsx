"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Plus, Pencil, Check, X, Trash2, Mic, Square, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "../hooks/use-local-storage"
import { StorageResetButton } from "../components/storage-reset-button"

// キャラクターの状態を表す画像の配列と音声ファイルを拡張
const characterStages = [
  {
    id: "baby",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_15.jpg-uUOfp2CrdnqmCffQWUtIGr9QF34Zhx.jpeg",
    alt: "赤ちゃんの状態",
    threshold: 0,
    audioSrc: "/sounds/child.mp3",
    audioText: "なにしてんの？",
  },
  {
    id: "child",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_9.jpg-h43DfCxzn5pqAqrtwECkPcobZ7C84k.jpeg",
    alt: "子供の状態",
    threshold: 0.1,
    audioSrc: "/sounds/child.mp3",
    audioText: "どこ見とん？",
  },
  {
    id: "student",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_16.jpg-a84yPZf149Yk7oFMJkSvQxkH2XGKwy.jpeg",
    alt: "学生の状態",
    threshold: 0.2,
    audioSrc: "/sounds/student.mp3",
    audioText: "なんでやねん",
  },
  {
    id: "sick",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_10.jpg-XUHlSphiJI1rbdO8qFGRgSbFqrgnYM.jpeg",
    alt: "病気の状態",
    threshold: 0.3,
    audioSrc: "/sounds/sick.mp3",
    audioText: "気分悪い…",
  },
  {
    id: "very-sick",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_4.jpg-ujxpVtn6QBxYIoy0hPjwZMfbeBgPj9.jpeg",
    alt: "重症の状態",
    threshold: -0.3,
    audioSrc: "/sounds/very_sick.mp3",
    audioText: "もう無理…",
  },
  {
    id: "recovery",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_12.jpg-eJxSsGiGx33rjMoHr5ByVLeUEDTpLr.jpeg",
    alt: "回復中の状態",
    threshold: 0.4,
    audioSrc: "/sounds/recovery.mp3",
    audioText: "よくなってきた",
  },
  {
    id: "healthy",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_13.jpg-UyLmZ8wZHLOumZDojkeYzqdoGQKaIa.jpeg",
    alt: "健康な状態",
    threshold: 0.5,
    audioSrc: "/sounds/healthy.mp3",
    audioText: "絶対に許さん",
  },
  {
    id: "very-healthy",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_11.jpg-CVDPJCXtPq6PeHQEVKNUmZz1p9abWz.jpeg",
    alt: "とても健康な状態",
    threshold: 0.8,
    audioSrc: "/sounds/very_healthy.mp3",
    audioText: "謝っても遅いんやからな",
  },
  {
    id: "wedding",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_8.jpg-BkoBBbPMx63v88j1cIUbmvXyLCRv5J.jpeg",
    alt: "結婚式",
    threshold: 1.0,
    audioSrc: "/sounds/wedding.mp3",
    audioText: "本気ってそんなもんなん？",
  },
  {
    id: "death",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_14.jpg-aBz9Jw5yZ2IjjH80I6ZOgzlhbRaC6a.jpeg",
    alt: "墓石",
    threshold: -0.5,
    audioSrc: "/sounds/death.mp3",
    audioText: "本気ってそんなもんなん？",
  },
  // 保留していた既存の段階も残しておきます
  {
    id: "angry",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_3.jpg-Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9.jpeg",
    alt: "怒りの状態",
    threshold: 0.35,
    audioSrc: "/sounds/angry.mp3",
    audioText: "だからなんやねん",
  },
  {
    id: "poison",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_4.jpg-Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9.jpeg",
    alt: "毒の状態",
    threshold: 0.45,
    audioSrc: "/sounds/poison.mp3",
    audioText: "毒やん",
  },
  {
    id: "genius",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_5.jpg-Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9.jpeg",
    alt: "天才の状態",
    threshold: 0.6,
    audioSrc: "/sounds/genius.mp3",
    audioText: "天才もたまげるわ",
  },
  {
    id: "surprised",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_6.jpg-Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9.jpeg",
    alt: "驚きの状態",
    threshold: 0.38,
    audioSrc: "/sounds/surprised.mp3",
    audioText: "えっ！？何それ！",
  },
  {
    id: "happy",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_7.jpg-Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9.jpeg",
    alt: "幸せな状態",
    threshold: 0.7,
    audioSrc: "/sounds/happy.mp3",
    audioText: "うれしいなぁ〜",
  },
  {
    id: "excited",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LINE_ALBUM_%E5%A5%B3_250426_12.jpg-Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9Yd5Yd9.jpeg",
    alt: "興奮した状態",
    threshold: 0.9,
    audioSrc: "/sounds/excited.mp3",
    audioText: "わくわくするなぁ！",
  },
]

// 特別なメッセージ
const specialMessages = {
  touchTooMuch: "そんな触んなや",
  sixTasksCompleted: "おめでとう！6つのタスクを完了しました！",
  sevenTasksCompleted: "おめでとう！7つのタスクを完了しました！",
}

// YouTube動画のURL
const youtubeVideos = {
  sixTasks: "https://www.youtube.com/embed/PCpfXIvs1uk?autoplay=1",
  sevenTasks: "https://www.youtube.com/embed/Oww5_qOtg2E?autoplay=1",
}

// 日付の復元のために、Todo型定義を更新
interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string | Date // 文字列またはDate型を許容
  audioUrl?: string
  audioDuration?: number
}

export default function TodoApp() {
  // ローカルストレージを使用するように状態を変更
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", [])
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
  const [isMuted, setIsMuted] = useLocalStorage<boolean>("isMuted", false)

  // 連続クリック検出用の状態
  const [clickCount, setClickCount] = useState(0)
  const lastClickTimeRef = useRef<number>(0)

  // YouTube動画関連の状態
  const [showYoutubeVideo, setShowYoutubeVideo] = useState(false)
  const [currentYoutubeVideo, setCurrentYoutubeVideo] = useState("")
  const [sixTasksCompleted, setSixTasksCompleted] = useState(false)
  const [sevenTasksCompleted, setSevenTasksCompleted] = useState(false)

  // 達成順序を追跡するための状態（ローカルストレージ対応）
  const [completionOrder, setCompletionOrder] = useLocalStorage<string[]>("completionOrder", [])

  // 病気状態を追跡するための状態（ローカルストレージ対応）
  const [healthState, setHealthState] = useLocalStorage<"healthy" | "sick" | "very-sick" | "recovering">(
    "healthState",
    "healthy",
  )

  // 最後のタスク完了時間をローカルストレージに保存
  const [lastCompletionTime, setLastCompletionTime] = useLocalStorage<number>("lastCompletionTime", Date.now())
  const lastCompletionTimeRef = useRef<number>(Date.now())

  // 最後のタスク完了時間の参照を同期
  useEffect(() => {
    lastCompletionTimeRef.current = lastCompletionTime
  }, [lastCompletionTime])

  // useEffectを追加して、ローカルストレージから読み込んだ日付文字列をDate型に変換
  // キャラクター状態更新ロジックのuseEffectの前に追加
  useEffect(() => {
    // ローカルストレージから読み込んだTodoの日付文字列をDate型に変換
    if (todos.length > 0) {
      const updatedTodos = todos.map((todo) => ({
        ...todo,
        createdAt: todo.createdAt instanceof Date ? todo.createdAt : new Date(todo.createdAt),
      }))

      // 変換後のTodosで状態を更新（無限ループを防ぐために比較）
      if (JSON.stringify(updatedTodos) !== JSON.stringify(todos)) {
        setTodos(updatedTodos)
      }
    }
  }, [])

  // キャラクター状態更新ロジック
  useEffect(() => {
    if (todos.length === 0) {
      setCharacterStage(characterStages[0]) // 赤ちゃん状態
      return
    }

    // 完了したタスクの数と割合を計算
    const completedTasks = todos.filter((todo) => todo.completed)
    const completedCount = completedTasks.length
    const completionRate = completedCount / todos.length

    // 最後のタスク完了からの経過時間をチェック（長時間未完了の場合、病気になる）
    const now = Date.now()
    const daysSinceLastCompletion = (now - lastCompletionTimeRef.current) / (1000 * 60 * 60 * 24)

    // 3日以上タスクを完了していない場合、病気状態に
    if (completedCount > 0 && daysSinceLastCompletion > 3) {
      if (healthState === "healthy") {
        setHealthState("sick")
      } else if (healthState === "sick" && daysSinceLastCompletion > 5) {
        setHealthState("very-sick")
      }
    } else if (
      completedCount > 0 &&
      daysSinceLastCompletion < 1 &&
      (healthState === "sick" || healthState === "very-sick")
    ) {
      // 病気状態から回復中
      setHealthState("recovering")
    } else if (healthState === "recovering" && completedCount > 2) {
      // 回復中から健康に
      setHealthState("healthy")
    }

    // 6つのタスクが完了したかチェック
    if (completedCount === 6) {
      setSixTasksCompleted(true)
      setSevenTasksCompleted(false)
    } else if (completedCount === 7) {
      setSixTasksCompleted(false)
      setSevenTasksCompleted(true)
    } else {
      setSixTasksCompleted(false)
      setSevenTasksCompleted(false)
    }

    // 健康状態に基づいて特定の画像を表示
    if (healthState === "very-sick") {
      setCharacterStage(characterStages[4]) // 重症状態
      return
    } else if (healthState === "sick") {
      setCharacterStage(characterStages[3]) // 病気状態
      return
    } else if (healthState === "recovering") {
      setCharacterStage(characterStages[5]) // 回復中状態
      return
    }

    // 達成率が0%の場合はお墓の状態に
    if (todos.length > 0 && completionRate === 0) {
      setCharacterStage(characterStages[9]) // 墓石
      return
    }

    // 未完了のタスクが多すぎる場合は「死亡」状態に
    if (todos.length > 5 && completionRate < 0.2) {
      setCharacterStage(characterStages[9]) // 墓石
      return
    }

    // タスクが5個以上完了しており、達成率が100%の時にウエディングドレスの写真を表示
    if (completedCount >= 5 && completionRate === 1.0) {
      setCharacterStage(characterStages[8]) // 結婚式
      return
    }

    // 連続するタスクの完了状態をチェック
    const consecutiveCompletedTasks = getConsecutiveCompletedTasks(todos)

    // 連続する完了タスクに基づいてキャラクターを選択
    if (consecutiveCompletedTasks >= 3) {
      setCharacterStage(characterStages[12]) // 天才の状態
      return
    } else if (consecutiveCompletedTasks === 2) {
      setCharacterStage(characterStages[11]) // 毒の状態
      return
    }

    // 達成順序に基づいてキャラクターを選択
    if (completionOrder.length > 0) {
      const lastCompletedId = completionOrder[completionOrder.length - 1]
      const lastCompletedIndex = todos.findIndex((todo) => todo.id === lastCompletedId)

      // 最後に完了したタスクのインデックスに基づいて異なる写真を表示
      if (lastCompletedIndex % 6 === 0) {
        setCharacterStage(characterStages[13]) // 驚きの状態
        return
      } else if (lastCompletedIndex % 6 === 1) {
        setCharacterStage(characterStages[14]) // 幸せな状態
        return
      } else if (lastCompletedIndex % 6 === 2) {
        setCharacterStage(characterStages[10]) // 怒りの状態
        return
      } else if (lastCompletedIndex % 6 === 3) {
        setCharacterStage(characterStages[5]) // 回復中の状態
        return
      } else if (lastCompletedIndex % 6 === 4) {
        setCharacterStage(characterStages[15]) // 興奮した状態
        return
      } else if (lastCompletedIndex % 6 === 5) {
        setCharacterStage(characterStages[7]) // とても健康な状態
        return
      }
    }

    // 完了率に基づいて適切なステージを選択
    if (completionRate > 0 && completionRate < 0.1) {
      setCharacterStage(characterStages[0]) // 赤ちゃんの状態
    } else if (completionRate >= 0.1 && completionRate < 0.2) {
      setCharacterStage(characterStages[1]) // 子供の状態
    } else if (completionRate >= 0.2 && completionRate < 0.3) {
      setCharacterStage(characterStages[2]) // 学生の状態
    } else if (completionRate >= 0.3 && completionRate < 0.45) {
      setCharacterStage(characterStages[10]) // 怒りの状態
    } else if (completionRate >= 0.45 && completionRate < 0.5) {
      setCharacterStage(characterStages[11]) // 毒の状態
    } else if (completionRate >= 0.5 && completionRate < 0.6) {
      setCharacterStage(characterStages[6]) // 健康な状態
    } else if (completionRate >= 0.6 && completionRate < 0.8) {
      setCharacterStage(characterStages[12]) // 天才の状態
    } else if (completionRate >= 0.8) {
      setCharacterStage(characterStages[7]) // とても健康な状態
    }
  }, [todos, completionOrder, healthState])

  // 連続する完了タスクの数を取得する関数
  const getConsecutiveCompletedTasks = (todoList: Todo[]) => {
    // 作成日時でソート
    const sortedTodos = [...todoList].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    let maxConsecutive = 0
    let currentConsecutive = 0

    for (const todo of sortedTodos) {
      if (todo.completed) {
        currentConsecutive++
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
      } else {
        currentConsecutive = 0
      }
    }

    return maxConsecutive
  }

  // キャラクターの音声を再生する関数
  const playCharacterVoice = () => {
    if (isMuted) return

    // 現在の時間を取得
    const now = Date.now()

    // 連続クリックの検出
    if (now - lastClickTimeRef.current < 2000) {
      // 2秒以内のクリック
      setClickCount((prev) => prev + 1)

      // 3回連続でクリックされた場合
      if (clickCount >= 2) {
        playSpecialMessage(specialMessages.touchTooMuch)
        setClickCount(0)
        lastClickTimeRef.current = 0
        return
      }
    } else {
      // 時間が経過していたらリセット
      setClickCount(1)
    }

    lastClickTimeRef.current = now

    // 現在再生中の音声があれば停止
    if (characterAudioRef.current) {
      characterAudioRef.current.pause()
      characterAudioRef.current = null
    }

    // 7つのタスクが完了している場合、YouTube動画を表示
    if (sevenTasksCompleted) {
      setCurrentYoutubeVideo(youtubeVideos.sevenTasks)
      setShowYoutubeVideo(true)
      return
    }

    // 6つのタスクが完了している場合、YouTube動画を表示
    if (sixTasksCompleted) {
      setCurrentYoutubeVideo(youtubeVideos.sixTasks)
      setShowYoutubeVideo(true)
      return
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

  // 特別なメッセージを再生する関数
  const playSpecialMessage = (message: string) => {
    if (isMuted) return

    // 現在再生中の音声があれば停止
    if (characterAudioRef.current) {
      characterAudioRef.current.pause()
      characterAudioRef.current = null
    }

    // Web Speech APIを使用してテキストを読み上げる
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = "ja-JP"
      utterance.onstart = () => setIsCharacterSpeaking(true)
      utterance.onend = () => setIsCharacterSpeaking(false)
      speechSynthesis.speak(utterance)
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

  // YouTube動画を閉じる関数
  const closeYoutubeVideo = () => {
    setShowYoutubeVideo(false)
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
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        const newCompleted = !todo.completed

        // 完了状態になった場合、達成順序に追加し、最終完了時間を更新
        if (newCompleted && !todo.completed) {
          setCompletionOrder((prev) => [...prev, id])
          const now = Date.now()
          lastCompletionTimeRef.current = now
          setLastCompletionTime(now)
        } else if (!newCompleted && todo.completed) {
          // 未完了に戻した場合、達成順序から削除
          setCompletionOrder((prev) => prev.filter((todoId) => todoId !== id))
        }

        return { ...todo, completed: newCompleted }
      }
      return todo
    })

    setTodos(updatedTodos)
  }

  // ToDoを削除
  const deleteTodo = (id: string) => {
    // 達成順序からも削除
    setCompletionOrder((prev) => prev.filter((todoId) => todoId !== id))
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
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center text-amber-800">ToDoお女ん々</h1>
          <StorageResetButton />
        </div>
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
              e.stopPropagation()
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

          {/* 6つのタスクが完了した場合に表示するバッジ */}
          {sixTasksCompleted && (
            <div className="absolute top-3 right-3 bg-amber-600 text-white rounded-full px-2 py-1 text-xs font-bold">
              6タスク達成！
            </div>
          )}

          {/* 7つのタスクが完了した場合に表示するバッジ */}
          {sevenTasksCompleted && (
            <div className="absolute top-3 right-3 bg-amber-600 text-white rounded-full px-2 py-1 text-xs font-bold">
              7タスク達成！
            </div>
          )}
        </div>

        {/* YouTube動画モーダル */}
        {showYoutubeVideo && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full">
              <div className="p-4 flex justify-between items-center border-b">
                <h3 className="font-bold">
                  {sevenTasksCompleted
                    ? "おめでとう！7つのタスクを完了しました！"
                    : "おめでとう！6つのタスクを完了しました！"}
                </h3>
                <Button variant="ghost" size="icon" onClick={closeYoutubeVideo}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={currentYoutubeVideo}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">おめでとうございます！特別な動画をお楽しみください</p>
                <Button className="mt-2" onClick={closeYoutubeVideo}>
                  閉じる
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 進捗状況 */}
        {todos.length > 0 && (
          <div className="w-full mb-4">
            <div className="flex justify-between text-sm text-amber-800 mb-1">
              <span>達成率: {completionPercentage}%</span>
              <span>
                {completedCount}/{todos.length} 完了
                {isWeddingConditionMet && " 🎉"}
                {sixTasksCompleted && " 🏆"}
                {sevenTasksCompleted && " 🌟"}
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
