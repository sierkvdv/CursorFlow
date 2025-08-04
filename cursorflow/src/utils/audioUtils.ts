// Audio utility functions for CursorFlow

export const createOscillator = (audioContext: AudioContext, frequency: number, type: OscillatorType = 'sine') => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;
  
  oscillator.connect(gainNode);
  return { oscillator, gainNode };
};

export const createFilter = (audioContext: AudioContext, frequency: number, type: BiquadFilterType = 'lowpass') => {
  const filter = audioContext.createBiquadFilter();
  filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
  filter.type = type;
  return filter;
};

export const createReverb = (audioContext: AudioContext, decay: number = 2.0) => {
  const convolver = audioContext.createConvolver();
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * decay;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  
  convolver.buffer = impulse;
  return convolver;
};

export const frequencyFromVelocity = (velocity: number, minFreq: number = 200, maxFreq: number = 800) => {
  return Math.min(maxFreq, minFreq + velocity * 50);
};

export const volumeFromVelocity = (velocity: number, maxVolume: number = 0.1) => {
  return Math.min(maxVolume, velocity * 0.01);
};

export const createClickSound = (audioContext: AudioContext) => {
  const { oscillator, gainNode } = createOscillator(audioContext, 400, 'square');
  const filter = createFilter(audioContext, 2000, 'lowpass');
  
  gainNode.connect(filter);
  filter.connect(audioContext.destination);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

export const createHoverSound = (audioContext: AudioContext) => {
  const { oscillator, gainNode } = createOscillator(audioContext, 600, 'sine');
  
  gainNode.connect(audioContext.destination);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

// 🔥 HEFTIGE GLITCH EFFECTEN 🔥
export const createGlitchDistortion = (audioContext: AudioContext) => {
  const waveshaper = audioContext.createWaveShaper();
  const curve = new Float32Array(44100);
  
  // Extreme distortion curve
  for (let i = 0; i < 44100; i++) {
    const x = (i * 2) / 44100 - 1;
    curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.1) * 0.8;
  }
  
  waveshaper.curve = curve;
  return waveshaper;
};

export const createBitCrusher = (audioContext: AudioContext, bits: number = 4) => {
  // iOS-compatible bit crusher using AudioWorklet or fallback
  try {
    // Try to use AudioWorklet if available (modern browsers)
    if (audioContext.audioWorklet) {
      // Simple bit crushing using waveshaper for iOS compatibility
      const waveshaper = audioContext.createWaveShaper();
      const curve = new Float32Array(44100);
      
      for (let i = 0; i < 44100; i++) {
        const x = (i * 2) / 44100 - 1;
        // Bit crushing effect using quantization
        const step = Math.pow(2, bits);
        curve[i] = Math.round(x * step) / step * 0.8;
      }
      
      waveshaper.curve = curve;
      return waveshaper;
    } else {
      // Fallback for older browsers
      const waveshaper = audioContext.createWaveShaper();
      const curve = new Float32Array(44100);
      
      for (let i = 0; i < 44100; i++) {
        const x = (i * 2) / 44100 - 1;
        curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.3) * 0.8;
      }
      
      waveshaper.curve = curve;
      return waveshaper;
    }
  } catch (error) {
    // Ultimate fallback - just return a simple gain node
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
    return gainNode;
  }
};

export const createFrequencyShifter = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.frequency.setValueAtTime(50, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  
  oscillator.connect(gainNode);
  return { oscillator, gainNode };
};

export const createGlitchClickSound = (audioContext: AudioContext) => {
  const isMobile = window.innerWidth <= 768;
  const baseFreq = isMobile ? 800 : 600; // Much higher frequency for better audibility
  
  // Create multiple oscillators for more complex glitch effect
  const { oscillator: osc1, gainNode: gain1 } = createOscillator(audioContext, baseFreq, 'square');
  const { oscillator: osc2, gainNode: gain2 } = createOscillator(audioContext, baseFreq * 1.5, 'sawtooth');
  const { oscillator: osc3, gainNode: gain3 } = createOscillator(audioContext, baseFreq * 0.7, 'triangle');
  
  const filter = createFilter(audioContext, isMobile ? 4000 : 3000, 'lowpass'); // Higher cutoff
  const distortion = createGlitchDistortion(audioContext);
  const bitCrusher = createBitCrusher(audioContext, isMobile ? 1 : 2); // More bit crushing for effect
  
  // Random glitch effects with multiple frequencies
  const randomFreq1 = 300 + Math.random() * 1000;
  const randomFreq2 = 200 + Math.random() * 800;
  const randomFreq3 = 400 + Math.random() * 1200;
  
  osc1.frequency.setValueAtTime(randomFreq1, audioContext.currentTime);
  osc2.frequency.setValueAtTime(randomFreq2, audioContext.currentTime);
  osc3.frequency.setValueAtTime(randomFreq3, audioContext.currentTime);
  
  // Connect all oscillators with glitch effects
  osc1.connect(gain1);
  osc2.connect(gain2);
  osc3.connect(gain3);
  
  gain1.connect(distortion);
  gain2.connect(distortion);
  gain3.connect(distortion);
  
  distortion.connect(bitCrusher);
  bitCrusher.connect(filter);
  filter.connect(audioContext.destination);
  
  // MUCH LOUDER VOLUME - ESPECIALLY ON MOBILE
  const baseVolume = isMobile ? 0.8 : 0.6; // Much louder
  const volumeVariation = isMobile ? 0.4 : 0.3; // More variation
  
  // Create volume spikes for dramatic effect
  gain1.gain.setValueAtTime(0, audioContext.currentTime);
  gain1.gain.linearRampToValueAtTime(baseVolume + Math.random() * volumeVariation, audioContext.currentTime + 0.005);
  gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
  
  gain2.gain.setValueAtTime(0, audioContext.currentTime);
  gain2.gain.linearRampToValueAtTime(baseVolume * 0.7 + Math.random() * volumeVariation, audioContext.currentTime + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
  
  gain3.gain.setValueAtTime(0, audioContext.currentTime);
  gain3.gain.linearRampToValueAtTime(baseVolume * 0.5 + Math.random() * volumeVariation, audioContext.currentTime + 0.015);
  gain3.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  // Start all oscillators
  osc1.start(audioContext.currentTime);
  osc2.start(audioContext.currentTime);
  osc3.start(audioContext.currentTime);
  
  // Stop with slight variations
  osc1.stop(audioContext.currentTime + 0.15 + Math.random() * 0.05);
  osc2.stop(audioContext.currentTime + 0.12 + Math.random() * 0.03);
  osc3.stop(audioContext.currentTime + 0.1 + Math.random() * 0.02);
};

export const createGlitchHoverSound = (audioContext: AudioContext) => {
  const isMobile = window.innerWidth <= 768;
  const baseFreq = isMobile ? 700 : 500;
  
  // Create multiple oscillators for complex glitch effect
  const { oscillator: osc1, gainNode: gain1 } = createOscillator(audioContext, baseFreq, 'sawtooth');
  const { oscillator: osc2, gainNode: gain2 } = createOscillator(audioContext, baseFreq * 1.3, 'square');
  
  const distortion = createGlitchDistortion(audioContext);
  const bitCrusher = createBitCrusher(audioContext, isMobile ? 2 : 4);
  
  // Random frequency modulation with multiple oscillators
  const randomFreq1 = 300 + Math.random() * 600;
  const randomFreq2 = 400 + Math.random() * 800;
  
  osc1.frequency.setValueAtTime(randomFreq1, audioContext.currentTime);
  osc2.frequency.setValueAtTime(randomFreq2, audioContext.currentTime);
  
  // Add random frequency jumps for glitch effect
  setTimeout(() => {
    if (osc1.frequency) {
      osc1.frequency.setValueAtTime(randomFreq1 + Math.random() * 300, audioContext.currentTime);
    }
  }, Math.random() * 30);
  
  setTimeout(() => {
    if (osc2.frequency) {
      osc2.frequency.setValueAtTime(randomFreq2 + Math.random() * 400, audioContext.currentTime);
    }
  }, Math.random() * 40);
  
  // Connect oscillators with glitch effects
  osc1.connect(gain1);
  osc2.connect(gain2);
  
  gain1.connect(distortion);
  gain2.connect(distortion);
  distortion.connect(bitCrusher);
  bitCrusher.connect(audioContext.destination);
  
  // LOUDER VOLUME FOR BETTER AUDIBILITY
  const baseVolume = isMobile ? 0.6 : 0.4;
  const volumeVariation = isMobile ? 0.3 : 0.2;
  
  gain1.gain.setValueAtTime(0, audioContext.currentTime);
  gain1.gain.linearRampToValueAtTime(baseVolume + Math.random() * volumeVariation, audioContext.currentTime + 0.005);
  gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
  
  gain2.gain.setValueAtTime(0, audioContext.currentTime);
  gain2.gain.linearRampToValueAtTime(baseVolume * 0.8 + Math.random() * volumeVariation, audioContext.currentTime + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);
  
  osc1.start(audioContext.currentTime);
  osc2.start(audioContext.currentTime);
  
  osc1.stop(audioContext.currentTime + 0.08 + Math.random() * 0.02);
  osc2.stop(audioContext.currentTime + 0.06 + Math.random() * 0.01);
}; 