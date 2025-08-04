import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

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
  rainVisible?: boolean;
}

// Simplified nature visuals
interface NatureVisuals {
  sea: { intensity: number; color: string };
  rain: { intensity: number; color: string };
  river: { intensity: number; color: string };
  waterfall: { intensity: number; color: string };
}

// Nature background effects
interface NatureBackground {
  rainDrops: Array<{ x: number; y: number; speed: number; life: number }>;
  lightning: { active: boolean; intensity: number; x: number; y: number };
  mist: Array<{ x: number; y: number; opacity: number; size: number }>;
  wind: number;
}

export const useVisualEffects = (options: VisualEffectOptions = {}) => {
  const { enabled = true, particleCount = 30, trailLength = 25, rainVisible = false } = options;
  
  // Detect Firefox for specific optimizations
  const isFirefox = useMemo(() => {
    return navigator.userAgent.includes('Firefox');
  }, []);
  
  // Reduce particle count for Firefox - LESS AGGRESSIVE
  const actualParticleCount = isFirefox ? Math.floor(particleCount * 0.7) : particleCount;
  const actualTrailLength = isFirefox ? Math.floor(trailLength * 0.8) : trailLength;
  
  // Detect mobile device for performance optimization
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }, []);
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; timestamp: number }>>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  
  // Use reduced counts for Firefox
  const maxParticles = actualParticleCount;
  const maxTrailLength = actualTrailLength;
  const [natureVisuals, setNatureVisuals] = useState<NatureVisuals>({
    sea: { intensity: 0, color: 'rgba(0, 150, 255, 0.3)' },
    rain: { intensity: 0, color: 'rgba(100, 100, 255, 0.4)' },
    river: { intensity: 0, color: 'rgba(0, 200, 150, 0.3)' },
    waterfall: { intensity: 0, color: 'rgba(0, 255, 200, 0.4)' }
  });
  
  // Nature background effects
  const [natureBackground, setNatureBackground] = useState<NatureBackground>({
    rainDrops: [],
    lightning: { active: false, intensity: 0, x: 0, y: 0 },
    mist: [],
    wind: 0
  });
  
  const animationFrameRef = useRef<number | null>(null);
  const particleIdRef = useRef(0);
  // const rippleIdRef = useRef(0);
  const lastParticleTimeRef = useRef<number>(performance.now());
  const lastUpdateTimeRef = useRef<number>(performance.now());
  
  // Performance monitoring
  const frameTimeRef = useRef<number>(16);
  const performanceLevelRef = useRef<'high' | 'medium' | 'low'>('high');
  const lastFrameTimeRef = useRef<number>(performance.now());

  const createParticle = useCallback((x: number, y: number, velocity: number) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + velocity * 0.2;
    
    const colors = [
      'rgba(0, 255, 136, 0.9)',
      'rgba(255, 0, 128, 0.9)',
      'rgba(0, 128, 255, 0.9)',
    ];
    
    return {
      id: particleIdRef.current++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: Math.random() * 0.8 + 0.6,
      size: Math.random() * 8 + 6,
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
          vx: particle.vx * 0.92,
          vy: particle.vy * 0.92,
          life: particle.life - 0.02
        }))
        .filter(particle => particle.life > 0)
    );
  }, []);



  const updateRipples = useCallback(() => {
    setRipples(prevRipples => 
      prevRipples
        .map(ripple => ({
          ...ripple,
          radius: ripple.radius + (ripple.maxRadius - ripple.radius) * 0.02,
          life: ripple.life - 0.005
        }))
        .filter(ripple => ripple.life > 0)
    );
  }, []);



  const addParticles = useCallback((x: number, y: number, velocity: number, count: number = 1) => {
    if (!enabled) return;

    const currentTime = performance.now();
    
    // Reduce particles on mobile for better performance
    const mobileMultiplier = isMobile ? 0.3 : 1;
    const adjustedCount = Math.floor(count * mobileMultiplier);
    
    if (currentTime - lastParticleTimeRef.current < 50) return; // Throttle particle generation
    
    const newParticles: Particle[] = [];
    const maxParticles = isMobile ? 10 : actualParticleCount;
    
    for (let i = 0; i < Math.min(adjustedCount, maxParticles - particles.length); i++) {
      newParticles.push(createParticle(x, y, velocity));
    }
    
    if (newParticles.length > 0) {
      setParticles(prev => [...prev, ...newParticles].slice(-maxParticles));
      lastParticleTimeRef.current = currentTime;
    }
  }, [enabled, createParticle, particles.length, actualParticleCount, isMobile]);

  const updateTrail = useCallback((x: number, y: number) => {
    if (!enabled) return;

    const currentTime = Date.now();
    setTrail(prev => {
      const filteredTrail = prev.filter(point => currentTime - point.timestamp < 800);
      const newTrail = [...filteredTrail, { x, y, timestamp: currentTime }];
      
      // Limit trail length based on performance
          const maxTrailLength = performanceLevelRef.current === 'high' ? actualTrailLength :
                          performanceLevelRef.current === 'medium' ? Math.floor(actualTrailLength * 0.8) :
                          Math.floor(actualTrailLength * 0.6);
      
      return newTrail.slice(-maxTrailLength);
    });
  }, [enabled, actualTrailLength]);

  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  // Add nature background effects
  const addNatureBackground = useCallback(() => {
    if (!enabled) return;

    // Only add effects for medium/high performance
    if (performanceLevelRef.current === 'low') return;

    // CONSTANT RAIN - Only add rain drops if rainVisible is true
    if (rainVisible) {
      const newDrops: Array<{ x: number; y: number; speed: number; life: number }> = [];
      const baseDropCount = performanceLevelRef.current === 'high' ? 1 : 1; // Reduced back to subtle
      
      for (let i = 0; i < baseDropCount; i++) {
        newDrops.push({
          x: Math.random() * window.innerWidth,
          y: -10,
          speed: 2 + Math.random() * 3,
          life: 1
        });
      }
      
      setNatureBackground(prev => ({
        ...prev,
        rainDrops: [...prev.rainDrops, ...newDrops].slice(-30) // Back to original limit
      }));
    }

    // Add extra rain drops based on audio intensity
    const audioIntensity = Math.random();
    if (audioIntensity > 0.3) {
      const extraDrops: Array<{ x: number; y: number; speed: number; life: number }> = [];
      const dropCount = performanceLevelRef.current === 'high' ? 
                       Math.floor(audioIntensity * 5) : 
                       Math.floor(audioIntensity * 3);
      
      for (let i = 0; i < dropCount; i++) {
        extraDrops.push({
          x: Math.random() * window.innerWidth,
          y: -10,
          speed: 2 + Math.random() * 3,
          life: 1
        });
      }
      
      setNatureBackground(prev => ({
        ...prev,
        rainDrops: [...prev.rainDrops, ...extraDrops].slice(-80) // Total limit to 80 drops
      }));
    }

    // Add lightning based on audio intensity (more frequent on mobile)
    const lightningThreshold = isMobile ? 0.6 : 0.8; // Lower threshold on mobile
    const lightningChance = isMobile ? 0.98 : 0.95; // Higher chance on mobile
    if (audioIntensity > lightningThreshold && Math.random() > lightningChance && performanceLevelRef.current === 'high') {
      setNatureBackground(prev => ({
        ...prev,
        lightning: {
          active: true,
          intensity: 0.8 + Math.random() * 0.2,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.3
        }
      }));
      
      // Deactivate lightning after a short time
      setTimeout(() => {
        setNatureBackground(prev => ({
          ...prev,
          lightning: { ...prev.lightning, active: false }
        }));
      }, 300 + Math.random() * 500); // Much longer lightning duration
    }

    // Add mist particles (only for high performance)
    if (audioIntensity > 0.5 && performanceLevelRef.current === 'high') {
      const newMist: Array<{ x: number; y: number; opacity: number; size: number }> = [];
      const mistCount = Math.floor(audioIntensity * 3);
      
      for (let i = 0; i < mistCount; i++) {
        newMist.push({
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 10,
          opacity: 0.1 + Math.random() * 0.2,
          size: 20 + Math.random() * 40
        });
      }
      
      setNatureBackground(prev => ({
        ...prev,
        mist: [...prev.mist, ...newMist].slice(-20) // Limit to 20 mist particles
      }));
    }

    // Update wind based on audio
    setNatureBackground(prev => ({
      ...prev,
      wind: Math.sin(Date.now() * 0.001) * 0.5 + Math.random() * 0.5
    }));
  }, [enabled, rainVisible]);

  // Update nature background animation
  useEffect(() => {
    if (!enabled) return;

    const animateNature = () => {
      setNatureBackground(prev => {
        // Update rain drops
        const updatedDrops = prev.rainDrops.map(drop => ({
          ...drop,
          y: drop.y + drop.speed + prev.wind,
          life: drop.life - 0.02
        })).filter(drop => drop.y < window.innerHeight + 10 && drop.life > 0);

        // Update mist particles
        const updatedMist = prev.mist.map(mist => ({
          ...mist,
          y: mist.y - (1 + prev.wind * 2),
          opacity: mist.opacity - 0.005
        })).filter(mist => mist.y > -50 && mist.opacity > 0);

        return {
          ...prev,
          rainDrops: updatedDrops,
          mist: updatedMist
        };
      });
    };

    const interval = setInterval(animateNature, 50);
    return () => clearInterval(interval);
  }, [enabled]);

  // Draw nature background
  const drawNatureBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!enabled) return;

    ctx.save();
    
    // Draw lightning flash (brighter on mobile for better visibility)
    if (natureBackground.lightning.active) {
      const isMobile = window.innerWidth <= 768;
      const intensity = isMobile ? 0.6 : 0.1; // Brighter on mobile
      const secondaryIntensity = isMobile ? 0.4 : 0.05; // Brighter on mobile
      
      const gradient = ctx.createRadialGradient(
        natureBackground.lightning.x, natureBackground.lightning.y, 0,
        natureBackground.lightning.x, natureBackground.lightning.y, window.innerWidth * 1.2
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${natureBackground.lightning.intensity * intensity})`);
      gradient.addColorStop(0.3, `rgba(200, 220, 255, ${natureBackground.lightning.intensity * secondaryIntensity})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    // Draw rain drops (much more subtle) - only if rainVisible is true
    // TEMPORARILY DISABLED TO FIX STARTUP STREAKS
    // if (rainVisible && natureBackground.rainDrops.length > 0) {
    //   ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)'; // Much more subtle
    //   ctx.lineWidth = 0.5; // Very thin
    //   natureBackground.rainDrops.forEach(drop => {
    //     ctx.beginPath();
    //     ctx.moveTo(drop.x, drop.y);
    //     ctx.lineTo(drop.x + natureBackground.wind * 2, drop.y + 8);
    //     ctx.stroke();
    //   });
    // }

    // Draw mist particles (only for high performance)
    if (natureBackground.mist.length > 0 && performanceLevelRef.current === 'high') {
      natureBackground.mist.forEach(mist => {
        ctx.fillStyle = `rgba(150, 150, 200, ${mist.opacity * 0.1})`;
        ctx.beginPath();
        ctx.arc(mist.x, mist.y, mist.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }, [enabled, natureBackground, rainVisible]);

  // Performance monitoring and adaptive scaling
  const updatePerformanceLevel = useCallback(() => {
    const currentTime = performance.now();
    const frameTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;
    
    // Calculate average frame time with faster response
    frameTimeRef.current = frameTimeRef.current * 0.8 + frameTime * 0.2; // Faster response to changes
    
    // Adjust performance level based on frame time - MORE RESPONSIVE
    if (frameTimeRef.current > 20) { // Below 50fps - more aggressive
      performanceLevelRef.current = 'low';
    } else if (frameTimeRef.current > 12) { // Below 83fps - more aggressive
      performanceLevelRef.current = 'medium';
    } else {
      performanceLevelRef.current = 'high';
    }
  }, []);

  // Optimized animation loop - IMPROVED FOR SMOOTHNESS AND FIREFOX
  useEffect(() => {
    if (!enabled) return;

    const animate = (currentTime: number) => {
      updatePerformanceLevel();
      
      // Adaptive update intervals based on performance and audio load
      let updateInterval: number;
      
      if (isFirefox) {
        // Firefox needs slower updates for better performance
        updateInterval = performanceLevelRef.current === 'high' ? 16 : 
                        performanceLevelRef.current === 'medium' ? 24 : 32;
      } else {
        // Other browsers can handle faster updates
        updateInterval = performanceLevelRef.current === 'high' ? 8 : 
                        performanceLevelRef.current === 'medium' ? 12 : 16;
      }
      
      if (currentTime - lastUpdateTimeRef.current >= updateInterval) {
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
    };
  }, [enabled, updateParticles, updateRipples, updatePerformanceLevel, isFirefox]);

  // Simplified nature visuals update
  const updateNatureVisuals = useCallback((x: number, y: number) => {
    if (!enabled) return;

    const xNormalized = x / window.innerWidth;
    const yNormalized = y / window.innerHeight;
    
    const rainIntensity = Math.pow(1 - xNormalized, 2) * Math.pow(1 - yNormalized, 1.5);
    const seaIntensity = Math.pow(1 - xNormalized, 1.5) * Math.pow(xNormalized, 0.5) * Math.pow(1 - yNormalized, 2);
    const riverIntensity = Math.pow(xNormalized, 1.5) * Math.pow(1 - xNormalized, 0.5) * Math.pow(1 - yNormalized, 1.5);
    const waterfallIntensity = Math.pow(xNormalized, 2) * Math.pow(yNormalized, 1.5);
    
    const baseIntensity = 0.1;
    
    setNatureVisuals({
      sea: { 
        intensity: Math.min(1, seaIntensity + baseIntensity), 
        color: `rgba(0, 150, 255, ${0.1 + seaIntensity * 0.4})`
      },
      rain: { 
        intensity: Math.min(1, rainIntensity + baseIntensity), 
        color: `rgba(100, 100, 255, ${0.2 + rainIntensity * 0.5})`
      },
      river: { 
        intensity: Math.min(1, riverIntensity + baseIntensity), 
        color: `rgba(0, 200, 150, ${0.1 + riverIntensity * 0.4})`
      },
      waterfall: { 
        intensity: Math.min(1, waterfallIntensity + baseIntensity), 
        color: `rgba(0, 255, 200, ${0.1 + waterfallIntensity * 0.5})`
      }
    });
  }, [enabled]);

  return {
    particles,
    trail,
    ripples,
    addParticles,
    updateTrail,
    clearTrail,
    clearParticles,
    enabled,
    natureVisuals,
    updateNatureVisuals,
    addNatureBackground,
    drawNatureBackground,
    performanceLevel: performanceLevelRef.current
  };
}; 