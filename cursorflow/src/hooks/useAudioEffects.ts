import { useState, useEffect, useCallback, useRef } from 'react';

interface AudioManagerOptions {
  enabled?: boolean;
  masterVolume?: number;
}

export const useAudioEffects = (options: AudioManagerOptions = {}) => {
  const { enabled = true, masterVolume = 1.0 } = options;
  
  const [isAudioSupported, setIsAudioSupported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  // Create test audio element
  useEffect(() => {
    if (!enabled) return;

    // Create a simple test audio element
    testAudioRef.current = new Audio();
    testAudioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    testAudioRef.current.volume = 0.1;
    testAudioRef.current.preload = 'auto';
    
    setIsAudioSupported(true);
  }, [enabled]);

  // Force audio initialization on first user interaction
  const initializeAudio = useCallback(() => {
    if (hasUserInteracted) return;
    
    try {
      // Try Web Audio API first
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        console.log('Web Audio API initialized');
      }
      
      // Play test sound
      if (testAudioRef.current) {
        testAudioRef.current.play().then(() => {
          console.log('Test audio played successfully');
          setHasUserInteracted(true);
        }).catch((error) => {
          console.warn('Test audio failed:', error);
          // Still mark as interacted for fallback
          setHasUserInteracted(true);
        });
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      setHasUserInteracted(true);
    }
  }, [hasUserInteracted]);

  // Set up event listeners for audio initialization
  useEffect(() => {
    if (!enabled) return;

    const handleUserInteraction = () => {
      if (!hasUserInteracted) {
        initializeAudio();
      }
    };

    // Add event listeners for all possible user interactions
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('mousedown', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('mousemove', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousemove', handleUserInteraction);
    };
  }, [enabled, hasUserInteracted, initializeAudio]);

  const playTone = useCallback((frequency: number, duration: number, volume: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine') => {
    if (!audioContextRef.current || !isAudioSupported || isMuted || !hasUserInteracted) {
      return;
    }

    try {
      // Ensure audio context is running
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume * masterVolume,
        audioContextRef.current.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContextRef.current.currentTime + duration
      );

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.warn('Error playing audio effect:', error);
    }
  }, [isAudioSupported, isMuted, masterVolume, hasUserInteracted]);

  const playCursorMove = useCallback((velocity: number) => {
    if (velocity < 0.1) return;

    const frequency = Math.min(800, 200 + velocity * 100);
    const volume = Math.min(0.6, velocity * 0.06);
    
    // Random wave type for cursor movement
    const waveTypes = ['sine', 'triangle', 'sawtooth'] as const;
    const randomType = waveTypes[Math.floor(Math.random() * waveTypes.length)];
    
    // Main cursor sound
    playTone(frequency, 0.08, volume, randomType);
    
    // Subtle echo for cursor movement
    if (velocity > 0.3) {
      setTimeout(() => {
        playTone(frequency * 1.2, 0.05, volume * 0.4, randomType);
      }, 50);
    }
  }, [playTone]);

  const playClick = useCallback(() => {
    // Generate random click sound with echo and delay
    const sounds = [
      { freq: 400, type: 'square', duration: 0.2 },
      { freq: 300, type: 'sawtooth', duration: 0.15 },
      { freq: 500, type: 'triangle', duration: 0.25 },
      { freq: 350, type: 'square', duration: 0.18 },
      { freq: 450, type: 'sine', duration: 0.22 }
    ];
    
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    
    // Main sound
    playTone(randomSound.freq, randomSound.duration, 0.6, randomSound.type as any);
    
    // Echo effect with delay
    setTimeout(() => {
      playTone(randomSound.freq * 0.8, randomSound.duration * 0.7, 0.3, randomSound.type as any);
    }, 150);
    
    // Second echo
    setTimeout(() => {
      playTone(randomSound.freq * 0.6, randomSound.duration * 0.5, 0.15, randomSound.type as any);
    }, 300);
    
    // Third echo
    setTimeout(() => {
      playTone(randomSound.freq * 0.4, randomSound.duration * 0.3, 0.08, randomSound.type as any);
    }, 450);
  }, [playTone]);

  const playHover = useCallback(() => {
    // Generate random hover sound with subtle echo
    const hoverSounds = [
      { freq: 600, type: 'sine', duration: 0.08 },
      { freq: 550, type: 'triangle', duration: 0.1 },
      { freq: 650, type: 'sine', duration: 0.06 },
      { freq: 580, type: 'triangle', duration: 0.09 },
      { freq: 620, type: 'sine', duration: 0.07 }
    ];
    
    const randomHover = hoverSounds[Math.floor(Math.random() * hoverSounds.length)];
    
    // Main hover sound
    playTone(randomHover.freq, randomHover.duration, 0.4, randomHover.type as any);
    
    // Subtle echo
    setTimeout(() => {
      playTone(randomHover.freq * 1.1, randomHover.duration * 0.6, 0.2, randomHover.type as any);
    }, 80);
  }, [playTone]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setVolume = useCallback((volume: number) => {
    // This would update the master volume
    // For now, we'll just store it in the options
  }, []);

  return {
    playCursorMove,
    playClick,
    playHover,
    toggleMute,
    setVolume,
    isAudioSupported,
    isMuted,
    hasUserInteracted,
    enabled: enabled && isAudioSupported && hasUserInteracted
  };
}; 