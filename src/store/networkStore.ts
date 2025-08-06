import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  isWorkingOffline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  toggleWorkingOffline: () => void;
  initializeNetworkStatus: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true, // Default to true to avoid hydration mismatch
  isWorkingOffline: false,
  
  setIsOnline: (isOnline) => {
    set({ isOnline });
  },
  
  toggleWorkingOffline: () => {
    set((state) => ({ isWorkingOffline: !state.isWorkingOffline }));
  },
  
  initializeNetworkStatus: () => {
    if (typeof navigator !== 'undefined') {
      set({ isOnline: navigator.onLine });
    }
  },
})); 