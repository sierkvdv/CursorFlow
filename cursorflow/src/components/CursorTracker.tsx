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
        // Add particles more frequently for smoother effect
        addParticles(cursorPosition.x, cursorPosition.y, cursorPosition.velocity, 3);
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
        
        // Render every 2nd point for smoother trail
        for (let i = 0; i < trail.length; i += 2) {
          const point = trail[i];
          const age = Date.now() - point.timestamp;
          const maxAge = 500; // 500ms max age
          const alpha = Math.max(0.05, (1 - age / maxAge) * 0.8);
          const size = Math.max(4, 16 * alpha);
          
          // Create radial gradient for cloud effect
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, size
          );
          gradient.addColorStop(0, `rgba(0, 255, 136, ${alpha * 0.8})`);
          gradient.addColorStop(0.6, `rgba(0, 255, 136, ${alpha * 0.4})`);
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