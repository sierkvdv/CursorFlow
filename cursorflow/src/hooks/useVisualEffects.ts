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

interface Ripple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  intensity: number;
}

interface VisualEffectOptions {
  enabled?: boolean;
  particleCount?: number;
  trailLength?: number;
}

// Nature ambient visual effects
interface NatureVisuals {
  sea: { intensity: number; color: string };
  rain: { intensity: number; color: string };
  river: { intensity: number; color: string };
  waterfall: { intensity: number; color: string };
}

export const useVisualEffects = (options: VisualEffectOptions = {}) => {
  const { enabled = true, particleCount = 50, trailLength = 30 } = options;
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; timestamp: number }>>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [natureVisuals, setNatureVisuals] = useState<NatureVisuals>({
    sea: { intensity: 0, color: 'rgba(0, 150, 255, 0.3)' },
    rain: { intensity: 0, color: 'rgba(100, 100, 255, 0.4)' },
    river: { intensity: 0, color: 'rgba(0, 200, 150, 0.3)' },
    waterfall: { intensity: 0, color: 'rgba(0, 255, 200, 0.4)' }
  });
  const animationFrameRef = useRef<number | null>(null);
  const particleIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const lastParticleTimeRef = useRef<number>(performance.now());
  const lastUpdateTimeRef = useRef<number>(performance.now());
  
  // Performance optimization: batch updates
  const pendingParticlesRef = useRef<Particle[]>([]);
  const pendingRipplesRef = useRef<Ripple[]>([]);
  const batchTimeoutRef = useRef<number | null>(null);

  const createParticle = useCallback((x: number, y: number, velocity: number) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + velocity * 0.2; // Increased speed
    
    // Optimized colors for better performance
    const colors = [
      'rgba(0, 255, 136, 0.9)', // Primary green - more vibrant
      'rgba(255, 0, 128, 0.9)', // Secondary pink - more vibrant
      'rgba(0, 128, 255, 0.9)', // Accent blue - more vibrant
    ];
    
    return {
      id: particleIdRef.current++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: Math.random() * 0.8 + 0.6, // Longer life for bigger particles
      size: Math.random() * 8 + 6, // Much bigger particles
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
          vx: particle.vx * 0.92, // Slower decay for smoother movement
          vy: particle.vy * 0.92, // Slower decay for smoother movement
          life: particle.life - 0.02 // Slower fade for longer visibility
        }))
        .filter(particle => particle.life > 0)
    );
  }, []);

  const createRipple = useCallback((x: number, y: number, intensity: number) => {
    return {
      id: rippleIdRef.current++,
      x,
      y,
      radius: 0,
      maxRadius: 300 + intensity * 200, // Much bigger ripples
      life: 1,
      maxLife: 4 + intensity * 2, // Longer life
      intensity: intensity * 1.2 // More intense
    };
  }, []);

  const updateRipples = useCallback(() => {
    setRipples(prevRipples => 
      prevRipples
        .map(ripple => ({
          ...ripple,
          radius: ripple.radius + (ripple.maxRadius - ripple.radius) * 0.02, // Slower expansion
          life: ripple.life - 0.005 // Slower fade
        }))
        .filter(ripple => ripple.life > 0)
    );
  }, []);

  const addRipple = useCallback((x: number, y: number, intensity: number) => {
    if (!enabled) return;
    
    const newRipple = createRipple(x, y, intensity);
    pendingRipplesRef.current.push(newRipple);
    
    // Batch ripple updates for better performance
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    batchTimeoutRef.current = window.setTimeout(() => {
      setRipples(prev => [...prev, ...pendingRipplesRef.current]);
      pendingRipplesRef.current = [];
      batchTimeoutRef.current = null;
    }, 16); // Batch every 16ms (60fps)
  }, [enabled, createRipple]);

  const addParticles = useCallback((x: number, y: number, velocity: number, count: number = 1) => {
    if (!enabled) return;

    const currentTime = performance.now();
    const timeSinceLastParticle = currentTime - lastParticleTimeRef.current;
    
    // Add particles more frequently for smoother effect - every 8ms (120fps equivalent)
    if (timeSinceLastParticle < 8) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push(createParticle(x, y, velocity));
    }
    
    // Batch particle updates for better performance
    pendingParticlesRef.current.push(...newParticles);
    
    // Limit total pending particles to prevent memory issues
    if (pendingParticlesRef.current.length > particleCount * 2) {
      pendingParticlesRef.current = pendingParticlesRef.current.slice(-particleCount);
    }
    
    setParticles(prev => {
      const combined = [...prev, ...pendingParticlesRef.current];
      pendingParticlesRef.current = [];
      return combined.slice(-particleCount); // Keep only the latest particles
    });

    // Add ripple effect for liquid background - more responsive
    if (velocity > 0.01) {
      addRipple(x, y, velocity);
    }

    lastParticleTimeRef.current = currentTime;
  }, [enabled, createParticle, particleCount, addRipple]);

  const updateTrail = useCallback((x: number, y: number) => {
    if (!enabled) return;

    const currentTime = Date.now();
    setTrail(prev => {
      // Remove old trail points that are older than 800ms (longer trail)
      const filteredTrail = prev.filter(point => currentTime - point.timestamp < 800);
      const newTrail = [...filteredTrail, { x, y, timestamp: currentTime }];
      return newTrail.slice(-trailLength);
    });
  }, [enabled, trailLength]);

  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
    pendingParticlesRef.current = [];
  }, []);

  // Optimized animation loop with better timing and batching
  useEffect(() => {
    if (!enabled) return;

    const animate = (currentTime: number) => {
      // Throttle updates to 60fps for better performance
      if (currentTime - lastUpdateTimeRef.current >= 16) {
        updateParticles();
        updateRipples();
        lastUpdateTimeRef.current = currentTime;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [enabled, updateParticles, updateRipples]);

  // Update nature visuals based on mouse position and nature sounds
  const updateNatureVisuals = useCallback((x: number, y: number) => {
    if (!enabled) return;

    const xNormalized = x / window.innerWidth;
    const yNormalized = y / window.innerHeight;
    
    // Smooth transitions from left to right with different nature effects
    // Left side: Rain/spatters (existing)
    // Center-left: Sea waves
    // Center-right: River flow  
    // Right side: Waterfall mist
    
    // Calculate smooth transitions using smoothstep-like functions
    const rainIntensity = Math.pow(1 - xNormalized, 2) * Math.pow(1 - yNormalized, 1.5); // Strong on left
    const seaIntensity = Math.pow(1 - xNormalized, 1.5) * Math.pow(xNormalized, 0.5) * Math.pow(1 - yNormalized, 2); // Center-left
    const riverIntensity = Math.pow(xNormalized, 1.5) * Math.pow(1 - xNormalized, 0.5) * Math.pow(1 - yNormalized, 1.5); // Center-right
    const waterfallIntensity = Math.pow(xNormalized, 2) * Math.pow(yNormalized, 1.5); // Strong on right
    
    // Add some base intensity for subtle background presence
    const baseIntensity = 0.1;
    
    setNatureVisuals({
      sea: { 
        intensity: Math.min(1, seaIntensity + baseIntensity), 
        color: `rgba(0, 150, 255, ${0.1 + seaIntensity * 0.4})` // Blue sea waves
      },
      rain: { 
        intensity: Math.min(1, rainIntensity + baseIntensity), 
        color: `rgba(100, 100, 255, ${0.2 + rainIntensity * 0.5})` // Blue rain drops
      },
      river: { 
        intensity: Math.min(1, riverIntensity + baseIntensity), 
        color: `rgba(0, 200, 150, ${0.1 + riverIntensity * 0.4})` // Green river flow
      },
      waterfall: { 
        intensity: Math.min(1, waterfallIntensity + baseIntensity), 
        color: `rgba(0, 255, 200, ${0.1 + waterfallIntensity * 0.5})` // Cyan waterfall mist
      }
    });
  }, [enabled]);

  // Add nature ambient particles based on current nature visuals
  const addNatureParticles = useCallback(() => {
    if (!enabled) return;

    const newParticles: Particle[] = [];
    
    // Rain particles - falling drops from top
    if (natureVisuals.rain.intensity > 0.1) {
      const rainCount = Math.floor(natureVisuals.rain.intensity * 8);
      for (let i = 0; i < rainCount; i++) {
        const x = Math.random() * window.innerWidth; // Full width
        const y = -10; // Start above screen
        newParticles.push({
          id: particleIdRef.current++,
          x,
          y,
          vx: (Math.random() - 0.5) * 1, // Slight horizontal variation
          vy: 2 + Math.random() * 2, // Downward fall
          life: 1,
          maxLife: 1.5 + Math.random() * 0.5,
          size: 1 + Math.random() * 2,
          color: natureVisuals.rain.color
        });
      }
    }
    
    // Sea particles - gentle waves floating up
    if (natureVisuals.sea.intensity > 0.1) {
      const seaCount = Math.floor(natureVisuals.sea.intensity * 3);
      for (let i = 0; i < seaCount; i++) {
        const x = Math.random() * window.innerWidth * 0.4; // Left side
        const y = window.innerHeight + 10; // Start below screen
        newParticles.push({
          id: particleIdRef.current++,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.5, // Gentle horizontal drift
          vy: -1 - Math.random() * 1, // Upward float
          life: 1,
          maxLife: 2 + Math.random() * 1,
          size: 3 + Math.random() * 4, // Bigger bubbles
          color: natureVisuals.sea.color
        });
      }
    }
    
    // River particles - flowing horizontally
    if (natureVisuals.river.intensity > 0.1) {
      const riverCount = Math.floor(natureVisuals.river.intensity * 4);
      for (let i = 0; i < riverCount; i++) {
        const x = -10; // Start left of screen
        const y = Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2; // Middle area
        newParticles.push({
          id: particleIdRef.current++,
          x,
          y,
          vx: 1 + Math.random() * 1, // Rightward flow
          vy: (Math.random() - 0.5) * 0.3, // Slight vertical variation
          life: 1,
          maxLife: 1.5 + Math.random() * 0.5,
          size: 2 + Math.random() * 3,
          color: natureVisuals.river.color
        });
      }
    }
    
    // Waterfall particles - mist rising up
    if (natureVisuals.waterfall.intensity > 0.1) {
      const waterfallCount = Math.floor(natureVisuals.waterfall.intensity * 5);
      for (let i = 0; i < waterfallCount; i++) {
        const x = window.innerWidth * 0.7 + Math.random() * window.innerWidth * 0.3; // Right side
        const y = window.innerHeight + 10; // Start below screen
        newParticles.push({
          id: particleIdRef.current++,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.8, // Wider horizontal spread
          vy: -1.5 - Math.random() * 1.5, // Faster upward rise
          life: 1,
          maxLife: 1.8 + Math.random() * 0.7,
          size: 2 + Math.random() * 3,
          color: natureVisuals.waterfall.color
        });
      }
    }
    
    // Add to pending particles
    pendingParticlesRef.current.push(...newParticles);
    
    // Limit pending particles to prevent memory issues
    if (pendingParticlesRef.current.length > particleCount * 2) {
      pendingParticlesRef.current = pendingParticlesRef.current.slice(-particleCount);
    }
  }, [enabled, natureVisuals, particleCount]);

  return {
    particles,
    trail,
    ripples,
    addParticles,
    updateTrail,
    clearTrail,
    clearParticles,
    enabled,
    natureVisuals, // Expose natureVisuals
    updateNatureVisuals, // Expose updateNatureVisuals
    addNatureParticles // Expose addNatureParticles
  };
}; 