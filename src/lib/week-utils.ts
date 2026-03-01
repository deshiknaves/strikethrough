import type { Temporal } from 'temporal-polyfill'

export function getMondayOfWeek(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.subtract({ days: date.dayOfWeek - 1 })
}

export function getWeekDays(monday: Temporal.PlainDate): Temporal.PlainDate[] {
  return Array.from({ length: 5 }, (_, i) => monday.add({ days: i }))
}

export function getWeekendDays(monday: Temporal.PlainDate): Temporal.PlainDate[] {
  return Array.from({ length: 2 }, (_, i) => monday.add({ days: 5 + i }))
}

export function getColumnOrder(monday: Temporal.PlainDate): string[] {
  const weekdays = getWeekDays(monday)
  const weekend = getWeekendDays(monday)
  return [...weekdays.map((d) => d.toString()), ...weekend.map((d) => d.toString())]
}

export function formatDate(date: Temporal.PlainDate): string {
  return date.toLocaleString('en-US', { day: 'numeric', month: 'short' })
}

export function formatWeekday(date: Temporal.PlainDate): string {
  return date.toLocaleString('en-US', { weekday: 'short' })
}

export function formatMonthYear(date: Temporal.PlainDate): string {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export function addWeeks(date: Temporal.PlainDate, weeks: number): Temporal.PlainDate {
  return date.add({ weeks })
}
