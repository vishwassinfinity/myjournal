import React, { useEffect, useRef } from 'react';
import { useAudioStore, Sound } from '@/store/audioStore';
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';

const SoundPlayer: React.FC = () => {
  const { sounds, currentSound, isPlaying, volume, setCurrentSound, togglePlay, setVolume } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Set up audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    
    // Update audio source when sound changes
    if (currentSound) {
      audioRef.current.src = currentSound.src;
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error("Could not play audio:", err));
      }
    } else {
      audioRef.current.pause();
    }
    
    // Update volume
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentSound, isPlaying, volume]);
  
  const handleSoundSelect = (sound: Sound) => {
    if (currentSound?.id === sound.id) {
      togglePlay();
    } else {
      setCurrentSound(sound);
      if (!isPlaying) {
        togglePlay();
      }
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };
  
  return (
    <div style={{
      backgroundColor: 'rgb(var(--card-bg))',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '1rem',
      marginBottom: '1.5rem'
    }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        marginBottom: '1rem', 
        color: 'rgb(var(--foreground-rgb))' 
      }}>
        White Noise
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        {sounds.map(sound => (
          <button
            key={sound.id}
            onClick={() => handleSoundSelect(sound)}
            className={`sound-button ${currentSound?.id === sound.id ? 'active' : ''}`}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{sound.name}</span>
          </button>
        ))}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => currentSound && togglePlay()}
          disabled={!currentSound}
          style={{
            padding: '0.5rem',
            borderRadius: '9999px',
            backgroundColor: !currentSound ? '#e5e7eb' : '#4B6BFB',
            color: 'white',
            cursor: currentSound ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', flex: '1', gap: '0.5rem' }}>
          <FiVolumeX size={18} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="audio-slider"
          />
          <FiVolume2 size={18} />
        </div>
      </div>
    </div>
  );
};

export default SoundPlayer; 