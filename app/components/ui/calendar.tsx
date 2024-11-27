import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import dayjs from 'dayjs'
import { cn } from "~/lib/utils"
import { buttonVariants } from "~/components/ui/button"

interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date?: Date) => void
}

function Calendar({ className, selected, onSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(dayjs(selected || new Date()))
  const weeks = React.useMemo(() => {
    const start = currentMonth.startOf('month').startOf('week')
    const end = currentMonth.endOf('month').endOf('week')
    const days = []
    let day = start
    while (day.isBefore(end)) {
      days.push(day)
      day = day.add(1, 'day')
    }
    return Array.from({ length: days.length / 7 }, (_, i) =>
      days.slice(i * 7, (i + 1) * 7)
    )
  }, [currentMonth])

  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-center pt-1 relative items-center">
        <button
          onClick={() => setCurrentMonth(m => m.subtract(1, 'month'))}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {currentMonth.format('MMMM YYYY')}
        </span>
        <button
          onClick={() => setCurrentMonth(m => m.add(1, 'month'))}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="w-full mt-4">
        <div className="flex">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div
              key={day}
              className="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] text-center"
            >
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex w-full mt-2">
            {week.map((day, dayIndex) => {
              const isSelected = selected && day.isSame(dayjs(selected), 'day')
              const isToday = day.isSame(dayjs(), 'day')
              const isCurrentMonth = day.isSame(currentMonth, 'month')
              
              return (
                <button
                  key={dayIndex}
                  onClick={() => onSelect?.(day.toDate())}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 p-0 font-normal",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isToday && "bg-accent text-accent-foreground",
                    !isCurrentMonth && "text-muted-foreground opacity-50"
                  )}
                >
                  {day.format('D')}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
export type { CalendarProps }
