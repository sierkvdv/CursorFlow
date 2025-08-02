import { useRef, useEffect, useCallback } from 'react';

interface AmbientAudioOptions {
  enabled?: boolean;
  baseVolume?: number;
  variationIntensity?: number;
}

export const useAmbientAudio = ({
  enabled = true,
  baseVolume = 0.15,
  variationIntensity = 0.3
}: AmbientAudioOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const isPlayingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  
  // Extra ambient layer references
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientFilterRef = useRef<BiquadFilterNode | null>(null);

  // Initialize audio context
  const initAudio = useCallback(async () => {
    if (!enabled || audioContextRef.current) return;

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create ambient oscillators with subtle frequencies
      const frequencies = [110, 165, 220, 330];
      const baseGains = [0.04, 0.03, 0.025, 0.02]; // Much lower base gains
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContextRef.current!.createOscillator();
        const gainNode = audioContextRef.current!.createGain();
        const filter = audioContextRef.current!.createBiquadFilter();
        
        // Set up oscillator with different wave types
        const waveTypes = ['sine', 'triangle', 'sawtooth', 'sine'] as const;
        oscillator.type = waveTypes[index % waveTypes.length];
        oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime);
        
        // Set up filter for ambient character (much gentler)
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, audioContextRef.current!.currentTime); // Lower cutoff
        filter.Q.setValueAtTime(0.1, audioContextRef.current!.currentTime); // Much gentler
        
        // Set up gain with very subtle volume
        gainNode.gain.setValueAtTime(baseGains[index] * baseVolume, audioContextRef.current!.currentTime);
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContextRef.current!.destination);
        
        // Store references
        oscillatorsRef.current.push(oscillator);
        gainNodesRef.current.push(gainNode);
        filtersRef.current.push(filter);
        
        // Start oscillator
        oscillator.start();
      });
      
      // Create extra ambient layer (extremely low, constant tone)
      ambientOscillatorRef.current = audioContextRef.current.createOscillator();
      ambientGainRef.current = audioContextRef.current.createGain();
      ambientFilterRef.current = audioContextRef.current.createBiquadFilter();
      
      // Set up extra ambient oscillator (very low frequency)
      ambientOscillatorRef.current.type = 'sine';
      ambientOscillatorRef.current.frequency.setValueAtTime(55, audioContextRef.current.currentTime);
      
      // Set up extra ambient filter (very low pass)
      ambientFilterRef.current.type = 'lowpass';
      ambientFilterRef.current.frequency.setValueAtTime(120, audioContextRef.current.currentTime); // Even lower cutoff
      ambientFilterRef.current.Q.setValueAtTime(0.03, audioContextRef.current.currentTime); // Extremely gentle
      
      // Set up extra ambient gain (extremely subtle)
      ambientGainRef.current.gain.setValueAtTime(0.002 * baseVolume, audioContextRef.current.currentTime); // Extremely quiet
      
      // Connect extra ambient nodes
      ambientOscillatorRef.current.connect(ambientFilterRef.current);
      ambientFilterRef.current.connect(ambientGainRef.current);
      ambientGainRef.current.connect(audioContextRef.current.destination);
      
      // Start extra ambient oscillator
      ambientOscillatorRef.current.start();
      
      isPlayingRef.current = true;
      console.log('Ambient audio initialized (with extra layer)');
    } catch (error) {
      console.error('Failed to initialize ambient audio:', error);
    }
  }, [enabled, baseVolume]);

  // Update ambient sound based on mouse movement (includes subtle constant melody)
  const updateAmbientFromMouse = useCallback((x: number, y: number, velocity: number) => {
    if (!enabled || !audioContextRef.current || !isPlayingRef.current) return;

    // More frequent updates for smoother transitions
    const now = Date.now();
    const velocityNormalized = Math.min(velocity / 10, 1);
    const throttleTime = velocityNormalized > 0.5 ? 200 : 100; // Faster updates
    
    if (now - lastUpdateRef.current < throttleTime) return;
    lastUpdateRef.current = now;

    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    const time = Date.now() * 0.001; // Time in seconds
    
    // Calculate variations based on mouse position and movement
    const xNormalized = x / window.innerWidth;
    const yNormalized = y / window.innerHeight;
    
    // Much more subtle intensity multiplier
    const intensityMultiplier = velocityNormalized > 0.7 ? 0.2 : 0.6; // Always subtle
    
    // Update each oscillator with very subtle melody and mouse variations
    oscillatorsRef.current.forEach((oscillator, index) => {
      const baseFreq = [110, 165, 220, 330][index];
      const baseGain = [0.04, 0.03, 0.025, 0.02][index]; // Much lower base gains
      
      // Very subtle constant melody drift
      const melodyDrift = Math.sin(time * 0.03 + index * 0.4) * 3; // Much slower and smaller
      const volumeBreathing = Math.sin(time * 0.02 + index * 0.3) * 0.005; // Much more subtle
      const filterDrift = Math.sin(time * 0.025 + index * 0.35) * 30; // Smaller filter drift
      
      // Very subtle mouse-based variations
      const mouseFreqVariation = Math.sin(xNormalized * Math.PI * 2) * 4 * velocityNormalized * intensityMultiplier;
      const mouseFreqVariationY = Math.sin(yNormalized * Math.PI * 2) * 3 * velocityNormalized * intensityMultiplier;
      const mouseVolumeVariation = Math.sin(xNormalized * Math.PI) * variationIntensity * 0.05 * velocityNormalized * intensityMultiplier;
      const mouseVolumeVariationY = Math.sin(yNormalized * Math.PI) * variationIntensity * 0.05 * velocityNormalized * intensityMultiplier;
      const mouseFilterVariation = Math.sin(xNormalized * Math.PI + yNormalized * Math.PI) * 60 * velocityNormalized * intensityMultiplier;
      
      // Combine constant melody with mouse variations
      const newFreq = baseFreq + melodyDrift + mouseFreqVariation + mouseFreqVariationY;
      oscillator.frequency.setValueAtTime(Math.max(80, newFreq), audioTime);
      
      const newVolume = (baseGain + volumeBreathing + mouseVolumeVariation + mouseVolumeVariationY) * baseVolume;
      gainNodesRef.current[index].gain.setValueAtTime(Math.max(0.003, newVolume), audioTime); // Much lower minimum
      
      const newFilterFreq = 1200 + filterDrift + mouseFilterVariation; // Lower base filter
      filtersRef.current[index].frequency.setValueAtTime(Math.max(400, newFilterFreq), audioTime);
    });
    
    // Update extra ambient layer (extremely subtle)
    if (ambientOscillatorRef.current && ambientGainRef.current && ambientFilterRef.current) {
      // Complex but very subtle constant melody drift
      const ambientDrift1 = Math.sin(time * 0.02) * 1; // Very slow and small
      const ambientDrift2 = Math.sin(time * 0.01 + 0.5) * 0.8; // Even smaller
      const ambientDrift3 = Math.sin(time * 0.005 + 1.2) * 0.5; // Smallest
      const totalAmbientDrift = ambientDrift1 + ambientDrift2 + ambientDrift3;
      
      // Extremely subtle volume breathing
      const ambientVolumeBreathing1 = Math.sin(time * 0.015) * 0.0005;
      const ambientVolumeBreathing2 = Math.sin(time * 0.008 + 0.7) * 0.0003;
      const totalAmbientVolumeBreathing = ambientVolumeBreathing1 + ambientVolumeBreathing2;
      
      // Very subtle mouse variations
      const ambientMouseFreq = Math.sin(xNormalized * Math.PI) * 1.5 * velocityNormalized * intensityMultiplier;
      const ambientMouseFreqY = Math.sin(yNormalized * Math.PI) * 1 * velocityNormalized * intensityMultiplier;
      const ambientMouseVolume = Math.sin(xNormalized * Math.PI + yNormalized * Math.PI) * 0.001 * velocityNormalized * intensityMultiplier;
      const ambientMouseFilter = Math.sin(xNormalized * Math.PI * 2 + yNormalized * Math.PI * 2) * 15 * velocityNormalized * intensityMultiplier;
      
      // Apply to extra ambient layer with extremely low volume
      const ambientFreq = 55 + totalAmbientDrift + ambientMouseFreq + ambientMouseFreqY;
      ambientOscillatorRef.current.frequency.setValueAtTime(Math.max(40, ambientFreq), audioTime);
      
      const ambientVolume = (0.002 + totalAmbientVolumeBreathing + ambientMouseVolume) * baseVolume; // Extremely low
      ambientGainRef.current.gain.setValueAtTime(Math.max(0.0005, ambientVolume), audioTime); // Extremely low minimum
      
      const ambientFilterFreq = 120 + ambientMouseFilter; // Even lower base filter
      ambientFilterRef.current.frequency.setValueAtTime(Math.max(60, ambientFilterFreq), audioTime);
    }
  }, [enabled, baseVolume, variationIntensity]);

  // Start ambient audio
  const startAmbient = useCallback(async () => {
    if (!enabled || isPlayingRef.current) return;
    await initAudio();
  }, [enabled, initAudio]);

  // Stop ambient audio
  const stopAmbient = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current) return;

    oscillatorsRef.current.forEach(oscillator => {
      oscillator.stop();
    });
    
    // Stop extra ambient layer
    if (ambientOscillatorRef.current) {
      ambientOscillatorRef.current.stop();
    }
    
    oscillatorsRef.current = [];
    gainNodesRef.current = [];
    filtersRef.current = [];
    
    // Clear extra ambient references
    ambientOscillatorRef.current = null;
    ambientGainRef.current = null;
    ambientFilterRef.current = null;
    
    if (audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    isPlayingRef.current = false;
    
    console.log('Ambient audio stopped');
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, [stopAmbient]);

  return {
    startAmbient,
    stopAmbient,
    updateAmbientFromMouse,
    isPlaying: isPlayingRef.current
  };
}; 