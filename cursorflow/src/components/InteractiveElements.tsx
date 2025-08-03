import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Eye, EyeOff, Settings } from 'lucide-react';

interface InteractiveElementsProps {
  audioEnabled: boolean;
  effectsEnabled: boolean;
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
  onToggleAudio,
  onToggleEffects,
  onToggleSettings,
  audioDebug
}) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

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
    <div className="fixed top-8 right-8 z-30 flex flex-col gap-6">
      {/* Audio Button - MUCH LARGER */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
        onClick={onToggleAudio}
        onMouseEnter={() => handleMouseEnter('audio')}
        onMouseLeave={handleMouseLeave}
        className="relative group w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/20 backdrop-blur-md border-2 border-blue-400/50 rounded-2xl hover:border-blue-300/70 hover:from-blue-400/40 hover:to-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-blue-500/30 hover:scale-110"
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
              className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-md border border-blue-400/50 rounded-xl px-4 py-3 text-base whitespace-nowrap shadow-2xl"
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
        onClick={onToggleEffects}
        onMouseEnter={() => handleMouseEnter('effects')}
        onMouseLeave={handleMouseLeave}
        className="relative group w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-600/20 backdrop-blur-md border-2 border-purple-400/50 rounded-2xl hover:border-purple-300/70 hover:from-purple-400/40 hover:to-purple-500/30 transition-all duration-500 shadow-xl hover:shadow-purple-500/30 hover:scale-110"
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
              className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-md border border-purple-400/50 rounded-xl px-4 py-3 text-base whitespace-nowrap shadow-2xl"
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
        onClick={onToggleSettings}
        onMouseEnter={() => handleMouseEnter('settings')}
        onMouseLeave={handleMouseLeave}
        className="relative group w-16 h-16 bg-gradient-to-br from-orange-500/30 to-orange-600/20 backdrop-blur-md border-2 border-orange-400/50 rounded-2xl hover:border-orange-300/70 hover:from-orange-400/40 hover:to-orange-500/30 transition-all duration-500 shadow-xl hover:shadow-orange-500/30 hover:scale-110"
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
              className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-md border border-orange-400/50 rounded-xl px-4 py-3 text-base whitespace-nowrap shadow-2xl"
            >
              <div className="text-orange-200 font-bold text-lg">⚙️ Settings</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}; 