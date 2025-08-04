import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Eye, EyeOff, Settings } from 'lucide-react';
import { createClickSound, createHoverSound, createGlitchClickSound, createGlitchHoverSound } from '../utils/audioUtils';

interface InteractiveElementsProps {
  audioEnabled: boolean;
  effectsEnabled: boolean;
  glitchEnabled?: boolean;
  onToggleAudio: () => void;
  onToggleEffects: () => void;
  onToggleSettings: () => void;
  audioDebug?: {
    isAudioSupported: boolean;
    hasUserInteracted: boolean;
    isMuted: boolean;
  };
}

export const InteractiveElements: React.FC<InteractiveElementsProps> = ({
  audioEnabled,
  effectsEnabled,
  glitchEnabled = false,
  onToggleAudio,
  onToggleEffects,
  onToggleSettings,
  audioDebug
}) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context with iOS support
  const getAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // iOS requires user interaction to start audio context
      if (audioContextRef.current.state === 'suspended') {
        try {
          // Create a silent oscillator to unlock audio on iOS
          const silentOsc = audioContextRef.current.createOscillator();
          const silentGain = audioContextRef.current.createGain();
          silentGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
          silentOsc.connect(silentGain);
          silentGain.connect(audioContextRef.current.destination);
          silentOsc.start();
          silentOsc.stop(audioContextRef.current.currentTime + 0.001);
          
          await audioContextRef.current.resume();
          console.log('Audio context resumed for iOS with silent oscillator');
        } catch (error) {
          console.error('Failed to resume audio context:', error);
        }
      }
    }
    return audioContextRef.current;
  }, []);

  // Audio handlers with glitch support and iOS compatibility
  const handleClick = useCallback(async (callback: () => void) => {
    if (audioEnabled) {
      try {
        const audioContext = await getAudioContext();
        if (glitchEnabled) {
          createGlitchClickSound(audioContext);
        } else {
          createClickSound(audioContext);
        }
      } catch (error) {
        console.error('Error playing click sound:', error);
      }
    }
    callback();
  }, [audioEnabled, glitchEnabled, getAudioContext]);

  const handleHover = useCallback(async () => {
    if (audioEnabled) {
      try {
        const audioContext = await getAudioContext();
        if (glitchEnabled) {
          createGlitchHoverSound(audioContext);
        } else {
          createHoverSound(audioContext);
        }
      } catch (error) {
        console.error('Error playing hover sound:', error);
      }
    }
  }, [audioEnabled, glitchEnabled, getAudioContext]);

  // iOS Audio Unlock function
  const unlockAudioForIOS = useCallback(async () => {
    try {
      const audioContext = await getAudioContext();
      if (audioContext.state === 'suspended') {
        const silentBuffer = audioContext.createBuffer(1, 1, 22050);
        const silentSource = audioContext.createBufferSource();
        silentSource.buffer = silentBuffer;
        silentSource.connect(audioContext.destination);
        silentSource.start();
        await audioContext.resume();
        console.log('🎵 iOS Audio unlocked successfully!');
      }
    } catch (error) {
      console.error('Failed to unlock iOS audio:', error);
    }
  }, [getAudioContext]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(async (callback: () => void) => {
    if (audioEnabled) {
      try {
        const audioContext = await getAudioContext();
        
        // iOS requires a silent audio buffer to unlock audio
        if (audioContext.state === 'suspended') {
          const silentBuffer = audioContext.createBuffer(1, 1, 22050);
          const silentSource = audioContext.createBufferSource();
          silentSource.buffer = silentBuffer;
          silentSource.connect(audioContext.destination);
          silentSource.start();
          await audioContext.resume();
        }
        
        if (glitchEnabled) {
          createGlitchHoverSound(audioContext);
        } else {
          createHoverSound(audioContext);
        }
      } catch (error) {
        console.error('Error playing touch sound:', error);
      }
    }
    callback();
  }, [audioEnabled, glitchEnabled, getAudioContext]);

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 }
  };

  const handleMouseEnter = useCallback((element: string) => {
    setHoveredElement(element);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null);
  }, []);

  return (
    <div className="fixed top-8 left-8 z-50 flex flex-col gap-6">
      {/* Audio Button - MUCH LARGER */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
        onClick={() => handleClick(onToggleAudio)}
        onMouseEnter={() => {
          handleMouseEnter('audio');
          handleHover();
        }}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => handleTouchStart(onToggleAudio)}
        onTouchEnd={() => {
          // iOS audio unlock on first touch
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            unlockAudioForIOS();
          }
        }}
        onTouchMove={() => {
          // Force audio test on touch move for iOS
          if (audioEnabled && audioContextRef.current) {
            try {
              const testOsc = audioContextRef.current.createOscillator();
              const testGain = audioContextRef.current.createGain();
              testGain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
              testOsc.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
              testOsc.connect(testGain);
              testGain.connect(audioContextRef.current.destination);
              testOsc.start();
              testOsc.stop(audioContextRef.current.currentTime + 0.1);
              console.log('🎵 iOS Audio test sound played!');
            } catch (error) {
              console.error('iOS Audio test failed:', error);
            }
          }
        }}
        className="relative group w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/20 backdrop-blur-md border-2 border-blue-400/50 rounded-2xl hover:border-blue-300/70 hover:from-blue-400/40 hover:to-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-blue-500/30 hover:scale-110 interactive-element"
      >
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {audioEnabled ? (
            <Volume2 className="w-8 h-8 text-blue-200 group-hover:text-blue-100 transition-colors" />
          ) : (
            <VolumeX className="w-8 h-8 text-gray-400 group-hover:text-gray-300 transition-colors" />
          )}
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredElement === 'audio' && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-md border border-blue-400/50 rounded-xl px-4 py-3 text-base whitespace-nowrap shadow-2xl"
            >
              <div className="text-blue-200 font-bold text-lg">{audioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}</div>
              {audioDebug && (
                <div className="mt-2 text-sm text-gray-300 space-y-1">
                  <div>Supported: {audioDebug.isAudioSupported ? '✅' : '❌'}</div>
                  <div>Interacted: {audioDebug.hasUserInteracted ? '✅' : '❌'}</div>
                  <div>Muted: {audioDebug.isMuted ? '🔇' : '🔊'}</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Effects Button - MUCH LARGER */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
        onClick={() => handleClick(onToggleEffects)}
        onMouseEnter={() => {
          handleMouseEnter('effects');
          handleHover();
        }}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => handleTouchStart(onToggleEffects)}
        className="relative group w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-600/20 backdrop-blur-md border-2 border-purple-400/50 rounded-2xl hover:border-purple-300/70 hover:from-purple-400/40 hover:to-purple-500/30 transition-all duration-500 shadow-xl hover:shadow-purple-500/30 hover:scale-110 interactive-element"
      >
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {effectsEnabled ? (
            <Eye className="w-8 h-8 text-purple-200 group-hover:text-purple-100 transition-colors" />
          ) : (
            <EyeOff className="w-8 h-8 text-gray-400 group-hover:text-gray-300 transition-colors" />
          )}
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredElement === 'effects' && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-md border border-purple-400/50 rounded-xl px-4 py-3 text-base whitespace-nowrap shadow-2xl"
            >
              <div className="text-purple-200 font-bold text-lg">{effectsEnabled ? '👁️ Effects ON' : '🙈 Effects OFF'}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Settings Button - MUCH LARGER */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
        onClick={() => handleClick(onToggleSettings)}
        onMouseEnter={() => {
          handleMouseEnter('settings');
          handleHover();
        }}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => handleTouchStart(onToggleSettings)}
        className="relative group w-16 h-16 bg-gradient-to-br from-orange-500/30 to-orange-600/20 backdrop-blur-md border-2 border-orange-400/50 rounded-2xl hover:border-orange-300/70 hover:from-orange-400/40 hover:to-orange-500/30 transition-all duration-500 shadow-xl hover:shadow-orange-500/30 hover:scale-110 interactive-element"
      >
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Settings className="w-8 h-8 text-orange-200 group-hover:text-orange-100 transition-colors" />
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-orange-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredElement === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-md border border-orange-400/50 rounded-xl px-4 py-3 text-base whitespace-nowrap shadow-2xl"
            >
              <div className="text-orange-200 font-bold text-lg">⚙️ Settings</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}; 