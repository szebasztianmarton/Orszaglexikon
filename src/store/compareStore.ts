import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const COMPARE_MAX = 4

interface CompareState {
  items: string[]              // cca3 codes
  add: (cca3: string) => boolean
  remove: (cca3: string) => void
  toggle: (cca3: string) => void
  clear: () => void
  has: (cca3: string) => boolean
  isFull: () => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (cca3) => {
        const { items } = get()
        if (items.includes(cca3)) return false
        if (items.length >= COMPARE_MAX) return false
        set({ items: [...items, cca3] })
        return true
      },
      remove: (cca3) => {
        set({ items: get().items.filter((x) => x !== cca3) })
      },
      toggle: (cca3) => {
        const { items, add, remove } = get()
        if (items.includes(cca3)) remove(cca3)
        else add(cca3)
      },
      clear: () => set({ items: [] }),
      has: (cca3) => get().items.includes(cca3),
      isFull: () => get().items.length >= COMPARE_MAX,
    }),
    { name: 'orszaglexikon-fullai-compare' },
  ),
)
