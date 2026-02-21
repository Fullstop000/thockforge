import { LayoutStandard, LayoutType, LayoutVariant } from '@/types/keyboard'

export interface KeyDefinition {
  id: string
  label: string
  subLabel?: string
  width: number
  depth: number
  row: number
  col: number
  color?: 'default' | 'modifier' | 'accent' | 'dark'
}

export interface LayoutDefinition {
  name: string
  width: number
  depth: number
  keys: KeyDefinition[]
}

const LAYOUTS: Record<LayoutType, LayoutDefinition> = {
  '40': {
    name: '40%',
    width: 12,
    depth: 5,
    keys: generate40Layout()
  },
  '60': {
    name: '60%',
    width: 15,
    depth: 5,
    keys: generate60Layout()
  },
  '65': {
    name: '65%',
    width: 16,
    depth: 5,
    keys: generate65Layout()
  },
  '75': {
    name: '75%',
    width: 17,
    depth: 6,
    keys: generate75Layout()
  },
  '80': {
    name: 'TKL (80%)',
    width: 18,
    depth: 6,
    keys: generateTKLLayout()
  },
  '980': {
    name: '1800 (980)',
    width: 22,
    depth: 6,
    keys: generate980Layout()
  },
  '100': {
    name: 'Full Size (100%)',
    width: 22,
    depth: 6,
    keys: generate100Layout()
  },
  'alice': {
    name: 'Alice',
    width: 16,
    depth: 5,
    keys: generateAliceLayout()
  }
}

function generate40Layout(): KeyDefinition[] {
  const keys: KeyDefinition[] = []
  
  keys.push({ id: 'esc', label: 'Esc', width: 1, depth: 1, row: 0, col: 0, color: 'dark' })
  
  const row1 = 'QWERTYUIOP'.split('')
  row1.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 1, col: i })
  })
  
  const row2 = 'ASDFGHJKL'.split('')
  row2.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 2, col: i })
  })
  
  const row3 = 'ZXCVBNM'.split('')
  row3.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 3, col: i })
  })
  
  keys.push({ id: 'lctrl', label: 'Ctrl', width: 1.25, depth: 1, row: 4, col: 0, color: 'modifier' })
  keys.push({ id: 'lalt', label: 'Alt', width: 1.25, depth: 1, row: 4, col: 1.25, color: 'modifier' })
  keys.push({ id: 'space', label: '', width: 3, depth: 1, row: 4, col: 2.5, color: 'accent' })
  keys.push({ id: 'ralt', label: 'Alt', width: 1.25, depth: 1, row: 4, col: 5.5, color: 'modifier' })
  keys.push({ id: 'rctrl', label: 'Ctrl', width: 1.25, depth: 1, row: 4, col: 6.75, color: 'modifier' })
  
  return keys
}

function generate60Layout(): KeyDefinition[] {
  const keys: KeyDefinition[] = []
  
  keys.push({ id: 'grave', label: '~', subLabel: '`', width: 1, depth: 1, row: 0, col: 0 })
  const numRow = '1234567890'.split('')
  numRow.forEach((k, i) => {
    keys.push({ id: k, label: k, width: 1, depth: 1, row: 0, col: i + 1 })
  })
  keys.push({ id: 'minus', label: '_', subLabel: '-', width: 1, depth: 1, row: 0, col: 11 })
  keys.push({ id: 'equal', label: '+', subLabel: '=', width: 1, depth: 1, row: 0, col: 12 })
  keys.push({ id: 'backspace', label: '⌫', width: 2, depth: 1, row: 0, col: 13 })
  
  keys.push({ id: 'tab', label: 'Tab', width: 1.5, depth: 1, row: 1, col: 0, color: 'modifier' })
  const row1 = 'QWERTYUIOP'.split('')
  row1.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 1, col: i + 1.5 })
  })
  keys.push({ id: 'bracket-l', label: '{', subLabel: '[', width: 1, depth: 1, row: 1, col: 11.5 })
  keys.push({ id: 'bracket-r', label: '}', subLabel: ']', width: 1, depth: 1, row: 1, col: 12.5 })
  keys.push({ id: 'backslash', label: '|', subLabel: '\\', width: 1.5, depth: 1, row: 1, col: 13.5 })
  
  keys.push({ id: 'caps', label: 'Caps', width: 1.75, depth: 1, row: 2, col: 0, color: 'modifier' })
  const row2 = 'ASDFGHJKL'.split('')
  row2.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 2, col: i + 1.75 })
  })
  keys.push({ id: 'semicolon', label: ':', subLabel: ';', width: 1, depth: 1, row: 2, col: 10.75 })
  keys.push({ id: 'quote', label: '"', subLabel: "'", width: 1, depth: 1, row: 2, col: 11.75 })
  keys.push({ id: 'enter', label: '↵', width: 2.25, depth: 1, row: 2, col: 12.75, color: 'accent' })
  
  keys.push({ id: 'lshift', label: '⇧', width: 2.25, depth: 1, row: 3, col: 0, color: 'modifier' })
  const row3 = 'ZXCVBNM'.split('')
  row3.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 3, col: i + 2.25 })
  })
  keys.push({ id: 'comma', label: '<', subLabel: ',', width: 1, depth: 1, row: 3, col: 9.25 })
  keys.push({ id: 'period', label: '>', subLabel: '.', width: 1, depth: 1, row: 3, col: 10.25 })
  keys.push({ id: 'slash', label: '?', subLabel: '/', width: 1, depth: 1, row: 3, col: 11.25 })
  keys.push({ id: 'rshift', label: '⇧', width: 2.75, depth: 1, row: 3, col: 12.25, color: 'modifier' })
  
  keys.push({ id: 'lctrl', label: 'Ctrl', width: 1.25, depth: 1, row: 4, col: 0, color: 'modifier' })
  keys.push({ id: 'lwin', label: '⌘', width: 1.25, depth: 1, row: 4, col: 1.25, color: 'modifier' })
  keys.push({ id: 'lalt', label: 'Alt', width: 1.25, depth: 1, row: 4, col: 2.5, color: 'modifier' })
  keys.push({ id: 'space', label: '', width: 6.25, depth: 1, row: 4, col: 3.75, color: 'accent' })
  keys.push({ id: 'ralt', label: 'Alt', width: 1.25, depth: 1, row: 4, col: 10, color: 'modifier' })
  keys.push({ id: 'rwin', label: '⌘', width: 1.25, depth: 1, row: 4, col: 11.25, color: 'modifier' })
  keys.push({ id: 'menu', label: '☰', width: 1.25, depth: 1, row: 4, col: 12.5, color: 'modifier' })
  keys.push({ id: 'rctrl', label: 'Ctrl', width: 1.25, depth: 1, row: 4, col: 13.75, color: 'modifier' })
  
  return keys
}

function generate65Layout(): KeyDefinition[] {
  const keys = generate60Layout()
  keys.push({ id: 'ins', label: 'Ins', width: 1, depth: 1, row: 0, col: 15, color: 'dark' })
  keys.push({ id: 'del', label: 'Del', width: 1, depth: 1, row: 1, col: 15, color: 'dark' })
  keys.push({ id: 'pgup', label: 'PgUp', width: 1, depth: 1, row: 2, col: 15, color: 'dark' })
  keys.push({ id: 'pgdn', label: 'PgDn', width: 1, depth: 1, row: 3, col: 15, color: 'dark' })
  return keys
}

function generate75Layout(): KeyDefinition[] {
  const keys: KeyDefinition[] = []
  
  keys.push({ id: 'esc', label: 'Esc', width: 1, depth: 1, row: 0, col: 0, color: 'dark' })
  for (let i = 1; i <= 12; i++) {
    keys.push({ id: `f${i}`, label: `F${i}`, width: 1, depth: 1, row: 0, col: i, color: i === 12 ? 'accent' : 'default' })
  }
  
  keys.push({ id: 'grave', label: '~', subLabel: '`', width: 1, depth: 1, row: 1, col: 0 })
  const numRow = '1234567890'.split('')
  numRow.forEach((k, i) => {
    keys.push({ id: k, label: k, width: 1, depth: 1, row: 1, col: i + 1 })
  })
  keys.push({ id: 'minus', label: '_', subLabel: '-', width: 1, depth: 1, row: 1, col: 11 })
  keys.push({ id: 'equal', label: '+', subLabel: '=', width: 1, depth: 1, row: 1, col: 12 })
  keys.push({ id: 'backspace', label: '⌫', width: 2, depth: 1, row: 1, col: 13 })
  
  keys.push({ id: 'tab', label: 'Tab', width: 1.5, depth: 1, row: 2, col: 0, color: 'modifier' })
  const row1 = 'QWERTYUIOP'.split('')
  row1.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 2, col: i + 1.5 })
  })
  keys.push({ id: 'bracket-l', label: '{', subLabel: '[', width: 1, depth: 1, row: 2, col: 11.5 })
  keys.push({ id: 'bracket-r', label: '}', subLabel: ']', width: 1, depth: 1, row: 2, col: 12.5 })
  keys.push({ id: 'backslash', label: '|', subLabel: '\\', width: 1.5, depth: 1, row: 2, col: 13.5 })
  
  keys.push({ id: 'caps', label: 'Caps', width: 1.75, depth: 1, row: 3, col: 0, color: 'modifier' })
  const row2 = 'ASDFGHJKL'.split('')
  row2.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 3, col: i + 1.75 })
  })
  keys.push({ id: 'semicolon', label: ':', subLabel: ';', width: 1, depth: 1, row: 3, col: 10.75 })
  keys.push({ id: 'quote', label: '"', subLabel: "'", width: 1, depth: 1, row: 3, col: 11.75 })
  keys.push({ id: 'enter', label: '↵', width: 2.25, depth: 1, row: 3, col: 12.75, color: 'accent' })
  
  keys.push({ id: 'lshift', label: '⇧', width: 2.25, depth: 1, row: 4, col: 0, color: 'modifier' })
  const row3 = 'ZXCVBNM'.split('')
  row3.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 4, col: i + 2.25 })
  })
  keys.push({ id: 'comma', label: '<', subLabel: ',', width: 1, depth: 1, row: 4, col: 9.25 })
  keys.push({ id: 'period', label: '>', subLabel: '.', width: 1, depth: 1, row: 4, col: 10.25 })
  keys.push({ id: 'slash', label: '?', subLabel: '/', width: 1, depth: 1, row: 4, col: 11.25 })
  keys.push({ id: 'rshift', label: '⇧', width: 2.75, depth: 1, row: 4, col: 12.25, color: 'modifier' })
  
  keys.push({ id: 'lctrl', label: 'Ctrl', width: 1.25, depth: 1, row: 5, col: 0, color: 'modifier' })
  keys.push({ id: 'lwin', label: '⌘', width: 1.25, depth: 1, row: 5, col: 1.25, color: 'modifier' })
  keys.push({ id: 'lalt', label: 'Alt', width: 1.25, depth: 1, row: 5, col: 2.5, color: 'modifier' })
  keys.push({ id: 'space', label: '', width: 6.25, depth: 1, row: 5, col: 3.75, color: 'accent' })
  keys.push({ id: 'ralt', label: 'Alt', width: 1.25, depth: 1, row: 5, col: 10, color: 'modifier' })
  keys.push({ id: 'rwin', label: '⌘', width: 1.25, depth: 1, row: 5, col: 11.25, color: 'modifier' })
  keys.push({ id: 'fn', label: 'Fn', width: 1.25, depth: 1, row: 5, col: 12.5, color: 'modifier' })
  keys.push({ id: 'rctrl', label: 'Ctrl', width: 1.25, depth: 1, row: 5, col: 13.75, color: 'modifier' })
  keys.push({ id: 'up', label: '↑', width: 1, depth: 1, row: 4, col: 15, color: 'dark' })
  keys.push({ id: 'left', label: '←', width: 1, depth: 1, row: 5, col: 14, color: 'dark' })
  keys.push({ id: 'down', label: '↓', width: 1, depth: 1, row: 5, col: 15, color: 'dark' })
  keys.push({ id: 'right', label: '→', width: 1, depth: 1, row: 5, col: 16, color: 'dark' })
  
  return keys
}

function generateTKLLayout(): KeyDefinition[] {
  const keys = generate75Layout()
  
  keys.push({ id: 'print', label: 'Prt', width: 1, depth: 1, row: 0, col: 15, color: 'dark' })
  keys.push({ id: 'scroll', label: 'Scr', width: 1, depth: 1, row: 0, col: 16, color: 'dark' })
  keys.push({ id: 'pause', label: 'Pau', width: 1, depth: 1, row: 0, col: 17, color: 'dark' })
  
  keys.push({ id: 'ins', label: 'Ins', width: 1, depth: 1, row: 1, col: 15, color: 'dark' })
  keys.push({ id: 'home', label: 'Hm', width: 1, depth: 1, row: 1, col: 16, color: 'dark' })
  keys.push({ id: 'pgup', label: 'Pg↑', width: 1, depth: 1, row: 1, col: 17, color: 'dark' })
  
  keys.push({ id: 'del', label: 'Del', width: 1, depth: 1, row: 2, col: 15, color: 'dark' })
  keys.push({ id: 'end', label: 'End', width: 1, depth: 1, row: 2, col: 16, color: 'dark' })
  keys.push({ id: 'pgdn', label: 'Pg↓', width: 1, depth: 1, row: 2, col: 17, color: 'dark' })
  
  return keys
}

function generate980Layout(): KeyDefinition[] {
  const keys = generateTKLLayout()

  keys.push({ id: 'numlock', label: 'Num', width: 1, depth: 1, row: 0, col: 18, color: 'dark' })
  keys.push({ id: 'num/', label: '/', width: 1, depth: 1, row: 0, col: 19, color: 'dark' })
  keys.push({ id: 'num*', label: '*', width: 1, depth: 1, row: 0, col: 20, color: 'dark' })
  keys.push({ id: 'num-', label: '-', width: 1, depth: 1, row: 0, col: 21, color: 'dark' })

  keys.push({ id: 'num7', label: '7', width: 1, depth: 1, row: 1, col: 18, color: 'dark' })
  keys.push({ id: 'num8', label: '8', width: 1, depth: 1, row: 1, col: 19, color: 'dark' })
  keys.push({ id: 'num9', label: '9', width: 1, depth: 1, row: 1, col: 20, color: 'dark' })
  keys.push({ id: 'num+', label: '+', width: 1, depth: 2, row: 1, col: 21, color: 'dark' })

  keys.push({ id: 'num4', label: '4', width: 1, depth: 1, row: 2, col: 18, color: 'dark' })
  keys.push({ id: 'num5', label: '5', width: 1, depth: 1, row: 2, col: 19, color: 'dark' })
  keys.push({ id: 'num6', label: '6', width: 1, depth: 1, row: 2, col: 20, color: 'dark' })

  keys.push({ id: 'num1', label: '1', width: 1, depth: 1, row: 3, col: 18, color: 'dark' })
  keys.push({ id: 'num2', label: '2', width: 1, depth: 1, row: 3, col: 19, color: 'dark' })
  keys.push({ id: 'num3', label: '3', width: 1, depth: 1, row: 3, col: 20, color: 'dark' })
  keys.push({ id: 'numenter', label: '↵', width: 1, depth: 2, row: 3, col: 21, color: 'dark' })

  keys.push({ id: 'num0', label: '0', width: 2, depth: 1, row: 5, col: 18, color: 'dark' })
  keys.push({ id: 'num.', label: '.', width: 1, depth: 1, row: 5, col: 20, color: 'dark' })

  return keys
}

function generate100Layout(): KeyDefinition[] {
  const keys = generateTKLLayout()

  keys.push({ id: 'numlock', label: 'Num', width: 1, depth: 1, row: 0, col: 18, color: 'dark' })
  keys.push({ id: 'num/', label: '/', width: 1, depth: 1, row: 0, col: 19, color: 'dark' })
  keys.push({ id: 'num*', label: '*', width: 1, depth: 1, row: 0, col: 20, color: 'dark' })
  keys.push({ id: 'num-', label: '-', width: 1, depth: 1, row: 0, col: 21, color: 'dark' })

  keys.push({ id: 'num7', label: '7', width: 1, depth: 1, row: 1, col: 18, color: 'dark' })
  keys.push({ id: 'num8', label: '8', width: 1, depth: 1, row: 1, col: 19, color: 'dark' })
  keys.push({ id: 'num9', label: '9', width: 1, depth: 1, row: 1, col: 20, color: 'dark' })
  keys.push({ id: 'num+', label: '+', width: 1, depth: 2, row: 1, col: 21, color: 'dark' })

  keys.push({ id: 'num4', label: '4', width: 1, depth: 1, row: 2, col: 18, color: 'dark' })
  keys.push({ id: 'num5', label: '5', width: 1, depth: 1, row: 2, col: 19, color: 'dark' })
  keys.push({ id: 'num6', label: '6', width: 1, depth: 1, row: 2, col: 20, color: 'dark' })
  keys.push({ id: 'numenter', label: '↵', width: 1, depth: 2, row: 3, col: 21, color: 'dark' })

  keys.push({ id: 'num1', label: '1', width: 1, depth: 1, row: 3, col: 18, color: 'dark' })
  keys.push({ id: 'num2', label: '2', width: 1, depth: 1, row: 3, col: 19, color: 'dark' })
  keys.push({ id: 'num3', label: '3', width: 1, depth: 1, row: 3, col: 20, color: 'dark' })

  keys.push({ id: 'num0', label: '0', width: 2, depth: 1, row: 4, col: 18, color: 'dark' })
  keys.push({ id: 'num.', label: '.', width: 1, depth: 1, row: 4, col: 20, color: 'dark' })

  return keys
}

function generateAliceLayout(): KeyDefinition[] {
  const keys: KeyDefinition[] = []
  
  keys.push({ id: 'esc', label: 'Esc', width: 1, depth: 1, row: 0, col: 0, color: 'dark' })
  
  keys.push({ id: 'grave', label: '~', subLabel: '`', width: 1, depth: 1, row: 0, col: 1.5 })
  const numRow = '1234567890'.split('')
  numRow.forEach((k, i) => {
    keys.push({ id: k, label: k, width: 1, depth: 1, row: 0, col: i + 2.5 })
  })
  keys.push({ id: 'minus', label: '_', subLabel: '-', width: 1, depth: 1, row: 0, col: 12.5 })
  keys.push({ id: 'equal', label: '+', subLabel: '=', width: 1, depth: 1, row: 0, col: 13.5 })
  keys.push({ id: 'backspace', label: '⌫', width: 1.5, depth: 1, row: 0, col: 14.5 })

  const leftRow1 = 'QWERT'.split('')
  leftRow1.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 1, col: i + 0.5 })
  })
  const rightRow1 = 'YUIOP'.split('')
  rightRow1.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 1, col: i + 8.8 })
  })

  const leftRow2 = 'ASDFG'.split('')
  leftRow2.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 2, col: i + 0.8 })
  })
  const rightRow2 = 'HJKL'.split('')
  rightRow2.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 2, col: i + 9.2 })
  })
  keys.push({ id: 'enter', label: '↵', width: 1.75, depth: 1, row: 2, col: 13.3, color: 'accent' })

  const leftRow3 = 'ZXCVB'.split('')
  leftRow3.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 3, col: i + 1.2 })
  })
  const rightRow3 = 'NM'.split('')
  rightRow3.forEach((k, i) => {
    keys.push({ id: k.toLowerCase(), label: k, width: 1, depth: 1, row: 3, col: i + 9.9 })
  })
  keys.push({ id: 'comma', label: '<', subLabel: ',', width: 1, depth: 1, row: 3, col: 11.9 })
  keys.push({ id: 'period', label: '>', subLabel: '.', width: 1, depth: 1, row: 3, col: 12.9 })
  keys.push({ id: 'slash', label: '?', subLabel: '/', width: 1, depth: 1, row: 3, col: 13.9 })

  keys.push({ id: 'lctrl', label: 'Ctrl', width: 1.25, depth: 1, row: 4, col: 0, color: 'modifier' })
  keys.push({ id: 'lalt', label: 'Alt', width: 1.25, depth: 1, row: 4, col: 1.25, color: 'modifier' })
  keys.push({ id: 'space-l', label: '', width: 2.25, depth: 1, row: 4, col: 2.6, color: 'accent' })
  keys.push({ id: 'space-r', label: '', width: 2.75, depth: 1, row: 4, col: 7.9, color: 'accent' })
  keys.push({ id: 'ralt', label: 'Alt', width: 1.25, depth: 1, row: 4, col: 11, color: 'modifier' })
  keys.push({ id: 'fn', label: 'Fn', width: 1.25, depth: 1, row: 4, col: 12.25, color: 'modifier' })
  keys.push({ id: 'rctrl', label: 'Ctrl', width: 1.25, depth: 1, row: 4, col: 13.5, color: 'modifier' })

  return keys
}

function cloneKeys(keys: KeyDefinition[]): KeyDefinition[] {
  return keys.map((key) => ({ ...key }))
}

function sortKeys(keys: KeyDefinition[]): KeyDefinition[] {
  return [...keys].sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row))
}

function upsertKey(keys: KeyDefinition[], key: KeyDefinition): void {
  const index = keys.findIndex((item) => item.id === key.id)
  if (index >= 0) {
    keys[index] = key
    return
  }
  keys.push(key)
}

function applyStandard(keys: KeyDefinition[], standard: LayoutStandard): KeyDefinition[] {
  if (standard === 'ansi') {
    return keys
  }

  const next = cloneKeys(keys)

  if (standard === 'iso') {
    const leftShift = next.find((key) => key.id === 'lshift')
    if (leftShift && leftShift.width > 1.25) {
      leftShift.width = 1.25
    }

    if (leftShift && !next.some((key) => key.id === 'iso-extra')) {
      next.push({
        id: 'iso-extra',
        label: '<>',
        width: 1,
        depth: 1,
        row: leftShift.row,
        col: leftShift.col + leftShift.width,
        color: 'modifier',
      })
    }

    const backslash = next.find((key) => key.id === 'backslash')
    if (backslash) {
      backslash.width = 1
      backslash.label = '¦'
    }

    const enter = next.find((key) => key.id === 'enter')
    if (enter) {
      const rightEdge = enter.col + enter.width
      enter.width = 1.5
      enter.depth = 2
      enter.row = Math.max(1, enter.row - 1)
      enter.col = rightEdge - enter.width
      enter.label = 'ISO↵'
    }
  }

  if (standard === 'jis') {
    const space = next.find((key) => key.id === 'space')
    if (!space) {
      return sortKeys(next)
    }

    const bottomRow = space.row
    const preserveIds = new Set(['lctrl'])
    const removeIds = new Set(['lwin', 'lalt', 'space', 'ralt', 'rwin', 'menu', 'rctrl', 'fn'])

    const filtered = next.filter((key) => key.row !== bottomRow || (!removeIds.has(key.id) && !preserveIds.has(key.id)))

    const lctrl = next.find((key) => key.row === bottomRow && key.id === 'lctrl')
    const baseCtrl: KeyDefinition = lctrl
      ? { ...lctrl, width: 1.25, col: 0 }
      : { id: 'lctrl', label: 'Ctrl', width: 1.25, depth: 1, row: bottomRow, col: 0, color: 'modifier' }

    const sequence: KeyDefinition[] = [
      { id: 'lwin', label: '⌘', width: 1.25, depth: 1, row: bottomRow, col: 1.25, color: 'modifier' },
      { id: 'lalt', label: 'Alt', width: 1.25, depth: 1, row: bottomRow, col: 2.5, color: 'modifier' },
      { id: 'muhenkan', label: '無変換', width: 1, depth: 1, row: bottomRow, col: 3.75, color: 'modifier' },
      { id: 'space', label: '', width: 4.5, depth: 1, row: bottomRow, col: 4.75, color: 'accent' },
      { id: 'henkan', label: '変換', width: 1, depth: 1, row: bottomRow, col: 9.25, color: 'modifier' },
      { id: 'kana', label: 'かな', width: 1, depth: 1, row: bottomRow, col: 10.25, color: 'modifier' },
      { id: 'ralt', label: 'Alt', width: 1.25, depth: 1, row: bottomRow, col: 11.25, color: 'modifier' },
      { id: 'rctrl', label: 'Ctrl', width: 1.25, depth: 1, row: bottomRow, col: 12.5, color: 'modifier' },
    ]

    filtered.push(baseCtrl)
    filtered.push(...sequence)

    const backslash = filtered.find((key) => key.id === 'backslash')
    if (backslash) {
      backslash.width = 1
      backslash.label = '¥'
    }

    return sortKeys(filtered)
  }

  return sortKeys(next)
}

function applyVariant(keys: KeyDefinition[], variant: LayoutVariant): KeyDefinition[] {
  if (variant === 'standard') {
    return keys
  }

  const next = cloneKeys(keys)

  if (variant === 'hhkb') {
    const caps = next.find((key) => key.id === 'caps')
    if (caps) {
      caps.label = 'Ctrl'
      caps.color = 'modifier'
    }

    const withoutMeta = next.filter((key) => !['lwin', 'rwin', 'menu'].includes(key.id))
    const space = withoutMeta.find((key) => key.id === 'space')
    if (space) {
      const row = space.row
      const leftCtrl = withoutMeta.find((key) => key.id === 'lctrl')
      const leftAlt = withoutMeta.find((key) => key.id === 'lalt')
      const rightAlt = withoutMeta.find((key) => key.id === 'ralt')
      const rightCtrl = withoutMeta.find((key) => key.id === 'rctrl')

      if (leftCtrl) {
        leftCtrl.width = 1.5
        leftCtrl.col = 0
      }
      if (leftAlt) {
        leftAlt.width = 1.5
        leftAlt.col = 1.5
      }

      space.width = 7
      space.col = 3
      space.row = row

      if (rightAlt) {
        rightAlt.width = 1.5
        rightAlt.col = 10
      } else {
        withoutMeta.push({ id: 'ralt', label: 'Alt', width: 1.5, depth: 1, row, col: 10, color: 'modifier' })
      }

      if (rightCtrl) {
        rightCtrl.width = 1.5
        rightCtrl.col = 11.5
      } else {
        withoutMeta.push({ id: 'rctrl', label: 'Ctrl', width: 1.5, depth: 1, row, col: 11.5, color: 'modifier' })
      }

      if (!withoutMeta.some((key) => key.id === 'fn')) {
        withoutMeta.push({ id: 'fn', label: 'Fn', width: 1, depth: 1, row, col: 13, color: 'modifier' })
      }
    }

    return sortKeys(withoutMeta)
  }

  if (variant === 'thinkpad_style') {
    for (const keyId of ['g', 'h', 'b']) {
      const target = next.find((key) => key.id === keyId)
      if (target) {
        target.color = 'accent'
      }
    }

    const hKey = next.find((key) => key.id === 'h') || next.find((key) => key.id === 'g')
    if (hKey && !next.some((key) => key.id === 'tp-mid')) {
      const trackpointRow = hKey.row + 0.62
      next.push({ id: 'tp-left', label: '◁', width: 0.8, depth: 0.45, row: trackpointRow, col: hKey.col - 1.05, color: 'dark' })
      next.push({ id: 'tp-mid', label: '●', width: 0.8, depth: 0.45, row: trackpointRow, col: hKey.col - 0.2, color: 'dark' })
      next.push({ id: 'tp-right', label: '▷', width: 0.8, depth: 0.45, row: trackpointRow, col: hKey.col + 0.65, color: 'dark' })
    }

    return sortKeys(next)
  }

  return sortKeys(next)
}

function computeLayoutBounds(keys: KeyDefinition[]): { width: number; depth: number } {
  const width = keys.reduce((max, key) => Math.max(max, key.col + key.width), 0)
  const depth = keys.reduce((max, key) => Math.max(max, key.row + key.depth), 0)
  return { width, depth }
}

/**
 * 返回应用标准与变体后的最终布局定义。
 */
export function resolveLayoutDefinition(
  layout: LayoutType,
  standard: LayoutStandard = 'ansi',
  variant: LayoutVariant = 'standard'
): LayoutDefinition {
  const base = getLayoutDefinition(layout)
  const standardized = applyStandard(base.keys, standard)
  const varied = applyVariant(standardized, variant)
  const bounds = computeLayoutBounds(varied)

  return {
    name: `${base.name} · ${standard.toUpperCase()} · ${variant}`,
    width: Math.max(base.width, bounds.width),
    depth: Math.max(base.depth, bounds.depth),
    keys: varied,
  }
}

export function getLayoutDefinition(layout: LayoutType): LayoutDefinition {
  return LAYOUTS[layout] || LAYOUTS['75']
}

export function getLayoutDimensions(layout: LayoutType): { width: number; depth: number } {
  const def = getLayoutDefinition(layout)
  return { width: def.width, depth: def.depth }
}

export { LAYOUTS }
