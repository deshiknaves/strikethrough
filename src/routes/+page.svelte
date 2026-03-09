<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { Temporal } from 'temporal-polyfill'
  import TodoDetailsModal from '$lib/components/TodoDetailsModal.svelte'
  import ViewPicker, {
    type ViewMode as VM,
    VIEW_MODE_STORAGE_KEY,
  } from '$lib/components/ViewPicker.svelte'
  import WeekView from '$lib/components/WeekView.svelte'
  import DayView from '$lib/components/DayView.svelte'
  import { createBoardKeyboardHandler } from '$lib/board-keyboard-navigation'
  import { getKeyboardMoveState, updateTarget, exitMoveMode } from '$lib/keyboard-move-state.svelte'
  import { getTodos, moveTodo, loadWeek, addTodo } from '$lib/todos.svelte'
  import {
    getMondayOfWeek,
    getColumnOrder,
    formatDate,
    formatMonthYear,
    formatWeekOf,
    addWeeks,
  } from '$lib/week-utils'
  import Logo from '$lib/components/logo.svelte'
  import IconButton from '$lib/components/IconButton.svelte'
  import HelpButton from '$lib/components/HelpButton.svelte'
  import { getAriaShortcuts } from '$lib/keyboard-shortcuts'

  type ViewMode = VM

  const today = Temporal.Now.plainDateISO()
  let viewMonday = $state(getMondayOfWeek(today))
  let viewDate = $state(today)
  const storedView = browser ? localStorage.getItem(VIEW_MODE_STORAGE_KEY) : null
  let viewMode = $state<ViewMode>(storedView === 'day' ? 'day' : 'week')
  let isWide = $state(browser ? window.innerWidth > 500 : true)
  let newTodoModalOpen = $state(false)
  let dayColumnOrder = $state<string[]>([])

  const columnOrder = $derived(getColumnOrder(viewMonday))

  const heading = $derived(
    viewMode === 'week'
      ? formatMonthYear(viewMonday)
      : isWide
        ? `${formatDate(viewDate)} – ${formatDate(viewDate.add({ days: 1 }))}`
        : formatDate(viewDate)
  )
  const pageTitle = $derived(
    viewMode === 'week'
      ? `Strikethrough · ${formatWeekOf(viewMonday)}`
      : `Strikethrough · ${heading}`
  )

  function handleNewTodo(updates: { text: string; description: string; date: string }) {
    addTodo(updates.date, updates.text, updates.description)
    const todoDate = Temporal.PlainDate.from(updates.date)
    const todoMonday = getMondayOfWeek(todoDate)
    if (todoMonday.toString() !== viewMonday.toString()) {
      loadWeek(todoMonday, {
        getIsCurrentView: () => viewMonday.toString() === todoMonday.toString(),
      })
      viewMonday = todoMonday
    }
  }

  onMount(() => {
    const mq = window.matchMedia('(min-width: 501px)')
    isWide = mq.matches
    mq.addEventListener('change', (e) => (isWide = e.matches))

    const handleKeydown = createBoardKeyboardHandler({
      getColumnOrder: () => (viewMode === 'week' ? columnOrder : dayColumnOrder),
      getTodos,
      moveTodo,
      getKeyboardMoveState,
      updateTarget,
      exitMoveMode,
      onNextWeek: () => {
        if (viewMode === 'week') viewMonday = addWeeks(viewMonday, 1)
        else viewDate = viewDate.add({ days: 1 })
      },
      onPreviousWeek: () => {
        if (viewMode === 'week') viewMonday = addWeeks(viewMonday, -1)
        else viewDate = viewDate.subtract({ days: 1 })
      },
      getInitialFocusDateKey: () =>
        viewMode === 'week'
          ? columnOrder.includes(today.toString())
            ? today.toString()
            : columnOrder[0]
          : viewDate.toString(),
      onNewTodo: () => (newTodoModalOpen = true),
      onWeekView: () => (viewMode = 'week'),
      onDayView: () => {
        viewMode = 'day'
        viewDate = today
      },
    })

    document.addEventListener('keydown', handleKeydown, true)

    return () => {
      document.removeEventListener('keydown', handleKeydown, true)
      mq.removeEventListener('change', (e) => (isWide = e.matches))
    }
  })
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div
  class="flex h-dvh min-h-dvh flex-col overflow-hidden p-4 max-[500px]:min-w-[1024px] [@media(max-height:500px)]:min-h-[1024px]"
>
  <header class="mb-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <h1 class="flex items-center gap-2 text-2xl font-bold text-text-primary">
        <Logo class="size-5" />{heading}
      </h1>
      <ViewPicker
        value={viewMode}
        onchange={(v) => {
          viewMode = v
          if (v === 'day') viewDate = today
        }}
      />
    </div>
    <nav class="flex gap-1" aria-label="Week navigation">
      <IconButton
        aria-label={viewMode === 'week' ? 'Previous week' : 'Previous day'}
        aria-keyshortcuts={getAriaShortcuts('previous-week')}
        onclick={() => {
          if (viewMode === 'week') viewMonday = addWeeks(viewMonday, -1)
          else viewDate = viewDate.subtract({ days: 1 })
        }}
      >
        <svg class="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="15,4 15,20 5,12" />
        </svg>
      </IconButton>
      <IconButton
        aria-label={viewMode === 'week' ? 'Next week' : 'Next day'}
        aria-keyshortcuts={getAriaShortcuts('next-week')}
        onclick={() => {
          if (viewMode === 'week') viewMonday = addWeeks(viewMonday, 1)
          else viewDate = viewDate.add({ days: 1 })
        }}
      >
        <svg class="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="9,4 9,20 19,12" />
        </svg>
      </IconButton>
    </nav>
  </header>

  {#if viewMode === 'week'}
    <WeekView {viewMonday} {today} {columnOrder} />
  {:else}
    <DayView {viewDate} {today} {isWide} bind:columnOrder={dayColumnOrder} />
  {/if}

  <TodoDetailsModal
    open={newTodoModalOpen}
    onClose={() => (newTodoModalOpen = false)}
    defaultDate={today.toString()}
    onSave={handleNewTodo}
  />
  <HelpButton {viewMode} />
</div>
