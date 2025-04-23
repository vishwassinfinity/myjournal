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
  setIsPlaying: (isPlaying: boolean) => void;
}

// Sound file paths - using the actual files in the public/sounds directory
const LIGHT_RAIN_SOUND = '/sounds/LightRain.mp3';
const RAIN_SOUND = '/sounds/Rain.mp3';
const FOREST_AMBIENCE_SOUND = '/sounds/ForestAmbience.mp3';
const CAFE_CHATTER_SOUND = '/sounds/CafeChatter.mp3';
const FIRE_SOUND = '/sounds/fire.mp3'; 
const WAVES_SOUND = '/sounds/Waves.mp3';
const RIVER_SOUND = '/sounds/River.mp3';
const FAN_SOUND = '/sounds/fan.mp3';
const NIGHT_AMBIENCE_SOUND = '/sounds/NightAmbience.mp3';
const THUNDERSTORM_SOUND = '/sounds/thunderstorm.mp3';
const WHITE_NOISE_SOUND = '/sounds/WhiteNoise.mp3';
const PINK_NOISE_SOUND = '/sounds/PinkNoise.mp3';
const BROWN_NOISE_SOUND = '/sounds/BrownNoise.mp3';
const GREEN_NOISE_SOUND = '/sounds/GreenNoise.mp3';

export const sounds: Sound[] = [
  {
    id: 'lightRain',
    name: 'Light Rain',
    src: LIGHT_RAIN_SOUND,
    icon: 'cloud-drizzle',
  },
  {
    id: 'rain',
    name: 'Rain',
    src: RAIN_SOUND,
    icon: 'cloud-rain',
  },
  {
    id: 'forestAmbience',
    name: 'Forest Ambience',
    src: FOREST_AMBIENCE_SOUND,
    icon: 'tree',
  },
  {
    id: 'cafeChatter',
    name: 'Cafe Chatter',
    src: CAFE_CHATTER_SOUND,
    icon: 'coffee',
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    src: FIRE_SOUND,
    icon: 'flame',
  },
  {
    id: 'waves',
    name: 'Ocean Waves',
    src: WAVES_SOUND,
    icon: 'waves',
  },
  {
    id: 'river',
    name: 'Flowing River',
    src: RIVER_SOUND,
    icon: 'droplet',
  },
  {
    id: 'fan',
    name: 'Fan Sound',
    src: FAN_SOUND,
    icon: 'wind',
  },
  {
    id: 'nightAmbience',
    name: 'Night Ambience',
    src: NIGHT_AMBIENCE_SOUND,
    icon: 'moon',
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    src: THUNDERSTORM_SOUND,
    icon: 'cloud-lightning',
  },
  {
    id: 'whiteNoise',
    name: 'White Noise',
    src: WHITE_NOISE_SOUND,
    icon: 'radio',
  },
  {
    id: 'pinkNoise',
    name: 'Pink Noise',
    src: PINK_NOISE_SOUND,
    icon: 'noise-cancel',
  },
  {
    id: 'brownNoise',
    name: 'Brown Noise',
    src: BROWN_NOISE_SOUND, 
    icon: 'wave-square',
  },
  {
    id: 'greenNoise',
    name: 'Green Noise',
    src: GREEN_NOISE_SOUND,
    icon: 'signal',
  }
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
  
  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },
})); 