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