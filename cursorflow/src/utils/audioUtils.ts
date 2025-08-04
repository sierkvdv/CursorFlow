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
  const { oscillator, gainNode } = createOscillator(audioContext, 400, 'square');
  const filter = createFilter(audioContext, 2000, 'lowpass');
  const distortion = createGlitchDistortion(audioContext);
  const bitCrusher = createBitCrusher(audioContext, 3);
  const { oscillator: shifterOsc, gainNode: shifterGain } = createFrequencyShifter(audioContext);
  
  // Random glitch effects
  const randomFreq = 200 + Math.random() * 800;
  const randomType = ['sawtooth', 'square', 'triangle'][Math.floor(Math.random() * 3)] as OscillatorType;
  
  oscillator.frequency.setValueAtTime(randomFreq, audioContext.currentTime);
  oscillator.type = randomType;
  
  // Connect with glitch effects
  oscillator.connect(gainNode);
  gainNode.connect(distortion);
  distortion.connect(bitCrusher);
  bitCrusher.connect(filter);
  filter.connect(audioContext.destination);
  
  // Add frequency shifting
  shifterOsc.start(audioContext.currentTime);
  shifterOsc.stop(audioContext.currentTime + 0.3);
  
  // Random volume spikes
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.2, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2 + Math.random() * 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

export const createGlitchHoverSound = (audioContext: AudioContext) => {
  const { oscillator, gainNode } = createOscillator(audioContext, 600, 'sawtooth');
  const distortion = createGlitchDistortion(audioContext);
  const bitCrusher = createBitCrusher(audioContext, 5);
  
  // Random frequency modulation
  const baseFreq = 400 + Math.random() * 400;
  oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
  
  // Add random frequency jumps
  setTimeout(() => {
    if (oscillator.frequency) {
      oscillator.frequency.setValueAtTime(baseFreq + Math.random() * 200, audioContext.currentTime);
    }
  }, Math.random() * 50);
  
  oscillator.connect(gainNode);
  gainNode.connect(distortion);
  distortion.connect(bitCrusher);
  bitCrusher.connect(audioContext.destination);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15 + Math.random() * 0.1, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}; 