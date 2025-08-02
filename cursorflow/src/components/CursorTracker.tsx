import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCursorTracking } from '../hooks/useCursorTracking';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { useAudioEffects } from '../hooks/useAudioEffects';

interface CursorTrackerProps {
  enabled?: boolean;
  showTrail?: boolean;
  showParticles?: boolean;
  audioEnabled?: boolean;
}

export const CursorTracker: React.FC<CursorTrackerProps> = ({
  enabled = true,
  showTrail = true,
  showParticles = true,
  audioEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cursorPosition, isMoving } = useCursorTracking({ enabled });
  const { particles, trail, addParticles, updateTrail } = useVisualEffects({ 
    enabled: showParticles || showTrail 
  });
  const { playCursorMove, playClick } = useAudioEffects({ enabled: audioEnabled });

  // Handle cursor movement
  useEffect(() => {
    if (!enabled) return;

    updateTrail(cursorPosition.x, cursorPosition.y);
    
    if (isMoving && showParticles) {
      // Add particles less frequently for better performance
      addParticles(cursorPosition.x, cursorPosition.y, cursorPosition.velocity, 2);
    }

    if (isMoving && audioEnabled) {
      playCursorMove(cursorPosition.velocity);
    }
  }, [cursorPosition, isMoving, enabled, showParticles, audioEnabled, updateTrail, addParticles, playCursorMove]);

  // Handle clicks
  const handleClick = useCallback(() => {
    if (!enabled || !audioEnabled) return;
    playClick();
  }, [enabled, audioEnabled, playClick]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  // Canvas rendering
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

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw optimized cloud trail
      if (showTrail && trail.length > 1) {
        ctx.save();
        
        // Only render every 3rd point for better performance
        for (let i = 0; i < trail.length; i += 3) {
          const point = trail[i];
          const alpha = Math.max(0.05, i / trail.length * 0.5);
          const size = Math.max(8, 25 * alpha);
          
          // Create radial gradient for cloud effect
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, size
          );
          gradient.addColorStop(0, `rgba(0, 255, 136, ${alpha * 0.6})`);
          gradient.addColorStop(0.7, `rgba(0, 255, 136, ${alpha * 0.2})`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }

      // Draw optimized particles
      if (showParticles) {
        particles.forEach(particle => {
          ctx.save();
          ctx.globalAlpha = particle.life * 0.8;
          
          // Draw particle with simple glow
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw core particle
          ctx.fillStyle = particle.color.replace('0.9', '1').replace('0.8', '1');
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        });
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [showTrail, showParticles, trail, particles]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}; 