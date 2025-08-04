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
  splashes: Array<{ x: number; y: number; life: number; size: number; particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> }>;
  wind: number;
}

export const useVisualEffects = (options: VisualEffectOptions = {}) => {
  const { enabled = true, particleCount = 25, trailLength = 22, rainVisible = false } = options; // Slightly reduced for performance
  
  // Detect Firefox for specific optimizations
  const isFirefox = useMemo(() => {
    return navigator.userAgent.includes('Firefox');
  }, []);
  
  // Detect mobile device for performance optimization
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }, []);
  
  // Reduce counts for mobile devices
  const actualParticleCount = isMobile ? Math.floor(particleCount * 0.7) : 
                             isFirefox ? Math.floor(particleCount * 0.8) : particleCount;
  const actualTrailLength = isMobile ? Math.floor(trailLength * 0.8) : 
                           isFirefox ? Math.floor(trailLength * 0.9) : trailLength;
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; timestamp: number }>>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  
  // Use reduced counts for better performance
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
    splashes: [],
    wind: 0
  });
  
  const animationFrameRef = useRef<number | null>(null);
  const particleIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const lastParticleTimeRef = useRef<number>(performance.now());
  const lastUpdateTimeRef = useRef<number>(performance.now());
  
  // Performance monitoring
  const frameTimeRef = useRef<number>(16);
  const performanceLevelRef = useRef<'high' | 'medium' | 'low'>('high');
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Performance level detection
  const performanceLevel = useMemo(() => {
    if (isMobile) return 'low' as const;
    if (isFirefox) return 'medium' as const;
    return 'high' as const;
  }, [isMobile, isFirefox]);

  // Create particle with better colors
  const createParticle = useCallback((x: number, y: number, velocity: number) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + velocity * 0.2;
    
    const colors = [
      'rgba(0, 255, 136, 1.0)', // Bright green
      'rgba(255, 0, 128, 1.0)', // Bright pink
      'rgba(0, 128, 255, 1.0)', // Bright blue
      'rgba(255, 255, 0, 1.0)', // Bright yellow
      'rgba(255, 128, 0, 1.0)', // Bright orange
    ];
    
    return {
      id: particleIdRef.current++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: Math.random() * 1.5 + 1.0, // Much longer life for smooth trail
      size: Math.random() * 10 + 6, // Slightly smaller for performance
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }, []);

  // Update particles
  const updateParticles = useCallback(() => {
    setParticles(prevParticles => 
      prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.95, // Slower decay
          vy: particle.vy * 0.95, // Slower decay
          life: particle.life - 0.008 // Much slower decay for longer trail
        }))
        .filter(particle => particle.life > 0)
    );
  }, []);

  // Update ripples
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

  // Add particles with performance optimization
  const addParticles = useCallback((x: number, y: number, velocity: number, count: number = 1) => {
    if (!enabled) return;

    // No throttling for constant smooth effects
    const newParticles: Particle[] = [];
    const adjustedCount = Math.min(count, maxParticles - particles.length);
    
    for (let i = 0; i < adjustedCount; i++) {
      newParticles.push(createParticle(x, y, velocity));
    }
    
    if (newParticles.length > 0) {
      setParticles(prev => [...prev, ...newParticles].slice(-maxParticles));
    }
  }, [enabled, createParticle, particles.length, maxParticles]);

  // Update trail with performance optimization
  const updateTrail = useCallback((x: number, y: number) => {
    if (!enabled) return;

    const currentTime = Date.now();
    setTrail(prev => {
      // Always add new point without filtering
      const newTrail = [...prev, { x, y, timestamp: currentTime }];
      return newTrail.slice(-maxTrailLength);
    });
  }, [enabled, maxTrailLength]);

  // Update nature visuals
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

  // Add nature background effects including lightning
  const addNatureBackground = useCallback(() => {
    if (!enabled) return;

    // Only add effects for medium/high performance
    if (performanceLevelRef.current === 'low') return;

    // Add rain drops if rainVisible is true
    if (rainVisible) {
      const newDrops: Array<{ x: number; y: number; speed: number; life: number }> = [];
      const baseDropCount = performanceLevelRef.current === 'high' ? 3 : 2;
      
      for (let i = 0; i < baseDropCount; i++) {
        newDrops.push({
          x: Math.random() * window.innerWidth,
          y: -10,
          speed: 3 + Math.random() * 4,
          life: 1
        });
      }
      
      setNatureBackground(prev => ({
        ...prev,
        rainDrops: [...prev.rainDrops, ...newDrops].slice(-30)
      }));
    }

    // Add lightning based on audio intensity (subtle and rare)
    const lightningThreshold = isMobile ? 0.8 : 0.7;
    const lightningChance = isMobile ? 0.99 : 0.98;
    const audioIntensity = Math.random();
    
    if (audioIntensity > lightningThreshold && Math.random() > lightningChance) {
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
      }, 100 + Math.random() * 200);
    }

    // Update wind based on audio
    setNatureBackground(prev => ({
      ...prev,
      wind: Math.sin(Date.now() * 0.001) * 0.5 + Math.random() * 0.5
    }));
  }, [enabled, rainVisible, isMobile]);

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

        return {
          ...prev,
          rainDrops: updatedDrops
        };
      });
    };

    const interval = setInterval(animateNature, 50);
    return () => clearInterval(interval);
  }, [enabled]);

  // Draw nature background with lightning
  const drawNatureBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!enabled) return;

    ctx.save();
    
    // Draw lightning flash
    if (natureBackground.lightning.active) {
      const intensity = isMobile ? 0.2 : 0.1;
      const secondaryIntensity = isMobile ? 0.1 : 0.05;
      
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

    // Draw rain drops
    if (rainVisible && natureBackground.rainDrops.length > 0) {
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.lineWidth = 1;
      natureBackground.rainDrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + natureBackground.wind * 2, drop.y + 8);
        ctx.stroke();
      });
    }

    ctx.restore();
  }, [enabled, natureBackground, rainVisible, isMobile]);

  // Performance monitoring and adaptive scaling
  const updatePerformanceLevel = useCallback(() => {
    const currentTime = performance.now();
    const frameTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;
    
    frameTimeRef.current = frameTimeRef.current * 0.8 + frameTime * 0.2;
    
    if (frameTimeRef.current > 20) {
      performanceLevelRef.current = 'low';
    } else if (frameTimeRef.current > 12) {
      performanceLevelRef.current = 'medium';
    } else {
      performanceLevelRef.current = 'high';
    }
  }, []);

  // Animation loop with performance optimization
  useEffect(() => {
    if (!enabled) return;

    const animate = (currentTime: number) => {
      updatePerformanceLevel();
      
      // Run updates on every frame for constant animation
      updateParticles();
      updateRipples();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, updateParticles, updateRipples, updatePerformanceLevel]);

  return {
    particles,
    trail,
    ripples,
    natureVisuals,
    addParticles,
    updateTrail,
    updateNatureVisuals,
    addNatureBackground,
    drawNatureBackground,
    performanceLevel: performanceLevelRef.current
  };
}; 