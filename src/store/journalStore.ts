import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  lastModified: number;
  shared: boolean;
  sharedWith: string[];
}

interface JournalState {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'lastModified'>) => void;
  updateEntry: (id: string, content: string) => void;
  getEntryByDate: (date: string) => JournalEntry | undefined;
  deleteEntry: (id: string) => void;
  shareEntry: (id: string, email: string) => void;
  unshareEntry: (id: string, email: string) => void;
  toggleShareStatus: (id: string) => void;
  exportEntries: () => JournalEntry[];
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: crypto.randomUUID(),
          lastModified: Date.now(),
          shared: false,
          sharedWith: [],
        };
        
        set((state) => ({
          entries: [...state.entries, newEntry],
        }));
      },
      
      updateEntry: (id, content) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, content, lastModified: Date.now() }
              : entry
          ),
        }));
      },
      
      getEntryByDate: (date) => {
        return get().entries.find((entry) => entry.date === date);
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      
      shareEntry: (id, email) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id && !entry.sharedWith.includes(email)
              ? {
                  ...entry,
                  shared: true,
                  sharedWith: [...entry.sharedWith, email],
                }
              : entry
          ),
        }));
      },
      
      unshareEntry: (id, email) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  sharedWith: entry.sharedWith.filter((e) => e !== email),
                  shared: entry.sharedWith.filter((e) => e !== email).length > 0,
                }
              : entry
          ),
        }));
      },
      
      toggleShareStatus: (id) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, shared: !entry.shared }
              : entry
          ),
        }));
      },
      
      exportEntries: () => {
        return get().entries;
      },
    }),
    {
      name: 'journal-storage',
    }
  )
); 