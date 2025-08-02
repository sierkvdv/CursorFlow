import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCursorTracking } from '../hooks/useCursorTracking';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { useAudioEffects } from '../hooks/useAudioEffects';
import { useMelodySystem } from '../hooks/useMelodySystem';
import { useDrumSystem } from '../hooks/useDrumSystem';
import { useAmbientAudio } from '../hooks/useAmbientAudio';
import { useNatureAmbient } from '../hooks/useNatureAmbient';

interface CursorTrackerProps {
  enabled?: boolean;
  showTrail?: boolean;
  showParticles?: boolean;
  audioEnabled?: boolean;
  melodyEnabled?: boolean;
  drumEnabled?: boolean;
  ambientEnabled?: boolean;
  natureEnabled?: boolean;
}

export const CursorTracker: React.FC<CursorTrackerProps> = ({
  enabled = true,
  showTrail = true,
  showParticles = true,
  audioEnabled = true,
  melodyEnabled = true,
  drumEnabled = true,
  ambientEnabled = true,
  natureEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cursorPosition, isMoving } = useCursorTracking({ enabled });
  const { 
    particles, 
    trail, 
    ripples, 
    addParticles, 
    updateTrail, 
    natureVisuals, 
    updateNatureVisuals, 
    addNatureParticles,
    addNatureBackground,
    drawNatureBackground
  } = useVisualEffects({
    enabled: showParticles || showTrail 
  });
  const { playCursorMove, playClick } = useAudioEffects({ enabled: audioEnabled });
  
  // Initialize audio systems with error handling
  const melodySystem = useMelodySystem({ enabled: melodyEnabled });
  const drumSystem = useDrumSystem({ enabled: drumEnabled });
  const ambientSystem = useAmbientAudio({ enabled: ambientEnabled });
  const natureSystem = useNatureAmbient({ enabled: natureEnabled });

  const { startMelody, updateMelodyFromMouse, isPlaying: isMelodyPlaying, currentPitch } = melodySystem || {};
  const { startDrumLoop, updateDrumFromMouse, isPlaying: isDrumPlaying, currentBpm, currentPattern } = drumSystem || {};
  const { startAmbient, updateAmbientFromMouse, isPlaying: isAmbientPlaying } = ambientSystem || {};
  const { startNature, updateNatureFromMouse, isPlaying: isNaturePlaying } = natureSystem || {};

  console.log('CursorTracker rendering...');

  // Start audio systems immediately when component mounts
  useEffect(() => {
    if (drumEnabled && drumSystem && !isDrumPlaying && startDrumLoop) {
      console.log('Starting drum system...');
      try {
        startDrumLoop();
      } catch (error) {
        console.error('Failed to start drum system:', error);
      }
    }
    
    if (melodyEnabled && melodySystem && !isMelodyPlaying && startMelody) {
      console.log('Starting melody system...');
      try {
        startMelody();
      } catch (error) {
        console.error('Failed to start melody system:', error);
      }
    }
    
    if (ambientEnabled && ambientSystem && !isAmbientPlaying && startAmbient) {
      console.log('Starting ambient audio...');
      try {
        startAmbient();
      } catch (error) {
        console.error('Failed to start ambient audio:', error);
      }
    }
    
    if (natureEnabled && natureSystem && !isNaturePlaying && startNature) {
      console.log('Starting nature ambient...');
      try {
        startNature();
      } catch (error) {
        console.error('Failed to start nature ambient:', error);
      }
    }
  }, [drumEnabled, melodyEnabled, ambientEnabled, natureEnabled, isDrumPlaying, isMelodyPlaying, isAmbientPlaying, isNaturePlaying, startDrumLoop, startMelody, startAmbient, startNature, drumSystem, melodySystem, ambientSystem, natureSystem]);

  // Initialize nature ambient audio when component mounts
  useEffect(() => {
    if (natureEnabled && enabled && natureSystem) {
      console.log('Starting nature ambient system...');
      natureSystem.startNature();
    } else if (!natureEnabled && natureSystem) {
      console.log('Stopping nature ambient system...');
      natureSystem.stopNature();
    }
  }, [natureEnabled, enabled, natureSystem]);

  // Handle cursor movement with throttling - optimized with useCallback
  const handleCursorUpdate = useCallback(() => {
    if (!enabled) return;

    updateTrail(cursorPosition.x, cursorPosition.y);
    
    if (isMoving && showParticles) {
      // Add particles more frequently for smoother effect
      addParticles(cursorPosition.x, cursorPosition.y, cursorPosition.velocity, 2);
    }

    // Update nature visuals based on mouse position
    if (showParticles && updateNatureVisuals) {
      updateNatureVisuals(cursorPosition.x, cursorPosition.y);
    }

    // Add nature background effects based on audio intensity
    if (showParticles && addNatureBackground) {
      addNatureBackground();
    }

    // Throttled and randomized cursor movement sound
    if (isMoving && audioEnabled) {
      // Much slower triggering - only 3% chance per frame instead of 15%
      const shouldPlay = Math.random() < 0.03; // 3% chance per frame
      if (shouldPlay && cursorPosition.velocity > 0.3) { // Higher velocity threshold
        playCursorMove(cursorPosition.velocity);
      }
    }

    // Update melody based on vertical mouse position - ALWAYS UPDATE
    if (melodyEnabled && melodySystem && updateMelodyFromMouse) {
      try {
        updateMelodyFromMouse(cursorPosition.y, cursorPosition.velocity, cursorPosition.x);
      } catch (error) {
        console.error('Melody update error:', error);
      }
    }

    // Update drum loop based on horizontal mouse position
    if (drumEnabled && drumSystem && updateDrumFromMouse) {
      try {
        updateDrumFromMouse(cursorPosition.x, cursorPosition.velocity);
      } catch (error) {
        console.error('Drum update error:', error);
      }
    }

    // Update ambient audio based on mouse movement
    if (ambientEnabled && ambientSystem && updateAmbientFromMouse) {
      try {
        updateAmbientFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      } catch (error) {
        console.error('Ambient update error:', error);
      }
    }

    // Update nature ambient based on mouse movement
    if (natureEnabled && natureSystem && updateNatureFromMouse) {
      try {
        updateNatureFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      } catch (error) {
        console.error('Nature update error:', error);
      }
    }
  }, [
    enabled, 
    cursorPosition.x, 
    cursorPosition.y, 
    cursorPosition.velocity, 
    isMoving, 
    showParticles, 
    audioEnabled, 
    melodyEnabled, 
    drumEnabled, 
    ambientEnabled,
    natureEnabled,
    updateTrail,
    addParticles,
    updateNatureVisuals,
    addNatureParticles,
    playCursorMove,
    updateMelodyFromMouse,
    updateDrumFromMouse,
    updateAmbientFromMouse,
    updateNatureFromMouse,
    melodySystem,
    drumSystem,
    ambientSystem,
    natureSystem
  ]);

  useEffect(() => {
    handleCursorUpdate();
  }, [handleCursorUpdate]);

  // Handle clicks with different sounds for left and right
  const handleLeftClick = useCallback(() => {
    if (!enabled || !audioEnabled) return;
    playClick('left');
  }, [enabled, audioEnabled, playClick]);

  const handleRightClick = useCallback((event: MouseEvent) => {
    if (!enabled || !audioEnabled) return;
    event.preventDefault();
    playClick('right');
  }, [enabled, audioEnabled, playClick]);

  useEffect(() => {
    document.addEventListener('click', handleLeftClick);
    document.addEventListener('contextmenu', handleRightClick);
    return () => {
      document.removeEventListener('click', handleLeftClick);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [handleLeftClick, handleRightClick]);

  // Debug logging for audio systems
  useEffect(() => {
    console.log('Audio Systems Status:', {
      drumEnabled,
      isDrumPlaying,
      currentBpm,
      currentPattern,
      melodyEnabled,
      isMelodyPlaying,
      currentPitch,
      ambientEnabled,
      isAmbientPlaying,
      natureEnabled,
      isNaturePlaying
    });
  }, [drumEnabled, isDrumPlaying, currentBpm, currentPattern, melodyEnabled, isMelodyPlaying, currentPitch, ambientEnabled, isAmbientPlaying, natureEnabled, isNaturePlaying]);

  // Optimized canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Optimized animation loop with better performance
    let animationId: number | null = null;
    let lastRenderTime = 0;
    
    const animate = (currentTime: number) => {
      // Throttle rendering to 60fps for smoother performance
      if (currentTime - lastRenderTime >= 16) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw optimized cloud trail with better blending
        if (showTrail && trail.length > 1) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          
          // Render every point for smoother trail
          for (let i = 0; i < trail.length; i++) {
            const point = trail[i];
            const age = Date.now() - point.timestamp;
            const maxAge = 800; // 800ms max age for longer trail
            const alpha = Math.max(0.1, (1 - age / maxAge) * 0.9);
            const size = Math.max(6, 20 * alpha); // Bigger trail points
            
            // Create radial gradient for cloud effect
            const gradient = ctx.createRadialGradient(
              point.x, point.y, 0,
              point.x, point.y, size * 1.5
            );
            gradient.addColorStop(0, `rgba(0, 255, 136, ${alpha * 0.9})`);
            gradient.addColorStop(0.4, `rgba(0, 255, 136, ${alpha * 0.6})`);
            gradient.addColorStop(0.8, `rgba(0, 255, 136, ${alpha * 0.2})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        }

        // Draw enhanced liquid background ripples
        if (showParticles && ripples.length > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          
          ripples.forEach(ripple => {
            const alpha = ripple.life * ripple.intensity;
            const gradient = ctx.createRadialGradient(
              ripple.x, ripple.y, 0,
              ripple.x, ripple.y, ripple.radius * 1.2
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.4})`);
            gradient.addColorStop(0.2, `rgba(255, 255, 255, ${alpha * 0.25})`);
            gradient.addColorStop(0.5, `rgba(0, 255, 136, ${alpha * 0.15})`);
            gradient.addColorStop(0.8, `rgba(0, 0, 0, ${alpha * 0.1})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.fill();
          });
          
          ctx.restore();
        }

        // Draw enhanced particles with better glow
        if (showParticles) {
          particles.forEach(particle => {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = particle.life * 0.9;
            
            // Draw outer glow
            const glowGradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size * 4
            );
            glowGradient.addColorStop(0, particle.color);
            glowGradient.addColorStop(0.3, particle.color.replace('0.9', '0.6'));
            glowGradient.addColorStop(0.7, particle.color.replace('0.9', '0.3'));
            glowGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw core particle
            ctx.fillStyle = particle.color.replace('0.9', '1');
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
          });
        }

        // Draw nature ambient background effects
        if (showParticles) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          
          // Create smooth background gradient based on mouse position
          const xNormalized = cursorPosition.x / window.innerWidth;
          const yNormalized = cursorPosition.y / window.innerHeight;
          
          // Calculate smooth color blending
          const seaColor = `rgba(0, 150, 255, ${natureVisuals.sea.intensity * 0.2})`;
          const rainColor = `rgba(100, 100, 255, ${natureVisuals.rain.intensity * 0.3})`;
          const riverColor = `rgba(0, 200, 150, ${natureVisuals.river.intensity * 0.2})`;
          const waterfallColor = `rgba(0, 255, 200, ${natureVisuals.waterfall.intensity * 0.25})`;
          
          // Create radial gradient from mouse position
          const gradient = ctx.createRadialGradient(
            cursorPosition.x, cursorPosition.y, 0,
            cursorPosition.x, cursorPosition.y, Math.max(window.innerWidth, window.innerHeight) * 0.8
          );
          
          // Blend colors based on nature intensities
          const centerColor = `rgba(${
            Math.floor((natureVisuals.sea.intensity * 0 + natureVisuals.rain.intensity * 100 + natureVisuals.river.intensity * 0 + natureVisuals.waterfall.intensity * 0) / 4)
          }, ${
            Math.floor((natureVisuals.sea.intensity * 150 + natureVisuals.rain.intensity * 100 + natureVisuals.river.intensity * 200 + natureVisuals.waterfall.intensity * 255) / 4)
          }, ${
            Math.floor((natureVisuals.sea.intensity * 255 + natureVisuals.rain.intensity * 255 + natureVisuals.river.intensity * 150 + natureVisuals.waterfall.intensity * 200) / 4)
          }, ${(natureVisuals.sea.intensity + natureVisuals.rain.intensity + natureVisuals.river.intensity + natureVisuals.waterfall.intensity) * 0.15})`;
          
          gradient.addColorStop(0, centerColor);
          gradient.addColorStop(0.5, `rgba(0, 0, 0, 0.05)`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
          
          // Rain effect - falling streaks across entire screen
          if (natureVisuals.rain.intensity > 0.1) {
            const rainAlpha = natureVisuals.rain.intensity * 0.4;
            ctx.strokeStyle = `rgba(100, 100, 255, ${rainAlpha})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 30; i++) {
              const x = Math.random() * window.innerWidth;
              const y = Math.random() * window.innerHeight;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + (Math.random() - 0.5) * 10, y + 30);
              ctx.stroke();
            }
          }
          
          // Sea waves - gentle horizontal waves
          if (natureVisuals.sea.intensity > 0.1) {
            const seaAlpha = natureVisuals.sea.intensity * 0.2;
            ctx.strokeStyle = `rgba(0, 150, 255, ${seaAlpha})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 2; i++) {
              const y = window.innerHeight * (0.3 + i * 0.4);
              ctx.beginPath();
              ctx.moveTo(0, y);
              for (let x = 0; x < window.innerWidth; x += 20) {
                const waveY = y + Math.sin(x * 0.01 + Date.now() * 0.001) * 8;
                ctx.lineTo(x, waveY);
              }
              ctx.stroke();
            }
          }
          
          // River flow - horizontal flowing lines
          if (natureVisuals.river.intensity > 0.1) {
            const riverAlpha = natureVisuals.river.intensity * 0.2;
            ctx.strokeStyle = `rgba(0, 200, 150, ${riverAlpha})`;
            ctx.lineWidth = 3;
            for (let i = 0; i < 2; i++) {
              const y = window.innerHeight * (0.4 + i * 0.2);
              ctx.beginPath();
              ctx.moveTo(0, y);
              for (let x = 0; x < window.innerWidth; x += 15) {
                const flowY = y + Math.sin(x * 0.02 + Date.now() * 0.002) * 5;
                ctx.lineTo(x, flowY);
              }
              ctx.stroke();
            }
          }
          
          // Waterfall mist - rising particles
          if (natureVisuals.waterfall.intensity > 0.1) {
            const waterfallAlpha = natureVisuals.waterfall.intensity * 0.3;
            ctx.fillStyle = `rgba(0, 255, 200, ${waterfallAlpha})`;
            for (let i = 0; i < 10; i++) {
              const x = window.innerWidth * 0.7 + Math.random() * window.innerWidth * 0.3;
              const y = window.innerHeight * 0.5 + Math.random() * window.innerHeight * 0.5;
              ctx.beginPath();
              ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          
          ctx.restore();
        }

        // Draw subtle nature background effects (rain, lightning, mist)
        if (showParticles && drawNatureBackground) {
          drawNatureBackground(ctx);
        }

        lastRenderTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [showTrail, showParticles, trail, particles, ripples, natureVisuals, cursorPosition]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};