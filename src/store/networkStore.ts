import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  isWorkingOffline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  toggleWorkingOffline: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isWorkingOffline: false,
  
  setIsOnline: (isOnline) => {
    set({ isOnline });
  },
  
  toggleWorkingOffline: () => {
    set((state) => ({ isWorkingOffline: !state.isWorkingOffline }));
  },
})); 