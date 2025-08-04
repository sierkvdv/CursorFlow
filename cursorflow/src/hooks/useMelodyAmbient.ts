import { useRef, useEffect, useCallback } from 'react';

interface MelodyAmbientOptions {
  enabled?: boolean;
  baseVolume?: number;
}

export const useMelodyAmbient = ({
  enabled = false,
  baseVolume = 0.08 // Much softer for ambient feel
}: MelodyAmbientOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  const lastNoteTimeRef = useRef(0);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainsRef = useRef<GainNode[]>([]);
  
  // Oscillators
  const melodyOsc1Ref = useRef<OscillatorNode | null>(null);
  const melodyOsc2Ref = useRef<OscillatorNode | null>(null);
  const harmonyOsc1Ref = useRef<OscillatorNode | null>(null);
  const harmonyOsc2Ref = useRef<OscillatorNode | null>(null);
  
  // Gain nodes
  const melodyGain1Ref = useRef<GainNode | null>(null);
  const melodyGain2Ref = useRef<GainNode | null>(null);
  const harmonyGain1Ref = useRef<GainNode | null>(null);
  const harmonyGain2Ref = useRef<GainNode | null>(null);
  
  // Filters
  const melodyFilterRef = useRef<BiquadFilterNode | null>(null);
  const harmonyFilterRef = useRef<BiquadFilterNode | null>(null);
  
  // LFO
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  
  // Delay
  const delayRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);

  // Musical scales
  const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00];
  const minorScale = [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16];
  const majorScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];

  // Initialize audio context
  const initAudio = useCallback(async () => {
    if (!enabled) return;

    try {
      // Close existing context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      
      // Create new audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Create LFO
      lfoRef.current = audioContextRef.current.createOscillator();
      lfoRef.current.type = 'sine';
      lfoRef.current.frequency.setValueAtTime(0.2, audioContextRef.current.currentTime);
      lfoGainRef.current = audioContextRef.current.createGain();
      lfoGainRef.current.gain.setValueAtTime(15, audioContextRef.current.currentTime);
      
      // Create gain nodes
      melodyGain1Ref.current = audioContextRef.current.createGain();
      melodyGain2Ref.current = audioContextRef.current.createGain();
      harmonyGain1Ref.current = audioContextRef.current.createGain();
      harmonyGain2Ref.current = audioContextRef.current.createGain();
      
      // Create filters
      melodyFilterRef.current = audioContextRef.current.createBiquadFilter();
      melodyFilterRef.current.type = 'lowpass';
      melodyFilterRef.current.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      melodyFilterRef.current.Q.setValueAtTime(1.0, audioContextRef.current.currentTime);
      
      harmonyFilterRef.current = audioContextRef.current.createBiquadFilter();
      harmonyFilterRef.current.type = 'lowpass';
      harmonyFilterRef.current.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
      harmonyFilterRef.current.Q.setValueAtTime(0.8, audioContextRef.current.currentTime);
      
      // Create delay
      delayRef.current = audioContextRef.current.createDelay();
      delayRef.current.delayTime.setValueAtTime(0.3, audioContextRef.current.currentTime);
      
      delayGainRef.current = audioContextRef.current.createGain();
      delayGainRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      
      // Create oscillators
      melodyOsc1Ref.current = audioContextRef.current.createOscillator();
      melodyOsc1Ref.current.type = 'sine';
      melodyOsc1Ref.current.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
      melodyOsc1Ref.current.connect(melodyGain1Ref.current);
      
      melodyOsc2Ref.current = audioContextRef.current.createOscillator();
      melodyOsc2Ref.current.type = 'triangle';
      melodyOsc2Ref.current.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
      melodyOsc2Ref.current.connect(melodyGain2Ref.current);
      
      harmonyOsc1Ref.current = audioContextRef.current.createOscillator();
      harmonyOsc1Ref.current.type = 'sine';
      harmonyOsc1Ref.current.frequency.setValueAtTime(330, audioContextRef.current.currentTime);
      harmonyOsc1Ref.current.connect(harmonyGain1Ref.current);
      
      harmonyOsc2Ref.current = audioContextRef.current.createOscillator();
      harmonyOsc2Ref.current.type = 'square';
      harmonyOsc2Ref.current.frequency.setValueAtTime(660, audioContextRef.current.currentTime);
      harmonyOsc2Ref.current.connect(harmonyGain2Ref.current);
      
      // Connect gains to filters
      melodyGain1Ref.current.connect(melodyFilterRef.current);
      melodyGain2Ref.current.connect(melodyFilterRef.current);
      harmonyGain1Ref.current.connect(harmonyFilterRef.current);
      harmonyGain2Ref.current.connect(harmonyFilterRef.current);
      
      // Connect filters to delay and destination
      melodyFilterRef.current.connect(delayRef.current);
      harmonyFilterRef.current.connect(delayRef.current);
      
      melodyFilterRef.current.connect(audioContextRef.current.destination);
      harmonyFilterRef.current.connect(audioContextRef.current.destination);
      
      // Connect delay
      delayRef.current.connect(delayGainRef.current);
      delayGainRef.current.connect(audioContextRef.current.destination);
      
      // Start oscillators
      melodyOsc1Ref.current.start();
      melodyOsc2Ref.current.start();
      harmonyOsc1Ref.current.start();
      harmonyOsc2Ref.current.start();
      lfoRef.current.start();
      
      // Set initial volumes to 0
      melodyGain1Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      melodyGain2Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      harmonyGain1Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      harmonyGain2Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      
      isPlayingRef.current = true;
    } catch (error) {
      console.error('Failed to initialize melody system:', error);
    }
  }, [enabled, baseVolume]);

  // Update melody from mouse movement
  const updateMelodyFromMouse = useCallback((x: number, y: number, velocity: number) => {
    if (!enabled || !audioContextRef.current || !isPlayingRef.current) {
      return;
    }

    // Throttle updates - MORE AGGRESSIVE TO PREVENT OVERLOAD
    const now = Date.now();
    const throttleTime = 50; // 50ms instead of 20ms
    if (now - lastUpdateRef.current < throttleTime) return;
    lastUpdateRef.current = now;

    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    
    const xNormalized = x / window.innerWidth;
    const yNormalized = y / window.innerHeight;
    
    const velocityMultiplier = 1 + (velocity * 2.0);
    
    // Determine scale
    let currentScale = pentatonicScale;
    if (xNormalized < 0.33) {
      currentScale = pentatonicScale;
    } else if (xNormalized < 0.66) {
      currentScale = minorScale;
    } else {
      currentScale = majorScale;
    }
    
    // Calculate frequencies
    const baseFreqIndex = Math.floor(yNormalized * currentScale.length);
    const baseFreq = currentScale[Math.min(baseFreqIndex, currentScale.length - 1)];
    
    const octaveMultiplier = 1 + Math.floor(velocity * 3);
    const melodyFreq1 = baseFreq * octaveMultiplier;
    const melodyFreq2 = baseFreq * (octaveMultiplier + 1);
    
    const harmonyFreq1 = baseFreq * 1.25;
    const harmonyFreq2 = baseFreq * 1.5;
    
    // Update frequencies
    if (melodyOsc1Ref.current && melodyOsc2Ref.current) {
      melodyOsc1Ref.current.frequency.setTargetAtTime(melodyFreq1, audioTime, 0.1);
      melodyOsc2Ref.current.frequency.setTargetAtTime(melodyFreq2, audioTime, 0.1);
    }
    
    if (harmonyOsc1Ref.current && harmonyOsc2Ref.current) {
      harmonyOsc1Ref.current.frequency.setTargetAtTime(harmonyFreq1, audioTime, 0.15);
      harmonyOsc2Ref.current.frequency.setTargetAtTime(harmonyFreq2, audioTime, 0.15);
    }
    
    // Calculate volumes
    const melodyVolume = Math.max(0.1, baseVolume * velocityMultiplier * 2.0);
    const harmonyVolume = Math.max(0.05, baseVolume * velocityMultiplier * 1.5);
    
    // Update filters
    if (melodyFilterRef.current) {
      const cutoff = 800 - (yNormalized * 400) + Math.sin(audioTime * 0.5) * 100;
      melodyFilterRef.current.frequency.setTargetAtTime(Math.max(200, cutoff), audioTime, 0.3);
    }
    
    if (harmonyFilterRef.current) {
      const cutoff = 600 - (yNormalized * 300) + Math.sin(audioTime * 0.7) * 80;
      harmonyFilterRef.current.frequency.setTargetAtTime(Math.max(150, cutoff), audioTime, 0.35);
    }
    
    // Update LFO
    if (lfoRef.current) {
      const lfoRate = 0.2 + (velocity * 0.5) + Math.sin(audioTime * 0.3) * 0.2;
      lfoRef.current.frequency.setTargetAtTime(lfoRate, audioTime, 0.4);
    }
    
    // Update delay
    if (delayRef.current) {
      const delayTime = 0.1 + (xNormalized * 0.4) + Math.sin(audioTime * 0.2) * 0.1;
      delayRef.current.delayTime.setTargetAtTime(delayTime, audioTime, 0.5);
    }
    
    // Trigger notes - SLOWER AND MORE MELODIC
    const isMobile = window.innerWidth <= 768;
    const velocityThreshold = isMobile ? 0.05 : 0.1; // Lower threshold on mobile
    const timeThreshold = isMobile ? 0.3 : 0.5; // Much slower response (0.3-0.5s between melodies)
    
    if (velocity > velocityThreshold && audioTime - lastNoteTimeRef.current > timeThreshold) {
      lastNoteTimeRef.current = audioTime;
      
      // Create a real melody sequence instead of just one note
      const melodySequence = createMelodySequence(currentScale, velocity);
      playMelodySequence(melodySequence, melodyVolume, harmonyVolume, velocity);
      
      // More frequent flourishes on mobile
      const flourishThreshold = isMobile ? 0.2 : 0.3;
      const flourishChance = isMobile ? 0.5 : 0.7;
      if (velocity > flourishThreshold && Math.random() > flourishChance) {
        const flourishFreq = currentScale[Math.floor(Math.random() * currentScale.length)];
        playMelodicFlourish(flourishFreq, velocity);
      }
    }
    
  }, [enabled, baseVolume]);

  // Play melody note
  const playMelodyNote = useCallback((melodyFreq1: number, melodyFreq2: number, harmonyFreq1: number, harmonyFreq2: number, melodyVolume: number, harmonyVolume: number, velocity: number) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    const duration = 0.3 + (velocity * 0.4);
    
    // Update frequencies
    if (melodyOsc1Ref.current && melodyOsc2Ref.current) {
      melodyOsc1Ref.current.frequency.setValueAtTime(melodyFreq1, audioTime);
      melodyOsc2Ref.current.frequency.setValueAtTime(melodyFreq2, audioTime);
    }
    
    if (harmonyOsc1Ref.current && harmonyOsc2Ref.current) {
      harmonyOsc1Ref.current.frequency.setValueAtTime(harmonyFreq1, audioTime);
      harmonyOsc2Ref.current.frequency.setValueAtTime(harmonyFreq2, audioTime);
    }
    
    // Apply envelope
    if (melodyGain1Ref.current && melodyGain2Ref.current) {
      melodyGain1Ref.current.gain.setValueAtTime(0, audioTime);
      melodyGain1Ref.current.gain.linearRampToValueAtTime(melodyVolume * 0.8, audioTime + 0.01);
      melodyGain1Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
      
      melodyGain2Ref.current.gain.setValueAtTime(0, audioTime);
      melodyGain2Ref.current.gain.linearRampToValueAtTime(melodyVolume * 0.4, audioTime + 0.01);
      melodyGain2Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
    }
    
    if (harmonyGain1Ref.current && harmonyGain2Ref.current) {
      harmonyGain1Ref.current.gain.setValueAtTime(0, audioTime);
      harmonyGain1Ref.current.gain.linearRampToValueAtTime(harmonyVolume * 0.6, audioTime + 0.01);
      harmonyGain1Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
      
      harmonyGain2Ref.current.gain.setValueAtTime(0, audioTime);
      harmonyGain2Ref.current.gain.linearRampToValueAtTime(harmonyVolume * 0.3, audioTime + 0.01);
      harmonyGain2Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
    }
  }, []);

  // Create melody sequence - SLOWER AND MORE MELODIC
  const createMelodySequence = useCallback((scale: number[], velocity: number) => {
    const sequenceLength = Math.max(2, Math.floor(velocity * 4)); // 2-6 notes (shorter sequences)
    const sequence: number[] = [];
    
    // Start with a base note
    const baseNoteIndex = Math.floor(Math.random() * scale.length);
    const baseOctave = 1; // Always start in base octave
    sequence.push(scale[baseNoteIndex] * baseOctave);
    
    // Add melodic progression (not random)
    for (let i = 1; i < sequenceLength; i++) {
      // Choose next note based on musical intervals (not completely random)
      const intervals = [0, 2, 4, 7, 9, 11]; // Musical intervals (unison, major 2nd, major 3rd, perfect 5th, major 6th, major 7th)
      const interval = intervals[Math.floor(Math.random() * intervals.length)];
      const nextNoteIndex = (baseNoteIndex + interval) % scale.length;
      const octave = baseOctave + Math.floor(interval / 7); // Higher intervals go to higher octaves
      sequence.push(scale[nextNoteIndex] * Math.pow(2, octave));
    }
    
    return sequence;
  }, []);

  // Play melody sequence - SLOWER AND MORE MELODIC
  const playMelodySequence = useCallback((sequence: number[], melodyVolume: number, harmonyVolume: number, velocity: number) => {
    if (!audioContextRef.current || !isPlayingRef.current) return; // Don't play if stopped
    
    const ctx = audioContextRef.current;
    const noteDuration = 0.4 + (velocity * 0.3); // 0.4-0.7s per note (much slower)
    
    sequence.forEach((frequency, index) => {
      if (!isPlayingRef.current) return; // Stop if disabled during playback
      
      const startTime = ctx.currentTime + (index * noteDuration * 1.2); // No overlap, slight pause between notes
      
      // Create new oscillators for each note
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      
      // Track active oscillators for cleanup
      activeOscillatorsRef.current.push(osc1, osc2);
      activeGainsRef.current.push(gain1, gain2);
      
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(frequency, startTime);
      osc2.frequency.setValueAtTime(frequency * 1.5, startTime);
      
      // Apply envelope - MUCH SOFTER AND AMBIENT
      gain1.gain.setValueAtTime(0, startTime);
      gain1.gain.linearRampToValueAtTime(melodyVolume * 0.15, startTime + 0.01); // 75% softer
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
      
      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(harmonyVolume * 0.08, startTime + 0.01); // 80% softer
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
      
      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);
      
      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + noteDuration);
      osc2.stop(startTime + noteDuration);
      
      // Cleanup after note ends
      setTimeout(() => {
        if (!isPlayingRef.current) {
          try {
            osc1.disconnect();
            osc2.disconnect();
            gain1.disconnect();
            gain2.disconnect();
          } catch (e) {
            // Already disconnected
          }
        }
        // Remove from tracking arrays
        activeOscillatorsRef.current = activeOscillatorsRef.current.filter(o => o !== osc1 && o !== osc2);
        activeGainsRef.current = activeGainsRef.current.filter(g => g !== gain1 && g !== gain2);
      }, (noteDuration + 0.1) * 1000);
    });
  }, []);

  // Play melodic flourish
  const playMelodicFlourish = useCallback((frequency: number, velocity: number) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    const duration = 0.2 + (velocity * 0.3);
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioTime);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const volume = baseVolume * velocity * 1.5;
    gain.gain.setValueAtTime(0, audioTime);
    gain.gain.linearRampToValueAtTime(volume, audioTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
    
    osc.start(audioTime);
    osc.stop(audioTime + duration + 0.1);
    
    setTimeout(() => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }, (duration + 0.2) * 1000);
  }, [baseVolume]);

  // Start melody
  const startMelody = useCallback(async () => {
    if (!enabled) return;
    
    // Reset playing state to allow restart
    isPlayingRef.current = true;
    
    // Initialize audio if not already done
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      await initAudio();
    } else if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    console.log('Melody started successfully');
  }, [enabled, initAudio]);

  // Stop melody
  const stopMelody = useCallback(() => {
    isPlayingRef.current = false;
    
    try {
      // Stop all active sequence oscillators immediately
      activeOscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch (e) {}
        try { osc.disconnect(); } catch (e) {}
      });
      activeOscillatorsRef.current = [];
      
      // Disconnect all active sequence gains immediately
      activeGainsRef.current.forEach(gain => {
        try { gain.disconnect(); } catch (e) {}
      });
      activeGainsRef.current = [];
      
      // Reset audio context for clean restart
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        // Don't close, just reset the flag
        console.log('Melody stopped, ready for restart');
      }
      
      // Stop all main oscillators
      if (melodyOsc1Ref.current) {
        try { melodyOsc1Ref.current.stop(); } catch (e) {}
        try { melodyOsc1Ref.current.disconnect(); } catch (e) {}
        melodyOsc1Ref.current = null;
      }
      if (melodyOsc2Ref.current) {
        try { melodyOsc2Ref.current.stop(); } catch (e) {}
        try { melodyOsc2Ref.current.disconnect(); } catch (e) {}
        melodyOsc2Ref.current = null;
      }
      if (harmonyOsc1Ref.current) {
        try { harmonyOsc1Ref.current.stop(); } catch (e) {}
        try { harmonyOsc1Ref.current.disconnect(); } catch (e) {}
        harmonyOsc1Ref.current = null;
      }
      if (harmonyOsc2Ref.current) {
        try { harmonyOsc2Ref.current.stop(); } catch (e) {}
        try { harmonyOsc2Ref.current.disconnect(); } catch (e) {}
        harmonyOsc2Ref.current = null;
      }
      if (lfoRef.current) {
        try { lfoRef.current.stop(); } catch (e) {}
        try { lfoRef.current.disconnect(); } catch (e) {}
        lfoRef.current = null;
      }
      
      // Disconnect all gain nodes
      if (melodyGain1Ref.current) {
        try { melodyGain1Ref.current.disconnect(); } catch (e) {}
        melodyGain1Ref.current = null;
      }
      if (melodyGain2Ref.current) {
        try { melodyGain2Ref.current.disconnect(); } catch (e) {}
        melodyGain2Ref.current = null;
      }
      if (harmonyGain1Ref.current) {
        try { harmonyGain1Ref.current.disconnect(); } catch (e) {}
        harmonyGain1Ref.current = null;
      }
      if (harmonyGain2Ref.current) {
        try { harmonyGain2Ref.current.disconnect(); } catch (e) {}
        harmonyGain2Ref.current = null;
      }
      if (lfoGainRef.current) {
        try { lfoGainRef.current.disconnect(); } catch (e) {}
        lfoGainRef.current = null;
      }
      
      // Disconnect all filters
      if (melodyFilterRef.current) {
        try { melodyFilterRef.current.disconnect(); } catch (e) {}
        melodyFilterRef.current = null;
      }
      if (harmonyFilterRef.current) {
        try { harmonyFilterRef.current.disconnect(); } catch (e) {}
        harmonyFilterRef.current = null;
      }
      
      // Disconnect delay nodes
      if (delayRef.current) {
        try { delayRef.current.disconnect(); } catch (e) {}
        delayRef.current = null;
      }
      if (delayGainRef.current) {
        try { delayGainRef.current.disconnect(); } catch (e) {}
        delayGainRef.current = null;
      }
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    } catch (error) {
      console.error('Error stopping melody system:', error);
    }
  }, []);

  // Auto-start when enabled changes
  useEffect(() => {
    if (enabled && !isPlayingRef.current) {
      startMelody();
    } else if (!enabled && isPlayingRef.current) {
      stopMelody();
    }
  }, [enabled, startMelody, stopMelody]);

  // Handle user interaction
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (enabled && audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
        } catch (error) {
          console.error('Failed to resume audio context:', error);
        }
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('mousemove', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('mousemove', handleUserInteraction);
    };
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isPlayingRef.current) {
        stopMelody();
      }
    };
  }, [stopMelody]);

  return {
    startMelody,
    stopMelody,
    updateMelodyFromMouse,
    isPlaying: isPlayingRef.current
  };
}; 