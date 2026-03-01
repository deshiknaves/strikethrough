<script lang="ts">
  import { onMount } from 'svelte'
  import { Temporal } from 'temporal-polyfill'
  import DayColumn from '$lib/components/DayColumn.svelte'
  import { getKeyboardMoveState, updateTarget, exitMoveMode } from '$lib/keyboard-move-state.svelte'
  import { getTodos, moveTodo } from '$lib/todos.svelte'

  const today = Temporal.Now.plainDateISO()
  const monday = today.subtract({ days: today.dayOfWeek - 1 })
  const weekdays = Array.from({ length: 5 }, (_, i) => monday.add({ days: i }))
  const weekend = Array.from({ length: 2 }, (_, i) => monday.add({ days: 5 + i }))
  const columnOrder = $derived([
    ...weekdays.map((d) => d.toString()),
    ...weekend.map((d) => d.toString()),
  ])

  function date(d: Temporal.PlainDate) {
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short' })
  }

  function weekday(d: Temporal.PlainDate) {
    return d.toLocaleString('en-US', { weekday: 'short' })
  }

  const heading = today.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const WEEKEND_START = 5

  function getWeekendColForWeekday(colIndex: number): number {
    return colIndex === 1 || colIndex >= 3 ? WEEKEND_START + 1 : WEEKEND_START
  }

  function getWeekdayColForWeekend(colIndex: number): number {
    return colIndex === WEEKEND_START ? 0 : 4
  }

  onMount(() => {
    function handleKeydown(event: KeyboardEvent) {
      const mode = getKeyboardMoveState()
      const navKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'j',
        'k',
        'h',
        'l',
      ]

      if (mode) {
        const keys = [...navKeys, 'Enter', ' ', 'Escape']
        if (!keys.includes(event.key)) return

        event.preventDefault()
        event.stopPropagation()

        if (event.key === 'Escape') {
          exitMoveMode()
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          moveTodo(mode.fromDate, mode.targetDateKey, mode.todoId, mode.targetIndex)
          exitMoveMode()
          return
        }

        const vimKey =
          event.key === 'j'
            ? 'ArrowDown'
            : event.key === 'k'
              ? 'ArrowUp'
              : event.key === 'h'
                ? 'ArrowLeft'
                : event.key === 'l'
                  ? 'ArrowRight'
                  : event.key
        const colIndex = columnOrder.indexOf(mode.targetDateKey)
        const maxIndex = getTodos(mode.targetDateKey).length

        if (vimKey === 'ArrowUp') {
          updateTarget(mode.targetDateKey, Math.max(0, mode.targetIndex - 1))
        } else if (vimKey === 'ArrowDown') {
          updateTarget(mode.targetDateKey, Math.min(maxIndex, mode.targetIndex + 1))
        } else if (vimKey === 'ArrowLeft' && colIndex > 0) {
          const prevCol = columnOrder[colIndex - 1]
          const prevMax = getTodos(prevCol).length
          updateTarget(prevCol, Math.min(mode.targetIndex, prevMax))
        } else if (vimKey === 'ArrowRight' && colIndex < columnOrder.length - 1) {
          const nextCol = columnOrder[colIndex + 1]
          const nextMax = getTodos(nextCol).length
          updateTarget(nextCol, Math.min(mode.targetIndex, nextMax))
        }
        return
      }

      const vimKey =
        event.key === 'j'
          ? 'ArrowDown'
          : event.key === 'k'
            ? 'ArrowUp'
            : event.key === 'h'
              ? 'ArrowLeft'
              : event.key === 'l'
                ? 'ArrowRight'
                : event.key

      if (!navKeys.includes(event.key)) return

      const active = document.activeElement as HTMLElement | null
      if (!active) return

      if (active.tagName === 'INPUT') {
        const newInputWrapper = active.closest<HTMLElement>('[data-todo-index="new"]')
        if (newInputWrapper) {
          const dateKey = newInputWrapper.getAttribute('data-date-key')
          if (dateKey) {
            const colIndex = columnOrder.indexOf(dateKey)
            const todos = getTodos(dateKey)
            if (event.key === 'ArrowUp') {
              if (todos.length > 0) {
                event.preventDefault()
                event.stopPropagation()
                const target = document.querySelector<HTMLElement>(
                  `[data-date-key="${dateKey}"][data-todo-index="${todos.length - 1}"]`
                )
                target?.focus()
              } else if (colIndex >= WEEKEND_START) {
                const weekdayCol = getWeekdayColForWeekend(colIndex)
                const weekdayKey = columnOrder[weekdayCol]
                event.preventDefault()
                event.stopPropagation()
                const newInput = document.querySelector<HTMLInputElement>(
                  `[data-date-key="${weekdayKey}"][data-todo-index="new"] input`
                )
                newInput?.focus()
              }
            } else if (event.key === 'ArrowDown' && colIndex < WEEKEND_START) {
              const weekendCol = getWeekendColForWeekday(colIndex)
              const weekendKey = columnOrder[weekendCol]
              event.preventDefault()
              event.stopPropagation()
              const newInput = document.querySelector<HTMLInputElement>(
                `[data-date-key="${weekendKey}"][data-todo-index="new"] input`
              )
              newInput?.focus()
            }
          }
        }
        return
      }

      const dateKey = active.getAttribute('data-date-key')
      const indexAttr = active.getAttribute('data-todo-index')
      if (!dateKey || indexAttr === null || indexAttr === 'new') return

      const index = parseInt(indexAttr, 10)
      if (Number.isNaN(index)) return

      event.preventDefault()
      event.stopPropagation()

      const colIndex = columnOrder.indexOf(dateKey)
      const todos = getTodos(dateKey)

      if (vimKey === 'ArrowUp') {
        if (index > 0) {
          const target = document.querySelector<HTMLElement>(
            `[data-date-key="${dateKey}"][data-todo-index="${index - 1}"]`
          )
          target?.focus()
        } else if (colIndex >= WEEKEND_START) {
          const weekdayCol = getWeekdayColForWeekend(colIndex)
          const weekdayKey = columnOrder[weekdayCol]
          const weekdayTodos = getTodos(weekdayKey)
          if (weekdayTodos.length > 0) {
            const target = document.querySelector<HTMLElement>(
              `[data-date-key="${weekdayKey}"][data-todo-index="${weekdayTodos.length - 1}"]`
            )
            target?.focus()
          } else {
            const newInput = document.querySelector<HTMLInputElement>(
              `[data-date-key="${weekdayKey}"][data-todo-index="new"] input`
            )
            newInput?.focus()
          }
        }
      } else if (vimKey === 'ArrowDown') {
        if (index + 1 < todos.length) {
          const target = document.querySelector<HTMLElement>(
            `[data-date-key="${dateKey}"][data-todo-index="${index + 1}"]`
          )
          target?.focus()
        } else if (colIndex < WEEKEND_START) {
          const weekendCol = getWeekendColForWeekday(colIndex)
          const weekendKey = columnOrder[weekendCol]
          const weekendTodos = getTodos(weekendKey)
          if (weekendTodos.length > 0) {
            const target = document.querySelector<HTMLElement>(
              `[data-date-key="${weekendKey}"][data-todo-index="0"]`
            )
            target?.focus()
          } else {
            const newInput = document.querySelector<HTMLInputElement>(
              `[data-date-key="${weekendKey}"][data-todo-index="new"] input`
            )
            newInput?.focus()
          }
        } else {
          const newInput = document.querySelector<HTMLInputElement>(
            `[data-date-key="${dateKey}"][data-todo-index="new"] input`
          )
          newInput?.focus()
        }
      } else if (vimKey === 'ArrowLeft' && colIndex > 0) {
        const prevCol = columnOrder[colIndex - 1]
        const prevTodos = getTodos(prevCol)
        if (prevTodos.length > 0) {
          const targetIndex =
            index < prevTodos.length ? index : prevTodos.length - 1
          const target = document.querySelector<HTMLElement>(
            `[data-date-key="${prevCol}"][data-todo-index="${targetIndex}"]`
          )
          target?.focus()
        }
      } else if (vimKey === 'ArrowRight' && colIndex < columnOrder.length - 1) {
        const nextCol = columnOrder[colIndex + 1]
        const nextTodos = getTodos(nextCol)
        if (nextTodos.length > 0) {
          const targetIndex =
            index < nextTodos.length ? index : nextTodos.length - 1
          const target = document.querySelector<HTMLElement>(
            `[data-date-key="${nextCol}"][data-todo-index="${targetIndex}"]`
          )
          target?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeydown, true)

    return () => document.removeEventListener('keydown', handleKeydown, true)
  })
</script>

<div class="flex flex-col overflow-y-auto p-4 min-[501px]:h-dvh min-[501px]:overflow-hidden">
  <h1 class="mb-3 text-2xl font-bold text-text-primary">{heading}</h1>
  <div class="flex min-h-0 flex-1 gap-3">
    {#each weekdays as day (day.toString())}
      <DayColumn
        dateKey={day.toString()}
        label={date(day)}
        sublabel={weekday(day)}
        {columnOrder}
        class="min-h-50 flex-1 min-[501px]:min-h-0"
      />
    {/each}
  </div>
  <div class="mt-3 flex min-h-38 gap-3 min-[501px]:h-[35%] min-[501px]:min-h-0">
    {#each weekend as day (day.toString())}
      <DayColumn
        dateKey={day.toString()}
        label={date(day)}
        sublabel={weekday(day)}
        {columnOrder}
        class="w-1/2"
      />
    {/each}
  </div>
</div>
