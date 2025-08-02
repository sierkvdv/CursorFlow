import { useState, useEffect, useCallback, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface VisualEffectOptions {
  enabled?: boolean;
  particleCount?: number;
  trailLength?: number;
}

export const useVisualEffects = (options: VisualEffectOptions = {}) => {
  const { enabled = true, particleCount = 30, trailLength = 25 } = options;
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; timestamp: number }>>([]);
  const animationFrameRef = useRef<number>();
  const particleIdRef = useRef(0);

  const createParticle = useCallback((x: number, y: number, velocity: number) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + velocity * 0.1;
    
    // Optimized colors for better performance
    const colors = [
      'rgba(0, 255, 136, 0.8)', // Primary green
      'rgba(255, 0, 128, 0.8)', // Secondary pink
      'rgba(0, 128, 255, 0.8)', // Accent blue
    ];
    
    return {
      id: particleIdRef.current++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: Math.random() * 0.8 + 0.4, // Shorter life for better performance
      size: Math.random() * 3 + 1.5, // Smaller particles
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }, []);

  const updateParticles = useCallback(() => {
    setParticles(prevParticles => 
      prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98, // Faster decay
          vy: particle.vy * 0.98, // Faster decay
          life: particle.life - 0.02 // Faster fade
        }))
        .filter(particle => particle.life > 0)
    );
  }, []);

  const addParticles = useCallback((x: number, y: number, velocity: number, count: number = 1) => {
    if (!enabled) return;

    // Add particles less frequently for better performance
    if (Math.random() > 0.4) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push(createParticle(x, y, velocity));
    }
    
    setParticles(prev => {
      const combined = [...prev, ...newParticles];
      return combined.slice(-particleCount); // Keep only the latest particles
    });
  }, [enabled, createParticle, particleCount]);

  const updateTrail = useCallback((x: number, y: number) => {
    if (!enabled) return;

    setTrail(prev => {
      const newTrail = [...prev, { x, y, timestamp: Date.now() }];
      return newTrail.slice(-trailLength);
    });
  }, [enabled, trailLength]);

  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      updateParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, updateParticles]);

  return {
    particles,
    trail,
    addParticles,
    updateTrail,
    clearTrail,
    clearParticles,
    enabled
  };
}; 