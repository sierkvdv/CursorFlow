import { useState, useEffect, useCallback, useRef } from 'react';

interface DrumPattern {
  id: string;
  name: string;
  pattern: {
    kick: number[];
    snare: number[];
    hihat: number[];
    clap: number[];
    tom: number[];
    crash: number[];
  };
  bpm: number;
  swing: number;
}

interface DrumSystemOptions {
  enabled?: boolean;
  volume?: number;
  autoPlay?: boolean;
  baseBpm?: number;
}

export const useDrumSystem = (options: DrumSystemOptions = {}) => {
  const { 
    enabled = true, 
    volume = 1.2, // Increased from 0.8 to make drums more audible
    autoPlay = true,
    baseBpm = 120
  } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBpm, setCurrentBpm] = useState(baseBpm);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const drumIntervalRef = useRef<number | null>(null);
  const lastXPositionRef = useRef<number>(window.innerWidth / 2);
  const lastBpmUpdateRef = useRef<number>(0);

  // Much more diverse drum patterns with different styles
  const drumPatterns: DrumPattern[] = [
    {
      id: 'basic',
      name: 'Basic Beat',
      pattern: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 120,
      swing: 0
    },
    {
      id: 'breakbeat',
      name: 'Breakbeat',
      pattern: {
        kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 140,
      swing: 0.1
    },
    {
      id: 'trap',
      name: 'Trap',
      pattern: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 140,
      swing: 0
    },
    {
      id: 'house',
      name: 'House',
      pattern: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 128,
      swing: 0
    },
    {
      id: 'dubstep',
      name: 'Dubstep',
      pattern: {
        kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 140,
      swing: 0
    },
    {
      id: 'jungle',
      name: 'Jungle',
      pattern: {
        kick: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 160,
      swing: 0.2
    },
    {
      id: 'techno',
      name: 'Techno',
      pattern: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 130,
      swing: 0
    },
    {
      id: 'drumandbass',
      name: 'Drum & Bass',
      pattern: {
        kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 170,
      swing: 0.15
    },
    {
      id: 'ambient',
      name: 'Ambient',
      pattern: {
        kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tom: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 80,
      swing: 0
    },
    {
      id: 'experimental',
      name: 'Experimental',
      pattern: {
        kick: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0],
        snare: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 110,
      swing: 0.3
    },
    {
      id: 'minimal',
      name: 'Minimal',
      pattern: {
        kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 90,
      swing: 0
    },
    {
      id: 'chaotic',
      name: 'Chaotic',
      pattern: {
        kick: [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
        snare: [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        clap: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        tom: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      bpm: 180,
      swing: 0.4
    }
  ];

  // Initialize audio context
  const initializeAudio = useCallback(() => {
    if (!enabled || audioContextRef.current) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        console.log('Drum system audio initialized');
      }
    } catch (error) {
      console.warn('Drum audio initialization failed:', error);
    }
  }, [enabled]);

  // Create much more diverse drum sounds
  const createDrumSound = useCallback((type: 'kick' | 'snare' | 'hihat' | 'clap' | 'tom' | 'crash') => {
    if (!audioContextRef.current || !enabled) return;

    try {
      // Ensure audio context is running
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      const filterNode = audioContextRef.current.createBiquadFilter();

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;

      // Get current mouse position for sound variation
      const mouseX = lastXPositionRef.current;
      const positionRatio = mouseX / window.innerWidth;

      // MUCH LOWER and randomized drum sounds
      switch (type) {
        case 'kick':
          const kickFreq = 20 + (Math.random() * 40); // 20-60 Hz (much lower)
          oscillator.frequency.setValueAtTime(kickFreq, currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(0.01, currentTime + 0.4);
          filterNode.frequency.setValueAtTime(200 + (Math.random() * 800), currentTime);
          filterNode.frequency.exponentialRampToValueAtTime(20, currentTime + 0.4);
          gainNode.gain.setValueAtTime(volume * (0.4 + Math.random() * 0.4), currentTime); // Increased from 0.2-0.5 to 0.4-0.8
          gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);
          break;
        
        case 'snare':
          const snareFreq = 80 + (Math.random() * 120); // 80-200 Hz (much lower)
          oscillator.frequency.setValueAtTime(snareFreq, currentTime);
          filterNode.frequency.setValueAtTime(1000 + (Math.random() * 2000), currentTime);
          filterNode.frequency.exponentialRampToValueAtTime(30, currentTime + 0.3);
          gainNode.gain.setValueAtTime(volume * (0.3 + Math.random() * 0.3), currentTime); // Increased from 0.15-0.35 to 0.3-0.6
          gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
          break;
        
        case 'hihat':
          const hihatFreq = 150 + (Math.random() * 300); // 150-450 Hz (much lower)
          oscillator.frequency.setValueAtTime(hihatFreq, currentTime);
          filterNode.frequency.setValueAtTime(2000 + (Math.random() * 3000), currentTime);
          gainNode.gain.setValueAtTime(volume * (0.25 + Math.random() * 0.25), currentTime); // Increased from 0.1-0.25 to 0.25-0.5
          gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1);
          break;
        
        case 'clap':
          const clapFreq = 200 + (Math.random() * 400); // 200-600 Hz (much lower)
          oscillator.frequency.setValueAtTime(clapFreq, currentTime);
          filterNode.frequency.setValueAtTime(1500 + (Math.random() * 2000), currentTime);
          gainNode.gain.setValueAtTime(volume * (0.3 + Math.random() * 0.3), currentTime); // Increased from 0.15-0.35 to 0.3-0.6
          gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);
          break;

        case 'tom':
          const tomFreq = 40 + (Math.random() * 80); // 40-120 Hz (much lower)
          oscillator.frequency.setValueAtTime(tomFreq, currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(10, currentTime + 0.5);
          filterNode.frequency.setValueAtTime(400 + (Math.random() * 600), currentTime);
          filterNode.frequency.exponentialRampToValueAtTime(50, currentTime + 0.5);
          gainNode.gain.setValueAtTime(volume * (0.4 + Math.random() * 0.4), currentTime); // Increased from 0.2-0.45 to 0.4-0.8
          gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.5);
          break;

        case 'crash':
          const crashFreq = 100 + (Math.random() * 200); // 100-300 Hz (much lower)
          oscillator.frequency.setValueAtTime(crashFreq, currentTime);
          filterNode.frequency.setValueAtTime(1500 + (Math.random() * 2000), currentTime);
          gainNode.gain.setValueAtTime(volume * (0.25 + Math.random() * 0.25), currentTime); // Increased from 0.1-0.25 to 0.25-0.5
          gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.8);
          break;
      }

      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.8); // Longer, gentler sounds
    } catch (error) {
      console.warn('Error playing drum sound:', error);
    }
  }, [enabled, volume]);

  // Create COMPLETELY RANDOMIZED dynamic pattern
  const createDynamicPattern = useCallback((positionRatio: number, velocity: number) => {
    const pattern = {
      kick: new Array(16).fill(0),
      snare: new Array(16).fill(0),
      hihat: new Array(16).fill(0),
      clap: new Array(16).fill(0),
      tom: new Array(16).fill(0),
      crash: new Array(16).fill(0)
    };

    // COMPLETELY RANDOMIZED PATTERNS - MUCH MORE FUN!
    for (let i = 0; i < 16; i++) {
      // Random kicks - more likely on the right side
      const kickChance = 0.1 + (positionRatio * 0.4); // 10% left, 50% right
      if (Math.random() < kickChance) {
        pattern.kick[i] = 1;
      }
      
      // Random snares - more likely in the middle
      const snareChance = 0.05 + (Math.abs(positionRatio - 0.5) * 0.3); // 5% edges, 20% center
      if (Math.random() < snareChance) {
        pattern.snare[i] = 1;
      }
      
      // Random hihats - more likely on the right
      const hihatChance = 0.2 + (positionRatio * 0.6); // 20% left, 80% right
      if (Math.random() < hihatChance) {
        pattern.hihat[i] = 1;
      }
      
      // Random claps - rare but fun
      const clapChance = 0.02 + (positionRatio * 0.08); // 2% left, 10% right
      if (Math.random() < clapChance) {
        pattern.clap[i] = 1;
      }
      
      // Random toms - very rare
      const tomChance = 0.01 + (positionRatio * 0.04); // 1% left, 5% right
      if (Math.random() < tomChance) {
        pattern.tom[i] = 1;
      }
      
      // Random crashes - super rare
      const crashChance = 0.005 + (positionRatio * 0.015); // 0.5% left, 2% right
      if (Math.random() < crashChance) {
        pattern.crash[i] = 1;
      }
    }

    // Add velocity-based randomization for extra fun
    if (Math.abs(velocity) > 1) {
      for (let i = 0; i < 16; i++) {
        // Add random kicks with velocity
        if (Math.random() < Math.abs(velocity) * 0.1) {
          pattern.kick[i] = Math.random() > 0.3 ? 1 : 0;
        }
        // Add random snares with velocity
        if (Math.random() < Math.abs(velocity) * 0.05) {
          pattern.snare[i] = Math.random() > 0.4 ? 1 : 0;
        }
        // Add random hihats with velocity
        if (Math.random() < Math.abs(velocity) * 0.15) {
          pattern.hihat[i] = Math.random() > 0.2 ? 1 : 0;
        }
        // Add random toms with velocity
        if (Math.random() < Math.abs(velocity) * 0.02) {
          pattern.tom[i] = Math.random() > 0.6 ? 1 : 0;
        }
      }
    }

    // Add some guaranteed beats for structure
    if (positionRatio > 0.3) {
      pattern.kick[0] = 1; // Always kick on first beat if not too far left
    }
    if (positionRatio > 0.4) {
      pattern.snare[4] = 1; // Always snare on beat 5 if in center/right
    }
    if (positionRatio > 0.6) {
      pattern.kick[8] = 1; // Always kick on beat 9 if on right
    }
    if (positionRatio > 0.7) {
      pattern.snare[12] = 1; // Always snare on beat 13 if far right
    }

    return pattern;
  }, []);

  // Start drum loop with much more dynamic changes
  const startDrumLoop = useCallback(() => {
    if (!enabled || isPlaying) return;
    
    initializeAudio();
    setIsPlaying(true);
    
    console.log('Starting dynamic drum loop...');
    
    // Start drum loop that plays continuously with dynamic changes
    drumIntervalRef.current = window.setInterval(() => {
      // Get current mouse position for dynamic pattern
      const mouseX = lastXPositionRef.current;
      const positionRatio = mouseX / window.innerWidth;
      const dynamicPattern = createDynamicPattern(positionRatio, 0);

      // Apply swing to timing
      const swingOffset = 0.2 * (currentStep % 2 === 1 ? 0.5 : 0);
      const stepTime = (60 / currentBpm) * 1000 * (1 + swingOffset);

      // Play sounds based on dynamic pattern - NO RANDOMIZATION
      if (dynamicPattern.kick[currentStep]) {
        createDrumSound('kick');
      }
      if (dynamicPattern.snare[currentStep]) {
        createDrumSound('snare');
      }
      if (dynamicPattern.hihat[currentStep]) {
        createDrumSound('hihat');
      }
      if (dynamicPattern.clap[currentStep]) {
        createDrumSound('clap');
      }
      if (dynamicPattern.tom[currentStep]) {
        createDrumSound('tom');
      }
      if (dynamicPattern.crash[currentStep]) {
        createDrumSound('crash');
      }

      // Move to next step
      setCurrentStep((prev) => (prev + 1) % 16);
    }, (60 / currentBpm) * 1000);
  }, [enabled, isPlaying, initializeAudio, currentBpm, currentStep, createDrumSound, createDynamicPattern]);

  // Stop drum loop
  const stopDrumLoop = useCallback(() => {
    setIsPlaying(false);
    if (drumIntervalRef.current) {
      clearInterval(drumIntervalRef.current);
      drumIntervalRef.current = null;
    }
  }, []);

  // Much more responsive drum system based on horizontal mouse movement
  const updateDrumFromMouse = useCallback((xPosition: number, velocity: number) => {
    if (!enabled) return;

    const currentTime = performance.now();
    
    // EXTREMELY dramatic BPM changes based on horizontal position
    const screenCenter = window.innerWidth / 2;
    const bpmOffset = (xPosition - screenCenter) / 0.5; // Ultra sensitive: 0.5px = 1 BPM change
    const newBpm = Math.max(40, Math.min(240, baseBpm + bpmOffset));
    
    // Much more granular pattern changes - create patterns based on exact position
    const screenWidth = window.innerWidth;
    const positionRatio = xPosition / screenWidth;
    
    // Create dynamic pattern based on exact position
    const dynamicPattern = createDynamicPattern(positionRatio, velocity);
    
    // Always update for maximum responsiveness
    if (Math.abs(newBpm - currentBpm) > 0.001 || true) { // Always update pattern
      setCurrentBpm(newBpm);
      
      console.log(`Drum change: Dynamic pattern at ${Math.round(newBpm)} BPM (pos: ${Math.round(xPosition)}, ratio: ${positionRatio.toFixed(2)})`);
      
      // Restart interval with new BPM and dynamic pattern
      if (drumIntervalRef.current) {
        clearInterval(drumIntervalRef.current);
        drumIntervalRef.current = window.setInterval(() => {
          // Apply swing to timing
          const swingOffset = 0.2 * (currentStep % 2 === 1 ? 0.5 : 0);
          const stepTime = (60 / newBpm) * 1000 * (1 + swingOffset);

          // Play sounds based on dynamic pattern - NO RANDOMIZATION, JUST PLAY WHAT'S IN THE PATTERN
          if (dynamicPattern.kick[currentStep]) {
            createDrumSound('kick');
          }
          if (dynamicPattern.snare[currentStep]) {
            createDrumSound('snare');
          }
          if (dynamicPattern.hihat[currentStep]) {
            createDrumSound('hihat');
          }
          if (dynamicPattern.clap[currentStep]) {
            createDrumSound('clap');
          }
          if (dynamicPattern.tom[currentStep]) {
            createDrumSound('tom');
          }
          if (dynamicPattern.crash[currentStep]) {
            createDrumSound('crash');
          }

          setCurrentStep((prev) => (prev + 1) % 16);
        }, (60 / newBpm) * 1000);
      }
      
      lastBpmUpdateRef.current = currentTime;
    }

    lastXPositionRef.current = xPosition;
  }, [enabled, baseBpm, currentBpm, currentStep, createDrumSound, createDynamicPattern]);

  // Auto-start drum loop on first mouse movement - NOW STARTS IMMEDIATELY
  useEffect(() => {
    if (autoPlay && enabled && !isPlaying) {
      // Start immediately when component mounts
      startDrumLoop();
      
      // Also listen for first mouse movement as backup
      const handleFirstMove = () => {
        if (!isPlaying) {
          startDrumLoop();
        }
        document.removeEventListener('mousemove', handleFirstMove);
      };
      
      document.addEventListener('mousemove', handleFirstMove, { once: true });
      
      return () => {
        document.removeEventListener('mousemove', handleFirstMove);
      };
    }
  }, [autoPlay, enabled, isPlaying, startDrumLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (drumIntervalRef.current) {
        clearInterval(drumIntervalRef.current);
      }
    };
  }, []);

  return {
    startDrumLoop,
    stopDrumLoop,
    updateDrumFromMouse,
    isPlaying,
    currentBpm,
    currentPattern: drumPatterns[currentPattern]?.name || 'Basic Beat',
    enabled: enabled && isPlaying
  };
}; 