import { useRef, useEffect, useCallback } from 'react';

interface NatureAmbientOptions {
  enabled?: boolean;
  baseVolume?: number;
}

export const useNatureAmbient = ({
  enabled = true,
  baseVolume = 0.3
}: NatureAmbientOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  
  // Oscillators for rich nature sounds
  const seaOsc1Ref = useRef<OscillatorNode | null>(null);
  const seaOsc2Ref = useRef<OscillatorNode | null>(null);
  const rainOsc1Ref = useRef<OscillatorNode | null>(null);
  const rainOsc2Ref = useRef<OscillatorNode | null>(null);
  const riverOsc1Ref = useRef<OscillatorNode | null>(null);
  const riverOsc2Ref = useRef<OscillatorNode | null>(null);
  const waterfallOsc1Ref = useRef<OscillatorNode | null>(null);
  const waterfallOsc2Ref = useRef<OscillatorNode | null>(null);
  
  // Gain nodes
  const seaGain1Ref = useRef<GainNode | null>(null);
  const seaGain2Ref = useRef<GainNode | null>(null);
  const rainGain1Ref = useRef<GainNode | null>(null);
  const rainGain2Ref = useRef<GainNode | null>(null);
  const riverGain1Ref = useRef<GainNode | null>(null);
  const riverGain2Ref = useRef<GainNode | null>(null);
  const waterfallGain1Ref = useRef<GainNode | null>(null);
  const waterfallGain2Ref = useRef<GainNode | null>(null);
  
  // Filters
  const seaFilterRef = useRef<BiquadFilterNode | null>(null);
  const rainFilterRef = useRef<BiquadFilterNode | null>(null);
  const riverFilterRef = useRef<BiquadFilterNode | null>(null);
  const waterfallFilterRef = useRef<BiquadFilterNode | null>(null);
  
  // LFO for modulation
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  
  // Delay effect
  const delayRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);

  // Initialize audio
  const initAudio = useCallback(async () => {
    if (!enabled) return;

    try {
      console.log('Initializing nature ambient audio...');
      
      // Close existing context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      
      // Create new context with iOS optimizations
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100, // Standard sample rate for iOS compatibility
        latencyHint: 'interactive' // Better for real-time audio
      });
      
      // Resume if suspended (iOS)
      if (audioContextRef.current.state === 'suspended') {
        try {
          const silentBuffer = audioContextRef.current.createBuffer(1, 1, 22050);
          const silentSource = audioContextRef.current.createBufferSource();
          silentSource.buffer = silentBuffer;
          silentSource.connect(audioContextRef.current.destination);
          silentSource.start();
          
          await audioContextRef.current.resume();
        } catch (error) {
          console.error('Failed to resume audio context:', error);
          return;
        }
      }
      
      // Create LFO with iOS-safe frequencies
      lfoRef.current = audioContextRef.current.createOscillator();
      lfoRef.current.type = 'sine';
      lfoRef.current.frequency.setValueAtTime(0.05, audioContextRef.current.currentTime); // Slower LFO for iOS
      lfoGainRef.current = audioContextRef.current.createGain();
      lfoGainRef.current.gain.setValueAtTime(5, audioContextRef.current.currentTime); // Reduced LFO depth
      
      // Create gain nodes
      seaGain1Ref.current = audioContextRef.current.createGain();
      seaGain2Ref.current = audioContextRef.current.createGain();
      rainGain1Ref.current = audioContextRef.current.createGain();
      rainGain2Ref.current = audioContextRef.current.createGain();
      riverGain1Ref.current = audioContextRef.current.createGain();
      riverGain2Ref.current = audioContextRef.current.createGain();
      waterfallGain1Ref.current = audioContextRef.current.createGain();
      waterfallGain2Ref.current = audioContextRef.current.createGain();
      
      // Create filters with iOS-safe settings
      seaFilterRef.current = audioContextRef.current.createBiquadFilter();
      seaFilterRef.current.type = 'lowpass';
      seaFilterRef.current.frequency.setValueAtTime(80, audioContextRef.current.currentTime); // Lower frequency
      seaFilterRef.current.Q.setValueAtTime(0.8, audioContextRef.current.currentTime); // Gentler Q
      
      rainFilterRef.current = audioContextRef.current.createBiquadFilter();
      rainFilterRef.current.type = 'lowpass';
      rainFilterRef.current.frequency.setValueAtTime(120, audioContextRef.current.currentTime); // Lower frequency
      rainFilterRef.current.Q.setValueAtTime(0.6, audioContextRef.current.currentTime); // Gentler Q
      
      riverFilterRef.current = audioContextRef.current.createBiquadFilter();
      riverFilterRef.current.type = 'lowpass';
      riverFilterRef.current.frequency.setValueAtTime(100, audioContextRef.current.currentTime); // Lower frequency
      riverFilterRef.current.Q.setValueAtTime(0.7, audioContextRef.current.currentTime); // Gentler Q
      
      waterfallFilterRef.current = audioContextRef.current.createBiquadFilter();
      waterfallFilterRef.current.type = 'lowpass';
      waterfallFilterRef.current.frequency.setValueAtTime(140, audioContextRef.current.currentTime); // Lower frequency
      waterfallFilterRef.current.Q.setValueAtTime(0.8, audioContextRef.current.currentTime); // Gentler Q
      
      // Create delay with iOS-safe settings
      delayRef.current = audioContextRef.current.createDelay();
      delayRef.current.delayTime.setValueAtTime(0.2, audioContextRef.current.currentTime); // Shorter delay
      delayGainRef.current = audioContextRef.current.createGain();
      delayGainRef.current.gain.setValueAtTime(0.2, audioContextRef.current.currentTime); // Lower delay volume
      
      // Create oscillators with iOS-safe frequencies
      seaOsc1Ref.current = audioContextRef.current.createOscillator();
      seaOsc1Ref.current.type = 'sine';
      seaOsc1Ref.current.frequency.setValueAtTime(30, audioContextRef.current.currentTime); // Lower frequency
      seaOsc1Ref.current.connect(seaGain1Ref.current);
      
      seaOsc2Ref.current = audioContextRef.current.createOscillator();
      seaOsc2Ref.current.type = 'triangle';
      seaOsc2Ref.current.frequency.setValueAtTime(60, audioContextRef.current.currentTime); // Lower frequency
      seaOsc2Ref.current.connect(seaGain2Ref.current);
      
      rainOsc1Ref.current = audioContextRef.current.createOscillator();
      rainOsc1Ref.current.type = 'sawtooth';
      rainOsc1Ref.current.frequency.setValueAtTime(45, audioContextRef.current.currentTime); // Lower frequency
      rainOsc1Ref.current.connect(rainGain1Ref.current);
      
      rainOsc2Ref.current = audioContextRef.current.createOscillator();
      rainOsc2Ref.current.type = 'square';
      rainOsc2Ref.current.frequency.setValueAtTime(90, audioContextRef.current.currentTime); // Lower frequency
      rainOsc2Ref.current.connect(rainGain2Ref.current);
      
      riverOsc1Ref.current = audioContextRef.current.createOscillator();
      riverOsc1Ref.current.type = 'sine';
      riverOsc1Ref.current.frequency.setValueAtTime(35, audioContextRef.current.currentTime); // Lower frequency
      riverOsc1Ref.current.connect(riverGain1Ref.current);
      
      riverOsc2Ref.current = audioContextRef.current.createOscillator();
      riverOsc2Ref.current.type = 'triangle';
      riverOsc2Ref.current.frequency.setValueAtTime(70, audioContextRef.current.currentTime); // Lower frequency
      riverOsc2Ref.current.connect(riverGain2Ref.current);
      
      waterfallOsc1Ref.current = audioContextRef.current.createOscillator();
      waterfallOsc1Ref.current.type = 'sawtooth';
      waterfallOsc1Ref.current.frequency.setValueAtTime(50, audioContextRef.current.currentTime); // Lower frequency
      waterfallOsc1Ref.current.connect(waterfallGain1Ref.current);
      
      waterfallOsc2Ref.current = audioContextRef.current.createOscillator();
      waterfallOsc2Ref.current.type = 'square';
      waterfallOsc2Ref.current.frequency.setValueAtTime(100, audioContextRef.current.currentTime); // Lower frequency
      waterfallOsc2Ref.current.connect(waterfallGain2Ref.current);
      
      // Connect gains to filters
      seaGain1Ref.current.connect(seaFilterRef.current);
      seaGain2Ref.current.connect(seaFilterRef.current);
      rainGain1Ref.current.connect(rainFilterRef.current);
      rainGain2Ref.current.connect(rainFilterRef.current);
      riverGain1Ref.current.connect(riverFilterRef.current);
      riverGain2Ref.current.connect(riverFilterRef.current);
      waterfallGain1Ref.current.connect(waterfallFilterRef.current);
      waterfallGain2Ref.current.connect(waterfallFilterRef.current);
      
      // Connect filters to delay and destination
      seaFilterRef.current.connect(delayRef.current);
      rainFilterRef.current.connect(delayRef.current);
      riverFilterRef.current.connect(delayRef.current);
      waterfallFilterRef.current.connect(delayRef.current);
      
      seaFilterRef.current.connect(audioContextRef.current.destination);
      rainFilterRef.current.connect(audioContextRef.current.destination);
      riverFilterRef.current.connect(audioContextRef.current.destination);
      waterfallFilterRef.current.connect(audioContextRef.current.destination);
      
      // Connect delay
      delayRef.current.connect(delayGainRef.current);
      delayGainRef.current.connect(audioContextRef.current.destination);
      
      // Start all oscillators
      seaOsc1Ref.current.start();
      seaOsc2Ref.current.start();
      rainOsc1Ref.current.start();
      rainOsc2Ref.current.start();
      riverOsc1Ref.current.start();
      riverOsc2Ref.current.start();
      waterfallOsc1Ref.current.start();
      waterfallOsc2Ref.current.start();
      lfoRef.current.start();
      
      // Set initial volumes (lower for iOS)
      const initialVolume = baseVolume * 1.5; // Reduced from 2.0
      seaGain1Ref.current.gain.setValueAtTime(initialVolume * 0.6, audioContextRef.current.currentTime); // Reduced
      seaGain2Ref.current.gain.setValueAtTime(initialVolume * 0.3, audioContextRef.current.currentTime); // Reduced
      rainGain1Ref.current.gain.setValueAtTime(initialVolume * 0.5, audioContextRef.current.currentTime); // Reduced
      rainGain2Ref.current.gain.setValueAtTime(initialVolume * 0.2, audioContextRef.current.currentTime); // Reduced
      riverGain1Ref.current.gain.setValueAtTime(initialVolume * 0.4, audioContextRef.current.currentTime); // Reduced
      riverGain2Ref.current.gain.setValueAtTime(initialVolume * 0.3, audioContextRef.current.currentTime); // Reduced
      waterfallGain1Ref.current.gain.setValueAtTime(initialVolume * 0.6, audioContextRef.current.currentTime); // Reduced
      waterfallGain2Ref.current.gain.setValueAtTime(initialVolume * 0.4, audioContextRef.current.currentTime); // Reduced
      
      isPlayingRef.current = true;
      console.log('Nature ambient initialized successfully');
    } catch (error) {
      console.error('Failed to initialize nature ambient audio:', error);
    }
  }, [enabled, baseVolume]);

  // Update nature based on mouse position
  const updateNatureFromMouse = useCallback((x: number, y: number, velocity: number) => {
    if (!enabled || !audioContextRef.current || !isPlayingRef.current) {
      return;
    }

    // Throttle updates (slower for iOS to prevent crackling)
    const now = Date.now();
    if (now - lastUpdateRef.current < 50) return; // Increased from 30ms to 50ms
    lastUpdateRef.current = now;

    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    
    // Normalize mouse position
    const xNormalized = x / window.innerWidth;
    const yNormalized = y / window.innerHeight;
    
    // Calculate volumes based on mouse position
    const seaVolume = Math.pow(1 - xNormalized, 2) * Math.pow(1 - yNormalized, 2) * baseVolume * 4.0;
    const rainVolume = Math.pow(1 - xNormalized, 1.5) * Math.pow(yNormalized, 2) * baseVolume * 3.8;
    const riverVolume = Math.pow(xNormalized, 2) * Math.pow(1 - yNormalized, 1.5) * baseVolume * 3.9;
    const waterfallVolume = Math.pow(xNormalized, 1.5) * Math.pow(yNormalized, 2) * baseVolume * 4.2;
    
    // Velocity multiplier
    const velocityMultiplier = 1 + (velocity * 1.5);
    const minVolume = baseVolume * 0.8;
    
    // Update volumes
    if (seaGain1Ref.current && seaGain2Ref.current) {
      const finalSeaVolume = Math.max(minVolume, seaVolume * velocityMultiplier);
      seaGain1Ref.current.gain.setTargetAtTime(finalSeaVolume * 0.8, audioTime, 0.3);
      seaGain2Ref.current.gain.setTargetAtTime(finalSeaVolume * 0.4, audioTime, 0.3);
    }
    if (rainGain1Ref.current && rainGain2Ref.current) {
      const finalRainVolume = Math.max(minVolume, rainVolume * velocityMultiplier);
      rainGain1Ref.current.gain.setTargetAtTime(finalRainVolume * 0.7, audioTime, 0.3);
      rainGain2Ref.current.gain.setTargetAtTime(finalRainVolume * 0.3, audioTime, 0.3);
    }
    if (riverGain1Ref.current && riverGain2Ref.current) {
      const finalRiverVolume = Math.max(minVolume, riverVolume * velocityMultiplier);
      riverGain1Ref.current.gain.setTargetAtTime(finalRiverVolume * 0.6, audioTime, 0.3);
      riverGain2Ref.current.gain.setTargetAtTime(finalRiverVolume * 0.4, audioTime, 0.3);
    }
    if (waterfallGain1Ref.current && waterfallGain2Ref.current) {
      const finalWaterfallVolume = Math.max(minVolume, waterfallVolume * velocityMultiplier);
      waterfallGain1Ref.current.gain.setTargetAtTime(finalWaterfallVolume * 0.8, audioTime, 0.3);
      waterfallGain2Ref.current.gain.setTargetAtTime(finalWaterfallVolume * 0.5, audioTime, 0.3);
    }
    
    // Dynamic frequency modulation (iOS-safe)
    const time = audioTime * 0.3; // Slower modulation for iOS
    
    if (seaOsc1Ref.current && seaOsc2Ref.current) {
      const baseFreq1 = 30 + Math.sin(time * 0.2) * 5 + Math.sin(xNormalized * Math.PI * 2) * 8; // Reduced modulation
      const baseFreq2 = baseFreq1 * 2 + Math.sin(time * 0.3) * 10 + Math.sin(yNormalized * Math.PI * 3) * 5; // Reduced modulation
      seaOsc1Ref.current.frequency.setTargetAtTime(baseFreq1, audioTime, 0.3); // Slower transitions
      seaOsc2Ref.current.frequency.setTargetAtTime(baseFreq2, audioTime, 0.3); // Slower transitions
    }
    
    if (rainOsc1Ref.current && rainOsc2Ref.current) {
      const baseFreq1 = 45 + Math.sin(time * 0.5) * 12 + Math.sin((xNormalized + yNormalized) * Math.PI * 4) * 10; // Reduced modulation
      const baseFreq2 = baseFreq1 * 1.8 + Math.sin(time * 0.7) * 15 + Math.sin(xNormalized * Math.PI * 5) * 8; // Reduced modulation
      rainOsc1Ref.current.frequency.setTargetAtTime(baseFreq1, audioTime, 0.25); // Slower transitions
      rainOsc2Ref.current.frequency.setTargetAtTime(baseFreq2, audioTime, 0.25); // Slower transitions
    }
    
    if (riverOsc1Ref.current && riverOsc2Ref.current) {
      const baseFreq1 = 35 + Math.sin(time * 0.4) * 8 + Math.sin((xNormalized - yNormalized) * Math.PI * 3) * 10; // Reduced modulation
      const baseFreq2 = baseFreq1 * 2.2 + Math.sin(time * 0.6) * 12 + Math.sin(yNormalized * Math.PI * 4) * 6; // Reduced modulation
      riverOsc1Ref.current.frequency.setTargetAtTime(baseFreq1, audioTime, 0.28); // Slower transitions
      riverOsc2Ref.current.frequency.setTargetAtTime(baseFreq2, audioTime, 0.28); // Slower transitions
    }
    
    if (waterfallOsc1Ref.current && waterfallOsc2Ref.current) {
      const baseFreq1 = 50 + Math.sin(time * 0.7) * 15 + Math.sin(xNormalized * Math.PI * 6) * 12; // Reduced modulation
      const baseFreq2 = baseFreq1 * 1.6 + Math.sin(time * 0.9) * 20 + Math.sin((xNormalized + yNormalized) * Math.PI * 7) * 10; // Reduced modulation
      waterfallOsc1Ref.current.frequency.setTargetAtTime(baseFreq1, audioTime, 0.22); // Slower transitions
      waterfallOsc2Ref.current.frequency.setTargetAtTime(baseFreq2, audioTime, 0.22); // Slower transitions
    }
    
    // Update filters
    if (seaFilterRef.current) {
      const cutoff = 120 - (yNormalized * 80) + Math.sin(time * 0.4) * 20;
      seaFilterRef.current.frequency.setTargetAtTime(Math.max(40, cutoff), audioTime, 0.4);
    }
    if (rainFilterRef.current) {
      const cutoff = 200 - (yNormalized * 120) + Math.sin(time * 0.7) * 30;
      rainFilterRef.current.frequency.setTargetAtTime(Math.max(60, cutoff), audioTime, 0.3);
    }
    if (riverFilterRef.current) {
      const cutoff = 150 - (yNormalized * 100) + Math.sin(time * 0.5) * 25;
      riverFilterRef.current.frequency.setTargetAtTime(Math.max(50, cutoff), audioTime, 0.35);
    }
    if (waterfallFilterRef.current) {
      const cutoff = 180 - (yNormalized * 110) + Math.sin(time * 0.9) * 35;
      waterfallFilterRef.current.frequency.setTargetAtTime(Math.max(55, cutoff), audioTime, 0.25);
    }
    
    // Update LFO
    if (lfoRef.current) {
      const lfoRate = 0.1 + (velocity * 0.3) + Math.sin(time * 0.2) * 0.1;
      lfoRef.current.frequency.setTargetAtTime(lfoRate, audioTime, 0.5);
    }
    
  }, [enabled, baseVolume]);

  // Start nature ambient
  const startNature = useCallback(async () => {
    if (!enabled || isPlayingRef.current) return;
    console.log('Starting nature ambient...');
    isPlayingRef.current = true;
    await initAudio();
  }, [enabled, initAudio]);

  // Stop nature ambient
  const stopNature = useCallback(() => {
    console.log('Stopping nature ambient...');
    isPlayingRef.current = false;
    
    // Stop oscillators
    if (seaOsc1Ref.current) { try { seaOsc1Ref.current.stop(); } catch (e) {} seaOsc1Ref.current = null; }
    if (seaOsc2Ref.current) { try { seaOsc2Ref.current.stop(); } catch (e) {} seaOsc2Ref.current = null; }
    if (rainOsc1Ref.current) { try { rainOsc1Ref.current.stop(); } catch (e) {} rainOsc1Ref.current = null; }
    if (rainOsc2Ref.current) { try { rainOsc2Ref.current.stop(); } catch (e) {} rainOsc2Ref.current = null; }
    if (riverOsc1Ref.current) { try { riverOsc1Ref.current.stop(); } catch (e) {} riverOsc1Ref.current = null; }
    if (riverOsc2Ref.current) { try { riverOsc2Ref.current.stop(); } catch (e) {} riverOsc2Ref.current = null; }
    if (waterfallOsc1Ref.current) { try { waterfallOsc1Ref.current.stop(); } catch (e) {} waterfallOsc1Ref.current = null; }
    if (waterfallOsc2Ref.current) { try { waterfallOsc2Ref.current.stop(); } catch (e) {} waterfallOsc2Ref.current = null; }
    if (lfoRef.current) { try { lfoRef.current.stop(); } catch (e) {} lfoRef.current = null; }
    
    // Disconnect gains
    if (seaGain1Ref.current) { try { seaGain1Ref.current.disconnect(); } catch (e) {} seaGain1Ref.current = null; }
    if (seaGain2Ref.current) { try { seaGain2Ref.current.disconnect(); } catch (e) {} seaGain2Ref.current = null; }
    if (rainGain1Ref.current) { try { rainGain1Ref.current.disconnect(); } catch (e) {} rainGain1Ref.current = null; }
    if (rainGain2Ref.current) { try { rainGain2Ref.current.disconnect(); } catch (e) {} rainGain2Ref.current = null; }
    if (riverGain1Ref.current) { try { riverGain1Ref.current.disconnect(); } catch (e) {} riverGain1Ref.current = null; }
    if (riverGain2Ref.current) { try { riverGain2Ref.current.disconnect(); } catch (e) {} riverGain2Ref.current = null; }
    if (waterfallGain1Ref.current) { try { waterfallGain1Ref.current.disconnect(); } catch (e) {} waterfallGain1Ref.current = null; }
    if (waterfallGain2Ref.current) { try { waterfallGain2Ref.current.disconnect(); } catch (e) {} waterfallGain2Ref.current = null; }
    if (lfoGainRef.current) { try { lfoGainRef.current.disconnect(); } catch (e) {} lfoGainRef.current = null; }
    if (delayGainRef.current) { try { delayGainRef.current.disconnect(); } catch (e) {} delayGainRef.current = null; }
  }, []);

  // Auto-start when enabled changes
  useEffect(() => {
    if (enabled && !isPlayingRef.current) {
      startNature();
    } else if (!enabled && isPlayingRef.current) {
      stopNature();
    }
  }, [enabled, startNature, stopNature]);

  // Handle user interaction for iOS
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

  return {
    startNature,
    stopNature,
    updateNatureFromMouse,
    isPlaying: isPlayingRef.current
  };
}; 