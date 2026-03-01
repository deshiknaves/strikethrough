<script lang="ts">
  import { tick } from 'svelte'
  import Modal from '$lib/components/Modal.svelte'
  import { DatePicker, type DateValue, parseDate, Portal } from '@skeletonlabs/skeleton-svelte'
  import type { Todo } from '$lib/todos.svelte'

  let {
    open = false,
    onClose,
    todo,
    fromDate,
    onSave,
    returnFocusTo = null,
  }: {
    open?: boolean
    onClose: () => void
    todo: Todo
    fromDate: string
    onSave: (updates: { text: string; description: string; date: string }) => void
    returnFocusTo?: HTMLElement | null
  } = $props()

  let textValue = $state('')
  let descriptionValue = $state('')
  let dateValue = $state<DateValue[]>([])
  let titleInputRef = $state<HTMLInputElement | null>(null)

  $effect(() => {
    if (open) {
      textValue = todo.text
      descriptionValue = todo.description ?? ''
      dateValue = [parseDate(todo.date)]
      tick().then(() => titleInputRef?.focus())
    }
  })

  function formatDateForInput(date: { year: number; month: number; day: number }): string {
    const y = date.year
    const m = String(date.month).padStart(2, '0')
    const d = String(date.day).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  function parseDateFromInput(value: string, _details?: { locale: string }): DateValue | undefined {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return undefined
    const [, , m, d] = match
    const month = parseInt(m!, 10)
    const day = parseInt(d!, 10)
    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined
    return parseDate(value)
  }

  function handleSave() {
    const trimmedText = textValue.trim()
    if (!trimmedText) return
    const dateStr = dateValue[0] ? formatDateForInput(dateValue[0]) : todo.date
    onSave({
      text: trimmedText,
      description: descriptionValue,
      date: dateStr,
    })
    onClose()
    requestAnimationFrame(() => returnFocusTo?.focus())
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  function handleClose() {
    onClose()
    requestAnimationFrame(() => returnFocusTo?.focus())
  }
</script>

<Modal {open} onClose={handleClose} variant="large" ariaTitle="Todo details" {returnFocusTo}>
  <div class="space-y-4" onkeydown={handleKeydown} role="presentation">
    <div>
      <label for="todo-details-title" class="mb-1 block text-sm font-medium text-text-secondary">
        Title
      </label>
      <input
        id="todo-details-title"
        bind:this={titleInputRef}
        bind:value={textValue}
        type="text"
        class="w-full rounded border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus:outline-none"
        placeholder="Todo title"
      />
    </div>
    <div>
      <label
        for="todo-details-description"
        class="mb-1 block text-sm font-medium text-text-secondary"
      >
        Description
      </label>
      <textarea
        id="todo-details-description"
        bind:value={descriptionValue}
        rows="4"
        class="w-full rounded border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus:outline-none"
        placeholder="Add details..."
      ></textarea>
    </div>
    <div>
      <label for="todo-details-date" class="mb-1 block text-sm font-medium text-text-secondary">
        Date
      </label>
      <DatePicker
        value={dateValue}
        onValueChange={(e) => (dateValue = e.value)}
        format={(date) => formatDateForInput(date)}
        parse={(value) => parseDateFromInput(value)}
        placeholder="yyyy-mm-dd"
      >
        <DatePicker.Control>
          <DatePicker.Input id="todo-details-date" placeholder="yyyy-mm-dd" />
          <DatePicker.Trigger />
        </DatePicker.Control>
        <Portal>
          <DatePicker.Positioner>
            <DatePicker.Content>
              <DatePicker.View view="day">
                <DatePicker.Context>
                  {#snippet children(datePicker)}
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger />
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger />
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {#each datePicker().weekDays as weekDay, id (id)}
                            <DatePicker.TableHeader>{weekDay.short}</DatePicker.TableHeader>
                          {/each}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {#each datePicker().weeks as week, id (id)}
                          <DatePicker.TableRow>
                            {#each week as day, id (id)}
                              <DatePicker.TableCell value={day}>
                                <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            {/each}
                          </DatePicker.TableRow>
                        {/each}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  {/snippet}
                </DatePicker.Context>
              </DatePicker.View>
              <DatePicker.View view="month">
                <DatePicker.Context>
                  {#snippet children(datePicker)}
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger />
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger />
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableBody>
                        {#each datePicker().getMonthsGrid( { columns: 4, format: 'short' } ) as months, id (id)}
                          <DatePicker.TableRow>
                            {#each months as month, id (id)}
                              <DatePicker.TableCell value={month.value}>
                                <DatePicker.TableCellTrigger
                                  >{month.label}</DatePicker.TableCellTrigger
                                >
                              </DatePicker.TableCell>
                            {/each}
                          </DatePicker.TableRow>
                        {/each}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  {/snippet}
                </DatePicker.Context>
              </DatePicker.View>
              <DatePicker.View view="year">
                <DatePicker.Context>
                  {#snippet children(datePicker)}
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger />
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger />
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableBody>
                        {#each datePicker().getYearsGrid({ columns: 4 }) as years, id (id)}
                          <DatePicker.TableRow>
                            {#each years as year, id (id)}
                              <DatePicker.TableCell value={year.value}>
                                <DatePicker.TableCellTrigger
                                  >{year.label}</DatePicker.TableCellTrigger
                                >
                              </DatePicker.TableCell>
                            {/each}
                          </DatePicker.TableRow>
                        {/each}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  {/snippet}
                </DatePicker.Context>
              </DatePicker.View>
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker>
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onclick={handleClose}
        class="rounded px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
      >
        Cancel
      </button>
      <button
        type="button"
        onclick={handleSave}
        class="rounded bg-accent-blue px-3 py-1.5 text-sm text-white hover:opacity-90"
      >
        Save
      </button>
    </div>
    <p class="text-xs text-text-muted">Cmd+Enter to save, Escape to close without saving</p>
  </div>
</Modal>
