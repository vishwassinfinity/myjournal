import { create } from 'zustand';

export interface Sound {
  id: string;
  name: string;
  src: string;
  icon: string;
}

interface AudioState {
  sounds: Sound[];
  currentSound: Sound | null;
  isPlaying: boolean;
  volume: number;
  setCurrentSound: (sound: Sound | null) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
}

export const sounds: Sound[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    src: '/sounds/rain.mp3',
    icon: 'cloud-rain',
  },
  {
    id: 'forest',
    name: 'Forest Ambience',
    src: '/sounds/forest.mp3',
    icon: 'tree',
  },
  {
    id: 'cafe',
    name: 'Cafe Chatter',
    src: '/sounds/cafe.mp3',
    icon: 'coffee',
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    src: '/sounds/fire.mp3',
    icon: 'flame',
  },
  {
    id: 'waves',
    name: 'Ocean Waves',
    src: '/sounds/waves.mp3',
    icon: 'water',
  },
];

export const useAudioStore = create<AudioState>((set) => ({
  sounds,
  currentSound: null,
  isPlaying: false,
  volume: 0.5,
  
  setCurrentSound: (sound) => {
    set({ currentSound: sound });
  },
  
  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },
  
  setVolume: (volume) => {
    set({ volume });
  },
})); 