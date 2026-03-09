type KeyLabel = string
type KeyCombo = KeyLabel[]

type ShortcutItem = {
  id: string
  keys: KeyCombo[]
  description: string
  aria?: string
}

type ShortcutSection = {
  section: string
  items: ShortcutItem[]
}

export const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    section: 'General',
    items: [
      { id: 'show-shortcuts', keys: [['?']], description: 'Show keyboard shortcuts' },
      { id: 'new-todo', keys: [['n']], description: 'New todo (opens modal)' },
    ],
  },
  {
    section: 'Week navigation',
    items: [
      { id: 'next-week', keys: [['Shift', 'N'], ['Ctrl', 'N']], description: 'Next week' },
      { id: 'previous-week', keys: [['Shift', 'P'], ['Ctrl', 'P']], description: 'Previous week' },
    ],
  },
  {
    section: 'View',
    items: [
      { id: 'view-week', keys: [['Shift', 'W']], description: 'Switch to week view' },
      { id: 'view-day', keys: [['Shift', 'D']], description: 'Switch to day view' },
    ],
  },
  {
    section: 'Todo item',
    items: [
      { id: 'todo-move', keys: [['m']], description: 'Move todo' },
      { id: 'todo-details-d', keys: [['d']], description: 'Open todo details' },
      { id: 'todo-details-cmd', keys: [['Cmd', 'Enter'], ['Ctrl', 'Enter']], description: 'Open todo details' },
      { id: 'todo-edit', keys: [['e']], description: 'Edit todo' },
      { id: 'todo-toggle', keys: [['Space']], description: 'Toggle complete' },
      { id: 'todo-delete', keys: [['x'], ['Delete']], description: 'Delete todo' },
      {
        id: 'todo-item-element',
        keys: [],
        description: '',
        aria: 'm d e Space x Delete ArrowUp ArrowDown ArrowLeft ArrowRight j k h l',
      },
    ],
  },
  {
    section: 'Todo details modal',
    items: [
      { id: 'modal-save', keys: [['Cmd', 'Enter'], ['Ctrl', 'Enter']], description: 'Save and close' },
      { id: 'modal-close', keys: [['Escape']], description: 'Close without saving' },
    ],
  },
  {
    section: 'Keyboard move mode',
    items: [
      { id: 'move-place', keys: [['Enter'], ['Space']], description: 'Place todo' },
      { id: 'move-cancel', keys: [['Escape']], description: 'Cancel move' },
    ],
  },
  {
    section: 'Navigation',
    items: [
      { id: 'nav-arrows', keys: [['↑', '↓', '←', '→']], description: 'Move focus' },
      { id: 'nav-vim', keys: [['j', 'k', 'h', 'l']], description: 'Vim-style navigation' },
    ],
  },
]

const SHORTCUT_MAP = new Map(
  SHORTCUT_SECTIONS.flatMap((s) => s.items).map((item) => [item.id, item])
)

function deriveAria(keys: KeyCombo[]): string {
  return keys.map((combo) => combo.join('+')).join(' ')
}

export function getAriaShortcuts(id: string): string {
  const item = SHORTCUT_MAP.get(id)
  if (!item) return ''
  return item.aria ?? deriveAria(item.keys)
}

export function getDisplaySections(): ShortcutSection[] {
  return SHORTCUT_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((item) => item.description !== ''),
  })).filter((s) => s.items.length > 0)
}
