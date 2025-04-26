"use client"

import { useState, useEffect } from "react"

// ローカルストレージから値を取得する関数
function getStorageValue<T>(key: string, defaultValue: T): T {
  // クライアントサイドでのみ実行
  if (typeof window === "undefined") {
    return defaultValue
  }

  try {
    // ローカルストレージから値を取得
    const saved = localStorage.getItem(key)

    // 保存された値がある場合はパースして返す
    if (saved !== null) {
      return JSON.parse(saved) as T
    }

    // 保存された値がない場合はデフォルト値を返す
    return defaultValue
  } catch (error) {
    // エラーが発生した場合はデフォルト値を返す
    console.error("ローカルストレージからの読み込みに失敗しました:", error)
    return defaultValue
  }
}

// ローカルストレージを使用するカスタムフック
export function useLocalStorage<T>(key: string, defaultValue: T) {
  // 初期値を設定
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue)
  })

  // 値が変更されたらローカルストレージを更新
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error("ローカルストレージへの保存に失敗しました:", error)
      }
    }
  }, [key, value])

  return [value, setValue] as const
}
