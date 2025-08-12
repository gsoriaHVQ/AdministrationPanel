"use client"

import { cn } from "@/styles"

interface WeekDayItem { label: string; index: number }

interface WeekDaySelectorProps {
  selectedDays: number[]
  onDayToggle: (dayIndex: number) => void
  className?: string
  items?: WeekDayItem[]
}

const DEFAULT_DAYS: WeekDayItem[] = [
  { label: "Lun", index: 0 },
  { label: "Mar", index: 1 },
  { label: "Mié", index: 2 },
  { label: "Jue", index: 3 },
  { label: "Vie", index: 4 },
  { label: "Sáb", index: 5 },
  { label: "Dom", index: 6 }
]

export function WeekDaySelector({ selectedDays, onDayToggle, className, items }: WeekDaySelectorProps) {
  const days = (items && items.length > 0 ? items : DEFAULT_DAYS)

  return (
    <div className={cn("grid grid-cols-7 gap-2", className)}>
      {days.map(({ label, index }) => (
        <label key={`${label}-${index}`} className="cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={selectedDays.includes(index)}
            onChange={() => onDayToggle(index)}
          />
          <div
            className={cn(
              "border-2 rounded-lg p-3 text-center transition-all duration-200",
              selectedDays.includes(index)
                ? "border-[#8B1538] bg-[#8B1538] text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            )}
          >
            <span className="text-sm font-medium">{label}</span>
          </div>
        </label>
      ))}
    </div>
  )
} 