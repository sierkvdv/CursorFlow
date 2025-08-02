import { useRef, useEffect, useCallback } from 'react';

interface NatureAmbientOptions {
  enabled?: boolean;
  baseVolume?: number;
}

export const useNatureAmbient = ({
  enabled = true,
  baseVolume = 0.5 // Much higher volume to ensure audibility
}: NatureAmbientOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  
  // Simple oscillators for each nature sound
  const seaOscRef = useRef<OscillatorNode | null>(null);
  const rainOscRef = useRef<OscillatorNode | null>(null);
  const riverOscRef = useRef<OscillatorNode | null>(null);
  const waterfallOscRef = useRef<OscillatorNode | null>(null);
  
  // Gain nodes for each nature sound
  const seaGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const riverGainRef = useRef<GainNode | null>(null);
  const waterfallGainRef = useRef<GainNode | null>(null);
  
  // Filter nodes for each nature sound
  const seaFilterRef = useRef<BiquadFilterNode | null>(null);
  const rainFilterRef = useRef<BiquadFilterNode | null>(null);
  const riverFilterRef = useRef<BiquadFilterNode | null>(null);
  const waterfallFilterRef = useRef<BiquadFilterNode | null>(null);
  
  // Echo/Delay nodes
  const delayRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);

  // Initialize audio context and nature sounds
  const initAudio = useCallback(async () => {
    if (!enabled) return;

    try {
      console.log('Initializing nature ambient audio...');
      
      // Close existing context if it exists
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        console.log('Closing existing audio context...');
        await audioContextRef.current.close();
      }
      
      // Create new audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        console.log('Audio context suspended, attempting to resume...');
        await audioContextRef.current.resume();
        console.log('Audio context resumed');
      }
      
      console.log('Audio context state:', audioContextRef.current.state);
      
      // Create gain nodes for volume control
      seaGainRef.current = audioContextRef.current.createGain();
      rainGainRef.current = audioContextRef.current.createGain();
      riverGainRef.current = audioContextRef.current.createGain();
      waterfallGainRef.current = audioContextRef.current.createGain();
      
      // Create filter nodes for each nature sound
      seaFilterRef.current = audioContextRef.current.createBiquadFilter();
      seaFilterRef.current.type = 'lowpass';
      seaFilterRef.current.frequency.setValueAtTime(200, audioContextRef.current.currentTime); // Less aggressive filtering
      seaFilterRef.current.Q.setValueAtTime(0.8, audioContextRef.current.currentTime); // Less sharp filter
      
      rainFilterRef.current = audioContextRef.current.createBiquadFilter();
      rainFilterRef.current.type = 'lowpass'; // Changed from highpass to lowpass
      rainFilterRef.current.frequency.setValueAtTime(150, audioContextRef.current.currentTime); // Less aggressive filtering
      rainFilterRef.current.Q.setValueAtTime(0.6, audioContextRef.current.currentTime);
      
      riverFilterRef.current = audioContextRef.current.createBiquadFilter();
      riverFilterRef.current.type = 'lowpass';
      riverFilterRef.current.frequency.setValueAtTime(120, audioContextRef.current.currentTime); // Less aggressive filtering
      riverFilterRef.current.Q.setValueAtTime(0.7, audioContextRef.current.currentTime);
      
      waterfallFilterRef.current = audioContextRef.current.createBiquadFilter();
      waterfallFilterRef.current.type = 'lowpass';
      waterfallFilterRef.current.frequency.setValueAtTime(250, audioContextRef.current.currentTime); // Less aggressive filtering
      waterfallFilterRef.current.Q.setValueAtTime(0.9, audioContextRef.current.currentTime);
      
      // Create echo/delay effect
      delayRef.current = audioContextRef.current.createDelay();
      delayRef.current.delayTime.setValueAtTime(0.3, audioContextRef.current.currentTime);
      
      delayGainRef.current = audioContextRef.current.createGain();
      delayGainRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      
      // Set initial volumes to a higher value for immediate audibility
      const initialVolume = baseVolume * 3.0; // Much higher initial volume
      console.log('Setting initial volumes to:', initialVolume);
      
      seaGainRef.current.gain.setValueAtTime(initialVolume, audioContextRef.current.currentTime);
      rainGainRef.current.gain.setValueAtTime(initialVolume, audioContextRef.current.currentTime);
      riverGainRef.current.gain.setValueAtTime(initialVolume, audioContextRef.current.currentTime);
      waterfallGainRef.current.gain.setValueAtTime(initialVolume, audioContextRef.current.currentTime);
      
      // Create sea oscillator (very low frequency for deep waves)
      seaOscRef.current = audioContextRef.current.createOscillator();
      seaOscRef.current.type = 'sine'; // Much softer than sawtooth
      seaOscRef.current.frequency.setValueAtTime(0.8, audioContextRef.current.currentTime); // Much lower frequency
      
      seaOscRef.current.connect(seaFilterRef.current);
      seaFilterRef.current.connect(seaGainRef.current);
      seaGainRef.current.connect(delayRef.current);
      delayRef.current.connect(delayGainRef.current);
      delayGainRef.current.connect(audioContextRef.current.destination);
      seaGainRef.current.connect(audioContextRef.current.destination);
      
      // Create rain oscillator (medium frequency for water drops)
      rainOscRef.current = audioContextRef.current.createOscillator();
      rainOscRef.current.type = 'sine'; // Much softer than sawtooth
      rainOscRef.current.frequency.setValueAtTime(150, audioContextRef.current.currentTime); // Much lower frequency
      
      rainOscRef.current.connect(rainFilterRef.current);
      rainFilterRef.current.connect(rainGainRef.current);
      rainGainRef.current.connect(delayRef.current);
      rainGainRef.current.connect(audioContextRef.current.destination);
      
      // Create river oscillator (low frequency for flowing water)
      riverOscRef.current = audioContextRef.current.createOscillator();
      riverOscRef.current.type = 'sine'; // Much softer than square
      riverOscRef.current.frequency.setValueAtTime(80, audioContextRef.current.currentTime); // Much lower frequency
      
      riverOscRef.current.connect(riverFilterRef.current);
      riverFilterRef.current.connect(riverGainRef.current);
      riverGainRef.current.connect(delayRef.current);
      riverGainRef.current.connect(audioContextRef.current.destination);
      
      // Create waterfall oscillator (medium-low frequency for rushing water)
      waterfallOscRef.current = audioContextRef.current.createOscillator();
      waterfallOscRef.current.type = 'sine'; // Much softer than sawtooth
      waterfallOscRef.current.frequency.setValueAtTime(120, audioContextRef.current.currentTime); // Much lower frequency
      
      waterfallOscRef.current.connect(waterfallFilterRef.current);
      waterfallFilterRef.current.connect(waterfallGainRef.current);
      waterfallGainRef.current.connect(delayRef.current);
      waterfallGainRef.current.connect(audioContextRef.current.destination);
      
      // Start all oscillators
      seaOscRef.current.start();
      rainOscRef.current.start();
      riverOscRef.current.start();
      waterfallOscRef.current.start();
      
      isPlayingRef.current = true;
      console.log('Nature ambient audio initialized successfully with volume:', initialVolume);
    } catch (error) {
      console.error('Failed to initialize nature ambient audio:', error);
    }
  }, [enabled, baseVolume]);

  // Update nature sounds based on mouse position
  const updateNatureFromMouse = useCallback((x: number, y: number, velocity: number) => {
    if (!enabled || !audioContextRef.current || !isPlayingRef.current) {
      console.log('Nature update skipped:', { enabled, hasContext: !!audioContextRef.current, isPlaying: isPlayingRef.current });
      return;
    }

    // Throttle updates - much faster for better responsiveness
    const now = Date.now();
    if (now - lastUpdateRef.current < 50) return; // Much faster updates for better response
    lastUpdateRef.current = now;

    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    
    // Calculate normalized mouse position (0-1)
    const xNormalized = x / window.innerWidth;
    const yNormalized = y / window.innerHeight;
    
    // Much more distinct quadrant-based volume calculation with balanced volumes
    const seaVolume = Math.pow(1 - xNormalized, 2) * Math.pow(1 - yNormalized, 2) * baseVolume * 6.0; // Much higher
    const rainVolume = Math.pow(1 - xNormalized, 1.5) * Math.pow(yNormalized, 2) * baseVolume * 5.8; // Much higher
    const riverVolume = Math.pow(xNormalized, 2) * Math.pow(1 - yNormalized, 1.5) * baseVolume * 5.9; // Much higher
    const waterfallVolume = Math.pow(xNormalized, 1.5) * Math.pow(yNormalized, 2) * baseVolume * 6.2; // Much higher
    
    // Much stronger velocity-based variation
    const velocityMultiplier = 1 + (velocity * 2.0); // Much stronger velocity effect
    
    // Ensure minimum volume for audibility - balanced minimum
    const minVolume = baseVolume * 1.0; // Much higher minimum to ensure constant presence
    
    // Update volumes with much slower, spacey changes
    if (seaGainRef.current) {
      const finalSeaVolume = Math.max(minVolume, seaVolume * velocityMultiplier);
      seaGainRef.current.gain.setTargetAtTime(finalSeaVolume, audioTime, 1.5); // Much slower
      console.log('Sea volume:', finalSeaVolume, 'at position:', { x: xNormalized, y: yNormalized });
    }
    if (rainGainRef.current) {
      const finalRainVolume = Math.max(minVolume, rainVolume * velocityMultiplier);
      rainGainRef.current.gain.setTargetAtTime(finalRainVolume, audioTime, 1.5); // Much slower
      console.log('Rain volume:', finalRainVolume, 'at position:', { x: xNormalized, y: yNormalized });
    }
    if (riverGainRef.current) {
      const finalRiverVolume = Math.max(minVolume, riverVolume * velocityMultiplier);
      riverGainRef.current.gain.setTargetAtTime(finalRiverVolume, audioTime, 1.5); // Much slower
      console.log('River volume:', finalRiverVolume, 'at position:', { x: xNormalized, y: yNormalized });
    }
    if (waterfallGainRef.current) {
      const finalWaterfallVolume = Math.max(minVolume, waterfallVolume * velocityMultiplier);
      waterfallGainRef.current.gain.setTargetAtTime(finalWaterfallVolume, audioTime, 1.5); // Much slower
      console.log('Waterfall volume:', finalWaterfallVolume, 'at position:', { x: xNormalized, y: yNormalized });
    }
    
    // Update frequencies for more dynamic sound with wild variations
    if (seaOscRef.current) {
      // Deep sea waves with very low frequency variations
      const time = audioTime * 0.2; // Slower time for deep waves
      const seaFreq = 0.2 + Math.sin(time * 1.5) * 0.3 + Math.sin(xNormalized * Math.PI * 2.0) * 0.2 + Math.sin(time * 0.8) * 0.4;
      seaOscRef.current.frequency.setTargetAtTime(seaFreq, audioTime, 0.8); // Slower changes for deep sound
    }
    if (rainOscRef.current) {
      // Rain drops with medium frequency variations
      const time = audioTime * 0.6; // Medium speed for rain
      const rainFreq = 80 + Math.sin(time * 2.0) * 60 + Math.sin(yNormalized * Math.PI * 3.0) * 40 + Math.sin(time * 1.5) * 80;
      rainOscRef.current.frequency.setTargetAtTime(rainFreq, audioTime, 0.4); // Medium changes
    }
    if (riverOscRef.current) {
      // Flowing river with low frequency variations
      const time = audioTime * 0.4; // Medium speed for river
      const riverFreq = 40 + Math.sin(time * 1.8) * 30 + Math.sin((xNormalized + yNormalized) * Math.PI * 2.5) * 25 + Math.sin(time * 1.2) * 35;
      riverOscRef.current.frequency.setTargetAtTime(riverFreq, audioTime, 0.5); // Medium changes
    }
    if (waterfallOscRef.current) {
      // Rushing waterfall with medium-low frequency variations
      const time = audioTime * 0.7; // Faster for rushing water
      const waterfallFreq = 60 + Math.sin(time * 2.2) * 50 + Math.sin((xNormalized - yNormalized) * Math.PI * 3.5) * 35 + Math.sin(time * 1.8) * 45;
      waterfallOscRef.current.frequency.setTargetAtTime(waterfallFreq, audioTime, 0.3); // Faster changes
    }
    
    // Update filters based on mouse Y position - lower mouse = more filtering
    if (seaFilterRef.current) {
      // Sea filter: lower mouse = lower cutoff frequency (more filtering)
      const baseCutoff = 200 - (yNormalized * 150); // 200Hz at top, 50Hz at bottom
      const wobble = Math.sin(audioTime * 0.5) * 30; // Add wobble variation
      const seaCutoff = Math.max(50, baseCutoff + wobble); // Ensure minimum 50Hz
      seaFilterRef.current.frequency.setTargetAtTime(seaCutoff, audioTime, 0.8);
    }
    if (rainFilterRef.current) {
      // Rain filter: lower mouse = lower cutoff frequency (more filtering)
      const baseCutoff = 150 - (yNormalized * 100); // 150Hz at top, 50Hz at bottom
      const wobble = Math.sin(audioTime * 0.7) * 40; // Add wobble variation
      const rainCutoff = Math.max(50, baseCutoff + wobble); // Ensure minimum 50Hz
      rainFilterRef.current.frequency.setTargetAtTime(rainCutoff, audioTime, 0.8);
    }
    if (riverFilterRef.current) {
      // River filter: lower mouse = lower cutoff frequency (more filtering)
      const baseCutoff = 120 - (yNormalized * 80); // 120Hz at top, 40Hz at bottom
      const wobble = Math.sin(audioTime * 0.6) * 35; // Add wobble variation
      const riverCutoff = Math.max(40, baseCutoff + wobble); // Ensure minimum 40Hz
      riverFilterRef.current.frequency.setTargetAtTime(riverCutoff, audioTime, 0.8);
    }
    if (waterfallFilterRef.current) {
      // Waterfall filter: lower mouse = lower cutoff frequency (more filtering)
      const baseCutoff = 250 - (yNormalized * 180); // 250Hz at top, 70Hz at bottom
      const wobble = Math.sin(audioTime * 0.8) * 50; // Add wobble variation
      const waterfallCutoff = Math.max(70, baseCutoff + wobble); // Ensure minimum 70Hz
      waterfallFilterRef.current.frequency.setTargetAtTime(waterfallCutoff, audioTime, 0.8);
    }
  }, [enabled, baseVolume]);

  // Start nature ambient audio
  const startNature = useCallback(async () => {
    if (!enabled || isPlayingRef.current) return;
    console.log('Starting nature ambient...');
    await initAudio();
  }, [enabled, initAudio]);

  // Stop nature ambient audio
  const stopNature = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current) return;

    console.log('Stopping nature ambient...');
    
    // Stop all oscillators
    if (seaOscRef.current) seaOscRef.current.stop();
    if (rainOscRef.current) rainOscRef.current.stop();
    if (riverOscRef.current) riverOscRef.current.stop();
    if (waterfallOscRef.current) waterfallOscRef.current.stop();
    
    // Clear references
    seaOscRef.current = null;
    rainOscRef.current = null;
    riverOscRef.current = null;
    waterfallOscRef.current = null;
    seaGainRef.current = null;
    rainGainRef.current = null;
    riverGainRef.current = null;
    waterfallGainRef.current = null;
    
    if (audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    isPlayingRef.current = false;
    
    console.log('Nature ambient audio stopped');
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    if (enabled) {
      console.log('Nature ambient: Auto-initializing...');
      initAudio();
    } else {
      stopNature();
    }
    return () => {
      stopNature();
    };
  }, [enabled, initAudio, stopNature]);

  // Force start when enabled changes
  useEffect(() => {
    if (enabled && !isPlayingRef.current) {
      console.log('Nature ambient: Force starting...');
      initAudio();
    }
  }, [enabled, initAudio]);

  // Handle user interaction to start audio context
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (enabled && audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log('User interaction detected, resuming audio context...');
        try {
          await audioContextRef.current.resume();
          console.log('Audio context resumed after user interaction');
        } catch (error) {
          console.error('Failed to resume audio context:', error);
        }
      }
    };

    // Listen for any user interaction
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('mousemove', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('mousemove', handleUserInteraction);
    };
  }, [enabled]);

  return {
    startNature,
    stopNature,
    updateNatureFromMouse,
    isPlaying: isPlayingRef.current
  };
}; 