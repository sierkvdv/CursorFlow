import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorTracker } from './components/CursorTracker';
import { InteractiveElements } from './components/InteractiveElements';
import { SettingsMenu } from './components/SettingsMenu';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [melodyEnabled, setMelodyEnabled] = useState(false);
  const [drumEnabled, setDrumEnabled] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [natureEnabled, setNatureEnabled] = useState(true);
  const [currentTitle, setCurrentTitle] = useState(0);

  // Simple audio state
  const [isAudioSupported] = useState(true);
  const [hasUserInteracted] = useState(true);
  const [isMuted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Cycle through titles every 3 seconds
  useEffect(() => {
    if (!isLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentTitle((prev) => (prev + 1) % 4); // 4 titles: 0,1,2,3
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLoaded]);

  const handleToggleAudio = () => {
    setAudioEnabled(prev => !prev);
  };

  const handleToggleEffects = () => {
    setEffectsEnabled(prev => !prev);
  };

  const handleToggleSettings = () => {
    setSettingsOpen(prev => !prev);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleToggleMelody = () => {
    console.log('🎵 Toggle melody clicked, current state:', melodyEnabled);
    setMelodyEnabled(prev => !prev);
  };

  const handleToggleDrum = () => {
    console.log('🥁 Toggle drum clicked, current state:', drumEnabled);
    setDrumEnabled(prev => !prev);
  };

  const handleToggleAmbient = () => {
    setAmbientEnabled(prev => !prev);
  };

  const handleToggleNature = () => {
    setNatureEnabled(prev => !prev);
  };

  const handleTestAudio = () => {
    console.log('🔊 Test audio clicked');
    
    try {
      // Create a simple audio context test
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🔊 Audio context created, state:', audioContext.state);
      
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('🔊 Audio context resumed');
          playTestSound(audioContext);
        });
      } else {
        playTestSound(audioContext);
      }
    } catch (error) {
      console.error('❌ Audio test failed:', error);
    }
  };

  const playTestSound = (audioContext: AudioContext) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.5);
    
    console.log('🔊 Test sound played (440Hz for 0.5s)');
  };

  const audioDebug = {
    isAudioSupported,
    hasUserInteracted,
    isMuted
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Cursor Tracker */}
      <CursorTracker
        enabled={effectsEnabled}
        showTrail={effectsEnabled}
        showParticles={effectsEnabled}
        audioEnabled={audioEnabled}
        melodyEnabled={melodyEnabled}
        drumEnabled={drumEnabled}
        ambientEnabled={ambientEnabled}
        natureEnabled={natureEnabled}
      />

      {/* Interactive Elements */}
      <InteractiveElements
        audioEnabled={audioEnabled}
        effectsEnabled={effectsEnabled}
        onToggleAudio={handleToggleAudio}
        onToggleEffects={handleToggleEffects}
        onToggleSettings={handleToggleSettings}
        audioDebug={audioDebug}
      />

      {/* Settings Menu */}
      <SettingsMenu
        isOpen={settingsOpen}
        onClose={handleCloseSettings}
        audioEnabled={audioEnabled}
        effectsEnabled={effectsEnabled}
        melodyEnabled={melodyEnabled}
        drumEnabled={drumEnabled}
        ambientEnabled={ambientEnabled}
        natureEnabled={natureEnabled}
        onToggleAudio={handleToggleAudio}
        onToggleEffects={handleToggleEffects}
        onToggleMelody={handleToggleMelody}
        onToggleDrum={handleToggleDrum}
        onToggleAmbient={handleToggleAmbient}
        onToggleNature={handleToggleNature}
      />

      {/* Status Indicators - REORDERED */}
      <div className="fixed top-8 right-8 z-30 flex flex-col gap-8">
        {/* Audio Status - NOW FIRST (with speaker icon) */}
        <div className="flex items-center justify-between px-8 py-4 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/30 shadow-lg min-w-[280px]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <div className={`w-3 h-3 rounded-full ${audioEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-green-200 font-semibold text-sm">AUDIO SYSTEM</span>
            <span className="text-xs text-gray-300 ml-2">({audioEnabled ? 'ON' : 'OFF'})</span>
          </div>
        </div>
        
        {/* Visual Effects Status - NOW SECOND (with eye icon) */}
        <div className="flex items-center justify-between px-8 py-4 bg-red-500/20 backdrop-blur-md rounded-xl border border-red-400/30 shadow-lg min-w-[280px]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-red-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <div className={`w-3 h-3 rounded-full ${effectsEnabled ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`} />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-200 font-semibold text-sm">VISUAL EFFECTS</span>
            <span className="text-xs text-gray-300 ml-2">({effectsEnabled ? 'ON' : 'OFF'})</span>
          </div>
        </div>
        
        {/* Ready Status - NOW THIRD (with settings icon) */}
        <div className="flex items-center justify-between px-8 py-4 bg-purple-500/20 backdrop-blur-md rounded-xl border border-purple-400/30 shadow-lg min-w-[280px]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
              <div className={`w-3 h-3 rounded-full ${hasUserInteracted ? 'bg-pink-400 animate-pulse' : 'bg-red-400'}`} />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-pink-200 font-semibold text-sm">SYSTEM STATUS</span>
            <span className="text-xs text-gray-300 ml-2">({hasUserInteracted ? 'READY' : 'WAITING'})</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 min-h-screen flex flex-col items-center justify-center"
          >
                        {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-20 flex flex-col justify-end min-h-screen pb-32"
            >
              {/* Title Section - moved to top */}
              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {currentTitle === 0 && (
                    <motion.div
                      key="cursorflow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.8 }}
                    >
                      <motion.h1 
                        className="text-9xl md:text-[12rem] font-black text-yellow-300 leading-none"
                      >
                        CURSORFLOW
                      </motion.h1>
                    </motion.div>
                  )}
                  
                  {currentTitle === 1 && (
                    <motion.div
                      key="sound"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.8 }}
                    >
                      <motion.div className="flex items-center justify-center gap-16">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="text-7xl md:text-9xl"
                        >
                          🎵
                        </motion.div>
                        <motion.h2 
                          className="text-8xl md:text-9xl font-black text-blue-300 leading-none"
                        >
                          SOUND
                        </motion.h2>
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="text-7xl md:text-9xl"
                        >
                          🔊
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {currentTitle === 2 && (
                    <motion.div
                      key="interactief"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.8 }}
                    >
                      <motion.div className="flex items-center justify-center gap-16">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="text-7xl md:text-9xl"
                        >
                          🎮
                        </motion.div>
                        <motion.h2 
                          className="text-8xl md:text-9xl font-black text-green-300 leading-none"
                        >
                          INTERACTIEF
                        </motion.h2>
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="text-7xl md:text-9xl"
                        >
                          ✨
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {currentTitle === 3 && (
                    <motion.div
                      key="visuals"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.8 }}
                    >
                      <motion.div className="flex items-center justify-center gap-16">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="text-7xl md:text-9xl"
                        >
                          👁️
                        </motion.div>
                        <motion.h2 
                          className="text-8xl md:text-9xl font-black text-orange-300 leading-none"
                        >
                          VISUALS
                        </motion.h2>
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="text-7xl md:text-9xl"
                        >
                          🌟
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Bottom Section - Description only */}
              <div className="space-y-8">
                {/* Description Section */}
                <motion.p 
                  className="text-3xl md:text-4xl text-gray-100 max-w-5xl mx-auto leading-relaxed"
                >
                  Experience the future of interactive design with beautiful cursor effects and immersive audio feedback
                </motion.p>

                {/* Empty space to maintain layout */}
                <div className="h-20"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
