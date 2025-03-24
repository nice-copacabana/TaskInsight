"use client"

import React from "react"

import { useEffect, useState } from "react"
import { cn } from "../lib/utils"
import { Progress } from "./ui/progress"

interface SegmentedProgressProps {
  progress: number
  estimatedTime: number
  elapsedTime: number
  isActive: boolean
  className?: string
  onChange?: (value: number) => void
  disabled?: boolean
}

export function SegmentedProgress({
  progress,
  estimatedTime,
  elapsedTime,
  isActive,
  className,
  onChange,
  disabled = false,
}: SegmentedProgressProps) {
  const [segments, setSegments] = useState<number[]>([])
  const [segmentCount, setSegmentCount] = useState(50)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [timeRatio, setTimeRatio] = useState(1)

  // Calculate number of segments based on estimated time
  useEffect(() => {
    // More segments for longer tasks, fewer for shorter tasks
    const baseCount = 50
    const newCount = Math.max(30, Math.min(100, Math.floor(baseCount * (estimatedTime / 3600000))))
    setSegmentCount(newCount)

    // Calculate time ratio (elapsed/estimated)
    const ratio = estimatedTime > 0 ? elapsedTime / estimatedTime : 0
    setTimeRatio(ratio > 2 ? 2 : ratio) // Cap at 200%
  }, [estimatedTime, elapsedTime])

  // Generate segments
  useEffect(() => {
    const newSegments = []
    const activeSegments = Math.floor((progress / 100) * segmentCount)

    for (let i = 0; i < segmentCount; i++) {
      // Determine if this segment is "critical" (time ratio > 1 means we're over estimated time)
      const isCritical = timeRatio > 1 && i >= Math.floor(segmentCount / timeRatio) && i < activeSegments
      newSegments.push(i < activeSegments ? (isCritical ? 2 : 1) : 0)
    }

    setSegments(newSegments)
  }, [progress, segmentCount, timeRatio])

  // Handle click on segment
  const handleSegmentClick = (index: number) => {
    if (disabled) return
    const newProgress = Math.round(((index + 1) / segmentCount) * 100)
    onChange?.(newProgress)
  }

  // Handle slider interaction
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    onChange?.(Number.parseInt(e.target.value))
  }

  // Pulse animation for active tasks
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setPulse((prev) => !prev)
    }, 1500)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className={cn("relative w-full", className)}>
      {/* Hidden range input for accessibility */}
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={handleSliderChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
        disabled={disabled}
      />

      {/* Visual segments */}
      <div
        className={cn(
          "flex items-center w-full gap-[1px] h-3 transition-all duration-500",
          isAdjusting ? "scale-y-125" : "",
          disabled ? "opacity-80" : "",
        )}
        onMouseEnter={() => !disabled && setIsAdjusting(true)}
        onMouseLeave={() => setIsAdjusting(false)}
      >
        {segments.map((state, index) => (
          <div
            key={index}
            className={cn(
              "h-full rounded-full transition-all duration-300 cursor-pointer flex-grow",
              state === 0 ? "bg-slate-300/50 dark:bg-slate-600" : "",
              state === 1 ? "bg-emerald-500" : "",
              state === 2 ? "bg-amber-500" : "",
              isActive && state > 0 && pulse ? "opacity-90" : "opacity-100",
              isAdjusting ? "h-full" : "h-[80%]",
            )}
            style={{
              transform: isAdjusting ? `scaleY(${1 + (index / segments.length) * 0.5})` : undefined,
              minWidth: "2px",
              maxWidth: "4px",
            }}
            onClick={() => handleSegmentClick(index)}
          />
        ))}
      </div>

      {/* Time indicator */}
      {timeRatio > 1 && (
        <div className="absolute top-0 h-full pointer-events-none" style={{ left: `${100 / timeRatio}%` }}>
          <div className="absolute top-[-4px] h-[calc(100%+8px)] border-l border-amber-500/70 border-dashed" />
        </div>
      )}
    </div>
  )
}

