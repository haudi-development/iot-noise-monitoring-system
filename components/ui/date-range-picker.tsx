"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onDateChange: (start: Date, end: Date) => void
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [localStartDate, setLocalStartDate] = React.useState(startDate)
  const [localEndDate, setLocalEndDate] = React.useState(endDate)
  const [startTime, setStartTime] = React.useState(format(startDate, "HH:mm"))
  const [endTime, setEndTime] = React.useState(format(endDate, "HH:mm"))

  const formatDateRange = () => {
    return `${format(localStartDate, "MM/dd HH:mm", { locale: ja })} - ${format(localEndDate, "MM/dd HH:mm", { locale: ja })}`
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(time)
      }
    }
    return options
  }

  const handleApply = () => {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    const newStartDate = new Date(localStartDate)
    newStartDate.setHours(startHour, startMinute, 0, 0)
    
    const newEndDate = new Date(localEndDate)
    newEndDate.setHours(endHour, endMinute, 0, 0)
    
    onDateChange(newStartDate, newEndDate)
    setIsOpen(false)
  }

  const setQuickRange = (hours: number) => {
    const now = new Date()
    const start = new Date(now.getTime() - hours * 60 * 60 * 1000)
    setLocalStartDate(start)
    setLocalEndDate(now)
    setStartTime(format(start, "HH:mm"))
    setEndTime(format(now, "HH:mm"))
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="h-4 w-4" />
        {formatDateRange()}
      </Button>

      {isOpen && (
        <div className="absolute top-10 left-0 z-50 bg-white border rounded-lg shadow-xl p-4 w-[400px]">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">クイック選択</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuickRange(1)}
                >
                  過去1時間
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuickRange(6)}
                >
                  過去6時間
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuickRange(24)}
                >
                  過去24時間
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuickRange(168)}
                >
                  過去7日間
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">開始日時</label>
                <input
                  type="date"
                  value={format(localStartDate, "yyyy-MM-dd")}
                  onChange={(e) => setLocalStartDate(new Date(e.target.value))}
                  className="w-full px-3 py-1 border rounded-md text-sm"
                />
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-1 border rounded-md text-sm mt-2"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">終了日時</label>
                <input
                  type="date"
                  value={format(localEndDate, "yyyy-MM-dd")}
                  onChange={(e) => setLocalEndDate(new Date(e.target.value))}
                  className="w-full px-3 py-1 border rounded-md text-sm"
                />
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-1 border rounded-md text-sm mt-2"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                className="bg-alsok-blue hover:bg-blue-700"
                onClick={handleApply}
              >
                適用
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}