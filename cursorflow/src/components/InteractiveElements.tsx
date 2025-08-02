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
    <div className="fixed top-8 right-8 z-50 flex flex-col gap-4">
      {/* Audio Button - COMPLETELY REDESIGNED */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
        onClick={onToggleAudio}
        onMouseEnter={() => handleMouseEnter('audio')}
        onMouseLeave={handleMouseLeave}
        className="relative group w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 backdrop-blur-md border border-secondary/30 rounded-2xl hover:border-secondary/50 hover:from-secondary/30 hover:to-secondary/20 transition-all duration-500 shadow-lg hover:shadow-secondary/25"
      >
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {audioEnabled ? (
            <Volume2 className="w-5 h-5 text-secondary group-hover:text-secondary/80 transition-colors" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
          )}
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredElement === 'audio' && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-md border border-secondary/30 rounded-xl px-3 py-2 text-sm whitespace-nowrap shadow-xl"
            >
              <div className="text-secondary font-medium">{audioEnabled ? 'Audio ON' : 'Audio OFF'}</div>
              {audioDebug && (
                <div className="mt-2 text-xs text-gray-300 space-y-1">
                  <div>Supported: {audioDebug.isAudioSupported ? '✅' : '❌'}</div>
                  <div>Interacted: {audioDebug.hasUserInteracted ? '✅' : '❌'}</div>
                  <div>Muted: {audioDebug.isMuted ? '🔇' : '🔊'}</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Effects Button - COMPLETELY REDESIGNED */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
        onClick={onToggleEffects}
        onMouseEnter={() => handleMouseEnter('effects')}
        onMouseLeave={handleMouseLeave}
        className="relative group w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-md border border-primary/30 rounded-2xl hover:border-primary/50 hover:from-primary/30 hover:to-primary/20 transition-all duration-500 shadow-lg hover:shadow-primary/25"
      >
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {effectsEnabled ? (
            <Eye className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
          )}
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredElement === 'effects' && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-md border border-primary/30 rounded-xl px-3 py-2 text-sm whitespace-nowrap shadow-xl"
            >
              <div className="text-primary font-medium">{effectsEnabled ? 'Effects ON' : 'Effects OFF'}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Settings Button - COMPLETELY REDESIGNED */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
        onClick={onToggleSettings}
        onMouseEnter={() => handleMouseEnter('settings')}
        onMouseLeave={handleMouseLeave}
        className="relative group w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-md border border-accent/30 rounded-2xl hover:border-accent/50 hover:from-accent/30 hover:to-accent/20 transition-all duration-500 shadow-lg hover:shadow-accent/25"
      >
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Settings className="w-5 h-5 text-accent group-hover:text-accent/80 transition-colors" />
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredElement === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-md border border-accent/30 rounded-xl px-3 py-2 text-sm whitespace-nowrap shadow-xl"
            >
              <div className="text-accent font-medium">Settings</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}; 