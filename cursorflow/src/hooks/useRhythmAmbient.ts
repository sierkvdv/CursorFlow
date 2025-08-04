import { useRef, useEffect, useCallback } from 'react';

interface RhythmAmbientOptions {
  enabled?: boolean;
  baseVolume?: number;
}

export const useRhythmAmbient = ({
  enabled = false,
  baseVolume = 0.2
}: RhythmAmbientOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  const lastBeatTimeRef = useRef(0);
  
  // Oscillators
  const kickOsc1Ref = useRef<OscillatorNode | null>(null);
  const kickOsc2Ref = useRef<OscillatorNode | null>(null);
  const snareOsc1Ref = useRef<OscillatorNode | null>(null);
  const snareOsc2Ref = useRef<OscillatorNode | null>(null);
  const hihatOsc1Ref = useRef<OscillatorNode | null>(null);
  const hihatOsc2Ref = useRef<OscillatorNode | null>(null);
  const tomOsc1Ref = useRef<OscillatorNode | null>(null);
  const tomOsc2Ref = useRef<OscillatorNode | null>(null);
  
  // Gain nodes
  const kickGain1Ref = useRef<GainNode | null>(null);
  const kickGain2Ref = useRef<GainNode | null>(null);
  const snareGain1Ref = useRef<GainNode | null>(null);
  const snareGain2Ref = useRef<GainNode | null>(null);
  const hihatGain1Ref = useRef<GainNode | null>(null);
  const hihatGain2Ref = useRef<GainNode | null>(null);
  const tomGain1Ref = useRef<GainNode | null>(null);
  const tomGain2Ref = useRef<GainNode | null>(null);
  
  // Filters
  const kickFilterRef = useRef<BiquadFilterNode | null>(null);
  const snareFilterRef = useRef<BiquadFilterNode | null>(null);
  const hihatFilterRef = useRef<BiquadFilterNode | null>(null);
  const tomFilterRef = useRef<BiquadFilterNode | null>(null);
  
  // Compressor
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  
  // Delay
  const delayRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);

  // Drum patterns
  const drumPatterns = {
    basic: ['kick', 'snare', 'kick', 'hihat'],
    complex: ['kick', 'snare', 'kick', 'hihat', 'tom', 'snare', 'kick', 'hihat'],
    fast: ['kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'tom', 'hihat'],
    slow: ['kick', 'snare', 'kick', 'tom']
  };

  // Initialize audio context with iOS compatibility
  const initAudio = useCallback(async () => {
    if (!enabled) return;

    try {
      // iOS Safari compatibility - force audio context resume
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Create audio context with iOS-optimized settings
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 44100, // Standard sample rate for iOS
          latencyHint: 'interactive' // Better for iOS
        });
      }
      // Cleanup existing oscillators
      if (isPlayingRef.current) {
        try {
          if (kickOsc1Ref.current) {
            kickOsc1Ref.current.stop();
            kickOsc1Ref.current.disconnect();
            kickOsc1Ref.current = null;
          }
          if (kickOsc2Ref.current) {
            kickOsc2Ref.current.stop();
            kickOsc2Ref.current.disconnect();
            kickOsc2Ref.current = null;
          }
          if (snareOsc1Ref.current) {
            snareOsc1Ref.current.stop();
            snareOsc1Ref.current.disconnect();
            snareOsc1Ref.current = null;
          }
          if (snareOsc2Ref.current) {
            snareOsc2Ref.current.stop();
            snareOsc2Ref.current.disconnect();
            snareOsc2Ref.current = null;
          }
          if (hihatOsc1Ref.current) {
            hihatOsc1Ref.current.stop();
            hihatOsc1Ref.current.disconnect();
            hihatOsc1Ref.current = null;
          }
          if (hihatOsc2Ref.current) {
            hihatOsc2Ref.current.stop();
            hihatOsc2Ref.current.disconnect();
            hihatOsc2Ref.current = null;
          }
          if (tomOsc1Ref.current) {
            tomOsc1Ref.current.stop();
            tomOsc1Ref.current.disconnect();
            tomOsc1Ref.current = null;
          }
          if (tomOsc2Ref.current) {
            tomOsc2Ref.current.stop();
            tomOsc2Ref.current.disconnect();
            tomOsc2Ref.current = null;
          }
          
          if (kickGain1Ref.current) {
            kickGain1Ref.current.disconnect();
            kickGain1Ref.current = null;
          }
          if (kickGain2Ref.current) {
            kickGain2Ref.current.disconnect();
            kickGain2Ref.current = null;
          }
          if (snareGain1Ref.current) {
            snareGain1Ref.current.disconnect();
            snareGain1Ref.current = null;
          }
          if (snareGain2Ref.current) {
            snareGain2Ref.current.disconnect();
            snareGain2Ref.current = null;
          }
          if (hihatGain1Ref.current) {
            hihatGain1Ref.current.disconnect();
            hihatGain1Ref.current = null;
          }
          if (hihatGain2Ref.current) {
            hihatGain2Ref.current.disconnect();
            hihatGain2Ref.current = null;
          }
          if (tomGain1Ref.current) {
            tomGain1Ref.current.disconnect();
            tomGain1Ref.current = null;
          }
          if (tomGain2Ref.current) {
            tomGain2Ref.current.disconnect();
            tomGain2Ref.current = null;
          }
          
          if (kickFilterRef.current) {
            kickFilterRef.current.disconnect();
            kickFilterRef.current = null;
          }
          if (snareFilterRef.current) {
            snareFilterRef.current.disconnect();
            snareFilterRef.current = null;
          }
          if (hihatFilterRef.current) {
            hihatFilterRef.current.disconnect();
            hihatFilterRef.current = null;
          }
          if (tomFilterRef.current) {
            tomFilterRef.current.disconnect();
            tomFilterRef.current = null;
          }
          
          if (compressorRef.current) {
            compressorRef.current.disconnect();
            compressorRef.current = null;
          }
          
          if (delayRef.current) {
            delayRef.current.disconnect();
            delayRef.current = null;
          }
          if (delayGainRef.current) {
            delayGainRef.current.disconnect();
            delayGainRef.current = null;
          }
        } catch (error) {
          console.error('Error cleaning up existing oscillators:', error);
        }
      }
      
      // Close existing context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      
      // Create new audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume if suspended (important for iOS)
      if (audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
          console.log('Rhythm audio context resumed successfully');
        } catch (error) {
          console.error('Failed to resume rhythm audio context:', error);
          // For iOS, we might need to wait for user interaction
          return;
        }
      }
      
      // Create compressor
      compressorRef.current = audioContextRef.current.createDynamicsCompressor();
      compressorRef.current.threshold.setValueAtTime(-20, audioContextRef.current.currentTime);
      compressorRef.current.knee.setValueAtTime(10, audioContextRef.current.currentTime);
      compressorRef.current.ratio.setValueAtTime(4, audioContextRef.current.currentTime);
      compressorRef.current.attack.setValueAtTime(0.001, audioContextRef.current.currentTime);
      compressorRef.current.release.setValueAtTime(0.1, audioContextRef.current.currentTime);
      
      // Create gain nodes
      kickGain1Ref.current = audioContextRef.current.createGain();
      kickGain2Ref.current = audioContextRef.current.createGain();
      snareGain1Ref.current = audioContextRef.current.createGain();
      snareGain2Ref.current = audioContextRef.current.createGain();
      hihatGain1Ref.current = audioContextRef.current.createGain();
      hihatGain2Ref.current = audioContextRef.current.createGain();
      tomGain1Ref.current = audioContextRef.current.createGain();
      tomGain2Ref.current = audioContextRef.current.createGain();
      
      // Create filters
      kickFilterRef.current = audioContextRef.current.createBiquadFilter();
      kickFilterRef.current.type = 'lowpass';
      kickFilterRef.current.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
      kickFilterRef.current.Q.setValueAtTime(1.5, audioContextRef.current.currentTime);
      
      snareFilterRef.current = audioContextRef.current.createBiquadFilter();
      snareFilterRef.current.type = 'bandpass';
      snareFilterRef.current.frequency.setValueAtTime(300, audioContextRef.current.currentTime);
      snareFilterRef.current.Q.setValueAtTime(2.0, audioContextRef.current.currentTime);
      
      hihatFilterRef.current = audioContextRef.current.createBiquadFilter();
      hihatFilterRef.current.type = 'highpass';
      hihatFilterRef.current.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      hihatFilterRef.current.Q.setValueAtTime(1.0, audioContextRef.current.currentTime);
      
      tomFilterRef.current = audioContextRef.current.createBiquadFilter();
      tomFilterRef.current.type = 'bandpass';
      tomFilterRef.current.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
      tomFilterRef.current.Q.setValueAtTime(1.8, audioContextRef.current.currentTime);
      
      // Create delay
      delayRef.current = audioContextRef.current.createDelay();
      delayRef.current.delayTime.setValueAtTime(0.2, audioContextRef.current.currentTime);
      
      delayGainRef.current = audioContextRef.current.createGain();
      delayGainRef.current.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
      
      // Create oscillators
      kickOsc1Ref.current = audioContextRef.current.createOscillator();
      kickOsc1Ref.current.type = 'sine';
      kickOsc1Ref.current.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
      kickOsc1Ref.current.connect(kickGain1Ref.current);
      
      kickOsc2Ref.current = audioContextRef.current.createOscillator();
      kickOsc2Ref.current.type = 'sawtooth';
      kickOsc2Ref.current.frequency.setValueAtTime(40, audioContextRef.current.currentTime);
      kickOsc2Ref.current.connect(kickGain2Ref.current);
      
      snareOsc1Ref.current = audioContextRef.current.createOscillator();
      snareOsc1Ref.current.type = 'square';
      snareOsc1Ref.current.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
      snareOsc1Ref.current.connect(snareGain1Ref.current);
      
      snareOsc2Ref.current = audioContextRef.current.createOscillator();
      snareOsc2Ref.current.type = 'sawtooth';
      snareOsc2Ref.current.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
      snareOsc2Ref.current.connect(snareGain2Ref.current);
      
      hihatOsc1Ref.current = audioContextRef.current.createOscillator();
      hihatOsc1Ref.current.type = 'square';
      hihatOsc1Ref.current.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      hihatOsc1Ref.current.connect(hihatGain1Ref.current);
      
      hihatOsc2Ref.current = audioContextRef.current.createOscillator();
      hihatOsc2Ref.current.type = 'sawtooth';
      hihatOsc2Ref.current.frequency.setValueAtTime(1200, audioContextRef.current.currentTime);
      hihatOsc2Ref.current.connect(hihatGain2Ref.current);
      
      tomOsc1Ref.current = audioContextRef.current.createOscillator();
      tomOsc1Ref.current.type = 'sine';
      tomOsc1Ref.current.frequency.setValueAtTime(120, audioContextRef.current.currentTime);
      tomOsc1Ref.current.connect(tomGain1Ref.current);
      
      tomOsc2Ref.current = audioContextRef.current.createOscillator();
      tomOsc2Ref.current.type = 'triangle';
      tomOsc2Ref.current.frequency.setValueAtTime(180, audioContextRef.current.currentTime);
      tomOsc2Ref.current.connect(tomGain2Ref.current);
      
      // Connect gains to filters
      kickGain1Ref.current.connect(kickFilterRef.current);
      kickGain2Ref.current.connect(kickFilterRef.current);
      snareGain1Ref.current.connect(snareFilterRef.current);
      snareGain2Ref.current.connect(snareFilterRef.current);
      hihatGain1Ref.current.connect(hihatFilterRef.current);
      hihatGain2Ref.current.connect(hihatFilterRef.current);
      tomGain1Ref.current.connect(tomFilterRef.current);
      tomGain2Ref.current.connect(tomFilterRef.current);
      
      // Connect filters to compressor
      kickFilterRef.current.connect(compressorRef.current);
      snareFilterRef.current.connect(compressorRef.current);
      hihatFilterRef.current.connect(compressorRef.current);
      tomFilterRef.current.connect(compressorRef.current);
      
      // Connect compressor to delay and destination
      compressorRef.current.connect(delayRef.current);
      compressorRef.current.connect(audioContextRef.current.destination);
      
      // Connect delay
      delayRef.current.connect(delayGainRef.current);
      delayGainRef.current.connect(audioContextRef.current.destination);
      
      // Set initial volumes to 0 and ensure they stay silent
      kickGain1Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      kickGain2Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      snareGain1Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      snareGain2Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      hihatGain1Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      hihatGain2Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      tomGain1Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      tomGain2Ref.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      
      // Ensure gains stay at 0 when not playing
      kickGain1Ref.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      kickGain2Ref.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      snareGain1Ref.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      snareGain2Ref.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      hihatGain1Ref.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      hihatGain2Ref.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      tomGain1Ref.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      tomGain2Ref.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      
      // Start oscillators
      kickOsc1Ref.current.start();
      kickOsc2Ref.current.start();
      snareOsc1Ref.current.start();
      snareOsc2Ref.current.start();
      hihatOsc1Ref.current.start();
      hihatOsc2Ref.current.start();
      tomOsc1Ref.current.start();
      tomOsc2Ref.current.start();
      
      isPlayingRef.current = true;
    } catch (error) {
      console.error('Failed to initialize rhythm system:', error);
    }
  }, [enabled, baseVolume]);

  // Update rhythm from mouse movement
  const updateRhythmFromMouse = useCallback((x: number, y: number, velocity: number) => {
    if (!enabled || !audioContextRef.current || !isPlayingRef.current) {
      return;
    }

    // Throttle updates
    const now = Date.now();
    if (now - lastUpdateRef.current < 15) return;
    lastUpdateRef.current = now;

    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    
    const xNormalized = x / window.innerWidth;
    const yNormalized = y / window.innerHeight;
    
    const velocityMultiplier = 1 + (velocity * 3.0);
    
    // Determine pattern
    let currentPattern = drumPatterns.basic;
    if (xNormalized < 0.25) {
      currentPattern = drumPatterns.basic;
    } else if (xNormalized < 0.5) {
      currentPattern = drumPatterns.complex;
    } else if (xNormalized < 0.75) {
      currentPattern = drumPatterns.fast;
    } else {
      currentPattern = drumPatterns.slow;
    }
    
    // Calculate beat interval
    const baseInterval = Math.max(50, 500 - (velocity * 400));
    const intervalVariation = Math.sin(audioTime * 2) * 100;
    const finalInterval = Math.max(20, baseInterval + intervalVariation);
    
    // Trigger beats
    if (audioTime - lastBeatTimeRef.current > (finalInterval / 1000)) {
      lastBeatTimeRef.current = audioTime;
      
      const drumIndex = Math.floor((yNormalized + velocity) * currentPattern.length) % currentPattern.length;
      const drumType = currentPattern[drumIndex];
      
      playDrumHit(drumType, velocityMultiplier);
      
      if (velocity > 0.1 && Math.random() > 0.5) { // 3x lower threshold for iPhone
        const secondDrum = currentPattern[(drumIndex + 1) % currentPattern.length];
        setTimeout(() => playDrumHit(secondDrum, velocityMultiplier * 0.7), 50);
      }
    }
    
    // Update frequencies
    const kickFreq = 80 - (yNormalized * 40) + Math.sin(audioTime * 0.5) * 20;
    const snareFreq = 200 + (xNormalized * 200) + Math.sin(audioTime * 0.7) * 50;
    const hihatFreq = 800 + (velocity * 400) + Math.sin(audioTime * 1.0) * 100;
    const tomFreq = 120 + (yNormalized * 80) + Math.sin(audioTime * 0.6) * 30;
    
    if (kickOsc1Ref.current && kickOsc2Ref.current) {
      kickOsc1Ref.current.frequency.setTargetAtTime(kickFreq, audioTime, 0.05);
      kickOsc2Ref.current.frequency.setTargetAtTime(kickFreq * 0.5, audioTime, 0.05);
    }
    
    if (snareOsc1Ref.current && snareOsc2Ref.current) {
      snareOsc1Ref.current.frequency.setTargetAtTime(snareFreq, audioTime, 0.08);
      snareOsc2Ref.current.frequency.setTargetAtTime(snareFreq * 2, audioTime, 0.08);
    }
    
    if (hihatOsc1Ref.current && hihatOsc2Ref.current) {
      hihatOsc1Ref.current.frequency.setTargetAtTime(hihatFreq, audioTime, 0.03);
      hihatOsc2Ref.current.frequency.setTargetAtTime(hihatFreq * 1.5, audioTime, 0.03);
    }
    
    if (tomOsc1Ref.current && tomOsc2Ref.current) {
      tomOsc1Ref.current.frequency.setTargetAtTime(tomFreq, audioTime, 0.06);
      tomOsc2Ref.current.frequency.setTargetAtTime(tomFreq * 1.5, audioTime, 0.06);
    }
    
    // Update filters
    if (kickFilterRef.current) {
      const cutoff = 150 - (yNormalized * 100) + Math.sin(audioTime * 0.4) * 30;
      kickFilterRef.current.frequency.setTargetAtTime(Math.max(50, cutoff), audioTime, 0.2);
    }
    
    if (snareFilterRef.current) {
      const cutoff = 300 + (xNormalized * 200) + Math.sin(audioTime * 0.6) * 50;
      snareFilterRef.current.frequency.setTargetAtTime(Math.max(150, cutoff), audioTime, 0.15);
    }
    
    if (hihatFilterRef.current) {
      const cutoff = 800 + (velocity * 400) + Math.sin(audioTime * 0.8) * 100;
      hihatFilterRef.current.frequency.setTargetAtTime(Math.max(400, cutoff), audioTime, 0.1);
    }
    
    if (tomFilterRef.current) {
      const cutoff = 200 + (yNormalized * 150) + Math.sin(audioTime * 0.5) * 40;
      tomFilterRef.current.frequency.setTargetAtTime(Math.max(100, cutoff), audioTime, 0.18);
    }
    
    // Update delay
    if (delayRef.current) {
      const delayTime = 0.1 + (velocity * 0.3) + Math.sin(audioTime * 0.3) * 0.1;
      delayRef.current.delayTime.setTargetAtTime(delayTime, audioTime, 0.3);
    }
    
  }, [enabled, baseVolume]);

  // Play drum hit
  const playDrumHit = useCallback((drumType: string, intensity: number) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const audioTime = ctx.currentTime;
    
    let duration = 0.1;
    let volume = baseVolume * intensity;
    
    switch (drumType) {
      case 'kick':
        duration = 0.15;
        volume *= 1.2;
        if (kickGain1Ref.current && kickGain2Ref.current) {
          kickGain1Ref.current.gain.setValueAtTime(0, audioTime);
          kickGain1Ref.current.gain.linearRampToValueAtTime(volume * 0.8, audioTime + 0.001);
          kickGain1Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
          kickGain1Ref.current.gain.setTargetAtTime(0, audioTime + duration, 0.05);
          
          kickGain2Ref.current.gain.setValueAtTime(0, audioTime);
          kickGain2Ref.current.gain.linearRampToValueAtTime(volume * 0.4, audioTime + 0.001);
          kickGain2Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
          kickGain2Ref.current.gain.setTargetAtTime(0, audioTime + duration, 0.05);
        }
        break;
      case 'snare':
        duration = 0.08;
        volume *= 1.0;
        if (snareGain1Ref.current && snareGain2Ref.current) {
          snareGain1Ref.current.gain.setValueAtTime(0, audioTime);
          snareGain1Ref.current.gain.linearRampToValueAtTime(volume * 0.7, audioTime + 0.001);
          snareGain1Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
          snareGain1Ref.current.gain.setTargetAtTime(0, audioTime + duration, 0.05);
          
          snareGain2Ref.current.gain.setValueAtTime(0, audioTime);
          snareGain2Ref.current.gain.linearRampToValueAtTime(volume * 0.3, audioTime + 0.001);
          snareGain2Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
          snareGain2Ref.current.gain.setTargetAtTime(0, audioTime + duration, 0.05);
        }
        break;
      case 'hihat':
        duration = 0.05;
        volume *= 0.8;
        if (hihatGain1Ref.current && hihatGain2Ref.current) {
          hihatGain1Ref.current.gain.setValueAtTime(0, audioTime);
          hihatGain1Ref.current.gain.linearRampToValueAtTime(volume * 0.6, audioTime + 0.001);
          hihatGain1Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
          hihatGain1Ref.current.gain.setTargetAtTime(0, audioTime + duration, 0.05);
          
          hihatGain2Ref.current.gain.setValueAtTime(0, audioTime);
          hihatGain2Ref.current.gain.linearRampToValueAtTime(volume * 0.2, audioTime + 0.001);
          hihatGain2Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
          hihatGain2Ref.current.gain.setTargetAtTime(0, audioTime + duration, 0.05);
        }
        break;
      case 'tom':
        duration = 0.12;
        volume *= 1.1;
        if (tomGain1Ref.current && tomGain2Ref.current) {
          tomGain1Ref.current.gain.setValueAtTime(0, audioTime);
          tomGain1Ref.current.gain.linearRampToValueAtTime(volume * 0.5, audioTime + 0.001);
          tomGain1Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
          tomGain1Ref.current.gain.setTargetAtTime(0, audioTime + duration, 0.05);
          
          tomGain2Ref.current.gain.setValueAtTime(0, audioTime);
          tomGain2Ref.current.gain.linearRampToValueAtTime(volume * 0.3, audioTime + 0.001);
          tomGain2Ref.current.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);
          tomGain2Ref.current.gain.setTargetAtTime(0, audioTime + duration, 0.05);
        }
        break;
    }
  }, [baseVolume]);

  // Start rhythm
  const startRhythm = useCallback(async () => {
    if (!enabled || isPlayingRef.current) return;
    isPlayingRef.current = true;
    await initAudio();
  }, [enabled, initAudio]);

  // Stop rhythm
  const stopRhythm = useCallback(() => {
    isPlayingRef.current = false;
    
    try {
      // Stop all oscillators
      if (kickOsc1Ref.current) {
        try { kickOsc1Ref.current.stop(); } catch (e) {}
        try { kickOsc1Ref.current.disconnect(); } catch (e) {}
        kickOsc1Ref.current = null;
      }
      if (kickOsc2Ref.current) {
        try { kickOsc2Ref.current.stop(); } catch (e) {}
        try { kickOsc2Ref.current.disconnect(); } catch (e) {}
        kickOsc2Ref.current = null;
      }
      if (snareOsc1Ref.current) {
        try { snareOsc1Ref.current.stop(); } catch (e) {}
        try { snareOsc1Ref.current.disconnect(); } catch (e) {}
        snareOsc1Ref.current = null;
      }
      if (snareOsc2Ref.current) {
        try { snareOsc2Ref.current.stop(); } catch (e) {}
        try { snareOsc2Ref.current.disconnect(); } catch (e) {}
        snareOsc2Ref.current = null;
      }
      if (hihatOsc1Ref.current) {
        try { hihatOsc1Ref.current.stop(); } catch (e) {}
        try { hihatOsc1Ref.current.disconnect(); } catch (e) {}
        hihatOsc1Ref.current = null;
      }
      if (hihatOsc2Ref.current) {
        try { hihatOsc2Ref.current.stop(); } catch (e) {}
        try { hihatOsc2Ref.current.disconnect(); } catch (e) {}
        hihatOsc2Ref.current = null;
      }
      if (tomOsc1Ref.current) {
        try { tomOsc1Ref.current.stop(); } catch (e) {}
        try { tomOsc1Ref.current.disconnect(); } catch (e) {}
        tomOsc1Ref.current = null;
      }
      if (tomOsc2Ref.current) {
        try { tomOsc2Ref.current.stop(); } catch (e) {}
        try { tomOsc2Ref.current.disconnect(); } catch (e) {}
        tomOsc2Ref.current = null;
      }
      
      // Disconnect all gain nodes
      if (kickGain1Ref.current) {
        try { kickGain1Ref.current.disconnect(); } catch (e) {}
        kickGain1Ref.current = null;
      }
      if (kickGain2Ref.current) {
        try { kickGain2Ref.current.disconnect(); } catch (e) {}
        kickGain2Ref.current = null;
      }
      if (snareGain1Ref.current) {
        try { snareGain1Ref.current.disconnect(); } catch (e) {}
        snareGain1Ref.current = null;
      }
      if (snareGain2Ref.current) {
        try { snareGain2Ref.current.disconnect(); } catch (e) {}
        snareGain2Ref.current = null;
      }
      if (hihatGain1Ref.current) {
        try { hihatGain1Ref.current.disconnect(); } catch (e) {}
        hihatGain1Ref.current = null;
      }
      if (hihatGain2Ref.current) {
        try { hihatGain2Ref.current.disconnect(); } catch (e) {}
        hihatGain2Ref.current = null;
      }
      if (tomGain1Ref.current) {
        try { tomGain1Ref.current.disconnect(); } catch (e) {}
        tomGain1Ref.current = null;
      }
      if (tomGain2Ref.current) {
        try { tomGain2Ref.current.disconnect(); } catch (e) {}
        tomGain2Ref.current = null;
      }
      
      // Disconnect all filters
      if (kickFilterRef.current) {
        try { kickFilterRef.current.disconnect(); } catch (e) {}
        kickFilterRef.current = null;
      }
      if (snareFilterRef.current) {
        try { snareFilterRef.current.disconnect(); } catch (e) {}
        snareFilterRef.current = null;
      }
      if (hihatFilterRef.current) {
        try { hihatFilterRef.current.disconnect(); } catch (e) {}
        hihatFilterRef.current = null;
      }
      if (tomFilterRef.current) {
        try { tomFilterRef.current.disconnect(); } catch (e) {}
        tomFilterRef.current = null;
      }
      
      // Disconnect compressor and delay
      if (compressorRef.current) {
        try { compressorRef.current.disconnect(); } catch (e) {}
        compressorRef.current = null;
      }
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
      console.error('Error stopping rhythm system:', error);
    }
  }, []);

  // Auto-start when enabled changes
  useEffect(() => {
    if (enabled && !isPlayingRef.current) {
      startRhythm();
    } else if (!enabled && isPlayingRef.current) {
      stopRhythm();
    }
  }, [enabled, startRhythm, stopRhythm]);

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
        stopRhythm();
      }
    };
  }, [stopRhythm]);

  return {
    startRhythm,
    stopRhythm,
    updateRhythmFromMouse,
    isPlaying: isPlayingRef.current
  };
}; 