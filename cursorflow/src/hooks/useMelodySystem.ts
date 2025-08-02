import { useState, useEffect, useCallback, useRef } from 'react';

interface MelodyNote {
  frequency: number;
  duration: number;
  type: 'sine' | 'triangle' | 'square' | 'sawtooth';
  effects: {
    reverb?: boolean;
    delay?: boolean;
    distortion?: boolean;
    chorus?: boolean;
    phaser?: boolean;
  };
}

interface MelodySystemOptions {
  enabled?: boolean;
  baseFrequency?: number;
  volume?: number;
  autoPlay?: boolean;
}

export const useMelodySystem = (options: MelodySystemOptions = {}) => {
  const { 
    enabled = true, 
    baseFrequency = 220, 
    volume = 0.4, // Increased from 0.15 to make it audible
    autoPlay = true 
  } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPitch, setCurrentPitch] = useState(0);
  const [melodyNotes, setMelodyNotes] = useState<MelodyNote[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastYPositionRef = useRef<number>(0);
  const lastXPositionRef = useRef<number>(window.innerWidth / 2);
  const lastNoteTimeRef = useRef<number>(0);
  const melodyIntervalRef = useRef<number | null>(null);

  // Initialize audio context
  const initializeAudio = useCallback(() => {
    if (!enabled || audioContextRef.current) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        console.log('Melody system audio initialized');
      }
    } catch (error) {
      console.warn('Melody audio initialization failed:', error);
    }
  }, [enabled]);

  // Create COMPLETELY RANDOMIZED melody with crazy effects
  const createBaseMelody = useCallback(() => {
    const melody: MelodyNote[] = [];
    
    // Create COMPLETELY RANDOMIZED melody - MUCH MORE FUN!
    for (let i = 0; i < 32; i++) {
      // Random frequency - much more varied
      const randomFreq = baseFrequency * (0.1 + Math.random() * 4); // 0.1x to 4x base frequency
      
      // Random wave type
      const waveTypes = ['sine', 'triangle', 'square', 'sawtooth'] as const;
      const randomType = waveTypes[Math.floor(Math.random() * waveTypes.length)];
      
      // Random duration
      const duration = 0.05 + Math.random() * 3.0; // 0.05s to 3s
      
      // Random effects - much more varied
      const effects = {
        reverb: Math.random() > 0.6,
        delay: Math.random() > 0.5,
        distortion: Math.random() > 0.7,
        chorus: Math.random() > 0.4,
        phaser: Math.random() > 0.8
      };
      
      melody.push({
        frequency: randomFreq,
        duration: duration,
        type: randomType,
        effects: effects
      });
    }
    
    return melody;
  }, [baseFrequency]);

  // Play a single note with CRAZY dynamic effects
  const playNote = useCallback((note: MelodyNote, pitchOffset: number = 0, velocity: number = 0, xPosition: number = window.innerWidth / 2) => {
    if (!audioContextRef.current || !enabled) return;

    try {
      // Ensure audio context is running
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      const filterNode = audioContextRef.current.createBiquadFilter();

      // Create effect nodes
      const delayNode = audioContextRef.current.createDelay();
      const distortionNode = audioContextRef.current.createWaveShaper();
      const chorusNode = audioContextRef.current.createOscillator();
      const phaserNode = audioContextRef.current.createBiquadFilter();

      // Connect nodes based on effects
      let currentNode: AudioNode = oscillator;
      
      if (note.effects.phaser) {
        phaserNode.type = 'allpass';
        phaserNode.frequency.setValueAtTime(1000, audioContextRef.current.currentTime);
        currentNode.connect(phaserNode);
        currentNode = phaserNode;
      }
      
      if (note.effects.distortion) {
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
          curve[i] = Math.tanh(i / 44100 * 10 - 5);
        }
        distortionNode.curve = curve;
        currentNode.connect(distortionNode);
        currentNode = distortionNode;
      }
      
      if (note.effects.chorus) {
        chorusNode.frequency.setValueAtTime(2, audioContextRef.current.currentTime);
        const chorusGain = audioContextRef.current.createGain();
        chorusGain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        chorusNode.connect(chorusGain);
        currentNode.connect(chorusGain);
        currentNode = chorusGain;
      }
      
      if (note.effects.delay) {
        delayNode.delayTime.setValueAtTime(0.3, audioContextRef.current.currentTime);
        currentNode.connect(delayNode);
        delayNode.connect(filterNode);
      } else {
        currentNode.connect(filterNode);
      }
      
      filterNode.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;
      
      // CRAZY pitch modulation based on position
      const xRatio = xPosition / window.innerWidth;
      const pitchMultiplier = Math.pow(2, (pitchOffset + (xRatio - 0.5) * 24) / 12);
      const velocityMultiplier = 1 + (Math.abs(velocity) * 0.1);
      const adjustedFreq = note.frequency * pitchMultiplier * velocityMultiplier;
      
      // Add frequency modulation for crazy effects
      oscillator.frequency.setValueAtTime(adjustedFreq, currentTime);
      if (Math.random() > 0.7) {
        oscillator.frequency.exponentialRampToValueAtTime(adjustedFreq * 1.5, currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(adjustedFreq, currentTime + 0.2);
      }
      oscillator.type = note.type;

      // CRAZY filter effects based on position
      const filterFreq = 200 + (xRatio * 8000) + (Math.abs(pitchOffset) * 1000);
      filterNode.frequency.setValueAtTime(filterFreq, currentTime);
      filterNode.Q.setValueAtTime(1 + Math.abs(pitchOffset) * 2, currentTime);

      // MUCH QUIETER volume with crazy modulation
      const baseVolume = volume * 0.3; // Increased from 0.1 to make notes audible
      const positionVolume = 0.3 + Math.abs(pitchOffset) * 0.1; // Increased from 0.1
      const velocityVolume = 0.8 + Math.abs(velocity) * 0.2; // Small velocity effect
      const xVolume = 0.5 + (xRatio * 0.5); // X position affects volume
      const dynamicVolume = baseVolume * positionVolume * velocityVolume * xVolume;
      
      // Add volume modulation for ambient feel
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(dynamicVolume, currentTime + 0.1);
      
      // Add crazy volume modulation
      if (Math.random() > 0.8) {
        gainNode.gain.setValueAtTime(dynamicVolume * 0.5, currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(dynamicVolume, currentTime + 0.3);
      }
      
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + note.duration);
      
      // Start effect oscillators
      if (note.effects.chorus) {
        chorusNode.start(currentTime);
        chorusNode.stop(currentTime + note.duration);
      }
    } catch (error) {
      console.warn('Error playing melody note:', error);
    }
  }, [enabled, volume]);

  // Start continuous melody with MUCH SLOWER timing
  const startMelody = useCallback(() => {
    if (!enabled || isPlaying) return;
    
    initializeAudio();
    const melody = createBaseMelody();
    setMelodyNotes(melody);
    setIsPlaying(true);
    
    // Start continuous melody loop with RANDOMIZED timing
    let noteIndex = 0;
    let lastVelocity = 0;
    
    const playRandomNote = () => {
      if (melody.length > 0) {
        const note = melody[noteIndex % melody.length];
        const screenCenter = window.innerHeight / 2;
        const pitchOffset = (screenCenter - lastYPositionRef.current) / 100; // Much less sensitive
        const xPosition = lastXPositionRef.current;
        
        // Random chance to play note - much more varied
        if (Math.random() > 0.4) { // 60% chance to play note
          playNote(note, pitchOffset, lastVelocity, xPosition);
        }
        noteIndex++;
      }
      
      // Schedule next note with RANDOM timing
      const randomDelay = 200 + Math.random() * 1200; // 200ms to 1400ms
      melodyIntervalRef.current = window.setTimeout(playRandomNote, randomDelay);
    };
    
    playRandomNote();
  }, [enabled, isPlaying, initializeAudio, createBaseMelody, playNote]);

  // Stop melody
  const stopMelody = useCallback(() => {
    setIsPlaying(false);
    if (melodyIntervalRef.current) {
      clearTimeout(melodyIntervalRef.current);
      melodyIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Update melody based on mouse movement with CRAZY effects
  const updateMelodyFromMouse = useCallback((yPosition: number, velocity: number, xPosition: number) => {
    if (!enabled || !isPlaying) return;

    // Store current positions and velocity for dynamic effects
    lastYPositionRef.current = yPosition;
    lastXPositionRef.current = xPosition;
    lastNoteTimeRef.current = performance.now();

    // Update current pitch with much less sensitivity
    const screenCenter = window.innerHeight / 2;
    const newPitch = (screenCenter - yPosition) / 100; // Much less sensitive
    setCurrentPitch(newPitch);

    // Trigger CRAZY additional notes on fast movement
    if (Math.abs(velocity) > 0.1) {
      const melody = melodyNotes;
      if (melody.length > 0) {
        // Play multiple random notes for crazy effect
        const numNotes = Math.floor(Math.abs(velocity) * 5) + 1;
        for (let i = 0; i < numNotes; i++) {
          const randomNote = melody[Math.floor(Math.random() * melody.length)];
          const pitchOffset = newPitch + (Math.random() - 0.5) * 12; // Add random pitch variation
          setTimeout(() => {
            playNote(randomNote, pitchOffset, velocity, xPosition);
          }, i * 50); // Stagger the notes
        }
      }
    }
    
    // Add ambient drone notes based on position
    if (Math.random() > 0.95) { // Very rare
      const droneNote: MelodyNote = {
        frequency: baseFrequency * (0.5 + Math.random() * 2),
        duration: 2 + Math.random() * 3,
        type: 'sine',
        effects: { reverb: true, delay: true }
      };
      playNote(droneNote, newPitch, velocity, xPosition);
    }
  }, [enabled, isPlaying, melodyNotes, playNote, baseFrequency]);

  // Auto-start melody on first mouse movement
  useEffect(() => {
    if (autoPlay && enabled && !isPlaying) {
      const handleFirstMove = () => {
        startMelody();
        document.removeEventListener('mousemove', handleFirstMove);
      };
      
      document.addEventListener('mousemove', handleFirstMove, { once: true });
      
      return () => {
        document.removeEventListener('mousemove', handleFirstMove);
      };
    }
  }, [autoPlay, enabled, isPlaying, startMelody]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (melodyIntervalRef.current) {
        clearTimeout(melodyIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    startMelody,
    stopMelody,
    updateMelodyFromMouse,
    isPlaying,
    currentPitch,
    enabled: enabled && isPlaying
  };
}; 