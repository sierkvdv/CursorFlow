import React, { useCallback, useEffect, useRef } from 'react';
import { useCursorTracking } from '../hooks/useCursorTracking';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { useNatureAmbient } from '../hooks/useNatureAmbient';
import { useMelodyAmbient } from '../hooks/useMelodyAmbient';
import { useRhythmAmbient } from '../hooks/useRhythmAmbient';

interface CursorTrackerProps {
  enabled?: boolean;
  showTrail?: boolean;
  showParticles?: boolean;
  audioEnabled?: boolean;
  natureEnabled?: boolean;
  melodyEnabled?: boolean;
  drumEnabled?: boolean;
  glitchEnabled?: boolean;
  natureVolume?: number;
  melodyVolume?: number;
  drumVolume?: number;
  glitchVolume?: number;
  rainVisible?: boolean;
  onMouseMove?: (x: number, y: number, velocity: number) => void;
}

// Optimized canvas renderer with adaptive performance
const CanvasRenderer = React.memo(({ 
  canvasRef, 
  showTrail, 
  showParticles, 
  trail, 
  particles, 
  ripples, 
  natureVisuals, 
  cursorPosition,
  performanceLevel,
  drawNatureBackground
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  showTrail: boolean;
  showParticles: boolean;
  trail: any[];
  particles: any[];
  ripples: any[];
  natureVisuals: any;
  cursorPosition: { x: number; y: number };
  performanceLevel: 'high' | 'medium' | 'low';
  drawNatureBackground?: (ctx: CanvasRenderingContext2D) => void;
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Force canvas to be visible on iOS
      canvas.style.display = 'block';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '30';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Adaptive animation loop based on performance
    let animationId: number | null = null;
    let lastRenderTime = 0;
    
    const animate = (currentTime: number) => {
      // Adaptive frame rate based on performance
      const targetFrameRate = performanceLevel === 'high' ? 16 : 
                             performanceLevel === 'medium' ? 20 : 33;
      
      if (currentTime - lastRenderTime >= targetFrameRate) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw nature background effects first (for all performance levels) - ALWAYS RENDER ON MOBILE
        if (showParticles && drawNatureBackground) {
          drawNatureBackground(ctx);
        }

        // Draw optimized trail with adaptive quality
        if (showTrail && trail.length > 1) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          
          // Skip points based on performance
          const skipPoints = performanceLevel === 'high' ? 1 : 
                           performanceLevel === 'medium' ? 2 : 3;
          
          for (let i = 0; i < trail.length; i += skipPoints) {
            const point = trail[i];
            const age = Date.now() - point.timestamp;
            const maxAge = 800;
            const alpha = Math.max(0.1, (1 - age / maxAge) * 0.9);
            const size = Math.max(6, 20 * alpha);
            
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

        // Draw optimized ripples with adaptive count
        if (showParticles && ripples.length > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          
          // Limit ripple rendering based on performance
          const maxRipplesToRender = performanceLevel === 'high' ? ripples.length : 
                                    performanceLevel === 'medium' ? Math.floor(ripples.length * 0.7) : 
                                    Math.floor(ripples.length * 0.5);
          
          ripples.slice(0, maxRipplesToRender).forEach(ripple => {
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

        // Draw optimized particles with adaptive rendering - IMPROVED FOR MOBILE
        if (showParticles) {
          // Limit particle rendering based on performance - MORE PARTICLES ON MOBILE
          const maxParticlesToRender = performanceLevel === 'high' ? particles.length : 
                                      performanceLevel === 'medium' ? Math.floor(particles.length * 0.9) : 
                                      Math.floor(particles.length * 0.8);
          
          particles.slice(0, maxParticlesToRender).forEach(particle => {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = particle.life * 0.9;
            
            // Simplified rendering for low performance
            if (performanceLevel === 'low') {
              ctx.fillStyle = particle.color;
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Full glow effect for medium/high performance
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
              
              ctx.fillStyle = particle.color.replace('0.9', '1');
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              ctx.fill();
            }
            
            ctx.restore();
          });
        }

        // Draw nature background gradient (only for high performance)
        if (showParticles && performanceLevel === 'high') {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          
          // const xNormalized = cursorPosition.x / window.innerWidth;
          // const yNormalized = cursorPosition.y / window.innerHeight;
          
          const gradient = ctx.createRadialGradient(
            cursorPosition.x, cursorPosition.y, 0,
            cursorPosition.x, cursorPosition.y, Math.max(window.innerWidth, window.innerHeight) * 0.8
          );
          
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
          
          ctx.restore();
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
  }, [showTrail, showParticles, trail, particles, ripples, natureVisuals, cursorPosition, performanceLevel, drawNatureBackground]);

  return null;
});

export const CursorTracker: React.FC<CursorTrackerProps> = React.memo(({
  enabled = true,
  showTrail = true,
  showParticles = true,
  audioEnabled = true,
  natureEnabled = true,
  melodyEnabled = true,
  drumEnabled = true,
  glitchEnabled = false,
  natureVolume = 0.5,
  melodyVolume = 0.5,
  drumVolume = 0.5,
  glitchVolume = 0.5,
  rainVisible = false,
  onMouseMove
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
    addNatureBackground,
    drawNatureBackground,
    performanceLevel
  } = useVisualEffects({
    enabled: showParticles || showTrail,
    rainVisible: rainVisible || false
  });

  // Initialize audio systems with volume controls
  const natureSystem = useNatureAmbient({ 
    enabled: natureEnabled && audioEnabled,
    baseVolume: natureVolume * 0.3 // Scale volume
  });
  
  const melodySystem = useMelodyAmbient({ 
    enabled: melodyEnabled && audioEnabled,
    baseVolume: melodyVolume * 0.04 // Scale volume
  });
  
  const rhythmSystem = useRhythmAmbient({ 
    enabled: drumEnabled && audioEnabled,
    baseVolume: drumVolume * 0.2 // Scale volume
  });

  // Optimized cursor update handler with adaptive throttling
  const handleCursorUpdate = useCallback(() => {
    if (!enabled) return;

    updateTrail(cursorPosition.x, cursorPosition.y);
    
    // Adaptive particle generation based on performance - RESTORED FOR CURSOR EFFECTS
    if (isMoving && showParticles) {
      const particleCount = performanceLevel === 'high' ? 2 : 1;
      addParticles(cursorPosition.x, cursorPosition.y, cursorPosition.velocity, particleCount);
    }

    // Update nature visuals (only for high performance) - DISABLED FOR SMOOTHNESS
    // if (showParticles && updateNatureVisuals && performanceLevel === 'high') {
    //   updateNatureVisuals(cursorPosition.x, cursorPosition.y);
    // }

    // Add nature background effects (rain, lightning, mist) - DISABLED FOR SMOOTHNESS
    // if (showParticles && addNatureBackground) {
    //   addNatureBackground();
    // }

    // Update audio systems
    if (audioEnabled) {
      if (natureEnabled && natureSystem?.updateNatureFromMouse) {
        natureSystem.updateNatureFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }
      
      if (melodyEnabled && melodySystem?.updateMelodyFromMouse) {
        melodySystem.updateMelodyFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }
      
      if (drumEnabled && rhythmSystem?.updateRhythmFromMouse) {
        rhythmSystem.updateRhythmFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }

      // GLITCH EFFECTS ON CURSOR MOVEMENT - FOR IPHONE
      if (glitchEnabled && cursorPosition.velocity > 0.05) {
        // Trigger glitch effects based on velocity
        const glitchChance = Math.min(0.3, cursorPosition.velocity * 0.5);
        if (Math.random() < glitchChance) {
          // Import and use glitch effects
          import('../utils/audioUtils').then(({ createGlitchClickSound }) => {
            // Create audio context for glitch effects
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (audioContext.state === 'suspended') {
              audioContext.resume();
            }
            // Apply volume scaling to glitch effects
            const originalVolume = (window as any).glitchVolume || 1;
            (window as any).glitchVolume = glitchVolume;
            createGlitchClickSound(audioContext);
            (window as any).glitchVolume = originalVolume;
          });
        }
      }

      if (onMouseMove) {
        onMouseMove(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
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
    natureEnabled,
    melodyEnabled,
    drumEnabled,
    glitchEnabled,
    updateTrail,
    addParticles,
    updateNatureVisuals,
    addNatureBackground,
    natureSystem,
    melodySystem,
    rhythmSystem,
    onMouseMove,
    performanceLevel
  ]);

  useEffect(() => {
    handleCursorUpdate();
  }, [handleCursorUpdate]);

  // Add touch event listener for iPhone cursor effects
  useEffect(() => {
    if (!enabled) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        // Force cursor update on touch move
        const customEvent = new CustomEvent('cursorUpdate', {
          detail: { 
            x: touch.clientX, 
            y: touch.clientY, 
            velocity: 0.5 
          }
        });
        document.dispatchEvent(customEvent);
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
        style={{ mixBlendMode: 'screen' }}
      />

      <CanvasRenderer
        canvasRef={canvasRef}
        showTrail={showTrail}
        showParticles={showParticles}
        trail={trail}
        particles={particles}
        ripples={ripples}
        natureVisuals={natureVisuals}
        cursorPosition={cursorPosition}
        performanceLevel={performanceLevel}
        drawNatureBackground={drawNatureBackground}
      />
    </>
  );
});