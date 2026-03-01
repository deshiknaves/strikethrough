import { describe, expect, it } from 'vitest'
import { Temporal } from 'temporal-polyfill'
import {
  getMondayOfWeek,
  getWeekDays,
  getWeekendDays,
  getColumnOrder,
  formatDate,
  formatWeekday,
  formatMonthYear,
  addWeeks,
} from './week-utils'

describe('week-utils', () => {
  describe('getMondayOfWeek', () => {
    it('returns same date when given Monday', () => {
      const monday = Temporal.PlainDate.from('2025-03-03')
      expect(getMondayOfWeek(monday).toString()).toBe('2025-03-03')
    })

    it('returns Monday when given Wednesday', () => {
      const wednesday = Temporal.PlainDate.from('2025-03-05')
      expect(getMondayOfWeek(wednesday).toString()).toBe('2025-03-03')
    })

    it('returns Monday when given Sunday', () => {
      const sunday = Temporal.PlainDate.from('2025-03-09')
      expect(getMondayOfWeek(sunday).toString()).toBe('2025-03-03')
    })
  })

  describe('getWeekDays', () => {
    it('returns Mon–Fri for a given Monday', () => {
      const monday = Temporal.PlainDate.from('2025-03-03')
      const days = getWeekDays(monday)
      expect(days).toHaveLength(5)
      expect(days.map((d) => d.toString())).toEqual([
        '2025-03-03',
        '2025-03-04',
        '2025-03-05',
        '2025-03-06',
        '2025-03-07',
      ])
    })
  })

  describe('getWeekendDays', () => {
    it('returns Sat–Sun for a given Monday', () => {
      const monday = Temporal.PlainDate.from('2025-03-03')
      const days = getWeekendDays(monday)
      expect(days).toHaveLength(2)
      expect(days.map((d) => d.toString())).toEqual(['2025-03-08', '2025-03-09'])
    })
  })

  describe('getColumnOrder', () => {
    it('returns weekdays then weekend date keys', () => {
      const monday = Temporal.PlainDate.from('2025-03-03')
      const order = getColumnOrder(monday)
      expect(order).toEqual([
        '2025-03-03',
        '2025-03-04',
        '2025-03-05',
        '2025-03-06',
        '2025-03-07',
        '2025-03-08',
        '2025-03-09',
      ])
    })
  })

  describe('formatDate', () => {
    it('returns day and short month', () => {
      const date = Temporal.PlainDate.from('2025-03-24')
      expect(formatDate(date)).toBe('Mar 24')
    })
  })

  describe('formatWeekday', () => {
    it('returns short weekday name', () => {
      const monday = Temporal.PlainDate.from('2025-03-03')
      expect(formatWeekday(monday)).toBe('Mon')
    })
  })

  describe('formatMonthYear', () => {
    it('returns long month and year', () => {
      const date = Temporal.PlainDate.from('2025-03-03')
      expect(formatMonthYear(date)).toBe('March 2025')
    })
  })

  describe('addWeeks', () => {
    it('adds positive weeks', () => {
      const monday = Temporal.PlainDate.from('2025-03-03')
      const next = addWeeks(monday, 1)
      expect(next.toString()).toBe('2025-03-10')
    })

    it('subtracts weeks with negative value', () => {
      const monday = Temporal.PlainDate.from('2025-03-03')
      const prev = addWeeks(monday, -1)
      expect(prev.toString()).toBe('2025-02-24')
    })
  })
})
