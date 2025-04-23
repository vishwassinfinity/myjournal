import React, { useState, useRef, useEffect } from 'react';
import { useAudioStore, Sound, sounds as storeSounds } from '../store/audioStore';

const SoundPlayer: React.FC = () => {
  const { 
    currentSound, 
    setCurrentSound, 
    isPlaying, 
    setIsPlaying, 
    volume, 
    setVolume, 
    togglePlay 
  } = useAudioStore();
  const [visualizerActive, setVisualizerActive] = useState(false);
  const [visualizerType, setVisualizerType] = useState<'bars' | 'wave' | 'circle'>('wave');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Map sound ids to their corresponding colors
  const soundColors: Record<string, string> = {
    'lightRain': 'from-sky-300 to-blue-400',
    'rain': 'from-blue-400 to-blue-600',
    'forestAmbience': 'from-green-400 to-green-600',
    'cafeChatter': 'from-amber-300 to-amber-500',
    'fire': 'from-orange-400 to-red-500',
    'waves': 'from-cyan-400 to-blue-500',
    'river': 'from-blue-300 to-blue-500',
    'fan': 'from-gray-300 to-gray-500',
    'nightAmbience': 'from-indigo-400 to-purple-600',
    'thunderstorm': 'from-purple-400 to-indigo-600',
    'whiteNoise': 'from-gray-300 to-gray-500',
    'pinkNoise': 'from-pink-300 to-pink-500',
    'brownNoise': 'from-amber-600 to-amber-800',
    'greenNoise': 'from-emerald-400 to-emerald-600'
  };
  
  // Map sound ids to their corresponding emoji icons
  const soundEmojis: Record<string, string> = {
    'lightRain': '🌦️',
    'rain': '🌧️',
    'forestAmbience': '🌲',
    'cafeChatter': '☕',
    'fire': '🔥',
    'waves': '🌊',
    'river': '💧',
    'fan': '💨',
    'nightAmbience': '🌙',
    'thunderstorm': '⚡',
    'whiteNoise': '📻',
    'pinkNoise': '🎧',
    'brownNoise': '🟤',
    'greenNoise': '🟢'
  };
  
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = volume;
  }, [volume]);
  
  useEffect(() => {
    if (isPlaying && visualizerActive && canvasRef.current) {
      startVisualizer();
    } else if (!isPlaying || !visualizerActive) {
      stopVisualizer();
    }
    
    return () => {
      stopVisualizer();
    };
  }, [isPlaying, visualizerActive, visualizerType]);
  
  useEffect(() => {
    if (!audioRef.current || !currentSound) return;
    
    audioRef.current.src = currentSound.src;
    
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.error('Audio play failed:', e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentSound, isPlaying, setIsPlaying]);
  
  const toggleSound = (sound: Sound) => {
    if (currentSound?.id === sound.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentSound(sound);
      setIsPlaying(true);
    }
  };
  
  const startVisualizer = () => {
    if (!canvasRef.current || !audioRef.current) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioSrc = audioContext.createMediaElementSource(audioRef.current);
    const analyser = audioContext.createAnalyser();
    
    audioSrc.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Set FFT size based on visualization type
    analyser.fftSize = visualizerType === 'wave' ? 2048 : 128;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = visualizerType === 'wave' 
      ? new Uint8Array(bufferLength)
      : new Uint8Array(bufferLength);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match its display size
    const updateCanvasSize = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
    };
    
    updateCanvasSize();
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Find active sound color
    const soundId = currentSound?.id || 'rain';
    const colorClass = soundColors[soundId] || 'from-blue-400 to-blue-600';
    const gradientColors = colorClass.split(' ');
    const startColor = gradientColors[0].replace('from-', '');
    const endColor = gradientColors[1].replace('to-', '');
    
    // Add more colors to our palette
    const colors = {
      'sky-300': 'rgba(125, 211, 252, 0.8)',
      'blue-300': 'rgba(147, 197, 253, 0.8)',
      'blue-400': 'rgba(96, 165, 250, 0.8)',
      'blue-500': 'rgba(59, 130, 246, 0.8)',
      'blue-600': 'rgba(37, 99, 235, 0.8)',
      'green-400': 'rgba(74, 222, 128, 0.8)',
      'green-600': 'rgba(22, 163, 74, 0.8)',
      'amber-300': 'rgba(252, 211, 77, 0.8)',
      'amber-500': 'rgba(245, 158, 11, 0.8)',
      'amber-600': 'rgba(217, 119, 6, 0.8)',
      'amber-800': 'rgba(146, 64, 14, 0.8)',
      'orange-400': 'rgba(251, 146, 60, 0.8)',
      'pink-300': 'rgba(249, 168, 212, 0.8)',
      'pink-500': 'rgba(236, 72, 153, 0.8)',
      'red-500': 'rgba(239, 68, 68, 0.8)',
      'cyan-400': 'rgba(34, 211, 238, 0.8)',
      'gray-300': 'rgba(209, 213, 219, 0.8)',
      'gray-400': 'rgba(156, 163, 175, 0.8)',
      'gray-500': 'rgba(107, 114, 128, 0.8)',
      'gray-600': 'rgba(75, 85, 99, 0.8)',
      'indigo-400': 'rgba(129, 140, 248, 0.8)',
      'purple-400': 'rgba(192, 132, 252, 0.8)',
      'purple-600': 'rgba(147, 51, 234, 0.8)',
      'emerald-400': 'rgba(52, 211, 153, 0.8)',
      'emerald-600': 'rgba(5, 150, 105, 0.8)',
    };
    
    const startColorRGB = colors[startColor as keyof typeof colors] || 'rgba(96, 165, 250, 0.8)';
    const endColorRGB = colors[endColor as keyof typeof colors] || 'rgba(37, 99, 235, 0.8)';
    
    // Previous data for smooth transitions
    const prevData = new Array(bufferLength).fill(0);
    
    // Handle circle visualization properties
    const circle = {
      centerX: width / 2,
      centerY: height / 2,
      radius: Math.min(width, height) * 0.3,
      rotation: 0,
      particles: Array.from({ length: 180 }, (_, i) => ({
        angle: (i / 180) * Math.PI * 2,
        radius: Math.min(width, height) * 0.3,
        originalRadius: Math.min(width, height) * 0.3,
        speed: 0.01 + Math.random() * 0.02,
        size: 2 + Math.random() * 3
      }))
    };
    
    const renderFrame = () => {
      if (!ctx) return;
      
      // Ensure canvas dimensions stay updated
      updateCanvasSize();
      
      if (visualizerType === 'wave') {
        analyser.getByteTimeDomainData(dataArray);
      } else {
        analyser.getByteFrequencyData(dataArray);
      }
      
      // Clear canvas with a fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Create gradient that spans the full height
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, startColorRGB);
      gradient.addColorStop(1, endColorRGB);
      
      // Different visualizations
      if (visualizerType === 'bars') {
        // Bar visualizer - more spacing for cleaner look
        const barSpacing = 4;
        const barWidth = Math.max(3, (width / bufferLength) * 2 - barSpacing);
        
        let x = 0;
        const startFreq = 2; // Skip some low frequencies
        
        for (let i = startFreq; i < bufferLength; i += 1) {
          // Smooth transitions
          const target = dataArray[i] / 255;
          const smoothFactor = 0.2;
          prevData[i] = prevData[i] + (target * height - prevData[i]) * smoothFactor;
          const barHeight = prevData[i];
          
          // Draw fancy bars with rounded tops
          ctx.beginPath();
          
          // Base of the bar
          ctx.moveTo(x, height);
          ctx.lineTo(x, height - barHeight);
          
          // Rounded top
          const capHeight = Math.min(15, barHeight * 0.2);
          ctx.quadraticCurveTo(
            x + barWidth / 2, 
            height - barHeight - capHeight, 
            x + barWidth, 
            height - barHeight
          );
          
          ctx.lineTo(x + barWidth, height);
          ctx.closePath();
          
          // Fill with gradient
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Add highlight/glow effect on top of bars
          if (barHeight > 10) {
            ctx.beginPath();
            ctx.moveTo(x, height - barHeight);
            ctx.quadraticCurveTo(
              x + barWidth / 2, 
              height - barHeight - capHeight, 
              x + barWidth, 
              height - barHeight
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Add glow
            ctx.shadowColor = startColorRGB;
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          
          x += barWidth + barSpacing;
        }
      } else if (visualizerType === 'wave') {
        // Wave visualizer
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = gradient;
        
        const sliceWidth = width / bufferLength;
        let x = 0;
        
        // Draw the waveform
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * height / 2;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Use a curve instead of straight lines for smoother appearance
            const prevX = x - sliceWidth;
            const prevY = prevData[i-1] || y;
            
            // Smooth transition
            prevData[i] = y;
            
            const cpx = prevX + (x - prevX) / 2;
            ctx.quadraticCurveTo(cpx, prevY, x, y);
          }
          
          x += sliceWidth;
        }
        
        // Complete the path to the bottom right and back to start for a filled shape
        ctx.lineTo(width, height / 2);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.lineTo(0, height / 2);
        
        // Apply gradient fill
        ctx.fillStyle = startColorRGB.replace('0.8', '0.2'); // More transparent fill
        ctx.fill();
        
        // Add glow effect to the stroke
        ctx.shadowColor = startColorRGB;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (visualizerType === 'circle') {
        // Circle/particle visualizer
        
        // Rotate the entire visualization slowly
        circle.rotation += 0.005;
        
        // Update and draw particles
        for (let i = 0; i < circle.particles.length; i++) {
          const particle = circle.particles[i];
          const dataIndex = Math.floor(i * bufferLength / circle.particles.length);
          const amplitude = dataArray[dataIndex] / 255;
          
          // Dynamic radius based on audio amplitude
          const targetRadius = circle.radius * (1 + amplitude * 0.5);
          particle.radius += (targetRadius - particle.radius) * 0.1;
          
          // Calculate position with rotation
          const angle = particle.angle + circle.rotation;
          const x = circle.centerX + Math.cos(angle) * particle.radius;
          const y = circle.centerY + Math.sin(angle) * particle.radius;
          
          // Particle size based on amplitude
          const size = particle.size * (1 + amplitude);
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          
          // Color based on position/angle
          const hue = (i / circle.particles.length * 360) + (amplitude * 30);
          ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.3 + amplitude * 0.7})`;
          ctx.fill();
          
          // Add connecting lines between particles for a network effect
          if (i % 5 === 0 && i < circle.particles.length - 5) {
            const nextParticle = circle.particles[i + 5];
            const nextAngle = nextParticle.angle + circle.rotation;
            const nextX = circle.centerX + Math.cos(nextAngle) * nextParticle.radius;
            const nextY = circle.centerY + Math.sin(nextAngle) * nextParticle.radius;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, nextY);
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.1 + amplitude * 0.2})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(renderFrame);
    };
    
    // Start rendering
    renderFrame();
  };
  
  const stopVisualizer = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };
  
  const getActiveColor = () => {
    return soundColors[currentSound?.id || 'rain'] || 'from-blue-400 to-blue-600';
  };
  
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Sound Ambience
          </h3>
          
          {currentSound && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePlay()}
                className="p-2 bg-journal-primary rounded-full text-white hover:bg-journal-secondary transition-colors"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <div className="w-24 md:w-32">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))} 
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-journal-primary"
                />
              </div>
              
              <button 
                onClick={() => setVisualizerActive(!visualizerActive)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  visualizerActive 
                    ? 'bg-journal-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {visualizerActive ? 'Hide' : 'Show'} Visualizer
              </button>
            </div>
          )}
        </div>
        
        {currentSound && visualizerActive && (
          <div className="rounded-lg overflow-hidden h-20 mb-4 bg-gray-50 dark:bg-gray-900/50 shadow-inner">
            <canvas 
              ref={canvasRef}
              className={`w-full h-full bg-gradient-to-br ${getActiveColor()} opacity-5`}
            />
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 justify-center">
          {storeSounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => toggleSound(sound)}
              className={`flex flex-col items-center justify-center rounded-lg transition-all w-16 h-16 ${
                currentSound?.id === sound.id && isPlaying
                  ? `bg-gradient-to-r ${soundColors[sound.id]} text-white shadow-md`
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm'
              }`}
            >
              <span className="text-xl mb-1">{soundEmojis[sound.id] || '🔊'}</span>
              <span className="text-[9px] max-w-full px-1 truncate">{sound.name}</span>
              {currentSound?.id === sound.id && isPlaying && (
                <div className="flex space-x-0.5 mt-1">
                  <span className="w-0.5 h-2 bg-white rounded-full animate-sound-wave"></span>
                  <span className="w-0.5 h-2 bg-white rounded-full animate-sound-wave animation-delay-150"></span>
                  <span className="w-0.5 h-2 bg-white rounded-full animate-sound-wave animation-delay-300"></span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <audio ref={audioRef} loop />
    </div>
  );
};

export default SoundPlayer; 