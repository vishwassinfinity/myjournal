'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { set as idbSet, get as idbGet } from 'idb-keyval';

export type MoodType = {
  emoji: string;
  label: string;
};

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  lastModified: number;
  shared: boolean;
  sharedWith: string[];
  mood?: MoodType;
  // New optional title for renaming scripts
  title?: string;
  shareToken?: string; // token for shareable link
}

interface JournalState {
  entries: JournalEntry[];
  hydrated: boolean; // flag to know when persist rehydration finished
  addEntry: (entry: Omit<JournalEntry, 'id' | 'lastModified'>) => string; // return id
  updateEntry: (id: string, content: string, additionalProps?: Partial<JournalEntry>) => void;
  getEntryByDate: (date: string) => JournalEntry | undefined; // latest by lastModified
  getEntriesByDate: (date: string) => JournalEntry[]; // all for date, newest first
  deleteEntry: (id: string) => void;
  setMood: (id: string, mood: MoodType) => void;
  // New: rename an entry
  setEntryTitle: (id: string, title: string) => void;
  shareEntry: (id: string, email: string) => void;
  unshareEntry: (id: string, email: string) => void;
  toggleShareStatus: (id: string) => void;
  exportEntries: () => JournalEntry[];
  clearAllEntries: () => void;
  getEntryById: (id: string) => JournalEntry | undefined;
  revokeShareLink: (id: string) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      
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
        return newEntry.id;
      },
      
      updateEntry: (id, content, additionalProps = {}) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, content, lastModified: Date.now(), ...additionalProps }
              : entry
          ),
        }));
      },
      
      getEntryByDate: (date) => {
        const entriesForDate = get().entries.filter((e) => e.date === date);
        if (entriesForDate.length === 0) return undefined;
        return entriesForDate.reduce((latest, cur) =>
          cur.lastModified > latest.lastModified ? cur : latest
        );
      },

      getEntriesByDate: (date) => {
        return get()
          .entries
          .filter((e) => e.date === date)
          .sort((a, b) => b.lastModified - a.lastModified); // newest first
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      
      setMood: (id, mood) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, mood, lastModified: Date.now() }
              : entry
          ),
        }));
      },

      setEntryTitle: (id, title) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, title, lastModified: Date.now() }
              : entry
          ),
        }));
      },
      
      shareEntry: (id, email) => {
        set((state) => ({
          entries: state.entries.map((entry) => {
            if (entry.id === id) {
              const already = entry.sharedWith.includes(email);
              return already ? entry : {
                ...entry,
                shared: true,
                sharedWith: [...entry.sharedWith, email],
                shareToken: entry.shareToken || crypto.randomUUID(),
                lastModified: Date.now(),
              };
            }
            return entry;
          })
        }));
      },
      
      unshareEntry: (id, email) => {
        set((state) => ({
          entries: state.entries.map((entry) => {
            if (entry.id === id) {
              const remaining = entry.sharedWith.filter((e) => e !== email);
              return {
                ...entry,
                sharedWith: remaining,
                shared: remaining.length > 0,
                lastModified: Date.now(),
              };
            }
            return entry;
          })
        }));
      },
      
      revokeShareLink: (id) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, shareToken: undefined, shared: false, sharedWith: [] } : entry
          )
        }));
      },
      
      toggleShareStatus: (id) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, shared: !entry.shared, shareToken: entry.shareToken || (!entry.shared ? crypto.randomUUID() : entry.shareToken) }
              : entry
          ),
        }));
      },
      
      exportEntries: () => {
        return get().entries;
      },

      clearAllEntries: () => {
        set({ entries: [] });
      },

      getEntryById: (id) => get().entries.find(e => e.id === id),
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          try { return await idbGet(name) ?? null; } catch { return null; }
        },
        setItem: async (name, value) => {
          try { await idbSet(name, value); } catch (e) { console.error('Persist set error', e); }
        },
        removeItem: async (name) => { try { await idbSet(name, null); } catch {} },
      })),
      version: 1,
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate journal store', error);
          } else {
            useJournalStore.setState({ hydrated: true });
          }
        };
      },
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);


