import { useRef, useEffect, useCallback } from 'react';

interface NatureAmbientOptions {
  enabled?: boolean;
  baseVolume?: number;
}

export const useNatureAmbient = ({
  enabled = true, // Start enabled for better experience
  baseVolume = 0.3 // Balanced volume for bassline
}: NatureAmbientOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  
  // Multiple oscillators for each nature sound to create rich basslines
  const seaOsc1Ref = useRef<OscillatorNode | null>(null);
  const seaOsc2Ref = useRef<OscillatorNode | null>(null);
  const rainOsc1Ref = useRef<OscillatorNode | null>(null);
  const rainOsc2Ref = useRef<OscillatorNode | null>(null);
  const riverOsc1Ref = useRef<OscillatorNode | null>(null);
  const riverOsc2Ref = useRef<OscillatorNode | null>(null);
  const waterfallOsc1Ref = useRef<OscillatorNode | null>(null);
  const waterfallOsc2Ref = useRef<OscillatorNode | null>(null);
  
  // Gain nodes for each oscillator
  const seaGain1Ref = useRef<GainNode | null>(null);
  const seaGain2Ref = useRef<GainNode | null>(null);
  const rainGain1Ref = useRef<GainNode | null>(null);
  const rainGain2Ref = useRef<GainNode | null>(null);
  const riverGain1Ref = useRef<GainNode | null>(null);
  const riverGain2Ref = useRef<GainNode | null>(null);
  const waterfallGain1Ref = useRef<GainNode | null>(null);
  const waterfallGain2Ref = useRef<GainNode | null>(null);
  
  // Filter nodes for each nature sound
  const seaFilterRef = useRef<BiquadFilterNode | null>(null);
  const rainFilterRef = useRef<BiquadFilterNode | null>(null);
  const riverFilterRef = useRef<BiquadFilterNode | null>(null);
  const waterfallFilterRef = useRef<BiquadFilterNode | null>(null);
  
  // LFO (Low Frequency Oscillator) for modulation
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  
  // Echo/Delay nodes
  const delayRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);

  // Initialize audio context and nature sounds
  const initAudio = useCallback(async () => {
    if (!enabled) return;

    try {
      console.log('Initializing dynamic nature bassline audio...');
      
      // Close existing context if it exists
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        console.log('Closing existing audio context...');
        await audioContextRef.current.close();
      }
      
      // Create new audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (important for iOS)
      if (audioContextRef.current.state === 'suspended') {
        console.log('Audio context suspended, attempting to resume...');
        try {
          // iOS requires a silent audio buffer to unlock audio
          const silentBuffer = audioContextRef.current.createBuffer(1, 1, 22050);
          const silentSource = audioContextRef.current.createBufferSource();
          silentSource.buffer = silentBuffer;
          silentSource.connect(audioContextRef.current.destination);
          silentSource.start();
          
          await audioContextRef.current.resume();
          console.log('Audio context resumed successfully');
        } catch (error) {
          console.error('Failed to resume audio context:', error);
          // For iOS, we might need to wait for user interaction
          return;
        }
      }
      
      console.log('Audio context state:', audioContextRef.current.state);
      
      // Create LFO for modulation
      lfoRef.current = audioContextRef.current.createOscillator();
      lfoRef.current.type = 'sine';
      lfoRef.current.frequency.setValueAtTime(0.1, audioContextRef.current.currentTime); // Very slow LFO
      lfoGainRef.current = audioContextRef.current.createGain();
      lfoGainRef.current.gain.setValueAtTime(10, audioContextRef.current.currentTime); // LFO depth
      
      // Create gain nodes for each oscillator
      seaGain1Ref.current = audioContextRef.current.createGain();
      seaGain2Ref.current = audioContextRef.current.createGain();
      rainGain1Ref.current = audioContextRef.current.createGain();
      rainGain2Ref.current = audioContextRef.current.createGain();
      riverGain1Ref.current = audioContextRef.current.createGain();
      riverGain2Ref.current = audioContextRef.current.createGain();
      waterfallGain1Ref.current = audioContextRef.current.createGain();
      waterfallGain2Ref.current = audioContextRef.current.createGain();
      
      // Create filter nodes for each nature sound
      seaFilterRef.current = audioContextRef.current.createBiquadFilter();
      seaFilterRef.current.type = 'lowpass';
      seaFilterRef.current.frequency.setValueAtTime(120, audioContextRef.current.currentTime);
      seaFilterRef.current.Q.setValueAtTime(1.2, audioContextRef.current.currentTime);
      
      rainFilterRef.current = audioContextRef.current.createBiquadFilter();
      rainFilterRef.current.type = 'lowpass';
      rainFilterRef.current.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
      rainFilterRef.current.Q.setValueAtTime(0.8, audioContextRef.current.currentTime);
      
      riverFilterRef.current = audioContextRef.current.createBiquadFilter();
      riverFilterRef.current.type = 'lowpass';
      riverFilterRef.current.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
      riverFilterRef.current.Q.setValueAtTime(1.0, audioContextRef.current.currentTime);
      
      waterfallFilterRef.current = audioContextRef.current.createBiquadFilter();
      waterfallFilterRef.current.type = 'lowpass';
      waterfallFilterRef.current.frequency.setValueAtTime(180, audioContextRef.current.currentTime);
      waterfallFilterRef.current.Q.setValueAtTime(1.1, audioContextRef.current.currentTime);
      
      // Create echo/delay effect
      delayRef.current = audioContextRef.current.createDelay();
      delayRef.current.delayTime.setValueAtTime(0.4, audioContextRef.current.currentTime);
      
      delayGainRef.current = audioContextRef.current.createGain();
      delayGainRef.current.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
      
      // Create oscillators with different wave types for rich basslines
      // Sea: Deep bass with two oscillators
      seaOsc1Ref.current = audioContextRef.current.createOscillator();
      seaOsc1Ref.current.type = 'sine';
      seaOsc1Ref.current.frequency.setValueAtTime(40, audioContextRef.current.currentTime); // Deep bass
      seaOsc1Ref.current.connect(seaGain1Ref.current);
      
      seaOsc2Ref.current = audioContextRef.current.createOscillator();
      seaOsc2Ref.current.type = 'triangle';
      seaOsc2Ref.current.frequency.setValueAtTime(80, audioContextRef.current.currentTime); // Harmonic
      seaOsc2Ref.current.connect(seaGain2Ref.current);
      
      // Rain: Medium bass with two oscillators
      rainOsc1Ref.current = audioContextRef.current.createOscillator();
      rainOsc1Ref.current.type = 'sawtooth';
      rainOsc1Ref.current.frequency.setValueAtTime(60, audioContextRef.current.currentTime);
      rainOsc1Ref.current.connect(rainGain1Ref.current);
      
      rainOsc2Ref.current = audioContextRef.current.createOscillator();
      rainOsc2Ref.current.type = 'square';
      rainOsc2Ref.current.frequency.setValueAtTime(120, audioContextRef.current.currentTime);
      rainOsc2Ref.current.connect(rainGain2Ref.current);
      
      // River: Flowing bass with two oscillators
      riverOsc1Ref.current = audioContextRef.current.createOscillator();
      riverOsc1Ref.current.type = 'sine';
      riverOsc1Ref.current.frequency.setValueAtTime(50, audioContextRef.current.currentTime);
      riverOsc1Ref.current.connect(riverGain1Ref.current);
      
      riverOsc2Ref.current = audioContextRef.current.createOscillator();
      riverOsc2Ref.current.type = 'triangle';
      riverOsc2Ref.current.frequency.setValueAtTime(100, audioContextRef.current.currentTime);
      riverOsc2Ref.current.connect(riverGain2Ref.current);
      
      // Waterfall: Rushing bass with two oscillators
      waterfallOsc1Ref.current = audioContextRef.current.createOscillator();
      waterfallOsc1Ref.current.type = 'sawtooth';
      waterfallOsc1Ref.current.frequency.setValueAtTime(70, audioContextRef.current.currentTime);
      waterfallOsc1Ref.current.connect(waterfallGain1Ref.current);
      
      waterfallOsc2Ref.current = audioContextRef.current.createOscillator();
      waterfallOsc2Ref.current.type = 'square';
      waterfallOsc2Ref.current.frequency.setValueAtTime(140, audioContextRef.current.currentTime);
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
      
      // Set initial volumes
      const initialVolume = baseVolume * 2.0;
      seaGain1Ref.current.gain.setValueAtTime(initialVolume * 0.8, audioContextRef.current.currentTime);
      seaGain2Ref.current.gain.setValueAtTime(initialVolume * 0.4, audioContextRef.current.currentTime);
      rainGain1Ref.current.gain.setValueAtTime(initialVolume * 0.7, audioContextRef.current.currentTime);
      rainGain2Ref.current.gain.setValueAtTime(initialVolume * 0.3, audioContextRef.current.currentTime);
      riverGain1Ref.current.gain.setValueAtTime(initialVolume * 0.6, audioContextRef.current.currentTime);
      riverGain2Ref.current.gain.setValueAtTime(initialVolume * 0.4, audioContextRef.current.currentTime);
      waterfallGain1Ref.current.gain.setValueAtTime(initialVolume * 0.8, audioContextRef.current.currentTime);
      waterfallGain2Ref.current.gain.setValueAtTime(initialVolume * 0.5, audioContextRef.current.currentTime);
      
      isPlayingRef.current = true;
      console.log('Dynamic nature bassline initialized successfully');
    } catch (error) {
      console.error('Failed to initialize nature bassline audio:', error);
    }
  }, [enabled, baseVolume]);

  // Update nature bassline based on mouse position
  const updateNatureFromMouse = useCallback((x: number, y: number, velocity: number) => {
    if (!enabled || !audioContextRef.current || !isPlayingRef.current) {
      return;
    }

    // Throttle updates for performance
    const now = Date.now();
    if (now - lastUpdateRef.current < 30) return; // Fast updates for responsive bassline
    lastUpdateRef.current = now;

    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    
    // Calculate normalized mouse position (0-1)
    const xNormalized = x / window.innerWidth;
    const yNormalized = y / window.innerHeight;
    
    // Dynamic volume calculation based on mouse position
    const seaVolume = Math.pow(1 - xNormalized, 2) * Math.pow(1 - yNormalized, 2) * baseVolume * 4.0;
    const rainVolume = Math.pow(1 - xNormalized, 1.5) * Math.pow(yNormalized, 2) * baseVolume * 3.8;
    const riverVolume = Math.pow(xNormalized, 2) * Math.pow(1 - yNormalized, 1.5) * baseVolume * 3.9;
    const waterfallVolume = Math.pow(xNormalized, 1.5) * Math.pow(yNormalized, 2) * baseVolume * 4.2;
    
    // Velocity-based intensity
    const velocityMultiplier = 1 + (velocity * 1.5);
    
    // Ensure minimum volume for constant presence
    const minVolume = baseVolume * 0.8;
    
    // Update volumes with smooth transitions
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
    
    // Dynamic frequency modulation for bassline variation
    const time = audioTime * 0.5;
    
    // Sea: Deep bass with slow modulation
    if (seaOsc1Ref.current && seaOsc2Ref.current) {
      const baseFreq1 = 40 + Math.sin(time * 0.3) * 10 + Math.sin(xNormalized * Math.PI * 2) * 15;
      const baseFreq2 = baseFreq1 * 2 + Math.sin(time * 0.5) * 20 + Math.sin(yNormalized * Math.PI * 3) * 10;
      
      seaOsc1Ref.current.frequency.setTargetAtTime(baseFreq1, audioTime, 0.2);
      seaOsc2Ref.current.frequency.setTargetAtTime(baseFreq2, audioTime, 0.2);
    }
    
    // Rain: Medium bass with faster modulation
    if (rainOsc1Ref.current && rainOsc2Ref.current) {
      const baseFreq1 = 60 + Math.sin(time * 0.8) * 25 + Math.sin((xNormalized + yNormalized) * Math.PI * 4) * 20;
      const baseFreq2 = baseFreq1 * 1.8 + Math.sin(time * 1.2) * 30 + Math.sin(xNormalized * Math.PI * 5) * 15;
      
      rainOsc1Ref.current.frequency.setTargetAtTime(baseFreq1, audioTime, 0.15);
      rainOsc2Ref.current.frequency.setTargetAtTime(baseFreq2, audioTime, 0.15);
    }
    
    // River: Flowing bass with medium modulation
    if (riverOsc1Ref.current && riverOsc2Ref.current) {
      const baseFreq1 = 50 + Math.sin(time * 0.6) * 20 + Math.sin((xNormalized - yNormalized) * Math.PI * 3) * 18;
      const baseFreq2 = baseFreq1 * 2.2 + Math.sin(time * 0.9) * 25 + Math.sin(yNormalized * Math.PI * 4) * 12;
      
      riverOsc1Ref.current.frequency.setTargetAtTime(baseFreq1, audioTime, 0.18);
      riverOsc2Ref.current.frequency.setTargetAtTime(baseFreq2, audioTime, 0.18);
    }
    
    // Waterfall: Rushing bass with fast modulation
    if (waterfallOsc1Ref.current && waterfallOsc2Ref.current) {
      const baseFreq1 = 70 + Math.sin(time * 1.1) * 35 + Math.sin(xNormalized * Math.PI * 6) * 25;
      const baseFreq2 = baseFreq1 * 1.6 + Math.sin(time * 1.5) * 40 + Math.sin((xNormalized + yNormalized) * Math.PI * 7) * 20;
      
      waterfallOsc1Ref.current.frequency.setTargetAtTime(baseFreq1, audioTime, 0.12);
      waterfallOsc2Ref.current.frequency.setTargetAtTime(baseFreq2, audioTime, 0.12);
    }
    
    // Update filters based on mouse position for tone variation
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
    
    // Update LFO rate based on mouse movement
    if (lfoRef.current) {
      const lfoRate = 0.1 + (velocity * 0.3) + Math.sin(time * 0.2) * 0.1;
      lfoRef.current.frequency.setTargetAtTime(lfoRate, audioTime, 0.5);
    }
    
  }, [enabled, baseVolume]);

  // Start nature ambient audio
  const startNature = useCallback(async () => {
    if (!enabled || isPlayingRef.current) return;
    console.log('Starting nature ambient...');
    isPlayingRef.current = true;
    await initAudio();
  }, [enabled, initAudio]);

  // Stop nature ambient audio
  const stopNature = useCallback(() => {
    console.log('Nature: Stopping nature ambient...');
    isPlayingRef.current = false;
    
    // Stop all oscillators
    if (seaOsc1Ref.current) {
      try { seaOsc1Ref.current.stop(); } catch (e) {}
      seaOsc1Ref.current = null;
    }
    if (seaOsc2Ref.current) {
      try { seaOsc2Ref.current.stop(); } catch (e) {}
      seaOsc2Ref.current = null;
    }
    if (rainOsc1Ref.current) {
      try { rainOsc1Ref.current.stop(); } catch (e) {}
      rainOsc1Ref.current = null;
    }
    if (rainOsc2Ref.current) {
      try { rainOsc2Ref.current.stop(); } catch (e) {}
      rainOsc2Ref.current = null;
    }
    if (riverOsc1Ref.current) {
      try { riverOsc1Ref.current.stop(); } catch (e) {}
      riverOsc1Ref.current = null;
    }
    if (riverOsc2Ref.current) {
      try { riverOsc2Ref.current.stop(); } catch (e) {}
      riverOsc2Ref.current = null;
    }
    if (waterfallOsc1Ref.current) {
      try { waterfallOsc1Ref.current.stop(); } catch (e) {}
      waterfallOsc1Ref.current = null;
    }
    if (waterfallOsc2Ref.current) {
      try { waterfallOsc2Ref.current.stop(); } catch (e) {}
      waterfallOsc2Ref.current = null;
    }
    if (lfoRef.current) {
      try { lfoRef.current.stop(); } catch (e) {}
      lfoRef.current = null;
    }
    
    // Disconnect all gain nodes
    if (seaGain1Ref.current) {
      try { seaGain1Ref.current.disconnect(); } catch (e) {}
      seaGain1Ref.current = null;
    }
    if (seaGain2Ref.current) {
      try { seaGain2Ref.current.disconnect(); } catch (e) {}
      seaGain2Ref.current = null;
    }
    if (rainGain1Ref.current) {
      try { rainGain1Ref.current.disconnect(); } catch (e) {}
      rainGain1Ref.current = null;
    }
    if (rainGain2Ref.current) {
      try { rainGain2Ref.current.disconnect(); } catch (e) {}
      rainGain2Ref.current = null;
    }
    if (riverGain1Ref.current) {
      try { riverGain1Ref.current.disconnect(); } catch (e) {}
      riverGain1Ref.current = null;
    }
    if (riverGain2Ref.current) {
      try { riverGain2Ref.current.disconnect(); } catch (e) {}
      riverGain2Ref.current = null;
    }
    if (waterfallGain1Ref.current) {
      try { waterfallGain1Ref.current.disconnect(); } catch (e) {}
      waterfallGain1Ref.current = null;
    }
    if (waterfallGain2Ref.current) {
      try { waterfallGain2Ref.current.disconnect(); } catch (e) {}
      waterfallGain2Ref.current = null;
    }
    if (lfoGainRef.current) {
      try { lfoGainRef.current.disconnect(); } catch (e) {}
      lfoGainRef.current = null;
    }
    if (delayGainRef.current) {
      try { delayGainRef.current.disconnect(); } catch (e) {}
      delayGainRef.current = null;
    }
  }, []);

  // Auto-start when enabled changes
  useEffect(() => {
    if (enabled && !isPlayingRef.current) {
      console.log('Nature ambient: Auto-starting...');
      startNature();
    } else if (!enabled && isPlayingRef.current) {
      console.log('Nature ambient: Auto-stopping...');
      stopNature();
    }
  }, [enabled, startNature, stopNature]);

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