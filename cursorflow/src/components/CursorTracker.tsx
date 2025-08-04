import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCursorTracking } from '../hooks/useCursorTracking';
import { useNatureAmbient } from '../hooks/useNatureAmbient';
import { useMelodyAmbient } from '../hooks/useMelodyAmbient';
import { useBeepAmbient } from '../hooks/useBeepAmbient';

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

// Simple Canvas Renderer Component
const CanvasRenderer = React.memo(({ 
  enabled, 
  showTrail, 
  showParticles, 
  cursorPosition, 
  isMoving 
}: {
  enabled: boolean;
  showTrail: boolean;
  showParticles: boolean;
  cursorPosition: { x: number; y: number; velocity: number };
  isMoving: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const lightningRef = useRef<{ active: boolean; intensity: number; x: number; y: number; life: number }>({
    active: false,
    intensity: 0,
    x: 0,
    y: 0,
    life: 0
  });

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use viewport dimensions for full-screen coverage
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Set canvas size to match viewport
    canvas.width = viewportWidth * devicePixelRatio;
    canvas.height = viewportHeight * devicePixelRatio;
    canvas.style.width = viewportWidth + 'px';
    canvas.style.height = viewportHeight + 'px';

    // Position canvas to cover entire viewport
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';
  }, []);

  // Add trail point
  const addTrailPoint = useCallback((x: number, y: number) => {
    if (!showTrail) return;
    
    // Instead of storing trail points, create trail particles
    const colors = [
      'rgba(0, 255, 136, 1.0)',
      'rgba(255, 0, 128, 1.0)', 
      'rgba(0, 128, 255, 1.0)',
      'rgba(255, 255, 0, 1.0)',
      'rgba(255, 128, 0, 1.0)',
      'rgba(128, 0, 255, 1.0)',
      'rgba(0, 255, 255, 1.0)',
      'rgba(255, 0, 255, 1.0)'
    ];

    // Add trail particles that follow the cursor
    for (let i = 0; i < 3; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Keep trail points for reference (but don't draw them as lines)
    trailRef.current.push({ x, y, timestamp: Date.now() });
    if (trailRef.current.length > 10) {
      trailRef.current = trailRef.current.slice(-10);
    }
  }, [showTrail]);

  // Add particle
  const addParticle = useCallback((x: number, y: number, velocity: number) => {
    if (!showParticles || !isMoving) return;

    const colors = [
      'rgba(0, 255, 136, 1.0)',
      'rgba(255, 0, 128, 1.0)', 
      'rgba(0, 128, 255, 1.0)',
      'rgba(255, 255, 0, 1.0)',
      'rgba(255, 128, 0, 1.0)',
      'rgba(128, 0, 255, 1.0)',
      'rgba(0, 255, 255, 1.0)',
      'rgba(255, 0, 255, 1.0)'
    ];

    // Add more particles per movement
    const particleCount = Math.min(5 + Math.floor(velocity * 3), 12);
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 8 + velocity * 0.8,
        vy: (Math.random() - 0.5) * 8 + velocity * 0.8,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Keep more particles for richer effect
    if (particlesRef.current.length > 120) {
      particlesRef.current = particlesRef.current.slice(-120);
    }
  }, [showParticles, isMoving]);

  // Add lightning effect
  const addLightning = useCallback(() => {
    // Random chance for lightning (independent of cursor)
    // Higher chance on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const lightningChance = isMobile ? 0.985 : 0.995; // 1.5% chance on mobile vs 0.5% on desktop
    
    if (Math.random() > lightningChance) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Use canvas dimensions directly for lightning coordinates
      lightningRef.current = {
        active: true,
        intensity: 0.8 + Math.random() * 0.2,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height, // Full screen coverage
        life: 1
      };
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add lightning
    addLightning();

    // Draw lightning
    if (lightningRef.current.active) {
      const lightning = lightningRef.current;
      lightning.life -= 0.05;
      
      if (lightning.life > 0) {
        const intensity = lightning.intensity * lightning.life;
        
        // Increase intensity for mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const mobileMultiplier = isMobile ? 3 : 1;
        
        const gradient = ctx.createRadialGradient(
          lightning.x, lightning.y, 0,
          lightning.x, lightning.y, Math.max(canvas.width, canvas.height) * 1.5
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.1 * mobileMultiplier})`);
        gradient.addColorStop(0.3, `rgba(200, 220, 255, ${intensity * 0.05 * mobileMultiplier})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        lightning.active = false;
      }
    }

    // Update and draw all particles (trail + movement particles)
    if (showParticles || showTrail) {
      particlesRef.current = particlesRef.current
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.92,
          vy: particle.vy * 0.92,
          life: particle.life - 0.02
        }))
        .filter(particle => particle.life > 0);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      particlesRef.current.forEach(particle => {
        const size = 6 + particle.life * 4;
        
        // Draw glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 2
        );
        gradient.addColorStop(0, particle.color.replace('1.0', (particle.life * 0.8).toString()));
        gradient.addColorStop(0.5, particle.color.replace('1.0', (particle.life * 0.4).toString()));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core
        ctx.fillStyle = particle.color.replace('1.0', particle.life.toString());
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [enabled, showTrail, showParticles, addLightning]);

  // Handle cursor updates
  useEffect(() => {
    if (enabled) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Scale coordinates for device pixel ratio
      const devicePixelRatio = window.devicePixelRatio || 1;
      const scaledX = cursorPosition.x * devicePixelRatio;
      const scaledY = cursorPosition.y * devicePixelRatio;
      
      addTrailPoint(scaledX, scaledY);
      addParticle(scaledX, scaledY, cursorPosition.velocity);
    }
  }, [enabled, cursorPosition.x, cursorPosition.y, cursorPosition.velocity, addTrailPoint, addParticle]);

  // Start animation
  useEffect(() => {
    if (enabled) {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, animate]);

  // Initialize iOS audio context on first touch
  useEffect(() => {
    let audioContextInitialized = false;
    
    const initializeAudioContext = async () => {
      if (audioContextInitialized) return;
      audioContextInitialized = true;
      
      try {
        // Create a silent audio context to unlock iOS audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 44100,
          latencyHint: 'interactive'
        });
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // Create a silent oscillator to unlock audio
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set volume to 0 (silent)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        
        // Start and immediately stop to unlock audio
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.001);
        
        console.log('iOS Audio Context initialized successfully');
        
        // Remove event listeners after initialization
        document.removeEventListener('touchstart', initializeAudioContext);
        document.removeEventListener('mousedown', initializeAudioContext);
        document.removeEventListener('click', initializeAudioContext);
        document.removeEventListener('touchend', initializeAudioContext);
        document.removeEventListener('keydown', initializeAudioContext);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        audioContextInitialized = false;
      }
    };

    // Add multiple event listeners for iOS audio unlock
    document.addEventListener('touchstart', initializeAudioContext, { once: true, passive: false });
    document.addEventListener('mousedown', initializeAudioContext, { once: true });
    document.addEventListener('click', initializeAudioContext, { once: true });
    document.addEventListener('touchend', initializeAudioContext, { once: true });
    document.addEventListener('keydown', initializeAudioContext, { once: true });
    
    // Also try to initialize on component mount with multiple attempts
    setTimeout(initializeAudioContext, 100);
    setTimeout(initializeAudioContext, 500);
    setTimeout(initializeAudioContext, 1000);
  }, []);

  // Handle resize
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    />
  );
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
  const { cursorPosition, isMoving } = useCursorTracking({ enabled });

  // Initialize audio systems with volume controls and force re-render
  const natureSystem = useNatureAmbient({ 
    enabled: natureEnabled && audioEnabled,
    baseVolume: natureVolume * 0.3
  });
  
  const melodySystem = useMelodyAmbient({ 
    enabled: melodyEnabled && audioEnabled,
    baseVolume: melodyVolume * 0.8
  });
  
  const beepSystem = useBeepAmbient({
    enabled: drumEnabled && audioEnabled,
    baseVolume: drumVolume * 0.2
  });

  // Force reinitialize audio systems when settings change
  const [audioKey, setAudioKey] = useState<number>(0);
  
  useEffect(() => {
    setAudioKey((prev: number) => prev + 1);
  }, [melodyEnabled, drumEnabled, natureEnabled, audioEnabled, melodyVolume, drumVolume, natureVolume]);

  const lastAudioUpdateRef = useRef(0);

  // Handle audio updates
  const handleAudioUpdate = useCallback(() => {
    if (!audioEnabled) return;

    const currentTime = performance.now();
    const timeSinceLastAudioUpdate = currentTime - (lastAudioUpdateRef.current || 0);
    const audioUpdateInterval = 16; // Faster interval for better touch reactivity
    
    if (timeSinceLastAudioUpdate >= audioUpdateInterval) {
      lastAudioUpdateRef.current = currentTime;
      
      // Nature system - only reacts to mouse movement when enabled
      if (natureEnabled && natureSystem?.updateNatureFromMouse) {
        natureSystem.updateNatureFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }
      
      // Melody system - plays constantly when enabled, mouse movement adds modulation
      if (melodyEnabled && melodySystem?.updateMelodyFromMouse) {
        melodySystem.updateMelodyFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }
      
      // Beep system - plays constantly when enabled, mouse movement adds modulation
      if (drumEnabled && beepSystem?.updateBeepFromMouse) {
        beepSystem.updateBeepFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }

      if (onMouseMove) {
        onMouseMove(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }
    }
  }, [
    audioEnabled,
    cursorPosition.x,
    cursorPosition.y,
    cursorPosition.velocity,
    natureEnabled,
    melodyEnabled,
    drumEnabled,
    natureSystem,
    melodySystem,
    beepSystem,
    onMouseMove
  ]);

  // Update audio on cursor movement AND constantly for melody/rhythm
  useEffect(() => {
    handleAudioUpdate();
    
    // Direct nature sound update for immediate touch reactivity
    if (audioEnabled && natureEnabled && natureSystem?.updateNatureFromMouse && cursorPosition.velocity > 0) {
      natureSystem.updateNatureFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
    }
  }, [cursorPosition.x, cursorPosition.y, cursorPosition.velocity, handleAudioUpdate, audioEnabled, natureEnabled, natureSystem]);

  // Additional effect to ensure melody and beep play constantly (nature only reacts to mouse)
  useEffect(() => {
    if (!audioEnabled) return;

    const interval = setInterval(() => {
      // Melody and beep play constantly when enabled
      if (melodyEnabled && melodySystem?.updateMelodyFromMouse) {
        melodySystem.updateMelodyFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }
      
      if (drumEnabled && beepSystem?.updateBeepFromMouse) {
        beepSystem.updateBeepFromMouse(cursorPosition.x, cursorPosition.y, cursorPosition.velocity);
      }
      
      // Nature only reacts to mouse movement, not constant updates
    }, 100); // Update every 100ms to ensure constant playback

    return () => clearInterval(interval);
  }, [audioEnabled, melodyEnabled, drumEnabled, melodySystem, beepSystem, cursorPosition.x, cursorPosition.y, cursorPosition.velocity]);

  // Start nature audio system when enabled
  useEffect(() => {
    if (natureEnabled && audioEnabled && natureSystem?.startNature) {
      // Small delay for iOS audio unlock
      const timer = setTimeout(() => {
        if (natureEnabled && natureSystem?.startNature) {
          natureSystem.startNature();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [natureEnabled, audioEnabled, natureSystem]);

  // Stop nature audio system when disabled
  useEffect(() => {
    if ((!natureEnabled || !audioEnabled) && natureSystem?.stopNature) {
      natureSystem.stopNature();
    }
  }, [natureEnabled, audioEnabled, natureSystem]);







  // Force stop melody when disabled - immediate effect
  useEffect(() => {
    if (!melodyEnabled && melodySystem) {
      // Clear any ongoing audio immediately
      if (melodySystem?.stopMelody) {
        melodySystem.stopMelody();
      }
    }
  }, [melodyEnabled, melodySystem]);

  // Stop audio systems immediately when disabled
  useEffect(() => {
    if (!melodyEnabled) {
      if (melodySystem?.stopMelody) {
        melodySystem.stopMelody();
      }
    }
  }, [melodyEnabled, melodySystem]);

  useEffect(() => {
    if (!drumEnabled) {
      if (beepSystem?.stopBeep) {
        beepSystem.stopBeep();
      }
    }
  }, [drumEnabled, beepSystem]);

  useEffect(() => {
    if (!natureEnabled) {
      if (natureSystem?.stopNature) {
        natureSystem.stopNature();
      }
    }
  }, [natureEnabled, natureSystem]);

  // Stop all audio when audio is disabled
  useEffect(() => {
    if (!audioEnabled) {
      if (melodySystem?.stopMelody) {
        melodySystem.stopMelody();
      }
      if (beepSystem?.stopBeep) {
        beepSystem.stopBeep();
      }
      if (natureSystem?.stopNature) {
        natureSystem.stopNature();
      }
    }
  }, [audioEnabled, melodySystem, beepSystem, natureSystem]);

  return (
    <CanvasRenderer
      enabled={enabled}
      showTrail={showTrail}
      showParticles={showParticles}
      cursorPosition={cursorPosition}
      isMoving={isMoving}
    />
  );
});