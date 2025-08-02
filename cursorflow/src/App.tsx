import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorTracker } from './components/CursorTracker';
import { InteractiveElements } from './components/InteractiveElements';
import { useAudioEffects } from './hooks/useAudioEffects';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const
    }
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const
    }
  }
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cacheBuster, setCacheBuster] = useState(Date.now()); // FORCE CACHE REFRESH

  const { playClick, playHover, isAudioSupported, hasUserInteracted, isMuted } = useAudioEffects({ 
    enabled: audioEnabled 
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleAudio = () => {
    setAudioEnabled(prev => !prev);
    playClick();
  };

  const handleToggleEffects = () => {
    setEffectsEnabled(prev => !prev);
    playClick();
  };

  const handleToggleSettings = () => {
    playClick();
  };

  const handleTestAudio = () => {
    playClick();
  };

  const audioDebug = {
    isAudioSupported,
    hasUserInteracted,
    isMuted
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white overflow-hidden relative">
      {/* Subtle Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Cursor Tracker - WITH SIMPLIFIED AMBIENT AUDIO (no setInterval) */}
      <CursorTracker
        enabled={effectsEnabled}
        showTrail={effectsEnabled}
        showParticles={effectsEnabled}
        audioEnabled={audioEnabled}
        melodyEnabled={audioEnabled}
        drumEnabled={audioEnabled}
        ambientEnabled={audioEnabled}
        natureEnabled={audioEnabled}
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

      {/* Status Indicators - CACHE BUSTER VERSION */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/30 backdrop-blur-sm rounded-full border border-red-400/50">
          <div className={`w-2 h-2 rounded-full ${effectsEnabled ? 'bg-yellow-400' : 'bg-gray-500'}`} />
          <span className="text-yellow-200 font-medium">FX</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/30 backdrop-blur-sm rounded-full border border-blue-400/50">
          <div className={`w-2 h-2 rounded-full ${audioEnabled ? 'bg-green-400' : 'bg-gray-500'}`} />
          <span className="text-green-200 font-medium">AUDIO</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/30 backdrop-blur-sm rounded-full border border-purple-400/50">
          <div className={`w-2 h-2 rounded-full ${hasUserInteracted ? 'bg-pink-400' : 'bg-red-400'}`} />
          <span className="text-pink-200 font-medium">READY</span>
        </div>
      </div>

      {/* Main Content - COMPLETELY REDESIGNED */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center"
          >
            {/* Hero Section - FINAL VERSION */}
            <motion.div 
              variants={itemVariants}
              className="text-center mb-48 px-20"
            >
              <motion.h1 
                className="text-9xl md:text-[12rem] font-black mb-20 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent leading-none"
              >
                CURSORFLOW
              </motion.h1>
              <motion.p 
                className="text-3xl md:text-4xl text-gray-100 max-w-5xl mx-auto leading-relaxed"
              >
                Experience the future of interactive design with beautiful cursor effects and immersive audio feedback
              </motion.p>
            </motion.div>

            {/* Features - CENTERED VERSION */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col gap-48 mb-60 max-w-3xl w-full mx-auto px-20"
            >
              {/* Visual Effects - CENTERED */}
              <motion.div
                variants={featureVariants}
                whileHover="hover"
                className="group text-center p-20 rounded-3xl hover:bg-white/5 transition-all duration-500 cursor-pointer"
                onClick={handleTestAudio}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:from-orange-400/30 group-hover:to-red-500/30 transition-all duration-500">
                  <span className="text-6xl">✨</span>
                </div>
                <h3 className="text-4xl font-bold mb-8 text-orange-300 group-hover:text-orange-200 transition-colors">Visual Effects</h3>
                <p className="text-gray-300 leading-relaxed text-2xl max-w-2xl mx-auto">Beautiful cursor trails and particle effects that respond to your movement</p>
              </motion.div>

              {/* Audio Feedback - CENTERED */}
              <motion.div
                variants={featureVariants}
                whileHover="hover"
                className="group text-center p-20 rounded-3xl hover:bg-white/5 transition-all duration-500 cursor-pointer"
                onClick={handleTestAudio}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:from-blue-400/30 group-hover:to-cyan-500/30 transition-all duration-500">
                  <span className="text-6xl">🔊</span>
                </div>
                <h3 className="text-4xl font-bold mb-8 text-blue-300 group-hover:text-blue-200 transition-colors">Audio Feedback</h3>
                <p className="text-gray-300 leading-relaxed text-2xl max-w-2xl mx-auto">Immersive sound effects that enhance your interaction experience</p>
              </motion.div>

              {/* Performance - CENTERED */}
              <motion.div
                variants={featureVariants}
                whileHover="hover"
                className="group text-center p-20 rounded-3xl hover:bg-white/5 transition-all duration-500 cursor-pointer"
                onClick={handleTestAudio}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:from-yellow-400/30 group-hover:to-orange-500/30 transition-all duration-500">
                  <span className="text-6xl">⚡</span>
                </div>
                <h3 className="text-4xl font-bold mb-8 text-yellow-300 group-hover:text-yellow-200 transition-colors">Performance</h3>
                <p className="text-gray-300 leading-relaxed text-2xl max-w-2xl mx-auto">Optimized for smooth 60fps performance on all devices</p>
              </motion.div>

              {/* Interactive Melody - NEW FEATURE */}
              <motion.div
                variants={featureVariants}
                whileHover="hover"
                className="group text-center p-20 rounded-3xl hover:bg-white/5 transition-all duration-500 cursor-pointer"
                onClick={handleTestAudio}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-500">
                  <span className="text-6xl">🎵</span>
                </div>
                <h3 className="text-4xl font-bold mb-8 text-green-300 group-hover:text-green-200 transition-colors">Interactive Melody</h3>
                <p className="text-gray-300 leading-relaxed text-2xl max-w-2xl mx-auto">Move your mouse vertically to control the pitch of a beautiful melody</p>
              </motion.div>

              {/* Interactive Drum Loop - NEW FEATURE */}
              <motion.div
                variants={featureVariants}
                whileHover="hover"
                className="group text-center p-20 rounded-3xl hover:bg-white/5 transition-all duration-500 cursor-pointer"
                onClick={handleTestAudio}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:from-red-400/30 group-hover:to-pink-500/30 transition-all duration-500">
                  <span className="text-6xl">🥁</span>
                </div>
                <h3 className="text-4xl font-bold mb-8 text-red-300 group-hover:text-red-200 transition-colors">Interactive Drum Loop</h3>
                <p className="text-gray-300 leading-relaxed text-2xl max-w-2xl mx-auto">Move your mouse horizontally to change BPM and drum patterns</p>
              </motion.div>

              {/* Ambient Background Audio - NEW FEATURE */}
              <motion.div
                variants={featureVariants}
                whileHover="hover"
                className="group text-center p-20 rounded-3xl hover:bg-white/5 transition-all duration-500 cursor-pointer"
                onClick={handleTestAudio}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:from-indigo-400/30 group-hover:to-purple-500/30 transition-all duration-500">
                  <span className="text-6xl">🌊</span>
                </div>
                <h3 className="text-4xl font-bold mb-8 text-indigo-300 group-hover:text-indigo-200 transition-colors">Ambient Background</h3>
                <p className="text-gray-300 leading-relaxed text-2xl max-w-2xl mx-auto">Subtle ambient sounds that vary with your mouse movement</p>
              </motion.div>
            </motion.div>

            {/* CTA Button - IMPROVED VERSION */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTestAudio}
              className="mt-32 px-16 py-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl font-bold text-2xl text-white hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 transform hover:-translate-y-1"
            >
              🎵 Test Audio & Effects 🎵
            </motion.button>

            {/* Loading Spinner */}
            {!isLoaded && (
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
