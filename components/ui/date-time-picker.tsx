import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"

import { cn } from "@/lib/utils"

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
]
const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]

// Studio hours: Mon–Sat, 10:00–19:00 (last slot 18:30)
const TIME_SLOTS = (() => {
  const slots: string[] = []
  for (let h = 10; h < 19; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }
  return slots
})()

function startOfDay(d: Date) {
  const n = new Date(d)
  n.setHours(0, 0, 0, 0)
  return n
}

function sameDay(a: Date | null, b: Date | null) {
  return (
    !!a && !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Monday-first weekday index (0 = Monday … 6 = Sunday)
function mondayIndex(d: Date) {
  return (d.getDay() + 6) % 7
}

function formatValue(d: Date) {
  const day = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`
}

export interface DateTimePickerProps {
  value: Date | null
  onChange: (value: Date | null) => void
  placeholder?: string
  className?: string
  /** Earliest selectable day. Defaults to today. */
  minDate?: Date
  /** Field name for the hidden input carrying an ISO value (for native form submits). */
  name?: string
  /** "HH:MM" slots already booked for the selected day — rendered disabled. */
  bookedTimes?: string[]
  /** Fired when the user picks a calendar day, so the parent can fetch availability. */
  onSelectedDayChange?: (day: Date) => void
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  className,
  minDate,
  name,
  bookedTimes = [],
  onSelectedDayChange,
}: DateTimePickerProps) {
  const min = startOfDay(minDate ?? new Date())
  const [open, setOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState<Date>(() => {
    const base = value ?? min
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const selectedTime = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : null

  const commit = (day: Date, time: string | null) => {
    const [h, m] = (time ?? "10:00").split(":").map(Number)
    const next = startOfDay(day)
    next.setHours(h, m, 0, 0)
    onChange(next)
  }

  const handleDayClick = (day: Date) => {
    onSelectedDayChange?.(day)
    commit(day, selectedTime)
  }

  const handleTimeClick = (time: string) => {
    const day = value ?? min
    commit(day, time)
  }

  const selectedBooked = !!selectedTime && bookedTimes.includes(selectedTime)

  // Build the calendar grid for the current view month.
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const leadingBlanks = mondayIndex(firstOfMonth)
  const cells: (Date | null)[] = []
  for (let i = 0; i < leadingBlanks; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))
  }

  const canGoPrev =
    viewMonth.getFullYear() > min.getFullYear() ||
    (viewMonth.getFullYear() === min.getFullYear() && viewMonth.getMonth() > min.getMonth())

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        render={
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 bg-transparent text-left text-lg font-heading italic outline-none transition-colors",
              value ? "text-foreground" : "text-muted-foreground",
              className
            )}
          >
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate not-italic tracking-wide">
              {value ? formatValue(value) : placeholder}
            </span>
          </button>
        }
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={value ? value.toISOString() : ""}
        />
      )}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={8} align="start" className="z-[10050]">
          <PopoverPrimitive.Popup
            className={cn(
              "w-[320px] bg-[#0b0b0b] border border-white/10 shadow-2xl outline-none",
              "transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
            )}
          >
            {/* Calendar */}
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={() =>
                    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
                  }
                  className="text-muted-foreground hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs uppercase tracking-[0.3em]">
                  {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
                  }
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    className="text-center text-[9px] uppercase tracking-widest text-muted-foreground/60 py-1"
                  >
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={`b-${i}`} />
                  const isSunday = day.getDay() === 0
                  const disabled = startOfDay(day) < min || isSunday
                  const selected = sameDay(day, value)
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "aspect-square flex items-center justify-center text-xs font-heading transition-colors",
                        disabled && "text-muted-foreground/25 cursor-not-allowed",
                        !disabled && !selected && "text-foreground hover:bg-primary/20",
                        selected && "bg-primary text-background"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-3 w-3 text-primary" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Preferred Time · Mon–Sat 10:00–19:00
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 max-h-[132px] overflow-y-auto pr-1">
                {TIME_SLOTS.map((t) => {
                  const active = t === selectedTime
                  const booked = bookedTimes.includes(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={booked}
                      title={booked ? "Already booked" : undefined}
                      onClick={() => handleTimeClick(t)}
                      className={cn(
                        "py-2 text-[10px] tracking-widest transition-colors border border-white/5",
                        booked && "text-muted-foreground/30 line-through cursor-not-allowed bg-white/[0.02]",
                        !booked && active && "bg-primary text-background border-primary",
                        !booked && !active && "text-muted-foreground hover:text-foreground hover:border-white/20"
                      )}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-5 w-full py-3 bg-primary text-background hover:bg-white transition-colors uppercase tracking-[0.4em] text-[10px] font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!value || selectedBooked}
              >
                {selectedBooked ? "Slot Taken" : value ? "Confirm" : "Select Date & Time"}
              </button>
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
