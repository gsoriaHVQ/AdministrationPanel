"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/styles"

interface TimeRangeSelectorProps {
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  startLabel?: string
  endLabel?: string
  className?: string
  required?: boolean
}

export function TimeRangeSelector({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  startLabel = "Hora inicio",
  endLabel = "Hora fin",
  className,
  required = false
}: TimeRangeSelectorProps) {
  return (
    <div className={cn("flex space-x-2", className)}>
      <div className="flex-1">
        <Label htmlFor="start-time">{startLabel}</Label>
        <Input
          id="start-time"
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          required={required}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="end-time">{endLabel}</Label>
        <Input
          id="end-time"
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          required={required}
        />
      </div>
    </div>
  )
} 