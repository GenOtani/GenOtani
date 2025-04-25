"use client"

import { Progress } from "@/components/ui/progress"

interface TodoStatsProps {
  completed: number
  total: number
}

export default function TodoStats({ completed, total }: TodoStatsProps) {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="w-full space-y-2 mb-4">
      <div className="flex justify-between text-sm text-amber-800">
        <span>達成率: {completionRate}%</span>
        <span>
          {completed}/{total} 完了
        </span>
      </div>
      <Progress value={completionRate} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
    </div>
  )
}
